'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Register() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Roles
  const [isBuyer, setIsBuyer] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [isDeveloper, setIsDeveloper] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!isBuyer && !isSeller && !isDeveloper) {
      setError('Please select at least one user role.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          password,
          is_buyer: isBuyer,
          is_seller: isSeller,
          is_developer: isDeveloper
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nyxa-container max-w-md py-12">
      <div className="nyxa-card p-8 border-2 border-[var(--foreground)]">
        <div className="text-center mb-6">
          {/* Logo mark */}
          <span className="font-bold tracking-tight text-3xl text-[var(--foreground)] border-2 border-[var(--foreground)] px-4 py-1 inline-block mb-4 rounded-lg">
            Nyxa.
          </span>
          <h1 className="text-xl tracking-tight m-0 font-semibold">Create your account</h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            Join Nyxa — it's free to get started
          </p>
        </div>
        
        {error && (
          <div className="border border-red-800 p-3 bg-red-950/20 text-red-400 text-xs mb-4 uppercase rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="nyxa-label">Full name</label>
            <input 
              type="text" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="e.g. John Doe"
              className="nyxa-input text-sm" 
            />
          </div>
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

          {/* Roles selection */}
          <div className="border border-[var(--border)] p-4 bg-[var(--secondary-bg)] mt-2 rounded-lg">
            <label className="nyxa-label mb-2 font-semibold">I want to...</label>
            
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input 
                  type="checkbox" 
                  checked={isBuyer} 
                  onChange={(e) => setIsBuyer(e.target.checked)} 
                  className="accent-black"
                />
                <span>Post tasks and hire agents</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input 
                  type="checkbox" 
                  checked={isSeller} 
                  onChange={(e) => setIsSeller(e.target.checked)} 
                  className="accent-black"
                />
                <span>Complete tasks and earn</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input 
                  type="checkbox" 
                  checked={isDeveloper} 
                  onChange={(e) => setIsDeveloper(e.target.checked)} 
                  className="accent-black"
                />
                <span>List my agents or APIs</span>
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="nyxa-btn nyxa-btn-primary w-full text-xs py-2 mt-2"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-[var(--border)]"></div>
          <span className="flex-shrink mx-3 text-[10px] text-[var(--muted)] tech-mono">Or sign up with</span>
          <div className="flex-grow border-t border-[var(--border)]"></div>
        </div>

        {/* Social buttons grid */}
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <button 
              type="button" 
              onClick={() => alert('Google registration service simulation initiated.')} 
              className="nyxa-btn nyxa-btn-secondary text-[10px] py-1.5 px-2 tech-mono"
            >
              Google
            </button>
            <button 
              type="button" 
              onClick={() => alert('Apple registration service simulation initiated.')} 
              className="nyxa-btn nyxa-btn-secondary text-[10px] py-1.5 px-2 tech-mono"
            >
              Apple
            </button>
            <button 
              type="button" 
              onClick={() => alert('Microsoft registration service simulation initiated.')} 
              className="nyxa-btn nyxa-btn-secondary text-[10px] py-1.5 px-2 tech-mono"
            >
              Microsoft
            </button>
            <button 
              type="button" 
              onClick={() => alert('Facebook registration service simulation initiated.')} 
              className="nyxa-btn nyxa-btn-secondary text-[10px] py-1.5 px-2 tech-mono"
            >
              Facebook
            </button>
          </div>
          <button 
            type="button" 
            onClick={() => alert('X registration service simulation initiated.')} 
            className="nyxa-btn nyxa-btn-secondary text-[10px] py-1.5 px-2 tech-mono w-full"
          >
            X
          </button>
        </div>
        
        <p className="text-xs text-center text-[var(--muted)] mt-6 mb-0">
          Already have an account?{' '}
          <a href="/login" className="text-[var(--foreground)] font-semibold hover:underline">
            Sign in &rarr;
          </a>
        </p>
      </div>
    </div>
  );
}
