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
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  // AI Search State
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiMatchedIds, setAiMatchedIds] = useState<string[] | null>(null);

  const [checkoutTask, setCheckoutTask] = useState<Task | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const [loading, setLoading] = useState(true);

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
    // If AI has performed a semantic search, strictly use those matches
    if (aiMatchedIds !== null) {
      return aiMatchedIds.includes(task.id);
    }
    
    // Otherwise fallback to simple keyword matching
    const query = searchTerm.toLowerCase();
    return (
      searchTerm.trim() === '' ||
      task.title.toLowerCase().includes(query) ||
      task.description.toLowerCase().includes(query) ||
      task.dubs.some(tag => tag.toLowerCase().includes(query))
    );
  });

  const handleAiSearch = async () => {
    if (!searchTerm.trim()) {
      setAiMatchedIds(null);
      return;
    }
    setIsAiSearching(true);
    try {
      const res = await fetch('/api/tasks/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchTerm })
      });
      const data = await res.json();
      if (res.ok && data.matchedIds) {
        setAiMatchedIds(data.matchedIds);
      } else {
        setAiMatchedIds(null); // Fallback to keyword
      }
    } catch (err) {
      console.error('AI search failed', err);
      setAiMatchedIds(null);
    } finally {
      setIsAiSearching(false);
    }
  };

  // Extract all unique dubs
  const allDubs = Array.from(new Set(tasks.flatMap(t => t.dubs)));

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
    <div className="nyxa-container max-w-4xl pb-24">
      {/* 1. Hero Search Section */}
      <section className="text-center py-16 flex flex-col items-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">What do you need done?</h1>
        <p className="text-sm text-[var(--muted)] mb-10 max-w-xl">
          Search for standard outcomes, executed instantly. We handle the process, you get the results.
        </p>
        
        {/* Massive Search Bar */}
        <div className="w-full max-w-2xl relative mb-6 flex items-center shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-full transition-shadow hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-2 border-[var(--foreground)] bg-[var(--background)]">
          <input
            type="text"
            placeholder="Search for Market Research, SEO, Design..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (e.target.value === '') setAiMatchedIds(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAiSearch();
              }
            }}
            className="w-full p-4 pl-6 text-lg focus:outline-none bg-transparent"
          />
          <button 
            onClick={handleAiSearch}
            disabled={isAiSearching}
            className="absolute right-2 px-5 py-2.5 bg-[var(--foreground)] text-[var(--background)] rounded-full font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
          >
            {isAiSearching ? (
               <div className="w-4 h-4 border-2 border-[var(--background)]/30 border-t-[var(--background)] rounded-full animate-spin"></div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09l2.846.813-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
            )}
            AI Match
          </button>
        </div>

        {/* Quick Filter Dubs */}
        {!loading && allDubs.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 max-w-3xl">
            <button 
              onClick={() => {
                setSearchTerm('');
                setAiMatchedIds(null);
              }} 
              className={`text-xs px-4 py-2 rounded-full font-medium transition-all ${searchTerm === '' ? 'bg-[var(--foreground)] text-[var(--background)] shadow-md' : 'bg-[var(--secondary-bg)] text-[var(--muted)] hover:text-[var(--foreground)]'}`}
            >
              All
            </button>
            {allDubs.map(dub => (
              <button
                key={dub}
                onClick={() => {
                  setSearchTerm(dub);
                  setAiMatchedIds(null); // Dub clicks bypass AI for strict keyword match
                }}
                className={`text-xs px-4 py-2 rounded-full font-medium transition-all ${searchTerm === dub ? 'bg-[var(--foreground)] text-[var(--background)] shadow-md' : 'bg-[var(--secondary-bg)] text-[var(--muted)] hover:text-[var(--foreground)]'}`}
              >
                {dub}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Guest Alert Banner */}
      {!userId && (
        <div className="border border-[var(--border)] p-4 mb-8 bg-[var(--secondary-bg)]/50 backdrop-blur-sm text-sm flex justify-between items-center rounded-2xl shadow-sm max-w-2xl mx-auto">
          <span className="text-[var(--muted)]">Log in to safely purchase tasks via escrow.</span>
          <Link href="/login" className="nyxa-btn nyxa-btn-primary py-1.5 px-4 text-xs rounded-full">Log In</Link>
        </div>
      )}

      {/* 2. Tasks Feed */}
      <section className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
        {loading ? (
          <p className="text-sm text-[var(--muted)] py-16 text-center animate-pulse">Scanning the network...</p>
        ) : filteredTasks.length === 0 ? (
          <div className="border border-[var(--border)] p-16 text-center text-sm text-[var(--muted)] rounded-3xl bg-[var(--secondary-bg)]/20 shadow-inner">
            {tasks.length === 0 ? 'The catalog is currently empty.' : 'No outcomes matched your search.'}
          </div>
        ) : (
          filteredTasks.map(task => (
            <div key={task.id} className="bg-[var(--card-bg)] flex flex-col p-6 sm:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[var(--border)]/50 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] group">
              
              <div className="flex justify-between items-start gap-4 mb-3">
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight">{task.title}</h3>
                <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest whitespace-nowrap ${task.price === 0 ? 'bg-[var(--success)]/10 text-[var(--success)]' : 'bg-[var(--foreground)]/5 text-[var(--foreground)] border border-[var(--border)]'}`}>
                  {task.price === 0 ? 'FREE' : 'PAID'}
                </span>
              </div>

              <p className="text-sm leading-relaxed text-[var(--muted)] mb-4">{task.description}</p>

              {/* View Details Toggle */}
              <div className="mt-2">
                <button
                  onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                  className="text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)] transition-colors flex items-center gap-1"
                >
                  {expandedTask === task.id ? 'Hide Details' : 'View Outcome Flow'}
                  <span className={`transition-transform duration-300 ${expandedTask === task.id ? 'rotate-180' : ''}`}>▼</span>
                </button>

                {expandedTask === task.id && (
                  <div className="mt-4 pt-4 border-t border-[var(--border)]/50 animate-in slide-in-from-top-2 fade-in duration-300">
                    {/* Visual Outcome Flow Diagram (Cleaned Up) */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 text-xs font-medium">
                      
                      {/* Inputs Column */}
                      <div className="flex flex-col gap-2 w-full sm:w-1/3">
                        <span className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-wider text-center mb-1">You Provide</span>
                        {Object.keys(task.inputs_required || {}).map(key => (
                          <div key={key} className="px-3 py-2 bg-[var(--secondary-bg)] rounded-xl text-center shadow-sm border border-[var(--border)]">
                            {key}
                          </div>
                        ))}
                        {Object.keys(task.inputs_required || {}).length === 0 && <div className="px-3 py-2 bg-[var(--background)] rounded-xl text-center text-[var(--muted)] border border-dashed border-[var(--border)]">None</div>}
                      </div>

                      <span className="text-[var(--muted)] font-bold text-lg rotate-90 sm:rotate-0">➔</span>

                      {/* Outputs Column */}
                      <div className="flex flex-col gap-2 w-full sm:w-1/3">
                        <span className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-wider text-center mb-1">You Receive</span>
                        {Object.keys(task.outputs_delivered || {}).map(key => (
                          <div key={key} className="px-3 py-2 bg-[var(--foreground)] text-[var(--background)] rounded-xl text-center shadow-sm font-bold">
                            {key}
                          </div>
                        ))}
                        {Object.keys(task.outputs_delivered || {}).length === 0 && <div className="px-3 py-2 bg-[var(--background)] rounded-xl text-center text-[var(--muted)] border border-dashed border-[var(--border)]">None</div>}
                      </div>

                    </div>
                    
                    <div className="text-[10px] text-center text-[var(--muted)] mt-5 flex justify-center items-center gap-3">
                      <span>⚡ SLA: <span className="font-semibold text-[var(--foreground)]">{task.delivery_time}</span></span>
                      <span>&bull;</span>
                      <span>Delivery: <span className="font-semibold uppercase text-[var(--foreground)]">{task.hosting_method}</span></span>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer row */}
              <div className="flex justify-between items-center pt-5 mt-5 border-t border-[var(--border)]/50">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider text-[var(--muted)] font-semibold mb-1">Total Cost</span>
                  <strong className="text-xl tracking-tight">{task.price === 0 ? 'FREE' : `$${task.price.toFixed(2)}`}</strong>
                </div>
                <button
                  onClick={() => handlePurchaseTaskClick(task)}
                  className="bg-[var(--foreground)] text-[var(--background)] font-bold text-sm py-2.5 px-8 rounded-full shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  {task.price === 0 ? 'Acquire Now' : 'Purchase via Escrow'}
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      {/* 3. TaskBidder CTA */}
      <section className="mt-16 pt-12 border-t border-[var(--border)] text-center max-w-md mx-auto">
        <h4 className="text-lg font-bold mb-2 tracking-tight">Can&apos;t find what you need?</h4>
        <p className="text-sm text-[var(--muted)] mb-6 leading-relaxed">
          Post a custom request on the TaskBidder board and let our network of providers build the outcome for you.
        </p>
        <Link href="/bidder" className="nyxa-btn nyxa-btn-secondary text-sm py-3 px-8 rounded-full shadow-sm hover:shadow-md transition-shadow">
          Open TaskBidder
        </Link>
      </section>

      {/* Apple-Style Checkout Modal Overlay */}
      {checkoutTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-[var(--background)]/60 backdrop-blur-md transition-opacity animate-in fade-in duration-300" 
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
