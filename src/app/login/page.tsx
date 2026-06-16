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

      // SESSION SIMULATION FOR MVP:
      // Store the user profile locally so the marketplace and dashboard
      // wireframes know who is executing actions (posting tasks, paying, reviewing).
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

      // Success: Redirect to User Dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials or connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h1>Login</h1>
      <p style={{ color: '#666' }}>Sign in to access your NYXA profile</p>

      {error && (
        <div style={{ padding: '0.75rem', background: '#ffebee', color: '#c62828', borderRadius: '4px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginTop: '1rem' }}>
          <label>Email Address:</label><br />
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} 
          />
        </div>
        <div style={{ marginTop: '1rem' }}>
          <label>Password:</label><br />
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} 
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            marginTop: '1.5rem', 
            width: '100%', 
            padding: '0.75rem', 
            background: loading ? '#9e9e9e' : '#0070f3', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Logging in...' : 'Sign In'}
        </button>
      </form>
      
      <p style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        Don't have an account? <a href="/register" style={{ color: '#0070f3' }}>Register</a>
      </p>
    </div>
  );
}
