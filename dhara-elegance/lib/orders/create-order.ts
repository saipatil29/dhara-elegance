"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { checkoutSchema } from "@/lib/validations/checkout";
import type { ActionResult } from "@/types";

export interface CreateOrderResult {
  orderId: string;
  orderNumber: string;
  total: number;
  paymentMethod: "razorpay" | "cod";
  /** True when the client must now open Razorpay Checkout. */
  requiresPayment: boolean;
}

/**
 * The ONLY path by which an order is created. Everything about
 * price, stock, coupon validity and COD eligibility is recomputed
 * server-side inside the create_order() Postgres function — this
 * action only authenticates the caller, validates the request
 * SHAPE with Zod, and forwards it.
 *
 * Note: /checkout is already gated by middleware.ts (unauthenticated
 * visitors never reach this page), so this only needs to handle the
 * edge case of a session expiring between page load and submit — it
 * returns a normal ActionResult error for the client to react to,
 * rather than calling next/navigation's redirect() here. redirect()
 * throws a control-flow signal that Next's own action wrapper must
 * catch; wrapping it in a try/catch here would swallow that signal
 * and silently break the redirect.
 */
export async function createOrder(
  input: unknown
): Promise<ActionResult<CreateOrderResult>> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      success: false,
      error: "Your session has expired. Please sign in again to continue.",
    };
  }

  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  const values = parsed.data;
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("create_order", {
    p_customer_name: values.customerName,
    p_customer_email: values.customerEmail,
    p_customer_phone: values.customerPhone,
    p_address_line1: values.addressLine1,
    p_address_line2: values.addressLine2 ?? null,
    p_city: values.city,
    p_state: values.state,
    p_pincode: values.pincode,
    p_country: values.country,
    p_items: values.items.map((i) => ({
      product_id: i.productId,
      variant_id: i.variantId ?? null,
      quantity: i.quantity,
    })),
    p_coupon_code: values.couponCode || null,
    p_payment_method: values.paymentMethod,
    p_customer_notes: values.customerNotes ?? null,
  });

  if (error) {
    // Postgres RAISE EXCEPTION messages from create_order() are
    // written to be customer-readable (e.g. "Only 2 left of X.",
    // "Cash on Delivery is available on orders above ₹500.").
    // Anything else is a genuine server error — log it, don't leak it.
    const isBusinessRuleMessage = error.code === "22023" || error.code === "28000";
    if (!isBusinessRuleMessage) {
      console.error("[create_order] unexpected error:", error);
    }
    return {
      success: false,
      error: isBusinessRuleMessage
        ? error.message
        : "We couldn't place your order. Please try again.",
    };
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) {
    return { success: false, error: "We couldn't place your order. Please try again." };
  }

  return {
    success: true,
    data: {
      orderId: row.order_id,
      orderNumber: row.order_number,
      total: Number(row.total),
      paymentMethod: row.payment_method,
      requiresPayment: row.payment_method === "razorpay",
    },
  };
}
