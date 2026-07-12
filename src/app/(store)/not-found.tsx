import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold text-brand-600">404</h1>
      <p className="mt-4 text-xl text-surface-500">Page not found</p>
      <Link
        href="/products"
        className="mt-8 rounded-xl bg-brand-500 px-6 py-3 font-semibold text-white hover:bg-brand-600 transition-colors"
      >
        Browse Products
      </Link>
    </div>
  );
}
