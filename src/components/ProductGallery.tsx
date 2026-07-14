"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

interface ProductGalleryProps {
  images: string[];
  videos?: string[];
  name: string;
  badge?: string;
  showBadge?: boolean;
}

type MediaItem =
  | { type: "image"; url: string }
  | { type: "video"; url: string };

export default function ProductGallery({
  images,
  videos = [],
  name,
  badge,
  showBadge = true,
}: ProductGalleryProps) {
  const mediaItems: MediaItem[] = [
    ...images.map((url) => ({ type: "image" as const, url })),
    ...videos.map((url) => ({ type: "video" as const, url })),
  ];

  const gallery = mediaItems.length > 0 ? mediaItems : [];
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    function updateArrows() {
      const el = scrollRef.current;
      if (!el) return;
      setCanScrollLeft(el.scrollLeft > 2);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
    }

    const el = scrollRef.current;
    if (el) {
      updateArrows();
      el.addEventListener("scroll", updateArrows, { passive: true });
    }
    window.addEventListener("resize", updateArrows);
    return () => {
      if (el) {
        el.removeEventListener("scroll", updateArrows);
      }
      window.removeEventListener("resize", updateArrows);
    };
  }, []);

  function scroll(direction: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  if (gallery.length === 0) {
    return (
      <div className="relative aspect-[3/4] sm:aspect-square overflow-hidden rounded-2xl border border-surface-200 bg-surface-100" />
    );
  }

  const activeItem = gallery[activeIndex];

  return (
    <div className="space-y-3">
      <div className="relative aspect-[3/4] sm:aspect-square overflow-hidden rounded-xl bg-surface-50">
        {activeItem.type === "image" ? (
          <Image
            src={activeItem.url}
            alt={name}
            fill
            className="object-contain"
            priority
          />
        ) : (
          <video
            ref={videoRef}
            src={activeItem.url}
            className="h-full w-full object-contain"
            controls
            playsInline
          />
        )}
        {showBadge && badge && (
          <span className="absolute left-3 top-3 rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-white">
            {badge}
          </span>
        )}

        {gallery.length > 1 && (
          <>
            {canScrollLeft && (
              <button
                type="button"
                onClick={() => scroll("left")}
                className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-surface-700 shadow-md hover:bg-white"
                aria-label="Previous"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            {canScrollRight && (
              <button
                type="button"
                onClick={() => scroll("right")}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-surface-700 shadow-md hover:bg-white"
                aria-label="Next"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </>
        )}
      </div>

      {gallery.length > 1 && (
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {gallery.map((item, index) => (
            <button
              key={`${item.url}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative h-14 w-14 flex-shrink-0 snap-start overflow-hidden rounded-xl border-2 transition-all ${
                index === activeIndex
                  ? "border-brand-500 ring-2 ring-brand-200"
                  : "border-surface-200 hover:border-brand-300"
              }`}
            >
              {item.type === "image" ? (
                <Image
                  src={item.url}
                  alt={`${name} ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              ) : (
                <div className="relative h-full w-full bg-surface-200">
                  <video
                    src={item.url}
                    className="h-full w-full object-cover"
                    muted
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play className="h-5 w-5 text-white" />
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
