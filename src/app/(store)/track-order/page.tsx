import { PackageSearch } from "lucide-react";
import TrackOrderForm from "@/components/TrackOrderForm";

export const metadata = {
  title: "Track Order | Kartix",
  description: "Track your Kartix order status with your order ID and phone number.",
};

export default async function TrackOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string; phone?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
          <PackageSearch className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-bold text-surface-900">Track Your Order</h1>
        <p className="mt-2 text-surface-600 max-w-md mx-auto">
          Enter your order ID and phone number to see the latest status of your
          order.
        </p>
      </div>

      <TrackOrderForm
        initialOrderId={params.orderId ?? ""}
        initialPhone={params.phone ?? ""}
      />
    </div>
  );
}
