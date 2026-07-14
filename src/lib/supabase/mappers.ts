import { Product, Coupon, Order, OrderItem, OrderStatus } from "@/types";

export function normalizeProductImages(
  image?: string,
  images?: string[] | null,
  videos?: string[] | null
): { image: string; images: string[]; videos: string[] } {
  const imageList = (images ?? []).filter(Boolean);
  const videoList = (videos ?? []).filter(Boolean);
  if (imageList.length > 0) {
    return { image: imageList[0], images: imageList, videos: videoList };
  }
  if (image) {
    return { image, images: [image], videos: videoList };
  }
  return { image: "", images: [], videos: videoList };
}

export function productToRow(product: Partial<Product> & { id?: string }) {
  const { image, images, videos } = normalizeProductImages(
    product.image,
    product.images,
    product.videos
  );

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    original_price: product.originalPrice ?? null,
    category: product.category,
    image,
    images,
    videos,
    badge: product.badge ?? null,
    rating: product.rating,
    reviews: product.reviews,
    stock: product.stock,
    in_stock: product.inStock,
    weight: product.weight ?? null,
    origin: product.origin ?? null,
  };
}

export function rowToProduct(row: Record<string, unknown>): Product {
  const { image, images, videos } = normalizeProductImages(
    row.image as string,
    row.images as string[] | null,
    row.videos as string[] | null
  );

  return {
    id: row.id as string,
    name: row.name as string,
    description: row.description as string,
    price: Number(row.price),
    originalPrice: row.original_price
      ? Number(row.original_price)
      : undefined,
    category: row.category as Product["category"],
    image,
    images,
    videos,
    badge: (row.badge as string) || undefined,
    rating: Number(row.rating),
    reviews: Number(row.reviews),
    stock: Number(row.stock ?? 0),
    inStock: Boolean(row.in_stock),
    weight: (row.weight as string) || undefined,
    origin: (row.origin as string) || undefined,
  };
}

export function couponToRow(coupon: Partial<Coupon> & { id?: string }) {
  return {
    id: coupon.id,
    code: coupon.code?.toUpperCase(),
    type: coupon.type,
    value: coupon.value,
    min_order: coupon.minOrder ?? null,
    max_uses: coupon.maxUses ?? null,
    used_count: coupon.usedCount ?? 0,
    expires_at: coupon.expiresAt ?? null,
    active: coupon.active ?? true,
    description: coupon.description ?? null,
  };
}

export function rowToCoupon(row: Record<string, unknown>): Coupon {
  return {
    id: row.id as string,
    code: row.code as string,
    type: row.type as Coupon["type"],
    value: Number(row.value),
    minOrder: row.min_order ? Number(row.min_order) : undefined,
    maxUses: row.max_uses ? Number(row.max_uses) : undefined,
    usedCount: Number(row.used_count),
    expiresAt: (row.expires_at as string) || undefined,
    active: Boolean(row.active),
    description: (row.description as string) || undefined,
  };
}

export function orderToRow(
  order: Omit<Order, "createdAt"> & { createdAt?: string }
) {
  return {
    id: order.id,
    customer_name: order.customerName,
    phone: order.phone,
    address: order.address,
    items: order.items,
    subtotal: order.subtotal ?? null,
    discount: order.discount ?? null,
    coupon_code: order.couponCode ?? null,
    total: order.total,
    status: order.status,
    notes: order.notes ?? null,
    created_at: order.createdAt,
  };
}

export function rowToOrder(row: Record<string, unknown>): Order {
  return {
    id: row.id as string,
    customerName: row.customer_name as string,
    phone: row.phone as string,
    address: row.address as string,
    items: row.items as OrderItem[],
    subtotal: row.subtotal ? Number(row.subtotal) : undefined,
    discount: row.discount ? Number(row.discount) : undefined,
    couponCode: (row.coupon_code as string) || undefined,
    total: Number(row.total),
    status: row.status as OrderStatus,
    notes: (row.notes as string) || undefined,
    createdAt: row.created_at as string,
  };
}
