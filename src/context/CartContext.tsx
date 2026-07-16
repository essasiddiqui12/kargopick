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
  addToCart: (product: Product, variant?: ProductVariant) => void;
  removeFromCart: (productId: string, variationId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variationId?: string) => void;
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
        setItems(JSON.parse(saved));
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

  const getCartItemKey = (productId: string, variationId?: string) =>
    variationId ? `${productId}::${variationId}` : productId;

  const addToCart = useCallback((product: Product, variant?: ProductVariant) => {
    setItems((prev) => {
      const effectiveStock = variant?.stock ?? product.stock;
      if (effectiveStock <= 0) return prev;

      const variantId = variant?.id;
      const key = getCartItemKey(product.id, variantId);
      const existing = prev.find((item) => getCartItemKey(item.product.id, item.variantId) === key);

      if (existing) {
        const maxQty = Math.max(0, variant?.stock ?? product.stock);
        return prev.map((item) => {
          if (getCartItemKey(item.product.id, item.variantId) !== key) return item;
          return {
            ...item,
            product,
            variantId: variantId || item.variantId,
            variantName: variant
              ? variant.attribute_values.map((av) => `${av.display_value || av.value}`).join(" / ")
              : item.variantName,
            selectedAttributes: variant
              ? variant.attribute_values.map((av) => ({ attributeName: av.display_value || av.value, value: av.value }))
              : item.selectedAttributes,
            quantity: Math.min(item.quantity + 1, maxQty),
          };
        });
      }

      return [
        ...prev,
        {
          product,
          quantity: 1,
          variantId,
          variantName: variant
            ? variant.attribute_values.map((av) => `${av.display_value || av.value}`).join(" / ")
            : undefined,
          selectedAttributes: variant
            ? variant.attribute_values.map((av) => ({ attributeName: av.display_value || av.value, value: av.value }))
            : undefined,
        },
      ];
    });
    setIsCartOpen(true);
  }, []);

  const removeFromCart = useCallback((productId: string, variationId?: string) => {
    setItems((prev) =>
      prev.filter((item) => getCartItemKey(item.product.id, item.variantId) !== getCartItemKey(productId, variationId))
    );
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number, variationId?: string) => {
    if (quantity <= 0) {
      setItems((prev) =>
        prev.filter((item) => getCartItemKey(item.product.id, item.variantId) !== getCartItemKey(productId, variationId))
      );
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (getCartItemKey(item.product.id, item.variantId) !== getCartItemKey(productId, variationId)) return item;
        const variation = item.variantId ? item.product.variants?.find((v) => v.id === item.variantId) : undefined;
        const maxQty = Math.max(0, variation ? variation.stock : item.product.stock);
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
    const variation = item.variantId ? item.product.variants?.find((v) => v.id === item.variantId) : undefined;
    const price = (variation?.price ?? item.product.price);
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
