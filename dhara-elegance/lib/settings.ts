import { createClient } from "@/lib/supabase/server";

export interface CheckoutSettings {
  freeShippingThreshold: number;
  flatShippingRate: number;
  codMinimumAmount: number;
  codEnabled: boolean;
}

const FALLBACK: CheckoutSettings = {
  freeShippingThreshold: 999,
  flatShippingRate: 49,
  codMinimumAmount: 500,
  codEnabled: true,
};

/**
 * Reads the single site_settings row (public SELECT per RLS). Falls
 * back to sane defaults if the row doesn't exist yet (fresh project,
 * migration not yet applied) — the fallback matches the defaults the
 * migration itself inserts, so this only differs in a genuinely
 * unconfigured environment.
 */
export async function getCheckoutSettings(): Promise<CheckoutSettings> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("free_shipping_threshold, flat_shipping_rate, cod_minimum_amount, cod_enabled")
    .eq("id", true)
    .maybeSingle();

  if (error || !data) return FALLBACK;

  return {
    freeShippingThreshold: Number(data.free_shipping_threshold),
    flatShippingRate: Number(data.flat_shipping_rate),
    codMinimumAmount: Number(data.cod_minimum_amount),
    codEnabled: data.cod_enabled,
  };
}
