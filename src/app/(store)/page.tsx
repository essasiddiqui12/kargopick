import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Shield, Truck, BadgeCheck } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { categories } from "@/data/products";
import { getFeaturedProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  cta_text?: string;
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

export default async function HomePage() {
  const featured = await getFeaturedProducts();
  const banners = await getBanners();

  return (
    <>
      {banners.length > 0 && (
        <section className="w-full">
          {banners.slice(0, 1).map((banner) => (
            <Link
              key={banner.id}
              href={banner.cta_url || "#"}
              className="block relative w-full aspect-video md:aspect-[21/9]"
            >
              <Image
                src={banner.image_url}
                alt={banner.title || "Promotional banner"}
                fill
                className="object-cover"
                priority
                sizes="100vw"
              />
              {(banner.title || banner.subtitle) && (
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent flex items-center">
                  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
                    <div className="max-w-2xl">
                      {banner.title && (
                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3 md:mb-4 drop-shadow-lg">
                          {banner.title}
                        </h2>
                      )}
                      {banner.subtitle && (
                        <p className="text-sm sm:text-base md:text-lg text-white/90 mb-4 sm:mb-6 md:mb-8 drop-shadow-md">
                          {banner.subtitle}
                        </p>
                      )}
                      {banner.cta_text && (
                        <span className="inline-flex items-center gap-2 rounded-xl bg-white px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 text-sm sm:text-base font-semibold text-surface-900 shadow-lg">
                          {banner.cta_text}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </Link>
          ))}
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
        <h2 className="text-2xl font-bold text-surface-900 sm:text-3xl">Shop by Category</h2>
        <p className="mt-2 text-surface-500">Find exactly what your body needs</p>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.id}`}
              className="group rounded-2xl border border-surface-200 bg-white/70 p-6 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-500/10 transition-all backdrop-blur-sm"
            >
              <span className="text-3xl">{cat.icon}</span>
              <h3 className="mt-4 text-lg font-semibold text-surface-900 group-hover:text-brand-600 transition-colors">
                {cat.name}
              </h3>
              <p className="mt-2 text-sm text-surface-500">{cat.description}</p>
            </Link>
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
    </>
  );
}
