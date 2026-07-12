"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2, Package, MapPin, Phone } from "lucide-react";
import { Order } from "@/types";
import { formatPrice } from "@/data/products";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";
import OrderStatusTimeline from "@/components/OrderStatusTimeline";
import { buildEnquiryMessage, getWhatsAppUrl } from "@/lib/whatsapp";

interface TrackOrderFormProps {
  initialOrderId?: string;
  initialPhone?: string;
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export default function TrackOrderForm({
  initialOrderId = "",
  initialPhone = "",
}: TrackOrderFormProps) {
  const [orderId, setOrderId] = useState(initialOrderId);
  const [phone, setPhone] = useState(initialPhone);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const autoTracked = useRef(false);

  async function track(orderIdValue: string, phoneValue: string) {
    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderIdValue, phone: phoneValue }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order not found");

      setOrder(data as Order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialOrderId && initialPhone && !autoTracked.current) {
      autoTracked.current = true;
      track(initialOrderId, initialPhone);
    }
  }, [initialOrderId, initialPhone]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await track(orderId, phone);
  }

  const inputClass =
    "w-full rounded-xl border border-surface-200 bg-white px-4 py-3 text-sm text-surface-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100";

  return (
    <div className="mx-auto max-w-2xl">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-surface-700 mb-1.5">
              Order ID
            </label>
            <input
              required
              className={inputClass}
              value={orderId}
              onChange={(e) => setOrderId(e.target.value.toUpperCase())}
              placeholder="ORD-XXXXXXXX"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-surface-700 mb-1.5">
              Phone Number
            </label>
            <input
              required
              type="tel"
              className={inputClass}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="9876543210"
            />
            <p className="mt-1.5 text-xs text-surface-500">
              Use the same phone number you entered at checkout
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3.5 font-semibold text-white hover:bg-brand-600 disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Search className="h-5 w-5" />
          )}
          Track Order
        </button>
      </form>

      {order && (
        <div className="mt-8 space-y-6">
          <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-sm text-surface-500">Order ID</p>
                <p className="text-xl font-bold text-surface-900">{order.id}</p>
                <p className="text-sm text-surface-500 mt-1">
                  Placed on {formatDate(order.createdAt)}
                </p>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>

            <OrderStatusTimeline status={order.status} />
          </div>

          <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-surface-900 mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-brand-500" />
              Order Items
            </h3>
            <ul className="space-y-3">
              {order.items.map((item, i) => (
                <li
                  key={i}
                  className="flex justify-between text-sm border-b border-surface-100 pb-3 last:border-0 last:pb-0"
                >
                  <span className="text-surface-700">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-medium text-surface-900">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t border-surface-100 space-y-1 text-sm">
              {order.subtotal != null && order.subtotal !== order.total && (
                <div className="flex justify-between text-surface-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
              )}
              {order.discount && order.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>
                    Discount{order.couponCode ? ` (${order.couponCode})` : ""}
                  </span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-surface-900 text-base pt-1">
                <span>Total</span>
                <span className="text-brand-600">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-surface-900 mb-3">
              Delivery Details
            </h3>
            <p className="text-sm font-medium text-surface-900">
              {order.customerName}
            </p>
            <p className="text-sm text-surface-600 mt-2 flex items-start gap-2">
              <Phone className="h-4 w-4 text-brand-500 mt-0.5 flex-shrink-0" />
              {order.phone}
            </p>
            <p className="text-sm text-surface-600 mt-2 flex items-start gap-2">
              <MapPin className="h-4 w-4 text-brand-500 mt-0.5 flex-shrink-0" />
              {order.address}
            </p>
            {order.notes && (
              <p className="mt-3 text-sm text-surface-500 italic">
                Note: {order.notes}
              </p>
            )}
          </div>

          <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 text-center">
            <p className="text-sm text-surface-700">
              Questions about your order?
            </p>
            <a
              href={getWhatsAppUrl(
                `${buildEnquiryMessage()}\n\nMy order ID: ${order.id}`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-800"
            >
              Chat with us on WhatsApp
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
