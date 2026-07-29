'use client';

import React, { useState, useEffect, useId } from 'react';

export interface ExamItem {
  id: string;
  subject: string;
  title: string;
  examDate: string; // ISO date format YYYY-MM-DDTHH:mm
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
  dueDate: string; // ISO format YYYY-MM-DDTHH:mm
  subtasks: SubTask[];
  notes?: string;
  createdAt: string;
}

const DEFAULT_EXAMS: ExamItem[] = [
  {
    id: 'exam-1',
    subject: 'Physics',
    title: 'Mid-Term Board Mock Exam',
    examDate: new Date(Date.now() + 5 * 86400000 + 3600000 * 4).toISOString().slice(0, 16),
    syllabus: 'Electrostatics, Magnetism, Optics',
  },
  {
    id: 'exam-2',
    subject: 'Mathematics',
    title: 'Calculus Unit Test',
    examDate: new Date(Date.now() + 12 * 86400000).toISOString().slice(0, 16),
    syllabus: 'Integration, Differential Equations',
  },
];

const DEFAULT_HOMEWORK: HomeworkItem[] = [
  {
    id: 'hw-1',
    title: 'Complete NCERT Exercise 4.2 & 4.3',
    subject: 'Mathematics',
    priority: 'High',
    status: 'To Do',
    dueDate: new Date(Date.now() + 86400000 * 1.5).toISOString().slice(0, 16),
    subtasks: [
      { id: 'st-1', text: 'Solve questions 1-10', done: true },
      { id: 'st-2', text: 'Solve word problems 11-15', done: false },
    ],
    notes: 'Focus on integration by parts formulas.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'hw-2',
    title: 'Lab Manual Experiment #5 Write-up',
    subject: 'Chemistry',
    priority: 'Medium',
    status: 'In Progress',
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16),
    subtasks: [
      { id: 'st-3', text: 'Record observation tables', done: true },
      { id: 'st-4', text: 'Draw titration curve chart', done: false },
    ],
    notes: 'Include safety precautions.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'hw-3',
    title: 'Read Chapter 3 on Macroeconomics',
    subject: 'Economics',
    priority: 'Low',
    status: 'Completed',
    dueDate: new Date(Date.now() - 86400000 * 0.5).toISOString().slice(0, 16),
    subtasks: [{ id: 'st-5', text: 'Make key point notes', done: true }],
    notes: 'Done!',
    createdAt: new Date().toISOString(),
  },
];

const SUBJECT_COLORS: Record<string, string> = {
  Mathematics: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  Physics: 'bg-purple-500/10 text-purple-600 border-purple-500/30',
  Chemistry: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  Biology: 'bg-green-500/10 text-green-600 border-green-500/30',
  English: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  'Computer Science': 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30',
  History: 'bg-rose-500/10 text-rose-600 border-rose-500/30',
  Economics: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30',
};

export default function HomeworkTracker() {
  const searchFilterId = useId();
  const statusFilterId = useId();
  const priorityFilterId = useId();
  const subjectFilterId = useId();
  const hwTitleId = useId();
  const hwSubjectId = useId();
  const hwPriorityId = useId();
  const hwDueDateId = useId();

  const [exams, setExams] = useState<ExamItem[]>([]);
  const [homeworks, setHomeworks] = useState<HomeworkItem[]>([]);
  const [now, setNow] = useState<Date>(new Date());

  // Filter state
  const [filterSubject, setFilterSubject] = useState<string>('All');
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [showAddHwModal, setShowAddHwModal] = useState(false);
  const [showAddExamModal, setShowAddExamModal] = useState(false);
  const [showSchedulePrintModal, setShowSchedulePrintModal] = useState(false);

  // Form State - Homework
  const [newHwTitle, setNewHwTitle] = useState('');
  const [newHwSubject, setNewHwSubject] = useState('Mathematics');
  const [newHwPriority, setNewHwPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [newHwDueDate, setNewHwDueDate] = useState('');
  const [newHwNotes, setNewHwNotes] = useState('');
  const [newSubtaskInput, setNewSubtaskInput] = useState('');
  const [tempSubtasks, setTempSubtasks] = useState<string[]>([]);

  // Form State - Exam
  const [newExamSubject, setNewExamSubject] = useState('Physics');
  const [newExamTitle, setNewExamTitle] = useState('');
  const [newExamDate, setNewExamDate] = useState('');
  const [newExamSyllabus, setNewExamSyllabus] = useState('');

  // Load from local storage
  useEffect(() => {
    try {
      const storedHw = localStorage.getItem('nyxa_homework_items');
      const storedExams = localStorage.getItem('nyxa_exam_items');

      if (storedHw) {
        setHomeworks(JSON.parse(storedHw));
      } else {
        setHomeworks(DEFAULT_HOMEWORK);
      }

      if (storedExams) {
        setExams(JSON.parse(storedExams));
      } else {
        setExams(DEFAULT_EXAMS);
      }
    } catch (e) {
      console.error('Local storage read error', e);
      setHomeworks(DEFAULT_HOMEWORK);
      setExams(DEFAULT_EXAMS);
    }
  }, []);

  // Update clock ticker for countdowns
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Save changes to localStorage
  const saveHomeworks = (updated: HomeworkItem[]) => {
    setHomeworks(updated);
    try {
      localStorage.setItem('nyxa_homework_items', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save homeworks', e);
    }
  };

  const saveExams = (updated: ExamItem[]) => {
    setExams(updated);
    try {
      localStorage.setItem('nyxa_exam_items', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save exams', e);
    }
  };

  // Add Homework Handler
  const handleCreateHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHwTitle.trim()) return;

    const item: HomeworkItem = {
      id: `hw-${Date.now()}`,
      title: newHwTitle.trim(),
      subject: newHwSubject,
      priority: newHwPriority,
      status: 'To Do',
      dueDate: newHwDueDate || new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16),
      subtasks: tempSubtasks.map((txt, idx) => ({ id: `st-${Date.now()}-${idx}`, text: txt, done: false })),
      notes: newHwNotes,
      createdAt: new Date().toISOString(),
    };

    saveHomeworks([item, ...homeworks]);
    setNewHwTitle('');
    setNewHwNotes('');
    setTempSubtasks([]);
    setShowAddHwModal(false);
  };

  // Add Exam Handler
  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamTitle.trim()) return;

    const item: ExamItem = {
      id: `exam-${Date.now()}`,
      subject: newExamSubject,
      title: newExamTitle.trim(),
      examDate: newExamDate || new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 16),
      syllabus: newExamSyllabus,
    };

    saveExams([...exams, item]);
    setNewExamTitle('');
    setNewExamSyllabus('');
    setShowAddExamModal(false);
  };

  // Delete Handlers
  const deleteHomework = (id: string) => {
    saveHomeworks(homeworks.filter((h) => h.id !== id));
  };

  const deleteExam = (id: string) => {
    saveExams(exams.filter((e) => e.id !== id));
  };

  // Status Change
  const updateHwStatus = (id: string, status: HomeworkItem['status']) => {
    saveHomeworks(homeworks.map((h) => (h.id === id ? { ...h, status } : h)));
  };

  // Toggle Subtask
  const toggleSubtask = (hwId: string, subtaskId: string) => {
    saveHomeworks(
      homeworks.map((h) => {
        if (h.id === hwId) {
          const updatedSt = h.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, done: !st.done } : st
          );
          // If all subtasks are done, auto mark completed if desired
          return { ...h, subtasks: updatedSt };
        }
        return h;
      })
    );
  };

  // Calculate remaining time string & badge
  const getRemainingTimeBadge = (dueDateStr: string, status: string) => {
    if (status === 'Completed') {
      return <span className="text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/30">Completed</span>;
    }

    const due = new Date(dueDateStr).getTime();
    const diffMs = due - now.getTime();

    if (diffMs <= 0) {
      const pastDays = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60 * 24));
      return (
        <span className="text-xs font-semibold text-red-600 bg-red-500/10 px-2.5 py-0.5 rounded border border-red-500/30 animate-pulse">
          Overdue {pastDays > 0 ? `${pastDays}d` : 'recently'}
        </span>
      );
    }

    const hoursLeft = Math.floor(diffMs / (1000 * 60 * 60));
    const daysLeft = Math.floor(hoursLeft / 24);

    if (daysLeft === 0) {
      return (
        <span className="text-xs font-semibold text-amber-600 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/30">
          Due Today ({hoursLeft}h left)
        </span>
      );
    } else if (daysLeft === 1) {
      return (
        <span className="text-xs font-semibold text-amber-600 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/30">
          Due Tomorrow
        </span>
      );
    }

    return (
      <span className="text-xs font-semibold text-[var(--muted)] bg-[var(--secondary-bg)] px-2.5 py-0.5 rounded border border-[var(--border)]">
        In {daysLeft} days
      </span>
    );
  };

  // Exam Countdown formatter
  const getExamCountdown = (examDateStr: string) => {
    const target = new Date(examDateStr).getTime();
    const diffMs = target - now.getTime();

    if (diffMs <= 0) {
      return { days: 0, hours: 0, mins: 0, secs: 0, isPast: true };
    }

    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    return { days, hours, mins, secs, isPast: false };
  };

  // Nearest upcoming exam
  const sortedExams = [...exams].sort(
    (a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime()
  );
  const nextExam = sortedExams.find((e) => new Date(e.examDate).getTime() > now.getTime()) || sortedExams[0];

  // Filtering assignments
  const filteredHomeworks = homeworks.filter((item) => {
    if (filterSubject !== 'All' && item.subject !== filterSubject) return false;
    if (filterPriority !== 'All' && item.priority !== filterPriority) return false;
    if (filterStatus !== 'All' && item.status !== filterStatus) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSub = item.subject.toLowerCase().includes(q);
      const matchNotes = (item.notes || '').toLowerCase().includes(q);
      if (!matchTitle && !matchSub && !matchNotes) return false;
    }
    return true;
  });

  // Unique subjects for filter
  const subjectsList = Array.from(new Set(homeworks.map((h) => h.subject)));

  // Print schedule triggering
  const handlePrintSchedule = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-[var(--secondary-bg)] border border-[var(--border)] text-[var(--foreground)]">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </span>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--foreground)]">
              Homework & Assignment Tracker
            </h1>
          </div>
          <p className="text-sm text-[var(--muted)] mt-1">
            Track pending assignments, upcoming exam countdowns, priorities, and study schedules.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowSchedulePrintModal(true)}
            className="nyxa-btn nyxa-btn-secondary text-xs flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Study Schedule
          </button>
          <button
            onClick={() => setShowAddExamModal(true)}
            className="nyxa-btn nyxa-btn-secondary text-xs flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            + Add Exam
          </button>
          <button
            onClick={() => setShowAddHwModal(true)}
            className="nyxa-btn nyxa-btn-primary text-xs flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            + Add Assignment
          </button>
        </div>
      </div>

      {/* Exam Countdown Banner */}
      {nextExam && (
        <div className="nyxa-card border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-500/5 via-[var(--card-bg)] to-[var(--card-bg)] p-4 md:p-5 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold bg-amber-500/20 text-amber-600">
                  Target Exam Countdown
                </span>
                <span className="text-xs font-semibold text-[var(--muted)]">
                  {nextExam.subject}
                </span>
              </div>
              <h2 className="text-xl font-bold text-[var(--foreground)] border-0 p-0 m-0">
                {nextExam.title}
              </h2>
              {nextExam.syllabus && (
                <p className="text-xs text-[var(--muted)] m-0">
                  Syllabus: {nextExam.syllabus}
                </p>
              )}
            </div>

            {/* Timer Ticker Box */}
            {(() => {
              const cd = getExamCountdown(nextExam.examDate);
              return (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 font-mono text-center">
                    <div className="bg-[var(--secondary-bg)] border border-[var(--border)] px-3 py-1.5 rounded-lg min-w-[55px]">
                      <span className="text-xl font-bold text-[var(--foreground)] block">
                        {String(cd.days).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] text-[var(--muted)] uppercase block">Days</span>
                    </div>
                    <span className="text-lg font-bold text-[var(--muted)]">:</span>
                    <div className="bg-[var(--secondary-bg)] border border-[var(--border)] px-3 py-1.5 rounded-lg min-w-[55px]">
                      <span className="text-xl font-bold text-[var(--foreground)] block">
                        {String(cd.hours).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] text-[var(--muted)] uppercase block">Hrs</span>
                    </div>
                    <span className="text-lg font-bold text-[var(--muted)]">:</span>
                    <div className="bg-[var(--secondary-bg)] border border-[var(--border)] px-3 py-1.5 rounded-lg min-w-[55px]">
                      <span className="text-xl font-bold text-[var(--foreground)] block">
                        {String(cd.mins).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] text-[var(--muted)] uppercase block">Mins</span>
                    </div>
                    <span className="text-lg font-bold text-[var(--muted)]">:</span>
                    <div className="bg-[var(--secondary-bg)] border border-[var(--border)] px-3 py-1.5 rounded-lg min-w-[55px]">
                      <span className="text-xl font-bold text-amber-600 block">
                        {String(cd.secs).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] text-[var(--muted)] uppercase block">Secs</span>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteExam(nextExam.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors ml-2"
                    title="Dismiss or delete exam"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Filter and Stats Toolbar */}
      <div className="nyxa-card space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search */}
          <div>
            <label htmlFor={searchFilterId} className="nyxa-label">Search</label>
            <input
              id={searchFilterId}
              type="text"
              className="nyxa-input text-xs"
              placeholder="Search assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Subject Filter */}
          <div>
            <label htmlFor={subjectFilterId} className="nyxa-label">Subject Filter</label>
            <select
              id={subjectFilterId}
              className="nyxa-select text-xs"
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
            >
              <option value="All">All Subjects ({homeworks.length})</option>
              {subjectsList.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label htmlFor={priorityFilterId} className="nyxa-label">Priority Filter</label>
            <select
              id={priorityFilterId}
              className="nyxa-select text-xs"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="All">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor={statusFilterId} className="nyxa-label">Status Filter</label>
            <select
              id={statusFilterId}
              className="nyxa-select text-xs"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--foreground)] border-0 p-0 m-0">
            Assignments ({filteredHomeworks.length})
          </h2>
          <span className="text-xs text-[var(--muted)]">
            Showing filtered tasks
          </span>
        </div>

        {filteredHomeworks.length === 0 ? (
          <div className="nyxa-card py-12 text-center text-[var(--muted)] space-y-2">
            <svg className="w-10 h-10 mx-auto opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm font-medium">No homework or assignments match your current filter.</p>
            <button
              onClick={() => setShowAddHwModal(true)}
              className="nyxa-btn nyxa-btn-secondary text-xs inline-flex items-center gap-1 mt-2"
            >
              Add New Assignment
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredHomeworks.map((hw) => {
              const completedSubtasks = hw.subtasks.filter((st) => st.done).length;
              const totalSubtasks = hw.subtasks.length;
              const subtaskProgress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;
              const badgeStyle = SUBJECT_COLORS[hw.subject] || 'bg-gray-500/10 text-gray-600 border-gray-500/30';

              return (
                <div
                  key={hw.id}
                  className={`nyxa-card justify-between space-y-3 transition-all ${
                    hw.status === 'Completed' ? 'opacity-75 bg-[var(--secondary-bg)]/40' : ''
                  }`}
                >
                  <div className="space-y-2">
                    {/* Top Meta Header */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${badgeStyle}`}>
                          {hw.subject}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                            hw.priority === 'High'
                              ? 'bg-red-500/10 text-red-600 border-red-500/30'
                              : hw.priority === 'Medium'
                              ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                              : 'bg-blue-500/10 text-blue-600 border-blue-500/30'
                          }`}
                        >
                          {hw.priority}
                        </span>
                      </div>

                      {getRemainingTimeBadge(hw.dueDate, hw.status)}
                    </div>

                    {/* Title */}
                    <h3
                      className={`text-base font-bold text-[var(--foreground)] m-0 ${
                        hw.status === 'Completed' ? 'line-through text-[var(--muted)]' : ''
                      }`}
                    >
                      {hw.title}
                    </h3>

                    {/* Notes */}
                    {hw.notes && (
                      <p className="text-xs text-[var(--muted)] line-clamp-2 m-0">
                        {hw.notes}
                      </p>
                    )}

                    {/* Subtasks Progress Bar & Checklist */}
                    {totalSubtasks > 0 && (
                      <div className="pt-2 space-y-2 border-t border-[var(--border)]">
                        <div className="flex items-center justify-between text-[11px] text-[var(--muted)]">
                          <span>Subtasks checklist</span>
                          <span className="font-mono font-semibold">
                            {completedSubtasks}/{totalSubtasks} ({Math.round(subtaskProgress)}%)
                          </span>
                        </div>

                        <div className="w-full h-1.5 bg-[var(--secondary-bg)] rounded-full overflow-hidden border border-[var(--border)]">
                          <div
                            className="h-full bg-emerald-500 transition-all duration-300"
                            style={{ width: `${subtaskProgress}%` }}
                          />
                        </div>

                        <div className="space-y-1 pt-1">
                          {hw.subtasks.map((st) => (
                            <label
                              key={st.id}
                              className="flex items-center gap-2 text-xs text-[var(--foreground)] cursor-pointer hover:bg-[var(--secondary-bg)] p-1 rounded"
                            >
                              <input
                                type="checkbox"
                                className="w-3.5 h-3.5 rounded accent-emerald-600 cursor-pointer"
                                checked={st.done}
                                onChange={() => toggleSubtask(hw.id, st.id)}
                              />
                              <span className={st.done ? 'line-through text-[var(--muted)]' : ''}>
                                {st.text}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Controls */}
                  <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      {(['To Do', 'In Progress', 'Completed'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => updateHwStatus(hw.id, st)}
                          className={`px-2 py-1 text-[10px] font-semibold rounded border transition-colors ${
                            hw.status === st
                              ? 'bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)]'
                              : 'bg-[var(--secondary-bg)] text-[var(--muted)] border-[var(--border)] hover:text-[var(--foreground)]'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => deleteHomework(hw.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete assignment"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Homework Modal */}
      {showAddHwModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="nyxa-card max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <h2 className="text-lg font-bold border-0 p-0 m-0">Add Homework / Assignment</h2>
              <button
                onClick={() => setShowAddHwModal(false)}
                className="p-1 text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateHomework} className="space-y-4">
              <div>
                <label htmlFor={hwTitleId} className="nyxa-label">Assignment Title *</label>
                <input
                  id={hwTitleId}
                  type="text"
                  required
                  className="nyxa-input"
                  placeholder="e.g., Read Physics Chapter 4"
                  value={newHwTitle}
                  onChange={(e) => setNewHwTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor={hwSubjectId} className="nyxa-label">Subject</label>
                  <select
                    id={hwSubjectId}
                    className="nyxa-select"
                    value={newHwSubject}
                    onChange={(e) => setNewHwSubject(e.target.value)}
                  >
                    {['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Computer Science', 'History', 'Economics'].map(
                      (s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label htmlFor={hwPriorityId} className="nyxa-label">Priority</label>
                  <select
                    id={hwPriorityId}
                    className="nyxa-select"
                    value={newHwPriority}
                    onChange={(e) => setNewHwPriority(e.target.value as any)}
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor={hwDueDateId} className="nyxa-label">Due Date & Time</label>
                <input
                  id={hwDueDateId}
                  type="datetime-local"
                  className="nyxa-input"
                  value={newHwDueDate}
                  onChange={(e) => setNewHwDueDate(e.target.value)}
                />
              </div>

              {/* Subtask input helper */}
              <div>
                <label className="nyxa-label">Subtasks / Checklist (Optional)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="nyxa-input text-xs"
                    placeholder="Add step/subtask..."
                    value={newSubtaskInput}
                    onChange={(e) => setNewSubtaskInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newSubtaskInput.trim()) {
                          setTempSubtasks([...tempSubtasks, newSubtaskInput.trim()]);
                          setNewSubtaskInput('');
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newSubtaskInput.trim()) {
                        setTempSubtasks([...tempSubtasks, newSubtaskInput.trim()]);
                        setNewSubtaskInput('');
                      }
                    }}
                    className="nyxa-btn nyxa-btn-secondary text-xs shrink-0"
                  >
                    + Add
                  </button>
                </div>

                {tempSubtasks.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {tempSubtasks.map((st, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between text-xs p-1.5 rounded bg-[var(--secondary-bg)] border border-[var(--border)]"
                      >
                        <span>{st}</span>
                        <button
                          type="button"
                          onClick={() => setTempSubtasks(tempSubtasks.filter((_, i) => i !== idx))}
                          className="text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <label className="nyxa-label">Notes & Instructions</label>
                <textarea
                  className="nyxa-textarea text-xs"
                  rows={2}
                  placeholder="Additional notes or references..."
                  value={newHwNotes}
                  onChange={(e) => setNewHwNotes(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setShowAddHwModal(false)}
                  className="nyxa-btn nyxa-btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="nyxa-btn nyxa-btn-primary text-xs">
                  Save Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Exam Modal */}
      {showAddExamModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="nyxa-card max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <h2 className="text-lg font-bold border-0 p-0 m-0">Add Target Exam</h2>
              <button
                onClick={() => setShowAddExamModal(false)}
                className="p-1 text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateExam} className="space-y-4">
              <div>
                <label className="nyxa-label">Exam Title *</label>
                <input
                  type="text"
                  required
                  className="nyxa-input"
                  placeholder="e.g. Physics Mid-Term Mock"
                  value={newExamTitle}
                  onChange={(e) => setNewExamTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="nyxa-label">Subject</label>
                <input
                  type="text"
                  className="nyxa-input"
                  placeholder="e.g. Physics"
                  value={newExamSubject}
                  onChange={(e) => setNewExamSubject(e.target.value)}
                />
              </div>

              <div>
                <label className="nyxa-label">Exam Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  className="nyxa-input"
                  value={newExamDate}
                  onChange={(e) => setNewExamDate(e.target.value)}
                />
              </div>

              <div>
                <label className="nyxa-label">Syllabus / Topics</label>
                <textarea
                  className="nyxa-textarea text-xs"
                  rows={2}
                  placeholder="e.g. Chapters 1-5, Optics, Waves"
                  value={newExamSyllabus}
                  onChange={(e) => setNewExamSyllabus(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setShowAddExamModal(false)}
                  className="nyxa-btn nyxa-btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="nyxa-btn nyxa-btn-primary text-xs">
                  Create Exam Timer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Study Schedule Modal */}
      {showSchedulePrintModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="nyxa-card max-w-3xl w-full max-h-[90vh] overflow-y-auto space-y-6 bg-white text-black dark:bg-zinc-950 dark:text-white">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div>
                <h2 className="text-xl font-bold border-0 p-0 m-0">Printable Study Schedule</h2>
                <p className="text-xs text-[var(--muted)] m-0">Organized view of assignments & exams for printing</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintSchedule}
                  className="nyxa-btn nyxa-btn-primary text-xs flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print / Save PDF
                </button>
                <button
                  onClick={() => setShowSchedulePrintModal(false)}
                  className="p-1 text-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Print Content Area */}
            <div className="space-y-6">
              {/* Upcoming Exams Section */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-amber-600 border-b pb-1">
                  Target Exams & Mock Tests
                </h3>
                {exams.length === 0 ? (
                  <p className="text-xs text-[var(--muted)]">No exams scheduled.</p>
                ) : (
                  <table className="nyxa-table w-full text-xs">
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Exam Title</th>
                        <th>Date & Time</th>
                        <th>Syllabus</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exams.map((ex) => (
                        <tr key={ex.id}>
                          <td className="font-bold">{ex.subject}</td>
                          <td>{ex.title}</td>
                          <td className="font-mono">
                            {new Date(ex.examDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                          </td>
                          <td className="text-[var(--muted)]">{ex.syllabus || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Pending Homework Section */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-blue-600 border-b pb-1">
                  Pending Assignments & Tasks
                </h3>
                {homeworks.filter((h) => h.status !== 'Completed').length === 0 ? (
                  <p className="text-xs text-[var(--muted)]">All assignments completed!</p>
                ) : (
                  <table className="nyxa-table w-full text-xs">
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Assignment</th>
                        <th>Priority</th>
                        <th>Due Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {homeworks
                        .filter((h) => h.status !== 'Completed')
                        .map((hw) => (
                          <tr key={hw.id}>
                            <td className="font-bold">{hw.subject}</td>
                            <td>{hw.title}</td>
                            <td className="font-semibold">{hw.priority}</td>
                            <td className="font-mono">
                              {new Date(hw.dueDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                            </td>
                            <td>{hw.status}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
