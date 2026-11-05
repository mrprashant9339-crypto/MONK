import { authorize, failure, getApiContext, success } from '@/lib/api';
import { mapWorkspaceData } from '@/lib/live-mappers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const context = await getApiContext();
    authorize(context, 'organization.profile.read');
    const { supabase, user, actor, memberId } = context;
    const [organization, companies, contacts, leads, projects, tasks, documents, activities] = await Promise.all([
      supabase.from('organizations').select('*').single(),
      supabase.from('companies').select('*').is('deleted_at', null).order('created_at', { ascending: false }),
      supabase.from('contacts').select('*').is('deleted_at', null).order('updated_at', { ascending: false }).limit(100),
      supabase.from('leads').select('*').is('deleted_at', null).order('updated_at', { ascending: false }).limit(100),
      supabase.from('projects').select('*').is('deleted_at', null).order('updated_at', { ascending: false }).limit(100),
      supabase.from('tasks').select('*').is('deleted_at', null).order('due_date', { ascending: true }).limit(200),
      supabase.from('files').select('*').is('deleted_at', null).order('updated_at', { ascending: false }).limit(100),
      supabase.from('activities').select('*').order('created_at', { ascending: false }).limit(30),
    ]);

    const firstError = [organization, companies, contacts, leads, projects, tasks, documents, activities]
      .find((result) => result.error)?.error;
    if (firstError) throw firstError;

    return success(mapWorkspaceData({
      organization: organization.data,
      role: actor.role,
      user: {
        id: user.id,
        name: user.user_metadata.full_name ?? user.email?.split('@')[0] ?? 'MONK user',
        email: user.email ?? '',
      },
      memberId,
      companies: companies.data ?? [],
      contacts: contacts.data ?? [],
      leads: leads.data ?? [],
      projects: projects.data ?? [],
      tasks: tasks.data ?? [],
      documents: documents.data ?? [],
      activities: activities.data ?? [],
    }));
  } catch (error) {
    return failure(error);
  }
}
