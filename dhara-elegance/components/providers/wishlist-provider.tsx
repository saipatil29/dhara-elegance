"use client";

import * as React from "react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { WishlistLineItem } from "@/types/cart";

interface WishlistContextType {
  items: WishlistLineItem[];
  isReady: boolean;
  isWishlisted: (productId: string) => boolean;
  toggle: (item: Omit<WishlistLineItem, "addedAt">) => Promise<void>;
}

const WishlistContext = React.createContext<WishlistContextType | undefined>(undefined);
const GUEST_WISHLIST_KEY = "dhara-elegance-guest-wishlist";

/**
 * Same guest/account split as CartProvider. Unlike cart_items,
 * wishlist_items has a single ORDINARY unique(user_id, product_id)
 * constraint (no variant dimension), so a real upsert(onConflict)
 * is safe here — no partial-index caveat applies.
 */
export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const supabase = React.useMemo(() => createClient(), []);
  const { value: guestItems, setValue: setGuestItems, isHydrated } =
    useLocalStorage<WishlistLineItem[]>(GUEST_WISHLIST_KEY, []);

  const [serverItems, setServerItems] = React.useState<WishlistLineItem[] | null>(null);
  const [userId, setUserId] = React.useState<string | null | undefined>(undefined);

  const fetchServerWishlist = React.useCallback(async (): Promise<WishlistLineItem[]> => {
    const { data, error } = await supabase
      .from("wishlist_items")
      .select("created_at, product_id, products ( name, slug, price )")
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    return data
      .filter((row) => row.products)
      .map((row) => {
        const product = row.products as unknown as { name: string; slug: string; price: number };
        return {
          productId: row.product_id,
          name: product.name,
          slug: product.slug,
          image: null,
          price: product.price,
          addedAt: row.created_at,
        };
      });
  }, [supabase]);

  React.useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (mounted) setUserId(data.user?.id ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      const newUserId = session?.user?.id ?? null;

      if (event === "SIGNED_IN" && newUserId) {
        if (guestItems.length > 0) {
          for (const item of guestItems) {
            await supabase
              .from("wishlist_items")
              .upsert(
                { user_id: newUserId, product_id: item.productId },
                { onConflict: "user_id,product_id" }
              );
          }
          setGuestItems([]);
        }
        setServerItems(await fetchServerWishlist());
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
    if (userId) fetchServerWishlist().then(setServerItems);
  }, [userId, fetchServerWishlist]);

  const items = userId ? (serverItems ?? []) : guestItems;
  const isReady = userId === undefined ? false : userId ? serverItems !== null : isHydrated;

  const isWishlisted = React.useCallback(
    (productId: string) => items.some((i) => i.productId === productId),
    [items]
  );

  const toggle = React.useCallback(
    async (item: Omit<WishlistLineItem, "addedAt">) => {
      const already = isWishlisted(item.productId);

      if (userId) {
        if (already) {
          await supabase
            .from("wishlist_items")
            .delete()
            .eq("user_id", userId)
            .eq("product_id", item.productId);
        } else {
          await supabase
            .from("wishlist_items")
            .upsert(
              { user_id: userId, product_id: item.productId },
              { onConflict: "user_id,product_id" }
            );
        }
        setServerItems(await fetchServerWishlist());
      } else {
        setGuestItems((prev) =>
          already
            ? prev.filter((i) => i.productId !== item.productId)
            : [...prev, { ...item, addedAt: new Date().toISOString() }]
        );
      }

      toast.success(already ? `Removed ${item.name} from wishlist` : `${item.name} added to wishlist`);
    },
    [userId, isWishlisted, supabase, fetchServerWishlist, setGuestItems]
  );

  return (
    <WishlistContext.Provider value={{ items, isReady, isWishlisted, toggle }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = React.useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
