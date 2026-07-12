import { Product } from "@/types";
import { getStockStatus, LOW_STOCK_THRESHOLD } from "@/lib/products";

const styles: Record<string, string> = {
  in_stock: "bg-emerald-50 text-emerald-700",
  low_stock: "bg-amber-50 text-amber-700",
  out_of_stock: "bg-rose-50 text-rose-700",
};

const labels: Record<string, string> = {
  in_stock: "In Stock",
  low_stock: "Low Stock",
  out_of_stock: "Out of Stock",
};

export default function StockStatusBadge({ product }: { product: Product }) {
  const status = getStockStatus(product);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      <span>
        {product.stock} unit{product.stock !== 1 ? "s" : ""}
      </span>
      <span className="opacity-60">·</span>
      <span>{labels[status]}</span>
    </span>
  );
}

export function LowStockHint() {
  return (
    <p className="text-xs text-surface-500 mt-1">
      Alert when stock is {LOW_STOCK_THRESHOLD} or fewer units
    </p>
  );
}
