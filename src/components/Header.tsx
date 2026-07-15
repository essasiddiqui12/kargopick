"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import SiteLogo from "@/components/SiteLogo";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/track-order", label: "Track Order" },
  { href: "/products?category=gym-essentials", label: "Gym Essentials" },
  { href: "/products?category=imported", label: "Imported" },
];

export default function Header({ logoUrl }: { logoUrl?: string | null }) {
  const { totalItems, setIsCartOpen } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-surface-300/60 bg-white/70 backdrop-blur-xl shadow-sm shadow-brand-500/5">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="group">
          <SiteLogo logoUrl={logoUrl} size="lg" />
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-2 text-sm text-surface-600 hover:text-brand-700 rounded-lg hover:bg-brand-50 transition-all"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-surface-100 text-surface-700 hover:bg-brand-50 hover:text-brand-700 transition-colors border border-surface-200"
            aria-label="Open cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
                {totalItems}
              </span>
            )}
          </button>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl bg-surface-100 border border-surface-200 text-surface-700"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="md:hidden border-t border-surface-200 bg-white/95 px-4 py-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 text-surface-700 hover:text-brand-700 rounded-lg hover:bg-brand-50"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
