import type { Metadata } from 'next';
import { AuthShell } from '@/components/auth/auth-shell';
import { AuthForm } from '@/components/auth/auth-form';

export const metadata: Metadata = { title: 'Create your account' };

export default function SignupPage() {
  return <AuthShell title="Start with a clearer workspace" subtitle="Create your account, then set up your organization in a few simple steps."><AuthForm mode="sign-up" /></AuthShell>;
}
