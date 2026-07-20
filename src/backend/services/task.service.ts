import { createAdminSupabaseClient } from '@/backend/lib/supabase-server';

export interface CreateTaskDTO {
  provider_id: string;
  title: string;
  description: string;
  price: number;
  class: string;
  kind: string;
  dubs: string[];
  inputs_required: Record<string, any>;
  outputs_delivered: Record<string, any>;
  delivery_time: string;
  hosting_method: 'link' | 'iframe' | 'native';
  hosting_url: string;
}

/**
 * Publishes a new standardized task to the catalog.
 *
 * @param data The provider input defining the task template
 * @returns The created task database record
 */
export async function postTask(data: CreateTaskDTO) {
  const supabase = createAdminSupabaseClient();
  
  const { data: task, error } = await supabase
    .from('tasks')
    .insert({
      provider_id: data.provider_id,
      title: data.title,
      description: data.description,
      price: data.price,
      class: data.class,
      kind: data.kind,
      dubs: data.dubs,
      inputs_required: data.inputs_required,
      outputs_delivered: data.outputs_delivered,
      delivery_time: data.delivery_time,
      hosting_method: data.hosting_method,
      hosting_url: data.hosting_url,
      status: 'active'
    })
    .select()
    .single();

  if (error) {
    console.error('[TaskService] Failed to insert task:', error);
    throw new Error('Failed to create task catalog entry.');
  }

  return task;
}

export async function getTasks() {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) throw new Error('Failed to fetch tasks.');
  return data;
}

export async function getTaskById(id: string) {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error('Failed to fetch task.');
  return data;
}
