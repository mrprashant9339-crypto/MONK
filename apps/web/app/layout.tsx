import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: { default: 'MONK — Business, beautifully organized', template: '%s · MONK' },
  description: 'One calm workspace for clients, projects, tasks and documents. Built for agencies and professional service teams.',
  keywords: ['business operations', 'client workspace', 'CRM', 'project management', 'professional services'],
  openGraph: {
    title: 'MONK — Less chasing. More knowing.',
    description: 'The calm business operating ecosystem for service teams.',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
