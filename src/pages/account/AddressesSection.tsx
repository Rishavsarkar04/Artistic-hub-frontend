import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { cn, fullName } from '@/lib/utils';
import { MapPin, Plus, Trash2, Edit3, Phone, Star } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import type { Address } from '@/types';
import { Button } from '@/components/ui/button';
import { TextField, SelectField } from '@/components/shared/FormField';
import { Modal } from '@/components/shared/Modal';

// Stable fallback so the store selector doesn't return a new array on every render.
const NO_ADDRESSES: Address[] = [];

function AddressForm({
  initial,
  onSave,
  onCancel,
  lockDefault = false,
}: {
  initial?: Partial<Address>;
  onSave: (a: Address) => void;
  onCancel: () => void;
  /** The address is already the default: it stays so until another address takes over, so there's always one. */
  lockDefault?: boolean;
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
      <label className="flex items-start gap-2.5 cursor-pointer has-[:disabled]:cursor-default">
        <input
          type="checkbox"
          checked={form.isDefault ?? false}
          disabled={lockDefault}
          onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
          className="accent-primary size-4 mt-0.5"
        />
        <span className="text-sm">
          Make this my default address
          <span className="block text-xs text-muted-foreground mt-0.5">
            {lockDefault ? 'This is your default. To change it, make another address the default.' : 'Checkout picks it first.'}
          </span>
        </span>
      </label>
      <div className="flex gap-3 pt-2">
        <Button type="submit">Save Address</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

export function AddressesSection() {
  const addresses = useAuthStore((s) => s.user?.addresses ?? NO_ADDRESSES);
  const { saveAddress, deleteAddress, setDefaultAddress } = useAuthStore.getState();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Address | null>(null);

  const handleSave = (addr: Address) => {
    saveAddress(addr);
    // Also clears the flag on the previous default.
    if (addr.isDefault) setDefaultAddress(addr.id);
    toast.success(editing ? 'Address updated.' : 'Address added.');
    setEditing(null);
    setAdding(false);
  };

  const makeDefault = (addr: Address) => {
    setDefaultAddress(addr.id);
    toast.success(`${addr.label} is now your default address.`);
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
          {/* A first address becomes the default unless unticked. */}
          <AddressForm initial={{ isDefault: addresses.length === 0 }} onSave={handleSave} onCancel={() => setAdding(false)} />
        </div>
      )}

      {addresses.map((addr) => (
        <div key={addr.id}>
          {editing?.id === addr.id ? (
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-medium mb-4">Edit Address</h3>
              <AddressForm initial={editing} lockDefault={editing.isDefault} onSave={handleSave} onCancel={() => setEditing(null)} />
            </div>
          ) : (
            <div className={cn('bg-card border rounded-xl p-5', addr.isDefault ? 'border-ink ring-1 ring-ink' : 'border-border')}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{fullName(addr)}</span>
                    <span className="text-xs px-1.5 py-0.5 bg-muted rounded text-muted-foreground">{addr.label}</span>
                    {addr.isDefault && (
                      <span className="inline-flex items-center gap-1 h-6 px-2.5 rounded-full bg-ink text-[#F7F4EF] text-xs font-semibold">
                        <Star size={11} className="fill-current" /> Default
                      </span>
                    )}
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
              </div>
              {/* Labelled actions: icon-only buttons were easy to miss. */}
              <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border">
                {!addr.isDefault && (
                  <Button variant="outline" size="sm" onClick={() => makeDefault(addr)}>
                    <Star size={13} /> Make default
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => setEditing(addr)} aria-label={`Edit ${addr.label} address`}>
                  <Edit3 size={13} /> Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(addr)} aria-label={`Delete ${addr.label} address`}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 sm:ml-auto">
                  <Trash2 size={13} /> Delete
                </Button>
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
