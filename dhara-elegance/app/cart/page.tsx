"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { useCart } from "@/components/providers/cart-provider";
import { Button } from "@/components/ui/button";
import { PlaceholderImage } from "@/components/shared/placeholder-image";
import { formatCurrency } from "@/utils/format";

export default function CartPage() {
  const { items, totalItems, totalPrice, updateQuantity, removeItem, isReady } = useCart();

  if (!isReady) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-cream">
        <p className="text-sm text-muted-foreground">Loading your bag…</p>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-[60vh] bg-cream px-6 py-20">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white">
            <ShoppingBag className="h-9 w-9 text-navy" />
          </div>
          <h1 className="mt-6 font-display text-3xl font-semibold text-navy">Your Bag is Empty</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Discover something beautiful from our collection.
          </p>
          <Button size="lg" className="mt-8" asChild>
            <Link href="/collections">Continue Shopping</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream px-5 py-12">
      <div className="container-editorial">
        <p className="text-xs font-medium uppercase tracking-editorial text-gold">Dhara Elegance</p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-navy">Your Bag</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {totalItems} {totalItems === 1 ? "item" : "items"}
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.variantId ?? "base"}`}
                className="flex gap-5 rounded-2xl border border-navy/8 bg-white p-5"
              >
                <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl">
                  <PlaceholderImage seed={0} />
                </div>

                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <h2 className="font-display text-lg font-semibold text-navy">{item.name}</h2>
                    {item.variantLabel && (
                      <p className="text-xs text-muted-foreground">{item.variantLabel}</p>
                    )}
                    <p className="mt-1 font-medium text-navy">{formatCurrency(item.price)}</p>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 rounded-full border border-navy/15">
                      <button
                        onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                        className="p-2"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-6 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                        className="p-2"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId, item.variantId)}
                      className="flex items-center gap-1.5 text-sm text-destructive hover:text-destructive/80"
                    >
                      <Trash2 className="h-4 w-4" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="h-fit rounded-2xl border border-navy/8 bg-white p-6">
            <h2 className="font-display text-xl font-semibold text-navy">Order Summary</h2>
            <div className="mt-5 flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatCurrency(totalPrice)}</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Shipping, discounts and any coupon are calculated at checkout.
            </p>
            <div className="my-5 border-t border-navy/10" />
            <div className="flex justify-between font-display text-lg font-semibold text-navy">
              <span>Estimated Total</span>
              <span>{formatCurrency(totalPrice)}</span>
            </div>
            <Button asChild className="mt-6 w-full" size="lg">
              <Link href="/checkout">Proceed to Checkout</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
