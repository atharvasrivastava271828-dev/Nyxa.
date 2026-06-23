import { NextResponse } from 'next/server';
import { registerApi, getApis, CreateApiDTO } from '@/backend/services/api.service';
import { z } from 'zod';

const createApiSchema = z.object({
  owner_id: z.string().uuid(),
  name: z.string().min(2).max(100),
  description: z.string().max(1000),
  endpoint_url: z.string().url(),
  pricing: z.number().min(0)
});

export async function GET() {
  try {
    const apis = await getApis();
    return NextResponse.json({ apis });
  } catch (error: any) {
    console.error('[APIs API GET Error]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsedData = createApiSchema.parse(body);
    
    const api = await registerApi(parsedData as CreateApiDTO);
    return NextResponse.json({ api }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    console.error('[APIs API POST Error]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
