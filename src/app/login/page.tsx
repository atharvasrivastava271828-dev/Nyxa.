'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (data.user) {
        localStorage.setItem('nyxa_user_id', data.user.id);
        localStorage.setItem('nyxa_user_name', data.user.name || 'User');
        localStorage.setItem('nyxa_user_email', data.user.email || '');
        localStorage.setItem('nyxa_user_roles', JSON.stringify(data.user.roles || []));
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials or connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nyxa-container max-w-md py-16">
      <div className="nyxa-card p-8 border-2 border-[var(--foreground)]">
        <div className="text-center mb-6 flex flex-col items-center">
          {/* Logo mark */}
          <img src="/logo.png" alt="Nyxa Logo" className="h-16 w-auto object-contain theme-logo mb-4" />
          <h1 className="text-xl tracking-tight m-0 font-semibold">Welcome back</h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            Sign in to your Nyxa account
          </p>
        </div>

        {error && (
          <div className="border border-red-800 p-3 bg-red-950/20 text-red-400 text-xs mb-4 uppercase rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="nyxa-label">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@domain.com"
              className="nyxa-input text-sm tech-mono" 
            />
          </div>
          <div>
            <label className="nyxa-label">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
              className="nyxa-input text-sm tech-mono" 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="nyxa-btn nyxa-btn-primary w-full text-xs py-2 mt-2"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-[var(--border)]"></div>
          <span className="flex-shrink mx-3 text-[10px] text-[var(--muted)] tech-mono">Or sign in with</span>
          <div className="flex-grow border-t border-[var(--border)]"></div>
        </div>

        {/* Social buttons grid */}
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <button 
              type="button" 
              disabled 
              className="nyxa-btn nyxa-btn-secondary text-[10px] py-1.5 px-2 tech-mono opacity-50 cursor-not-allowed"
            >
              Google (Upcoming)
            </button>
            <button 
              type="button" 
              disabled 
              className="nyxa-btn nyxa-btn-secondary text-[10px] py-1.5 px-2 tech-mono opacity-50 cursor-not-allowed"
            >
              Apple (Upcoming)
            </button>
            <button 
              type="button" 
              disabled 
              className="nyxa-btn nyxa-btn-secondary text-[10px] py-1.5 px-2 tech-mono opacity-50 cursor-not-allowed"
            >
              Microsoft (Upcoming)
            </button>
            <button 
              type="button" 
              disabled 
              className="nyxa-btn nyxa-btn-secondary text-[10px] py-1.5 px-2 tech-mono opacity-50 cursor-not-allowed"
            >
              Facebook (Upcoming)
            </button>
          </div>
          <button 
            type="button" 
            disabled 
            className="nyxa-btn nyxa-btn-secondary text-[10px] py-1.5 px-2 tech-mono w-full opacity-50 cursor-not-allowed"
          >
            X / Twitter (Upcoming)
          </button>
        </div>
        
        <p className="text-xs text-center text-[var(--muted)] mt-6 mb-0">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-[var(--foreground)] font-semibold hover:underline">
            Sign up &rarr;
          </Link>
        </p>
      </div>
    </div>
  );
}
