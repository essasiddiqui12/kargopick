"use client";

import { useState } from "react";
import ProductGallery from "@/components/ProductGallery";
import ProductDetailInfo, { ProductBreadcrumbs } from "@/components/ProductDetailInfo";
import { Product, ProductVariant } from "@/types";

export default function ProductDetailClient({ product }: { product: Product }) {
  const [activeImage, setActiveImage] = useState(
    product.images?.[0] || product.image || ""
  );
  const [selectedVariants, setSelectedVariants] = useState<Record<string, ProductVariant>>({});

  return (
    <>
      <ProductBreadcrumbs
        productName={product.name}
        categoryId={product.category}
      />

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 lg:items-start">
        <div className="min-w-0 rounded-2xl border border-surface-200 bg-white p-4 shadow-sm sm:p-5">
          <ProductGallery
            images={product.images}
            videos={product.videos}
            name={product.name}
            badge={product.badge}
            showBadge={false}
            activeImageOverride={activeImage}
          />
        </div>

        <div className="min-w-0">
          <ProductDetailInfo
            product={product}
            onVariantImageChange={setActiveImage}
            selectedVariants={selectedVariants}
            onSelectedVariantsChange={setSelectedVariants}
          />
        </div>
      </div>
    </>
  );
}
