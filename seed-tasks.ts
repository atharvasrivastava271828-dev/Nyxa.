import { createAdminSupabaseClient } from './src/backend/lib/supabase-server';
import { postTask } from './src/backend/services/task.service';

async function seedTasks() {
  console.log('Starting task seed process...');
  const supabase = createAdminSupabaseClient();
  
  // Try to find a user to act as the provider
  const { data: users, error: userError } = await supabase.from('users').select('id').limit(1);
  let providerId = '00000000-0000-0000-0000-000000000000';
  
  if (userError || !users || users.length === 0) {
    console.log('No user found in public.users, checking auth.users...');
    const { data: authUsers, error: authUserError } = await supabase.auth.admin.listUsers();
    if (authUsers?.users && authUsers.users.length > 0) {
      providerId = authUsers.users[0].id;
    } else {
      console.log('No users found in auth.users either. Task creation might fail if foreign keys are enforced.');
    }
  } else {
    providerId = users[0].id;
  }
  
  console.log(`Using provider_id: ${providerId}`);

  const mockTasks = [
    {
      provider_id: providerId,
      title: "Comprehensive Market Research Report",
      description: "A deep dive into your target market, analyzing top 5 competitors, market trends, and delivering a 20-page actionable PDF report.",
      price: 150,
      class: "Business",
      kind: "Market Research",
      dubs: ["}marketing", "}strategy", "}research"],
      inputs_required: { industry: "string", target_audience: "string" },
      outputs_delivered: { report_url: "string" },
      delivery_time: "48 hours",
      hosting_method: "native" as const,
      hosting_url: "https://nyxa.app/delivery"
    },
    {
      provider_id: providerId,
      title: "Interactive University-Level Quiz Generation",
      description: "Provide me a textbook chapter or PDF notes, and I will generate a 50-question interactive quiz covering all core concepts.",
      price: 25,
      class: "Education",
      kind: "Quiz Generation",
      dubs: ["}education", "}study", "}interactive"],
      inputs_required: { source_material: "file" },
      outputs_delivered: { quiz_link: "string" },
      delivery_time: "2 hours",
      hosting_method: "link" as const,
      hosting_url: "https://nyxa.app/delivery"
    },
    {
      provider_id: providerId,
      title: "SWOT Analysis for Tech Startups",
      description: "Quick, AI-powered SWOT analysis based on your pitch deck. Delivers a clean visual dashboard of Strengths, Weaknesses, Opportunities, and Threats.",
      price: 75,
      class: "Business",
      kind: "SWOT Analysis",
      dubs: ["}startup", "}analysis", "}strategy"],
      inputs_required: { pitch_deck: "file" },
      outputs_delivered: { swot_dashboard: "string" },
      delivery_time: "12 hours",
      hosting_method: "iframe" as const,
      hosting_url: "https://nyxa.app/delivery"
    }
  ];

  for (const task of mockTasks) {
    try {
      await postTask(task);
      console.log(`Created task: ${task.title}`);
    } catch (err: any) {
      console.error(`Failed to create task ${task.title}:`, err.message);
    }
  }
  
  console.log('Seeding complete.');
}

seedTasks();
