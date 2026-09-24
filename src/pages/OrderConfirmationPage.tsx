import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { paths } from '../routes';
import { formatPrice } from '@/lib/money';
import { fullName } from '@/lib/utils';
import { Check, Package, MapPin, ExternalLink, Clock } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { Button } from '@/components/ui/button';

export function OrderConfirmationPage() {
  const { state } = useApp();
  const navigate = useNavigate();
  const { orderId } = useParams();
  const order = state.orders.find((o) => o.id === orderId);

  if (!order) {
    return (
      <div className="text-center py-24">
        <p className="text-muted-foreground">Order not found.</p>
        <Button className="mt-4" onClick={() => navigate(paths.home)}>Go Home</Button>
      </div>
    );
  }

  const isPending = order.paymentStatus === 'pending';

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      {/* Success header */}
      <div className="text-center mb-10">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isPending ? 'bg-amber-100' : 'bg-emerald-100'}`}>
          {isPending ? <Clock size={28} className="text-amber-600" /> : <Check size={28} className="text-emerald-600" />}
        </div>
        <h1 className="font-serif text-3xl font-semibold mb-2">
          {isPending ? 'Payment Pending' : 'Order Confirmed!'}
        </h1>
        <p className="text-muted-foreground">
          {isPending
            ? 'Your order is pending payment confirmation. We\'ll email you when it\'s confirmed.'
            : 'Thank you for your order. We\'ll start preparing it right away.'}
        </p>
      </div>

      <div className="space-y-4">
        {/* Order meta */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Order Number</p>
              <p className="font-medium font-mono">{order.id}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Order Date</p>
              <p className="font-medium">{new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-medium mb-4 flex items-center gap-2">
            <Package size={16} className="text-muted-foreground" />
            Items Ordered
          </h2>
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <img src={item.product.image} alt={item.product.name} className="w-14 h-14 rounded-md object-cover bg-muted" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.product.name}</p>
                  <p className="text-xs text-muted-foreground">{item.size.label} · {item.size.weight} · Qty {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold">{formatPrice(item.size.price * item.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-border mt-4 pt-4 space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span>{order.shipping === 0 ? <span className="text-emerald-600">Free</span> : formatPrice(order.shipping)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tax</span><span>{formatPrice(order.tax)}</span>
            </div>
            <div className="flex justify-between font-semibold text-base pt-1">
              <span>Total</span><span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Shipping address */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-medium mb-3 flex items-center gap-2">
            <MapPin size={16} className="text-muted-foreground" />
            Shipping Address
          </h2>
          <p className="text-sm text-muted-foreground">{fullName(order.shippingAddress)}</p>
          <p className="text-sm text-muted-foreground">{order.shippingAddress.line1}{order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ''}</p>
          <p className="text-sm text-muted-foreground">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
          <p className="text-sm text-muted-foreground">{order.shippingAddress.country}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate(paths.accountOrder(order.id))}
          >
            <ExternalLink size={14} /> View Order Details
          </Button>
          <Button className="flex-1" onClick={() => navigate(paths.home)}>
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
}
