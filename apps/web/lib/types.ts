import type { Role } from '@monk/policy';

export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'review' | 'done';
export type ReviewStatus = 'draft' | 'in_review' | 'approved' | 'superseded';

export type Organization = {
  id: string;
  name: string;
  slug: string;
  country: string;
  timezone: string;
  currency: string;
  locale: string;
  industry: string;
};

export type Contact = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  title: string | null;
  companyId: string | null;
  companyName: string;
  owner: string;
  tags: string[];
  lastActivity: string;
};

export type Lead = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'disqualified';
  score: number;
  nextAction: string | null;
  nextActionAt: string | null;
  owner: string;
};

export type Project = {
  id: string;
  name: string;
  code: string;
  clientCompanyId: string | null;
  clientName: string;
  status: 'draft' | 'active' | 'at_risk' | 'in_review' | 'completed' | 'archived';
  health: 'on_track' | 'at_risk' | 'off_track';
  dueDate: string | null;
  description: string | null;
  visibility: 'internal' | 'client_visible';
  progress: number;
  taskCount: number;
  doneTaskCount: number;
  manager: string;
};

export type Task = {
  id: string;
  projectId: string;
  title: string;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string | null;
  assignee: string;
  estimateHours: number | null;
  blockerReason: string | null;
  visibility: 'internal' | 'client_visible';
};

export type DocumentItem = {
  id: string;
  projectId: string | null;
  projectName: string;
  name: string;
  reviewStatus: ReviewStatus;
  confidentiality: 'internal' | 'confidential' | 'client_shared';
  owner: string;
  updatedAt: string;
  version: number;
  size: string;
};

export type Activity = {
  id: string;
  actor: string;
  action: string;
  resourceType: string;
  resourceId: string;
  kind: string;
  createdAt: string;
};

export type WorkspaceData = {
  organization: Organization;
  role: Role;
  user: { id: string; name: string; email: string };
  contacts: Contact[];
  leads: Lead[];
  projects: Project[];
  tasks: Task[];
  documents: DocumentItem[];
  activities: Activity[];
};
