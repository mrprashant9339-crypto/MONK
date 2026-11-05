import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/brand';

export default function NotFound() {
  return <main className="workspace-error" id="main-content"><Logo /><span className="error-code">404</span><h1>This page isn’t in the workspace.</h1><p>The link may be old, or you may not have access to this record.</p><Link className="button" href="/"><ArrowLeft />Back to MONK</Link></main>;
}
