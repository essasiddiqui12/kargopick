import { notFound } from "next/navigation";
import ProductDetailClient from "@/components/ProductDetailClient";
import RelatedProducts from "@/components/RelatedProducts";
import ProductReviews from "@/components/ProductReviews";
import TrackView from "@/components/TrackView";
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
      <TrackView />
      <ProductDetailClient product={product} />

      <RelatedProducts products={related} categoryId={product.category} />

      <ProductReviews productId={product.id} />
    </div>
  );
}
