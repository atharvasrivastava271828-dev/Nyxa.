'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Task {
  id: string;
  title: string;
  description: string;
  price: number;
  status: string;
  provider_id: string;
}

export default function TasksMarketplace() {
  const router = useRouter();
  
  // Client session
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // New task form fields for Sellers
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Session verification & load tasks
  useEffect(() => {
    const id = localStorage.getItem('nyxa_user_id');
    const uName = localStorage.getItem('nyxa_user_name');
    const rolesStr = localStorage.getItem('nyxa_user_roles');
    
    if (id) {
      setUserId(id);
      setUserName(uName);
      if (rolesStr) {
        try {
          const parsed = JSON.parse(rolesStr);
          setUserRoles(Array.isArray(parsed) ? parsed : []);
        } catch (e) {
          setUserRoles([]);
        }
      }
    } else {
      async function checkSession() {
        try {
          const res = await fetch('/api/auth/me');
          if (res.ok) {
            const data = await res.json();
            if (data.user) {
              setUserId(data.user.id);
              setUserName(data.user.name);
              setUserRoles(data.user.roles || []);
              
              localStorage.setItem('nyxa_user_id', data.user.id);
              localStorage.setItem('nyxa_user_name', data.user.name);
              localStorage.setItem('nyxa_user_roles', JSON.stringify(data.user.roles || []));
            }
          }
        } catch (err) {
          console.error('Session fetch failed', err);
        }
      }
      checkSession();
    }
    fetchTasks();
  }, []);

  // Handle query parameter search
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const search = params.get('search');
      if (search) {
        setSearchTerm(search);
      }
    }
  }, [tasks]);

  // Handle search filtering
  useEffect(() => {
    let result = tasks;
    if (searchTerm.trim() !== '') {
      const query = searchTerm.toLowerCase();
      result = result.filter(
        task =>
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query)
      );
    }
    setFilteredTasks(result);
  }, [searchTerm, tasks]);

  async function fetchTasks() {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      if (res.ok) {
        setTasks(data.tasks || []);
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
    }
  }

  // 2. Publish new task offering (For Sellers)
  const handlePostTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!userId) {
      setError('You must be logged in to publish a task offering.');
      setLoading(false);
      return;
    }

    if (!userRoles.includes('provider')) {
      setError('Permission Denied: Your profile does not have the "Provider" role.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_id: userId,
          title,
          description,
          price: parseFloat(price)
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to publish task offering');
      }

      // Reset form and refresh catalog
      setTitle('');
      setDescription('');
      setPrice('');
      fetchTasks();
    } catch (err: any) {
      setError(err.message || 'Error occurred while saving task offering.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Purchase Task flow (For Buyers)
  const handlePurchaseTask = async (task: Task) => {
    if (!userId) {
      alert('Please log in to purchase this task.');
      return;
    }

    if (userId === task.provider_id) {
      alert('You cannot purchase your own task offering.');
      return;
    }

    const platformFee = task.price * 0.10;
    const totalAmount = task.price + platformFee;

    const confirmPayment = confirm(
      `Purchase "${task.title}"?\n\n` +
      `Task Price: ₹${task.price.toFixed(2)}\n` +
      `Platform Fee (10%): ₹${platformFee.toFixed(2)}\n` +
      `Total Charged: ₹${totalAmount.toFixed(2)}\n\n` +
      `Funds will be held in Escrow until delivery is confirmed.`
    );

    if (!confirmPayment) return;

    try {
      // Create the order record in DB and get the Razorpay order ID
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: task.id,
          buyerUserId: userId,
          sellerUserId: task.provider_id,
          amount: task.price
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Order initialization failed.');
      }

      // NOTE: Real Razorpay Checkout JS will be loaded here once
      // RAZORPAY_KEY_ID is configured in .env.local.
      // For now the order is saved to DB with status=pending.
      // The provider can see it on their dashboard immediately.
      alert(
        `Order placed! 🎉\n\n` +
        `Your order for "${task.title}" has been recorded.\n` +
        `Order ID: ${data.order.id}\n\n` +
        `Payment will be processed via Razorpay. Track your order in the Dashboard.`
      );
      fetchTasks();
    } catch (err: any) {
      alert(err.message || 'Checkout failed.');
    }
  };

  return (
    <div className="nyxa-container">
      <div className="border-b border-[var(--border)] pb-6 mb-8">
        <h1>Task Marketplace</h1>
        <p className="m-0 text-sm">
          Browse predefined digital capabilities offered by top developers and AI operators.
        </p>
      </div>

      {/* Guest Alert Banner */}
      {!userId && (
        <div className="border border-[var(--border)] p-4 mb-8 bg-[var(--secondary-bg)] text-sm flex justify-between items-center rounded-lg">
          <span>You're browsing as a guest. Log in to purchase tasks or offer your own services.</span>
          <a href="/login" className="nyxa-btn nyxa-btn-primary py-1 px-3 text-xs">Log In</a>
        </div>
      )}

      {/* Dashboard Sub-Info */}
      {userId && (
        <div className="border border-[var(--border)] px-4 py-3 mb-8 bg-[var(--secondary-bg)] text-xs tech-mono flex justify-between items-center rounded-lg">
          <span>Active Session: {userName} ({userId.slice(0, 8)}...)</span>
          <span className="text-[var(--success)]">&bull; Escrow protection active</span>
        </div>
      )}

      {/* Structured Layout Grid */}
      <div className="nyxa-grid-sidebar">
        {/* Left Sidebar: Controls & Publish form */}
        <aside className="flex flex-col gap-6">
          {/* Marketplace Search Panel */}
          <div className="nyxa-card">
            <h3 className="border-b border-[var(--border)] pb-2 mb-4 font-semibold">Search Catalog</h3>
            <div>
              <label className="nyxa-label">Keywords</label>
              <div className="search-container">
                <span className="search-icon tech-mono text-xs">Search</span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Scraping, SEO, Audit..."
                  className="nyxa-input search-input text-sm"
                />
              </div>
            </div>
          </div>

          {/* Publish New Task Offering Form (For Sellers/Developers) */}
          <div className="nyxa-card">
            <h3 className="border-b border-[var(--border)] pb-2 mb-4 font-semibold">Offer a Task</h3>
            <p className="text-xs mb-4 text-[var(--muted)]">Publish a specific digital capability you or your agents can perform.</p>
            
            {error && (
              <div className="border border-red-800 p-3 bg-red-950/20 text-red-400 text-xs mb-4 uppercase rounded-md">
                {error}
              </div>
            )}
            
            <form onSubmit={handlePostTask} className="flex flex-col gap-4">
              <div>
                <label className="nyxa-label">Outcome / Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="E.g., Scrape 1,000 URLs..."
                  required
                  className="nyxa-input text-sm"
                />
              </div>

              <div>
                <label className="nyxa-label">Description & Deliverables</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain exactly what the buyer will receive..."
                  rows={4}
                  required
                  className="nyxa-textarea text-sm"
                ></textarea>
              </div>

              <div>
                <label className="nyxa-label">Fixed Price (USD)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="50"
                  required
                  className="nyxa-input text-sm tech-mono"
                />
              </div>

              <button
                type="submit"
                disabled={loading || (!userRoles.includes('provider'))}
                className="nyxa-btn nyxa-btn-primary w-full text-xs"
              >
                {loading ? 'Publishing...' : 'Publish Offering'}
              </button>
              
              {userRoles.length > 0 && !userRoles.includes('provider') && (
                <span className="text-[10px] text-red-500 text-center mt-1">
                  Provider role required to publish tasks
                </span>
              )}
            </form>
          </div>
        </aside>

        {/* Right Main Panel: Task Catalog */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg tracking-tight mb-2 font-semibold border-b border-[var(--border)] pb-2 flex justify-between items-center">
            <span>Predefined Tasks</span>
            <span className="tech-mono text-xs text-[var(--muted)]">
              {filteredTasks.length === 0 ? '0 tasks listed' : `${filteredTasks.length} ${filteredTasks.length === 1 ? 'task' : 'tasks'} available`}
            </span>
          </h2>

          {filteredTasks.length === 0 ? (
            <div className="border border-[var(--border)] p-12 text-center text-sm text-[var(--muted)] rounded-lg">
              No task offerings match your search.
            </div>
          ) : (
            filteredTasks.map(task => (
              <div key={task.id} className="nyxa-card">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="mb-1">{task.title}</h3>
                    <span className="tech-mono text-xs text-[var(--muted)] select-all">Provider: {task.provider_id.slice(0, 8)}...</span>
                  </div>
                  <span className={`nyxa-badge nyxa-badge-active`}>
                    {task.status}
                  </span>
                </div>

                <p className="text-sm mt-3 leading-relaxed mb-4 flex-grow">{task.description}</p>

                <div className="flex justify-between items-center border-t border-[var(--border)] pt-4 mt-auto">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[var(--muted)] tracking-wider">Price</span>
                    <strong className="tech-mono text-lg">${task.price.toFixed(2)}</strong>
                  </div>

                  <button
                    onClick={() => handlePurchaseTask(task)}
                    className="nyxa-btn nyxa-btn-primary text-xs py-1.5 px-6"
                  >
                    Purchase & Execute
                  </button>
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
