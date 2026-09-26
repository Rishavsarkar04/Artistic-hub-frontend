import React, { useState } from 'react';
import { MailCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/shared/FormField';

interface ForgotPasswordFormProps {
  /** Sends the reset email (customer or admin endpoint). */
  request: (email: string) => Promise<void>;
  initialEmail?: string;
  /** "an account" for customers, "an admin account" for staff. */
  accountLabel: string;
  placeholder?: string;
}

/**
 * Asks for an email and sends a reset link; used by the customer and admin sign-in so both work the same.
 * The confirmation reads the same whether or not the account exists, so it never reveals which emails are registered.
 */
export function ForgotPasswordForm({ request, initialEmail = '', accountLabel, placeholder = 'you@example.com' }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!value) return setError('Email is required');
    if (!/\S+@\S+\.\S+/.test(value)) return setError('Enter a valid email');
    setError('');
    setSending(true);
    try {
      await request(value);
      setSentTo(value);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The link could not be sent. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (sentTo) {
    return (
      <div className="text-center" role="status">
        <span className="mx-auto size-12 rounded-full bg-[#E4EEE3] text-[#2F5E36] flex items-center justify-center"><MailCheck size={22} /></span>
        <h2 className="font-serif text-xl mt-4">Check your email</h2>
        <p className="text-sm mt-2">If {accountLabel} exists for <strong className="font-medium break-all">{sentTo}</strong>, we've sent a link to reset the password. It expires in 60 minutes.</p>
        <p className="text-xs text-muted-foreground mt-2">Nothing arrived? Check spam, or try again.</p>
        <Button variant="outline" className="w-full mt-5" onClick={() => setSentTo('')}>Send another link</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <TextField label="Email" type="email" autoComplete="username" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }}
        error={error} placeholder={placeholder} autoFocus />
      <Button type="submit" size="lg" loading={sending} className="w-full">Send reset link</Button>
    </form>
  );
}
