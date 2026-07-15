"use client";

import { useState, useEffect } from "react";
import { Product, ProductVariation } from "@/types";

interface VariationSelectorProps {
  product: Product;
  onSelectionChange: (variation: ProductVariation | undefined) => void;
}

export default function VariationSelector({ product, onSelectionChange }: VariationSelectorProps) {
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Record<string, ProductVariation>>({});

  useEffect(() => {
    async function fetchVariations() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kargopick.vercel.app";
        const res = await fetch(`${baseUrl}/api/products/${product.id}/variations`, {
          cache: "no-store",
        });

        if (res.ok) {
          const data = await res.json();
          setVariations(data);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }

    fetchVariations();
  }, [product.id]);

  useEffect(() => {
    const activeVariations = variations
      .filter((v) => v.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    const firstOfEachType = activeVariations.reduce<Record<string, ProductVariation>>((acc, v) => {
      if (!acc[v.type]) acc[v.type] = v;
      return acc;
    }, {});

    setSelected(firstOfEachType);
    const firstVariation = activeVariations[0];
    if (firstVariation) onSelectionChange(firstVariation);
  }, [variations, onSelectionChange]);

  function handleSelect(type: string, variation: ProductVariation) {
    setSelected((prev) => {
      const next = { ...prev, [type]: variation };
      return next;
    });
    onSelectionChange(variation);
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

  if (variations.length === 0) return null;

  const grouped = variations
    .filter((v) => v.isActive)
    .reduce<Record<string, ProductVariation[]>>((acc, v) => {
      if (!acc[v.type]) acc[v.type] = [];
      acc[v.type].push(v);
      return acc;
    }, {});

  const typeLabels: Record<string, string> = {
    flavor: "Flavor",
    size: "Size",
    color: "Color",
    weight: "Weight",
    other: "Option",
  };

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([type, options]) => (
        <div key={type}>
          <label className="block text-sm font-medium text-surface-700 mb-2">
            {typeLabels[type] || type}
          </label>
          <div className="flex flex-wrap gap-2">
            {options.map((option) => {
              const isActive = selected[type]?.id === option.id;
              const isOutOfStock = option.stock <= 0;

              if (type === "color") {
                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelect(type, option)}
                    disabled={isOutOfStock}
                    title={option.value}
                    className={`h-10 w-10 rounded-full border-2 transition-all ${
                      isActive
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
                  onClick={() => handleSelect(type, option)}
                  disabled={isOutOfStock}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                    isActive
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
