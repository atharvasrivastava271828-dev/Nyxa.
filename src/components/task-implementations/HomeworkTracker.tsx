'use client';

import { useState, useId } from 'react';

export interface ExamItem {
  id: string;
  subject: string;
  title: string;
  examDate: string;
  syllabus: string;
}

export interface SubTask {
  id: string;
  text: string;
  done: boolean;
}

export interface HomeworkItem {
  id: string;
  title: string;
  subject: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'To Do' | 'In Progress' | 'Completed';
  dueDate: string;
  subtasks: SubTask[];
  notes?: string;
  createdAt: string;
}

const DEFAULT_HOMEWORK: HomeworkItem[] = [
  {
    id: 'hw-1',
    title: 'NCERT Calculus Exercises 4.2 & 4.3',
    subject: 'Mathematics',
    priority: 'High',
    status: 'To Do',
    dueDate: new Date(Date.now() + 86400000 * 1.5).toISOString().slice(0, 10),
    subtasks: [
      { id: 'st-1', text: 'Questions 1-10', done: true },
      { id: 'st-2', text: 'Word Problems 11-15', done: false },
    ],
    notes: 'Focus on integration by parts formulas.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'hw-2',
    title: 'Chemistry Lab Manual Experiment #5',
    subject: 'Chemistry',
    priority: 'Medium',
    status: 'In Progress',
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
    subtasks: [
      { id: 'st-3', text: 'Record observation tables', done: true },
      { id: 'st-4', text: 'Draw titration chart', done: false },
    ],
    notes: 'Include safety precautions.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'hw-3',
    title: 'Macroeconomics Chapter 3 Reading',
    subject: 'Economics',
    priority: 'Low',
    status: 'Completed',
    dueDate: new Date(Date.now() - 86400000 * 0.5).toISOString().slice(0, 10),
    subtasks: [{ id: 'st-5', text: 'Make key point notes', done: true }],
    notes: 'Completed summary notes.',
    createdAt: new Date().toISOString(),
  },
];

export default function HomeworkTracker() {
  const titleId = useId();
  const subjectId = useId();
  const dueDateId = useId();
  const priorityId = useId();

  const [homeworks, setHomeworks] = useState<HomeworkItem[]>(DEFAULT_HOMEWORK);
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Completed'>('All');
  const [copied, setCopied] = useState(false);

  // New Homework Form State
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Mathematics');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [dueDate, setDueDate] = useState('2026-12-31');

  const handleAddHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newItem: HomeworkItem = {
      id: `hw-${Date.now()}`,
      title: title.trim(),
      subject,
      priority,
      status: 'To Do',
      dueDate,
      subtasks: [],
      createdAt: new Date().toISOString(),
    };

    setHomeworks([newItem, ...homeworks]);
    setTitle('');
  };

  const toggleStatus = (id: string) => {
    setHomeworks(
      homeworks.map((h) =>
        h.id === id
          ? { ...h, status: h.status === 'Completed' ? 'To Do' : 'Completed' }
          : h
      )
    );
  };

  const toggleSubtask = (hwId: string, subtaskId: string) => {
    setHomeworks(
      homeworks.map((h) => {
        if (h.id === hwId) {
          const updatedSubtasks = h.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, done: !st.done } : st
          );
          return { ...h, subtasks: updatedSubtasks };
        }
        return h;
      })
    );
  };

  const deleteHomework = (id: string) => {
    setHomeworks(homeworks.filter((h) => h.id !== id));
  };

  // Metrics
  const totalTasks = homeworks.length;
  const completedTasks = homeworks.filter((h) => h.status === 'Completed').length;
  const pendingTasks = totalTasks - completedTasks;
  const completionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const filteredItems = homeworks.filter((h) => {
    if (filter === 'Pending') return h.status !== 'Completed';
    if (filter === 'Completed') return h.status === 'Completed';
    return true;
  });

  const handleCopySummary = () => {
    const pendingList = homeworks.filter((h) => h.status !== 'Completed');
    let summary = `Homework & Task Tracker Summary\n`;
    summary += `-----------------------------------\n`;
    summary += `Progress: ${completedTasks}/${totalTasks} Tasks Completed (${completionPct}%)\n\n`;
    summary += `Pending Homeworks (${pendingList.length}):\n`;
    if (pendingList.length === 0) {
      summary += `🎉 All assignments completed!\n`;
    } else {
      pendingList.forEach((h, i) => {
        summary += `${i + 1}. [${h.priority} Priority] ${h.title} (${h.subject}) - Due: ${h.dueDate}\n`;
      });
    }

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPriorityBadge = (p: HomeworkItem['priority']) => {
    if (p === 'High') return 'bg-red-500/10 text-red-600 border-red-500/30';
    if (p === 'Medium') return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
    return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
            Homework Tracker
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-0.5">
            Streamlined academic task management & progress tracking.
          </p>
        </div>

        <button
          onClick={handleCopySummary}
          className="nyxa-btn nyxa-btn-primary text-xs flex items-center justify-center gap-1.5 self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002-2h2a2 2 0 002-2M8 5a2 2 0 002 0h2a2 2 0 002 2" />
          </svg>
          {copied ? 'Copied!' : 'Copy Summary'}
        </button>
      </div>

      {/* Live Metrics Outcome Card */}
      <div className="nyxa-card p-6 bg-gradient-to-br from-[var(--secondary-bg)] via-[var(--card-bg)] to-[var(--card-bg)] space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Completion Rate
            </span>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-4xl sm:text-5xl font-black text-[var(--foreground)] tracking-tight">
                {completionPct}%
              </span>
              <span className="text-xs font-semibold text-[var(--muted)]">
                {completedTasks} of {totalTasks} finished
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--secondary-bg)] border border-[var(--border)]">
            <button
              onClick={() => setFilter('All')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                filter === 'All'
                  ? 'bg-[var(--card-bg)] text-[var(--foreground)] shadow-sm'
                  : 'text-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
            >
              All ({totalTasks})
            </button>
            <button
              onClick={() => setFilter('Pending')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                filter === 'Pending'
                  ? 'bg-[var(--card-bg)] text-[var(--foreground)] shadow-sm'
                  : 'text-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
            >
              Pending ({pendingTasks})
            </button>
            <button
              onClick={() => setFilter('Completed')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                filter === 'Completed'
                  ? 'bg-[var(--card-bg)] text-[var(--foreground)] shadow-sm'
                  : 'text-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
            >
              Done ({completedTasks})
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-[var(--secondary-bg)] rounded-full overflow-hidden border border-[var(--border)]">
          <div
            className="h-full bg-[var(--foreground)] transition-all duration-300"
            style={{ width: `${completionPct}%` }}
          />
        </div>
      </div>

      {/* Quick Task Creation Card */}
      <form onSubmit={handleAddHomework} className="nyxa-card p-4 space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          Add New Homework Task
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-5">
            <label htmlFor={titleId} className="sr-only">Task Title</label>
            <input
              id={titleId}
              type="text"
              className="nyxa-input text-xs font-semibold py-2"
              placeholder="Task title (e.g. Solve Chapter 4 Exercises)..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="sm:col-span-3">
            <label htmlFor={subjectId} className="sr-only">Subject</label>
            <select
              id={subjectId}
              className="nyxa-select text-xs py-2"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
              <option value="English">English</option>
              <option value="Economics">Economics</option>
              <option value="Computer Science">Computer Science</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor={priorityId} className="sr-only">Priority</label>
            <select
              id={priorityId}
              className="nyxa-select text-xs py-2"
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor={dueDateId} className="sr-only">Due Date</label>
            <input
              id={dueDateId}
              type="date"
              className="nyxa-input text-xs py-2"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            className="nyxa-btn nyxa-btn-primary text-xs flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Task
          </button>
        </div>
      </form>

      {/* Homework Tasks List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="nyxa-card py-10 text-center text-[var(--muted)] text-xs">
            No homework items match your active filter.
          </div>
        ) : (
          filteredItems.map((item) => {
            const isDone = item.status === 'Completed';
            return (
              <div
                key={item.id}
                className={`nyxa-card p-4 space-y-2 transition-all ${
                  isDone ? 'opacity-60 bg-[var(--secondary-bg)]/40' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      className="w-4 h-4 mt-0.5 rounded accent-emerald-600 cursor-pointer"
                      checked={isDone}
                      onChange={() => toggleStatus(item.id)}
                    />
                    <div>
                      <h3 className={`text-sm font-semibold text-[var(--foreground)] m-0 ${isDone ? 'line-through' : ''}`}>
                        {item.title}
                      </h3>
                      {item.notes && (
                        <p className="text-xs text-[var(--muted)] m-0 mt-0.5">{item.notes}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded border border-[var(--border)] bg-[var(--secondary-bg)]">
                      {item.subject}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getPriorityBadge(item.priority)}`}>
                      {item.priority}
                    </span>
                    <span className="text-[11px] font-mono text-[var(--muted)] hidden sm:inline">
                      Due: {item.dueDate}
                    </span>
                    <button
                      onClick={() => deleteHomework(item.id)}
                      className="p-1 text-[var(--muted)] hover:text-red-500 transition-colors ml-1"
                      title="Delete task"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Subtasks inline list if any */}
                {item.subtasks.length > 0 && (
                  <div className="pt-2 border-t border-[var(--border)] pl-7 space-y-1">
                    {item.subtasks.map((st) => (
                      <div key={st.id} className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          className="w-3.5 h-3.5 rounded accent-emerald-600 cursor-pointer"
                          checked={st.done}
                          onChange={() => toggleSubtask(item.id, st.id)}
                        />
                        <span className={st.done ? 'line-through text-[var(--muted)]' : 'text-[var(--foreground)]'}>
                          {st.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
