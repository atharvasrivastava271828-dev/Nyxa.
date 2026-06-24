import { NextResponse } from 'next/server';
import { registerAgent, getAgents, CreateAgentDTO } from '@/backend/services/agent.service';
import { getAuthenticatedUser } from '@/backend/lib/supabase-server';
import { z } from 'zod';

const createAgentSchema = z.object({
  provider_id: z.string().uuid(),
  name: z.string().min(2).max(100),
  description: z.string().max(1000),
  capabilities: z.array(z.string().toLowerCase().regex(/^[a-z0-9_]+$/)),
  price_demand: z.number().min(0)
});

export async function GET() {
  try {
    const agents = await getAgents();
    return NextResponse.json({ agents });
  } catch (error: any) {
    console.error('[Agents API GET Error]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // --- Auth Guard ---
    // Verify the session cookie and confirm the caller IS the provider_id in the body.
    // This prevents any user from impersonating another provider.
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const body = await req.json();
    const parsedData = createAgentSchema.parse(body);

    if (user.id !== parsedData.provider_id) {
      return NextResponse.json(
        { error: 'Forbidden. provider_id must match your authenticated user ID.' },
        { status: 403 }
      );
    }
    // --- End Auth Guard ---

    const agent = await registerAgent(parsedData as CreateAgentDTO);
    return NextResponse.json({ agent }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    console.error('[Agents API POST Error]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
