'use client';

import { useState, useEffect, useId } from 'react';

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
  estimatedMinutes?: number;
  subtasks: SubTask[];
  notes?: string;
  createdAt: string;
  completedAt?: string; // YYYY-MM-DD string for streak tracking
  reminderOffsetMinutes?: number; // e.g., 60 for 1 hour before
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
    estimatedMinutes: 60,
    subtasks: [
      { id: 'st-1', text: 'Solve questions 1-10', done: true },
      { id: 'st-2', text: 'Solve word problems 11-15', done: false },
    ],
    notes: 'Focus on integration by parts formulas.',
    createdAt: new Date().toISOString(),
    reminderOffsetMinutes: 60,
  },
  {
    id: 'hw-2',
    title: 'Lab Manual Experiment #5 Write-up',
    subject: 'Chemistry',
    priority: 'Medium',
    status: 'In Progress',
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16),
    estimatedMinutes: 45,
    subtasks: [
      { id: 'st-3', text: 'Record observation tables', done: true },
      { id: 'st-4', text: 'Draw titration curve chart', done: false },
    ],
    notes: 'Include safety precautions.',
    createdAt: new Date().toISOString(),
    reminderOffsetMinutes: 1440, // 1 day
  },
  {
    id: 'hw-3',
    title: 'Read Chapter 3 on Macroeconomics',
    subject: 'Economics',
    priority: 'Low',
    status: 'Completed',
    dueDate: new Date(Date.now() - 86400000 * 0.5).toISOString().slice(0, 16),
    estimatedMinutes: 30,
    subtasks: [{ id: 'st-5', text: 'Make key point notes', done: true }],
    notes: 'Done!',
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString().slice(0, 10),
    reminderOffsetMinutes: 30,
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
  const hwEstMinsId = useId();
  const hwReminderId = useId();
  const importFileId = useId();

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
  const [showRemindersModal, setShowRemindersModal] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [showImportExportModal, setShowImportExportModal] = useState(false);

  // Form State - Homework
  const [newHwTitle, setNewHwTitle] = useState('');
  const [newHwSubject, setNewHwSubject] = useState('Mathematics');
  const [newHwPriority, setNewHwPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [newHwDueDate, setNewHwDueDate] = useState('');
  const [newHwEstMins, setNewHwEstMins] = useState<number>(45);
  const [newHwReminder, setNewHwReminder] = useState<number>(60);
  const [newHwNotes, setNewHwNotes] = useState('');
  const [newSubtaskInput, setNewSubtaskInput] = useState('');
  const [tempSubtasks, setTempSubtasks] = useState<string[]>([]);

  // Form State - Exam
  const [newExamSubject, setNewExamSubject] = useState('Physics');
  const [newExamTitle, setNewExamTitle] = useState('');
  const [newExamDate, setNewExamDate] = useState('');
  const [newExamSyllabus, setNewExamSyllabus] = useState('');

  // Test Notification Simulation Toast state
  const [testNotificationToast, setTestNotificationToast] = useState<{ title: string; body: string } | null>(null);

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
      estimatedMinutes: Number(newHwEstMins) || 30,
      subtasks: tempSubtasks.map((txt, idx) => ({ id: `st-${Date.now()}-${idx}`, text: txt, done: false })),
      notes: newHwNotes,
      createdAt: new Date().toISOString(),
      reminderOffsetMinutes: newHwReminder,
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
    const todayStr = new Date().toISOString().slice(0, 10);
    saveHomeworks(
      homeworks.map((h) =>
        h.id === id
          ? {
              ...h,
              status,
              completedAt: status === 'Completed' ? (h.completedAt || todayStr) : undefined,
            }
          : h
      )
    );
  };

  // Toggle Subtask
  const toggleSubtask = (hwId: string, subtaskId: string) => {
    saveHomeworks(
      homeworks.map((h) => {
        if (h.id === hwId) {
          const updatedSt = h.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, done: !st.done } : st
          );
          return { ...h, subtasks: updatedSt };
        }
        return h;
      })
    );
  };

  // STREAK TRACKER ENGINE
  const calculateStreak = () => {
    const datesWithCompletions = new Set(
      homeworks
        .filter((h) => h.status === 'Completed' && h.completedAt)
        .map((h) => h.completedAt!)
    );

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = new Date();

    // Check today & past 60 days
    for (let i = 0; i < 60; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);

      if (datesWithCompletions.has(dateStr)) {
        tempStreak++;
        if (i === 0 || i === 1 || currentStreak > 0) {
          currentStreak = tempStreak;
        }
      } else {
        if (i > 1 && currentStreak === 0) {
          // Break current streak if gap is older than yesterday
        }
        tempStreak = 0;
      }
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    }

    return { currentStreak, longestStreak, datesWithCompletions };
  };

  const streakData = calculateStreak();

  // BATCH IMPORT & EXPORT HANDLERS
  const handleExportJSON = () => {
    const exportData = {
      homeworks,
      exams,
      exportedAt: new Date().toISOString(),
    };
    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Nyxa_Homework_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCSV = () => {
    let csv = `ID,Title,Subject,Priority,Status,DueDate,EstimatedMinutes,SubtasksCount,CompletedSubtasksCount,Notes\n`;
    homeworks.forEach((h) => {
      const compSub = h.subtasks.filter((st) => st.done).length;
      csv += `"${h.id}","${h.title.replace(/"/g, '""')}","${h.subject}","${h.priority}","${h.status}","${h.dueDate}",${h.estimatedMinutes || 0},${h.subtasks.length},${compSub},"${(h.notes || '').replace(/"/g, '""')}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Nyxa_Assignments_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          if (parsed.homeworks && Array.isArray(parsed.homeworks)) {
            saveHomeworks([...parsed.homeworks, ...homeworks]);
          }
          if (parsed.exams && Array.isArray(parsed.exams)) {
            saveExams([...parsed.exams, ...exams]);
          }
          alert('Batch JSON import successful!');
        } else if (file.name.endsWith('.csv')) {
          const lines = text.split('\n').filter((l) => l.trim().length > 0);
          const imported: HomeworkItem[] = [];
          for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
            if (cols.length >= 5) {
              imported.push({
                id: `hw-${Date.now()}-${i}`,
                title: cols[1] || 'Imported Task',
                subject: cols[2] || 'General',
                priority: (cols[3] as any) || 'Medium',
                status: (cols[4] as any) || 'To Do',
                dueDate: cols[5] || new Date().toISOString().slice(0, 16),
                estimatedMinutes: Number(cols[6]) || 30,
                subtasks: [],
                notes: cols[9] || '',
                createdAt: new Date().toISOString(),
              });
            }
          }
          if (imported.length > 0) {
            saveHomeworks([...imported, ...homeworks]);
            alert(`Imported ${imported.length} assignments from CSV!`);
          }
        }
      } catch (err) {
        console.error('Import error', err);
        alert('Failed to parse file. Please verify JSON/CSV format.');
      }
    };
    reader.readAsText(file);
  };

  // NOTIFICATION SIMULATION TESTER
  const triggerSimulatedNotification = (title: string, body: string) => {
    setTestNotificationToast({ title, body });
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
    setTimeout(() => setTestNotificationToast(null), 4000);
  };

  const requestBrowserNotification = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        alert('Browser Notifications Enabled! You will receive system alerts.');
      } else {
        alert('Notification permission denied or dismissed.');
      }
    } else {
      alert('Browser does not support desktop notifications.');
    }
  };

  // Helper formatting for remaining time
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

  // Exam Countdown calculation
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

  const subjectsList = Array.from(new Set(homeworks.map((h) => h.subject)));
  const totalPendingEstMins = homeworks
    .filter((h) => h.status !== 'Completed')
    .reduce((acc, h) => acc + (h.estimatedMinutes || 30), 0);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-6 relative">
      {/* Test Notification Toast Popup */}
      {testNotificationToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-2xl max-w-sm animate-bounce">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider">
                <span>🔔 Assignment Reminder Alert</span>
              </div>
              <h4 className="font-extrabold text-sm mt-1">{testNotificationToast.title}</h4>
              <p className="text-xs text-amber-100 mt-0.5">{testNotificationToast.body}</p>
            </div>
            <button onClick={() => setTestNotificationToast(null)} className="text-white hover:text-amber-200">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-[var(--secondary-bg)] border border-[var(--border)] text-[var(--foreground)]">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </span>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--foreground)]">
              Homework & Study Tracker
            </h1>
          </div>
          <p className="text-sm text-[var(--muted)] mt-1">
            Batch CSV/JSON sync, study streak tracker, custom notifications preview, and exam countdowns.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowStreakModal(true)}
            className="nyxa-btn nyxa-btn-secondary text-xs flex items-center gap-1.5"
          >
            🔥 Streak ({streakData.currentStreak}d)
          </button>

          <button
            onClick={() => setShowRemindersModal(true)}
            className="nyxa-btn nyxa-btn-secondary text-xs flex items-center gap-1.5"
          >
            🔔 Reminders Preview
          </button>

          <button
            onClick={() => setShowImportExportModal(true)}
            className="nyxa-btn nyxa-btn-secondary text-xs flex items-center gap-1.5"
          >
            📁 Import/Export CSV
          </button>

          <button
            onClick={() => setShowAddExamModal(true)}
            className="nyxa-btn nyxa-btn-secondary text-xs flex items-center gap-1.5"
          >
            + Add Exam
          </button>

          <button
            onClick={() => setShowAddHwModal(true)}
            className="nyxa-btn nyxa-btn-primary text-xs flex items-center gap-1.5"
          >
            + Add Assignment
          </button>
        </div>
      </div>

      {/* Target Exam Banner */}
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
                    title="Dismiss exam"
                  >
                    ✕
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Quick Summary Dashboard Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="nyxa-card justify-between p-3.5 bg-gradient-to-br from-[var(--secondary-bg)] to-[var(--card-bg)]">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Active Streak</span>
          <div className="my-1 flex items-center gap-2">
            <span className="text-3xl font-black text-amber-500">🔥 {streakData.currentStreak} Days</span>
          </div>
          <span className="text-[11px] text-[var(--muted)]">Longest Streak: {streakData.longestStreak} Days</span>
        </div>

        <div className="nyxa-card justify-between p-3.5 bg-gradient-to-br from-[var(--secondary-bg)] to-[var(--card-bg)]">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Est. Study Workload</span>
          <div className="my-1">
            <span className="text-3xl font-black text-[var(--foreground)]">
              {Math.floor(totalPendingEstMins / 60)}h {totalPendingEstMins % 60}m
            </span>
          </div>
          <span className="text-[11px] text-[var(--muted)]">Across {homeworks.filter(h => h.status !== 'Completed').length} pending assignments</span>
        </div>

        <div className="nyxa-card justify-between p-3.5 bg-gradient-to-br from-[var(--secondary-bg)] to-[var(--card-bg)]">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Completion Rate</span>
          <div className="my-1">
            <span className="text-3xl font-black text-emerald-500">
              {homeworks.length > 0 ? Math.round((homeworks.filter(h => h.status === 'Completed').length / homeworks.length) * 100) : 0}%
            </span>
          </div>
          <span className="text-[11px] text-[var(--muted)]">{homeworks.filter(h => h.status === 'Completed').length} of {homeworks.length} finished</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="nyxa-card space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
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

      {/* Assignments Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--foreground)] border-0 p-0 m-0">
            Assignments ({filteredHomeworks.length})
          </h2>
          <span className="text-xs text-[var(--muted)]">
            Filtered tasks
          </span>
        </div>

        {filteredHomeworks.length === 0 ? (
          <div className="nyxa-card py-12 text-center text-[var(--muted)] space-y-2">
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

                    <h3
                      className={`text-base font-bold text-[var(--foreground)] m-0 ${
                        hw.status === 'Completed' ? 'line-through text-[var(--muted)]' : ''
                      }`}
                    >
                      {hw.title}
                    </h3>

                    {hw.notes && (
                      <p className="text-xs text-[var(--muted)] line-clamp-2 m-0">
                        {hw.notes}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-[var(--muted)] font-mono">
                      <span>⏱ {hw.estimatedMinutes || 30} mins</span>
                      {hw.reminderOffsetMinutes && (
                        <span>🔔 Notify {hw.reminderOffsetMinutes}m before</span>
                      )}
                    </div>

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

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          triggerSimulatedNotification(
                            `Reminder: ${hw.title}`,
                            `Subject: ${hw.subject} is due soon!`
                          )
                        }
                        className="p-1 text-amber-500 hover:bg-amber-500/10 rounded text-xs"
                        title="Test Reminder Trigger"
                      >
                        🔔
                      </button>
                      <button
                        onClick={() => deleteHomework(hw.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete assignment"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Streak Tracker Modal */}
      {showStreakModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="nyxa-card max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <h2 className="text-lg font-bold border-0 p-0 m-0">🔥 Study Streak Tracker</h2>
              <button onClick={() => setShowStreakModal(false)} className="text-[var(--muted)] hover:text-[var(--foreground)]">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-lg bg-[var(--secondary-bg)] border border-[var(--border)]">
                <span className="text-xs text-[var(--muted)] uppercase block font-bold">Current Streak</span>
                <span className="text-3xl font-black text-amber-500">{streakData.currentStreak} Days</span>
              </div>
              <div className="p-3 rounded-lg bg-[var(--secondary-bg)] border border-[var(--border)]">
                <span className="text-xs text-[var(--muted)] uppercase block font-bold">Best Streak</span>
                <span className="text-3xl font-black text-emerald-500">{streakData.longestStreak} Days</span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                Last 30 Days Activity Heatmap
              </h3>
              <div className="grid grid-cols-7 gap-1.5">
                {Array.from({ length: 28 }).map((_, idx) => {
                  const d = new Date();
                  d.setDate(d.getDate() - (27 - idx));
                  const dStr = d.toISOString().slice(0, 10);
                  const isDone = streakData.datesWithCompletions.has(dStr);

                  return (
                    <div
                      key={dStr}
                      title={`${dStr}: ${isDone ? 'Completed assignments!' : 'No activity'}`}
                      className={`h-8 rounded flex flex-col items-center justify-center text-[9px] font-mono border ${
                        isDone
                          ? 'bg-amber-500/20 text-amber-600 border-amber-500/40 font-bold'
                          : 'bg-[var(--secondary-bg)] text-[var(--muted)] border-[var(--border)]'
                      }`}
                    >
                      {d.getDate()}
                      {isDone && <span>🔥</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reminders Preview Modal */}
      {showRemindersModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="nyxa-card max-w-xl w-full space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <h2 className="text-lg font-bold border-0 p-0 m-0">🔔 Notifications & Alerts Preview</h2>
              <button onClick={() => setShowRemindersModal(false)} className="text-[var(--muted)] hover:text-[var(--foreground)]">
                ✕
              </button>
            </div>

            <div className="p-3 rounded-lg bg-[var(--secondary-bg)] border border-[var(--border)] flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-[var(--foreground)] block">Browser Desktop Notifications</span>
                <span className="text-[var(--muted)]">Receive background popups for upcoming deadlines.</span>
              </div>
              <button
                onClick={requestBrowserNotification}
                className="nyxa-btn nyxa-btn-secondary text-xs shrink-0"
              >
                Enable Notifications
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                Scheduled Reminders Queue ({homeworks.filter(h => h.status !== 'Completed').length})
              </h3>

              {homeworks.filter(h => h.status !== 'Completed').length === 0 ? (
                <p className="text-xs text-[var(--muted)] text-center py-4">No pending assignments to schedule alerts for.</p>
              ) : (
                homeworks.filter(h => h.status !== 'Completed').map((hw) => (
                  <div
                    key={hw.id}
                    className="p-3 rounded-lg border border-[var(--border)] bg-[var(--secondary-bg)] flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-bold text-[var(--foreground)] block">{hw.title}</span>
                      <span className="text-[11px] text-[var(--muted)]">
                        Due: {new Date(hw.dueDate).toLocaleString()} • Trigger {hw.reminderOffsetMinutes || 60}m prior
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        triggerSimulatedNotification(
                          `Test Reminder: ${hw.title}`,
                          `Assignment due at ${hw.dueDate}`
                        )
                      }
                      className="nyxa-btn nyxa-btn-secondary text-[11px]"
                    >
                      Test Trigger
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Import / Export Modal */}
      {showImportExportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="nyxa-card max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <h2 className="text-lg font-bold border-0 p-0 m-0">📁 Batch Import & Export</h2>
              <button onClick={() => setShowImportExportModal(false)} className="text-[var(--muted)] hover:text-[var(--foreground)]">
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--secondary-bg)] space-y-2">
                <span className="font-bold text-xs text-[var(--foreground)] block">Export Assignments & Exams</span>
                <div className="flex gap-2">
                  <button onClick={handleExportCSV} className="nyxa-btn nyxa-btn-secondary text-xs flex-1">
                    Download .CSV
                  </button>
                  <button onClick={handleExportJSON} className="nyxa-btn nyxa-btn-secondary text-xs flex-1">
                    Download .JSON
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--secondary-bg)] space-y-2">
                <span className="font-bold text-xs text-[var(--foreground)] block">Import from CSV or JSON</span>
                <input
                  id={importFileId}
                  type="file"
                  accept=".csv,.json"
                  onChange={handleFileUpload}
                  className="nyxa-input text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Homework Modal */}
      {showAddHwModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="nyxa-card max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <h2 className="text-lg font-bold border-0 p-0 m-0">Add Homework / Assignment</h2>
              <button onClick={() => setShowAddHwModal(false)} className="text-[var(--muted)] hover:text-[var(--foreground)]">
                ✕
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label htmlFor={hwDueDateId} className="nyxa-label">Due Date & Time</label>
                  <input
                    id={hwDueDateId}
                    type="datetime-local"
                    className="nyxa-input text-xs"
                    value={newHwDueDate}
                    onChange={(e) => setNewHwDueDate(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor={hwEstMinsId} className="nyxa-label">Est. Time (Mins)</label>
                  <input
                    id={hwEstMinsId}
                    type="number"
                    min="5"
                    step="5"
                    className="nyxa-input text-xs"
                    value={newHwEstMins}
                    onChange={(e) => setNewHwEstMins(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label htmlFor={hwReminderId} className="nyxa-label">Alert Trigger</label>
                  <select
                    id={hwReminderId}
                    className="nyxa-select text-xs"
                    value={newHwReminder}
                    onChange={(e) => setNewHwReminder(Number(e.target.value))}
                  >
                    <option value={15}>15 Mins Before</option>
                    <option value={60}>1 Hour Before</option>
                    <option value={1440}>1 Day Before</option>
                  </select>
                </div>
              </div>

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
                  <div className="mt-2 space-y-1">
                    {tempSubtasks.map((st, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs p-1.5 rounded bg-[var(--secondary-bg)] border border-[var(--border)]">
                        <span>{st}</span>
                        <button
                          type="button"
                          onClick={() => setTempSubtasks(tempSubtasks.filter((_, i) => i !== idx))}
                          className="text-red-500"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="nyxa-label">Notes & Instructions</label>
                <textarea
                  className="nyxa-textarea text-xs"
                  rows={2}
                  placeholder="Additional guidance..."
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
              <button onClick={() => setShowAddExamModal(false)} className="text-[var(--muted)] hover:text-[var(--foreground)]">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateExam} className="space-y-4">
              <div>
                <label className="nyxa-label">Exam Title *</label>
                <input
                  type="text"
                  required
                  className="nyxa-input text-xs"
                  placeholder="e.g. Mid-Term Mock Test"
                  value={newExamTitle}
                  onChange={(e) => setNewExamTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="nyxa-label">Subject</label>
                  <select
                    className="nyxa-select text-xs"
                    value={newExamSubject}
                    onChange={(e) => setNewExamSubject(e.target.value)}
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
                  <label className="nyxa-label">Date & Time</label>
                  <input
                    type="datetime-local"
                    className="nyxa-input text-xs"
                    value={newExamDate}
                    onChange={(e) => setNewExamDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="nyxa-label">Syllabus / Topics Covered</label>
                <textarea
                  className="nyxa-textarea text-xs"
                  rows={2}
                  placeholder="Chapters, units, key topics..."
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
                  Save Exam Countdown
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
