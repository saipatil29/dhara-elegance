import type { Metadata } from "next";

import { HeroSection } from "@/components/storefront/home/hero-section";
import { UspStrip } from "@/components/storefront/home/usp-strip";
import { ShopByGender } from "@/components/storefront/home/shop-by-gender";
import { ProductRailSection } from "@/components/storefront/home/product-rail-section";
import { BrandStorySection } from "@/components/storefront/home/brand-story-section";
import { ReviewsSection } from "@/components/storefront/home/reviews-section";
import { InstagramSection } from "@/components/storefront/home/instagram-section";
import { FaqSection } from "@/components/storefront/home/faq-section";
import { NewsletterSection } from "@/components/storefront/home/newsletter-section";
import { getBestSellers, getNewArrivals, getFeaturedProducts } from "@/services/products";
import { getFeaturedReviews } from "@/services/reviews";
import { BRAND } from "@/lib/constants";

export const metadata: Metadata = {
  title: `${BRAND.name} — ${BRAND.tagline}`,
  description: BRAND.description,
};

// Homepage queries hit the DB on every request — acceptable for a
// catalog this size, and correct for "New Arrivals"/"Best Sellers"
// to always reflect the current admin-managed state. Add `revalidate`
// caching here later if traffic warrants it.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [bestSellers, newArrivals, featured, reviews] = await Promise.all([
    getBestSellers(8),
    getNewArrivals(8),
    getFeaturedProducts(6),
    getFeaturedReviews(6),
  ]);

  return (
    <>
      <HeroSection />
      <UspStrip />
      <ShopByGender />

      <ProductRailSection
        eyebrow="Loved by Many"
        title="Best Sellers"
        description="The pieces our customers keep coming back for."
        products={bestSellers}
        viewAllHref="/collections?filter=bestseller"
        emptyMessage="Best sellers will appear here once products are marked as bestsellers in the admin portal."
      />

      <ProductRailSection
        eyebrow="Just Landed"
        title="New Arrivals"
        description="Fresh from the atelier."
        products={newArrivals}
        viewAllHref="/collections?filter=new"
        emptyMessage="New arrivals will appear here once products are added and marked as new."
      />

      <ProductRailSection
        eyebrow="Trending Now"
        title="Featured Collection"
        description="Editorial picks, curated for the season."
        products={featured}
        viewAllHref="/collections"
        emptyMessage="Featured picks will appear here once products are marked as featured in the admin portal."
      />

      <BrandStorySection />
      <ReviewsSection reviews={reviews} />
      <InstagramSection />
      <FaqSection />
      <NewsletterSection />
    </>
  );
}
