# MONK

**Less chasing. More knowing.**

MONK is a calm, multi-tenant business operating workspace for agencies and professional service teams. This repository implements the public website, an interactive product demo, authenticated onboarding, and a Supabase/PostgreSQL foundation for CRM, projects, tasks and document review.

## What works

- Premium responsive marketing site with product, pricing, security, about, contact, status and legal pages
- Interactive demo with clearly labeled fictional data
- Overview metrics, CRM search/filters, project details, task board/list, document review and global search
- Contact, lead, project and task creation in demo and live modes
- Drag-and-drop plus keyboard-accessible task status changes; blocker reasons are required
- Supabase Auth sign-up, email verification callback, sign-in, password recovery and organization onboarding
- Organization tenancy, role permissions, server authorization and PostgreSQL row-level security
- Transactional audit records for implemented live mutations
- Typed Zod API contracts and consistent error envelopes

The demo Copilot uses deterministic answers from sample records and sends nothing to an AI provider. Live Copilot remains disabled until the server-side AI gateway and evaluation gates are complete.

The temporary Arena preview serves the public site and local demo, but its sandbox egress allowlist blocks application-to-Supabase traffic. `/api/v1/health` therefore reports `503 degraded` there rather than pretending the live connection works. This is a preview-network limitation, not a remote database health failure; production must return `200` with `database: reachable`.

## Run locally

Requirements: Node.js 22.12+ and npm 10+.

```bash
npm install
npm run dev
```

Open http://localhost:3000. The demo at `/demo` works without a database. For live auth and workspace data:

```bash
cp apps/web/.env.example apps/web/.env.local
# Fill in your Supabase project URL and publishable key, then restart npm run dev.
```

## Verify

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

GitHub Actions runs the same checks plus `npm audit --omit=dev --audit-level=high` on pull requests and main.

## Repository layout

```text
apps/web/                 Next.js website, workspace, auth and API routes
packages/contracts/       Strict Zod request contracts and API types
packages/policy/          Single can(actor, permission, resource) policy + tests
supabase/migrations/      UUIDv7, tenancy, RLS, audit and operational schema
supabase/tests/           Rollback-only tenant and client-scope database smoke tests
docs/                     Deployment, release gates and architecture decisions
.github/workflows/        CI and dependency updates
```

## Connected pilot database

The current Supabase pilot project has the schema migrations applied. Verification on 5 November 2026:

- 26 public tables with RLS enabled and 26 policies
- 8 roles, 28 permissions and 111 role-permission mappings
- UUIDv7 version and variant checks passed
- 15/15 tenant and client-scope smoke checks passed, including guessed-ID isolation, assigned-project visibility and same-transaction audit writes
- Rollback confirmed: zero smoke users or organizations left behind

No service-role key is committed or required by the web app. Local `.env.local` files are ignored by Git.

## Deploy and connect a subdomain

See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** for the Vercel + public GitHub workflow, environment variables, CNAME setup and Supabase Auth redirect configuration.

The exact custom hostname and DNS provider access are still needed to point a production subdomain. Do not use static-only GitHub Pages for the live app because it includes authenticated server APIs.

## Production readiness

This is a working pilot foundation, not a claim that every module in the 89-page blueprint is finished. Review **[docs/PRODUCTION_CHECKLIST.md](docs/PRODUCTION_CHECKLIST.md)** before real customer data. SMTP, edge rate limits, MFA UI, private file scanning, backups/restore drills, monitoring, accessibility review and jurisdiction-specific legal review are explicit launch gates.

## License

MIT — see [LICENSE](LICENSE).
