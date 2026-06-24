import { NextResponse } from 'next/server';
import { postTask, getTasks, CreateTaskDTO } from '@/backend/services/task.service';
import { getAuthenticatedUser } from '@/backend/lib/supabase-server';
import { z } from 'zod';

const createTaskSchema = z.object({
  provider_id: z.string().uuid(),
  title: z.string().min(5).max(200),
  description: z.string().min(10),
  price: z.number().positive()
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
    // --- Auth Guard ---
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const body = await req.json();
    const parsedData = createTaskSchema.parse(body);

    if (user.id !== parsedData.provider_id) {
      return NextResponse.json(
        { error: 'Forbidden. provider_id must match your authenticated user ID.' },
        { status: 403 }
      );
    }
    // --- End Auth Guard ---

    const task = await postTask(parsedData as CreateTaskDTO);
    return NextResponse.json({ task }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    console.error('[Tasks API POST Error]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
