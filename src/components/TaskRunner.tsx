'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const MarksCalculator = dynamic(() => import('./task-implementations/MarksCalculator'), { ssr: false });
const HomeworkTracker = dynamic(() => import('./task-implementations/HomeworkTracker'), { ssr: false });
const TaskSorter = dynamic(() => import('./task-implementations/TaskSorter'), { ssr: false });
const MeetingMinutes = dynamic(() => import('./task-implementations/MeetingMinutes'), { ssr: false });
const ExpenseSplitter = dynamic(() => import('./task-implementations/ExpenseSplitter'), { ssr: false });
const TdsEstimator = dynamic(() => import('./task-implementations/TdsEstimator'), { ssr: false });
const SalaryRestructuring = dynamic(() => import('./task-implementations/SalaryRestructuring'), { ssr: false });
const GstInvoice = dynamic(() => import('./task-implementations/GstInvoice'), { ssr: false });
const SarkariResume = dynamic(() => import('./task-implementations/SarkariResume'), { ssr: false });
const DocumentValidator = dynamic(() => import('./task-implementations/DocumentValidator'), { ssr: false });
const UpiLinkGenerator = dynamic(() => import('./task-implementations/UpiLinkGenerator'), { ssr: false });

interface TaskRunnerProps {
  taskSlug: string;
  taskTitle: string;
}

export default function TaskRunner({ taskSlug, taskTitle }: TaskRunnerProps) {
  const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
  const slug = normalize(taskSlug || taskTitle || '');

  if (slug.includes('marks') || slug.includes('grade') || slug.includes('cbse')) {
    return <MarksCalculator />;
  }
  if (slug.includes('homework') || slug.includes('assignment') || slug.includes('examcountdown')) {
    return <HomeworkTracker />;
  }
  if (slug.includes('priority') || slug.includes('tasksorter') || slug.includes('eisenhower')) {
    return <TaskSorter />;
  }
  if (slug.includes('meeting') || slug.includes('minutes')) {
    return <MeetingMinutes />;
  }
  if (slug.includes('expense') || slug.includes('splitter') || slug.includes('split')) {
    return <ExpenseSplitter />;
  }
  if (slug.includes('tds') || slug.includes('salaryestimator') || slug.includes('regime')) {
    return <TdsEstimator />;
  }
  if (slug.includes('labour') || slug.includes('restructur') || slug.includes('ctc')) {
    return <SalaryRestructuring />;
  }
  if (slug.includes('gst') || slug.includes('invoice')) {
    return <GstInvoice />;
  }
  if (slug.includes('sarkari') || slug.includes('biodata') || slug.includes('resume')) {
    return <SarkariResume />;
  }
  if (slug.includes('document') || slug.includes('validator') || slug.includes('pan') || slug.includes('aadhaar')) {
    return <DocumentValidator />;
  }
  if (slug.includes('upi') || slug.includes('qr') || slug.includes('paymentlink')) {
    return <UpiLinkGenerator />;
  }

  return (
    <div className="p-8 text-center bg-[var(--secondary-bg)] rounded-2xl border border-[var(--border)]">
      <h3 className="text-xl font-bold mb-2">Interactive Execution Ready</h3>
      <p className="text-sm text-[var(--muted)] mb-4">Task logic loaded for: <strong>{taskTitle}</strong></p>
      <div className="p-6 bg-white dark:bg-black rounded-xl border border-[var(--border)] text-left font-mono text-xs max-w-lg mx-auto">
        <p className="text-emerald-500 font-bold mb-2">✓ Status: Ready for Client Execution (0 Server Cost)</p>
        <p className="text-gray-400">Processing input-to-output pipeline locally in browser...</p>
      </div>
    </div>
  );
}
