"use client";

import { useState } from "react";
import { MapPin, Loader2, CheckCircle2, XCircle } from "lucide-react";

interface DeliveryResult {
  deliverable: boolean;
  exact: boolean;
  city?: string;
  state?: string;
  zone?: string;
  deliveryDays?: number;
  codAvailable?: boolean;
  message: string;
}

interface PincodeCheckerProps {
  onCheck?: (result: DeliveryResult) => void;
  className?: string;
}

export default function PincodeChecker({ onCheck, className = "" }: PincodeCheckerProps) {
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DeliveryResult | null>(null);
  const [error, setError] = useState("");

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!pincode || pincode.trim().length < 3) {
      setError("Please enter a valid pincode");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/delivery/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pincode: pincode.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to check delivery");

      setResult(data);
      onCheck?.(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`rounded-xl border border-surface-200 bg-white p-4 sm:p-5 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="h-5 w-5 text-brand-500" />
        <h3 className="font-semibold text-surface-900">Check Delivery</h3>
      </div>

      <form onSubmit={handleCheck} className="flex gap-2">
        <input
          type="text"
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="Enter pincode"
          maxLength={6}
          className="flex-1 rounded-lg border border-surface-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check"}
        </button>
      </form>

      {error && (
        <p className="mt-3 text-sm text-rose-600">{error}</p>
      )}

      {result && (
        <div className="mt-4 rounded-lg border border-surface-100 bg-surface-50 p-4">
          <div className="flex items-start gap-2">
            {result.deliverable ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            ) : (
              <XCircle className="h-5 w-5 text-rose-600 mt-0.5 flex-shrink-0" />
            )}
            <div className="min-w-0">
              <p className={`text-sm font-medium ${result.deliverable ? "text-emerald-700" : "text-rose-700"}`}>
                {result.message}
              </p>
              {result.deliverable && (
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-surface-600">
                  {result.city && result.state && (
                    <span className="rounded-full bg-white px-2.5 py-1 border border-surface-200">
                      {result.city}, {result.state}
                    </span>
                  )}
                  {result.deliveryDays != null && (
                    <span className="rounded-full bg-white px-2.5 py-1 border border-surface-200">
                      {result.deliveryDays} day{result.deliveryDays > 1 ? "s" : ""}
                    </span>
                  )}
                  {result.codAvailable != null && (
                    <span className={`rounded-full px-2.5 py-1 border ${result.codAvailable ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"}`}>
                      {result.codAvailable ? "COD Available" : "COD Not Available"}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
