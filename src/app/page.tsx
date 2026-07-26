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
        <div className="flex flex-col items-center justify-center mb-6 select-none relative h-48 w-48" style={{ color: 'var(--foreground)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-full h-full transition-transform hover:rotate-180 duration-1000 ease-in-out drop-shadow-2xl">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="0.5" fill="none" />
            <path d="M12 2 A 5 5 0 0 0 12 12 A 5 5 0 0 1 12 22 A 10 10 0 0 0 12 2 Z" fill="currentColor" />
            <circle cx="12" cy="7" r="1.5" fill="var(--background)" />
            <circle cx="12" cy="17" r="1.5" fill="currentColor" />
          </svg>
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

          {/* Agent Marketplace (Locked) */}
          <div className="nyxa-card opacity-50 select-none">
            <h3 className="border-b border-[var(--border)] pb-2 mb-3 font-semibold flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
              </svg>
              Agents (Coming Q4)
            </h3>
            <p className="flex-grow text-sm">
              Agent-to-Agent swarm intelligence and direct agent hiring capabilities are currently locked while we focus on Tasks.
            </p>
            <div className="nyxa-btn text-center mt-4 w-full cursor-not-allowed bg-[var(--border)] text-[var(--muted)]">
              Locked
            </div>
          </div>

          {/* API Marketplace (Locked) */}
          <div className="nyxa-card opacity-50 select-none">
            <h3 className="border-b border-[var(--border)] pb-2 mb-3 font-semibold flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
              </svg>
              APIs (Coming Q4)
            </h3>
            <p className="flex-grow text-sm">
              The Enterprise API Marketplace is currently locked. We are heavily focused on streamlining our core Task outcomes first.
            </p>
            <div className="nyxa-btn text-center mt-4 w-full cursor-not-allowed bg-[var(--border)] text-[var(--muted)]">
              Locked
            </div>
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

      {/* 4. Vision Section */}
      <section className="py-16 text-center max-w-3xl mx-auto">
        <h2 className="text-xl tracking-tight mb-4 font-semibold">Where Work Gets Done</h2>
        <p className="text-base leading-relaxed text-[var(--muted)]">
          Nyxa connects you to the digital capabilities you need, whether powered by human experts or AI swarms. Simply describe your desired outcome, and get it done — with payments handled safely via escrow.
        </p>
      </section>
    </div>
  );
}
