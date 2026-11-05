import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, Database, FileKey, KeyRound, ScrollText, ShieldCheck, UserCheck } from 'lucide-react';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';

export const metadata: Metadata = { title: 'Security', description: 'MONK’s implemented tenant isolation, authorization, authentication and audit controls.' };

const controls = [
  { icon: Database, title: 'PostgreSQL row-level security', body: 'Every tenant-owned table is scoped to the active organization. Cross-tenant foreign keys are rejected by composite tenant keys.' },
  { icon: UserCheck, title: 'One application policy', body: 'A shared, tested can(actor, action, resource) package defines role permissions. API routes check it again on every mutation.' },
  { icon: KeyRound, title: 'Managed secure identity', body: 'Supabase Auth provides verified email flows, secure session handling, password recovery and optional TOTP MFA.' },
  { icon: ScrollText, title: 'Transactional audit records', body: 'Operational mutations run through database functions that write their audit event in the same transaction. Product roles cannot edit audit rows.' },
  { icon: FileKey, title: 'Private-by-default design', body: 'The data model supports private file versions and client sharing only for approved documents. Public buckets are not part of the design.' },
  { icon: ShieldCheck, title: 'No autonomous AI authority', body: 'Copilot remains off until a server-side provider gateway, source validation and evaluation thresholds are configured.' },
];

export default function SecurityPage() {
  return <><SiteHeader /><main className="subpage-main" id="main-content"><section className="subpage-hero"><div className="container"><span className="eyebrow">Security approach</span><h1>Trust is built in layers.<br />Not added at launch.</h1><p>MONK starts with explicit tenant boundaries, deny-by-default permissions and accountable changes.</p></div></section><section className="subpage-content"><div className="container"><div className="page-section-heading"><h2>Implemented in this repository</h2><p>These controls exist in code and database migrations. They are not certification claims.</p></div><div className="content-grid-3">{controls.map((control) => <article className="info-card" key={control.title}><control.icon /><h2>{control.title}</h2><p>{control.body}</p></article>)}</div><div className="pilot-banner"><div><h3>Before production customer data</h3><p>Complete a threat-model review, cross-tenant database integration tests, backup restore drill, SMTP and incident setup, dependency review and qualified legal review. MONK does not currently claim SOC 2, ISO 27001 or any other certification.</p></div><Link className="button button-secondary" href="https://github.com/mrprashant9339-crypto/MONK" target="_blank">Inspect the public code <ArrowUpRight /></Link></div></div></section></main><SiteFooter /></>;
}
