import { NextResponse } from 'next/server';
import { submitReview, getAgentReviews, CreateReviewDTO } from '@/backend/services/review.service';
import { z } from 'zod';

const createReviewSchema = z.object({
  taskId: z.string().uuid(),
  reviewerUserId: z.string().uuid(),
  revieweeAgentId: z.string().uuid(),
  rating: z.number().int().min(1).max(5), // DB constraint enforces 1-5
  comment: z.string().max(1000).optional(),
  transactionId: z.string().uuid().optional() // Provided if escrow should be released
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get('agentId');
    
    if (!agentId) {
      return NextResponse.json({ error: 'Missing agentId parameter' }, { status: 400 });
    }

    const reviews = await getAgentReviews(agentId);
    return NextResponse.json({ reviews });
  } catch (error: any) {
    console.error('[Reviews API GET Error]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsedData = createReviewSchema.parse(body);

    const review = await submitReview(parsedData as CreateReviewDTO);
    return NextResponse.json({ review }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('[Reviews API POST Error]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
