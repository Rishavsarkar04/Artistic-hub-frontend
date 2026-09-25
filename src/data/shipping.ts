import type { DeliveryMethod } from '@/types';

// MOCK: the courier options; they still name US carriers until the real Indian couriers are chosen.
export const deliveryMethods: DeliveryMethod[] = [
  {
    id: 'standard',
    name: 'Standard Shipping',
    description: 'USPS First Class',
    price: 99,
    estimatedDays: '5–7 business days',
  },
  {
    id: 'expedited',
    name: 'Expedited Shipping',
    description: 'UPS 2-Day',
    price: 249,
    estimatedDays: '2–3 business days',
  },
  {
    id: 'overnight',
    name: 'Overnight Shipping',
    description: 'FedEx Next Day',
    price: 499,
    estimatedDays: '1 business day',
  },
];
