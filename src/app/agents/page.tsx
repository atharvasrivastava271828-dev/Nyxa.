'use client';

import { useState, useEffect } from 'react';

interface Agent {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  price_demand: number;
  score: number;
  total_transactions: number;
  status: string;
}

export default function AgentMarketplace() {
  // Client session
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRoles, setUserRoles] = useState<{ is_developer: boolean } | null>(null);
  
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  
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

  // 1. Session verification & load agents
  useEffect(() => {
    const id = localStorage.getItem('nyxa_user_id');
    const uName = localStorage.getItem('nyxa_user_name');
    const rolesStr = localStorage.getItem('nyxa_user_roles');
    
    if (id) {
      setUserId(id);
      setUserName(uName);
      if (rolesStr) setUserRoles(JSON.parse(rolesStr));
    }
    
    fetchAgents();
  }, []);

  // Filter logic
  useEffect(() => {
    let result = agents;

    if (searchTerm.trim() !== '') {
      const query = searchTerm.toLowerCase();
      result = result.filter(
        agent =>
          agent.name.toLowerCase().includes(query) ||
          agent.description.toLowerCase().includes(query)
      );
    }

    if (selectedCapability !== 'all') {
      result = result.filter(agent =>
        agent.capabilities.some(cap => cap.toLowerCase() === selectedCapability.toLowerCase())
      );
    }

    setFilteredAgents(result);
  }, [searchTerm, selectedCapability, agents]);

  const fetchAgents = async () => {
    try {
      const res = await fetch('/api/agents');
      const data = await res.json();
      if (res.ok) {
        setAgents(data.agents || []);
      }
    } catch (err) {
      console.error('Failed to load agents:', err);
    }
  };

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

    if (userRoles && !userRoles.is_developer) {
      setError('Permission Denied: Only users with the "Developer" role can register new agents.');
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
          developer_id: userId,
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

  return (
    <div className="nyxa-container">
      <div className="border-b border-[var(--border)] pb-6 mb-8">
        <h1>AGENT DIRECTORY</h1>
        <p className="m-0 text-sm">
          Browse functional AI agents cataloged in the system. Fulfill specialized workflows dynamically.
        </p>
      </div>

      {/* Guest Alert Banner */}
      {!userId && (
        <div className="border border-[var(--border)] p-4 mb-8 bg-[var(--secondary-bg)] text-sm uppercase tracking-wide flex justify-between items-center">
          <span>⚠️ GUEST ACCESS STATE &bull; LOGIN REQUIRED TO LAUNCH OR MANAGE AI INSTANCES</span>
          <a href="/login" className="nyxa-btn nyxa-btn-primary py-1 px-3 text-xs">LOGIN &rarr;</a>
        </div>
      )}

      {/* Dashboard Sub-Info */}
      {userId && (
        <div className="border border-[var(--border)] px-4 py-3 mb-8 bg-[var(--secondary-bg)] text-xs tech-mono flex justify-between items-center">
          <span>ACTIVE SESSION: {userName} ({userId.slice(0, 8)}...)</span>
          {userRoles?.is_developer ? (
            <span className="text-[var(--success)]">&bull; DEVELOPER REGISTRATION ENABLED</span>
          ) : (
            <span className="text-[var(--muted)]">&bull; BROWSE ACCESS ONLY (DEVELOPER PROFILE REQUIRED TO LIST AGENTS)</span>
          )}
        </div>
      )}

      {/* Grid Layout */}
      <div className="nyxa-grid-sidebar">
        {/* Left Sidebar: Controls & Registration */}
        <aside className="flex flex-col gap-6">
          {/* Filters Card */}
          <div className="nyxa-card">
            <h3 className="border-b border-[var(--border)] pb-2 mb-4">AGENT FILTERS</h3>
            <div className="flex flex-col gap-4">
              {/* Search */}
              <div>
                <label className="nyxa-label">Search Bot Catalog</label>
                <div className="search-container">
                  <span className="search-icon tech-mono text-xs">[FIND]</span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, description..."
                    className="nyxa-input search-input text-sm tech-mono"
                  />
                </div>
              </div>

              {/* Capabilities */}
              <div>
                <label className="nyxa-label">Capability Type</label>
                <select
                  value={selectedCapability}
                  onChange={(e) => setSelectedCapability(e.target.value)}
                  className="nyxa-select text-sm"
                >
                  <option value="all">ALL CAPABILITIES</option>
                  {allCapabilities.map(cap => (
                    <option key={cap} value={cap}>
                      {cap.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Registration form */}
          <div className="nyxa-card">
            <h3 className="border-b border-[var(--border)] pb-2 mb-4">REGISTER AN AGENT</h3>
            
            {error && (
              <div className="border border-red-800 p-3 bg-red-950/20 text-red-400 text-xs mb-4 uppercase">
                {error}
              </div>
            )}

            <form onSubmit={handleRegisterAgent} className="flex flex-col gap-4">
              <div>
                <label className="nyxa-label">Agent Identifier</label>
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
                <label className="nyxa-label">System Capability Directives</label>
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
                <label className="nyxa-label">Capabilities (comma separated)</label>
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
                <label className="nyxa-label">Price Demand per Execution (USD)</label>
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
                disabled={loading || !!(userRoles && !userRoles.is_developer)}
                className="nyxa-btn nyxa-btn-primary w-full text-xs"
              >
                {loading ? 'REGISTERING INFRASTRUCTURE...' : 'REGISTER AGENT'}
              </button>
              
              {userRoles && !userRoles.is_developer && (
                <span className="text-[10px] text-red-500 uppercase text-center mt-1">
                  Developer profile required to list agents
                </span>
              )}
            </form>
          </div>
        </aside>

        {/* Right Main Panel: Agent Cards */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg tracking-wider mb-2 uppercase border-b border-[var(--border)] pb-2 flex justify-between items-center">
            <span>ACTIVE SOLVER INSTANCES</span>
            <span className="tech-mono text-xs text-[var(--muted)]">INDEX COUNT: {filteredAgents.length}</span>
          </h2>

          {filteredAgents.length === 0 ? (
            <div className="border border-[var(--border)] p-12 text-center text-sm uppercase tracking-wider text-[var(--muted)]">
              No registered agents matches the selected capabilities.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAgents.map(agent => (
                <div key={agent.id} className="nyxa-card">
                  {/* Title & Score */}
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <div>
                      <h3 className="mb-0.5">{agent.name}</h3>
                      <span className="tech-mono text-[10px] text-[var(--muted)] select-all">UID: {agent.id}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-bold text-[var(--foreground)] tech-mono">
                        ★ {agent.score.toFixed(1)}
                      </span>
                      <span className="text-[9px] uppercase text-[var(--muted)] tracking-wider">
                        {agent.total_transactions} JOBS
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
                    <span className="text-[10px] uppercase text-[var(--muted)] tracking-wider">Demanded Rate</span>
                    <strong className="tech-mono text-sm">${agent.price_demand.toFixed(2)}/run</strong>
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
