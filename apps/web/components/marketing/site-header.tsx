'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { Logo } from '@/components/brand';

const links = [
  { href: '/product', label: 'Product' },
  { href: '/#workflow', label: 'How it works' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/security', label: 'Security' },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Logo />
        <nav className="site-nav" aria-label="Main navigation">
          {links.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
        </nav>
        <div className="site-header-actions">
          <Link className="sign-in-link" href="/login">Sign in</Link>
          <Link className="button button-small" href="/signup">Join the pilot <ArrowUpRight /></Link>
        </div>
        <button className="icon-button mobile-menu-button" type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? 'Close menu' : 'Open menu'}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="mobile-menu" id="mobile-menu">
          <nav className="container" aria-label="Mobile navigation">
            {links.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</Link>)}
            <Link href="/login" onClick={() => setOpen(false)}>Sign in</Link>
            <Link className="button" href="/demo" onClick={() => setOpen(false)}>Explore the demo <ArrowUpRight /></Link>
          </nav>
        </div>
      )}
    </header>
  );
}
