"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { X, Bell } from "lucide-react";
import { Order } from "@/types";
import { formatPrice } from "@/data/products";
import {
  buildOrderAlertFromOrder,
  getWhatsAppUrl,
  getWhatsAppUrlForPhone,
  buildCustomerReplyMessage,
} from "@/lib/whatsapp";
import { BRAND_NAME, SEEN_ORDERS_KEY } from "@/lib/brand";

const POLL_INTERVAL_MS = 20_000;

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function loadSeenOrderIds(): Set<string> {
  try {
    const raw = sessionStorage.getItem(SEEN_ORDERS_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveSeenOrderIds(ids: Set<string>) {
  sessionStorage.setItem(SEEN_ORDERS_KEY, JSON.stringify([...ids]));
}

function notifyOrder(order: Order) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") {
    return;
  }

  new Notification(`New ${BRAND_NAME} Order`, {
    body: `${order.id} — ${order.customerName} — ${formatPrice(order.total)}`,
    tag: order.id,
  });
}

export default function NewOrderNotifier() {
  const [alerts, setAlerts] = useState<Order[]>([]);
  const seenIds = useRef<Set<string>>(new Set());
  const initialized = useRef(false);

  useEffect(() => {
    seenIds.current = loadSeenOrderIds();

    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission();
    }

    async function checkOrders() {
      try {
        const res = await fetch("/api/admin/orders");
        if (!res.ok) return;

        const orders = (await res.json()) as Order[];
        const pending = orders.filter((o) => o.status === "pending");

        if (!initialized.current) {
          pending.forEach((o) => seenIds.current.add(o.id));
          saveSeenOrderIds(seenIds.current);
          initialized.current = true;
          return;
        }

        const newOrders = pending.filter((o) => !seenIds.current.has(o.id));
        if (newOrders.length === 0) return;

        newOrders.forEach((order) => {
          seenIds.current.add(order.id);
          notifyOrder(order);
        });
        saveSeenOrderIds(seenIds.current);

        setAlerts((prev) => [...newOrders, ...prev].slice(0, 5));
      } catch {
        // ignore polling errors
      }
    }

    checkOrders();
    const interval = setInterval(checkOrders, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  function dismiss(orderId: string) {
    setAlerts((prev) => prev.filter((o) => o.id !== orderId));
  }

  if (alerts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex w-full max-w-sm flex-col gap-3">
      {alerts.map((order) => (
        <div
          key={order.id}
          className="rounded-xl border border-brand-200 bg-white p-4 shadow-xl shadow-brand-500/10"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <Bell className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-surface-900">New order received</p>
                <p className="text-sm text-surface-600 mt-0.5 truncate">
                  {order.customerName} · {formatPrice(order.total)}
                </p>
                <p className="text-xs text-brand-600 mt-1">{order.id}</p>
              </div>
            </div>
            <button
              onClick={() => dismiss(order.id)}
              className="text-surface-400 hover:text-surface-600"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={getWhatsAppUrl(buildOrderAlertFromOrder(order))}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#20bd5a]"
            >
              <WhatsAppIcon className="h-3.5 w-3.5" />
              View on WhatsApp
            </a>
            <a
              href={getWhatsAppUrlForPhone(
                order.phone,
                buildCustomerReplyMessage(order)
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#25D366]/30 bg-[#25D366]/10 px-3 py-1.5 text-xs font-semibold text-[#128C7E] hover:bg-[#25D366]/20"
            >
              Reply to customer
            </a>
            <Link
              href="/admin/orders"
              className="inline-flex items-center rounded-lg border border-surface-200 px-3 py-1.5 text-xs font-medium text-surface-600 hover:bg-surface-50"
            >
              View orders
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
