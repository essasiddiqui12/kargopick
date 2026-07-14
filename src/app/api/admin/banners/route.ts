import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function requireAuth() {
  const authed = await isAdminAuthenticated();
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}

export async function GET() {
  try {
    const authError = await requireAuth();
    if (authError) return authError;

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("promotional_banners")
      .select("*")
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

export async function POST(request: NextRequest) {
  try {
    const authError = await requireAuth();
    if (authError) return authError;

    const body = await request.json();
    const {
      title,
      subtitle,
      cta_text,
      cta_url,
      image_url,
      sort_order = 0,
      is_active = true,
      start_date,
      end_date,
    } = body;

    if (!title || !cta_url || !image_url) {
      return NextResponse.json(
        { error: "Title, CTA URL, and image are required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("promotional_banners")
      .insert({
        title,
        subtitle: subtitle || null,
        cta_text: cta_text || null,
        cta_url,
        desktop_image: image_url,
        mobile_image: image_url,
        sort_order: Number(sort_order) || 0,
        is_active: Boolean(is_active),
        start_date: start_date || null,
        end_date: end_date || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Banner insert error:", error);
      return NextResponse.json({ error: "Failed to create banner" }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create banner" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authError = await requireAuth();
    if (authError) return authError;

    const body = await request.json();
    const { id, image_url, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Banner ID is required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const updateData: Record<string, unknown> = { ...updates };

    if (image_url) {
      updateData.desktop_image = image_url;
      updateData.mobile_image = image_url;
    }

    const { data, error } = await supabase
      .from("promotional_banners")
      .update(updateData)
      .eq("id", Number(id))
      .select()
      .single();

    if (error) {
      console.error("Banner update error:", error);
      return NextResponse.json({ error: "Failed to update banner" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to update banner" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authError = await requireAuth();
    if (authError) return authError;

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Banner ID is required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("promotional_banners")
      .delete()
      .eq("id", Number(id));

    if (error) {
      console.error("Banner delete error:", error);
      return NextResponse.json({ error: "Failed to delete banner" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete banner" }, { status: 500 });
  }
}
