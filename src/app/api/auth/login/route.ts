import { NextResponse } from 'next/server';
import { supabase } from '@/backend/lib/supabase';
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

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

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

    const { data: profile } = await supabase
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
