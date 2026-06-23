import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Client for Server Components and Route Handlers using the current user's cookie
export const createServerSupabaseClient = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('sb-access-token')?.value;
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false, // Handle persistence manually via cookies
      },
      global: {
        headers: token ? {
          Authorization: `Bearer ${token}`
        } : undefined
      }
    }
  );
};

// Client for admin/backend tasks bypassing RLS
export const createAdminSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false
      }
    }
  );
};
