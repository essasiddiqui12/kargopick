import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { formatWhatsAppDisplay, getWhatsAppUrl, buildEnquiryMessage } from "@/lib/whatsapp";
import SiteLogo from "@/components/SiteLogo";
import { BRAND_NAME, BRAND_EMAIL } from "@/lib/brand";

export default function Footer({ logoUrl }: { logoUrl?: string | null }) {
  const whatsappUrl = getWhatsAppUrl(buildEnquiryMessage());
  const phoneDisplay = formatWhatsAppDisplay();
  return (
    <footer className="border-t border-surface-300/60 bg-white/60 backdrop-blur-sm mt-12 w-full relative">
      <div className="mx-auto px-4 py-12 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="mb-4">
               <SiteLogo logoUrl={logoUrl} size="md" />
            </div>
            <p className="text-sm text-surface-600 leading-relaxed">
              Your trusted source for premium gym supplements, proteins, and
              authentic imported products from China.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-surface-900 mb-4">Shop</h3>
            <ul className="space-y-2 text-sm text-surface-600">
              <li>
                <Link href="/products?category=gym-essentials" className="hover:text-brand-600 transition-colors">
                  Gym Essentials
                </Link>
              </li>
              <li>
                <Link href="/products?category=imported" className="hover:text-brand-600 transition-colors">
                  Imported Products
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-brand-600 transition-colors">
                  All Products
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-surface-900 mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-surface-600">
              <li><a href="https://www.instagram.com/kargopick_international/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-600 transition-colors">Instagram</a></li>
              <li>
                <Link href="/track-order" className="hover:text-brand-600 transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-brand-600 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-600 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-surface-900 mb-4">Contact</h3>
            <ul className="space-y-3 text-sm text-surface-600">
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-brand-500 mt-0.5" />
                <span>{BRAND_EMAIL}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-brand-500" />
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-600 transition-colors"
                >
                  {phoneDisplay} (WhatsApp)
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-brand-500 mt-0.5" />
                <span>112, Keshavji Building, Yusuf Meher Ali Road, Masjid Bunder, Mumbai, Maharashtra - 400003</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-surface-200 pt-6 text-center text-sm text-surface-500">
          &copy; {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
