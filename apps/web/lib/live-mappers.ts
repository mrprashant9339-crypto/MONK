import type { Organization, WorkspaceData } from './types';

// Supabase rows are runtime-validated by PostgreSQL and mapped at this trust boundary.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

export function mapWorkspaceData(input: {
  organization: Row;
  role: WorkspaceData['role'];
  user: WorkspaceData['user'];
  memberId: string;
  companies: Row[];
  contacts: Row[];
  leads: Row[];
  projects: Row[];
  tasks: Row[];
  documents: Row[];
  activities: Row[];
}): WorkspaceData {
  const companyNames = new Map(input.companies.map((company) => [company.id, company.name]));
  const projectNames = new Map(input.projects.map((project) => [project.id, project.name]));

  return {
    organization: input.organization as Organization,
    role: input.role,
    user: input.user,
    contacts: input.contacts.map((contact) => ({
      id: contact.id,
      firstName: contact.first_name,
      lastName: contact.last_name ?? '',
      email: contact.email,
      phone: contact.phone,
      title: contact.title,
      companyId: contact.company_id,
      companyName: companyNames.get(contact.company_id) ?? 'Independent',
      owner: contact.owner_id === input.memberId ? 'You' : 'Teammate',
      tags: contact.tags ?? [],
      lastActivity: contact.updated_at,
    })),
    leads: input.leads.map((lead) => ({
      id: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      source: lead.source,
      status: lead.status,
      score: lead.score,
      nextAction: lead.next_action,
      nextActionAt: lead.next_action_at,
      owner: lead.owner_id === input.memberId ? 'You' : 'Teammate',
    })),
    projects: input.projects.map((project) => {
      const projectTasks = input.tasks.filter((task) => task.project_id === project.id);
      const done = projectTasks.filter((task) => task.status === 'done').length;
      return {
        id: project.id,
        name: project.name,
        code: project.code,
        clientCompanyId: project.client_company_id,
        clientName: companyNames.get(project.client_company_id) ?? 'Internal',
        status: project.status,
        health: project.health,
        dueDate: project.due_date,
        description: project.description,
        visibility: project.visibility,
        progress: projectTasks.length ? Math.round((done / projectTasks.length) * 100) : 0,
        taskCount: projectTasks.length,
        doneTaskCount: done,
        manager: project.manager_id === input.memberId ? 'You' : 'Teammate',
      };
    }),
    tasks: input.tasks.map((task) => ({
      id: task.id,
      projectId: task.project_id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      dueDate: task.due_date,
      assignee: task.assignee_id === input.memberId ? 'You' : 'Teammate',
      estimateHours: task.estimate_hours === null ? null : Number(task.estimate_hours),
      blockerReason: task.blocker_reason,
      visibility: task.visibility,
    })),
    documents: input.documents.map((document) => ({
      id: document.id,
      projectId: document.project_id,
      projectName: projectNames.get(document.project_id) ?? 'Workspace',
      name: document.name,
      reviewStatus: document.reviewStatus ?? document.review_status,
      confidentiality: document.confidentiality,
      owner: document.owner_id === input.memberId ? 'You' : 'Teammate',
      updatedAt: document.updated_at,
      version: 1,
      size: '—',
    })),
    activities: input.activities.map((activity) => ({
      id: activity.id,
      actor: activity.actor_user_id === input.user.id ? 'You' : 'Team',
      action: activity.body,
      resourceType: activity.resource_type,
      resourceId: activity.resource_id,
      kind: activity.kind,
      createdAt: activity.created_at,
    })),
  };
}
