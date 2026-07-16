import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function requireAuth() {
  const authed = await isAdminAuthenticated();
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const authError = await requireAuth();
    if (authError) return authError;

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("product_variants")
      .select("*")
      .order("product_id", { ascending: true })
      .order("sort_order", { ascending: true });

    if (error) {
      return NextResponse.json({ error: "Failed to fetch variants" }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch {
    return NextResponse.json({ error: "Failed to fetch variants" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authError = await requireAuth();
    if (authError) return authError;

    const body = await request.json();
    const { id, product_id, sku, barcode, price, stock, weight, image, is_active = true, is_default = false, sort_order = 0 } = body;

    if (!id || !product_id) {
      return NextResponse.json(
        { error: "ID and product ID are required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("product_variants")
      .insert({
        id,
        product_id,
        sku: sku || null,
        barcode: barcode || null,
        price: price ? Number(price) : null,
        stock: Number(stock) || 0,
        weight: weight || null,
        image: image || null,
        is_active: Boolean(is_active),
        is_default: Boolean(is_default),
        sort_order: Number(sort_order) || 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to create variant" }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create variant" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authError = await requireAuth();
    if (authError) return authError;

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Variant ID is required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("product_variants")
      .update({
        sku: updates.sku || null,
        barcode: updates.barcode || null,
        price: updates.price ? Number(updates.price) : null,
        stock: Number(updates.stock) || 0,
        weight: updates.weight || null,
        image: updates.image || null,
        is_active: Boolean(updates.is_active),
        is_default: Boolean(updates.is_default),
        sort_order: Number(updates.sort_order) || 0,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to update variant" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to update variant" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authError = await requireAuth();
    if (authError) return authError;

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Variant ID is required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("product_variants")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: "Failed to delete variant" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete variant" }, { status: 500 });
  }
}
