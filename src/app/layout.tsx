import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import NavHeader from '@/app/components/NavHeader';

export const metadata: Metadata = {
  title: 'Nyxa. — The AI Capability Exchange',
  description: 'Discover, purchase, and integrate predefined AI tasks, agents, and APIs — all with secure escrow payments.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Inline theme script — runs before any paint to avoid flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
               const savedTheme = localStorage.getItem('nyxa_theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme = prefersDark ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', initialTheme);
    }
              })();
            `,
          }}
        />
      </head>
      <body className="flex flex-col min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        {/* Client component: handles theme toggle, session display, mobile nav */}
        <NavHeader />

        {/* Main Content */}
        <main className="flex-grow">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-[var(--border)] bg-[var(--secondary-bg)] py-8 px-6 mt-12">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <Link href="/" className="flex items-center text-decoration-none group">
              <span className="font-bold tracking-tight text-xl text-[var(--foreground)]">
                Nyxa.
              </span>
            </Link>

            {/* Navigation links */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/tasks" className="nav-link">Tasks</Link>
              <Link href="/agents" className="nav-link">Agents</Link>
              <Link href="/apis" className="nav-link">APIs</Link>
              <Link href="/dashboard" className="nav-link">Dashboard</Link>
            </nav>

            <div className="text-center md:text-right">
              <p className="text-xs text-[var(--muted)] m-0">
                Discover, purchase, and integrate AI capabilities — all in one place.
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
              <Link href="/privacy" className="text-[10px] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors uppercase tracking-widest font-semibold">
                Privacy
              </Link>
              <Link href="/terms" className="text-[10px] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors uppercase tracking-widest font-semibold">
                Terms
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
