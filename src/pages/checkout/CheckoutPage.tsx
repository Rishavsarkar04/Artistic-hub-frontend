import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { paths } from '@/router/paths';
import { formatPrice, calcTax, FREE_SHIPPING_MIN } from '@/lib/money';
import { fullName } from '@/lib/utils';
import { ChevronRight, Lock } from 'lucide-react';
import { useOrdersStore } from '@/stores/ordersStore';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore, useCartTotal } from '@/stores/cartStore';
import { deliveryMethods } from '@/data/shipping';
import type { Address, Order, DeliveryMethod } from '@/types';
import { Button } from '@/components/ui/button';
import { TextField, SelectField } from '@/components/shared/FormField';
import { StepIndicator, type Step } from './StepIndicator';
import { OrderSummary } from './OrderSummary';

export function CheckoutPage() {
  const addOrder = useOrdersStore((s) => s.add);
  const navigate = useNavigate();
  const cart = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clear);
  const cartTotal = useCartTotal();
  const user = useAuthStore((s) => s.user);
  const [step, setStep] = useState<Step>('shipping');
  const [paymentState, setPaymentState] = useState<'idle' | 'processing' | 'failed'>('idle');

  const savedAddresses = user?.addresses ?? [];
  const defaultAddr = savedAddresses.find((a) => a.isDefault) ?? savedAddresses[0];

  const [selectedAddressId, setSelectedAddressId] = useState<string | 'new'>(defaultAddr?.id ?? 'new');
  const [newAddress, setNewAddress] = useState<Partial<Address>>({
    label: 'Home', country: 'United States',
  });
  const [saveAddress, setSaveAddress] = useState(false);

  // No delivery step: every order ships standard.
  const selectedDelivery: DeliveryMethod = deliveryMethods[0];

  const shippingAddress: Address =
    selectedAddressId !== 'new'
      ? (savedAddresses.find((a) => a.id === selectedAddressId) as Address)
      : ({
          id: 'new',
          ...newAddress,
          isDefault: false,
        } as Address);

  const shipping = cartTotal >= FREE_SHIPPING_MIN ? 0 : selectedDelivery.price;
  const tax = calcTax(cartTotal);
  const total = cartTotal + shipping + tax;

  const handlePlaceOrder = async () => {
    setPaymentState('processing');
    await new Promise((r) => setTimeout(r, 2000));

    // MOCK: open the payment gateway here and place the order once it confirms. Simulates a 90% success rate.
    if (Math.random() < 0.1) {
      setPaymentState('failed');
      return;
    }

    const order: Order = {
      id: `EB-${Date.now().toString().slice(-8)}`,
      date: new Date().toISOString().split('T')[0],
      status: 'processing',
      paymentStatus: 'paid',
      items: cart,
      subtotal: cartTotal,
      shipping,
      tax,
      total,
      shippingAddress,
      billingAddress: shippingAddress,
      deliveryMethod: selectedDelivery,
      estimatedDelivery: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      transactionRef: `txn_${Math.random().toString(36).slice(2)}`,
      paymentMethod: 'Online payment', // MOCK: use the method reported by the payment gateway
    };

    addOrder(order);
    clearCart();
    // Replace so Back from the confirmation doesn't return to a finished checkout.
    navigate(paths.orderConfirmation(order.id), { replace: true });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <button onClick={() => navigate(paths.cart)} className="hover:text-foreground transition-colors">Cart</button>
        <ChevronRight size={14} />
        <span className="text-foreground capitalize">{step}</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <StepIndicator current={step} onSelect={setStep} />

          {/* Shipping step */}
          {step === 'shipping' && (
            <div className="space-y-6">
              <h2 className="font-serif text-2xl font-semibold">Shipping Address</h2>

              {savedAddresses.length > 0 && (
                <div className="space-y-3">
                  {savedAddresses.map((addr) => (
                    <label key={addr.id} className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${selectedAddressId === addr.id ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80'}`}>
                      <input
                        type="radio"
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="mt-0.5 accent-primary"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-medium">{fullName(addr)}</span>
                          <span className="text-xs text-muted-foreground px-1.5 py-0.5 bg-muted rounded">{addr.label}</span>
                          {addr.isDefault && <span className="text-xs text-primary font-medium">Default</span>}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}, {addr.state} {addr.postalCode}
                        </p>
                        <p className="text-sm text-muted-foreground">{addr.country}</p>
                      </div>
                    </label>
                  ))}
                  <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${selectedAddressId === 'new' ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80'}`}>
                    <input
                      type="radio"
                      checked={selectedAddressId === 'new'}
                      onChange={() => setSelectedAddressId('new')}
                      className="accent-primary"
                    />
                    <span className="text-sm font-medium">+ Add a new address</span>
                  </label>
                </div>
              )}

              {(selectedAddressId === 'new' || savedAddresses.length === 0) && (
                <div className="space-y-4 p-5 border border-border rounded-xl">
                  <div className="grid grid-cols-2 gap-4">
                    <TextField
                      label="First Name"
                      autoComplete="given-name"
                      value={newAddress.firstName ?? ''}
                      onChange={(e) => setNewAddress((a) => ({ ...a, firstName: e.target.value }))}
                    />
                    <TextField
                      label="Last Name"
                      autoComplete="family-name"
                      value={newAddress.lastName ?? ''}
                      onChange={(e) => setNewAddress((a) => ({ ...a, lastName: e.target.value }))}
                    />
                  </div>
                  <TextField
                    label="Phone"
                    type="tel"
                    value={newAddress.phone ?? ''}
                    onChange={(e) => setNewAddress((a) => ({ ...a, phone: e.target.value }))}
                  />
                  <TextField
                    label="Address Line 1"
                    value={newAddress.line1 ?? ''}
                    onChange={(e) => setNewAddress((a) => ({ ...a, line1: e.target.value }))}
                  />
                  <TextField
                    label="Address Line 2 (optional)"
                    value={newAddress.line2 ?? ''}
                    onChange={(e) => setNewAddress((a) => ({ ...a, line2: e.target.value }))}
                  />
                  <div className="grid grid-cols-3 gap-4">
                    <TextField
                      label="City"
                      className="col-span-1"
                      value={newAddress.city ?? ''}
                      onChange={(e) => setNewAddress((a) => ({ ...a, city: e.target.value }))}
                    />
                    <TextField
                      label="State"
                      value={newAddress.state ?? ''}
                      onChange={(e) => setNewAddress((a) => ({ ...a, state: e.target.value }))}
                    />
                    <TextField
                      label="Postal Code"
                      value={newAddress.postalCode ?? ''}
                      onChange={(e) => setNewAddress((a) => ({ ...a, postalCode: e.target.value }))}
                    />
                  </div>
                  <SelectField
                    label="Country"
                    value={newAddress.country ?? 'United States'}
                    onChange={(e) => setNewAddress((a) => ({ ...a, country: e.target.value }))}
                  >
                    <option>United States</option>
                    <option>Canada</option>
                    <option>United Kingdom</option>
                  </SelectField>
                  {user && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={saveAddress}
                        onChange={(e) => setSaveAddress(e.target.checked)}
                        className="accent-primary rounded"
                      />
                      <span className="text-sm text-muted-foreground">Save this address to my account</span>
                    </label>
                  )}
                </div>
              )}

              <Button size="lg" onClick={() => setStep('review')}>
                Continue to Review <ChevronRight size={16} />
              </Button>
            </div>
          )}

          {/* Review step */}
          {step === 'review' && (
            <div className="space-y-6">
              <h2 className="font-serif text-2xl font-semibold">Review & Place Order</h2>

              <div className="space-y-4">
                <div className="p-4 border border-border rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium">Shipping to</h3>
                    <button onClick={() => setStep('shipping')} className="text-xs text-primary hover:underline">Edit</button>
                  </div>
                  <p className="text-sm text-muted-foreground">{fullName(shippingAddress)}</p>
                  <p className="text-sm text-muted-foreground">
                    {shippingAddress.line1}{shippingAddress.line2 ? `, ${shippingAddress.line2}` : ''}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
                  </p>
                </div>

              </div>

              {paymentState === 'failed' && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700" role="alert">
                  Payment didn't go through. Please try again. Your cart has been saved.
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('shipping')}>Back</Button>
                <Button
                  size="lg"
                  loading={paymentState === 'processing'}
                  disabled={paymentState === 'processing'}
                  onClick={handlePlaceOrder}
                  className="flex-1"
                >
                  {paymentState === 'processing' ? 'Processing Payment…' : `Pay & Place Order — ${formatPrice(total)}`}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                <Lock size={11} /> Your payment is secured with 256-bit SSL encryption
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <OrderSummary />
        </div>
      </div>
    </div>
  );
}
