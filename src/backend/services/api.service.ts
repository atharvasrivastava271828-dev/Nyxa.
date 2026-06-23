import { createAdminSupabaseClient } from '@/backend/lib/supabase-server';

export interface CreateApiDTO {
  owner_id: string;
  name: string;
  description: string;
  endpoint_url: string;
  pricing: number;
}

export async function registerApi(data: CreateApiDTO) {
  const supabase = createAdminSupabaseClient();
  const { data: api, error } = await supabase
    .from('apis')
    .insert({
      owner_id: data.owner_id,
      name: data.name,
      description: data.description,
      endpoint_url: data.endpoint_url,
      pricing: data.pricing,
      status: 'active'
    })
    .select()
    .single();

  if (error) {
    console.error('[ApiService] Failed to register api:', error);
    throw new Error('Failed to register api.');
  }
  
  return api;
}

export async function getApis() {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from('apis')
    .select('*')
    .eq('status', 'active');
    
  if (error) throw new Error('Failed to fetch apis.');
  return data;
}
