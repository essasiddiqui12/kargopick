import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { categories } from "@/data/products";
import { Product } from "@/types";

export default function RelatedProducts({
  products,
  categoryId,
}: {
  products: Product[];
  categoryId: string;
}) {
  if (products.length === 0) return null;

  const category = categories.find((c) => c.id === categoryId);

  return (
    <section className="mt-16 border-t border-surface-200 pt-12">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-surface-900">
            You may also like
          </h2>
          <p className="mt-1 text-sm text-surface-500">
            More {category?.name.toLowerCase() ?? "products"} from Kartix
          </p>
        </div>
        {category && (
          <Link
            href={`/products?category=${categoryId}`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
