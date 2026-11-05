import type { Metadata } from 'next';
import { AuthShell } from '@/components/auth/auth-shell';
import { OnboardingForm } from '@/components/auth/onboarding-form';

export const metadata: Metadata = { title: 'Create your workspace', robots: { index: false, follow: false } };

export default function OnboardingPage() {
  return <AuthShell title="Name your workspace" subtitle="This is the shared home for your team’s clients and delivery work."><OnboardingForm /></AuthShell>;
}
