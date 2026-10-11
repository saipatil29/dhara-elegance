/**
 * Static brand constants. Anything a business user should be able to
 * change at runtime lives in the site_settings table instead.
 */

export const BRAND = {
  name: "Dhara Elegance",
  tagline: "Shine Every Day.",
  description:
    "At Dhara Elegance, we craft premium anti-tarnish, waterproof, and skin-friendly jewellery that blends timeless elegance with everyday comfort.",
  location: "Ahmedabad, Gujarat, India",
} as const;

export const COLORS = {
  navy: "#0F2345",
  gold: "#D4AF37",
  goldLight: "#E8C766",
  cream: "#FAF8F4",
  white: "#FFFFFF",
} as const;

export const GENDERS = ["men", "women"] as const;
export type Gender = (typeof GENDERS)[number];

export const CATEGORIES_BY_GENDER = {
  men: ["Rings", "Chains", "Kadas", "Earrings"],
  women: ["Chains", "Pendants", "Rings", "Earrings", "Kadas", "Bracelets"],
} as const;

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export const PAYMENT_STATUSES = [
  "pending",
  "authorized",
  "paid",
  "failed",
  "refunded",
  "partially_refunded",
] as const;

export const RETURN_STATUSES = [
  "requested",
  "approved",
  "rejected",
  "pickup_scheduled",
  "received",
  "exchange_processing",
  "completed",
] as const;

/**
 * COD is offered only when the payable total is STRICTLY greater
 * than this amount. At exactly ₹500, COD is unavailable.
 * Overridden at runtime by site_settings.cod_minimum_amount.
 */
export const COD_MINIMUM_AMOUNT_FALLBACK = 500;

export const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Rating" },
  { value: "bestselling", label: "Best Selling" },
] as const;
