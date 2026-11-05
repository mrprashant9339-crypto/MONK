import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies, headers } from 'next/headers';

export async function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase environment variables are not configured');

  // The browser uses HTTP-only session cookies. The same REST API also accepts
  // a verified Supabase user access token for native/headless integrations;
  // never accept a service-role key here.
  const authorization = (await headers()).get('authorization');
  if (authorization?.startsWith('Bearer ')) {
    return createClient(url, key, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Cookie writes are ignored in pure Server Components. Auth-refresh
          // requests run through route handlers, where writes are permitted.
        }
      },
    },
  });
}
