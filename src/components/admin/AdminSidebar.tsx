"use client";

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
} from "lucide-react";
import { BRAND_PREFIX, BRAND_SUFFIX } from "@/lib/brand";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/settings", label: "Store Settings", icon: Settings },
  { href: "/admin/products/new", label: "Add Product", icon: Plus },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <aside className="flex w-64 flex-col border-r border-surface-200 bg-white min-h-screen">
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
  );
}
