import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/shared/FormField';

const MIN_LENGTH = 8;

interface ResetPasswordFormProps {
  /** From the emailed link's `?token=`; empty means the link is broken. */
  token: string;
  /** Sets the new password (customer or admin endpoint). */
  reset: (token: string, password: string) => Promise<void>;
  /** Runs after a successful reset, e.g. toast and go to sign in. */
  onDone: () => void;
  /** Where to request a new link. */
  forgotPath: string;
}

/** New password + confirm, from a reset email; used by the customer and admin flows so both work the same. */
export function ResetPasswordForm({ token, reset, onDone, forgotPath }: ResetPasswordFormProps) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  if (!token) {
    return (
      <div className="text-center">
        <span className="mx-auto size-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground"><LinkIcon size={20} /></span>
        <h2 className="font-serif text-xl mt-4">This link doesn't work</h2>
        <p className="text-sm text-muted-foreground mt-2">It may be incomplete or already used. Request a new link and use the newest email.</p>
        <Button asChild className="w-full mt-5"><Link to={forgotPath}>Request a new link</Link></Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (password.length < MIN_LENGTH) errs.password = `Use at least ${MIN_LENGTH} characters`;
    if (confirm !== password) errs.confirm = "Passwords don't match";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    setSaveError('');
    try {
      await reset(token, password);
      onDone();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'The password could not be changed. Please try again.');
      setSaving(false);
    }
  };

  const eye = (
    <button type="button" onClick={() => setShow((v) => !v)} className="text-muted-foreground hover:text-foreground" aria-label={show ? 'Hide passwords' : 'Show passwords'}>
      {show ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <TextField id="new-password" label="New password" type={show ? 'text' : 'password'} autoComplete="new-password" value={password}
        onChange={(e) => setPassword(e.target.value)} error={errors.password} hint={`At least ${MIN_LENGTH} characters.`} rightElement={eye} autoFocus />
      <TextField id="confirm-password" label="Confirm new password" type={show ? 'text' : 'password'} autoComplete="new-password" value={confirm}
        onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} />
      {saveError && (
        <p role="alert" className="text-sm text-destructive">
          {saveError} <Link to={forgotPath} className="font-medium underline underline-offset-2">Request a new link</Link>
        </p>
      )}
      <Button type="submit" size="lg" loading={saving} className="w-full">Update password</Button>
    </form>
  );
}
