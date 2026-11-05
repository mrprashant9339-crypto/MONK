import type { Metadata } from 'next';
import { AuthShell } from '@/components/auth/auth-shell';
import { AuthForm } from '@/components/auth/auth-form';

export const metadata: Metadata = { title: 'Choose a new password', robots: { index: false, follow: false } };

export default function ResetPasswordPage() {
  return <AuthShell title="Choose a new password" subtitle="Use a unique password you don’t use anywhere else."><AuthForm mode="reset" /></AuthShell>;
}
