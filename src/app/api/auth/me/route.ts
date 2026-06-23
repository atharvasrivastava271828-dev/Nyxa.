import { NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/backend/lib/supabase-server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('sb-access-token')?.value;

  if (!token) {
    return NextResponse.json({ user: null });
  }

  const supabase = createAdminSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return NextResponse.json({ user: null });
  }

  // Fetch profile to get name and roles
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, roles')
    .eq('id', user.id)
    .single();

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: profile?.name || 'User',
      roles: profile?.roles || []
    }
  });
}
