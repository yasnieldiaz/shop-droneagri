'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
}

interface AdminState {
  admin: AdminUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;

  // Actions
  setAdmin: (admin: AdminUser | null) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      admin: null,
      isLoggedIn: false,
      isLoading: false,

      setAdmin: (admin) => {
        set({ admin, isLoggedIn: !!admin });
      },

      login: async (email, password) => {
        set({ isLoading: true });

        try {
          const response = await fetch('/api/admin/login', {
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
            admin: data.admin,
            isLoggedIn: true,
            isLoading: false,
          });

          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: 'Login failed' };
        }
      },

      logout: async () => {
        try {
          await fetch('/api/admin/logout', { method: 'POST' });
        } catch (error) {
          console.error('Logout error:', error);
        }

        set({
          admin: null,
          isLoggedIn: false,
        });
      },

      checkAuth: async () => {
        set({ isLoading: true });

        try {
          const response = await fetch('/api/admin/me');

          if (!response.ok) {
            set({ admin: null, isLoggedIn: false, isLoading: false });
            return;
          }

          const data = await response.json();

          set({
            admin: data.admin,
            isLoggedIn: true,
            isLoading: false,
          });
        } catch (error) {
          set({ admin: null, isLoggedIn: false, isLoading: false });
        }
      },
    }),
    {
      name: 'admin-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        admin: state.admin,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
);
