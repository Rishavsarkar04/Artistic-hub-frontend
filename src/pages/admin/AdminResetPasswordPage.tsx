import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { paths } from '@/router/paths';
import { resetMockPassword } from '@/data/auth';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { AdminAuthLayout } from './AdminAuthLayout';

/** Opened from the admin reset email (`?token=…&email=…`). Shares its form with the customer one. */
export function AdminResetPasswordPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const email = params.get('email') ?? '';
  return (
    <AdminAuthLayout title="Set a new password" subtitle={email ? `For ${email}` : 'Choose a password you haven’t used here before.'}
      back={{ to: paths.adminLogin, label: 'Back to sign in' }}>
      {/* MOCK: with the API, reset = (token, password) => api.post(endpoints.admin.auth.resetPassword, { token, password, password_confirmation: password }). */}
      <ResetPasswordForm token={params.get('token') ?? ''} reset={resetMockPassword} forgotPath={paths.adminForgotPassword}
        onDone={() => { toast.success('Password updated. Sign in with your new password.'); navigate(paths.adminLogin, { replace: true, state: { email } }); }} />
    </AdminAuthLayout>
  );
}
