export type AuthMode = 'login' | 'register' | 'forgot' | 'reset';

export type AccountSection = 'profile' | 'addresses' | 'orders' | 'order-detail';

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
