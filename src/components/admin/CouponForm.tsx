"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Coupon, CouponType } from "@/types";
import { Loader2 } from "lucide-react";

interface CouponFormProps {
  initialData?: Coupon;
  isEdit?: boolean;
}

const emptyForm = {
  code: "",
  type: "percentage" as CouponType,
  value: "",
  minOrder: "",
  maxUses: "",
  expiresAt: "",
  active: true,
  description: "",
};

export default function CouponForm({ initialData, isEdit }: CouponFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState(() => {
    if (!initialData) return emptyForm;
    return {
      code: initialData.code,
      type: initialData.type,
      value: String(initialData.value),
      minOrder: initialData.minOrder ? String(initialData.minOrder) : "",
      maxUses: initialData.maxUses ? String(initialData.maxUses) : "",
      expiresAt: initialData.expiresAt
        ? initialData.expiresAt.split("T")[0]
        : "",
      active: initialData.active,
      description: initialData.description || "",
    };
  });

  function update(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      code: form.code.toUpperCase(),
      type: form.type,
      value: parseFloat(form.value),
      minOrder: form.minOrder ? parseFloat(form.minOrder) : undefined,
      maxUses: form.maxUses ? parseInt(form.maxUses, 10) : undefined,
      expiresAt: form.expiresAt
        ? new Date(form.expiresAt).toISOString()
        : undefined,
      active: form.active,
      description: form.description || undefined,
    };

    try {
      const url = isEdit
        ? `/api/admin/coupons/${initialData!.id}`
        : "/api/admin/coupons";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save coupon");

      router.push("/admin/coupons");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100";
  const labelClass = "block text-sm font-medium text-surface-700 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Coupon Code *</label>
          <input
            required
            className={`${inputClass} uppercase`}
            value={form.code}
            onChange={(e) => update("code", e.target.value.toUpperCase())}
            placeholder="WELCOME10"
            disabled={isEdit}
          />
        </div>

        <div>
          <label className={labelClass}>Discount Type *</label>
          <select
            className={inputClass}
            value={form.type}
            onChange={(e) => update("type", e.target.value)}
          >
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed Amount (₹)</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>
            Value * {form.type === "percentage" ? "(%)" : "(₹)"}
          </label>
          <input
            required
            type="number"
            min="1"
            max={form.type === "percentage" ? "100" : undefined}
            className={inputClass}
            value={form.value}
            onChange={(e) => update("value", e.target.value)}
          />
        </div>

        <div>
          <label className={labelClass}>Minimum Order (₹)</label>
          <input
            type="number"
            min="0"
            className={inputClass}
            value={form.minOrder}
            onChange={(e) => update("minOrder", e.target.value)}
            placeholder="Optional"
          />
        </div>

        <div>
          <label className={labelClass}>Max Uses</label>
          <input
            type="number"
            min="1"
            className={inputClass}
            value={form.maxUses}
            onChange={(e) => update("maxUses", e.target.value)}
            placeholder="Unlimited if empty"
          />
        </div>

        <div>
          <label className={labelClass}>Expiry Date</label>
          <input
            type="date"
            className={inputClass}
            value={form.expiresAt}
            onChange={(e) => update("expiresAt", e.target.value)}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Description</label>
          <input
            className={inputClass}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Shown to customers when applied"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => update("active", e.target.checked)}
              className="h-4 w-4 rounded border-surface-300 text-brand-500"
            />
            <span className="text-sm font-medium text-surface-700">Active</span>
          </label>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEdit ? "Update Coupon" : "Create Coupon"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/coupons")}
          className="rounded-lg border border-surface-200 px-6 py-2.5 text-sm font-medium text-surface-600 hover:bg-surface-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
