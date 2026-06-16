import { supabase } from '@/backend/lib/supabase';
import { extractGoal, extractCapabilities } from './ai.service';
import { matchTaskToAgents } from './matching.engine';

export interface CreateTaskDTO {
  posted_by_user_id: string;
  title: string;
  description: string;
  budget: number;
}

// Valid state transitions for the task state machine.
// Any transition not listed here is considered invalid and will throw.
//
// Flow: OPEN → MATCHED → IN_PROGRESS → SUBMITTED → COMPLETED
// Exit: any non-terminal state → CANCELLED | FAILED
const VALID_TRANSITIONS: Record<string, string[]> = {
  open:        ['matched', 'cancelled'],
  matched:     ['in_progress', 'cancelled'],
  in_progress: ['submitted', 'failed', 'cancelled'],
  submitted:   ['completed', 'in_progress'], // in_progress allows resubmission if buyer rejects
  completed:   [],  // terminal state
  cancelled:   [],  // terminal state
  failed:      [],  // terminal state
};

/**
 * Validates that a state transition is permitted by the task state machine.
 * Throws immediately if the transition is illegal (e.g., OPEN → COMPLETED).
 *
 * @param currentStatus The task's current status
 * @param nextStatus    The desired new status
 */
export function validateTransition(currentStatus: string, nextStatus: string): void {
  const allowed = VALID_TRANSITIONS[currentStatus];
  if (!allowed || !allowed.includes(nextStatus)) {
    throw new Error(
      `Invalid state transition: "${currentStatus.toUpperCase()}" → "${nextStatus.toUpperCase()}". ` +
      `Allowed from ${currentStatus}: [${(allowed ?? []).join(', ') || 'none (terminal state)'}]`
    );
  }
}

/**
 * Posts a new task, triggers AI goal extraction, and begins the matching process.
 *
 * @param data The user input defining the task
 * @returns The created task database record
 */
export async function postTask(data: CreateTaskDTO) {
  // 1. Extract Goal & Capabilities using AI Service
  const requirements = await extractGoal(data.description);
  const capabilityTags = await extractCapabilities(data.description);
  requirements.tags = capabilityTags;

  // 2. Insert the task at the 'open' state (the entry point of the state machine)
  const { data: task, error } = await supabase
    .from('tasks')
    .insert({
      posted_by_user_id: data.posted_by_user_id,
      title: data.title,
      description: data.description,
      requirements,
      budget: data.budget,
      status: 'open'
    })
    .select()
    .single();

  if (error) {
    console.error('[TaskService] Failed to insert task:', error);
    throw new Error('Failed to create task.');
  }

  // 3. Trigger Matching Engine
  // On success, the status should be transitioned to 'matched' (done inside matchTaskToAgents).
  // We swallow matching errors so the task is still visible as 'open' if matching fails.
  try {
    await matchTaskToAgents(task.id, capabilityTags);
  } catch (matchError) {
    console.error(`[TaskService] Background matching failed for task ${task.id}:`, matchError);
  }

  return task;
}

/**
 * Transitions a task to a new state, enforcing the state machine rules.
 *
 * @param taskId     The task to transition
 * @param nextStatus The desired new state
 */
export async function transitionTask(taskId: string, nextStatus: string) {
  // Fetch current status first to validate the transition
  const { data: current, error: fetchError } = await supabase
    .from('tasks')
    .select('status')
    .eq('id', taskId)
    .single();

  if (fetchError || !current) {
    throw new Error(`Task ${taskId} not found.`);
  }

  // Will throw if the transition is illegal — do not catch this upstream
  validateTransition(current.status, nextStatus);

  const { data, error } = await supabase
    .from('tasks')
    .update({ status: nextStatus })
    .eq('id', taskId)
    .select()
    .single();

  if (error) {
    console.error(`[TaskService] Failed to transition task ${taskId} to ${nextStatus}:`, error);
    throw new Error('Failed to update task status.');
  }

  return data;
}

/**
 * Assigns an agent to a task and advances the state to 'matched'.
 *
 * @param taskId  The task to assign
 * @param agentId The agent taking the job
 */
export async function assignTask(taskId: string, agentId: string) {
  // Fetch current status to validate the transition
  const { data: current, error: fetchError } = await supabase
    .from('tasks')
    .select('status')
    .eq('id', taskId)
    .single();

  if (fetchError || !current) throw new Error(`Task ${taskId} not found.`);

  validateTransition(current.status, 'matched');

  const { data, error } = await supabase
    .from('tasks')
    .update({
      assigned_to_agent_id: agentId,
      status: 'matched'
    })
    .eq('id', taskId)
    .select()
    .single();

  if (error) {
    console.error(`[TaskService] Failed to assign task ${taskId} to agent ${agentId}:`, error);
    throw new Error('Failed to assign task.');
  }

  return data;
}

export async function getTasks() {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error('Failed to fetch tasks.');
  return data;
}

export async function getTaskById(id: string) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error('Failed to fetch task.');
  return data;
}
