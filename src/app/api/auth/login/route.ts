import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/backend/lib/supabase-server';
import { z } from 'zod';
import { cookies } from 'next/headers';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    const supabase = await createServerSupabaseClient();

    let authData;
    let authError;

    // MAGIC ADMIN INTERCEPT: Create special credentials on the fly if they don't exist
    if (email === 'admin@theshortcutparty.com' && password === 'Shortcut2026!') {
      const { data: signData, error: signErr } = await supabase.auth.signInWithPassword({ email, password });
      
      if (signErr) {
        // Assume user doesn't exist yet. Create them using the admin client.
        const { createAdminSupabaseClient } = await import('@/backend/lib/supabase-server');
        const adminClient = createAdminSupabaseClient();
        
        const { data: newAuth, error: createErr } = await adminClient.auth.admin.createUser({
          email,
          password,
          email_confirm: true
        });

        if (!createErr && newAuth.user) {
          await adminClient.from('profiles').insert({
            id: newAuth.user.id,
            name: 'The Shortcut Admin',
            roles: { is_buyer: true, is_provider: true }
          });
          // Now sign them in properly
          const { data: freshSignData } = await supabase.auth.signInWithPassword({ email, password });
          authData = freshSignData;
        } else {
          throw createErr || new Error('Failed to create special credentials');
        }
      } else {
        authData = signData;
      }
    } else {
      // Standard Login Flow
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      authData = data;
      authError = error;
    }

    if (authError) throw authError;

    // Set Auth Cookies
    const session = authData.session;
    if (session) {
      const cookieStore = await cookies();
      cookieStore.set('sb-access-token', session.access_token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: session.expires_in,
      });
      cookieStore.set('sb-refresh-token', session.refresh_token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    // Now that the session is created, the supabase client would need the token to bypass RLS,
    // but the client we created above doesn't have the new token because it was instantiated before login!
    // We must instantiate a new client with the fresh token to read the profile safely, OR let it read as public
    // since profiles read is public for authenticated users, we can just use the auth token directly.
    const supabaseAuthenticated = await createServerSupabaseClient();
    supabaseAuthenticated.auth.setSession({ access_token: session.access_token, refresh_token: session.refresh_token });
    
    const { data: profile } = await supabaseAuthenticated
      .from('profiles')
      .select('name, roles')
      .eq('id', authData.user.id)
      .single();

    return NextResponse.json({
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: profile?.name || 'User',
        roles: profile?.roles || []
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
