import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Check, Copy, CreditCard, ImageOff, MapPin, Pencil, Plus, Truck, UserRound, XCircle } from 'lucide-react';
import { paths } from '@/router/paths';
import { formatPrice } from '@/lib/money';
import { formatDate } from '@/lib/date';
import { cn } from '@/lib/utils';
import { COURIERS, getMockOrderDetail, saveMockShipment } from '@/data/admin/orders';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SelectField, TextField } from '@/components/shared/FormField';
import { NotFoundPage } from '@/pages/NotFoundPage';
import type { AdminOrderDetail, AdminOrderStatus, AdminShipment } from '@/types';

const STATUS_BADGE: Record<AdminOrderStatus, 'warning' | 'secondary' | 'success' | 'destructive'> = {
  processing: 'warning',
  shipped: 'secondary',
  delivered: 'success',
  cancelled: 'destructive',
};
const PAYMENT_BADGE: Record<AdminOrderDetail['paymentStatus'], 'success' | 'warning' | 'secondary'> = { paid: 'success', pending: 'warning', refunded: 'secondary' };

/**
 * The order for this page.
 * MOCK: swap for `useApiQuery<AdminOrderDetail>(endpoints.admin.orders.detail(orderId))`; `refetch` reloads it.
 */
function useOrder(orderId: string) {
  const [reloadKey, setReloadKey] = useState(0);
  const data = useMemo(() => getMockOrderDetail(orderId), [orderId, reloadKey]);
  return { data, refetch: () => setReloadKey((k) => k + 1) };
}

function Card({ title, icon: Icon, children, className }: { title: string; icon?: React.ElementType; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn('bg-card border border-border rounded-2xl p-5', className)}>
      <h2 className="text-sm font-medium flex items-center gap-2 mb-4">{Icon && <Icon size={15} className="text-muted-foreground" />}{title}</h2>
      {children}
    </section>
  );
}

/** Placed → Processing → Shipped → Delivered, or Placed → Cancelled. */
function Timeline({ order }: { order: AdminOrderDetail }) {
  const steps: { key: keyof AdminOrderDetail['timeline']; label: string }[] =
    order.status === 'cancelled'
      ? [{ key: 'placed', label: 'Placed' }, { key: 'cancelled', label: 'Cancelled' }]
      : [{ key: 'placed', label: 'Placed' }, { key: 'processing', label: 'Processing' }, { key: 'shipped', label: 'Shipped' }, { key: 'delivered', label: 'Delivered' }];
  return (
    <ol className="space-y-0">
      {steps.map((s, i) => {
        const date = order.timeline[s.key];
        const done = !!date;
        const cancelled = s.key === 'cancelled';
        return (
          <li key={s.key} className="relative flex gap-3 pb-5 last:pb-0">
            {i < steps.length - 1 && <span className={cn('absolute left-[11px] top-6 bottom-0 w-px', done && order.timeline[steps[i + 1].key] ? 'bg-ink' : 'bg-border')} aria-hidden />}
            <span className={cn('relative z-10 size-6 shrink-0 rounded-full flex items-center justify-center border-2',
              cancelled ? 'bg-destructive border-destructive text-white' : done ? 'bg-ink border-ink text-[#F7F4EF]' : 'bg-card border-border')}>
              {cancelled ? <XCircle size={13} /> : done && <Check size={13} />}
            </span>
            <div className="-mt-0.5">
              <p className={cn('text-sm font-medium', !done && 'text-muted-foreground')}>{s.label}</p>
              <p className="text-xs text-muted-foreground">{date ? formatDate(date) : 'Not yet'}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function OrderDetailPage() {
  const { orderId = '' } = useParams();
  const { data: order, refetch } = useOrder(orderId);

  if (!order) return <NotFoundPage title="Order not found" message="Check the order number, or find it in the order list." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <Link to={paths.adminOrders()} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={15} /> Orders
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mt-3">
        <div className="min-w-0">
          <h1 className="font-serif text-3xl sm:text-4xl">Order <span className="font-mono text-2xl sm:text-3xl tracking-tight">{order.id}</span></h1>
          <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-muted-foreground">
            <span>Placed {formatDate(order.date)}</span>
            <Badge variant={STATUS_BADGE[order.status]} className="capitalize">{order.status}</Badge>
            <Badge variant={PAYMENT_BADGE[order.paymentStatus]} className="capitalize">{order.paymentStatus}</Badge>
          </div>
        </div>
      </div>


      <div className="grid lg:grid-cols-[1fr_320px] gap-6 mt-6">
        <div className="space-y-6 min-w-0">
          <Card title={`Items (${order.items.length})`}>
            <ul className="divide-y divide-border">
              {order.items.map((it) => (
                <li key={it.id} className="flex items-start gap-3 py-3 first:pt-0">
                  {it.imageUrl
                    ? <img src={it.imageUrl} alt="" className="size-14 shrink-0 rounded-lg object-cover bg-muted" />
                    : <span className="size-14 shrink-0 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground"><ImageOff size={16} /></span>}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{it.productName}</p>
                    <p className="text-xs text-muted-foreground">{it.variantName} · <span className="font-mono">{it.sku}</span></p>
                    <p className="text-xs text-muted-foreground mt-1 tabular">
                      {it.quantity} × {it.originalPrice && it.originalPrice > it.unitPrice && <span className="line-through mr-1">{formatPrice(it.originalPrice)}</span>}{formatPrice(it.unitPrice)}
                    </p>
                  </div>
                  <p className="text-sm font-medium tabular">{formatPrice(it.unitPrice * it.quantity)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-4 pt-4 border-t border-border space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd className="tabular">{formatPrice(order.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd className="tabular">{order.shipping ? formatPrice(order.shipping) : 'Free'}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Tax</dt><dd className="tabular">{formatPrice(order.tax)}</dd></div>
              <div className="flex justify-between pt-2 border-t border-border text-base font-semibold"><dt>Total</dt><dd className="tabular">{formatPrice(order.total)}</dd></div>
            </dl>
            <p className="mt-3 text-xs text-muted-foreground">Items show the names and prices at the time of the order.</p>
          </Card>

          <Card title="Timeline"><Timeline order={order} /></Card>
        </div>

        <aside className="space-y-6">
          <DeliveryCard order={order} onSaved={(message) => { toast.success(message); refetch(); }} />
          <Card title="Customer" icon={UserRound}>
            <p className="text-sm font-medium">{order.customerName}</p>
            <p className="text-sm text-muted-foreground break-all">{order.customerEmail}</p>
            <p className="text-sm text-muted-foreground tabular">{order.customerPhone}</p>
            <Link to={paths.adminOrders({ customerId: order.customerId })} className="inline-block mt-3 text-sm font-medium underline-offset-4 hover:underline">View their orders</Link>
          </Card>
          <Card title="Shipping address" icon={MapPin}>
            <address className="not-italic text-sm text-muted-foreground leading-relaxed">
              <span className="text-foreground font-medium">{order.shippingAddress.name}</span><br />
              {order.shippingAddress.line1}{order.shippingAddress.line2 && <>, {order.shippingAddress.line2}</>}<br />
              {order.shippingAddress.city}{order.shippingAddress.state && `, ${order.shippingAddress.state}`} {order.shippingAddress.postalCode}<br />
              {order.shippingAddress.country}
            </address>
          </Card>
          <Card title="Payment" icon={CreditCard}>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Method</dt><dd>{order.paymentMethod}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Status</dt><dd><Badge variant={PAYMENT_BADGE[order.paymentStatus]} className="capitalize">{order.paymentStatus}</Badge></dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Amount</dt><dd className="font-medium tabular">{formatPrice(order.total)}</dd></div>
            </dl>
          </Card>
        </aside>
      </div>

    </div>
  );
}

/**
 * Delivery provider and tracking number: the only part of an order the admin edits.
 * MOCK: with the API, useApiMutation<AdminShipment, { courier: string; tracking_number: string }>(endpoints.admin.orders.shipment(id), 'PUT').
 */
function DeliveryCard({ order, onSaved }: { order: AdminOrderDetail; onSaved: (message: string) => void }) {
  const current = order.shipment;
  const known = !current || COURIERS.includes(current.courier);
  const [editing, setEditing] = useState(false);
  const [courier, setCourier] = useState(current ? (known ? current.courier : 'Other') : '');
  const [otherCourier, setOtherCourier] = useState(current && !known ? current.courier : '');
  const [tracking, setTracking] = useState(current?.trackingNumber ?? '');
  const [errors, setErrors] = useState<{ courier?: string; other?: string; tracking?: string }>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [copied, setCopied] = useState(false);

  const startEditing = () => {
    setCourier(current ? (known ? current.courier : 'Other') : '');
    setOtherCourier(current && !known ? current.courier : '');
    setTracking(current?.trackingNumber ?? '');
    setErrors({});
    setSaveError('');
    setEditing(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!courier) errs.courier = 'Choose who is delivering it';
    else if (courier === 'Other' && !otherCourier.trim()) errs.other = 'Enter the delivery provider';
    const t = tracking.trim().toUpperCase();
    if (!t) errs.tracking = 'Enter the tracking number';
    else if (!/^[A-Z0-9-]{6,30}$/.test(t)) errs.tracking = 'Use 6–30 letters, numbers or hyphens';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const shipment: AdminShipment = { courier: courier === 'Other' ? otherCourier.trim() : courier, trackingNumber: t };
    setSaving(true);
    setSaveError('');
    try {
      await saveMockShipment(order.id, shipment);
      setEditing(false);
      onSaved(current ? 'Delivery details updated.' : 'Delivery details added.');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'The delivery details could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const copy = async () => {
    if (!current) return;
    try { await navigator.clipboard.writeText(current.trackingNumber); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* clipboard unavailable */ }
  };

  return (
    <section className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between gap-2 mb-4">
        <h2 className="text-sm font-medium flex items-center gap-2"><Truck size={15} className="text-muted-foreground" />Delivery</h2>
        {current && !editing && (
          <button type="button" onClick={startEditing} className="inline-flex items-center gap-1 text-xs font-semibold underline-offset-4 hover:underline"><Pencil size={12} /> Edit</button>
        )}
      </div>

      {editing ? (
        <form onSubmit={save} noValidate className="space-y-3">
          <SelectField id="courier" label="Delivery provider" value={courier} onChange={(e) => setCourier(e.target.value)} error={errors.courier}>
            <option value="" disabled>Choose…</option>
            {COURIERS.map((c) => <option key={c}>{c}</option>)}
            <option value="Other">Other</option>
          </SelectField>
          {courier === 'Other' && (
            <TextField id="courier-other" label="Provider name" value={otherCourier} onChange={(e) => setOtherCourier(e.target.value)} error={errors.other} placeholder="e.g. Local courier" />
          )}
          <TextField id="tracking" label="Tracking number" value={tracking} onChange={(e) => setTracking(e.target.value)} error={errors.tracking}
            placeholder="e.g. DL1234567890" className="font-mono uppercase" autoComplete="off" />
          {saveError && <p role="alert" className="text-sm text-destructive">{saveError}</p>}
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => setEditing(false)} disabled={saving}>Cancel</Button>
            <Button type="submit" size="sm" className="flex-1" loading={saving}>Save</Button>
          </div>
        </form>
      ) : current ? (
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Provider</dt><dd className="font-medium text-right">{current.courier}</dd></div>
          <div className="flex justify-between items-center gap-3">
            <dt className="text-muted-foreground">Tracking</dt>
            <dd className="flex items-center gap-1.5 min-w-0">
              <span className="font-mono text-[13px] truncate">{current.trackingNumber}</span>
              <button type="button" onClick={copy} className="shrink-0 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary" aria-label="Copy tracking number">
                {copied ? <Check size={13} /> : <Copy size={13} />}
              </button>
            </dd>
          </div>
        </dl>
      ) : (
        <div>
          <p className="text-sm text-muted-foreground">No delivery details yet.</p>
          <Button variant="outline" size="sm" className="mt-3 w-full" onClick={startEditing}><Plus size={14} /> Add delivery details</Button>
        </div>
      )}
    </section>
  );
}
