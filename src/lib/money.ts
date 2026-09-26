/** All prices are whole Indian rupees. */
const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

/** ₹2,499 — Indian digit grouping, no paise. */
export const formatPrice = (amount: number) => inr.format(Math.round(amount));

// The admin API sends prices in paise (50000 = ₹500). Show paise only when there are any: ₹500, ₹499.50.
const inrPaise = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const formatPaise = (paise: number) => (paise % 100 === 0 ? inr.format(paise / 100) : inrPaise.format(paise / 100));
/** Rupees typed in a form (e.g. "499.50") to whole paise for the API. */
export const rupeesToPaise = (rupees: number) => Math.round(rupees * 100);

/** Orders at or above this subtotal ship free. */
export const FREE_SHIPPING_MIN = 1999;

const TAX_RATE = 0.0875;
export const calcTax = (subtotal: number) => Math.round(subtotal * TAX_RATE);
