import { createClient } from "@/lib/supabase/server";

export interface FeaturedReview {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  productName: string;
  createdAt: string;
}

/**
 * Real reviews only — approved AND featured. Returns an empty array
 * (rendered as an honest empty state by the caller) until real
 * customers have actually left approved reviews; nothing here is
 * fabricated testimonial copy.
 */
export async function getFeaturedReviews(limit = 6): Promise<FeaturedReview[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("id, rating, title, comment, created_at, products ( name )")
    .eq("status", "approved")
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[reviews] getFeaturedReviews failed:", error);
    return [];
  }

  return (data ?? [])
    .filter((r) => r.products)
    .map((r) => ({
      id: r.id,
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      productName: (r.products as unknown as { name: string }).name,
      createdAt: r.created_at,
    }));
}
