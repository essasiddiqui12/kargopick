import { NextRequest, NextResponse } from "next/server";
import { validateCoupon } from "@/lib/coupons";

export async function POST(request: NextRequest) {
  try {
    const { code, subtotal } = await request.json();

    if (!code || !subtotal) {
      return NextResponse.json(
        { error: "Code and subtotal are required" },
        { status: 400 }
      );
    }

    const result = await validateCoupon(code, subtotal);

    if (!result.valid) {
      return NextResponse.json({ valid: false, error: result.error });
    }

    return NextResponse.json({
      valid: true,
      code: result.coupon.code,
      type: result.coupon.type,
      value: result.coupon.value,
      discount: result.discount,
      description: result.coupon.description,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to validate coupon" },
      { status: 500 }
    );
  }
}
