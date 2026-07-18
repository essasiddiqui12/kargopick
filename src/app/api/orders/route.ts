import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/orders";
import { OrderItem } from "@/types";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerName,
      phone,
      address,
      items,
      subtotal,
      discount,
      couponCode,
      total,
      notes,
    } = body;

    if (!customerName || !phone || !address || !items?.length || !total) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const productIds = [...new Set(items.map((item: OrderItem) => item.productId))];
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("*")
      .in("id", productIds);

    if (productsError) throw new Error(productsError.message);

    const variantIds = items
      .filter((item: OrderItem) => item.variantId)
      .map((item: OrderItem) => item.variantId);
    const { data: variants, error: variantsError } = await supabase
      .from("product_variants")
      .select("*")
      .in("id", variantIds);

    if (variantsError) throw new Error(variantsError.message);

    const productMap = new Map((products ?? []).map((p) => [p.id, p]));
    const variantMap = new Map((variants ?? []).map((v) => [v.id, v]));

    const validatedItems: OrderItem[] = items.map((item: OrderItem) => {
      const product = productMap.get(item.productId);
      const variant = item.variantId ? variantMap.get(item.variantId) : undefined;
      const price = variant ? Number(variant.price) : Number(product?.price ?? 0);
      const quantity = Math.max(1, Math.floor(item.quantity ?? 1));
      return {
        productId: item.productId,
        name: item.name,
        price,
        quantity,
        variantId: item.variantId,
        variantName: item.variantName,
        sku: variant?.sku ?? item.sku,
      };
    });

    const computedSubtotal = validatedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const computedDiscount = Math.max(0, Math.min(discount ?? 0, computedSubtotal));
    const computedTotal = computedSubtotal - computedDiscount;

    const order = await createOrder({
      customerName,
      phone,
      address,
      items: validatedItems,
      subtotal: computedSubtotal,
      discount: computedDiscount || undefined,
      couponCode: couponCode || undefined,
      total: computedTotal,
      notes,
    });

    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create order" },
      { status: 400 }
    );
  }
}
