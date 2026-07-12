"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Order, OrderStatus } from "@/types";
import {
  buildOrderStatusUpdateMessage,
  getWhatsAppUrlForPhone,
  shouldNotifyCustomerOnStatus,
} from "@/lib/whatsapp";

const statusOptions: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export default function OrderStatusSelect({ order }: { order: Order }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");

  async function handleChange(status: OrderStatus) {
    if (status === order.status) return;

    setLoading(true);
    setNotice("");
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      router.refresh();

      if (shouldNotifyCustomerOnStatus(status)) {
        const message = buildOrderStatusUpdateMessage(
          { ...order, status },
          status,
          window.location.origin
        );
        const url = getWhatsAppUrlForPhone(order.phone, message);
        window.open(url, "_blank", "noopener,noreferrer");
        setNotice("WhatsApp opened — tap Send to notify customer");
      }
    } catch {
      setNotice("Failed to update order status");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-1">
      <div className="relative">
        {loading && (
          <Loader2 className="absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-surface-400" />
        )}
        <select
          value={order.status}
          onChange={(e) => handleChange(e.target.value as OrderStatus)}
          disabled={loading}
          className="rounded-lg border border-surface-200 bg-white px-3 py-1.5 text-xs font-medium capitalize focus:border-brand-400 focus:outline-none disabled:opacity-50"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {notice && (
        <p className="text-[10px] leading-snug text-brand-600 max-w-[140px]">
          {notice}
        </p>
      )}
    </div>
  );
}
