import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("promotional_banners")
      .select("*")
      .eq("is_active", true)
      .gte("start_date", new Date().toISOString())
      .or(`end_date.is.null,end_date.gte.${new Date().toISOString()}`)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Banners fetch error:", error);
      return NextResponse.json({ error: "Failed to fetch banners" }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch {
    return NextResponse.json({ error: "Failed to fetch banners" }, { status: 500 });
  }
}
