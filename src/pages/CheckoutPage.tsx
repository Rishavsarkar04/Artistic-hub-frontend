import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { paths } from '../routes';
import { formatPrice, calcTax, FREE_SHIPPING_MIN } from '@/lib/money';
import { fullName } from '@/lib/utils';
import { Check, ChevronRight, Lock, MapPin, Eye } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { useAuthStore } from '../stores/authStore';
import { useCartStore, useCartTotal } from '../stores/cartStore';
import { deliveryMethods } from '../data/products';
import type { Address, Order, DeliveryMethod } from '../types';
import { Button } from '@/components/ui/button';
import { TextField, SelectField } from '@/components/shared/FormField';

type Step = 'shipping' | 'review';

const steps: { id: Step; label: string; icon: React.ElementType }[] = [
  { id: 'shipping', label: 'Shipping', icon: MapPin },
  { id: 'review', label: 'Review & pay', icon: Eye },
];

/** Two-part progress bar; finished steps stay clickable to go back. */
function StepIndicator({ current, onSelect }: { current: Step; onSelect: (s: Step) => void }) {
  const currentIdx = steps.findIndex((s) => s.id === current);
  return (
    <ol className="grid grid-cols-2 gap-3 mb-10" aria-label="Checkout progress">
      {steps.map((step, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        const Icon = step.icon;
        return (
          <li key={step.id}>
            <button
              type="button"
              onClick={() => done && onSelect(step.id)}
              disabled={!done}
              aria-current={active ? 'step' : undefined}
              className="group w-full text-left disabled:cursor-default"
            >
              <span className="block h-1.5 rounded-full bg-border overflow-hidden">
                <span className={`block h-full rounded-full bg-primary transition-all duration-500 ${done || active ? 'w-full' : 'w-0'}`} />
              </span>
              <span className="mt-3 flex items-center gap-2.5">
                <span className={`size-8 shrink-0 rounded-full flex items-center justify-center transition-colors ${done ? 'bg-primary text-primary-foreground' : active ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                  {done ? <Check size={15} /> : <Icon size={15} />}
                </span>
                <span className="leading-tight">
                  <span className="block text-xs text-muted-foreground">Step {i + 1} of {steps.length}</span>
                  <span className={`block text-sm font-medium ${active || done ? 'text-foreground' : 'text-muted-foreground'} ${done ? 'group-hover:underline underline-offset-4' : ''}`}>{step.label}</span>
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function OrderSummary({ compact = false }: { compact?: boolean }) {
  const cart = useCartStore((s) => s.items);
  const cartTotal = useCartTotal();
  const shipping = cartTotal >= FREE_SHIPPING_MIN ? 0 : deliveryMethods[0].price;
  const tax = calcTax(cartTotal);
  const total = cartTotal + shipping + tax;

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="font-medium mb-4">Order Summary</h3>
      {!compact && (
        <div className="space-y-3 mb-4">
          {cart.map((item) => (
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
              <p className="text-sm font-medium">{formatPrice(item.size.price * item.quantity)}</p>
            </div>
          ))}
        </div>
      )}
      <div className="space-y-2 text-sm border-t border-border pt-4">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatPrice(cartTotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span>{shipping === 0 ? <span className="text-emerald-600 font-medium">Free</span> : formatPrice(shipping)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tax</span>
          <span>{formatPrice(tax)}</span>
        </div>
        <div className="border-t border-border pt-2 flex justify-between font-semibold text-base">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
}

export function CheckoutPage() {
  const { dispatch } = useApp();
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

    dispatch({ type: 'PLACE_ORDER', order });
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
