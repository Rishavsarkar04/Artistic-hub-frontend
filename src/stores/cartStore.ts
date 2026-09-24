import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '../types';

interface CartState {
  items: CartItem[];
  /** Adds the item, or increases the quantity if the same product and size is already in the cart. */
  add: (item: CartItem) => void;
  setQuantity: (productId: string, sizeLabel: string, quantity: number) => void;
  remove: (productId: string, sizeLabel: string) => void;
  clear: () => void;
}

const sameLine = (i: CartItem, productId: string, sizeLabel: string) => i.productId === productId && i.size.label === sizeLabel;

/** The cart, saved in localStorage so it survives a refresh. */
export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item) =>
        set((s) => {
          const existing = s.items.find((i) => sameLine(i, item.productId, item.size.label));
          return existing
            ? { items: s.items.map((i) => (i === existing ? { ...i, quantity: i.quantity + item.quantity } : i)) }
            : { items: [...s.items, item] };
        }),
      setQuantity: (productId, sizeLabel, quantity) =>
        set((s) => ({ items: s.items.map((i) => (sameLine(i, productId, sizeLabel) ? { ...i, quantity } : i)) })),
      remove: (productId, sizeLabel) => set((s) => ({ items: s.items.filter((i) => !sameLine(i, productId, sizeLabel)) })),
      clear: () => set({ items: [] }),
    }),
    { name: 'eb-cart' },
  ),
);

export const useCartCount = () => useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
export const useCartTotal = () => useCartStore((s) => s.items.reduce((sum, i) => sum + i.size.price * i.quantity, 0));
