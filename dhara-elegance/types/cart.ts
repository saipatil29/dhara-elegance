export interface CartLineItem {
  productId: string;
  variantId: string | null;
  quantity: number;
  /** Display cache only — checkout always recomputes authoritative
   *  price/availability server-side inside create_order(). */
  name: string;
  slug: string;
  image: string | null;
  price: number;
  variantLabel: string | null;
}

export interface WishlistLineItem {
  productId: string;
  name: string;
  slug: string;
  image: string | null;
  price: number;
  addedAt: string;
}
