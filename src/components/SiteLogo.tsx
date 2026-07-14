import Image from "next/image";
import { Dumbbell } from "lucide-react";
import { BRAND_NAME, BRAND_PREFIX, BRAND_SUFFIX, BRAND_TAGLINE } from "@/lib/brand";

type SiteLogoProps = {
  logoUrl?: string | null;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
};

export default function SiteLogo({
  logoUrl,
  size = "md",
  showText = true,
}: SiteLogoProps) {
  const boxClass =
    size === "sm"
      ? "h-10 w-10 rounded-lg"
      : size === "lg"
        ? "h-14 w-14 rounded-xl shadow-lg shadow-brand-500/25"
        : "h-12 w-12 rounded-xl shadow-md shadow-brand-500/20";

  const iconSize = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-7 w-7" : "h-5 w-5";
  const textSize = size === "sm" ? "text-lg" : size === "lg" ? "text-2xl" : "text-xl";

  return (
    <div className="flex items-center gap-2">
      {logoUrl ? (
        <div
          className={`relative overflow-hidden bg-white border border-surface-200 ${boxClass}`}
        >
          <Image
            src={logoUrl}
            alt={`${BRAND_NAME} logo`}
            fill
            className="object-contain p-1"
            sizes={size === "sm" ? "40px" : size === "lg" ? "56px" : "48px"}
            priority
          />
        </div>
      ) : (
        <div
          className={`flex items-center justify-center bg-gradient-to-br from-brand-500 to-brand-600 ${boxClass}`}
        >
          <Dumbbell
            className={iconSize}
          />
        </div>
      )}

      {showText && (
        <div>
          <span
            className={`font-bold tracking-tight text-surface-900 ${
              size === "sm" ? "text-lg" : "text-xl"
            }`}
          >
            {BRAND_PREFIX}<span className="text-brand-600">{BRAND_SUFFIX}</span>
          </span>
          {size === "md" && (
            <span className="hidden sm:block text-xs text-surface-500 -mt-1">
              {BRAND_TAGLINE}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
