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
  const { userId } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [selectedKind, setSelectedKind] = useState<string>('All');
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  const [checkoutTask, setCheckoutTask] = useState<Task | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const [loading, setLoading] = useState(true);

  const validKindsMap: Record<string, string[]> = {
    Business: ['Competitor Analysis', 'Market Research', 'Business Plans', 'SWOT Analysis'],
    Education: ['Quiz Generation', 'Study Plans', 'Notes Summaries', 'Exam Preparation']
  };

  async function fetchTasks() {
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTasks();
  }, []);

  // Handle query parameter search
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const search = params.get('search');
      if (search) {
        Promise.resolve().then(() => setSearchTerm(search));
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

  const handlePurchaseTaskClick = (task: Task) => {
    if (!userId) {
      alert('Please log in to purchase this task.');
      return;
    }
    if (userId === task.provider_id) {
      alert('You cannot purchase your own task offering.');
      return;
    }
    setCheckoutTask(task);
  };

  const processCheckout = async () => {
    if (!checkoutTask || !userId) return;
    setCheckoutLoading(true);

    try {
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: checkoutTask.id,
          buyerUserId: userId,
          sellerUserId: checkoutTask.provider_id,
          amount: checkoutTask.price
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Order initialization failed.');

      const verifyRes = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpayOrderId: data.order.id,
          razorpayPaymentId: generateMockPaymentId(),
          razorpaySignature: 'MOCK_CRYPTOGRAPHIC_SIGNATURE_VERIFIED_BY_PLATFORM'
        })
      });

      if (!verifyRes.ok) throw new Error('Payment verification failed.');

      setCheckoutSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      alert(err.message || 'Checkout failed.');
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="nyxa-container relative">
      <div className="border-b border-[var(--border)] pb-8 mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Task Marketplace</h1>
        <p className="m-0 text-sm text-[var(--muted)]">
          Browse standardized outcome-based tasks. Focus on results, not tools.
        </p>
      </div>

      {/* Guest Alert Banner */}
      {!userId && (
        <div className="border border-[var(--border)] p-5 mb-10 bg-[var(--secondary-bg)]/50 backdrop-blur-sm text-sm flex justify-between items-center rounded-2xl shadow-sm">
          <span className="text-[var(--muted)]">You&apos;re browsing as a guest. Log in to purchase tasks or submit bids.</span>
          <Link href="/login" className="nyxa-btn nyxa-btn-primary py-2 px-5 text-sm rounded-full shadow-sm hover:shadow-md transition-shadow">Log In</Link>
        </div>
      )}

      {/* Structured Layout Grid */}
      <div className="nyxa-grid-sidebar">
        {/* Left Sidebar: Controls & Filters */}
        <aside className="flex flex-col gap-6">
          {/* Marketplace Search Panel */}
          <div className="nyxa-card p-6 rounded-3xl shadow-sm border border-[var(--border)]/50">
            <h3 className="pb-3 mb-5 font-bold text-sm tracking-tight border-b border-[var(--border)]">Search Catalog</h3>
            <div className="flex flex-col gap-5">
              <div>
                <label className="text-xs font-semibold text-[var(--muted)] mb-1.5 block">Keywords / Dubs</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Scraping, }startup, SEO..."
                  className="w-full p-2.5 bg-[var(--secondary-bg)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--foreground)] transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--muted)] mb-1.5 block">Filter by Class</label>
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setSelectedKind('All');
                  }}
                  className="w-full p-2.5 bg-[var(--secondary-bg)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--foreground)] transition-colors"
                >
                  <option value="All">All Classes</option>
                  <option value="Business">Business Tasks</option>
                  <option value="Education">Education Tasks</option>
                </select>
              </div>

              {selectedClass !== 'All' && (
                <div>
                  <label className="text-xs font-semibold text-[var(--muted)] mb-1.5 block">Filter by Kind</label>
                  <select
                    value={selectedKind}
                    onChange={(e) => setSelectedKind(e.target.value)}
                    className="w-full p-2.5 bg-[var(--secondary-bg)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--foreground)] transition-colors"
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

          <div className="p-6 rounded-3xl bg-[var(--secondary-bg)]/30 border border-dashed border-[var(--border)]">
            <h4 className="text-sm font-bold mb-2 tracking-tight">Need a custom task?</h4>
            <p className="text-xs text-[var(--muted)] mb-4 leading-relaxed">Post a request on our TaskBidder board and let developers build it.</p>
            <Link href="/bidder" className="nyxa-btn nyxa-btn-secondary text-center text-sm py-2 rounded-full w-full block shadow-sm hover:shadow-md transition-shadow">
              Open TaskBidder
            </Link>
          </div>
        </aside>

        {/* Right Main Panel: Task Catalog */}
        <section className="flex flex-col gap-6">
          <div className="flex justify-between items-end border-b border-[var(--border)] pb-3">
            <h2 className="text-lg font-bold tracking-tight">Standardized Outcomes</h2>
            <span className="text-xs font-medium text-[var(--muted)] bg-[var(--secondary-bg)] px-3 py-1 rounded-full">
              {loading ? 'Loading...' : `${filteredTasks.length} tasks`}
            </span>
          </div>

          {!loading && tasks.length > 0 && (
            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
              <button 
                onClick={() => setSearchTerm('')} 
                className={`whitespace-nowrap text-xs px-4 py-1.5 rounded-full font-medium transition-all ${searchTerm === '' ? 'bg-[var(--foreground)] text-[var(--background)] shadow-md' : 'bg-[var(--secondary-bg)] text-[var(--muted)] hover:text-[var(--foreground)]'}`}
              >
                All Dubs
              </button>
              {Array.from(new Set(tasks.flatMap(t => t.dubs))).map(dub => (
                <button
                  key={dub}
                  onClick={() => setSearchTerm(dub)}
                  className={`whitespace-nowrap text-xs px-4 py-1.5 rounded-full font-medium transition-all ${searchTerm === dub ? 'bg-[var(--foreground)] text-[var(--background)] shadow-md' : 'bg-[var(--secondary-bg)] text-[var(--muted)] hover:text-[var(--foreground)]'}`}
                >
                  {dub}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <p className="text-sm text-[var(--muted)] py-16 text-center">Loading marketplace catalog...</p>
          ) : filteredTasks.length === 0 ? (
            <div className="border border-[var(--border)] p-16 text-center text-sm text-[var(--muted)] rounded-3xl bg-[var(--secondary-bg)]/20">
              {tasks.length === 0 ? 'No tasks registered yet. Move to Developer portal to list.' : 'No tasks match your search queries.'}
            </div>
          ) : (
            filteredTasks.map(task => (
              <div key={task.id} className="bg-[var(--card-bg)] flex flex-col gap-4 p-6 sm:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.02)] border border-[var(--border)]/50 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] group">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <div className="flex gap-2 items-center mb-2">
                      <span className="text-[10px] font-semibold text-[var(--muted)] bg-[var(--secondary-bg)] px-2.5 py-1 rounded-md tracking-wider uppercase">{task.class} &bull; {task.kind}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight mb-1">{task.title}</h3>
                    <span className="font-mono text-[10px] text-[var(--muted)] block">Provider: {task.provider_id.slice(0, 8)}...</span>
                  </div>
                  <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest ${task.price === 0 ? 'bg-[var(--success)]/10 text-[var(--success)]' : 'bg-[var(--foreground)]/5 text-[var(--foreground)] border border-[var(--border)]'}`}>
                    {task.price === 0 ? 'FREE' : 'PAID'}
                  </span>
                </div>

                <p className="text-sm mt-1 leading-relaxed text-[var(--muted)]">{task.description}</p>

                {/* Dubs tags */}
                <div className="flex flex-wrap gap-2 my-2">
                  {task.dubs.map(dub => (
                    <button
                      key={dub}
                      onClick={() => setSearchTerm(dub)}
                      className="text-[11px] font-medium px-3.5 py-1 bg-[var(--secondary-bg)] hover:bg-[var(--border)] text-[var(--foreground)] rounded-full transition-colors cursor-pointer"
                    >
                      {dub}
                    </button>
                  ))}
                </div>

                {/* Expand / View Details drawer */}
                <div className="mt-2">
                  <button
                    onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                    className="text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)] transition-colors flex items-center gap-1"
                  >
                    {expandedTask === task.id ? 'Hide Details' : 'View Inputs & Outputs Schemas'}
                    <span className={`transition-transform duration-300 ${expandedTask === task.id ? 'rotate-180' : ''}`}>▼</span>
                  </button>

                  {expandedTask === task.id && (
                    <div className="mt-5 p-6 bg-[var(--secondary-bg)]/50 rounded-3xl flex flex-col gap-8 animate-in slide-in-from-top-2 fade-in duration-300">
                      {/* Visual Outcome Flow Diagram */}
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[var(--muted)] block mb-4 tracking-wider">Outcome Flow Preview</span>
                        <div className="flex items-center gap-4 overflow-x-auto pb-2 font-mono text-[11px]">
                          <div className="flex flex-col gap-2 min-w-max">
                            {Object.keys(task.inputs_required || {}).map(key => (
                              <span key={key} className="px-3 py-1.5 bg-[var(--background)] rounded-lg text-center shadow-sm border border-[var(--border)]/50">
                                {key}
                              </span>
                            ))}
                            {Object.keys(task.inputs_required || {}).length === 0 && <span className="px-3 py-1.5 bg-[var(--background)] rounded-lg text-center text-[var(--muted)] border border-dashed border-[var(--border)]">No Inputs</span>}
                          </div>
                          <span className="text-[var(--muted)] font-bold text-lg">➔</span>
                          <div className="px-5 py-2.5 bg-[var(--card-bg)] border border-[var(--border)] text-[var(--foreground)] rounded-xl font-bold text-center whitespace-nowrap shadow-md">
                            {task.title}
                          </div>
                          <span className="text-[var(--muted)] font-bold text-lg">➔</span>
                          <div className="flex flex-col gap-2 min-w-max">
                            {Object.keys(task.outputs_delivered || {}).map(key => (
                              <span key={key} className="px-3 py-1.5 bg-[var(--success)]/10 text-[var(--success)] rounded-lg text-center font-bold shadow-sm">
                                {key}
                              </span>
                            ))}
                            {Object.keys(task.outputs_delivered || {}).length === 0 && <span className="px-3 py-1.5 bg-[var(--background)] rounded-lg text-center text-[var(--muted)] border border-dashed border-[var(--border)]">No Outputs</span>}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-[var(--border)]">
                        {/* Dynamic Input Fields Form */}
                        <div>
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-wider">Inputs Required</span>
                            <span className="text-[10px] text-[var(--muted)] bg-[var(--background)] px-2 py-1 rounded-md cursor-pointer hover:text-[var(--foreground)] transition-colors shadow-sm" onClick={(e) => {
                              const target = e.currentTarget.parentElement?.nextElementSibling as HTMLElement;
                              if (target) target.classList.toggle('hidden');
                            }}>Toggle Raw JSON</span>
                          </div>
                          <pre className="hidden p-4 mt-2 bg-[var(--background)] border border-[var(--border)] rounded-xl text-xs font-mono overflow-auto max-h-[200px] mb-5 shadow-inner">
                            {JSON.stringify(task.inputs_required, null, 2)}
                          </pre>
                          <div className="flex flex-col gap-5">
                            {Object.entries(task.inputs_required || {}).map(([key, valType]) => (
                              <div key={key}>
                                <label className="text-xs font-semibold block mb-2 text-[var(--foreground)]">{key} <span className="text-[var(--muted)] font-mono text-[10px] font-normal ml-1">({String(valType)})</span></label>
                                <input 
                                  type={String(valType).toLowerCase().includes('number') ? 'number' : 'text'} 
                                  placeholder={`Enter ${key}...`}
                                  className="w-full p-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/10 focus:border-[var(--foreground)] transition-all shadow-sm" 
                                />
                              </div>
                            ))}
                            {Object.keys(task.inputs_required || {}).length === 0 && (
                              <p className="text-sm text-[var(--muted)] italic">No inputs required for this task.</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-wider block mb-4">Outputs Delivered</span>
                          <div className="flex flex-col gap-3">
                            {Object.entries(task.outputs_delivered || {}).map(([key, valType]) => (
                              <div key={key} className="p-3 border border-[var(--border)] bg-[var(--background)] rounded-xl text-sm flex justify-between items-center shadow-sm">
                                <span className="font-semibold">{key}</span>
                                <span className="text-[var(--muted)] font-mono text-[11px] bg-[var(--secondary-bg)] px-2 py-1 rounded-md">{String(valType)}</span>
                              </div>
                            ))}
                            {Object.keys(task.outputs_delivered || {}).length === 0 && (
                              <p className="text-sm text-[var(--muted)] italic">No specific outputs defined.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-5 mt-3 border-t border-[var(--border)]/50">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-[var(--muted)] font-semibold mb-1">Price</span>
                    <strong className="text-xl tracking-tight">{task.price === 0 ? 'FREE' : `$${task.price.toFixed(2)}`}</strong>
                  </div>
                  <div className="flex items-center gap-5">
                    <span className="text-xs text-[var(--muted)] font-medium">SLA: {task.delivery_time}</span>
                    <button
                      onClick={() => handlePurchaseTaskClick(task)}
                      className="bg-[var(--foreground)] text-[var(--background)] font-bold text-sm py-2.5 px-8 rounded-full shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      {task.price === 0 ? 'Acquire' : 'Purchase'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>
      </div>

      {/* Apple-Style Checkout Modal Overlay */}
      {checkoutTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-[var(--background)]/40 backdrop-blur-md transition-opacity animate-in fade-in duration-300" 
            onClick={() => !checkoutLoading && setCheckoutTask(null)}
          ></div>
          <div className="relative bg-[var(--card-bg)] border border-[var(--border)]/50 rounded-[2.5rem] p-8 max-w-sm w-full shadow-[0_20px_60px_rgb(0,0,0,0.12)] flex flex-col items-center animate-in zoom-in-95 fade-in duration-300">
            
            {checkoutSuccess ? (
              <div className="flex flex-col items-center justify-center py-6 animate-in zoom-in-50 fade-in duration-500">
                <div className="w-16 h-16 bg-[var(--success)] rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(var(--success-rgb),0.3)]">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h3 className="text-2xl font-bold tracking-tight mb-2 text-center">Payment Complete</h3>
                <p className="text-sm text-[var(--muted)] text-center">Funds locked in Escrow.</p>
              </div>
            ) : (
              <>
                <div className="w-14 h-14 bg-[var(--foreground)] rounded-full flex items-center justify-center mb-5 shadow-lg">
                  <span className="text-[var(--background)] font-bold text-2xl tracking-tighter">N</span>
                </div>
                <h3 className="text-2xl font-bold tracking-tight mb-2">Confirm Purchase</h3>
                <p className="text-sm text-[var(--muted)] text-center mb-8 font-medium">{checkoutTask.title}</p>
                
                <div className="w-full bg-[var(--secondary-bg)]/50 rounded-3xl p-6 flex flex-col gap-4 mb-8 border border-[var(--border)]/30">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--muted)]">Task Outcome</span>
                    <span className="font-semibold">${checkoutTask.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--muted)]">Platform Fee (10%)</span>
                    <span className="font-semibold">${(checkoutTask.price * 0.1).toFixed(2)}</span>
                  </div>
                  <div className="h-[1px] w-full bg-[var(--border)]/50 my-1"></div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${(checkoutTask.price * 1.1).toFixed(2)}</span>
                  </div>
                </div>

                <button 
                  onClick={processCheckout}
                  disabled={checkoutLoading}
                  className="w-full py-4 rounded-full bg-[var(--foreground)] text-[var(--background)] font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center shadow-lg disabled:opacity-50 disabled:hover:scale-100"
                >
                  {checkoutLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-[var(--background)]/30 border-t-[var(--background)] rounded-full animate-spin"></div>
                      Processing
                    </span>
                  ) : (
                    'Pay with Escrow'
                  )}
                </button>
                <button 
                  onClick={() => setCheckoutTask(null)}
                  disabled={checkoutLoading}
                  className="w-full py-3 mt-3 rounded-full text-[var(--muted)] hover:text-[var(--foreground)] font-medium text-sm transition-colors"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
