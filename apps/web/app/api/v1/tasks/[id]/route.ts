import { taskPatchSchema } from '@monk/contracts';
import { authorize, ApiException, failure, getApiContext, parseJson, success, unwrapRpc } from '@/lib/api';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const context = await getApiContext();
    const { id } = await params;
    const input = await parseJson(request, taskPatchSchema);
    if (!input.status || input.title !== undefined || input.dueDate !== undefined) {
      throw new ApiException(400, 'unsupported_patch', 'This endpoint currently accepts task status changes only.');
    }
    const { data: existingTask, error: lookupError } = await context.supabase
      .from('tasks').select('id, assignee_id').eq('id', id).maybeSingle();
    if (lookupError) throw lookupError;
    if (!existingTask) throw new ApiException(404, 'not_found', 'The requested task could not be found.');
    authorize(context, 'projects.task.update', {
      assigneeId: existingTask.assignee_id === context.memberId ? context.actor.userId : 'another-member',
    });
    const result = await context.supabase.rpc('update_task', {
      task_id: id,
      next_status: input.status,
      next_blocker_reason: input.blockerReason,
    });
    return success({ data: unwrapRpc(result) });
  } catch (error) {
    return failure(error);
  }
}
