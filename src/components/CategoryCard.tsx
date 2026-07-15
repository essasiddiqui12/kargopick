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
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-surface-200 shadow-sm hover:shadow-xl hover:shadow-brand-500/10 hover:border-brand-300 hover:-translate-y-1 transition-all duration-300"
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-90 group-hover:opacity-80 transition-opacity duration-300" />
      </div>

      <div className="relative flex flex-1 flex-col justify-end p-4 sm:p-5 -mt-12">
        <div className="mb-3">
          <h3 className="text-base sm:text-lg font-bold text-white drop-shadow-md leading-tight">
            {category.name}
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-white/80 line-clamp-2 drop-shadow-sm leading-relaxed">
            {category.description}
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 self-start rounded-lg bg-white/95 backdrop-blur-sm px-3 py-2 text-xs sm:text-sm font-semibold text-surface-900 shadow-md group-hover:bg-brand-500 group-hover:text-white transition-all duration-300">
          Shop Now
          <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
