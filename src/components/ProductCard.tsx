"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingCart } from "lucide-react";
import { Product } from "@/types";
import { formatPrice } from "@/data/products";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-surface-200 bg-white/80 backdrop-blur-sm shadow-sm transition-all hover:border-brand-300 hover:shadow-lg hover:shadow-brand-500/10">
      <Link href={`/products/${product.id}`} className="relative aspect-square overflow-hidden bg-surface-100">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain bg-surface-100 transition-transform duration-500 group-hover:scale-105"
        />
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
            {product.badge}
          </span>
        )}
        {discount > 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-rose-500 px-2 py-1 text-xs font-bold text-white">
            -{discount}%
          </span>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm">
            <span className="rounded-full bg-surface-200 px-4 py-2 text-sm font-medium text-surface-600">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-surface-900 group-hover:text-brand-600 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        <div className="mt-1 flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="text-sm text-surface-700">{product.rating}</span>
          <span className="text-xs text-surface-400">({product.reviews})</span>
        </div>

        {product.weight && (
          <p className="mt-1 text-xs text-surface-400">{product.weight}</p>
        )}

        <div className="mt-auto pt-3 flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-brand-600">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="ml-2 text-sm text-surface-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          <button
            onClick={() => addToCart(product, {})}
            disabled={!product.inStock}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm shadow-brand-500/25"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
