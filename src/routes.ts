/**
 * Every URL in the app, in one place. Build links with these helpers rather than
 * writing paths by hand, so a route can change here without hunting through pages.
 */
export type AccountTab = 'profile' | 'addresses' | 'orders';
export const ACCOUNT_TABS: AccountTab[] = ['profile', 'addresses', 'orders'];

const enc = (v: string) => encodeURIComponent(v);
const withQuery = (path: string, query: Record<string, string | undefined>) => {
  const qs = new URLSearchParams(Object.entries(query).filter((e): e is [string, string] => !!e[1])).toString();
  return qs ? `${path}?${qs}` : path;
};

export const paths = {
  home: '/',
  /** Shop listing. `collection` 'All' is the default and is left out of the URL; `tag` preselects a tag filter. */
  shop: ({ collection, tag }: { collection?: string; tag?: string } = {}) =>
    withQuery('/shop', { collection: collection && collection !== 'All' ? collection : undefined, tag }),
  product: (productId: string) => `/products/${enc(productId)}`,
  cart: '/cart',
  checkout: '/checkout',
  orderConfirmation: (orderId: string) => `/order-confirmation/${enc(orderId)}`,
  account: (tab: AccountTab = 'profile') => `/account/${tab}`,
  accountOrder: (orderId: string) => `/account/orders/${enc(orderId)}`,
  story: '/story',
  contact: '/contact',
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  /** A CMS page (privacy policy, terms, …). */
  page: (slug: string) => `/pages/${enc(slug)}`,
} as const;
