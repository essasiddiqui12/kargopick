import Link from "next/link";
import { Dumbbell, Mail, Phone, MapPin } from "lucide-react";
import { formatWhatsAppDisplay, getWhatsAppUrl, buildEnquiryMessage } from "@/lib/whatsapp";

export default function Footer() {
  const whatsappUrl = getWhatsAppUrl(buildEnquiryMessage());
  const phoneDisplay = formatWhatsAppDisplay();
  return (
    <footer className="border-t border-surface-300/60 bg-white/60 backdrop-blur-sm mt-12">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-600">
                <Dumbbell className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-surface-900">
                Kart<span className="text-brand-600">ix</span>
              </span>
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
                <Link href="/products?category=protein" className="hover:text-brand-600 transition-colors">
                  Proteins
                </Link>
              </li>
              <li>
                <Link href="/products?category=supplements" className="hover:text-brand-600 transition-colors">
                  Gym Supplements
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
              <li><a href="#" className="hover:text-brand-600 transition-colors">Shipping Info</a></li>
              <li><a href="#" className="hover:text-brand-600 transition-colors">Returns Policy</a></li>
              <li><a href="#" className="hover:text-brand-600 transition-colors">FAQ</a></li>
              <li>
                <Link href="/track-order" className="hover:text-brand-600 transition-colors">
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-surface-900 mb-4">Contact</h3>
            <ul className="space-y-3 text-sm text-surface-600">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-brand-500" />
                support@kartix.com
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
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-brand-500" />
                India
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-surface-200 pt-6 text-center text-sm text-surface-500">
          &copy; {new Date().getFullYear()} Kartix. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
