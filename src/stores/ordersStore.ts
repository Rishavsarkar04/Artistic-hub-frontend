import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from './storageKeys';
import type { Order } from '@/types';
import { mockOrders } from '@/data/account';

interface OrdersState {
  orders: Order[];
  /** Adds a newly placed order to the top of the list. */
  add: (order: Order) => void;
}

/**
 * The customer's orders, newest first, saved in localStorage.
 * MOCK: once the backend is connected, load orders with useApiQuery(endpoints.orders.list) and remove this store.
 */
export const useOrdersStore = create<OrdersState>()(
  persist(
    (set) => ({
      orders: mockOrders as Order[],
      add: (order) => set((s) => ({ orders: [order, ...s.orders] })),
    }),
    { name: STORAGE_KEYS.orders },
  ),
);
