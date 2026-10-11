"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlaceholderImage } from "@/components/shared/placeholder-image";
import { formatCurrency } from "@/lib/utils";
import { formatDiscountPercent } from "@/utils/format";
import type { MockProduct } from "@/lib/data/homepage";

export function ProductCard({ product }: { product: MockProduct }) {
  const discount = product.compareAtPrice
    ? formatDiscountPercent(product.price, product.compareAtPrice)
    : "";

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group relative"
    >
      <Link
        href={`/products/${product.slug}`}
        className="block overflow-hidden rounded-2xl border border-white/50 bg-white/60 shadow-sm backdrop-blur-sm transition-shadow duration-300 hover:shadow-glass-lg"
      >
        <div className="relative aspect-square overflow-hidden">
          <div className="h-full w-full transition-transform duration-500 group-hover:scale-105">
            <PlaceholderImage label={product.category} seed={product.seed} />
          </div>

          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {product.isNew && <Badge variant="accent">New</Badge>}
            {product.isBestSeller && <Badge variant="gold">Best Seller</Badge>}
            {discount && <Badge variant="destructive">{discount}</Badge>}
          </div>

          <Button
            variant="glass"
            size="icon"
            aria-label="Add to wishlist"
            className="absolute right-3 top-3 h-9 w-9 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            onClick={(e) => e.preventDefault()}
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-1.5 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-brand-accent">
            {product.category}
          </p>
          <h3 className="font-display text-base font-semibold text-brand-dark line-clamp-1">
            {product.name}
          </h3>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3.5 w-3.5 fill-brand-gold text-brand-gold" />
            <span>{product.rating.toFixed(1)}</span>
            <span>({product.reviewCount})</span>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <span className="font-display text-lg font-semibold text-brand-primary">
              {formatCurrency(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatCurrency(product.compareAtPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
