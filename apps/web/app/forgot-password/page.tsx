import type { Metadata } from 'next';
import { AuthShell } from '@/components/auth/auth-shell';
import { AuthForm } from '@/components/auth/auth-form';

export const metadata: Metadata = { title: 'Recover your account', robots: { index: false, follow: false } };

export default function ForgotPasswordPage() {
  return <AuthShell title="Recover your account" subtitle="Enter your email and we’ll send a secure, time-limited recovery link."><AuthForm mode="forgot" /></AuthShell>;
}
