import { getOrders } from "@/lib/orders";
import { formatPrice } from "@/data/products";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";
import DeleteOrderButton from "@/components/admin/DeleteOrderButton";
import OrderWhatsAppActions from "@/components/admin/OrderWhatsAppActions";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export default async function AdminOrdersPage() {
  const orders = await getOrders();
  const pending = orders.filter((o) => o.status === "pending").length;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3001");

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900">Orders</h1>
        <p className="text-sm text-surface-500 mt-1">
          {orders.length} total · {pending} pending · Status changes open WhatsApp to notify customers
        </p>
      </div>

      <div className="rounded-xl border border-surface-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-100 bg-surface-50 text-left">
                <th className="px-6 py-3 font-medium text-surface-500">Order</th>
                <th className="px-6 py-3 font-medium text-surface-500">Customer</th>
                <th className="px-6 py-3 font-medium text-surface-500">Items</th>
                <th className="px-6 py-3 font-medium text-surface-500">Total</th>
                <th className="px-6 py-3 font-medium text-surface-500">Status</th>
                <th className="px-6 py-3 font-medium text-surface-500">Date</th>
                <th className="px-6 py-3 font-medium text-surface-500 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-surface-100 hover:bg-surface-50 align-top"
                >
                  <td className="px-6 py-4">
                    <p className="font-semibold text-surface-900">{order.id}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-surface-900">
                      {order.customerName}
                    </p>
                    <p className="text-xs text-surface-500 mt-0.5">{order.phone}</p>
                    <p className="text-xs text-surface-400 mt-1 line-clamp-2 max-w-[200px]">
                      {order.address}
                    </p>
                  </td>
                   <td className="px-6 py-4">
                     <ul className="space-y-1 text-xs text-surface-600">
                       {order.items.map((item, i) => (
                         <li key={i}>
                           {item.name}
                           {item.variantName && <span className="text-surface-400"> — {item.variantName}</span>}
                           {" × "}{item.quantity}
                         </li>
                       ))}
                     </ul>
                     {order.notes && (
                       <p className="mt-2 text-xs text-surface-400 italic">
                         Note: {order.notes}
                       </p>
                     )}
                   </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-brand-600">
                      {formatPrice(order.total)}
                    </p>
                    {order.discount && order.discount > 0 && (
                      <p className="text-xs text-surface-400 mt-0.5">
                        -{formatPrice(order.discount)}
                        {order.couponCode && ` (${order.couponCode})`}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <OrderStatusSelect order={order} />
                  </td>
                  <td className="px-6 py-4 text-xs text-surface-500 whitespace-nowrap">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-end gap-2">
                      <OrderWhatsAppActions order={order} siteUrl={siteUrl} />
                      <DeleteOrderButton id={order.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {orders.length === 0 && (
            <div className="py-16 text-center text-surface-500">
              No orders yet. Orders will appear here when customers checkout.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
