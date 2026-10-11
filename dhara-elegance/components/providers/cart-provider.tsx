"use client";

import * as React from "react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { CartLineItem } from "@/types/cart";

interface CartContextType {
  items: CartLineItem[];
  totalItems: number;
  totalPrice: number;
  isReady: boolean;
  isSyncing: boolean;
  addItem: (item: CartLineItem) => Promise<void>;
  removeItem: (productId: string, variantId: string | null) => Promise<void>;
  updateQuantity: (
    productId: string,
    variantId: string | null,
    quantity: number
  ) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = React.createContext<CartContextType | undefined>(undefined);

const GUEST_CART_KEY = "dhara-elegance-guest-cart";

function sameLine(a: { productId: string; variantId: string | null }, b: typeof a) {
  return a.productId === b.productId && a.variantId === b.variantId;
}

/**
 * cart_items has PARTIAL unique indexes (one for rows with a
 * variant_id, one for rows without), because Postgres treats every
 * NULL as distinct so a single ordinary unique constraint including
 * variant_id can't enforce "one row per product per user" for
 * variant-less products. PostgREST's upsert(onConflict:) infers a
 * conflict target from a plain column list, which cannot match a
 * PARTIAL index's predicate — so a real upsert() call here would
 * fail against Postgres. This does the equivalent as two explicit
 * round trips instead of relying on ON CONFLICT.
 */
async function upsertCartRow(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  productId: string,
  variantId: string | null,
  quantity: number,
  mode: "set" | "add" = "set"
) {
  let existingQuery = supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("user_id", userId)
    .eq("product_id", productId);
  existingQuery = variantId
    ? existingQuery.eq("variant_id", variantId)
    : existingQuery.is("variant_id", null);

  const { data: existing } = await existingQuery.maybeSingle();

  if (existing) {
    const nextQuantity = Math.min(
      mode === "add" ? existing.quantity + quantity : quantity,
      99
    );
    return supabase
      .from("cart_items")
      .update({ quantity: nextQuantity })
      .eq("id", existing.id);
  }
  return supabase.from("cart_items").insert({
    user_id: userId,
    product_id: productId,
    variant_id: variantId,
    quantity: Math.min(quantity, 99),
  });
}

/**
 * Guests: cart lives entirely in localStorage.
 * Signed-in users: cart lives in the `cart_items` table, read/written
 * directly from the browser via the anon-key client — safe because
 * RLS policy `cart_items_own_all` restricts every row to
 * `user_id = auth.uid()`. On sign-in, any guest cart in
 * localStorage is merged into the server cart once, then cleared.
 *
 * Checkout NEVER trusts the `price` cached here — it is display-only.
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const supabase = React.useMemo(() => createClient(), []);
  const { value: guestItems, setValue: setGuestItems, isHydrated } =
    useLocalStorage<CartLineItem[]>(GUEST_CART_KEY, []);

  const [serverItems, setServerItems] = React.useState<CartLineItem[] | null>(null);
  const [userId, setUserId] = React.useState<string | null | undefined>(undefined);
  const [isSyncing, setIsSyncing] = React.useState(false);

  const fetchServerCart = React.useCallback(async (): Promise<CartLineItem[]> => {
    const { data, error } = await supabase
      .from("cart_items")
      .select(
        `quantity, product_id, variant_id,
         products ( name, slug, price ),
         product_variants ( name, value, price_override )`
      );

    if (error || !data) {
      console.error("[cart] failed to load server cart:", error);
      return [];
    }

    return data
      .filter((row) => row.products)
      .map((row) => {
        const product = row.products as unknown as {
          name: string;
          slug: string;
          price: number;
        };
        const variant = row.product_variants as unknown as {
          name: string;
          value: string;
          price_override: number | null;
        } | null;

        return {
          productId: row.product_id,
          variantId: row.variant_id,
          quantity: row.quantity,
          name: product.name,
          slug: product.slug,
          image: null,
          price: variant?.price_override ?? product.price,
          variantLabel: variant ? `${variant.name}: ${variant.value}` : null,
        };
      });
  }, [supabase]);

  // Track auth state and merge the guest cart in exactly once per sign-in.
  React.useEffect(() => {
    let mounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (mounted) setUserId(data.user?.id ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      const newUserId = session?.user?.id ?? null;

      if (event === "SIGNED_IN" && newUserId) {
        setIsSyncing(true);
        try {
          if (guestItems.length > 0) {
            for (const item of guestItems) {
              await upsertCartRow(
                supabase,
                newUserId,
                item.productId,
                item.variantId,
                item.quantity,
                "add"
              );
            }
            setGuestItems([]);
          }
          setServerItems(await fetchServerCart());
        } finally {
          setIsSyncing(false);
        }
      } else if (event === "SIGNED_OUT") {
        setServerItems(null);
      }

      setUserId(newUserId);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (userId) {
      fetchServerCart().then(setServerItems);
    }
  }, [userId, fetchServerCart]);

  const items = userId ? (serverItems ?? []) : guestItems;
  const isReady = userId === undefined ? false : userId ? serverItems !== null : isHydrated;

  const addItem = React.useCallback(
    async (item: CartLineItem) => {
      if (userId) {
        const { error } = await upsertCartRow(
          supabase,
          userId,
          item.productId,
          item.variantId,
          item.quantity,
          "add"
        );
        if (error) {
          toast.error("Couldn't add that to your cart. Please try again.");
          return;
        }
        setServerItems(await fetchServerCart());
      } else {
        setGuestItems((prev) => {
          const existing = prev.find((i) => sameLine(i, item));
          if (existing) {
            return prev.map((i) =>
              sameLine(i, item)
                ? { ...i, quantity: Math.min(i.quantity + item.quantity, 99) }
                : i
            );
          }
          return [...prev, item];
        });
      }
      toast.success(`${item.name} added to your cart`);
    },
    [userId, supabase, fetchServerCart, setGuestItems]
  );

  const removeItem = React.useCallback(
    async (productId: string, variantId: string | null) => {
      if (userId) {
        let query = supabase
          .from("cart_items")
          .delete()
          .eq("user_id", userId)
          .eq("product_id", productId);
        query = variantId ? query.eq("variant_id", variantId) : query.is("variant_id", null);
        await query;
        setServerItems(await fetchServerCart());
      } else {
        setGuestItems((prev) => prev.filter((i) => !sameLine(i, { productId, variantId })));
      }
    },
    [userId, supabase, fetchServerCart, setGuestItems]
  );

  const updateQuantity = React.useCallback(
    async (productId: string, variantId: string | null, quantity: number) => {
      if (quantity <= 0) return removeItem(productId, variantId);
      const clamped = Math.min(quantity, 99);

      if (userId) {
        let query = supabase
          .from("cart_items")
          .update({ quantity: clamped })
          .eq("user_id", userId)
          .eq("product_id", productId);
        query = variantId ? query.eq("variant_id", variantId) : query.is("variant_id", null);
        await query;
        setServerItems(await fetchServerCart());
      } else {
        setGuestItems((prev) =>
          prev.map((i) =>
            sameLine(i, { productId, variantId }) ? { ...i, quantity: clamped } : i
          )
        );
      }
    },
    [userId, supabase, fetchServerCart, setGuestItems, removeItem]
  );

  const clearCart = React.useCallback(async () => {
    if (userId) {
      await supabase.from("cart_items").delete().eq("user_id", userId);
      setServerItems([]);
    } else {
      setGuestItems([]);
    }
  }, [userId, supabase, setGuestItems]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalPrice,
        isReady,
        isSyncing,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
