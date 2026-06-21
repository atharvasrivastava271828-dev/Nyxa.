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
  // Client session
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRoles, setUserRoles] = useState<{ is_developer: boolean } | null>(null);

  const [apis, setApis] = useState<DeveloperApi[]>([]);
  const [filteredApis, setFilteredApis] = useState<DeveloperApi[]>([]);
  
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

  // 1. Session verification & load APIs
  useEffect(() => {
    const id = localStorage.getItem('nyxa_user_id');
    const uName = localStorage.getItem('nyxa_user_name');
    const rolesStr = localStorage.getItem('nyxa_user_roles');
    
    if (id) {
      setUserId(id);
      setUserName(uName);
      if (rolesStr) setUserRoles(JSON.parse(rolesStr));
    }
    
    fetchApis();
  }, []);

  // Filter logic
  useEffect(() => {
    let result = apis;

    if (searchTerm.trim() !== '') {
      const query = searchTerm.toLowerCase();
      result = result.filter(
        api =>
          api.name.toLowerCase().includes(query) ||
          api.endpoint_url.toLowerCase().includes(query) ||
          (api.documentation && api.documentation.toLowerCase().includes(query))
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter(api =>
        api.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    setFilteredApis(result);
  }, [searchTerm, selectedCategory, apis]);

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
    <div className="nyxa-container">
      <div className="border-b border-[var(--border)] pb-6 mb-8">
        <h1>API MARKETPLACE</h1>
        <p className="m-0 text-sm">
          Frictionless license market for developer endpoints. Purchase and register credentials to route automation jobs.
        </p>
      </div>

      {/* Guest Alert Banner */}
      {!userId && (
        <div className="border border-[var(--border)] p-4 mb-8 bg-[var(--secondary-bg)] text-sm uppercase tracking-wide flex justify-between items-center">
          <span>⚠️ GUEST ACCESS STATE &bull; LOGIN REQUIRED TO PURCHASE API LICENSES</span>
          <a href="/login" className="nyxa-btn nyxa-btn-primary py-1 px-3 text-xs">LOGIN &rarr;</a>
        </div>
      )}

      {/* Dashboard Sub-Info */}
      {userId && (
        <div className="border border-[var(--border)] px-4 py-3 mb-8 bg-[var(--secondary-bg)] text-xs tech-mono flex justify-between items-center">
          <span>ACTIVE SESSION: {userName} ({userId.slice(0, 8)}...)</span>
          {userRoles?.is_developer ? (
            <span className="text-[var(--success)]">&bull; API ENDPOINT LISTINGS ENABLED</span>
          ) : (
            <span className="text-[var(--muted)]">&bull; BROWSE ACCESS ONLY (DEVELOPER PROFILE REQUIRED TO LIST APIS)</span>
          )}
        </div>
      )}

      {/* Grid Layout */}
      <div className="nyxa-grid-sidebar">
        {/* Left Sidebar: Controls & Registration */}
        <aside className="flex flex-col gap-6">
          {/* Filters Card */}
          <div className="nyxa-card">
            <h3 className="border-b border-[var(--border)] pb-2 mb-4">API FILTERS</h3>
            <div className="flex flex-col gap-4">
              {/* Search */}
              <div>
                <label className="nyxa-label">Search API Catalog</label>
                <div className="search-container">
                  <span className="search-icon tech-mono text-xs">[FIND]</span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search name, endpoint..."
                    className="nyxa-input search-input text-sm tech-mono"
                  />
                </div>
              </div>

              {/* Categories */}
              <div>
                <label className="nyxa-label">Category Group</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="nyxa-select text-sm"
                >
                  <option value="all">ALL CATEGORIES</option>
                  {allCategories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Registration form */}
          <div className="nyxa-card">
            <h3 className="border-b border-[var(--border)] pb-2 mb-4">REGISTER AN API</h3>
            
            {error && (
              <div className="border border-red-800 p-3 bg-red-950/20 text-red-400 text-xs mb-4 uppercase">
                {error}
              </div>
            )}

            <form onSubmit={handleRegisterApi} className="flex flex-col gap-4">
              <div>
                <label className="nyxa-label">API Descriptor Name</label>
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
                <label className="nyxa-label">Interface Category</label>
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
                <label className="nyxa-label">Root endpoint URL</label>
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
                <label className="nyxa-label">Documentation URL (Optional)</label>
                <input
                  type="url"
                  value={documentation}
                  onChange={(e) => setDocumentation(e.target.value)}
                  placeholder="https://docs.domain.com"
                  className="nyxa-input text-sm tech-mono"
                />
              </div>

              <div>
                <label className="nyxa-label">License Price (USD / Flat Key)</label>
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
                disabled={loading || !!(userRoles && !userRoles.is_developer)}
                className="nyxa-btn nyxa-btn-primary w-full text-xs"
              >
                {loading ? 'REGISTERING SYSTEM...' : 'PUBLISH API INTERFACE'}
              </button>
              
              {userRoles && !userRoles.is_developer && (
                <span className="text-[10px] text-red-500 uppercase text-center mt-1">
                  Developer profile required to list APIs
                </span>
              )}
            </form>
          </div>
        </aside>

        {/* Right Main Panel: API Cards */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg tracking-wider mb-2 uppercase border-b border-[var(--border)] pb-2 flex justify-between items-center">
            <span>ACTIVE LICENSES AVAILABLE</span>
            <span className="tech-mono text-xs text-[var(--muted)]">INDEX COUNT: {filteredApis.length}</span>
          </h2>

          {filteredApis.length === 0 ? (
            <div className="border border-[var(--border)] p-12 text-center text-sm uppercase tracking-wider text-[var(--muted)]">
              No registered APIs match the current query categories.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredApis.map(api => (
                <div key={api.id} className="nyxa-card">
                  {/* Title and Category */}
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="mb-0.5">{api.name}</h3>
                      <span className="tech-mono text-[10px] text-[var(--muted)] select-all">UUID: {api.id}</span>
                    </div>
                    <span className="nyxa-badge text-xs">{api.category}</span>
                  </div>

                  {/* Details */}
                  <div className="my-4 flex flex-col gap-2">
                    <div className="flex gap-2 items-center">
                      <span className="text-[10px] uppercase text-[var(--muted)] tracking-wider w-20">Endpoint:</span>
                      <code className="tech-mono text-xs bg-[var(--secondary-bg)] px-2 py-0.5 border border-[var(--border)] truncate max-w-md select-all">
                        {api.endpoint_url}
                      </code>
                    </div>

                    {api.documentation && (
                      <div className="flex gap-2 items-center">
                        <span className="text-[10px] uppercase text-[var(--muted)] tracking-wider w-20">Docs:</span>
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
                      <span className="text-[10px] uppercase text-[var(--muted)] tracking-wider">License Cost</span>
                      <strong className="tech-mono text-base">${api.price.toFixed(2)}</strong>
                    </div>

                    <button
                      onClick={() => handlePurchaseKey(api)}
                      className="nyxa-btn nyxa-btn-primary text-xs py-1.5 px-4"
                    >
                      PURCHASE LICENSE
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
