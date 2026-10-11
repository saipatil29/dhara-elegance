-- ============================================================
-- 0010 — Order security functions
--
-- Everything about pricing, stock, coupon validity and COD
-- eligibility that must NEVER be trusted from the client lives
-- here, inside one SECURITY DEFINER function that runs as a single
-- Postgres transaction. Row-level locks (FOR UPDATE) on products
-- and product_variants are what actually prevent two concurrent
-- checkouts from overselling the same unit — application-level
-- checks alone cannot do this safely.
--
-- Design decision (documented, not hidden): stock is decremented
-- immediately at order-creation time for BOTH Razorpay and COD
-- orders, with an inventory_transactions row logging it. If a
-- Razorpay payment subsequently fails, release_order_stock() below
-- restores it. This keeps the model simple: "stock" always reflects
-- what is actually sellable right now, and every movement is
-- logged, rather than introducing a second "reserved during payment
-- window" state machine that nothing in this build's scope needs.
-- ============================================================


-- ------------------------------------------------------------
-- create_order
--
-- Call as the authenticated customer (regular anon-key client).
-- auth.uid() is read from the JWT, NOT accepted as a parameter,
-- so a customer can never create an order in someone else's name.
-- ------------------------------------------------------------

create or replace function public.create_order(
  p_customer_name   text,
  p_customer_email  text,
  p_customer_phone  text,
  p_address_line1   text,
  p_address_line2   text,
  p_city            text,
  p_state           text,
  p_pincode         text,
  p_country         text,
  p_items           jsonb,          -- [{product_id, variant_id, quantity}]
  p_coupon_code     text,           -- nullable
  p_payment_method  text,           -- 'razorpay' | 'cod'
  p_customer_notes  text
)
returns table (
  order_id      uuid,
  order_number  text,
  subtotal      numeric,
  discount_amount numeric,
  shipping_amount numeric,
  total         numeric,
  payment_method public.payment_method
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id           uuid := auth.uid();
  v_item              jsonb;
  v_product           public.products%rowtype;
  v_variant           public.product_variants%rowtype;
  v_unit_price        numeric(12,2);
  v_quantity          integer;
  v_available         integer;
  v_line_total        numeric(12,2);
  v_subtotal          numeric(12,2) := 0;
  v_computed_items    jsonb := '[]'::jsonb;

  v_coupon            public.coupons%rowtype;
  v_coupon_code_norm  text;
  v_discount_amount   numeric(12,2) := 0;
  v_coupon_id         uuid := null;
  v_user_coupon_uses  integer;

  v_settings          public.site_settings%rowtype;
  v_shipping_amount   numeric(12,2);
  v_total             numeric(12,2);

  v_order_id          uuid;
  v_order_number      text;
  v_payment_method    public.payment_method;
  v_computed_item     jsonb;
  v_new_stock         integer;
begin
  if v_user_id is null then
    raise exception 'Authentication required to place an order.'
      using errcode = '28000';
  end if;

  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Your cart is empty.' using errcode = '22023';
  end if;

  if p_payment_method not in ('razorpay', 'cod') then
    raise exception 'Invalid payment method.' using errcode = '22023';
  end if;
  v_payment_method := p_payment_method::public.payment_method;

  -- --------------------------------------------------------
  -- Pass 1: lock, validate, and price every line item.
  -- Row locks acquired here are held until the transaction ends,
  -- which is what makes this safe under concurrent checkouts.
  -- --------------------------------------------------------
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_quantity := (v_item ->> 'quantity')::integer;

    if v_quantity is null or v_quantity <= 0 or v_quantity > 99 then
      raise exception 'Invalid quantity for an item in your cart.'
        using errcode = '22023';
    end if;

    select * into v_product
    from public.products
    where id = (v_item ->> 'product_id')::uuid
    for update;

    if not found then
      raise exception 'One of the items in your cart no longer exists.'
        using errcode = 'P0002';
    end if;

    if not v_product.is_active or v_product.archived_at is not null then
      raise exception '% is no longer available.', v_product.name
        using errcode = '22023';
    end if;

    if (v_item ->> 'variant_id') is not null then
      select * into v_variant
      from public.product_variants
      where id = (v_item ->> 'variant_id')::uuid
      for update;

      if not found or v_variant.product_id <> v_product.id then
        raise exception 'The selected option for % is no longer available.',
          v_product.name
          using errcode = '22023';
      end if;

      if not v_variant.is_active then
        raise exception 'The selected option for % is no longer available.',
          v_product.name
          using errcode = '22023';
      end if;

      v_available := v_variant.stock - v_variant.reserved_stock;
      v_unit_price := coalesce(v_variant.price_override, v_product.price);
    else
      v_available := v_product.stock - v_product.reserved_stock;
      v_unit_price := v_product.price;
    end if;

    if v_quantity > v_available then
      if v_available <= 0 then
        raise exception '% is currently out of stock.', v_product.name
          using errcode = '22023';
      else
        raise exception 'Only % left of %.', v_available, v_product.name
          using errcode = '22023';
      end if;
    end if;

    v_line_total := round(v_unit_price * v_quantity, 2);
    v_subtotal := v_subtotal + v_line_total;

    v_computed_items := v_computed_items || jsonb_build_object(
      'product_id',    v_product.id,
      'variant_id',    case when (v_item ->> 'variant_id') is not null
                          then v_variant.id else null end,
      'product_name',  v_product.name,
      'product_slug',  v_product.slug,
      'variant_label',
        case when (v_item ->> 'variant_id') is not null
          then v_variant.name || ': ' || v_variant.value else null end,
      'sku', coalesce(
               case when (v_item ->> 'variant_id') is not null
                 then v_variant.sku else null end,
               v_product.sku
             ),
      'unit_price', v_unit_price,
      'quantity',   v_quantity,
      'line_total', v_line_total
    );
  end loop;

  -- --------------------------------------------------------
  -- Coupon validation (server-authoritative — client-sent discount
  -- amounts are never used, only the code).
  -- --------------------------------------------------------
  if p_coupon_code is not null and trim(p_coupon_code) <> '' then
    v_coupon_code_norm := upper(trim(p_coupon_code));

    select * into v_coupon
    from public.coupons
    where code = v_coupon_code_norm
    for update;

    if not found or not v_coupon.is_active then
      raise exception 'This coupon code is not valid.' using errcode = '22023';
    end if;

    if v_coupon.starts_at is not null and v_coupon.starts_at > now() then
      raise exception 'This coupon is not active yet.' using errcode = '22023';
    end if;

    if v_coupon.expires_at is not null and v_coupon.expires_at <= now() then
      raise exception 'This coupon has expired.' using errcode = '22023';
    end if;

    if v_subtotal < v_coupon.minimum_order_amount then
      raise exception 'This coupon requires a minimum order of ₹%.',
        v_coupon.minimum_order_amount
        using errcode = '22023';
    end if;

    if v_coupon.usage_limit is not null
       and v_coupon.used_count >= v_coupon.usage_limit then
      raise exception 'This coupon has reached its usage limit.'
        using errcode = '22023';
    end if;

    if v_coupon.per_user_limit is not null then
      select count(*) into v_user_coupon_uses
      from public.coupon_usages
      where coupon_id = v_coupon.id and user_id = v_user_id;

      if v_user_coupon_uses >= v_coupon.per_user_limit then
        raise exception 'You have already used this coupon.'
          using errcode = '22023';
      end if;
    end if;

    if v_coupon.discount_type = 'percentage' then
      v_discount_amount := round(v_subtotal * v_coupon.discount_value / 100, 2);
    else
      v_discount_amount := v_coupon.discount_value;
    end if;

    if v_coupon.maximum_discount_amount is not null then
      v_discount_amount := least(v_discount_amount, v_coupon.maximum_discount_amount);
    end if;
    -- A discount can never exceed the order subtotal.
    v_discount_amount := least(v_discount_amount, v_subtotal);

    v_coupon_id := v_coupon.id;
  end if;

  -- --------------------------------------------------------
  -- Shipping, from site_settings — never client-supplied.
  -- --------------------------------------------------------
  select * into v_settings from public.site_settings where id = true;

  v_shipping_amount :=
    case
      when (v_subtotal - v_discount_amount) >= v_settings.free_shipping_threshold
        then 0
      else v_settings.flat_shipping_rate
    end;

  v_total := v_subtotal - v_discount_amount + v_shipping_amount;

  -- --------------------------------------------------------
  -- COD eligibility — STRICTLY greater than the threshold.
  -- ₹500.00 exactly is NOT eligible; ₹500.01 is.
  -- --------------------------------------------------------
  if v_payment_method = 'cod' then
    if not v_settings.cod_enabled then
      raise exception 'Cash on Delivery is currently unavailable.'
        using errcode = '22023';
    end if;
    if v_total <= v_settings.cod_minimum_amount then
      raise exception 'Cash on Delivery is available on orders above ₹%.',
        v_settings.cod_minimum_amount
        using errcode = '22023';
    end if;
  end if;

  -- --------------------------------------------------------
  -- Create the order.
  -- --------------------------------------------------------
  insert into public.orders (
    user_id, customer_name, customer_email, customer_phone,
    address_line1, address_line2, city, state, pincode, country,
    subtotal, discount_amount, shipping_amount, total,
    coupon_id, coupon_code,
    payment_method, payment_status, status, customer_notes
  ) values (
    v_user_id, p_customer_name, p_customer_email, p_customer_phone,
    p_address_line1, p_address_line2, p_city, p_state, p_pincode,
    coalesce(p_country, 'India'),
    v_subtotal, v_discount_amount, v_shipping_amount, v_total,
    v_coupon_id, case when v_coupon_id is not null then v_coupon_code_norm end,
    v_payment_method, 'pending', 'pending', p_customer_notes
  )
  returning id, orders.order_number into v_order_id, v_order_number;

  insert into public.order_status_history (order_id, from_status, to_status, changed_by, note)
  values (v_order_id, null, 'pending', v_user_id, 'Order placed by customer');

  -- --------------------------------------------------------
  -- Materialize order_items and commit the stock movement.
  -- --------------------------------------------------------
  for v_computed_item in select * from jsonb_array_elements(v_computed_items)
  loop
    insert into public.order_items (
      order_id, product_id, variant_id,
      product_name, product_slug, variant_label, sku,
      unit_price, quantity, line_total
    ) values (
      v_order_id,
      (v_computed_item ->> 'product_id')::uuid,
      (v_computed_item ->> 'variant_id')::uuid,
      v_computed_item ->> 'product_name',
      v_computed_item ->> 'product_slug',
      v_computed_item ->> 'variant_label',
      v_computed_item ->> 'sku',
      (v_computed_item ->> 'unit_price')::numeric,
      (v_computed_item ->> 'quantity')::integer,
      (v_computed_item ->> 'line_total')::numeric
    );

    if (v_computed_item ->> 'variant_id') is not null then
      update public.product_variants
      set stock = stock - (v_computed_item ->> 'quantity')::integer
      where id = (v_computed_item ->> 'variant_id')::uuid
      returning stock into v_new_stock;
    else
      update public.products
      set stock = stock - (v_computed_item ->> 'quantity')::integer
      where id = (v_computed_item ->> 'product_id')::uuid
      returning stock into v_new_stock;
    end if;

    insert into public.inventory_transactions (
      product_id, variant_id, order_id, reason, quantity_delta, stock_after, created_by
    ) values (
      (v_computed_item ->> 'product_id')::uuid,
      (v_computed_item ->> 'variant_id')::uuid,
      v_order_id,
      'order_reserved',
      -1 * (v_computed_item ->> 'quantity')::integer,
      v_new_stock,
      v_user_id
    );
  end loop;

  -- --------------------------------------------------------
  -- Coupon usage — race-safe because v_coupon row is still locked
  -- (FOR UPDATE above) for the rest of this transaction.
  -- --------------------------------------------------------
  if v_coupon_id is not null then
    update public.coupons set used_count = used_count + 1 where id = v_coupon_id;

    insert into public.coupon_usages (coupon_id, order_id, user_id, discount_amount)
    values (v_coupon_id, v_order_id, v_user_id, v_discount_amount);
  end if;

  -- --------------------------------------------------------
  -- Payment record. Never marked 'paid' here — Razorpay orders
  -- become paid only via verified callback + webhook; COD orders
  -- stay 'pending' until cash is collected (see business rule:
  -- never falsely mark an order as paid).
  -- --------------------------------------------------------
  insert into public.payments (order_id, method, status, amount, currency)
  values (v_order_id, v_payment_method, 'pending', v_total, 'INR');

  return query select
    v_order_id, v_order_number, v_subtotal, v_discount_amount,
    v_shipping_amount, v_total, v_payment_method;
end;
$$;

revoke execute on function public.create_order(
  text, text, text, text, text, text, text, text, text,
  jsonb, text, text, text
) from public;

grant execute on function public.create_order(
  text, text, text, text, text, text, text, text, text,
  jsonb, text, text, text
) to authenticated;


-- ------------------------------------------------------------
-- release_order_stock
--
-- Restores stock for every item on an order and logs the reversal.
-- Used when a Razorpay payment fails/is cancelled, or an admin
-- cancels an order. Service-role only — never called by a customer
-- session directly.
-- ------------------------------------------------------------

create or replace function public.release_order_stock(p_order_id uuid, p_reason text default null)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_item      public.order_items%rowtype;
  v_new_stock integer;
begin
  for v_item in select * from public.order_items where order_id = p_order_id
  loop
    if v_item.variant_id is not null then
      update public.product_variants
      set stock = stock + v_item.quantity
      where id = v_item.variant_id
      returning stock into v_new_stock;
    elsif v_item.product_id is not null then
      update public.products
      set stock = stock + v_item.quantity
      where id = v_item.product_id
      returning stock into v_new_stock;
    else
      -- product was hard-deleted since; nothing to restock.
      continue;
    end if;

    insert into public.inventory_transactions (
      product_id, variant_id, order_id, reason, quantity_delta, stock_after, note
    ) values (
      v_item.product_id, v_item.variant_id, p_order_id,
      'order_released', v_item.quantity, v_new_stock, p_reason
    );
  end loop;
end;
$$;

revoke execute on function public.release_order_stock(uuid, text) from public;
grant execute on function public.release_order_stock(uuid, text) to service_role;


-- ------------------------------------------------------------
-- mark_payment_paid / mark_payment_failed
--
-- Called only from the Razorpay verify route and webhook handler,
-- both of which run with the service-role client (no customer JWT
-- exists in a webhook request). Idempotent: re-marking an
-- already-paid payment as paid is a no-op, not an error, so replayed
-- webhooks are safe.
-- ------------------------------------------------------------

create or replace function public.mark_payment_paid(
  p_order_id             uuid,
  p_razorpay_order_id    text,
  p_razorpay_payment_id  text,
  p_razorpay_signature   text
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_rows_updated integer := 0;
begin
  update public.payments
  set status = 'paid',
      razorpay_order_id = p_razorpay_order_id,
      razorpay_payment_id = p_razorpay_payment_id,
      razorpay_signature = p_razorpay_signature,
      paid_at = now()
  where order_id = p_order_id
    and status <> 'paid';

  update public.orders
  set payment_status = 'paid',
      status = case when status = 'pending' then 'confirmed' else status end,
      confirmed_at = coalesce(confirmed_at, now())
  where id = p_order_id
    and payment_status <> 'paid';

  get diagnostics v_rows_updated = row_count;

  -- Only log a history row the first time this fires. A replayed
  -- webhook after the order is already 'paid' updates zero rows
  -- above, so row_count is 0 and we skip — that is the idempotency
  -- guarantee, not a unique constraint.
  if v_rows_updated > 0 then
    insert into public.order_status_history (order_id, from_status, to_status, note)
    select id, 'pending', status, 'Payment confirmed via Razorpay'
    from public.orders
    where id = p_order_id;
  end if;
end;
$$;

revoke execute on function public.mark_payment_paid(uuid, text, text, text) from public;
grant execute on function public.mark_payment_paid(uuid, text, text, text) to service_role;


create or replace function public.mark_payment_failed(
  p_order_id  uuid,
  p_error_code text,
  p_error_description text
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.payments
  set status = 'failed',
      error_code = p_error_code,
      error_description = p_error_description,
      failed_at = now()
  where order_id = p_order_id
    and status = 'pending';

  update public.orders
  set payment_status = 'failed'
  where id = p_order_id
    and payment_status = 'pending';

  perform public.release_order_stock(p_order_id, 'Payment failed: ' || coalesce(p_error_description, p_error_code, 'unknown'));
end;
$$;

revoke execute on function public.mark_payment_failed(uuid, text, text) from public;
grant execute on function public.mark_payment_failed(uuid, text, text) to service_role;
