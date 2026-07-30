'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';

interface Task {
  id: string;
  title: string;
  description: string;
  price: number;
  class: string;
  kind: string;
  dubs: string[];
  delivery_time: string;
  hosting_method: string;
  hosting_url: string;
  status: string;
}

interface Agent {
  id: string;
  name: string;
  description: string;
  price_demand: number;
  capabilities: string[];
  status: string;
}

interface ApiItem {
  id: string;
  name: string;
  category: string;
  endpoint_url: string;
  price: number;
  status: string;
}

interface BidderRequest {
  id: string;
  title: string;
  description: string;
  request_type: string;
  budget: number;
  deadline: string;
  inputs_required: any;
  outputs_delivered: any;
  status: string;
}

export default function DeveloperPortal() {
  const { userId, userName, userRoles } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'sdk' | 'tasks' | 'agents' | 'apis' | 'requests'>('sdk');
  const [loading, setLoading] = useState(false);

  // Separate Dev Auth State
  const [isDevAuthenticated, setIsDevAuthenticated] = useState(false);
  const [devPasscode, setDevPasscode] = useState('');
  const [authError, setAuthError] = useState('');

  // Lists
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [myAgents, setMyAgents] = useState<Agent[]>([]);
  const [myApis, setMyApis] = useState<ApiItem[]>([]);
  const [openRequests, setOpenRequests] = useState<BidderRequest[]>([]);

  // Form states
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    price: 0,
    class: 'Business',
    kind: 'Competitor Analysis',
    dubsString: '',
    delivery_time: '1 day',
    hosting_method: 'link',
    hosting_url: '',
    inputsString: '{\n  "startup_url": "string"\n}',
    outputsString: '{\n  "report_pdf": "string"\n}'
  });

  const [agentForm, setAgentForm] = useState({
    name: '',
    description: '',
    price_demand: 0,
    capabilitiesString: 'web-scraping, transcription'
  });

  const [apiForm, setApiForm] = useState({
    name: '',
    category: 'Data',
    endpoint_url: '',
    price: 0,
    documentation: ''
  });

  const [bidForm, setBidForm] = useState<Record<string, { amount: number; delivery: string }>>({});

  const validKindsMap: Record<string, string[]> = {
    Business: ['Competitor Analysis', 'Market Research', 'Business Plans', 'SWOT Analysis'],
    Education: ['Quiz Generation', 'Study Plans', 'Notes Summaries', 'Exam Preparation']
  };

  const fetchDeveloperData = useCallback(async () => {
    if (!userId) return;
    try {
      const [resTasks, resAgents, resApis, resRequests] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/agents'),
        fetch('/api/apis'),
        fetch('/api/tasks/requests')
      ]);

      const [tasksData, agentsData, apisData, requestsData] = await Promise.all([
        resTasks.json(),
        resAgents.json(),
        resApis.json(),
        resRequests.json()
      ]);

      // Filter for owner
      if (resTasks.ok) {
        setMyTasks((tasksData.tasks || []).filter((t: any) => t.provider_id === userId));
      }
      if (resAgents.ok) {
        setMyAgents((agentsData.agents || []).filter((a: any) => a.provider_id === userId));
      }
      if (resApis.ok) {
        setMyApis((apisData.apis || []).filter((api: any) => api.provider_id === userId));
      }
      if (resRequests.ok) {
        setOpenRequests((requestsData.requests || []).filter((req: any) => req.status === 'open' && req.requester_id !== userId));
      }
    } catch (err) {
      console.error('Failed to load developer data:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    // Check dev auth cookie/local storage
    const storedAuth = localStorage.getItem('dev_auth');
    if (storedAuth === 'true') {
      setIsDevAuthenticated(true);
    }

    if (userId && storedAuth === 'true') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchDeveloperData();
    }
  }, [userId, fetchDeveloperData]);

  const handleDevAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (devPasscode === 'DevelopTheFuture7') {
      setIsDevAuthenticated(true);
      localStorage.setItem('dev_auth', 'true');
      if (userId) {
        fetchDeveloperData();
      }
    } else {
      setAuthError('Invalid Developer Passcode');
    }
  };

  const handleRegisterTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    try {
      const dubs = taskForm.dubsString
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
        .map(tag => tag.startsWith('}') ? tag : `}${tag}`);

      const inputs = JSON.parse(taskForm.inputsString);
      const outputs = JSON.parse(taskForm.outputsString);

      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_id: userId,
          title: taskForm.title,
          description: taskForm.description,
          price: Number(taskForm.price),
          class: taskForm.class,
          kind: taskForm.kind,
          dubs,
          inputs_required: inputs,
          outputs_delivered: outputs,
          delivery_time: taskForm.delivery_time,
          hosting_method: taskForm.hosting_method,
          hosting_url: taskForm.hosting_url
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create task');

      alert('Standardized Task registered successfully! 🎉');
      fetchDeveloperData();
      setTaskForm({
        title: '',
        description: '',
        price: 0,
        class: 'Business',
        kind: 'Competitor Analysis',
        dubsString: '',
        delivery_time: '1 day',
        hosting_method: 'link',
        hosting_url: '',
        inputsString: '{\n  "startup_url": "string"\n}',
        outputsString: '{\n  "report_pdf": "string"\n}'
      });
    } catch (err: any) {
      alert(err.message || 'Verification failed');
    }
  };

  const handleRegisterAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    try {
      const capabilities = agentForm.capabilitiesString.split(',').map(c => c.trim()).filter(Boolean);
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_id: userId,
          name: agentForm.name,
          description: agentForm.description,
          price_demand: Number(agentForm.price_demand),
          capabilities
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create agent');

      alert('Agent registered successfully! 🤖');
      fetchDeveloperData();
      setAgentForm({ name: '', description: '', price_demand: 0, capabilitiesString: 'web-scraping, transcription' });
    } catch (err: any) {
      alert(err.message || 'Agent listing failed');
    }
  };

  const handleRegisterApi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    try {
      const res = await fetch('/api/apis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_id: userId,
          name: apiForm.name,
          category: apiForm.category,
          endpoint_url: apiForm.endpoint_url,
          price: Number(apiForm.price),
          documentation: apiForm.documentation
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create API');

      alert('Developer API published successfully! 🔌');
      fetchDeveloperData();
      setApiForm({ name: '', category: 'Data', endpoint_url: '', price: 0, documentation: '' });
    } catch (err: any) {
      alert(err.message || 'API listing failed');
    }
  };

  const handlePlaceBid = async (requestId: string) => {
    if (!userId) return;
    const details = bidForm[requestId];
    if (!details || details.amount <= 0 || !details.delivery) {
      alert('Please fill in both bid amount and expected SLA time.');
      return;
    }

    try {
      const res = await fetch('/api/tasks/bids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: requestId,
          provider_id: userId,
          bid_amount: Number(details.amount),
          delivery_time: details.delivery
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to place bid');

      alert('Your outcome bid has been submitted! 🏷️');
      fetchDeveloperData();
    } catch (err: any) {
      alert(err.message || 'Bidding failed');
    }
  };

  return (
    <div className="nyxa-container">
      <div className="border-b border-[var(--border)] pb-6 mb-8">
        <h1>Developer Portal</h1>
        <p className="m-0 text-sm">
          Build once. Publish on NYXA. Host anywhere.
        </p>
      </div>

      {!userId && (
        <div className="border border-[var(--border)] p-6 bg-[var(--secondary-bg)] text-center rounded-lg max-w-md mx-auto mt-16">
          <div className="w-12 h-12 bg-[var(--foreground)] rounded-full mx-auto flex items-center justify-center mb-4">
            <span className="text-[var(--background)] font-bold font-mono">&lt;/&gt;</span>
          </div>
          <h3 className="text-xl font-bold mb-2 tracking-tight">Provider Access Only</h3>
          <p className="text-sm text-[var(--muted)] mb-6">Please log in to your account first.</p>
          <Link href="/login" className="nyxa-btn nyxa-btn-primary py-2 px-6 rounded-full w-full block">Log In to Account</Link>
        </div>
      )}

      {userId && !isDevAuthenticated && (
        <div className="border border-[var(--border)] p-8 bg-[var(--card-bg)] shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center rounded-2xl max-w-md mx-auto mt-16">
          <div className="w-12 h-12 bg-[var(--foreground)] rounded-full mx-auto flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-[var(--background)]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2 tracking-tight">Restricted Area</h3>
          <p className="text-sm text-[var(--muted)] mb-6">Enter Developer Passcode to unlock.</p>
          
          <form onSubmit={handleDevAuth} className="flex flex-col gap-4">
            <input 
              type="password" 
              placeholder="Passcode" 
              value={devPasscode}
              onChange={(e) => {
                setDevPasscode(e.target.value);
                setAuthError('');
              }}
              className="w-full p-3 bg-[var(--secondary-bg)] border-2 border-[var(--border)] focus:border-[var(--foreground)] focus:outline-none rounded-full text-center tracking-widest font-mono text-sm transition-colors"
            />
            {authError && <p className="text-red-500 text-xs m-0">{authError}</p>}
            <button type="submit" className="nyxa-btn nyxa-btn-primary py-3 rounded-full w-full font-bold shadow-md hover:shadow-lg transition-all">
              Unlock Portal
            </button>
          </form>
        </div>
      )}

      {userId && isDevAuthenticated && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation Sidebar */}
          <aside className="lg:col-span-1 flex flex-col gap-3">
            <button
              onClick={() => setActiveSubTab('sdk')}
              className={`w-full text-left py-2.5 px-4 text-xs font-semibold rounded-lg border ${
                activeSubTab === 'sdk' ? 'bg-[var(--foreground)] text-[var(--background)] border-transparent' : 'bg-[var(--card-bg)] text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--secondary-bg)]'
              }`}
            >
              ⚡ @nyxa/sdk Developer Guide
            </button>
            <button
              onClick={() => setActiveSubTab('tasks')}
              className={`w-full text-left py-2.5 px-4 text-xs font-semibold rounded-lg border ${
                activeSubTab === 'tasks' ? 'bg-[var(--foreground)] text-[var(--background)] border-transparent' : 'bg-[var(--card-bg)] text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--secondary-bg)]'
              }`}
            >
              💼 Published Tasks ({myTasks.length})
            </button>
            <button
              disabled
              className="w-full flex justify-between items-center py-2.5 px-4 text-xs font-semibold rounded-lg border bg-[var(--card-bg)] text-[var(--foreground)] border-[var(--border)] opacity-50 cursor-not-allowed"
            >
              <span>🤖 Agentic Capabilities</span>
              <span className="text-[9px] uppercase tracking-wider font-bold bg-[var(--background)] px-2 py-0.5 rounded text-[var(--muted)]">Locked</span>
            </button>
            <button
              disabled
              className="w-full flex justify-between items-center py-2.5 px-4 text-xs font-semibold rounded-lg border bg-[var(--card-bg)] text-[var(--foreground)] border-[var(--border)] opacity-50 cursor-not-allowed"
            >
              <span>🔌 Developer APIs</span>
              <span className="text-[9px] uppercase tracking-wider font-bold bg-[var(--background)] px-2 py-0.5 rounded text-[var(--muted)]">Locked</span>
            </button>
            <button
              onClick={() => setActiveSubTab('requests')}
              className={`w-full text-left py-2.5 px-4 text-xs font-semibold rounded-lg border ${
                activeSubTab === 'requests' ? 'bg-[var(--foreground)] text-[var(--background)] border-transparent' : 'bg-[var(--card-bg)] text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--secondary-bg)]'
              }`}
            >
              🏷️ TaskBidder Board ({openRequests.length})
            </button>
          </aside>

          {/* Main workspace area */}
          <main className="lg:col-span-3">
            {/* SUBTAB: SDK */}
            {activeSubTab === 'sdk' && (
              <div className="flex flex-col gap-8 animate-in fade-in duration-300">
                {/* Intro Card */}
                <div className="nyxa-card p-6 bg-gradient-to-br from-[var(--secondary-bg)] to-[var(--card-bg)]">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">⚡</span>
                    <h2 className="text-xl font-bold tracking-tight">Nyxa Developer SDK & CLI</h2>
                  </div>
                  <p className="text-xs text-[var(--muted)] leading-relaxed mb-6">
                    Build high-performance client-side utility tools with 100% in-browser processing. Zero backend server costs, zero API latency.
                  </p>

                  {/* CLI Quickstart Commands */}
                  <div className="space-y-3">
                    <span className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-wider block">1. Install SDK & Publish CLI</span>
                    <div className="p-3 bg-slate-950 text-emerald-400 font-mono text-xs rounded-xl flex justify-between items-center border border-slate-800">
                      <code>npm install @nyxa/sdk</code>
                      <button 
                        onClick={() => navigator.clipboard.writeText('npm install @nyxa/sdk')}
                        className="text-[10px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
                      >
                        Copy
                      </button>
                    </div>

                    <span className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-wider block pt-2">2. Publish Tool to Nyxa Marketplace</span>
                    <div className="p-3 bg-slate-950 text-amber-400 font-mono text-xs rounded-xl flex justify-between items-center border border-slate-800">
                      <code>npx nyxa publish --file my-tool.tsx</code>
                      <button 
                        onClick={() => navigator.clipboard.writeText('npx nyxa publish --file my-tool.tsx')}
                        className="text-[10px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>

                {/* Live React Starter Template */}
                <div className="nyxa-card p-6">
                  <h3 className="text-base font-bold mb-2">Boilerplate Component Starter</h3>
                  <p className="text-xs text-[var(--muted)] mb-4">
                    Sample React component using <code className="text-xs font-mono text-[var(--foreground)] font-bold">defineNyxaTask()</code> schema wrapper:
                  </p>
                  
                  <pre className="p-4 bg-slate-950 text-slate-200 font-mono text-xs rounded-xl overflow-x-auto border border-slate-800 max-h-[350px]">
{`'use client';

import React, { useState } from 'react';
import { defineNyxaTask } from '@nyxa/sdk';

export const taskConfig = defineNyxaTask({
  id: 'my-custom-tool',
  title: 'Custom Text Converter',
  description: 'Built with @nyxa/sdk for instant client-side execution.',
  price: 0,
  category: 'Utility',
  tags: ['converter', 'text', 'utility'],
  inputs: {
    text: { type: 'string', label: 'Input Text', required: true }
  },
  outputs: {
    result: { type: 'string', label: 'Processed Output' }
  }
});

export default function CustomTool() {
  const [val, setVal] = useState('');
  return (
    <div className="nyxa-card p-6">
      <input 
        className="nyxa-input" 
        value={val} 
        onChange={(e) => setVal(e.target.value)} 
        placeholder="Type here..." 
      />
      <p className="font-mono text-sm mt-4">{val.toUpperCase()}</p>
    </div>
  );
}`}
                  </pre>
                </div>
              </div>
            )}

            {/* SUBTAB: TASKS */}
            {activeSubTab === 'tasks' && (
              <div className="flex flex-col gap-8">
                {/* Publish Form */}
                <form onSubmit={handleRegisterTask} className="nyxa-card">
                  <h3 className="border-b border-[var(--border)] pb-2 mb-4 font-bold">Publish Standardized Task</h3>
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] uppercase font-semibold text-[var(--muted)]">Class</label>
                        <input
                          type="text"
                          placeholder="e.g. Business Tasks, Data Science, etc."
                          value={taskForm.class}
                          onChange={(e) => setTaskForm({ ...taskForm, class: e.target.value })}
                          className="w-full mt-1 p-2 bg-[var(--secondary-bg)] border border-[var(--border)] rounded text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-semibold text-[var(--muted)]">Kind</label>
                        <input
                          type="text"
                          placeholder="e.g. Competitor Analysis, NLP Model, etc."
                          value={taskForm.kind}
                          onChange={(e) => setTaskForm({ ...taskForm, kind: e.target.value })}
                          className="w-full mt-1 p-2 bg-[var(--secondary-bg)] border border-[var(--border)] rounded text-sm"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-semibold text-[var(--muted)]">Task Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Competitor Analysis PDF Report Generator"
                        value={taskForm.title}
                        onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                        className="w-full mt-1 p-2 bg-[var(--secondary-bg)] border border-[var(--border)] rounded text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-semibold text-[var(--muted)]">Description</label>
                      <textarea
                        rows={3}
                        placeholder="Explain precisely what output is delivered and how the task handles inputs."
                        value={taskForm.description}
                        onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                        className="w-full mt-1 p-2 bg-[var(--secondary-bg)] border border-[var(--border)] rounded text-sm"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-[10px] uppercase font-semibold text-[var(--muted)]">Price ($)</label>
                        <input
                          type="number"
                          placeholder="0 for Free"
                          value={taskForm.price}
                          onChange={(e) => setTaskForm({ ...taskForm, price: Number(e.target.value) })}
                          className="w-full mt-1 p-2 bg-[var(--secondary-bg)] border border-[var(--border)] rounded text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-semibold text-[var(--muted)]">Delivery SLA</label>
                        <input
                          type="text"
                          placeholder="e.g. 2 hours, 1 day"
                          value={taskForm.delivery_time}
                          onChange={(e) => setTaskForm({ ...taskForm, delivery_time: e.target.value })}
                          className="w-full mt-1 p-2 bg-[var(--secondary-bg)] border border-[var(--border)] rounded text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-semibold text-[var(--muted)]">Dubs (comma separated)</label>
                        <input
                          type="text"
                          placeholder="}startup, }market"
                          value={taskForm.dubsString}
                          onChange={(e) => setTaskForm({ ...taskForm, dubsString: e.target.value })}
                          className="w-full mt-1 p-2 bg-[var(--secondary-bg)] border border-[var(--border)] rounded text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] uppercase font-semibold text-[var(--muted)]">Hosting Method</label>
                        <select
                          value={taskForm.hosting_method}
                          onChange={(e) => setTaskForm({ ...taskForm, hosting_method: e.target.value })}
                          className="w-full mt-1 p-2 bg-[var(--secondary-bg)] border border-[var(--border)] rounded text-sm"
                        >
                          <option value="link">External Redirection Link</option>
                          <option value="iframe">Iframe Embed</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-semibold text-[var(--muted)]">Hosting Endpoint URL</label>
                        <input
                          type="url"
                          placeholder="https://example.com/execute"
                          value={taskForm.hosting_url}
                          onChange={(e) => setTaskForm({ ...taskForm, hosting_url: e.target.value })}
                          className="w-full mt-1 p-2 bg-[var(--secondary-bg)] border border-[var(--border)] rounded text-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] uppercase font-semibold text-[var(--muted)]">Inputs Required (JSON)</label>
                        <textarea
                          rows={4}
                          value={taskForm.inputsString}
                          onChange={(e) => setTaskForm({ ...taskForm, inputsString: e.target.value })}
                          className="w-full mt-1 p-2 bg-[var(--secondary-bg)] border border-[var(--border)] rounded text-xs tech-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-semibold text-[var(--muted)]">Outputs Delivered (JSON)</label>
                        <textarea
                          rows={4}
                          value={taskForm.outputsString}
                          onChange={(e) => setTaskForm({ ...taskForm, outputsString: e.target.value })}
                          className="w-full mt-1 p-2 bg-[var(--secondary-bg)] border border-[var(--border)] rounded text-xs tech-mono"
                        />
                      </div>
                    </div>

                    <button type="submit" className="nyxa-btn nyxa-btn-primary py-2 mt-2 rounded">
                      Publish Outcome Template
                    </button>
                  </div>
                </form>

                {/* List templates */}
                <div>
                  <h3 className="text-sm font-semibold border-b border-[var(--border)] pb-2 mb-4">My Standardized Tasks</h3>
                  {loading ? (
                    <p className="text-xs text-[var(--muted)]">Loading Tasks...</p>
                  ) : myTasks.length === 0 ? (
                    <p className="text-xs text-[var(--muted)]">No tasks listed yet.</p>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {myTasks.map(task => (
                        <div key={task.id} className="border border-[var(--border)] p-4 bg-[var(--card-bg)] rounded-lg flex justify-between items-center">
                          <div>
                            <div className="flex gap-2 items-center">
                              <span className="text-[10px] uppercase tracking-wider text-[var(--muted)]">{task.class} &bull; {task.kind}</span>
                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${task.price === 0 ? 'bg-[var(--success)] text-[var(--background)]' : 'border border-[var(--border)]'}`}>
                                {task.price === 0 ? 'FREE' : `$${task.price.toFixed(2)}`}
                              </span>
                            </div>
                            <h4 className="font-bold text-sm mt-1">{task.title}</h4>
                            <p className="text-xs text-[var(--muted)] m-0 mt-1 max-w-xl truncate">{task.description}</p>
                            <div className="flex gap-1.5 mt-2">
                              {task.dubs.map(dub => (
                                <span key={dub} className="text-[10px] text-[var(--muted)] font-mono">{dub}</span>
                              ))}
                            </div>
                          </div>
                          <span className="text-xs text-[var(--muted)] tech-mono">SLA: {task.delivery_time}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SUBTAB: AGENTS */}
            {activeSubTab === 'agents' && (
              <div className="flex flex-col gap-8">
                {/* Publish Agent */}
                <form onSubmit={handleRegisterAgent} className="nyxa-card">
                  <h3 className="border-b border-[var(--border)] pb-2 mb-4 font-bold">Register Agentic Capability</h3>
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="text-[10px] uppercase font-semibold text-[var(--muted)]">Agent Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Lead Generation Specialist"
                        value={agentForm.name}
                        onChange={(e) => setAgentForm({ ...agentForm, name: e.target.value })}
                        className="w-full mt-1 p-2 bg-[var(--secondary-bg)] border border-[var(--border)] rounded text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-semibold text-[var(--muted)]">Capabilities Overview</label>
                      <textarea
                        rows={3}
                        placeholder="Describe what tasks this agent is capable of picking up programmatically."
                        value={agentForm.description}
                        onChange={(e) => setAgentForm({ ...agentForm, description: e.target.value })}
                        className="w-full mt-1 p-2 bg-[var(--secondary-bg)] border border-[var(--border)] rounded text-sm"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] uppercase font-semibold text-[var(--muted)]">Price Demand ($)</label>
                        <input
                          type="number"
                          placeholder="Listed rate per job"
                          value={agentForm.price_demand}
                          onChange={(e) => setAgentForm({ ...agentForm, price_demand: Number(e.target.value) })}
                          className="w-full mt-1 p-2 bg-[var(--secondary-bg)] border border-[var(--border)] rounded text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-semibold text-[var(--muted)]">Capability Tags (comma separated)</label>
                        <input
                          type="text"
                          placeholder="scraping, reports, validation"
                          value={agentForm.capabilitiesString}
                          onChange={(e) => setAgentForm({ ...agentForm, capabilitiesString: e.target.value })}
                          className="w-full mt-1 p-2 bg-[var(--secondary-bg)] border border-[var(--border)] rounded text-sm"
                        />
                      </div>
                    </div>

                    <button type="submit" className="nyxa-btn nyxa-btn-primary py-2 mt-2 rounded">
                      Publish Agentic Capability
                    </button>
                  </div>
                </form>

                {/* List Agents */}
                <div>
                  <h3 className="text-sm font-semibold border-b border-[var(--border)] pb-2 mb-4">My Registered Agents</h3>
                  {myAgents.length === 0 ? (
                    <p className="text-xs text-[var(--muted)]">No agents registered yet.</p>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {myAgents.map(agent => (
                        <div key={agent.id} className="border border-[var(--border)] p-4 bg-[var(--card-bg)] rounded-lg flex justify-between items-center">
                          <div>
                            <h4 className="font-bold text-sm">{agent.name}</h4>
                            <p className="text-xs text-[var(--muted)] m-0 mt-1 max-w-xl">{agent.description}</p>
                            <div className="flex gap-1.5 mt-2">
                              {agent.capabilities.map(cap => (
                                <span key={cap} className="text-[9px] px-1.5 py-0.5 bg-[var(--secondary-bg)] border border-[var(--border)] rounded font-mono">{cap}</span>
                              ))}
                            </div>
                          </div>
                          <span className="text-xs font-semibold tech-mono">${agent.price_demand.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SUBTAB: APIS */}
            {activeSubTab === 'apis' && (
              <div className="flex flex-col gap-8">
                {/* Publish API */}
                <form onSubmit={handleRegisterApi} className="nyxa-card">
                  <h3 className="border-b border-[var(--border)] pb-2 mb-4 font-bold">Publish Developer API</h3>
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="text-[10px] uppercase font-semibold text-[var(--muted)]">API Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Fast Image Transcription API"
                        value={apiForm.name}
                        onChange={(e) => setApiForm({ ...apiForm, name: e.target.value })}
                        className="w-full mt-1 p-2 bg-[var(--secondary-bg)] border border-[var(--border)] rounded text-sm"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] uppercase font-semibold text-[var(--muted)]">Category</label>
                        <select
                          value={apiForm.category}
                          onChange={(e) => setApiForm({ ...apiForm, category: e.target.value })}
                          className="w-full mt-1 p-2 bg-[var(--secondary-bg)] border border-[var(--border)] rounded text-sm"
                        >
                          <option value="Data">Data APIs</option>
                          <option value="AI / LLM">AI Models</option>
                          <option value="Tools">Tool Helpers</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-semibold text-[var(--muted)]">Price Demand ($)</label>
                        <input
                          type="number"
                          placeholder="Price per token/key subscription"
                          value={apiForm.price}
                          onChange={(e) => setApiForm({ ...apiForm, price: Number(e.target.value) })}
                          className="w-full mt-1 p-2 bg-[var(--secondary-bg)] border border-[var(--border)] rounded text-sm"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-semibold text-[var(--muted)]">Endpoint URL</label>
                      <input
                        type="url"
                        placeholder="https://api.example.com/v1"
                        value={apiForm.endpoint_url}
                        onChange={(e) => setApiForm({ ...apiForm, endpoint_url: e.target.value })}
                        className="w-full mt-1 p-2 bg-[var(--secondary-bg)] border border-[var(--border)] rounded text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-semibold text-[var(--muted)]">Documentation Link (Optional)</label>
                      <input
                        type="url"
                        placeholder="https://docs.example.com"
                        value={apiForm.documentation}
                        onChange={(e) => setApiForm({ ...apiForm, documentation: e.target.value })}
                        className="w-full mt-1 p-2 bg-[var(--secondary-bg)] border border-[var(--border)] rounded text-sm"
                      />
                    </div>

                    <button type="submit" className="nyxa-btn nyxa-btn-primary py-2 mt-2 rounded">
                      Publish Developer API
                    </button>
                  </div>
                </form>

                {/* List APIs */}
                <div>
                  <h3 className="text-sm font-semibold border-b border-[var(--border)] pb-2 mb-4">My Published APIs</h3>
                  {myApis.length === 0 ? (
                    <p className="text-xs text-[var(--muted)]">No APIs published yet.</p>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {myApis.map(api => (
                        <div key={api.id} className="border border-[var(--border)] p-4 bg-[var(--card-bg)] rounded-lg flex justify-between items-center">
                          <div>
                            <span className="text-[9px] uppercase tracking-wider text-[var(--muted)]">{api.category}</span>
                            <h4 className="font-bold text-sm mt-1">{api.name}</h4>
                            <span className="text-xs text-[var(--muted)] tech-mono select-all">{api.endpoint_url}</span>
                          </div>
                          <span className="text-xs font-semibold tech-mono">${api.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SUBTAB: REQUESTS */}
            {activeSubTab === 'requests' && (
              <div>
                <h2 className="text-base font-semibold border-b border-[var(--border)] pb-2 mb-4">TaskBidder Board</h2>
                {openRequests.length === 0 ? (
                  <p className="text-xs text-[var(--muted)]">No active bidding requests on the board right now.</p>
                ) : (
                  <div className="flex flex-col gap-6">
                    {openRequests.map((req) => (
                      <div key={req.id} className="nyxa-card">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] uppercase tracking-widest px-2 py-0.5 rounded bg-[var(--secondary-bg)] border border-[var(--border)] text-[var(--foreground)]">
                              {req.request_type.toUpperCase()} REQUEST
                            </span>
                            <h3 className="text-sm font-bold mt-2">{req.title}</h3>
                          </div>
                          <span className="text-xs font-bold tech-mono text-[var(--success)]">
                            Budget: {req.budget ? `$${req.budget.toFixed(2)}` : 'Open'}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--muted)] mt-2">{req.description}</p>
                        
                        <div className="border-t border-[var(--border)] pt-4 mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] uppercase font-semibold text-[var(--muted)] block">Required Inputs</label>
                            <pre className="p-2.5 mt-1 bg-[var(--secondary-bg)] rounded text-[10px] tech-mono overflow-auto max-h-[100px]">
                              {JSON.stringify(req.inputs_required, null, 2)}
                            </pre>
                          </div>
                          <div>
                            <label className="text-[10px] uppercase font-semibold text-[var(--muted)] block">Expected Output Format</label>
                            <pre className="p-2.5 mt-1 bg-[var(--secondary-bg)] rounded text-[10px] tech-mono overflow-auto max-h-[100px]">
                              {JSON.stringify(req.outputs_delivered, null, 2)}
                            </pre>
                          </div>
                        </div>

                        {/* Bid Placement inputs */}
                        <div className="border-t border-[var(--border)] pt-4 mt-4 flex flex-col md:flex-row gap-4 items-end">
                          <div className="flex-grow">
                            <label className="text-[10px] uppercase font-semibold text-[var(--muted)]">Bid Amount ($)</label>
                            <input
                              type="number"
                              placeholder="Your bid price"
                              value={bidForm[req.id]?.amount || ''}
                              onChange={(e) => setBidForm({
                                ...bidForm,
                                [req.id]: {
                                  amount: Number(e.target.value),
                                  delivery: bidForm[req.id]?.delivery || '2 days'
                                }
                              })}
                              className="w-full mt-1 p-2 bg-[var(--secondary-bg)] border border-[var(--border)] rounded text-xs"
                            />
                          </div>
                          <div className="flex-grow">
                            <label className="text-[10px] uppercase font-semibold text-[var(--muted)]">Expected SLA</label>
                            <input
                              type="text"
                              placeholder="e.g. 1 day, 3 days"
                              value={bidForm[req.id]?.delivery || ''}
                              onChange={(e) => setBidForm({
                                ...bidForm,
                                [req.id]: {
                                  amount: bidForm[req.id]?.amount || 0,
                                  delivery: e.target.value
                                }
                              })}
                              className="w-full mt-1 p-2 bg-[var(--secondary-bg)] border border-[var(--border)] rounded text-xs"
                            />
                          </div>
                          <button
                            onClick={() => handlePlaceBid(req.id)}
                            className="nyxa-btn nyxa-btn-primary py-2 px-6 rounded text-xs"
                          >
                            Submit Outcome Bid
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}
