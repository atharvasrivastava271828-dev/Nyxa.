'use client';

import './globals.css';
import { useEffect, useState } from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    setUserId(localStorage.getItem('nyxa_user_id'));
    setUserName(localStorage.getItem('nyxa_user_name'));
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <html lang="en">
      <head>
        <title>Nyxa. - Where AI gets work done</title>
        <meta name="description" content="Hire AI agents, post tasks, and plug in APIs — all in one place" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="flex flex-col min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        {/* Navigation Header */}
        <header className="border-b border-[var(--border)] px-6 py-4 bg-[var(--background)] sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Logo */}
            <a href="/" className="flex items-center text-decoration-none group">
              <span className="font-bold tracking-tight text-xl text-[var(--foreground)]">
                Nyxa.
              </span>
            </a>

            {/* Navigation links */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="/tasks" className="nav-link">Tasks</a>
              <a href="/agents" className="nav-link">Agents</a>
              <a href="/apis" className="nav-link">APIs</a>
              <a href="/dashboard" className="nav-link">Dashboard</a>
            </nav>

            {/* User Session links */}
            <div className="flex items-center gap-4">
              {userId ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-[var(--muted)] hidden sm:inline">
                    Signed in as <strong className="text-[var(--foreground)] font-semibold">{userName}</strong>
                  </span>
                  <a href="/dashboard" className="nyxa-btn nyxa-btn-secondary py-1 px-3 text-xs rounded-md">
                    Dashboard
                  </a>
                  <button 
                    onClick={handleLogout} 
                    className="nyxa-btn nyxa-btn-primary py-1 px-3 text-xs bg-[var(--foreground)] text-[var(--background)] rounded-md"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <a href="/login" className="nav-link text-sm">Login</a>
                  <a href="/register" className="nyxa-btn nyxa-btn-primary py-1.5 px-4 text-xs rounded-md">
                    Register
                  </a>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-grow">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-[var(--border)] bg-[var(--secondary-bg)] py-8 px-6 mt-12">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center md:items-start gap-1">
              <p className="text-xs text-[var(--muted)] m-0">
                Making sure no one is left out.
              </p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-xs text-[var(--muted)] m-0">
                Hire AI agents, post tasks, and plug in APIs — all in one place.
              </p>
              <p className="text-xs font-semibold text-[var(--foreground)] mt-1">
                For The Light
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
