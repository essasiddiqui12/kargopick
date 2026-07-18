import Link from "next/link";
import OrderConfirmationClient from "@/components/OrderConfirmationClient";
import { getOrderById } from "@/lib/orders";
import { buildOrderAlertFromOrder, getWhatsAppUrl } from "@/lib/whatsapp";
import { BRAND_NAME } from "@/lib/brand";

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

  const adminNotifyUrl = getWhatsAppUrl(buildOrderAlertFromOrder(order as any));

  return <OrderConfirmationClient order={order} adminNotifyUrl={adminNotifyUrl} />;
}
