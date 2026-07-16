"use client";

import { useState } from "react";
import { Product } from "@/types";
import ProductGallery from "@/components/ProductGallery";
import ProductDetailInfo, {
  ProductBreadcrumbs,
} from "@/components/ProductDetailInfo";
import RelatedProducts from "@/components/RelatedProducts";
import ProductReviews from "@/components/ProductReviews";
import TrackView from "@/components/TrackView";

export default function ProductDetailClient({
  product,
  related,
}: {
  product: Product;
  related: Product[];
}) {
  const [activeImageOverride, setActiveImageOverride] = useState(product.image);

  return (
    <>
      <TrackView />
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
            activeImageOverride={activeImageOverride}
          />
        </div>

        <div className="min-w-0">
          <ProductDetailInfo
            product={product}
            onVariantImageChange={setActiveImageOverride}
          />
        </div>
      </div>

      <RelatedProducts products={related} categoryId={product.category} />

      <ProductReviews productId={product.id} />
    </>
  );
}
