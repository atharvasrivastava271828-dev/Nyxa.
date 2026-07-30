'use client';

import { useState, useEffect, useId } from 'react';

export interface SubjectMarks {
  id: string;
  name: string;
  credits: number; // Subject weighting (1 to 10 credits)
  theoryObtained: number;
  theoryMax: number;
  practicalObtained: number;
  practicalMax: number;
  isCompulsory?: boolean;
  isTargetRemaining?: boolean; // True if this subject is an upcoming/remaining exam
}

export interface SavedReport {
  id: string;
  studentName: string;
  className: string;
  board: string;
  date: string;
  percentage: number;
  weightedPercentage: number;
  cbseCgpa: number;
  usGpa: number;
  ukHonours: string;
  ectsGrade: string;
  division: string;
  subjectsCount: number;
}

const PRESETS = {
  cbse10: [
    { name: 'Mathematics', credits: 4, theoryMax: 80, practicalMax: 20 },
    { name: 'Science', credits: 4, theoryMax: 80, practicalMax: 20 },
    { name: 'Social Science', credits: 4, theoryMax: 80, practicalMax: 20 },
    { name: 'English Language & Lit', credits: 4, theoryMax: 80, practicalMax: 20, isCompulsory: true },
    { name: 'Hindi / Regional Lang', credits: 3, theoryMax: 80, practicalMax: 20 },
    { name: 'Information Technology', credits: 2, theoryMax: 50, practicalMax: 50 },
  ],
  pcm12: [
    { name: 'English Core', credits: 4, theoryMax: 80, practicalMax: 20, isCompulsory: true },
    { name: 'Physics', credits: 4, theoryMax: 70, practicalMax: 30 },
    { name: 'Chemistry', credits: 4, theoryMax: 70, practicalMax: 30 },
    { name: 'Mathematics', credits: 5, theoryMax: 80, practicalMax: 20 },
    { name: 'Computer Science / IP', credits: 3, theoryMax: 70, practicalMax: 30 },
    { name: 'Physical Education', credits: 2, theoryMax: 70, practicalMax: 30 },
  ],
  pcb12: [
    { name: 'English Core', credits: 4, theoryMax: 80, practicalMax: 20, isCompulsory: true },
    { name: 'Physics', credits: 4, theoryMax: 70, practicalMax: 30 },
    { name: 'Chemistry', credits: 4, theoryMax: 70, practicalMax: 30 },
    { name: 'Biology', credits: 5, theoryMax: 70, practicalMax: 30 },
    { name: 'Psychology / Biotech', credits: 3, theoryMax: 70, practicalMax: 30 },
  ],
  commerce12: [
    { name: 'English Core', credits: 4, theoryMax: 80, practicalMax: 20, isCompulsory: true },
    { name: 'Accountancy', credits: 5, theoryMax: 80, practicalMax: 20 },
    { name: 'Business Studies', credits: 4, theoryMax: 80, practicalMax: 20 },
    { name: 'Economics', credits: 4, theoryMax: 80, practicalMax: 20 },
    { name: 'Applied Mathematics', credits: 4, theoryMax: 80, practicalMax: 20 },
    { name: 'Entrepreneurship', credits: 3, theoryMax: 70, practicalMax: 30 },
  ],
  humanities12: [
    { name: 'English Core', credits: 4, theoryMax: 80, practicalMax: 20, isCompulsory: true },
    { name: 'Political Science', credits: 4, theoryMax: 80, practicalMax: 20 },
    { name: 'History', credits: 4, theoryMax: 80, practicalMax: 20 },
    { name: 'Psychology', credits: 4, theoryMax: 70, practicalMax: 30 },
    { name: 'Sociology / Economics', credits: 4, theoryMax: 80, practicalMax: 20 },
  ],
};

export default function MarksCalculator() {
  const studentNameId = useId();
  const boardId = useId();
  const classGradeId = useId();
  const bestOfFiveId = useId();
  const detailedModeId = useId();
  const enableWeightsId = useId();
  const targetPctId = useId();

  const [studentName, setStudentName] = useState('Alex Morgan');
  const [board, setBoard] = useState<'CBSE' | 'ICSE' | 'State Board' | 'International'>('CBSE');
  const [classGrade, setClassGrade] = useState<'Class 9' | 'Class 10' | 'Class 11' | 'Class 12' | 'Undergraduate'>('Class 12');
  const [useBestOfFive, setUseBestOfFive] = useState(true);
  const [detailedMode, setDetailedMode] = useState(true);
  const [enableWeights, setEnableWeights] = useState(true);

  // Target Calculator State
  const [targetPercentage, setTargetPercentage] = useState<number>(85);
  const [activeTab, setActiveTab] = useState<'calculator' | 'targetCalc' | 'conversions'>('calculator');

  const [subjects, setSubjects] = useState<SubjectMarks[]>([
    { id: '1', name: 'English Core', credits: 4, theoryObtained: 72, theoryMax: 80, practicalObtained: 19, practicalMax: 20, isCompulsory: true },
    { id: '2', name: 'Physics', credits: 4, theoryObtained: 58, theoryMax: 70, practicalObtained: 28, practicalMax: 30 },
    { id: '3', name: 'Chemistry', credits: 4, theoryObtained: 61, theoryMax: 70, practicalObtained: 29, practicalMax: 30 },
    { id: '4', name: 'Mathematics', credits: 5, theoryObtained: 71, theoryMax: 80, practicalObtained: 18, practicalMax: 20 },
    { id: '5', name: 'Computer Science', credits: 3, theoryObtained: 67, theoryMax: 70, practicalObtained: 30, practicalMax: 30 },
    { id: '6', name: 'Physical Education', credits: 2, theoryObtained: 65, theoryMax: 70, practicalObtained: 28, practicalMax: 30 },
  ]);

  const [copied, setCopied] = useState(false);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);

  // Load saved history on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('nyxa_marks_history');
      if (stored) {
        setSavedReports(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse saved reports', e);
    }
  }, []);

  const saveToHistory = (newReport: SavedReport) => {
    const updated = [newReport, ...savedReports.slice(0, 19)];
    setSavedReports(updated);
    try {
      localStorage.setItem('nyxa_marks_history', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save report', e);
    }
  };

  const loadPreset = (presetKey: keyof typeof PRESETS) => {
    const template = PRESETS[presetKey];
    const loaded: SubjectMarks[] = template.map((item, idx) => ({
      id: String(Date.now() + idx),
      name: item.name,
      credits: item.credits || 3,
      theoryObtained: Math.round(item.theoryMax * 0.85),
      theoryMax: item.theoryMax,
      practicalObtained: Math.round(item.practicalMax * 0.95),
      practicalMax: item.practicalMax,
      isCompulsory: item.isCompulsory,
      isTargetRemaining: false,
    }));
    setSubjects(loaded);
  };

  const addSubject = () => {
    setSubjects([
      ...subjects,
      {
        id: String(Date.now()),
        name: `Subject ${subjects.length + 1}`,
        credits: 3,
        theoryObtained: 70,
        theoryMax: 80,
        practicalObtained: 18,
        practicalMax: 20,
        isTargetRemaining: false,
      },
    ]);
  };

  const removeSubject = (id: string) => {
    if (subjects.length <= 1) return;
    setSubjects(subjects.filter((s) => s.id !== id));
  };

  const updateSubject = (id: string, field: keyof SubjectMarks, value: any) => {
    setSubjects(
      subjects.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  // Helper calculations per subject
  const getSubjectTotalObtained = (s: SubjectMarks) => s.theoryObtained + s.practicalObtained;
  const getSubjectTotalMax = (s: SubjectMarks) => s.theoryMax + s.practicalMax;
  const getSubjectPercentage = (s: SubjectMarks) => {
    const max = getSubjectTotalMax(s);
    return max > 0 ? (getSubjectTotalObtained(s) / max) * 100 : 0;
  };

  // CBSE 9-Point Grade determination based on percentage
  const getCBSEGrade = (percentage: number) => {
    if (percentage >= 91) return { grade: 'A1', point: 10, label: 'Top 1/8th (Outstanding)' };
    if (percentage >= 81) return { grade: 'A2', point: 9, label: 'Next 1/8th (Excellent)' };
    if (percentage >= 71) return { grade: 'B1', point: 8, label: 'Next 1/8th (Very Good)' };
    if (percentage >= 61) return { grade: 'B2', point: 7, label: 'Next 1/8th (Good)' };
    if (percentage >= 51) return { grade: 'C1', point: 6, label: 'Next 1/8th (Above Average)' };
    if (percentage >= 41) return { grade: 'C2', point: 5, label: 'Next 1/8th (Average)' };
    if (percentage >= 33) return { grade: 'D1', point: 4, label: 'Next 1/8th (Pass Marks)' };
    if (percentage >= 21) return { grade: 'D2', point: 0, label: 'Eligible for Compartment' };
    return { grade: 'E', point: 0, label: 'Essential Repeat' };
  };

  // US 4.0 GPA Grade Point per subject
  const getUSGradePoint = (percentage: number) => {
    if (percentage >= 93) return { letter: 'A', point: 4.0 };
    if (percentage >= 90) return { letter: 'A-', point: 3.7 };
    if (percentage >= 87) return { letter: 'B+', point: 3.3 };
    if (percentage >= 83) return { letter: 'B', point: 3.0 };
    if (percentage >= 80) return { letter: 'B-', point: 2.7 };
    if (percentage >= 77) return { letter: 'C+', point: 2.3 };
    if (percentage >= 73) return { letter: 'C', point: 2.0 };
    if (percentage >= 70) return { letter: 'C-', point: 1.7 };
    if (percentage >= 67) return { letter: 'D+', point: 1.3 };
    if (percentage >= 65) return { letter: 'D', point: 1.0 };
    return { letter: 'F', point: 0.0 };
  };

  // UK Honours Classification
  const getUKHonours = (percentage: number) => {
    if (percentage >= 70) return { class: 'First-Class Honours (1st)', badge: 'bg-amber-500/10 text-amber-600 border-amber-500/30' };
    if (percentage >= 60) return { class: 'Upper Second-Class (2:1)', badge: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' };
    if (percentage >= 50) return { class: 'Lower Second-Class (2:2)', badge: 'bg-blue-500/10 text-blue-600 border-blue-500/30' };
    if (percentage >= 40) return { class: 'Third-Class (3rd)', badge: 'bg-orange-500/10 text-orange-600 border-orange-500/30' };
    return { class: 'Fail / Unclassified', badge: 'bg-red-500/10 text-red-600 border-red-500/30' };
  };

  // ECTS Grading Scale
  const getECTSGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: 'A', label: 'Excellent (Top 10%)' };
    if (percentage >= 80) return { grade: 'B', label: 'Very Good (Next 25%)' };
    if (percentage >= 70) return { grade: 'C', label: 'Good (Next 30%)' };
    if (percentage >= 60) return { grade: 'D', label: 'Satisfactory (Next 25%)' };
    if (percentage >= 50) return { grade: 'E', label: 'Sufficient (Next 10%)' };
    return { grade: 'F', label: 'Fail' };
  };

  // Determine subjects included in Best of 5 calculation
  const getIncludedSubjects = () => {
    if (!useBestOfFive || subjects.length <= 5) {
      return subjects.map((s) => s.id);
    }
    const compulsory = subjects.filter((s) => s.isCompulsory);
    const optional = subjects.filter((s) => !s.isCompulsory);

    const sortedOptional = [...optional].sort(
      (a, b) => getSubjectPercentage(b) - getSubjectPercentage(a)
    );

    const neededOptionalCount = Math.max(0, 5 - compulsory.length);
    const selectedOptional = sortedOptional.slice(0, neededOptionalCount);

    const includedIds = new Set([
      ...compulsory.map((s) => s.id),
      ...selectedOptional.map((s) => s.id),
    ]);

    return Array.from(includedIds);
  };

  const includedSubjectIds = getIncludedSubjects();
  const activeSubjects = subjects.filter((s) => includedSubjectIds.includes(s.id));

  // Totals & Percentages
  const totalObtained = activeSubjects.reduce((acc, s) => acc + getSubjectTotalObtained(s), 0);
  const totalMax = activeSubjects.reduce((acc, s) => acc + getSubjectTotalMax(s), 0);
  const overallPercentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;

  // Weighted Percentage calculation using credits
  const totalWeightedProduct = activeSubjects.reduce(
    (acc, s) => acc + getSubjectPercentage(s) * (s.credits || 1),
    0
  );
  const totalCredits = activeSubjects.reduce((acc, s) => acc + (s.credits || 1), 0);
  const weightedPercentage = totalCredits > 0 ? totalWeightedProduct / totalCredits : overallPercentage;

  const effectivePercentage = enableWeights ? weightedPercentage : overallPercentage;

  // Global Conversions
  const cbseCGPA = Math.min(10, Math.max(0, effectivePercentage / 9.5));

  // US GPA Calculation (Weighted by subject credits)
  const totalUsPointsWeighted = activeSubjects.reduce((acc, s) => {
    const pct = getSubjectPercentage(s);
    const gp = getUSGradePoint(pct).point;
    return acc + gp * (s.credits || 1);
  }, 0);
  const usGPA = totalCredits > 0 ? totalUsPointsWeighted / totalCredits : 0;

  const ukHonoursInfo = getUKHonours(effectivePercentage);
  const ectsInfo = getECTSGrade(effectivePercentage);

  // Division Classification
  const getDivision = (pct: number) => {
    if (pct >= 75) return { name: 'First Division with Distinction', color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' };
    if (pct >= 60) return { name: 'First Division', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30' };
    if (pct >= 50) return { name: 'Second Division', color: 'text-blue-500 bg-blue-500/10 border-blue-500/30' };
    if (pct >= 33) return { name: 'Third Division', color: 'text-orange-500 bg-orange-500/10 border-orange-500/30' };
    return { name: 'Essential Repeat (Fail)', color: 'text-red-500 bg-red-500/10 border-red-500/30' };
  };

  const currentDivision = getDivision(effectivePercentage);

  // TARGET CALCULATOR LOGIC
  const targetCompletedSubjects = activeSubjects.filter((s) => !s.isTargetRemaining);
  const targetRemainingSubjects = activeSubjects.filter((s) => s.isTargetRemaining);

  const completedTotalObtained = targetCompletedSubjects.reduce((acc, s) => acc + getSubjectTotalObtained(s), 0);
  const completedTotalMax = targetCompletedSubjects.reduce((acc, s) => acc + getSubjectTotalMax(s), 0);

  const remainingTotalMax = targetRemainingSubjects.reduce((acc, s) => acc + getSubjectTotalMax(s), 0);

  // Required total marks to hit target percentage across all active subjects
  const requiredOverallMarks = (targetPercentage / 100) * totalMax;
  const neededRemainingMarks = requiredOverallMarks - completedTotalObtained;
  const neededRemainingPct = remainingTotalMax > 0 ? (neededRemainingMarks / remainingTotalMax) * 100 : 0;

  const getTargetFeasibility = () => {
    if (targetRemainingSubjects.length === 0) {
      return { status: 'No remaining subjects checked', style: 'text-gray-500 bg-gray-500/10 border-gray-500/30' };
    }
    if (neededRemainingMarks > remainingTotalMax) {
      return { status: 'Unachievable (Requires >100% in remaining exams)', style: 'text-red-500 bg-red-500/10 border-red-500/30' };
    }
    if (neededRemainingMarks <= 0) {
      return { status: 'Already Achieved! (Target threshold passed)', style: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30' };
    }
    if (neededRemainingPct > 90) {
      return { status: `Challenging (Needs ${neededRemainingPct.toFixed(1)}% average)`, style: 'text-amber-500 bg-amber-500/10 border-amber-500/30' };
    }
    return { status: `Achievable (Needs ${neededRemainingPct.toFixed(1)}% average)`, style: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30' };
  };

  const targetFeasibility = getTargetFeasibility();

  // EXPORT GENERATORS
  const generateReportText = () => {
    let report = `===========================================\n`;
    report += `       NYXA ACADEMIC MARKS REPORT          \n`;
    report += `===========================================\n`;
    report += `Student Name : ${studentName || 'Student'}\n`;
    report += `Board / Class: ${board} - ${classGrade}\n`;
    report += `Weighting    : ${enableWeights ? 'Weighted by Subject Credits' : 'Unweighted'}\n`;
    report += `Calculation  : ${useBestOfFive && subjects.length > 5 ? 'Best of 5 Subjects' : 'All Subjects'}\n`;
    report += `Date         : ${new Date().toLocaleDateString()}\n`;
    report += `-------------------------------------------\n`;
    report += `SUBJECT BREAKDOWN:\n`;
    report += `-------------------------------------------\n`;

    subjects.forEach((s, idx) => {
      const isInc = includedSubjectIds.includes(s.id);
      const pct = getSubjectPercentage(s).toFixed(1);
      const gr = getCBSEGrade(Number(pct));
      const us = getUSGradePoint(Number(pct));
      report += `${idx + 1}. ${s.name.padEnd(20)} [${s.credits} cr]: ${getSubjectTotalObtained(s)} / ${getSubjectTotalMax(s)} (${pct}%) [CBSE: ${gr.grade} | US: ${us.letter}] ${isInc ? '' : '*Excluded'}\n`;
    });

    report += `-------------------------------------------\n`;
    report += `MULTI-SYSTEM GRADE CONVERSIONS:\n`;
    report += `-------------------------------------------\n`;
    report += `Total Marks Obtained : ${totalObtained} / ${totalMax}\n`;
    report += `Raw Percentage       : ${overallPercentage.toFixed(2)}%\n`;
    report += `Weighted Percentage  : ${weightedPercentage.toFixed(2)}%\n`;
    report += `CBSE CGPA            : ${cbseCGPA.toFixed(2)} / 10\n`;
    report += `US GPA               : ${usGPA.toFixed(2)} / 4.0\n`;
    report += `UK Honours           : ${ukHonoursInfo.class}\n`;
    report += `ECTS Grade           : ${ectsInfo.grade} (${ectsInfo.label})\n`;
    report += `Division Result      : ${currentDivision.name}\n`;
    report += `===========================================\n`;

    return report;
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(generateReportText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleExportCSV = () => {
    let csv = `Subject Name,Credits,Theory Obtained,Theory Max,Practical Obtained,Practical Max,Total Obtained,Total Max,Percentage,CBSE Grade,US Grade,Status\n`;
    subjects.forEach((s) => {
      const totalObt = getSubjectTotalObtained(s);
      const totalM = getSubjectTotalMax(s);
      const pct = getSubjectPercentage(s).toFixed(1);
      const cbse = getCBSEGrade(Number(pct)).grade;
      const us = getUSGradePoint(Number(pct)).letter;
      const isInc = includedSubjectIds.includes(s.id) ? 'Included' : 'Excluded';

      csv += `"${s.name}",${s.credits},${s.theoryObtained},${s.theoryMax},${s.practicalObtained},${s.practicalMax},${totalObt},${totalM},${pct}%,${cbse},${us},${isInc}\n`;
    });

    csv += `\nSUMMARY METRICS\n`;
    csv += `Student Name,"${studentName}"\n`;
    csv += `Board & Grade,"${board} - ${classGrade}"\n`;
    csv += `Raw Percentage,${overallPercentage.toFixed(2)}%\n`;
    csv += `Weighted Percentage,${weightedPercentage.toFixed(2)}%\n`;
    csv += `CBSE CGPA,${cbseCGPA.toFixed(2)}\n`;
    csv += `US GPA (4.0),${usGPA.toFixed(2)}\n`;
    csv += `UK Honours,"${ukHonoursInfo.class}"\n`;
    csv += `ECTS Grade,"${ectsInfo.grade} - ${ectsInfo.label}"\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${studentName.replace(/\s+/g, '_')}_Marks_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveCurrentReport = () => {
    const report: SavedReport = {
      id: String(Date.now()),
      studentName: studentName || 'Student',
      className: classGrade,
      board: board,
      date: new Date().toLocaleDateString(),
      percentage: Number(overallPercentage.toFixed(2)),
      weightedPercentage: Number(weightedPercentage.toFixed(2)),
      cbseCgpa: Number(cbseCGPA.toFixed(2)),
      usGpa: Number(usGPA.toFixed(2)),
      ukHonours: ukHonoursInfo.class,
      ectsGrade: ectsInfo.grade,
      division: currentDivision.name,
      subjectsCount: activeSubjects.length,
    };
    saveToHistory(report);
    alert('Report saved to local academic history!');
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-[var(--secondary-bg)] border border-[var(--border)] text-[var(--foreground)]">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 002-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </span>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--foreground)]">
              Academic Marks & Multi-GPA Calculator
            </h1>
          </div>
          <p className="text-sm text-[var(--muted)] mt-1">
            Calculate CBSE/ICSE grades, US (4.0), UK Honours & ECTS GPA with subject credit weightings and target score forecasting.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowSavedModal(true)}
            className="nyxa-btn nyxa-btn-secondary text-xs flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            History ({savedReports.length})
          </button>
          <button
            onClick={handleExportCSV}
            className="nyxa-btn nyxa-btn-secondary text-xs flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
          <button
            onClick={handleSaveCurrentReport}
            className="nyxa-btn nyxa-btn-secondary text-xs flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Save Result
          </button>
          <button
            onClick={handleCopyReport}
            className="nyxa-btn nyxa-btn-primary text-xs flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002 0h2a2 2 0 002 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            {copied ? 'Copied!' : 'Copy Summary'}
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2">
        <button
          onClick={() => setActiveTab('calculator')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'calculator'
              ? 'bg-[var(--foreground)] text-[var(--background)]'
              : 'bg-[var(--secondary-bg)] text-[var(--muted)] hover:text-[var(--foreground)]'
          }`}
        >
          📊 Marks & Multi-GPA Calculator
        </button>
        <button
          onClick={() => setActiveTab('targetCalc')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'targetCalc'
              ? 'bg-[var(--foreground)] text-[var(--background)]'
              : 'bg-[var(--secondary-bg)] text-[var(--muted)] hover:text-[var(--foreground)]'
          }`}
        >
          🎯 Target Score & Future Exam Forecast
        </button>
        <button
          onClick={() => setActiveTab('conversions')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'conversions'
              ? 'bg-[var(--foreground)] text-[var(--background)]'
              : 'bg-[var(--secondary-bg)] text-[var(--muted)] hover:text-[var(--foreground)]'
          }`}
        >
          🌐 Global Grading Scales Reference
        </button>
      </div>

      {/* Primary Configuration Bar */}
      <div className="nyxa-card space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor={studentNameId} className="nyxa-label">Student Name</label>
            <input
              id={studentNameId}
              type="text"
              className="nyxa-input"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Enter student name"
            />
          </div>

          <div>
            <label htmlFor={boardId} className="nyxa-label">Educational Board</label>
            <select
              id={boardId}
              className="nyxa-select"
              value={board}
              onChange={(e) => setBoard(e.target.value as any)}
            >
              <option value="CBSE">CBSE (Central Board)</option>
              <option value="ICSE">ICSE / ISC</option>
              <option value="State Board">State Board / Other</option>
              <option value="International">International (US / UK / IB)</option>
            </select>
          </div>

          <div>
            <label htmlFor={classGradeId} className="nyxa-label">Class Standard</label>
            <select
              id={classGradeId}
              className="nyxa-select"
              value={classGrade}
              onChange={(e) => setClassGrade(e.target.value as any)}
            >
              <option value="Class 9">Class 9</option>
              <option value="Class 10">Class 10</option>
              <option value="Class 11">Class 11</option>
              <option value="Class 12">Class 12</option>
              <option value="Undergraduate">Undergraduate / College</option>
            </select>
          </div>

          <div className="flex flex-col justify-end space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={bestOfFiveId}
                className="w-4 h-4 rounded accent-black cursor-pointer"
                checked={useBestOfFive}
                onChange={(e) => setUseBestOfFive(e.target.checked)}
              />
              <label htmlFor={bestOfFiveId} className="text-xs font-medium cursor-pointer text-[var(--foreground)]">
                Best-of-5 Rule (Auto Select Top 5)
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={enableWeightsId}
                className="w-4 h-4 rounded accent-black cursor-pointer"
                checked={enableWeights}
                onChange={(e) => setEnableWeights(e.target.checked)}
              />
              <label htmlFor={enableWeightsId} className="text-xs font-medium cursor-pointer text-[var(--foreground)]">
                Subject Credit Weightings
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={detailedModeId}
                className="w-4 h-4 rounded accent-black cursor-pointer"
                checked={detailedMode}
                onChange={(e) => setDetailedMode(e.target.checked)}
              />
              <label htmlFor={detailedModeId} className="text-xs font-medium cursor-pointer text-[var(--foreground)]">
                Theory & Practical Breakdown
              </label>
            </div>
          </div>
        </div>

        {/* Quick Stream Presets */}
        <div className="pt-2 border-t border-[var(--border)] flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-[var(--muted)]">Quick Presets:</span>
          <button
            onClick={() => loadPreset('cbse10')}
            className="px-2.5 py-1 text-xs rounded-md border border-[var(--border)] hover:bg-[var(--secondary-bg)] transition-colors"
          >
            Class 10 General
          </button>
          <button
            onClick={() => loadPreset('pcm12')}
            className="px-2.5 py-1 text-xs rounded-md border border-[var(--border)] hover:bg-[var(--secondary-bg)] transition-colors"
          >
            Class 12 PCM (Science)
          </button>
          <button
            onClick={() => loadPreset('pcb12')}
            className="px-2.5 py-1 text-xs rounded-md border border-[var(--border)] hover:bg-[var(--secondary-bg)] transition-colors"
          >
            Class 12 PCB (Medical)
          </button>
          <button
            onClick={() => loadPreset('commerce12')}
            className="px-2.5 py-1 text-xs rounded-md border border-[var(--border)] hover:bg-[var(--secondary-bg)] transition-colors"
          >
            Class 12 Commerce
          </button>
          <button
            onClick={() => loadPreset('humanities12')}
            className="px-2.5 py-1 text-xs rounded-md border border-[var(--border)] hover:bg-[var(--secondary-bg)] transition-colors"
          >
            Class 12 Humanities
          </button>
        </div>
      </div>

      {activeTab === 'calculator' && (
        <>
          {/* Dashboard Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Percentage Card */}
            <div className="nyxa-card justify-between bg-gradient-to-br from-[var(--secondary-bg)] to-[var(--card-bg)]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                {enableWeights ? 'Weighted Percentage' : 'Overall Percentage'}
              </span>
              <div className="my-2">
                <span className="text-4xl font-black text-[var(--foreground)] tracking-tight">
                  {effectivePercentage.toFixed(2)}%
                </span>
              </div>
              <div className="text-xs text-[var(--muted)]">
                {totalObtained} / {totalMax} Marks ({totalCredits} Total Credits)
              </div>
            </div>

            {/* CBSE CGPA Card */}
            <div className="nyxa-card justify-between bg-gradient-to-br from-[var(--secondary-bg)] to-[var(--card-bg)]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                CBSE CGPA (10.0 Scale)
              </span>
              <div className="my-2">
                <span className="text-4xl font-black text-[var(--foreground)] tracking-tight">
                  {cbseCGPA.toFixed(2)}
                </span>
                <span className="text-sm font-medium text-[var(--muted)]"> / 10</span>
              </div>
              <div className="text-xs text-[var(--muted)]">
                Formula: (% Marks / 9.5)
              </div>
            </div>

            {/* US GPA Card */}
            <div className="nyxa-card justify-between bg-gradient-to-br from-[var(--secondary-bg)] to-[var(--card-bg)]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                US GPA (4.0 Scale)
              </span>
              <div className="my-2">
                <span className="text-4xl font-black text-[var(--foreground)] tracking-tight">
                  {usGPA.toFixed(2)}
                </span>
                <span className="text-sm font-medium text-[var(--muted)]"> / 4.0</span>
              </div>
              <div className="text-xs text-[var(--muted)]">
                Credit-weighted grade point average
              </div>
            </div>

            {/* UK & ECTS Card */}
            <div className="nyxa-card justify-between bg-gradient-to-br from-[var(--secondary-bg)] to-[var(--card-bg)]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                UK Honours / ECTS
              </span>
              <div className="my-1.5 space-y-1">
                <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded border ${ukHonoursInfo.badge}`}>
                  {ukHonoursInfo.class}
                </span>
                <div className="text-xs font-semibold text-[var(--foreground)]">
                  ECTS Grade: <span className="font-mono font-bold">{ectsInfo.grade}</span> ({ectsInfo.label})
                </div>
              </div>
              <div className="text-[11px] text-[var(--muted)]">
                {currentDivision.name}
              </div>
            </div>
          </div>

          {/* Subjects Table */}
          <div className="nyxa-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
              <h2 className="text-lg font-semibold text-[var(--foreground)] border-0 p-0 m-0">
                Subject Marks & Weightings Entry
              </h2>
              <button
                onClick={addSubject}
                className="nyxa-btn nyxa-btn-secondary text-xs self-start sm:self-auto flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Subject
              </button>
            </div>

            <div className="nyxa-table-wrapper">
              <table className="nyxa-table">
                <thead>
                  <tr>
                    <th>Subject Name</th>
                    <th>Credits</th>
                    {detailedMode ? (
                      <>
                        <th>Theory (Obt / Max)</th>
                        <th>Practical (Obt / Max)</th>
                      </>
                    ) : (
                      <th>Total Marks (Obt / Max)</th>
                    )}
                    <th>Total Obtained</th>
                    <th>Percentage</th>
                    <th>CBSE Grade</th>
                    <th>US Grade</th>
                    <th>Best of 5</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((s) => {
                    const totalObt = getSubjectTotalObtained(s);
                    const totalM = getSubjectTotalMax(s);
                    const pct = getSubjectPercentage(s);
                    const gradeInfo = getCBSEGrade(pct);
                    const usGrade = getUSGradePoint(pct);
                    const isIncluded = includedSubjectIds.includes(s.id);

                    return (
                      <tr
                        key={s.id}
                        className={`transition-colors ${
                          isIncluded ? '' : 'opacity-60 bg-[var(--secondary-bg)]/40'
                        }`}
                      >
                        {/* Name & Compulsory tag */}
                        <td>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              className="nyxa-input text-xs font-semibold py-1 px-2"
                              value={s.name}
                              onChange={(e) => updateSubject(s.id, 'name', e.target.value)}
                            />
                            <button
                              type="button"
                              onClick={() => updateSubject(s.id, 'isCompulsory', !s.isCompulsory)}
                              className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-mono font-bold transition-colors ${
                                s.isCompulsory
                                  ? 'bg-amber-500/20 text-amber-600 border border-amber-500/40'
                                  : 'bg-[var(--secondary-bg)] text-[var(--muted)] border border-[var(--border)]'
                              }`}
                              title="Toggle compulsory status for Best-of-5"
                            >
                              {s.isCompulsory ? 'Compulsory' : 'Optional'}
                            </button>
                          </div>
                        </td>

                        {/* Credits / Weight */}
                        <td>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            className="nyxa-input text-xs py-1 px-2 w-16 font-mono text-center"
                            value={s.credits}
                            onChange={(e) => updateSubject(s.id, 'credits', Math.max(1, Number(e.target.value)))}
                          />
                        </td>

                        {/* Marks Inputs */}
                        {detailedMode ? (
                          <>
                            <td>
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min="0"
                                  max={s.theoryMax}
                                  className="nyxa-input text-xs py-1 px-2 w-16"
                                  value={s.theoryObtained}
                                  onChange={(e) =>
                                    updateSubject(s.id, 'theoryObtained', Math.max(0, Number(e.target.value)))
                                  }
                                />
                                <span className="text-xs text-[var(--muted)]">/</span>
                                <input
                                  type="number"
                                  min="1"
                                  max="200"
                                  className="nyxa-input text-xs py-1 px-2 w-16"
                                  value={s.theoryMax}
                                  onChange={(e) =>
                                    updateSubject(s.id, 'theoryMax', Math.max(1, Number(e.target.value)))
                                  }
                                />
                              </div>
                            </td>
                            <td>
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min="0"
                                  max={s.practicalMax}
                                  className="nyxa-input text-xs py-1 px-2 w-16"
                                  value={s.practicalObtained}
                                  onChange={(e) =>
                                    updateSubject(s.id, 'practicalObtained', Math.max(0, Number(e.target.value)))
                                  }
                                />
                                <span className="text-xs text-[var(--muted)]">/</span>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  className="nyxa-input text-xs py-1 px-2 w-16"
                                  value={s.practicalMax}
                                  onChange={(e) =>
                                    updateSubject(s.id, 'practicalMax', Math.max(0, Number(e.target.value)))
                                  }
                                />
                              </div>
                            </td>
                          </>
                        ) : (
                          <td>
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="0"
                                max={s.theoryMax}
                                className="nyxa-input text-xs py-1 px-2 w-20"
                                value={s.theoryObtained}
                                onChange={(e) =>
                                  updateSubject(s.id, 'theoryObtained', Math.max(0, Number(e.target.value)))
                                }
                              />
                              <span className="text-xs text-[var(--muted)]">/</span>
                              <input
                                type="number"
                                min="1"
                                max="200"
                                className="nyxa-input text-xs py-1 px-2 w-20"
                                value={s.theoryMax}
                                onChange={(e) => {
                                  updateSubject(s.id, 'theoryMax', Math.max(1, Number(e.target.value)));
                                  updateSubject(s.id, 'practicalMax', 0);
                                  updateSubject(s.id, 'practicalObtained', 0);
                                }}
                              />
                            </div>
                          </td>
                        )}

                        {/* Calculated Total */}
                        <td className="font-mono text-xs font-semibold">
                          {totalObt} / {totalM}
                        </td>

                        {/* Percentage */}
                        <td>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold">{pct.toFixed(1)}%</span>
                            <div className="w-16 h-1.5 bg-[var(--secondary-bg)] rounded-full overflow-hidden border border-[var(--border)] hidden sm:block">
                              <div
                                className={`h-full ${
                                  pct >= 75
                                    ? 'bg-emerald-500'
                                    : pct >= 50
                                    ? 'bg-blue-500'
                                    : pct >= 33
                                    ? 'bg-amber-500'
                                    : 'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* CBSE Grade */}
                        <td>
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-[var(--secondary-bg)] border border-[var(--border)] font-bold">
                            {gradeInfo.grade}
                          </span>
                        </td>

                        {/* US Grade */}
                        <td>
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 border border-blue-500/30 font-bold">
                            {usGrade.letter} ({usGrade.point.toFixed(1)})
                          </span>
                        </td>

                        {/* Best of 5 status */}
                        <td>
                          {isIncluded ? (
                            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                              Included
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold text-gray-400 bg-gray-500/10 px-2 py-0.5 rounded border border-gray-500/30">
                              Excluded
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="text-right">
                          <button
                            onClick={() => removeSubject(s.id)}
                            disabled={subjects.length <= 1}
                            className="p-1 rounded text-red-500 hover:bg-red-500/10 disabled:opacity-30 transition-colors"
                            title="Delete subject"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Target Calculator Tab */}
      {activeTab === 'targetCalc' && (
        <div className="space-y-6">
          <div className="nyxa-card space-y-4">
            <h2 className="text-lg font-bold text-[var(--foreground)] border-b border-[var(--border)] pb-2 m-0">
              🎯 Target Percentage & Required Exam Score Calculator
            </h2>
            <p className="text-xs text-[var(--muted)]">
              Specify your target overall percentage and check off upcoming/remaining exams to calculate exact required marks.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor={targetPctId} className="nyxa-label">Target Overall Percentage (%)</label>
                <input
                  id={targetPctId}
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  className="nyxa-input font-bold text-lg"
                  value={targetPercentage}
                  onChange={(e) => setTargetPercentage(Number(e.target.value))}
                />
              </div>

              <div className="sm:col-span-2 flex flex-col justify-end">
                <div className={`p-3 rounded-lg border flex items-center justify-between text-xs font-semibold ${targetFeasibility.style}`}>
                  <span>Target Status: {targetFeasibility.status}</span>
                  <span className="font-mono text-sm font-bold">
                    Target: {targetPercentage}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="nyxa-card space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
              Mark Remaining / Upcoming Subjects
            </h3>
            <p className="text-xs text-[var(--muted)]">
              Check "Remaining Exam" for subjects you haven't taken yet.
            </p>

            <div className="space-y-2">
              {subjects.map((s) => (
                <div
                  key={s.id}
                  className="p-3 rounded-lg border border-[var(--border)] bg-[var(--secondary-bg)] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded accent-emerald-600 cursor-pointer"
                      checked={s.isTargetRemaining || false}
                      onChange={(e) => updateSubject(s.id, 'isTargetRemaining', e.target.checked)}
                    />
                    <div>
                      <span className="font-bold text-[var(--foreground)] block">{s.name}</span>
                      <span className="text-[11px] text-[var(--muted)]">
                        {s.isTargetRemaining ? 'Upcoming Exam (Pending)' : `Completed Marks: ${getSubjectTotalObtained(s)} / ${getSubjectTotalMax(s)}`}
                      </span>
                    </div>
                  </div>

                  <span className="font-mono font-semibold">
                    Max Marks: {getSubjectTotalMax(s)}
                  </span>
                </div>
              ))}
            </div>

            {targetRemainingSubjects.length > 0 && (
              <div className="p-4 rounded-lg bg-[var(--card-bg)] border border-[var(--accent)] space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                  Forecast Summary Results:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[var(--muted)] block">Completed Score:</span>
                    <span className="font-bold font-mono text-sm">{completedTotalObtained} / {completedTotalMax}</span>
                  </div>
                  <div>
                    <span className="text-[var(--muted)] block">Required Total Score:</span>
                    <span className="font-bold font-mono text-sm">{Math.ceil(requiredOverallMarks)} / {totalMax}</span>
                  </div>
                  <div>
                    <span className="text-[var(--muted)] block">Marks Needed in Remaining Exams:</span>
                    <span className="font-bold font-mono text-sm text-emerald-600">{Math.max(0, Math.ceil(neededRemainingMarks))} / {remainingTotalMax}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Global Conversions Tab */}
      {activeTab === 'conversions' && (
        <div className="nyxa-card space-y-4">
          <h2 className="text-lg font-bold text-[var(--foreground)] border-b border-[var(--border)] pb-2 m-0">
            🌐 Global Academic Grading Equivalency Matrix
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CBSE 9-Point Scale */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                CBSE 9-Point Grading Scale
              </h3>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                {[
                  { g: 'A1', p: '91-100%', pt: '10' },
                  { g: 'A2', p: '81-90%', pt: '9' },
                  { g: 'B1', p: '71-80%', pt: '8' },
                  { g: 'B2', p: '61-70%', pt: '7' },
                  { g: 'C1', p: '51-60%', pt: '6' },
                  { g: 'C2', p: '41-50%', pt: '5' },
                  { g: 'D1', p: '33-40%', pt: '4' },
                  { g: 'D2', p: '21-32%', pt: '0' },
                  { g: 'E', p: '0-20%', pt: '0' },
                ].map((item) => (
                  <div key={item.g} className="p-2 rounded bg-[var(--secondary-bg)] border border-[var(--border)]">
                    <span className="font-bold text-sm block">{item.g}</span>
                    <span className="text-[10px] text-[var(--muted)] block">{item.p}</span>
                    <span className="text-[10px] font-mono block">GP: {item.pt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* US GPA 4.0 Scale */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                US 4.0 GPA Standard Scale
              </h3>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                {[
                  { g: 'A', p: '93-100%', pt: '4.0' },
                  { g: 'A-', p: '90-92%', pt: '3.7' },
                  { g: 'B+', p: '87-89%', pt: '3.3' },
                  { g: 'B', p: '83-86%', pt: '3.0' },
                  { g: 'B-', p: '80-82%', pt: '2.7' },
                  { g: 'C+', p: '77-79%', pt: '2.3' },
                  { g: 'C', p: '73-76%', pt: '2.0' },
                  { g: 'D', p: '65-69%', pt: '1.0' },
                  { g: 'F', p: '<65%', pt: '0.0' },
                ].map((item) => (
                  <div key={item.g} className="p-2 rounded bg-[var(--secondary-bg)] border border-[var(--border)]">
                    <span className="font-bold text-sm block">{item.g}</span>
                    <span className="text-[10px] text-[var(--muted)] block">{item.p}</span>
                    <span className="text-[10px] font-mono block">GPA: {item.pt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Saved History Modal */}
      {showSavedModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="nyxa-card max-w-lg w-full max-h-[80vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <h2 className="text-lg font-bold border-0 p-0 m-0">Saved Report History</h2>
              <button
                onClick={() => setShowSavedModal(false)}
                className="p-1 text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {savedReports.length === 0 ? (
              <p className="text-sm text-[var(--muted)] text-center py-6">
                No saved reports yet. Click "Save Result" above to save grade cards.
              </p>
            ) : (
              <div className="space-y-3">
                {savedReports.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-3 rounded-lg border border-[var(--border)] bg-[var(--secondary-bg)] flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-semibold text-sm text-[var(--foreground)]">
                        {rep.studentName} ({rep.board} - {rep.className})
                      </div>
                      <div className="text-xs text-[var(--muted)]">
                        Date: {rep.date} • {rep.percentage}% ({rep.weightedPercentage}% weighted)
                      </div>
                      <div className="text-[11px] font-mono text-emerald-600 font-bold mt-0.5">
                        US GPA: {rep.usGpa} / 4.0 | CBSE: {rep.cbseCgpa} / 10
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
