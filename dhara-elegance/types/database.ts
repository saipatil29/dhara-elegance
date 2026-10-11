/**
 * Database types for the Supabase schema.
 *
 * ──────────────────────────────────────────────────────────────
 * THIS FILE IS HAND-WRITTEN TO MATCH supabase/migrations/*.sql.
 *
 * Once your Supabase project is live, REGENERATE it rather than
 * editing by hand, so the types can never drift from the schema:
 *
 *   npx supabase login
 *   npm run db:types
 *
 * (that runs: supabase gen types typescript --project-id $SUPABASE_PROJECT_ID
 *  --schema public > types/database.ts)
 * ──────────────────────────────────────────────────────────────
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type GenderTarget = "men" | "women" | "unisex";
export type AdminRole = "staff" | "admin" | "super_admin";
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";
export type PaymentStatus =
  | "pending"
  | "authorized"
  | "paid"
  | "failed"
  | "refunded"
  | "partially_refunded";
export type PaymentMethod = "razorpay" | "cod";
export type DiscountType = "percentage" | "fixed";
export type ReturnKind = "return" | "exchange";
export type ReturnStatus =
  | "requested"
  | "approved"
  | "rejected"
  | "pickup_scheduled"
  | "received"
  | "exchange_processing"
  | "completed";
export type InventoryReason =
  | "manual_adjustment"
  | "order_reserved"
  | "order_released"
  | "order_fulfilled"
  | "return_restock"
  | "initial_stock";
export type ReviewStatus = "pending" | "approved" | "hidden";

/** Columns the database fills in for you. */
type Generated = "id" | "created_at" | "updated_at";

type Timestamps = {
  created_at: string;
  updated_at: string;
};

export interface Profile extends Timestamps {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  marketing_opt_in: boolean;
  is_blocked: boolean;
}

export interface AdminUser extends Timestamps {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  role: AdminRole;
  is_active: boolean;
  last_login_at: string | null;
}

export interface Address extends Timestamps {
  id: string;
  user_id: string;
  label: string | null;
  full_name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  is_default: boolean;
}

export interface Category extends Timestamps {
  id: string;
  name: string;
  slug: string;
  gender: GenderTarget;
  parent_id: string | null;
  description: string | null;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  seo_title: string | null;
  seo_description: string | null;
}

export interface Product extends Timestamps {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  gender: GenderTarget;
  category_id: string | null;
  subcategory: string | null;
  price: number;
  compare_at_price: number | null;
  currency: string;
  sku: string | null;
  stock: number;
  reserved_stock: number;
  low_stock_threshold: number;
  brand: string | null;
  material: string | null;
  metal: string | null;
  color: string | null;
  size: string | null;
  weight_grams: number | null;
  dimensions: string | null;
  care_instructions: string | null;
  shipping_information: string | null;
  return_information: string | null;
  rating: number;
  review_count: number;
  is_featured: boolean;
  is_new: boolean;
  is_bestseller: boolean;
  is_active: boolean;
  archived_at: string | null;
  tags: string[];
  video_url: string | null;
  model_3d_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
}

export interface ProductVariant extends Timestamps {
  id: string;
  product_id: string;
  name: string;
  value: string;
  sku: string | null;
  price_override: number | null;
  stock: number;
  reserved_stock: number;
  display_order: number;
  is_active: boolean;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  storage_path: string | null;
  alt_text: string | null;
  display_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface CartItem extends Timestamps {
  id: string;
  user_id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export interface Order extends Timestamps {
  id: string;
  order_number: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  subtotal: number;
  discount_amount: number;
  shipping_amount: number;
  total: number;
  currency: string;
  coupon_id: string | null;
  coupon_code: string | null;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  status: OrderStatus;
  courier_name: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  shipping_notes: string | null;
  customer_notes: string | null;
  admin_notes: string | null;
  placed_at: string;
  confirmed_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  product_slug: string | null;
  product_image: string | null;
  variant_label: string | null;
  sku: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
  created_at: string;
}

export interface Payment extends Timestamps {
  id: string;
  order_id: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  currency: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  razorpay_signature: string | null;
  error_code: string | null;
  error_description: string | null;
  authorized_at: string | null;
  paid_at: string | null;
  failed_at: string | null;
  refunded_amount: number;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  from_status: OrderStatus | null;
  to_status: OrderStatus;
  changed_by: string | null;
  note: string | null;
  created_at: string;
}

export interface RecentlyViewed {
  id: string;
  user_id: string;
  product_id: string;
  viewed_at: string;
}

export interface Coupon extends Timestamps {
  id: string;
  code: string;
  description: string | null;
  discount_type: DiscountType;
  discount_value: number;
  minimum_order_amount: number;
  maximum_discount_amount: number | null;
  usage_limit: number | null;
  per_user_limit: number | null;
  used_count: number;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_by: string | null;
}

export interface CouponUsage {
  id: string;
  coupon_id: string;
  order_id: string;
  user_id: string | null;
  discount_amount: number;
  created_at: string;
}

export interface InventoryTransaction {
  id: string;
  product_id: string;
  variant_id: string | null;
  order_id: string | null;
  reason: InventoryReason;
  quantity_delta: number;
  stock_after: number;
  note: string | null;
  created_by: string | null;
  created_at: string;
}

export interface ReturnRequest extends Timestamps {
  id: string;
  order_id: string;
  order_item_id: string;
  user_id: string | null;
  kind: ReturnKind;
  status: ReturnStatus;
  reason: string;
  customer_notes: string | null;
  image_urls: string[];
  quantity: number;
  replacement_product_id: string | null;
  replacement_variant_id: string | null;
  store_credit_amount: number | null;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
}

export interface Review extends Timestamps {
  id: string;
  product_id: string;
  user_id: string;
  order_item_id: string | null;
  rating: number;
  title: string | null;
  comment: string | null;
  image_urls: string[];
  is_verified_purchase: boolean;
  is_featured: boolean;
  status: ReviewStatus;
}

export interface SiteSettings extends Timestamps {
  id: boolean;
  brand_name: string;
  tagline: string;
  logo_url: string | null;
  favicon_url: string | null;
  support_email: string | null;
  support_phone: string | null;
  whatsapp_number: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  free_shipping_threshold: number;
  flat_shipping_rate: number;
  cod_minimum_amount: number;
  cod_enabled: boolean;
  return_window_days: number;
  exchange_enabled: boolean;
  returns_enabled: boolean;
  store_credit_enabled: boolean;
  announcement_text: string | null;
  announcement_enabled: boolean;
}

export interface AuditLog {
  id: string;
  actor_id: string | null;
  actor_email: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  metadata: Json;
  ip_address: string | null;
  created_at: string;
}

export interface WebhookEvent {
  id: string;
  provider: string;
  event_id: string;
  event_type: string;
  payload: Json;
  processed: boolean;
  processed_at: string | null;
  error_message: string | null;
  created_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  is_subscribed: boolean;
  source: string | null;
  subscribed_at: string;
  unsubscribed_at: string | null;
}

/** Shapes a table entry the way supabase-js expects. */
type TableShape<Row, RequiredOnInsert extends keyof Row = never> = {
  Row: Row;
  Insert: Partial<Omit<Row, Generated>> & Pick<Row, RequiredOnInsert>;
  Update: Partial<Omit<Row, "id" | "created_at">>;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      profiles: TableShape<Profile, "id" | "email">;
      admin_users: TableShape<AdminUser, "user_id" | "email">;
      addresses: TableShape<
        Address,
        "user_id" | "full_name" | "phone" | "line1" | "city" | "state" | "pincode"
      >;
      categories: TableShape<Category, "name" | "slug" | "gender">;
      products: TableShape<Product, "name" | "slug" | "gender" | "price">;
      product_variants: TableShape<
        ProductVariant,
        "product_id" | "name" | "value"
      >;
      product_images: TableShape<ProductImage, "product_id" | "url">;
      cart_items: TableShape<CartItem, "user_id" | "product_id">;
      wishlist_items: TableShape<WishlistItem, "user_id" | "product_id">;
      orders: TableShape<
        Order,
        | "customer_name"
        | "customer_email"
        | "customer_phone"
        | "address_line1"
        | "city"
        | "state"
        | "pincode"
        | "subtotal"
        | "total"
        | "payment_method"
      >;
      order_items: TableShape<
        OrderItem,
        "order_id" | "product_name" | "unit_price" | "quantity" | "line_total"
      >;
      payments: TableShape<Payment, "order_id" | "method" | "amount">;
      order_status_history: TableShape<
        OrderStatusHistory,
        "order_id" | "to_status"
      >;
      recently_viewed: TableShape<RecentlyViewed, "user_id" | "product_id">;
      coupons: TableShape<Coupon, "code" | "discount_type" | "discount_value">;
      coupon_usages: TableShape<
        CouponUsage,
        "coupon_id" | "order_id" | "discount_amount"
      >;
      inventory_transactions: TableShape<
        InventoryTransaction,
        "product_id" | "reason" | "quantity_delta" | "stock_after"
      >;
      return_requests: TableShape<
        ReturnRequest,
        "order_id" | "order_item_id" | "kind" | "reason"
      >;
      reviews: TableShape<Review, "product_id" | "user_id" | "rating">;
      site_settings: TableShape<SiteSettings>;
      audit_logs: TableShape<AuditLog, "action">;
      webhook_events: TableShape<
        WebhookEvent,
        "event_id" | "event_type" | "payload"
      >;
      newsletter_subscribers: TableShape<NewsletterSubscriber, "email">;
    };
    Views: Record<never, never>;
    Functions: {
      is_admin: { Args: Record<never, never>; Returns: boolean };
      is_super_admin: { Args: Record<never, never>; Returns: boolean };
      has_admin_role: { Args: { required: AdminRole }; Returns: boolean };
    };
    Enums: {
      gender_target: GenderTarget;
      admin_role: AdminRole;
      order_status: OrderStatus;
      payment_status: PaymentStatus;
      payment_method: PaymentMethod;
      discount_type: DiscountType;
      return_kind: ReturnKind;
      return_status: ReturnStatus;
      inventory_reason: InventoryReason;
      review_status: ReviewStatus;
    };
    CompositeTypes: Record<never, never>;
  };
}
