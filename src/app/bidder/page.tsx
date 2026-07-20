'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
    inputsString: '{\n  "startup_url": "string"\n}',
    outputsString: '{\n  "report_pdf": "string"\n}'
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
      const inputs = JSON.parse(requestForm.inputsString);
      const outputs = JSON.parse(requestForm.outputsString);
      
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
      <div className="border-b border-[var(--border)] pb-6 mb-8">
        <h1>TaskBidder Board</h1>
        <p className="m-0 text-sm">
          If a standardized task doesn&apos;t exist, post a custom request and let creators bid to complete it.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Post Request Form Card */}
        <div className="lg:col-span-1">
          <form onSubmit={handleCreateRequest} className="nyxa-card sticky top-24">
            <h3 className="border-b border-[var(--border)] pb-2 mb-4 font-bold">Request Custom Outcome</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] uppercase font-semibold text-[var(--muted)]">Request Type</label>
                <select
                  value={requestForm.request_type}
                  onChange={(e) => setRequestForm({
                    ...requestForm,
                    request_type: e.target.value,
                    budget: e.target.value === 'free' ? 0 : 25,
                    deadline_days: e.target.value === 'free' ? 7 : 3
                  })}
                  className="w-full mt-1 p-2 bg-[var(--secondary-bg)] border border-[var(--border)] rounded text-sm"
                >
                  <option value="paid">Paid Request (3 days default)</option>
                  <option value="free">Free Request (7 days default)</option>
                  <option value="bounty">Bounty Request (Fixed Reward)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-semibold text-[var(--muted)]">Outcome Requirement Title</label>
                <input
                  type="text"
                  placeholder="e.g. Scrape positioning data of competitors"
                  value={requestForm.title}
                  onChange={(e) => setRequestForm({ ...requestForm, title: e.target.value })}
                  className="w-full mt-1 p-2 bg-[var(--secondary-bg)] border border-[var(--border)] rounded text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-semibold text-[var(--muted)]">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe your exact goal. Explain what successful output looks like."
                  value={requestForm.description}
                  onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                  className="w-full mt-1 p-2 bg-[var(--secondary-bg)] border border-[var(--border)] rounded text-sm"
                  required
                />
              </div>

              {requestForm.request_type !== 'free' && (
                <div>
                  <label className="text-[10px] uppercase font-semibold text-[var(--muted)]">Target Budget ($)</label>
                  <input
                    type="number"
                    value={requestForm.budget}
                    onChange={(e) => setRequestForm({ ...requestForm, budget: Number(e.target.value) })}
                    className="w-full mt-1 p-2 bg-[var(--secondary-bg)] border border-[var(--border)] rounded text-sm"
                    required
                  />
                </div>
              )}

              <div>
                <label className="text-[10px] uppercase font-semibold text-[var(--muted)]">Deadline (Days from now)</label>
                <input
                  type="number"
                  max={30}
                  value={requestForm.deadline_days}
                  onChange={(e) => setRequestForm({ ...requestForm, deadline_days: Number(e.target.value) })}
                  className="w-full mt-1 p-2 bg-[var(--secondary-bg)] border border-[var(--border)] rounded text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-semibold text-[var(--muted)]">Inputs Provided (JSON)</label>
                <textarea
                  rows={3}
                  value={requestForm.inputsString}
                  onChange={(e) => setRequestForm({ ...requestForm, inputsString: e.target.value })}
                  className="w-full mt-1 p-2 bg-[var(--secondary-bg)] border border-[var(--border)] rounded text-xs tech-mono"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-semibold text-[var(--muted)]">Expected Output Format (JSON)</label>
                <textarea
                  rows={3}
                  value={requestForm.outputsString}
                  onChange={(e) => setRequestForm({ ...requestForm, outputsString: e.target.value })}
                  className="w-full mt-1 p-2 bg-[var(--secondary-bg)] border border-[var(--border)] rounded text-xs tech-mono"
                />
              </div>

              <button type="submit" className="nyxa-btn nyxa-btn-primary py-2 mt-2 rounded">
                Publish Custom Request
              </button>
            </div>
          </form>
        </div>

        {/* Requests List & Bids Board */}
        <div className="lg:col-span-2">
          <h3 className="text-sm font-semibold border-b border-[var(--border)] pb-2 mb-6">Active Outcome Requests</h3>
          
          {loading ? (
            <p className="text-xs text-[var(--muted)]">Loading board requests...</p>
          ) : requests.length === 0 ? (
            <p className="text-xs text-[var(--muted)]">No custom requests posted yet. Be the first!</p>
          ) : (
            <div className="flex flex-col gap-6">
              {requests.map(req => (
                <div key={req.id} className="nyxa-card">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex gap-2 items-center">
                        <span className="text-[9px] uppercase tracking-wider font-mono text-[var(--muted)]">Requested by {req.profiles?.name || 'User'}</span>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${req.request_type === 'free' ? 'bg-[var(--success)] text-[var(--background)]' : 'border border-[var(--border)]'}`}>
                          {req.request_type.toUpperCase()}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm mt-1">{req.title}</h4>
                    </div>
                    <span className="text-xs font-bold text-[var(--success)] tech-mono">
                      {req.budget ? `$${req.budget.toFixed(2)}` : 'FREE'}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--muted)] mt-2">{req.description}</p>
                  
                  <div className="flex gap-4 mt-3 text-[10px] text-[var(--muted)] font-mono">
                    <span>Status: <strong className="text-[var(--foreground)]">{req.status.toUpperCase()}</strong></span>
                    <span>Ends: {new Date(req.deadline).toLocaleDateString()}</span>
                  </div>

                  {/* Bids drawer section */}
                  <div className="border-t border-[var(--border)] pt-3 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase font-bold text-[var(--muted)]">Bids from Providers</span>
                      <button
                        onClick={() => fetchBidsForRequest(req.id)}
                        className="text-[10px] text-[var(--foreground)] hover:underline border-0 bg-transparent cursor-pointer"
                      >
                        {selectedRequestBids[req.id] ? 'Refresh Bids' : 'View Bids'}
                      </button>
                    </div>

                    {bidsLoading[req.id] && (
                      <p className="text-[10px] text-[var(--muted)] mt-2">Loading bids...</p>
                    )}

                    {selectedRequestBids[req.id] && (
                      <div className="mt-3 flex flex-col gap-2">
                        {selectedRequestBids[req.id].length === 0 ? (
                          <p className="text-[10px] text-[var(--muted)] m-0">No bids submitted yet.</p>
                        ) : (
                          selectedRequestBids[req.id].map(bid => (
                            <div key={bid.id} className="p-2.5 bg-[var(--secondary-bg)] border border-[var(--border)] rounded flex justify-between items-center text-xs">
                              <div>
                                <span className="font-semibold block">{bid.profiles?.name || 'Provider'}</span>
                                <span className="text-[10px] text-[var(--muted)] font-mono">Delivery in {bid.delivery_time} &bull; Status: {bid.status.toUpperCase()}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <strong className="tech-mono">${bid.bid_amount.toFixed(2)}</strong>
                                {req.status === 'open' && bid.status === 'pending' && userId === req.requester_id && (
                                  <button
                                    onClick={() => handleAcceptBid(bid.id, req.id)}
                                    className="nyxa-btn nyxa-btn-primary text-[9px] py-1 px-2.5 rounded bg-[var(--foreground)] text-[var(--background)]"
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
