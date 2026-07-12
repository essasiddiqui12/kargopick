import Link from "next/link";
import { ArrowRight, Shield, Truck, BadgeCheck } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { categories } from "@/data/products";
import { getFeaturedProducts } from "@/lib/products";

export default async function HomePage() {
  const featured = await getFeaturedProducts();

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-100/60 via-transparent to-accent-400/10" />
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-200/30 blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-accent-400/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="max-w-2xl animate-fade-in-up">
            <span className="inline-block rounded-full border border-brand-300 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700">
              Premium Fitness Store
            </span>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-surface-900 sm:text-6xl">
              Fuel Your{" "}
              <span className="bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">
                Fitness
              </span>{" "}
              Journey
            </h1>
            <p className="mt-6 text-lg text-surface-600 leading-relaxed">
              Shop authentic gym supplements, premium proteins, and imported
              products from China — all at unbeatable prices with fast delivery.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3.5 font-semibold text-white hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/25"
              >
                Shop Now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/products?category=imported"
                className="inline-flex items-center gap-2 rounded-xl border border-surface-300 bg-white/70 px-6 py-3.5 font-semibold text-surface-700 hover:bg-white hover:border-brand-300 transition-colors backdrop-blur-sm"
              >
                Imported Deals
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-surface-200/80 bg-white/50 backdrop-blur-sm">
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
