import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from './storageKeys';
import type { AdminUser } from '@/types';

interface AdminAuthState {
  admin: AdminUser | null;
  /** Access token for admin API calls. */
  token: string | null;
  login: (admin: AdminUser, token?: string | null) => void;
  logout: () => void;
}

/** The signed-in admin, separate from the shop customer's session in `authStore`. */
export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      admin: null,
      token: null,
      login: (admin, token = null) => set({ admin, token }),
      logout: () => set({ admin: null, token: null }),
    }),
    { name: STORAGE_KEYS.adminSession },
  ),
);
