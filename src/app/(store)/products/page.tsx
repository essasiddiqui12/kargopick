import { Suspense } from "react";
import ProductCard from "@/components/ProductCard";
import ProductFilters from "@/components/ProductFilters";
import { categories } from "@/data/products";
import { searchProducts } from "@/lib/products";
import { ProductFilters as Filters } from "@/types";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    subcategory?: string;
    q?: string;
    min?: string;
    max?: string;
    stock?: string;
    sort?: string;
  }>;
}) {
  const params = await searchParams;

  const filters: Filters = {
    category: params.category || "all",
    subcategory: params.subcategory,
    query: params.q,
    minPrice: params.min ? parseInt(params.min, 10) : undefined,
    maxPrice: params.max ? parseInt(params.max, 10) : undefined,
    inStock:
      params.stock === "in" ? true : params.stock === "out" ? false : null,
    sort: (params.sort as Filters["sort"]) || undefined,
  };

  const products = await searchProducts(filters);
  const activeCategory = categories.find((c) => c.id === filters.category);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-surface-900">
          {params.q
            ? `Results for "${params.q}"`
            : activeCategory
              ? activeCategory.name
              : "All Products"}
        </h1>
        <p className="mt-2 text-surface-500">
          {products.length} product{products.length !== 1 ? "s" : ""} found
        </p>
      </div>

      <Suspense fallback={<div className="h-20" />}>
        <ProductFilters />
      </Suspense>

      {products.length === 0 ? (
        <p className="text-center text-surface-500 py-20">
          No products match your search. Try different filters.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
