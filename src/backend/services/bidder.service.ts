import { createAdminSupabaseClient } from '@/backend/lib/supabase-server';

export interface CreateTaskRequestDTO {
  requester_id: string;
  title: string;
  description: string;
  request_type: 'free' | 'paid' | 'bounty';
  budget?: number;
  deadline?: string;
  inputs_required: Record<string, any>;
  outputs_delivered: Record<string, any>;
}

export interface SubmitBidDTO {
  request_id: string;
  provider_id: string;
  bid_amount: number;
  delivery_time: string;
}

/**
 * Creates a new custom task request on the TaskBidder board.
 */
export async function createTaskRequest(data: CreateTaskRequestDTO) {
  const supabase = createAdminSupabaseClient();
  
  const { data: request, error } = await supabase
    .from('task_requests')
    .insert({
      requester_id: data.requester_id,
      title: data.title,
      description: data.description,
      request_type: data.request_type,
      budget: data.budget || null,
      deadline: data.deadline || null,
      inputs_required: data.inputs_required,
      outputs_delivered: data.outputs_delivered,
      status: 'open'
    })
    .select()
    .single();

  if (error) {
    console.error('[BidderService] Failed to insert task request:', error);
    throw new Error('Failed to create task request.');
  }

  return request;
}

/**
 * Retrieves all open task requests.
 */
export async function getTaskRequests() {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from('task_requests')
    .select('*, profiles:requester_id(name)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[BidderService] Failed to fetch task requests:', error);
    throw new Error('Failed to fetch task requests.');
  }
  return data;
}

/**
 * Submits a provider bid for a task request.
 */
export async function submitTaskBid(data: SubmitBidDTO) {
  const supabase = createAdminSupabaseClient();

  // Check request status
  const { data: request, error: reqError } = await supabase
    .from('task_requests')
    .select('status, requester_id')
    .eq('id', data.request_id)
    .single();

  if (reqError || !request) {
    throw new Error('Task request not found.');
  }

  if (request.status !== 'open') {
    throw new Error('This request is no longer open for bids.');
  }

  if (request.requester_id === data.provider_id) {
    throw new Error('You cannot bid on your own request.');
  }

  const { data: bid, error } = await supabase
    .from('task_bids')
    .insert({
      request_id: data.request_id,
      provider_id: data.provider_id,
      bid_amount: data.bid_amount,
      delivery_time: data.delivery_time,
      status: 'pending'
    })
    .select()
    .single();

  if (error) {
    console.error('[BidderService] Failed to insert task bid:', error);
    throw new Error('Failed to submit bid.');
  }

  return bid;
}

/**
 * Fetches all bids on a specific request.
 */
export async function getBidsForRequest(requestId: string) {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from('task_bids')
    .select('*, profiles:provider_id(name)')
    .eq('request_id', requestId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[BidderService] Failed to fetch bids:', error);
    throw new Error('Failed to fetch bids.');
  }
  return data;
}

/**
 * Accepts a bid, transition request status to matched, and creates order lockup.
 */
export async function acceptBid(bidId: string, requesterId: string) {
  const supabase = createAdminSupabaseClient();

  // 1. Get the bid details
  const { data: bid, error: bidError } = await supabase
    .from('task_bids')
    .select('*, task_requests(*)')
    .eq('id', bidId)
    .single();

  if (bidError || !bid) {
    throw new Error('Bid not found.');
  }

  const request = bid.task_requests;
  if (!request) {
    throw new Error('Associated task request not found.');
  }

  if (request.requester_id !== requesterId) {
    throw new Error('Forbidden. You are not the owner of this request.');
  }

  if (request.status !== 'open') {
    throw new Error('This request is no longer open.');
  }

  // 2. Begin Transaction / Batch Updates
  // Accept this bid
  const { error: acceptError } = await supabase
    .from('task_bids')
    .update({ status: 'accepted' })
    .eq('id', bidId);

  if (acceptError) throw new Error('Failed to accept bid.');

  // Reject all other bids for this request
  await supabase
    .from('task_bids')
    .update({ status: 'rejected' })
    .eq('request_id', request.id)
    .neq('id', bidId);

  // Update request status to matched
  const { error: reqUpdateError } = await supabase
    .from('task_requests')
    .update({ status: 'matched' })
    .eq('id', request.id);

  if (reqUpdateError) throw new Error('Failed to update request status.');

  // 3. Create Order in Escrow (Held status)
  // If it's a paid or bounty request, the payer is the requester, payee is the provider.
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      payer_id: requesterId,
      payee_id: bid.provider_id,
      amount: bid.bid_amount,
      status: 'completed',
      escrow_status: 'held',
      razorpay_order_id: `bid_${bidId.slice(0,8)}`
    })
    .select()
    .single();

  if (orderError) {
    console.error('[BidderService] Failed to create escrow order:', orderError);
    throw new Error('Failed to create escrow contract for bid.');
  }

  return { bid, request, order };
}
