import { generatePath } from 'react-router-dom';

/**
 * Every route pattern, in one place. `<Route path>` in router.tsx uses these directly,
 * and `paths` below fills in their params, so each URL is written exactly once.
 */
export const ROUTES = {
  home: '/',
  shop: '/shop',
  product: '/products/:productId',
  cart: '/cart',
  checkout: '/checkout',
  orderConfirmation: '/order-confirmation/:orderId',
  account: '/account',
  accountTab: '/account/:tab',
  accountOrder: '/account/orders/:orderId',
  story: '/story',
  contact: '/contact',
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  /** A CMS page (privacy policy, terms, …). */
  page: '/pages/:slug',
  // Admin panel
  adminLogin: '/admin/login',
  adminForgotPassword: '/admin/forgot-password',
  adminResetPassword: '/admin/reset-password',
  admin: '/admin',
  adminCustomers: '/admin/customers',
  adminOrders: '/admin/orders',
  adminOrder: '/admin/orders/:orderId',
  adminProducts: '/admin/products',
  adminProductNew: '/admin/products/new',
  adminProductEdit: '/admin/products/:productId/edit',
  notFound: '*',
} as const;

export type AccountTab = 'profile' | 'addresses' | 'orders';
export const ACCOUNT_TABS: AccountTab[] = ['profile', 'addresses', 'orders'];

const withQuery = (path: string, query: Record<string, string | undefined>) => {
  const qs = new URLSearchParams(Object.entries(query).filter((e): e is [string, string] => !!e[1])).toString();
  return qs ? `${path}?${qs}` : path;
};

/** Ready-to-use URLs for links and `navigate()`. Params are URL-encoded by `generatePath`. */
export const paths = {
  home: ROUTES.home,
  /** Shop listing. `collection` 'All' is the default and is left out of the URL; `tag` preselects a tag filter. */
  shop: ({ collection, tag }: { collection?: string; tag?: string } = {}) =>
    withQuery(ROUTES.shop, { collection: collection && collection !== 'All' ? collection : undefined, tag }),
  product: (productId: string) => generatePath(ROUTES.product, { productId }),
  cart: ROUTES.cart,
  checkout: ROUTES.checkout,
  orderConfirmation: (orderId: string) => generatePath(ROUTES.orderConfirmation, { orderId }),
  account: (tab: AccountTab = 'profile') => generatePath(ROUTES.accountTab, { tab }),
  accountOrder: (orderId: string) => generatePath(ROUTES.accountOrder, { orderId }),
  story: ROUTES.story,
  contact: ROUTES.contact,
  login: ROUTES.login,
  register: ROUTES.register,
  forgotPassword: ROUTES.forgotPassword,
  /** The page the customer reset email links to (the backend builds that link with its token). */
  resetPassword: (token?: string) => withQuery(ROUTES.resetPassword, { token }),
  page: (slug: string) => generatePath(ROUTES.page, { slug }),
  adminLogin: ROUTES.adminLogin,
  adminForgotPassword: ROUTES.adminForgotPassword,
  /** The page the reset email links to (the backend builds that link with its token). */
  adminResetPassword: (token?: string) => withQuery(ROUTES.adminResetPassword, { token }),
  admin: ROUTES.admin,
  /** Customer list; all filters are optional and default values are left out of the URL. */
  adminCustomers: ({ q, status, sort, page }: { q?: string; status?: string; sort?: string; page?: number } = {}) =>
    withQuery(ROUTES.adminCustomers, {
      q: q || undefined,
      status: status && status !== 'all' ? status : undefined,
      sort: sort && sort !== 'newest' ? sort : undefined,
      page: page && page > 1 ? String(page) : undefined,
    }),
  /** Product list (each product with its variants). */
  adminProducts: ({ q, status, sort, page }: { q?: string; status?: string; sort?: string; page?: number } = {}) =>
    withQuery(ROUTES.adminProducts, {
      q: q || undefined,
      status: status && status !== 'all' ? status : undefined,
      sort: sort && sort !== 'newest' ? sort : undefined,
      page: page && page > 1 ? String(page) : undefined,
    }),
  adminProductNew: ROUTES.adminProductNew,
  /** Edit page; pass `variantId` to open that variant's card on arrival. */
  adminProductEdit: (productId: number, variantId?: number) =>
    withQuery(generatePath(ROUTES.adminProductEdit, { productId: String(productId) }), { variant: variantId !== undefined ? String(variantId) : undefined }),
  adminOrder: (orderId: string) => generatePath(ROUTES.adminOrder, { orderId }),
  /** Order list; pass `customerId` to show only that customer's orders. */
  adminOrders: ({ q, status, sort, page, customerId }: { q?: string; status?: string; sort?: string; page?: number; customerId?: string } = {}) =>
    withQuery(ROUTES.adminOrders, {
      q: q || undefined,
      status: status && status !== 'all' ? status : undefined,
      customerId,
      sort: sort && sort !== 'newest' ? sort : undefined,
      page: page && page > 1 ? String(page) : undefined,
    }),
} as const;
