import { createClient } from "@/lib/supabase/server";
import type { Gender } from "@/lib/constants";

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  gender: Gender;
  description: string | null;
  imageUrl: string | null;
}

export async function getCategoriesByGender(gender: Gender): Promise<CategoryItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, gender, description, image_url")
    .eq("gender", gender)
    .eq("is_active", true)
    .order("display_order");

  if (error) {
    console.error("[categories] getCategoriesByGender failed:", error);
    return [];
  }

  return (data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    gender: c.gender as Gender,
    description: c.description,
    imageUrl: c.image_url,
  }));
}
