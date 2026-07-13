"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductGalleryProps {
  images: string[];
  name: string;
  badge?: string;
  showBadge?: boolean;
}

export default function ProductGallery({
  images,
  name,
  badge,
  showBadge = true,
}: ProductGalleryProps) {
  const gallery = images.length > 0 ? images : [];
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = gallery[activeIndex] ?? gallery[0];

  if (!activeImage) {
    return (
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-surface-200 bg-surface-100" />
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] sm:aspect-square overflow-hidden rounded-xl bg-surface-50">
        <Image
          src={activeImage}
          alt={name}
          fill
          className="object-contain"
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
        {showBadge && badge && (
          <span className="absolute left-3 top-3 rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-white">
            {badge}
          </span>
        )}
      </div>

      {gallery.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {gallery.map((url, index) => (
            <button
              key={`${url}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative h-14 w-14 sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                index === activeIndex
                  ? "border-brand-500 ring-2 ring-brand-200"
                  : "border-surface-200 hover:border-brand-300"
              }`}
            >
              <Image
                src={url}
                alt={`${name} ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
