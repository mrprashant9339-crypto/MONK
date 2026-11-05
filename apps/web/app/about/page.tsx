import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';

export const metadata: Metadata = { title: 'About', description: 'Why MONK is building a calmer operating system for service businesses.' };

export default function AboutPage() {
  return <><SiteHeader /><main className="subpage-main" id="main-content"><section className="subpage-hero"><div className="container"><span className="eyebrow">Why MONK exists</span><h1>Software should give you<br />your time back.</h1><p>Small service teams don’t need another dashboard to maintain. They need a reliable answer to “what’s happening, and what do we do next?”</p></div></section><section className="subpage-content narrow"><div className="container legal-document"><section><h2>Our product thesis</h2><p>Businesses buy the end of a recurring irritation, not a list of software categories. For MONK, that irritation is customer information spread across five tools with no shared history or accountability.</p><p>We are building one organized workspace for the customers, work, people and documents of a business—with AI assistance that respects permissions and keeps a human in control.</p></section><section><h2>Deliberate scope</h2><p>MONK starts with agencies and professional service teams. The first workflow is lead to delivered work to approved record. Marketplace, finance, payroll and broad autonomous agents are not shortcuts we are willing to take.</p></section><section><h2>Built in the open</h2><p>The working implementation is available in a public GitHub repository. That makes the architecture, security controls and remaining production checklist inspectable.</p><Link className="text-link" href="https://github.com/mrprashant9339-crypto/MONK" target="_blank">View the MONK repository <ArrowUpRight /></Link></section></div></section></main><SiteFooter /></>;
}
