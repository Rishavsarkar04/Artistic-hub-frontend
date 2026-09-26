import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from './storageKeys';
import type { Address, User } from '@/types';

interface AuthState {
  user: User | null;
  /** Access token from the auth API; sent as a Bearer header by `src/api/client.ts`. */
  token: string | null;
  login: (user: User, token?: string | null) => void;
  logout: () => void;
  updateUser: (changes: Partial<User>) => void;
  saveAddress: (address: Address) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
}

/** The signed-in user and their session, saved in localStorage so a refresh keeps them signed in. */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => {
      const updateAddresses = (fn: (list: Address[]) => Address[]) =>
        set((s) => (s.user ? { user: { ...s.user, addresses: fn(s.user.addresses) } } : s));
      return {
        user: null,
        token: null,
        login: (user, token = null) => set({ user, token }),
        logout: () => set({ user: null, token: null }),
        updateUser: (changes) => set((s) => (s.user ? { user: { ...s.user, ...changes } } : s)),
        // Adds a new address, or replaces the one with the same id.
        saveAddress: (address) =>
          updateAddresses((list) => (list.some((a) => a.id === address.id) ? list.map((a) => (a.id === address.id ? address : a)) : [...list, address])),
        // Deleting the default hands it to the first remaining address, so there's always one.
        deleteAddress: (id) =>
          updateAddresses((list) => {
            const rest = list.filter((a) => a.id !== id);
            return rest.length && !rest.some((a) => a.isDefault) ? rest.map((a, i) => ({ ...a, isDefault: i === 0 })) : rest;
          }),
        setDefaultAddress: (id) => updateAddresses((list) => list.map((a) => ({ ...a, isDefault: a.id === id }))),
      };
    },
    { name: STORAGE_KEYS.session },
  ),
);
