import { NextResponse } from 'next/server';
import { getAuthenticatedUser, createAdminSupabaseClient } from '@/backend/lib/supabase-server';
import { purchaseWithWallet } from '@/backend/services/wallet.service';
import { z } from 'zod';

const purchaseSchema = z.object({
  targetApiId: z.string().uuid().optional(),
  targetTaskId: z.string().uuid().optional(),
  targetAgentId: z.string().uuid().optional(),
  amount: z.number().positive(),
}).refine(data => {
  const count = [data.targetApiId, data.targetTaskId, data.targetAgentId].filter(Boolean).length;
  return count === 1;
}, {
  message: "Exactly one of targetApiId, targetTaskId, or targetAgentId must be provided.",
  path: ["targetApiId", "targetTaskId", "targetAgentId"]
});

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const body = await req.json();
    const parsedData = purchaseSchema.parse(body);

    const result = await purchaseWithWallet(user.id, parsedData);

    // Try to record in supabase orders table (best effort)
    try {
      const supabaseAdmin = createAdminSupabaseClient();
      await supabaseAdmin.from('orders').insert({
        task_id: parsedData.targetTaskId || null,
        api_id: parsedData.targetApiId || null,
        agent_id: parsedData.targetAgentId || null,
        payer_id: user.id,
        amount: parsedData.amount,
        status: 'completed',
        escrow_status: 'released',
        razorpay_order_id: `wallet_${result.transaction.id}`
      });
    } catch (dbErr) {
      console.warn('[Wallet Purchase API] Error writing order to Supabase:', dbErr);
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    console.error('[Wallet Purchase API POST Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
