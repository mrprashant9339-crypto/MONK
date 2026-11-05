import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, Code2, MessagesSquare, Rocket } from 'lucide-react';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';

export const metadata: Metadata = { title: 'Contact', description: 'Join the MONK pilot or share product feedback.' };

export default function ContactPage() {
  return <><SiteHeader /><main className="subpage-main" id="main-content"><section className="subpage-hero"><div className="container"><span className="eyebrow">Start a conversation</span><h1>Let’s make work<br />feel lighter.</h1><p>Join the pilot for a guided workspace setup, or use the public repository for technical feedback.</p></div></section><section className="subpage-content"><div className="container content-grid-3"><article className="info-card"><Rocket /><h2>Pilot onboarding</h2><p>Create an account and set up your organization. Pilot onboarding is intentionally hands-on while the core workflow is validated.</p><Link className="text-link" href="/signup">Request pilot access <ArrowUpRight /></Link></article><article className="info-card"><MessagesSquare /><h2>Product feedback</h2><p>Found something confusing or missing? Open a specific, reproducible issue so it can be reviewed and tracked.</p><Link className="text-link" href="https://github.com/mrprashant9339-crypto/MONK/issues" target="_blank">Open a GitHub issue <ArrowUpRight /></Link></article><article className="info-card"><Code2 /><h2>Technical review</h2><p>Inspect the implementation, migration history and deployment documentation in the public MONK repository.</p><Link className="text-link" href="https://github.com/mrprashant9339-crypto/MONK" target="_blank">Review the code <ArrowUpRight /></Link></article></div></section></main><SiteFooter /></>;
}
