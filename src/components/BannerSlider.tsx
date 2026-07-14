"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  cta_text?: string;
  cta_url: string;
  image_url: string;
  is_active: boolean;
  sort_order: number;
}

export default function BannerSlider({ banners }: { banners: Banner[] }) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const prev = () => {
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  };

  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [banners.length, isPaused, next]);

  if (banners.length === 0) return null;

  const banner = banners[current];

  return (
    <div
      className="relative w-full aspect-video md:aspect-[21/9] overflow-hidden group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {banners.map((b, index) => (
        <Link
          key={b.id}
          href={b.cta_url || "#"}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <Image
            src={b.image_url}
            alt={b.title || "Promotional banner"}
            fill
            className="object-cover"
            priority={index === 0}
            sizes="100vw"
          />
          {(b.title || b.subtitle) && (
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent flex items-center">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-2xl">
                  {b.title && (
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3 md:mb-4 drop-shadow-lg">
                      {b.title}
                    </h2>
                  )}
                  {b.subtitle && (
                    <p className="text-sm sm:text-base md:text-lg text-white/90 mb-4 sm:mb-6 md:mb-8 drop-shadow-md">
                      {b.subtitle}
                    </p>
                  )}
                  {b.cta_text && (
                    <span className="inline-flex items-center gap-2 rounded-xl bg-white px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 text-sm sm:text-base font-semibold text-surface-900 shadow-lg">
                      {b.cta_text}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </Link>
      ))}

      {banners.length > 1 && (
        <>
          <button
            onClick={(e) => { e.preventDefault(); prev(); }}
            className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
          >
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); next(); }}
            className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
          >
            <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={(e) => { e.preventDefault(); setCurrent(index); }}
                className={`h-2.5 w-2.5 rounded-full transition-all ${
                  index === current
                    ? "bg-white w-8"
                    : "bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
