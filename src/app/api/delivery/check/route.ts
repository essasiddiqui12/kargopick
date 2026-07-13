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

    let { data, error } = await supabase
      .from("delivery_zones")
      .select("*")
      .eq("is_active", true)
      .eq("pincode", pincode.trim())
      .limit(1);

    if (error) {
      console.error("Delivery check exact error:", error);
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      const prefix = pincode.trim() + "%";
      const result = await supabase
        .from("delivery_zones")
        .select("*")
        .eq("is_active", true)
        .like("pincode", prefix)
        .order("pincode", { ascending: true })
        .limit(5);

      if (result.error) {
        console.error("Delivery check prefix error:", result.error);
        throw new Error(result.error.message);
      }
      data = result.data;
    }

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
  } catch (err) {
    console.error("Delivery check failed:", err);
    return NextResponse.json(
      {
        error: "Failed to check delivery. Please try again.",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
