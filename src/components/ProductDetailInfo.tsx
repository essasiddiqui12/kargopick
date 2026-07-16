"use client";

import Link from "next/link";
import { ChevronRight, Star, ShieldCheck, MessageCircle, Truck } from "lucide-react";
import { Product } from "@/types";
import { categories, formatPrice } from "@/data/products";
import { StockStatus, getStockStatus } from "@/lib/products";
import AddToCartButton from "@/components/AddToCartButton";
import WhatsAppShareButton from "@/components/WhatsAppShareButton";
import ProductDescription from "@/components/ProductDescription";

function stockPill(status: StockStatus, stock: number) {
  if (status === "out_of_stock") {
    return (
      <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
        Out of Stock
      </span>
    );
  }
  if (status === "low_stock") {
    return (
      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
        Only {stock} left
      </span>
    );
  }
  return (
    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
      In Stock
    </span>
  );
}

export default function ProductDetailInfo({ product }: { product: Product }) {
  const category = categories.find((c) => c.id === product.category);
  const stockStatus = getStockStatus(product);
  const hasDiscount =
    product.originalPrice != null && product.originalPrice > product.price;
  const discount = hasDiscount
    ? Math.round(
        ((product.originalPrice! - product.price) / product.originalPrice!) * 100
      )
    : 0;

  return (
    <div className="static lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-2xl border border-surface-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
        <div className="flex flex-wrap items-center gap-2">
          {category && (
            <Link
              href={`/products?category=${product.category}`}
              className="rounded-full bg-surface-100 px-3 py-1 text-xs font-medium text-surface-600 hover:bg-brand-50 hover:text-brand-700 transition-colors"
            >
              {category.icon} {category.name}
            </Link>
          )}
          {product.badge && (
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
              {product.badge}
            </span>
          )}
          {stockPill(stockStatus, product.stock)}
        </div>

        <h1 className="mt-4 text-2xl font-bold tracking-tight text-surface-900 sm:text-3xl break-words">
          {product.name}
        </h1>

        <div className="mt-3 flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(product.rating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-surface-200"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-surface-500">
            {product.rating} · {product.reviews} reviews
          </span>
        </div>

        <div className="mt-6 border-t border-surface-100 pt-6">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-3xl font-bold text-brand-600" id="product-price">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-lg text-surface-400 line-through">
                  {formatPrice(product.originalPrice!)}
                </span>
                <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-sm font-semibold text-rose-600">
                  {discount}% OFF
                </span>
              </>
            )}
          </div>
          <p className="mt-1.5 text-xs text-surface-500">
            Inclusive of taxes · Order via cart or WhatsApp
          </p>
        </div>

        <div className="mt-4 sm:mt-6">
          <ProductDescription text={product.description} />
        </div>

        {(product.weight || product.origin) && (
          <dl className="mt-4 sm:mt-6 grid grid-cols-2 gap-3 rounded-xl bg-surface-50 p-3 sm:p-4 text-sm">
            {product.weight && (
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-surface-400">
                  Weight
                </dt>
                <dd className="mt-0.5 font-medium text-surface-800">
                  {product.weight}
                </dd>
              </div>
            )}
            {product.origin && (
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-surface-400">
                  Origin
                </dt>
                <dd className="mt-0.5 font-medium text-surface-800">
                  {product.origin}
                </dd>
              </div>
            )}
          </dl>
        )}

        <ul className="mt-4 sm:mt-6 space-y-2 text-sm text-surface-600">
          <li className="flex items-center gap-2.5">
            <ShieldCheck className="h-4 w-4 flex-shrink-0 text-brand-500" />
            Authentic supplements & imported products
          </li>
          <li className="flex items-center gap-2.5">
            <MessageCircle className="h-4 w-4 flex-shrink-0 text-brand-500" />
            WhatsApp support for orders & queries
          </li>
          <li className="flex items-center gap-2.5">
            <Truck className="h-4 w-4 flex-shrink-0 text-brand-500" />
            Delivery across India
          </li>
        </ul>

        <div className="mt-6 sm:mt-8 space-y-3 border-t border-surface-100 pt-4 sm:pt-6">
          <AddToCartButton product={product} fullWidth />
          <WhatsAppShareButton product={product} fullWidth />
        </div>
      </div>
    </div>
  );
}

export function ProductBreadcrumbs({
  productName,
  categoryId,
}: {
  productName: string;
  categoryId: string;
}) {
  const category = categories.find((c) => c.id === categoryId);

  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-surface-500 min-w-0"
    >
      <Link href="/" className="hover:text-brand-600 transition-colors">
        Home
      </Link>
      <ChevronRight className="h-4 w-4" />
      <Link href="/products" className="hover:text-brand-600 transition-colors">
        Products
      </Link>
      {category && (
        <>
          <ChevronRight className="h-4 w-4" />
          <Link
            href={`/products?category=${category.id}`}
            className="hover:text-brand-600 transition-colors"
          >
            {category.name}
          </Link>
        </>
      )}
      <ChevronRight className="h-4 w-4" />
      <span className="text-surface-800 font-medium truncate">{productName}</span>
    </nav>
  );
}
