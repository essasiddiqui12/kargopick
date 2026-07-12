import { OrderStatus } from "@/types";
import { Check, Circle, X } from "lucide-react";

const steps: { status: OrderStatus; label: string; description: string }[] = [
  {
    status: "pending",
    label: "Order Placed",
    description: "We received your order",
  },
  {
    status: "confirmed",
    label: "Confirmed",
    description: "Your order is being prepared",
  },
  {
    status: "shipped",
    label: "Shipped",
    description: "Your order is on the way",
  },
  {
    status: "delivered",
    label: "Delivered",
    description: "Order completed",
  },
];

const statusIndex: Record<OrderStatus, number> = {
  pending: 0,
  confirmed: 1,
  shipped: 2,
  delivered: 3,
  cancelled: -1,
};

export default function OrderStatusTimeline({
  status,
}: {
  status: OrderStatus;
}) {
  if (status === "cancelled") {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600">
          <X className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold text-rose-800">Order Cancelled</p>
          <p className="text-sm text-rose-600">
            This order was cancelled. Contact us on WhatsApp if you need help.
          </p>
        </div>
      </div>
    );
  }

  const currentIndex = statusIndex[status];

  return (
    <ol className="space-y-0">
      {steps.map((step, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isLast = index === steps.length - 1;

        return (
          <li key={step.status} className="relative flex gap-4">
            {!isLast && (
              <span
                className={`absolute left-[19px] top-10 h-[calc(100%-8px)] w-0.5 ${
                  isComplete ? "bg-brand-500" : "bg-surface-200"
                }`}
              />
            )}
            <div
              className={`relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                isComplete
                  ? "border-brand-500 bg-brand-500 text-white"
                  : isCurrent
                    ? "border-brand-500 bg-white text-brand-600"
                    : "border-surface-200 bg-white text-surface-300"
              }`}
            >
              {isComplete ? (
                <Check className="h-5 w-5" />
              ) : (
                <Circle className={`h-3 w-3 ${isCurrent ? "fill-brand-500" : ""}`} />
              )}
            </div>
            <div className={`pb-8 ${isLast ? "pb-0" : ""}`}>
              <p
                className={`font-semibold ${
                  isCurrent || isComplete
                    ? "text-surface-900"
                    : "text-surface-400"
                }`}
              >
                {step.label}
              </p>
              <p
                className={`text-sm mt-0.5 ${
                  isCurrent ? "text-brand-600" : "text-surface-500"
                }`}
              >
                {isCurrent ? step.description : step.description}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
