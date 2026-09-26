import React, { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, type Location } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { paths } from '@/router/paths';
import { useAdminAuthStore } from '@/stores/adminAuthStore';
import { AdminAuthLayout } from './AdminAuthLayout';
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

  // Pre-filled after resetting the password.
  const [email, setEmail] = useState((location.state as { email?: string } | null)?.email ?? '');
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
    <AdminAuthLayout title="Sign in to manage the shop" subtitle="For studio staff only." back={{ to: paths.home, label: 'Back to the shop' }}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <TextField label="Email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} placeholder="you@emberandbloom.co" />
        <div>
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
          <div className="flex justify-end mt-2">
            {/* Carries the typed email over so it doesn't need typing twice. */}
            <Link to={paths.adminForgotPassword} state={{ email }} className="text-sm font-medium underline-offset-4 hover:underline">Forgot password?</Link>
          </div>
        </div>
        <Button type="submit" size="lg" loading={loading} className="w-full">Sign in</Button>
      </form>
    </AdminAuthLayout>
  );
}
