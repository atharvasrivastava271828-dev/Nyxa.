'use client';

import { useState, useEffect } from 'react';

interface DeveloperApi {
  id: string;
  name: string;
  category: string;
  endpoint_url: string;
  price: number;
  documentation?: string;
  developer_id: string;
}

export default function ApiMarketplace() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userRoles, setUserRoles] = useState<{ is_developer: boolean } | null>(null);

  const [apis, setApis] = useState<DeveloperApi[]>([]);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [endpointUrl, setEndpointUrl] = useState('');
  const [price, setPrice] = useState('');
  const [documentation, setDocumentation] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Session verification & load API catalog
  useEffect(() => {
    const id = localStorage.getItem('nyxa_user_id');
    const rolesStr = localStorage.getItem('nyxa_user_roles');
    
    if (id) {
      setUserId(id);
      if (rolesStr) setUserRoles(JSON.parse(rolesStr));
    }
    
    fetchApis();
  }, []);

  const fetchApis = async () => {
    try {
      const res = await fetch('/api/apis');
      const data = await res.json();
      if (res.ok) {
        setApis(data.apis || []);
      }
    } catch (err) {
      console.error('Failed to load APIs:', err);
    }
  };

  // 2. Submit new API endpoint
  const handleRegisterApi = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!userId) {
      setError('You must be logged in to list an API.');
      setLoading(false);
      return;
    }

    if (userRoles && !userRoles.is_developer) {
      setError('Permission Denied: Only developers can register new APIs.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/apis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          developer_id: userId,
          name,
          category,
          endpoint_url: endpointUrl,
          price: parseFloat(price),
          documentation
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to list API.');
      }

      // Reset form
      setName('');
      setCategory('');
      setEndpointUrl('');
      setPrice('');
      setDocumentation('');
      fetchApis();
    } catch (err: any) {
      setError(err.message || 'Error listing API.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Purchase API Key escrow simulation
  const handlePurchaseKey = async (api: DeveloperApi) => {
    if (!userId) {
      alert('Please log in to purchase an API key.');
      return;
    }

    const confirmPurchase = confirm(
      `Purchase API Key for "${api.name}"?\n` +
      `Base Price: $${api.price.toFixed(2)}\n` +
      `Platform Fee (10%): $${(api.price * 0.10).toFixed(2)}\n` +
      `Total Charged: $${(api.price * 1.10).toFixed(2)}\n\n` +
      `Proceed to Razorpay Checkout?`
    );

    if (!confirmPurchase) return;

    try {
      // Create Order
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiId: api.id,
          buyerUserId: userId,
          sellerUserId: api.developer_id,
          amount: api.price
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Checkout initialization failed.');
      }

      // Verify payment (Simulated validation check)
      const verifyRes = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpayOrderId: data.order.id,
          razorpayPaymentId: `pay_mock_${Math.random().toString(36).substring(7)}`,
          razorpaySignature: 'MOCK_CRYPTOGRAPHIC_SIGNATURE_VERIFIED_BY_PLATFORM'
        })
      });

      if (!verifyRes.ok) {
        throw new Error('Secured payment verification failed.');
      }

      alert('API Key purchased successfully! You can view access keys in your dashboard.');
    } catch (err: any) {
      alert(err.message || 'Checkout failed.');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '1rem' }}>
      <h1>API Marketplace</h1>
      <p>Discover programmatic APIs to power your agents, or list your own endpoints for developer licensing.</p>

      {/* Permission alert for Developers */}
      {userId && userRoles && !userRoles.is_developer && (
        <div style={{ padding: '0.75rem', background: '#fff3e0', border: '1px solid #ffe0b2', color: '#e65100', borderRadius: '4px', marginBottom: '1.5rem' }}>
          ⚠️ You are logged in, but your profile doesn't have the <strong>Developer</strong> role enabled. You cannot register new APIs.
        </div>
      )}

      {/* Register API Form */}
      <section style={{ marginTop: '2rem', border: '1px solid #ccc', borderRadius: '8px', padding: '1.5rem', background: '#fcfcfc' }}>
        <h2>Register an API Endpoint</h2>
        {error && (
          <div style={{ padding: '0.75rem', background: '#ffebee', color: '#c62828', borderRadius: '4px', marginBottom: '1rem' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleRegisterApi}>
          <div>
            <label>API Name:</label><br />
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Image Generation API"
              required 
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            />
          </div>
          <div style={{ marginTop: '1rem' }}>
            <label>Category:</label><br />
            <input 
              type="text" 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. AI, Data, Utilities"
              required 
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            />
          </div>
          <div style={{ marginTop: '1rem' }}>
            <label>Endpoint URL:</label><br />
            <input 
              type="url" 
              value={endpointUrl}
              onChange={(e) => setEndpointUrl(e.target.value)}
              placeholder="https://api.domain.com/v1/generate"
              required 
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            />
          </div>
          <div style={{ marginTop: '1rem' }}>
            <label>Price (USD per 1k requests):</label><br />
            <input 
              type="number" 
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="10"
              required
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            />
          </div>
          <div style={{ marginTop: '1rem' }}>
            <label>Documentation URL or markdown:</label><br />
            <textarea 
              value={documentation}
              onChange={(e) => setDocumentation(e.target.value)}
              placeholder="Add documentation or integration guidelines..."
              rows={3} 
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            ></textarea>
          </div>
          <button 
            type="submit" 
            disabled={loading || !!(userRoles && !userRoles.is_developer)}
            style={{ 
              marginTop: '1.25rem', 
              padding: '0.75rem 1.5rem', 
              background: (loading || !!(userRoles && !userRoles.is_developer)) ? '#9e9e9e' : '#0070f3', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: (loading || !!(userRoles && !userRoles.is_developer)) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Registering API...' : 'Register API'}
          </button>
        </form>
      </section>

      {/* Available APIs List */}
      <section style={{ marginTop: '3rem' }}>
        <h2>Available API Catalog</h2>
        <div style={{ display: 'grid', gap: '1.5rem', marginTop: '1rem' }}>
          {apis.length === 0 ? (
            <p style={{ color: '#777' }}>No developer APIs registered yet.</p>
          ) : (
            apis.map(api => (
              <div key={api.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1rem', background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>{api.name}</h3>
                  <span style={{ background: '#e1f5fe', color: '#01579b', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    {api.category.toUpperCase()}
                  </span>
                </div>
                <p style={{ color: '#555', marginTop: '0.5rem', fontFamily: 'monospace', fontSize: '0.9rem' }}>{api.endpoint_url}</p>
                {api.documentation && <p style={{ color: '#666', fontSize: '0.9rem' }}>{api.documentation}</p>}
                
                <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>Price: ${api.price}</strong>
                  <button 
                    onClick={() => handlePurchaseKey(api)}
                    style={{ padding: '0.5rem 1rem', background: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Purchase Licensing Key
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
