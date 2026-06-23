import { NextResponse } from 'next/server';
import { verifyPaymentAndHold } from '@/backend/services/payment.service';
import { getAuthenticatedUser, createAdminSupabaseClient } from '@/backend/lib/supabase-server';
import { z } from 'zod';

const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string().min(5),
  razorpayPaymentId: z.string().min(5),
  razorpaySignature: z.string().min(10) // HMAC signature required for security
});

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const body = await req.json();
    const parsedData = verifyPaymentSchema.parse(body);

    // Verify order ownership
    const supabase = createAdminSupabaseClient();
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('payer_id')
      .eq('razorpay_order_id', parsedData.razorpayOrderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    if (order.payer_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden. You are not authorized to verify this payment.' },
        { status: 403 }
      );
    }

    // This handles cryptographic verification to ensure the payment is authentic
    const transaction = await verifyPaymentAndHold(
      parsedData.razorpayOrderId, 
      parsedData.razorpayPaymentId,
      parsedData.razorpaySignature
    );
    
    return NextResponse.json({ transaction }, { status: 200 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    // We pass the error message here (e.g., "Invalid signature") because the 
    // client needs to know if verification explicitly failed versus a server crash.
    console.error('[VerifyPayment API POST Error]:', error);
    return NextResponse.json({ error: error.message || 'Payment Verification Failed' }, { status: 400 });
  }
}
