import { supabase } from '@/backend/lib/supabase';
import { razorpay } from '@/backend/lib/razorpay';
import crypto from 'crypto';

export interface CreateTransactionDTO {
  taskId?: string;
  apiId?: string;
  buyerUserId: string;
  sellerUserId: string;
  sellerAgentId?: string;
  amount: number; // This is the BASE task amount (what the seller will receive)
}

/**
 * Creates a Razorpay order and a pending transaction record in the database.
 *
 * PAYMENT FLOW:
 *   Buyer Pays    = Task Amount + Platform Fee (10%)
 *   Seller Gets   = Task Amount  (full, untouched)
 *   Nyxa Keeps    = Platform Fee (10%)
 *
 * We do NOT deduct the commission from the seller's earnings.
 * The platform fee is an additional charge on top of what the seller listed.
 *
 * @param data Details of the transaction
 */
export async function createOrder(data: CreateTransactionDTO) {
  // Platform fee is charged ON TOP of the task amount.
  // The seller's amount is always preserved exactly as listed.
  const platformFee = parseFloat((data.amount * 0.10).toFixed(2));
  const buyerTotal = parseFloat((data.amount + platformFee).toFixed(2));

  // Razorpay expects amounts in the smallest currency unit (paisa for INR, cents for USD).
  // We use Math.round to handle floating-point precision before converting.
  const options = {
    amount: Math.round(buyerTotal * 100),
    currency: 'INR', // Change to USD or your target currency as needed
    receipt: `rcpt_${Date.now()}_${data.buyerUserId.slice(0, 8)}`
  };

  const order = await razorpay.orders.create(options);

  // Store the transaction with explicit separation of:
  //   amount       = what the seller will receive
  //   commission   = what Nyxa keeps (the platform fee)
  // The total charged to the buyer = amount + commission
  const { data: transaction, error } = await supabase
    .from('transactions')
    .insert({
      task_id: data.taskId,
      api_id: data.apiId,
      buyer_user_id: data.buyerUserId,
      seller_user_id: data.sellerUserId,
      seller_agent_id: data.sellerAgentId,
      amount: data.amount,       // Seller receives this
      commission: platformFee,   // Nyxa receives this
      escrow_status: 'held',
      status: 'pending',
      razorpay_order_id: order.id
    })
    .select()
    .single();

  if (error) {
    console.error('[PaymentService] Error creating transaction record:', error);
    throw new Error('Failed to create transaction record.');
  }

  return { transaction, order };
}

/**
 * Verifies a Razorpay payment using HMAC SHA256 cryptographic signature.
 *
 * SECURITY: This prevents payment spoofing. Without this verification,
 * anyone could hit this endpoint with a fake payment ID and unlock a task.
 * The signature is a hash of orderId|paymentId using the Razorpay secret key.
 *
 * @param razorpayOrderId   The order ID generated during creation
 * @param razorpayPaymentId The payment ID returned by Razorpay checkout
 * @param razorpaySignature The HMAC signature from Razorpay's callback
 */
export async function verifyPaymentAndHold(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    throw new Error('Server configuration error: Missing Razorpay secret.');
  }

  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  if (generatedSignature !== razorpaySignature) {
    console.error(`[PaymentService] Invalid signature attempt. Order: ${razorpayOrderId}`);
    throw new Error('Payment verification failed: Invalid signature.');
  }

  // Payment is verified — mark the transaction as completed.
  // Escrow remains 'held' until buyer explicitly approves task via review.
  const { data, error } = await supabase
    .from('transactions')
    .update({
      status: 'completed',
      razorpay_payment_id: razorpayPaymentId
    })
    .eq('razorpay_order_id', razorpayOrderId)
    .select()
    .single();

  if (error) {
    console.error('[PaymentService] Error updating transaction after verification:', error);
    throw new Error('Failed to update transaction status.');
  }

  return data;
}

/**
 * Releases the seller's funds from escrow after the buyer approves the work.
 *
 * This is the final step in the payment flow:
 *   Buyer approves → Review submitted → releaseEscrow() called → Seller gets paid
 *
 * @param transactionId The DB transaction ID to release
 */
export async function releaseEscrow(transactionId: string) {
  const { data, error } = await supabase
    .from('transactions')
    .update({ escrow_status: 'released' })
    .eq('id', transactionId)
    .select()
    .single();

  if (error) {
    console.error('[PaymentService] Error releasing escrow:', error);
    throw new Error('Failed to release escrow.');
  }

  // TODO (Production):
  // Initiate a Razorpay Payout or Route Transfer for `data.amount` (seller's share)
  // to the seller's registered bank account or UPI ID.
  // The `data.commission` amount stays in the Nyxa platform account.

  return data;
}
