import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Star } from "lucide-react";

import { ProductGallery } from "@/components/product/product-gallery";
import { AddToCartPanel } from "@/components/product/add-to-cart-panel";
import { UspBadges } from "@/components/product/usp-badges";
import { ProductCard } from "@/components/product/product-card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getProductBySlug, getRelatedProducts } from "@/services/products";
import { formatCurrency, discountPercent } from "@/utils/format";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };

  return {
    title: product.name,
    description: product.shortDescription ?? product.description ?? undefined,
    openGraph: {
      title: product.name,
      description: product.shortDescription ?? undefined,
      images: product.images[0] ? [{ url: product.images[0].url }] : undefined,
    },
  };
}

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const related = await getRelatedProducts(product.id, product.gender, product.categoryId, 4);
  const discount = discountPercent(product.price, product.compareAtPrice);

  // Structured data for search engines — real values only.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription ?? product.description ?? undefined,
    image: product.images.map((i) => i.url),
    brand: { "@type": "Brand", name: "Dhara Elegance" },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.price,
      availability:
        product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <main className="bg-cream">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container-editorial px-5 py-6">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-navy">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={`/collections/${product.gender}`} className="capitalize hover:text-navy">
            {product.gender}
          </Link>
          {product.categoryName && (
            <>
              <ChevronRight className="h-3 w-3" />
              <span className="text-navy">{product.categoryName}</span>
            </>
          )}
        </nav>
      </div>

      <section className="container-editorial grid gap-10 px-5 pb-16 lg:grid-cols-2 lg:gap-16">
        <ProductGallery images={product.images} productName={product.name} />

        <div>
          {product.categoryName && (
            <p className="text-xs font-medium uppercase tracking-editorial text-gold">
              {product.categoryName}
            </p>
          )}
          <h1 className="mt-2 font-display text-3xl font-semibold text-navy sm:text-4xl">
            {product.name}
          </h1>

          {product.reviewCount > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={
                      i < Math.round(product.rating)
                        ? "h-4 w-4 fill-gold text-gold"
                        : "h-4 w-4 text-navy/15"
                    }
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating.toFixed(1)} ({product.reviewCount} reviews)
              </span>
            </div>
          )}

          <div className="mt-5 flex items-center gap-3">
            <span className="font-display text-2xl font-semibold text-navy">
              {formatCurrency(product.price)}
            </span>
            {product.compareAtPrice && (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  {formatCurrency(product.compareAtPrice)}
                </span>
                {discount && (
                  <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold text-destructive">
                    {discount}% off
                  </span>
                )}
              </>
            )}
          </div>

          {product.shortDescription && (
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {product.shortDescription}
            </p>
          )}

          <div className="mt-6">
            <UspBadges />
          </div>

          <div className="mt-8">
            <AddToCartPanel product={product} />
          </div>

          <div className="mt-10">
            <Accordion type="single" collapsible defaultValue="details">
              {product.description && (
                <AccordionItem value="details">
                  <AccordionTrigger>Description</AccordionTrigger>
                  <AccordionContent>{product.description}</AccordionContent>
                </AccordionItem>
              )}
              {(product.material || product.metal || product.color) && (
                <AccordionItem value="specs">
                  <AccordionTrigger>Materials &amp; Specifications</AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-1">
                      {product.material && <li>Material: {product.material}</li>}
                      {product.metal && <li>Finish: {product.metal}</li>}
                      {product.color && <li>Color: {product.color}</li>}
                      {product.sku && <li>SKU: {product.sku}</li>}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              )}
              {product.careInstructions && (
                <AccordionItem value="care">
                  <AccordionTrigger>Care Instructions</AccordionTrigger>
                  <AccordionContent>{product.careInstructions}</AccordionContent>
                </AccordionItem>
              )}
              <AccordionItem value="shipping">
                <AccordionTrigger>Shipping &amp; Returns</AccordionTrigger>
                <AccordionContent>
                  {product.shippingInformation ?? "Dispatched within 24–48 hours."}
                  <br />
                  {product.returnInformation ??
                    "Returns and exchanges available within our standard return window — no cash refunds; exchange or store credit only."}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-navy/8 py-16">
          <div className="container-editorial px-5">
            <h2 className="font-display text-2xl font-semibold text-navy">You May Also Like</h2>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} seed={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
