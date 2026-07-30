'use client';

import { useState, useId } from 'react';

export interface SubjectMarks {
  id: string;
  name: string;
  obtained: number;
  maxMarks: number;
  credits: number;
}

export interface SavedReport {
  id: string;
  studentName: string;
  percentage: number;
  cbseCgpa: number;
  usGpa: number;
  date: string;
}

const DEFAULT_SUBJECTS: SubjectMarks[] = [
  { id: '1', name: 'Mathematics', obtained: 88, maxMarks: 100, credits: 4 },
  { id: '2', name: 'Physics', obtained: 82, maxMarks: 100, credits: 4 },
  { id: '3', name: 'Chemistry', obtained: 79, maxMarks: 100, credits: 4 },
  { id: '4', name: 'English Core', obtained: 91, maxMarks: 100, credits: 3 },
  { id: '5', name: 'Computer Science', obtained: 95, maxMarks: 100, credits: 3 },
];

const PRESETS = {
  pcm: [
    { name: 'Mathematics', obtained: 85, maxMarks: 100, credits: 4 },
    { name: 'Physics', obtained: 78, maxMarks: 100, credits: 4 },
    { name: 'Chemistry', obtained: 82, maxMarks: 100, credits: 4 },
    { name: 'English Core', obtained: 90, maxMarks: 100, credits: 3 },
    { name: 'Computer Science', obtained: 94, maxMarks: 100, credits: 3 },
  ],
  general10: [
    { name: 'Mathematics', obtained: 92, maxMarks: 100, credits: 4 },
    { name: 'Science', obtained: 88, maxMarks: 100, credits: 4 },
    { name: 'Social Science', obtained: 84, maxMarks: 100, credits: 4 },
    { name: 'English', obtained: 90, maxMarks: 100, credits: 3 },
    { name: 'Regional Language', obtained: 86, maxMarks: 100, credits: 3 },
  ],
  collegeCS: [
    { name: 'Data Structures', obtained: 85, maxMarks: 100, credits: 4 },
    { name: 'Algorithms', obtained: 90, maxMarks: 100, credits: 4 },
    { name: 'Linear Algebra', obtained: 78, maxMarks: 100, credits: 3 },
    { name: 'Database Systems', obtained: 88, maxMarks: 100, credits: 3 },
    { name: 'Operating Systems', obtained: 82, maxMarks: 100, credits: 4 },
  ],
};

function getUSGradePoint(pct: number): number {
  if (pct >= 93) return 4.0;
  if (pct >= 90) return 3.7;
  if (pct >= 87) return 3.3;
  if (pct >= 83) return 3.0;
  if (pct >= 80) return 2.7;
  if (pct >= 77) return 2.3;
  if (pct >= 73) return 2.0;
  if (pct >= 70) return 1.7;
  if (pct >= 67) return 1.3;
  if (pct >= 65) return 1.0;
  return 0.0;
}

export default function MarksCalculator() {
  const studentNameId = useId();
  const [studentName, setStudentName] = useState('Alex Morgan');
  const [subjects, setSubjects] = useState<SubjectMarks[]>(DEFAULT_SUBJECTS);
  const [copied, setCopied] = useState(false);

  const addSubject = () => {
    setSubjects([
      ...subjects,
      {
        id: String(Date.now()),
        name: `Subject ${subjects.length + 1}`,
        obtained: 80,
        maxMarks: 100,
        credits: 3,
      },
    ]);
  };

  const removeSubject = (id: string) => {
    if (subjects.length <= 1) return;
    setSubjects(subjects.filter((s) => s.id !== id));
  };

  const updateSubject = (id: string, field: keyof SubjectMarks, val: any) => {
    setSubjects(subjects.map((s) => (s.id === id ? { ...s, [field]: val } : s)));
  };

  const loadPreset = (key: keyof typeof PRESETS) => {
    const list = PRESETS[key].map((item, i) => ({
      id: String(Date.now() + i),
      ...item,
    }));
    setSubjects(list);
  };

  // Metric Calculations
  const totalObtained = subjects.reduce((acc, s) => acc + (Number(s.obtained) || 0), 0);
  const totalMax = subjects.reduce((acc, s) => acc + (Number(s.maxMarks) || 0), 0);
  const overallPct = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
  const cbseCGPA = Math.min(10, Math.max(0, overallPct / 9.5));

  const totalCredits = subjects.reduce((acc, s) => acc + (Number(s.credits) || 1), 0);
  const weightedGPA =
    totalCredits > 0
      ? subjects.reduce((acc, s) => {
          const max = Number(s.maxMarks) || 100;
          const obt = Number(s.obtained) || 0;
          const pct = max > 0 ? (obt / max) * 100 : 0;
          return acc + getUSGradePoint(pct) * (Number(s.credits) || 1);
        }, 0) / totalCredits
      : 0;

  const getDivision = (pct: number) => {
    if (pct >= 75) return 'Distinction';
    if (pct >= 60) return 'First Division';
    if (pct >= 50) return 'Second Division';
    if (pct >= 33) return 'Third Division';
    return 'Repeat';
  };

  const divisionStr = getDivision(overallPct);

  const handleCopySummary = () => {
    let report = `Academic Grade Summary for ${studentName || 'Student'}\n`;
    report += `-----------------------------------\n`;
    report += `Overall Score : ${totalObtained} / ${totalMax} (${overallPct.toFixed(2)}%)\n`;
    report += `US GPA        : ${weightedGPA.toFixed(2)} / 4.0\n`;
    report += `CBSE CGPA     : ${cbseCGPA.toFixed(2)} / 10.0\n`;
    report += `Result        : ${divisionStr}\n\n`;
    report += `Subject Breakdown:\n`;
    subjects.forEach((s) => {
      const pct = s.maxMarks > 0 ? ((s.obtained / s.maxMarks) * 100).toFixed(1) : '0';
      report += `• ${s.name}: ${s.obtained}/${s.maxMarks} (${pct}%) [${s.credits} cr]\n`;
    });

    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
            Marks & GPA Calculator
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-0.5">
            Instant percentage, US GPA, and CBSE CGPA calculations.
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

      {/* Outcome Card */}
      <div className="nyxa-card p-6 bg-gradient-to-br from-[var(--secondary-bg)] via-[var(--card-bg)] to-[var(--card-bg)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[var(--border)] pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Overall Result
            </span>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-4xl sm:text-5xl font-black text-[var(--foreground)] tracking-tight">
                {overallPct.toFixed(1)}%
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full border border-[var(--border)] bg-[var(--secondary-bg)] text-[var(--foreground)]">
                {divisionStr}
              </span>
            </div>
          </div>

          <div className="text-xs text-[var(--muted)] sm:text-right">
            Total Score: <span className="font-bold text-[var(--foreground)]">{totalObtained}</span> / {totalMax} Marks
          </div>
        </div>

        {/* Secondary Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--secondary-bg)]">
            <span className="text-[11px] font-medium text-[var(--muted)] block">US GPA (4.0)</span>
            <span className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mt-0.5 block">
              {weightedGPA.toFixed(2)}
            </span>
          </div>

          <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--secondary-bg)]">
            <span className="text-[11px] font-medium text-[var(--muted)] block">CBSE CGPA (10.0)</span>
            <span className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mt-0.5 block">
              {cbseCGPA.toFixed(2)}
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3 rounded-lg border border-[var(--border)] bg-[var(--secondary-bg)]">
            <span className="text-[11px] font-medium text-[var(--muted)] block">Total Credits</span>
            <span className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mt-0.5 block">
              {totalCredits}
            </span>
          </div>
        </div>
      </div>

      {/* Input Card */}
      <div className="nyxa-card space-y-4">
        {/* Top Student Info & Quick Presets */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
          <div className="flex-grow max-w-xs">
            <label htmlFor={studentNameId} className="nyxa-label text-xs">Student Name</label>
            <input
              id={studentNameId}
              type="text"
              className="nyxa-input text-xs font-semibold py-1.5"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Enter student name"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-[var(--muted)]">Presets:</span>
            <button
              onClick={() => loadPreset('pcm')}
              className="px-2.5 py-1 text-xs rounded-md border border-[var(--border)] hover:bg-[var(--secondary-bg)] transition-colors"
            >
              Science
            </button>
            <button
              onClick={() => loadPreset('general10')}
              className="px-2.5 py-1 text-xs rounded-md border border-[var(--border)] hover:bg-[var(--secondary-bg)] transition-colors"
            >
              Class 10
            </button>
            <button
              onClick={() => loadPreset('collegeCS')}
              className="px-2.5 py-1 text-xs rounded-md border border-[var(--border)] hover:bg-[var(--secondary-bg)] transition-colors"
            >
              College
            </button>
          </div>
        </div>

        {/* Subjects Entry Rows */}
        <div className="space-y-2.5">
          {subjects.map((s) => {
            const pct = s.maxMarks > 0 ? (s.obtained / s.maxMarks) * 100 : 0;
            return (
              <div
                key={s.id}
                className="p-3 rounded-lg border border-[var(--border)] bg-[var(--secondary-bg)] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex-grow sm:w-1/3">
                  <input
                    type="text"
                    className="nyxa-input text-xs font-semibold py-1 px-2.5"
                    value={s.name}
                    onChange={(e) => updateSubject(s.id, 'name', e.target.value)}
                    placeholder="Subject Name"
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-[var(--muted)]">Score:</span>
                    <input
                      type="number"
                      min="0"
                      className="nyxa-input text-xs py-1 px-2 w-16 text-center"
                      value={s.obtained}
                      onChange={(e) =>
                        updateSubject(s.id, 'obtained', Math.max(0, Number(e.target.value)))
                      }
                    />
                    <span className="text-xs text-[var(--muted)]">/</span>
                    <input
                      type="number"
                      min="1"
                      className="nyxa-input text-xs py-1 px-2 w-16 text-center"
                      value={s.maxMarks}
                      onChange={(e) =>
                        updateSubject(s.id, 'maxMarks', Math.max(1, Number(e.target.value)))
                      }
                    />
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-[var(--muted)]">Credits:</span>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      className="nyxa-input text-xs py-1 px-2 w-12 text-center"
                      value={s.credits}
                      onChange={(e) =>
                        updateSubject(s.id, 'credits', Math.max(1, Number(e.target.value)))
                      }
                    />
                  </div>

                  <span className="text-xs font-mono font-bold w-14 text-right">
                    {pct.toFixed(0)}%
                  </span>

                  <button
                    onClick={() => removeSubject(s.id)}
                    disabled={subjects.length <= 1}
                    className="p-1 rounded text-red-500 hover:bg-red-500/10 disabled:opacity-30 transition-colors ml-1"
                    title="Remove Subject"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Subject Button */}
        <div className="pt-2 flex justify-between items-center">
          <button
            onClick={addSubject}
            className="nyxa-btn nyxa-btn-secondary text-xs flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Subject
          </button>

          <span className="text-xs text-[var(--muted)]">
            {subjects.length} Subjects Listed
          </span>
        </div>
      </div>
    </div>
  );
}
