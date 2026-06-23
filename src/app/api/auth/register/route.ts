import { NextResponse } from 'next/server';
import { supabase } from '@/backend/lib/supabase';
import { z } from 'zod';
import { cookies } from 'next/headers';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string(),
  is_buyer: z.boolean().optional(),
  is_provider: z.boolean().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, fullName, is_buyer, is_provider } = registerSchema.parse(body);

    // 1. Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    // 2. Insert into profiles table
    // Convert boolean flags to array of roles
    const roles: string[] = [];
    if (is_buyer) roles.push('buyer');
    if (is_provider) roles.push('provider');
    if (roles.length === 0) roles.push('buyer'); // Default role

    const { error: dbError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user?.id,
        name: fullName,
        roles: roles,
      });

    if (dbError) throw dbError;

    // 3. Set Auth Cookies
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

    return NextResponse.json({ user: authData.user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
