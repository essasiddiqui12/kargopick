import Link from "next/link";
import { CheckCircle, Package, MapPin, Phone, MessageCircle } from "lucide-react";
import { getOrderById } from "@/lib/orders";
import { formatPrice } from "@/data/products";
import { buildEnquiryMessage, getWhatsAppUrl } from "@/lib/whatsapp";
import { BRAND_NAME } from "@/lib/brand";
import OrderStatusTimeline from "@/components/OrderStatusTimeline";

export const metadata = {
  title: `Order Confirmation | ${BRAND_NAME}`,
  description: `Your ${BRAND_NAME} order has been placed successfully.`,
};

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-surface-900">Order not found</h1>
        <p className="mt-2 text-surface-500">
          We couldn&apos;t find that order. Please check the ID and try again.
        </p>
        <Link
          href="/track-order"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 font-semibold text-white hover:bg-brand-600"
        >
          Track Order
        </Link>
      </div>
    );
  }

  const whatsappMessage = `${buildEnquiryMessage()}\n\nMy order ID: ${order.id}`;
  const whatsappUrl = getWhatsAppUrl(whatsappMessage);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold text-surface-900">Order Placed!</h1>
        <p className="mt-2 text-surface-600">
          Thank you, <span className="font-semibold">{order.customerName}</span>!
          Your order has been received.
        </p>
        <p className="mt-1 text-sm text-surface-500">
          Order ID: <span className="font-semibold text-brand-600">{order.id}</span>
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-brand-500" />
              Order Items
            </h2>
            <ul className="space-y-3">
              {order.items.map((item, i) => (
                <li
                  key={i}
                  className="flex justify-between text-sm border-b border-surface-100 pb-3 last:border-0 last:pb-0"
                >
                  <span className="text-surface-700">
                    {item.name}
                    {item.variantName && <span className="text-surface-400"> — {item.variantName}</span>}
                    {" × "}{item.quantity}
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
            <h2 className="text-lg font-semibold text-surface-900 mb-4">
              Delivery Details
            </h2>
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
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-surface-900 mb-4">
              Order Status
            </h2>
            <OrderStatusTimeline status={order.status} />
            <p className="mt-4 text-xs text-surface-500">
              Placed on {new Date(order.createdAt).toLocaleString("en-IN")}
            </p>
          </div>

          <div className="rounded-2xl border border-brand-200 bg-brand-50 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-surface-900 mb-2">
              Need help?
            </h2>
            <p className="text-sm text-surface-600 mb-4">
              Questions about your order? Chat with us on WhatsApp.
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#20bd5a]"
            >
              <MessageCircle className="h-4 w-4" />
              Chat on WhatsApp
            </a>
          </div>

          <div className="flex flex-col gap-2">
            <Link
              href={`/track-order?orderId=${encodeURIComponent(order.id)}&phone=${encodeURIComponent(order.phone)}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-surface-200 bg-white px-5 py-2.5 text-sm font-semibold text-surface-700 hover:bg-surface-50"
            >
              Track Order
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
