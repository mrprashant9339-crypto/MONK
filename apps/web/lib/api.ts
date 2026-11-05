import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { can, type Actor, type Permission, type Resource } from '@monk/policy';
import { ZodError, type ZodType } from 'zod';
import { createSupabaseServerClient } from './supabase/server';

export class ApiException extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

export type ApiContext = {
  supabase: SupabaseClient;
  user: User;
  actor: Actor;
  memberId: string;
};

export async function getApiContext(): Promise<ApiContext> {
  let supabase: SupabaseClient;
  try {
    supabase = await createSupabaseServerClient();
  } catch {
    throw new ApiException(503, 'database_not_configured', 'The database connection is not configured yet.');
  }

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new ApiException(401, 'unauthenticated', 'Sign in to continue.');

  const { data: organization, error: organizationError } = await supabase
    .from('organizations').select('id').maybeSingle();
  if (organizationError) throw new ApiException(500, 'organization_lookup_failed', 'Your workspace could not be loaded.');
  if (!organization) throw new ApiException(404, 'organization_not_found', 'Create or join a workspace to continue.');

  const { data: membership, error: membershipError } = await supabase
    .from('organization_members')
    .select('id, role, status')
    .eq('user_id', user.id)
    .eq('organization_id', organization.id)
    .maybeSingle();
  if (membershipError || !membership || membership.status !== 'active') {
    throw new ApiException(401, 'membership_inactive', 'Your workspace membership is not active.');
  }

  return {
    supabase,
    user,
    memberId: membership.id,
    actor: {
      userId: user.id,
      organizationId: organization.id,
      role: membership.role,
      status: membership.status,
    },
  };
}

export function authorize(
  context: ApiContext,
  permission: Permission,
  resource: Partial<Resource> = {},
) {
  const allowed = can(context.actor, permission, {
    organizationId: context.actor.organizationId,
    ownerId: context.actor.userId,
    ...resource,
  });
  if (!allowed) throw new ApiException(403, 'forbidden', 'You do not have permission to perform this action.');
}

export function success<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function failure(error: unknown, requestId = randomUUID()) {
  if (error instanceof ZodError) {
    return NextResponse.json({
      error: {
        code: 'validation_failed',
        message: 'Check the highlighted information and try again.',
        field_errors: error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })),
        request_id: requestId,
      },
    }, { status: 400 });
  }

  if (error instanceof ApiException) {
    return NextResponse.json({
      error: { code: error.code, message: error.message, field_errors: [], request_id: requestId },
    }, { status: error.status });
  }

  const databaseError = error as { code?: string; message?: string } | null;
  if (databaseError?.code === '23505') {
    return NextResponse.json({
      error: { code: 'duplicate', message: 'A record with these details already exists.', field_errors: [], request_id: requestId },
    }, { status: 409 });
  }
  if (databaseError?.code === '42501') {
    return NextResponse.json({
      error: { code: 'forbidden', message: 'You do not have permission to perform this action.', field_errors: [], request_id: requestId },
    }, { status: 403 });
  }
  if (databaseError?.code === 'P0002') {
    return NextResponse.json({
      error: { code: 'not_found', message: 'The requested record could not be found.', field_errors: [], request_id: requestId },
    }, { status: 404 });
  }

  console.error(JSON.stringify({ level: 'error', request_id: requestId, message: 'Request failed' }));
  return NextResponse.json({
    error: {
      code: 'internal_error',
      message: 'Something went wrong. Please try again or contact support with the request ID.',
      field_errors: [],
      request_id: requestId,
    },
  }, { status: 500 });
}

export async function parseJson<T>(request: Request, schema: ZodType<T>): Promise<T> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new ApiException(400, 'invalid_json', 'Send a valid JSON request body.');
  }
  return schema.parse(body);
}

export function unwrapRpc<T>(result: { data: T | null; error: unknown | null }): T {
  if (result.error) throw result.error;
  if (result.data === null) throw new ApiException(500, 'empty_mutation', 'The change did not return a record.');
  return result.data;
}
