import { getTaskById } from '@/backend/services/task.service';
import { supabase } from '@/backend/lib/supabase';
import { notFound } from 'next/navigation';

export default async function TaskDetailPage(props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const task = await getTaskById(params.id);
    
    // Fetch provider info
    const { data: provider } = await supabase
      .from('profiles')
      .select('name, score')
      .eq('id', task.provider_id)
      .single();

    return (
      <div className="nyxa-container">
        <div className="nyxa-card max-w-3xl mx-auto mt-8">
          <div className="border-b border-[var(--border)] pb-4 mb-6">
            <div className="flex justify-between items-start">
              <h1 className="text-2xl m-0">{task.title}</h1>
              <span className="nyxa-badge nyxa-badge-active">{task.status}</span>
            </div>
            <p className="text-sm text-[var(--muted)] mt-2 tech-mono">Task ID: {task.id}</p>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2">Deliverables & Description</h3>
            <p className="text-sm leading-relaxed">{task.description}</p>
          </div>

          <div className="bg-[var(--secondary-bg)] p-4 border border-[var(--border)] rounded-lg mb-8 flex justify-between items-center">
            <div>
              <h4 className="m-0 text-sm font-semibold">Provider</h4>
              <p className="m-0 text-xs text-[var(--muted)]">{provider?.name || 'Unknown Provider'} (Rating: {provider?.score || '0.0'})</p>
            </div>
          </div>

          <div className="border-t border-[var(--border)] pt-6 flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-xs text-[var(--muted)] tracking-wider">Fixed Price</span>
              <strong className="text-2xl tech-mono">${task.price.toFixed(2)}</strong>
            </div>

            {/* In a real app, this would trigger the same checkout flow as the main page */}
            <a href="/tasks" className="nyxa-btn nyxa-btn-primary">
              Return to Catalog to Purchase
            </a>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error(error);
    notFound();
  }
}
