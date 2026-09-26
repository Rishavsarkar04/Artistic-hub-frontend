import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Package, X } from 'lucide-react';
import { formatPrice } from '@/lib/money';
import { formatDate } from '@/lib/date';
import { paths } from '@/router/paths';
import { queryMockOrders } from '@/data/admin/orders';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pagination, SearchBox, SegmentedTabs, SortSelect, useListQuery } from '@/components/admin/ListControls';
import type { AdminOrder, AdminOrderStatus, OrderQuery, OrderSort } from '@/types';

const STATUS_TABS: { id: AdminOrderStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'processing', label: 'Processing' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'cancelled', label: 'Cancelled' },
];
const SORTS: { id: OrderSort; label: string }[] = [
  { id: 'newest', label: 'Newest first' },
  { id: 'oldest', label: 'Oldest first' },
  { id: 'total-high', label: 'Total: high to low' },
  { id: 'total-low', label: 'Total: low to high' },
];
const STATUS_BADGE: Record<AdminOrderStatus, 'warning' | 'secondary' | 'success' | 'destructive'> = {
  processing: 'warning',
  shipped: 'secondary',
  delivered: 'success',
  cancelled: 'destructive',
};

const DEFAULTS: OrderQuery = { q: '', status: 'all', customerId: null, sort: 'newest', page: 1, pageSize: 10 };
const parse = (p: URLSearchParams): OrderQuery => ({
  ...DEFAULTS,
  q: p.get('q') ?? '',
  status: STATUS_TABS.find((t) => t.id === p.get('status'))?.id ?? 'all',
  customerId: p.get('customerId'),
  sort: SORTS.find((s) => s.id === p.get('sort'))?.id ?? 'newest',
  page: Math.max(1, Number(p.get('page')) || 1),
});

/**
 * The order list for the current query.
 * MOCK: swap the body for `useApiQuery<Paginated<AdminOrder>>(endpoints.admin.orders.list, query)`.
 */
function useOrders(query: OrderQuery) {
  const data = useMemo(() => queryMockOrders(query), [query]);
  return { data, isLoading: false };
}

function StatusBadge({ status }: { status: AdminOrderStatus }) {
  return <Badge variant={STATUS_BADGE[status]} className="capitalize">{status}</Badge>;
}

/** Customer name that narrows the list to their orders. */
function CustomerLink({ o, className }: { o: AdminOrder; className?: string }) {
  return (
    <Link to={paths.adminOrders({ customerId: o.customerId })} className={`font-medium underline-offset-4 hover:underline ${className ?? ''}`} title={`Show only ${o.customerName}'s orders`}>
      {o.customerName}
    </Link>
  );
}

export function OrdersPage() {
  const { query, update } = useListQuery(DEFAULTS, parse);
  const { data, isLoading } = useOrders(query);
  const filtered = query.q !== '' || query.status !== 'all' || !!query.customerId;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-10">
      <div className="mb-6">
        <h1 className="font-serif text-3xl sm:text-4xl">Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">Every order placed in the shop, and who placed it.</p>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-4">
        <SearchBox value={query.q} onSearch={(q) => update({ q })} placeholder="Search order number, customer or city" label="Search orders" />
        <div className="flex items-center gap-2 lg:ml-auto min-w-0">
          <SegmentedTabs options={STATUS_TABS} value={query.status} onChange={(status) => update({ status })} label="Filter by status" />
          <SortSelect id="order-sort" options={SORTS} value={query.sort} onChange={(sort) => update({ sort })} label="Sort orders" />
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3" aria-hidden>
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-12 rounded-xl bg-muted animate-pulse" />)}
          </div>
        ) : data.items.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <span className="mx-auto size-12 rounded-full bg-secondary flex items-center justify-center"><Package size={20} className="text-muted-foreground" /></span>
            <p className="font-medium mt-4">{filtered ? 'No orders match these filters' : 'No orders yet'}</p>
            {filtered && <Button variant="outline" size="sm" className="mt-4" onClick={() => update({ q: '', status: 'all', customerId: null })}><X size={14} /> Clear filters</Button>}
          </div>
        ) : (
          <>
            {/* Table on larger screens */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th scope="col" className="font-medium px-5 py-3">Order</th>
                    <th scope="col" className="font-medium px-3 py-3">Customer</th>
                    <th scope="col" className="font-medium px-3 py-3">Date</th>
                    <th scope="col" className="font-medium px-3 py-3 text-right">Items</th>
                    <th scope="col" className="font-medium px-3 py-3 text-right">Total</th>
                    <th scope="col" className="font-medium px-3 py-3">Payment</th>
                    <th scope="col" className="font-medium px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.items.map((o) => (
                    <tr key={o.id} className="hover:bg-secondary/40">
                      <td className="px-5 py-3 font-mono text-[13px] whitespace-nowrap">{o.id}</td>
                      <td className="px-3 py-3">
                        <CustomerLink o={o} />
                        <p className="text-xs text-muted-foreground truncate">{o.customerEmail} · {o.city}</p>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-muted-foreground">{formatDate(o.date)}</td>
                      <td className="px-3 py-3 text-right tabular">{o.itemsCount}</td>
                      <td className="px-3 py-3 text-right tabular font-medium">{formatPrice(o.total)}</td>
                      <td className="px-3 py-3 capitalize text-muted-foreground">{o.paymentStatus}</td>
                      <td className="px-5 py-3"><StatusBadge status={o.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards on phones */}
            <ul className="md:hidden divide-y divide-border">
              {data.items.map((o) => (
                <li key={o.id} className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono text-[13px]">{o.id}</p>
                    <StatusBadge status={o.status} />
                  </div>
                  <p className="text-sm mt-1.5"><CustomerLink o={o} /></p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(o.date)} · {o.itemsCount} {o.itemsCount === 1 ? 'item' : 'items'} · <span className="text-foreground font-medium">{formatPrice(o.total)}</span> · <span className="capitalize">{o.paymentStatus}</span>
                  </p>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <Pagination page={data.page} pageSize={data.pageSize} total={data.total} noun={['order', 'orders']} onPage={(page) => update({ page })} />
    </div>
  );
}
