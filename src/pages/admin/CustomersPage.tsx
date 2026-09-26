import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Users, X } from 'lucide-react';
import { formatPrice } from '@/lib/money';
import { formatDate } from '@/lib/date';
import { paths } from '@/router/paths';
import { queryMockCustomers } from '@/data/admin/customers';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pagination, SearchBox, SegmentedTabs, SortSelect, useListQuery } from '@/components/admin/ListControls';
import type { AdminCustomer, CustomerQuery, CustomerSort, CustomerStatus } from '@/types';

const STATUS_TABS: { id: CustomerStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'blocked', label: 'Blocked' },
];
const SORTS: { id: CustomerSort; label: string }[] = [
  { id: 'newest', label: 'Newest first' },
  { id: 'oldest', label: 'Oldest first' },
  { id: 'name', label: 'Name A–Z' },
  { id: 'orders', label: 'Most orders' },
  { id: 'spent', label: 'Highest spend' },
];

const DEFAULTS: CustomerQuery = { q: '', status: 'all', sort: 'newest', page: 1, pageSize: 10 };
const parse = (p: URLSearchParams): CustomerQuery => ({
  ...DEFAULTS,
  q: p.get('q') ?? '',
  status: STATUS_TABS.find((t) => t.id === p.get('status'))?.id ?? 'all',
  sort: SORTS.find((s) => s.id === p.get('sort'))?.id ?? 'newest',
  page: Math.max(1, Number(p.get('page')) || 1),
});

/**
 * The customer list for the current query.
 * MOCK: swap the body for `useApiQuery<Paginated<AdminCustomer>>(endpoints.admin.customers.list, query)`;
 * the page already reads `data` and `isLoading` in that shape.
 */
function useCustomers(query: CustomerQuery) {
  const data = useMemo(() => queryMockCustomers(query), [query]);
  return { data, isLoading: false };
}

const initials = (c: AdminCustomer) => (c.firstName[0] ?? '') + (c.lastName[0] ?? '');

function StatusBadge({ status }: { status: CustomerStatus }) {
  return <Badge variant={status === 'active' ? 'success' : 'destructive'} className="capitalize">{status}</Badge>;
}

/** Order count that opens this customer's orders. */
function OrdersLink({ c }: { c: AdminCustomer }) {
  if (!c.ordersCount) return <span className="text-muted-foreground">0</span>;
  return (
    <Link to={paths.adminOrders({ customerId: c.id })} className="underline-offset-4 hover:underline" aria-label={`View ${c.ordersCount} orders by ${c.firstName} ${c.lastName}`}>
      {c.ordersCount}
    </Link>
  );
}

export function CustomersPage() {
  const { query, update } = useListQuery(DEFAULTS, parse);
  const { data, isLoading } = useCustomers(query);
  const filtered = query.q !== '' || query.status !== 'all';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-10">
      <div className="mb-6">
        <h1 className="font-serif text-3xl sm:text-4xl">Customers</h1>
        <p className="text-sm text-muted-foreground mt-1">Everyone who has an account with the shop.</p>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-4">
        <SearchBox value={query.q} onSearch={(q) => update({ q })} placeholder="Search name, email, phone or city" label="Search customers" />
        <div className="flex items-center gap-2 lg:ml-auto">
          <SegmentedTabs options={STATUS_TABS} value={query.status} onChange={(status) => update({ status })} label="Filter by status" />
          <SortSelect id="customer-sort" options={SORTS} value={query.sort} onChange={(sort) => update({ sort })} label="Sort customers" />
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3" aria-hidden>
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-12 rounded-xl bg-muted animate-pulse" />)}
          </div>
        ) : data.items.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <span className="mx-auto size-12 rounded-full bg-secondary flex items-center justify-center"><Users size={20} className="text-muted-foreground" /></span>
            <p className="font-medium mt-4">{filtered ? 'No customers match these filters' : 'No customers yet'}</p>
            {filtered && <Button variant="outline" size="sm" className="mt-4" onClick={() => update({ q: '', status: 'all' })}><X size={14} /> Clear filters</Button>}
          </div>
        ) : (
          <>
            {/* Table on larger screens */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th scope="col" className="font-medium px-5 py-3">Customer</th>
                    <th scope="col" className="font-medium px-3 py-3">Phone</th>
                    <th scope="col" className="font-medium px-3 py-3">City</th>
                    <th scope="col" className="font-medium px-3 py-3 text-right">Orders</th>
                    <th scope="col" className="font-medium px-3 py-3 text-right">Total spent</th>
                    <th scope="col" className="font-medium px-3 py-3">Joined</th>
                    <th scope="col" className="font-medium px-3 py-3">Last order</th>
                    <th scope="col" className="font-medium px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.items.map((c) => (
                    <tr key={c.id} className="hover:bg-secondary/40">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span className="size-9 shrink-0 rounded-full bg-secondary text-xs font-semibold flex items-center justify-center">{initials(c)}</span>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{c.firstName} {c.lastName}</p>
                            <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-muted-foreground tabular">{c.phone}</td>
                      <td className="px-3 py-3 text-muted-foreground">{c.city}</td>
                      <td className="px-3 py-3 text-right tabular"><OrdersLink c={c} /></td>
                      <td className="px-3 py-3 text-right tabular font-medium">{formatPrice(c.totalSpent)}</td>
                      <td className="px-3 py-3 whitespace-nowrap text-muted-foreground">{formatDate(c.joinedAt)}</td>
                      <td className="px-3 py-3 whitespace-nowrap text-muted-foreground">{c.lastOrderAt ? formatDate(c.lastOrderAt) : '—'}</td>
                      <td className="px-5 py-3"><StatusBadge status={c.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards on phones */}
            <ul className="md:hidden divide-y divide-border">
              {data.items.map((c) => (
                <li key={c.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="size-9 shrink-0 rounded-full bg-secondary text-xs font-semibold flex items-center justify-center">{initials(c)}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium truncate">{c.firstName} {c.lastName}</p>
                        <StatusBadge status={c.status} />
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{c.email} · {c.phone}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        <OrdersLink c={c} /> {c.ordersCount === 1 ? 'order' : 'orders'} · <span className="text-foreground font-medium">{formatPrice(c.totalSpent)}</span> · {c.city} · joined {formatDate(c.joinedAt)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <Pagination page={data.page} pageSize={data.pageSize} total={data.total} noun={['customer', 'customers']} onPage={(page) => update({ page })} />
    </div>
  );
}
