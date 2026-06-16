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
}

export default function Dashboard() {
  const router = useRouter();

  // Client Session simulation
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRoles, setUserRoles] = useState<Record<string, boolean> | null>(null);

  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [pendingReviews, setPendingReviews] = useState<Task[]>([]);
  
  // Review inputs
  const [selectedTaskForReview, setSelectedTaskForReview] = useState<Task | null>(null);
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem('nyxa_user_id');
    const name = localStorage.getItem('nyxa_user_name');
    const rolesStr = localStorage.getItem('nyxa_user_roles');

    if (!id) {
      // If no active session, direct user to log in
      router.push('/login');
      return;
    }

    setUserId(id);
    setUserName(name);
    if (rolesStr) setUserRoles(JSON.parse(rolesStr));

    fetchDashboardData(id);
  }, []);

  const fetchDashboardData = async (currentUserId: string) => {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      
      if (res.ok) {
        const allTasks: Task[] = data.tasks || [];
        // Filter tasks posted by this logged in user
        const userTasks = allTasks.filter(t => t.posted_by_user_id === currentUserId);
        
        setMyTasks(userTasks);

        // Filter tasks that are in the 'submitted' state (awaiting review/escrow release)
        // Note: For MVP visualization, if there are no submitted tasks, 
        // we can also show 'matched' or 'in_progress' tasks to test transitions.
        const awaitingReview = userTasks.filter(t => t.status === 'submitted' || t.status === 'matched' || t.status === 'in_progress');
        setPendingReviews(awaitingReview);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
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
      // 1. Fetch matching transaction ID to release
      // We search local/db transactions that are completed and held for this task.
      // In MVP, we mock the transactionId matching for simulation, or just let review handle it.
      // Since `review.service` optionally accepts transactionId, we fetch or simulate it.
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
          transactionId: txMockId // Triggers release of held funds
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review.');
      }

      alert('Review submitted! Task is COMPLETED and Escrow funds are released to the agent owner.');
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

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>User Dashboard</h1>
        <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', background: '#d32f2f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Logout
        </button>
      </div>

      <div style={{ background: '#f5f5f5', padding: '1.25rem', borderRadius: '8px', marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ margin: 0, color: '#666' }}>Welcome back,</p>
          <h2 style={{ margin: '0.25rem 0 0 0' }}>{userName}</h2>
          <small style={{ color: '#888' }}>User ID: {userId}</small>
        </div>
        <div>
          <strong>Role Profile:</strong>
          <ul style={{ margin: '0.25rem 0 0 0', paddingLeft: '1.25rem', fontSize: '0.85rem' }}>
            {userRoles?.is_buyer && <li>Buyer (Posts Tasks)</li>}
            {userRoles?.is_seller && <li>Seller (Solves Tasks)</li>}
            {userRoles?.is_developer && <li>Developer (Lists Agents/APIs)</li>}
          </ul>
        </div>
      </div>

      {/* Pending Reviews Block */}
      <section style={{ marginTop: '3rem' }}>
        <h2>Pending Reviews & Escrow Releases</h2>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>When an agent submits their work, review it below to release the locked payment from escrow.</p>
        
        {pendingReviews.length === 0 ? (
          <p style={{ color: '#888', fontStyle: 'italic' }}>No active tasks awaiting review.</p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
            {pendingReviews.map(task => (
              <div key={task.id} style={{ border: '1px solid #ffd54f', background: '#fffde7', padding: '1rem', borderRadius: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>{task.title}</strong>
                  <span style={{ fontSize: '0.8rem', background: '#ffe082', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 'bold' }}>
                    {task.status.toUpperCase()}
                  </span>
                </div>
                <p style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>Budget: ${task.budget} | Escrow Balance: ${(task.budget * 1.10).toFixed(2)} (incl. Platform Fee)</p>
                
                {selectedTaskForReview?.id === task.id ? (
                  <form onSubmit={handleSubmitReview} style={{ marginTop: '1rem', borderTop: '1px solid #ffe082', paddingTop: '1rem' }}>
                    {reviewError && (
                      <div style={{ padding: '0.5rem', background: '#ffebee', color: '#c62828', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                        {reviewError}
                      </div>
                    )}
                    <div>
                      <label>Rating (1-5):</label>
                      <select value={rating} onChange={(e) => setRating(e.target.value)} style={{ marginLeft: '0.5rem', padding: '0.25rem' }}>
                        <option value="5">5 - Excellent work</option>
                        <option value="4">4 - Good</option>
                        <option value="3">3 - Average</option>
                        <option value="2">2 - Needs improvements</option>
                        <option value="1">1 - Failed / Unacceptable</option>
                      </select>
                    </div>
                    <div style={{ marginTop: '0.5rem' }}>
                      <label>Comment:</label><br />
                      <textarea 
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Provide feedback on the agent's work..."
                        rows={2}
                        required
                        style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                      ></textarea>
                    </div>
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                      <button type="submit" disabled={loading} style={{ padding: '0.5rem 1rem', background: '#2e7d32', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        {loading ? 'Processing...' : 'Approve & Release Funds'}
                      </button>
                      <button type="button" onClick={() => setSelectedTaskForReview(null)} style={{ padding: '0.5rem 1rem', background: '#757575', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button 
                    onClick={() => setSelectedTaskForReview(task)}
                    style={{ marginTop: '0.75rem', padding: '0.4rem 0.8rem', background: '#ffb300', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Submit Review & Finish Task
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* My Posted Tasks */}
      <section style={{ marginTop: '3rem' }}>
        <h2>My Posted Tasks History</h2>
        <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
          {myTasks.length === 0 ? (
            <p style={{ color: '#888' }}>You have not posted any tasks yet.</p>
          ) : (
            myTasks.map(task => (
              <div key={task.id} style={{ border: '1px solid #eee', padding: '1rem', borderRadius: '6px', background: '#fafafa' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>{task.title}</strong>
                  <span style={{ fontSize: '0.8rem', color: '#666' }}>Status: {task.status.toUpperCase()}</span>
                </div>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#444' }}>{task.description}</p>
                <div style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                  <strong>Budget: ${task.budget}</strong>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
