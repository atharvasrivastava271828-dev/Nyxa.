import { NextResponse } from 'next/server';
import { supabase } from '@/backend/lib/supabase';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string()
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, full_name } = registerSchema.parse(body);

    // 1. Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    // 2. Insert into custom public.users table
    // Normally done via Supabase triggers, but for MVP doing it directly
    const { data: user, error: dbError } = await supabase
      .from('users')
      .insert({
        id: authData.user?.id, // Ensure UUID matches auth.users if possible
        email,
        full_name,
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
