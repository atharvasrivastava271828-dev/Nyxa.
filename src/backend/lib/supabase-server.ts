import { createClient } from '@supabase/supabase-js';
import { cookies, headers } from 'next/headers';

// Client for Server Components and Route Handlers using the current user's cookie or auth header
export const createServerSupabaseClient = async () => {
  let token: string | undefined;

  // 1. Try to read from cookies
  try {
    const cookieStore = await cookies();
    token = cookieStore.get('sb-access-token')?.value;
  } catch (_err) {
    // cookies() might throw if not called from a request context
  }

  // 2. Fallback: Try to read from Authorization header (for SDK calls)
  if (!token) {
    try {
      const headersStore = await headers();
      const authHeader = headersStore.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    } catch (_err) {
      // headers() might throw outside request context
    }
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false, // Handle persistence manually
      },
      global: {
        headers: token ? {
          Authorization: `Bearer ${token}`
        } : undefined
      }
    }
  );
};

// Helper to securely fetch the authenticated user session
export const getAuthenticatedUser = async () => {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return null;
    }
    return user;
  } catch (_err) {
    return null;
  }
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
