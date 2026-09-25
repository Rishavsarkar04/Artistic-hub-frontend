import type { Product, ProductSize } from './product';
import type { Address } from './user';

export interface CartItem {
  productId: string;
  product: Product;
  size: ProductSize;
  quantity: number;
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
