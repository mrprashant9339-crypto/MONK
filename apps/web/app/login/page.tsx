import type { Metadata } from 'next';
import { AuthShell } from '@/components/auth/auth-shell';
import { AuthForm } from '@/components/auth/auth-form';

export const metadata: Metadata = { title: 'Sign in', robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <AuthShell title="Welcome back" subtitle="Sign in to continue to your organized workspace."><AuthForm mode="sign-in" next={next} /></AuthShell>;
}
