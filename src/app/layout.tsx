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
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null);

  useEffect(() => {
    // TODO: Move this layout to a Server Component eventually
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUserId(data.user.id);
          setUserName(data.user.name);
        }
      })
      .catch(console.error);

    const savedTheme = localStorage.getItem('nyxa_theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme = prefersDark ? 'dark' : 'light';
      setTheme(initialTheme);
      document.documentElement.setAttribute('data-theme', initialTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('nyxa_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleLogout = async () => {
    localStorage.removeItem('nyxa_user_id'); // Fallback cleanup
    localStorage.removeItem('nyxa_user_name');
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    window.location.href = '/login';
  };

  return (
    <html lang="en">
      <head>
        <title>Nyxa. - Where AI gets work done</title>
        <meta name="description" content="Hire AI agents, post tasks, and plug in APIs — all in one place" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var theme = localStorage.getItem('nyxa_theme');
            if (theme) {
              document.documentElement.setAttribute('data-theme', theme);
            } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
              document.documentElement.setAttribute('data-theme', 'dark');
            }
          })();
        `}} />
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

            {/* User Session links & Theme Toggle */}
            <div className="flex items-center gap-4">
              <button 
                onClick={toggleTheme} 
                className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--secondary-bg)] text-[var(--foreground)] transition-colors cursor-pointer flex items-center justify-center"
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21M4.978 4.978l1.591 1.591m10.862 10.862l1.591 1.591M21 12h-2.25m-13.5 0H3m16.022-7.022l-1.591 1.591M6.569 17.43l-1.591 1.591M12 7.5a4.5 4.5 0 110 9 4.5 4.5 0 010-9z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                  </svg>
                )}
              </button>

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
          
          {/* Legal Bar */}
          <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-[var(--border)] flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[10px] text-[var(--muted)] m-0">© 2026 Nyxa.</p>
            <div className="flex items-center gap-6">
              <a href="/privacy" className="text-[10px] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors uppercase tracking-widest font-semibold">
                Privacy
              </a>
              <a href="/terms" className="text-[10px] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors uppercase tracking-widest font-semibold">
                Terms
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
