import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCategoryBySlug, getSubcategories } from "@/lib/categories";
import { categories } from "@/data/products";
import type { CategoryInfo, SubcategoryInfo } from "@/types";

interface CategoryPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return categories.map((cat) => ({ id: cat.id }));
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { id } = await params;
  const category = getCategoryBySlug(id);
  const subcategories = await getSubcategories(id);

  if (!category) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-surface-900">Category not found</h1>
        <p className="mt-2 text-surface-500">
          The category you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 font-semibold text-white hover:bg-brand-600"
        >
          Browse All Products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          href="/products"
          className="inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 mb-4"
        >
          <ArrowRight className="h-4 w-4 rotate-180" />
          All Categories
        </Link>
        <h1 className="text-3xl font-bold text-surface-900">{category.name}</h1>
        <p className="mt-2 text-surface-500">{category.description}</p>
      </div>

      {subcategories.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-surface-500">No subcategories available yet.</p>
          <Link
            href={`/products?category=${category.id}`}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 font-semibold text-white hover:bg-brand-600"
          >
            View All {category.name}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {subcategories.map((sub) => (
            <SubcategoryCard key={sub.id} subcategory={sub} parentCategory={category.id} />
          ))}
        </div>
      )}
    </div>
  );
}

function SubcategoryCard({
  subcategory,
  parentCategory,
}: {
  subcategory: SubcategoryInfo;
  parentCategory: string;
}) {
  const href = `/products?category=${parentCategory}&subcategory=${subcategory.id}`;

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white border border-surface-200 shadow-sm hover:shadow-xl hover:shadow-brand-500/10 hover:border-brand-300 transition-all duration-300"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-100">
        {subcategory.image_url ? (
          <img
            src={subcategory.image_url}
            alt={subcategory.name}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-50 via-brand-100 to-brand-50 text-5xl transition-transform duration-700 ease-out group-hover:scale-110">
            {subcategory.icon}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between p-3 sm:p-4">
        <div className="mb-3">
          <h3 className="font-bold text-surface-900 text-sm sm:text-base leading-tight">
            {subcategory.name}
          </h3>
          <p className="mt-1 text-xs text-surface-500 line-clamp-2 leading-relaxed">
            {subcategory.description}
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 self-start rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm group-hover:bg-brand-600 transition-colors duration-300">
          Shop Now
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
