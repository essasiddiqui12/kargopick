import Link from "next/link";
import { Truck, ShieldCheck, BadgeCheck, Globe } from "lucide-react";
import { BRAND_NAME } from "@/lib/brand";

export const metadata = {
  title: `About Us | ${BRAND_NAME}`,
  description: `Learn about ${BRAND_NAME} — your premier destination for 100% authentic, directly imported international products.`,
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl">
          About {BRAND_NAME} International
        </h1>

        <div className="mt-8 space-y-6 text-base text-surface-700 leading-relaxed">
          <p>
            Welcome to <span className="font-semibold text-surface-900">{BRAND_NAME} International</span>, your premier destination for 100% authentic, directly imported international products. Founded by{" "}
            <span className="font-semibold text-surface-900">Mohammad Hamid Shaikh</span>, our company was born out of a simple vision: to make world-class products—from fitness essentials to premium lifestyle gear—easily accessible to every Indian at wholesale prices.
          </p>

          <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-surface-900">The {BRAND_NAME} Promise</h2>
            <p className="mt-3 text-surface-700">
              In a market often crowded with duplicates, we take a stand for authenticity. As direct importers, we bridge the gap between global markets (USA, Canada, China) and your home. By cutting out the middlemen, we ensure that you receive nothing but genuine, original products at the most competitive rates.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-surface-900">What We Offer</h2>
            <p className="mt-2 text-surface-700">
              Our curated catalog is designed for those who demand the best:
            </p>
            <ul className="mt-4 space-y-3 text-surface-700">
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                <span>
                  <span className="font-semibold text-surface-900">Performance & Fitness:</span> Elite-grade Whey Proteins, Pre-workouts, and performance boosters from top international brands.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                <span>
                  <span className="font-semibold text-surface-900">Lifestyle & Sports:</span> From professional skating shoes to hard-to-find antique-style items and trending imported goods.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                <span>
                  <span className="font-semibold text-surface-900">Global Reach:</span> We constantly scout the best products from around the world to bring them straight to the Indian market.
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-surface-900">Why Trust Us?</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-surface-200 bg-surface-50 p-4">
                <p className="font-semibold text-surface-900">Proprietor-Led Integrity</p>
                <p className="mt-1 text-sm text-surface-700">
                  Under the leadership of Mohammad Hamid Shaikh, we prioritize customer satisfaction and product transparency above all.
                </p>
              </div>
              <div className="rounded-xl border border-surface-200 bg-surface-50 p-4">
                <p className="font-semibold text-surface-900">Amazon Trusted</p>
                <p className="mt-1 text-sm text-surface-700">
                  Our commitment to quality has earned us the trust of thousands of customers on Amazon, making us a reliable partner for your fitness and lifestyle needs.
                </p>
              </div>
              <div className="rounded-xl border border-surface-200 bg-surface-50 p-4 sm:col-span-2">
                <p className="font-semibold text-surface-900">Pan-India Speed</p>
                <p className="mt-1 text-sm text-surface-700">
                  Our logistics network is optimized for lightning-fast, secure delivery to every corner of the country.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-surface-900">Our Values</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-brand-600 mt-0.5" />
              <div>
                <p className="font-semibold text-surface-900">Authenticity</p>
                <p className="text-sm text-surface-700">Only genuine products directly imported from trusted global sources.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <BadgeCheck className="h-5 w-5 text-brand-600 mt-0.5" />
              <div>
                <p className="font-semibold text-surface-900">Transparency</p>
                <p className="text-sm text-surface-700">Clear pricing, honest listings, and no hidden middleman costs.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Truck className="h-5 w-5 text-brand-600 mt-0.5" />
              <div>
                <p className="font-semibold text-surface-900">Speed</p>
                <p className="text-sm text-surface-700">Fast, reliable shipping across India with careful packaging.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Globe className="h-5 w-5 text-brand-600 mt-0.5" />
              <div>
                <p className="font-semibold text-surface-900">Global Selection</p>
                <p className="text-sm text-surface-700">Constantly expanding catalog from USA, Canada, China, and beyond.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-surface-200 bg-surface-50 p-6">
          <div>
            <p className="text-sm font-medium text-surface-500">Ready to shop?</p>
            <p className="text-lg font-bold text-surface-900">Explore our latest international collection.</p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </div>
  );
}
