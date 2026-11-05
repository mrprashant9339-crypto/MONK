# Production release checklist

The current repository is a working pilot foundation, not a claim that every item in the 89-page blueprint is complete.

## Completed in this build

- Public marketing site, responsive interactive demo and authenticated app shell
- Supabase Auth sign-up, verification callback, sign-in, recovery and organization onboarding
- Organization tenancy, role catalogue, application policy and PostgreSQL RLS
- CRM contact/lead creation, project/task creation, task status changes and document review API
- Same-transaction audit events for implemented database mutations
- Typed API errors, strict Zod input contracts and authenticated API behavior
- Typecheck, lint, unit tests, production build and dependency audit in GitHub Actions
- Remote two-tenant and client-scope, rollback-only database smoke tests (15 checks passed on 5 Nov 2026)

## Required before accepting production customer data

- Add the final custom domain, production hosting environment and verified DNS
- Verify production `/api/v1/health` returns 200 with `database: reachable`; temporary Arena egress is blocked and intentionally reports 503
- Configure production SMTP and test delivered verification/recovery emails
- Set Supabase password minimum to 10 and enable breach-list/HIBP checking in the Auth dashboard (the web contract already enforces 10)
- Add rate limiting at the application edge and test the sign-in cooldown policy
- Complete private Storage bucket policies, MIME sniffing, malware scanning and signed-URL expiry tests
- Add background workers for imports, exports, reminders, deletion and file scanning
- Add MFA enrollment UI and require MFA for owners on paid plans
- Expand integration tests to all resources and all 12 security probes in the specification
- Run automated accessibility tests plus manual keyboard, NVDA and VoiceOver review
- Configure backups/PITR, perform and document a restore drill, monitoring, alerts and incident runbooks
- Insert the operating legal entity, privacy contact, subprocessors, regions and governing law; obtain qualified legal review
- Define final pricing, support hours, retention periods and the production AI provider before enabling those features

## Explicitly not yet claimed

SOC 2 or ISO certification, production SLA, complete file upload/storage, live AI Copilot, finance, marketplace, payroll, statutory filing, native mobile apps or full implementation of every module in the blueprint.
