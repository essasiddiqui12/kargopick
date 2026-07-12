import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { createCoupon, getCoupons } from "@/lib/coupons";
import { Coupon } from "@/types";

export async function GET() {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const coupons = await getCoupons();
  return NextResponse.json(coupons);
}

export async function POST(request: NextRequest) {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const coupon = await createCoupon(body as Omit<Coupon, "id" | "usedCount">);
    return NextResponse.json(coupon, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create coupon" },
      { status: 400 }
    );
  }
}
