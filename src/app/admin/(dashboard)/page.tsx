import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Package,
  AlertTriangle,
  XCircle,
  ShoppingCart,
} from "lucide-react";
import {
  getProducts,
  getLowStockProducts,
  getOutOfStockProducts,
  LOW_STOCK_THRESHOLD,
} from "@/lib/products";
import { getOrders } from "@/lib/orders";
import { formatPrice } from "@/data/products";
import { formatWhatsAppDisplay } from "@/lib/whatsapp";
import DeleteProductButton from "@/components/admin/DeleteProductButton";
import StockStatusBadge from "@/components/admin/StockStatusBadge";

export default async function AdminDashboard() {
  const products = await getProducts();
  const orders = await getOrders();
  const lowStockProducts = getLowStockProducts(products);
  const outOfStockProducts = getOutOfStockProducts(products);
  const pendingOrders = orders.filter((o) => o.status === "pending").length;

  const stats = [
    {
      label: "Total Products",
      value: products.length,
      icon: Package,
      color: "text-brand-600 bg-brand-50",
    },
    {
      label: "Pending Orders",
      value: pendingOrders,
      icon: ShoppingCart,
      color: "text-amber-600 bg-amber-50",
    },
    {
      label: "Low Stock",
      value: lowStockProducts.length,
      icon: AlertTriangle,
      color: "text-amber-600 bg-amber-50",
    },
    {
      label: "Out of Stock",
      value: outOfStockProducts.length,
      icon: XCircle,
      color: "text-rose-600 bg-rose-50",
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Dashboard</h1>
          <p className="text-sm text-surface-500 mt-1">
            Manage your product catalog and inventory
          </p>
        </div>
        <div className="flex gap-2">
          {pendingOrders > 0 && (
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-100"
            >
              <ShoppingCart className="h-4 w-4" />
              {pendingOrders} Pending Order{pendingOrders !== 1 ? "s" : ""}
            </Link>
          )}
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
        </div>
      </div>

      <div className="mb-8 rounded-xl border border-[#25D366]/30 bg-[#25D366]/5 px-5 py-4">
        <p className="text-sm font-semibold text-[#128C7E]">Order WhatsApp number</p>
        <p className="mt-1 text-lg font-bold text-surface-900">
          {formatWhatsAppDisplay()}
        </p>
        <p className="mt-1 text-xs text-surface-500">
          Customer orders open WhatsApp to this number. Set{" "}
          <code className="rounded bg-white px-1 py-0.5">NEXT_PUBLIC_WHATSAPP_NUMBER</code>{" "}
          in <code className="rounded bg-white px-1 py-0.5">.env.local</code> and restart the server.
        </p>
      </div>

      {lowStockProducts.length > 0 && (
        <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-amber-900">
                {lowStockProducts.length} product
                {lowStockProducts.length !== 1 ? "s" : ""} running low on stock
              </h2>
              <p className="mt-1 text-sm text-amber-800">
                These items have {LOW_STOCK_THRESHOLD} or fewer units left.
                Restock soon to avoid missed sales.
              </p>
              <ul className="mt-4 space-y-2">
                {lowStockProducts.map((product) => (
                  <li
                    key={product.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/70 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-surface-900 truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-amber-700">
                        Only {product.stock} unit
                        {product.stock !== 1 ? "s" : ""} remaining
                      </p>
                    </div>
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="text-sm font-medium text-brand-600 hover:text-brand-700"
                    >
                      Restock →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-surface-200 bg-white p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-500">{stat.label}</p>
                <p className="text-2xl font-bold text-surface-900 mt-1">
                  {stat.value}
                </p>
              </div>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}
              >
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-surface-200 bg-white overflow-hidden">
        <div className="border-b border-surface-200 px-6 py-4">
          <h2 className="font-semibold text-surface-900">All Products</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-100 bg-surface-50 text-left">
                <th className="px-6 py-3 font-medium text-surface-500">
                  Product
                </th>
                <th className="px-6 py-3 font-medium text-surface-500">
                  Category
                </th>
                <th className="px-6 py-3 font-medium text-surface-500">
                  Price
                </th>
                <th className="px-6 py-3 font-medium text-surface-500">
                  Stock
                </th>
                <th className="px-6 py-3 font-medium text-surface-500 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-surface-100 hover:bg-surface-50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-surface-100">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-surface-900 line-clamp-1">
                          {product.name}
                        </p>
                        {product.badge && (
                          <span className="text-xs text-brand-600">
                            {product.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 capitalize text-surface-600">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 font-medium text-surface-900">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-6 py-4">
                    <StockStatusBadge product={product} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-50"
                      >
                        Edit
                      </Link>
                      <DeleteProductButton
                        id={product.id}
                        name={product.name}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {products.length === 0 && (
            <div className="py-16 text-center text-surface-500">
              No products yet.{" "}
              <Link
                href="/admin/products/new"
                className="text-brand-600 hover:underline"
              >
                Add your first product
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
