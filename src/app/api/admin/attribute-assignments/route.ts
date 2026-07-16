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
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("product_id");

    let query = supabase
      .from("product_attribute_assignments")
      .select("*")
      .order("sort_order", { ascending: true });

    if (productId) {
      query = query.eq("product_id", productId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch {
    return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authError = await requireAuth();
    if (authError) return authError;

    const body = await request.json();
    const { id, product_id, attribute_id, is_required = false, is_variant = true, sort_order = 0 } = body;

    if (!id || !product_id || !attribute_id) {
      return NextResponse.json(
        { error: "ID, product ID, and attribute ID are required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("product_attribute_assignments")
      .insert({
        id,
        product_id,
        attribute_id,
        is_required: Boolean(is_required),
        is_variant: Boolean(is_variant),
        sort_order: Number(sort_order) || 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to assign attribute" }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to assign attribute" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authError = await requireAuth();
    if (authError) return authError;

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Assignment ID is required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("product_attribute_assignments")
      .update({
        is_required: Boolean(updates.is_required),
        is_variant: Boolean(updates.is_variant),
        sort_order: Number(updates.sort_order) || 0,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to update assignment" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to update assignment" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authError = await requireAuth();
    if (authError) return authError;

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Assignment ID is required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("product_attribute_assignments")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: "Failed to delete assignment" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete assignment" }, { status: 500 });
  }
}
