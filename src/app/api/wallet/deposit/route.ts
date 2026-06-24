import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/backend/lib/supabase-server';
import { depositFunds } from '@/backend/services/wallet.service';
import { z } from 'zod';

const depositSchema = z.object({
  amount: z.number().positive(),
});

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const body = await req.json();
    const parsedData = depositSchema.parse(body);

    const result = await depositFunds(user.id, parsedData.amount);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    console.error('[Wallet Deposit API POST Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
