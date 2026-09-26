import React from 'react';
import { useLocation } from 'react-router-dom';
import { paths } from '@/router/paths';
import { requestMockPasswordReset } from '@/data/auth';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { AdminAuthLayout } from './AdminAuthLayout';

/** Admin forgot password. Shares its form with the customer one so both work the same. */
export function AdminForgotPasswordPage() {
  const location = useLocation();
  return (
    <AdminAuthLayout title="Reset your password" subtitle="Enter your admin email and we'll send you a link to set a new password."
      back={{ to: paths.adminLogin, label: 'Back to sign in' }}>
      {/* MOCK: with the API, request = (email) => api.post(endpoints.admin.auth.forgotPassword, { email }). */}
      <ForgotPasswordForm request={requestMockPasswordReset} accountLabel="an admin account" placeholder="you@emberandbloom.co"
        initialEmail={(location.state as { email?: string } | null)?.email} />
    </AdminAuthLayout>
  );
}
