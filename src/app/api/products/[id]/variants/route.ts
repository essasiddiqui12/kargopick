import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    const { data: variants, error: variantsError } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", id)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (variantsError) {
      return NextResponse.json({ error: "Failed to fetch variants" }, { status: 500 });
    }

    const mapped = (variants || []).map((v: any) => ({
      id: v.id,
      product_id: v.product_id,
      type: v.type || "other",
      value: v.value,
      priceAdjustment: Number(v.price_adjustment || 0),
      stock: Number(v.stock || 0),
      sku: v.sku,
      barcode: v.barcode,
      image: v.image,
      weight: v.weight,
      is_active: v.is_active,
      is_default: v.is_default,
      sort_order: v.sort_order,
    }));

    return NextResponse.json(mapped);
  } catch {
    return NextResponse.json({ error: "Failed to fetch variants" }, { status: 500 });
  }
}
