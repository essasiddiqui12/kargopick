"use client";

import { useState, useEffect, useCallback } from "react";
import { MapPin, Loader2, CheckCircle2, XCircle } from "lucide-react";

interface DeliveryInfo {
  available: boolean;
  city?: string;
  state?: string;
  zone?: string;
  deliveryDays?: number;
  codAvailable?: boolean;
  message?: string;
}

export default function PincodeCheck({
  onCheck,
  disabled,
}: {
  onCheck?: (result: DeliveryInfo) => void;
  disabled?: boolean;
}) {
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DeliveryInfo | null>(null);
  const [touched, setTouched] = useState(false);

  const checkPincode = useCallback(async (value: string) => {
    if (!/^\d{6}$/.test(value)) {
      setResult(null);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/delivery/check?pincode=${value}`);
      const data = await res.json();
      setResult(data);
      onCheck?.(data);
    } catch {
      setResult({ available: false, message: "Failed to check delivery" });
    } finally {
      setLoading(false);
    }
  }, [onCheck]);

  useEffect(() => {
    if (!touched) return;
    const timer = setTimeout(() => checkPincode(pincode), 600);
    return () => clearTimeout(timer);
  }, [pincode, touched, checkPincode]);

  function handleBlur() {
    setTouched(true);
    if (/^\d{6}$/.test(pincode)) {
      checkPincode(pincode);
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-surface-700 mb-1">
        Delivery Pincode
      </label>
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={pincode}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "").slice(0, 6);
            setPincode(val);
            setResult(null);
          }}
          onBlur={handleBlur}
          disabled={disabled || loading}
          placeholder="Enter 6-digit pincode"
          className="w-full rounded-lg border border-surface-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:opacity-50"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-surface-400" />
        )}
      </div>

      {result && result.available && (
        <div className="mt-3 rounded-lg bg-emerald-50 border border-emerald-200 p-3">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-emerald-800">
                Deliverable to {result.city}, {result.state}
              </p>
              <p className="text-emerald-700 mt-0.5">
                Delivery in {result.deliveryDays} day{result.deliveryDays !== 1 ? "s" : ""}
              </p>
              {result.codAvailable ? (
                <span className="inline-flex items-center gap-1 mt-1 text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  COD Available
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 mt-1 text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  Prepaid Only
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {result && !result.available && result.message && (
        <div className="mt-3 rounded-lg bg-rose-50 border border-rose-200 p-3">
          <div className="flex items-start gap-2">
            <XCircle className="h-4 w-4 text-rose-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-rose-700">{result.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
