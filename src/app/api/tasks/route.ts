import { NextResponse } from 'next/server';
import { postTask, getTasks, CreateTaskDTO } from '@/backend/services/task.service';
import { getAuthenticatedUser } from '@/backend/lib/supabase-server';
import { z } from 'zod';

const validClasses = ['Business', 'Education'] as const;
const validKindsMap: Record<string, string[]> = {
  Business: ['Competitor Analysis', 'Market Research', 'Business Plans', 'SWOT Analysis'],
  Education: ['Quiz Generation', 'Study Plans', 'Notes Summaries', 'Exam Preparation']
};

const createTaskSchema = z.object({
  provider_id: z.string().uuid(),
  title: z.string().min(5).max(200),
  description: z.string().min(10),
  price: z.number().nonnegative(), // Free or Paid
  class: z.enum(validClasses),
  kind: z.string(),
  dubs: z.array(z.string().regex(/^\}[a-zA-Z0-9_-]+$/, 'Dubs must start with } and be alphanumeric.')),
  inputs_required: z.record(z.string(), z.any()),
  outputs_delivered: z.record(z.string(), z.any()),
  delivery_time: z.string().min(2),
  hosting_method: z.enum(['link', 'iframe', 'native']),
  hosting_url: z.string().url()
}).refine(data => {
  const allowedKinds = validKindsMap[data.class] || [];
  return allowedKinds.includes(data.kind);
}, {
  message: "Invalid Kind for the selected Class.",
  path: ["kind"]
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
