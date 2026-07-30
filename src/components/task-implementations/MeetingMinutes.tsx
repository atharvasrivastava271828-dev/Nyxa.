'use client';

import { useState, useId } from 'react';

export interface AgendaItem {
  id: string;
  topic: string;
  presenter: string;
  durationMinutes: number;
}

export interface ActionItem {
  id: string;
  task: string;
  owner: string;
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string;
  status: 'Pending' | 'In Progress' | 'Done';
}

export interface MeetingDetails {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  chairperson: string;
  scribe: string;
  attendees: string;
  absent: string;
  summaryNotes: string;
  decisions: string[];
  agenda: AgendaItem[];
  actionItems: ActionItem[];
}

const TEMPLATES: Record<string, Partial<MeetingDetails>> = {
  standup: {
    title: 'Daily Engineering Standup',
    date: new Date().toISOString().slice(0, 10),
    attendees: 'Sarah, Alex, David, Elena',
    summaryNotes: 'Reviewed yesterday sprint progress, unblocked staging deployment, aligned on hotfix release.',
    decisions: [
      'Approved merge for API refactoring PR #142.',
      'Moved staging deployment window to 6 PM UTC.',
    ],
    actionItems: [
      {
        id: 'ai-1',
        task: 'Deploy v2.4 hotfix to staging server',
        owner: 'David',
        priority: 'High',
        dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        status: 'In Progress',
      },
      {
        id: 'ai-2',
        task: 'Update API documentation endpoints',
        owner: 'Elena',
        priority: 'Medium',
        dueDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
        status: 'Pending',
      },
    ],
  },
  kickoff: {
    title: 'Project Nyxa v3.0 Architecture Kickoff',
    date: new Date().toISOString().slice(0, 10),
    attendees: 'Marcus, Alex, Sam, Jordan, Taylor',
    summaryNotes: 'Established project scope, stack selection, team roles, and Q3 launch commitments.',
    decisions: [
      'Adopted Next.js 16 + Tailwind v4 as core frontend stack.',
      'Selected Supabase for realtime data syncing.',
    ],
    actionItems: [
      {
        id: 'ai-3',
        task: 'Setup initial GitHub repo & CI/CD pipeline',
        owner: 'Alex',
        priority: 'High',
        dueDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
        status: 'In Progress',
      },
      {
        id: 'ai-4',
        task: 'Draft Figma design component library',
        owner: 'Jordan',
        priority: 'High',
        dueDate: new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 10),
        status: 'Pending',
      },
    ],
  },
  retro: {
    title: 'Sprint Retrospective & Review',
    date: new Date().toISOString().slice(0, 10),
    attendees: 'Elena, Alex, David, Sarah',
    summaryNotes: 'Discussed sprint accomplishments, code review bottlenecks, and action items for next sprint.',
    decisions: [
      'Implement mandatory peer code reviews before merge.',
      'Limit work-in-progress to max 2 tickets per engineer.',
    ],
    actionItems: [
      {
        id: 'ai-5',
        task: 'Create pull request template with PR checklist',
        owner: 'Sarah',
        priority: 'Medium',
        dueDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
        status: 'Done',
      },
    ],
  },
};

export default function MeetingMinutes() {
  const titleId = useId();
  const dateId = useId();
  const attendeesId = useId();

  const [meeting, setMeeting] = useState<MeetingDetails>({
    id: 'mtg-1',
    title: 'Weekly Team Alignment Sync',
    date: new Date().toISOString().slice(0, 10),
    time: '10:00 AM - 11:00 AM',
    location: 'Google Meet',
    chairperson: 'Sarah Connor',
    scribe: 'Alex Morgan',
    attendees: 'Sarah, Alex, David, Elena',
    absent: 'None',
    summaryNotes: 'Reviewed upcoming feature deliverables, resolved database migration blockers, and set sprint priorities.',
    decisions: [
      'Finalized database schema for user workspace profiles.',
      'Approved release window for Tuesday 10:00 AM UTC.',
    ],
    agenda: [],
    actionItems: [
      {
        id: 'ai-1',
        task: 'Deploy backend database migration script',
        owner: 'David',
        priority: 'High',
        dueDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
        status: 'In Progress',
      },
      {
        id: 'ai-2',
        task: 'Write unit tests for authentication hooks',
        owner: 'Elena',
        priority: 'Medium',
        dueDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
        status: 'Pending',
      },
    ],
  });

  const [newDecision, setNewDecision] = useState('');
  const [newActionTask, setNewActionTask] = useState('');
  const [newActionOwner, setNewActionOwner] = useState('');
  const [copiedMd, setCopiedMd] = useState(false);

  const applyTemplate = (key: keyof typeof TEMPLATES) => {
    const tmpl = TEMPLATES[key];
    setMeeting((prev) => ({
      ...prev,
      ...tmpl,
    }));
  };

  const addDecision = () => {
    if (!newDecision.trim()) return;
    setMeeting({
      ...meeting,
      decisions: [...meeting.decisions, newDecision.trim()],
    });
    setNewDecision('');
  };

  const removeDecision = (index: number) => {
    setMeeting({
      ...meeting,
      decisions: meeting.decisions.filter((_, i) => i !== index),
    });
  };

  const addActionItem = () => {
    if (!newActionTask.trim()) return;
    const item: ActionItem = {
      id: `ai-${Date.now()}`,
      task: newActionTask.trim(),
      owner: newActionOwner.trim() || 'Assignee',
      priority: 'Medium',
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
      status: 'Pending',
    };
    setMeeting({
      ...meeting,
      actionItems: [...meeting.actionItems, item],
    });
    setNewActionTask('');
    setNewActionOwner('');
  };

  const removeActionItem = (id: string) => {
    setMeeting({
      ...meeting,
      actionItems: meeting.actionItems.filter((ai) => ai.id !== id),
    });
  };

  const generateMarkdown = () => {
    let md = `# 📝 ${meeting.title || 'Meeting Minutes'}\n`;
    md += `**Date:** ${meeting.date} | **Attendees:** ${meeting.attendees || 'None'}\n\n`;
    md += `## 📌 Discussion & Summary\n${meeting.summaryNotes || 'No summary notes.'}\n\n`;
    md += `## ✅ Key Decisions\n`;
    if (meeting.decisions.length === 0) {
      md += `*No key decisions recorded.*\n\n`;
    } else {
      meeting.decisions.forEach((d) => {
        md += `- [x] ${d}\n`;
      });
      md += `\n`;
    }
    md += `## 🎯 Action Items\n`;
    if (meeting.actionItems.length === 0) {
      md += `*No action items assigned.*\n`;
    } else {
      meeting.actionItems.forEach((ai) => {
        md += `- [ ] **${ai.task}** (Owner: @${ai.owner}, Due: ${ai.dueDate})\n`;
      });
    }
    return md;
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(generateMarkdown());
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
            Meeting Minutes
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-0.5">
            Structure notes, decisions, and action items with 1-click Markdown export.
          </p>
        </div>

        <button
          onClick={handleCopyMarkdown}
          className="nyxa-btn nyxa-btn-primary text-xs flex items-center justify-center gap-1.5 self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002-2h2a2 2 0 002-2M8 5a2 2 0 002 0h2a2 2 0 002 2" />
          </svg>
          {copiedMd ? 'Copied!' : 'Copy Minutes (MD)'}
        </button>
      </div>

      {/* Quick Presets Bar */}
      <div className="nyxa-card p-3 flex flex-wrap items-center justify-between gap-2 bg-[var(--secondary-bg)]">
        <span className="text-xs font-semibold text-[var(--muted)]">Quick Presets:</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => applyTemplate('standup')}
            className="px-2.5 py-1 text-xs rounded-md border border-[var(--border)] bg-[var(--card-bg)] hover:border-[var(--accent)] transition-colors"
          >
            Standup
          </button>
          <button
            onClick={() => applyTemplate('kickoff')}
            className="px-2.5 py-1 text-xs rounded-md border border-[var(--border)] bg-[var(--card-bg)] hover:border-[var(--accent)] transition-colors"
          >
            Project Kickoff
          </button>
          <button
            onClick={() => applyTemplate('retro')}
            className="px-2.5 py-1 text-xs rounded-md border border-[var(--border)] bg-[var(--card-bg)] hover:border-[var(--accent)] transition-colors"
          >
            Retrospective
          </button>
        </div>
      </div>

      {/* 2-Column Main Layout: Inputs on Left, Outcome Card on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Entry Form */}
        <div className="space-y-4">
          {/* Details Card */}
          <div className="nyxa-card p-4 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Meeting Overview
            </span>

            <div className="space-y-2.5">
              <div>
                <label htmlFor={titleId} className="nyxa-label text-xs">Title</label>
                <input
                  id={titleId}
                  type="text"
                  className="nyxa-input text-xs font-semibold py-1.5"
                  value={meeting.title}
                  onChange={(e) => setMeeting({ ...meeting, title: e.target.value })}
                  placeholder="Meeting Title"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor={dateId} className="nyxa-label text-xs">Date</label>
                  <input
                    id={dateId}
                    type="date"
                    className="nyxa-input text-xs py-1.5"
                    value={meeting.date}
                    onChange={(e) => setMeeting({ ...meeting, date: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor={attendeesId} className="nyxa-label text-xs">Attendees</label>
                  <input
                    id={attendeesId}
                    type="text"
                    className="nyxa-input text-xs py-1.5"
                    value={meeting.attendees}
                    onChange={(e) => setMeeting({ ...meeting, attendees: e.target.value })}
                    placeholder="Alex, Sarah..."
                  />
                </div>
              </div>

              <div>
                <label className="nyxa-label text-xs">Summary / Discussion Notes</label>
                <textarea
                  className="nyxa-textarea text-xs min-h-[100px]"
                  value={meeting.summaryNotes}
                  onChange={(e) => setMeeting({ ...meeting, summaryNotes: e.target.value })}
                  placeholder="Key points discussed..."
                />
              </div>
            </div>
          </div>

          {/* Decisions Card */}
          <div className="nyxa-card p-4 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Key Decisions ({meeting.decisions.length})
            </span>

            <div className="flex items-center gap-2">
              <input
                type="text"
                className="nyxa-input text-xs py-1.5"
                placeholder="Add key decision..."
                value={newDecision}
                onChange={(e) => setNewDecision(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDecision())}
              />
              <button
                type="button"
                onClick={addDecision}
                className="nyxa-btn nyxa-btn-secondary text-xs shrink-0 py-1.5"
              >
                + Add
              </button>
            </div>

            <div className="space-y-1.5 pt-1">
              {meeting.decisions.map((d, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-lg border border-[var(--border)] bg-[var(--secondary-bg)] flex items-center justify-between text-xs"
                >
                  <span className="text-[var(--foreground)]">✓ {d}</span>
                  <button
                    onClick={() => removeDecision(idx)}
                    className="text-[var(--muted)] hover:text-red-500 transition-colors ml-2"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Action Items Card */}
          <div className="nyxa-card p-4 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Action Items ({meeting.actionItems.length})
            </span>

            <div className="grid grid-cols-12 gap-2">
              <input
                type="text"
                className="col-span-7 nyxa-input text-xs py-1.5"
                placeholder="Action task..."
                value={newActionTask}
                onChange={(e) => setNewActionTask(e.target.value)}
              />
              <input
                type="text"
                className="col-span-3 nyxa-input text-xs py-1.5"
                placeholder="Owner"
                value={newActionOwner}
                onChange={(e) => setNewActionOwner(e.target.value)}
              />
              <button
                type="button"
                onClick={addActionItem}
                className="col-span-2 nyxa-btn nyxa-btn-secondary text-xs py-1.5"
              >
                + Add
              </button>
            </div>

            <div className="space-y-1.5 pt-1">
              {meeting.actionItems.map((ai) => (
                <div
                  key={ai.id}
                  className="p-2 rounded-lg border border-[var(--border)] bg-[var(--secondary-bg)] flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-[var(--foreground)] block">{ai.task}</span>
                    <span className="text-[10px] text-[var(--muted)]">Owner: @{ai.owner}</span>
                  </div>
                  <button
                    onClick={() => removeActionItem(ai.id)}
                    className="text-[var(--muted)] hover:text-red-500 transition-colors ml-2"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Formatted Outcome Card */}
        <div className="nyxa-card p-6 bg-gradient-to-br from-[var(--secondary-bg)] via-[var(--card-bg)] to-[var(--card-bg)] space-y-4 h-full">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Live Structured Minutes Preview
            </span>
            <span className="text-xs font-mono text-[var(--muted)]">Markdown</span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <h2 className="text-lg font-bold text-[var(--foreground)] m-0 border-0 p-0">
                {meeting.title || 'Untitled Meeting'}
              </h2>
              <p className="text-[11px] text-[var(--muted)] m-0 mt-0.5">
                {meeting.date} • Attendees: {meeting.attendees || 'None'}
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-[var(--foreground)] uppercase text-[10px] tracking-wider block text-[var(--muted)]">
                Discussion & Summary
              </span>
              <p className="text-xs text-[var(--foreground)] m-0 leading-relaxed bg-[var(--secondary-bg)] p-3 rounded-lg border border-[var(--border)]">
                {meeting.summaryNotes || 'No summary notes entered yet.'}
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-bold uppercase text-[10px] tracking-wider block text-[var(--muted)]">
                Key Decisions ({meeting.decisions.length})
              </span>
              {meeting.decisions.length === 0 ? (
                <p className="text-[11px] text-[var(--muted)] italic">No decisions recorded.</p>
              ) : (
                <div className="space-y-1">
                  {meeting.decisions.map((d, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-[var(--foreground)]">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <span className="font-bold uppercase text-[10px] tracking-wider block text-[var(--muted)]">
                Action Items ({meeting.actionItems.length})
              </span>
              {meeting.actionItems.length === 0 ? (
                <p className="text-[11px] text-[var(--muted)] italic">No action items assigned.</p>
              ) : (
                <div className="space-y-1.5">
                  {meeting.actionItems.map((ai) => (
                    <div key={ai.id} className="p-2 rounded-md border border-[var(--border)] bg-[var(--secondary-bg)] text-xs flex justify-between items-center">
                      <span className="font-medium text-[var(--foreground)]">{ai.task}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[var(--card-bg)] border border-[var(--border)] text-[var(--muted)]">
                        @{ai.owner}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
