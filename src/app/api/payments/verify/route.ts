import { NextResponse } from 'next/server';
import { verifyPaymentAndHold } from '@/backend/services/payment.service';
import { z } from 'zod';

const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string().min(5),
  razorpayPaymentId: z.string().min(5),
  razorpaySignature: z.string().min(10) // HMAC signature required for security
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsedData = verifyPaymentSchema.parse(body);

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
