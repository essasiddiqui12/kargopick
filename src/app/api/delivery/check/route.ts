import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const pincode = request.nextUrl.searchParams.get("pincode");
  if (!pincode || !/^\d{6}$/.test(pincode)) {
    return NextResponse.json(
      { error: "Please enter a valid 6-digit pincode" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("delivery_zones")
    .select("*")
    .eq("pincode", pincode)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "Failed to check delivery" },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json({
      available: false,
      message: "Delivery not available for this pincode",
    });
  }

  return NextResponse.json({
    available: true,
    city: data.city,
    state: data.state,
    zone: data.zone,
    deliveryDays: data.delivery_days,
    codAvailable: data.cod_available,
  });
}
