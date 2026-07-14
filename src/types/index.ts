export type Category = "protein" | "supplements" | "imported";

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
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CategoryInfo {
  id: Category;
  name: string;
  description: string;
  icon: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
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
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean | null;
  sort?: "price-asc" | "price-desc" | "name" | "rating";
}
