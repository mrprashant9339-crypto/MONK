import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Logo } from '@/components/brand';

const groups: Array<{ title: string; links: Array<[string, string]> }> = [
  { title: 'Product', links: [['Overview', '/product'], ['Live demo', '/demo'], ['Pricing', '/pricing'], ['Security', '/security']] },
  { title: 'Company', links: [['About', '/about'], ['Contact', '/contact'], ['System status', '/status'], ['Roadmap', '/product#roadmap']] },
  { title: 'Legal', links: [['Privacy', '/legal/privacy'], ['Terms', '/legal/terms'], ['Cookies', '/legal/cookies'], ['Acceptable use', '/legal/acceptable-use']] },
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Logo inverted />
            <p>One organized workspace for the customers, work, people and documents of your business.</p>
            <Link href="/contact">Talk to a human <ArrowUpRight size={15} /></Link>
          </div>
          {groups.map((group) => (
            <div className="footer-links" key={group.title}>
              <h2>{group.title}</h2>
              {group.links.map(([label, href]) => <Link href={href} key={label}>{label}</Link>)}
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <span>© 2026 MONK. All rights reserved.</span>
          <span>Built with restraint. Designed for clarity.</span>
        </div>
      </div>
    </footer>
  );
}
