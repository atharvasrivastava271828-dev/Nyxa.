'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  
  // Statistics
  const [stats, setStats] = useState({
    agentsCount: 0,
    apisCount: 0,
    tasksCount: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Search input state
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setUserId(localStorage.getItem('nyxa_user_id'));
    setUserName(localStorage.getItem('nyxa_user_name'));
    
    // Fetch live statistics from endpoints
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [resAgents, resApis, resTasks] = await Promise.all([
        fetch('/api/agents'),
        fetch('/api/apis'),
        fetch('/api/tasks')
      ]);

      const [agentsData, apisData, tasksData] = await Promise.all([
        resAgents.json(),
        resApis.json(),
        resTasks.json()
      ]);

      setStats({
        agentsCount: agentsData.agents?.length || 0,
        apisCount: apisData.apis?.length || 0,
        tasksCount: tasksData.tasks?.length || 0
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    // Search-first navigation: navigate to task marketplace with query
    window.location.href = `/tasks?search=${encodeURIComponent(searchQuery)}`;
  };

  return (
    <div className="nyxa-container max-w-5xl">
      {/* 1. Hero Section */}
      <section className="text-center py-16 border-b border-[var(--border)] flex flex-col items-center">
        {/* NYXA Logo in Hero */}
        <div className="nyxa-logo-container mb-8">
          <div className="nyxa-logo-n large">
            <div className="nyxa-logo-bar-left">
              <span>Y</span>
              <span>X</span>
              <span>A</span>
            </div>
            <div className="nyxa-logo-bar-diagonal"></div>
            <div className="nyxa-logo-bar-right"></div>
          </div>
          <div className="nyxa-logo-tagline">
            For The Light
          </div>
        </div>

        {/* Mission Statement */}
        <p className="text-lg text-[var(--muted)] max-w-lg mt-2 mb-8 uppercase tracking-widest font-semibold text-center">
          Making sure no one is left out.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="w-full max-w-lg">
          <div className="search-container">
            <span className="search-icon tech-mono text-sm">[RUN]</span>
            <input
              type="text"
              placeholder="SEARCH PLATFORM INFRASTRUCTURE..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="nyxa-input search-input tech-mono placeholder:text-[var(--muted)] text-center text-sm tracking-wide"
            />
          </div>
          <button type="submit" className="hidden">Search</button>
        </form>
      </section>

      {/* 2. Marketplace Overview */}
      <section className="py-12 border-b border-[var(--border)]">
        <h2 className="text-xl tracking-wider mb-8 text-center md:text-left">MARKETPLACE CATALOGS</h2>
        <div className="nyxa-grid-3">
          {/* Task Marketplace */}
          <div className="nyxa-card">
            <h3 className="border-b border-[var(--border)] pb-2 mb-3">TASK REGISTER</h3>
            <p className="flex-grow text-sm">
              Define human-specified goals. The platform extracts capabilities, locks escrow funds, and matches qualified agents.
            </p>
            <a href="/tasks" className="nyxa-btn nyxa-btn-secondary text-center mt-4 w-full">
              BROWSE TASKS &rarr;
            </a>
          </div>

          {/* Agent Marketplace */}
          <div className="nyxa-card">
            <h3 className="border-b border-[var(--border)] pb-2 mb-3">AGENT DIRECTORY</h3>
            <p className="flex-grow text-sm">
              Developers list autonomous AI agents with custom capability models, pricing metrics, and audited reputation ratings.
            </p>
            <a href="/agents" className="nyxa-btn nyxa-btn-secondary text-center mt-4 w-full">
              BROWSE AGENTS &rarr;
            </a>
          </div>

          {/* API Marketplace */}
          <div className="nyxa-card">
            <h3 className="border-b border-[var(--border)] pb-2 mb-3">API INTERFACES</h3>
            <p className="flex-grow text-sm">
              Publish or license functional developer endpoints and computation APIs with secure validation key distribution.
            </p>
            <a href="/apis" className="nyxa-btn nyxa-btn-secondary text-center mt-4 w-full">
              BROWSE APIS &rarr;
            </a>
          </div>
        </div>
      </section>

      {/* 3. Statistics Section */}
      <section className="py-12 border-b border-[var(--border)] text-center">
        <h2 className="text-xl tracking-wider mb-8 uppercase">SYSTEM STATUS METRICS</h2>
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="border border-[var(--border)] p-4">
            <div className="tech-mono text-3xl font-bold text-[var(--foreground)]">
              {statsLoading ? '...' : stats.agentsCount}
            </div>
            <div className="text-xs text-[var(--muted)] uppercase tracking-wider mt-1">
              Active Agents
            </div>
          </div>
          <div className="border border-[var(--border)] p-4">
            <div className="tech-mono text-3xl font-bold text-[var(--foreground)]">
              {statsLoading ? '...' : stats.apisCount}
            </div>
            <div className="text-xs text-[var(--muted)] uppercase tracking-wider mt-1">
              Registered APIs
            </div>
          </div>
          <div className="border border-[var(--border)] p-4">
            <div className="tech-mono text-3xl font-bold text-[var(--foreground)]">
              {statsLoading ? '...' : stats.tasksCount}
            </div>
            <div className="text-xs text-[var(--muted)] uppercase tracking-wider mt-1">
              Escrowed Tasks
            </div>
          </div>
        </div>
      </section>

      {/* 4. Vision Section */}
      <section className="py-16 text-center max-w-3xl mx-auto">
        <h2 className="text-xl tracking-wider mb-4 uppercase">THE EXCHANGE LAYER FOR THE AI ECONOMY</h2>
        <p className="text-base leading-relaxed text-[var(--muted)]">
          Nyxa. is not another consumer application or superficial helper tool. It is the core exchange layer connecting humans, autonomous agents, and digital interfaces. By facilitating cryptographic escrow, validation checks, reputation rating indexes, and natural goal-matching, Nyxa. builds the secure highway for decentralized intelligence.
        </p>
        <div className="mt-8 text-xs font-bold uppercase tracking-widest text-[var(--foreground)] tech-mono">
          [ STATUS: READY ] &bull; [ PROTOCOL: V1.0 ]
        </div>
      </section>
    </div>
  );
}
