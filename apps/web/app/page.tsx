import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Check, CheckCircle2, Clock3, FileCheck2, FolderKanban, Layers3, MessageSquareText, Search, ShieldCheck, Sparkles, UsersRound } from 'lucide-react';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';
import { ProductPreview } from '@/components/marketing/product-preview';

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <section className="hero">
          <div className="container hero-inner">
            <Link className="hero-pill" href="/product">
              <span /> Built for the way service teams work <ArrowRight size={14} />
            </Link>
            <h1>Less chasing.<br /><span>More knowing.</span></h1>
            <p className="hero-copy">One calm workspace for your clients, projects and documents—so everyone knows what’s happening, what’s next, and what needs attention.</p>
            <div className="hero-actions">
              <Link className="button" href="/demo">Explore the live demo <ArrowUpRight /></Link>
              <Link className="button button-secondary" href="/signup">Join the pilot <ArrowRight /></Link>
            </div>
            <p className="hero-note"><Check size={14} /> No credit card <span>·</span> Thoughtful onboarding <span>·</span> Your data stays yours</p>
          </div>
          <div className="container preview-wrap"><ProductPreview /></div>
        </section>

        <section className="principle-strip">
          <div className="container principle-grid">
            <div><strong>One source of truth</strong><span>Every client, conversation and deliverable in context.</span></div>
            <div><strong>Clarity in under a minute</strong><span>Know what’s moving, what’s late and who owns it.</span></div>
            <div><strong>Control without complexity</strong><span>Permissions and accountability built into the foundation.</span></div>
          </div>
        </section>

        <section className="manifesto section-space">
          <div className="container manifesto-grid">
            <div>
              <span className="eyebrow">A calmer way to operate</span>
              <h2>Your business isn’t messy.<br />Your tools are.</h2>
            </div>
            <div className="manifesto-copy">
              <p>Customer details live in one tab. Project updates in another. The latest file is buried in a thread. By the time you find the answer, the moment to act has passed.</p>
              <p>MONK brings the whole engagement into focus. Not another board to maintain—a shared operational memory your team can trust.</p>
              <Link className="text-link" href="/product">See the product philosophy <ArrowUpRight /></Link>
            </div>
          </div>
        </section>

        <section className="workflow-section section-space" id="workflow">
          <div className="container">
            <div className="section-heading centered">
              <span className="eyebrow">From hello to handover</span>
              <h2>One workflow. Nothing falls through.</h2>
              <p>Follow the work, not the tool. Every step keeps the customer and the bigger picture in view.</p>
            </div>
            <div className="workflow-grid">
              <article className="workflow-card">
                <div className="workflow-number">01</div>
                <div className="workflow-visual lead-visual">
                  <div className="mini-window-bar"><span /><span>New lead</span><small>Just now</small></div>
                  <div className="mini-person"><span className="avatar avatar-mint">DM</span><div><strong>Dev Malhotra</strong><small>Cobalt Labs · Referral</small></div><span className="badge badge-success">Qualified</span></div>
                  <div className="mini-detail"><span>Next action</span><strong>Send scope and estimate</strong><small>Today, 4:00 PM · Arjun</small></div>
                </div>
                <UsersRound className="workflow-icon" />
                <h3>Capture the relationship</h3>
                <p>Leads, contacts, companies and every follow-up—organized around the customer, not scattered across inboxes.</p>
              </article>
              <article className="workflow-card featured">
                <div className="workflow-number">02</div>
                <div className="workflow-visual project-visual">
                  <div className="mini-window-bar"><span /><span>Kaya brand evolution</span><small>KAYA-24</small></div>
                  <div className="mini-project-meta"><span className="badge badge-success">On track</span><small>Due 20 Nov</small></div>
                  <div className="mini-progress-label"><span>Delivery progress</span><strong>68%</strong></div>
                  <div className="mini-progress"><i /></div>
                  <div className="mini-task-row"><CheckCircle2 /><span>Identity directions</span><small>Done</small></div>
                  <div className="mini-task-row"><span className="mini-radio" /><span>Packaging dielines</span><small>Today</small></div>
                </div>
                <FolderKanban className="workflow-icon" />
                <h3>Deliver with visibility</h3>
                <p>Projects, milestones and tasks stay connected to the client. See blockers early and know exactly who owns the next move.</p>
              </article>
              <article className="workflow-card">
                <div className="workflow-number">03</div>
                <div className="workflow-visual document-visual">
                  <div className="mini-window-bar"><span /><span>Approved deliverables</span><small>2 files</small></div>
                  <div className="mini-document"><FileCheck2 /><div><strong>Brand guidelines v3.pdf</strong><small>Approved by Maya · 8.2 MB</small></div><CheckCircle2 /></div>
                  <div className="mini-document"><FileCheck2 /><div><strong>Packaging overview.pdf</strong><small>Approved by Maya · 12.1 MB</small></div><CheckCircle2 /></div>
                  <div className="mini-share"><ShieldCheck /> Only approved versions are visible</div>
                </div>
                <FileCheck2 className="workflow-icon" />
                <h3>Share with confidence</h3>
                <p>Review, approve and share the right version. Clients get a calm view of progress without seeing your internal working notes.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="feature-section section-space">
          <div className="container">
            <div className="section-heading split-heading">
              <div><span className="eyebrow">The whole picture</span><h2>Quietly powerful.<br />Deliberately simple.</h2></div>
              <p>The capabilities your team needs every day, without the clutter of an enterprise system you have to fight.</p>
            </div>
            <div className="bento-grid">
              <article className="bento-card bento-overview">
                <div className="bento-copy"><span className="feature-icon"><Layers3 /></span><h3>An overview that answers, not overwhelms</h3><p>Open one screen and understand the state of your business. Every number takes you back to the source.</p></div>
                <div className="overview-mini">
                  <div className="overview-mini-top"><span>Good morning, Arjun.</span><span className="badge badge-success">All caught up</span></div>
                  <div className="overview-mini-stats"><div><small>Active projects</small><strong>8</strong></div><div><small>Needs attention</small><strong>5</strong></div><div><small>Awaiting review</small><strong>3</strong></div></div>
                  <div className="overview-mini-row"><Clock3 /><div><strong>Homepage design QA</strong><small>Nila digital flagship · Due today</small></div><ArrowUpRight /></div>
                  <div className="overview-mini-row"><MessageSquareText /><div><strong>Maya approved brand guidelines</strong><small>Kaya brand evolution · 48m ago</small></div><ArrowUpRight /></div>
                </div>
              </article>
              <article className="bento-card bento-search">
                <span className="feature-icon"><Search /></span><h3>Find anything, in context</h3><p>Search across your workspace without losing the thread.</p>
                <div className="search-mini"><div className="search-mini-input"><Search /><span>kaya</span><kbd>esc</kbd></div><small>BEST MATCHES</small><div><UsersRound /><span><strong>Kaya Foods</strong><small>Company · Active client</small></span><ArrowUpRight /></div><div><FolderKanban /><span><strong>Kaya brand evolution</strong><small>Project · On track</small></span><ArrowUpRight /></div></div>
              </article>
              <article className="bento-card bento-permission">
                <span className="feature-icon"><ShieldCheck /></span><h3>The right view for everyone</h3><p>Your team, clients and partners see only what they need. Nothing more.</p>
                <div className="permission-mini"><div><span className="avatar avatar-dark">AM</span><span><strong>Arjun</strong><small>Owner</small></span><span>Full workspace</span></div><div><span className="avatar avatar-mint">NK</span><span><strong>Naina</strong><small>Manager</small></span><span>Assigned teams</span></div><div><span className="avatar">MK</span><span><strong>Maya</strong><small>Client</small></span><span>Shared only</span></div></div>
              </article>
            </div>
          </div>
        </section>

        <section className="copilot-section section-space">
          <div className="container copilot-grid">
            <div className="copilot-copy">
              <span className="eyebrow">AI with boundaries</span>
              <h2>A useful second pair of eyes.<br />Not another decision-maker.</h2>
              <p>Ask what’s at risk, summarize a client engagement or draft the next update. Copilot works from records you’re allowed to see and shows its sources.</p>
              <ul className="check-list">
                <li><Check /> Answers grounded in your workspace</li>
                <li><Check /> Sources you can open and verify</li>
                <li><Check /> You approve every consequential action</li>
              </ul>
              <span className="copilot-note"><Sparkles /> Copilot is rolled out gradually after safety evaluation.</span>
            </div>
            <div className="copilot-window">
              <div className="copilot-window-top"><span><Sparkles /> Copilot</span><small>Kaya brand evolution</small></div>
              <div className="copilot-question">What needs my attention on this project?</div>
              <div className="copilot-answer">
                <div className="ai-label"><Sparkles /> AI-generated · verify before acting</div>
                <p>The project is <strong>on track overall</strong>, but two things need your attention:</p>
                <ol><li><strong>Packaging dielines</strong> are due today and still in progress.</li><li>The <strong>client walkthrough</strong> tomorrow hasn’t been prepared yet.</li></ol>
                <div className="copilot-sources"><span>Sources</span><button>Kaya brand evolution <ArrowUpRight /></button><button>2 related tasks <ArrowUpRight /></button></div>
              </div>
              <div className="copilot-composer"><span>Ask a follow-up…</span><button aria-label="Send sample question"><ArrowUpRight /></button></div>
            </div>
          </div>
        </section>

        <section className="security-section section-space">
          <div className="container security-card">
            <div><span className="feature-icon"><ShieldCheck /></span><span className="eyebrow">Trust is a feature</span><h2>Your business stays your business.</h2><p>Tenant isolation, row-level security, permission checks and accountable records aren’t add-ons. They’re where MONK starts.</p></div>
            <div className="security-points"><div><CheckCircle2 /><span><strong>Private by default</strong><small>No public file buckets or open client records.</small></span></div><div><CheckCircle2 /><span><strong>Portable by design</strong><small>Export your organization’s data in open formats.</small></span></div><div><CheckCircle2 /><span><strong>Human in control</strong><small>No autonomous agents with broad write access.</small></span></div><Link className="text-link" href="/security">Read our security approach <ArrowUpRight /></Link></div>
          </div>
        </section>

        <section className="final-cta-section">
          <div className="container final-cta">
            <span className="eyebrow">A clearer week starts here</span>
            <h2>Bring the work together.<br />Leave the chasing behind.</h2>
            <p>Explore a working MONK workspace, or join the pilot and help shape what comes next.</p>
            <div className="hero-actions"><Link className="button button-mint" href="/demo">Explore the live demo <ArrowUpRight /></Link><Link className="button final-secondary" href="/signup">Join the pilot <ArrowRight /></Link></div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
