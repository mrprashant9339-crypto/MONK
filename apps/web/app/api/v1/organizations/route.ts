import { organizationSchema } from '@monk/contracts';
import { ApiException, failure, parseJson, success, unwrapRpc } from '@/lib/api';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    // Authentication is required, but an existing organization is not.
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiException(401, 'unauthenticated', 'Sign in to continue.');
    const input = await parseJson(request, organizationSchema);
    const result = await supabase.rpc('create_organization', {
      org_name: input.name,
      org_slug: input.slug,
      org_country: input.country,
      org_timezone: input.timezone,
      org_currency: input.currency,
      org_locale: input.locale,
      org_industry: input.industry,
    });
    return success({ data: unwrapRpc(result) }, 201);
  } catch (error) {
    return failure(error);
  }
}
