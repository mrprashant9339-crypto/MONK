export const roles = [
  'owner',
  'admin',
  'manager',
  'sales',
  'contributor',
  'client',
  'vendor',
  'auditor',
] as const;

export type Role = (typeof roles)[number];

export const permissions = [
  'organization.profile.read',
  'organization.profile.update',
  'organization.members.invite',
  'organization.members.update',
  'organization.modules.update',
  'organization.billing.manage',
  'organization.export',
  'organization.delete',
  'crm.contact.read',
  'crm.contact.create',
  'crm.contact.update',
  'crm.contact.delete',
  'crm.lead.read',
  'crm.lead.create',
  'crm.lead.update',
  'crm.lead.convert',
  'projects.project.read',
  'projects.project.create',
  'projects.project.update',
  'projects.task.read',
  'projects.task.create',
  'projects.task.update',
  'projects.task.assign',
  'documents.document.read',
  'documents.document.upload',
  'documents.document.approve',
  'documents.document.share',
  'audit.audit_log.read',
] as const;

export type Permission = (typeof permissions)[number];

export type Actor = {
  userId: string;
  organizationId: string;
  role: Role;
  status?: 'active' | 'invited' | 'suspended' | 'removed';
};

export type Resource = {
  organizationId: string;
  ownerId?: string | null;
  assigneeId?: string | null;
  memberIds?: string[];
  clientVisible?: boolean;
  sharedWithClient?: boolean;
};

const readPermissions: Permission[] = [
  'organization.profile.read',
  'crm.contact.read',
  'crm.lead.read',
  'projects.project.read',
  'projects.task.read',
  'documents.document.read',
];

const operationalPermissions: Permission[] = [
  ...readPermissions,
  'crm.contact.create',
  'crm.contact.update',
  'crm.lead.create',
  'crm.lead.update',
  'projects.task.create',
  'projects.task.update',
  'documents.document.upload',
];

const managerPermissions: Permission[] = [
  ...operationalPermissions,
  'crm.contact.delete',
  'crm.lead.convert',
  'projects.project.create',
  'projects.project.update',
  'projects.task.assign',
  'documents.document.approve',
  'documents.document.share',
];

const adminPermissions: Permission[] = [
  ...managerPermissions,
  'organization.profile.update',
  'organization.members.invite',
  'organization.members.update',
  'organization.modules.update',
  'organization.export',
  'audit.audit_log.read',
];

export const rolePermissions: Record<Role, readonly Permission[]> = {
  owner: [...adminPermissions, 'organization.billing.manage', 'organization.delete'],
  admin: adminPermissions,
  manager: managerPermissions,
  sales: [
    ...readPermissions,
    'crm.contact.create',
    'crm.contact.update',
    'crm.contact.delete',
    'crm.lead.create',
    'crm.lead.update',
    'crm.lead.convert',
    'documents.document.upload',
  ],
  contributor: [
    'organization.profile.read',
    'crm.contact.read',
    'crm.lead.read',
    'projects.project.read',
    'projects.task.read',
    'projects.task.update',
    'documents.document.read',
    'documents.document.upload',
  ],
  client: [
    'projects.project.read',
    'projects.task.read',
    'documents.document.read',
  ],
  vendor: [
    'projects.project.read',
    'projects.task.read',
    'projects.task.update',
    'documents.document.read',
    'documents.document.upload',
  ],
  auditor: [...readPermissions, 'organization.export', 'audit.audit_log.read'],
};

/**
 * MONK's single application-policy entry point. Route guards may use this for
 * presentation, but every API must call it again and PostgreSQL RLS remains the
 * final isolation boundary.
 */
export function can(actor: Actor, permission: Permission, resource: Resource): boolean {
  if ((actor.status ?? 'active') !== 'active') return false;
  if (!actor.organizationId || actor.organizationId !== resource.organizationId) return false;
  if (!rolePermissions[actor.role].includes(permission)) return false;

  if (actor.role === 'manager' && resource.memberIds && actor.userId !== resource.ownerId) {
    if (!resource.memberIds.includes(actor.userId)) return false;
  }

  if (actor.role === 'contributor') {
    if (permission === 'crm.contact.read' || permission === 'crm.lead.read') {
      return resource.ownerId === actor.userId || resource.assigneeId === actor.userId;
    }
    if (permission === 'projects.task.update') {
      return resource.assigneeId === actor.userId;
    }
    if (permission === 'documents.document.upload') {
      return resource.memberIds?.includes(actor.userId) ?? false;
    }
  }

  if (actor.role === 'client') {
    if (permission.startsWith('documents.')) return resource.sharedWithClient === true;
    return resource.clientVisible === true;
  }

  if (actor.role === 'vendor') {
    return resource.assigneeId === actor.userId || resource.memberIds?.includes(actor.userId) === true;
  }

  return true;
}

export function assertCan(actor: Actor, permission: Permission, resource: Resource): void {
  if (!can(actor, permission, resource)) {
    throw new PolicyError(permission);
  }
}

export class PolicyError extends Error {
  readonly code = 'forbidden' as const;

  constructor(permission: Permission) {
    super(`Permission denied: ${permission}`);
    this.name = 'PolicyError';
  }
}

export function canGrantRole(actor: Actor, targetRole: Role, isSelf = false): boolean {
  if (isSelf) return false;
  if (actor.role === 'owner') return true;
  return actor.role === 'admin' && !['owner', 'admin'].includes(targetRole);
}
