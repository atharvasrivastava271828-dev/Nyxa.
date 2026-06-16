import { NextResponse } from 'next/server';
import { createOrder, CreateTransactionDTO } from '@/backend/services/payment.service';
import { z } from 'zod';

const createOrderSchema = z.object({
  taskId: z.string().uuid().optional(),
  apiId: z.string().uuid().optional(),
  buyerUserId: z.string().uuid(),
  sellerUserId: z.string().uuid(),
  sellerAgentId: z.string().uuid().optional(),
  amount: z.number().positive()
}).refine(data => data.taskId || data.apiId, {
  message: "Either taskId or apiId must be provided to create an order.",
  path: ["taskId", "apiId"]
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsedData = createOrderSchema.parse(body);

    const result = await createOrder(parsedData as CreateTransactionDTO);
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('[CreateOrder API POST Error]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
