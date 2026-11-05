# Deploy MONK from the public GitHub repository

Repository: https://github.com/mrprashant9339-crypto/MONK

MONK uses Next.js route handlers for authenticated APIs, so deploy it to a Node-compatible host such as Vercel. A static-only GitHub Pages deployment is not sufficient for the live workspace.

## 1. Import into Vercel

1. In Vercel, choose **Add New → Project** and import `mrprashant9339-crypto/MONK`.
2. Set **Root Directory** to `apps/web`.
3. Framework preset: **Next.js**. The included `apps/web/vercel.json` uses `npm install` and `npm run build`.
4. Add these environment variables for Production and Preview:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-key
   NEXT_PUBLIC_SITE_URL=https://app.yourdomain.com
   NEXT_PUBLIC_SUPABASE_ENABLED=true
   ```

   Use the **publishable** key only. This application does not need a service-role secret in its hosting environment.

5. Deploy and verify `/api/v1/health` returns HTTP 200 with `database: "reachable"`. Signed-out `/api/v1/bootstrap` must return `401 unauthenticated`.

   The temporary Arena sandbox cannot make outbound Supabase requests, so its health endpoint intentionally returns 503 and only the public/local-demo experience is usable there. Do not treat that preview as the production live-mode acceptance test.

## 2. Connect the subdomain

Replace `app.yourdomain.com` with the desired hostname.

1. In Vercel, open **Project → Settings → Domains** and add `app.yourdomain.com`.
2. At the DNS provider for `yourdomain.com`, create:

   | Type | Name | Value | TTL |
   | --- | --- | --- | --- |
   | CNAME | `app` | `cname.vercel-dns.com` | 300 / Auto |

3. Do not create a second A/AAAA/CNAME record for the same `app` name. If DNSSEC is enabled, keep the provider's DNSSEC records intact.
4. Wait for Vercel to show **Valid Configuration** and issue the TLS certificate. Verify HTTPS before sending users the link.

The exact hostname and DNS provider access are required to complete this step; they are not stored in the repository.

## 3. Update Supabase Auth redirects

In **Supabase → Authentication → URL Configuration**:

- Site URL: `https://app.yourdomain.com`
- Redirect URLs:
  - `https://app.yourdomain.com/auth/callback`
  - `http://localhost:3000/auth/callback` for local development

Keep email confirmation enabled for the pilot. Configure production SMTP before launch so verification and recovery emails are reliable and use your domain.

## 4. Apply database migrations

The connected pilot project already contains the migrations in `supabase/migrations`. For another project, use the Supabase SQL editor or CLI:

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

Then run the rollback-only smoke tests in `supabase/tests/tenant_isolation.sql` and `supabase/tests/external_scope.sql` using a privileged SQL session. Every `passed` value must be `true`, and the final rollbacks must leave no smoke users or organizations.

## 5. Production gates

Complete `docs/PRODUCTION_CHECKLIST.md` before accepting real customer data. In particular: SMTP, edge rate limits, MFA UI, private file scanning, backups/restore drill, monitoring, accessibility review and qualified legal review remain explicit launch gates.
