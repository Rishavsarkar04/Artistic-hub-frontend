/**
 * API settings and every endpoint path, in one place. Values come from environment
 * variables (see `.env.example`); change paths here, not at call sites.
 */
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '');
export const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT ?? 15000);

const id = (value: string | number) => encodeURIComponent(String(value));

export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    me: '/auth/me',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },
  products: {
    list: '/products',
    detail: (productId: string) => `/products/${id(productId)}`,
  },
  tags: '/tags',
  colors: '/colors',
  pages: {
    list: '/pages',
    detail: (slug: string) => `/pages/${id(slug)}`,
  },
  account: {
    profile: '/account/profile',
    password: '/account/password',
    addresses: '/account/addresses',
    address: (addressId: string) => `/account/addresses/${id(addressId)}`,
  },
  orders: {
    list: '/orders',
    create: '/orders',
    detail: (orderId: string) => `/orders/${id(orderId)}`,
  },
  contact: '/contact',
} as const;
