import { createSupabaseServerClient } from "@/supabase/server";
import type { ApiResponse, Product } from "@/types";

/**
 * Service layer for product-related data access.
 * Keeping data access here (rather than in components) makes it
 * easy to swap the backend later and keeps Server Components lean.
 */
export async function getFeaturedProducts(): Promise<ApiResponse<Product[]>> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_featured", true)
      .limit(8);

    if (error) throw error;

    return { success: true, data: (data as Product[]) ?? [] };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to load products",
    };
  }
}

export async function getProductBySlug(
  slug: string
): Promise<ApiResponse<Product>> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) throw error;

    return { success: true, data: data as Product };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Product not found",
    };
  }
}
