import { notFound } from "next/navigation";
import CouponForm from "@/components/admin/CouponForm";
import { getCoupons } from "@/lib/coupons";

export default async function EditCouponPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const coupons = await getCoupons();
  const coupon = coupons.find((c) => c.id === id);
  if (!coupon) notFound();

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900">Edit Coupon</h1>
        <p className="text-sm text-surface-500 mt-1">Update {coupon.code}</p>
      </div>
      <div className="rounded-xl border border-surface-200 bg-white p-6">
        <CouponForm initialData={coupon} isEdit />
      </div>
    </div>
  );
}
