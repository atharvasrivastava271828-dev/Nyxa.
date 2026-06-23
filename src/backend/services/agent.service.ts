import { createAdminSupabaseClient } from '@/backend/lib/supabase-server';

export interface CreateAgentDTO {
  owner_id: string;
  name: string;
  description: string;
  capabilities: string[];
  price: number;
}

export async function registerAgent(data: CreateAgentDTO) {
  const supabase = createAdminSupabaseClient();
  const { data: agent, error } = await supabase
    .from('agents')
    .insert({
      owner_id: data.owner_id,
      name: data.name,
      description: data.description,
      capabilities: data.capabilities,
      price: data.price,
      status: 'active'
    })
    .select()
    .single();

  if (error) {
    console.error('[AgentService] Failed to register agent:', error);
    throw new Error('Failed to register agent.');
  }
  
  return agent;
}

export async function getAgents() {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('status', 'active')
    .order('score', { ascending: false });
    
  if (error) throw new Error('Failed to fetch agents.');
  return data;
}
