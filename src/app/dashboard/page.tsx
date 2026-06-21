'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Task {
  id: string;
  title: string;
  description: string;
  budget: number;
  status: string;
  posted_by_user_id: string;
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
  developer_id: string;
}

interface DeveloperApi {
  id: string;
  name: string;
  category: string;
  endpoint_url: string;
  price: number;
  documentation?: string;
  developer_id: string;
}

export default function Dashboard() {
  const router = useRouter();

  // Client Session state
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRoles, setUserRoles] = useState<Record<string, boolean> | null>(null);

  // Data lists
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [myAgents, setMyAgents] = useState<Agent[]>([]);
  const [myApis, setMyApis] = useState<DeveloperApi[]>([]);
  
  // Dashboard Tabs: tasks, agents, apis, transactions, reviews
  const [activeTab, setActiveTab] = useState<'tasks' | 'agents' | 'apis' | 'transactions' | 'reviews'>('tasks');
  
  // Review submission state
  const [selectedTaskForReview, setSelectedTaskForReview] = useState<Task | null>(null);
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [reviewError, setReviewError] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem('nyxa_user_id');
    const name = localStorage.getItem('nyxa_user_name');
    const email = localStorage.getItem('nyxa_user_email');
    const rolesStr = localStorage.getItem('nyxa_user_roles');

    if (!id) {
      router.push('/login');
      return;
    }

    setUserId(id);
    setUserName(name);
    setUserEmail(email);
    if (rolesStr) setUserRoles(JSON.parse(rolesStr));

    fetchDashboardData(id);
  }, []);

  const fetchDashboardData = async (currentUserId: string) => {
    setDataLoading(true);
    try {
      // Fetch tasks, agents, and APIs in parallel
      const [resTasks, resAgents, resApis] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/agents'),
        fetch('/api/apis')
      ]);

      const [tasksData, agentsData, apisData] = await Promise.all([
        resTasks.json(),
        resAgents.json(),
        resApis.json()
      ]);

      if (resTasks.ok) {
        const allTasks: Task[] = tasksData.tasks || [];
        const userTasks = allTasks.filter(t => t.posted_by_user_id === currentUserId);
        setMyTasks(userTasks);
      }

      if (resAgents.ok) {
        const allAgents: Agent[] = agentsData.agents || [];
        const userAgents = allAgents.filter(a => a.developer_id === currentUserId);
        setMyAgents(userAgents);
      }

      if (resApis.ok) {
        const allApis: DeveloperApi[] = apisData.apis || [];
        const userApis = allApis.filter(a => a.developer_id === currentUserId);
        setMyApis(userApis);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setDataLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  // Submit Review & Release Escrow
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError(null);
    setLoading(true);

    if (!selectedTaskForReview) return;

    try {
      const txMockId = '00000000-0000-0000-0000-000000000000'; // Fallback / mock UUID

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: selectedTaskForReview.id,
          reviewerUserId: userId,
          revieweeAgentId: selectedTaskForReview.assigned_to_agent_id || '00000000-0000-0000-0000-000000000000',
          rating: parseInt(rating),
          comment,
          transactionId: txMockId
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
        amount: task.budget,
        fee: task.budget * 0.10,
        total: task.budget * 1.10,
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
          <h1>DEVELOPER CONTROL DASHBOARD</h1>
          <p className="m-0 text-sm">
            Monitor infrastructure status, publish capability definitions, and manage escrow transactions.
          </p>
        </div>
        <button 
          onClick={handleLogout} 
          className="nyxa-btn nyxa-btn-secondary text-xs self-start sm:self-center bg-red-950/15 border-red-800 text-red-500 hover:bg-red-950/20"
        >
          DISCONNECT SESSION
        </button>
      </div>

      {/* Profile summary block */}
      <div className="border border-[var(--border)] p-6 bg-[var(--secondary-bg)] mb-8 flex flex-col md:flex-row justify-between gap-6">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] uppercase text-[var(--muted)] tracking-wider">Authenticated Identity</span>
          <h2 className="text-xl m-0 border-b-0 pb-0">{userName}</h2>
          <span className="tech-mono text-xs text-[var(--muted)] select-all">{userEmail} &bull; ID: {userId}</span>
        </div>
        <div className="flex flex-col gap-1.5 md:items-end">
          <span className="text-[10px] uppercase text-[var(--muted)] tracking-wider">Assumed Profiles</span>
          <div className="flex flex-wrap gap-2 mt-1">
            {userRoles?.is_buyer && (
              <span className="tech-mono text-xs px-2 py-0.5 border border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]">
                BUYER
              </span>
            )}
            {userRoles?.is_seller && (
              <span className="tech-mono text-xs px-2 py-0.5 border border-[var(--border)] text-[var(--foreground)] bg-[var(--card-bg)]">
                SELLER
              </span>
            )}
            {userRoles?.is_developer && (
              <span className="tech-mono text-xs px-2 py-0.5 border border-[var(--border)] text-[var(--foreground)] bg-[var(--card-bg)]">
                DEVELOPER
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Dashboard Sub-Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[var(--border)] pb-3 mb-6">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`nyxa-btn text-xs py-1.5 px-4 ${activeTab === 'tasks' ? 'nyxa-btn-primary' : 'nyxa-btn-secondary'}`}
        >
          [ MY TASKS ]
        </button>
        <button
          onClick={() => setActiveTab('agents')}
          className={`nyxa-btn text-xs py-1.5 px-4 ${activeTab === 'agents' ? 'nyxa-btn-primary' : 'nyxa-btn-secondary'}`}
        >
          [ MY AGENTS ]
        </button>
        <button
          onClick={() => setActiveTab('apis')}
          className={`nyxa-btn text-xs py-1.5 px-4 ${activeTab === 'apis' ? 'nyxa-btn-primary' : 'nyxa-btn-secondary'}`}
        >
          [ MY APIS ]
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`nyxa-btn text-xs py-1.5 px-4 ${activeTab === 'transactions' ? 'nyxa-btn-primary' : 'nyxa-btn-secondary'}`}
        >
          [ TRANSACTIONS ]
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`nyxa-btn text-xs py-1.5 px-4 ${activeTab === 'reviews' ? 'nyxa-btn-primary' : 'nyxa-btn-secondary'}`}
        >
          [ REVIEWS ]
        </button>
      </div>

      {/* Loading state indicator */}
      {dataLoading ? (
        <div className="py-12 border border-[var(--border)] text-center text-xs uppercase tracking-wider tech-mono text-[var(--muted)]">
          Reading database catalogs...
        </div>
      ) : (
        <div>
          {/* TAB: TASKS */}
          {activeTab === 'tasks' && (
            <div className="flex flex-col gap-6">
              {/* Reviews/Escrow Release block */}
              <div>
                <h2 className="text-base tracking-wider uppercase border-b border-[var(--border)] pb-2 mb-4">
                  Awaiting Review & Escrow Release
                </h2>
                
                {myTasks.filter(t => t.status === 'submitted' || t.status === 'matched' || t.status === 'in_progress').length === 0 ? (
                  <p className="text-xs text-[var(--muted)] uppercase tech-mono">
                    No active escrow files currently locked in execution phase.
                  </p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {myTasks.filter(t => t.status === 'submitted' || t.status === 'matched' || t.status === 'in_progress').map(task => (
                      <div key={task.id} className="nyxa-card border-2 border-[var(--foreground)]">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h3 className="mb-0.5 text-sm">{task.title}</h3>
                            <span className="tech-mono text-[10px] text-[var(--muted)]">FILE: {task.id}</span>
                          </div>
                          <span className="nyxa-badge nyxa-badge-active text-xs">
                            {task.status}
                          </span>
                        </div>
                        
                        <p className="text-xs mt-2 mb-4">{task.description}</p>
                        
                        <div className="text-xs tech-mono text-[var(--muted)] mb-4">
                          Budget Locked: ${task.budget.toFixed(2)} &bull; Escrow Held: ${(task.budget * 1.1).toFixed(2)} (incl. 10% fee)
                        </div>

                        {selectedTaskForReview?.id === task.id ? (
                          <form onSubmit={handleSubmitReview} className="border-t border-[var(--border)] pt-4 mt-2">
                            {reviewError && (
                              <div className="border border-red-800 p-2 bg-red-950/20 text-red-400 text-xs mb-3 uppercase">
                                {reviewError}
                              </div>
                            )}
                            <div className="flex flex-col sm:flex-row gap-4 mb-3">
                              <div className="sm:w-1/3">
                                <label className="nyxa-label">Rating Indicator</label>
                                <select 
                                  value={rating} 
                                  onChange={(e) => setRating(e.target.value)} 
                                  className="nyxa-select text-xs"
                                >
                                  <option value="5">★ 5 - VERIFIED RESOLVED</option>
                                  <option value="4">★ 4 - VALID RESOLUTION</option>
                                  <option value="3">★ 3 - MODERATE</option>
                                  <option value="2">★ 2 - DEFICIENT</option>
                                  <option value="1">★ 1 - FAIL / ZERO RELEASE</option>
                                </select>
                              </div>
                              <div className="sm:w-2/3">
                                <label className="nyxa-label">Audit Log Comment</label>
                                <textarea 
                                  value={comment}
                                  onChange={(e) => setComment(e.target.value)}
                                  placeholder="Document execution verification and parameters..."
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
                                className="nyxa-btn nyxa-btn-primary text-xs py-1.5 px-3"
                              >
                                {loading ? 'RELEASING SECURE VAULT...' : 'APPROVE & RELEASE ESCROW'}
                              </button>
                              <button 
                                type="button" 
                                onClick={() => setSelectedTaskForReview(null)} 
                                className="nyxa-btn nyxa-btn-secondary text-xs py-1.5 px-3"
                              >
                                CANCEL
                              </button>
                            </div>
                          </form>
                        ) : (
                          <button 
                            onClick={() => setSelectedTaskForReview(task)}
                            className="nyxa-btn nyxa-btn-primary text-xs py-1.5 px-4 self-start"
                          >
                            AUDIT WORK & RELEASE ESCROW
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tasks History */}
              <div className="mt-4">
                <h2 className="text-base tracking-wider uppercase border-b border-[var(--border)] pb-2 mb-4">
                  My Posted Tasks History
                </h2>
                
                {myTasks.length === 0 ? (
                  <p className="text-xs text-[var(--muted)] uppercase tech-mono">
                    No tasks posted under this profile.
                  </p>
                ) : (
                  <div className="nyxa-table-wrapper">
                    <table className="nyxa-table">
                      <thead>
                        <tr>
                          <th>Task Reference</th>
                          <th>Locked Value</th>
                          <th>Status File</th>
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
                            <td className="tech-mono font-semibold">${task.budget.toFixed(2)}</td>
                            <td>
                              <span className="nyxa-badge text-[10px]">{task.status}</span>
                            </td>
                            <td className="tech-mono text-xs">
                              {task.created_at ? new Date(task.created_at).toLocaleDateString() : 'RECENT'}
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
              <h2 className="text-base tracking-wider uppercase border-b border-[var(--border)] pb-2 mb-4">
                MY REGISTERED SOLVER DEFINITIONS
              </h2>
              {myAgents.length === 0 ? (
                <p className="text-xs text-[var(--muted)] uppercase tech-mono">
                  No active agent definitions listed under this profile.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myAgents.map(agent => (
                    <div key={agent.id} className="nyxa-card">
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <div>
                          <h3 className="mb-0.5 text-sm">{agent.name}</h3>
                          <span className="tech-mono text-[9px] text-[var(--muted)] select-all">{agent.id}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-[var(--foreground)] tech-mono">
                            ★ {agent.score.toFixed(1)}
                          </span>
                          <div className="text-[8px] text-[var(--muted)] tracking-wider">{agent.total_transactions} COMPLETED</div>
                        </div>
                      </div>
                      
                      <p className="text-xs leading-relaxed flex-grow mt-2 mb-4">{agent.description}</p>
                      
                      <div className="flex flex-wrap gap-1 mb-4">
                        {agent.capabilities.map(cap => (
                          <span key={cap} className="tech-mono text-[9px] bg-[var(--secondary-bg)] px-1.5 py-0.5 border border-[var(--border)]">
                            #{cap}
                          </span>
                        ))}
                      </div>
                      
                      <div className="border-t border-[var(--border)] pt-3 flex justify-between items-center mt-auto">
                        <span className="text-[9px] uppercase text-[var(--muted)] tracking-wider">License Rate</span>
                        <strong className="tech-mono text-xs">${agent.price_demand.toFixed(2)}/run</strong>
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
              <h2 className="text-base tracking-wider uppercase border-b border-[var(--border)] pb-2 mb-4">
                MY REGISTERED API INTERFACES
              </h2>
              {myApis.length === 0 ? (
                <p className="text-xs text-[var(--muted)] uppercase tech-mono">
                  No api endpoints registered under this profile.
                </p>
              ) : (
                <div className="nyxa-table-wrapper">
                  <table className="nyxa-table">
                    <thead>
                      <tr>
                        <th>API Name</th>
                        <th>Category</th>
                        <th>Target Endpoint</th>
                        <th>License Price</th>
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
            <div>
              <h2 className="text-base tracking-wider uppercase border-b border-[var(--border)] pb-2 mb-4">
                SECURED TRANSACTION LEDGER
              </h2>
              
              {getEscrowTransactions().length === 0 ? (
                <p className="text-xs text-[var(--muted)] uppercase tech-mono">
                  No escrow log files recorded.
                </p>
              ) : (
                <div className="nyxa-table-wrapper">
                  <table className="nyxa-table">
                    <thead>
                      <tr>
                        <th>Transaction ID</th>
                        <th>Type</th>
                        <th>Reference file</th>
                        <th>Principal</th>
                        <th>Escrow Fee</th>
                        <th>Ledger Total</th>
                        <th>State</th>
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
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB: REVIEWS */}
          {activeTab === 'reviews' && (
            <div>
              <h2 className="text-base tracking-wider uppercase border-b border-[var(--border)] pb-2 mb-4">
                SUBMITTED AUDIT REVIEWS LOG
              </h2>
              <p className="text-xs text-[var(--muted)] uppercase tech-mono mb-4">
                Historical record of agent execution reviews and rolling index feedbacks.
              </p>
              
              {myTasks.filter(t => t.status === 'completed').length === 0 ? (
                <p className="text-xs text-[var(--muted)] uppercase tech-mono">
                  No completed task audit records found.
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  {myTasks.filter(t => t.status === 'completed').map(task => (
                    <div key={task.id} className="nyxa-card">
                      <div className="flex justify-between items-center mb-2">
                        <strong className="text-sm">{task.title}</strong>
                        <span className="text-xs text-[var(--success)] font-bold tech-mono">
                          STATUS: COMPLETED &bull; FUNDS RELEASED
                        </span>
                      </div>
                      <p className="text-xs m-0">{task.description}</p>
                      <div className="text-[10px] tech-mono text-[var(--muted)] mt-2">
                        Escrow Amount released: ${task.budget.toFixed(2)} &bull; Reference UUID: {task.id}
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
