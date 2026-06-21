'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
        localStorage.setItem('nyxa_user_name', data.user.full_name);
        localStorage.setItem('nyxa_user_email', data.user.email);
        localStorage.setItem('nyxa_user_roles', JSON.stringify({
          is_buyer: data.user.is_buyer,
          is_seller: data.user.is_seller,
          is_developer: data.user.is_developer
        }));
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
        <div className="text-center mb-6">
          {/* Logo mark */}
          <span className="tech-mono font-bold tracking-widest text-3xl text-[var(--foreground)] border-2 border-[var(--foreground)] px-4 py-1 inline-block mb-4">
            NYXA.
          </span>
          <h1 className="text-xl tracking-wider uppercase m-0">IDENTITY VERIFICATION</h1>
          <p className="text-xs text-[var(--muted)] uppercase tracking-widest mt-1">
            Access secure transaction profile
          </p>
        </div>

        {error && (
          <div className="border border-red-800 p-3 bg-red-950/20 text-red-400 text-xs mb-4 uppercase">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="nyxa-label">Email Address</label>
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
            <label className="nyxa-label">Secure Access Key (Password)</label>
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
            {loading ? 'VERIFYING CREDENTIALS...' : 'AUTHORIZE SESSION'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-[var(--border)]"></div>
          <span className="flex-shrink mx-3 text-[10px] text-[var(--muted)] uppercase tracking-wider tech-mono">OR CONNECT WITH</span>
          <div className="flex-grow border-t border-[var(--border)]"></div>
        </div>

        {/* Social buttons grid */}
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <button 
              type="button" 
              onClick={() => alert('Google authentication service simulation initiated.')} 
              className="nyxa-btn nyxa-btn-secondary text-[10px] py-1.5 px-2 tech-mono"
            >
              GOOGLE
            </button>
            <button 
              type="button" 
              onClick={() => alert('Apple authentication service simulation initiated.')} 
              className="nyxa-btn nyxa-btn-secondary text-[10px] py-1.5 px-2 tech-mono"
            >
              APPLE
            </button>
            <button 
              type="button" 
              onClick={() => alert('Microsoft authentication service simulation initiated.')} 
              className="nyxa-btn nyxa-btn-secondary text-[10px] py-1.5 px-2 tech-mono"
            >
              MICROSOFT
            </button>
            <button 
              type="button" 
              onClick={() => alert('Facebook authentication service simulation initiated.')} 
              className="nyxa-btn nyxa-btn-secondary text-[10px] py-1.5 px-2 tech-mono"
            >
              FACEBOOK
            </button>
          </div>
          <button 
            type="button" 
            onClick={() => alert('X authentication service simulation initiated.')} 
            className="nyxa-btn nyxa-btn-secondary text-[10px] py-1.5 px-2 tech-mono w-full"
          >
            X / TWITTER
          </button>
        </div>
        
        <p className="text-xs text-center uppercase tracking-wider text-[var(--muted)] mt-6 mb-0">
          Unregistered identity?{' '}
          <a href="/register" className="text-[var(--foreground)] font-bold hover:underline">
            Register Profile &rarr;
          </a>
        </p>
      </div>
    </div>
  );
}
