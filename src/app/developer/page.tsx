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
  const [activeSubTab, setActiveSubTab] = useState<'tasks' | 'agents' | 'apis' | 'requests'>('tasks');
  const [loading, setLoading] = useState(false);

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
    if (userId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchDeveloperData();
    }
  }, [userId, fetchDeveloperData]);

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
        <div className="border border-[var(--border)] p-6 bg-[var(--secondary-bg)] text-center rounded-lg">
          <p className="text-sm">Please log in to access the Developer Portal.</p>
          <Link href="/login" className="nyxa-btn nyxa-btn-primary py-2 px-6 rounded-md">Log In</Link>
        </div>
      )}

      {userId && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation Sidebar */}
          <aside className="lg:col-span-1 flex flex-col gap-3">
            <button
              onClick={() => setActiveSubTab('tasks')}
              className={`w-full text-left py-2.5 px-4 text-xs font-semibold rounded-lg border ${
                activeSubTab === 'tasks' ? 'bg-[var(--foreground)] text-[var(--background)] border-transparent' : 'bg-[var(--card-bg)] text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--secondary-bg)]'
              }`}
            >
              💼 Standardized Tasks
            </button>
            <button
              onClick={() => setActiveSubTab('agents')}
              className={`w-full text-left py-2.5 px-4 text-xs font-semibold rounded-lg border ${
                activeSubTab === 'agents' ? 'bg-[var(--foreground)] text-[var(--background)] border-transparent' : 'bg-[var(--card-bg)] text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--secondary-bg)]'
              }`}
            >
              🤖 Agentic Capabilities
            </button>
            <button
              onClick={() => setActiveSubTab('apis')}
              className={`w-full text-left py-2.5 px-4 text-xs font-semibold rounded-lg border ${
                activeSubTab === 'apis' ? 'bg-[var(--foreground)] text-[var(--background)] border-transparent' : 'bg-[var(--card-bg)] text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--secondary-bg)]'
              }`}
            >
              🔌 Developer APIs
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
                        <select
                          value={taskForm.class}
                          onChange={(e) => setTaskForm({ ...taskForm, class: e.target.value, kind: validKindsMap[e.target.value][0] })}
                          className="w-full mt-1 p-2 bg-[var(--secondary-bg)] border border-[var(--border)] rounded text-sm"
                        >
                          <option value="Business">Business Tasks</option>
                          <option value="Education">Education Tasks</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-semibold text-[var(--muted)]">Kind</label>
                        <select
                          value={taskForm.kind}
                          onChange={(e) => setTaskForm({ ...taskForm, kind: e.target.value })}
                          className="w-full mt-1 p-2 bg-[var(--secondary-bg)] border border-[var(--border)] rounded text-sm"
                        >
                          {validKindsMap[taskForm.class].map(k => (
                            <option key={k} value={k}>{k}</option>
                          ))}
                        </select>
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
