import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";

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
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Reviews fetch error:", error);
      return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch {
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authError = await requireAuth();
    if (authError) return authError;

    const body = await request.json();
    const { id, is_approved } = body;

    if (!id || is_approved === undefined) {
      return NextResponse.json({ error: "Missing id or is_approved" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("reviews")
      .update({ is_approved: Boolean(is_approved) })
      .eq("id", Number(id));

    if (error) {
      console.error("Review update error:", error);
      return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authError = await requireAuth();
    if (authError) return authError;

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", Number(id));

    if (error) {
      console.error("Review delete error:", error);
      return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
