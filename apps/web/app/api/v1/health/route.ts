import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    // An anonymous, RLS-limited HEAD query checks network + PostgREST without
    // exposing rows or requiring a user session.
    const { error } = await supabase.from('roles').select('id', { head: true, count: 'exact' });
    return NextResponse.json({
      status: error ? 'degraded' : 'ok',
      service: 'monk-web',
      database: error ? 'unavailable' : 'reachable',
      timestamp: new Date().toISOString(),
    }, { status: error ? 503 : 200 });
  } catch {
    return NextResponse.json({
      status: 'degraded',
      service: 'monk-web',
      database: 'unavailable',
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }
}
