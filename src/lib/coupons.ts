import { createAdminClient } from "@/lib/supabase/server";
import { couponToRow, rowToCoupon } from "@/lib/supabase/mappers";
import { Coupon } from "@/types";

export async function getCoupons(): Promise<Coupon[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .order("id", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => rowToCoupon(row));
}

export async function getCouponByCode(
  code: string
): Promise<Coupon | undefined> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .ilike("code", code)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? rowToCoupon(data) : undefined;
}

export function calculateDiscount(coupon: Coupon, subtotal: number): number {
  if (coupon.type === "percentage") {
    return Math.round(subtotal * (coupon.value / 100));
  }
  return Math.min(coupon.value, subtotal);
}

export async function validateCoupon(
  code: string,
  subtotal: number
): Promise<
  | { valid: true; coupon: Coupon; discount: number }
  | { valid: false; error: string }
> {
  const coupon = await getCouponByCode(code);

  if (!coupon) {
    return { valid: false, error: "Invalid coupon code" };
  }

  if (!coupon.active) {
    return { valid: false, error: "This coupon is no longer active" };
  }

  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return { valid: false, error: "This coupon has expired" };
  }

  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, error: "This coupon has reached its usage limit" };
  }

  if (coupon.minOrder && subtotal < coupon.minOrder) {
    return {
      valid: false,
      error: `Minimum order of ₹${coupon.minOrder} required for this coupon`,
    };
  }

  const discount = calculateDiscount(coupon, subtotal);
  if (discount <= 0) {
    return { valid: false, error: "Coupon cannot be applied to this order" };
  }

  return { valid: true, coupon, discount };
}

export async function incrementCouponUsage(code: string): Promise<void> {
  const coupon = await getCouponByCode(code);
  if (!coupon) return;

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("coupons")
    .update({ used_count: coupon.usedCount + 1 })
    .eq("id", coupon.id);

  if (error) throw new Error(error.message);
}

export async function createCoupon(
  data: Omit<Coupon, "id" | "usedCount">
): Promise<Coupon> {
  const coupons = await getCoupons();
  const exists = coupons.some(
    (c) => c.code.toUpperCase() === data.code.toUpperCase()
  );
  if (exists) throw new Error("Coupon code already exists");

  const id = String(
    Math.max(0, ...coupons.map((c) => parseInt(c.id, 10) || 0)) + 1
  );
  const coupon: Coupon = {
    ...data,
    code: data.code.toUpperCase(),
    id,
    usedCount: 0,
  };

  const supabase = createAdminClient();
  const { error } = await supabase.from("coupons").insert(couponToRow(coupon));

  if (error) throw new Error(error.message);
  return coupon;
}

export async function updateCoupon(
  id: string,
  data: Partial<Omit<Coupon, "id" | "usedCount">>
): Promise<Coupon | null> {
  const coupons = await getCoupons();
  const existing = coupons.find((c) => c.id === id);
  if (!existing) return null;

  if (data.code) {
    const duplicate = coupons.some(
      (c) => c.id !== id && c.code.toUpperCase() === data.code!.toUpperCase()
    );
    if (duplicate) throw new Error("Coupon code already exists");
    data.code = data.code.toUpperCase();
  }

  const coupon: Coupon = { ...existing, ...data, id: existing.id };
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("coupons")
    .update(couponToRow(coupon))
    .eq("id", id);

  if (error) throw new Error(error.message);
  return coupon;
}

export async function deleteCoupon(id: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { error, count } = await supabase
    .from("coupons")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) throw new Error(error.message);
  return (count ?? 0) > 0;
}
