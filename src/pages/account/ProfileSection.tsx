import React, { useState } from 'react';
import { Check, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/shared/FormField';

export function ProfileSection() {
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
