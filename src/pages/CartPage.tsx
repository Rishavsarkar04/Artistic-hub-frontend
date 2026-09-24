import React from 'react';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { Button } from '@/components/ui/button';

export function CartPage() {
  const { state, dispatch, navigate, cartTotal } = useApp();
  const { cart } = state;

  const shipping = cartTotal >= 75 ? 0 : 6.95;
  const tax = cartTotal * 0.0875;
  const total = cartTotal + shipping + tax;

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
          <ShoppingBag size={32} className="text-muted-foreground" />
        </div>
        <h1 className="font-serif text-3xl font-semibold mb-3">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8">
          You haven't added any candles yet. Browse our collections to find your perfect scent.
        </p>
        <Button size="lg" onClick={() => navigate('listing')}>
          Shop Candles
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate('listing')}
          className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-serif text-4xl font-semibold">Your Cart</h1>
        <span className="text-muted-foreground text-lg">({cart.reduce((a, i) => a + i.quantity, 0)} items)</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartTotal < 75 && (
            <div className="flex items-center gap-3 p-4 bg-accent/10 border border-accent/20 rounded-lg text-sm">
              <AlertTriangle size={16} className="text-accent shrink-0" />
              <span>
                Add <span className="font-semibold">${(75 - cartTotal).toFixed(2)}</span> more to qualify for free shipping.
              </span>
            </div>
          )}

          {cart.map((item) => (
            <div key={`${item.productId}-${item.size.label}`} className="flex gap-4 p-4 bg-card border border-border rounded-xl">
              <button onClick={() => navigate('detail', { productId: item.productId })}>
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-24 h-24 rounded-lg object-cover bg-muted shrink-0 hover:opacity-90 transition-opacity"
                />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <button
                      onClick={() => navigate('detail', { productId: item.productId })}
                      className="font-medium hover:text-primary transition-colors text-left"
                    >
                      {item.product.name}
                    </button>
                    <p className="text-sm text-muted-foreground">
                      {item.size.label} · {item.size.weight}
                    </p>
                    <p className="text-sm text-muted-foreground">{item.product.scent}</p>
                  </div>
                  <button
                    onClick={() => dispatch({ type: 'REMOVE_FROM_CART', productId: item.productId, sizeLabel: item.size.label })}
                    className="p-1.5 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                    aria-label="Remove item"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center border border-border rounded-md">
                    <button
                      onClick={() => {
                        if (item.quantity === 1) {
                          dispatch({ type: 'REMOVE_FROM_CART', productId: item.productId, sizeLabel: item.size.label });
                        } else {
                          dispatch({ type: 'UPDATE_CART_QTY', productId: item.productId, sizeLabel: item.size.label, qty: item.quantity - 1 });
                        }
                      }}
                      className="p-2 hover:bg-muted rounded-l-md transition-colors"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="px-4 text-sm font-medium min-w-[2rem] text-center">{item.quantity}</span>
                    <button
                      onClick={() => dispatch({ type: 'UPDATE_CART_QTY', productId: item.productId, sizeLabel: item.size.label, qty: item.quantity + 1 })}
                      className="p-2 hover:bg-muted rounded-r-md transition-colors"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                  <p className="font-semibold">${(item.size.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}

          <Button variant="ghost" size="sm" onClick={() => navigate('listing')} className="mt-2">
            <ArrowLeft size={14} /> Continue Shopping
          </Button>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-xl p-6 sticky top-20">
            <h2 className="font-serif text-xl font-semibold mb-5">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shipping === 0 ? <span className="text-emerald-600 font-medium">Free</span> : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between font-semibold text-base">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full mt-6"
              onClick={() => state.user ? navigate('checkout') : navigate('auth')}
            >
              {state.user ? 'Proceed to Checkout' : 'Sign In to Checkout'}
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-3">
              Taxes and shipping calculated at checkout
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
