import { NextRequest, NextResponse } from "next/server";
import { trackOrder } from "@/lib/orders";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, phone } = body;

    if (!orderId || !phone) {
      return NextResponse.json(
        { error: "Order ID and phone number are required" },
        { status: 400 }
      );
    }

    const order = await trackOrder(orderId, phone);
    if (!order) {
      return NextResponse.json(
        { error: "Order not found. Check your order ID and phone number." },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch {
    return NextResponse.json(
      { error: "Failed to track order" },
      { status: 500 }
    );
  }
}
