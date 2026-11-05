'use client';

import { useState } from 'react';
import { Activity as ActivityIcon, ArrowUpRight, CalendarDays, Check, CheckCircle2, ChevronRight, Circle, File, FileCheck2, FileText, FolderKanban, LayoutList, MoreHorizontal, Plus, Search, ShieldCheck, Trello, UserRound, UsersRound } from 'lucide-react';
import type { Contact, Project, Task, TaskStatus, WorkspaceData } from '@/lib/types';
import { cn, formatDate, initials, isOverdue, relativeTime, titleCase } from '@/lib/utils';

export type WorkspaceView = 'overview' | 'crm' | 'projects' | 'tasks' | 'documents' | 'settings';

export function StatusBadge({ value }: { value: string }) {
  const tone = ['on_track', 'active', 'approved', 'done', 'qualified', 'converted'].includes(value)
    ? 'success'
    : ['at_risk', 'in_review', 'review', 'contacted', 'blocked'].includes(value)
      ? 'warning'
      : ['off_track', 'overdue', 'disqualified'].includes(value) ? 'danger' : '';
  return <span className={cn('badge', tone && `badge-${tone}`)}>{titleCase(value)}</span>;
}

function EmptyView({ icon: Icon, title, body, action, onAction }: { icon: typeof Circle; title: string; body: string; action: string; onAction: () => void }) {
  return <div className="empty-state"><span className="empty-state-icon"><Icon /></span><h3>{title}</h3><p>{body}</p><button className="button button-small" onClick={onAction}><Plus />{action}</button></div>;
}

function ViewHeader({ eyebrow, title, description, action, onAction }: { eyebrow?: string; title: string; description: string; action?: string; onAction?: () => void }) {
  return <div className="workspace-view-header"><div>{eyebrow && <span className="view-eyebrow">{eyebrow}</span>}<h1>{title}</h1><p>{description}</p></div>{action && onAction && <button className="button button-small" onClick={onAction}><Plus />{action}</button>}</div>;
}

export function OverviewView({ data, onNavigate, onSelectProject, onTaskStatus }: {
  data: WorkspaceData;
  onNavigate: (view: WorkspaceView) => void;
  onSelectProject: (project: Project) => void;
  onTaskStatus: (task: Task, status: TaskStatus) => void;
}) {
  const activeProjects = data.projects.filter((project) => !['completed', 'archived'].includes(project.status));
  const openTasks = data.tasks.filter((task) => task.status !== 'done');
  const dueTasks = openTasks.filter((task) => task.dueDate && task.dueDate <= '2026-11-05');
  const followUps = data.leads.filter((lead) => !['converted', 'disqualified'].includes(lead.status));
  const reviews = data.documents.filter((document) => document.reviewStatus === 'in_review');
  const firstName = data.user.name.split(' ')[0];
  const taskFlow = [
    { label: 'To do', status: 'todo' },
    { label: 'Active', status: 'in_progress' },
    { label: 'Blocked', status: 'blocked' },
    { label: 'Review', status: 'review' },
    { label: 'Done', status: 'done' },
  ].map((item) => ({ ...item, count: data.tasks.filter((task) => task.status === item.status).length }));
  const maxFlow = Math.max(1, ...taskFlow.map((item) => item.count));

  return <div className="workspace-view overview-view">
    <div className="overview-greeting"><div><span className="view-eyebrow">Thursday, 5 November</span><h1>Good morning, {firstName}.</h1><p>Here’s what needs your attention today.</p></div><span className="calm-status"><span /> Workspace up to date</span></div>
    <div className="metric-grid">
      <button className="metric-card" onClick={() => onNavigate('projects')}><span>Active projects</span><strong>{activeProjects.length}</strong><small>{activeProjects.filter((project) => project.dueDate?.startsWith('2026-11')).length} due this month <ArrowUpRight /></small></button>
      <button className="metric-card" onClick={() => onNavigate('tasks')}><span>Tasks due</span><strong>{dueTasks.length}</strong><small>{openTasks.length} open across your workspace <ArrowUpRight /></small></button>
      <button className="metric-card" onClick={() => onNavigate('crm')}><span>Follow-ups</span><strong>{followUps.length}</strong><small className={followUps.some((lead) => lead.nextActionAt && lead.nextActionAt.slice(0, 10) < '2026-11-05') ? 'text-warning' : ''}>{followUps.filter((lead) => lead.nextActionAt && lead.nextActionAt.slice(0, 10) < '2026-11-05').length} overdue <ArrowUpRight /></small></button>
      <button className="metric-card" onClick={() => onNavigate('documents')}><span>Awaiting review</span><strong>{reviews.length}</strong><small>Ready for your eyes <ArrowUpRight /></small></button>
    </div>
    <div className="overview-primary-grid">
      <section className="panel attention-panel">
        <div className="panel-header"><div><h2>Needs your attention</h2><span>{dueTasks.length} items</span></div><button onClick={() => onNavigate('tasks')}>View all <ArrowUpRight /></button></div>
        <div className="attention-list">
          {dueTasks.slice(0, 4).map((task) => {
            const project = data.projects.find((item) => item.id === task.projectId);
            return <div className="attention-row" key={task.id}><button className="task-complete-button" aria-label={`Mark ${task.title} done`} onClick={() => onTaskStatus(task, 'done')}><Check /></button><div><strong>{task.title}</strong><span>{project?.name ?? 'Project'} · {task.priority} priority</span></div><span className={cn('due-label', isOverdue(task.dueDate) && 'overdue')}>{isOverdue(task.dueDate) ? 'Overdue' : 'Today'}</span><span className="avatar avatar-mint">{initials(task.assignee)}</span></div>;
          })}
          {followUps.slice(0, Math.max(0, 4 - dueTasks.length)).map((lead) => <div className="attention-row" key={lead.id}><span className="attention-type-icon"><UserRound /></span><div><strong>{lead.nextAction ?? `Follow up with ${lead.name}`}</strong><span>{lead.name} · {titleCase(lead.status)} lead</span></div><span className="due-label">{formatDate(lead.nextActionAt, { day: 'numeric', month: 'short' })}</span><span className="avatar">{initials(lead.owner)}</span></div>)}
          {dueTasks.length === 0 && followUps.length === 0 && <div className="panel-empty"><CheckCircle2 /><strong>You’re all caught up</strong><span>New tasks and follow-ups will appear here.</span></div>}
        </div>
      </section>
      <section className="panel delivery-panel">
        <div className="panel-header"><div><h2>Task flow</h2><span>Current workspace</span></div><span className="badge badge-success">Live records</span></div>
        <div className="delivery-total"><strong>{openTasks.length}</strong><span>open tasks<small>Across your active projects</small></span></div>
        <div className="delivery-chart" aria-label="Current tasks by status">{taskFlow.map((item) => <div key={item.status}><i style={{ height: `${Math.max(4, (item.count / maxFlow) * 100)}%` }} className={item.status === 'in_progress' ? 'current' : ''} /><span>{item.label} · {item.count}</span></div>)}</div>
      </section>
    </div>
    <div className="overview-secondary-grid">
      <section className="panel project-health-panel">
        <div className="panel-header"><div><h2>Project health</h2><span>{activeProjects.length} active</span></div><button onClick={() => onNavigate('projects')}>All projects <ArrowUpRight /></button></div>
        <div className="project-health-list">{activeProjects.slice(0, 4).map((project) => <button className="project-health-row" key={project.id} onClick={() => onSelectProject(project)}><span className="project-monogram">{initials(project.clientName)}</span><div><strong>{project.name}</strong><span>{project.clientName}</span></div><StatusBadge value={project.health} /><div className="progress-with-value"><div className="progress-track"><i style={{ width: `${project.progress}%` }} /></div><span>{project.progress}%</span></div><ChevronRight /></button>)}</div>
      </section>
      <section className="panel activity-panel">
        <div className="panel-header"><div><h2>Recent activity</h2><span>Across your workspace</span></div><ActivityIcon /></div>
        <div className="activity-list">{data.activities.slice(0, 4).map((activity) => <div className="activity-row" key={activity.id}><span className="avatar">{initials(activity.actor)}</span><div><p><strong>{activity.actor}</strong> {activity.action}</p><span>{relativeTime(activity.createdAt)}</span></div></div>)}{data.activities.length === 0 && <div className="panel-empty"><ActivityIcon /><strong>No activity yet</strong><span>Your team’s changes will appear here.</span></div>}</div>
      </section>
    </div>
  </div>;
}

export function CrmView({ data, onCreateContact, onCreateLead, onSelectContact }: {
  data: WorkspaceData;
  onCreateContact: () => void;
  onCreateLead: () => void;
  onSelectContact: (contact: Contact) => void;
}) {
  const [tab, setTab] = useState<'contacts' | 'leads'>('contacts');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const contacts = data.contacts.filter((contact) => `${contact.firstName} ${contact.lastName} ${contact.email} ${contact.companyName}`.toLowerCase().includes(query.toLowerCase()));
  const leads = data.leads.filter((lead) => (filter === 'all' || lead.status === filter) && `${lead.name} ${lead.email} ${lead.source}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="workspace-view">
    <ViewHeader eyebrow="Relationships" title="CRM & leads" description="Every customer, conversation and next step in one place." action={tab === 'contacts' ? 'Add contact' : 'Add lead'} onAction={tab === 'contacts' ? onCreateContact : onCreateLead} />
    <div className="view-toolbar"><div className="segmented-control"><button className={tab === 'contacts' ? 'active' : ''} onClick={() => setTab('contacts')}>Contacts <span>{data.contacts.length}</span></button><button className={tab === 'leads' ? 'active' : ''} onClick={() => setTab('leads')}>Leads <span>{data.leads.length}</span></button></div><div className="toolbar-right"><label className="table-search"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${tab}…`} aria-label={`Search ${tab}`} /></label>{tab === 'leads' && <select className="select compact-select" value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter leads"><option value="all">All statuses</option><option value="new">New</option><option value="contacted">Contacted</option><option value="qualified">Qualified</option></select>}</div></div>
    {tab === 'contacts' ? <section className="data-panel">{contacts.length ? <div className="table-scroll"><table className="data-table"><thead><tr><th>Name</th><th>Company</th><th>Contact details</th><th>Owner</th><th>Last activity</th><th><span className="sr-only">Open</span></th></tr></thead><tbody>{contacts.map((contact) => <tr key={contact.id}><td><button className="person-cell" onClick={() => onSelectContact(contact)}><span className="avatar avatar-mint">{initials(`${contact.firstName} ${contact.lastName}`)}</span><span><strong>{contact.firstName} {contact.lastName}</strong><small>{contact.title ?? 'Contact'}</small></span></button></td><td><strong className="table-primary">{contact.companyName}</strong><div className="tag-list">{contact.tags.slice(0, 1).map((tag) => <span key={tag}>{tag}</span>)}</div></td><td><span className="table-primary">{contact.email}</span><small className="table-secondary">{contact.phone ?? 'No phone'}</small></td><td>{contact.owner}</td><td>{relativeTime(contact.lastActivity)}</td><td><button className="icon-button" onClick={() => onSelectContact(contact)} aria-label={`Open ${contact.firstName} ${contact.lastName}`}><ChevronRight /></button></td></tr>)}</tbody></table></div> : <EmptyView icon={UsersRound} title={query ? 'No matching contacts' : 'Start your client list'} body={query ? 'Try a different name, email or company.' : 'Add your first contact and keep every relationship organized from day one.'} action="Add contact" onAction={onCreateContact} />}</section> : <section className="data-panel">{leads.length ? <div className="table-scroll"><table className="data-table"><thead><tr><th>Lead</th><th>Source</th><th>Status</th><th>Score</th><th>Next action</th><th>Owner</th></tr></thead><tbody>{leads.map((lead) => <tr key={lead.id}><td><span className="table-primary strong">{lead.name}</span><small className="table-secondary">{lead.email ?? lead.phone}</small></td><td>{titleCase(lead.source)}</td><td><StatusBadge value={lead.status} /></td><td><span className="lead-score"><i style={{ '--score': `${lead.score}%` } as React.CSSProperties} />{lead.score}</span></td><td><span className="table-primary">{lead.nextAction ?? 'Choose next action'}</span><small className={cn('table-secondary', lead.nextActionAt && lead.nextActionAt.slice(0, 10) < '2026-11-05' && 'text-danger')}>{formatDate(lead.nextActionAt)}</small></td><td>{lead.owner}</td></tr>)}</tbody></table></div> : <EmptyView icon={UserRound} title={query || filter !== 'all' ? 'No leads match these filters' : 'Capture your first lead'} body={query || filter !== 'all' ? 'Clear the search or choose another status.' : 'Keep the source, qualification and next action together.'} action="Add lead" onAction={onCreateLead} />}</section>}
    <div className="table-footer"><span>Showing {tab === 'contacts' ? contacts.length : leads.length} {tab}</span><span>Workspace data · permission scoped</span></div>
  </div>;
}

export function ProjectsView({ data, onCreateProject, onSelectProject }: { data: WorkspaceData; onCreateProject: () => void; onSelectProject: (project: Project) => void }) {
  const [filter, setFilter] = useState('active');
  const projects = data.projects.filter((project) => filter === 'all' || (filter === 'attention' ? project.health !== 'on_track' : !['completed', 'archived'].includes(project.status)));
  return <div className="workspace-view"><ViewHeader eyebrow="Delivery" title="Projects" description="See every engagement, its health and the work behind it." action="Create project" onAction={onCreateProject} /><div className="view-toolbar"><div className="segmented-control"><button className={filter === 'active' ? 'active' : ''} onClick={() => setFilter('active')}>Active <span>{data.projects.filter((project) => !['completed', 'archived'].includes(project.status)).length}</span></button><button className={filter === 'attention' ? 'active' : ''} onClick={() => setFilter('attention')}>Needs attention</button><button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button></div><span className="private-label"><FolderKanban />{projects.length} shown</span></div>
    {projects.length ? <div className="project-card-grid">{projects.map((project) => <button className="project-card" key={project.id} onClick={() => onSelectProject(project)}><div className="project-card-top"><span className="project-monogram">{initials(project.clientName)}</span><StatusBadge value={project.health} /></div><span className="project-code-label">{project.code}</span><span className="project-card-heading">{project.name}</span><span className="project-card-client">{project.clientName}</span><div className="project-card-progress"><div><span>Progress</span><strong>{project.progress}%</strong></div><div className="progress-track"><i style={{ width: `${project.progress}%` }} /></div></div><div className="project-card-footer"><span><CheckCircle2 />{project.doneTaskCount}/{project.taskCount} tasks</span><span><CalendarDays />{formatDate(project.dueDate, { day: 'numeric', month: 'short' })}</span><ArrowUpRight /></div></button>)}</div> : <EmptyView icon={FolderKanban} title="No projects in this view" body="Choose another filter or create a project to start delivering work." action="Create project" onAction={onCreateProject} />}
  </div>;
}

const taskColumns: Array<{ id: TaskStatus; label: string }> = [{ id: 'todo', label: 'To do' }, { id: 'in_progress', label: 'In progress' }, { id: 'blocked', label: 'Blocked' }, { id: 'review', label: 'Review' }, { id: 'done', label: 'Done' }];

export function TasksView({ data, onCreateTask, onTaskStatus }: { data: WorkspaceData; onCreateTask: () => void; onTaskStatus: (task: Task, status: TaskStatus) => void }) {
  const [layout, setLayout] = useState<'board' | 'list'>('board');
  const [mineOnly, setMineOnly] = useState(false);
  const tasks = data.tasks.filter((task) => !mineOnly || task.assignee === 'You');
  const projectName = (id: string) => data.projects.find((project) => project.id === id)?.name ?? 'Project';
  return <div className="workspace-view"><ViewHeader eyebrow="Execution" title="Tasks" description="The next move, its owner and its deadline—always clear." action="Create task" onAction={onCreateTask} /><div className="view-toolbar"><div className="segmented-control"><button className={!mineOnly ? 'active' : ''} onClick={() => setMineOnly(false)}>Team tasks <span>{data.tasks.length}</span></button><button className={mineOnly ? 'active' : ''} onClick={() => setMineOnly(true)}>My tasks</button></div><div className="segmented-control icon-segment"><button className={layout === 'board' ? 'active' : ''} onClick={() => setLayout('board')} aria-label="Board view"><Trello /></button><button className={layout === 'list' ? 'active' : ''} onClick={() => setLayout('list')} aria-label="List view"><LayoutList /></button></div></div>
    {tasks.length === 0 ? <EmptyView icon={CheckCircle2} title="No tasks here yet" body="Create a task inside a project and give the next step a clear owner." action="Create task" onAction={onCreateTask} /> : layout === 'board' ? <div className="task-board">{taskColumns.map((column) => { const columnTasks = tasks.filter((task) => task.status === column.id); return <section className="task-column" key={column.id} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { const task = data.tasks.find((item) => item.id === event.dataTransfer.getData('text/task-id')); if (task) onTaskStatus(task, column.id); }}><div className="task-column-header"><h2>{column.label}</h2><span>{columnTasks.length}</span><MoreHorizontal /></div><div className="task-column-body">{columnTasks.map((task) => <article className="task-card" key={task.id} draggable onDragStart={(event) => event.dataTransfer.setData('text/task-id', task.id)}><div className="task-card-top"><span className={cn('priority-dot', `priority-${task.priority}`)} /> <span>{titleCase(task.priority)}</span><MoreHorizontal aria-hidden="true" /></div><h3>{task.title}</h3><p>{projectName(task.projectId)}</p>{task.blockerReason && <div className="blocker-note">{task.blockerReason}</div>}<div className="task-card-meta"><span className={cn(isOverdue(task.dueDate) && task.status !== 'done' && 'text-danger')}><CalendarDays />{formatDate(task.dueDate, { day: 'numeric', month: 'short' })}</span><span className="avatar avatar-mint">{initials(task.assignee)}</span></div><select className="task-status-select" value={task.status} onChange={(event) => onTaskStatus(task, event.target.value as TaskStatus)} aria-label={`Move ${task.title} to another status`}>{taskColumns.map((option) => <option value={option.id} key={option.id}>Move to {option.label}</option>)}</select></article>)}</div></section>; })}</div> : <section className="data-panel"><div className="table-scroll"><table className="data-table"><thead><tr><th>Task</th><th>Project</th><th>Status</th><th>Priority</th><th>Due</th><th>Owner</th></tr></thead><tbody>{tasks.map((task) => <tr key={task.id}><td><span className="table-primary strong">{task.title}</span></td><td>{projectName(task.projectId)}</td><td><select className="select compact-select" value={task.status} onChange={(event) => onTaskStatus(task, event.target.value as TaskStatus)}>{taskColumns.map((column) => <option key={column.id} value={column.id}>{column.label}</option>)}</select></td><td>{titleCase(task.priority)}</td><td className={isOverdue(task.dueDate) && task.status !== 'done' ? 'text-danger' : ''}>{formatDate(task.dueDate)}</td><td>{task.assignee}</td></tr>)}</tbody></table></div></section>}
  </div>;
}

export function DocumentsView({ data, onReview }: { data: WorkspaceData; onReview: (id: string, status: 'approved' | 'in_review' | 'draft') => void }) {
  const [filter, setFilter] = useState('all');
  const documents = data.documents.filter((document) => filter === 'all' || document.reviewStatus === filter);
  return <div className="workspace-view"><ViewHeader eyebrow="Files & approvals" title="Documents" description="The right version, in the right hands, with a clear review trail." /><div className="view-toolbar"><div className="segmented-control"><button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All files <span>{data.documents.length}</span></button><button className={filter === 'in_review' ? 'active' : ''} onClick={() => setFilter('in_review')}>Awaiting review <span>{data.documents.filter((document) => document.reviewStatus === 'in_review').length}</span></button><button className={filter === 'approved' ? 'active' : ''} onClick={() => setFilter('approved')}>Approved</button></div><span className="private-label"><ShieldCheck />Private workspace</span></div>
    {documents.length ? <div className="document-list">{documents.map((document) => <article className="document-row" key={document.id}><span className="document-icon">{document.reviewStatus === 'approved' ? <FileCheck2 /> : <FileText />}</span><div className="document-main"><strong>{document.name}</strong><span>{document.projectName} · v{document.version} · {document.size}</span></div><StatusBadge value={document.reviewStatus} /><div className="document-owner"><span className="avatar">{initials(document.owner)}</span><span>{document.owner}</span></div><span className="document-date">{relativeTime(document.updatedAt)}</span><div className="document-actions">{document.reviewStatus !== 'approved' && <button className="button button-secondary button-small" onClick={() => onReview(document.id, 'approved')}><Check />Approve</button>}{document.reviewStatus === 'approved' && document.confidentiality !== 'client_shared' && <span className="badge badge-plain">Internal only</span>}{document.reviewStatus === 'approved' && document.confidentiality === 'client_shared' && <span className="badge badge-success">Client shared</span>}</div></article>)}</div> : <EmptyView icon={File} title="No documents in this view" body="Approved files and review requests will appear here. Live file uploads are enabled after private storage is configured." action="Show all files" onAction={() => setFilter('all')} />}
  </div>;
}

export function SettingsView({ data, mode }: { data: WorkspaceData; mode: 'demo' | 'live' }) {
  return <div className="workspace-view"><ViewHeader eyebrow="Workspace" title="Settings" description="Organization details, security and your connection status." /><div className="settings-grid"><section className="panel settings-panel"><div className="panel-header"><div><h2>Organization profile</h2><span>Details used across your workspace</span></div></div><dl className="settings-list"><div><dt>Workspace name</dt><dd>{data.organization.name}</dd></div><div><dt>Workspace URL</dt><dd>{data.organization.slug}.monk.app</dd></div><div><dt>Industry</dt><dd>{data.organization.industry}</dd></div><div><dt>Region & time zone</dt><dd>{data.organization.country} · {data.organization.timezone}</dd></div><div><dt>Currency & locale</dt><dd>{data.organization.currency} · {data.organization.locale}</dd></div></dl></section><section className="panel settings-panel"><div className="panel-header"><div><h2>Your access</h2><span>Signed-in identity and role</span></div></div><div className="settings-profile"><span className="avatar avatar-mint">{initials(data.user.name)}</span><div><strong>{data.user.name}</strong><span>{data.user.email}</span></div><StatusBadge value={data.role} /></div><dl className="settings-list"><div><dt>Connection</dt><dd><span className="connection-dot" />{mode === 'demo' ? 'Interactive sample workspace' : 'Supabase connected'}</dd></div><div><dt>Security boundary</dt><dd>Role policy + PostgreSQL RLS</dd></div><div><dt>Data region</dt><dd>{mode === 'demo' ? 'Browser only' : 'Supabase project region'}</dd></div></dl></section><section className="panel settings-panel settings-wide"><div className="panel-header"><div><h2>Security foundation</h2><span>Built into every workspace request</span></div><ShieldCheck /></div><div className="security-feature-grid"><div><CheckCircle2 /><strong>Tenant isolation</strong><span>Every tenant-owned row is scoped to your active organization.</span></div><div><CheckCircle2 /><strong>Server authorization</strong><span>Role permissions are checked again for every mutation.</span></div><div><CheckCircle2 /><strong>Audit trail</strong><span>Operational writes record an accountable audit event.</span></div></div></section></div></div>;
}
