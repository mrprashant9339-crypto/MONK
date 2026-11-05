'use client';

import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowRight, ArrowUpRight, Check, CheckCircle2, Copy, FileText, FolderKanban, Mail, Search, Sparkles, UsersRound, X } from 'lucide-react';
import type { Contact, Project, Task, WorkspaceData } from '@/lib/types';
import { formatDate, initials, relativeTime, titleCase } from '@/lib/utils';
import { StatusBadge, type WorkspaceView } from './views';

export type CreateKind = 'contact' | 'lead' | 'project' | 'task';
export type CreateValues = Record<string, string>;

function Overlay({ children, onClose, label, drawer = false, wide = false }: { children: ReactNode; onClose: () => void; label: string; drawer?: boolean; wide?: boolean }) {
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Tab' && panelRef.current) {
        const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter((element) => !element.hasAttribute('disabled'));
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; previous?.focus(); };
  }, [onClose]);
  return <div className={drawer ? 'overlay drawer-overlay' : 'overlay'} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className={drawer ? 'drawer-panel' : `modal-panel${wide ? ' modal-wide' : ''}`} ref={panelRef} role="dialog" aria-modal="true" aria-label={label}>{children}</div></div>;
}

export function CreateModal({ kind, data, saving, error, onClose, onSubmit }: { kind: CreateKind; data: WorkspaceData; saving: boolean; error: string | null; onClose: () => void; onSubmit: (values: CreateValues) => Promise<void> }) {
  const titles = { contact: ['Add a contact', 'Keep the person, company and contact details together.'], lead: ['Capture a lead', 'Record the source and a clear way to follow up.'], project: ['Create a project', 'Start with the essentials. You can add detail as the work evolves.'], task: ['Create a task', 'Give the next step a clear home and deadline.'] };
  const submitLabels = { contact: 'Add contact', lead: 'Add lead', project: 'Create project', task: 'Create task' };
  const companyOptions = Array.from(new Map(data.contacts.flatMap((contact) => contact.companyId ? [[contact.companyId, contact.companyName] as const] : [])).entries());
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values: CreateValues = {};
    new FormData(event.currentTarget).forEach((value, key) => { values[key] = String(value); });
    void onSubmit(values);
  };
  return <Overlay onClose={onClose} label={titles[kind][0] ?? 'Create record'} wide={kind === 'project'}><div className="modal-header"><div><span className="view-eyebrow">MONK workspace</span><h2>{titles[kind][0]}</h2><p>{titles[kind][1]}</p></div><button className="icon-button" onClick={onClose} aria-label="Close dialog"><X /></button></div><form onSubmit={handleSubmit}><div className="modal-body form-stack">
    {kind === 'contact' && <><div className="form-grid"><div className="field"><label htmlFor="firstName">First name</label><input className="input" id="firstName" name="firstName" required autoFocus maxLength={80} placeholder="Maya" /></div><div className="field"><label htmlFor="lastName">Last name</label><input className="input" id="lastName" name="lastName" maxLength={80} placeholder="Kapoor" /></div></div><div className="field"><label htmlFor="email">Work email</label><input className="input" id="email" name="email" type="email" required placeholder="maya@company.com" /></div><div className="form-grid"><div className="field"><label htmlFor="companyName">Company</label><input className="input" id="companyName" name="companyName" placeholder="Company name" /></div><div className="field"><label htmlFor="title">Role or title</label><input className="input" id="title" name="title" placeholder="Founder" /></div></div><div className="field"><label htmlFor="phone">Phone <span className="muted">(optional)</span></label><input className="input" id="phone" name="phone" type="tel" placeholder="+91 98765 43210" /></div><div className="field"><label htmlFor="tags">Tags <span className="muted">(comma separated)</span></label><input className="input" id="tags" name="tags" placeholder="Key client, Retainer" /></div></>}
    {kind === 'lead' && <><div className="field"><label htmlFor="name">Name or company</label><input className="input" id="name" name="name" required autoFocus placeholder="Dev at Cobalt Labs" /></div><div className="form-grid"><div className="field"><label htmlFor="email">Email</label><input className="input" id="email" name="email" type="email" placeholder="dev@company.com" /></div><div className="field"><label htmlFor="phone">Phone</label><input className="input" id="phone" name="phone" type="tel" placeholder="+91 98765 43210" /></div></div><p className="field-hint">Add at least one contact channel.</p><div className="field"><label htmlFor="source">Lead source</label><select className="select" id="source" name="source" defaultValue="referral"><option value="web_form">Web form</option><option value="referral">Referral</option><option value="event">Event</option><option value="outbound">Outbound</option><option value="import">Import</option><option value="marketplace">Marketplace</option></select></div><div className="field"><label htmlFor="notes">Notes</label><textarea className="textarea" id="notes" name="notes" placeholder="What do they need, and what happened last?" /></div></>}
    {kind === 'project' && <><div className="form-grid"><div className="field"><label htmlFor="name">Project name</label><input className="input" id="name" name="name" required autoFocus placeholder="Brand evolution" /></div><div className="field"><label htmlFor="code">Project code</label><input className="input" id="code" name="code" required pattern="[A-Za-z0-9-]{2,20}" placeholder="BRAND-01" /><p className="field-hint">2–20 letters, numbers or hyphens.</p></div></div><div className="field"><label htmlFor="clientCompanyId">Client</label><select className="select" id="clientCompanyId" name="clientCompanyId"><option value="">Internal / no client</option>{companyOptions.map(([id, name]) => <option value={id} key={id}>{name}</option>)}</select></div><div className="field"><label htmlFor="description">Scope</label><textarea className="textarea" id="description" name="description" placeholder="A short description of the engagement and its outcome." /></div><div className="form-grid"><div className="field"><label htmlFor="dueDate">Target due date</label><input className="input" id="dueDate" name="dueDate" type="date" /></div><div className="field"><label htmlFor="visibility">Visibility</label><select className="select" id="visibility" name="visibility" defaultValue="internal"><option value="internal">Internal only</option><option value="client_visible">Visible to assigned clients</option></select></div></div></>}
    {kind === 'task' && <><div className="field"><label htmlFor="title">What needs to be done?</label><input className="input" id="title" name="title" required autoFocus placeholder="Prepare the client walkthrough" /></div><div className="field"><label htmlFor="projectId">Project</label><select className="select" id="projectId" name="projectId" required defaultValue=""><option value="" disabled>Choose a project</option>{data.projects.filter((project) => !['completed', 'archived'].includes(project.status)).map((project) => <option value={project.id} key={project.id}>{project.name}</option>)}</select></div><div className="form-grid"><div className="field"><label htmlFor="dueDate">Due date</label><input className="input" id="dueDate" name="dueDate" type="date" /></div><div className="field"><label htmlFor="priority">Priority</label><select className="select" id="priority" name="priority" defaultValue="medium"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select></div></div></>}
    {error && <div className="form-error" role="alert">{error}</div>}
  </div><div className="modal-footer"><button type="button" className="button button-ghost" onClick={onClose}>Cancel</button><button className="button" type="submit" disabled={saving}>{saving ? <span className="spinner" /> : <Check />}{saving ? 'Saving…' : submitLabels[kind]}</button></div></form></Overlay>;
}

export function ContactDrawer({ contact, data, onClose, onToast }: { contact: Contact; data: WorkspaceData; onClose: () => void; onToast: (message: string) => void }) {
  const relatedProjects = data.projects.filter((project) => project.clientCompanyId && project.clientCompanyId === contact.companyId);
  const copyEmail = async () => { await navigator.clipboard.writeText(contact.email); onToast('Email address copied'); };
  return <Overlay onClose={onClose} label={`${contact.firstName} ${contact.lastName}`} drawer><div className="drawer-header"><span className="view-eyebrow">Contact</span><button className="icon-button" onClick={onClose} aria-label="Close contact"><X /></button></div><div className="contact-drawer-profile"><span className="avatar avatar-mint">{initials(`${contact.firstName} ${contact.lastName}`)}</span><h2>{contact.firstName} {contact.lastName}</h2><p>{contact.title ?? 'Contact'} at {contact.companyName}</p><div className="tag-list">{contact.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div><div className="drawer-actions"><button className="button button-secondary button-small" onClick={copyEmail}><Copy />Copy email</button><a className="button button-secondary button-small" href={`mailto:${contact.email}`}><Mail />Write email</a></div><dl className="drawer-detail-list"><div><dt>Email</dt><dd>{contact.email}</dd></div><div><dt>Phone</dt><dd>{contact.phone ?? 'Not added'}</dd></div><div><dt>Owner</dt><dd>{contact.owner}</dd></div><div><dt>Last activity</dt><dd>{relativeTime(contact.lastActivity)}</dd></div></dl><section className="drawer-section"><div className="drawer-section-title"><h3>Related projects</h3><span>{relatedProjects.length}</span></div>{relatedProjects.length ? relatedProjects.map((project) => <div className="drawer-related-row" key={project.id}><span className="project-monogram">{initials(project.clientName)}</span><div><strong>{project.name}</strong><small>{project.code} · {project.progress}% complete</small></div><StatusBadge value={project.health} /></div>) : <p className="drawer-empty">No projects are linked to this contact’s company yet.</p>}</section><section className="drawer-section"><div className="drawer-section-title"><h3>Relationship notes</h3></div><p className="drawer-empty">New notes, calls and meetings will build an immutable activity timeline here.</p></section></Overlay>;
}

export function ProjectDrawer({ project, data, onClose, onOpenTasks }: { project: Project; data: WorkspaceData; onClose: () => void; onOpenTasks: () => void }) {
  const tasks = data.tasks.filter((task) => task.projectId === project.id);
  const documents = data.documents.filter((document) => document.projectId === project.id);
  return <Overlay onClose={onClose} label={project.name} drawer><div className="drawer-header"><span className="view-eyebrow">{project.code}</span><button className="icon-button" onClick={onClose} aria-label="Close project"><X /></button></div><div className="project-drawer-heading"><div className="project-card-top"><span className="project-monogram">{initials(project.clientName)}</span><StatusBadge value={project.health} /></div><h2>{project.name}</h2><p>{project.clientName}</p></div><p className="project-drawer-description">{project.description ?? 'No project description has been added yet.'}</p><div className="project-drawer-progress"><div><span>Delivery progress</span><strong>{project.progress}%</strong></div><div className="progress-track"><i style={{ width: `${project.progress}%` }} /></div><small>{project.doneTaskCount} of {project.taskCount} tasks complete</small></div><dl className="drawer-detail-list"><div><dt>Due date</dt><dd>{formatDate(project.dueDate)}</dd></div><div><dt>Project manager</dt><dd>{project.manager}</dd></div><div><dt>Visibility</dt><dd>{titleCase(project.visibility)}</dd></div></dl><section className="drawer-section"><div className="drawer-section-title"><h3>Recent tasks</h3><button onClick={onOpenTasks}>View all <ArrowUpRight /></button></div>{tasks.length ? tasks.slice(0, 4).map((task) => <div className="drawer-task-row" key={task.id}><span className={task.status === 'done' ? 'task-check checked' : 'task-check'}>{task.status === 'done' && <Check />}</span><div><strong>{task.title}</strong><small>{task.assignee} · {formatDate(task.dueDate, { day: 'numeric', month: 'short' })}</small></div><StatusBadge value={task.status} /></div>) : <p className="drawer-empty">No tasks yet. Create the first clear next step.</p>}</section><section className="drawer-section"><div className="drawer-section-title"><h3>Documents</h3><span>{documents.length}</span></div>{documents.length ? documents.slice(0, 3).map((document) => <div className="drawer-related-row" key={document.id}><FileText /><div><strong>{document.name}</strong><small>v{document.version} · {document.size}</small></div><StatusBadge value={document.reviewStatus} /></div>) : <p className="drawer-empty">No documents have been added to this project.</p>}</section></Overlay>;
}

export function BlockerDialog({ task, saving, onClose, onSubmit }: { task: Task; saving: boolean; onClose: () => void; onSubmit: (reason: string) => void }) {
  const [reason, setReason] = useState(task.blockerReason ?? '');
  return <Overlay onClose={onClose} label="Record a blocker"><div className="modal-header"><div><span className="view-eyebrow">Task status</span><h2>What’s blocking this task?</h2><p>{task.title}</p></div><button className="icon-button" onClick={onClose} aria-label="Close dialog"><X /></button></div><form onSubmit={(event) => { event.preventDefault(); onSubmit(reason); }}><div className="modal-body"><div className="field"><label htmlFor="blockerReason">Blocker reason</label><textarea className="textarea" id="blockerReason" required autoFocus value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Explain what is needed to move this work forward." /></div><p className="field-hint">This reason stays with the task so the team can act on it.</p></div><div className="modal-footer"><button type="button" className="button button-ghost" onClick={onClose}>Cancel</button><button className="button" disabled={saving || !reason.trim()}>{saving ? <span className="spinner" /> : <Check />}Mark as blocked</button></div></form></Overlay>;
}

type SearchResult = { id: string; type: string; title: string; subtitle: string; view: WorkspaceView; contact?: Contact; project?: Project };

export function SearchPalette({ data, onClose, onNavigate, onSelectContact, onSelectProject }: { data: WorkspaceData; onClose: () => void; onNavigate: (view: WorkspaceView) => void; onSelectContact: (contact: Contact) => void; onSelectProject: (project: Project) => void }) {
  const [query, setQuery] = useState('');
  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const all: SearchResult[] = [
      ...data.contacts.map((contact) => ({ id: contact.id, type: 'Contact', title: `${contact.firstName} ${contact.lastName}`, subtitle: `${contact.companyName} · ${contact.email}`, view: 'crm' as const, contact })),
      ...data.projects.map((project) => ({ id: project.id, type: 'Project', title: project.name, subtitle: `${project.clientName} · ${titleCase(project.health)}`, view: 'projects' as const, project })),
      ...data.tasks.map((task) => ({ id: task.id, type: 'Task', title: task.title, subtitle: `${data.projects.find((project) => project.id === task.projectId)?.name ?? 'Project'} · ${titleCase(task.status)}`, view: 'tasks' as const })),
      ...data.documents.map((document) => ({ id: document.id, type: 'Document', title: document.name, subtitle: `${document.projectName} · v${document.version}`, view: 'documents' as const })),
    ];
    return all.filter((item) => `${item.title} ${item.subtitle}`.toLowerCase().includes(q)).slice(0, 8);
  }, [data, query]);
  const open = (result: SearchResult) => { onNavigate(result.view); if (result.contact) onSelectContact(result.contact); if (result.project) onSelectProject(result.project); onClose(); };
  return <Overlay onClose={onClose} label="Search workspace"><div className="search-palette-input"><Search /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search contacts, projects, tasks and files…" aria-label="Search workspace" /><kbd>esc</kbd></div><div className="search-palette-body">{!query && <div className="search-start"><span><Search /></span><strong>Find anything in your workspace</strong><p>Search stays inside your organization and respects your permissions.</p><div className="search-suggestions"><button onClick={() => setQuery('Kaya')}>Try “Kaya”</button><button onClick={() => setQuery('review')}>Try “review”</button></div></div>}{query && results.length === 0 && <div className="search-start"><span><Search /></span><strong>No results for “{query}”</strong><p>Check the spelling or try a broader search.</p></div>}{results.map((result) => <button className="search-result" key={`${result.type}-${result.id}`} onClick={() => open(result)}><span className="search-result-icon">{result.type === 'Contact' ? <UsersRound /> : result.type === 'Project' ? <FolderKanban /> : result.type === 'Task' ? <CheckCircle2 /> : <FileText />}</span><span><strong>{result.title}</strong><small>{result.subtitle}</small></span><span className="badge badge-plain">{result.type}</span><ArrowUpRight /></button>)}</div><div className="search-palette-footer"><span><kbd>↑</kbd><kbd>↓</kbd> to navigate</span><span><kbd>esc</kbd> to close</span></div></Overlay>;
}

type CopilotMessage = { id: number; role: 'user' | 'assistant'; text: string; sources?: string[] };

export function CopilotDrawer({ data, onClose, onOpenProject }: { data: WorkspaceData; onClose: () => void; onOpenProject: (project: Project) => void }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const answer = (question: string): CopilotMessage => {
    const blocked = data.tasks.filter((task) => task.status === 'blocked');
    const atRisk = data.projects.filter((project) => project.health !== 'on_track');
    const due = data.tasks.filter((task) => task.status !== 'done' && task.dueDate && task.dueDate <= '2026-11-05');
    let text = `There are ${due.length} open tasks due today or overdue across ${new Set(due.map((task) => task.projectId)).size} projects. ${blocked.length ? `${blocked.length} task is blocked: “${blocked[0]?.title}”.` : 'No tasks are currently blocked.'} ${atRisk.length ? `${atRisk.map((project) => project.name).join(' and ')} need a closer look.` : 'All active projects are on track.'}`;
    let sources = atRisk.slice(0, 2).map((project) => project.id);
    if (/kaya/i.test(question)) {
      const project = data.projects.find((item) => /kaya/i.test(item.name));
      const tasks = data.tasks.filter((task) => task.projectId === project?.id && task.status !== 'done');
      text = project ? `${project.name} is ${project.health.replaceAll('_', ' ')} and ${project.progress}% complete. ${tasks.length ? `${tasks.slice(0, 2).map((task) => `“${task.title}”`).join(' and ')} are the next open items.` : 'There are no open tasks.'}` : 'I couldn’t find a Kaya project in this workspace.';
      sources = project ? [project.id] : [];
    } else if (/summar|client/i.test(question)) {
      text = `Your workspace has ${data.projects.filter((project) => project.status !== 'completed').length} active projects, ${data.contacts.length} contacts and ${data.documents.filter((document) => document.reviewStatus === 'in_review').length} documents awaiting review. The clearest next step is to resolve due work and unblock any waiting tasks.`;
    }
    return { id: Date.now() + 1, role: 'assistant', text, sources };
  };
  const ask = (question: string) => {
    if (!question.trim()) return;
    setMessages((current) => [...current, { id: Date.now(), role: 'user', text: question }, answer(question)]);
    setInput('');
  };
  return <Overlay onClose={onClose} label="Demo Copilot" drawer><div className="copilot-drawer-header"><div><span><Sparkles /></span><div><h2>Copilot</h2><p>Interactive demo · sample answers</p></div></div><button className="icon-button" onClick={onClose} aria-label="Close Copilot"><X /></button></div><div className="copilot-context"><FolderKanban /><span>Looking at</span><strong>Entire workspace</strong></div><div className="copilot-drawer-body">{messages.length === 0 && <div className="copilot-welcome"><span><Sparkles /></span><h3>Ask about the work</h3><p>This demo uses deterministic answers from the sample workspace. No data is sent to an AI provider.</p><div className="copilot-prompts"><button onClick={() => ask('What needs my attention this week?')}>What needs my attention this week? <ArrowRight /></button><button onClick={() => ask('Summarize my client work')}>Summarize my client work <ArrowRight /></button><button onClick={() => ask('What is happening on Kaya?')}>What is happening on Kaya? <ArrowRight /></button></div></div>}{messages.map((message) => <div className={message.role === 'user' ? 'demo-message user' : 'demo-message assistant'} key={message.id}>{message.role === 'assistant' && <div className="ai-label"><Sparkles />Sample AI preview · verify</div>}<p>{message.text}</p>{message.sources && message.sources.length > 0 && <div className="demo-sources"><span>Sources</span>{message.sources.map((id) => { const project = data.projects.find((item) => item.id === id); return project ? <button key={id} onClick={() => onOpenProject(project)}>{project.name}<ArrowUpRight /></button> : null; })}</div>}</div>)}</div><form className="copilot-drawer-composer" onSubmit={(event) => { event.preventDefault(); ask(input); }}><textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask a follow-up…" aria-label="Ask demo Copilot" rows={2} /><div><span>Answers use demo records only</span><button disabled={!input.trim()} aria-label="Send question"><ArrowUpRight /></button></div></form></Overlay>;
}

export function Toast({ message }: { message: string }) {
  return <div className="toast" role="status"><CheckCircle2 />{message}</div>;
}
