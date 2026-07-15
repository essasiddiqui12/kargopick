"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { CategoryInfo } from "@/types";

interface CategoryCardProps {
  category: CategoryInfo;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const href = `/products?category=${category.id}`;

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white border border-surface-200 shadow-sm hover:shadow-xl hover:shadow-brand-500/10 hover:border-brand-300 transition-all duration-300"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-100">
        {category.image_url ? (
          <Image
            src={category.image_url}
            alt={category.name}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-50 via-brand-100 to-brand-50 text-5xl transition-transform duration-700 ease-out group-hover:scale-110">
            {category.icon}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between p-3 sm:p-4">
        <div className="mb-3">
          <h3 className="font-bold text-surface-900 text-sm sm:text-base leading-tight">
            {category.name}
          </h3>
          <p className="mt-1 text-xs text-surface-500 line-clamp-2 leading-relaxed">
            {category.description}
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 self-start rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm group-hover:bg-brand-600 transition-colors duration-300">
          Shop Now
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
