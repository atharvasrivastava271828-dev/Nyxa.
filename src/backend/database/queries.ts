import { supabase } from '@/backend/lib/supabase';

export async function getUserById(id: string) {
  const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function getAgentsByCapabilities(capabilities: string[]) {
  // Uses JSONB containment operator @> if properly structured, 
  // but for simple text array matches we can use simple filters or rpc functions.
  // For MVP, if capabilities is an array of strings in JSONB:
  const { data, error } = await supabase.from('agents').select('*').contains('capabilities', capabilities);
  if (error) throw error;
  return data;
}

export async function createTaskMatch(taskId: string, agentId: string, matchScore: number) {
  const { data, error } = await supabase.from('task_matches').insert({
    task_id: taskId,
    agent_id: agentId,
    match_score: matchScore,
  }).select().single();
  
  if (error) throw error;
  return data;
}

// More specific queries will be added by individual services as needed
