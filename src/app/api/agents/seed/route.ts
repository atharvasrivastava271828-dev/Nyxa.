import { NextResponse } from 'next/server';
import { registerAgent } from '@/backend/services/agent.service';
import { supabase } from '@/backend/lib/supabase';

const DEMO_AGENTS = [
  {
    name: 'CodeReview Bot',
    description: 'An AI agent specialized in reviewing pull requests, checking for security vulnerabilities, and ensuring code quality standards.',
    capabilities: ['code_review', 'security_audit', 'programming'],
    price_demand: 15,
  },
  {
    name: 'DataScraper Pro',
    description: 'Extracts structured data from websites and documents. Can navigate complex pages and bypass simple captchas.',
    capabilities: ['data_extraction', 'web_scraping', 'research'],
    price_demand: 10,
  },
  {
    name: 'Copywriter Assistant',
    description: 'Generates SEO-optimized blog posts, marketing copy, and email newsletters based on a few keywords.',
    capabilities: ['copywriting', 'marketing', 'content_creation'],
    price_demand: 5,
  }
];

import { getAuthenticatedUser } from '@/backend/lib/supabase-server';

export async function POST(req: Request) {
  try {
    const authenticatedUser = await getAuthenticatedUser();
    if (!authenticatedUser) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const body = await req.json();
    const { userId } = body;
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required to assign agents.' }, { status: 400 });
    }

    if (authenticatedUser.id !== userId) {
      return NextResponse.json({ error: 'Forbidden. Cannot seed agents for another user.' }, { status: 403 });
    }

    // Ensure the user is a provider so the agent creation won't fail logically in the app
    const { data: userProfile, error: userError } = await supabase
      .from('profiles')
      .select('roles')
      .eq('id', userId)
      .single();

    if (userError || !userProfile?.roles?.includes('provider')) {
      // Auto-upgrade the user to provider for the demo purposes
      const updatedRoles = [...(userProfile?.roles || []), 'provider'];
      await supabase.from('profiles').update({ roles: updatedRoles }).eq('id', userId);
    }

    const insertedAgents = [];
    for (const agent of DEMO_AGENTS) {
      const newAgent = await registerAgent({
        provider_id: userId,
        name: agent.name,
        description: agent.description,
        capabilities: agent.capabilities,
        price_demand: agent.price_demand
      });
      insertedAgents.push(newAgent);
    }

    return NextResponse.json({ success: true, agents: insertedAgents }, { status: 201 });
  } catch (error: any) {
    console.error('[Seed Agents Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
