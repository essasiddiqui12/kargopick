"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Product, ProductAttribute, ProductAttributeValue, ProductVariant } from "@/types";

interface VariantSelectorProps {
  product: Product;
  onSelectionChange: (variant: ProductVariant | undefined) => void;
}

export default function VariantSelector({ product, onSelectionChange }: VariantSelectorProps) {
  const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchData() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kargopick.vercel.app";
        
        const [attrRes, variantRes] = await Promise.all([
          fetch(`${baseUrl}/api/products/${product.id}/attributes`, { cache: "no-store" }),
          fetch(`${baseUrl}/api/products/${product.id}/variants`, { cache: "no-store" }),
        ]);

        if (attrRes.ok) {
          const attrData = await attrRes.json();
          setAttributes(attrData);
        }

        if (variantRes.ok) {
          const variantData = await variantRes.json();
          setVariants(variantData);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [product.id]);

  useEffect(() => {
    if (variants.length > 0 && Object.keys(selectedValues).length === 0) {
      const defaultVariant = variants.find((v) => v.is_default) || variants[0];
      if (defaultVariant && defaultVariant.attribute_values.length > 0) {
        const initial: Record<string, string> = {};
        defaultVariant.attribute_values.forEach((av) => {
          initial[av.attribute_id] = av.id;
        });
        setSelectedValues(initial);
        onSelectionChange(defaultVariant);
      }
    }
  }, [variants, selectedValues, onSelectionChange]);

  function handleSelect(attributeId: string, valueId: string) {
    const next = { ...selectedValues, [attributeId]: valueId };
    setSelectedValues(next);

    const matchingVariant = variants.find((v) => {
      return v.attribute_values.every((av) => next[av.attribute_id] === av.id);
    });

    onSelectionChange(matchingVariant);
  }

  function getSelectedVariant() {
    return variants.find((v) => {
      return v.attribute_values.every((av) => selectedValues[av.attribute_id] === av.id);
    });
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

  if (attributes.length === 0 || variants.length === 0) return null;

  const selectedVariant = getSelectedVariant();

  return (
    <div className="space-y-4">
      {attributes.map((attr) => {
        const values = attr.attribute_values
          ?.filter((v) => v.is_active)
          .sort((a, b) => a.sort_order - b.sort_order) || [];

        return (
          <div key={attr.id}>
            <label className="block text-sm font-medium text-surface-700 mb-2">
              {attr.display_name}
              {attr.is_required && <span className="text-rose-500 ml-1">*</span>}
            </label>
            <div className="flex flex-wrap gap-2">
              {values.map((value) => {
                const isSelected = selectedValues[attr.id] === value.id;
                const isOutOfStock = !selectedVariant || selectedVariant.stock <= 0;

                if (attr.type === "color") {
                  return (
                    <button
                      key={value.id}
                      onClick={() => handleSelect(attr.id, value.id)}
                      disabled={isOutOfStock}
                      title={value.display_value || value.value}
                      className={`h-10 w-10 rounded-full border-2 transition-all ${
                        isSelected
                          ? "border-brand-500 ring-2 ring-brand-200 scale-110"
                          : "border-surface-200 hover:border-brand-300"
                      } ${isOutOfStock ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                      style={{ backgroundColor: value.value.toLowerCase() }}
                    />
                  );
                }

                return (
                  <button
                    key={value.id}
                    onClick={() => handleSelect(attr.id, value.id)}
                    disabled={isOutOfStock}
                    className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                      isSelected
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-surface-200 bg-white text-surface-700 hover:border-brand-300"
                    } ${isOutOfStock ? "opacity-40 cursor-not-allowed line-through" : "cursor-pointer"}`}
                  >
                    {value.display_value || value.value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
