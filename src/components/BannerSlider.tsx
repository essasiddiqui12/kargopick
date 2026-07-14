"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  cta_text?: string;
  cta_url: string;
  desktop_image: string;
  mobile_image: string;
  sort_order: number;
}

interface BannerSliderProps {
  banners: Banner[];
  autoplayInterval?: number;
}

export default function BannerSlider({ banners, autoplayInterval = 5000 }: BannerSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  useEffect(() => {
    if (!isAutoPlaying || banners.length <= 1) return;
    const timer = setInterval(goToNext, autoplayInterval);
    return () => clearInterval(timer);
  }, [isAutoPlaying, banners.length, autoplayInterval, goToNext]);

  if (!banners.length) return null;

  const currentBanner = banners[currentIndex];
  const imageUrl = isMobile ? currentBanner.mobile_image : currentBanner.desktop_image;

  const renderContent = () => {
    if (!currentBanner.title && !currentBanner.subtitle && !currentBanner.cta_text) {
      return null;
    }

    const content = (
      <div className="absolute inset-0 flex items-center">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            {currentBanner.title && (
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 drop-shadow-lg">
                {currentBanner.title}
              </h2>
            )}
            {currentBanner.subtitle && (
              <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-6 sm:mb-8 drop-shadow-md">
                {currentBanner.subtitle}
              </p>
            )}
            {currentBanner.cta_text && currentBanner.cta_url && (
              <a
                href={currentBanner.cta_url}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold text-surface-900 hover:bg-surface-100 transition-colors shadow-lg"
              >
                {currentBanner.cta_text}
              </a>
            )}
          </div>
        </div>
      </div>
    );

    return (
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent">
        {content}
      </div>
    );
  };

  return (
    <div className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-surface-200" style={{ aspectRatio: isMobile ? "3/4" : "21/9" }}>
      <Image
        key={imageUrl}
        src={imageUrl}
        alt={currentBanner.title || "Promotional banner"}
        fill
        className="object-cover transition-opacity duration-700"
        priority={currentIndex === 0}
        sizes="100vw"
      />
      {renderContent()}

      {banners.length > 1 && (
        <>
          <button
            onClick={() => { goToPrev(); setIsAutoPlaying(false); setTimeout(() => setIsAutoPlaying(true), 10000); }}
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/90 text-surface-700 shadow-lg hover:bg-white transition-colors"
            aria-label="Previous banner"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
          <button
            onClick={() => { goToNext(); setIsAutoPlaying(false); setTimeout(() => setIsAutoPlaying(true), 10000); }}
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/90 text-surface-700 shadow-lg hover:bg-white transition-colors"
            aria-label="Next banner"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`rounded-full transition-all ${
                  index === currentIndex
                    ? "h-2.5 w-8 bg-white"
                    : "h-2.5 w-2.5 bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`Go to banner ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
