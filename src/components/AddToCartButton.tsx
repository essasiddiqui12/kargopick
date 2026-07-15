"use client";

import { ShoppingCart } from "lucide-react";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";

export default function AddToCartButton({
  product,
  fullWidth = false,
}: {
  product: Product;
  fullWidth?: boolean;
}) {
  const { addToCart } = useCart();

  return (
    <button
      onClick={() => addToCart(product)}
      disabled={!product.inStock}
      className={`flex items-center justify-center gap-2 rounded-xl bg-brand-500 py-3.5 text-base font-semibold text-white hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-lg shadow-brand-500/20 ${
        fullWidth ? "w-full" : "w-full sm:w-auto sm:px-10"
      }`}
    >
      <ShoppingCart className="h-5 w-5" />
      Add to Cart
    </button>
  );
}
