"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/providers/cart-provider";
import { PlaceholderImage } from "@/components/shared/placeholder-image";
import { formatCurrency } from "@/utils/format";

export function CartDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { items, totalPrice, updateQuantity, removeItem, isReady } = useCart();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col p-0">
        <SheetHeader>
          <SheetTitle>Your Bag {items.length > 0 && `(${items.length})`}</SheetTitle>
        </SheetHeader>

        {!isReady ? (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            Loading your bag…
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
            <ShoppingBag className="h-10 w-10 text-navy/30" />
            <p className="text-sm text-muted-foreground">Your bag is empty.</p>
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} asChild>
              <Link href="/collections">Continue shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {items.map((item) => (
                <div key={`${item.productId}-${item.variantId ?? "base"}`} className="flex gap-3">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg">
                    <PlaceholderImage seed={0} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-display text-sm font-semibold text-navy">
                          {item.name}
                        </p>
                        {item.variantLabel && (
                          <p className="text-xs text-muted-foreground">{item.variantLabel}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.productId, item.variantId)}
                        aria-label="Remove item"
                        className="shrink-0 text-navy/40 hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2 rounded-full border border-navy/15">
                        <button
                          className="p-1.5"
                          aria-label="Decrease quantity"
                          onClick={() =>
                            updateQuantity(item.productId, item.variantId, item.quantity - 1)
                          }
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-4 text-center text-xs">{item.quantity}</span>
                        <button
                          className="p-1.5"
                          aria-label="Increase quantity"
                          onClick={() =>
                            updateQuantity(item.productId, item.variantId, item.quantity + 1)
                          }
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="text-sm font-semibold text-navy">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-navy/10 p-5">
              <div className="mb-4 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-display text-lg font-semibold text-navy">
                  {formatCurrency(totalPrice)}
                </span>
              </div>
              <p className="mb-4 text-xs text-muted-foreground">
                Shipping and any discounts are calculated at checkout.
              </p>
              <Button asChild className="w-full" onClick={() => onOpenChange(false)}>
                <Link href="/cart">View Bag &amp; Checkout</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
