/**
 * localStorage keys for the persisted stores, namespaced to the shop so they can't
 * clash with other apps on the same domain. Renaming a key discards what visitors
 * already have saved under the old one (their cart, their signed-in session).
 */
const NAMESPACE = 'ember-bloom';

export const STORAGE_KEYS = {
  session: `${NAMESPACE}:session`,
  cart: `${NAMESPACE}:cart`,
  orders: `${NAMESPACE}:orders`,
  /** Admin panel sign-in, kept apart from the customer session. */
  adminSession: `${NAMESPACE}:admin-session`,
} as const;
