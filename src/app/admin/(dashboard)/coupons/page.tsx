import Link from "next/link";
import { Plus, Tag } from "lucide-react";
import { getCoupons } from "@/lib/coupons";
import DeleteCouponButton from "@/components/admin/DeleteCouponButton";

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(
    new Date(iso)
  );
}

export default async function AdminCouponsPage() {
  const coupons = await getCoupons();
  const active = coupons.filter((c) => c.active).length;

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Coupons</h1>
          <p className="text-sm text-surface-500 mt-1">
            {coupons.length} total · {active} active
          </p>
        </div>
        <Link
          href="/admin/coupons/new"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
        >
          <Plus className="h-4 w-4" />
          Create Coupon
        </Link>
      </div>

      <div className="rounded-xl border border-surface-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-100 bg-surface-50 text-left">
                <th className="px-6 py-3 font-medium text-surface-500">Code</th>
                <th className="px-6 py-3 font-medium text-surface-500">Discount</th>
                <th className="px-6 py-3 font-medium text-surface-500">Min Order</th>
                <th className="px-6 py-3 font-medium text-surface-500">Usage</th>
                <th className="px-6 py-3 font-medium text-surface-500">Expires</th>
                <th className="px-6 py-3 font-medium text-surface-500">Status</th>
                <th className="px-6 py-3 font-medium text-surface-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr
                  key={coupon.id}
                  className="border-b border-surface-100 hover:bg-surface-50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-brand-500" />
                      <span className="font-semibold text-surface-900">
                        {coupon.code}
                      </span>
                    </div>
                    {coupon.description && (
                      <p className="text-xs text-surface-400 mt-0.5">
                        {coupon.description}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-surface-900">
                    {coupon.type === "percentage"
                      ? `${coupon.value}%`
                      : `₹${coupon.value}`}
                  </td>
                  <td className="px-6 py-4 text-surface-600">
                    {coupon.minOrder ? `₹${coupon.minOrder}` : "—"}
                  </td>
                  <td className="px-6 py-4 text-surface-600">
                    {coupon.usedCount}
                    {coupon.maxUses ? ` / ${coupon.maxUses}` : ""}
                  </td>
                  <td className="px-6 py-4 text-surface-600 whitespace-nowrap">
                    {formatDate(coupon.expiresAt)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        coupon.active
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-surface-100 text-surface-500"
                      }`}
                    >
                      {coupon.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/coupons/${coupon.id}/edit`}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-50"
                      >
                        Edit
                      </Link>
                      <DeleteCouponButton id={coupon.id} code={coupon.code} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {coupons.length === 0 && (
            <div className="py-16 text-center text-surface-500">
              No coupons yet.{" "}
              <Link href="/admin/coupons/new" className="text-brand-600 hover:underline">
                Create your first coupon
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
