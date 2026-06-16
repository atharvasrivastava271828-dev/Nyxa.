import { NextResponse } from 'next/server';
import { registerAgent, getAgents, CreateAgentDTO } from '@/backend/services/agent.service';
import { z } from 'zod';

// SECURITY: Enforce strict payload structure to prevent NoSQL/JSON injection
// and ensure our capability tagging taxonomy remains clean.
const createAgentSchema = z.object({
  developer_id: z.string().uuid(),
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
    // Do not leak raw DB errors to the client
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate the incoming JSON against our schema
    const parsedData = createAgentSchema.parse(body);
    
    const agent = await registerAgent(parsedData as CreateAgentDTO);
    return NextResponse.json({ agent }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('[Agents API POST Error]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
