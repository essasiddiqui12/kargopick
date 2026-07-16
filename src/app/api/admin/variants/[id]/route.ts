import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { deleteVariant, getVariantsByProductId, updateVariant } from "@/lib/products";

async function requireAuth() {
  const authed = await isAdminAuthenticated();
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { id } = await params;
  const variants = await getVariantsByProductId(id);
  const variant = variants.find((v) => v.id === id);

  if (!variant) {
    return NextResponse.json({ error: "Variant not found" }, { status: 404 });
  }

  return NextResponse.json(variant);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { id } = await params;
  const body = await request.json();

  const updated = await updateVariant(id, body);
  if (!updated) {
    return NextResponse.json({ error: "Variant not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { id } = await params;
  const deleted = await deleteVariant(id);
  if (!deleted) {
    return NextResponse.json({ error: "Variant not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
