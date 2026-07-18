"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { CartItem, Product } from "@/types";
import { CART_STORAGE_KEY } from "@/lib/brand";

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, variantId?: string, variantName?: string) => void;
  removeFromCart: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  syncItems: (items: CartItem[]) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

export function getCartKey(item: CartItem): string {
  return item.variantId ? `${item.product.id}__${item.variantId}` : item.product.id;
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

  const addToCart = useCallback((product: Product, variantId?: string, variantName?: string) => {
    setItems((prev) => {
      const effectiveStock = variantId
        ? (product.variants?.find((v) => v.id === variantId)?.stock ?? product.stock)
        : product.stock;

      if (effectiveStock <= 0) return prev;

      const key = variantId ? `${product.id}__${variantId}` : product.id;
      const existing = prev.find((item) => {
        const itemKey = item.variantId ? `${item.product.id}__${item.variantId}` : item.product.id;
        return itemKey === key;
      });

      if (existing) {
        const maxQty = Math.max(0, effectiveStock);
        return prev.map((item) => {
          const itemKey = item.variantId ? `${item.product.id}__${item.variantId}` : item.product.id;
          if (itemKey !== key) return item;
          return {
            ...item,
            product,
            quantity: Math.min(item.quantity + 1, maxQty),
          };
        });
      }

      return [
        ...prev,
        {
          product,
          variantId,
          variantName,
          quantity: 1,
        },
      ];
    });
    setIsCartOpen(true);
  }, []);

  const removeFromCart = useCallback((key: string) => {
    setItems((prev) => prev.filter((item) => getCartKey(item) !== key));
  }, []);

  const updateQuantity = useCallback((key: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => getCartKey(item) !== key));
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (getCartKey(item) !== key) return item;
        const effectiveStock = item.variantId
          ? (item.product.variants?.find((v) => v.id === item.variantId)?.stock ?? item.product.stock)
          : item.product.stock;
        const maxQty = Math.max(0, effectiveStock);
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
    const price = item.variantId
      ? (item.product.variants?.find((v) => v.id === item.variantId)?.price ?? item.product.price)
      : item.product.price;
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
