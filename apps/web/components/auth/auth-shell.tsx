import Link from 'next/link';
import { ArrowLeft, Check } from 'lucide-react';
import { BrandMark, Logo } from '@/components/brand';

export function AuthShell({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) {
  return <main className="auth-page" id="main-content"><aside className="auth-aside"><div className="auth-aside-top"><Logo inverted /><Link href="/"><ArrowLeft />Back to website</Link></div><div className="auth-aside-content"><span className="eyebrow">A calmer way to work</span><h2>Know the work.<br />Know what’s next.</h2><p>Clients, projects, tasks and documents—finally moving together in one clear workspace.</p><ul><li><Check />One reliable client record</li><li><Check />A clear view of every engagement</li><li><Check />Privacy and permissions from the start</li></ul></div><div className="auth-aside-foot"><BrandMark size={24} inverted /><span>Less chasing. More knowing.</span></div></aside><section className="auth-main"><div className="auth-mobile-logo"><Logo /></div><div className="auth-form-wrap"><div className="auth-heading"><h1>{title}</h1><p>{subtitle}</p></div>{children}</div><div className="auth-legal">Protected by secure authentication and workspace-level permissions.</div></section></main>;
}
