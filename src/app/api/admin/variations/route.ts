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
      .from("product_variations")
      .select("*")
      .order("product_id", { ascending: true })
      .order("sort_order", { ascending: true });

    if (error) {
      return NextResponse.json({ error: "Failed to fetch variations" }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch {
    return NextResponse.json({ error: "Failed to fetch variations" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authError = await requireAuth();
    if (authError) return authError;

    const body = await request.json();
    const {
      id,
      productId,
      type,
      value,
      priceAdjustment = 0,
      image,
      sku,
      stock = 0,
      isDefault = false,
      sortOrder = 0,
      isActive = true,
    } = body;

    if (!id || !productId || !type || !value) {
      return NextResponse.json(
        { error: "ID, product ID, type, and value are required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("product_variations")
      .insert({
        id,
        product_id: productId,
        type,
        value,
        price_adjustment: Number(priceAdjustment) || 0,
        image: image || null,
        sku: sku || null,
        stock: Number(stock) || 0,
        is_default: Boolean(isDefault),
        sort_order: Number(sortOrder) || 0,
        is_active: Boolean(isActive),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to create variation" }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create variation" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authError = await requireAuth();
    if (authError) return authError;

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Variation ID is required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("product_variations")
      .update({
        type: updates.type,
        value: updates.value,
        price_adjustment: Number(updates.priceAdjustment) || 0,
        image: updates.image || null,
        sku: updates.sku || null,
        stock: Number(updates.stock) || 0,
        is_default: Boolean(updates.isDefault),
        sort_order: Number(updates.sortOrder) || 0,
        is_active: Boolean(updates.isActive),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to update variation" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to update variation" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authError = await requireAuth();
    if (authError) return authError;

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Variation ID is required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("product_variations")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: "Failed to delete variation" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete variation" }, { status: 500 });
  }
}
