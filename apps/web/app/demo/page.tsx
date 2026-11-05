import type { Metadata } from 'next';
import { WorkspaceShell } from '@/components/workspace/workspace-shell';

export const metadata: Metadata = {
  title: 'Interactive workspace demo',
  description: 'Explore a working MONK workspace with clearly labeled sample data.',
  robots: { index: false, follow: false },
};

export default function DemoPage() {
  return <WorkspaceShell mode="demo" />;
}
