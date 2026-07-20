import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/backend/lib/supabase-server';
import { createTaskRequest, getTaskRequests } from '@/backend/services/bidder.service';
import { z } from 'zod';

const createRequestSchema = z.object({
  requester_id: z.string().uuid(),
  title: z.string().min(5).max(200),
  description: z.string().min(10),
  request_type: z.enum(['free', 'paid', 'bounty']),
  budget: z.number().nonnegative().optional(),
  deadline: z.string().datetime().optional(),
  inputs_required: z.record(z.string(), z.any()),
  outputs_delivered: z.record(z.string(), z.any())
});

export async function GET() {
  try {
    const requests = await getTaskRequests();
    return NextResponse.json({ requests }, { status: 200 });
  } catch (error: any) {
    console.error('[Task Requests API GET Error]:', error);
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
    const parsedData = createRequestSchema.parse(body);

    if (user.id !== parsedData.requester_id) {
      return NextResponse.json(
        { error: 'Forbidden. requester_id must match your authenticated user ID.' },
        { status: 403 }
      );
    }

    const request = await createTaskRequest(parsedData);
    return NextResponse.json({ request }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    console.error('[Task Requests API POST Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
