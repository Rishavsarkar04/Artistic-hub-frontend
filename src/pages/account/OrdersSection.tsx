import { useState } from 'react';
import { formatPrice } from '@/lib/money';
import { Package, ExternalLink } from 'lucide-react';
import { useOrdersStore } from '@/stores/ordersStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { statusIcon, statusVariant } from './orderStatus';

export function OrdersSection({ onViewDetail }: { onViewDetail: (orderId: string) => void }) {
  const orders = useOrdersStore((s) => s.orders);
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold mb-1">Order History</h2>
        <p className="text-sm text-muted-foreground">{orders.length} orders placed</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
              filter === s
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <Package size={28} className="mx-auto text-muted-foreground mb-3" />
          <p className="font-medium text-sm mb-1">No orders found</p>
          <p className="text-sm text-muted-foreground">No orders matching this filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => {
            const Icon = statusIcon[order.status] ?? Package;
            return (
              <div key={order.id} className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <p className="font-medium font-mono text-sm">{order.id}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <Badge variant={statusVariant[order.status]}>
                      <Icon size={11} className="mr-1" />
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                    <Badge variant={order.paymentStatus === 'paid' ? 'success' : 'warning'}>
                      {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                    </Badge>
                  </div>
                </div>

                {/* Items preview */}
                <div className="flex items-center gap-2 mb-4">
                  {order.items.slice(0, 3).map((item, i) => (
                    <img
                      key={i}
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-12 h-12 rounded-md object-cover bg-muted border border-border"
                    />
                  ))}
                  {order.items.length > 3 && (
                    <div className="w-12 h-12 rounded-md border border-border bg-muted flex items-center justify-center text-xs text-muted-foreground">
                      +{order.items.length - 3}
                    </div>
                  )}
                  <div className="ml-2">
                    <p className="text-sm font-semibold">{formatPrice(order.total)}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.items.reduce((a, i) => a + i.quantity, 0)} items
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetail(order.id)}
                >
                  <ExternalLink size={13} /> View Details
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
