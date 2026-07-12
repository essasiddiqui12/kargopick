import Image from "next/image";
import { Dumbbell } from "lucide-react";
import { BRAND_NAME, BRAND_PREFIX, BRAND_SUFFIX, BRAND_TAGLINE } from "@/lib/brand";

type SiteLogoProps = {
  logoUrl?: string | null;
  size?: "sm" | "md";
  showText?: boolean;
};

export default function SiteLogo({
  logoUrl,
  size = "md",
  showText = true,
}: SiteLogoProps) {
  const boxClass =
    size === "sm"
      ? "h-9 w-9 rounded-lg"
      : "h-10 w-10 rounded-xl shadow-md shadow-brand-500/20";

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
            sizes={size === "sm" ? "36px" : "40px"}
            priority
          />
        </div>
      ) : (
        <div
          className={`flex items-center justify-center bg-gradient-to-br from-brand-500 to-brand-600 ${boxClass}`}
        >
          <Dumbbell
            className={size === "sm" ? "h-4 w-4 text-white" : "h-5 w-5 text-white"}
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
