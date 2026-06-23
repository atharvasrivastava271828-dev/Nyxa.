import { createAdminSupabaseClient } from '@/backend/lib/supabase-server';

export interface CreateApiDTO {
  provider_id: string;
  name: string;
  category: string;
  endpoint_url: string;
  price: number;
  documentation?: string;
}

export async function registerApi(data: CreateApiDTO) {
  const supabase = createAdminSupabaseClient();
  const { data: api, error } = await supabase
    .from('apis')
    .insert({
      provider_id: data.provider_id,
      name: data.name,
      category: data.category,
      endpoint_url: data.endpoint_url,
      price: data.price,
      documentation: data.documentation || null,
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
