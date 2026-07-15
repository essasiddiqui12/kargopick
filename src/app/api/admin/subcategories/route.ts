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
      .from("subcategories")
      .select("*")
      .order("parent_category", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      return NextResponse.json({ error: "Failed to fetch subcategories" }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch {
    return NextResponse.json({ error: "Failed to fetch subcategories" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authError = await requireAuth();
    if (authError) return authError;

    const body = await request.json();
    const {
      id,
      name,
      description = "",
      parent_category,
      icon = "📦",
      image_url,
      sort_order = 0,
      is_active = true,
    } = body;

    if (!id || !name || !parent_category) {
      return NextResponse.json(
        { error: "ID, name, and parent category are required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("subcategories")
      .insert({
        id,
        name,
        description,
        parent_category,
        icon,
        image_url: image_url || null,
        sort_order: Number(sort_order) || 0,
        is_active: Boolean(is_active),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to create subcategory" }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create subcategory" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authError = await requireAuth();
    if (authError) return authError;

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Subcategory ID is required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("subcategories")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to update subcategory" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to update subcategory" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authError = await requireAuth();
    if (authError) return authError;

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Subcategory ID is required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("subcategories")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: "Failed to delete subcategory" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete subcategory" }, { status: 500 });
  }
}
