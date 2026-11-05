# ADR 0001: Session-derived organization tenancy

Date: 5 November 2026

## Decision

An organization is the tenant boundary. Supabase Auth owns identity; `organization_members` joins a user to an organization with a role and status. `user_settings.active_organization_id` stores the active workspace. All tenant queries use PostgreSQL RLS and `current_organization_id()` rather than accepting a tenant ID in browser requests.

## Controls

1. Every tenant-owned row has `organization_id`, a composite `(id, organization_id)` key and an organization-leading index.
2. Composite foreign keys prevent a child record from linking to a parent in another organization.
3. `can(actor, permission, resource)` is the single TypeScript application-policy function.
4. API routes independently authenticate the user, resolve membership and check the policy.
5. PostgREST tenant-table writes are revoked. Validated security-definer RPC functions re-check roles and write audit records in the same transaction.
6. Clients and vendors have additional visibility/assignment policies. Suspended and removed memberships fail closed.

## Consequences

- Organization switching is an explicit, membership-verified operation, not a query-string filter.
- A bug in a list query cannot expose another tenant's rows.
- The browser needs only the public Supabase key; no service-role secret is shipped or required by the web app.
- Background jobs must carry and verify tenant context explicitly before they are enabled.

## Verification

`packages/policy/src/index.test.ts` checks every role/permission across a tenant boundary. `supabase/tests/tenant_isolation.sql` creates two organizations inside a rollback-only transaction and tests active-tenant resolution, guessed-ID reads, role isolation and audited mutations. `supabase/tests/external_scope.sql` verifies that clients cannot browse CRM or the member directory and can read only assigned, explicitly shared project content.
