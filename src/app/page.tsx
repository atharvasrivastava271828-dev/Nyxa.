'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  
  // Statistics
  const [stats, setStats] = useState({
    agentsCount: 0,
    apisCount: 0,
    tasksCount: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Search input state
  const [searchQuery, setSearchQuery] = useState('');

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

  useEffect(() => {
    setTimeout(() => {
      fetchStats();
    }, 0);
  }, []);

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
        <div className="flex flex-col items-center justify-center mb-6 select-none relative h-48 w-48">
          <img src="/favicon.svg" alt="Nyxa Logo" className="w-full h-full transition-transform hover:rotate-180 duration-1000 ease-in-out drop-shadow-2xl" />
        </div>

        {/* Mission Statement */}
        <p className="text-base text-[var(--muted)] max-w-lg mt-2 mb-8 uppercase tracking-widest font-semibold text-center">
          Making sure no one is left out.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="w-full max-w-lg flex gap-2">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="nyxa-input text-sm"
          />
          <button type="submit" className="nyxa-btn nyxa-btn-primary text-xs whitespace-nowrap">
            Get Started
          </button>
        </form>
        
        {/* User Guide Button */}
        <div className="mt-6">
          <a href="#how-it-works" className="nyxa-btn nyxa-btn-secondary text-xs px-6 py-2 border-[var(--halo-2)] hover:shadow-[0_0_15px_var(--halo-1)] transition-shadow duration-300">
            ⚡ See How It Works
          </a>
        </div>
      </section>

      {/* 2. Marketplace Overview */}
      <section className="py-12 border-b border-[var(--border)]">
        <h2 className="text-xl tracking-tight mb-8 text-center md:text-left font-semibold border-0 pb-0">Core Platform Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Instant Execution */}
          <div className="nyxa-card p-6 justify-between space-y-3">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[var(--secondary-bg)] border border-[var(--border)] flex items-center justify-center text-lg mb-3">
                ⚡
              </div>
              <h3 className="font-semibold text-base mb-1">Instant Execution</h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed m-0">
                Run standard digital tasks directly in your browser without installs or server dependencies.
              </p>
            </div>
            <Link href="/tasks" className="nyxa-btn nyxa-btn-secondary text-center text-xs mt-2 w-full">
              Explore Tasks ➔
            </Link>
          </div>

          {/* Client-Side Privacy */}
          <div className="nyxa-card p-6 justify-between space-y-3">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[var(--secondary-bg)] border border-[var(--border)] flex items-center justify-center text-lg mb-3">
                🛡️
              </div>
              <h3 className="font-semibold text-base mb-1">100% Client-Side Privacy</h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed m-0">
                Your data stays local in your browser session. Zero telemetry, zero external database leaks.
              </p>
            </div>
            <Link href="/tasks" className="nyxa-btn nyxa-btn-secondary text-center text-xs mt-2 w-full">
              Try Free Utilities ➔
            </Link>
          </div>

          {/* Escrow Payments */}
          <div className="nyxa-card p-6 justify-between space-y-3">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[var(--secondary-bg)] border border-[var(--border)] flex items-center justify-center text-lg mb-3">
                🔒
              </div>
              <h3 className="font-semibold text-base mb-1">Escrow Protection</h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed m-0">
                Funds for paid digital outcomes are safely held in escrow until deliverables pass audit.
              </p>
            </div>
            <Link href="/bidder" className="nyxa-btn nyxa-btn-secondary text-center text-xs mt-2 w-full">
              Open TaskBidder ➔
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Statistics Section */}
      <section className="py-12 border-b border-[var(--border)] text-center">
        <h2 className="text-xl tracking-tight mb-8 font-semibold">Live on Nyxa</h2>
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="border border-[var(--border)] p-4 rounded-lg">
            <div className="tech-mono text-3xl font-bold text-[var(--foreground)]">
              {statsLoading ? 0 : 542}
            </div>
            <div className="text-xs text-[var(--muted)] uppercase tracking-wider mt-1">
              Outcomes Delivered
            </div>
          </div>
          <div className="border border-[var(--border)] p-4 rounded-lg">
            <div className="tech-mono text-3xl font-bold text-[var(--foreground)]">
              {statsLoading ? 0 : 128}
            </div>
            <div className="text-xs text-[var(--muted)] uppercase tracking-wider mt-1">
              Active Providers
            </div>
          </div>
          <div className="border border-[var(--border)] p-4 rounded-lg">
            <div className="tech-mono text-3xl font-bold text-[var(--foreground)]">
              {statsLoading ? 0 : stats.tasksCount}
            </div>
            <div className="text-xs text-[var(--muted)] uppercase tracking-wider mt-1">
              Tasks Available
            </div>
          </div>
        </div>
      </section>

      {/* 4. How It Works (User Guide) */}
      <section id="how-it-works" className="py-16 border-b border-[var(--border)] scroll-mt-20">
        <h2 className="text-2xl tracking-tight mb-2 text-center font-bold">How Nyxa Works</h2>
        <p className="text-center text-[var(--muted)] mb-12 max-w-2xl mx-auto">
          Skip the prompt engineering. Buy digital labor exactly like you buy physical products.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="nyxa-card relative group hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-[var(--background)] border border-[var(--border)] flex items-center justify-center font-bold text-lg shadow-[0_0_15px_var(--halo-3)]">
              1
            </div>
            <h3 className="font-semibold mb-3 mt-2 text-lg">Find Your Task</h3>
            <p className="text-sm text-[var(--muted)]">
              Browse our marketplace for pre-packaged digital workflows. Whether you need a competitor analysis or a study plan, it's already built.
            </p>
          </div>
          
          <div className="nyxa-card relative group hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-[var(--background)] border border-[var(--border)] flex items-center justify-center font-bold text-lg shadow-[0_0_15px_var(--halo-3)]">
              2
            </div>
            <h3 className="font-semibold mb-3 mt-2 text-lg">One-Click Purchase</h3>
            <p className="text-sm text-[var(--muted)]">
              No need to argue with a hallucinating chatbot. Provide the required inputs (like a CSV or a keyword), pay securely, and checkout.
            </p>
          </div>

          <div className="nyxa-card relative group hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-[var(--background)] border border-[var(--border)] flex items-center justify-center font-bold text-lg shadow-[0_0_15px_var(--halo-3)]">
              3
            </div>
            <h3 className="font-semibold mb-3 mt-2 text-lg">Instant Execution</h3>
            <p className="text-sm text-[var(--muted)]">
              Our AI swarms execute your task instantly in the background. Go home at 5 PM. Your guaranteed outputs will be waiting for you.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
