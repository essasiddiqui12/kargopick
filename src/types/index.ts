export type Category = string;

export type AttributeType = "select" | "multiselect" | "text" | "number" | "boolean" | "color" | "date";

export interface ProductAttribute {
  id: string;
  name: string;
  display_name: string;
  type: AttributeType;
  is_variant: boolean;
  is_required: boolean;
  sort_order: number;
  is_active: boolean;
  attribute_values?: ProductAttributeValue[];
}

export interface ProductAttributeValue {
  id: string;
  attribute_id: string;
  value: string;
  display_value?: string;
  meta_data?: Record<string, unknown>;
  sort_order: number;
  is_active: boolean;
}

export interface ProductAttributeAssignment {
  id: string;
  product_id: string;
  attribute_id: string;
  is_required: boolean;
  is_variant: boolean;
  sort_order: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku?: string;
  barcode?: string;
  price?: number;
  stock: number;
  weight?: string;
  image?: string;
  is_active: boolean;
  is_default: boolean;
  sort_order: number;
  attribute_values: ProductAttributeValue[];
}

export interface SelectedVariant {
  variant: ProductVariant;
  attributeValueIds: string[];
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number | null;
  category: Category;
  subcategory?: string;
  image: string;
  images: string[];
  videos?: string[];
  badge?: string;
  rating: number;
  reviews: number;
  stock: number;
  inStock: boolean;
  weight?: string;
  origin?: string;
  attributes?: ProductAttributeAssignment[];
  variants?: ProductVariant[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  variantId?: string;
  variantName?: string;
  selectedAttributes?: { attributeName: string; value: string }[];
}

export interface CategoryInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
}

export interface SubcategoryInfo {
  id: string;
  name: string;
  description: string;
  parent_category: string;
  icon: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  variantId?: string;
  variantName?: string;
  selectedAttributes?: { attributeName: string; value: string }[];
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  items: OrderItem[];
  subtotal?: number;
  discount?: number;
  couponCode?: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
  notes?: string;
}

export type CouponType = "percentage" | "fixed";

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minOrder?: number;
  maxUses?: number;
  usedCount: number;
  expiresAt?: string;
  active: boolean;
  description?: string;
}

export interface AppliedCoupon {
  code: string;
  type: CouponType;
  value: number;
  discount: number;
}

export interface ProductFilters {
  category?: string;
  subcategory?: string;
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean | null;
  sort?: "price-asc" | "price-desc" | "name" | "rating";
}
