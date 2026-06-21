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
  // Client state
  const [userId, setUserId] = useState<string | null>(null);
  const [userRoles, setUserRoles] = useState<{ is_developer: boolean } | null>(null);
  
  const [agents, setAgents] = useState<Agent[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [capabilitiesInput, setCapabilitiesInput] = useState('');
  const [price, setPrice] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Session verification & loading agent catalog
  useEffect(() => {
    const id = localStorage.getItem('nyxa_user_id');
    const rolesStr = localStorage.getItem('nyxa_user_roles');
    
    if (id) {
      setUserId(id);
      if (rolesStr) setUserRoles(JSON.parse(rolesStr));
    }
    
    fetchAgents();
  }, []);

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

    // Split capabilities by comma and clean whitespace
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
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '1rem' }}>
      <h1>Agent Marketplace</h1>
      <p>Discover and register AI agents. Fulfill complex workloads autonomously.</p>

      {/* Permission alert for Developers */}
      {userId && userRoles && !userRoles.is_developer && (
        <div style={{ padding: '0.75rem', background: '#fff3e0', border: '1px solid #ffe0b2', color: '#e65100', borderRadius: '4px', marginBottom: '1.5rem' }}>
          ⚠️ You are logged in, but your profile doesn't have the <strong>Developer</strong> role enabled. You can browse, but cannot register new agents.
        </div>
      )}

      {/* Register Agent Form */}
      <section style={{ marginTop: '2rem', border: '1px solid #ccc', borderRadius: '8px', padding: '1.5rem', background: '#fcfcfc' }}>
        <h2>Register an Agent</h2>
        {error && (
          <div style={{ padding: '0.75rem', background: '#ffebee', color: '#c62828', borderRadius: '4px', marginBottom: '1rem' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleRegisterAgent}>
          <div>
            <label>Agent Name:</label><br />
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Researcher Bot"
              required 
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            />
          </div>
          <div style={{ marginTop: '1rem' }}>
            <label>Description:</label><br />
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain what this agent does, what tools it supports, and its instructions..."
              rows={3} 
              required
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            ></textarea>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <label>Capabilities (comma separated tags):</label><br />
            <input 
              type="text" 
              value={capabilitiesInput}
              onChange={(e) => setCapabilitiesInput(e.target.value)}
              placeholder="research, web_search, data_analysis"
              required
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            />
            <small style={{ color: '#666' }}>Matching tags: research, programming, development, content_writing, copywriting, design, ui_ux, data_analysis, marketing, sales, workflow_automation</small>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <label>Price Demand (USD per execution):</label><br />
            <input 
              type="number" 
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="15"
              required
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading || !!(userRoles && !userRoles.is_developer)}
            style={{ 
              marginTop: '1.25rem', 
              padding: '0.75rem 1.5rem', 
              background: (loading || !!(userRoles && !userRoles.is_developer)) ? '#9e9e9e' : '#0070f3', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: (loading || !!(userRoles && !userRoles.is_developer)) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Registering Agent...' : 'Register Agent'}
          </button>
        </form>
      </section>

      {/* Available Agents Catalog */}
      <section style={{ marginTop: '3rem' }}>
        <h2>Available Agents</h2>
        <div style={{ display: 'grid', gap: '1.5rem', marginTop: '1rem' }}>
          {agents.length === 0 ? (
            <p style={{ color: '#777' }}>No agents registered in the marketplace yet.</p>
          ) : (
            agents.map(agent => (
              <div key={agent.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1rem', background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>{agent.name}</h3>
                  <span style={{ color: '#ff9800', fontWeight: 'bold' }}>
                    ★ {agent.score.toFixed(1)} <small style={{ color: '#666', fontWeight: 'normal' }}>({agent.total_transactions} completed)</small>
                  </span>
                </div>
                <p style={{ color: '#555', marginTop: '0.5rem' }}>{agent.description}</p>
                
                <div style={{ marginTop: '0.5rem' }}>
                  {agent.capabilities.map(cap => (
                    <span key={cap} style={{ marginRight: '0.5rem', background: '#e0f2f1', color: '#004d40', padding: '0.15rem 0.4rem', fontSize: '0.75rem', borderRadius: '3px' }}>
                      {cap}
                    </span>
                  ))}
                </div>

                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>Price: ${agent.price_demand}</strong>
                  <span style={{ fontSize: '0.85rem', color: '#777' }}>Agent Status: {agent.status.toUpperCase()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
