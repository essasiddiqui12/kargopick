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

    const { data: assignments, error: assignError } = await supabase
      .from("product_attribute_assignments")
      .select("*, product_attributes(*)")
      .eq("product_id", id)
      .order("sort_order", { ascending: true });

    if (assignError) {
      return NextResponse.json({ error: "Failed to fetch product attributes" }, { status: 500 });
    }

    const attributes = (assignments || [])
      .filter((a: any) => a.product_attributes?.is_active)
      .map((a: any) => ({
        ...a.product_attributes,
        assignment_id: a.id,
        is_required: a.is_required,
        is_variant: a.is_variant,
        assignment_sort_order: a.sort_order,
      }))
      .sort((a: any, b: any) => a.sort_order - b.sort_order);

    const attributesWithValues = await Promise.all(
      attributes.map(async (attr: any) => {
        const { data: values } = await supabase
          .from("product_attribute_values")
          .select("*")
          .eq("attribute_id", attr.id)
          .eq("is_active", true)
          .order("sort_order", { ascending: true });

        return {
          ...attr,
          attribute_values: values || [],
        };
      })
    );

    return NextResponse.json(attributesWithValues);
  } catch {
    return NextResponse.json({ error: "Failed to fetch product attributes" }, { status: 500 });
  }
}
