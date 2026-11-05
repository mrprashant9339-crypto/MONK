-- Tighten read scope for external users and assigned internal contributors.
-- Security-definer helpers make the project/file relationship checks explicit;
-- they never infer access from a browser-supplied tenant ID.
begin;

create or replace function public.can_read_project(target_project uuid, target_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.projects p
    where p.id = target_project and p.organization_id = target_org and p.deleted_at is null
      and (
        public.has_org_role(target_org, array['owner','admin','auditor'])
        or (
          public.has_org_role(target_org, array['manager','sales','contributor'])
          and exists (
            select 1 from public.project_members pm
            where pm.project_id = p.id and pm.organization_id = p.organization_id
              and pm.member_id = public.current_member_id()
          )
        )
        or (
          public.has_org_role(target_org, array['contributor'])
          and exists (
            select 1 from public.tasks t
            where t.project_id = p.id and t.organization_id = p.organization_id
              and t.assignee_id = public.current_member_id() and t.deleted_at is null
          )
        )
        or (
          public.has_org_role(target_org, array['client','vendor'])
          and p.visibility = 'client_visible'
          and exists (
            select 1 from public.project_members pm
            where pm.project_id = p.id and pm.organization_id = p.organization_id
              and pm.member_id = public.current_member_id()
          )
        )
      )
  );
$$;

create or replace function public.can_read_task(target_task uuid, target_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.tasks t
    where t.id = target_task and t.organization_id = target_org and t.deleted_at is null
      and (
        public.has_org_role(target_org, array['owner','admin','auditor'])
        or (
          public.has_org_role(target_org, array['manager','sales'])
          and public.can_read_project(t.project_id, target_org)
        )
        or (
          public.has_org_role(target_org, array['contributor'])
          and t.assignee_id = public.current_member_id()
        )
        or (
          public.has_org_role(target_org, array['client'])
          and t.visibility = 'client_visible'
          and public.can_read_project(t.project_id, target_org)
        )
        or (
          public.has_org_role(target_org, array['vendor'])
          and t.assignee_id = public.current_member_id()
          and public.can_read_project(t.project_id, target_org)
        )
      )
  );
$$;

create or replace function public.can_read_file(target_file uuid, target_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.files f
    where f.id = target_file and f.organization_id = target_org and f.deleted_at is null
      and (
        public.has_org_role(target_org, array['owner','admin','auditor'])
        or (
          public.has_org_role(target_org, array['manager','sales','contributor'])
          and (f.owner_id = public.current_member_id() or public.can_read_project(f.project_id, target_org))
        )
        or (
          public.has_org_role(target_org, array['client'])
          and f.review_status = 'approved' and f.confidentiality = 'client_shared'
          and public.can_read_project(f.project_id, target_org)
        )
        or (
          public.has_org_role(target_org, array['vendor'])
          and f.owner_id = public.current_member_id()
          and public.can_read_project(f.project_id, target_org)
        )
      )
  );
$$;

-- CRM is internal operational data. Clients and vendors do not receive access.
drop policy "tenant companies" on public.companies;
create policy "tenant companies" on public.companies for select to authenticated
  using (
    organization_id = public.current_organization_id() and deleted_at is null
    and public.has_org_role(organization_id, array['owner','admin','manager','sales','contributor','auditor'])
  );

drop policy "tenant contacts scoped" on public.contacts;
create policy "tenant contacts scoped" on public.contacts for select to authenticated
  using (
    organization_id = public.current_organization_id() and deleted_at is null
    and (
      public.has_org_role(organization_id, array['owner','admin','manager','sales','auditor'])
      or (public.has_org_role(organization_id, array['contributor']) and owner_id = public.current_member_id())
    )
  );

drop policy "tenant leads scoped" on public.leads;
create policy "tenant leads scoped" on public.leads for select to authenticated
  using (
    organization_id = public.current_organization_id() and deleted_at is null
    and (
      public.has_org_role(organization_id, array['owner','admin','manager','sales','auditor'])
      or (public.has_org_role(organization_id, array['contributor']) and owner_id = public.current_member_id())
    )
  );

drop policy "tenant activities" on public.activities;
create policy "tenant activities" on public.activities for select to authenticated
  using (
    organization_id = public.current_organization_id()
    and public.has_org_role(organization_id, array['owner','admin','manager','sales','contributor','auditor'])
  );

-- External users cannot browse the organization member directory. Their own
-- membership remains readable so session and role resolution continues to work.
drop policy "active membership" on public.organization_members;
create policy "active membership" on public.organization_members for select to authenticated
  using (
    organization_id = public.current_organization_id()
    and (
      public.has_org_role(organization_id, array['owner','admin','manager','sales','contributor','auditor'])
      or user_id = auth.uid()
    )
  );

drop policy "tenant project members" on public.project_members;
create policy "tenant project members" on public.project_members for select to authenticated
  using (
    organization_id = public.current_organization_id()
    and (
      public.has_org_role(organization_id, array['owner','admin','manager','sales','contributor','auditor'])
      or member_id = public.current_member_id()
    )
  );

drop policy "tenant projects scoped" on public.projects;
create policy "tenant projects scoped" on public.projects for select to authenticated
  using (organization_id = public.current_organization_id() and public.can_read_project(id, organization_id));

drop policy "tenant milestones" on public.milestones;
create policy "tenant milestones" on public.milestones for select to authenticated
  using (organization_id = public.current_organization_id() and public.can_read_project(project_id, organization_id));

drop policy "tenant tasks scoped" on public.tasks;
create policy "tenant tasks scoped" on public.tasks for select to authenticated
  using (organization_id = public.current_organization_id() and public.can_read_task(id, organization_id));

drop policy "tenant task comments" on public.task_comments;
create policy "tenant task comments" on public.task_comments for select to authenticated
  using (
    organization_id = public.current_organization_id() and deleted_at is null
    and exists (
      select 1 from public.tasks t
      where t.id = task_comments.task_id and t.organization_id = task_comments.organization_id
        and public.can_read_task(t.id, t.organization_id)
    )
    and (
      public.has_org_role(organization_id, array['owner','admin','manager','sales','contributor','auditor'])
      or visibility = 'client_visible'
    )
  );

drop policy "tenant folders" on public.folders;
create policy "tenant folders" on public.folders for select to authenticated
  using (
    organization_id = public.current_organization_id()
    and public.has_org_role(organization_id, array['owner','admin','manager','sales','contributor','auditor'])
    and (project_id is null or public.can_read_project(project_id, organization_id))
  );

drop policy "tenant files scoped" on public.files;
create policy "tenant files scoped" on public.files for select to authenticated
  using (organization_id = public.current_organization_id() and public.can_read_file(id, organization_id));

drop policy "tenant file versions" on public.file_versions;
create policy "tenant file versions" on public.file_versions for select to authenticated
  using (organization_id = public.current_organization_id() and public.can_read_file(file_id, organization_id));

drop policy "tenant review events" on public.review_events;
create policy "tenant review events" on public.review_events for select to authenticated
  using (
    organization_id = public.current_organization_id()
    and public.has_org_role(organization_id, array['owner','admin','manager','sales','contributor','auditor'])
    and public.can_read_file(file_id, organization_id)
  );

comment on function public.can_read_project(uuid, uuid) is 'Relationship-aware project read scope for internal members, clients and vendors.';
comment on function public.can_read_file(uuid, uuid) is 'Approved/shared state and project relationship required for external file reads.';

commit;
