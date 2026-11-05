import type { Metadata } from 'next';
import { WorkspaceShell } from '@/components/workspace/workspace-shell';

export const metadata: Metadata = {
  title: 'Workspace',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default function WorkspacePage() {
  return <WorkspaceShell mode="live" />;
}
