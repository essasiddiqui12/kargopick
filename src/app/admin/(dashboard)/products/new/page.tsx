"use client";

import { useRouter } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";

export default function NewProductPage() {
  const router = useRouter();

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900">Add Product</h1>
        <p className="text-sm text-surface-500 mt-1">Create a new product for your store</p>
      </div>
      <div className="rounded-xl border border-surface-200 bg-white p-6">
        <ProductForm
          onProductCreated={(productId) => {
            router.push(`/admin/products/${productId}/edit`);
            router.refresh();
          }}
        />
      </div>
    </div>
  );
}
