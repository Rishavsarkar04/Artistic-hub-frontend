export type AuthMode = 'login' | 'register' | 'forgot' | 'reset';

export type AccountSection = 'profile' | 'addresses' | 'orders' | 'order-detail';

export interface Tag {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  collection: string;
  scent: string;
  scentNotes: { top: string[]; middle: string[]; base: string[] };
  waxType: string;
  burnTime: string;
  dimensions: string;
  description: string;
  sizes: ProductSize[];
  /** One-line description shown under the name on product cards. */
  shortNote: string;
  /** Ids from `tags` in `src/data/tags.ts`. */
  tags: string[];
  /** Id from `colors` in `src/data/tags.ts`. */
  color: string;
  /** Ids of products listed under "Variants" on the product page. */
  variantIds: string[];
  isBestseller?: boolean;
  isNew?: boolean;
  inStock: boolean;
}

export interface ProductSize {
  label: string;
  weight: string;
  price: number;
  /** Price before discount; when higher than `price`, it's shown struck through. */
  originalPrice?: number;
  inStock: boolean;
}

export interface CartItem {
  productId: string;
  product: Product;
  size: ProductSize;
  quantity: number;
}

export interface Address {
  id: string;
  label: string;
  firstName: string;
  lastName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addresses: Address[];
}

export interface Order {
  id: string;
  date: string;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded';
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: Address;
  billingAddress: Address;
  deliveryMethod: DeliveryMethod;
  trackingNumber?: string;
  /** Courier's tracking page for this shipment, once it has shipped. */
  trackingUrl?: string;
  estimatedDelivery: string;
  transactionRef: string;
  paymentMethod: string;
}

export interface DeliveryMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
}

/** A row from the CMS `pages` table. */
export interface CmsPage {
  id: number;
  title: string;
  slug: string;
  /** Rich-text HTML from the editor. */
  content: string;
  status: 'draft' | 'published';
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppState {
  orders: Order[];
}

export type AppAction = { type: 'PLACE_ORDER'; order: Order };
