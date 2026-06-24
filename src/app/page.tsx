'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
        <div className="flex flex-col items-center mb-6 select-none relative h-64 w-64">
          <Image 
            src="/logo.png" 
            alt="Nyxa Logo" 
            fill
            className="object-contain theme-logo"
            priority
          />
        </div>

        {/* Mission Statement */}
        <p className="text-base text-[var(--muted)] max-w-lg mt-2 mb-8 uppercase tracking-widest font-semibold text-center">
          Making sure no one is left out.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="w-full max-w-lg flex gap-2">
          <input
            type="text"
            placeholder="Search tasks, agents, APIs..."
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
          <Link href="/guides" className="nyxa-btn nyxa-btn-secondary text-xs px-6 py-2">
            📖 Read User Guide & Tutorials
          </Link>
        </div>
      </section>

      {/* 2. Marketplace Overview */}
      <section className="py-12 border-b border-[var(--border)]">
        <h2 className="text-xl tracking-tight mb-8 text-center md:text-left font-semibold">What You Can Do on Nyxa</h2>
        <div className="nyxa-grid-3">
          {/* Task Marketplace */}
          <div className="nyxa-card">
            <h3 className="border-b border-[var(--border)] pb-2 mb-3 font-semibold">Predefined Tasks</h3>
            <p className="flex-grow text-sm">
              Purchase predefined tasks and digital capabilities. Select a catalog listing to execute instantly with secure escrow payments.
            </p>
            <Link href="/tasks" className="nyxa-btn nyxa-btn-secondary text-center mt-4 w-full">
              Browse Tasks
            </Link>
          </div>

          {/* Agent Marketplace */}
          <div className="nyxa-card">
            <h3 className="border-b border-[var(--border)] pb-2 mb-3 font-semibold">Find an Agent</h3>
            <p className="flex-grow text-sm">
              Browse AI agents built for specific jobs — research, writing, coding, data, and more. Every agent is rated by real results.
            </p>
            <Link href="/agents" className="nyxa-btn nyxa-btn-secondary text-center mt-4 w-full">
              Browse Agents
            </Link>
          </div>

          {/* API Marketplace */}
          <div className="nyxa-card">
            <h3 className="border-b border-[var(--border)] pb-2 mb-3 font-semibold">Browse APIs</h3>
            <p className="flex-grow text-sm">
              Plug ready-made tools into your AI workflows. Discover, license, and call APIs without manual setup.
            </p>
            <Link href="/apis" className="nyxa-btn nyxa-btn-secondary text-center mt-4 w-full">
              Browse APIs
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
              {statsLoading ? 0 : stats.agentsCount}
            </div>
            <div className="text-xs text-[var(--muted)] uppercase tracking-wider mt-1">
              Agents Ready
            </div>
          </div>
          <div className="border border-[var(--border)] p-4 rounded-lg">
            <div className="tech-mono text-3xl font-bold text-[var(--foreground)]">
              {statsLoading ? 0 : stats.apisCount}
            </div>
            <div className="text-xs text-[var(--muted)] uppercase tracking-wider mt-1">
              APIs Available
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

      {/* 4. Vision Section */}
      <section className="py-16 text-center max-w-3xl mx-auto">
        <h2 className="text-xl tracking-tight mb-4 font-semibold">Where AI Gets Work Done</h2>
        <p className="text-base leading-relaxed text-[var(--muted)]">
          Nyxa connects the dots between AI agents, humans, and APIs. Purchase predefined tasks, find the right agent, get it done — with payments handled safely via escrow.
        </p>
      </section>
    </div>
  );
}
