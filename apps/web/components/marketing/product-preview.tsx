import { ArrowDownToLine, ArrowUpRight, Check, ChevronDown, FileText, Folder, LayoutGrid, MoreHorizontal, Plus, Search, Sparkles, Users } from 'lucide-react';
import { BrandMark } from '@/components/brand';

const bars = [38, 55, 44, 72, 64, 86, 78, 92, 70, 82, 96, 88];

export function ProductPreview() {
  return (
    <div className="product-preview" aria-label="Preview of the MONK organization dashboard">
      <aside className="preview-sidebar">
        <div className="preview-brand"><BrandMark size={25} /><span>MONK</span></div>
        <div className="preview-org"><span className="preview-org-icon">N</span><span>Northstar Studio</span><ChevronDown size={12} /></div>
        <div className="preview-nav active"><LayoutGrid /> Overview</div>
        <div className="preview-nav"><Users /> CRM <span>12</span></div>
        <div className="preview-nav"><Folder /> Projects</div>
        <div className="preview-nav"><Check /> Tasks <span>5</span></div>
        <div className="preview-nav"><FileText /> Documents</div>
        <div className="preview-sidebar-bottom"><Sparkles /> Ask Copilot</div>
      </aside>
      <div className="preview-main">
        <div className="preview-topbar"><div><Search /><span>Search anything</span><kbd>⌘ K</kbd></div><button aria-label="Add"><Plus /></button><span className="avatar avatar-mint">AM</span></div>
        <div className="preview-content">
          <div className="preview-heading"><div><small>Thursday, 5 November</small><h3>Good morning, Arjun.</h3><p>Here’s what needs your attention today.</p></div><button><ArrowDownToLine /> Export</button></div>
          <div className="preview-stats">
            <div><span>Active projects</span><strong>8</strong><small><ArrowUpRight /> 2 due this month</small></div>
            <div><span>Tasks due</span><strong>12</strong><small>Across 5 projects</small></div>
            <div><span>Follow-ups</span><strong>5</strong><small className="warn">1 overdue</small></div>
            <div><span>Awaiting review</span><strong>3</strong><small>Ready for your eyes</small></div>
          </div>
          <div className="preview-panels">
            <section className="preview-attention">
              <div className="preview-section-title"><h4>Needs your attention</h4><span>View all <ArrowUpRight /></span></div>
              <div className="preview-task"><span className="task-check" /><div><strong>Refine packaging dielines</strong><small>Kaya brand evolution</small></div><span className="preview-date">Today</span><span className="avatar">AM</span></div>
              <div className="preview-task"><span className="task-check" /><div><strong>Homepage design QA</strong><small>Nila digital flagship</small></div><span className="preview-date">Today</span><span className="avatar avatar-mint">NK</span></div>
              <div className="preview-task"><span className="task-check" /><div><strong>Send scope and estimate</strong><small>Cobalt Labs · Qualified lead</small></div><span className="preview-date">4:00 PM</span><span className="avatar">AM</span></div>
            </section>
            <section className="preview-chart">
              <div className="preview-section-title"><h4>Delivery rhythm</h4><MoreHorizontal /></div>
              <div className="chart-total"><strong>35</strong><span>tasks completed<br /><small>Last 12 weeks</small></span></div>
              <div className="mini-bars">{bars.map((height, index) => <i key={index} style={{ height: `${height}%` }} className={index === 10 ? 'highlight' : ''} />)}</div>
              <div className="chart-labels"><span>Aug</span><span>Sep</span><span>Oct</span></div>
            </section>
          </div>
          <section className="preview-projects">
            <div className="preview-section-title"><h4>Project health</h4><span>All projects <ArrowUpRight /></span></div>
            <div className="preview-project-row"><span className="project-code">KA</span><div><strong>Kaya brand evolution</strong><small>Kaya Foods</small></div><span className="health-dot" /><span>On track</span><div className="preview-progress"><i style={{ width: '68%' }} /></div><strong>68%</strong></div>
            <div className="preview-project-row"><span className="project-code dark">NI</span><div><strong>Nila digital flagship</strong><small>Nila Skincare</small></div><span className="health-dot warning" /><span>At risk</span><div className="preview-progress"><i style={{ width: '82%' }} /></div><strong>82%</strong></div>
          </section>
        </div>
      </div>
      <div className="preview-copilot"><span><Sparkles /></span><div><small>MONK COPILOT</small><strong>What needs my attention?</strong></div><ArrowUpRight /></div>
    </div>
  );
}
