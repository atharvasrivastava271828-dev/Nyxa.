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
          <img src="/yinyang.png" alt="Nyxa Logo" className="w-full h-full transition-transform hover:rotate-180 duration-1000 ease-in-out theme-logo gold-logo" />
        </div>

        {/* Mission Statement */}
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-3 max-w-2xl text-center">
          Get your daily tasks done in seconds.
        </h1>
        <p className="text-sm sm:text-base text-[var(--muted)] max-w-lg mt-1 mb-8 text-center font-normal">
          Simple, free, and private utilities designed for students, freelancers, and small businesses.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="w-full max-w-lg flex gap-2">
          <input
            type="text"
            placeholder="Search GST invoice, marks calculator, UPI QR, tax estimator..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="nyxa-input text-sm"
          />
          <button type="submit" className="nyxa-btn nyxa-btn-primary text-xs whitespace-nowrap px-5">
            Search Tools
          </button>
        </form>
        
        {/* User Guide Button */}
        <div className="mt-6">
          <a href="#how-it-works" className="nyxa-btn nyxa-btn-secondary text-xs px-6 py-2 border-[var(--halo-2)] hover:shadow-[0_0_15px_var(--halo-1)] transition-shadow duration-300">
            ✨ Learn How It Works
          </a>
        </div>
      </section>

      {/* 2. Marketplace Overview */}
      <section className="py-12 border-b border-[var(--border)]">
        <h2 className="text-xl tracking-tight mb-8 text-center md:text-left font-semibold border-0 pb-0">The Shortcut Economy</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Instant Execution */}
          <div className="nyxa-card p-6 justify-between space-y-3">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[var(--secondary-bg)] border border-[var(--border)] flex items-center justify-center text-lg mb-3">
                ⚡
              </div>
              <h3 className="font-semibold text-base mb-1">Instant Execution</h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed m-0">
                AI agents request a task. Specialized micro-tools complete it in milliseconds.
              </p>
            </div>
            <Link href="/tasks" className="nyxa-btn nyxa-btn-secondary text-center text-xs mt-2 w-full">
              Explore Outcomes ➔
            </Link>
          </div>

          {/* Escrow Protection */}
          <div className="nyxa-card p-6 justify-between space-y-3">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[var(--secondary-bg)] border border-[var(--border)] flex items-center justify-center text-lg mb-3">
                🔒
              </div>
              <h3 className="font-semibold text-base mb-1">Smart Escrow</h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed m-0">
                Payment is held safely during execution. Creators get paid only when work is delivered correctly.
              </p>
            </div>
            <Link href="/tasks" className="nyxa-btn nyxa-btn-secondary text-center text-xs mt-2 w-full">
              Learn About Escrow ➔
            </Link>
          </div>

          {/* TaskBidder */}
          <div className="nyxa-card p-6 justify-between space-y-3">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[var(--secondary-bg)] border border-[var(--border)] flex items-center justify-center text-lg mb-3">
                🎯
              </div>
              <h3 className="font-semibold text-base mb-1">TaskBidder</h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed m-0">
                Can&apos;t find the task you need? Post a bounty and let developers bid to build your custom solution.
              </p>
            </div>
            <Link href="/bidder" className="nyxa-btn nyxa-btn-secondary text-center text-xs mt-2 w-full">
              Post a Bounty ➔
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Statistics Section */}
      <section className="py-12 border-b border-[var(--border)] text-center">
        <h2 className="text-xl tracking-tight mb-8 font-semibold border-0 pb-0">Built for Real Outcomes</h2>
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="border border-[var(--border)] p-4 rounded-lg">
            <div className="tech-mono text-3xl font-bold text-[var(--foreground)]">
              {statsLoading ? 0 : 542}
            </div>
            <div className="text-xs text-[var(--muted)] uppercase tracking-wider mt-1">
              Tasks Completed
            </div>
          </div>
          <div className="border border-[var(--border)] p-4 rounded-lg">
            <div className="tech-mono text-3xl font-bold text-[var(--foreground)]">
              {statsLoading ? 0 : 128}
            </div>
            <div className="text-xs text-[var(--muted)] uppercase tracking-wider mt-1">
              Verified Creators
            </div>
          </div>
          <div className="border border-[var(--border)] p-4 rounded-lg">
            <div className="tech-mono text-3xl font-bold text-[var(--foreground)]">
              {statsLoading ? 0 : stats.tasksCount}
            </div>
            <div className="text-xs text-[var(--muted)] uppercase tracking-wider mt-1">
              Free Utilities
            </div>
          </div>
        </div>
      </section>

      {/* 4. How It Works (User Guide) */}
      <section id="how-it-works" className="py-16 border-b border-[var(--border)] scroll-mt-20">
        <h2 className="text-2xl tracking-tight mb-2 text-center font-bold border-0 pb-0">Input → Task → Output</h2>
        <p className="text-center text-[var(--muted)] mb-12 max-w-2xl mx-auto">
          A standardized digital outcome engine. You ask for a finished result, pay a tiny fee, and get on with your day.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="nyxa-card relative group hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-[var(--background)] border border-[var(--border)] flex items-center justify-center font-bold text-lg shadow-[0_0_15px_var(--halo-3)]">
              1
            </div>
            <h3 className="font-semibold mb-3 mt-2 text-lg">Input</h3>
            <p className="text-sm text-[var(--muted)]">
              Provide the raw materials. A startup idea, a website URL, or a textbook chapter.
            </p>
          </div>
          
          <div className="nyxa-card relative group hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-[var(--background)] border border-[var(--border)] flex items-center justify-center font-bold text-lg shadow-[0_0_15px_var(--halo-3)]">
              2
            </div>
            <h3 className="font-semibold mb-3 mt-2 text-lg">Execution</h3>
            <p className="text-sm text-[var(--muted)]">
              Nyxa runs the Task securely on the edge, routing it through the right AI agents or API tools instantly.
            </p>
          </div>

          <div className="nyxa-card relative group hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-[var(--background)] border border-[var(--border)] flex items-center justify-center font-bold text-lg shadow-[0_0_15px_var(--halo-3)]">
              3
            </div>
            <h3 className="font-semibold mb-3 mt-2 text-lg">Output</h3>
            <p className="text-sm text-[var(--muted)]">
              Receive the finished outcome. A business plan, a competitor analysis, or a study quiz.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
