"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { PlaceholderImage } from "@/components/shared/placeholder-image";
import { useWishlist } from "@/components/providers/wishlist-provider";
import { formatCurrency, discountPercent } from "@/utils/format";
import { cn } from "@/utils/cn";
import type { ProductListItem } from "@/services/products";

export function ProductCard({
  product,
  seed = 0,
}: {
  product: ProductListItem;
  seed?: number;
}) {
  const { isWishlisted, toggle } = useWishlist();
  const wishlisted = isWishlisted(product.id);
  const discount = discountPercent(product.price, product.compareAtPrice);
  const outOfStock = product.stock <= 0;

  return (
    <div className="group relative">
      <Link
        href={`/products/${product.slug}`}
        className="block overflow-hidden rounded-xl border border-navy/8 bg-white transition-shadow duration-300 hover:shadow-lifted"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-cream-300">
          <div className="h-full w-full transition-transform duration-700 ease-luxe group-hover:scale-105">
            {product.primaryImageUrl ? (
              <Image
                src={product.primaryImageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover"
              />
            ) : (
              <PlaceholderImage seed={seed} label={product.categoryName ?? undefined} />
            )}
          </div>

          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {product.isBestseller && <Badge variant="gold">Bestseller</Badge>}
            {product.isNew && <Badge variant="default">New</Badge>}
            {discount && <Badge variant="destructive">{discount}% Off</Badge>}
            {outOfStock && <Badge variant="outline">Out of Stock</Badge>}
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              toggle({
                productId: product.id,
                name: product.name,
                slug: product.slug,
                image: product.primaryImageUrl,
                price: product.price,
              });
            }}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-navy opacity-0 shadow-subtle transition-opacity duration-300 group-hover:opacity-100"
          >
            <Heart className={cn("h-4 w-4", wishlisted && "fill-destructive text-destructive")} />
          </button>
        </div>

        <div className="space-y-1.5 p-4">
          {product.categoryName && (
            <p className="text-[11px] font-medium uppercase tracking-wide text-gold">
              {product.categoryName}
            </p>
          )}
          <h3 className="line-clamp-1 font-display text-base font-semibold text-navy">
            {product.name}
          </h3>

          {product.reviewCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3.5 w-3.5 fill-gold text-gold" />
              <span>{product.rating.toFixed(1)}</span>
              <span>({product.reviewCount})</span>
            </div>
          )}

          <div className="flex items-center gap-2 pt-0.5">
            <span className="font-display text-lg font-semibold text-navy">
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
    </div>
  );
}
