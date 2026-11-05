-- Re-check the resource relationship inside mutation transactions, not only in
-- the HTTP route. This closes guessed-ID writes against unassigned records.
begin;

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
  if not public.can_read_project(task_project_id, org_id) then
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
  if previous.id is null or not public.can_read_task(task_id, org_id) then
    raise exception 'Task not found' using errcode = 'P0002';
  end if;
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
  if previous.id is null or not public.can_read_file(file_id, org_id) then
    raise exception 'Document not found' using errcode = 'P0002';
  end if;
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

commit;
