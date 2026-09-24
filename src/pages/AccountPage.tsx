import React, { useState } from 'react';
import { formatPrice } from '@/lib/money';
import { fullName } from '@/lib/utils';
import {
  User, MapPin, Package, ChevronRight, Plus, Trash2, Edit3,
  Check, Eye, EyeOff, LogOut, Star, Truck, CheckCircle2, Clock,
  ExternalLink, Phone, XCircle, ChevronLeft,
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { useAuthStore } from '../stores/authStore';

// Stable fallback so the store selector doesn't return a new array on every render.
const NO_ADDRESSES: Address[] = [];
import type { Address, AccountSection } from '../types';
import { Button } from '@/components/ui/button';
import { TextField, SelectField } from '@/components/shared/FormField';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/shared/Modal';

// ─── Profile ────────────────────────────────────────────────────────────────

function ProfileSection() {
  const user = useAuthStore((s) => s.user)!;
  const updateUser = useAuthStore((s) => s.updateUser);

  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    updateUser({ firstName, lastName, email, phone });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePwSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setPwSaving(false);
    setPwSaved(true);
    setCurrentPw('');
    setNewPw('');
    setTimeout(() => setPwSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold mb-1">Profile</h2>
        <p className="text-sm text-muted-foreground">Manage your personal information</p>
      </div>

      <form onSubmit={handleSave} className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label="First Name" autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <TextField label="Last Name" autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <TextField label="Phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" loading={saving}>
            {saved ? <><Check size={14} /> Saved!</> : 'Save Changes'}
          </Button>
          {saved && <span className="text-sm text-emerald-600">Profile updated successfully.</span>}
        </div>
      </form>

      {/* Password */}
      <form onSubmit={handlePwSave} className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h3 className="font-medium">Change Password</h3>
        <TextField
          label="Current Password"
          type={showCurrent ? 'text' : 'password'}
          value={currentPw}
          onChange={(e) => setCurrentPw(e.target.value)}
          rightElement={
            <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="text-muted-foreground hover:text-foreground">
              {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          }
        />
        <TextField
          label="New Password"
          type={showNew ? 'text' : 'password'}
          value={newPw}
          onChange={(e) => setNewPw(e.target.value)}
          hint="Minimum 8 characters"
          rightElement={
            <button type="button" onClick={() => setShowNew(!showNew)} className="text-muted-foreground hover:text-foreground">
              {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          }
        />
        <div className="flex items-center gap-3">
          <Button type="submit" variant="outline" loading={pwSaving}>
            {pwSaved ? <><Check size={14} /> Password Updated</> : 'Update Password'}
          </Button>
          {pwSaved && <span className="text-sm text-emerald-600">Password changed successfully.</span>}
        </div>
      </form>
    </div>
  );
}

// ─── Addresses ──────────────────────────────────────────────────────────────

function AddressForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<Address>;
  onSave: (a: Address) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Partial<Address>>({
    label: 'Home',
    country: 'United States',
    ...initial,
  });

  const update = (key: keyof Address, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: form.id ?? `a-${Date.now()}`,
      label: form.label ?? 'Home',
      firstName: form.firstName ?? '',
      lastName: form.lastName ?? '',
      phone: form.phone ?? '',
      line1: form.line1 ?? '',
      line2: form.line2 ?? '',
      city: form.city ?? '',
      state: form.state ?? '',
      postalCode: form.postalCode ?? '',
      country: form.country ?? 'United States',
      isDefault: form.isDefault ?? false,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <SelectField label="Address Label" value={form.label} onChange={(e) => update('label', e.target.value)}>
        <option>Home</option>
        <option>Work</option>
        <option>Other</option>
      </SelectField>
      <div className="grid grid-cols-2 gap-4">
        <TextField label="First Name" autoComplete="given-name" value={form.firstName ?? ''} onChange={(e) => update('firstName', e.target.value)} />
        <TextField label="Last Name" autoComplete="family-name" value={form.lastName ?? ''} onChange={(e) => update('lastName', e.target.value)} />
      </div>
      <TextField label="Phone" type="tel" value={form.phone ?? ''} onChange={(e) => update('phone', e.target.value)} />
      <TextField label="Address Line 1" value={form.line1 ?? ''} onChange={(e) => update('line1', e.target.value)} />
      <TextField label="Address Line 2 (optional)" value={form.line2 ?? ''} onChange={(e) => update('line2', e.target.value)} />
      <div className="grid grid-cols-3 gap-4">
        <TextField label="City" value={form.city ?? ''} onChange={(e) => update('city', e.target.value)} />
        <TextField label="State" value={form.state ?? ''} onChange={(e) => update('state', e.target.value)} />
        <TextField label="Postal Code" value={form.postalCode ?? ''} onChange={(e) => update('postalCode', e.target.value)} />
      </div>
      <SelectField label="Country" value={form.country} onChange={(e) => update('country', e.target.value)}>
        <option>United States</option>
        <option>Canada</option>
        <option>United Kingdom</option>
      </SelectField>
      <div className="flex gap-3 pt-2">
        <Button type="submit">Save Address</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

function AddressesSection() {
  const addresses = useAuthStore((s) => s.user?.addresses ?? NO_ADDRESSES);
  const { saveAddress, deleteAddress, setDefaultAddress } = useAuthStore.getState();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Address | null>(null);

  const handleSave = (addr: Address) => {
    if (editing) {
      saveAddress(addr);
      setEditing(null);
    } else {
      saveAddress(addr);
      setAdding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-serif text-2xl font-semibold mb-1">Saved Addresses</h2>
          <p className="text-sm text-muted-foreground">{addresses.length} addresses saved</p>
        </div>
        {!adding && !editing && (
          <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
            <Plus size={14} /> Add Address
          </Button>
        )}
      </div>

      {adding && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-medium mb-4">New Address</h3>
          <AddressForm onSave={handleSave} onCancel={() => setAdding(false)} />
        </div>
      )}

      {addresses.map((addr) => (
        <div key={addr.id}>
          {editing?.id === addr.id ? (
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-medium mb-4">Edit Address</h3>
              <AddressForm initial={editing} onSave={handleSave} onCancel={() => setEditing(null)} />
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{fullName(addr)}</span>
                    <span className="text-xs px-1.5 py-0.5 bg-muted rounded text-muted-foreground">{addr.label}</span>
                    {addr.isDefault && <Badge variant="default">Default</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                  <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} {addr.postalCode}</p>
                  <p className="text-sm text-muted-foreground">{addr.country}</p>
                  {addr.phone && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                      <Phone size={11} /> {addr.phone}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!addr.isDefault && (
                    <button
                      onClick={() => setDefaultAddress(addr.id)}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded hover:bg-muted"
                    >
                      Set default
                    </button>
                  )}
                  <button
                    onClick={() => setEditing(addr)}
                    className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Edit"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(addr)}
                    className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
                    aria-label="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {addresses.length === 0 && !adding && (
        <div className="text-center py-12 bg-card border border-border rounded-xl">
          <MapPin size={28} className="mx-auto text-muted-foreground mb-3" />
          <p className="font-medium text-sm mb-1">No addresses saved</p>
          <p className="text-sm text-muted-foreground mb-4">Add an address for faster checkout.</p>
          <Button size="sm" onClick={() => setAdding(true)}>
            <Plus size={14} /> Add Address
          </Button>
        </div>
      )}

      <Modal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Address"
        description="This will permanently remove the address from your account."
      >
        <div className="space-y-4">
          {deleteConfirm && (
            <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground">
              {deleteConfirm.line1}, {deleteConfirm.city}, {deleteConfirm.state}
            </div>
          )}
          <div className="flex gap-3">
            <Button
              variant="destructive"
              onClick={() => {
                deleteAddress(deleteConfirm!.id);
                setDeleteConfirm(null);
              }}
            >
              <Trash2 size={14} /> Delete Address
            </Button>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Orders ─────────────────────────────────────────────────────────────────

const statusIcon: Record<string, React.ElementType> = {
  processing: Clock,
  shipped: Truck,
  delivered: CheckCircle2,
  cancelled: XCircle,
};

const statusVariant: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  processing: 'warning',
  shipped: 'default',
  delivered: 'success',
  cancelled: 'destructive',
};

function OrdersSection({ onViewDetail }: { onViewDetail: (orderId: string) => void }) {
  const { state } = useApp();
  const orders = state.orders;
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

// ─── Order Detail ────────────────────────────────────────────────────────────

function OrderDetailSection({ orderId, onBack }: { orderId: string; onBack: () => void }) {
  const { state } = useApp();
  const order = state.orders.find((o) => o.id === orderId);

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

// ─── Account Shell ───────────────────────────────────────────────────────────

const navItems: { id: AccountSection; label: string; icon: React.ElementType }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
  { id: 'orders', label: 'Order History', icon: Package },
];

export function AccountPage() {
  const { state, dispatch, navigate } = useApp();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const signOut = () => { logout(); navigate('home'); };
  const section = state.accountSection;
  const viewingOrderId = state.currentOrderId;

  if (!user) {
    navigate('auth');
    return null;
  }

  const setSection = (s: AccountSection) => {
    dispatch({ type: 'NAVIGATE', page: 'account', accountSection: s });
  };

  const handleViewOrderDetail = (orderId: string) => {
    dispatch({ type: 'NAVIGATE', page: 'account', accountSection: 'order-detail', orderId });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">My Account</p>
          <h1 className="font-serif text-4xl font-semibold">{fullName(user)}</h1>
          <p className="text-muted-foreground mt-1">{user.email}</p>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden md:block w-52 shrink-0">
          <nav className="space-y-1">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSection(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  (section === id || (section === 'order-detail' && id === 'orders'))
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
            <div className="border-t border-border pt-2 mt-2">
              <button
                onClick={signOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-destructive transition-colors"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </nav>
        </aside>

        {/* Mobile nav */}
        <div className="md:hidden w-full mb-6">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSection(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
                  section === id || (section === 'order-detail' && id === 'orders')
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <Icon size={14} /> {label}
              </button>
            ))}
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap shrink-0 bg-muted text-muted-foreground"
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {section === 'profile' && <ProfileSection />}
          {section === 'addresses' && <AddressesSection />}
          {section === 'orders' && <OrdersSection onViewDetail={handleViewOrderDetail} />}
          {section === 'order-detail' && viewingOrderId && (
            <OrderDetailSection orderId={viewingOrderId} onBack={() => setSection('orders')} />
          )}
        </div>
      </div>
    </div>
  );
}
