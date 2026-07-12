import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getOrders } from "@/lib/orders";

export async function GET() {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orders = await getOrders();
  return NextResponse.json(orders);
}
