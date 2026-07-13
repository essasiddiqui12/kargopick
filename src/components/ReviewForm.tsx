"use client";

import { useState } from "react";
import { Star, Loader2 } from "lucide-react";

interface ReviewFormProps {
  productId: string;
  onSuccess?: () => void;
}

export default function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!name.trim() || !text.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          customer_name: name.trim(),
          rating,
          review_text: text.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit review");

      setSuccess(true);
      setName("");
      setRating(5);
      setText("");
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-surface-200 bg-white p-4 sm:p-6">
      <h3 className="text-lg font-semibold text-surface-900 mb-4">Write a Review</h3>

      {error && (
        <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
          Thank you! Your review has been submitted and will be published after moderation.
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1">Your Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full rounded-lg border border-surface-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1">Rating</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="transition-colors"
              >
                <Star
                  className={`h-6 w-6 ${
                    star <= rating
                      ? "fill-amber-400 text-amber-400"
                      : "text-surface-300"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1">Review</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your experience with this product..."
            rows={4}
            className="w-full rounded-lg border border-surface-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </span>
          ) : (
            "Submit Review"
          )}
        </button>
      </div>
    </form>
  );
}
