'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';
import Link from 'next/link';

interface Task {
  id: string;
  title: string;
  description: string;
  price: number;
  status: string;
  provider_id: string;
  assigned_to_agent_id?: string;
  created_at?: string;
}

interface Agent {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  price_demand: number;
  score: number;
  total_transactions: number;
  provider_id: string;
}

interface DeveloperApi {
  id: string;
  name: string;
  category: string;
  endpoint_url: string;
  price: number;
  documentation?: string;
  provider_id: string;
}

export default function Dashboard() {
  const router = useRouter();

  // Client Session state
  const { userId, userName, userEmail, userRoles, logout } = useAuth();

  // Data lists
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [myAgents, setMyAgents] = useState<Agent[]>([]);
  const [myApis, setMyApis] = useState<DeveloperApi[]>([]);
  const [myPurchases, setMyPurchases] = useState<any[]>([]);
  
  // Wallet state
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [walletTransactions, setWalletTransactions] = useState<any[]>([]);
  const [walletLoading, setWalletLoading] = useState<boolean>(false);
  
  // Dashboard Tabs: tasks, agents, apis, transactions, reviews, purchases
  const [activeTab, setActiveTab] = useState<'tasks' | 'agents' | 'apis' | 'transactions' | 'reviews' | 'purchases'>('tasks');
  
  // Review submission state
  const [selectedTaskForReview, setSelectedTaskForReview] = useState<Task | null>(null);
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const fetchDashboardData = async (currentUserId: string) => {
    setDataLoading(true);
    try {
      // Fetch tasks, agents, APIs, and wallet in parallel
      const [resTasks, resAgents, resApis, resOrders, resWallet] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/agents'),
        fetch('/api/apis'),
        fetch(`/api/orders?userId=${currentUserId}`),
        fetch('/api/wallet')
      ]);

      const [tasksData, agentsData, apisData, ordersData, walletData] = await Promise.all([
        resTasks.json(),
        resAgents.json(),
        resApis.json(),
        resOrders.ok ? resOrders.json() : Promise.resolve({ orders: [] }),
        resWallet.ok ? resWallet.json() : Promise.resolve({ balance: 0, transactions: [] })
      ]);

      if (resTasks.ok) {
        const allTasks: Task[] = tasksData.tasks || [];
        const userTasks = allTasks.filter(t => t.provider_id === currentUserId);
        setMyTasks(userTasks);
      }

      if (resAgents.ok) {
        const allAgents: Agent[] = agentsData.agents || [];
        const userAgents = allAgents.filter(a => a.provider_id === currentUserId);
        setMyAgents(userAgents);
      }

      if (resApis.ok) {
        const allApis: DeveloperApi[] = apisData.apis || [];
        const userApis = allApis.filter(a => a.provider_id === currentUserId);
        setMyApis(userApis);
      }

      if (resOrders.ok) {
        setMyPurchases(ordersData.orders || []);
      }

      if (resWallet.ok) {
        setWalletBalance(walletData.balance || 0);
        setWalletTransactions(walletData.transactions || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setDataLoading(false);
    }
  };

  const handleDeposit = async (amount: number) => {
    setWalletLoading(true);
    try {
      const res = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Deposit failed');
      }
      setWalletBalance(data.balance);
      setWalletTransactions(data.transaction ? [data.transaction, ...walletTransactions] : walletTransactions);
      alert(`Sandbox Deposit Successful! Added $${amount.toFixed(2)} to wallet.`);
    } catch (err: any) {
      alert(err.message || 'Deposit failed');
    } finally {
      setWalletLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      // It's possible the auth check is still loading, but for a protected route, 
      // we usually let useAuth handle it or wait for loading to finish.
      // But dashboard has check via router.push if not logged in.
      const id = localStorage.getItem('nyxa_user_id');
      if (!id) {
        router.push('/login');
        return;
      }
    } else {
      setTimeout(() => {
        fetchDashboardData(userId);
      }, 0);
    }
  }, [userId, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Submit Review & Release Escrow
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError(null);
    setLoading(true);

    if (!selectedTaskForReview) return;

    // Look for a real transaction for this task from purchases
    const realOrder = myPurchases.find(
      (o: any) => o.task_id === selectedTaskForReview.id && o.status === 'completed'
    );
    const txMockId = realOrder?.id || null;

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: selectedTaskForReview.id,
          reviewerUserId: userId,
          revieweeAgentId: selectedTaskForReview.assigned_to_agent_id || '00000000-0000-0000-0000-000000000000',
          rating: parseInt(rating),
          comment,
          transactionId: txMockId || undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review.');
      }

      alert('Review submitted! Task is completed and escrow funds are released.');
      setSelectedTaskForReview(null);
      setComment('');
      setRating('5');
      if (userId) fetchDashboardData(userId);
    } catch (err: any) {
      setReviewError(err.message || 'Error occurred during escrow release process.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSDK = async () => {
    if (!userId) return;
    try {
      const response = await fetch(`/api/sdk/download?userId=${userId}`);
      if (!response.ok) {
        let errorMsg = 'Failed to download SDK.';
        try {
          const errorData = await response.json();
          if (errorData.error) errorMsg = errorData.error;
        } catch (e) {
          // ignore json parse error
        }
        alert(errorMsg);
        return;
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'nyxa-sdk.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      alert('An error occurred while downloading the SDK.');
    }
  };

  // Helper to compile transactions lists from tasks
  const getEscrowTransactions = () => {
    return myTasks.map(task => {
      let statusLabel = 'HELD';
      if (task.status === 'completed') statusLabel = 'RELEASED';
      if (task.status === 'cancelled') statusLabel = 'REFUNDED';
      
      return {
        id: `tx_${task.id.slice(0, 8)}`,
        type: 'ESCROW_LOCK',
        ref: task.title,
        amount: task.price,
        fee: task.price * 0.10,
        total: task.price * 1.10,
        status: statusLabel,
        date: task.created_at || new Date().toISOString()
      };
    });
  };

  return (
    <div className="nyxa-container">
      {/* Header */}
      <div className="border-b border-[var(--border)] pb-6 mb-8 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Developer Dashboard</h1>
          <p className="m-0 text-sm text-[var(--muted)]">
            Manage your agents, tasks, and API integrations in one place.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {userRoles?.is_provider && (
            <button 
              onClick={handleDownloadSDK}
              className="nyxa-btn nyxa-btn-primary text-xs py-1.5 px-3 rounded-md border border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)] hover:opacity-90"
            >
              Download Developer SDK
            </button>
          )}
          <button 
            onClick={handleLogout} 
            className="nyxa-btn nyxa-btn-secondary text-xs self-start sm:self-center bg-red-950/15 border-red-800 text-red-500 hover:bg-red-950/20 rounded-md"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Profile & Wallet Block */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Card 1: Identity */}
        <div className="border border-[var(--border)] p-6 bg-[var(--card-bg)] rounded-xl flex flex-col justify-between min-h-[140px] shadow-sm">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">
            Account Identity
          </span>
          <div className="mt-4">
            <h2 className="text-lg tracking-tight m-0 font-bold text-[var(--foreground)]">{userName}</h2>
            <span className="text-xs text-[var(--muted)] select-all block mt-1">{userEmail} &bull; ID: {userId}</span>
          </div>
        </div>

        {/* Card 2: Roles */}
        <div className="border border-[var(--border)] p-6 bg-[var(--card-bg)] rounded-xl flex flex-col justify-between min-h-[140px] shadow-sm">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">
            Platform Roles
          </span>
          <div className="flex flex-wrap gap-2 mt-4">
            {userRoles?.is_buyer && (
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 border border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)] rounded-md">
                Buyer
              </span>
            )}
            {userRoles?.is_provider && (
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 border border-[var(--border)] text-[var(--foreground)] bg-[var(--secondary-bg)] rounded-md">
                Provider
              </span>
            )}
          </div>
        </div>

        {/* Card 3: Wallet */}
        <div className="border border-[var(--foreground)] p-6 bg-[var(--foreground)] text-[var(--background)] rounded-xl flex flex-col justify-between min-h-[140px] shadow-md">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-semibold uppercase tracking-widest opacity-70">
              Wallet Balance
            </span>
            <span className="text-xl font-bold tracking-tight">
              ${walletBalance.toFixed(2)}
            </span>
          </div>
          <button
            onClick={() => handleDeposit(50)}
            disabled={walletLoading}
            className="w-full text-center py-2 px-4 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[var(--background)] text-[var(--foreground)] border border-transparent hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {walletLoading ? 'Processing...' : 'Deposit $50 (Sandbox)'}
          </button>
        </div>
      </div>

      {/* Dashboard Sub-Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[var(--border)] pb-3 mb-6">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`nyxa-btn text-xs py-1.5 px-4 rounded-md ${activeTab === 'tasks' ? 'nyxa-btn-primary' : 'nyxa-btn-secondary'}`}
        >
          My Tasks
        </button>
        <button
          onClick={() => setActiveTab('agents')}
          className={`nyxa-btn text-xs py-1.5 px-4 rounded-md ${activeTab === 'agents' ? 'nyxa-btn-primary' : 'nyxa-btn-secondary'}`}
        >
          My Agents
        </button>
        <button
          onClick={() => setActiveTab('apis')}
          className={`nyxa-btn text-xs py-1.5 px-4 rounded-md ${activeTab === 'apis' ? 'nyxa-btn-primary' : 'nyxa-btn-secondary'}`}
        >
          My APIs
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`nyxa-btn text-xs py-1.5 px-4 rounded-md ${activeTab === 'transactions' ? 'nyxa-btn-primary' : 'nyxa-btn-secondary'}`}
        >
          Transactions
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`nyxa-btn text-xs py-1.5 px-4 rounded-md ${activeTab === 'reviews' ? 'nyxa-btn-primary' : 'nyxa-btn-secondary'}`}
        >
          Reviews
        </button>
        <button
          onClick={() => setActiveTab('purchases')}
          className={`nyxa-btn text-xs py-1.5 px-4 rounded-md ${activeTab === 'purchases' ? 'nyxa-btn-primary' : 'nyxa-btn-secondary'}`}
        >
          My Purchases
        </button>
        <Link
          href="/guides"
          className="nyxa-btn text-xs py-1.5 px-4 rounded-md border border-[var(--border)] text-[var(--foreground)] bg-[var(--card-bg)] hover:bg-[var(--secondary-bg)] md:ml-auto"
        >
          📖 Guide & Tutorials
        </Link>
      </div>

      {/* Loading state indicator */}
      {dataLoading ? (
        <div className="py-12 border border-[var(--border)] text-center text-xs tech-mono text-[var(--muted)]">
          Loading dashboard data...
        </div>
      ) : (
        <div>
          {/* TAB: TASKS */}
          {activeTab === 'tasks' && (
            <div className="flex flex-col gap-6">
              {/* Reviews/Escrow Release block */}
              <div>
                <h2 className="text-base font-semibold border-b border-[var(--border)] pb-2 mb-4">
                  Awaiting review & release
                </h2>
                
                {myTasks.filter(t => t.status === 'submitted' || t.status === 'matched' || t.status === 'in_progress').length === 0 ? (
                  <p className="text-xs text-[var(--muted)]">
                    No active tasks currently require review.
                  </p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {myTasks.filter(t => t.status === 'submitted' || t.status === 'matched' || t.status === 'in_progress').map(task => (
                      <div key={task.id} className="nyxa-card border-2 border-[var(--foreground)] rounded-lg">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h3 className="mb-0.5 text-sm font-semibold">{task.title}</h3>
                            <span className="tech-mono text-[10px] text-[var(--muted)]">Task ID: {task.id}</span>
                          </div>
                          <span className="nyxa-badge nyxa-badge-active text-xs">
                            {task.status}
                          </span>
                        </div>
                        
                        <p className="text-xs mt-2 mb-4">{task.description}</p>
                        
                        <div className="text-xs text-[var(--muted)] mb-4">
                          Price: ${task.price.toFixed(2)} &bull; Total Escrow: ${(task.price * 1.1).toFixed(2)} (includes 10% fee)
                        </div>

                        {selectedTaskForReview?.id === task.id ? (
                          <form onSubmit={handleSubmitReview} className="border-t border-[var(--border)] pt-4 mt-2">
                            {reviewError && (
                              <div className="border border-red-800 p-2 bg-red-950/20 text-red-400 text-xs mb-3 rounded-md">
                                {reviewError}
                              </div>
                            )}
                            <div className="flex flex-col sm:flex-row gap-4 mb-3">
                              <div className="sm:w-1/3">
                                <label className="nyxa-label">Rating</label>
                                <select 
                                  value={rating} 
                                  onChange={(e) => setRating(e.target.value)} 
                                  className="nyxa-select text-xs"
                                >
                                  <option value="5">★ 5 - Exceptional</option>
                                  <option value="4">★ 4 - Good</option>
                                  <option value="3">★ 3 - Satisfactory</option>
                                  <option value="2">★ 2 - Needs improvement</option>
                                  <option value="1">★ 1 - Fail / No release</option>
                                </select>
                              </div>
                              <div className="sm:w-2/3">
                                <label className="nyxa-label">Review / Feedback</label>
                                <textarea 
                                  value={comment}
                                  onChange={(e) => setComment(e.target.value)}
                                  placeholder="Provide feedback on the task completion..."
                                  rows={2}
                                  required
                                  className="nyxa-textarea text-xs"
                                ></textarea>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                type="submit" 
                                disabled={loading} 
                                className="nyxa-btn nyxa-btn-primary text-xs py-1.5 px-3 rounded-md"
                              >
                                {loading ? 'Releasing escrow...' : 'Approve & Release Escrow'}
                              </button>
                              <button 
                                type="button" 
                                onClick={() => setSelectedTaskForReview(null)} 
                                className="nyxa-btn nyxa-btn-secondary text-xs py-1.5 px-3 rounded-md"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        ) : (
                          <button 
                            onClick={() => setSelectedTaskForReview(task)}
                            className="nyxa-btn nyxa-btn-primary text-xs py-1.5 px-4 self-start rounded-md"
                          >
                            Review work & release escrow
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tasks History */}
              <div className="mt-4">
                <h2 className="text-base font-semibold border-b border-[var(--border)] pb-2 mb-4">
                  Task history
                </h2>
                
                {myTasks.length === 0 ? (
                  <p className="text-xs text-[var(--muted)]">
                    You haven&apos;t posted any tasks yet.
                  </p>
                ) : (
                  <div className="nyxa-table-wrapper rounded-lg">
                    <table className="nyxa-table">
                      <thead>
                        <tr>
                          <th>Task</th>
                          <th>Price</th>
                          <th>Status</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myTasks.map(task => (
                          <tr key={task.id}>
                            <td>
                              <div className="font-semibold">{task.title}</div>
                              <span className="tech-mono text-[10px] text-[var(--muted)] select-all">{task.id}</span>
                            </td>
                            <td className="tech-mono font-semibold">${task.price.toFixed(2)}</td>
                            <td>
                              <span className="nyxa-badge text-[10px]">{task.status}</span>
                            </td>
                            <td className="tech-mono text-xs">
                              {task.created_at ? new Date(task.created_at).toLocaleDateString() : 'Recent'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: PURCHASES */}
          {activeTab === 'purchases' && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-base font-semibold border-b border-[var(--border)] pb-2 mb-4">
                  My Purchases
                </h2>
                <p className="text-xs text-[var(--muted)] mb-4">
                  Tasks, agents, and APIs you have purchased. Funds are held in escrow until you approve delivery.
                </p>

                {myPurchases.length === 0 ? (
                  <div className="border border-[var(--border)] p-8 text-center text-sm text-[var(--muted)] rounded-lg">
                    <p>You have not made any purchases yet.</p>
                    <div className="flex gap-3 justify-center mt-4">
                      <Link href="/tasks" className="nyxa-btn nyxa-btn-secondary text-xs py-1.5 px-4 rounded-md">Browse Tasks</Link>
                      <Link href="/agents" className="nyxa-btn nyxa-btn-secondary text-xs py-1.5 px-4 rounded-md">Browse Agents</Link>
                      <Link href="/apis" className="nyxa-btn nyxa-btn-secondary text-xs py-1.5 px-4 rounded-md">Browse APIs</Link>
                    </div>
                  </div>
                ) : (
                  <div className="nyxa-table-wrapper rounded-lg">
                    <table className="nyxa-table">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Type</th>
                          <th>Amount</th>
                          <th>Payment</th>
                          <th>Escrow</th>
                          <th>Date</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myPurchases.map((order: any) => (
                          <tr key={order.id}>
                            <td className="tech-mono text-[10px] select-all">{order.id.slice(0, 8)}...</td>
                            <td className="text-xs">
                              {order.task_id ? 'Task' : order.api_id ? 'API' : order.agent_id ? 'Agent' : 'Unknown'}
                            </td>
                            <td className="tech-mono text-xs font-semibold">${order.amount?.toFixed(2)}</td>
                            <td>
                              <span className={`nyxa-badge text-[9px] ${
                                order.status === 'completed' ? 'nyxa-badge-success' : 'nyxa-badge-active'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td>
                              <span className={`nyxa-badge text-[9px] ${
                                order.escrow_status === 'released' ? 'nyxa-badge-success' : 'nyxa-badge-active'
                              }`}>
                                {order.escrow_status}
                              </span>
                            </td>
                            <td className="tech-mono text-xs">
                              {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Recent'}
                            </td>
                            <td>
                              {order.escrow_status !== 'released' && order.status === 'completed' && (
                                <button
                                  onClick={async () => {
                                    if (confirm('Release funds to the seller? This cannot be undone.')) {
                                      try {
                                        const res = await fetch('/api/payments/release', {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ orderId: order.id })
                                        });
                                        if (!res.ok) throw new Error('Failed to release escrow');
                                        fetchDashboardData(userId as string);
                                      } catch (err) {
                                        alert('Error releasing escrow.');
                                      }
                                    }
                                  }}
                                  className="nyxa-btn nyxa-btn-primary text-[10px] py-1 px-2"
                                >
                                  Release Escrow
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: AGENTS */}
          {activeTab === 'agents' && (
            <div>
              <h2 className="text-base font-semibold border-b border-[var(--border)] pb-2 mb-4">
                My registered agents
              </h2>
              {myAgents.length === 0 ? (
                <p className="text-xs text-[var(--muted)]">
                  You haven&apos;t registered any agents yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myAgents.map(agent => (
                    <div key={agent.id} className="nyxa-card rounded-lg">
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <div>
                          <h3 className="mb-0.5 text-sm font-semibold">{agent.name}</h3>
                          <span className="tech-mono text-[9px] text-[var(--muted)] select-all">Agent ID: {agent.id}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-[var(--foreground)] tech-mono">
                            ★ {agent.score.toFixed(1)}
                          </span>
                          <div className="text-[8px] text-[var(--muted)] tracking-wider">{agent.total_transactions} completed</div>
                        </div>
                      </div>
                      
                      <p className="text-xs leading-relaxed flex-grow mt-2 mb-4">{agent.description}</p>
                      
                      <div className="flex flex-wrap gap-1 mb-4">
                        {agent.capabilities.map(cap => (
                          <span key={cap} className="tech-mono text-[9px] bg-[var(--secondary-bg)] px-1.5 py-0.5 border border-[var(--border)] rounded">
                            #{cap}
                          </span>
                        ))}
                      </div>
                      
                      <div className="border-t border-[var(--border)] pt-3 flex justify-between items-center mt-auto">
                        <span className="text-[9px] uppercase text-[var(--muted)] tracking-wider">Usage rate</span>
                        <strong className="tech-mono text-xs">${agent.price_demand.toFixed(2)} / run</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: APIS */}
          {activeTab === 'apis' && (
            <div>
              <h2 className="text-base font-semibold border-b border-[var(--border)] pb-2 mb-4">
                My registered APIs
              </h2>
              {myApis.length === 0 ? (
                <p className="text-xs text-[var(--muted)]">
                  You haven&apos;t registered any APIs yet.
                </p>
              ) : (
                <div className="nyxa-table-wrapper rounded-lg">
                  <table className="nyxa-table">
                    <thead>
                      <tr>
                        <th>API</th>
                        <th>Category</th>
                        <th>Endpoint</th>
                        <th>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myApis.map(api => (
                        <tr key={api.id}>
                          <td>
                            <div className="font-semibold">{api.name}</div>
                            <span className="tech-mono text-[9px] text-[var(--muted)] select-all">{api.id}</span>
                          </td>
                          <td>
                            <span className="nyxa-badge text-[10px]">{api.category}</span>
                          </td>
                          <td className="tech-mono text-xs select-all">
                            {api.endpoint_url}
                          </td>
                          <td className="tech-mono font-semibold">${api.price.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB: TRANSACTIONS */}
          {activeTab === 'transactions' && (
            <div className="flex flex-col gap-8">
              {/* Wallet Transaction Ledger */}
              <div>
                <h3 className="text-sm font-semibold border-b border-[var(--border)] pb-1.5 mb-3">
                  Wallet Account Ledger
                </h3>
                {walletTransactions.length === 0 ? (
                  <p className="text-xs text-[var(--muted)]">
                    No wallet transactions recorded. Use the sandbox deposit button to fund your account.
                  </p>
                ) : (
                  <div className="nyxa-table-wrapper rounded-lg mb-2">
                    <table className="nyxa-table">
                      <thead>
                        <tr>
                          <th>Transaction ID</th>
                          <th>Type</th>
                          <th>Description</th>
                          <th>Amount</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {walletTransactions.map((tx: any) => (
                          <tr key={tx.id}>
                            <td className="tech-mono text-xs font-semibold select-all">{tx.id}</td>
                            <td>
                              <span className={`nyxa-badge text-[9px] ${tx.type === 'deposit' ? 'nyxa-badge-success' : 'nyxa-badge-active'}`}>
                                {tx.type.toUpperCase()}
                              </span>
                            </td>
                            <td className="text-xs">{tx.description}</td>
                            <td className="tech-mono text-xs font-semibold">
                              {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toFixed(2)}
                            </td>
                            <td className="tech-mono text-xs">
                              {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Escrow Transaction Ledger */}
              <div>
                <h3 className="text-sm font-semibold border-b border-[var(--border)] pb-1.5 mb-3">
                  Escrow Lockups
                </h3>
                {getEscrowTransactions().length === 0 ? (
                  <p className="text-xs text-[var(--muted)]">
                    No escrow lockup transactions found.
                  </p>
                ) : (
                  <div className="nyxa-table-wrapper rounded-lg">
                    <table className="nyxa-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Type</th>
                          <th>Reference</th>
                          <th>Amount</th>
                          <th>Fee</th>
                          <th>Total</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getEscrowTransactions().map(tx => (
                          <tr key={tx.id}>
                            <td className="tech-mono text-xs font-semibold">{tx.id}</td>
                            <td className="tech-mono text-[10px] text-[var(--muted)]">{tx.type}</td>
                            <td className="text-xs truncate max-w-[200px]" title={tx.ref}>{tx.ref}</td>
                            <td className="tech-mono text-xs">${tx.amount.toFixed(2)}</td>
                            <td className="tech-mono text-xs">${tx.fee.toFixed(2)}</td>
                            <td className="tech-mono text-xs font-bold">${tx.total.toFixed(2)}</td>
                            <td>
                              <span className={`nyxa-badge text-[9px] ${tx.status === 'RELEASED' ? 'nyxa-badge-success' : 'nyxa-badge-active'}`}>
                                {tx.status === 'RELEASED' ? 'Released' : tx.status === 'REFUNDED' ? 'Refunded' : 'Held'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: REVIEWS */}
          {activeTab === 'reviews' && (
            <div>
              <h2 className="text-base font-semibold border-b border-[var(--border)] pb-2 mb-4">
                Submitted reviews
              </h2>
              <p className="text-xs text-[var(--muted)] mb-4">
                A historical record of your reviews and agent performance feedback.
              </p>
              
              {myTasks.filter(t => t.status === 'completed').length === 0 ? (
                <p className="text-xs text-[var(--muted)]">
                  No reviews found.
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  {myTasks.filter(t => t.status === 'completed').map(task => (
                    <div key={task.id} className="nyxa-card rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <strong className="text-sm font-semibold">{task.title}</strong>
                        <span className="text-xs text-[var(--success)] font-bold">
                          Completed &bull; Released
                        </span>
                      </div>
                      <p className="text-xs m-0">{task.description}</p>
                      <div className="text-[10px] tech-mono text-[var(--muted)] mt-2">
                        Released: ${task.price.toFixed(2)} &bull; Task ID: {task.id}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
