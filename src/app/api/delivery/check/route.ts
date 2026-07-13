import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pincode } = body;

    if (!pincode || typeof pincode !== "string" || pincode.trim().length < 3) {
      return NextResponse.json(
        { error: "Please enter a valid pincode" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc("match_pincode", {
      search: pincode.trim(),
    });

    if (error) throw new Error(error.message);

    if (!data || data.length === 0) {
      return NextResponse.json(
        { deliverable: false, message: "We don't deliver to this area yet." },
        { status: 200 }
      );
    }

    const match = data[0];
    const exact = match.pincode === pincode.trim();

    return NextResponse.json({
      deliverable: true,
      exact,
      city: match.city,
      state: match.state,
      zone: match.zone,
      deliveryDays: match.delivery_days,
      codAvailable: match.cod_available,
      message: exact
        ? `Delivery to ${match.city} in ${match.delivery_days} day${match.delivery_days > 1 ? "s" : ""}.`
        : `Did you mean ${match.city} (${match.pincode})? Delivery in ${match.delivery_days} day${match.delivery_days > 1 ? "s" : ""}.`,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to check delivery. Please try again." },
      { status: 500 }
    );
  }
}
