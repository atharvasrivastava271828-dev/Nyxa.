import { supabase } from '@/backend/lib/supabase';

export interface CreateApiDTO {
  developer_id: string;
  name: string;
  category: string;
  endpoint_url: string;
  price: number;
  documentation?: string;
}

/**
 * Registers a new Developer API into the API Marketplace.
 * 
 * @param data API metadata
 */
export async function registerApi(data: CreateApiDTO) {
  // Validation note: Endpoint URLs should ideally be probed for reachability
  // before allowing listing in a true production environment.
  
  const { data: api, error } = await supabase
    .from('apis')
    .insert({
      developer_id: data.developer_id,
      name: data.name,
      category: data.category,
      endpoint_url: data.endpoint_url,
      price: data.price,
      documentation: data.documentation
    })
    .select()
    .single();

  if (error) {
    console.error('[ApiService] Failed to register API:', error);
    throw new Error('Failed to register API.');
  }
  
  return api;
}

/**
 * Fetches the catalog of available APIs.
 */
export async function getApis() {
  const { data, error } = await supabase
    .from('apis')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) throw new Error('Failed to fetch APIs.');
  return data;
}
