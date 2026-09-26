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
  admin: {
    auth: {
      login: '/admin/auth/login',
      logout: '/admin/auth/logout',
    },
    customers: {
      /** GET with `q`, `status`, `sort`, `page`, `pageSize`; returns `Paginated<AdminCustomer>`. */
      list: '/admin/customers',
      detail: (customerId: string) => `/admin/customers/${id(customerId)}`,
    },
    orders: {
      /** GET with `q`, `status`, `customerId`, `sort`, `page`, `pageSize`; returns `Paginated<AdminOrder>`. */
      list: '/admin/orders',
      /** GET the full order (items, address, payment, timeline) as `AdminOrderDetail`. */
      detail: (orderId: string) => `/admin/orders/${id(orderId)}`,
      /** PUT `{ courier, tracking_number }` to add or change the order's delivery details. */
      shipment: (orderId: string) => `/admin/orders/${id(orderId)}/shipment`,
    },
    tags: {
      /** GET all tags as `AdminTag[]`. */
      list: '/admin/tags',
      /** POST `{ name }`; returns the created `AdminTag` (422 if the name is taken). */
      create: '/admin/tags',
    },
    uploads: {
      /** POST multipart form data with a `file` field; returns `{ url }` to save on a variant. */
      image: '/admin/uploads/images',
    },
    products: {
      /** GET with `q`, `status`, `sort`, `page`, `pageSize`; returns `Paginated<AdminProduct>` (each with its variants and images). */
      list: '/admin/products',
      /** POST a `NewAdminProduct`; returns the created `AdminProduct`. */
      create: '/admin/products',
      /** GET one product with its variants and their images. */
      detail: (productId: number) => `/admin/products/${id(productId)}`,
      /** PUT the whole `NewAdminProduct`; variants with an id are updated, without are created, missing are deleted. */
      update: (productId: number) => `/admin/products/${id(productId)}`,
      /** DELETE the product with its variants, their photos and tag links. */
      delete: (productId: number) => `/admin/products/${id(productId)}`,
      variants: {
        /** DELETE one variant (and its photos and tag links); refused if it's the product's last variant. */
        delete: (productId: number, variantId: number) => `/admin/products/${id(productId)}/variants/${id(variantId)}`,
      },
    },
  },
} as const;
