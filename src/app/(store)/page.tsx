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

      <section className="relative border-y border-surface-200/80 bg-white/60 backdrop-blur-sm overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-50/40 via-white/60 to-brand-50/40" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-3 sm:gap-6">
            {[
              {
                icon: Shield,
                title: "100% Authentic",
                desc: "Genuine products only",
                color: "from-emerald-500 to-teal-600",
                bg: "bg-emerald-50",
                border: "border-emerald-100",
                text: "text-emerald-700",
              },
              {
                icon: Truck,
                title: "Fast Delivery",
                desc: "Pan-India shipping",
                color: "from-blue-500 to-indigo-600",
                bg: "bg-blue-50",
                border: "border-blue-100",
                text: "text-blue-700",
              },
              {
                icon: BadgeCheck,
                title: "Best Prices",
                desc: "Direct import savings",
                color: "from-amber-500 to-orange-600",
                bg: "bg-amber-50",
                border: "border-amber-100",
                text: "text-amber-700",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="group relative flex items-center gap-4 sm:gap-5 rounded-xl sm:rounded-2xl border border-surface-200 bg-white/80 p-3 sm:p-5 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/10 hover:border-brand-300 hover:-translate-y-1"
              >
                <div
                  className={`flex h-10 w-10 sm:h-14 sm:w-14 flex-shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-md sm:shadow-lg shadow-brand-500/20 transition-transform duration-300 group-hover:scale-110 group-hover:shadow-xl`}
                >
                  <item.icon className="h-5 w-5 sm:h-7 sm:w-7" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-surface-900 text-xs sm:text-base sm:text-lg tracking-tight leading-tight sm:leading-tight">
                    {item.title}
                  </h3>
                  <p className="mt-0.5 text-[11px] sm:text-sm text-surface-500 leading-relaxed hidden sm:block">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50/60 via-white to-emerald-50/40" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-emerald-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-100/20 rounded-full blur-3xl" />
        <div className="relative text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-surface-900">
            Shop by Category
          </h2>
          <p className="mt-3 text-base sm:text-lg text-surface-500 max-w-2xl mx-auto">
            Find exactly what your body needs
          </p>
        </div>
        <div className="relative grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
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
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
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
