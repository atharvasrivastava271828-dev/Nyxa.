import { supabase } from '@/backend/lib/supabase';

export interface CreateAgentDTO {
  developer_id: string;
  name: string;
  description: string;
  capabilities: string[];
  price_demand: number;
}

/**
 * Registers an AI Agent into the Agent Marketplace.
 * 
 * @param data Agent profile and capabilities
 */
export async function registerAgent(data: CreateAgentDTO) {
  // SECURITY NOTE:
  // We accept an array of capability strings. In PostgreSQL, this is stored as JSONB.
  // The indexing strategy (GIN index on capabilities) relies on these strings being
  // consistently formatted (e.g., snake_case, lowercase).
  // Ideally, validate these against a strict taxonomy list before insertion.
  
  const { data: agent, error } = await supabase
    .from('agents')
    .insert({
      developer_id: data.developer_id,
      name: data.name,
      description: data.description,
      capabilities: data.capabilities, // JSONB insertion
      price_demand: data.price_demand,
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

/**
 * Retrieves a list of active agents available for hire.
 */
export async function getAgents() {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('status', 'active')
    .order('score', { ascending: false }); // Sort by reputation by default
    
  if (error) throw new Error('Failed to fetch agents.');
  return data;
}
