import type { AdminCustomer, CustomerQuery, Paginated } from '@/types';

// MOCK: sample customers for the admin panel until endpoints.admin.customers.list is connected.
// [firstName, lastName, city, orders, spent (₹), joined, last order, status]
const rows: [string, string, string, number, number, string, string | null, AdminCustomer['status']][] = [
  ['Eleanor', 'Voss', 'Mumbai', 2, 7934, '2024-01-12', '2024-03-18', 'active'],
  ['Aarav', 'Sharma', 'Delhi', 5, 11495, '2024-02-03', '2026-08-30', 'active'],
  ['Priya', 'Nair', 'Kochi', 3, 5397, '2024-02-19', '2026-07-14', 'active'],
  ['Rohan', 'Mehta', 'Pune', 1, 899, '2024-03-07', '2024-03-07', 'active'],
  ['Ananya', 'Iyer', 'Chennai', 8, 21892, '2024-03-22', '2026-09-20', 'active'],
  ['Kabir', 'Singh', 'Chandigarh', 0, 0, '2024-04-10', null, 'active'],
  ['Meera', 'Kapoor', 'Delhi', 4, 9196, '2024-04-28', '2026-06-02', 'active'],
  ['Vihaan', 'Reddy', 'Hyderabad', 2, 3298, '2024-05-15', '2025-12-11', 'blocked'],
  ['Isha', 'Banerjee', 'Kolkata', 6, 14394, '2024-06-01', '2026-09-05', 'active'],
  ['Arjun', 'Pillai', 'Bengaluru', 3, 6297, '2024-06-19', '2026-04-23', 'active'],
  ['Saanvi', 'Joshi', 'Pune', 1, 1599, '2024-07-08', '2024-07-08', 'active'],
  ['Aditya', 'Verma', 'Lucknow', 0, 0, '2024-07-30', null, 'active'],
  ['Diya', 'Chatterjee', 'Kolkata', 7, 18293, '2024-08-14', '2026-09-18', 'active'],
  ['Reyansh', 'Gupta', 'Jaipur', 2, 4398, '2024-09-02', '2026-01-29', 'active'],
  ['Kavya', 'Menon', 'Thiruvananthapuram', 4, 8796, '2024-09-25', '2026-08-11', 'active'],
  ['Ishaan', 'Malhotra', 'Gurugram', 1, 2499, '2024-10-11', '2024-10-11', 'blocked'],
  ['Myra', 'Desai', 'Ahmedabad', 5, 12495, '2024-11-03', '2026-09-12', 'active'],
  ['Atharv', 'Kulkarni', 'Nagpur', 0, 0, '2024-11-27', null, 'active'],
  ['Anika', 'Rao', 'Bengaluru', 3, 7197, '2025-01-09', '2026-07-30', 'active'],
  ['Vivaan', 'Bhatt', 'Surat', 2, 2798, '2025-02-14', '2026-02-20', 'active'],
  ['Aadhya', 'Saxena', 'Bhopal', 1, 3199, '2025-03-21', '2025-03-21', 'active'],
  ['Krishna', 'Das', 'Guwahati', 6, 15594, '2025-04-30', '2026-09-22', 'active'],
  ['Navya', 'Agarwal', 'Indore', 2, 3798, '2025-06-06', '2026-05-17', 'active'],
  ['Sai', 'Krishnan', 'Coimbatore', 0, 0, '2025-07-19', null, 'blocked'],
  ['Pari', 'Thakur', 'Shimla', 4, 10396, '2025-09-02', '2026-09-01', 'active'],
  ['Dhruv', 'Chopra', 'Mumbai', 1, 1699, '2025-11-15', '2025-11-15', 'active'],
  ['Riya', 'Sinha', 'Patna', 3, 6897, '2026-01-20', '2026-09-19', 'active'],
  ['Ayaan', 'Khan', 'Hyderabad', 1, 2099, '2026-04-08', '2026-04-08', 'active'],
];

export const mockCustomers: AdminCustomer[] = rows.map(([firstName, lastName, city, ordersCount, totalSpent, joinedAt, lastOrderAt, status], i) => ({
  id: `c${String(i + 1).padStart(3, '0')}`,
  firstName,
  lastName,
  email: `${firstName}.${lastName}@example.com`.toLowerCase(),
  phone: `+91 98${String(20000000 + i * 734219).slice(0, 8)}`,
  city,
  ordersCount,
  totalSpent,
  joinedAt,
  lastOrderAt,
  status,
}));

/**
 * MOCK: filters, sorts and pages the sample customers the way the API will, returning the same
 * `Paginated` shape. Replace with `useApiQuery<Paginated<AdminCustomer>>(endpoints.admin.customers.list, query)`.
 */
export function queryMockCustomers({ q, status, sort, page, pageSize }: CustomerQuery): Paginated<AdminCustomer> {
  const needle = q.trim().toLowerCase();
  const filtered = mockCustomers.filter(
    (c) =>
      (status === 'all' || c.status === status) &&
      (!needle || [c.firstName, c.lastName, c.email, c.phone, c.city].join(' ').toLowerCase().includes(needle)),
  );
  const sorters: Record<CustomerQuery['sort'], (a: AdminCustomer, b: AdminCustomer) => number> = {
    newest: (a, b) => b.joinedAt.localeCompare(a.joinedAt),
    oldest: (a, b) => a.joinedAt.localeCompare(b.joinedAt),
    name: (a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`),
    orders: (a, b) => b.ordersCount - a.ordersCount,
    spent: (a, b) => b.totalSpent - a.totalSpent,
  };
  const sorted = [...filtered].sort(sorters[sort]);
  return { items: sorted.slice((page - 1) * pageSize, page * pageSize), total: sorted.length, page, pageSize };
}
