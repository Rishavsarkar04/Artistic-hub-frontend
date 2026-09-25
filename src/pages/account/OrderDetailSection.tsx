import { formatPrice } from '@/lib/money';
import { fullName } from '@/lib/utils';
import { Package, Check, ExternalLink, ChevronLeft } from 'lucide-react';
import { useOrdersStore } from '@/stores/ordersStore';

import { Badge } from '@/components/ui/badge';

import { statusIcon } from './orderStatus';

function OrderDetailSection({ orderId, onBack }: { orderId: string; onBack: () => void }) {
  const order = useOrdersStore((s) => s.orders.find((o) => o.id === orderId));

  if (!order) return <div className="text-center py-12 text-muted-foreground">Order not found.</div>;

  const Icon = statusIcon[order.status] ?? Package;
  const progressSteps = ['Order Placed', 'Processing', 'Shipped', 'Delivered'];
  const progressIdx =
    order.status === 'processing' ? 1 :
    order.status === 'shipped' ? 2 :
    order.status === 'delivered' ? 3 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-md hover:bg-muted text-muted-foreground transition-colors">
          <ChevronLeft size={18} />
        </button>
        <div>
          <h2 className="font-serif text-2xl font-semibold">Order Details</h2>
          <p className="text-sm text-muted-foreground font-mono">{order.id}</p>
        </div>
      </div>

      {/* Progress */}
      {order.status !== 'cancelled' && (
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="text-sm font-medium">Order Progress</h3>
            {order.trackingUrl ? (
              <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full bg-primary text-primary-foreground text-xs font-medium hover:opacity-90">
                Track order <ExternalLink size={12} />
              </a>
            ) : order.status === 'processing' ? (
              <span className="text-xs text-muted-foreground">Tracking link available once shipped</span>
            ) : null}
          </div>
          <div className="flex items-center gap-0">
            {progressSteps.map((s, i) => (
              <React.Fragment key={s}>
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 text-xs ${i <= progressIdx ? 'bg-primary border-primary text-primary-foreground' : 'border-border text-muted-foreground'}`}>
                    {i < progressIdx ? <Check size={12} /> : i + 1}
                  </div>
                  <span className={`text-[10px] font-medium text-center max-w-[60px] ${i <= progressIdx ? 'text-primary' : 'text-muted-foreground'}`}>{s}</span>
                </div>
                {i < progressSteps.length - 1 && (
                  <div className={`flex-1 h-0.5 mb-4 ${i < progressIdx ? 'bg-primary' : 'bg-border'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
          {order.trackingNumber && (
            <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
              <span className="text-muted-foreground">Tracking number: <span className="font-mono text-foreground">{order.trackingNumber}</span></span>
            </div>
          )}
        </div>
      )}

      {/* Items */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-medium mb-4">Items</h3>
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
          <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
          <div className="flex justify-between text-muted-foreground">
            <span>Shipping</span>
            <span>{order.shipping === 0 ? <span className="text-emerald-600">Free</span> : formatPrice(order.shipping)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground"><span>Tax</span><span>{formatPrice(order.tax)}</span></div>
          <div className="flex justify-between font-semibold text-base pt-1"><span>Total</span><span>{formatPrice(order.total)}</span></div>
        </div>
      </div>

      {/* Addresses */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-medium mb-2">Shipped To</h3>
          <p className="text-sm text-muted-foreground">{fullName(order.shippingAddress)}</p>
          <p className="text-sm text-muted-foreground">{order.shippingAddress.line1}</p>
          <p className="text-sm text-muted-foreground">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-medium mb-2">Payment</h3>
          <p className="text-sm text-muted-foreground">{order.paymentMethod}</p>
          <p className="text-xs text-muted-foreground mt-1 font-mono">{order.transactionRef}</p>
          <Badge className="mt-2" variant={order.paymentStatus === 'paid' ? 'success' : 'warning'}>
            {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
          </Badge>
        </div>
      </div>
    </div>
  );
}
