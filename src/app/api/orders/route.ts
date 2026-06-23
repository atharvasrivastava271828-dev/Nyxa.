import { NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/backend/lib/supabase-server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();
    
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('payer_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Orders API GET Error]:', error);
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error('[Orders API GET Error]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
