'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  image: string | null;
  price: number;
  quantity: number;
  currency: 'PLN' | 'EUR';
}

interface CartState {
  items: CartItem[];
  currency: 'PLN' | 'EUR';
  isOpen: boolean;
  itemCount: number;
  subtotal: number;

  // Actions
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setCurrency: (currency: 'PLN' | 'EUR') => void;
  openCart: () => void;
  closeCart: () => void;
}

const calculateTotals = (items: CartItem[]) => {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { itemCount, subtotal };
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      currency: 'PLN',
      isOpen: false,
      itemCount: 0,
      subtotal: 0,

      addItem: (item) => {
        const { items } = get();
        const existingItem = items.find((i) => i.productId === item.productId);

        let newItems: CartItem[];

        if (existingItem) {
          newItems = items.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          );
        } else {
          const newItem: CartItem = {
            ...item,
            id: `cart_${Date.now()}`,
          };
          newItems = [...items, newItem];
        }

        const totals = calculateTotals(newItems);
        set({ items: newItems, ...totals, isOpen: true });
      },

      removeItem: (productId) => {
        const { items } = get();
        const newItems = items.filter((i) => i.productId !== productId);
        const totals = calculateTotals(newItems);
        set({ items: newItems, ...totals });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        const { items } = get();
        const newItems = items.map((i) =>
          i.productId === productId ? { ...i, quantity } : i
        );
        const totals = calculateTotals(newItems);
        set({ items: newItems, ...totals });
      },

      clearCart: () => {
        set({ items: [], itemCount: 0, subtotal: 0 });
      },

      setCurrency: (currency) => {
        set({ currency });
      },

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
    }),
    {
      name: 'shop-droneagri-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        currency: state.currency,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const totals = calculateTotals(state.items);
          state.itemCount = totals.itemCount;
          state.subtotal = totals.subtotal;
        }
      },
    }
  )
);
