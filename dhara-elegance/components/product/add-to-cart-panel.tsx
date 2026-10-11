"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingBag, Heart, Share2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { VariantSelector } from "@/components/product/variant-selector";
import { useCart } from "@/components/providers/cart-provider";
import { useWishlist } from "@/components/providers/wishlist-provider";
import { cn } from "@/utils/cn";
import type { ProductDetail } from "@/services/products";

export function AddToCartPanel({ product }: { product: ProductDetail }) {
  const router = useRouter();
  const { addItem } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const [quantity, setQuantity] = React.useState(1);
  const [selectedVariantId, setSelectedVariantId] = React.useState<string | null>(
    product.variants[0]?.id ?? null
  );

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId) ?? null;
  const effectiveStock = selectedVariant ? selectedVariant.stock : product.stock;
  const effectivePrice = selectedVariant?.priceOverride ?? product.price;
  const outOfStock = effectiveStock <= 0;
  const hasVariants = product.variants.length > 0;
  const missingSelection = hasVariants && !selectedVariantId;

  const variantGroups = React.useMemo(() => {
    const groups = new Map<string, { id: string; value: string; stock: number }[]>();
    for (const v of product.variants) {
      const list = groups.get(v.name) ?? [];
      list.push({ id: v.id, value: v.value, stock: v.stock });
      groups.set(v.name, list);
    }
    return Array.from(groups.entries());
  }, [product.variants]);

  function handleAddToCart() {
    if (missingSelection) {
      toast.error(`Please select a ${variantGroups[0]?.[0].toLowerCase()}.`);
      return;
    }
    addItem({
      productId: product.id,
      variantId: selectedVariantId,
      quantity,
      name: product.name,
      slug: product.slug,
      image: product.images[0]?.url ?? null,
      price: effectivePrice,
      variantLabel: selectedVariant ? `${selectedVariant.name}: ${selectedVariant.value}` : null,
    });
  }

  function handleBuyNow() {
    handleAddToCart();
    router.push("/checkout");
  }

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url });
      } catch {
        // user cancelled — no-op
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    }
  }

  return (
    <div className="space-y-6">
      {variantGroups.map(([name, options]) => (
        <VariantSelector
          key={name}
          label={name}
          options={options}
          selectedId={
            hasVariants && product.variants.find((v) => v.id === selectedVariantId)?.name === name
              ? selectedVariantId
              : null
          }
          onSelect={setSelectedVariantId}
        />
      ))}

      <div>
        <p className="mb-2 text-sm font-medium text-navy">Quantity</p>
        <div className="inline-flex items-center gap-3 rounded-full border border-navy/20 px-2 py-1">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
            className="p-2"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="min-w-6 text-center text-sm">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => Math.min(effectiveStock || 99, q + 1))}
            aria-label="Increase quantity"
            className="p-2"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {!outOfStock && effectiveStock <= product.stock && effectiveStock > 0 && effectiveStock <= 5 && (
          <p className="mt-2 text-xs font-medium text-destructive">
            Only {effectiveStock} left — order soon.
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <Button
          size="lg"
          className="flex-1"
          disabled={outOfStock || missingSelection}
          onClick={handleAddToCart}
        >
          <ShoppingBag className="h-4 w-4" />
          {outOfStock ? "Out of Stock" : "Add to Cart"}
        </Button>
        <Button
          size="lg"
          variant="gold"
          className="flex-1"
          disabled={outOfStock || missingSelection}
          onClick={handleBuyNow}
        >
          Buy Now
        </Button>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() =>
            toggle({
              productId: product.id,
              name: product.name,
              slug: product.slug,
              image: product.images[0]?.url ?? null,
              price: product.price,
            })
          }
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-navy/20 text-sm text-navy transition-colors hover:border-navy"
        >
          <Heart
            className={cn("h-4 w-4", isWishlisted(product.id) && "fill-destructive text-destructive")}
          />
          {isWishlisted(product.id) ? "Wishlisted" : "Wishlist"}
        </button>
        <button
          onClick={handleShare}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-navy/20 text-sm text-navy transition-colors hover:border-navy"
        >
          <Share2 className="h-4 w-4" /> Share
        </button>
      </div>
    </div>
  );
}
