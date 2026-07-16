import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { createVariant, getVariantsByProductId } from "@/lib/products";
import { ProductVariant } from "@/types";

async function requireAuth() {
  const authed = await isAdminAuthenticated();
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}

export async function GET(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  const productId = request.nextUrl.searchParams.get("product_id");
  if (!productId) {
    return NextResponse.json({ error: "product_id is required" }, { status: 400 });
  }

  const variants = await getVariantsByProductId(productId);
  return NextResponse.json(variants);
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  const body = await request.json();
  const { productId, ...variantData } = body as Omit<ProductVariant, "id"> & { productId: string };

  if (!productId) {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }

  const variant = await createVariant({
    ...variantData,
    productId,
  });

  return NextResponse.json(variant, { status: 201 });
}
