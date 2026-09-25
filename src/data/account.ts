import { products } from './products';
import { deliveryMethods } from './shipping';

// MOCK: the sample signed-in customer and their past orders.
export const mockUser = {
  id: 'u1',
  firstName: 'Eleanor',
  lastName: 'Voss',
  email: 'eleanor@example.com',
  phone: '+1 (415) 555-0142',
  addresses: [
    {
      id: 'a1',
      label: 'Home',
      firstName: 'Eleanor',
      lastName: 'Voss',
      phone: '+1 (415) 555-0142',
      line1: '2847 Ashbury Heights',
      line2: 'Apt 3B',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94117',
      country: 'United States',
      isDefault: true,
    },
    {
      id: 'a2',
      label: 'Work',
      firstName: 'Eleanor',
      lastName: 'Voss',
      phone: '+1 (415) 555-0100',
      line1: '150 Spear Street',
      line2: 'Suite 800',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94105',
      country: 'United States',
      isDefault: false,
    },
  ],
};

export const mockOrders = [
  {
    id: 'EB-20240318-4821',
    date: '2024-03-18',
    status: 'delivered' as const,
    paymentStatus: 'paid' as const,
    items: [
      {
        productId: 'p1',
        product: products[0],
        size: products[0].sizes[1],
        quantity: 2,
      },
      {
        productId: 'p3',
        product: products[2],
        size: products[2].sizes[0],
        quantity: 1,
      },
    ],
    subtotal: 4097,
    shipping: 0,
    tax: 358,
    total: 4455,
    shippingAddress: mockUser.addresses[0],
    billingAddress: mockUser.addresses[0],
    deliveryMethod: deliveryMethods[0],
    trackingNumber: '9400111899223456789012',
    trackingUrl: 'https://www.example-courier.in/track/9400111899223456789012', // MOCK: courier tracking link
    estimatedDelivery: '2024-03-23',
    transactionRef: 'txn_3OqW8NLkz2eZvT',
    paymentMethod: 'Visa •••• 4242',
  },
  {
    id: 'EB-20240215-2194',
    date: '2024-02-15',
    status: 'delivered' as const,
    paymentStatus: 'paid' as const,
    items: [
      {
        productId: 'p7',
        product: products[6],
        size: products[6].sizes[0],
        quantity: 1,
      },
    ],
    subtotal: 3199,
    shipping: 0,
    tax: 280,
    total: 3479,
    shippingAddress: mockUser.addresses[0],
    billingAddress: mockUser.addresses[0],
    deliveryMethod: deliveryMethods[0],
    trackingNumber: '9400111899223456781234',
    trackingUrl: 'https://www.example-courier.in/track/9400111899223456781234', // MOCK: courier tracking link
    estimatedDelivery: '2024-02-20',
    transactionRef: 'txn_2NqV7MLjy1dYuS',
    paymentMethod: 'Visa •••• 4242',
  },
];
