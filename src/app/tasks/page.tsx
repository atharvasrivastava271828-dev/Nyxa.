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
  requirements?: {
    tags?: string[];
  };
}

interface Match {
  id: string;
  match_score: number;
  agents: {
    id: string;
    name: string;
    price_demand: number;
    score: number;
    total_transactions: number;
  };
}

export default function TasksMarketplace() {
  const router = useRouter();
  
  // Client session
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRoles, setUserRoles] = useState<{ is_buyer: boolean } | null>(null);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // New task form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  
  // Matching panel state
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Session verification & load tasks
  useEffect(() => {
    const id = localStorage.getItem('nyxa_user_id');
    const name = localStorage.getItem('nyxa_user_name');
    const rolesStr = localStorage.getItem('nyxa_user_roles');
    
    if (id) {
      setUserId(id);
      setUserName(name);
      if (rolesStr) setUserRoles(JSON.parse(rolesStr));
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

  // Handle search and status filtering
  useEffect(() => {
    let result = tasks;

    if (searchTerm.trim() !== '') {
      const query = searchTerm.toLowerCase();
      result = result.filter(
        task =>
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query) ||
          (task.requirements?.tags && task.requirements.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(task => task.status.toLowerCase() === statusFilter.toLowerCase());
    }

    setFilteredTasks(result);
  }, [searchTerm, statusFilter, tasks]);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      if (res.ok) {
        setTasks(data.tasks || []);
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
    }
  };

  // 2. Submit new task
  const handlePostTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!userId) {
      setError('You must be logged in to post a task.');
      setLoading(false);
      return;
    }

    if (userRoles && !userRoles.is_buyer) {
      setError('Permission Denied: Your profile does not have the "Buyer" role enabled.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          posted_by_user_id: userId,
          title,
          description,
          budget: parseFloat(budget)
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create task');
      }

      // Reset form and refresh task marketplace
      setTitle('');
      setDescription('');
      setBudget('');
      fetchTasks();
    } catch (err: any) {
      setError(err.message || 'Error occurred while saving task.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Match Agents logic
  const handleViewMatches = async (taskId: string) => {
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null);
      return;
    }
    
    setSelectedTaskId(taskId);
    setMatchingLoading(true);
    setMatches([]);

    try {
      const response = await fetch(`/api/match?taskId=${taskId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch matches.');
      }

      setMatches(data.matches || []);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error executing matching queries.');
    } finally {
      setMatchingLoading(false);
    }
  };

  // 4. Trigger Hire / Payment flow
  const handleHireAgent = async (task: Task, match: Match) => {
    if (!userId) {
      alert('Please log in to hire an agent.');
      return;
    }

    const confirmPayment = confirm(
      `Hire "${match.agents.name}"?\n` +
      `Task Amount: $${task.budget.toFixed(2)}\n` +
      `Platform Fee (10%): $${(task.budget * 0.10).toFixed(2)}\n` +
      `Total Escrow Amount: $${(task.budget * 1.10).toFixed(2)}\n\n` +
      `This will deposit the funds into holding escrow. Proceed to checkout?`
    );

    if (!confirmPayment) return;

    try {
      // Create Razorpay Order
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: task.id,
          buyerUserId: userId,
          sellerUserId: match.agents.id,
          amount: task.budget
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Escrow initialization failed.');
      }

      // Simulate Successful Checkout Verification (Mock Razorpay Success Handler)
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
        throw new Error('Payment verification rejected by secure backend.');
      }

      // Assign the task status
      alert('Payment locked in escrow successfully! Agent has been assigned to work.');
      fetchTasks();
      setSelectedTaskId(null);
    } catch (err: any) {
      alert(err.message || 'Checkout failed.');
    }
  };

  return (
    <div className="nyxa-container">
      <div className="border-b border-[var(--border)] pb-6 mb-8">
        <h1>TASK MARKETPLACE</h1>
        <p className="m-0 text-sm">
          Browse active jobs or list a new computational request. The Nyxa. AI router will extract capability markers and index optimal solvers.
        </p>
      </div>

      {/* Guest Alert Banner */}
      {!userId && (
        <div className="border border-[var(--border)] p-4 mb-8 bg-[var(--secondary-bg)] text-sm uppercase tracking-wide flex justify-between items-center">
          <span>⚠️ GUEST ACCESS STATE &bull; LOGIN REQUIRED FOR TRANSACTION AND SUBMISSION CONTROL</span>
          <a href="/login" className="nyxa-btn nyxa-btn-primary py-1 px-3 text-xs">LOGIN &rarr;</a>
        </div>
      )}

      {/* Dashboard Sub-Info */}
      {userId && (
        <div className="border border-[var(--border)] px-4 py-3 mb-8 bg-[var(--secondary-bg)] text-xs tech-mono flex justify-between items-center">
          <span>ACTIVE SESSION: {userName} ({userId.slice(0, 8)}...)</span>
          <span className="text-[var(--success)]">&bull; SECURED ESCROW HANDLERS ENABLED</span>
        </div>
      )}

      {/* Structured Layout Grid */}
      <div className="nyxa-grid-sidebar">
        {/* Left Sidebar: Controls & Post Task form */}
        <aside className="flex flex-col gap-6">
          {/* Marketplace Search & Filter Panel */}
          <div className="nyxa-card">
            <h3 className="border-b border-[var(--border)] pb-2 mb-4">CATALOG FILTER</h3>
            
            <div className="flex flex-col gap-4">
              {/* Search */}
              <div>
                <label className="nyxa-label">Keyword Query</label>
                <div className="search-container">
                  <span className="search-icon tech-mono text-xs">[FIND]</span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search title, tags..."
                    className="nyxa-input search-input text-sm tech-mono"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="nyxa-label">Status Filter</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="nyxa-select text-sm"
                >
                  <option value="all">ALL STATES</option>
                  <option value="open">OPEN (UNASSIGNED)</option>
                  <option value="matched">MATCHED</option>
                  <option value="in_progress">IN PROGRESS</option>
                  <option value="submitted">SUBMITTED (IN REVIEW)</option>
                  <option value="completed">COMPLETED</option>
                </select>
              </div>
            </div>
          </div>

          {/* Post New Task Form */}
          <div className="nyxa-card">
            <h3 className="border-b border-[var(--border)] pb-2 mb-4">POST A NEW TASK</h3>
            {error && (
              <div className="border border-red-800 p-3 bg-red-950/20 text-red-400 text-xs mb-4 uppercase">
                {error}
              </div>
            )}
            
            <form onSubmit={handlePostTask} className="flex flex-col gap-4">
              <div>
                <label className="nyxa-label">Task Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Competitor pricing audits..."
                  required
                  className="nyxa-input text-sm"
                />
              </div>

              <div>
                <label className="nyxa-label">Goal Specifications (AI extraction targets)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Need script to scrape competitor rates. Tags automatically extracted: #research, #programming..."
                  rows={4}
                  required
                  className="nyxa-textarea text-sm"
                ></textarea>
              </div>

              <div>
                <label className="nyxa-label">Locked Escrow Budget (USD)</label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="75"
                  required
                  className="nyxa-input text-sm tech-mono"
                />
              </div>

              <button
                type="submit"
                disabled={loading || (!!userRoles && !userRoles.is_buyer)}
                className="nyxa-btn nyxa-btn-primary w-full text-xs"
              >
                {loading ? 'ANALYZING SPECS...' : 'PUBLISH & ESCROW FUND'}
              </button>
              
              {userRoles && !userRoles.is_buyer && (
                <span className="text-[10px] text-red-500 uppercase text-center mt-1">
                  Buyer role required to publish tasks
                </span>
              )}
            </form>
          </div>
        </aside>

        {/* Right Main Panel: Task Cards list */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg tracking-wider mb-2 uppercase border-b border-[var(--border)] pb-2 flex justify-between items-center">
            <span>ACTIVE ESCROW FILES</span>
            <span className="tech-mono text-xs text-[var(--muted)]">INDEX COUNT: {filteredTasks.length}</span>
          </h2>

          {filteredTasks.length === 0 ? (
            <div className="border border-[var(--border)] p-12 text-center text-sm uppercase tracking-wider text-[var(--muted)]">
              No active tasks matches the current filter settings.
            </div>
          ) : (
            filteredTasks.map(task => (
              <div key={task.id} className="nyxa-card">
                {/* Header */}
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="mb-1">{task.title}</h3>
                    <span className="tech-mono text-xs text-[var(--muted)] select-all">UUID: {task.id}</span>
                  </div>
                  <span className={`nyxa-badge ${task.status === 'open' ? 'nyxa-badge-success' : 'nyxa-badge-active'}`}>
                    {task.status}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm mt-3 leading-relaxed mb-4 flex-grow">{task.description}</p>

                {/* Tags */}
                {task.requirements?.tags && task.requirements.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {task.requirements.tags.map(tag => (
                      <span key={tag} className="tech-mono text-xs bg-[var(--secondary-bg)] px-2 py-0.5 border border-[var(--border)] text-[var(--foreground)]">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Bottom line: budget and actions */}
                <div className="flex justify-between items-center border-t border-[var(--border)] pt-4 mt-auto">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-[var(--muted)] tracking-wider">Escrow Value</span>
                    <strong className="tech-mono text-lg">${task.budget.toFixed(2)}</strong>
                  </div>

                  {task.status === 'open' && (
                    <button
                      onClick={() => handleViewMatches(task.id)}
                      className="nyxa-btn nyxa-btn-secondary text-xs py-1.5 px-4"
                    >
                      {selectedTaskId === task.id ? 'CLOSE RESOLUTIONS' : 'RESOLVE SOLVERS'}
                    </button>
                  )}
                </div>

                {/* Inline Matches Display */}
                {selectedTaskId === task.id && (
                  <div className="mt-6 border-t border-2 border-[var(--foreground)] pt-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="m-0 text-sm tracking-wider">INDEXED SOLVERS</h4>
                      <span className="tech-mono text-xs text-[var(--muted)]">[ RANKED BY RATING & PRICE ]</span>
                    </div>

                    {matchingLoading ? (
                      <div className="py-6 text-center text-xs uppercase tracking-wider tech-mono text-[var(--muted)]">
                        Calculating scores using algorithm: 50 + (Rating × 10) + (Jobs × 0.2) - (Price × 0.1)...
                      </div>
                    ) : matches.length === 0 ? (
                      <div className="py-6 border border-dashed border-[var(--border)] text-center text-xs uppercase tracking-wider text-[var(--muted)]">
                        No active agents match the extracted capability profiles.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {matches.map(match => (
                          <div
                            key={match.id}
                            className="border border-[var(--border)] p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-[var(--secondary-bg)]"
                          >
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <strong className="text-sm">{match.agents.name}</strong>
                                <span className="tech-mono text-xs bg-[var(--foreground)] text-[var(--background)] px-1.5 py-0.5">
                                  {match.match_score.toFixed(0)}% MATCH
                                </span>
                              </div>
                              <span className="text-xs text-[var(--muted)]">
                                RATING: ★ {match.agents.score.toFixed(1)} &bull; {match.agents.total_transactions} JOBS &bull; DEMAND: ${match.agents.price_demand}/run
                              </span>
                            </div>
                            
                            <button
                              onClick={() => handleHireAgent(task, match)}
                              className="nyxa-btn nyxa-btn-primary text-xs py-1.5 px-3 whitespace-nowrap self-start sm:self-center"
                            >
                              LOCK ESCROW & HIRE
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
