import { createAdminSupabaseClient } from '@/backend/lib/supabase-server';

export interface CreateTaskDTO {
  provider_id: string;
  title: string;
  description: string;
  price: number;
}

/**
 * Publishes a new predefined task (gig) to the catalog.
 *
 * @param data The seller input defining the predefined task
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
