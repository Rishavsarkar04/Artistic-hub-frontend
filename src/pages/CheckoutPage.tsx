import React, { useState } from 'react';
import { fullName } from '@/lib/utils';
import { Check, ChevronRight, Lock, CreditCard, MapPin, Truck, Eye } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { deliveryMethods } from '../data/products';
import type { Address, Order, DeliveryMethod } from '../types';
import { Button } from '@/components/ui/button';
import { TextField, SelectField } from '@/components/shared/FormField';

type Step = 'shipping' | 'delivery' | 'payment' | 'review';

const steps: { id: Step; label: string; icon: React.ElementType }[] = [
  { id: 'shipping', label: 'Shipping', icon: MapPin },
  { id: 'delivery', label: 'Delivery', icon: Truck },
  { id: 'payment', label: 'Payment', icon: CreditCard },
  { id: 'review', label: 'Review', icon: Eye },
];

function StepIndicator({ current }: { current: Step }) {
  const currentIdx = steps.findIndex((s) => s.id === current);
  return (
    <div className="flex items-center gap-0 mb-10">
      {steps.map((step, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        const Icon = step.icon;
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                  done
                    ? 'bg-primary border-primary text-primary-foreground'
                    : active
                      ? 'border-primary text-primary bg-primary/5'
                      : 'border-border text-muted-foreground'
                }`}
              >
                {done ? <Check size={16} /> : <Icon size={15} />}
              </div>
              <span className={`text-xs font-medium ${active ? 'text-primary' : done ? 'text-foreground' : 'text-muted-foreground'}`}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mb-5 ${i < currentIdx ? 'bg-primary' : 'bg-border'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function OrderSummary({ compact = false }: { compact?: boolean }) {
  const { state, cartTotal } = useApp();
  const shipping = cartTotal >= 75 ? 0 : 6.95;
  const tax = cartTotal * 0.0875;
  const total = cartTotal + shipping + tax;

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="font-medium mb-4">Order Summary</h3>
      {!compact && (
        <div className="space-y-3 mb-4">
          {state.cart.map((item) => (
            <div key={`${item.productId}-${item.size.label}`} className="flex items-center gap-3">
              <div className="relative">
                <img src={item.product.image} alt={item.product.name} className="w-12 h-12 rounded-md object-cover bg-muted" />
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-muted-foreground text-card text-[10px] font-bold rounded-full flex items-center justify-center">
                  {item.quantity}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.product.name}</p>
                <p className="text-xs text-muted-foreground">{item.size.label} · {item.size.weight}</p>
              </div>
              <p className="text-sm font-medium">${(item.size.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}
      <div className="space-y-2 text-sm border-t border-border pt-4">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>${cartTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span>{shipping === 0 ? <span className="text-emerald-600 font-medium">Free</span> : `$${shipping.toFixed(2)}`}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="border-t border-border pt-2 flex justify-between font-semibold text-base">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

export function CheckoutPage() {
  const { state, dispatch, navigate, cartTotal } = useApp();
  const [step, setStep] = useState<Step>('shipping');
  const [paymentState, setPaymentState] = useState<'idle' | 'processing' | 'failed'>('idle');

  const savedAddresses = state.user?.addresses ?? [];
  const defaultAddr = savedAddresses.find((a) => a.isDefault) ?? savedAddresses[0];

  const [selectedAddressId, setSelectedAddressId] = useState<string | 'new'>(defaultAddr?.id ?? 'new');
  const [newAddress, setNewAddress] = useState<Partial<Address>>({
    label: 'Home', country: 'United States',
  });
  const [saveAddress, setSaveAddress] = useState(false);

  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryMethod>(deliveryMethods[0]);
  const [billingIsSame, setBillingIsSame] = useState(true);

  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  const shippingAddress: Address =
    selectedAddressId !== 'new'
      ? (savedAddresses.find((a) => a.id === selectedAddressId) as Address)
      : ({
          id: 'new',
          ...newAddress,
          isDefault: false,
        } as Address);

  const shipping = cartTotal >= 75 ? 0 : selectedDelivery.price;
  const tax = cartTotal * 0.0875;
  const total = cartTotal + shipping + tax;

  const handlePlaceOrder = async () => {
    setPaymentState('processing');
    await new Promise((r) => setTimeout(r, 2000));

    // Simulate 90% success rate
    if (Math.random() < 0.1) {
      setPaymentState('failed');
      return;
    }

    const order: Order = {
      id: `EB-${Date.now().toString().slice(-8)}`,
      date: new Date().toISOString().split('T')[0],
      status: 'processing',
      paymentStatus: 'paid',
      items: state.cart,
      subtotal: cartTotal,
      shipping,
      tax,
      total,
      shippingAddress,
      billingAddress: billingIsSame ? shippingAddress : shippingAddress,
      deliveryMethod: selectedDelivery,
      estimatedDelivery: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      transactionRef: `txn_${Math.random().toString(36).slice(2)}`,
      paymentMethod: `•••• ${cardNumber.slice(-4) || '4242'}`,
    };

    dispatch({ type: 'PLACE_ORDER', order });
    navigate('confirmation', { orderId: order.id });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <button onClick={() => navigate('cart')} className="hover:text-foreground transition-colors">Cart</button>
        <ChevronRight size={14} />
        <span className="text-foreground capitalize">{step}</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <StepIndicator current={step} />

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
                  {state.user && (
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

              <Button size="lg" onClick={() => setStep('delivery')}>
                Continue to Delivery <ChevronRight size={16} />
              </Button>
            </div>
          )}

          {/* Delivery step */}
          {step === 'delivery' && (
            <div className="space-y-6">
              <h2 className="font-serif text-2xl font-semibold">Delivery Method</h2>
              <div className="space-y-3">
                {deliveryMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${selectedDelivery.id === method.id ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80'}`}
                  >
                    <input
                      type="radio"
                      checked={selectedDelivery.id === method.id}
                      onChange={() => setSelectedDelivery(method)}
                      className="accent-primary"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{method.name}</span>
                        <span className="text-sm font-semibold">
                          {method.price === 0 ? 'Free' : `$${method.price.toFixed(2)}`}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{method.description} · {method.estimatedDays}</p>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('shipping')}>Back</Button>
                <Button onClick={() => setStep('payment')}>
                  Continue to Payment <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}

          {/* Payment step */}
          {step === 'payment' && (
            <div className="space-y-6">
              <h2 className="font-serif text-2xl font-semibold">Payment</h2>

              <div className="p-5 border border-border rounded-xl space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium mb-4">
                  <Lock size={14} className="text-muted-foreground" />
                  Secure payment — your information is encrypted
                </div>
                <TextField
                  label="Cardholder Name"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="Eleanor Voss"
                />
                <TextField
                  label="Card Number"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                  placeholder="4242 4242 4242 4242"
                />
                <div className="grid grid-cols-2 gap-4">
                  <TextField
                    label="Expiry"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="MM / YY"
                  />
                  <TextField
                    label="CVC"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value.slice(0, 3))}
                    placeholder="•••"
                  />
                </div>
              </div>

              {/* Billing address */}
              <div className="p-5 border border-border rounded-xl">
                <h3 className="text-sm font-medium mb-3">Billing Address</h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={billingIsSame}
                    onChange={(e) => setBillingIsSame(e.target.checked)}
                    className="accent-primary rounded"
                  />
                  <span className="text-sm text-muted-foreground">Same as shipping address</span>
                </label>
              </div>

              {paymentState === 'failed' && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  Payment failed. Please check your card details and try again. Your cart has been preserved.
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('delivery')}>Back</Button>
                <Button onClick={() => setStep('review')}>
                  Review Order <ChevronRight size={16} />
                </Button>
              </div>
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

                <div className="p-4 border border-border rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium">Delivery</h3>
                    <button onClick={() => setStep('delivery')} className="text-xs text-primary hover:underline">Edit</button>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedDelivery.name} — {selectedDelivery.estimatedDays}</p>
                </div>

                <div className="p-4 border border-border rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium">Payment</h3>
                    <button onClick={() => setStep('payment')} className="text-xs text-primary hover:underline">Edit</button>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <CreditCard size={14} />
                    •••• •••• •••• {cardNumber.slice(-4) || '4242'}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('payment')}>Back</Button>
                <Button
                  size="lg"
                  loading={paymentState === 'processing'}
                  disabled={paymentState === 'processing'}
                  onClick={handlePlaceOrder}
                  className="flex-1"
                >
                  {paymentState === 'processing' ? 'Processing Payment…' : `Pay & Place Order — $${total.toFixed(2)}`}
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
