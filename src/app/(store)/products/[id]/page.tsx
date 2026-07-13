import { notFound } from "next/navigation";
import ProductGallery from "@/components/ProductGallery";
import ProductDetailInfo, {
  ProductBreadcrumbs,
} from "@/components/ProductDetailInfo";
import RelatedProducts from "@/components/RelatedProducts";
import PincodeChecker from "@/components/PincodeChecker";
import { getProductById, getRelatedProducts } from "@/lib/products";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  const related = await getRelatedProducts(product.id, product.category);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10 w-full overflow-x-hidden">
      <ProductBreadcrumbs
        productName={product.name}
        categoryId={product.category}
      />

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 lg:items-start">
        <div className="min-w-0 rounded-2xl border border-surface-200 bg-white p-4 shadow-sm sm:p-5">
          <ProductGallery
            images={product.images}
            name={product.name}
            badge={product.badge}
            showBadge={false}
          />
        </div>

        <div className="min-w-0 flex flex-col gap-4">
          <ProductDetailInfo product={product} />
          <PincodeChecker className="w-full" />
        </div>
      </div>

      <RelatedProducts products={related} categoryId={product.category} />
    </div>
  );
}
