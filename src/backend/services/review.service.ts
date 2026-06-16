import { supabase } from '@/backend/lib/supabase';
import { releaseEscrow } from './payment.service';
import { transitionTask } from './task.service';

export interface CreateReviewDTO {
  taskId: string;
  reviewerUserId: string;
  revieweeAgentId: string;
  rating: number; // 1 to 5
  comment?: string;
  transactionId?: string;
}

/**
 * Submits a buyer review for an agent, updates reputation, increments completed jobs,
 * transitions the task to COMPLETED, and releases escrow.
 *
 * This is the terminal step of the core flow:
 *   Register → Discover → Match → Execute → Pay → Review ← YOU ARE HERE
 *
 * @param data Review details from the buyer
 */
export async function submitReview(data: CreateReviewDTO) {
  // 1. Insert the review record
  const { data: review, error: reviewError } = await supabase
    .from('reviews')
    .insert({
      task_id: data.taskId,
      reviewer_user_id: data.reviewerUserId,
      reviewee_agent_id: data.revieweeAgentId,
      rating: data.rating,
      comment: data.comment
    })
    .select()
    .single();

  if (reviewError) {
    console.error('[ReviewService] Failed to insert review:', reviewError);
    throw new Error('Failed to submit review.');
  }

  // 2. Update agent reputation score and increment completed_jobs counter
  //
  // ROLLING AVERAGE FORMULA:
  //   New Score = ((Current Score × Total Reviews) + New Rating) / (Total Reviews + 1)
  //
  // This gives proportional weight to every past review, so a single bad rating
  // doesn't destroy an agent with 100 five-star reviews.
  //
  // RACE CONDITION WARNING:
  // The read-modify-write below is safe for MVP traffic levels.
  // For production, replace with a PostgreSQL RPC for atomic operations:
  //
  //   CREATE OR REPLACE FUNCTION update_agent_score(p_agent_id UUID, p_rating INT) RETURNS void AS $$
  //   BEGIN
  //     UPDATE agents
  //     SET score = ((score * total_transactions) + p_rating) / (total_transactions + 1),
  //         total_transactions = total_transactions + 1
  //     WHERE id = p_agent_id;
  //   END;
  //   $$ LANGUAGE plpgsql;
  
  const { data: agent, error: fetchError } = await supabase
    .from('agents')
    .select('score, total_transactions')
    .eq('id', data.revieweeAgentId)
    .single();

  if (fetchError || !agent) {
    console.error(`[ReviewService] Could not fetch agent ${data.revieweeAgentId} for score update.`);
    // Non-fatal: review was saved, scoring update missed. Log and continue.
  } else {
    const newTotal = agent.total_transactions + 1;
    const newScore = ((agent.score * agent.total_transactions) + data.rating) / newTotal;

    const { error: updateError } = await supabase
      .from('agents')
      .update({
        score: newScore,
        // total_transactions = completed_jobs counter, incremented here after every successful review
        total_transactions: newTotal
      })
      .eq('id', data.revieweeAgentId);

    if (updateError) {
      console.error(`[ReviewService] Failed to update score for agent ${data.revieweeAgentId}:`, updateError);
    }
  }

  // 3. Transition task to COMPLETED via the state machine
  // This prevents the task from being acted upon again after a review is submitted.
  try {
    await transitionTask(data.taskId, 'completed');
  } catch (stateError) {
    // If the transition fails (e.g., task is already completed), log but don't block escrow release
    console.error(`[ReviewService] Failed to mark task ${data.taskId} as completed:`, stateError);
  }

  // 4. Release escrow to the seller
  // Only triggered if the buyer explicitly passed a transactionId during review,
  // which confirms intent to approve and release payment.
  if (data.transactionId) {
    try {
      await releaseEscrow(data.transactionId);
    } catch (escrowError) {
      console.error(`[ReviewService] CRITICAL: Escrow release failed for tx ${data.transactionId}:`, escrowError);
      // Flag for manual ops review — funds are held safely, not lost.
    }
  }

  return review;
}

/**
 * Fetches all reviews for a specific agent, newest first.
 *
 * @param agentId The UUID of the agent
 */
export async function getAgentReviews(agentId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('reviewee_agent_id', agentId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`[ReviewService] Failed to fetch reviews for agent ${agentId}:`, error);
    throw new Error('Failed to fetch reviews.');
  }

  return data;
}
