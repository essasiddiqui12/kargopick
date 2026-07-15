import Link from "next/link";
import { ArrowRight, Shield, Truck, BadgeCheck } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import BannerSlider from "@/components/BannerSlider";
import CategoryCard from "@/components/CategoryCard";
import RecentlyViewed from "@/components/RecentlyViewed";
import { categories as staticCategories } from "@/data/products";
import { getFeaturedProducts } from "@/lib/products";
import type { CategoryInfo } from "@/types";

export const dynamic = "force-dynamic";

interface Banner {
  id: number;
  cta_url: string;
  image_url: string;
  is_active: boolean;
  sort_order: number;
}

async function getBanners(): Promise<Banner[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kargopick.vercel.app";
    const res = await fetch(`${baseUrl}/api/banners`, {
      cache: "no-store",
      headers: { "Accept": "application/json" },
    });

    if (!res.ok) {
      console.error("Banners API responded with status:", res.status);
      return [];
    }

    return await res.json();
  } catch {
    return [];
  }
}

async function getCategories(): Promise<CategoryInfo[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kargopick.vercel.app";
    const res = await fetch(`${baseUrl}/api/categories`, {
      cache: "no-store",
      headers: { "Accept": "application/json" },
    });

    if (!res.ok) {
      console.error("Categories API responded with status:", res.status);
      return staticCategories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        sort_order: 0,
        is_active: true,
      }));
    }

    return await res.json();
  } catch {
    return staticCategories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      icon: cat.icon,
      sort_order: 0,
      is_active: true,
    }));
  }
}

export default async function HomePage() {
  const featured = await getFeaturedProducts();
  const banners = await getBanners();
  const categories = await getCategories();

  return (
    <>
      {banners.length > 0 && (
        <section className="w-full">
          <BannerSlider banners={banners} />
        </section>
      )}

      <section className="border-y border-surface-200/80 bg-white/50 backdrop-blur-sm mt-8">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { icon: Shield, title: "100% Authentic", desc: "Genuine products only" },
              { icon: Truck, title: "Fast Delivery", desc: "Pan-India shipping" },
              { icon: BadgeCheck, title: "Best Prices", desc: "Direct import savings" },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 border border-brand-100">
                  <item.icon className="h-6 w-6 text-brand-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-surface-900">{item.title}</h3>
                  <p className="text-sm text-surface-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-surface-900">
            Shop by Category
          </h2>
          <p className="mt-3 text-base sm:text-lg text-surface-500 max-w-2xl mx-auto">
            Find exactly what your body needs
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {categories
            .filter((cat) => cat.is_active)
            .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name))
            .map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
        </div>
      </section>

      <section className="bg-white/40 backdrop-blur-sm py-16 border-t border-surface-200/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-surface-900 sm:text-3xl">Featured Products</h2>
              <p className="mt-2 text-surface-500">Top picks loved by our customers</p>
            </div>
            <Link
              href="/products"
              className="hidden sm:inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 text-sm font-medium"
            >
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <RecentlyViewed />
    </>
  );
}
