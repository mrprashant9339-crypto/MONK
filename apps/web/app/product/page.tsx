import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, FileCheck2, FolderKanban, LayoutDashboard, ShieldCheck, Sparkles, UsersRound } from 'lucide-react';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';
import { ProductPreview } from '@/components/marketing/product-preview';

export const metadata: Metadata = { title: 'Product', description: 'Explore MONK’s connected CRM, project delivery, document review and permission-aware workspace.' };

const modules = [
  { icon: LayoutDashboard, title: 'Overview that respects your time', body: 'Open tasks, follow-ups, project health and approvals come together in one scannable view. Every widget links back to the record behind it.' },
  { icon: UsersRound, title: 'CRM built around relationships', body: 'Companies, contacts and leads share an activity history and a clear next action. Case-insensitive email dedupe keeps the record clean.' },
  { icon: FolderKanban, title: 'Delivery without status chasing', body: 'Projects, tasks, ownership, health and due dates stay connected to the client. Blockers need a reason, not another vague status.' },
  { icon: FileCheck2, title: 'Documents with a review trail', body: 'Draft, review and approval states make the current version clear. Client sharing is restricted to approved material.' },
  { icon: ShieldCheck, title: 'Permissions at every layer', body: 'Interface controls, server policy checks and PostgreSQL row-level security work together. A hidden button is never treated as security.' },
  { icon: Sparkles, title: 'AI with an evidence trail', body: 'Copilot is designed to cite its sources and leave consequential actions to people. It stays disabled until provider and evaluation gates are configured.' },
];

export default function ProductPage() {
  return <><SiteHeader /><main className="subpage-main" id="main-content"><section className="subpage-hero"><div className="container"><span className="eyebrow">The business operating ecosystem</span><h1>Everything connected.<br />Nothing overdone.</h1><p>MONK follows a client engagement from first conversation to approved delivery, with just enough structure to keep everyone aligned.</p><Link className="button" href="/demo">Try the interactive demo <ArrowUpRight /></Link></div></section><section className="subpage-content"><div className="container"><div className="content-grid-3">{modules.map((module) => <article className="info-card" key={module.title}><module.icon /><h2>{module.title}</h2><p>{module.body}</p></article>)}</div><div id="roadmap" className="pilot-banner"><div><h3>A phased product, not a shallow everything-app</h3><p>The current build focuses on identity, CRM, projects, tasks and document review. Finance, marketplace and advanced automation remain deliberately out of the first release.</p></div><Link className="button button-secondary" href="/signup">Join the pilot</Link></div></div></section><section className="subpage-content" style={{ paddingTop: 0 }}><div className="container"><ProductPreview /></div></section></main><SiteFooter /></>;
}
