import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Status', description: 'MONK service status and production monitoring readiness.' };
export const dynamic = 'force-dynamic';

export default async function StatusPage() {
  let databaseReachable = false;
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from('roles').select('id', { head: true, count: 'exact' });
    databaseReachable = !error;
  } catch {
    databaseReachable = false;
  }

  return (
    <>
      <SiteHeader />
      <main className="subpage-main" id="main-content">
        <section className="subpage-hero">
          <div className="container">
            <span className="eyebrow">Service status</span>
            <h1>Clear communication,<br />especially when things break.</h1>
            <p>MONK is in preproduction pilot setup. Public incident history begins when the monitored production environment goes live.</p>
          </div>
        </section>
        <section className="subpage-content narrow">
          <div className="container">
            <div className="status-card">
              <div className={`status-overall ${databaseReachable ? '' : 'degraded'}`}>
                <span />
                <h2>{databaseReachable ? 'Application and database reachable' : 'Application online · database unreachable'}</h2>
              </div>
              <div className="status-row"><span>Web application</span><span>Online</span></div>
              <div className="status-row"><span>Database connection</span><span className={databaseReachable ? '' : 'status-value-degraded'}>{databaseReachable ? 'Reachable from this deployment' : 'Unavailable from this deployment'}</span></div>
              <div className="status-row"><span>Application health endpoint</span><span>/api/v1/health</span></div>
              <div className="status-row"><span>Public incident history</span><span>Starts at production launch</span></div>
            </div>
            <div className="pilot-banner">
              <div><h3>No silent incidents</h3><p>The production release gate includes uptime monitoring, alert routing, an on-call owner and a tested synthetic incident.</p></div>
              <Link className="text-link" href="/security">Read the release gates <ArrowUpRight /></Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
