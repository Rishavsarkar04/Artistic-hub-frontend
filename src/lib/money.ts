/** All prices are whole Indian rupees. */
const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

/** ₹2,499 — Indian digit grouping, no paise. */
export const formatPrice = (amount: number) => inr.format(Math.round(amount));

/** Orders at or above this subtotal ship free. */
export const FREE_SHIPPING_MIN = 1999;

const TAX_RATE = 0.0875;
export const calcTax = (subtotal: number) => Math.round(subtotal * TAX_RATE);
