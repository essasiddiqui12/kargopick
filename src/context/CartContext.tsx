"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { CartItem, Product, ProductVariation } from "@/types";
import { CART_STORAGE_KEY } from "@/lib/brand";

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, variation?: ProductVariation) => void;
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

  const addToCart = useCallback((product: Product, variation?: ProductVariation) => {
    setItems((prev) => {
      const effectiveStock = variation ? variation.stock : product.stock;
      if (effectiveStock <= 0) return prev;

      const variationId = variation?.id;
      const key = getCartItemKey(product.id, variationId);
      const existing = prev.find((item) => getCartItemKey(item.product.id, item.variationId) === key);

      if (existing) {
        return prev.map((item) => {
          if (getCartItemKey(item.product.id, item.variationId) !== key) return item;
          const maxQty = Math.max(0, variation ? variation.stock : product.stock);
          return {
            ...item,
            product,
            variationId: variationId || item.variationId,
            variationName: variation ? `${variation.type}: ${variation.value}` : item.variationName,
            quantity: Math.min(item.quantity + 1, maxQty),
          };
        });
      }

      return [
        ...prev,
        {
          product,
          quantity: 1,
          variationId,
          variationName: variation ? `${variation.type}: ${variation.value}` : undefined,
        },
      ];
    });
    setIsCartOpen(true);
  }, []);

  const removeFromCart = useCallback((productId: string, variationId?: string) => {
    setItems((prev) =>
      prev.filter((item) => getCartItemKey(item.product.id, item.variationId) !== getCartItemKey(productId, variationId))
    );
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number, variationId?: string) => {
    if (quantity <= 0) {
      setItems((prev) =>
        prev.filter((item) => getCartItemKey(item.product.id, item.variationId) !== getCartItemKey(productId, variationId))
      );
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (getCartItemKey(item.product.id, item.variationId) !== getCartItemKey(productId, variationId)) return item;
        const variation = item.variationId ? item.product.variations?.find((v) => v.id === item.variationId) : undefined;
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
    const variation = item.variationId ? item.product.variations?.find((v) => v.id === item.variationId) : undefined;
    const price = item.product.price + (variation?.priceAdjustment ?? 0);
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
