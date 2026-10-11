import { createClient } from "@/lib/supabase/server";
import type { Gender } from "@/lib/constants";

export interface ProductListItem {
  id: string;
  slug: string;
  name: string;
  gender: Gender | "unisex";
  categoryName: string | null;
  price: number;
  compareAtPrice: number | null;
  rating: number;
  reviewCount: number;
  isNew: boolean;
  isBestseller: boolean;
  stock: number;
  primaryImageUrl: string | null;
}

const LIST_SELECT = `
  id, slug, name, gender, price, compare_at_price,
  rating, review_count, is_new, is_bestseller, stock,
  categories ( name ),
  product_images ( url, is_primary )
`;

interface RawRow {
  id: string;
  slug: string;
  name: string;
  gender: string;
  price: number;
  compare_at_price: number | null;
  rating: number;
  review_count: number;
  is_new: boolean;
  is_bestseller: boolean;
  stock: number;
  categories: { name: string } | null;
  product_images: { url: string; is_primary: boolean }[] | null;
}

function mapRow(row: RawRow): ProductListItem {
  const primary = row.product_images?.find((i) => i.is_primary) ?? row.product_images?.[0];
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    gender: row.gender as Gender | "unisex",
    categoryName: row.categories?.name ?? null,
    price: Number(row.price),
    compareAtPrice: row.compare_at_price != null ? Number(row.compare_at_price) : null,
    rating: Number(row.rating),
    reviewCount: row.review_count,
    isNew: row.is_new,
    isBestseller: row.is_bestseller,
    stock: row.stock,
    primaryImageUrl: primary?.url ?? null,
  };
}

/**
 * Every function below queries the REAL `products` table (RLS:
 * public may select active, non-archived rows). If the connected
 * Supabase project has no products yet, these correctly return an
 * empty array — callers render an empty state, never fabricated
 * placeholder products.
 */

export async function getBestSellers(limit = 8): Promise<ProductListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(LIST_SELECT)
    .eq("is_bestseller", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[products] getBestSellers failed:", error);
    return [];
  }
  return (data as unknown as RawRow[]).map(mapRow);
}

export async function getNewArrivals(limit = 8): Promise<ProductListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(LIST_SELECT)
    .eq("is_new", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[products] getNewArrivals failed:", error);
    return [];
  }
  return (data as unknown as RawRow[]).map(mapRow);
}

export async function getFeaturedProducts(limit = 6): Promise<ProductListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(LIST_SELECT)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[products] getFeaturedProducts failed:", error);
    return [];
  }
  return (data as unknown as RawRow[]).map(mapRow);
}

export interface ProductFilters {
  gender?: Gender;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  material?: string;
  metal?: string;
  color?: string;
  isNew?: boolean;
  isBestseller?: boolean;
  sort?: "featured" | "newest" | "price_asc" | "price_desc" | "rating" | "bestselling";
  page?: number;
  pageSize?: number;
}

export async function getProducts(
  filters: ProductFilters
): Promise<{ items: ProductListItem[]; total: number }> {
  const supabase = await createClient();
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 12;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("products")
    .select(LIST_SELECT, { count: "exact" });

  if (filters.gender) query = query.eq("gender", filters.gender);
  if (filters.categorySlug) {
    // Filtering on an embedded relation's column (categories.slug)
    // only works as an actual WHERE filter in PostgREST when the
    // embed uses the `!inner` join hint — plain `.eq("categories.slug", ...)`
    // against a left-joined embed does not reliably restrict rows.
    // Resolving the category id directly avoids depending on that.
    let categoryQuery = supabase
      .from("categories")
      .select("id")
      .eq("slug", filters.categorySlug);
    if (filters.gender) categoryQuery = categoryQuery.eq("gender", filters.gender);
    const { data: category } = await categoryQuery.maybeSingle();

    if (!category) {
      // No such category — an empty result set is correct, not an error.
      return { items: [], total: 0 };
    }
    query = query.eq("category_id", category.id);
  }
  if (filters.minPrice != null) query = query.gte("price", filters.minPrice);
  if (filters.maxPrice != null) query = query.lte("price", filters.maxPrice);
  if (filters.material) query = query.eq("material", filters.material);
  if (filters.metal) query = query.eq("metal", filters.metal);
  if (filters.color) query = query.eq("color", filters.color);
  if (filters.isNew) query = query.eq("is_new", true);
  if (filters.isBestseller) query = query.eq("is_bestseller", true);

  switch (filters.sort) {
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    case "rating":
      query = query.order("rating", { ascending: false });
      break;
    case "bestselling":
      query = query.order("is_bestseller", { ascending: false }).order("review_count", { ascending: false });
      break;
    default:
      query = query.order("is_featured", { ascending: false }).order("created_at", { ascending: false });
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error("[products] getProducts failed:", error);
    return { items: [], total: 0 };
  }

  return { items: (data as unknown as RawRow[]).map(mapRow), total: count ?? 0 };
}

export interface ProductDetail extends ProductListItem {
  description: string | null;
  shortDescription: string | null;
  material: string | null;
  metal: string | null;
  color: string | null;
  careInstructions: string | null;
  shippingInformation: string | null;
  returnInformation: string | null;
  sku: string | null;
  categorySlug: string | null;
  categoryId: string | null;
  images: { url: string; altText: string | null; isPrimary: boolean }[];
  variants: {
    id: string;
    name: string;
    value: string;
    stock: number;
    priceOverride: number | null;
  }[];
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(`
      id, slug, name, gender, description, short_description,
      price, compare_at_price, material, metal, color,
      care_instructions, shipping_information, return_information,
      rating, review_count, is_new, is_bestseller, stock, sku,
      categories ( id, name, slug ),
      product_images ( url, alt_text, is_primary, display_order ),
      product_variants ( id, name, value, stock, price_override, is_active, display_order )
    `)
    .eq("slug", slug)
    .eq("is_active", true)
    .is("archived_at", null)
    .maybeSingle();

  if (error) {
    console.error("[products] getProductBySlug failed:", error);
    return null;
  }
  if (!data) return null;

  const row = data as unknown as RawRow & {
    description: string | null;
    short_description: string | null;
    material: string | null;
    metal: string | null;
    color: string | null;
    care_instructions: string | null;
    shipping_information: string | null;
    return_information: string | null;
    sku: string | null;
    categories: { id: string; name: string; slug: string } | null;
    product_images: { url: string; alt_text: string | null; is_primary: boolean; display_order: number }[];
    product_variants: {
      id: string; name: string; value: string; stock: number;
      price_override: number | null; is_active: boolean; display_order: number;
    }[];
  };

  return {
    ...mapRow(row),
    description: row.description,
    shortDescription: row.short_description,
    material: row.material,
    metal: row.metal,
    color: row.color,
    careInstructions: row.care_instructions,
    shippingInformation: row.shipping_information,
    returnInformation: row.return_information,
    sku: row.sku,
    categorySlug: row.categories?.slug ?? null,
    categoryId: row.categories?.id ?? null,
    images: (row.product_images ?? [])
      .sort((a, b) => a.display_order - b.display_order)
      .map((i) => ({ url: i.url, altText: i.alt_text, isPrimary: i.is_primary })),
    variants: (row.product_variants ?? [])
      .filter((v) => v.is_active)
      .sort((a, b) => a.display_order - b.display_order)
      .map((v) => ({
        id: v.id,
        name: v.name,
        value: v.value,
        stock: v.stock,
        priceOverride: v.price_override != null ? Number(v.price_override) : null,
      })),
  };
}

export async function getRelatedProducts(
  productId: string,
  gender: string,
  categoryId: string | null,
  limit = 4
): Promise<ProductListItem[]> {
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select(LIST_SELECT)
    .eq("gender", gender)
    .neq("id", productId)
    .eq("is_active", true)
    .limit(limit);

  if (categoryId) query = query.eq("category_id", categoryId);

  const { data, error } = await query;
  if (error) {
    console.error("[products] getRelatedProducts failed:", error);
    return [];
  }
  return (data as unknown as RawRow[]).map(mapRow);
}
