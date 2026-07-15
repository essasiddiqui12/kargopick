"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { getRecentlyViewed } from "@/hooks/useRecentlyViewed";
import type { Product } from "@/types";

export default function RecentlyViewed() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecent() {
      const ids = getRecentlyViewed();
      if (ids.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kargopick.vercel.app";
        const res = await fetch(`${baseUrl}/api/products`);
        if (!res.ok) throw new Error("Failed");
        const all = await res.json() as Product[];
        const filtered = all.filter((p) => ids.includes(p.id)).slice(0, 4);
        setProducts(filtered);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }

    fetchRecent();
  }, []);

  if (loading || products.length === 0) return null;

  return (
    <section className="bg-white/40 backdrop-blur-sm py-16 border-t border-surface-200/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-8">
          <Eye className="h-5 w-5 text-brand-600" />
          <h2 className="text-2xl font-bold text-surface-900 sm:text-3xl">Recently Viewed</h2>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
