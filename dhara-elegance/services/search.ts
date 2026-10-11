"use client";

import { createClient } from "@/lib/supabase/client";

export interface SearchResult {
  id: string;
  name: string;
  slug: string;
  gender: "men" | "women" | "unisex";
  price: number;
}

/**
 * Real instant search — ilike across name/description/sku, boosted
 * by the pg_trgm indexes created in migration 0003. No mock results.
 */
export async function searchProducts(query: string): Promise<SearchResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, gender, price")
    .or(`name.ilike.%${trimmed}%,description.ilike.%${trimmed}%,sku.ilike.%${trimmed}%`)
    .eq("is_active", true)
    .limit(8);

  if (error) {
    console.error("[search] query failed:", error);
    return [];
  }
  return data ?? [];
}
