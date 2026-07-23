'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/hooks/useAuth';

interface Bid {
  id: string;
  request_id: string;
  provider_id: string;
  bid_amount: number;
  delivery_time: string;
  status: string;
  created_at: string;
  profiles: {
    name: string;
  };
}

interface BidderRequest {
  id: string;
  requester_id: string;
  title: string;
  description: string;
  request_type: string;
  budget: number;
  deadline: string;
  inputs_required: any;
  outputs_delivered: any;
  status: string;
  created_at: string;
  profiles: {
    name: string;
  };
}

export default function TaskBidderBoard() {
  const { userId } = useAuth();
  const [requests, setRequests] = useState<BidderRequest[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Selected request's bids
  const [selectedRequestBids, setSelectedRequestBids] = useState<Record<string, Bid[]>>({});
  const [bidsLoading, setBidsLoading] = useState<Record<string, boolean>>({});

  // Request Form
  const [requestForm, setRequestForm] = useState({
    title: '',
    description: '',
    request_type: 'paid',
    budget: 25,
    deadline_days: 3,
    inputsString: '',
    outputsString: ''
  });

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tasks/requests');
      const data = await res.json();
      if (res.ok) {
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error('Failed to load task requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRequests();
  }, []);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      alert('Please log in to submit a task request.');
      return;
    }

    try {
      const inputs = requestForm.inputsString ? { description: requestForm.inputsString } : {};
      const outputs = requestForm.outputsString ? { description: requestForm.outputsString } : {};
      
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + Number(requestForm.deadline_days));

      const res = await fetch('/api/tasks/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requester_id: userId,
          title: requestForm.title,
          description: requestForm.description,
          request_type: requestForm.request_type,
          budget: requestForm.request_type === 'free' ? 0 : Number(requestForm.budget),
          deadline: deadline.toISOString(),
          inputs_required: inputs,
          outputs_delivered: outputs
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create request');

      alert('Task request posted to board! 📋');
      fetchRequests();
      setRequestForm({
        title: '',
        description: '',
        request_type: 'paid',
        budget: 25,
        deadline_days: 3,
        inputsString: '{\n  "startup_url": "string"\n}',
        outputsString: '{\n  "report_pdf": "string"\n}'
      });
    } catch (err: any) {
      alert(err.message || 'Verification failed');
    }
  };

  const fetchBidsForRequest = async (requestId: string) => {
    setBidsLoading(prev => ({ ...prev, [requestId]: true }));
    try {
      const res = await fetch(`/api/tasks/bids?requestId=${requestId}`);
      const data = await res.json();
      if (res.ok) {
        setSelectedRequestBids(prev => ({ ...prev, [requestId]: data.bids || [] }));
      }
    } catch (err) {
      console.error('Failed to load bids:', err);
    } finally {
      setBidsLoading(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const handleAcceptBid = async (bidId: string, requestId: string) => {
    try {
      const res = await fetch('/api/tasks/bids', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bidId })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to accept bid');

      alert('Bid accepted successfully! 🎉 Escrow contract has been initialized and funds locked.');
      fetchRequests();
      fetchBidsForRequest(requestId);
    } catch (err: any) {
      alert(err.message || 'Accept bid failed');
    }
  };

  return (
    <div className="nyxa-container">
      <div className="border-b border-[var(--border)] pb-8 mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">TaskBidder Board</h1>
        <p className="m-0 text-sm text-[var(--muted)]">
          If a standardized task doesn&apos;t exist, post a custom request and let creators bid to complete it.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Post Request Form Card */}
        <div className="lg:col-span-1">
          <form onSubmit={handleCreateRequest} className="bg-[var(--card-bg)] p-6 sm:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.02)] border border-[var(--border)]/50 sticky top-24">
            <h3 className="border-b border-[var(--border)]/50 pb-4 mb-6 font-bold text-lg tracking-tight">Request Custom Outcome</h3>
            <div className="flex flex-col gap-5">
              <div>
                <label className="text-xs uppercase font-semibold text-[var(--muted)] tracking-wider mb-2 block">Request Type</label>
                <select
                  value={requestForm.request_type}
                  onChange={(e) => setRequestForm({
                    ...requestForm,
                    request_type: e.target.value,
                    budget: e.target.value === 'free' ? 0 : 25,
                    deadline_days: e.target.value === 'free' ? 7 : 3
                  })}
                  className="w-full p-3 bg-[var(--secondary-bg)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/10 focus:border-[var(--foreground)] transition-all shadow-sm"
                >
                  <option value="paid">Paid Request (3 days default)</option>
                  <option value="free">Free Request (7 days default)</option>
                  <option value="bounty">Bounty Request (Fixed Reward)</option>
                </select>
              </div>

              <div>
                <label className="text-xs uppercase font-semibold text-[var(--muted)] tracking-wider mb-2 block">Outcome Requirement Title</label>
                <input
                  type="text"
                  placeholder="e.g. Scrape positioning data of competitors"
                  value={requestForm.title}
                  onChange={(e) => setRequestForm({ ...requestForm, title: e.target.value })}
                  className="w-full p-3 bg-[var(--secondary-bg)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/10 focus:border-[var(--foreground)] transition-all shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="text-xs uppercase font-semibold text-[var(--muted)] tracking-wider mb-2 block">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe your exact goal. Explain what successful output looks like."
                  value={requestForm.description}
                  onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                  className="w-full p-3 bg-[var(--secondary-bg)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/10 focus:border-[var(--foreground)] transition-all shadow-sm resize-none"
                  required
                />
              </div>

              {requestForm.request_type !== 'free' && (
                <div>
                  <label className="text-xs uppercase font-semibold text-[var(--muted)] tracking-wider mb-2 block">Target Budget ($)</label>
                  <input
                    type="number"
                    value={requestForm.budget}
                    onChange={(e) => setRequestForm({ ...requestForm, budget: Number(e.target.value) })}
                    className="w-full p-3 bg-[var(--secondary-bg)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/10 focus:border-[var(--foreground)] transition-all shadow-sm"
                    required
                  />
                </div>
              )}

              <div>
                <label className="text-xs uppercase font-semibold text-[var(--muted)] tracking-wider mb-2 block">Deadline (Days from now)</label>
                <input
                  type="number"
                  max={30}
                  value={requestForm.deadline_days}
                  onChange={(e) => setRequestForm({ ...requestForm, deadline_days: Number(e.target.value) })}
                  className="w-full p-3 bg-[var(--secondary-bg)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/10 focus:border-[var(--foreground)] transition-all shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="text-xs uppercase font-semibold text-[var(--muted)] tracking-wider mb-2 block">What you will provide</label>
                <textarea
                  rows={3}
                  placeholder="e.g. A list of 5 startup URLs"
                  value={requestForm.inputsString}
                  onChange={(e) => setRequestForm({ ...requestForm, inputsString: e.target.value })}
                  className="w-full p-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/10 focus:border-[var(--foreground)] transition-all resize-none"
                />
              </div>

              <div>
                <label className="text-xs uppercase font-semibold text-[var(--muted)] tracking-wider mb-2 block">What you expect back</label>
                <textarea
                  rows={3}
                  placeholder="e.g. A 2-page PDF report analyzing the startups"
                  value={requestForm.outputsString}
                  onChange={(e) => setRequestForm({ ...requestForm, outputsString: e.target.value })}
                  className="w-full p-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/10 focus:border-[var(--foreground)] transition-all resize-none"
                />
              </div>

              <button type="submit" className="w-full bg-[var(--foreground)] text-[var(--background)] font-bold text-sm py-3.5 mt-2 rounded-full shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all">
                Publish Custom Request
              </button>
            </div>
          </form>
        </div>

        {/* Requests List & Bids Board */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-end border-b border-[var(--border)] pb-3 mb-6">
            <h3 className="text-lg font-bold tracking-tight">Active Outcome Requests</h3>
            <span className="text-xs font-medium text-[var(--muted)] bg-[var(--secondary-bg)] px-3 py-1 rounded-full">
              {loading ? 'Loading...' : `${requests.length} requests`}
            </span>
          </div>
          
          {loading ? (
            <p className="text-sm text-[var(--muted)] text-center py-12">Loading board requests...</p>
          ) : requests.length === 0 ? (
            <div className="border border-[var(--border)] p-16 text-center text-sm text-[var(--muted)] rounded-3xl bg-[var(--secondary-bg)]/20">
              No custom requests posted yet. Be the first!
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {requests.map(req => (
                <div key={req.id} className="bg-[var(--card-bg)] p-6 sm:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.02)] border border-[var(--border)]/50 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex gap-2 items-center mb-2">
                        <span className="text-[10px] uppercase font-semibold tracking-wider text-[var(--muted)] bg-[var(--secondary-bg)] px-2.5 py-1 rounded-md">Requested by {req.profiles?.name || 'User'}</span>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${req.request_type === 'free' ? 'bg-[var(--success)]/10 text-[var(--success)]' : 'bg-[var(--foreground)]/5 text-[var(--foreground)] border border-[var(--border)]'}`}>
                          {req.request_type}
                        </span>
                      </div>
                      <h4 className="text-xl sm:text-2xl font-bold tracking-tight mt-1">{req.title}</h4>
                    </div>
                    <span className="text-lg font-bold text-[var(--success)] tracking-tight">
                      {req.budget ? `$${req.budget.toFixed(2)}` : 'FREE'}
                    </span>
                  </div>

                  <p className="text-sm text-[var(--muted)] mt-3 leading-relaxed">{req.description}</p>
                  
                  <div className="flex gap-4 mt-4 text-[11px] text-[var(--muted)] font-medium bg-[var(--secondary-bg)]/30 w-max px-3 py-1.5 rounded-full border border-[var(--border)]/30">
                    <span>Status: <strong className="text-[var(--foreground)] tracking-wide uppercase">{req.status}</strong></span>
                    <span>Ends: {new Date(req.deadline).toLocaleDateString()}</span>
                  </div>

                  {/* Apple-Style Lifecycle Stepper */}
                  <div className="mt-8 mb-4 px-4 max-w-sm">
                    <div className="flex items-center justify-between relative">
                      {/* Progress Line Background */}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-[var(--secondary-bg)] rounded-full -z-10"></div>
                      {/* Progress Line Active */}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[var(--success)] rounded-full -z-10 transition-all duration-700 ease-in-out" style={{ width: req.status === 'completed' ? '100%' : (req.status === 'matched' || req.status === 'accepted' ? '50%' : '0%') }}></div>
                      
                      {/* Step 1: Open */}
                      <div className="flex flex-col items-center gap-2 bg-[var(--card-bg)] px-2">
                        <div className={`w-4 h-4 rounded-full border-4 shadow-sm transition-colors duration-500 ${req.status === 'open' || req.status === 'matched' || req.status === 'accepted' || req.status === 'completed' ? 'bg-[var(--success)] border-[var(--success)]/20' : 'bg-[var(--secondary-bg)] border-[var(--border)]'}`}></div>
                        <span className={`text-[10px] font-semibold tracking-wider ${req.status === 'open' ? 'text-[var(--foreground)]' : 'text-[var(--muted)]'}`}>Open</span>
                      </div>

                      {/* Step 2: Locked */}
                      <div className="flex flex-col items-center gap-2 bg-[var(--card-bg)] px-2">
                        <div className={`w-4 h-4 rounded-full border-4 shadow-sm transition-colors duration-500 ${req.status === 'matched' || req.status === 'accepted' || req.status === 'completed' ? 'bg-[var(--success)] border-[var(--success)]/20' : 'bg-[var(--secondary-bg)] border-[var(--border)]'}`}></div>
                        <span className={`text-[10px] font-semibold tracking-wider ${req.status === 'matched' || req.status === 'accepted' ? 'text-[var(--foreground)]' : 'text-[var(--muted)]'}`}>Escrow</span>
                      </div>

                      {/* Step 3: Completed */}
                      <div className="flex flex-col items-center gap-2 bg-[var(--card-bg)] px-2">
                        <div className={`w-4 h-4 rounded-full border-4 shadow-sm transition-colors duration-500 ${req.status === 'completed' ? 'bg-[var(--success)] border-[var(--success)]/20' : 'bg-[var(--secondary-bg)] border-[var(--border)]'}`}></div>
                        <span className={`text-[10px] font-semibold tracking-wider ${req.status === 'completed' ? 'text-[var(--foreground)]' : 'text-[var(--muted)]'}`}>Done</span>
                      </div>
                    </div>
                  </div>

                  {/* Bids drawer section */}
                  <div className="border-t border-[var(--border)]/50 pt-5 mt-6">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-wider">Bids from Providers</span>
                      <button
                        onClick={() => fetchBidsForRequest(req.id)}
                        className="text-xs font-semibold text-[var(--foreground)] hover:text-[var(--success)] transition-colors flex items-center gap-1 bg-[var(--secondary-bg)] px-3 py-1.5 rounded-full"
                      >
                        {selectedRequestBids[req.id] ? 'Refresh Bids' : 'View Bids'}
                        <span className="text-[10px]">▼</span>
                      </button>
                    </div>

                    {bidsLoading[req.id] && (
                      <p className="text-xs text-[var(--muted)] mt-4 animate-pulse">Loading bids...</p>
                    )}

                    {selectedRequestBids[req.id] && (
                      <div className="mt-4 flex flex-col gap-3 animate-in slide-in-from-top-2 fade-in duration-300">
                        {selectedRequestBids[req.id].length === 0 ? (
                          <div className="p-4 bg-[var(--secondary-bg)]/50 rounded-2xl text-center">
                            <p className="text-sm text-[var(--muted)] m-0">No bids submitted yet.</p>
                          </div>
                        ) : (
                          selectedRequestBids[req.id].map(bid => (
                            <div key={bid.id} className="p-4 bg-[var(--secondary-bg)]/80 backdrop-blur-sm border border-[var(--border)]/50 rounded-2xl flex justify-between items-center shadow-sm">
                              <div>
                                <span className="font-bold text-sm block mb-1">{bid.profiles?.name || 'Provider'}</span>
                                <span className="text-[10px] text-[var(--muted)] font-medium bg-[var(--background)] px-2 py-0.5 rounded-md">Delivery in {bid.delivery_time} &bull; Status: {bid.status.toUpperCase()}</span>
                              </div>
                              <div className="flex items-center gap-4">
                                <strong className="text-lg tracking-tight">${bid.bid_amount.toFixed(2)}</strong>
                                {req.status === 'open' && bid.status === 'pending' && userId === req.requester_id && (
                                  <button
                                    onClick={() => handleAcceptBid(bid.id, req.id)}
                                    className="bg-[var(--foreground)] text-[var(--background)] text-xs font-bold py-2 px-5 rounded-full hover:scale-[1.03] active:scale-[0.97] transition-all shadow-md"
                                  >
                                    Accept Bid
                                  </button>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
