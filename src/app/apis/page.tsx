'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';

interface DeveloperApi {
  id: string;
  name: string;
  category: string;
  endpoint_url: string;
  price: number;
  documentation?: string;
  provider_id: string;
}

export default function ApiMarketplace() {
  const { userId, userName, userRoles, loading: authLoading } = useAuth();
  
  const [apis, setApis] = useState<DeveloperApi[]>([]);
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Form Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [endpointUrl, setEndpointUrl] = useState('');
  const [price, setPrice] = useState('');
  const [documentation, setDocumentation] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchApis() {
    try {
      const res = await fetch('/api/apis');
      const data = await res.json();
      if (res.ok) {
        setApis(data.apis || []);
      }
    } catch (err) {
      console.error('Failed to load APIs:', err);
    }
  }

  // 1. Load APIs
  useEffect(() => {
    fetchApis();
  }, []);

  // Compute filtered APIs dynamically during render
  const filteredApis = apis.filter(api => {
    const query = searchTerm.toLowerCase();
    const matchesSearch = searchTerm.trim() === '' ||
      api.name.toLowerCase().includes(query) ||
      api.endpoint_url.toLowerCase().includes(query) ||
      (api.documentation && api.documentation.toLowerCase().includes(query));

    const matchesCategory = selectedCategory === 'all' ||
      api.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  // Get unique categories for dynamic filtering
  const allCategories = Array.from(
    new Set(apis.map(api => api.category.toLowerCase()))
  );

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

    if (userRoles && !userRoles.is_provider) {
      setError('Permission Denied: Only providers can register new APIs.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/apis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_id: userId,
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

  // 3. Purchase API Key — create escrow order
  const handlePurchaseKey = async (api: DeveloperApi) => {
    if (!userId) {
      alert('Please log in to purchase an API key.');
      return;
    }

    if (userId === api.provider_id) {
      alert('You cannot purchase your own API.');
      return;
    }

    const confirmPurchase = confirm(
      `Purchase API Key for "${api.name}"?\n` +
      `Base Price: ₹${api.price.toFixed(2)}\n` +
      `Platform Fee (10%): ₹${(api.price * 0.10).toFixed(2)}\n` +
      `Total Charged: ₹${(api.price * 1.10).toFixed(2)}\n\n` +
      `Funds will be held in Escrow until access is confirmed.`
    );

    if (!confirmPurchase) return;

    try {
      // Create the order record in DB
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiId: api.id,
          buyerUserId: userId,
          sellerUserId: api.provider_id,
          amount: api.price
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Checkout initialization failed.');
      }

      // NOTE: Real Razorpay Checkout JS will be loaded here once
      // RAZORPAY_KEY_ID is configured in .env.local.
      alert(
        `API Key order placed! 🎉\n\n` +
        `Your order for "${api.name}" has been recorded.\n` +
        `Order ID: ${data.order.id}\n\n` +
        `Payment will be processed via Razorpay. View access keys in your Dashboard.`
      );
    } catch (err: any) {
      alert(err.message || 'Checkout failed.');
    }
  };

  return (
    <div className="nyxa-container">
      <div className="border-b border-[var(--border)] pb-6 mb-8">
        <h1>APIs</h1>
        <p className="m-0 text-sm">
          Discover and plug in APIs built for AI workflows. No manual setup.
        </p>
      </div>

      {/* Guest Alert Banner */}
      {!userId && (
        <div className="border border-[var(--border)] p-4 mb-8 bg-[var(--secondary-bg)] text-sm flex justify-between items-center rounded-lg">
          <span>You&apos;re browsing as a guest. Log in to license or publish APIs.</span>
          <Link href="/login" className="nyxa-btn nyxa-btn-primary py-1 px-3 text-xs">Log In</Link>
        </div>
      )}

      {/* Dashboard Sub-Info */}
      {userId && (
        <div className="border border-[var(--border)] px-4 py-3 mb-8 bg-[var(--secondary-bg)] text-xs tech-mono flex justify-between items-center rounded-lg">
          <span>Active Session: {userName} ({userId.slice(0, 8)}...)</span>
          {userRoles?.is_provider ? (
            <span className="text-[var(--success)]">&bull; API registration active</span>
          ) : (
            <span className="text-[var(--muted)]">&bull; Browse access only</span>
          )}
        </div>
      )}

      {/* Grid Layout */}
      <div className="nyxa-grid-sidebar">
        {/* Left Sidebar: Controls & Registration */}
        <aside className="flex flex-col gap-6">
          {/* Filters Card */}
          <div className="nyxa-card">
            <h3 className="border-b border-[var(--border)] pb-2 mb-4 font-semibold">Filter APIs</h3>
            <div className="flex flex-col gap-4">
              {/* Search */}
              <div>
                <label className="nyxa-label">Search APIs</label>
                <div className="search-container">
                  <span className="search-icon tech-mono text-xs">Search</span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search name, endpoint..."
                    className="nyxa-input search-input text-sm"
                  />
                </div>
              </div>

              {/* Categories */}
              <div>
                <label className="nyxa-label">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="nyxa-select text-sm"
                >
                  <option value="all">All</option>
                  {allCategories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Registration form */}
          <div className="nyxa-card">
            <h3 className="border-b border-[var(--border)] pb-2 mb-4 font-semibold">Publish an API</h3>
            
            {error && (
              <div className="border border-red-800 p-3 bg-red-950/20 text-red-400 text-xs mb-4 uppercase rounded-md">
                {error}
              </div>
            )}

            <form onSubmit={handleRegisterApi} className="flex flex-col gap-4">
              <div>
                <label className="nyxa-label">API name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Scraper Service"
                  required
                  className="nyxa-input text-sm"
                />
              </div>

              <div>
                <label className="nyxa-label">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Data, LLM, Image"
                  required
                  className="nyxa-input text-sm"
                />
              </div>

              <div>
                <label className="nyxa-label">Endpoint URL</label>
                <input
                  type="url"
                  value={endpointUrl}
                  onChange={(e) => setEndpointUrl(e.target.value)}
                  placeholder="https://api.domain.com/v1"
                  required
                  className="nyxa-input text-sm tech-mono"
                />
              </div>

              <div>
                <label className="nyxa-label">Docs URL (optional)</label>
                <input
                  type="url"
                  value={documentation}
                  onChange={(e) => setDocumentation(e.target.value)}
                  placeholder="https://docs.domain.com"
                  className="nyxa-input text-sm tech-mono"
                />
              </div>

              <div>
                <label className="nyxa-label">Price per license (USD)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="30"
                  required
                  className="nyxa-input text-sm tech-mono"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !!(userRoles && !userRoles.is_provider)}
                className="nyxa-btn nyxa-btn-primary w-full text-xs"
              >
                {loading ? 'Publishing...' : 'Publish API'}
              </button>
              
              {userRoles && !userRoles.is_provider && (
                <span className="text-[10px] text-red-500 text-center mt-1">
                  Developer profile required to publish APIs
                </span>
              )}
            </form>
          </div>
        </aside>

        {/* Right Main Panel: API Cards */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg tracking-tight mb-2 font-semibold border-b border-[var(--border)] pb-2 flex justify-between items-center">
            <span>Active APIs</span>
            <span className="tech-mono text-xs text-[var(--muted)]">
              {filteredApis.length === 0 ? '0 APIs listed yet' : `${filteredApis.length} ${filteredApis.length === 1 ? 'API' : 'APIs'} listed`}
            </span>
          </h2>

          {filteredApis.length === 0 ? (
            <div className="border border-[var(--border)] p-12 text-center text-sm text-[var(--muted)] rounded-lg">
              No APIs here yet. Be the first to publish one.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredApis.map(api => (
                <div key={api.id} className="nyxa-card">
                  {/* Title and Category */}
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="mb-0.5">{api.name}</h3>
                      <span className="tech-mono text-[10px] text-[var(--muted)] select-all">ID: {api.id}</span>
                    </div>
                    <span className="nyxa-badge text-xs">{api.category}</span>
                  </div>

                  {/* Details */}
                  <div className="my-4 flex flex-col gap-2">
                    <div className="flex gap-2 items-center">
                      <span className="text-[10px] text-[var(--muted)] tracking-wider w-20">Endpoint:</span>
                      <code className="tech-mono text-xs bg-[var(--secondary-bg)] px-2 py-0.5 border border-[var(--border)] truncate max-w-md select-all rounded">
                        {api.endpoint_url}
                      </code>
                    </div>

                    {api.documentation && (
                      <div className="flex gap-2 items-center">
                        <span className="text-[10px] text-[var(--muted)] tracking-wider w-20">Docs:</span>
                        <a
                          href={api.documentation}
                          target="_blank"
                          rel="noreferrer"
                          className="tech-mono text-xs text-[var(--foreground)] hover:underline"
                        >
                          {api.documentation}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Footer & Actions */}
                  <div className="border-t border-[var(--border)] pt-4 flex justify-between items-center mt-auto">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-[var(--muted)] tracking-wider">Price</span>
                      <strong className="tech-mono text-base">${api.price.toFixed(2)}</strong>
                    </div>

                    <button
                      onClick={() => handlePurchaseKey(api)}
                      className="nyxa-btn nyxa-btn-primary text-xs py-1.5 px-4"
                    >
                      Purchase License
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
