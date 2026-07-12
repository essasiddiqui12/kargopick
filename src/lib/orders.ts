import { createAdminClient } from "@/lib/supabase/server";
import { orderToRow, rowToOrder } from "@/lib/supabase/mappers";
import { incrementCouponUsage, validateCoupon } from "@/lib/coupons";
import { reserveStockForOrder } from "@/lib/products";
import { Order, OrderItem, OrderStatus } from "@/types";

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length > 10) return digits.slice(-10);
  return digits;
}

export async function getOrders(): Promise<Order[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => rowToOrder(row));
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? rowToOrder(data) : undefined;
}

export async function trackOrder(
  orderId: string,
  phone: string
): Promise<Order | null> {
  const order = await getOrderById(orderId.trim().toUpperCase());
  if (!order) return null;
  if (normalizePhone(order.phone) !== normalizePhone(phone)) return null;
  return order;
}

export async function createOrder(data: {
  customerName: string;
  phone: string;
  address: string;
  items: OrderItem[];
  subtotal: number;
  discount?: number;
  couponCode?: string;
  total: number;
  notes?: string;
}): Promise<Order> {
  if (data.couponCode) {
    const result = await validateCoupon(data.couponCode, data.subtotal);
    if (!result.valid) {
      throw new Error(result.error);
    }
    if (result.discount !== (data.discount || 0)) {
      throw new Error("Coupon discount mismatch. Please re-apply the coupon.");
    }
    await incrementCouponUsage(data.couponCode);
  }

  await reserveStockForOrder(data.items);

  const id = `ORD-${Date.now().toString(36).toUpperCase()}`;
  const order: Order = {
    ...data,
    id,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  const supabase = createAdminClient();
  const { error } = await supabase.from("orders").insert(orderToRow(order));

  if (error) throw new Error(error.message);
  return order;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<Order | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? rowToOrder(data) : null;
}

export async function deleteOrder(id: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { error, count } = await supabase
    .from("orders")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) throw new Error(error.message);
  return (count ?? 0) > 0;
}
