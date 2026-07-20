'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';

interface Task {
  id: string;
  provider_id: string;
  title: string;
  description: string;
  price: number;
  class: string;
  kind: string;
  dubs: string[];
  inputs_required: Record<string, any>;
  outputs_delivered: Record<string, any>;
  delivery_time: string;
  hosting_method: string;
  hosting_url: string;
  status: string;
}

function generateMockPaymentId() {
  return `mock_pay_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

export default function TasksMarketplace() {
  const router = useRouter();
  const { userId, userName } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [selectedKind, setSelectedKind] = useState<string>('All');
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  const validKindsMap: Record<string, string[]> = {
    Business: ['Competitor Analysis', 'Market Research', 'Business Plans', 'SWOT Analysis'],
    Education: ['Quiz Generation', 'Study Plans', 'Notes Summaries', 'Exam Preparation']
  };

  async function fetchTasks() {
    setLoading(true);
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      if (res.ok) {
        setTasks(data.tasks || []);
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  // Handle query parameter search
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const search = params.get('search');
      if (search) {
        setSearchTerm(search);
      }
    }
  }, []);

  // Compute filtered tasks dynamically
  const filteredTasks = tasks.filter(task => {
    const query = searchTerm.toLowerCase();
    
    // Search terms check
    const matchesSearch = searchTerm.trim() === '' ||
      task.title.toLowerCase().includes(query) ||
      task.description.toLowerCase().includes(query) ||
      task.dubs.some(tag => tag.toLowerCase().includes(query));

    // Class check
    const matchesClass = selectedClass === 'All' || task.class === selectedClass;

    // Kind check
    const matchesKind = selectedKind === 'All' || task.kind === selectedKind;

    return matchesSearch && matchesClass && matchesKind;
  });

  const handlePurchaseTask = async (task: Task) => {
    if (!userId) {
      alert('Please log in to purchase this task.');
      return;
    }

    if (userId === task.provider_id) {
      alert('You cannot purchase your own task offering.');
      return;
    }

    const platformFee = task.price * 0.10;
    const totalAmount = task.price + platformFee;

    const confirmPayment = confirm(
      `Purchase Outcome: "${task.title}"?\n\n` +
      `Task Price: $${task.price.toFixed(2)}\n` +
      `Platform Fee (10%): $${platformFee.toFixed(2)}\n` +
      `Total Charged: $${totalAmount.toFixed(2)}\n\n` +
      `Funds will be held in Escrow until delivery is confirmed.`
    );

    if (!confirmPayment) return;

    try {
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: task.id,
          buyerUserId: userId,
          sellerUserId: task.provider_id,
          amount: task.price
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Order initialization failed.');
      }

      // Simulate payment processing and signature verification
      const verifyRes = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpayOrderId: data.order.id,
          razorpayPaymentId: generateMockPaymentId(),
          razorpaySignature: 'MOCK_CRYPTOGRAPHIC_SIGNATURE_VERIFIED_BY_PLATFORM'
        })
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        throw new Error(verifyData.error || 'Payment verification failed.');
      }

      alert(
        `Purchase Successful! 🎉\n\n` +
        `Your escrow payment for "${task.title}" has been verified.\n` +
        `Order ID: ${data.order.id}\n\n` +
        `You can access the output once complete. Track on your Dashboard.`
      );
      router.push('/dashboard');
    } catch (err: any) {
      alert(err.message || 'Checkout failed.');
    }
  };

  return (
    <div className="nyxa-container">
      <div className="border-b border-[var(--border)] pb-6 mb-8">
        <h1 className="tracking-tight">Task Marketplace</h1>
        <p className="m-0 text-sm">
          Browse standardized outcome-based tasks. Focus on results, not tools.
        </p>
      </div>

      {/* Guest Alert Banner */}
      {!userId && (
        <div className="border border-[var(--border)] p-4 mb-8 bg-[var(--secondary-bg)] text-sm flex justify-between items-center rounded-lg">
          <span>You&apos;re browsing as a guest. Log in to purchase tasks or submit bids.</span>
          <Link href="/login" className="nyxa-btn nyxa-btn-primary py-1 px-3 text-xs">Log In</Link>
        </div>
      )}

      {/* Structured Layout Grid */}
      <div className="nyxa-grid-sidebar">
        {/* Left Sidebar: Controls & Filters */}
        <aside className="flex flex-col gap-6">
          {/* Marketplace Search Panel */}
          <div className="nyxa-card">
            <h3 className="border-b border-[var(--border)] pb-2 mb-4 font-bold text-sm">Search Catalog</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="nyxa-label text-[10px]">Keywords / Dubs</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Scraping, }startup, SEO..."
                  className="nyxa-input text-xs mt-1"
                />
              </div>

              <div>
                <label className="nyxa-label text-[10px]">Filter by Class</label>
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setSelectedKind('All');
                  }}
                  className="w-full mt-1 p-2 bg-[var(--secondary-bg)] border border-[var(--border)] rounded text-xs"
                >
                  <option value="All">All Classes</option>
                  <option value="Business">Business Tasks</option>
                  <option value="Education">Education Tasks</option>
                </select>
              </div>

              {selectedClass !== 'All' && (
                <div>
                  <label className="nyxa-label text-[10px]">Filter by Kind</label>
                  <select
                    value={selectedKind}
                    onChange={(e) => setSelectedKind(e.target.value)}
                    className="w-full mt-1 p-2 bg-[var(--secondary-bg)] border border-[var(--border)] rounded text-xs"
                  >
                    <option value="All">All Kinds</option>
                    {validKindsMap[selectedClass].map(k => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="nyxa-card bg-[var(--secondary-bg)] border-dashed">
            <h4 className="text-xs font-semibold mb-2">Need a custom task?</h4>
            <p className="text-[11px] text-[var(--muted)] mb-3">Post a request on our TaskBidder board and let developers build it.</p>
            <Link href="/bidder" className="nyxa-btn nyxa-btn-secondary text-center text-xs py-1.5 w-full block">
              Open TaskBidder
            </Link>
          </div>
        </aside>

        {/* Right Main Panel: Task Catalog */}
        <section className="flex flex-col gap-4">
          <h2 className="text-base tracking-tight mb-2 font-semibold border-b border-[var(--border)] pb-2 flex justify-between items-center">
            <span>Standardized Outcomes</span>
            <span className="tech-mono text-xs text-[var(--muted)]">
              {loading ? 'Loading...' : `${filteredTasks.length} tasks found`}
            </span>
          </h2>

          {loading ? (
            <p className="text-xs text-[var(--muted)] py-12 text-center">Loading marketplace catalog...</p>
          ) : filteredTasks.length === 0 ? (
            <div className="border border-[var(--border)] p-12 text-center text-sm text-[var(--muted)] rounded-lg">
              {tasks.length === 0 ? 'No tasks registered yet. Move to Developer portal to list.' : 'No tasks match your search queries.'}
            </div>
          ) : (
            filteredTasks.map(task => (
              <div key={task.id} className="nyxa-card flex flex-col gap-3">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <div className="flex gap-2 items-center">
                      <span className="text-[9px] uppercase tracking-widest text-[var(--muted)] font-semibold">{task.class} &bull; {task.kind}</span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${task.price === 0 ? 'bg-[var(--success)] text-[var(--background)]' : 'border border-[var(--border)]'}`}>
                        {task.price === 0 ? 'FREE' : 'PAID'}
                      </span>
                    </div>
                    <h3 className="text-base font-bold mt-1.5 tracking-tight">{task.title}</h3>
                    <span className="tech-mono text-[10px] text-[var(--muted)] select-all block mt-0.5">Provider: {task.provider_id.slice(0, 8)}...</span>
                  </div>
                  <span className={`nyxa-badge text-[9px] ${task.status === 'active' ? 'nyxa-badge-success' : 'nyxa-badge-active'}`}>
                    {task.status.toUpperCase()}
                  </span>
                </div>

                <p className="text-xs mt-1 leading-relaxed text-[var(--foreground)]">{task.description}</p>

                {/* Dubs tags */}
                <div className="flex flex-wrap gap-1.5 my-1">
                  {task.dubs.map(dub => (
                    <button
                      key={dub}
                      onClick={() => setSearchTerm(dub)}
                      className="text-[9px] px-2 py-0.5 border border-[var(--border)] bg-[var(--secondary-bg)] hover:bg-[var(--card-bg)] text-[var(--foreground)] rounded font-mono cursor-pointer"
                    >
                      {dub}
                    </button>
                  ))}
                </div>

                {/* Expand / View Details drawer */}
                <div>
                  <button
                    onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                    className="text-[10px] text-[var(--muted)] font-semibold hover:text-[var(--foreground)] border-0 bg-transparent cursor-pointer"
                  >
                    {expandedTask === task.id ? 'Hide Details' : 'View Inputs & Outputs Schemas'}
                  </button>

                  {expandedTask === task.id && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pt-3 border-t border-[var(--border)]">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[var(--muted)] block">Inputs Required</span>
                        <pre className="p-2.5 mt-1 bg-[var(--secondary-bg)] rounded text-[10px] tech-mono overflow-auto max-h-[150px]">
                          {JSON.stringify(task.inputs_required, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[var(--muted)] block">Outputs Delivered</span>
                        <pre className="p-2.5 mt-1 bg-[var(--secondary-bg)] rounded text-[10px] tech-mono overflow-auto max-h-[150px]">
                          {JSON.stringify(task.outputs_delivered, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center border-t border-[var(--border)] pt-3.5 mt-2">
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase tracking-wider text-[var(--muted)]">Price</span>
                    <strong className="tech-mono text-base">{task.price === 0 ? 'FREE' : `$${task.price.toFixed(2)}`}</strong>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] text-[var(--muted)] font-mono">SLA: {task.delivery_time}</span>
                    <button
                      onClick={() => handlePurchaseTask(task)}
                      className="nyxa-btn nyxa-btn-primary text-xs py-1.5 px-6"
                    >
                      {task.price === 0 ? 'Acquire & Execute' : 'Purchase & Execute'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
