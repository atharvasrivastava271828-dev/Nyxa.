import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/backend/lib/supabase-server';
import { getWallet } from '@/backend/services/wallet.service';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const wallet = await getWallet(user.id);
    return NextResponse.json(wallet, { status: 200 });
  } catch (error: any) {
    console.error('[Wallet API GET Error]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
