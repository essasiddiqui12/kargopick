"use client";

import { useState } from "react";
import { Tag, X, Loader2 } from "lucide-react";
import { AppliedCoupon } from "@/types";
import { formatPrice } from "@/data/products";

interface CouponInputProps {
  subtotal: number;
  applied: AppliedCoupon | null;
  onApply: (coupon: AppliedCoupon) => void;
  onRemove: () => void;
}

export default function CouponInput({
  subtotal,
  applied,
  onApply,
  onRemove,
}: CouponInputProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), subtotal }),
      });

      const data = await res.json();
      if (!data.valid) {
        setError(data.error || "Invalid coupon");
        return;
      }

      onApply({
        code: data.code,
        type: data.type,
        value: data.value,
        discount: data.discount,
      });
      setCode("");
    } catch {
      setError("Failed to apply coupon");
    } finally {
      setLoading(false);
    }
  }

  if (applied) {
    return (
      <div className="flex items-center justify-between rounded-lg bg-brand-50 border border-brand-200 px-3 py-2">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-brand-600" />
          <span className="text-sm font-medium text-brand-700">{applied.code}</span>
          <span className="text-sm text-brand-600">-{formatPrice(applied.discount)}</span>
        </div>
        <button
          onClick={onRemove}
          className="text-surface-400 hover:text-rose-500"
          aria-label="Remove coupon"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleApply} className="flex gap-2">
        <input
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError("");
          }}
          placeholder="Coupon code"
          className="flex-1 rounded-lg border border-surface-200 px-3 py-2 text-sm uppercase focus:border-brand-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="rounded-lg bg-surface-800 px-4 py-2 text-sm font-medium text-white hover:bg-surface-700 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
        </button>
      </form>
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}

function OrderTotals({
  subtotal,
  coupon,
}: {
  subtotal: number;
  coupon: AppliedCoupon | null;
}) {
  const discount = coupon?.discount ?? 0;
  const total = subtotal - discount;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm text-surface-600">
        <span>Subtotal</span>
        <span>{formatPrice(subtotal)}</span>
      </div>
      {coupon && (
        <div className="flex justify-between text-sm text-brand-600">
          <span>Discount ({coupon.code})</span>
          <span>-{formatPrice(coupon.discount)}</span>
        </div>
      )}
      <div className="flex justify-between font-bold text-brand-600 pt-1 border-t border-surface-200">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>
    </div>
  );
}

export { OrderTotals };
