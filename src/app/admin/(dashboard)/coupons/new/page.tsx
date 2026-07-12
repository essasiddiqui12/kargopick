import CouponForm from "@/components/admin/CouponForm";

export default function NewCouponPage() {
  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900">Create Coupon</h1>
        <p className="text-sm text-surface-500 mt-1">
          Add a new discount code for your customers
        </p>
      </div>
      <div className="rounded-xl border border-surface-200 bg-white p-6">
        <CouponForm />
      </div>
    </div>
  );
}
