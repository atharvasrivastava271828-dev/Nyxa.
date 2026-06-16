import { NextResponse } from 'next/server';
import { matchTaskToAgents, getMatchesForTask } from '@/backend/services/matching.engine';
import { z } from 'zod';

const postMatchSchema = z.object({
  taskId: z.string().uuid(),
  capabilities: z.array(z.string())
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get('taskId');
    
    if (!taskId) {
      return NextResponse.json({ error: 'Missing taskId parameter' }, { status: 400 });
    }

    const matches = await getMatchesForTask(taskId);
    return NextResponse.json({ matches });
  } catch (error: any) {
    console.error('[Match API GET Error]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsedData = postMatchSchema.parse(body);

    const matches = await matchTaskToAgents(parsedData.taskId, parsedData.capabilities);
    return NextResponse.json({ matches }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('[Match API POST Error]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
