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

    const variantsWithValues = await Promise.all(
      (variants || []).map(async (variant) => {
        const { data: valueLinks } = await supabase
          .from("product_variant_values")
          .select("product_attribute_values(*)")
          .eq("variant_id", variant.id);

        const attributeValues = (valueLinks || [])
          .map((link: any) => link.product_attribute_values)
          .filter(Boolean);

        return {
          id: variant.id,
          product_id: variant.product_id,
          sku: variant.sku,
          barcode: variant.barcode,
          price: variant.price,
          stock: variant.stock,
          weight: variant.weight,
          image: variant.image,
          is_active: variant.is_active,
          is_default: variant.is_default,
          sort_order: variant.sort_order,
          attribute_values: attributeValues,
        };
      })
    );

    return NextResponse.json(variantsWithValues);
  } catch {
    return NextResponse.json({ error: "Failed to fetch variants" }, { status: 500 });
  }
}
