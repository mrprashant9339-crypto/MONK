import Link from 'next/link';
import { cn } from '@/lib/utils';

export function BrandMark({ size = 30, inverted = false }: { size?: number; inverted?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill={inverted ? '#ffffff' : '#17191C'} />
      <path d="M8 21V12.5C8 11.7 8.7 11 9.5 11C10.3 11 11 11.7 11 12.5V21M11 15.5C11 12.5 16 12.5 16 15.5V21M16 15.5C16 12.5 21 12.5 21 15.5V21M21 16C21 13 24 13 24 16V21" stroke={inverted ? '#17191C' : '#ffffff'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="24" cy="9" r="2" fill="#9BE3BC" />
    </svg>
  );
}

export function Logo({ href = '/', inverted = false, compact = false, className }: { href?: string; inverted?: boolean; compact?: boolean; className?: string }) {
  return (
    <Link href={href} className={cn('brand-logo', inverted && 'brand-logo-inverted', className)} aria-label="MONK home">
      <BrandMark inverted={inverted} />
      {!compact && <span>MONK</span>}
    </Link>
  );
}
