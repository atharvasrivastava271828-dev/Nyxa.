import { NextResponse } from 'next/server';
import { getAuthenticatedUser, createAdminSupabaseClient } from '@/backend/lib/supabase-server';
import { z } from 'zod';

const walletCheckoutSchema = z.object({
  taskId: z.string().uuid().optional(),
  apiId: z.string().uuid().optional(),
  agentId: z.string().uuid().optional(),
}).refine(data => {
  const count = [data.taskId, data.apiId, data.agentId].filter(Boolean).length;
  return count === 1;
}, {
  message: "Exactly one of taskId, apiId, or agentId must be provided."
});

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = walletCheckoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.issues }, { status: 400 });
    }

    const { taskId, apiId, agentId } = parsed.data;
    const supabase = createAdminSupabaseClient();

    let price = 0;
    let providerId: string | null = null;

    // 1. Fetch the target capability to get price and provider_id
    if (taskId) {
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .select('price, provider_id')
        .eq('id', taskId)
        .single();
      
      if (taskError || !task) {
        return NextResponse.json({ error: 'Task not found or unavailable' }, { status: 404 });
      }
      price = parseFloat(task.price);
      providerId = task.provider_id;
    } else if (apiId) {
      const { data: api, error: apiError } = await supabase
        .from('apis')
        .select('price, provider_id')
        .eq('id', apiId)
        .single();
      
      if (apiError || !api) {
        return NextResponse.json({ error: 'API not found or unavailable' }, { status: 404 });
      }
      price = parseFloat(api.price);
      providerId = api.provider_id;
    } else if (agentId) {
      const { data: agent, error: agentError } = await supabase
        .from('agents')
        .select('price_demand, provider_id')
        .eq('id', agentId)
        .single();
      
      if (agentError || !agent) {
        return NextResponse.json({ error: 'Agent not found or unavailable' }, { status: 404 });
      }
      price = parseFloat(agent.price_demand);
      providerId = agent.provider_id;
    }

    if (!providerId) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    // 2. Fetch the user's wallet
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (walletError) {
      console.error('[Wallet Checkout Fetch Wallet Error]:', walletError);
      return NextResponse.json({ error: 'Failed to fetch wallet' }, { status: 500 });
    }

    const currentBalance = wallet ? parseFloat(wallet.balance) : 0;
    if (currentBalance < price) {
      return NextResponse.json({ error: 'Insufficient wallet balance' }, { status: 400 });
    }

    // 3. If agentId, perform allowance check
    if (agentId) {
      const { data: allowance, error: allowanceError } = await supabase
        .from('agent_allowances')
        .select('*')
        .eq('agent_id', agentId)
        .maybeSingle();

      if (allowanceError) {
        console.error('[Wallet Checkout Fetch Allowance Error]:', allowanceError);
        return NextResponse.json({ error: 'Failed to fetch agent allowances' }, { status: 500 });
      }

      // Default values if no custom allowance exists yet
      let maxSpendPerCall = 10.00;
      let dailyBudget = 50.00;
      let dailySpendAccumulated = 0.00;
      let lastSpendDate = new Date().toISOString().split('T')[0];

      if (allowance) {
        maxSpendPerCall = parseFloat(allowance.max_spend_per_call);
        dailyBudget = parseFloat(allowance.daily_budget);
        dailySpendAccumulated = parseFloat(allowance.daily_spend_accumulated);
        lastSpendDate = allowance.last_spend_date;
      }

      // Check max spend per call limit
      if (price > maxSpendPerCall) {
        return NextResponse.json({
          error: `Spend exceeds agent's maximum spend per call limit of ${maxSpendPerCall} INR.`
        }, { status: 400 });
      }

      const todayStr = new Date().toISOString().split('T')[0];
      let newDailySpend = price;

      if (lastSpendDate === todayStr) {
        if (dailySpendAccumulated + price > dailyBudget) {
          return NextResponse.json({
            error: `Spend exceeds agent's daily budget limit of ${dailyBudget} INR. Already spent ${dailySpendAccumulated} INR today.`
          }, { status: 400 });
        }
        newDailySpend = dailySpendAccumulated + price;
      } else {
        if (price > dailyBudget) {
          return NextResponse.json({
            error: `Spend exceeds agent's daily budget limit of ${dailyBudget} INR.`
          }, { status: 400 });
        }
      }

      // Update or insert agent allowance
      const { error: allowanceUpdateError } = await supabase
        .from('agent_allowances')
        .upsert({
          agent_id: agentId,
          max_spend_per_call: maxSpendPerCall,
          daily_budget: dailyBudget,
          daily_spend_accumulated: newDailySpend,
          last_spend_date: todayStr,
          updated_at: new Date().toISOString()
        });

      if (allowanceUpdateError) {
        console.error('[Wallet Checkout Update Allowance Error]:', allowanceUpdateError);
        return NextResponse.json({ error: 'Failed to update agent allowance spend tracking' }, { status: 500 });
      }
    }

    // 4. Deduct balance from wallet
    const newBalance = currentBalance - price;
    const { error: walletUpdateError } = await supabase
      .from('wallets')
      .upsert({
        user_id: user.id,
        balance: newBalance,
        currency: 'INR',
        updated_at: new Date().toISOString()
      });

    if (walletUpdateError) {
      console.error('[Wallet Checkout Update Wallet Error]:', walletUpdateError);
      return NextResponse.json({ error: 'Failed to deduct funds from wallet' }, { status: 500 });
    }

    // 5. Create Order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        task_id: taskId || null,
        api_id: apiId || null,
        agent_id: agentId || null,
        payer_id: user.id,
        payee_id: providerId,
        amount: price,
        status: 'completed',
        escrow_status: 'held',
        razorpay_order_id: null,
        razorpay_payment_id: null
      })
      .select()
      .single();

    if (orderError) {
      console.error('[Wallet Checkout Create Order Error]:', orderError);
      // Revert wallet balance if possible (best-effort)
      await supabase
        .from('wallets')
        .upsert({
          user_id: user.id,
          balance: currentBalance,
          currency: 'INR',
          updated_at: new Date().toISOString()
        });
      
      return NextResponse.json({ error: 'Failed to create order transaction record' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Checkout complete.',
      order,
      wallet: {
        user_id: user.id,
        balance: newBalance,
        currency: 'INR'
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('[Wallet Checkout Route Error]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
