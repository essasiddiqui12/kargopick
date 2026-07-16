"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { CartItem, Product, ProductVariant } from "@/types";
import { CART_STORAGE_KEY } from "@/lib/brand";

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, selectedVariants: Record<string, ProductVariant>) => void;
  removeFromCart: (productId: string, selectedVariants: Record<string, ProductVariant>) => void;
  updateQuantity: (productId: string, quantity: number, selectedVariants: Record<string, ProductVariant>) => void;
  syncItems: (items: CartItem[]) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const migrated = parsed.map((item: any) => {
          if (item.selectedVariants && typeof item.selectedVariants === "object") {
            return item as CartItem;
          }
          const selectedVariants: Record<string, ProductVariant> = {};
          if (item.variantId && item.product?.variants) {
            const variant = item.product.variants.find((v: ProductVariant) => v.id === item.variantId);
            if (variant) {
              selectedVariants[variant.type] = variant;
            }
          }
          return {
            product: item.product,
            quantity: item.quantity,
            selectedVariants,
          } as CartItem;
        });
        setItems(migrated);
      } catch {
        localStorage.removeItem(CART_STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, mounted]);

  const getCartItemKey = (productId: string, selectedVariants: Record<string, ProductVariant> = {}) => {
    const variantKeys = Object.entries(selectedVariants)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([type, v]) => `${type}:${v.id}`)
      .join("|");
    return variantKeys ? `${productId}::${variantKeys}` : productId;
  };

  const addToCart = useCallback((product: Product, selectedVariants: Record<string, ProductVariant>) => {
    setItems((prev) => {
      const totalAdjustment = Object.values(selectedVariants).reduce((sum, v) => sum + (v.priceAdjustment || 0), 0);
      const effectiveStock = product.stock;
      if (effectiveStock <= 0) return prev;

      const key = getCartItemKey(product.id, selectedVariants);
      const existing = prev.find((item) => getCartItemKey(item.product.id, item.selectedVariants) === key);

      if (existing) {
        const maxQty = Math.max(0, effectiveStock);
        return prev.map((item) => {
          if (getCartItemKey(item.product.id, item.selectedVariants) !== key) return item;
          return {
            ...item,
            product,
            selectedVariants,
            quantity: Math.min(item.quantity + 1, maxQty),
          };
        });
      }

      return [
        ...prev,
        {
          product,
          quantity: 1,
          selectedVariants,
        },
      ];
    });
    setIsCartOpen(true);
  }, []);

  const removeFromCart = useCallback((productId: string, selectedVariants: Record<string, ProductVariant> = {}) => {
    setItems((prev) =>
      prev.filter((item) => getCartItemKey(item.product.id, item.selectedVariants || {}) !== getCartItemKey(productId, selectedVariants))
    );
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number, selectedVariants: Record<string, ProductVariant> = {}) => {
    if (quantity <= 0) {
      setItems((prev) =>
        prev.filter((item) => getCartItemKey(item.product.id, item.selectedVariants || {}) !== getCartItemKey(productId, selectedVariants))
      );
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (getCartItemKey(item.product.id, item.selectedVariants || {}) !== getCartItemKey(productId, selectedVariants)) return item;
        const maxQty = Math.max(0, item.product.stock);
        return { ...item, quantity: Math.min(quantity, maxQty) };
      })
    );
  }, []);

  const syncItems = useCallback((nextItems: CartItem[]) => {
    setItems(nextItems);
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => {
    const adjustment = Object.values(item.selectedVariants).reduce((s, v) => s + (v.priceAdjustment || 0), 0);
    const price = item.product.price + adjustment;
    return sum + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        syncItems,
        clearCart,
        totalItems,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
