export type * from "./database";

/** Result wrapper used by server actions and services. */
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

/** A product joined with its gallery and variants. */
export type ProductWithRelations = import("./database").Product & {
  images: import("./database").ProductImage[];
  variants: import("./database").ProductVariant[];
  category: import("./database").Category | null;
};

/** An order joined with its line items and payment attempts. */
export type OrderWithRelations = import("./database").Order & {
  items: import("./database").OrderItem[];
  payments: import("./database").Payment[];
};
