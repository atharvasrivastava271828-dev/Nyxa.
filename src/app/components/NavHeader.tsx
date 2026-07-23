'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';

export default function NavHeader() {
  const { userId, userName, logout } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('nyxa_theme') as 'light' | 'dark' | null;

    if (savedTheme) {
      setTimeout(() => setTheme(savedTheme), 0);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme = prefersDark ? 'dark' : 'light';
      setTimeout(() => setTheme(initialTheme), 0);
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
    await logout();
    window.location.href = '/login';
  };

  const navLinks = [
    { href: '/tasks', label: 'Tasks' },
    { href: '/bidder', label: 'TaskBidder' },
    { href: '/developer', label: 'Developer' },
    { href: '/dashboard', label: 'Dashboard' },
  ];

  return (
    <header className="border-b border-[var(--border)] px-6 py-4 bg-[var(--background)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center text-decoration-none group">
          <span className="font-bold tracking-tight text-xl text-[var(--foreground)]">
            Nyxa
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="nav-link">
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-4">
          {/* Theme toggle */}
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

          {/* Desktop auth links */}
          <div className="hidden md:flex items-center gap-4">
            {userId ? (
              <>
                <span className="text-sm text-[var(--muted)] hidden sm:inline">
                  Signed in as <strong className="text-[var(--foreground)] font-semibold">{userName}</strong>
                </span>
                <Link href="/dashboard" className="nyxa-btn nyxa-btn-secondary py-1 px-3 text-xs rounded-md">
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="nyxa-btn nyxa-btn-primary py-1 px-3 text-xs bg-[var(--foreground)] text-[var(--background)] rounded-md"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="nav-link text-sm">Login</Link>
                <Link href="/register" className="nyxa-btn nyxa-btn-primary py-1.5 px-4 text-xs rounded-md">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="md:hidden p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--secondary-bg)] text-[var(--foreground)] transition-colors"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--border)] mt-4 pt-4 flex flex-col gap-3 px-2 pb-2">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="nav-link text-sm py-1"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-[var(--border)] pt-3 mt-1 flex flex-col gap-2">
            {userId ? (
              <>
                <span className="text-xs text-[var(--muted)]">
                  Signed in as <strong className="text-[var(--foreground)]">{userName}</strong>
                </span>
                <button
                  onClick={handleLogout}
                  className="nyxa-btn nyxa-btn-secondary text-xs py-1.5 px-3 rounded-md self-start"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex gap-3">
                <Link href="/login" className="nyxa-btn nyxa-btn-secondary text-xs py-1.5 px-3 rounded-md">Login</Link>
                <Link href="/register" className="nyxa-btn nyxa-btn-primary text-xs py-1.5 px-3 rounded-md">Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
