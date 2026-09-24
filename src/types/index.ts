export type Page =
  | 'home'
  | 'listing'
  | 'detail'
  | 'cart'
  | 'auth'
  | 'checkout'
  | 'confirmation'
  | 'account'
  | 'story'
  | 'contact';

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
  /** Ids from `tags` in `src/data/tags.ts`. */
  tags: string[];
  /** Id from `colors` in `src/data/tags.ts`. */
  color: string;
  isBestseller?: boolean;
  isNew?: boolean;
  inStock: boolean;
}

export interface ProductSize {
  label: string;
  weight: string;
  price: number;
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

export interface AppState {
  currentPage: Page;
  /** Where the last navigation came from, for back buttons. */
  previousPage: Page;
  currentProductId: string | null;
  currentOrderId: string | null;
  accountSection: AccountSection;
  authMode: AuthMode;
  cart: CartItem[];
  user: User | null;
  orders: Order[];
  checkoutPendingProduct: { productId: string; size: ProductSize } | null;
  listingCollection: string;
  listingScent: string | null;
}

export type AppAction =
  | { type: 'NAVIGATE'; page: Page; productId?: string; orderId?: string; accountSection?: AccountSection; collection?: string; scent?: string | null }
  | { type: 'SET_AUTH_MODE'; mode: AuthMode }
  | { type: 'LOGIN'; user: User }
  | { type: 'LOGOUT' }
  | { type: 'ADD_TO_CART'; item: CartItem }
  | { type: 'UPDATE_CART_QTY'; productId: string; sizeLabel: string; qty: number }
  | { type: 'REMOVE_FROM_CART'; productId: string; sizeLabel: string }
  | { type: 'CLEAR_CART' }
  | { type: 'PLACE_ORDER'; order: Order }
  | { type: 'UPDATE_USER'; user: User }
  | { type: 'ADD_ADDRESS'; address: Address }
  | { type: 'UPDATE_ADDRESS'; address: Address }
  | { type: 'DELETE_ADDRESS'; id: string }
  | { type: 'SET_DEFAULT_ADDRESS'; id: string };
