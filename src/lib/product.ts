import type { Product } from '@/types';

/** The size a product is sold in (no size picker): its first in-stock size, else its first size. */
export const defaultSize = (p: Product) => p.sizes.find((s) => s.inStock) ?? p.sizes[0];

/** Effective price shown on cards and the product page, and used for price filters and sorting. */
export const productPrice = (p: Product) => defaultSize(p).price;

export const allSoldOut = (p: Product) => !p.inStock || p.sizes.every((s) => !s.inStock);
