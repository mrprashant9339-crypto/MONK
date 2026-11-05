import { describe, expect, it } from 'vitest';
import { can, canGrantRole, permissions, roles, type Actor, type Resource } from './index';

const actor = (overrides: Partial<Actor> = {}): Actor => ({
  userId: 'user-a',
  organizationId: 'org-a',
  role: 'owner',
  status: 'active',
  ...overrides,
});

const resource = (overrides: Partial<Resource> = {}): Resource => ({
  organizationId: 'org-a',
  ownerId: 'user-a',
  ...overrides,
});

describe('tenant isolation', () => {
  it('denies every permission across an organization boundary', () => {
    for (const role of roles) {
      for (const permission of permissions) {
        expect(can(actor({ role }), permission, resource({ organizationId: 'org-b' }))).toBe(false);
      }
    }
  });

  it('denies suspended and removed members on their next request', () => {
    expect(can(actor({ status: 'suspended' }), 'crm.contact.read', resource())).toBe(false);
    expect(can(actor({ status: 'removed' }), 'organization.profile.read', resource())).toBe(false);
  });
});

describe('role boundaries', () => {
  it('does not treat a contributor as an administrator', () => {
    const contributor = actor({ role: 'contributor' });
    expect(can(contributor, 'organization.members.invite', resource())).toBe(false);
    expect(can(contributor, 'organization.export', resource())).toBe(false);
    expect(can(contributor, 'organization.modules.update', resource())).toBe(false);
    expect(can(contributor, 'organization.delete', resource())).toBe(false);
  });

  it('limits contributor CRM reads to owned or assigned records', () => {
    const contributor = actor({ role: 'contributor' });
    expect(can(contributor, 'crm.contact.read', resource())).toBe(true);
    expect(can(contributor, 'crm.contact.read', resource({ ownerId: 'user-b' }))).toBe(false);
    expect(can(contributor, 'crm.contact.read', resource({ ownerId: 'user-b', assigneeId: 'user-a' }))).toBe(true);
  });

  it('allows a client to see only explicitly shared material', () => {
    const client = actor({ role: 'client' });
    expect(can(client, 'projects.project.read', resource({ clientVisible: false }))).toBe(false);
    expect(can(client, 'projects.project.read', resource({ clientVisible: true }))).toBe(true);
    expect(can(client, 'documents.document.read', resource({ clientVisible: true }))).toBe(false);
    expect(can(client, 'documents.document.read', resource({ sharedWithClient: true }))).toBe(true);
  });

  it('keeps auditors read-only', () => {
    const auditor = actor({ role: 'auditor' });
    expect(can(auditor, 'audit.audit_log.read', resource())).toBe(true);
    expect(can(auditor, 'organization.export', resource())).toBe(true);
    expect(can(auditor, 'crm.contact.update', resource())).toBe(false);
    expect(can(auditor, 'documents.document.approve', resource())).toBe(false);
  });

  it('enforces the administrator role ceiling and blocks self escalation', () => {
    expect(canGrantRole(actor({ role: 'admin' }), 'owner')).toBe(false);
    expect(canGrantRole(actor({ role: 'admin' }), 'admin')).toBe(false);
    expect(canGrantRole(actor({ role: 'admin' }), 'manager')).toBe(true);
    expect(canGrantRole(actor({ role: 'owner' }), 'owner', true)).toBe(false);
  });
});
