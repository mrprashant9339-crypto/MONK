-- MONK foundation: identity, tenancy, policy, audit, CRM and delivery.
-- Auth identities remain in Supabase Auth. Every tenant-owned row is protected
-- by active-membership RLS and an organization-leading index.

begin;

create extension if not exists pgcrypto;
create extension if not exists citext;

-- PostgreSQL 17 compatible UUIDv7 generator: 48-bit Unix timestamp, version 7,
-- IETF variant, cryptographically random remaining bits.
create or replace function public.uuid_v7()
returns uuid
language plpgsql
volatile
set search_path = public
as $$
declare
  unix_ts_ms bigint;
  value bytea;
begin
  unix_ts_ms := floor(extract(epoch from clock_timestamp()) * 1000)::bigint;
  value := gen_random_bytes(16);
  value := set_byte(value, 0, (unix_ts_ms >> 40) & 255);
  value := set_byte(value, 1, (unix_ts_ms >> 32) & 255);
  value := set_byte(value, 2, (unix_ts_ms >> 24) & 255);
  value := set_byte(value, 3, (unix_ts_ms >> 16) & 255);
  value := set_byte(value, 4, (unix_ts_ms >> 8) & 255);
  value := set_byte(value, 5, unix_ts_ms & 255);
  value := set_byte(value, 6, (get_byte(value, 6) & 15) | 112);
  value := set_byte(value, 8, (get_byte(value, 8) & 63) | 128);
  return encode(value, 'hex')::uuid;
end;
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create table public.roles (
  id text primary key,
  description text not null,
  is_system boolean not null default true
);

create table public.permissions (
  id text primary key,
  description text not null
);

create table public.role_permissions (
  role_id text not null references public.roles(id) on delete cascade,
  permission_id text not null references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

insert into public.roles (id, description) values
  ('owner', 'Full organization control including billing and deletion'),
  ('admin', 'Organization administration and operational records'),
  ('manager', 'Scoped client, project and approval management'),
  ('sales', 'Assigned leads, contacts and sales activity'),
  ('contributor', 'Assigned work and permitted documents'),
  ('client', 'Explicitly shared projects and approved files'),
  ('vendor', 'Assigned delivery tasks and document exchange'),
  ('auditor', 'Read-only reports, exports and audit trail');

insert into public.permissions (id, description)
select permission, 'MONK application permission'
from unnest(array[
  'organization.profile.read', 'organization.profile.update',
  'organization.members.invite', 'organization.members.update',
  'organization.modules.update', 'organization.billing.manage',
  'organization.export', 'organization.delete',
  'crm.contact.read', 'crm.contact.create', 'crm.contact.update', 'crm.contact.delete',
  'crm.lead.read', 'crm.lead.create', 'crm.lead.update', 'crm.lead.convert',
  'projects.project.read', 'projects.project.create', 'projects.project.update',
  'projects.task.read', 'projects.task.create', 'projects.task.update', 'projects.task.assign',
  'documents.document.read', 'documents.document.upload',
  'documents.document.approve', 'documents.document.share',
  'audit.audit_log.read'
]) as permission;

-- This catalogue mirrors @monk/policy. Database functions independently enforce
-- role ceilings; the catalogue is intentionally readable for administration UI.
insert into public.role_permissions
select 'owner', id from public.permissions;
insert into public.role_permissions
select 'admin', id from public.permissions
where id not in ('organization.billing.manage', 'organization.delete');
insert into public.role_permissions
select 'manager', id from public.permissions
where id not in (
  'organization.profile.update', 'organization.members.invite',
  'organization.members.update', 'organization.modules.update',
  'organization.billing.manage', 'organization.export',
  'organization.delete', 'audit.audit_log.read'
);
insert into public.role_permissions
select 'sales', id from public.permissions
where id like 'crm.%' or id in (
  'organization.profile.read', 'projects.project.read', 'projects.task.read',
  'documents.document.read', 'documents.document.upload'
);
insert into public.role_permissions
select 'contributor', id from public.permissions
where id in (
  'organization.profile.read', 'crm.contact.read', 'crm.lead.read',
  'projects.project.read', 'projects.task.read', 'projects.task.update',
  'documents.document.read', 'documents.document.upload'
);
insert into public.role_permissions
select 'client', id from public.permissions
where id in ('projects.project.read', 'projects.task.read', 'documents.document.read');
insert into public.role_permissions
select 'vendor', id from public.permissions
where id in (
  'projects.project.read', 'projects.task.read', 'projects.task.update',
  'documents.document.read', 'documents.document.upload'
);
insert into public.role_permissions
select 'auditor', id from public.permissions
where id like '%.read' or id in ('organization.export', 'audit.audit_log.read');

create table public.organizations (
  id uuid primary key default public.uuid_v7(),
  name text not null check (char_length(name) between 2 and 100),
  slug citext not null unique check (slug::text ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  country text not null default 'IN',
  timezone text not null default 'Asia/Kolkata',
  currency text not null default 'INR',
  locale text not null default 'en-IN',
  industry text not null default 'Professional services',
  slug_changed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  avatar_url text,
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  active_organization_id uuid references public.organizations(id),
  notification_preferences jsonb not null default '{"email_digest":"daily","mentions":true,"assignments":true}'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.legal_consents (
  id uuid primary key default public.uuid_v7(),
  user_id uuid not null references auth.users(id) on delete cascade,
  terms_version text not null,
  privacy_version text not null,
  accepted_at timestamptz not null default now()
);

create table public.organization_members (
  id uuid primary key default public.uuid_v7(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null references public.roles(id),
  status text not null default 'active' check (status in ('invited', 'active', 'suspended', 'removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id),
  unique (id, organization_id)
);

create table public.invitations (
  id uuid primary key default public.uuid_v7(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email citext not null,
  role text not null references public.roles(id),
  token_hash text not null unique,
  invited_by uuid references auth.users(id),
  expires_at timestamptz not null,
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  unique (id, organization_id)
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_user_id uuid references auth.users(id),
  action text not null,
  resource_type text not null,
  resource_id text,
  before_diff jsonb,
  after_diff jsonb,
  ip_address inet,
  user_agent text,
  request_id text not null,
  ai_involved boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.feature_flags (
  key text primary key,
  enabled boolean not null default false,
  description text not null default ''
);

create table public.tenant_flags (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  flag_key text not null references public.feature_flags(key) on delete cascade,
  enabled boolean not null,
  updated_at timestamptz not null default now(),
  primary key (organization_id, flag_key)
);

insert into public.feature_flags (key, enabled, description) values
  ('crm', true, 'CRM and leads'),
  ('projects', true, 'Projects and tasks'),
  ('documents', true, 'Document review and sharing'),
  ('copilot', false, 'AI Copilot ships dark until provider and eval configuration are complete'),
  ('imports', false, 'Bulk imports remain disabled until background processing is configured');

create table public.companies (
  id uuid primary key default public.uuid_v7(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  domain citext,
  industry text,
  size_band text,
  annual_value_band text,
  owner_id uuid,
  address text,
  phone text,
  website text,
  tags text[] not null default '{}',
  source text,
  status text not null default 'prospect' check (status in ('prospect', 'active', 'dormant', 'churned')),
  custom jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (id, organization_id),
  unique (organization_id, domain),
  foreign key (owner_id, organization_id) references public.organization_members(id, organization_id)
);

create table public.contacts (
  id uuid primary key default public.uuid_v7(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  company_id uuid,
  first_name text not null,
  last_name text not null default '',
  email citext not null,
  phone text,
  title text,
  owner_id uuid,
  consent_basis text,
  tags text[] not null default '{}',
  marketing_opt_in boolean not null default false,
  marketing_consent_at timestamptz,
  marketing_consent_source text,
  custom jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (organization_id, email),
  unique (id, organization_id),
  foreign key (company_id, organization_id) references public.companies(id, organization_id),
  foreign key (owner_id, organization_id) references public.organization_members(id, organization_id)
);

create table public.leads (
  id uuid primary key default public.uuid_v7(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  email citext,
  phone text,
  source text not null check (source in ('web_form', 'referral', 'event', 'outbound', 'import', 'marketplace')),
  owner_id uuid,
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'converted', 'disqualified')),
  score integer not null default 0 check (score between 0 and 100),
  need text,
  budget_band text,
  timeline text,
  decision_maker text,
  notes text,
  next_action text,
  next_action_at timestamptz,
  disqualification_reason text,
  converted_contact_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  check (email is not null or phone is not null),
  unique (id, organization_id),
  foreign key (owner_id, organization_id) references public.organization_members(id, organization_id),
  foreign key (converted_contact_id, organization_id) references public.contacts(id, organization_id)
);

create table public.activities (
  id uuid primary key default public.uuid_v7(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_user_id uuid references auth.users(id),
  resource_type text not null,
  resource_id uuid not null,
  kind text not null check (kind in ('note', 'call', 'email', 'meeting', 'task', 'file', 'stage_change', 'system')),
  body text not null,
  visibility text not null default 'internal' check (visibility in ('internal', 'client_visible')),
  created_at timestamptz not null default now(),
  unique (id, organization_id)
);

create table public.projects (
  id uuid primary key default public.uuid_v7(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  code text not null,
  client_company_id uuid,
  manager_id uuid,
  status text not null default 'draft' check (status in ('draft', 'active', 'at_risk', 'in_review', 'completed', 'archived')),
  health text not null default 'on_track' check (health in ('on_track', 'at_risk', 'off_track')),
  start_date date,
  due_date date,
  description text,
  visibility text not null default 'internal' check (visibility in ('internal', 'client_visible')),
  template_origin text,
  closing_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (organization_id, code),
  unique (id, organization_id),
  foreign key (client_company_id, organization_id) references public.companies(id, organization_id),
  foreign key (manager_id, organization_id) references public.organization_members(id, organization_id)
);

create table public.project_members (
  id uuid primary key default public.uuid_v7(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null,
  member_id uuid not null,
  created_at timestamptz not null default now(),
  unique (project_id, member_id),
  unique (id, organization_id),
  foreign key (project_id, organization_id) references public.projects(id, organization_id) on delete cascade,
  foreign key (member_id, organization_id) references public.organization_members(id, organization_id)
);

create table public.milestones (
  id uuid primary key default public.uuid_v7(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null,
  name text not null,
  due_date date,
  status text not null default 'planned' check (status in ('planned', 'active', 'met', 'missed')),
  position integer not null default 0,
  acceptance_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, organization_id),
  foreign key (project_id, organization_id) references public.projects(id, organization_id) on delete cascade
);

create table public.tasks (
  id uuid primary key default public.uuid_v7(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null,
  milestone_id uuid,
  title text not null,
  description text,
  assignee_id uuid,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'blocked', 'review', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  due_date date,
  estimate_hours numeric(8,2),
  blocker_reason text,
  labels text[] not null default '{}',
  visibility text not null default 'internal' check (visibility in ('internal', 'client_visible')),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  check (status <> 'blocked' or blocker_reason is not null),
  unique (id, organization_id),
  foreign key (project_id, organization_id) references public.projects(id, organization_id) on delete cascade,
  foreign key (milestone_id, organization_id) references public.milestones(id, organization_id),
  foreign key (assignee_id, organization_id) references public.organization_members(id, organization_id)
);

create table public.task_comments (
  id uuid primary key default public.uuid_v7(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  task_id uuid not null,
  author_user_id uuid not null references auth.users(id),
  body text not null,
  visibility text not null default 'internal' check (visibility in ('internal', 'client_visible')),
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  deleted_at timestamptz,
  unique (id, organization_id),
  foreign key (task_id, organization_id) references public.tasks(id, organization_id) on delete cascade
);

create table public.folders (
  id uuid primary key default public.uuid_v7(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid,
  name text not null,
  created_at timestamptz not null default now(),
  unique (id, organization_id),
  foreign key (project_id, organization_id) references public.projects(id, organization_id) on delete cascade
);

create table public.files (
  id uuid primary key default public.uuid_v7(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  folder_id uuid,
  project_id uuid,
  owner_id uuid,
  name text not null,
  review_status text not null default 'draft' check (review_status in ('draft', 'in_review', 'approved', 'superseded')),
  confidentiality text not null default 'internal' check (confidentiality in ('internal', 'confidential', 'client_shared')),
  tags text[] not null default '{}',
  current_version_id uuid,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (id, organization_id),
  foreign key (folder_id, organization_id) references public.folders(id, organization_id),
  foreign key (project_id, organization_id) references public.projects(id, organization_id),
  foreign key (owner_id, organization_id) references public.organization_members(id, organization_id)
);

create table public.file_versions (
  id uuid primary key default public.uuid_v7(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  file_id uuid not null,
  version_number integer not null,
  storage_path text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes >= 0),
  scan_status text not null default 'pending' check (scan_status in ('pending', 'clean', 'blocked')),
  author_user_id uuid not null references auth.users(id),
  note text,
  created_at timestamptz not null default now(),
  unique (file_id, version_number),
  unique (id, organization_id),
  foreign key (file_id, organization_id) references public.files(id, organization_id) on delete cascade
);

alter table public.files
  add constraint files_current_version_fk
  foreign key (current_version_id, organization_id)
  references public.file_versions(id, organization_id);

create table public.review_events (
  id uuid primary key default public.uuid_v7(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  file_id uuid not null,
  actor_user_id uuid not null references auth.users(id),
  from_status text,
  to_status text not null,
  note text,
  created_at timestamptz not null default now(),
  unique (id, organization_id),
  foreign key (file_id, organization_id) references public.files(id, organization_id) on delete cascade
);

create table public.notifications (
  id uuid primary key default public.uuid_v7(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  title text not null,
  body text,
  resource_type text,
  resource_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  unique (id, organization_id)
);

-- Organization-leading indexes and updated-at triggers.
create index organization_members_org_user_idx on public.organization_members (organization_id, user_id, status);
create index invitations_org_email_idx on public.invitations (organization_id, email, expires_at);
create index audit_logs_org_created_idx on public.audit_logs (organization_id, created_at desc);
create index tenant_flags_org_idx on public.tenant_flags (organization_id, flag_key);
create index companies_org_created_idx on public.companies (organization_id, created_at desc);
create index contacts_org_created_idx on public.contacts (organization_id, created_at desc);
create index contacts_org_owner_idx on public.contacts (organization_id, owner_id);
create index leads_org_next_action_idx on public.leads (organization_id, next_action_at) where deleted_at is null;
create index activities_org_resource_idx on public.activities (organization_id, resource_type, resource_id, created_at desc);
create index projects_org_status_idx on public.projects (organization_id, status, updated_at desc) where deleted_at is null;
create index project_members_org_project_idx on public.project_members (organization_id, project_id, member_id);
create index milestones_org_project_idx on public.milestones (organization_id, project_id, position);
create index tasks_org_assignee_idx on public.tasks (organization_id, assignee_id, status, due_date) where deleted_at is null;
create index tasks_org_project_idx on public.tasks (organization_id, project_id, status) where deleted_at is null;
create index task_comments_org_task_idx on public.task_comments (organization_id, task_id, created_at);
create index folders_org_project_idx on public.folders (organization_id, project_id);
create index files_org_review_idx on public.files (organization_id, review_status, updated_at desc) where deleted_at is null;
create index file_versions_org_file_idx on public.file_versions (organization_id, file_id, version_number desc);
create index review_events_org_file_idx on public.review_events (organization_id, file_id, created_at desc);
create index notifications_org_user_idx on public.notifications (organization_id, user_id, read_at, created_at desc);

create trigger organizations_touch before update on public.organizations for each row execute function public.touch_updated_at();
create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();
create trigger organization_members_touch before update on public.organization_members for each row execute function public.touch_updated_at();
create trigger companies_touch before update on public.companies for each row execute function public.touch_updated_at();
create trigger contacts_touch before update on public.contacts for each row execute function public.touch_updated_at();
create trigger leads_touch before update on public.leads for each row execute function public.touch_updated_at();
create trigger projects_touch before update on public.projects for each row execute function public.touch_updated_at();
create trigger milestones_touch before update on public.milestones for each row execute function public.touch_updated_at();
create trigger tasks_touch before update on public.tasks for each row execute function public.touch_updated_at();
create trigger files_touch before update on public.files for each row execute function public.touch_updated_at();

-- Current tenant comes from server-controlled user settings, never a query
-- parameter. switch_organization is the sole explicit tenant-selection function.
create or replace function public.current_organization_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select us.active_organization_id
      from public.user_settings us
      join public.organization_members om
        on om.organization_id = us.active_organization_id
       and om.user_id = us.user_id
       and om.status = 'active'
      where us.user_id = auth.uid()
    ),
    (
      select om.organization_id
      from public.organization_members om
      join public.organizations o on o.id = om.organization_id
      where om.user_id = auth.uid() and om.status = 'active' and o.deleted_at is null
      order by om.created_at
      limit 1
    )
  );
$$;

create or replace function public.current_member_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select om.id from public.organization_members om
  where om.organization_id = public.current_organization_id()
    and om.user_id = auth.uid() and om.status = 'active';
$$;

create or replace function public.has_org_role(target_org uuid, allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.organization_members om
    where om.organization_id = target_org
      and om.user_id = auth.uid()
      and om.status = 'active'
      and om.role = any(allowed_roles)
  );
$$;

create or replace function public.is_org_member(target_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_org_role(target_org, array['owner','admin','manager','sales','contributor','client','vendor','auditor']);
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  insert into public.user_settings (user_id) values (new.id)
  on conflict (user_id) do nothing;
  if coalesce(new.raw_user_meta_data ->> 'accepted_legal', 'false') = 'true' then
    insert into public.legal_consents (user_id, terms_version, privacy_version)
    values (
      new.id,
      coalesce(new.raw_user_meta_data ->> 'terms_version', '2026-11-05'),
      coalesce(new.raw_user_meta_data ->> 'privacy_version', '2026-11-05')
    );
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- RLS is fail-closed for anonymous users and for stale sessions whose membership
-- has been suspended or removed.
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.invitations enable row level security;
alter table public.audit_logs enable row level security;
alter table public.tenant_flags enable row level security;
alter table public.companies enable row level security;
alter table public.contacts enable row level security;
alter table public.leads enable row level security;
alter table public.activities enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.milestones enable row level security;
alter table public.tasks enable row level security;
alter table public.task_comments enable row level security;
alter table public.folders enable row level security;
alter table public.files enable row level security;
alter table public.file_versions enable row level security;
alter table public.review_events enable row level security;
alter table public.notifications enable row level security;
alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.legal_consents enable row level security;

create policy "own profile" on public.profiles for select to authenticated using (id = auth.uid());
create policy "own settings" on public.user_settings for select to authenticated using (user_id = auth.uid());
create policy "own legal consents" on public.legal_consents for select to authenticated using (user_id = auth.uid());
create policy "active organization" on public.organizations for select to authenticated
  using (id = public.current_organization_id() and deleted_at is null);
create policy "active membership" on public.organization_members for select to authenticated
  using (organization_id = public.current_organization_id());
create policy "admin invitations" on public.invitations for select to authenticated
  using (organization_id = public.current_organization_id() and public.has_org_role(organization_id, array['owner','admin']));
create policy "audit readers" on public.audit_logs for select to authenticated
  using (organization_id = public.current_organization_id() and public.has_org_role(organization_id, array['owner','admin','auditor']));
create policy "tenant flags" on public.tenant_flags for select to authenticated
  using (organization_id = public.current_organization_id());

create policy "tenant companies" on public.companies for select to authenticated
  using (organization_id = public.current_organization_id() and deleted_at is null);
create policy "tenant contacts scoped" on public.contacts for select to authenticated
  using (
    organization_id = public.current_organization_id() and deleted_at is null
    and (
      not public.has_org_role(organization_id, array['contributor'])
      or owner_id = public.current_member_id()
    )
  );
create policy "tenant leads scoped" on public.leads for select to authenticated
  using (
    organization_id = public.current_organization_id() and deleted_at is null
    and (
      not public.has_org_role(organization_id, array['contributor','client','vendor'])
      or owner_id = public.current_member_id()
    )
  );
create policy "tenant activities" on public.activities for select to authenticated
  using (
    organization_id = public.current_organization_id()
    and (visibility = 'internal' and not public.has_org_role(organization_id, array['client'])
      or visibility = 'client_visible')
  );
create policy "tenant projects scoped" on public.projects for select to authenticated
  using (
    organization_id = public.current_organization_id() and deleted_at is null
    and (
      not public.has_org_role(organization_id, array['client','vendor'])
      or (
        visibility = 'client_visible' and exists (
          select 1 from public.project_members pm
          where pm.project_id = projects.id and pm.organization_id = projects.organization_id
            and pm.member_id = public.current_member_id()
        )
      )
    )
  );
create policy "tenant project members" on public.project_members for select to authenticated
  using (organization_id = public.current_organization_id());
create policy "tenant milestones" on public.milestones for select to authenticated
  using (organization_id = public.current_organization_id());
create policy "tenant tasks scoped" on public.tasks for select to authenticated
  using (
    organization_id = public.current_organization_id() and deleted_at is null
    and (
      not public.has_org_role(organization_id, array['client','vendor'])
      or (visibility = 'client_visible' and public.has_org_role(organization_id, array['client']))
      or (assignee_id = public.current_member_id() and public.has_org_role(organization_id, array['vendor']))
    )
  );
create policy "tenant task comments" on public.task_comments for select to authenticated
  using (
    organization_id = public.current_organization_id() and deleted_at is null
    and (visibility = 'client_visible' or not public.has_org_role(organization_id, array['client','vendor']))
  );
create policy "tenant folders" on public.folders for select to authenticated
  using (organization_id = public.current_organization_id());
create policy "tenant files scoped" on public.files for select to authenticated
  using (
    organization_id = public.current_organization_id() and deleted_at is null
    and (
      not public.has_org_role(organization_id, array['client','vendor'])
      or (confidentiality = 'client_shared' and review_status = 'approved')
      or (owner_id = public.current_member_id() and public.has_org_role(organization_id, array['vendor']))
    )
  );
create policy "tenant file versions" on public.file_versions for select to authenticated
  using (organization_id = public.current_organization_id());
create policy "tenant review events" on public.review_events for select to authenticated
  using (organization_id = public.current_organization_id());
create policy "own notifications" on public.notifications for select to authenticated
  using (organization_id = public.current_organization_id() and user_id = auth.uid());

-- Global, non-tenant catalogues are safe to read; flags never contain secrets.
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.feature_flags enable row level security;
create policy "read roles" on public.roles for select to authenticated using (true);
create policy "read permissions" on public.permissions for select to authenticated using (true);
create policy "read role permissions" on public.role_permissions for select to authenticated using (true);
create policy "read flags" on public.feature_flags for select to authenticated using (true);

-- All writes are transactional security-definer functions. They re-check the
-- authenticated user, active membership, role and tenant before every mutation.
create or replace function public.record_audit(
  target_org uuid,
  audit_action text,
  audit_resource_type text,
  audit_resource_id text,
  audit_before jsonb default null,
  audit_after jsonb default null,
  audit_request_id text default null,
  audit_ai_involved boolean default false
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_logs (
    organization_id, actor_user_id, action, resource_type, resource_id,
    before_diff, after_diff, request_id, ai_involved
  ) values (
    target_org, auth.uid(), audit_action, audit_resource_type, audit_resource_id,
    audit_before, audit_after, coalesce(audit_request_id, gen_random_uuid()::text), audit_ai_involved
  );
end;
$$;

create or replace function public.switch_organization(target_org uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_org_member(target_org) then
    raise exception 'Organization not found' using errcode = 'P0002';
  end if;
  update public.user_settings set active_organization_id = target_org, updated_at = now()
  where user_id = auth.uid();
  return target_org;
end;
$$;

create or replace function public.create_organization(
  org_name text,
  org_slug text,
  org_country text default 'IN',
  org_timezone text default 'Asia/Kolkata',
  org_currency text default 'INR',
  org_locale text default 'en-IN',
  org_industry text default 'Professional services'
)
returns public.organizations
language plpgsql
security definer
set search_path = public
as $$
declare
  new_org public.organizations;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if org_slug in ('admin','api','app','auth','login','signup','support','www','mail','status') then
    raise exception 'This workspace URL is reserved' using errcode = '22023';
  end if;
  insert into public.organizations (name, slug, country, timezone, currency, locale, industry)
  values (org_name, lower(org_slug), org_country, org_timezone, org_currency, org_locale, org_industry)
  returning * into new_org;
  insert into public.organization_members (organization_id, user_id, role)
  values (new_org.id, auth.uid(), 'owner');
  update public.user_settings set active_organization_id = new_org.id, updated_at = now()
  where user_id = auth.uid();
  perform public.record_audit(new_org.id, 'organization.created', 'organization', new_org.id::text, null, to_jsonb(new_org));
  return new_org;
end;
$$;

create or replace function public.create_contact(
  contact_first_name text,
  contact_last_name text,
  contact_email text,
  contact_phone text default null,
  contact_title text default null,
  contact_company_name text default null,
  contact_tags text[] default '{}'
)
returns public.contacts
language plpgsql
security definer
set search_path = public
as $$
declare
  org_id uuid := public.current_organization_id();
  member_id uuid := public.current_member_id();
  linked_company uuid;
  new_contact public.contacts;
begin
  if org_id is null or not public.has_org_role(org_id, array['owner','admin','manager','sales']) then
    raise exception 'Permission denied' using errcode = '42501';
  end if;
  if nullif(trim(contact_company_name), '') is not null then
    select id into linked_company from public.companies
    where organization_id = org_id and lower(name) = lower(trim(contact_company_name)) and deleted_at is null;
    if linked_company is null then
      insert into public.companies (organization_id, name, owner_id, status)
      values (org_id, trim(contact_company_name), member_id, 'prospect') returning id into linked_company;
    end if;
  end if;
  insert into public.contacts (
    organization_id, company_id, first_name, last_name, email, phone, title, owner_id, tags
  ) values (
    org_id, linked_company, trim(contact_first_name), trim(coalesce(contact_last_name, '')),
    trim(contact_email), nullif(trim(contact_phone), ''), nullif(trim(contact_title), ''), member_id, contact_tags
  ) returning * into new_contact;
  perform public.record_audit(org_id, 'contact.created', 'contact', new_contact.id::text, null, to_jsonb(new_contact));
  return new_contact;
end;
$$;

create or replace function public.create_lead(
  lead_name text,
  lead_email text,
  lead_phone text,
  lead_source text,
  lead_notes text default null
)
returns public.leads
language plpgsql
security definer
set search_path = public
as $$
declare
  org_id uuid := public.current_organization_id();
  new_lead public.leads;
begin
  if org_id is null or not public.has_org_role(org_id, array['owner','admin','manager','sales']) then
    raise exception 'Permission denied' using errcode = '42501';
  end if;
  insert into public.leads (organization_id, name, email, phone, source, owner_id, notes)
  values (org_id, trim(lead_name), nullif(trim(lead_email), ''), nullif(trim(lead_phone), ''), lead_source, public.current_member_id(), lead_notes)
  returning * into new_lead;
  perform public.record_audit(org_id, 'lead.created', 'lead', new_lead.id::text, null, to_jsonb(new_lead));
  return new_lead;
end;
$$;

create or replace function public.create_project(
  project_name text,
  project_code text,
  project_description text default null,
  project_client_company_id uuid default null,
  project_due_date date default null,
  project_visibility text default 'internal'
)
returns public.projects
language plpgsql
security definer
set search_path = public
as $$
declare
  org_id uuid := public.current_organization_id();
  member_id uuid := public.current_member_id();
  new_project public.projects;
begin
  if org_id is null or not public.has_org_role(org_id, array['owner','admin','manager']) then
    raise exception 'Permission denied' using errcode = '42501';
  end if;
  insert into public.projects (
    organization_id, name, code, description, client_company_id, due_date,
    visibility, manager_id, status
  ) values (
    org_id, trim(project_name), upper(project_code), project_description,
    project_client_company_id, project_due_date, project_visibility, member_id, 'active'
  ) returning * into new_project;
  insert into public.project_members (organization_id, project_id, member_id)
  values (org_id, new_project.id, member_id);
  perform public.record_audit(org_id, 'project.created', 'project', new_project.id::text, null, to_jsonb(new_project));
  return new_project;
end;
$$;

create or replace function public.create_task(
  task_project_id uuid,
  task_title text,
  task_due_date date default null,
  task_priority text default 'medium'
)
returns public.tasks
language plpgsql
security definer
set search_path = public
as $$
declare
  org_id uuid := public.current_organization_id();
  new_task public.tasks;
begin
  if org_id is null or not public.has_org_role(org_id, array['owner','admin','manager']) then
    raise exception 'Permission denied' using errcode = '42501';
  end if;
  if not exists (select 1 from public.projects p where p.id = task_project_id and p.organization_id = org_id and p.deleted_at is null) then
    raise exception 'Project not found' using errcode = 'P0002';
  end if;
  insert into public.tasks (organization_id, project_id, title, due_date, priority, assignee_id)
  values (org_id, task_project_id, trim(task_title), task_due_date, task_priority, public.current_member_id())
  returning * into new_task;
  perform public.record_audit(org_id, 'task.created', 'task', new_task.id::text, null, to_jsonb(new_task));
  return new_task;
end;
$$;

create or replace function public.update_task(
  task_id uuid,
  next_status text,
  next_blocker_reason text default null
)
returns public.tasks
language plpgsql
security definer
set search_path = public
as $$
declare
  org_id uuid := public.current_organization_id();
  previous public.tasks;
  changed public.tasks;
begin
  select * into previous from public.tasks
  where id = task_id and organization_id = org_id and deleted_at is null;
  if previous.id is null then raise exception 'Task not found' using errcode = 'P0002'; end if;
  if not public.has_org_role(org_id, array['owner','admin','manager'])
     and not (public.has_org_role(org_id, array['contributor','vendor']) and previous.assignee_id = public.current_member_id()) then
    raise exception 'Permission denied' using errcode = '42501';
  end if;
  if next_status = 'blocked' and nullif(trim(next_blocker_reason), '') is null then
    raise exception 'A blocked task needs a blocker reason' using errcode = '22023';
  end if;
  update public.tasks set
    status = next_status,
    blocker_reason = case when next_status = 'blocked' then next_blocker_reason else null end,
    completed_at = case when next_status = 'done' then now() else null end
  where id = task_id and organization_id = org_id
  returning * into changed;
  perform public.record_audit(org_id, 'task.status_changed', 'task', task_id::text,
    jsonb_build_object('status', previous.status), jsonb_build_object('status', changed.status));
  return changed;
end;
$$;

create or replace function public.review_document(
  file_id uuid,
  next_status text,
  review_note text default null
)
returns public.files
language plpgsql
security definer
set search_path = public
as $$
declare
  org_id uuid := public.current_organization_id();
  previous public.files;
  changed public.files;
begin
  if org_id is null or not public.has_org_role(org_id, array['owner','admin','manager']) then
    raise exception 'Permission denied' using errcode = '42501';
  end if;
  select * into previous from public.files where id = file_id and organization_id = org_id and deleted_at is null;
  if previous.id is null then raise exception 'Document not found' using errcode = 'P0002'; end if;
  if next_status not in ('draft','in_review','approved') then
    raise exception 'Unsupported review transition' using errcode = '22023';
  end if;
  update public.files set review_status = next_status,
    confidentiality = case when next_status = 'approved' then confidentiality else 'internal' end
  where id = file_id and organization_id = org_id returning * into changed;
  insert into public.review_events (organization_id, file_id, actor_user_id, from_status, to_status, note)
  values (org_id, file_id, auth.uid(), previous.review_status, next_status, review_note);
  perform public.record_audit(org_id, 'document.reviewed', 'file', file_id::text,
    jsonb_build_object('status', previous.review_status), jsonb_build_object('status', changed.review_status));
  return changed;
end;
$$;

-- No direct tenant-table writes are exposed through PostgREST. RPC mutations
-- above include their audit event in the same database transaction.
revoke insert, update, delete on
  public.organizations, public.organization_members, public.invitations,
  public.companies, public.contacts, public.leads, public.activities,
  public.projects, public.project_members, public.milestones, public.tasks,
  public.task_comments, public.folders, public.files, public.file_versions,
  public.review_events, public.notifications
from anon, authenticated;
revoke insert, update, delete on public.audit_logs from anon, authenticated;
revoke execute on function public.record_audit(uuid,text,text,text,jsonb,jsonb,text,boolean) from public, anon, authenticated;

grant select on public.roles, public.permissions, public.role_permissions, public.feature_flags to authenticated;
grant select on public.organizations, public.organization_members, public.invitations,
  public.audit_logs, public.tenant_flags, public.companies, public.contacts,
  public.leads, public.activities, public.projects, public.project_members,
  public.milestones, public.tasks, public.task_comments, public.folders,
  public.files, public.file_versions, public.review_events, public.notifications,
  public.profiles, public.user_settings, public.legal_consents to authenticated;

comment on table public.audit_logs is 'Append-only audit stream. Product roles receive SELECT only; writes occur inside audited RPC transactions.';
comment on function public.current_organization_id() is 'Derives the active tenant from authenticated user settings and active membership.';

commit;
