"use client";

import * as React from "react";

import { CartProvider } from "@/components/providers/cart-provider";
import { WishlistProvider } from "@/components/providers/wishlist-provider";
import { ToastProvider } from "@/components/providers/toast-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <WishlistProvider>
        {children}
        <ToastProvider />
      </WishlistProvider>
    </CartProvider>
  );
}
