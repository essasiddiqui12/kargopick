"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Star, CheckCircle2, XCircle, Trash2, Loader2 } from "lucide-react";

interface Review {
  id: number;
  product_id: string;
  customer_name: string;
  rating: number;
  review_text: string;
  is_approved: boolean;
  created_at: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const router = useRouter();

  async function fetchReviews() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reviews");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      setReviews(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  async function updateReview(id: number, is_approved: boolean) {
    setActionLoading(id);
    try {
      await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_approved }),
      });
      fetchReviews();
    } catch {
      // silently fail
    } finally {
      setActionLoading(null);
    }
  }

  async function deleteReview(id: number) {
    if (!confirm("Delete this review permanently?")) return;
    setActionLoading(id);
    try {
      await fetch("/api/admin/reviews", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      fetchReviews();
    } catch {
      // silently fail
    } finally {
      setActionLoading(null);
    }
  }

  useEffect(() => {
    fetchReviews();
  }, []);

  const pendingCount = reviews.filter(r => !r.is_approved).length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-surface-900">Reviews</h1>
          <p className="mt-1 text-sm text-surface-500">
            {pendingCount > 0 ? `${pendingCount} pending review${pendingCount !== 1 ? 's' : ''} awaiting approval` : 'No pending reviews'}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl border border-surface-200 bg-white p-12 text-center">
          <p className="text-surface-500">No reviews yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className={`rounded-2xl border p-5 sm:p-6 ${
                review.is_approved
                  ? "border-surface-200 bg-white"
                  : "border-amber-200 bg-amber-50/50"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-semibold text-surface-900">{review.customer_name}</span>
                    <span className="text-xs text-surface-400">·</span>
                    <span className="text-xs text-surface-500">Product ID: {review.product_id}</span>
                    <span className="text-xs text-surface-400">·</span>
                    <span className="text-xs text-surface-500">
                      {new Date(review.created_at).toLocaleDateString("en-IN")}
                    </span>
                    {!review.is_approved && (
                      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                        Pending
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-0.5 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= review.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-surface-300"
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-sm text-surface-700 leading-relaxed">{review.review_text}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {!review.is_approved ? (
                    <button
                      onClick={() => updateReview(review.id, true)}
                      disabled={actionLoading === review.id}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {actionLoading === review.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      Approve
                    </button>
                  ) : (
                    <button
                      onClick={() => updateReview(review.id, false)}
                      disabled={actionLoading === review.id}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 disabled:opacity-50"
                    >
                      {actionLoading === review.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      Unapprove
                    </button>
                  )}
                  <button
                    onClick={() => deleteReview(review.id)}
                    disabled={actionLoading === review.id}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                  >
                    {actionLoading === review.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
