import { projectSchema } from '@monk/contracts';
import { authorize, failure, getApiContext, parseJson, success, unwrapRpc } from '@/lib/api';

export async function POST(request: Request) {
  try {
    const context = await getApiContext();
    authorize(context, 'projects.project.create');
    const input = await parseJson(request, projectSchema);
    const result = await context.supabase.rpc('create_project', {
      project_name: input.name,
      project_code: input.code,
      project_description: input.description,
      project_client_company_id: input.clientCompanyId,
      project_due_date: input.dueDate,
      project_visibility: input.visibility,
    });
    return success({ data: unwrapRpc(result) }, 201);
  } catch (error) {
    return failure(error);
  }
}
