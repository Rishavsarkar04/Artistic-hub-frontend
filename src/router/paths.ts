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
  /** A CMS page (privacy policy, terms, …). */
  page: '/pages/:slug',
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
  page: (slug: string) => generatePath(ROUTES.page, { slug }),
} as const;
