'use client';

import React, { useState, useEffect, useId, useMemo } from 'react';

export type EisenhowerQuadrant = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export interface PriorityTask {
  id: string;
  title: string;
  quadrant: EisenhowerQuadrant;
  estimatedMinutes: number;
  completedPomodoros: number;
  targetPomodoros: number;
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
    subtitle: 'Crises, pressing tasks, immediate deadlines',
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
    completedPomodoros: 1,
    targetPomodoros: 2,
    category: 'Academics',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 't-2',
    title: 'Study Mathematics Integration Chapter 4',
    quadrant: 'Q2',
    estimatedMinutes: 90,
    completedPomodoros: 2,
    targetPomodoros: 4,
    category: 'Exam Prep',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 't-3',
    title: 'Reply to group project WhatsApp messages',
    quadrant: 'Q3',
    estimatedMinutes: 15,
    completedPomodoros: 0,
    targetPomodoros: 1,
    category: 'Communication',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 't-4',
    title: 'Organize study desk folders and stationery',
    quadrant: 'Q4',
    estimatedMinutes: 30,
    completedPomodoros: 0,
    targetPomodoros: 1,
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

  const [tasks, setTasks] = useState<PriorityTask[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_TASKS;
    try {
      const stored = localStorage.getItem('nyxa_eisenhower_tasks');
      return stored ? JSON.parse(stored) : DEFAULT_TASKS;
    } catch {
      return DEFAULT_TASKS;
    }
  });
  const [viewMode, setViewMode] = useState<'matrix' | 'list'>('matrix');

  // Drag and Drop State
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [activeDropTarget, setActiveDropTarget] = useState<EisenhowerQuadrant | null>(null);

  // Pomodoro Timer State
  const [selectedTaskForPomo, setSelectedTaskForPomo] = useState<PriorityTask | null>(null);
  const [pomoMode, setPomoMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [pomoTimeLeft, setPomoTimeLeft] = useState<number>(25 * 60);
  const [isPomoRunning, setIsPomoRunning] = useState<boolean>(false);
  const [showPomoModal, setShowPomoModal] = useState<boolean>(false);

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

  const saveTasks = (updated: PriorityTask[]) => {
    setTasks(updated);
    try {
      localStorage.setItem('nyxa_eisenhower_tasks', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save tasks', e);
    }
  };

  // POMODORO TIMER TICKER
  useEffect(() => {
    if (!isPomoRunning) return;
    const timer = setInterval(() => {
      setPomoTimeLeft((prev) => {
        if (prev <= 1) {
          setIsPomoRunning(false);
          if (pomoMode === 'work' && selectedTaskForPomo) {
            setTasks((currTasks) => {
              const updated = currTasks.map((t) =>
                t.id === selectedTaskForPomo.id
                  ? { ...t, completedPomodoros: t.completedPomodoros + 1 }
                  : t
              );
              try {
                localStorage.setItem('nyxa_eisenhower_tasks', JSON.stringify(updated));
              } catch {}
              return updated;
            });
            setTimeout(() => alert(`🍅 Pomodoro Finished for task: "${selectedTaskForPomo.title}"! Take a break.`), 50);
          } else {
            setTimeout(() => alert('☕ Break Session Completed! Ready to get back to work?'), 50);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPomoRunning, pomoMode, selectedTaskForPomo]);

  const handleStartPomoForTask = (task: PriorityTask) => {
    setSelectedTaskForPomo(task);
    setPomoMode('work');
    setPomoTimeLeft(25 * 60);
    setIsPomoRunning(true);
    setShowPomoModal(true);
  };

  const switchPomoMode = (mode: 'work' | 'shortBreak' | 'longBreak') => {
    setPomoMode(mode);
    setIsPomoRunning(false);
    if (mode === 'work') setPomoTimeLeft(25 * 60);
    else if (mode === 'shortBreak') setPomoTimeLeft(5 * 60);
    else if (mode === 'longBreak') setPomoTimeLeft(15 * 60);
  };

  // DRAG AND DROP HANDLERS
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedTaskId(id);
  };

  const handleDragOver = (e: React.DragEvent, qCode: EisenhowerQuadrant) => {
    e.preventDefault();
    if (activeDropTarget !== qCode) {
      setActiveDropTarget(qCode);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setActiveDropTarget(null);
  };

  const handleDrop = (e: React.DragEvent, targetQuadrant: EisenhowerQuadrant) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (id) {
      moveTaskQuadrant(id, targetQuadrant);
    }
    setDraggedTaskId(null);
    setActiveDropTarget(null);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const mins = Number(taskMinutes) || 30;
    const newTask: PriorityTask = {
      id: `task-${Date.now()}`,
      title: taskTitle.trim(),
      quadrant: taskQuadrant,
      estimatedMinutes: mins,
      completedPomodoros: 0,
      targetPomodoros: Math.max(1, Math.ceil(mins / 25)),
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

  // CSV EXPORT HANDLER
  const handleExportCSV = () => {
    let csv = `ID,Task Title,Quadrant,Estimated Minutes,Completed Pomodoros,Target Pomodoros,Category,Status,Notes,CreatedAt\n`;
    tasks.forEach((t) => {
      csv += `"${t.id}","${t.title.replace(/"/g, '""')}","${t.quadrant}",${t.estimatedMinutes},${t.completedPomodoros},${t.targetPomodoros},"${t.category}","${t.completed ? 'Completed' : 'Pending'}","${(t.notes || '').replace(/"/g, '""')}","${t.createdAt}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Eisenhower_Tasks_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper formatting for duration (e.g. 90m -> 1h 30m)
  const formatDuration = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    const remainder = mins % 60;
    return remainder > 0 ? `${hrs}h ${remainder}m` : `${hrs}h`;
  };

  const formatClockSeconds = (secTotal: number) => {
    const mins = Math.floor(secTotal / 60);
    const secs = secTotal % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getSumMinutes = (taskList: PriorityTask[]) =>
    taskList.reduce((acc, t) => acc + (t.completed ? 0 : t.estimatedMinutes), 0);

  // Time-Block Schedule Generator
  const suggestedSchedule = useMemo(() => {
    if (!showScheduleModal) return [];
    const activeTasks = tasks.filter((t) => !t.completed);
    if (activeTasks.length === 0) {
      return [];
    }

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

    return blocks;
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
              Eisenhower Task Sorter & Focus Timer
            </h1>
          </div>
          <p className="text-sm text-[var(--muted)] mt-1">
            Drag-and-drop quadrant shifting, integrated Pomodoro focus timer, CSV export, and time blocks.
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
              4-Quadrant Drag-Drop
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
            onClick={() => setShowPomoModal(true)}
            className="nyxa-btn nyxa-btn-secondary text-xs flex items-center gap-1.5"
          >
            🍅 Pomodoro Focus ({formatClockSeconds(pomoTimeLeft)})
          </button>

          <button
            onClick={handleExportCSV}
            className="nyxa-btn nyxa-btn-secondary text-xs flex items-center gap-1.5"
          >
            📁 Export CSV
          </button>

          <button
            onClick={() => setShowScheduleModal(true)}
            className="nyxa-btn nyxa-btn-secondary text-xs flex items-center gap-1.5"
          >
            📅 Time Blocks
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="nyxa-btn nyxa-btn-primary text-xs flex items-center gap-1.5"
          >
            + Add Task
          </button>
        </div>
      </div>

      {/* Quick Summary Cards */}
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
                <span className="text-xs text-[var(--muted)] ml-1">pending</span>
              </div>
              <div className="text-[11px] text-[var(--muted)] font-mono">
                Workload: {formatDuration(qMins)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Workload Banner */}
      <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--secondary-bg)] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[var(--foreground)]">Total Active Workload:</span>
          <span className="font-mono font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
            {formatDuration(totalWorkloadMinutes)}
          </span>
          <span className="text-[var(--muted)]">across {tasks.filter((t) => !t.completed).length} pending task(s)</span>
        </div>
        <span className="text-[var(--muted)] hidden sm:inline">
          💡 Drag & drop any task card to move it between matrix quadrants.
        </span>
      </div>

      {/* 4-Quadrant Drag and Drop Matrix */}
      {viewMode === 'matrix' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {(['Q1', 'Q2', 'Q3', 'Q4'] as EisenhowerQuadrant[]).map((qCode) => {
            const meta = QUADRANT_META[qCode];
            const qTasks = tasks.filter((t) => t.quadrant === qCode);
            const isTarget = activeDropTarget === qCode;

            return (
              <div
                key={qCode}
                onDragOver={(e) => handleDragOver(e, qCode)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, qCode)}
                className={`nyxa-card ${meta.borderStyle} space-y-3 bg-[var(--card-bg)] min-h-[300px] transition-all duration-200 ${
                  isTarget ? 'ring-2 ring-emerald-500 bg-emerald-500/5 border-emerald-500' : ''
                }`}
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
                    +
                  </button>
                </div>

                {/* Tasks List */}
                <div className="space-y-2 flex-grow">
                  {qTasks.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center py-10 text-center text-[var(--muted)] border-2 border-dashed border-[var(--border)] rounded-lg">
                      <span className="text-xs">Drop tasks here to move to {meta.code}</span>
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
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        className={`p-3 rounded-lg border border-[var(--border)] bg-[var(--secondary-bg)] space-y-2 transition-all cursor-grab active:cursor-grabbing hover:border-[var(--accent)] ${
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

                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[var(--card-bg)] border border-[var(--border)] text-[var(--foreground)]">
                              ⏱ {formatDuration(task.estimatedMinutes)}
                            </span>
                          </div>
                        </div>

                        {/* Card Controls & Pomodoro Attachment */}
                        <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-[var(--muted)] px-1.5 py-0.5 rounded bg-[var(--card-bg)] border border-[var(--border)]">
                              {task.category}
                            </span>
                            <span className="text-[10px] font-mono text-amber-600 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
                              🍅 {task.completedPomodoros}/{task.targetPomodoros || 1}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleStartPomoForTask(task)}
                              className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-600 border border-amber-500/40 hover:bg-amber-500/30 transition-colors"
                              title="Start Pomodoro Timer for this task"
                            >
                              Focus 🍅
                            </button>

                            <button
                              onClick={() => deleteTask(task.id)}
                              className="p-1 text-gray-400 hover:text-red-500 ml-1"
                              title="Delete task"
                            >
                              ✕
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
                  <th>Pomodoros</th>
                  <th>Category</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-[var(--muted)]">
                      No tasks found. Click &quot;+ Add Task&quot; to get started.
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
                        <td className="font-mono text-xs text-amber-600 font-bold">
                          🍅 {t.completedPomodoros} / {t.targetPomodoros || 1}
                        </td>
                        <td>
                          <span className="text-xs text-[var(--muted)]">{t.category}</span>
                        </td>
                        <td className="text-right">
                          <button
                            onClick={() => handleStartPomoForTask(t)}
                            className="p-1 text-amber-600 hover:bg-amber-500/10 rounded mr-1"
                            title="Start Pomodoro"
                          >
                            🍅
                          </button>
                          <button
                            onClick={() => deleteTask(t.id)}
                            className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                          >
                            ✕
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

      {/* Pomodoro Focus Timer Modal */}
      {showPomoModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="nyxa-card max-w-md w-full text-center space-y-6 p-6">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
                🍅 Pomodoro Focus Timer
              </span>
              <button
                onClick={() => setShowPomoModal(false)}
                className="text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                ✕
              </button>
            </div>

            {selectedTaskForPomo && (
              <div className="p-3 rounded-lg bg-[var(--secondary-bg)] border border-[var(--border)] text-left">
                <span className="text-[10px] text-[var(--muted)] uppercase font-bold block">Active Focus Task:</span>
                <span className="font-bold text-sm text-[var(--foreground)] block">{selectedTaskForPomo.title}</span>
                <span className="text-xs text-amber-600 font-mono font-bold block mt-0.5">
                  Completed: {selectedTaskForPomo.completedPomodoros} / {selectedTaskForPomo.targetPomodoros} Pomodoros
                </span>
              </div>
            )}

            {/* Mode Switcher */}
            <div className="flex justify-center gap-2">
              <button
                onClick={() => switchPomoMode('work')}
                className={`px-3 py-1 text-xs font-bold rounded-lg border transition-colors ${
                  pomoMode === 'work' ? 'bg-amber-500 text-white border-amber-600' : 'bg-[var(--secondary-bg)] text-[var(--muted)]'
                }`}
              >
                Focus (25m)
              </button>
              <button
                onClick={() => switchPomoMode('shortBreak')}
                className={`px-3 py-1 text-xs font-bold rounded-lg border transition-colors ${
                  pomoMode === 'shortBreak' ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-[var(--secondary-bg)] text-[var(--muted)]'
                }`}
              >
                Short Break (5m)
              </button>
              <button
                onClick={() => switchPomoMode('longBreak')}
                className={`px-3 py-1 text-xs font-bold rounded-lg border transition-colors ${
                  pomoMode === 'longBreak' ? 'bg-blue-500 text-white border-blue-600' : 'bg-[var(--secondary-bg)] text-[var(--muted)]'
                }`}
              >
                Long Break (15m)
              </button>
            </div>

            {/* Clock Timer Display */}
            <div className="py-6 my-2 rounded-2xl bg-[var(--secondary-bg)] border border-[var(--border)]">
              <span className="text-6xl font-black font-mono tracking-tight text-[var(--foreground)] block">
                {formatClockSeconds(pomoTimeLeft)}
              </span>
              <span className="text-xs uppercase tracking-widest text-[var(--muted)] block mt-2 font-bold">
                {pomoMode === 'work' ? '🔥 Focus Time' : '☕ Rest Break'}
              </span>
            </div>

            {/* Play/Pause Controls */}
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setIsPomoRunning(!isPomoRunning)}
                className={`px-6 py-2.5 text-sm font-bold rounded-xl shadow-lg transition-all ${
                  isPomoRunning
                    ? 'bg-amber-600 text-white hover:bg-amber-700'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {isPomoRunning ? 'Pause Timer' : 'Start Focus Session'}
              </button>
              <button
                onClick={() => {
                  setIsPomoRunning(false);
                  switchPomoMode(pomoMode);
                }}
                className="nyxa-btn nyxa-btn-secondary text-xs"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="nyxa-card max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <h2 className="text-lg font-bold border-0 p-0 m-0">Add Eisenhower Task</h2>
              <button onClick={() => setShowAddModal(false)} className="text-[var(--muted)] hover:text-[var(--foreground)]">
                ✕
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
                    <option value="Q3">Q3: Urgent & Not Important (Delegate)</option>
                    <option value="Q4">Q4: Low Priority (Eliminate)</option>
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
                    <option value={25}>25 Mins (1 Pomodoro)</option>
                    <option value={45}>45 Minutes</option>
                    <option value={50}>50 Mins (2 Pomodoros)</option>
                    <option value={90}>1.5 Hours (90m)</option>
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
              <button onClick={() => setShowScheduleModal(false)} className="text-[var(--muted)] hover:text-[var(--foreground)]">
                ✕
              </button>
            </div>

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
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border inline-block mt-0.5 ${quadMeta.badgeStyle}`}>
                                {quadMeta.code}: {quadMeta.actionLabel}
                              </span>
                            )}
                          </div>
                        </div>

                        <span className="font-mono text-xs font-semibold text-[var(--muted)]">
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
