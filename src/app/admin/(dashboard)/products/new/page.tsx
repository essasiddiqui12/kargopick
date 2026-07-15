"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import VariationForm from "@/components/admin/VariationForm";
import type { ProductVariation } from "@/types";

export default function NewProductPage() {
  const router = useRouter();
  const [createdProductId, setCreatedProductId] = useState<string | null>(null);
  const [variations, setVariations] = useState<ProductVariation[]>([]);

  function handleProductCreated(productId: string) {
    setCreatedProductId(productId);
  }

  function handleContinueToDashboard() {
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900">
          {createdProductId ? "Add Product Variations" : "Add Product"}
        </h1>
        <p className="text-sm text-surface-500 mt-1">
          {createdProductId
            ? "Add flavor, size, color, or other options for this product"
            : "Create a new product for your store"}
        </p>
      </div>
      <div className="rounded-xl border border-surface-200 bg-white p-6">
        {!createdProductId ? (
          <ProductForm onProductCreated={handleProductCreated} />
        ) : (
          <div className="space-y-6">
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
              Product created successfully! Now add variations below.
            </div>
            <VariationForm
              productId={createdProductId}
              variations={variations}
              onChange={setVariations}
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleContinueToDashboard}
                className="rounded-xl bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
              >
                Finish & Go to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
