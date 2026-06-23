import { NextResponse } from 'next/server';
import { releaseEscrow } from '@/backend/services/payment.service';
import { getAuthenticatedUser } from '@/backend/lib/supabase-server';
import { supabase } from '@/backend/lib/supabase';
import { z } from 'zod';

const releaseEscrowSchema = z.object({
  orderId: z.string().uuid()
});

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { orderId } = releaseEscrowSchema.parse(body);

    // Verify the order belongs to this buyer
    const { data: order } = await supabase
      .from('orders')
      .select('payer_id, escrow_status')
      .eq('id', orderId)
      .single();

    if (!order || order.payer_id !== user.id) {
      return NextResponse.json({ error: 'Order not found or unauthorized' }, { status: 404 });
    }

    if (order.escrow_status === 'released') {
      return NextResponse.json({ error: 'Escrow already released' }, { status: 400 });
    }

    await releaseEscrow(orderId);

    return NextResponse.json({ success: true, message: 'Escrow released successfully' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    console.error('[Release Escrow API Error]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
