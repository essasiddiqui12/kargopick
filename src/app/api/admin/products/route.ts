import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { createProduct, getProducts } from "@/lib/products";
import { Product } from "@/types";

async function requireAuth() {
  const authed = await isAdminAuthenticated();
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}

export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;
  const products = await getProducts();
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  const body = await request.json();
  const product = await createProduct(body as Omit<Product, "id">);
  return NextResponse.json(product, { status: 201 });
}
