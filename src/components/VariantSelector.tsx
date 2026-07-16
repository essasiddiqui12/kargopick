"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Product, ProductVariant } from "@/types";

interface VariantSelectorProps {
  product: Product;
  onSelectionChange: (variant: ProductVariant | undefined) => void;
}

const VARIANT_TYPE_LABELS: Record<string, string> = {
  flavor: "Flavour",
  size: "Size",
  weight: "Weight",
  color: "Color",
  other: "Option",
};

export default function VariantSelector({ product, onSelectionChange }: VariantSelectorProps) {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Record<string, ProductVariant>>({});

  useEffect(() => {
    async function fetchVariants() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kargopick.vercel.app";
        const res = await fetch(`${baseUrl}/api/products/${product.id}/variants`, {
          cache: "no-store",
        });

        if (res.ok) {
          const data = await res.json();
          const mapped = data.map((v: any) => ({
            id: v.id,
            product_id: v.product_id,
            type: v.type || "other",
            value: v.value,
            priceAdjustment: Number(v.price_adjustment || 0),
            stock: Number(v.stock || 0),
            sku: v.sku,
            barcode: v.barcode,
            image: v.image,
            weight: v.weight,
            is_active: v.is_active,
            is_default: v.is_default,
            sort_order: v.sort_order,
          }));
          setVariants(mapped);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }

    fetchVariants();
  }, [product.id]);

  useEffect(() => {
    const activeVariants = variants
      .filter((v) => v.is_active)
      .sort((a, b) => a.sort_order - b.sort_order);

    if (activeVariants.length > 0) {
      const defaultVariant = activeVariants.find((v) => v.is_default) || activeVariants[0];
      const initial: Record<string, ProductVariant> = {};
      initial[defaultVariant.type] = defaultVariant;
      setSelected(initial);
      onSelectionChange(defaultVariant);
    }
  }, [variants, onSelectionChange]);

  function handleSelect(type: string, variant: ProductVariant) {
    setSelected((prev) => {
      const next = { ...prev, [type]: variant };
      return next;
    });
    onSelectionChange(variant);
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-12 animate-pulse rounded-xl bg-surface-100" />
        ))}
      </div>
    );
  }

  if (variants.length === 0) return null;

  const grouped = variants
    .filter((v) => v.is_active)
    .reduce<Record<string, ProductVariant[]>>((acc, v) => {
      if (!acc[v.type]) acc[v.type] = [];
      acc[v.type].push(v);
      return acc;
    }, {});

  const selectedVariant = Object.values(selected)[0];

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([type, options]) => (
        <div key={type}>
          <label className="block text-sm font-medium text-surface-700 mb-2">
            {VARIANT_TYPE_LABELS[type] || type}
          </label>
          <div className="flex flex-wrap gap-2">
            {options
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((option) => {
                const isSelected = selected[type]?.id === option.id;
                const isOutOfStock = option.stock <= 0;

                if (type === "color") {
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleSelect(type, option)}
                      disabled={isOutOfStock}
                      title={option.value}
                      className={`h-10 w-10 rounded-full border-2 transition-all ${
                        isSelected
                          ? "border-brand-500 ring-2 ring-brand-200 scale-110"
                          : "border-surface-200 hover:border-brand-300"
                      } ${isOutOfStock ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                      style={{ backgroundColor: option.value.toLowerCase() }}
                    />
                  );
                }

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelect(type, option)}
                    disabled={isOutOfStock}
                    className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                      isSelected
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-surface-200 bg-white text-surface-700 hover:border-brand-300"
                    } ${isOutOfStock ? "opacity-40 cursor-not-allowed line-through" : "cursor-pointer"}`}
                  >
                    {option.value}
                    {option.priceAdjustment > 0 && (
                      <span className="ml-1.5 text-xs text-surface-500">
                        +₹{option.priceAdjustment}
                      </span>
                    )}
                    {option.priceAdjustment < 0 && (
                      <span className="ml-1.5 text-xs text-emerald-600">
                        -₹{Math.abs(option.priceAdjustment)}
                      </span>
                    )}
                  </button>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}
