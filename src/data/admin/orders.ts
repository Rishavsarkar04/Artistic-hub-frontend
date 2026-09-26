import type { AdminOrder, OrderQuery, Paginated } from '@/types';
import { mockCustomers } from './customers';

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
