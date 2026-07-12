import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/orders";
import { OrderItem } from "@/types";

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

    const order = await createOrder({
      customerName,
      phone,
      address,
      items: items as OrderItem[],
      subtotal: subtotal ?? total,
      discount: discount || undefined,
      couponCode: couponCode || undefined,
      total,
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
