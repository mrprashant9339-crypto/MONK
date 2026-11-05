'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell, CheckCircle2, ChevronDown, CircleHelp, FileText, FolderKanban, LayoutDashboard, Menu, Plus, Search, Settings, Sparkles, UsersRound, X } from 'lucide-react';
import { Logo } from '@/components/brand';
import { demoData } from '@/lib/demo-data';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Task, TaskStatus, WorkspaceData } from '@/lib/types';
import { apiRequest, cn, initials } from '@/lib/utils';
import { CrmView, DocumentsView, OverviewView, ProjectsView, SettingsView, TasksView, type WorkspaceView } from './views';
import { BlockerDialog, ContactDrawer, CopilotDrawer, CreateModal, ProjectDrawer, SearchPalette, Toast, type CreateKind, type CreateValues } from './modals';

const navigation: Array<{ id: WorkspaceView; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'crm', label: 'CRM', icon: UsersRound },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'tasks', label: 'Tasks', icon: CheckCircle2 },
  { id: 'documents', label: 'Documents', icon: FileText },
];

const viewTitles: Record<WorkspaceView, string> = { overview: 'Overview', crm: 'CRM & leads', projects: 'Projects', tasks: 'Tasks', documents: 'Documents', settings: 'Settings' };

export function WorkspaceShell({ mode }: { mode: 'demo' | 'live' }) {
  const router = useRouter();
  const [data, setData] = useState<WorkspaceData | null>(mode === 'demo' ? demoData : null);
  const [view, setView] = useState<WorkspaceView>('overview');
  const [loading, setLoading] = useState(mode === 'live');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [createKind, setCreateKind] = useState<CreateKind | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [blockingTask, setBlockingTask] = useState<Task | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  const refresh = useCallback(async (quiet = false) => {
    if (mode === 'demo') return;
    if (!quiet) setLoading(true);
    setLoadError(null);
    try {
      const liveData = await apiRequest<WorkspaceData>('/api/v1/bootstrap');
      setData(liveData);
    } catch (error) {
      const requestError = error as Error & { status?: number; code?: string };
      if (requestError.status === 401) {
        router.replace('/login?next=/workspace');
        return;
      }
      if (requestError.code === 'organization_not_found') {
        router.replace('/onboarding');
        return;
      }
      setLoadError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [mode, router]);

  useEffect(() => {
    if (mode !== 'live') return;
    const timer = setTimeout(() => void refresh(), 0);
    return () => clearTimeout(timer);
  }, [mode, refresh]);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (data) setSearchOpen((current) => !current);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [data]);

  const navigate = (nextView: WorkspaceView) => {
    setView(nextView);
    setSidebarOpen(false);
    setSelectedContactId(null);
    setSelectedProjectId(null);
  };

  const openCreate = (kind: CreateKind) => {
    setCreateMenuOpen(false);
    setCreateError(null);
    setCreateKind(kind);
  };

  const addActivity = (action: string, resourceType: string, resourceId: string) => {
    if (mode !== 'demo') return;
    setData((current) => current ? { ...current, activities: [{ id: crypto.randomUUID(), actor: 'You', action, resourceType, resourceId, kind: 'system', createdAt: new Date().toISOString() }, ...current.activities] } : current);
  };

  const handleCreate = async (values: CreateValues) => {
    if (!createKind || !data) return;
    if (createKind === 'lead' && !values.email?.trim() && !values.phone?.trim()) {
      setCreateError('Add at least one contact channel: email or phone.');
      return;
    }
    if (mode === 'demo' && createKind === 'contact' && data.contacts.some((contact) => contact.email.toLowerCase() === values.email?.trim().toLowerCase())) {
      setCreateError('A contact with this email already exists in this workspace.');
      return;
    }
    setSaving(true);
    setCreateError(null);
    try {
      if (mode === 'live') {
        if (createKind === 'contact') {
          await apiRequest('/api/v1/contacts', { method: 'POST', body: JSON.stringify({ firstName: values.firstName, lastName: values.lastName ?? '', email: values.email, phone: values.phone || null, title: values.title || null, companyName: values.companyName || null, tags: values.tags ? values.tags.split(',').map((tag) => tag.trim()).filter(Boolean) : [] }) });
        } else if (createKind === 'lead') {
          await apiRequest('/api/v1/leads', { method: 'POST', body: JSON.stringify({ name: values.name, email: values.email || null, phone: values.phone || null, source: values.source, notes: values.notes || null }) });
        } else if (createKind === 'project') {
          await apiRequest('/api/v1/projects', { method: 'POST', body: JSON.stringify({ name: values.name, code: values.code, description: values.description || null, clientCompanyId: values.clientCompanyId || null, dueDate: values.dueDate || null, visibility: values.visibility }) });
        } else {
          await apiRequest('/api/v1/tasks', { method: 'POST', body: JSON.stringify({ projectId: values.projectId, title: values.title, dueDate: values.dueDate || null, priority: values.priority }) });
        }
        await refresh(true);
      } else {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        setData((current) => {
          if (!current) return current;
          if (createKind === 'contact') {
            const companyName = values.companyName?.trim() || 'Independent';
            const companyId = current.contacts.find((contact) => contact.companyName.toLowerCase() === companyName.toLowerCase())?.companyId ?? (values.companyName ? `company-${id}` : null);
            return { ...current, contacts: [{ id, firstName: values.firstName ?? '', lastName: values.lastName ?? '', email: values.email ?? '', phone: values.phone || null, title: values.title || null, companyId, companyName, owner: 'You', tags: values.tags ? values.tags.split(',').map((tag) => tag.trim()).filter(Boolean) : [], lastActivity: now }, ...current.contacts] };
          }
          if (createKind === 'lead') {
            return { ...current, leads: [{ id, name: values.name ?? '', email: values.email || null, phone: values.phone || null, source: values.source ?? 'referral', status: 'new', score: 0, nextAction: null, nextActionAt: null, owner: 'You' }, ...current.leads] };
          }
          if (createKind === 'project') {
            const client = current.contacts.find((contact) => contact.companyId === values.clientCompanyId);
            return { ...current, projects: [{ id, name: values.name ?? '', code: values.code?.toUpperCase() ?? '', clientCompanyId: values.clientCompanyId || null, clientName: client?.companyName ?? 'Internal', status: 'active', health: 'on_track', dueDate: values.dueDate || null, description: values.description || null, visibility: (values.visibility ?? 'internal') as 'internal' | 'client_visible', progress: 0, taskCount: 0, doneTaskCount: 0, manager: 'You' }, ...current.projects] };
          }
          return { ...current, tasks: [{ id, projectId: values.projectId ?? '', title: values.title ?? '', status: 'todo', priority: (values.priority ?? 'medium') as Task['priority'], dueDate: values.dueDate || null, assignee: 'You', estimateHours: null, blockerReason: null, visibility: 'internal' }, ...current.tasks], projects: current.projects.map((project) => project.id === values.projectId ? { ...project, taskCount: project.taskCount + 1 } : project) };
        });
        addActivity(`created ${createKind === 'contact' ? 'a contact' : createKind === 'lead' ? 'a lead' : createKind === 'project' ? 'a project' : 'a task'}`, createKind, id);
      }
      const label = createKind === 'contact' ? 'Contact' : createKind === 'lead' ? 'Lead' : createKind === 'project' ? 'Project' : 'Task';
      setCreateKind(null);
      showToast(`${label} created successfully`);
    } catch (error) {
      setCreateError((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const performTaskStatus = async (task: Task, status: TaskStatus, blockerReason?: string) => {
    if (!data) return;
    setSaving(true);
    try {
      if (mode === 'live') {
        await apiRequest(`/api/v1/tasks/${task.id}`, { method: 'PATCH', body: JSON.stringify({ status, blockerReason: blockerReason ?? null }) });
        await refresh(true);
      } else {
        setData((current) => current ? {
          ...current,
          tasks: current.tasks.map((item) => item.id === task.id ? { ...item, status, blockerReason: status === 'blocked' ? blockerReason ?? item.blockerReason : null } : item),
          projects: current.projects.map((project) => {
            if (project.id !== task.projectId) return project;
            const wasDone = task.status === 'done';
            const isDone = status === 'done';
            const doneTaskCount = Math.max(0, project.doneTaskCount + (isDone === wasDone ? 0 : isDone ? 1 : -1));
            return { ...project, doneTaskCount, progress: project.taskCount ? Math.round((doneTaskCount / project.taskCount) * 100) : 0 };
          }),
        } : current);
        addActivity(`${status === 'done' ? 'completed' : `moved to ${status.replaceAll('_', ' ')}`} “${task.title}”`, 'task', task.id);
      }
      setBlockingTask(null);
      showToast(status === 'done' ? 'Task completed' : `Task moved to ${status.replaceAll('_', ' ')}`);
    } catch (error) {
      showToast((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleTaskStatus = (task: Task, status: TaskStatus) => {
    if (status === task.status) return;
    if (status === 'blocked') { setBlockingTask(task); return; }
    void performTaskStatus(task, status);
  };

  const handleReview = async (id: string, status: 'approved' | 'in_review' | 'draft') => {
    if (!data) return;
    try {
      if (mode === 'live') {
        await apiRequest(`/api/v1/documents/${id}`, { method: 'PATCH', body: JSON.stringify({ status, note: status === 'approved' ? 'Approved from workspace review queue' : null }) });
        await refresh(true);
      } else {
        setData((current) => current ? { ...current, documents: current.documents.map((document) => document.id === id ? { ...document, reviewStatus: status, updatedAt: new Date().toISOString() } : document) } : current);
        addActivity('approved a document', 'document', id);
      }
      showToast(status === 'approved' ? (mode === 'live' ? 'Document approved and audit event recorded' : 'Document approved in the demo') : 'Document review status updated');
    } catch (error) {
      showToast((error as Error).message);
    }
  };

  const signOut = async () => {
    if (mode === 'live') await getSupabaseBrowserClient().auth.signOut();
    router.push('/');
  };

  if (loading && !data) return <div className="workspace-loading"><div className="loading-brand"><Logo compact /><span className="skeleton" /></div><div className="loading-shell"><aside><span className="skeleton" /><span className="skeleton" /><span className="skeleton" /><span className="skeleton" /></aside><main><span className="skeleton loading-title" /><div className="loading-metrics">{[1, 2, 3, 4].map((item) => <span className="skeleton" key={item} />)}</div><span className="skeleton loading-content" /></main></div><span className="sr-only">Loading your workspace</span></div>;
  if (loadError && !data) return <main className="workspace-error"><Logo /><span className="empty-state-icon"><X /></span><h1>We couldn’t open your workspace</h1><p>{loadError}</p><div><button className="button" onClick={() => void refresh()}>Try again</button><Link className="button button-secondary" href="/demo">Open the demo</Link></div></main>;
  if (!data) return null;

  const selectedContact = data.contacts.find((contact) => contact.id === selectedContactId) ?? null;
  const selectedProject = data.projects.find((project) => project.id === selectedProjectId) ?? null;
  const openNotifications = data.tasks.filter((task) => task.status !== 'done' && task.dueDate && task.dueDate <= '2026-11-05').slice(0, 3);

  return <div className="workspace-app">
    {sidebarOpen && <button className="sidebar-scrim" onClick={() => setSidebarOpen(false)} aria-label="Close navigation" />}
    <aside className={cn('workspace-sidebar', sidebarOpen && 'open')}>
      <div className="workspace-sidebar-brand"><Logo href={mode === 'demo' ? '/demo' : '/workspace'} /><button className="icon-button sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Close navigation"><X /></button></div>
      <div className="workspace-org"><span>{data.organization.name.slice(0, 1)}</span><div><strong>{data.organization.name}</strong><small>{data.organization.industry}</small></div></div>
      {mode === 'demo' && <div className="demo-mode-badge"><span />Interactive demo · sample data</div>}
      <nav className="workspace-nav" aria-label="Workspace navigation"><span className="nav-section-label">Workspace</span>{navigation.map((item) => <button key={item.id} className={view === item.id ? 'active' : ''} onClick={() => navigate(item.id)}><item.icon />{item.label}{item.id === 'tasks' && data.tasks.filter((task) => task.status !== 'done').length > 0 && <span>{data.tasks.filter((task) => task.status !== 'done').length}</span>}{item.id === 'documents' && data.documents.filter((document) => document.reviewStatus === 'in_review').length > 0 && <span>{data.documents.filter((document) => document.reviewStatus === 'in_review').length}</span>}</button>)}</nav>
      <div className="sidebar-bottom">
        {mode === 'demo' && <button className="copilot-entry" onClick={() => setCopilotOpen(true)}><span><Sparkles /></span><div><strong>Ask Copilot</strong><small>Preview with sample data</small></div><Plus /></button>}
        <button className={cn('workspace-settings-link', view === 'settings' && 'active')} onClick={() => navigate('settings')}><Settings />Settings</button>
        <Link className="workspace-settings-link" href="/product"><CircleHelp />Help & product guide</Link>
        <div className="sidebar-user"><span className="avatar avatar-mint">{initials(data.user.name)}</span><div><strong>{data.user.name}</strong><small>{data.role}</small></div><button className="icon-button" onClick={() => setUserMenuOpen(!userMenuOpen)} aria-label="Open account menu" aria-expanded={userMenuOpen}><ChevronDown /></button></div>
        {userMenuOpen && <div className="sidebar-user-menu"><button onClick={() => { navigate('settings'); setUserMenuOpen(false); }}>Account settings</button><button onClick={() => void signOut()}>{mode === 'demo' ? 'Exit demo' : 'Sign out'}</button></div>}
      </div>
    </aside>

    <div className="workspace-main-wrap">
      <header className="workspace-topbar"><div className="topbar-left"><button className="icon-button topbar-menu" onClick={() => setSidebarOpen(true)} aria-label="Open navigation"><Menu /></button><span className="topbar-path">{data.organization.name}<span>/</span><strong>{viewTitles[view]}</strong></span></div><div className="topbar-actions"><button className="global-search-button" onClick={() => setSearchOpen(true)}><Search /><span>Search anything</span><kbd>⌘ K</kbd></button><div className="create-menu-wrap"><button className="button button-small topbar-create" onClick={() => setCreateMenuOpen(!createMenuOpen)} aria-label="Create a record" aria-expanded={createMenuOpen}><Plus />Create<ChevronDown /></button>{createMenuOpen && <div className="create-menu"><button onClick={() => openCreate('contact')}><UsersRound /><span><strong>Add contact</strong><small>A person and their company</small></span></button><button onClick={() => openCreate('lead')}><Plus /><span><strong>Capture lead</strong><small>A new opportunity to follow up</small></span></button><button onClick={() => openCreate('project')}><FolderKanban /><span><strong>Create project</strong><small>Start a client engagement</small></span></button><button onClick={() => openCreate('task')}><CheckCircle2 /><span><strong>Create task</strong><small>Make the next step clear</small></span></button></div>}</div><div className="notification-wrap"><button className="icon-button notification-button" onClick={() => setNotificationsOpen(!notificationsOpen)} aria-label={`${openNotifications.length} unread notifications`} aria-expanded={notificationsOpen}><Bell />{openNotifications.length > 0 && <span />}</button>{notificationsOpen && <div className="notifications-popover"><div><h2>Notifications</h2><button onClick={() => setNotificationsOpen(false)} aria-label="Close notifications"><X /></button></div>{openNotifications.length ? openNotifications.map((task) => <button key={task.id} onClick={() => { navigate('tasks'); setNotificationsOpen(false); }}><span className="notification-icon"><Bell /></span><span><strong>{task.title}</strong><small>{task.dueDate && task.dueDate < '2026-11-05' ? 'Overdue' : 'Due today'} · {data.projects.find((project) => project.id === task.projectId)?.name}</small></span></button>) : <p>You’re all caught up.</p>}</div>}</div><button className="topbar-avatar" onClick={() => { navigate('settings'); }} aria-label="Open account settings"><span className="avatar avatar-mint">{initials(data.user.name)}</span></button></div></header>
      <main className="workspace-main" id="main-content">
        {view === 'overview' && <OverviewView data={data} onNavigate={navigate} onSelectProject={(project) => setSelectedProjectId(project.id)} onTaskStatus={handleTaskStatus} />}
        {view === 'crm' && <CrmView data={data} onCreateContact={() => openCreate('contact')} onCreateLead={() => openCreate('lead')} onSelectContact={(contact) => setSelectedContactId(contact.id)} />}
        {view === 'projects' && <ProjectsView data={data} onCreateProject={() => openCreate('project')} onSelectProject={(project) => setSelectedProjectId(project.id)} />}
        {view === 'tasks' && <TasksView data={data} onCreateTask={() => openCreate('task')} onTaskStatus={handleTaskStatus} />}
        {view === 'documents' && <DocumentsView data={data} onReview={(id, status) => void handleReview(id, status)} />}
        {view === 'settings' && <SettingsView data={data} mode={mode} />}
      </main>
    </div>

    <nav className="mobile-bottom-nav" aria-label="Mobile workspace navigation">{navigation.slice(0, 4).map((item) => <button className={view === item.id ? 'active' : ''} key={item.id} onClick={() => navigate(item.id)}><item.icon /><span>{item.label}</span></button>)}<button className={view === 'documents' || view === 'settings' ? 'active' : ''} onClick={() => setSidebarOpen(true)}><Menu /><span>More</span></button></nav>

    {createKind && <CreateModal kind={createKind} data={data} saving={saving} error={createError} onClose={() => setCreateKind(null)} onSubmit={handleCreate} />}
    {selectedContact && <ContactDrawer contact={selectedContact} data={data} onClose={() => setSelectedContactId(null)} onToast={showToast} />}
    {selectedProject && <ProjectDrawer project={selectedProject} data={data} onClose={() => setSelectedProjectId(null)} onOpenTasks={() => navigate('tasks')} />}
    {blockingTask && <BlockerDialog task={blockingTask} saving={saving} onClose={() => setBlockingTask(null)} onSubmit={(reason) => void performTaskStatus(blockingTask, 'blocked', reason)} />}
    {searchOpen && <SearchPalette data={data} onClose={() => setSearchOpen(false)} onNavigate={navigate} onSelectContact={(contact) => setSelectedContactId(contact.id)} onSelectProject={(project) => setSelectedProjectId(project.id)} />}
    {copilotOpen && <CopilotDrawer data={data} onClose={() => setCopilotOpen(false)} onOpenProject={(project) => { setCopilotOpen(false); setView('projects'); setSelectedProjectId(project.id); }} />}
    {toast && <Toast message={toast} />}
  </div>;
}
