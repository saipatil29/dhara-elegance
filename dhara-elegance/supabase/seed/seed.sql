-- ============================================================
-- Development seed data
--
-- Everything inserted here is tagged so it can be removed cleanly:
--   products  -> tags array contains 'seed'
--   categories-> slug prefixed normally but removed by name list
--
-- To remove all seed data, run supabase/seed/unseed.sql
--
-- This file does NOT create auth users. Create your admin account
-- through Supabase Auth first, then run supabase/seed/make_admin.sql.
-- ============================================================

-- ------------------------------------------------------------
-- Categories
-- ------------------------------------------------------------

insert into public.categories (name, slug, gender, description, display_order) values
  ('Rings',     'rings',     'men',   'Bold, architectural rings finished to last.',        1),
  ('Chains',    'chains',    'men',   'Substantial chains with a quiet, confident weight.', 2),
  ('Kadas',     'kadas',     'men',   'Traditional kadas, reworked for everyday wear.',     3),
  ('Earrings',  'earrings',  'men',   'Understated studs and hoops.',                       4),

  ('Chains',    'chains',    'women', 'Fluid chains that layer beautifully.',               1),
  ('Pendants',  'pendants',  'women', 'Delicate pendants made to be worn daily.',           2),
  ('Rings',     'rings',     'women', 'Elegant rings for every occasion.',                  3),
  ('Earrings',  'earrings',  'women', 'From quiet studs to statement drops.',               4),
  ('Kadas',     'kadas',     'women', 'Heritage kadas with a modern finish.',               5),
  ('Bracelets', 'bracelets', 'women', 'Refined bracelets with an effortless drape.',         6)
on conflict (gender, slug) do nothing;


-- ------------------------------------------------------------
-- Products
--
-- Prices are in INR. compare_at_price is set only where there is a
-- genuine discount, and is always strictly greater than price
-- (enforced by constraint).
-- ------------------------------------------------------------

with cat as (
  select id, slug, gender from public.categories
)
insert into public.products (
  name, slug, description, short_description, gender, category_id,
  price, compare_at_price, sku, stock, low_stock_threshold,
  material, metal, color, rating, review_count,
  is_featured, is_new, is_bestseller, tags,
  care_instructions, shipping_information, return_information
)
values
  -- ============ MEN — RINGS ============
  ('Meridian Signet Ring', 'meridian-signet-ring',
   'A clean-edged signet with a brushed face and polished bevel. Anti-tarnish, waterproof, and comfortable enough to forget you are wearing it.',
   'Brushed signet with polished bevel.',
   'men', (select id from cat where slug='rings' and gender='men'),
   2499, 3199, 'DE-M-RNG-001', 24, 3,
   'Stainless Steel', 'Gold PVD', 'Gold', 4.7, 62,
   true, false, true, array['seed','signet','everyday'],
   'Wipe with a soft dry cloth. Avoid harsh chemicals.',
   'Dispatched within 24 hours. Free shipping above ₹999.',
   'Exchange available within 7 days of delivery.'),

  ('Onyx Axis Ring', 'onyx-axis-ring',
   'A matte black onyx inlay set into a slim steel band. Quiet, sharp, and built for daily wear.',
   'Matte onyx inlay on a slim band.',
   'men', (select id from cat where slug='rings' and gender='men'),
   1899, null, 'DE-M-RNG-002', 18, 3,
   'Stainless Steel', 'Silver', 'Black', 4.5, 28,
   false, true, false, array['seed','onyx','minimal'],
   'Wipe with a soft dry cloth.',
   'Dispatched within 24 hours.',
   'Exchange available within 7 days of delivery.'),

  ('Forge Band', 'forge-band',
   'Hammered texture across a substantial band. Each piece carries a slightly different surface.',
   'Hammered texture, substantial weight.',
   'men', (select id from cat where slug='rings' and gender='men'),
   2199, 2799, 'DE-M-RNG-003', 2, 3,
   'Stainless Steel', 'Gold PVD', 'Gold', 4.8, 41,
   false, false, true, array['seed','textured'],
   'Wipe with a soft dry cloth.',
   'Dispatched within 24 hours.',
   'Exchange available within 7 days of delivery.'),

  -- ============ MEN — CHAINS ============
  ('Anchor Link Chain', 'anchor-link-chain',
   'A classic anchor link with a secure lobster clasp. Weighted to sit well without pulling.',
   'Classic anchor link, secure clasp.',
   'men', (select id from cat where slug='chains' and gender='men'),
   3499, 4299, 'DE-M-CHN-001', 15, 3,
   'Stainless Steel', 'Gold PVD', 'Gold', 4.9, 87,
   true, false, true, array['seed','chain','statement'],
   'Store flat. Avoid perfume contact.',
   'Dispatched within 24 hours. Free shipping above ₹999.',
   'Exchange available within 7 days of delivery.'),

  ('Cuban Weave Chain', 'cuban-weave-chain',
   'Tight Cuban links with a high-polish finish that holds its shine.',
   'Tight Cuban links, high polish.',
   'men', (select id from cat where slug='chains' and gender='men'),
   4299, null, 'DE-M-CHN-002', 9, 3,
   'Stainless Steel', 'Gold PVD', 'Gold', 4.6, 34,
   false, true, false, array['seed','cuban'],
   'Store flat. Avoid perfume contact.',
   'Dispatched within 24 hours.',
   'Exchange available within 7 days of delivery.'),

  ('Slate Rope Chain', 'slate-rope-chain',
   'A twisted rope profile in gunmetal. Understated against darker clothing.',
   'Twisted rope profile in gunmetal.',
   'men', (select id from cat where slug='chains' and gender='men'),
   2899, null, 'DE-M-CHN-003', 0, 3,
   'Stainless Steel', 'Gunmetal', 'Grey', 4.4, 19,
   false, false, false, array['seed','rope'],
   'Store flat.',
   'Dispatched within 24 hours.',
   'Exchange available within 7 days of delivery.'),

  -- ============ MEN — KADAS ============
  ('Veer Heritage Kada', 'veer-heritage-kada',
   'A traditional kada with a smooth rounded profile and subtle engraved edge detail.',
   'Rounded profile, engraved edging.',
   'men', (select id from cat where slug='kadas' and gender='men'),
   3199, 3999, 'DE-M-KDA-001', 12, 3,
   'Stainless Steel', 'Gold PVD', 'Gold', 4.8, 56,
   true, false, true, array['seed','kada','heritage'],
   'Wipe with a soft dry cloth.',
   'Dispatched within 24 hours. Free shipping above ₹999.',
   'Exchange available within 7 days of delivery.'),

  ('Straight Edge Kada', 'straight-edge-kada',
   'A flat-profile kada with squared terminals. Modern, architectural, and easy to stack.',
   'Flat profile with squared terminals.',
   'men', (select id from cat where slug='kadas' and gender='men'),
   2699, null, 'DE-M-KDA-002', 20, 3,
   'Stainless Steel', 'Silver', 'Silver', 4.5, 22,
   false, true, false, array['seed','kada','modern'],
   'Wipe with a soft dry cloth.',
   'Dispatched within 24 hours.',
   'Exchange available within 7 days of delivery.'),

  -- ============ MEN — EARRINGS ============
  ('Pike Stud', 'pike-stud',
   'A small tapered stud that reads as a detail rather than a statement. Sold as a single.',
   'Small tapered stud, sold singly.',
   'men', (select id from cat where slug='earrings' and gender='men'),
   899, 1199, 'DE-M-EAR-001', 40, 5,
   'Surgical Steel', 'Gold PVD', 'Gold', 4.3, 31,
   false, false, false, array['seed','stud'],
   'Clean gently with a dry cloth.',
   'Dispatched within 24 hours.',
   'Exchange available within 7 days of delivery.'),

  ('Loop Hoop', 'loop-hoop',
   'A slim, close-fitting hoop with a hinged closure. Comfortable for continuous wear.',
   'Slim hoop with hinged closure.',
   'men', (select id from cat where slug='earrings' and gender='men'),
   1099, null, 'DE-M-EAR-002', 33, 5,
   'Surgical Steel', 'Silver', 'Silver', 4.6, 27,
   false, true, false, array['seed','hoop'],
   'Clean gently with a dry cloth.',
   'Dispatched within 24 hours.',
   'Exchange available within 7 days of delivery.'),

  -- ============ WOMEN — CHAINS ============
  ('Aurelia Fine Chain', 'aurelia-fine-chain',
   'An exceptionally fine cable chain designed to layer without tangling. Sits close to the collarbone.',
   'Fine cable chain, layers cleanly.',
   'women', (select id from cat where slug='chains' and gender='women'),
   1799, 2299, 'DE-W-CHN-001', 30, 4,
   'Stainless Steel', 'Gold PVD', 'Gold', 4.9, 142,
   true, false, true, array['seed','layering','everyday'],
   'Store in the pouch provided. Avoid perfume contact.',
   'Dispatched within 24 hours. Free shipping above ₹999.',
   'Exchange available within 7 days of delivery.'),

  ('Satin Herringbone Chain', 'satin-herringbone-chain',
   'A flat herringbone that catches light like liquid metal. Best worn alone.',
   'Flat herringbone with a liquid finish.',
   'women', (select id from cat where slug='chains' and gender='women'),
   2599, null, 'DE-W-CHN-002', 14, 4,
   'Stainless Steel', 'Gold PVD', 'Gold', 4.7, 68,
   false, true, false, array['seed','herringbone'],
   'Store flat — do not fold.',
   'Dispatched within 24 hours.',
   'Exchange available within 7 days of delivery.'),

  -- ============ WOMEN — PENDANTS ============
  ('Lumen Drop Pendant', 'lumen-drop-pendant',
   'A single faceted drop suspended from a fine chain. Catches light with the smallest movement.',
   'Faceted drop on a fine chain.',
   'women', (select id from cat where slug='pendants' and gender='women'),
   2199, 2899, 'DE-W-PND-001', 21, 4,
   'Stainless Steel', 'Gold PVD', 'Gold', 4.8, 96,
   true, false, true, array['seed','pendant','gift'],
   'Wipe gently. Avoid contact with perfume.',
   'Dispatched within 24 hours. Free shipping above ₹999.',
   'Exchange available within 7 days of delivery.'),

  ('Initial Script Pendant', 'initial-script-pendant',
   'A cursive initial pendant cut from a single sheet. Personal without being loud.',
   'Cursive initial, single-sheet cut.',
   'women', (select id from cat where slug='pendants' and gender='women'),
   1699, null, 'DE-W-PND-002', 3, 4,
   'Stainless Steel', 'Gold PVD', 'Gold', 4.6, 54,
   false, true, false, array['seed','personalised'],
   'Wipe gently.',
   'Dispatched within 48 hours.',
   'Personalised items are exchange-only.'),

  ('Moonlit Pearl Pendant', 'moonlit-pearl-pendant',
   'A freshwater pearl on a whisper-fine chain. Quietly formal.',
   'Freshwater pearl, fine chain.',
   'women', (select id from cat where slug='pendants' and gender='women'),
   2999, 3599, 'DE-W-PND-003', 11, 4,
   'Stainless Steel', 'Silver', 'Pearl White', 4.9, 73,
   true, false, true, array['seed','pearl','occasion'],
   'Keep dry. Store separately.',
   'Dispatched within 24 hours. Free shipping above ₹999.',
   'Exchange available within 7 days of delivery.'),

  -- ============ WOMEN — RINGS ============
  ('Petal Stack Ring', 'petal-stack-ring',
   'A softly scalloped band designed to stack. Wear one, or wear four.',
   'Scalloped band, made to stack.',
   'women', (select id from cat where slug='rings' and gender='women'),
   1299, 1699, 'DE-W-RNG-001', 45, 5,
   'Stainless Steel', 'Gold PVD', 'Gold', 4.7, 118,
   false, false, true, array['seed','stacking'],
   'Wipe with a soft dry cloth.',
   'Dispatched within 24 hours.',
   'Exchange available within 7 days of delivery.'),

  ('Solace Solitaire Ring', 'solace-solitaire-ring',
   'A single brilliant-cut stone in a four-prong setting. The quiet centre of a stack.',
   'Brilliant-cut stone, four-prong set.',
   'women', (select id from cat where slug='rings' and gender='women'),
   3299, 4199, 'DE-W-RNG-002', 8, 4,
   'Stainless Steel', 'Silver', 'Clear', 4.8, 64,
   true, false, false, array['seed','solitaire','occasion'],
   'Avoid harsh chemicals. Clean with a soft brush.',
   'Dispatched within 24 hours. Free shipping above ₹999.',
   'Exchange available within 7 days of delivery.'),

  ('Twine Band', 'twine-band',
   'Two fine strands twisted into one continuous band. Reads as texture from a distance.',
   'Two strands twisted into one band.',
   'women', (select id from cat where slug='rings' and gender='women'),
   1499, null, 'DE-W-RNG-003', 26, 5,
   'Stainless Steel', 'Rose Gold PVD', 'Rose Gold', 4.5, 37,
   false, true, false, array['seed','texture'],
   'Wipe with a soft dry cloth.',
   'Dispatched within 24 hours.',
   'Exchange available within 7 days of delivery.'),

  -- ============ WOMEN — EARRINGS ============
  ('Halo Huggie Earrings', 'halo-huggie-earrings',
   'Close-fitting huggies set with a continuous line of stones. Comfortable enough to sleep in.',
   'Stone-set huggies, all-day comfort.',
   'women', (select id from cat where slug='earrings' and gender='women'),
   1599, 2099, 'DE-W-EAR-001', 38, 5,
   'Surgical Steel', 'Gold PVD', 'Gold', 4.8, 131,
   true, false, true, array['seed','huggie','everyday'],
   'Clean gently with a dry cloth.',
   'Dispatched within 24 hours. Free shipping above ₹999.',
   'Exchange available within 7 days of delivery.'),

  ('Cascade Drop Earrings', 'cascade-drop-earrings',
   'A graduated drop that moves with you. Weighted to hang straight.',
   'Graduated drop with natural movement.',
   'women', (select id from cat where slug='earrings' and gender='women'),
   2399, null, 'DE-W-EAR-002', 16, 5,
   'Stainless Steel', 'Gold PVD', 'Gold', 4.6, 48,
   false, true, false, array['seed','drop','occasion'],
   'Store hanging or flat.',
   'Dispatched within 24 hours.',
   'Exchange available within 7 days of delivery.'),

  ('Quartz Stud Earrings', 'quartz-stud-earrings',
   'A pair of clean round studs. The default earring for everything else.',
   'Clean round studs for everyday.',
   'women', (select id from cat where slug='earrings' and gender='women'),
   999, 1299, 'DE-W-EAR-003', 52, 6,
   'Surgical Steel', 'Silver', 'Clear', 4.7, 89,
   false, false, true, array['seed','stud','everyday'],
   'Clean gently with a dry cloth.',
   'Dispatched within 24 hours.',
   'Exchange available within 7 days of delivery.'),

  -- ============ WOMEN — KADAS ============
  ('Rani Filigree Kada', 'rani-filigree-kada',
   'Openwork filigree across a rounded kada. Traditional detailing, contemporary weight.',
   'Openwork filigree, rounded profile.',
   'women', (select id from cat where slug='kadas' and gender='women'),
   2899, 3699, 'DE-W-KDA-001', 10, 4,
   'Stainless Steel', 'Gold PVD', 'Gold', 4.9, 77,
   true, false, true, array['seed','kada','heritage'],
   'Wipe with a soft dry cloth.',
   'Dispatched within 24 hours. Free shipping above ₹999.',
   'Exchange available within 7 days of delivery.'),

  ('Sleek Round Kada', 'sleek-round-kada',
   'An unadorned round kada with a mirror finish. Nothing to distract from the form.',
   'Unadorned round kada, mirror finish.',
   'women', (select id from cat where slug='kadas' and gender='women'),
   2299, null, 'DE-W-KDA-002', 1, 4,
   'Stainless Steel', 'Silver', 'Silver', 4.4, 25,
   false, false, false, array['seed','minimal'],
   'Wipe with a soft dry cloth.',
   'Dispatched within 24 hours.',
   'Exchange available within 7 days of delivery.'),

  -- ============ WOMEN — BRACELETS ============
  ('Etoile Tennis Bracelet', 'etoile-tennis-bracelet',
   'A continuous line of set stones on a flexible chassis. The dress bracelet.',
   'Continuous stone line, flexible fit.',
   'women', (select id from cat where slug='bracelets' and gender='women'),
   3799, 4799, 'DE-W-BRC-001', 7, 4,
   'Stainless Steel', 'Silver', 'Clear', 4.9, 102,
   true, false, true, array['seed','tennis','occasion'],
   'Avoid harsh chemicals. Store in the pouch provided.',
   'Dispatched within 24 hours. Free shipping above ₹999.',
   'Exchange available within 7 days of delivery.'),

  ('Ripple Chain Bracelet', 'ripple-chain-bracelet',
   'A softly undulating chain that drapes rather than sits rigid.',
   'Undulating chain with a soft drape.',
   'women', (select id from cat where slug='bracelets' and gender='women'),
   1899, null, 'DE-W-BRC-002', 23, 5,
   'Stainless Steel', 'Gold PVD', 'Gold', 4.6, 58,
   false, true, false, array['seed','chain'],
   'Store flat.',
   'Dispatched within 24 hours.',
   'Exchange available within 7 days of delivery.'),

  ('Bound Cuff Bracelet', 'bound-cuff-bracelet',
   'An open cuff with a wrapped centre detail. Adjustable to most wrists.',
   'Open cuff with wrapped detail.',
   'women', (select id from cat where slug='bracelets' and gender='women'),
   2099, 2599, 'DE-W-BRC-003', 19, 5,
   'Stainless Steel', 'Rose Gold PVD', 'Rose Gold', 4.5, 44,
   false, false, false, array['seed','cuff'],
   'Do not over-flex the cuff.',
   'Dispatched within 24 hours.',
   'Exchange available within 7 days of delivery.')
on conflict (slug) do nothing;


-- ------------------------------------------------------------
-- Variants — ring and kada sizes
-- ------------------------------------------------------------

insert into public.product_variants (product_id, name, value, sku, stock, display_order)
select p.id, 'Size', v.value, p.sku || '-' || v.value, v.stock, v.ord
from public.products p
cross join (values
  ('12', 6, 1), ('14', 8, 2), ('16', 8, 3), ('18', 6, 4), ('20', 4, 5)
) as v(value, stock, ord)
where p.tags @> array['seed']
  and p.slug in (
    'meridian-signet-ring','onyx-axis-ring','forge-band',
    'petal-stack-ring','solace-solitaire-ring','twine-band'
  )
on conflict (product_id, name, value) do nothing;

insert into public.product_variants (product_id, name, value, sku, stock, display_order)
select p.id, 'Size', v.value, p.sku || '-' || v.value, v.stock, v.ord
from public.products p
cross join (values
  ('Small', 5, 1), ('Medium', 8, 2), ('Large', 5, 3)
) as v(value, stock, ord)
where p.tags @> array['seed']
  and p.slug in (
    'veer-heritage-kada','straight-edge-kada',
    'rani-filigree-kada','sleek-round-kada',
    'etoile-tennis-bracelet','bound-cuff-bracelet'
  )
on conflict (product_id, name, value) do nothing;


-- ------------------------------------------------------------
-- Coupons
-- ------------------------------------------------------------

insert into public.coupons (
  code, description, discount_type, discount_value,
  minimum_order_amount, maximum_discount_amount,
  usage_limit, per_user_limit, starts_at, expires_at, is_active
) values
  ('WELCOME10', '10% off your first order', 'percentage', 10,
   999, 500, 1000, 1, now() - interval '1 day', now() + interval '180 days', true),

  ('SHINE500', E'\u20B9500 off orders above \u20B92,999', 'fixed', 500,
   2999, null, 500, 2, now() - interval '1 day', now() + interval '90 days', true),

  ('FESTIVE15', '15% off, festive season', 'percentage', 15,
   1999, 1000, 200, 1, now() - interval '1 day', now() + interval '30 days', true),

  ('EXPIRED20', 'Expired test coupon — should be rejected', 'percentage', 20,
   0, null, null, null, now() - interval '60 days', now() - interval '30 days', true),

  ('DISABLED5', 'Inactive test coupon — should be rejected', 'fixed', 5,
   0, null, null, null, null, null, false)
on conflict (code) do nothing;


-- ------------------------------------------------------------
-- Site settings — align with brand
-- ------------------------------------------------------------

update public.site_settings set
  brand_name = 'Dhara Elegance',
  tagline = 'Shine Every Day.',
  support_email = 'care@dharaelegance.com',
  support_phone = '+91 91040 97343',
  instagram_url = 'https://www.instagram.com/dharaelegance.co/',
  free_shipping_threshold = 999,
  flat_shipping_rate = 49,
  cod_minimum_amount = 500,
  cod_enabled = true,
  return_window_days = 7,
  announcement_text = 'Free shipping on orders above ₹999 · Anti-tarnish & waterproof',
  announcement_enabled = true
where id = true;
