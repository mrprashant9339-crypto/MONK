-- Rollback-only MONK tenancy smoke test.
-- Run with a privileged SQL session. Every returned `passed` value must be true.
begin;
create temporary table smoke_users (label text, id uuid);
create temporary table smoke_orgs (label text, organization_id uuid);
create temporary table smoke_contacts (label text, contact_id uuid, organization_id uuid);
create temporary table smoke_tasks (label text, task_id uuid, organization_id uuid);
create temporary table smoke_results (check_name text, passed boolean, detail text);
insert into smoke_users select 'A', public.uuid_v7() union all select 'B', public.uuid_v7();
insert into auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
select id, 'authenticated', 'authenticated', 'smoke-' || label || '-' || id::text || '@example.com', '', now(), '{"provider":"email"}'::jsonb, jsonb_build_object('full_name', 'Smoke ' || label), now(), now() from smoke_users;
grant select on smoke_users to authenticated;
grant select, insert on smoke_orgs, smoke_contacts, smoke_tasks, smoke_results to authenticated;
set local role authenticated;
select set_config('request.jwt.claims', (select json_build_object('sub', id::text, 'role', 'authenticated')::text from smoke_users where label = 'A'), true);
insert into smoke_orgs select 'A', o.id from public.create_organization('Smoke Tenant A', 'smoke-tenant-a') o;
insert into smoke_contacts select 'A', c.id, c.organization_id from public.create_contact('Alpha', 'Owner', 'alpha@example.com', null, null, 'Alpha Co', '{}') c;
insert into smoke_tasks select 'A', t.id, t.organization_id from public.create_task((select p.id from public.create_project('Alpha Delivery', 'ALPHA-1') p), 'Alpha task') t;
select set_config('request.jwt.claims', (select json_build_object('sub', id::text, 'role', 'authenticated')::text from smoke_users where label = 'B'), true);
insert into smoke_orgs select 'B', o.id from public.create_organization('Smoke Tenant B', 'smoke-tenant-b') o;
insert into smoke_contacts select 'B', c.id, c.organization_id from public.create_contact('Beta', 'Owner', 'beta@example.com', null, null, 'Beta Co', '{}') c;
insert into smoke_results select 'Active tenant resolves from membership', public.current_organization_id() = (select organization_id from smoke_orgs where label = 'B'), public.current_organization_id()::text;
insert into smoke_results select 'Tenant B sees only its own contact list', (select count(*) = 1 from public.contacts) and not exists (select 1 from public.contacts where organization_id <> (select organization_id from smoke_orgs where label = 'B')), (select count(*)::text from public.contacts);
insert into smoke_results select 'Guessed tenant A contact ID is invisible to B', not exists (select 1 from public.contacts where id = (select contact_id from smoke_contacts where label = 'A')), '0 rows expected';
insert into smoke_results select 'Organization list is tenant scoped', (select count(*) = 1 from public.organizations) and exists (select 1 from public.organizations where id = (select organization_id from smoke_orgs where label = 'B')), (select count(*)::text from public.organizations);
insert into smoke_results select 'Tenant B has no owner role in tenant A', not public.has_org_role((select organization_id from smoke_orgs where label = 'A'), array['owner']), 'false expected';
select set_config('request.jwt.claims', (select json_build_object('sub', id::text, 'role', 'authenticated')::text from smoke_users where label = 'A'), true);
insert into smoke_results select 'Switching identity restores tenant A only', public.current_organization_id() = (select organization_id from smoke_orgs where label = 'A') and (select count(*) = 1 from public.contacts), public.current_organization_id()::text;
insert into smoke_results select 'Guessed tenant B contact ID is invisible to A', not exists (select 1 from public.contacts where id = (select contact_id from smoke_contacts where label = 'B')), '0 rows expected';
insert into smoke_results select 'Audited owner mutation succeeds in own tenant', (select t.status = 'done' from public.update_task((select task_id from smoke_tasks where label = 'A'), 'done') t), 'done expected';
insert into smoke_results select 'Task mutation writes same-tenant audit event', exists (select 1 from public.audit_logs where action = 'task.status_changed' and organization_id = (select organization_id from smoke_orgs where label = 'A')), '1 audit event expected';
select * from smoke_results order by check_name;
rollback;

-- Optional post-check: both counts must be zero.
-- select (select count(*) from public.organizations where slug like 'smoke-tenant-%') as smoke_orgs,
--        (select count(*) from auth.users where email like 'smoke-%@example.com') as smoke_users;
