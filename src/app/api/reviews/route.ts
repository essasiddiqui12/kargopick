import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const productId = request.nextUrl.searchParams.get("product_id");

    if (!productId) {
      return NextResponse.json(
        { error: "product_id is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .eq("is_approved", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Reviews fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch reviews" },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product_id, customer_name, rating, review_text } = body;

    if (!product_id || !customer_name || !rating || !review_text) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const parsedRating = parseInt(rating, 10);
    if (parsedRating < 1 || parsedRating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("reviews")
      .insert({
        product_id: String(product_id),
        customer_name: String(customer_name).trim(),
        rating: parsedRating,
        review_text: String(review_text).trim(),
      })
      .select()
      .single();

    if (error) {
      console.error("Review insert error:", error);
      return NextResponse.json(
        { error: "Failed to submit review" },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to submit review" },
      { status: 500 }
    );
  }
}
