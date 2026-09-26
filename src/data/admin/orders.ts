import type { AdminOrder, AdminOrderDetail, AdminOrderItem, AdminShipment, OrderQuery, Paginated } from '@/types';
import { mockCustomers } from './customers';
import { mockAdminProducts, variantCover } from './products';
import { ApiError } from '@/api/client';

// MOCK: sample orders for the admin panel until endpoints.admin.orders.list is connected.
// Built from the sample customers, so each customer's order count, spend and last order date match.
const TODAY = Date.UTC(2026, 8, 26);
const DAY = 86_400_000;
const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10);

export const mockAdminOrders: AdminOrder[] = mockCustomers.flatMap((c, ci) => {
  if (!c.ordersCount || !c.lastOrderAt) return [];
  const first = Date.parse(c.joinedAt) + 3 * DAY;
  const last = Date.parse(c.lastOrderAt);
  const base = Math.floor(c.totalSpent / c.ordersCount);
  return Array.from({ length: c.ordersCount }, (_, i) => {
    const n = ci * 10 + i;
    // Spread orders from just after signing up to the last order; the last one lands exactly on it.
    const when = c.ordersCount === 1 ? last : Math.round(first + ((last - first) * i) / (c.ordersCount - 1));
    const age = (TODAY - when) / DAY;
    const cancelled = n % 11 === 7;
    const status: AdminOrder['status'] = cancelled ? 'cancelled' : age <= 5 ? 'processing' : age <= 10 ? 'shipped' : 'delivered';
    return {
      id: `EB-${iso(when).replace(/-/g, '')}-${String(1000 + ((n * 373) % 9000)).padStart(4, '0')}`,
      customerId: c.id,
      customerName: `${c.firstName} ${c.lastName}`,
      customerEmail: c.email,
      city: c.city,
      date: iso(when),
      itemsCount: 1 + (n % 3),
      // The last order takes the rounding remainder so the total matches the customer's spend.
      total: i === c.ordersCount - 1 ? c.totalSpent - base * (c.ordersCount - 1) : base,
      status,
      paymentStatus: cancelled ? 'refunded' : 'paid',
    };
  });
});

/**
 * MOCK: filters, sorts and pages the sample orders the way the API will, returning the same
 * `Paginated` shape. Replace with `useApiQuery<Paginated<AdminOrder>>(endpoints.admin.orders.list, query)`.
 */
export function queryMockOrders({ q, status, customerId, sort, page, pageSize }: OrderQuery): Paginated<AdminOrder> {
  const needle = q.trim().toLowerCase();
  const filtered = mockAdminOrders.filter(
    (o) =>
      (status === 'all' || o.status === status) &&
      (!customerId || o.customerId === customerId) &&
      (!needle || [o.id, o.customerName, o.customerEmail, o.city].join(' ').toLowerCase().includes(needle)),
  );
  const sorters: Record<OrderQuery['sort'], (a: AdminOrder, b: AdminOrder) => number> = {
    newest: (a, b) => b.date.localeCompare(a.date),
    oldest: (a, b) => a.date.localeCompare(b.date),
    'total-high': (a, b) => b.total - a.total,
    'total-low': (a, b) => a.total - b.total,
  };
  const sorted = [...filtered].sort(sorters[sort]);
  return { items: sorted.slice((page - 1) * pageSize, page * pageSize), total: sorted.length, page, pageSize };
}

// ---- Order details (MOCK) ------------------------------------------------------------------------

const STATE_OF: Record<string, string> = {
  Mumbai: 'Maharashtra', Pune: 'Maharashtra', Nagpur: 'Maharashtra', Delhi: 'Delhi', Gurugram: 'Haryana', Chandigarh: 'Chandigarh',
  Kochi: 'Kerala', Thiruvananthapuram: 'Kerala', Chennai: 'Tamil Nadu', Coimbatore: 'Tamil Nadu', Hyderabad: 'Telangana',
  Bengaluru: 'Karnataka', Kolkata: 'West Bengal', Lucknow: 'Uttar Pradesh', Jaipur: 'Rajasthan', Ahmedabad: 'Gujarat', Surat: 'Gujarat',
  Bhopal: 'Madhya Pradesh', Indore: 'Madhya Pradesh', Guwahati: 'Assam', Shimla: 'Himachal Pradesh', Patna: 'Bihar',
};
const addDays = (date: string, days: number) => iso(Date.parse(date) + days * DAY);

/**
 * MOCK: stands in for GET endpoints.admin.orders.detail(id). Line items are snapshots of real variants whose
 * prices are split so that subtotal + shipping + tax equals the order's total in the list.
 */
export function getMockOrderDetail(orderId: string): AdminOrderDetail | undefined {
  const order = mockAdminOrders.find((o) => o.id === orderId);
  if (!order) return undefined;
  const customer = mockCustomers.find((c) => c.id === order.customerId)!;
  const n = mockAdminOrders.indexOf(order);
  const shipping = order.total >= 2200 ? 0 : 99;
  const subtotal = Math.round((order.total - shipping) / 1.0875);
  const variants = mockAdminProducts.flatMap((p) => p.variants.map((v) => ({ p, v })));
  const base = Math.floor(subtotal / order.itemsCount);
  const items: AdminOrderItem[] = Array.from({ length: order.itemsCount }, (_, i) => {
    const { p, v } = variants[(n * 7 + i * 5) % variants.length];
    const unitPrice = i === order.itemsCount - 1 ? subtotal - base * (order.itemsCount - 1) : base;
    return {
      id: `${order.id}-${i + 1}`,
      variantId: v.id,
      productName: p.name,
      variantName: v.name,
      sku: v.sku,
      imageUrl: variantCover(v)?.url ?? null,
      unitPrice,
      originalPrice: v.original_price > v.effective_price ? Math.round(unitPrice * (v.original_price / v.effective_price)) : null,
      quantity: 1,
    };
  });
  const timeline: AdminOrderDetail['timeline'] = { placed: order.date, processing: order.date };
  if (order.status === 'shipped' || order.status === 'delivered') timeline.shipped = addDays(order.date, 2);
  if (order.status === 'delivered') timeline.delivered = addDays(order.date, 5);
  if (order.status === 'cancelled') timeline.cancelled = addDays(order.date, 1);
  return {
    ...order,
    customerPhone: customer.phone,
    shippingAddress: {
      name: order.customerName, line1: `${12 + (n % 80)}, ${['MG Road', 'Park Street', 'Linking Road', 'Anna Salai', 'Residency Road'][n % 5]}`,
      line2: n % 3 === 0 ? `Flat ${100 + (n % 9) * 11}` : '', city: order.city, state: STATE_OF[order.city] ?? '', postalCode: String(400001 + ((n * 137) % 90000)), country: 'India',
    },
    items,
    subtotal,
    shipping,
    tax: order.total - shipping - subtotal,
    paymentMethod: ['UPI', 'Card ending 4242', 'Net banking'][n % 3],
    // Shipped and delivered sample orders already have delivery details; newer ones don't yet.
    shipment: savedShipments[order.id] ?? (order.status === 'shipped' || order.status === 'delivered'
      ? { courier: COURIERS[n % COURIERS.length], trackingNumber: `${['DL', 'BD', 'DT', 'IP', 'EE', 'XB', 'SR'][n % 7]}${String(1_000_000_000 + n * 7_654_321).slice(0, 10)}` }
      : null),
    timeline,
  };
}

/** Delivery providers offered in the form; anything else can be typed in as "Other". */
export const COURIERS = ['Delhivery', 'Blue Dart', 'DTDC', 'India Post', 'Ecom Express', 'Xpressbees', 'Shiprocket'];

/** MOCK: delivery details saved during this visit, by order id. */
const savedShipments: Record<string, AdminShipment> = {};

/** MOCK: stands in for PUT endpoints.admin.orders.shipment(id) with `{ courier, tracking_number }`. */
export async function saveMockShipment(orderId: string, shipment: AdminShipment): Promise<AdminShipment> {
  await new Promise((r) => setTimeout(r, 600));
  if (!mockAdminOrders.some((o) => o.id === orderId)) throw new ApiError(404, 'This order no longer exists.');
  savedShipments[orderId] = shipment;
  return shipment;
}
