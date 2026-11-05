import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, Building2, Rocket, UsersRound } from 'lucide-react';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';

export const metadata: Metadata = { title: 'Pricing', description: 'MONK pilot packaging for service teams, with transparent limits and no security add-ons.' };

const plans = [
  { icon: UsersRound, name: 'Starter', for: 'A small team proving a calmer workflow', features: ['Up to 3 users', '5 active projects', '5 GB private storage', 'CRM, projects and tasks', 'Basic document review'] },
  { icon: Rocket, name: 'Growth', for: 'Agencies running multiple client engagements', features: ['Up to 25 users', 'Unlimited active projects', '100 GB private storage', 'Advanced dashboards', 'Client portal when released'] },
  { icon: Building2, name: 'Business', for: 'Established teams with deeper operations', features: ['Up to 100 users', '500 GB private storage', 'Custom CRM fields', 'Future automation modules', 'Priority onboarding'] },
];

export default function PricingPage() {
  return <><SiteHeader /><main className="subpage-main" id="main-content"><section className="subpage-hero"><div className="container"><span className="eyebrow">Pilot packaging</span><h1>Simple by design.<br />Honest from day one.</h1><p>MONK is in pilot. Final prices will be published after real operating costs and customer willingness-to-pay are validated—never before.</p></div></section><section className="subpage-content"><div className="container"><div className="content-grid-3">{plans.map((plan) => <article className="info-card pricing-card" key={plan.name}><plan.icon /><span className="badge badge-plain">Pilot plan</span><h2>{plan.name}</h2><p>{plan.for}</p><ul>{plan.features.map((feature) => <li key={feature}>{feature}</li>)}</ul><Link className="button button-secondary" href="/signup">Request pilot access <ArrowUpRight /></Link></article>)}</div><div className="pilot-banner"><div><h3>Security is never a paid add-on</h3><p>MFA support, tenant isolation, audit records and data export belong to every plan. Usage limits will always be visible before you reach them.</p></div><Link className="text-link" href="/security">Our security approach <ArrowUpRight /></Link></div></div></section></main><SiteFooter /></>;
}
