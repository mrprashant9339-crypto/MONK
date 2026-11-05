import { leadSchema } from '@monk/contracts';
import { authorize, failure, getApiContext, parseJson, success, unwrapRpc } from '@/lib/api';

export async function POST(request: Request) {
  try {
    const context = await getApiContext();
    authorize(context, 'crm.lead.create');
    const input = await parseJson(request, leadSchema);
    const result = await context.supabase.rpc('create_lead', {
      lead_name: input.name,
      lead_email: input.email,
      lead_phone: input.phone,
      lead_source: input.source,
      lead_notes: input.notes,
    });
    return success({ data: unwrapRpc(result) }, 201);
  } catch (error) {
    return failure(error);
  }
}
