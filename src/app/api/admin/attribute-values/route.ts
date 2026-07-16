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
      .from("product_attribute_values")
      .select("*")
      .order("attribute_id", { ascending: true })
      .order("sort_order", { ascending: true });

    if (error) {
      return NextResponse.json({ error: "Failed to fetch attribute values" }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch {
    return NextResponse.json({ error: "Failed to fetch attribute values" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authError = await requireAuth();
    if (authError) return authError;

    const body = await request.json();
    const { id, attribute_id, value, display_value, meta_data, sort_order = 0, is_active = true } = body;

    if (!id || !attribute_id || !value) {
      return NextResponse.json(
        { error: "ID, attribute ID, and value are required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("product_attribute_values")
      .insert({
        id,
        attribute_id,
        value,
        display_value: display_value || null,
        meta_data: meta_data || null,
        sort_order: Number(sort_order) || 0,
        is_active: Boolean(is_active),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to create attribute value" }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create attribute value" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authError = await requireAuth();
    if (authError) return authError;

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Attribute value ID is required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("product_attribute_values")
      .update({
        value: updates.value,
        display_value: updates.display_value || null,
        meta_data: updates.meta_data || null,
        sort_order: Number(updates.sort_order) || 0,
        is_active: Boolean(updates.is_active),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to update attribute value" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to update attribute value" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authError = await requireAuth();
    if (authError) return authError;

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Attribute value ID is required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("product_attribute_values")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: "Failed to delete attribute value" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete attribute value" }, { status: 500 });
  }
}
