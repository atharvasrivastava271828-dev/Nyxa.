'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Agent {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  price_demand: number;
  score: number;
  total_transactions: number;
  status: string;
  provider_id: string;
}

function generateMockPaymentId() {
  return `mock_pay_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

export default function AgentMarketplace() {
  // Client session
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRoles, setUserRoles] = useState<{ is_provider: boolean } | null>(null);
  
  const [agents, setAgents] = useState<Agent[]>([]);
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCapability, setSelectedCapability] = useState('all');

  // New agent form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [capabilitiesInput, setCapabilitiesInput] = useState('');
  const [price, setPrice] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchAgents() {
    try {
      const res = await fetch('/api/agents');
      const data = await res.json();
      if (res.ok) {
        setAgents(data.agents || []);
      }
    } catch (err) {
      console.error('Failed to load agents:', err);
    }
  }

  // 1. Session verification & load agents
  useEffect(() => {
    const id = localStorage.getItem('nyxa_user_id');
    const uName = localStorage.getItem('nyxa_user_name');
    const rolesStr = localStorage.getItem('nyxa_user_roles');
    
    if (id) {
      setTimeout(() => {
        setUserId(id);
        setUserName(uName);
        if (rolesStr) {
          try {
            const rolesArr = JSON.parse(rolesStr);
            if (Array.isArray(rolesArr)) {
              setUserRoles({
                is_provider: rolesArr.includes('provider')
              });
            } else {
              setUserRoles({
                is_provider: !!rolesArr.is_provider || !!rolesArr.is_developer || !!rolesArr.is_seller
              });
            }
          } catch (e) {
            setUserRoles(null);
          }
        }
      }, 0);
    }
    
    setTimeout(() => {
      fetchAgents();
    }, 0);
  }, []);

  // Compute filtered agents dynamically during render
  const filteredAgents = agents.filter(agent => {
    const query = searchTerm.toLowerCase();
    const matchesSearch = searchTerm.trim() === '' ||
      agent.name.toLowerCase().includes(query) ||
      agent.description.toLowerCase().includes(query);

    const matchesCapability = selectedCapability === 'all' ||
      agent.capabilities.some(cap => cap.toLowerCase() === selectedCapability.toLowerCase());

    return matchesSearch && matchesCapability;
  });

  // Extract all unique capabilities from list of agents for dynamic filtering
  const allCapabilities = Array.from(
    new Set(agents.flatMap(agent => agent.capabilities.map(c => c.toLowerCase())))
  );

  // 2. Submit new agent profile
  const handleRegisterAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!userId) {
      setError('You must be logged in to register an agent.');
      setLoading(false);
      return;
    }

    if (userRoles && !userRoles.is_provider) {
      setError('Permission Denied: Only users with the "Provider" role can register new agents.');
      setLoading(false);
      return;
    }

    const capabilities = capabilitiesInput
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0);

    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_id: userId,
          name,
          description,
          capabilities,
          price_demand: parseFloat(price)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register agent.');
      }

      // Reset form fields
      setName('');
      setDescription('');
      setCapabilitiesInput('');
      setPrice('');
      fetchAgents();
    } catch (err: any) {
      setError(err.message || 'Error occurred during agent registration.');
    } finally {
      setLoading(false);
    }
  };

  const handleHireAgent = async (agent: Agent) => {
    if (!userId) {
      alert('Please log in to hire this agent.');
      return;
    }

    if (userId === agent.provider_id) {
      alert('You cannot hire your own agent.');
      return;
    }

    const platformFee = agent.price_demand * 0.10;
    const totalAmount = agent.price_demand + platformFee;

    const confirmPayment = confirm(
      `Hire "${agent.name}"?\n\n` +
      `Agent Price: $${agent.price_demand.toFixed(2)}\n` +
      `Platform Fee (10%): $${platformFee.toFixed(2)}\n` +
      `Total Charged: $${totalAmount.toFixed(2)}\n\n` +
      `Funds will be held in Escrow until delivery is confirmed.`
    );

    if (!confirmPayment) return;

    try {
      setLoading(true);
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerAgentId: agent.id,
          buyerUserId: userId,
          sellerUserId: agent.provider_id,
          amount: agent.price_demand
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
        `Your payment for "${agent.name}" has been verified.\n` +
        `Order ID: ${data.order.id}\n\n` +
        `Funds are now held securely in Escrow. Track status on your Dashboard.`
      );
    } catch (err: any) {
      alert(err.message || 'Checkout failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nyxa-container">
      <div className="border-b border-[var(--border)] pb-6 mb-8">
        <h1>Agents</h1>
        <p className="m-0 text-sm">
          Find AI agents built for specific jobs. Hire one in seconds.
        </p>
      </div>

      {/* Guest Alert Banner */}
      {!userId && (
        <div className="border border-[var(--border)] p-4 mb-8 bg-[var(--secondary-bg)] text-sm flex justify-between items-center rounded-lg">
          <span>You&apos;re browsing as a guest. Log in to hire or register agents.</span>
          <Link href="/login" className="nyxa-btn nyxa-btn-primary py-1 px-3 text-xs">Log In</Link>
        </div>
      )}

      {/* Dashboard Sub-Info */}
      {userId && (
        <div className="border border-[var(--border)] px-4 py-3 mb-8 bg-[var(--secondary-bg)] text-xs tech-mono flex justify-between items-center rounded-lg">
          <span>Active Session: {userName} ({userId.slice(0, 8)}...)</span>
          {userRoles?.is_provider ? (
            <span className="text-[var(--success)]">&bull; Developer registration active</span>
          ) : (
            <span className="text-[var(--muted)]">&bull; Browse access only</span>
          )}
        </div>
      )}

      {/* Grid Layout */}
      <div className="nyxa-grid-sidebar">
        {/* Left Sidebar: Controls & Registration */}
        <aside className="flex flex-col gap-6">
          {/* Filters Card */}
          <div className="nyxa-card">
            <h3 className="border-b border-[var(--border)] pb-2 mb-4 font-semibold">Filter Agents</h3>
            <div className="flex flex-col gap-4">
              {/* Search */}
              <div>
                <label className="nyxa-label">Search agents</label>
                <div className="search-container">
                  <span className="search-icon tech-mono text-xs">Search</span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, description..."
                    className="nyxa-input search-input text-sm"
                  />
                </div>
              </div>

              {/* Capabilities */}
              <div>
                <label className="nyxa-label">Capability</label>
                <select
                  value={selectedCapability}
                  onChange={(e) => setSelectedCapability(e.target.value)}
                  className="nyxa-select text-sm"
                >
                  <option value="all">All</option>
                  {allCapabilities.map(cap => (
                    <option key={cap} value={cap}>
                      {cap.charAt(0).toUpperCase() + cap.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Registration form */}
          <div className="nyxa-card">
            <h3 className="border-b border-[var(--border)] pb-2 mb-4 font-semibold">List Your Agent</h3>
            
            {error && (
              <div className="border border-red-800 p-3 bg-red-950/20 text-red-400 text-xs mb-4 uppercase rounded-md">
                {error}
              </div>
            )}

            <form onSubmit={handleRegisterAgent} className="flex flex-col gap-4">
              <div>
                <label className="nyxa-label">Agent name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. CodeResolver"
                  required
                  className="nyxa-input text-sm"
                />
              </div>

              <div>
                <label className="nyxa-label">What does this agent do?</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe task processing methods, API bindings, and expected inputs..."
                  rows={3}
                  required
                  className="nyxa-textarea text-sm"
                ></textarea>
              </div>

              <div>
                <label className="nyxa-label">Capabilities (e.g. research, coding, writing)</label>
                <input
                  type="text"
                  value={capabilitiesInput}
                  onChange={(e) => setCapabilitiesInput(e.target.value)}
                  placeholder="research, programming, design"
                  required
                  className="nyxa-input text-sm tech-mono"
                />
                <small className="text-[10px] text-[var(--muted)] leading-tight block mt-1 uppercase">
                  Tags: research, programming, development, copywriting, design, ui_ux, data_analysis, marketing, sales, workflow_automation
                </small>
              </div>

              <div>
                <label className="nyxa-label">Price per task (USD)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="10"
                  required
                  className="nyxa-input text-sm tech-mono"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !!(userRoles && !userRoles.is_provider)}
                className="nyxa-btn nyxa-btn-primary w-full text-xs"
              >
                {loading ? 'Listing...' : 'List Agent'}
              </button>
              
              {userRoles && !userRoles.is_provider && (
                <span className="text-[10px] text-red-500 text-center mt-1">
                  Developer profile required to list agents
                </span>
              )}
            </form>
          </div>
        </aside>

        {/* Right Main Panel: Agent Cards */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg tracking-tight mb-2 font-semibold border-b border-[var(--border)] pb-2 flex justify-between items-center">
            <span>Agents</span>
            <span className="tech-mono text-xs text-[var(--muted)]">
              {filteredAgents.length === 0 ? '0 agents listed yet' : `${filteredAgents.length} ${filteredAgents.length === 1 ? 'agent' : 'agents'} listed`}
            </span>
          </h2>

          {filteredAgents.length === 0 ? (
            <div className="border border-[var(--border)] p-12 text-center text-sm text-[var(--muted)] flex flex-col items-center gap-4 rounded-lg">
              <div>No agents here yet. Be the first to list one.</div>
              {userId && (
                <button 
                  onClick={async () => {
                    setLoading(true);
                    try {
                      const res = await fetch('/api/agents/seed', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId })
                      });
                      if (res.ok) {
                         alert('Demo agents loaded successfully!');
                         fetchAgents();
                      } else {
                         const data = await res.json();
                         alert('Failed to load agents: ' + (data.error || 'Unknown error'));
                      }
                    } catch (err) {
                      alert('Failed to load agents.');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="nyxa-btn nyxa-btn-secondary py-1.5 px-4 text-xs"
                >
                  {loading ? 'Loading...' : 'Load Demo Agents'}
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAgents.map(agent => (
                <div key={agent.id} className="nyxa-card">
                  {/* Title & Score */}
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <div>
                      <h3 className="mb-0.5">{agent.name}</h3>
                      <span className="tech-mono text-[10px] text-[var(--muted)] select-all">ID: {agent.id}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-bold text-[var(--foreground)] tech-mono">
                        ★ {agent.score.toFixed(1)}
                      </span>
                      <span className="text-[9px] text-[var(--muted)] tracking-wider">
                        {agent.total_transactions} {agent.total_transactions === 1 ? 'job' : 'jobs'}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs leading-relaxed mt-2 mb-4 flex-grow">{agent.description}</p>

                  {/* Capabilities */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {agent.capabilities.map(cap => (
                      <span
                        key={cap}
                        className="tech-mono text-[10px] bg-[var(--secondary-bg)] px-2 py-0.5 border border-[var(--border)] text-[var(--foreground)]"
                      >
                        #{cap}
                      </span>
                    ))}
                  </div>

                  {/* Pricing Footer */}
                  <div className="border-t border-[var(--border)] pt-3 flex justify-between items-center mt-auto">
                    <div>
                      <span className="text-[10px] text-[var(--muted)] tracking-wider">Price</span>
                      <strong className="tech-mono text-sm block">${agent.price_demand.toFixed(2)}/run</strong>
                    </div>
                    <button
                      onClick={() => handleHireAgent(agent)}
                      disabled={loading}
                      className="nyxa-btn nyxa-btn-primary text-xs py-1.5 px-4"
                    >
                      {loading ? 'Processing...' : 'Hire Agent'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
