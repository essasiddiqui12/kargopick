import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { getProductById } from "@/lib/products";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900">Edit Product</h1>
        <p className="text-sm text-surface-500 mt-1">Update {product.name}</p>
      </div>
      <div className="rounded-xl border border-surface-200 bg-white p-6">
        <ProductForm initialData={product} isEdit />
      </div>
    </div>
  );
}
