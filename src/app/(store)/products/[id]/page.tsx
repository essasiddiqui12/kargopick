import { notFound } from "next/navigation";
import ProductGallery from "@/components/ProductGallery";
import ProductDetailInfo, {
  ProductBreadcrumbs,
} from "@/components/ProductDetailInfo";
import RelatedProducts from "@/components/RelatedProducts";
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <ProductBreadcrumbs
        productName={product.name}
        categoryId={product.category}
      />

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 lg:items-start">
        <div className="rounded-2xl border border-surface-200 bg-white p-4 shadow-sm sm:p-5">
          <ProductGallery
            images={product.images}
            name={product.name}
            badge={product.badge}
            showBadge={false}
          />
        </div>

        <ProductDetailInfo product={product} />
      </div>

      <RelatedProducts products={related} categoryId={product.category} />
    </div>
  );
}
