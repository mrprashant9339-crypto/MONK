import { NextResponse } from 'next/server';
import { contactSchema } from '@monk/contracts';
import { authorize, failure, getApiContext, parseJson, success, unwrapRpc } from '@/lib/api';

export async function POST(request: Request) {
  try {
    const context = await getApiContext();
    authorize(context, 'crm.contact.create');
    const input = await parseJson(request, contactSchema);
    const result = await context.supabase.rpc('create_contact', {
      contact_first_name: input.firstName,
      contact_last_name: input.lastName,
      contact_email: input.email,
      contact_phone: input.phone,
      contact_title: input.title,
      contact_company_name: input.companyName,
      contact_tags: input.tags,
    });

    if (result.error?.code === '23505') {
      const { data: existingRecord } = await context.supabase
        .from('contacts').select('*').eq('email', input.email).maybeSingle();
      return NextResponse.json({
        error: {
          code: 'duplicate',
          message: 'A contact with this email already exists. Open the existing record instead of creating a duplicate.',
          field_errors: [{ path: 'email', message: 'Email must be unique within this workspace.' }],
          request_id: crypto.randomUUID(),
        },
        existing_record: existingRecord,
      }, { status: 409 });
    }

    return success({ data: unwrapRpc(result) }, 201);
  } catch (error) {
    return failure(error);
  }
}
