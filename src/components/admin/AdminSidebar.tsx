"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Plus,
  LogOut,
  ExternalLink,
  Dumbbell,
  ShoppingCart,
  Tag,
  Settings,
  Star,
  ImageIcon,
  FolderTree,
  ListTree,
  Menu,
  X,
} from "lucide-react";
import { BRAND_PREFIX, BRAND_SUFFIX } from "@/lib/brand";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/banners", label: "Banners", icon: ImageIcon },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/subcategories", label: "Subcategories", icon: ListTree },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/settings", label: "Store Settings", icon: Settings },
  { href: "/admin/products/new", label: "Add Product", icon: Plus },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between gap-2 border-b border-surface-200 px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500">
            <Dumbbell className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-surface-900">
              {BRAND_PREFIX}<span className="text-brand-600">{BRAND_SUFFIX}</span>
            </span>
            <p className="text-xs text-surface-500">Admin Panel</p>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface-100 text-surface-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((link) => {
          const active =
            link.href === "/admin"
              ? pathname === "/admin"
              : link.href === "/admin/orders"
                ? pathname.startsWith("/admin/orders")
                : link.href === "/admin/reviews"
                  ? pathname.startsWith("/admin/reviews")
                  : link.href === "/admin/banners"
                    ? pathname.startsWith("/admin/banners")
                    : link.href === "/admin/categories"
                      ? pathname.startsWith("/admin/categories")
                      : link.href === "/admin/subcategories"
                        ? pathname.startsWith("/admin/subcategories")
                    : link.href === "/admin/coupons"
                      ? pathname.startsWith("/admin/coupons")
                      : link.href === "/admin/settings"
                        ? pathname.startsWith("/admin/settings")
                        : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-surface-600 hover:bg-surface-100 hover:text-surface-900"
              }`}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-surface-200 p-3 space-y-1">
        <Link
          href="/"
          target="_blank"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-surface-600 hover:bg-surface-100"
        >
          <ExternalLink className="h-4 w-4" />
          View Store
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-rose-600 hover:bg-rose-50"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed bottom-4 left-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-brand-500 text-white shadow-lg shadow-brand-500/30 hover:bg-brand-600 active:scale-95 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-surface-200 bg-white min-h-screen">
        <div className="flex items-center gap-2 border-b border-surface-200 px-6 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500">
            <Dumbbell className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-surface-900">
              {BRAND_PREFIX}<span className="text-brand-600">{BRAND_SUFFIX}</span>
            </span>
            <p className="text-xs text-surface-500">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map((link) => {
            const active =
              link.href === "/admin"
                ? pathname === "/admin"
                : link.href === "/admin/orders"
                  ? pathname.startsWith("/admin/orders")
                  : link.href === "/admin/reviews"
                    ? pathname.startsWith("/admin/reviews")
                    : link.href === "/admin/banners"
                      ? pathname.startsWith("/admin/banners")
                      : link.href === "/admin/categories"
                        ? pathname.startsWith("/admin/categories")
                        : link.href === "/admin/subcategories"
                          ? pathname.startsWith("/admin/subcategories")
                    : link.href === "/admin/coupons"
                      ? pathname.startsWith("/admin/coupons")
                      : link.href === "/admin/settings"
                        ? pathname.startsWith("/admin/settings")
                        : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-brand-50 text-brand-700"
                    : "text-surface-600 hover:bg-surface-100 hover:text-surface-900"
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-surface-200 p-3 space-y-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-surface-600 hover:bg-surface-100"
          >
            <ExternalLink className="h-4 w-4" />
            View Store
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-rose-600 hover:bg-rose-50"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-surface-900/30 backdrop-blur-sm">
          <aside className="absolute left-0 top-0 h-full w-64 bg-white shadow-2xl flex flex-col">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
