import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/backend/lib/supabase-server';
import { submitTaskBid, getBidsForRequest, acceptBid } from '@/backend/services/bidder.service';
import { z } from 'zod';

const submitBidSchema = z.object({
  request_id: z.string().uuid(),
  provider_id: z.string().uuid(),
  bid_amount: z.number().nonnegative(),
  delivery_time: z.string().min(2)
});

const acceptBidSchema = z.object({
  bidId: z.string().uuid()
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get('requestId');

    if (!requestId) {
      return NextResponse.json({ error: 'requestId parameter is required' }, { status: 400 });
    }

    const bids = await getBidsForRequest(requestId);
    return NextResponse.json({ bids }, { status: 200 });
  } catch (error: any) {
    console.error('[Task Bids API GET Error]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const body = await req.json();
    const parsedData = submitBidSchema.parse(body);

    if (user.id !== parsedData.provider_id) {
      return NextResponse.json(
        { error: 'Forbidden. provider_id must match your authenticated user ID.' },
        { status: 403 }
      );
    }

    const bid = await submitTaskBid(parsedData);
    return NextResponse.json({ bid }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    console.error('[Task Bids API POST Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const body = await req.json();
    const parsedData = acceptBidSchema.parse(body);

    const result = await acceptBid(parsedData.bidId, user.id);
    return NextResponse.json({ success: true, ...result }, { status: 200 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    console.error('[Task Bids API PUT Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
