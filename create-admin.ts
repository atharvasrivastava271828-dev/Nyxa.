import { createAdminSupabaseClient } from './src/backend/lib/supabase-server';

async function createAdmin() {
  const supabase = createAdminSupabaseClient();
  const email = 'admin@theshortcutparty.com';
  const password = 'ShortcutParty2026!';
  
  console.log('Attempting to create special login credential...');
  
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (error) {
    console.error('Failed to create user:', error.message);
    process.exit(1);
  }

  const userId = data.user.id;
  console.log(`User created in auth.users with ID: ${userId}`);

  // Add to profiles
  const { error: profileError } = await supabase.from('profiles').insert({
    id: userId,
    name: 'Party Admin',
    roles: { is_buyer: true, is_provider: true }
  });

  if (profileError) {
    console.error('Failed to create profile:', profileError.message);
  } else {
    console.log('Profile created successfully with full provider/buyer roles.');
    console.log(`Credentials -> Email: ${email} | Password: ${password}`);
  }
}

createAdmin();
