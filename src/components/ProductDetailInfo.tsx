"use client";

import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { ChevronRight, Star, ShieldCheck, MessageCircle, Truck } from "lucide-react";
import { Product, ProductVariant } from "@/types";
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

function groupVariantsByAttribute(variants: ProductVariant[]): Record<string, string[]> {
  const groups: Record<string, string[]> = {};
  for (const v of variants) {
    if (!v.isActive) continue;
    for (const key of Object.keys(v.attributes)) {
      const value = v.attributes[key];
      if (!groups[key]) groups[key] = [];
      if (!groups[key].includes(value)) {
        groups[key].push(value);
      }
    }
  }
  return groups;
}

function getFilteredVariants(variants: ProductVariant[], selected: Record<string, string>): ProductVariant[] {
  return variants.filter((v) => {
    if (!v.isActive) return false;
    return Object.entries(selected).every(([key, value]) => v.attributes[key] === value);
  });
}

export default function ProductDetailInfo({ 
  product, 
  onVariantImageChange,
}: { 
  product: Product;
  onVariantImageChange?: (url: string) => void;
}) {
  const category = categories.find((c) => c.id === product.category);
  const variants = product.variants || [];
  const hasVariants = variants.length > 0;

  const attributeGroups = useMemo(() => groupVariantsByAttribute(variants), [variants]);

  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>(() => {
    if (!hasVariants) return {};
    const defaultVariant = variants.find((v) => v.isDefault && v.isActive) || variants.find((v) => v.isActive);
    if (defaultVariant) {
      const initial: Record<string, string> = {};
      for (const [key, value] of Object.entries(defaultVariant.attributes)) {
        initial[key] = value;
      }
      return initial;
    }
    return {};
  });

  const activeVariants = useMemo(() => getFilteredVariants(variants, selectedAttributes), [variants, selectedAttributes]);
  const selectedVariant = activeVariants.find((v) => {
    return Object.entries(selectedAttributes).every(([key, value]) => v.attributes[key] === value);
  }) || activeVariants[0];

  const displayPrice = selectedVariant ? selectedVariant.price : product.price;
  const displayOriginalPrice = selectedVariant ? selectedVariant.originalPrice : product.originalPrice;
  const displayStock = selectedVariant ? selectedVariant.stock : product.stock;
  const displayImage = selectedVariant?.image || product.image;

  useEffect(() => {
    if (onVariantImageChange && displayImage) {
      onVariantImageChange(displayImage);
    }
  }, [displayImage, onVariantImageChange]);

  const stockStatus = getStockStatus({ ...product, stock: displayStock, price: displayPrice });

  const hasDiscount = displayOriginalPrice != null && displayOriginalPrice > displayPrice;
  const discount = hasDiscount
    ? Math.round(
        ((displayOriginalPrice! - displayPrice) / displayOriginalPrice!) * 100
      )
    : 0;

  function handleAttributeSelect(attributeKey: string, value: string) {
    setSelectedAttributes((prev) => {
      const current = prev[attributeKey];
      if (current === value) {
        const next = { ...prev };
        delete next[attributeKey];
        return next;
      }
      return { ...prev, [attributeKey]: value };
    });
  }

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
          {stockPill(stockStatus, displayStock)}
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

        {hasVariants && (
          <div className="mt-6 space-y-4">
            {Object.entries(attributeGroups).map(([key, values]) => (
              <div key={key}>
                <p className="text-sm font-medium text-surface-700 capitalize mb-2">
                  {key}
                </p>
                <div className="flex flex-wrap gap-2">
                  {values.map((value) => {
                    const isSelected = selectedAttributes[key] === value;
                    const isAvailable = variants.some((v) => {
                      if (!v.isActive) return false;
                      const testSelected = { ...selectedAttributes, [key]: value };
                      return getFilteredVariants(variants, testSelected).length > 0;
                    });

                    return (
                      <button
                        key={value}
                        onClick={() => handleAttributeSelect(key, value)}
                        disabled={!isAvailable}
                        className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                          isSelected
                            ? "border-brand-500 bg-brand-50 text-brand-700"
                            : isAvailable
                              ? "border-surface-200 bg-white text-surface-700 hover:border-brand-300"
                              : "border-surface-100 bg-surface-50 text-surface-400 cursor-not-allowed line-through"
                        }`}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 border-t border-surface-100 pt-6">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-3xl font-bold text-brand-600" id="product-price">
              {formatPrice(displayPrice)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-lg text-surface-400 line-through">
                  {formatPrice(displayOriginalPrice!)}
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
          <AddToCartButton
            product={product}
            fullWidth
            variantId={selectedVariant?.id}
            variantName={selectedVariant?.name}
          />
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
