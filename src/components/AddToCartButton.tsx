"use client";

import { ShoppingCart } from "lucide-react";
import { Product, ProductVariant } from "@/types";
import { useCart } from "@/context/CartContext";

export default function AddToCartButton({
  product,
  selectedVariants,
  fullWidth = false,
}: {
  product: Product;
  selectedVariants: Record<string, ProductVariant>;
  fullWidth?: boolean;
}) {
  const { addToCart } = useCart();

  const totalAdjustment = Object.values(selectedVariants).reduce((sum, v) => sum + (v.priceAdjustment || 0), 0);
  const effectiveStock = product.stock;
  const isOutOfStock = effectiveStock <= 0;

  return (
    <button
      onClick={() => addToCart(product, selectedVariants)}
      disabled={isOutOfStock}
      className={`flex items-center justify-center gap-2 rounded-xl bg-brand-500 py-3.5 text-base font-semibold text-white hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-lg shadow-brand-500/20 ${
        fullWidth ? "w-full" : "w-full sm:w-auto sm:px-10"
      }`}
    >
      <ShoppingCart className="h-5 w-5" />
      {isOutOfStock ? "Out of Stock" : "Add to Cart"}
    </button>
  );
}
