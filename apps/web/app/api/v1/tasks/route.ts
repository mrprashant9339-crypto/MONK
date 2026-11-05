import { z } from 'zod';
import { authorize, failure, getApiContext, parseJson, success, unwrapRpc } from '@/lib/api';

const createTaskSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().trim().min(1).max(180),
  dueDate: z.string().date().optional().nullable(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
}).strict();

export async function POST(request: Request) {
  try {
    const context = await getApiContext();
    authorize(context, 'projects.task.create');
    const input = await parseJson(request, createTaskSchema);
    const result = await context.supabase.rpc('create_task', {
      task_project_id: input.projectId,
      task_title: input.title,
      task_due_date: input.dueDate,
      task_priority: input.priority,
    });
    return success({ data: unwrapRpc(result) }, 201);
  } catch (error) {
    return failure(error);
  }
}
