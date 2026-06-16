import { supabase } from '@/backend/lib/supabase';
import { createTaskMatch } from '@/backend/database/queries';

/**
 * Executes the core matching logic to find capable agents for a task.
 * Saves the matches into the `task_matches` table.
 *
 * @param taskId The ID of the task requiring an agent
 * @param requiredCapabilities An array of capability tags (e.g., ['research', 'web_search'])
 */
export async function matchTaskToAgents(taskId: string, requiredCapabilities: string[]) {
  // PERFORMANCE & SCALABILITY NOTE:
  // We filter using the DB JSONB @> operator, which requires a GIN index to be fast at scale.
  // Run: CREATE INDEX idx_agents_capabilities ON agents USING GIN (capabilities);
  //
  // We select total_transactions here because the ranking formula now uses it
  // as a proxy for "experience" — more completed jobs = higher baseline trust.

  let query = supabase
    .from('agents')
    .select('id, score, price_demand, total_transactions');

  if (requiredCapabilities.length > 0) {
    query = query.contains('capabilities', requiredCapabilities);
  }

  const { data: agents, error } = await query;

  if (error) {
    console.error(`[MatchingEngine] Failed to query agents for task ${taskId}:`, error);
    throw new Error('Database error during matching phase.');
  }

  if (!agents || agents.length === 0) {
    return [];
  }

  // RANKING FORMULA (MVP + Future Upgrade Active):
  //
  //   Match Score = 50
  //               + (Agent Rating    × 10)   ← Reputation weight
  //               + (Completed Jobs  × 0.2)  ← Experience weight
  //               - (Agent Price     × 0.1)  ← Price penalty (slight)
  //
  // Rationale:
  // - Base score of 50 prevents negative scores for new agents.
  // - Reputation (score) is the dominant factor — trust matters most.
  // - Completed jobs rewards experienced agents over new registrants at the same rating.
  // - Price penalty is intentionally small so quality isn't sacrificed for cost.
  //
  // PERFORMANCE WARNING:
  // This ranking runs in Node.js memory for MVP. At scale, push this math into
  // a single PostgreSQL query with ORDER BY to avoid pulling all rows into Node:
  //
  // INSERT INTO task_matches (task_id, agent_id, match_score)
  // SELECT $1, id,
  //   50 + (score * 10) + (total_transactions * 0.2) - (price_demand * 0.1)
  // FROM agents
  // WHERE capabilities @> $2
  // ORDER BY 4 DESC;

  const matches = [];

  for (const agent of agents) {
    const matchScore =
      50
      + (agent.score * 10)
      + ((agent.total_transactions ?? 0) * 0.2)
      - ((agent.price_demand ? parseFloat(agent.price_demand) : 0) * 0.1);

    try {
      const match = await createTaskMatch(taskId, agent.id, matchScore);
      matches.push(match);
    } catch (insertError) {
      // If one match fails to insert, log but don't abort the entire operation
      console.error(`[MatchingEngine] Failed to save match for agent ${agent.id}:`, insertError);
    }
  }

  // Sort descending so the best match is index 0
  matches.sort((a, b) => b.match_score - a.match_score);

  return matches;
}

/**
 * Fetches the pre-calculated matches for a specific task.
 *
 * @param taskId The ID of the task
 */
export async function getMatchesForTask(taskId: string) {
  const { data, error } = await supabase
    .from('task_matches')
    .select(`
      id,
      match_score,
      agents (
        id,
        name,
        price_demand,
        score,
        total_transactions
      )
    `)
    .eq('task_id', taskId)
    .order('match_score', { ascending: false });

  if (error) {
    console.error(`[MatchingEngine] Failed to fetch matches for task ${taskId}:`, error);
    throw new Error('Failed to retrieve task matches.');
  }

  return data;
}
