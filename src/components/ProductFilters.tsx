"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Search, SlidersHorizontal, X, Loader2 } from "lucide-react";
import { categories } from "@/data/products";

export default function ProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showFilters, setShowFilters] = useState(false);
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [subcategories, setSubcategories] = useState<{ id: string; name: string }[]>([]);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);

  const currentCategory = searchParams.get("category") || "all";
  const currentSubcategory = searchParams.get("subcategory") || "";

  useEffect(() => {
    async function fetchSubcategories() {
      if (currentCategory === "all") {
        setSubcategories([]);
        return;
      }

      setLoadingSubcategories(true);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kargopick.vercel.app";
        const res = await fetch(`${baseUrl}/api/subcategories/${currentCategory}`, {
          cache: "no-store",
        });

        if (res.ok) {
          const data = await res.json();
          setSubcategories(data);
        } else {
          setSubcategories([]);
        }
      } catch {
        setSubcategories([]);
      } finally {
        setLoadingSubcategories(false);
      }
    }

    fetchSubcategories();
  }, [currentCategory]);

  const current = {
    category: currentCategory,
    subcategory: currentSubcategory,
    q: searchParams.get("q") || "",
    min: searchParams.get("min") || "",
    max: searchParams.get("max") || "",
    stock: searchParams.get("stock") || "all",
    sort: searchParams.get("sort") || "",
  };

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (!value || value === "all") params.delete(key);
        else params.set(key, value);
      });
      router.push(`/products?${params.toString()}`);
    },
    [router, searchParams]
  );

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateParams({ q: query });
  }

  function clearFilters() {
    setQuery("");
    router.push("/products");
  }

  const hasActiveFilters =
    current.q || current.min || current.max || current.stock !== "all" || current.sort || current.subcategory;

  return (
    <div className="mb-8 space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-xl border border-surface-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
        >
          Search
        </button>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
            showFilters || hasActiveFilters
              ? "border-brand-300 bg-brand-50 text-brand-700"
              : "border-surface-200 bg-white text-surface-600 hover:border-brand-300"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => updateParams({ category: "all", subcategory: "" })}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            current.category === "all"
              ? "bg-brand-500 text-white shadow-sm shadow-brand-500/25"
              : "bg-white text-surface-600 border border-surface-200 hover:border-brand-300"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => updateParams({ category: cat.id, subcategory: "" })}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              current.category === cat.id
                ? "bg-brand-500 text-white shadow-sm shadow-brand-500/25"
                : "bg-white text-surface-600 border border-surface-200 hover:border-brand-300"
            }`}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {subcategories.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-surface-500 uppercase tracking-wide">
            Subcategories:
          </span>
          {loadingSubcategories ? (
            <Loader2 className="h-4 w-4 animate-spin text-surface-400" />
          ) : (
            <>
              <button
                onClick={() => updateParams({ subcategory: "" })}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  !currentSubcategory
                    ? "bg-brand-500 text-white shadow-sm shadow-brand-500/25"
                    : "bg-white text-surface-600 border border-surface-200 hover:border-brand-300"
                }`}
              >
                All
              </button>
              {subcategories.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => updateParams({ subcategory: sub.id })}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    currentSubcategory === sub.id
                      ? "bg-brand-500 text-white shadow-sm shadow-brand-500/25"
                      : "bg-white text-surface-600 border border-surface-200 hover:border-brand-300"
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </>
          )}
        </div>
      )}

      {showFilters && (
        <div className="rounded-xl border border-surface-200 bg-white p-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-xs font-medium text-surface-500 mb-1">
              Min Price (₹)
            </label>
            <input
              type="number"
              min="0"
              defaultValue={current.min}
              onBlur={(e) => updateParams({ min: e.target.value })}
              className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-500 mb-1">
              Max Price (₹)
            </label>
            <input
              type="number"
              min="0"
              defaultValue={current.max}
              onBlur={(e) => updateParams({ max: e.target.value })}
              className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
              placeholder="10000"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-500 mb-1">
              Availability
            </label>
            <select
              value={current.stock}
              onChange={(e) => updateParams({ stock: e.target.value })}
              className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
            >
              <option value="all">All</option>
              <option value="in">In Stock</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-500 mb-1">
              Sort By
            </label>
            <select
              value={current.sort}
              onChange={(e) => updateParams({ sort: e.target.value })}
              className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
            >
              <option value="">Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Name A-Z</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      )}

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="inline-flex items-center gap-1 text-sm text-surface-500 hover:text-brand-600"
        >
          <X className="h-3.5 w-3.5" /> Clear all filters
        </button>
      )}
    </div>
  );
}
