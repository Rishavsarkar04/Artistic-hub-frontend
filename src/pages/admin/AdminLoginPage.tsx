import React, { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, type Location } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { paths } from '@/router/paths';
import { useAdminAuthStore } from '@/stores/adminAuthStore';
import { Logo } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/shared/FormField';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const admin = useAdminAuthStore((s) => s.admin);
  const login = useAdminAuthStore((s) => s.login);
  // Where to go after signing in: the admin page that sent the visitor here, if any.
  const from = (location.state as { from?: Location } | null)?.from;
  const next = from ? from.pathname + from.search : paths.adminCustomers();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  if (admin) return <Navigate to={next} replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email';
    if (!password) errs.password = 'Password is required';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    // MOCK: call endpoints.admin.auth.login and store the returned admin and token.
    login({ id: 'a1', name: 'Studio Admin', email, role: 'owner' }, 'mock-admin-token');
    navigate(next, { replace: true });
  };

  return (
    <div className="min-h-screen bg-secondary/40 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-8">
          <Logo />
          <span className="mt-4 inline-flex items-center gap-1.5 h-7 px-3 rounded-full bg-ink text-[#F7F4EF] text-xs font-medium">
            <ShieldCheck size={13} /> Admin panel
          </span>
          <h1 className="font-serif text-3xl mt-5">Sign in to manage the shop</h1>
          <p className="text-sm text-muted-foreground mt-2">For studio staff only.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="bg-card border border-border rounded-3xl p-6 space-y-4 shadow-sm">
          <TextField label="Email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} placeholder="you@emberandbloom.co" />
          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            rightElement={
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="text-muted-foreground hover:text-foreground" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />
          <Button type="submit" size="lg" loading={loading} className="w-full">Sign in</Button>
        </form>

        <Link to={paths.home} className="mt-6 inline-flex w-full items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft size={14} /> Back to the shop
        </Link>
      </div>
    </div>
  );
}
