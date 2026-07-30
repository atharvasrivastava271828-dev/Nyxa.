'use client';

import React, { useState, useId } from 'react';

export type EisenhowerQuadrant = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export interface PriorityTask {
  id: string;
  title: string;
  quadrant: EisenhowerQuadrant;
  estimatedMinutes: number;
  completed: boolean;
  category?: string;
  createdAt: string;
}

export interface TimeBlock {
  startTime: string;
  endTime: string;
  title: string;
  type: 'task' | 'break';
  quadrant?: EisenhowerQuadrant;
  durationMinutes: number;
}

const QUADRANT_CONFIG: Record<
  EisenhowerQuadrant,
  { code: EisenhowerQuadrant; title: string; subtitle: string; action: string; color: string }
> = {
  Q1: {
    code: 'Q1',
    title: 'Urgent & Important',
    subtitle: 'Crises & immediate deadlines',
    action: 'Do First',
    color: 'border-l-4 border-l-red-500 bg-red-500/5',
  },
  Q2: {
    code: 'Q2',
    title: 'Important, Not Urgent',
    subtitle: 'Long-term goals & strategy',
    action: 'Schedule',
    color: 'border-l-4 border-l-blue-500 bg-blue-500/5',
  },
  Q3: {
    code: 'Q3',
    title: 'Urgent, Not Important',
    subtitle: 'Interruptions & quick admin',
    action: 'Delegate',
    color: 'border-l-4 border-l-amber-500 bg-amber-500/5',
  },
  Q4: {
    code: 'Q4',
    title: 'Neither Urgent nor Important',
    subtitle: 'Distractions & low priority',
    action: 'Eliminate',
    color: 'border-l-4 border-l-gray-400 bg-gray-500/5',
  },
};

const DEFAULT_TASKS: PriorityTask[] = [
  {
    id: 't-1',
    title: 'Submit Physics Lab Report before 5 PM',
    quadrant: 'Q1',
    estimatedMinutes: 45,
    completed: false,
    category: 'Academics',
    createdAt: new Date().toISOString(),
  },
  {
    id: 't-2',
    title: 'Study Mathematics Integration Chapter 4',
    quadrant: 'Q2',
    estimatedMinutes: 90,
    completed: false,
    category: 'Exam Prep',
    createdAt: new Date().toISOString(),
  },
  {
    id: 't-3',
    title: 'Reply to group project WhatsApp messages',
    quadrant: 'Q3',
    estimatedMinutes: 15,
    completed: false,
    category: 'Communication',
    createdAt: new Date().toISOString(),
  },
  {
    id: 't-4',
    title: 'Organize study desk folders and stationery',
    quadrant: 'Q4',
    estimatedMinutes: 30,
    completed: false,
    category: 'General',
    createdAt: new Date().toISOString(),
  },
];

export default function TaskSorter() {
  const inputTitleId = useId();
  const inputQuadId = useId();
  const inputMinsId = useId();

  const [tasks, setTasks] = useState<PriorityTask[]>(DEFAULT_TASKS);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskQuadrant, setTaskQuadrant] = useState<EisenhowerQuadrant>('Q1');
  const [taskMinutes, setTaskMinutes] = useState<number>(30);
  const [copied, setCopied] = useState(false);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const newTask: PriorityTask = {
      id: `task-${Date.now()}`,
      title: taskTitle.trim(),
      quadrant: taskQuadrant,
      estimatedMinutes: Number(taskMinutes) || 30,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setTasks([newTask, ...tasks]);
    setTaskTitle('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const moveQuadrant = (id: string, newQuad: EisenhowerQuadrant) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, quadrant: newQuad } : t)));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  // Metrics
  const activeTasks = tasks.filter((t) => !t.completed);
  const completedCount = tasks.filter((t) => t.completed).length;
  const totalWorkloadMins = activeTasks.reduce((acc, t) => acc + t.estimatedMinutes, 0);

  const formatMinutes = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const handleCopyActionPlan = () => {
    let plan = `Eisenhower Priority Action Plan\n`;
    plan += `-----------------------------------\n`;
    plan += `Active Workload: ${formatMinutes(totalWorkloadMins)} (${activeTasks.length} pending, ${completedCount} done)\n\n`;

    (['Q1', 'Q2', 'Q3', 'Q4'] as EisenhowerQuadrant[]).forEach((qCode) => {
      const qMeta = QUADRANT_CONFIG[qCode];
      const qList = activeTasks.filter((t) => t.quadrant === qCode);
      plan += `[${qMeta.code}: ${qMeta.title} (${qMeta.action})]\n`;
      if (qList.length === 0) {
        plan += `  • No active tasks\n`;
      } else {
        qList.forEach((t) => {
          plan += `  • ${t.title} (${t.estimatedMinutes}m)\n`;
        });
      }
      plan += `\n`;
    });

    navigator.clipboard.writeText(plan);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
            Eisenhower Task Sorter
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-0.5">
            Prioritize workload instantly across 4 decision quadrants.
          </p>
        </div>

        <button
          onClick={handleCopyActionPlan}
          className="nyxa-btn nyxa-btn-primary text-xs flex items-center justify-center gap-1.5 self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002-2h2a2 2 0 002-2M8 5a2 2 0 002 0h2a2 2 0 002 2" />
          </svg>
          {copied ? 'Copied!' : 'Copy Action Plan'}
        </button>
      </div>

      {/* Outcome Summary Card */}
      <div className="nyxa-card p-6 bg-gradient-to-br from-[var(--secondary-bg)] via-[var(--card-bg)] to-[var(--card-bg)] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[var(--border)] pb-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Active Workload
            </span>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-4xl sm:text-5xl font-black text-[var(--foreground)] tracking-tight">
                {formatMinutes(totalWorkloadMins)}
              </span>
              <span className="text-xs font-semibold text-[var(--muted)]">
                {activeTasks.length} pending task(s) • {completedCount} finished
              </span>
            </div>
          </div>
        </div>

        {/* Quadrant Quick Counts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {(['Q1', 'Q2', 'Q3', 'Q4'] as EisenhowerQuadrant[]).map((qCode) => {
            const count = activeTasks.filter((t) => t.quadrant === qCode).length;
            const cfg = QUADRANT_CONFIG[qCode];
            return (
              <div
                key={qCode}
                className="p-3 rounded-lg border border-[var(--border)] bg-[var(--secondary-bg)]"
              >
                <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--muted)]">
                  <span>{cfg.code} ({cfg.action})</span>
                </div>
                <span className="text-xl font-bold text-[var(--foreground)] mt-0.5 block">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Inline Quick Add Form */}
      <form onSubmit={handleAddTask} className="nyxa-card p-4 space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          Add New Priority Task
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6">
            <label htmlFor={inputTitleId} className="sr-only">Task Description</label>
            <input
              id={inputTitleId}
              type="text"
              className="nyxa-input text-xs font-semibold py-2"
              placeholder="Task title..."
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
            />
          </div>

          <div className="sm:col-span-4">
            <label htmlFor={inputQuadId} className="sr-only">Quadrant</label>
            <select
              id={inputQuadId}
              className="nyxa-select text-xs py-2"
              value={taskQuadrant}
              onChange={(e) => setTaskQuadrant(e.target.value as EisenhowerQuadrant)}
            >
              <option value="Q1">Q1: Do First (Urgent & Important)</option>
              <option value="Q2">Q2: Schedule (Important, Not Urgent)</option>
              <option value="Q3">Q3: Delegate (Urgent, Not Important)</option>
              <option value="Q4">Q4: Eliminate (Not Urgent / Not Important)</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor={inputMinsId} className="sr-only">Duration (mins)</label>
            <input
              id={inputMinsId}
              type="number"
              min="5"
              step="5"
              className="nyxa-input text-xs py-2 text-center"
              value={taskMinutes}
              onChange={(e) => setTaskMinutes(Number(e.target.value))}
              placeholder="Mins"
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

      {/* 4-Quadrant Matrix Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(['Q1', 'Q2', 'Q3', 'Q4'] as EisenhowerQuadrant[]).map((qCode) => {
          const cfg = QUADRANT_CONFIG[qCode];
          const qTasks = tasks.filter((t) => t.quadrant === qCode);

          return (
            <div
              key={qCode}
              className={`nyxa-card p-4 space-y-3 ${cfg.color}`}
            >
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                <div>
                  <h3 className="text-sm font-bold text-[var(--foreground)] m-0">
                    {cfg.code}: {cfg.title}
                  </h3>
                  <span className="text-[11px] text-[var(--muted)]">{cfg.subtitle}</span>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded border border-[var(--border)] bg-[var(--card-bg)] text-[var(--foreground)]">
                  {cfg.action}
                </span>
              </div>

              {/* Tasks List */}
              <div className="space-y-2">
                {qTasks.length === 0 ? (
                  <p className="text-xs text-[var(--muted)] italic py-4 text-center">
                    No tasks in {cfg.code}.
                  </p>
                ) : (
                  qTasks.map((t) => (
                    <div
                      key={t.id}
                      className={`p-3 rounded-lg border border-[var(--border)] bg-[var(--card-bg)] flex items-start justify-between gap-2 ${
                        t.completed ? 'opacity-50 line-through' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          className="w-4 h-4 mt-0.5 rounded accent-emerald-600 cursor-pointer"
                          checked={t.completed}
                          onChange={() => toggleTask(t.id)}
                        />
                        <div>
                          <span className="text-xs font-semibold text-[var(--foreground)] block">
                            {t.title}
                          </span>
                          <span className="text-[10px] font-mono text-[var(--muted)] mt-0.5 block">
                            {t.estimatedMinutes} mins
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {/* Quick Shift Quadrant Selector */}
                        <select
                          className="text-[10px] py-0.5 px-1 rounded border border-[var(--border)] bg-[var(--secondary-bg)]"
                          value={t.quadrant}
                          onChange={(e) => moveQuadrant(t.id, e.target.value as EisenhowerQuadrant)}
                        >
                          <option value="Q1">Q1</option>
                          <option value="Q2">Q2</option>
                          <option value="Q3">Q3</option>
                          <option value="Q4">Q4</option>
                        </select>

                        <button
                          onClick={() => deleteTask(t.id)}
                          className="p-1 text-[var(--muted)] hover:text-red-500 transition-colors"
                          title="Delete Task"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
