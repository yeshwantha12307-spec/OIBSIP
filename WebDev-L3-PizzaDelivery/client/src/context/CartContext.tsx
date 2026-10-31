import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem } from '../types/index.js';

interface CartContextType {
  cart: CartItem[];
  addItem: (item: Omit<CartItem, 'cartItemId'>, openDrawer?: boolean) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  grandTotal: number;
  // Drawer controls
  isCartDrawerOpen: boolean;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  toggleCartDrawer: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('oasis_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('oasis_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  const addItem = (item: Omit<CartItem, 'cartItemId'>, openDrawer: boolean = true) => {
    setCart((prev) => {
      // If it's a preset pizza and exact same pizza already in cart, increment quantity
      if (item.type === 'preset' && item.pizzaId) {
        const existingIndex = prev.findIndex((p) => p.pizzaId === item.pizzaId);
        if (existingIndex > -1) {
          const updated = [...prev];
          updated[existingIndex].quantity += item.quantity;
          return updated;
        }
      }

      // Otherwise add as unique cart item
      const cartItemId = `cart_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      return [...prev, { ...item, cartItemId }];
    });

    if (openDrawer) {
      setIsCartDrawerOpen(true);
    }
  };

  const removeItem = (cartItemId: string) => {
    setCart((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.cartItemId === cartItemId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('oasis_cart');
  };

  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const deliveryFee = subtotal === 0 || subtotal >= 500 ? 0 : 40;
  const grandTotal = Math.round((subtotal + tax + deliveryFee) * 100) / 100;

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        tax,
        deliveryFee,
        grandTotal,
        isCartDrawerOpen,
        openCartDrawer: () => setIsCartDrawerOpen(true),
        closeCartDrawer: () => setIsCartDrawerOpen(false),
        toggleCartDrawer: () => setIsCartDrawerOpen((prev) => !prev),
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
