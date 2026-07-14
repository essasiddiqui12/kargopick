import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("promotional_banners")
      .select("*")
      .eq("is_active", true);

    if (error) {
      console.error("Banners fetch error:", error);
      return NextResponse.json({ error: "Failed to fetch banners" }, { status: 500 });
    }

    const now = new Date().toISOString();
    const filtered = (data || []).filter((banner) => {
      if (banner.start_date && banner.start_date > now) return false;
      if (banner.end_date && banner.end_date < now) return false;
      return true;
    });

    filtered.sort((a, b) => a.sort_order - b.sort_order || new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json(filtered);
  } catch {
    return NextResponse.json({ error: "Failed to fetch banners" }, { status: 500 });
  }
}
