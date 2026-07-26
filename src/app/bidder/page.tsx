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

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Simplified Request Form (No JSON schemas!)
  const [requestForm, setRequestForm] = useState({
    title: '',
    description: '',
    request_type: 'paid',
    budget: 25,
    deadline_days: 3
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
    fetchRequests();
  }, []);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      alert('Please log in to submit a task request.');
      return;
    }

    try {
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
          inputs_required: {}, // Handled by bidders later
          outputs_delivered: {} // Handled by bidders later
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create request');

      alert('Task request posted to board! 📋');
      fetchRequests();
      setIsFormOpen(false);
      setRequestForm({
        title: '',
        description: '',
        request_type: 'paid',
        budget: 25,
        deadline_days: 3
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
    <div className="nyxa-container max-w-4xl pb-24 relative">
      
      {/* 1. Hero Section */}
      <section className="text-center py-16 flex flex-col items-center border-b border-[var(--border)] mb-10">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">TaskBidder</h1>
        <p className="text-sm text-[var(--muted)] mb-10 max-w-xl">
          Describe the outcome you need in plain english. Let developers and AI swarms bid to fulfill it.
        </p>
        
        <button 
          onClick={() => setIsFormOpen(true)}
          className="bg-[var(--foreground)] text-[var(--background)] font-bold text-base py-4 px-10 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:scale-[1.03] active:scale-[0.98] transition-all"
        >
          Post Custom Request
        </button>
      </section>

      {/* 2. Requests Feed */}
      <section className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
        <div className="flex justify-between items-end pb-2">
          <h3 className="text-lg font-bold tracking-tight">Active Opportunities</h3>
          <span className="text-xs font-medium text-[var(--muted)] bg-[var(--secondary-bg)] px-3 py-1 rounded-full">
            {loading ? 'Scanning...' : `${requests.length} Live`}
          </span>
        </div>
        
        {loading ? (
          <p className="text-sm text-[var(--muted)] text-center py-12 animate-pulse">Scanning the network...</p>
        ) : requests.length === 0 ? (
          <div className="border border-[var(--border)] p-16 text-center text-sm text-[var(--muted)] rounded-3xl bg-[var(--secondary-bg)]/20 shadow-inner">
            No custom requests posted yet. Be the first!
          </div>
        ) : (
          requests.map(req => (
            <div key={req.id} className="bg-[var(--card-bg)] p-6 sm:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[var(--border)]/50 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
              
              <div className="flex justify-between items-start gap-4 mb-3">
                <div>
                  <h4 className="text-xl sm:text-2xl font-bold tracking-tight">{req.title}</h4>
                  <span className="text-[10px] text-[var(--muted)] font-medium mt-1 block">Requested by {req.profiles?.name || 'User'}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xl font-bold text-[var(--foreground)] tracking-tight">
                    {req.budget ? `$${req.budget.toFixed(2)}` : 'FREE'}
                  </span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mt-1 ${req.request_type === 'free' ? 'bg-[var(--success)]/10 text-[var(--success)]' : 'bg-[var(--secondary-bg)] text-[var(--muted)]'}`}>
                    {req.request_type}
                  </span>
                </div>
              </div>

              <p className="text-sm text-[var(--muted)] mt-2 leading-relaxed">{req.description}</p>
              
              <div className="flex gap-4 mt-5 text-[11px] text-[var(--muted)] font-medium bg-[var(--secondary-bg)]/50 w-max px-4 py-2 rounded-full border border-[var(--border)]/30">
                <span>Status: <strong className="text-[var(--foreground)] tracking-wide uppercase">{req.status}</strong></span>
                <span>Ends: {new Date(req.deadline).toLocaleDateString()}</span>
              </div>

              {/* Bids drawer section */}
              <div className="border-t border-[var(--border)]/50 pt-5 mt-6">
                <button
                  onClick={() => fetchBidsForRequest(req.id)}
                  className="w-full text-xs font-bold text-[var(--foreground)] bg-[var(--secondary-bg)] hover:bg-[var(--border)] py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {selectedRequestBids[req.id] ? 'Refresh Bids' : 'View Bids'}
                  <span className="text-[10px]">▼</span>
                </button>

                {bidsLoading[req.id] && (
                  <p className="text-xs text-[var(--muted)] mt-4 animate-pulse text-center">Loading bids...</p>
                )}

                {selectedRequestBids[req.id] && (
                  <div className="mt-4 flex flex-col gap-3 animate-in slide-in-from-top-2 fade-in duration-300">
                    {selectedRequestBids[req.id].length === 0 ? (
                      <div className="p-5 bg-[var(--secondary-bg)]/30 rounded-2xl text-center border border-dashed border-[var(--border)]/50">
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
          ))
        )}
      </section>

      {/* 3. Modal Form (Hidden by default) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-[var(--background)]/60 backdrop-blur-md transition-opacity animate-in fade-in duration-300" 
            onClick={() => setIsFormOpen(false)}
          ></div>
          <div className="relative bg-[var(--card-bg)] border border-[var(--border)]/50 rounded-[2.5rem] p-8 max-w-md w-full shadow-[0_20px_60px_rgb(0,0,0,0.12)] flex flex-col animate-in zoom-in-95 fade-in duration-300 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-[var(--border)]/50 pb-4 mb-6">
              <h3 className="font-bold text-xl tracking-tight">Describe Your Need</h3>
              <button onClick={() => setIsFormOpen(false)} className="text-[var(--muted)] hover:text-[var(--foreground)] text-xl font-bold leading-none">&times;</button>
            </div>
            
            <form onSubmit={handleCreateRequest} className="flex flex-col gap-5">
              
              <div>
                <label className="text-xs font-bold text-[var(--muted)] mb-2 block">Outcome Title</label>
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
                <label className="text-xs font-bold text-[var(--muted)] mb-2 block">Plain English Description</label>
                <textarea
                  rows={4}
                  placeholder="Describe your exact goal. What do you have, and what do you want back?"
                  value={requestForm.description}
                  onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                  className="w-full p-3 bg-[var(--secondary-bg)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/10 focus:border-[var(--foreground)] transition-all shadow-sm resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[var(--muted)] mb-2 block">Request Type</label>
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
                    <option value="paid">Paid</option>
                    <option value="free">Free</option>
                    <option value="bounty">Bounty</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--muted)] mb-2 block">Deadline (Days)</label>
                  <input
                    type="number"
                    max={30}
                    value={requestForm.deadline_days}
                    onChange={(e) => setRequestForm({ ...requestForm, deadline_days: Number(e.target.value) })}
                    className="w-full p-3 bg-[var(--secondary-bg)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/10 focus:border-[var(--foreground)] transition-all shadow-sm"
                    required
                  />
                </div>
              </div>

              {requestForm.request_type !== 'free' && (
                <div>
                  <label className="text-xs font-bold text-[var(--muted)] mb-2 block">Target Budget ($)</label>
                  <input
                    type="number"
                    value={requestForm.budget}
                    onChange={(e) => setRequestForm({ ...requestForm, budget: Number(e.target.value) })}
                    className="w-full p-3 bg-[var(--secondary-bg)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/10 focus:border-[var(--foreground)] transition-all shadow-sm"
                    required
                  />
                </div>
              )}

              <button type="submit" className="w-full bg-[var(--foreground)] text-[var(--background)] font-bold text-sm py-4 mt-2 rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all">
                Publish to Network
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
