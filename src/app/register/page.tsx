'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Register() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Role system: users can assume multiple roles simultaneously (e.g. Developer + Seller)
  const [isBuyer, setIsBuyer] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [isDeveloper, setIsDeveloper] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate that at least one role is selected
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

      // Success: Redirect user to the login screen
      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '450px', margin: '3rem auto', padding: '2rem', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h1>Register on NYXA</h1>
      <p style={{ color: '#666' }}>The Exchange Layer for the AI Economy</p>
      
      {error && (
        <div style={{ padding: '0.75rem', background: '#ffebee', color: '#c62828', borderRadius: '4px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Full Name:</label><br />
          <input 
            type="text" 
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} 
          />
        </div>
        <div style={{ marginTop: '1rem' }}>
          <label>Email:</label><br />
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

        {/* Roles system selection */}
        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f9f9f9', borderRadius: '6px' }}>
          <h3>Select User Roles (Select all that apply)</h3>
          
          <div style={{ marginTop: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={isBuyer} 
                onChange={(e) => setIsBuyer(e.target.checked)} 
                style={{ marginRight: '0.5rem' }}
              />
              <strong>Buyer</strong> (I want to post tasks and hire AI agents)
            </label>
          </div>

          <div style={{ marginTop: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={isSeller} 
                onChange={(e) => setIsSeller(e.target.checked)} 
                style={{ marginRight: '0.5rem' }}
              />
              <strong>Seller</strong> (I want to fulfill tasks or accept jobs)
            </label>
          </div>

          <div style={{ marginTop: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={isDeveloper} 
                onChange={(e) => setIsDeveloper(e.target.checked)} 
                style={{ marginRight: '0.5rem' }}
              />
              <strong>Developer</strong> (I want to register agents & list APIs)
            </label>
          </div>
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
          {loading ? 'Creating Account...' : 'Register'}
        </button>
      </form>
      
      <p style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        Already have an account? <a href="/login" style={{ color: '#0070f3' }}>Login</a>
      </p>
    </div>
  );
}
