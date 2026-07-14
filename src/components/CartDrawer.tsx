"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowLeft,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/data/products";
import { buildOrderMessage, getWhatsAppUrl } from "@/lib/whatsapp";
import {
  CartStockIssue,
  fetchLiveProducts,
  validateCartItems,
} from "@/lib/cart-stock";
import CouponInput, { OrderTotals } from "@/components/CouponInput";
import { AppliedCoupon } from "@/types";

type Step = "cart" | "checkout" | "success";

export default function CartDrawer() {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    totalPrice,
    clearCart,
    syncItems,
  } = useCart();
  const router = useRouter();

  const [step, setStep] = useState<Step>("cart");
  const [loading, setLoading] = useState(false);
  const [syncingStock, setSyncingStock] = useState(false);
  const [stockIssues, setStockIssues] = useState<CartStockIssue[]>([]);
  const [error, setError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    notes: "",
  });

  const discount = appliedCoupon?.discount ?? 0;
  const finalTotal = totalPrice - discount;
  const hasStockIssues = stockIssues.length > 0;

  const refreshStock = useCallback(async () => {
    if (items.length === 0) {
      setStockIssues([]);
      return true;
    }

    setSyncingStock(true);
    try {
      const products = await fetchLiveProducts();
      const { issues, syncedItems } = validateCartItems(items, products);

      const needsSync = syncedItems.some((synced, i) => {
        const current = items[i];
        if (!current || current.product.id !== synced.product.id) return true;
        return (
          synced.product.stock !== current.product.stock ||
          synced.product.inStock !== current.product.inStock ||
          synced.product.price !== current.product.price
        );
      });

      if (needsSync) syncItems(syncedItems);
      setStockIssues(issues);
      return issues.length === 0;
    } catch {
      setError("Could not verify stock. Please try again.");
      return false;
    } finally {
      setSyncingStock(false);
    }
  }, [items, syncItems]);

  useEffect(() => {
    if (!isCartOpen || items.length === 0 || step === "success") return;

    let cancelled = false;
    (async () => {
      setSyncingStock(true);
      try {
        const products = await fetchLiveProducts();
        if (cancelled) return;
        const { issues, syncedItems } = validateCartItems(items, products);
        const needsSync = syncedItems.some((synced, i) => {
          const current = items[i];
          if (!current || current.product.id !== synced.product.id) return true;
          return (
            synced.product.stock !== current.product.stock ||
            synced.product.inStock !== current.product.inStock
          );
        });
        if (needsSync) syncItems(syncedItems);
        setStockIssues(issues);
      } catch {
        if (!cancelled) {
          setError("Could not verify stock. Please try again.");
        }
      } finally {
        if (!cancelled) setSyncingStock(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isCartOpen, step, items.length, syncItems]);

  function resetAndClose() {
    setStep("cart");
    setError("");
    setAppliedCoupon(null);
    setStockIssues([]);
    setForm({ name: "", phone: "", address: "", notes: "" });
    setIsCartOpen(false);
  }

  function handleCouponApply(coupon: AppliedCoupon) {
    setAppliedCoupon(coupon);
  }

  function handleCouponRemove() {
    setAppliedCoupon(null);
  }

  function getIssue(productId: string) {
    return stockIssues.find((i) => i.productId === productId);
  }

  async function handleProceedToCheckout() {
    setError("");
    const ok = await refreshStock();
    if (ok) setStep("checkout");
  }

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const ok = await refreshStock();
    if (!ok) {
      setLoading(false);
      setStep("cart");
      return;
    }

    const orderItems = items.map((item) => ({
      productId: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
    }));

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.name,
          phone: form.phone,
          address: form.address,
          notes: form.notes || undefined,
          items: orderItems,
          subtotal: totalPrice,
          discount: discount || undefined,
          couponCode: appliedCoupon?.code || undefined,
          total: finalTotal,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to place order");

      const customer = {
        name: form.name,
        phone: form.phone,
        address: form.address,
      };

      const url = getWhatsAppUrl(
        buildOrderMessage(
          items,
          totalPrice,
          data.id,
          customer,
          appliedCoupon ?? undefined,
          finalTotal,
          form.notes || undefined
        )
      );

      clearCart();
      setAppliedCoupon(null);
      setStockIssues([]);
      setIsCartOpen(false);
      router.push(`/order-confirmation/${data.id}`);
      window.open(url, "_blank");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-surface-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100";

  if (!isCartOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-surface-900/30 backdrop-blur-sm"
        onClick={resetAndClose}
      />
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-surface-200 px-6 py-4">
          <h2 className="text-lg font-bold text-surface-900 flex items-center gap-2">
            {step === "checkout" && (
              <button
                onClick={() => setStep("cart")}
                className="mr-1 text-surface-500 hover:text-surface-700"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <ShoppingBag className="h-5 w-5 text-brand-500" />
            {step === "checkout"
              ? "Checkout"
              : step === "success"
                ? "Order Placed"
                : "Your Cart"}
            {syncingStock && (
              <Loader2 className="h-4 w-4 animate-spin text-surface-400" />
            )}
          </h2>
          <button
            onClick={resetAndClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface-100 text-surface-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {step === "checkout" ? (
          <form
            onSubmit={handlePlaceOrder}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {error && (
                <div className="rounded-lg bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">
                  Full Name *
                </label>
                <input
                  required
                  className={inputClass}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">
                  Phone Number *
                </label>
                <input
                  required
                  type="tel"
                  className={inputClass}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="9876543210"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">
                  Delivery Address *
                </label>
                <textarea
                  required
                  rows={3}
                  className={inputClass}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="House no, street, city, pincode"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  rows={2}
                  className={inputClass}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Any special instructions..."
                />
              </div>

              <div className="rounded-xl bg-surface-50 border border-surface-200 p-4 space-y-3">
                <p className="text-sm font-medium text-surface-700">Order Summary</p>
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex justify-between text-sm text-surface-600 py-1"
                  >
                    <span>
                      {item.product.name} × {item.quantity}
                    </span>
                    <span>{formatPrice(item.product.price * item.quantity)}</span>
                  </div>
                ))}
                <OrderTotals subtotal={totalPrice} coupon={appliedCoupon} />
              </div>
            </div>

            <div className="border-t border-surface-200 px-6 py-4 bg-surface-50">
              <button
                type="submit"
                disabled={loading || syncingStock}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3.5 font-semibold text-white hover:bg-[#20bd5a] disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                )}
                Place Order & WhatsApp
              </button>
            </div>
          </form>
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <ShoppingBag className="h-16 w-16 text-surface-300 mb-4" />
            <p className="text-lg font-medium text-surface-600">Your cart is empty</p>
            <p className="mt-1 text-sm text-surface-400">
              Add some supplements to get started!
            </p>
            <button
              onClick={resetAndClose}
              className="mt-6 rounded-xl bg-brand-500 px-6 py-3 font-semibold text-white hover:bg-brand-600 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {hasStockIssues && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Stock issue in your cart</p>
                      <p className="mt-1 text-xs">
                        Remove or update items below before checkout.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-lg bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              )}

              {items.map((item) => {
                const issue = getIssue(item.product.id);
                const atMaxStock =
                  item.product.stock > 0 && item.quantity >= item.product.stock;

                return (
                  <div
                    key={item.product.id}
                    className={`flex gap-4 rounded-xl border p-3 ${
                      issue
                        ? "border-rose-200 bg-rose-50/50"
                        : "border-surface-200 bg-surface-50"
                    }`}
                  >
                     <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-surface-100">
                       <Image
                         src={item.product.image}
                         alt={item.product.name}
                         fill
                         className="object-contain"
                       />
                     </div>
                    <div className="flex flex-1 flex-col min-w-0">
                      <h3 className="font-medium text-sm text-surface-900 line-clamp-1">
                        {item.product.name}
                      </h3>
                      <p className="text-brand-600 font-semibold text-sm mt-1">
                        {formatPrice(item.product.price)}
                      </p>
                      {issue && (
                        <p className="mt-1 text-xs font-medium text-rose-600">
                          {issue.message}
                        </p>
                      )}
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity - 1)
                            }
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-200 hover:bg-surface-300 text-surface-700"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-sm font-medium text-surface-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity + 1)
                            }
                            disabled={atMaxStock || !!issue}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-200 hover:bg-surface-300 text-surface-700 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-surface-400 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              <CouponInput
                subtotal={totalPrice}
                applied={appliedCoupon}
                onApply={handleCouponApply}
                onRemove={handleCouponRemove}
              />
            </div>

            <div className="border-t border-surface-200 px-6 py-4 space-y-3 bg-surface-50">
              <OrderTotals subtotal={totalPrice} coupon={appliedCoupon} />
              <button
                onClick={handleProceedToCheckout}
                disabled={hasStockIssues || syncingStock}
                className="w-full rounded-xl bg-brand-500 py-3.5 font-semibold text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {hasStockIssues
                  ? "Fix stock issues to continue"
                  : "Proceed to Checkout"}
              </button>
              <button
                onClick={clearCart}
                className="w-full text-sm text-surface-400 hover:text-surface-600 transition-colors"
              >
                Clear Cart
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
