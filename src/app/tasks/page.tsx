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
  
  // Client state
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRoles, setUserRoles] = useState<{ is_buyer: boolean } | null>(null);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  
  // Matching state
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Session verification and loading tasks
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
          sellerUserId: match.agents.id, // For MVP, we assign developer / agent owner as seller
          amount: task.budget
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Escrow initialization failed.');
      }

      // Simulate Successful Checkout Verification (Mock Razorpay Success Handler)
      // In production, this would pop the Razorpay Checkout Modal and verify the signature callback.
      const verifyRes = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpayOrderId: data.order.id,
          razorpayPaymentId: `pay_mock_${Math.random().toString(36).substring(7)}`,
          razorpaySignature: 'MOCK_CRYPTOGRAPHIC_SIGNATURE_VERIFIED_BY_PLATFORM' // Mock pass-through
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
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '1rem' }}>
      <h1>Task Marketplace</h1>
      <p>Browse open tasks or post a new one. NYXA AI will extract goals and find the best matches.</p>

      {userId ? (
        <p style={{ background: '#e0f2f1', padding: '0.5rem', borderRadius: '4px' }}>
          Logged in as: <strong>{userName}</strong> (ID: {userId.slice(0, 8)}...)
        </p>
      ) : (
        <p style={{ background: '#fff3e0', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ffe0b2' }}>
          ⚠️ You are viewing as a guest. Please <a href="/login" style={{ color: '#e65100', fontWeight: 'bold' }}>Login</a> to post or interact.
        </p>
      )}

      {/* Post a Task Form */}
      <section style={{ marginTop: '2rem', border: '1px solid #ccc', borderRadius: '8px', padding: '1.5rem', background: '#fcfcfc' }}>
        <h2>Post a New Task</h2>
        {error && (
          <div style={{ padding: '0.75rem', background: '#ffebee', color: '#c62828', borderRadius: '4px', marginBottom: '1rem' }}>
            {error}
          </div>
        )}
        <form onSubmit={handlePostTask}>
          <div>
            <label>Task Title:</label><br />
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Need deep competitor research"
              required 
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            />
          </div>
          <div style={{ marginTop: '1rem' }}>
            <label>Detailed Description (Goals & Capability markers):</label><br />
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Write a python script to pull analytics data, run design UI and UI/UX audits, and export to CSV."
              rows={4} 
              required
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            ></textarea>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <label>Task Budget (USD):</label><br />
            <input 
              type="number" 
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="50"
              required
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              marginTop: '1.25rem', 
              padding: '0.75rem 1.5rem', 
              background: '#0070f3', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer' 
            }}
          >
            {loading ? 'Posting & Extracting tags...' : 'Post Task'}
          </button>
        </form>
      </section>

      {/* Open Tasks List */}
      <section style={{ marginTop: '3rem' }}>
        <h2>Active & Open Tasks</h2>
        <div style={{ display: 'grid', gap: '1.5rem', marginTop: '1rem' }}>
          {tasks.length === 0 ? (
            <p style={{ color: '#777' }}>No tasks found in the catalog.</p>
          ) : (
            tasks.map(task => (
              <div key={task.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1rem', background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>{task.title}</h3>
                  <span style={{ 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '4px', 
                    fontSize: '0.8rem', 
                    fontWeight: 'bold',
                    background: task.status === 'open' ? '#e8f5e9' : '#e3f2fd',
                    color: task.status === 'open' ? '#2e7d32' : '#1565c0'
                  }}>
                    {task.status.toUpperCase()}
                  </span>
                </div>
                <p style={{ color: '#444', marginTop: '0.5rem' }}>{task.description}</p>
                
                {task.requirements?.tags && (
                  <div style={{ marginTop: '0.5rem' }}>
                    {task.requirements.tags.map(tag => (
                      <span key={tag} style={{ marginRight: '0.5rem', background: '#eee', padding: '0.15rem 0.4rem', fontSize: '0.75rem', borderRadius: '3px' }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>Budget: ${task.budget}</strong>
                  {task.status === 'open' && (
                    <button 
                      onClick={() => handleViewMatches(task.id)}
                      style={{ padding: '0.5rem 1rem', background: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Find Matches
                    </button>
                  )}
                </div>

                {/* Inline Matches Display */}
                {selectedTaskId === task.id && (
                  <div style={{ marginTop: '1rem', padding: '1rem', background: '#f5f5f5', borderRadius: '6px', borderTop: '2px solid #333' }}>
                    <h4>Ranked Matching Agents:</h4>
                    {matchingLoading ? (
                      <p>Calculating scores...</p>
                    ) : matches.length === 0 ? (
                      <p>No agents currently possess the required capability tags.</p>
                    ) : (
                      <div style={{ display: 'grid', gap: '0.75rem', marginTop: '0.5rem' }}>
                        {matches.map(match => (
                          <div key={match.id} style={{ background: '#fff', border: '1px solid #eee', padding: '0.75rem', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <strong>{match.agents.name}</strong> 
                              <span style={{ marginLeft: '1rem', fontSize: '0.8rem', color: '#ff9800' }}>★ {match.agents.score.toFixed(1)}</span>
                              <span style={{ marginLeft: '1rem', fontSize: '0.8rem', color: '#666' }}>({match.agents.total_transactions} completed)</span>
                              <br /><small>Price: ${match.agents.price_demand} | Match Confidence: {match.match_score.toFixed(1)}%</small>
                            </div>
                            <button 
                              onClick={() => handleHireAgent(task, match)}
                              style={{ padding: '0.4rem 0.8rem', background: '#2e7d32', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              Hire & Pay Escrow
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
        </div>
      </section>
    </div>
  );
}
