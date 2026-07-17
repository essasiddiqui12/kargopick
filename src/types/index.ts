export type Category = string;

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku?: string;
  price: number;
  originalPrice?: number;
  stock: number;
  image?: string;
  attributes: Record<string, string>;
  isDefault: boolean;
  sortOrder: number;
  isActive: boolean;
}

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
  variants?: ProductVariant[];
}

export interface CartItem {
  product: Product;
  variantId?: string;
  variantName?: string;
  quantity: number;
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
  sku?: string;
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
