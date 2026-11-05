import { documentReviewSchema } from '@monk/contracts';
import { authorize, failure, getApiContext, parseJson, success, unwrapRpc } from '@/lib/api';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const context = await getApiContext();
    const { id } = await params;
    const input = await parseJson(request, documentReviewSchema);
    authorize(context, 'documents.document.approve');
    const result = await context.supabase.rpc('review_document', {
      file_id: id,
      next_status: input.status,
      review_note: input.note,
    });
    return success({ data: unwrapRpc(result) });
  } catch (error) {
    return failure(error);
  }
}
