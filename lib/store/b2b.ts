'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface B2BCustomer {
  id: string;
  email: string;
  companyName: string;
  vatNumber: string;
  country: string;
  region: 'POLAND' | 'EU';
}

export interface B2BPrices {
  [productId: string]: {
    pricePL: number;
    priceEU: number;
    discountPL: number | null;
    discountEU: number | null;
  };
}

interface B2BState {
  customer: B2BCustomer | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  prices: B2BPrices;

  // Actions
  setCustomer: (customer: B2BCustomer | null) => void;
  setPrices: (prices: B2BPrices) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  fetchPrices: () => Promise<void>;

  // Price helpers
  getB2BPrice: (productId: string, basePricePLN: number, basePriceEUR: number) => {
    price: number;
    currency: 'PLN' | 'EUR';
    isB2BPrice: boolean;
  } | null;
}

export const useB2BStore = create<B2BState>()(
  persist(
    (set, get) => ({
      customer: null,
      isLoggedIn: false,
      isLoading: false,
      prices: {},

      setCustomer: (customer) => {
        set({ customer, isLoggedIn: !!customer });
      },

      setPrices: (prices) => {
        set({ prices });
      },

      login: async (email, password) => {
        set({ isLoading: true });

        try {
          const response = await fetch('/api/b2b/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          const data = await response.json();

          if (!response.ok) {
            set({ isLoading: false });
            return { success: false, error: data.error };
          }

          set({
            customer: data.customer,
            isLoggedIn: true,
            isLoading: false,
          });

          // Fetch B2B prices after login
          await get().fetchPrices();

          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: 'Login failed' };
        }
      },

      logout: async () => {
        try {
          await fetch('/api/b2b/me', { method: 'DELETE' });
        } catch (error) {
          console.error('Logout error:', error);
        }

        set({
          customer: null,
          isLoggedIn: false,
          prices: {},
        });
      },

      checkAuth: async () => {
        set({ isLoading: true });

        try {
          const response = await fetch('/api/b2b/me');

          if (!response.ok) {
            set({ customer: null, isLoggedIn: false, isLoading: false });
            return;
          }

          const data = await response.json();

          set({
            customer: data.customer,
            isLoggedIn: true,
            isLoading: false,
          });

          // Fetch B2B prices
          await get().fetchPrices();
        } catch (error) {
          set({ customer: null, isLoggedIn: false, isLoading: false });
        }
      },

      fetchPrices: async () => {
        try {
          const response = await fetch('/api/b2b/prices');

          if (!response.ok) {
            return;
          }

          const data = await response.json();
          set({ prices: data.prices || {} });
        } catch (error) {
          console.error('Failed to fetch B2B prices:', error);
        }
      },

      getB2BPrice: (productId, basePricePLN, basePriceEUR) => {
        const { customer, prices, isLoggedIn } = get();

        if (!isLoggedIn || !customer) {
          return null;
        }

        const productPrice = prices[productId];

        if (productPrice) {
          // Use fixed B2B price if available
          if (customer.region === 'POLAND' && productPrice.pricePL > 0) {
            return {
              price: productPrice.pricePL,
              currency: 'PLN' as const,
              isB2BPrice: true,
            };
          } else if (customer.region === 'EU' && productPrice.priceEU > 0) {
            return {
              price: productPrice.priceEU,
              currency: 'EUR' as const,
              isB2BPrice: true,
            };
          }

          // Use percentage discount if fixed price not available
          if (customer.region === 'POLAND' && productPrice.discountPL) {
            const discountedPrice = Math.round(basePricePLN * (1 - productPrice.discountPL / 100));
            return {
              price: discountedPrice,
              currency: 'PLN' as const,
              isB2BPrice: true,
            };
          } else if (customer.region === 'EU' && productPrice.discountEU) {
            const discountedPrice = Math.round(basePriceEUR * (1 - productPrice.discountEU / 100));
            return {
              price: discountedPrice,
              currency: 'EUR' as const,
              isB2BPrice: true,
            };
          }
        }

        // No B2B price for this product
        return null;
      },
    }),
    {
      name: 'b2b-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        customer: state.customer,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
);
