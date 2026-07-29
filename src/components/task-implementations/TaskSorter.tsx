'use client';

import React, { useState, useEffect, useId } from 'react';

export type EisenhowerQuadrant = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export interface PriorityTask {
  id: string;
  title: string;
  quadrant: EisenhowerQuadrant;
  estimatedMinutes: number;
  category: string;
  notes?: string;
  completed: boolean;
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

const QUADRANT_META: Record<
  EisenhowerQuadrant,
  {
    code: EisenhowerQuadrant;
    title: string;
    actionLabel: string;
    subtitle: string;
    badgeStyle: string;
    borderStyle: string;
    bgAccent: string;
    icon: string;
  }
> = {
  Q1: {
    code: 'Q1',
    title: 'Urgent & Important',
    actionLabel: 'Do Now',
    subtitle: 'Crises, pressings tasks, immediate deadlines',
    badgeStyle: 'bg-red-500/10 text-red-600 border-red-500/30',
    borderStyle: 'border-l-4 border-l-red-500',
    bgAccent: 'bg-red-500/5',
    icon: '🔥',
  },
  Q2: {
    code: 'Q2',
    title: 'Not Urgent & Important',
    actionLabel: 'Do Next / Schedule',
    subtitle: 'High value goals, planning, learning & prep',
    badgeStyle: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
    borderStyle: 'border-l-4 border-l-blue-500',
    bgAccent: 'bg-blue-500/5',
    icon: '🎯',
  },
  Q3: {
    code: 'Q3',
    title: 'Urgent & Not Important',
    actionLabel: 'Quick Wins / Delegate',
    subtitle: 'Interruptions, quick admin tasks, peer requests',
    badgeStyle: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
    borderStyle: 'border-l-4 border-l-amber-500',
    bgAccent: 'bg-amber-500/5',
    icon: '⚡',
  },
  Q4: {
    code: 'Q4',
    title: 'Not Urgent & Not Important',
    actionLabel: 'Do Later / Eliminate',
    subtitle: 'Low priority, distractions, optional activities',
    badgeStyle: 'bg-gray-500/10 text-gray-600 border-gray-500/30',
    borderStyle: 'border-l-4 border-l-gray-400',
    bgAccent: 'bg-gray-500/5',
    icon: '📦',
  },
};

const DEFAULT_TASKS: PriorityTask[] = [
  {
    id: 't-1',
    title: 'Submit Physics Lab Report before 5 PM',
    quadrant: 'Q1',
    estimatedMinutes: 45,
    category: 'Academics',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 't-2',
    title: 'Study Mathematics Integration Chapter 4',
    quadrant: 'Q2',
    estimatedMinutes: 90,
    category: 'Exam Prep',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 't-3',
    title: 'Reply to group project WhatsApp messages',
    quadrant: 'Q3',
    estimatedMinutes: 15,
    category: 'Communication',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 't-4',
    title: 'Organize study desk folders and stationery',
    quadrant: 'Q4',
    estimatedMinutes: 30,
    category: 'General',
    completed: false,
    createdAt: new Date().toISOString(),
  },
];

export default function TaskSorter() {
  const taskTitleId = useId();
  const quadrantId = useId();
  const durationId = useId();
  const categoryId = useId();
  const startTimeId = useId();
  const maxBlockId = useId();
  const breakDurationId = useId();

  const [tasks, setTasks] = useState<PriorityTask[]>([]);
  const [viewMode, setViewMode] = useState<'matrix' | 'list'>('matrix');

  // Add Task Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskQuadrant, setTaskQuadrant] = useState<EisenhowerQuadrant>('Q1');
  const [taskMinutes, setTaskMinutes] = useState<number>(30);
  const [taskCategory, setTaskCategory] = useState<string>('General');
  const [taskNotes, setTaskNotes] = useState<string>('');

  // Schedule Engine Modal & Settings
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [startTime, setStartTime] = useState<string>('09:00');
  const [maxBlockMinutes, setMaxBlockMinutes] = useState<number>(50);
  const [breakMinutes, setBreakMinutes] = useState<number>(10);
  const [suggestedSchedule, setSuggestedSchedule] = useState<TimeBlock[]>([]);

  // Load from local storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('nyxa_eisenhower_tasks');
      if (stored) {
        setTasks(JSON.parse(stored));
      } else {
        setTasks(DEFAULT_TASKS);
      }
    } catch (e) {
      console.error('Failed to load tasks', e);
      setTasks(DEFAULT_TASKS);
    }
  }, []);

  const saveTasks = (updated: PriorityTask[]) => {
    setTasks(updated);
    try {
      localStorage.setItem('nyxa_eisenhower_tasks', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save tasks', e);
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const newTask: PriorityTask = {
      id: `task-${Date.now()}`,
      title: taskTitle.trim(),
      quadrant: taskQuadrant,
      estimatedMinutes: Number(taskMinutes) || 30,
      category: taskCategory || 'General',
      notes: taskNotes,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    saveTasks([newTask, ...tasks]);
    setTaskTitle('');
    setTaskNotes('');
    setShowAddModal(false);
  };

  const toggleTaskCompleted = (id: string) => {
    saveTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const moveTaskQuadrant = (id: string, newQuad: EisenhowerQuadrant) => {
    saveTasks(tasks.map((t) => (t.id === id ? { ...t, quadrant: newQuad } : t)));
  };

  const deleteTask = (id: string) => {
    saveTasks(tasks.filter((t) => t.id !== id));
  };

  // Helper formatting for duration (e.g. 90m -> 1h 30m)
  const formatDuration = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    const remainder = mins % 60;
    return remainder > 0 ? `${hrs}h ${remainder}m` : `${hrs}h`;
  };

  // Calculate sum of minutes for a list of tasks
  const getSumMinutes = (taskList: PriorityTask[]) =>
    taskList.reduce((acc, t) => acc + (t.completed ? 0 : t.estimatedMinutes), 0);

  // Generate Time-Block Schedule Engine
  const generateSchedule = () => {
    const activeTasks = tasks.filter((t) => !t.completed);
    if (activeTasks.length === 0) {
      setSuggestedSchedule([]);
      return;
    }

    // Sort priority order: Q1 -> Q2 -> Q3 -> Q4
    const priorityOrder: EisenhowerQuadrant[] = ['Q1', 'Q2', 'Q3', 'Q4'];
    const sorted = [...activeTasks].sort(
      (a, b) => priorityOrder.indexOf(a.quadrant) - priorityOrder.indexOf(b.quadrant)
    );

    const blocks: TimeBlock[] = [];
    const [startH, startM] = startTime.split(':').map(Number);
    let currentTotalMinutes = startH * 60 + startM;
    let accumulatedWorkInSession = 0;

    const formatClockTime = (totalMins: number) => {
      const h = Math.floor(totalMins / 60) % 24;
      const m = totalMins % 60;
      const ampm = h >= 12 ? 'PM' : 'AM';
      const formattedH = h % 12 === 0 ? 12 : h % 12;
      return `${String(formattedH).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
    };

    sorted.forEach((task) => {
      let taskMinsRemaining = task.estimatedMinutes;

      while (taskMinsRemaining > 0) {
        // If current work session reached max before break, insert break block
        if (accumulatedWorkInSession >= maxBlockMinutes) {
          const breakStart = formatClockTime(currentTotalMinutes);
          currentTotalMinutes += breakMinutes;
          const breakEnd = formatClockTime(currentTotalMinutes);
          blocks.push({
            startTime: breakStart,
            endTime: breakEnd,
            title: `☕ Short Rest Break (${breakMinutes}m)`,
            type: 'break',
            durationMinutes: breakMinutes,
          });
          accumulatedWorkInSession = 0;
        }

        const chunkDuration = Math.min(taskMinsRemaining, maxBlockMinutes - accumulatedWorkInSession);
        const tStart = formatClockTime(currentTotalMinutes);
        currentTotalMinutes += chunkDuration;
        const tEnd = formatClockTime(currentTotalMinutes);

        accumulatedWorkInSession += chunkDuration;
        taskMinsRemaining -= chunkDuration;

        blocks.push({
          startTime: tStart,
          endTime: tEnd,
          title: task.title,
          type: 'task',
          quadrant: task.quadrant,
          durationMinutes: chunkDuration,
        });
      }
    });

    setSuggestedSchedule(blocks);
  };

  useEffect(() => {
    if (showScheduleModal) {
      generateSchedule();
    }
  }, [showScheduleModal, startTime, maxBlockMinutes, breakMinutes, tasks]);

  const totalWorkloadMinutes = getSumMinutes(tasks);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-[var(--secondary-bg)] border border-[var(--border)] text-[var(--foreground)]">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </span>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--foreground)]">
              Eisenhower Task Sorter & Scheduler
            </h1>
          </div>
          <p className="text-sm text-[var(--muted)] mt-1">
            Categorize tasks by urgency & importance with automated time-block schedule generation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center p-1 rounded-lg bg-[var(--secondary-bg)] border border-[var(--border)]">
            <button
              onClick={() => setViewMode('matrix')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                viewMode === 'matrix'
                  ? 'bg-[var(--card-bg)] text-[var(--foreground)] shadow-sm'
                  : 'text-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
            >
              4-Quadrant View
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-[var(--card-bg)] text-[var(--foreground)] shadow-sm'
                  : 'text-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
            >
              List View
            </button>
          </div>

          <button
            onClick={() => setShowScheduleModal(true)}
            className="nyxa-btn nyxa-btn-secondary text-xs flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Generate Time Blocks
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="nyxa-btn nyxa-btn-primary text-xs flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            + Add Task
          </button>
        </div>
      </div>

      {/* Quick Summary Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(['Q1', 'Q2', 'Q3', 'Q4'] as EisenhowerQuadrant[]).map((qCode) => {
          const meta = QUADRANT_META[qCode];
          const qTasks = tasks.filter((t) => t.quadrant === qCode && !t.completed);
          const qMins = getSumMinutes(tasks.filter((t) => t.quadrant === qCode));

          return (
            <div
              key={qCode}
              onClick={() => {
                setTaskQuadrant(qCode);
                setShowAddModal(true);
              }}
              className={`nyxa-card ${meta.bgAccent} cursor-pointer hover:border-[var(--accent)] transition-all justify-between p-3.5`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${meta.badgeStyle}`}>
                  {meta.code}: {meta.actionLabel}
                </span>
                <span className="text-lg">{meta.icon}</span>
              </div>
              <div className="my-1.5">
                <span className="text-2xl font-black text-[var(--foreground)]">{qTasks.length}</span>
                <span className="text-xs text-[var(--muted)] ml-1">pending task(s)</span>
              </div>
              <div className="text-[11px] text-[var(--muted)] font-mono">
                Workload: {formatDuration(qMins)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Total Pending Time Banner */}
      <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--secondary-bg)] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[var(--foreground)]">Total Active Workload:</span>
          <span className="font-mono font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
            {formatDuration(totalWorkloadMinutes)}
          </span>
          <span className="text-[var(--muted)]">across {tasks.filter((t) => !t.completed).length} pending task(s)</span>
        </div>
        <span className="text-[var(--muted)] hidden sm:inline">
          Click "+ Add Task" or tap any quadrant card to insert new items.
        </span>
      </div>

      {/* Main 4-Quadrant Matrix Layout */}
      {viewMode === 'matrix' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {(['Q1', 'Q2', 'Q3', 'Q4'] as EisenhowerQuadrant[]).map((qCode) => {
            const meta = QUADRANT_META[qCode];
            const qTasks = tasks.filter((t) => t.quadrant === qCode);

            return (
              <div
                key={qCode}
                className={`nyxa-card ${meta.borderStyle} space-y-3 bg-[var(--card-bg)] min-h-[280px]`}
              >
                {/* Quadrant Title Header */}
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{meta.icon}</span>
                      <h2 className="text-base font-bold text-[var(--foreground)] border-0 p-0 m-0">
                        {meta.code}: {meta.title}
                      </h2>
                    </div>
                    <p className="text-[11px] text-[var(--muted)] m-0">{meta.subtitle}</p>
                  </div>
                  <button
                    onClick={() => {
                      setTaskQuadrant(qCode);
                      setShowAddModal(true);
                    }}
                    className="p-1 rounded hover:bg-[var(--secondary-bg)] text-[var(--muted)] hover:text-[var(--foreground)]"
                    title={`Add task directly to ${meta.code}`}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>

                {/* Tasks List */}
                <div className="space-y-2 flex-grow">
                  {qTasks.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center py-8 text-center text-[var(--muted)]">
                      <span className="text-xs">No tasks in this quadrant.</span>
                      <button
                        onClick={() => {
                          setTaskQuadrant(qCode);
                          setShowAddModal(true);
                        }}
                        className="text-[11px] text-blue-500 underline mt-1"
                      >
                        + Add a task
                      </button>
                    </div>
                  ) : (
                    qTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`p-3 rounded-lg border border-[var(--border)] bg-[var(--secondary-bg)] space-y-2 transition-all ${
                          task.completed ? 'opacity-50 line-through bg-gray-500/5' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2">
                            <input
                              type="checkbox"
                              className="w-4 h-4 mt-0.5 rounded accent-emerald-600 cursor-pointer"
                              checked={task.completed}
                              onChange={() => toggleTaskCompleted(task.id)}
                            />
                            <div>
                              <span className="text-xs font-semibold text-[var(--foreground)] block">
                                {task.title}
                              </span>
                              {task.notes && (
                                <span className="text-[11px] text-[var(--muted)] block mt-0.5">
                                  {task.notes}
                                </span>
                              )}
                            </div>
                          </div>

                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[var(--card-bg)] border border-[var(--border)] text-[var(--foreground)] shrink-0">
                            ⏱ {formatDuration(task.estimatedMinutes)}
                          </span>
                        </div>

                        {/* Controls & Move Dropdown */}
                        <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-[11px]">
                          <span className="text-[10px] text-[var(--muted)] px-1.5 py-0.5 rounded bg-[var(--card-bg)] border border-[var(--border)]">
                            {task.category}
                          </span>

                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-[var(--muted)]">Move:</span>
                            {(['Q1', 'Q2', 'Q3', 'Q4'] as EisenhowerQuadrant[])
                              .filter((q) => q !== task.quadrant)
                              .map((qTarget) => (
                                <button
                                  key={qTarget}
                                  onClick={() => moveTaskQuadrant(task.id, qTarget)}
                                  className="px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded bg-[var(--card-bg)] border border-[var(--border)] hover:bg-[var(--accent)] hover:text-[var(--background)] transition-colors"
                                  title={`Move task to ${qTarget}`}
                                >
                                  {qTarget}
                                </button>
                              ))}

                            <button
                              onClick={() => deleteTask(task.id)}
                              className="p-1 text-gray-400 hover:text-red-500 ml-1"
                              title="Delete task"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Flat List View Mode */
        <div className="nyxa-card space-y-4">
          <div className="nyxa-table-wrapper">
            <table className="nyxa-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Task Title</th>
                  <th>Quadrant</th>
                  <th>Estimated Time</th>
                  <th>Category</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-[var(--muted)]">
                      No tasks found. Click "+ Add Task" to get started.
                    </td>
                  </tr>
                ) : (
                  tasks.map((t) => {
                    const meta = QUADRANT_META[t.quadrant];
                    return (
                      <tr key={t.id} className={t.completed ? 'opacity-50 line-through' : ''}>
                        <td>
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded accent-emerald-600 cursor-pointer"
                            checked={t.completed}
                            onChange={() => toggleTaskCompleted(t.id)}
                          />
                        </td>
                        <td className="font-medium text-xs text-[var(--foreground)]">{t.title}</td>
                        <td>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${meta?.badgeStyle || ''}`}>
                            {meta?.code || t.quadrant} - {meta?.actionLabel || ''}
                          </span>
                        </td>
                        <td className="font-mono text-xs">{formatDuration(t.estimatedMinutes)}</td>
                        <td>
                          <span className="text-xs text-[var(--muted)]">{t.category}</span>
                        </td>
                        <td className="text-right">
                          <button
                            onClick={() => deleteTask(t.id)}
                            className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="nyxa-card max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <h2 className="text-lg font-bold border-0 p-0 m-0">Add Eisenhower Task</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label htmlFor={taskTitleId} className="nyxa-label">Task Description *</label>
                <input
                  id={taskTitleId}
                  type="text"
                  required
                  className="nyxa-input"
                  placeholder="e.g. Finish Integration problem set 4"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor={quadrantId} className="nyxa-label">Eisenhower Priority</label>
                  <select
                    id={quadrantId}
                    className="nyxa-select text-xs"
                    value={taskQuadrant}
                    onChange={(e) => setTaskQuadrant(e.target.value as EisenhowerQuadrant)}
                  >
                    <option value="Q1">Q1: Urgent & Important (Do Now)</option>
                    <option value="Q2">Q2: Not Urgent & Important (Do Next)</option>
                    <option value="Q3">Q3: Urgent & Not Important (Delegate/Quick Win)</option>
                    <option value="Q4">Q4: Low Priority (Do Later)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor={durationId} className="nyxa-label">Time Estimate (Mins)</label>
                  <select
                    id={durationId}
                    className="nyxa-select text-xs"
                    value={taskMinutes}
                    onChange={(e) => setTaskMinutes(Number(e.target.value))}
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>1 Hour (60m)</option>
                    <option value={90}>1.5 Hours (90m)</option>
                    <option value={120}>2 Hours (120m)</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor={categoryId} className="nyxa-label">Category Tag</label>
                <input
                  id={categoryId}
                  type="text"
                  className="nyxa-input text-xs"
                  placeholder="e.g. Academics, Project, Exam Prep"
                  value={taskCategory}
                  onChange={(e) => setTaskCategory(e.target.value)}
                />
              </div>

              <div>
                <label className="nyxa-label">Additional Notes</label>
                <textarea
                  className="nyxa-textarea text-xs"
                  rows={2}
                  placeholder="Details, links, references..."
                  value={taskNotes}
                  onChange={(e) => setTaskNotes(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="nyxa-btn nyxa-btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="nyxa-btn nyxa-btn-primary text-xs">
                  Save Priority Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Automated Time-Block Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="nyxa-card max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div>
                <h2 className="text-lg font-bold border-0 p-0 m-0">Suggested Time-Block Schedule</h2>
                <p className="text-xs text-[var(--muted)] m-0">
                  Automated schedule based on your prioritized tasks & rest breaks
                </p>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="p-1 text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Config controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-[var(--secondary-bg)] border border-[var(--border)]">
              <div>
                <label htmlFor={startTimeId} className="nyxa-label text-[11px]">Workday Start Time</label>
                <input
                  id={startTimeId}
                  type="time"
                  className="nyxa-input text-xs py-1"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor={maxBlockId} className="nyxa-label text-[11px]">Max Session before Break</label>
                <select
                  id={maxBlockId}
                  className="nyxa-select text-xs py-1"
                  value={maxBlockMinutes}
                  onChange={(e) => setMaxBlockMinutes(Number(e.target.value))}
                >
                  <option value={25}>25 Mins (Pomodoro)</option>
                  <option value={45}>45 Mins</option>
                  <option value={50}>50 Mins (Standard)</option>
                  <option value={90}>90 Mins (Deep Work)</option>
                </select>
              </div>

              <div>
                <label htmlFor={breakDurationId} className="nyxa-label text-[11px]">Break Duration</label>
                <select
                  id={breakDurationId}
                  className="nyxa-select text-xs py-1"
                  value={breakMinutes}
                  onChange={(e) => setBreakMinutes(Number(e.target.value))}
                >
                  <option value={5}>5 Minutes</option>
                  <option value={10}>10 Minutes</option>
                  <option value={15}>15 Minutes</option>
                </select>
              </div>
            </div>

            {/* Generated Time Block Itinerary */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                Daily Time-Block Itinerary
              </h3>

              {suggestedSchedule.length === 0 ? (
                <p className="text-xs text-[var(--muted)] text-center py-6">
                  No active tasks to schedule! Add some tasks first.
                </p>
              ) : (
                <div className="space-y-2">
                  {suggestedSchedule.map((block, idx) => {
                    const isBreak = block.type === 'break';
                    const quadMeta = block.quadrant ? QUADRANT_META[block.quadrant] : null;

                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border flex items-center justify-between gap-3 text-xs ${
                          isBreak
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300 font-medium'
                            : 'bg-[var(--secondary-bg)] border-[var(--border)]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-[var(--foreground)] w-32 shrink-0">
                            {block.startTime} - {block.endTime}
                          </span>

                          <div>
                            <span className="font-semibold text-[var(--foreground)] block">
                              {block.title}
                            </span>
                            {quadMeta && (
                              <span className="text-[10px] text-[var(--muted)]">
                                Priority: {quadMeta.code} ({quadMeta.actionLabel})
                              </span>
                            )}
                          </div>
                        </div>

                        <span className="font-mono font-bold text-[var(--muted)] shrink-0">
                          {block.durationMinutes}m
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
