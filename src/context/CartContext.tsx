import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { CartItem, Meal, Vendor } from '../types';

interface CartVendorGroup {
  vendor: Vendor;
  items: CartItem[];
  subtotal: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (meal: Meal, vendor: Vendor, quantity?: number) => void;
  removeFromCart: (mealId: string) => void;
  updateQuantity: (mealId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  cartItemsByVendor: CartVendorGroup[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'campusbites_cart_items_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Error reading cart from localStorage:', e);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const lastAddToCartRef = useRef<{ id: string; time: number }>({ id: '', time: 0 });

  const addToCart = (meal: Meal, vendor: Vendor, quantity = 1) => {
    const now = Date.now();
    // Guard against rapid duplicate triggers within 350ms for the same meal
    if (lastAddToCartRef.current.id === meal.id && now - lastAddToCartRef.current.time < 350) {
      return;
    }
    lastAddToCartRef.current = { id: meal.id, time: now };

    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.meal.id === meal.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }
      return [...prev, { meal, vendor, quantity }];
    });
  };

  const removeFromCart = (mealId: string) => {
    setCartItems((prev) => prev.filter((item) => item.meal.id !== mealId));
  };

  const updateQuantity = (mealId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(mealId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.meal.id === mealId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const cartSubtotal = cartItems.reduce(
    (acc, item) => acc + item.meal.price * item.quantity,
    0
  );

  // Group by vendor
  const vendorGroupMap = new Map<string, CartVendorGroup>();
  cartItems.forEach((item) => {
    const vId = item.vendor.id;
    if (!vendorGroupMap.has(vId)) {
      vendorGroupMap.set(vId, {
        vendor: item.vendor,
        items: [],
        subtotal: 0,
      });
    }
    const group = vendorGroupMap.get(vId)!;
    group.items.push(item);
    group.subtotal += item.meal.price * item.quantity;
  });

  const cartItemsByVendor = Array.from(vendorGroupMap.values());

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        cartItemsByVendor,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
