import { Star } from "lucide-react";

interface Review {
  id: number;
  customer_name: string;
  rating: number;
  review_text: string;
  created_at: string;
}

interface ReviewListProps {
  reviews: Review[];
}

export default function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="rounded-xl border border-surface-200 bg-white p-6 text-center">
        <p className="text-sm text-surface-500">No reviews yet. Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="rounded-xl border border-surface-200 bg-white p-4 sm:p-5"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
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
            <span className="text-xs text-surface-400">
              {new Date(review.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          <p className="text-sm font-medium text-surface-900 mb-1">
            {review.customer_name}
          </p>
          <p className="text-sm text-surface-600 leading-relaxed">
            {review.review_text}
          </p>
        </div>
      ))}
    </div>
  );
}
