/** A signed-in staff member of the admin panel (separate from shop customers). */
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'staff';
}

export type CustomerStatus = 'active' | 'blocked';

/** A shop customer as the admin panel lists them. */
export interface AdminCustomer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  ordersCount: number;
  /** Lifetime spend in whole rupees. */
  totalSpent: number;
  joinedAt: string;
  lastOrderAt: string | null;
  status: CustomerStatus;
}

export type CustomerSort = 'newest' | 'oldest' | 'name' | 'orders' | 'spent';

/** Query the customer list sends to the API (and mirrors in the page URL). */
export interface CustomerQuery {
  q: string;
  status: CustomerStatus | 'all';
  sort: CustomerSort;
  page: number;
  pageSize: number;
}

/** The shape of any paginated list response from the API. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type AdminOrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled';

/** An order as the admin panel lists it, with who placed it. */
export interface AdminOrder {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  city: string;
  date: string;
  itemsCount: number;
  /** Order total in whole rupees. */
  total: number;
  status: AdminOrderStatus;
  paymentStatus: 'paid' | 'pending' | 'refunded';
}

export type OrderSort = 'newest' | 'oldest' | 'total-high' | 'total-low';

/** Query the order list sends to the API (and mirrors in the page URL). */
export interface OrderQuery {
  q: string;
  status: AdminOrderStatus | 'all';
  /** Only this customer's orders, when set. */
  customerId: string | null;
  sort: OrderSort;
  page: number;
  pageSize: number;
}

// Products and variants mirror the API's `products` and `product_variants` tables, field for field.
// Prices are in paise (50000 = ₹500); format them with `formatPaise` from `src/lib/money.ts`.

/** A variant photo (proposed `product_variant_images` table). The lowest `sort_order` is the variant's cover. */
export interface AdminVariantImage {
  id: number;
  variant_id: number;
  url: string;
  /** Describes the photo for screen readers and search engines. */
  alt_text: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/** One sellable option of a product, e.g. the 8 oz size, with its own SKU, prices, stock and photos. */
export interface AdminVariant {
  id: number;
  product_id: number;
  name: string;
  /** Unique across all variants. */
  slug: string;
  /** Falls back to the product's description when null. */
  description: string | null;
  /** Unique across all variants. */
  sku: string;
  /** List price (MRP) in paise. */
  original_price: number;
  /** Price the customer pays, in paise; never more than `original_price`. */
  effective_price: number;
  stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  images: AdminVariantImage[];
  /** The variant's tags (proposed `product_variant_tag`), e.g. Woody, Best seller. */
  tags: AdminTag[];
}

/** A tag (proposed `tags` table, linked to variants through `product_variant_tag`). */
export interface AdminTag {
  id: number;
  name: string;
  slug: string;
}

/** A product with its variants (one or more). Photos and tags belong to the variants. */
export interface AdminProduct {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  variants: AdminVariant[];
}

/** What the product form sends: fields the admin sets, without server ids and timestamps. */
export type NewAdminVariantImage = Pick<AdminVariantImage, 'url' | 'alt_text' | 'sort_order'>;
export type NewAdminVariant = Pick<AdminVariant, 'name' | 'slug' | 'description' | 'sku' | 'original_price' | 'effective_price' | 'stock' | 'is_active'> & {
  images: NewAdminVariantImage[];
  tag_ids: number[];
  /** Set when editing an existing variant; variants sent without an id are created, ones left out are deleted. */
  id?: number;
};
export type NewAdminProduct = Pick<AdminProduct, 'name' | 'description' | 'is_active'> & { variants: NewAdminVariant[] };

export type ProductStatusFilter = 'all' | 'active' | 'inactive';
export type ProductSort = 'newest' | 'name' | 'price-low' | 'price-high' | 'stock-low';

/** Query the product list sends to the API (and mirrors in the page URL). */
export interface ProductQuery {
  q: string;
  status: ProductStatusFilter;
  sort: ProductSort;
  page: number;
  pageSize: number;
}
