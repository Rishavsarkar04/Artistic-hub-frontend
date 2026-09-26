import { ApiError } from '@/api/client';

// MOCK: password reset for customers and admins until the API is connected. Customers will use
// endpoints.auth.forgotPassword / resetPassword; admins endpoints.admin.auth.forgotPassword / resetPassword.

/** Stands in for the forgot-password POST. Succeeds for any email, like the API will (so it never reveals accounts). */
export async function requestMockPasswordReset(email: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 800));
  void email;
}

/** Stands in for the reset-password POST. The token "expired" simulates an old link. */
export async function resetMockPassword(token: string, password: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 800));
  if (token === 'expired') throw new ApiError(422, 'This reset link has expired. Request a new one.');
  void password;
}
