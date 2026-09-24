import React, { useState } from 'react';
import { Eye, EyeOff, Flame, ArrowLeft, Check } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/shared/FormField';
import { mockUser } from '../data/products';

function PasswordInput({ label, value, onChange, error, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; error?: string; placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <TextField
      label={label}
      type={show ? 'text' : 'password'}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      error={error}
      placeholder={placeholder}
      rightElement={
        <button type="button" onClick={() => setShow(!show)} className="text-muted-foreground hover:text-foreground transition-colors">
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      }
    />
  );
}

export function AuthPage() {
  const { state, dispatch, navigate, loginDemo } = useApp();
  const mode = state.authMode;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const setMode = (m: typeof mode) => {
    dispatch({ type: 'SET_AUTH_MODE', mode: m });
    setErrors({});
    setSuccess(false);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (mode === 'register' && !firstName.trim()) errs.firstName = 'First name is required';
    if (mode === 'register' && !lastName.trim()) errs.lastName = 'Last name is required';
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email';
    if (mode !== 'forgot') {
      if (!password) errs.password = 'Password is required';
      else if (password.length < 8) errs.password = 'Password must be at least 8 characters';
    }
    if (mode === 'register' && password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    if (mode === 'forgot') {
      setSuccess(true);
      return;
    }
    loginDemo();
    navigate('home');
  };

  return (
    <div className="relative min-h-screen bg-secondary/30 flex items-center justify-center p-4 pt-20 sm:pt-4">
      <button
        onClick={() => navigate(state.previousPage === 'auth' ? 'home' : state.previousPage)}
        className="group absolute top-4 left-4 sm:top-6 sm:left-6 h-10 pl-3 pr-4 rounded-full border border-border bg-card text-sm flex items-center gap-2 hover:border-foreground/40 transition-colors"
      >
        <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />Back
      </button>
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <button onClick={() => navigate('home')} className="inline-flex items-center gap-2 mb-6 group">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Flame size={18} className="text-primary" />
            </div>
            <span className="font-serif text-2xl font-semibold">Ember & Bloom</span>
          </button>

          <h1 className="font-serif text-3xl font-semibold">
            {mode === 'login' && 'Welcome back'}
            {mode === 'register' && 'Create an account'}
            {mode === 'forgot' && 'Reset your password'}
            {mode === 'reset' && 'Set a new password'}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {mode === 'login' && 'Sign in to manage your orders and account.'}
            {mode === 'register' && 'Join Ember & Bloom for a smoother shopping experience.'}
            {mode === 'forgot' && "Enter your email and we'll send a reset link."}
            {mode === 'reset' && 'Choose a new password for your account.'}
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
          {success && mode === 'forgot' ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <Check size={24} className="text-emerald-600" />
              </div>
              <h2 className="font-serif text-xl font-medium mb-2">Check your inbox</h2>
              <p className="text-sm text-muted-foreground mb-6">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <Button variant="outline" onClick={() => setMode('login')} className="w-full">
                Back to Sign In
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {mode === 'register' && (
                <div className="grid grid-cols-2 gap-4">
                  <TextField
                    label="First Name"
                    type="text"
                    autoComplete="given-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    error={errors.firstName}
                    placeholder="Eleanor"
                  />
                  <TextField
                    label="Last Name"
                    type="text"
                    autoComplete="family-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    error={errors.lastName}
                    placeholder="Voss"
                  />
                </div>
              )}

              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                placeholder="your@email.com"
              />

              {mode !== 'forgot' && (
                <PasswordInput
                  label="Password"
                  value={password}
                  onChange={setPassword}
                  error={errors.password}
                  placeholder="••••••••"
                />
              )}

              {mode === 'register' && (
                <PasswordInput
                  label="Confirm Password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  error={errors.confirmPassword}
                  placeholder="••••••••"
                />
              )}

              {mode === 'login' && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <Button type="submit" loading={loading} className="w-full" size="lg">
                {mode === 'login' && 'Sign In'}
                {mode === 'register' && 'Create Account'}
                {mode === 'forgot' && 'Send Reset Link'}
                {mode === 'reset' && 'Update Password'}
              </Button>

              {mode === 'register' && (
                <p className="text-xs text-muted-foreground text-center">
                  By creating an account you agree to our{' '}
                  <button type="button" onClick={() => navigate('page', { slug: 'terms-of-service' })} className="underline underline-offset-2 hover:text-foreground">Terms of service</button>
                  {' '}and{' '}
                  <button type="button" onClick={() => navigate('page', { slug: 'privacy-policy' })} className="underline underline-offset-2 hover:text-foreground">Privacy policy</button>.
                </p>
              )}

            </form>
          )}
        </div>

        {/* Toggle mode */}
        <p className="text-center text-sm text-muted-foreground mt-4">
          {mode === 'login' && (
            <>Don't have an account?{' '}
              <button onClick={() => setMode('register')} className="text-primary hover:underline font-medium">
                Sign up
              </button>
            </>
          )}
          {mode === 'register' && (
            <>Already have an account?{' '}
              <button onClick={() => setMode('login')} className="text-primary hover:underline font-medium">
                Sign in
              </button>
            </>
          )}
          {(mode === 'forgot' || mode === 'reset') && !success && (
            <button onClick={() => setMode('login')} className="inline-flex items-center gap-1 text-primary hover:underline font-medium">
              <ArrowLeft size={13} /> Back to Sign In
            </button>
          )}
        </p>

        <p className="text-center text-xs text-muted-foreground mt-4">
          By continuing, you agree to our{' '}
          <button className="underline hover:text-foreground">Terms of Service</button>
          {' '}and{' '}
          <button className="underline hover:text-foreground">Privacy Policy</button>
        </p>
      </div>
    </div>
  );
}
