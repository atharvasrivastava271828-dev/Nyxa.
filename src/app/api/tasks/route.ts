import { NextResponse } from 'next/server';
import { postTask, getTasks, CreateTaskDTO } from '@/backend/services/task.service';
import { z } from 'zod';

const createTaskSchema = z.object({
  posted_by_user_id: z.string().uuid(),
  title: z.string().min(5).max(200),
  description: z.string().min(10), // We need enough text for the AI to extract goals effectively
  budget: z.number().positive()
});

export async function GET() {
  try {
    const tasks = await getTasks();
    return NextResponse.json({ tasks });
  } catch (error: any) {
    console.error('[Tasks API GET Error]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsedData = createTaskSchema.parse(body);
    
    const task = await postTask(parsedData as CreateTaskDTO);
    return NextResponse.json({ task }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('[Tasks API POST Error]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
