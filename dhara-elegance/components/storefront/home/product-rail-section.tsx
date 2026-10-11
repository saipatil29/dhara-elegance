import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { Reveal, StaggerReveal, StaggerItem } from "@/components/motion/reveal";
import type { ProductListItem } from "@/services/products";

/**
 * Shared layout for Best Sellers / New Arrivals / Trending / Featured
 * — all four homepage sections are "a titled rail of real products",
 * differing only in which query fed them and the copy.
 */
export function ProductRailSection({
  eyebrow,
  title,
  description,
  products,
  viewAllHref,
  emptyMessage,
}: {
  eyebrow: string;
  title: string;
  description: string;
  products: ProductListItem[];
  viewAllHref: string;
  emptyMessage: string;
}) {
  return (
    <section className="py-16 sm:py-20">
      <div className="container-editorial px-5">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <Reveal>
            <p className="text-xs font-medium uppercase tracking-editorial text-gold">{eyebrow}</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-navy sm:text-4xl">{title}</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
          </Reveal>
          <Button variant="outline" size="sm" asChild>
            <Link href={viewAllHref}>
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {products.length > 0 ? (
          <StaggerReveal className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {products.map((product, i) => (
              <StaggerItem key={product.id}>
                <ProductCard product={product} seed={i} />
              </StaggerItem>
            ))}
          </StaggerReveal>
        ) : (
          <div className="mt-10 rounded-2xl border border-dashed border-navy/15 p-12 text-center">
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          </div>
        )}
      </div>
    </section>
  );
}
