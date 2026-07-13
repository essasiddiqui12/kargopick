"use client";

import { useState, useEffect } from "react";
import ReviewForm from "@/components/ReviewForm";
import ReviewList from "@/components/ReviewList";

interface Review {
  id: number;
  customer_name: string;
  rating: number;
  review_text: string;
  created_at: string;
}

interface ProductReviewsProps {
  productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchReviews() {
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews?product_id=${encodeURIComponent(productId)}`);
      const data = await res.json();
      if (res.ok) {
        setReviews(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  return (
    <section className="mt-12 border-t border-surface-200 pt-12">
      <h2 className="text-2xl font-bold text-surface-900 mb-6">Customer Reviews</h2>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <ReviewForm productId={productId} onSuccess={fetchReviews} />
        </div>

        <div>
          {loading ? (
            <div className="rounded-xl border border-surface-200 bg-white p-6 text-center">
              <p className="text-sm text-surface-500">Loading reviews...</p>
            </div>
          ) : (
            <ReviewList reviews={reviews} />
          )}
        </div>
      </div>
    </section>
  );
}
