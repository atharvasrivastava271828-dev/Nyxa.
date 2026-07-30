'use client';

import React, { useState, useEffect, useId } from 'react';

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
    title: 'Daily Team Engineering Standup',
    location: 'Google Meet (meet.google.com/abc-defg-hij)',
    chairperson: 'Sarah Connor',
    scribe: 'Alex Morgan',
    attendees: 'Sarah C., Alex M., David K., Elena R.',
    absent: 'None',
    summaryNotes: 'Reviewed yesterday sprint progress, discussed blocking PRs, and aligned on today deployments.',
    decisions: [
      'Approved merge for API refactoring pull request #142.',
      'Moved staging deployment window from 4 PM to 6 PM.',
    ],
    agenda: [
      { id: 'ag-1', topic: 'Yesterday Progress & Today Focus', presenter: 'All Team', durationMinutes: 10 },
      { id: 'ag-2', topic: 'Blockers & Code Reviews', presenter: 'Alex M.', durationMinutes: 5 },
    ],
    actionItems: [
      { id: 'ai-1', task: 'Deploy v2.4 hotfix to staging server', owner: 'David K.', priority: 'High', dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10), status: 'In Progress' },
      { id: 'ai-2', task: 'Update API documentation endpoints', owner: 'Elena R.', priority: 'Medium', dueDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10), status: 'Pending' },
    ],
  },
  kickoff: {
    title: 'Project Nyxa v3.0 Architecture Kickoff',
    location: 'Conference Room 4B / Zoom',
    chairperson: 'Marcus Brody',
    scribe: 'Alex Morgan',
    attendees: 'Marcus B., Alex M., Sam P., Jordan T., Taylor R.',
    absent: 'Chris L. (On Leave)',
    summaryNotes: 'Established project scope, architecture guidelines, team responsibilities, and key target milestones.',
    decisions: [
      'Adopted Next.js 16 + Tailwind v4 as core frontend stack.',
      'Selected Supabase for realtime backend syncing.',
      'Target MVP launch date confirmed for end of Q3.',
    ],
    agenda: [
      { id: 'ag-3', topic: 'Project Objectives & Scope Overview', presenter: 'Marcus B.', durationMinutes: 15 },
      { id: 'ag-4', topic: 'Technical Architecture & Stack Selection', presenter: 'Alex M.', durationMinutes: 25 },
      { id: 'ag-5', topic: 'Q&A and Milestone Commitments', presenter: 'All', durationMinutes: 20 },
    ],
    actionItems: [
      { id: 'ai-3', task: 'Setup initial GitHub repo & CI/CD pipelines', owner: 'Alex M.', priority: 'High', dueDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10), status: 'In Progress' },
      { id: 'ai-4', task: 'Draft Figma design component library', owner: 'Jordan T.', priority: 'High', dueDate: new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 10), status: 'Pending' },
    ],
  },
  retro: {
    title: 'Sprint 14 Retrospective & Review',
    location: 'Huddle Room / Teams',
    chairperson: 'Elena Rostova',
    scribe: 'Alex Morgan',
    attendees: 'Elena R., Alex M., David K., Sarah C.',
    absent: 'None',
    summaryNotes: 'Discussed what went well, what could be improved, and specific actionable steps for Sprint 15.',
    decisions: [
      'Implement mandatory code reviews before merge.',
      'Limit WIP items per engineer to max 2 concurrent tickets.',
    ],
    agenda: [
      { id: 'ag-6', topic: 'What Went Well', presenter: 'Elena R.', durationMinutes: 15 },
      { id: 'ag-7', topic: 'Areas of Improvement', presenter: 'David K.', durationMinutes: 15 },
      { id: 'ag-8', topic: 'Action Commitments for Sprint 15', presenter: 'All', durationMinutes: 15 },
    ],
    actionItems: [
      { id: 'ai-5', task: 'Create pull request template with PR checklist', owner: 'Sarah C.', priority: 'Medium', dueDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10), status: 'Done' },
    ],
  },
};

const SAMPLE_AUDIO_TRANSCRIPTS = [
  {
    name: 'Voice Note 1: Engineering Sync',
    text: `Sarah opened the engineering sync at 10 AM. We discussed the API latency issue in production. David explained that database queries were lacking proper indexes. We decided to add composite indexes to the users table by tomorrow. David will write and deploy the migration script by Friday. Elena will write integration unit tests for the authentication hooks by next Monday. Alex suggested moving the release window to 6 PM UTC, which everyone agreed to.`,
  },
  {
    name: 'Voice Note 2: Product Architecture',
    text: `Meeting started with Marcus presenting the Q3 roadmap. We agreed to adopt Tailwind CSS v4 and Next.js 16 for all new UI components. Marcus will draft the project charter by Wednesday. Jordan to design the preliminary Figma mockups by Friday. We decided to conduct weekly design review syncs every Tuesday.`,
  },
];

export default function MeetingMinutes() {
  const titleId = useId();
  const dateId = useId();
  const timeId = useId();
  const locationId = useId();
  const chairpersonId = useId();
  const scribeId = useId();

  const [meeting, setMeeting] = useState<MeetingDetails>({
    id: 'mtg-1',
    title: 'Weekly Nyxa Team Alignment Sync',
    date: new Date().toISOString().slice(0, 10),
    time: '10:00 AM - 11:00 AM',
    location: 'Google Meet',
    chairperson: 'Sarah Connor',
    scribe: 'Alex Morgan',
    attendees: 'Sarah C., Alex M., David K., Elena R.',
    absent: 'Chris L.',
    summaryNotes: 'Reviewed upcoming feature deliverables, resolved blocker on database migrations, and assigned release tasks.',
    decisions: [
      'Finalized database schema for user workspace profiles.',
      'Approved release window for Tuesday 10:00 AM UTC.',
    ],
    agenda: [
      { id: 'ag-1', topic: 'Weekly Status Updates & Metrics', presenter: 'Sarah C.', durationMinutes: 15 },
      { id: 'ag-2', topic: 'Database Migration Architecture Review', presenter: 'Alex M.', durationMinutes: 25 },
      { id: 'ag-3', topic: 'Q&A & Action Item Assignment', presenter: 'All', durationMinutes: 15 },
    ],
    actionItems: [
      { id: 'ai-1', task: 'Deploy backend database migration script', owner: 'David K.', priority: 'High', dueDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10), status: 'In Progress' },
      { id: 'ai-2', task: 'Write unit tests for authentication hooks', owner: 'Elena R.', priority: 'Medium', dueDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10), status: 'Pending' },
    ],
  });

  const [copyMarkdownStatus, setCopyMarkdownStatus] = useState(false);
  const [copyHtmlStatus, setCopyHtmlStatus] = useState(false);
  const [newDecisionInput, setNewDecisionInput] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  const [showPrintPdfModal, setShowPrintPdfModal] = useState(false);

  // Email Draft State
  const [selectedEmailAssignee, setSelectedEmailAssignee] = useState<string>('All');
  const [emailCopied, setEmailCopied] = useState(false);

  // Transcript Parser State
  const [rawTranscriptText, setRawTranscriptText] = useState('');
  const [parsedResults, setParsedResults] = useState<{
    summary: string;
    decisions: string[];
    actionItems: ActionItem[];
  } | null>(null);

  const [savedDrafts, setSavedDrafts] = useState<MeetingDetails[]>([]);

  // Load saved drafts
  useEffect(() => {
    try {
      const stored = localStorage.getItem('nyxa_meeting_drafts');
      if (stored) {
        setSavedDrafts(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load drafts', e);
    }
  }, []);

  const saveMeetingDraft = () => {
    const updated = [meeting, ...savedDrafts.filter((d) => d.id !== meeting.id)];
    setSavedDrafts(updated);
    try {
      localStorage.setItem('nyxa_meeting_drafts', JSON.stringify(updated));
      alert('Meeting minutes draft saved locally!');
    } catch (e) {
      console.error('Save failed', e);
    }
  };

  const applyTemplate = (key: keyof typeof TEMPLATES) => {
    const tmpl = TEMPLATES[key];
    setMeeting((prev) => ({
      ...prev,
      ...tmpl,
      date: new Date().toISOString().slice(0, 10),
    }));
  };

  // Field updaters
  const updateField = (field: keyof MeetingDetails, value: any) => {
    setMeeting({ ...meeting, [field]: value });
  };

  // Agenda Item handlers
  const addAgendaItem = () => {
    const newItem: AgendaItem = {
      id: `ag-${Date.now()}`,
      topic: 'New Topic',
      presenter: 'Assignee',
      durationMinutes: 15,
    };
    setMeeting({ ...meeting, agenda: [...meeting.agenda, newItem] });
  };

  const updateAgendaItem = (id: string, field: keyof AgendaItem, val: any) => {
    setMeeting({
      ...meeting,
      agenda: meeting.agenda.map((ag) => (ag.id === id ? { ...ag, [field]: val } : ag)),
    });
  };

  const removeAgendaItem = (id: string) => {
    setMeeting({ ...meeting, agenda: meeting.agenda.filter((ag) => ag.id !== id) });
  };

  // Action Item handlers
  const addActionItem = () => {
    const newItem: ActionItem = {
      id: `ai-${Date.now()}`,
      task: 'New Action Task',
      owner: 'Assignee',
      priority: 'Medium',
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
      status: 'Pending',
    };
    setMeeting({ ...meeting, actionItems: [...meeting.actionItems, newItem] });
  };

  const updateActionItem = (id: string, field: keyof ActionItem, val: any) => {
    setMeeting({
      ...meeting,
      actionItems: meeting.actionItems.map((ai) => (ai.id === id ? { ...ai, [field]: val } : ai)),
    });
  };

  const removeActionItem = (id: string) => {
    setMeeting({ ...meeting, actionItems: meeting.actionItems.filter((ai) => ai.id !== id) });
  };

  // Decision handlers
  const addDecision = () => {
    if (!newDecisionInput.trim()) return;
    setMeeting({ ...meeting, decisions: [...meeting.decisions, newDecisionInput.trim()] });
    setNewDecisionInput('');
  };

  const removeDecision = (idx: number) => {
    setMeeting({ ...meeting, decisions: meeting.decisions.filter((_, i) => i !== idx) });
  };

  // TRANSCRIPT PARSER SIMULATOR ENGINE
  const parseTranscript = () => {
    if (!rawTranscriptText.trim()) return;

    const lines = rawTranscriptText.split(/\.|\n/).map((s) => s.trim()).filter((s) => s.length > 0);
    const extractedDecisions: string[] = [];
    const extractedActions: ActionItem[] = [];
    let summaryBuffer: string[] = [];

    lines.forEach((sentence, idx) => {
      const lower = sentence.toLowerCase();

      // Check decisions keywords
      if (
        lower.includes('decided') ||
        lower.includes('agreed') ||
        lower.includes('approved') ||
        lower.includes('concluded')
      ) {
        extractedDecisions.push(sentence);
      }
      // Check action keywords: "[Name] will [task]", "[Name] to [task]"
      else if (
        lower.includes('will') ||
        lower.includes('to draft') ||
        lower.includes('to design') ||
        lower.includes('to write') ||
        lower.includes('action item') ||
        lower.includes('todo')
      ) {
        // Simple entity extractor
        const words = sentence.split(' ');
        const ownerCandidate = words[0].replace(/[^a-zA-Z]/g, '') || 'Team Member';
        extractedActions.push({
          id: `ai-parsed-${Date.now()}-${idx}`,
          task: sentence,
          owner: ownerCandidate.length > 2 ? ownerCandidate : 'Assignee',
          priority: lower.includes('urgent') || lower.includes('immediately') ? 'High' : 'Medium',
          dueDate: new Date(Date.now() + 86400000 * (idx + 2)).toISOString().slice(0, 10),
          status: 'Pending',
        });
      } else {
        summaryBuffer.push(sentence);
      }
    });

    setParsedResults({
      summary: summaryBuffer.join('. ') + '.',
      decisions: extractedDecisions.length > 0 ? extractedDecisions : ['Approved alignment on key objectives.'],
      actionItems: extractedActions,
    });
  };

  const applyParsedResultsToMeeting = () => {
    if (!parsedResults) return;
    setMeeting((prev) => ({
      ...prev,
      summaryNotes: (prev.summaryNotes ? prev.summaryNotes + '\n\n' : '') + parsedResults.summary,
      decisions: [...prev.decisions, ...parsedResults.decisions],
      actionItems: [...prev.actionItems, ...parsedResults.actionItems],
    }));
    setShowTranscriptModal(false);
    setParsedResults(null);
    setRawTranscriptText('');
  };

  // EMAIL DRAFT GENERATOR
  const generateActionItemsEmail = () => {
    const filteredActions =
      selectedEmailAssignee === 'All'
        ? meeting.actionItems
        : meeting.actionItems.filter(
            (ai) => ai.owner.toLowerCase() === selectedEmailAssignee.toLowerCase()
          );

    let body = `Hi Team,\n\n`;
    body += `Here is the action item breakdown following our meeting: "${meeting.title}" on ${meeting.date}.\n\n`;
    body += `--------------------------------------------------\n`;
    body += `ACTION ITEMS & ASSIGNMENTS:\n`;
    body += `--------------------------------------------------\n`;

    if (filteredActions.length === 0) {
      body += `No pending action items assigned.\n`;
    } else {
      filteredActions.forEach((ai, idx) => {
        body += `${idx + 1}. [${ai.priority} Priority] ${ai.task}\n`;
        body += `   - Owner: ${ai.owner}\n`;
        body += `   - Due Date: ${ai.dueDate}\n`;
        body += `   - Status: ${ai.status}\n\n`;
      });
    }

    body += `--------------------------------------------------\n`;
    body += `KEY DECISIONS SUMMARY:\n`;
    meeting.decisions.forEach((dec) => {
      body += `✓ ${dec}\n`;
    });

    body += `\nPlease reply if you need any adjustments to these assignments.\n\nBest regards,\n${meeting.scribe || 'Meeting Host'}`;

    return {
      subject: `[Action Required] Action Items: ${meeting.title} (${meeting.date})`,
      body,
    };
  };

  const emailDraftData = generateActionItemsEmail();

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(`Subject: ${emailDraftData.subject}\n\n${emailDraftData.body}`);
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  // Formatters: Markdown & HTML
  const generateMarkdown = () => {
    let md = `# 📝 Meeting Minutes: ${meeting.title}\n\n`;
    md += `**Date:** ${meeting.date} | **Time:** ${meeting.time}\n`;
    md += `**Location/Link:** ${meeting.location}\n`;
    md += `**Chairperson:** ${meeting.chairperson} | **Minute Taker:** ${meeting.scribe}\n`;
    md += `**Attendees:** ${meeting.attendees}\n`;
    md += `**Absent:** ${meeting.absent}\n\n`;
    md += `---\n\n`;

    md += `## 📋 Agenda & Topics\n`;
    if (meeting.agenda.length === 0) {
      md += `*No formal agenda listed.*\n\n`;
    } else {
      meeting.agenda.forEach((ag, idx) => {
        md += `${idx + 1}. **${ag.topic}** (${ag.durationMinutes} mins) - *Presenter:* ${ag.presenter}\n`;
      });
      md += `\n`;
    }

    md += `## 📌 Summary Notes & Discussion\n`;
    md += `${meeting.summaryNotes || 'No summary notes recorded.'}\n\n`;

    md += `## ✅ Key Decisions Made\n`;
    if (meeting.decisions.length === 0) {
      md += `*No key decisions recorded.*\n\n`;
    } else {
      meeting.decisions.forEach((dec) => {
        md += `- [x] **Decision:** ${dec}\n`;
      });
      md += `\n`;
    }

    md += `## 🎯 Action Items & Assignments\n\n`;
    md += `| Task Description | Assignee / Owner | Priority | Due Date | Status |\n`;
    md += `| :--- | :--- | :--- | :--- | :--- |\n`;

    if (meeting.actionItems.length === 0) {
      md += `| *No action items* | - | - | - | - |\n`;
    } else {
      meeting.actionItems.forEach((ai) => {
        md += `| ${ai.task} | **${ai.owner}** | ${ai.priority} | \`${ai.dueDate}\` | ${ai.status} |\n`;
      });
    }

    md += `\n---\n*Generated using Nyxa Meeting Minutes Structurer*\n`;
    return md;
  };

  const generateHTML = () => {
    let html = `<div style="font-family: Arial, sans-serif; max-w: 700px; line-height: 1.5; color: #111;">\n`;
    html += `  <h1 style="color: #000; border-bottom: 2px solid #e4e4e7; padding-bottom: 8px;">📝 Meeting Minutes: ${meeting.title}</h1>\n`;
    html += `  <p style="background: #fafafa; padding: 12px; border-radius: 6px; border: 1px solid #e4e4e7; font-size: 14px;">\n`;
    html += `    <strong>Date:</strong> ${meeting.date} &bull; <strong>Time:</strong> ${meeting.time}<br/>\n`;
    html += `    <strong>Location:</strong> ${meeting.location}<br/>\n`;
    html += `    <strong>Chairperson:</strong> ${meeting.chairperson} &bull; <strong>Note Taker:</strong> ${meeting.scribe}<br/>\n`;
    html += `    <strong>Attendees:</strong> ${meeting.attendees}<br/>\n`;
    html += `    <strong>Absent:</strong> ${meeting.absent}\n`;
    html += `  </p>\n`;

    html += `  <h2 style="font-size: 18px; color: #222; margin-top: 20px;">📋 Agenda & Topics</h2>\n`;
    html += `  <ul>\n`;
    meeting.agenda.forEach((ag) => {
      html += `    <li><strong>${ag.topic}</strong> (${ag.durationMinutes} mins) &ndash; <em>${ag.presenter}</em></li>\n`;
    });
    html += `  </ul>\n`;

    html += `  <h2 style="font-size: 18px; color: #222; margin-top: 20px;">📌 Summary & Key Discussion</h2>\n`;
    html += `  <p style="font-size: 14px; color: #333;">${meeting.summaryNotes || 'None'}</p>\n`;

    html += `  <h2 style="font-size: 18px; color: #222; margin-top: 20px;">✅ Key Decisions Made</h2>\n`;
    html += `  <ul>\n`;
    meeting.decisions.forEach((dec) => {
      html += `    <li style="font-weight: bold; color: #047857;">${dec}</li>\n`;
    });
    html += `  </ul>\n`;

    html += `  <h2 style="font-size: 18px; color: #222; margin-top: 20px;">🎯 Action Items & Assignments</h2>\n`;
    html += `  <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13px;">\n`;
    html += `    <thead>\n`;
    html += `      <tr style="background: #f4f4f5; border-bottom: 2px solid #d4d4d8;">\n`;
    html += `        <th style="padding: 8px;">Task</th>\n`;
    html += `        <th style="padding: 8px;">Owner</th>\n`;
    html += `        <th style="padding: 8px;">Priority</th>\n`;
    html += `        <th style="padding: 8px;">Due Date</th>\n`;
    html += `        <th style="padding: 8px;">Status</th>\n`;
    html += `      </tr>\n`;
    html += `    </thead>\n`;
    html += `    <tbody>\n`;
    meeting.actionItems.forEach((ai) => {
      html += `      <tr style="border-bottom: 1px solid #e4e4e7;">\n`;
      html += `        <td style="padding: 8px;">${ai.task}</td>\n`;
      html += `        <td style="padding: 8px;"><strong>${ai.owner}</strong></td>\n`;
      html += `        <td style="padding: 8px;">${ai.priority}</td>\n`;
      html += `        <td style="padding: 8px; font-family: monospace;">${ai.dueDate}</td>\n`;
      html += `        <td style="padding: 8px;">${ai.status}</td>\n`;
      html += `      </tr>\n`;
    });
    html += `    </tbody>\n`;
    html += `  </table>\n`;
    html += `</div>\n`;

    return html;
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(generateMarkdown());
    setCopyMarkdownStatus(true);
    setTimeout(() => setCopyMarkdownStatus(false), 2000);
  };

  const handleCopyHTML = () => {
    const htmlText = generateHTML();
    try {
      const blobHtml = new Blob([htmlText], { type: 'text/html' });
      const blobText = new Blob([generateMarkdown()], { type: 'text/plain' });
      const data = [new ClipboardItem({ 'text/html': blobHtml, 'text/plain': blobText })];
      navigator.clipboard.write(data);
    } catch (e) {
      navigator.clipboard.writeText(htmlText);
    }
    setCopyHtmlStatus(true);
    setTimeout(() => setCopyHtmlStatus(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([generateMarkdown()], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${meeting.title.replace(/\s+/g, '_')}_Minutes.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintDocument = () => {
    setShowPrintPdfModal(true);
    setTimeout(() => {
      window.print();
    }, 400);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-[var(--secondary-bg)] border border-[var(--border)] text-[var(--foreground)]">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-.586-1.414l-4.5-4.5A2 2 0 0015.586 3H13" />
              </svg>
            </span>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--foreground)]">
              Meeting Minutes Structurer
            </h1>
          </div>
          <p className="text-sm text-[var(--muted)] mt-1">
            Action items email draft generator, voice notes transcript parser, Markdown/HTML export, and PDF print layout.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowTranscriptModal(true)}
            className="nyxa-btn nyxa-btn-secondary text-xs flex items-center gap-1.5"
          >
            🎙️ Audio Transcript Parser
          </button>
          <button
            onClick={() => setShowEmailModal(true)}
            className="nyxa-btn nyxa-btn-secondary text-xs flex items-center gap-1.5"
          >
            ✉️ Email Draft Generator
          </button>
          <button
            onClick={handlePrintDocument}
            className="nyxa-btn nyxa-btn-secondary text-xs flex items-center gap-1.5"
          >
            🖨️ PDF / Print Export
          </button>
          <button
            onClick={saveMeetingDraft}
            className="nyxa-btn nyxa-btn-secondary text-xs flex items-center gap-1.5"
          >
            Save Draft
          </button>
          <button
            onClick={handleDownloadMarkdown}
            className="nyxa-btn nyxa-btn-secondary text-xs flex items-center gap-1.5"
          >
            Download .MD
          </button>
          <button
            onClick={handleCopyMarkdown}
            className="nyxa-btn nyxa-btn-primary text-xs flex items-center gap-1.5"
          >
            {copyMarkdownStatus ? 'Markdown Copied!' : 'Copy Markdown'}
          </button>
        </div>
      </div>

      {/* Quick Template Switcher Bar */}
      <div className="nyxa-card p-3 space-y-2 bg-[var(--secondary-bg)] print:hidden">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[var(--muted)]">Load Preset Template:</span>
          <button
            onClick={() => applyTemplate('standup')}
            className="px-2.5 py-1 text-xs font-medium rounded-md border border-[var(--border)] bg-[var(--card-bg)] hover:border-[var(--accent)] transition-colors"
          >
            ☕ Daily Standup
          </button>
          <button
            onClick={() => applyTemplate('kickoff')}
            className="px-2.5 py-1 text-xs font-medium rounded-md border border-[var(--border)] bg-[var(--card-bg)] hover:border-[var(--accent)] transition-colors"
          >
            🚀 Project Kickoff
          </button>
          <button
            onClick={() => applyTemplate('retro')}
            className="px-2.5 py-1 text-xs font-medium rounded-md border border-[var(--border)] bg-[var(--card-bg)] hover:border-[var(--accent)] transition-colors"
          >
            🔄 Sprint Retrospective
          </button>
        </div>
      </div>

      {/* Main Details Form Grid */}
      <div className="nyxa-card space-y-4 print:hidden">
        <h2 className="text-lg font-bold text-[var(--foreground)] border-b border-[var(--border)] pb-2 m-0">
          Meeting Overview & Metadata
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <label htmlFor={titleId} className="nyxa-label">Meeting Title *</label>
            <input
              id={titleId}
              type="text"
              className="nyxa-input font-bold"
              value={meeting.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="e.g. Weekly Product Sync"
            />
          </div>

          <div>
            <label htmlFor={locationId} className="nyxa-label">Location / Call Link</label>
            <input
              id={locationId}
              type="text"
              className="nyxa-input text-xs"
              value={meeting.location}
              onChange={(e) => updateField('location', e.target.value)}
              placeholder="e.g. Google Meet / Room 402"
            />
          </div>

          <div>
            <label htmlFor={dateId} className="nyxa-label">Date</label>
            <input
              id={dateId}
              type="date"
              className="nyxa-input text-xs"
              value={meeting.date}
              onChange={(e) => updateField('date', e.target.value)}
            />
          </div>

          <div>
            <label htmlFor={timeId} className="nyxa-label">Time & Duration</label>
            <input
              id={timeId}
              type="text"
              className="nyxa-input text-xs"
              value={meeting.time}
              onChange={(e) => updateField('time', e.target.value)}
              placeholder="e.g. 10:00 AM - 11:00 AM"
            />
          </div>

          <div>
            <label htmlFor={chairpersonId} className="nyxa-label">Chairperson / Host</label>
            <input
              id={chairpersonId}
              type="text"
              className="nyxa-input text-xs"
              value={meeting.chairperson}
              onChange={(e) => updateField('chairperson', e.target.value)}
            />
          </div>

          <div>
            <label htmlFor={scribeId} className="nyxa-label">Minute Taker / Scribe</label>
            <input
              id={scribeId}
              type="text"
              className="nyxa-input text-xs"
              value={meeting.scribe}
              onChange={(e) => updateField('scribe', e.target.value)}
            />
          </div>

          <div className="lg:col-span-2">
            <label className="nyxa-label">Attendees List (Comma Separated)</label>
            <input
              type="text"
              className="nyxa-input text-xs"
              value={meeting.attendees}
              onChange={(e) => updateField('attendees', e.target.value)}
              placeholder="e.g. Alex, Sarah, David, Elena"
            />
          </div>

          <div>
            <label className="nyxa-label">Absent / Apologies</label>
            <input
              type="text"
              className="nyxa-input text-xs"
              value={meeting.absent}
              onChange={(e) => updateField('absent', e.target.value)}
              placeholder="e.g. Chris L."
            />
          </div>
        </div>
      </div>

      {/* Agenda Section */}
      <div className="nyxa-card space-y-4 print:hidden">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
          <h2 className="text-lg font-bold text-[var(--foreground)] border-0 p-0 m-0">
            Agenda Topics ({meeting.agenda.length})
          </h2>
          <button
            onClick={addAgendaItem}
            className="nyxa-btn nyxa-btn-secondary text-xs flex items-center gap-1"
          >
            + Add Topic
          </button>
        </div>

        <div className="space-y-2">
          {meeting.agenda.map((ag, idx) => (
            <div
              key={ag.id}
              className="p-3 rounded-lg border border-[var(--border)] bg-[var(--secondary-bg)] grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
            >
              <div className="sm:col-span-6">
                <label className="text-[10px] font-bold text-[var(--muted)] uppercase block">
                  Topic #{idx + 1}
                </label>
                <input
                  type="text"
                  className="nyxa-input text-xs py-1"
                  value={ag.topic}
                  onChange={(e) => updateAgendaItem(ag.id, 'topic', e.target.value)}
                />
              </div>

              <div className="sm:col-span-3">
                <label className="text-[10px] font-bold text-[var(--muted)] uppercase block">
                  Presenter
                </label>
                <input
                  type="text"
                  className="nyxa-input text-xs py-1"
                  value={ag.presenter}
                  onChange={(e) => updateAgendaItem(ag.id, 'presenter', e.target.value)}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold text-[var(--muted)] uppercase block">
                  Duration (Mins)
                </label>
                <input
                  type="number"
                  min="1"
                  className="nyxa-input text-xs py-1"
                  value={ag.durationMinutes}
                  onChange={(e) => updateAgendaItem(ag.id, 'durationMinutes', Number(e.target.value))}
                />
              </div>

              <div className="sm:col-span-1 flex justify-end">
                <button
                  onClick={() => removeAgendaItem(ag.id)}
                  className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Discussion Notes & Key Decisions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:hidden">
        <div className="nyxa-card space-y-3">
          <h2 className="text-lg font-bold text-[var(--foreground)] border-b border-[var(--border)] pb-2 m-0">
            Discussion Summary & Key Points
          </h2>
          <textarea
            className="nyxa-textarea text-xs min-h-[160px]"
            value={meeting.summaryNotes}
            onChange={(e) => updateField('summaryNotes', e.target.value)}
            placeholder="Record major discussions, background context, debate points..."
          />
        </div>

        <div className="nyxa-card space-y-3">
          <h2 className="text-lg font-bold text-[var(--foreground)] border-b border-[var(--border)] pb-2 m-0">
            Key Decisions Recorded ({meeting.decisions.length})
          </h2>

          <div className="flex gap-2">
            <input
              type="text"
              className="nyxa-input text-xs"
              placeholder="e.g. Approved budget proposal of $5,000"
              value={newDecisionInput}
              onChange={(e) => setNewDecisionInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addDecision();
                }
              }}
            />
            <button onClick={addDecision} className="nyxa-btn nyxa-btn-secondary text-xs shrink-0">
              + Add Decision
            </button>
          </div>

          <div className="space-y-2">
            {meeting.decisions.map((dec, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/5 text-xs flex items-center justify-between gap-2"
              >
                <div className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span className="text-[var(--foreground)] font-medium">{dec}</span>
                </div>
                <button
                  onClick={() => removeDecision(idx)}
                  className="text-gray-400 hover:text-red-500 text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Items Table */}
      <div className="nyxa-card space-y-4 print:hidden">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
          <h2 className="text-lg font-bold text-[var(--foreground)] border-0 p-0 m-0">
            Action Items & Task Ownership ({meeting.actionItems.length})
          </h2>
          <button
            onClick={addActionItem}
            className="nyxa-btn nyxa-btn-secondary text-xs flex items-center gap-1"
          >
            + Add Action Task
          </button>
        </div>

        <div className="nyxa-table-wrapper">
          <table className="nyxa-table">
            <thead>
              <tr>
                <th>Task Description</th>
                <th>Assignee / Owner</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {meeting.actionItems.map((ai) => (
                <tr key={ai.id}>
                  <td>
                    <input
                      type="text"
                      className="nyxa-input text-xs py-1 px-2 font-medium"
                      value={ai.task}
                      onChange={(e) => updateActionItem(ai.id, 'task', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="nyxa-input text-xs py-1 px-2 w-28"
                      value={ai.owner}
                      onChange={(e) => updateActionItem(ai.id, 'owner', e.target.value)}
                    />
                  </td>
                  <td>
                    <select
                      className="nyxa-select text-xs py-1 px-2 w-24"
                      value={ai.priority}
                      onChange={(e) => updateActionItem(ai.id, 'priority', e.target.value as any)}
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </td>
                  <td>
                    <input
                      type="date"
                      className="nyxa-input text-xs py-1 px-2 w-32"
                      value={ai.dueDate}
                      onChange={(e) => updateActionItem(ai.id, 'dueDate', e.target.value)}
                    />
                  </td>
                  <td>
                    <select
                      className="nyxa-select text-xs py-1 px-2 w-28"
                      value={ai.status}
                      onChange={(e) => updateActionItem(ai.id, 'status', e.target.value as any)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                  </td>
                  <td className="text-right">
                    <button
                      onClick={() => removeActionItem(ai.id)}
                      className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AUDIO TRANSCRIPT PARSER MODAL */}
      {showTranscriptModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="nyxa-card max-w-2xl w-full space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <h2 className="text-lg font-bold border-0 p-0 m-0">🎙️ Audio Notes Transcript Parser Simulation</h2>
              <button onClick={() => setShowTranscriptModal(false)} className="text-[var(--muted)] hover:text-[var(--foreground)]">
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="nyxa-label text-xs">Paste Raw Transcript Text or Voice Note</label>
                <div className="flex gap-2">
                  {SAMPLE_AUDIO_TRANSCRIPTS.map((sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => setRawTranscriptText(sample.text)}
                      className="text-[10px] text-blue-500 hover:underline"
                    >
                      {sample.name}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                className="nyxa-textarea text-xs font-mono min-h-[140px]"
                placeholder="e.g., Sarah opened the sync. We decided to move the release window to Tuesday. David will deploy backend migrations by Friday..."
                value={rawTranscriptText}
                onChange={(e) => setRawTranscriptText(e.target.value)}
              />

              <div className="flex justify-end">
                <button
                  onClick={parseTranscript}
                  disabled={!rawTranscriptText.trim()}
                  className="nyxa-btn nyxa-btn-primary text-xs"
                >
                  ⚡ Parse Transcript & Extract Minutes
                </button>
              </div>
            </div>

            {parsedResults && (
              <div className="p-4 rounded-lg bg-[var(--secondary-bg)] border border-[var(--accent)] space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                  Parsed Results Preview:
                </h3>

                <div>
                  <span className="text-[11px] font-bold text-[var(--muted)] uppercase block">Extracted Summary</span>
                  <p className="text-xs text-[var(--foreground)]">{parsedResults.summary}</p>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-[var(--muted)] uppercase block">Detected Decisions ({parsedResults.decisions.length})</span>
                  <ul className="text-xs space-y-1 list-disc pl-4 text-emerald-600 font-semibold">
                    {parsedResults.decisions.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-[var(--muted)] uppercase block">Detected Action Items ({parsedResults.actionItems.length})</span>
                  <div className="space-y-1 mt-1">
                    {parsedResults.actionItems.map((ai, i) => (
                      <div key={i} className="text-xs p-1.5 rounded bg-[var(--card-bg)] border border-[var(--border)] flex items-center justify-between">
                        <span>{ai.task}</span>
                        <span className="font-bold font-mono">Owner: {ai.owner}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
                  <button
                    onClick={() => setParsedResults(null)}
                    className="nyxa-btn nyxa-btn-secondary text-xs"
                  >
                    Discard
                  </button>
                  <button
                    onClick={applyParsedResultsToMeeting}
                    className="nyxa-btn nyxa-btn-primary text-xs"
                  >
                    ✓ Apply to Meeting Minutes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ACTION ITEMS EMAIL DRAFT MODAL */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="nyxa-card max-w-2xl w-full space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <h2 className="text-lg font-bold border-0 p-0 m-0">✉️ Action Items Email Draft Generator</h2>
              <button onClick={() => setShowEmailModal(false)} className="text-[var(--muted)] hover:text-[var(--foreground)]">
                ✕
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-[var(--secondary-bg)] border border-[var(--border)]">
              <div>
                <label className="text-xs font-semibold text-[var(--muted)] block">Filter Assignee:</label>
                <select
                  className="nyxa-select text-xs py-1"
                  value={selectedEmailAssignee}
                  onChange={(e) => setSelectedEmailAssignee(e.target.value)}
                >
                  <option value="All">All Action Items ({meeting.actionItems.length})</option>
                  {Array.from(new Set(meeting.actionItems.map((ai) => ai.owner))).map((owner) => (
                    <option key={owner} value={owner}>
                      {owner} only
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <button onClick={handleCopyEmail} className="nyxa-btn nyxa-btn-secondary text-xs">
                  {emailCopied ? 'Copied!' : 'Copy Email Body'}
                </button>
                <a
                  href={`mailto:?subject=${encodeURIComponent(emailDraftData.subject)}&body=${encodeURIComponent(emailDraftData.body)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="nyxa-btn nyxa-btn-primary text-xs inline-flex items-center gap-1"
                >
                  Open Email Client ↗
                </a>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[var(--card-bg)] border border-[var(--border)] space-y-3 font-mono text-xs">
              <div>
                <span className="text-[var(--muted)] block">Subject:</span>
                <span className="font-bold text-[var(--foreground)]">{emailDraftData.subject}</span>
              </div>
              <div className="pt-2 border-t border-[var(--border)] whitespace-pre-wrap text-[var(--foreground)]">
                {emailDraftData.body}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EXECUTIVE PRINTABLE DOCUMENT LAYOUT (PDF PREVIEW) */}
      {showPrintPdfModal && (
        <div className="fixed inset-0 z-50 bg-white text-black p-8 overflow-y-auto print:p-0 print:static print:bg-white print:text-black">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center border-b-2 border-black pb-4 print:hidden">
              <span className="font-bold text-lg">📄 PDF / Printable Document Preview</span>
              <button
                onClick={() => setShowPrintPdfModal(false)}
                className="px-3 py-1 bg-gray-200 text-black font-semibold rounded"
              >
                Close Preview
              </button>
            </div>

            <div className="space-y-4 font-serif">
              <div className="border-b-2 border-black pb-3">
                <h1 className="text-3xl font-bold uppercase tracking-tight">{meeting.title}</h1>
                <p className="text-sm text-gray-700 mt-1">Official Meeting Minutes & Action Register</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs border p-3 bg-gray-50 border-gray-300">
                <div>
                  <p><strong>Date:</strong> {meeting.date}</p>
                  <p><strong>Time:</strong> {meeting.time}</p>
                  <p><strong>Location:</strong> {meeting.location}</p>
                </div>
                <div>
                  <p><strong>Chairperson:</strong> {meeting.chairperson}</p>
                  <p><strong>Minute Taker:</strong> {meeting.scribe}</p>
                  <p><strong>Attendees:</strong> {meeting.attendees}</p>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-bold uppercase border-b border-black pb-1 mb-2">1. Agenda Topics</h2>
                <ol className="list-decimal pl-5 text-xs space-y-1">
                  {meeting.agenda.map((ag) => (
                    <li key={ag.id}>
                      <strong>{ag.topic}</strong> ({ag.durationMinutes} mins) &mdash; Presenter: {ag.presenter}
                    </li>
                  ))}
                </ol>
              </div>

              <div>
                <h2 className="text-lg font-bold uppercase border-b border-black pb-1 mb-2">2. Discussion Summary</h2>
                <p className="text-xs whitespace-pre-wrap leading-relaxed">{meeting.summaryNotes || 'None recorded.'}</p>
              </div>

              <div>
                <h2 className="text-lg font-bold uppercase border-b border-black pb-1 mb-2">3. Decisions Made</h2>
                <ul className="list-disc pl-5 text-xs space-y-1">
                  {meeting.decisions.map((d, i) => (
                    <li key={i} className="font-semibold">{d}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="text-lg font-bold uppercase border-b border-black pb-1 mb-2">4. Action Item Register</h2>
                <table className="w-full text-left text-xs border-collapse border border-black">
                  <thead>
                    <tr className="bg-gray-200 border-b border-black">
                      <th className="p-2 border-r border-black">Task Description</th>
                      <th className="p-2 border-r border-black">Assignee</th>
                      <th className="p-2 border-r border-black">Priority</th>
                      <th className="p-2 border-r border-black">Due Date</th>
                      <th className="p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {meeting.actionItems.map((ai) => (
                      <tr key={ai.id} className="border-b border-black">
                        <td className="p-2 border-r border-black">{ai.task}</td>
                        <td className="p-2 border-r border-black font-bold">{ai.owner}</td>
                        <td className="p-2 border-r border-black">{ai.priority}</td>
                        <td className="p-2 border-r border-black font-mono">{ai.dueDate}</td>
                        <td className="p-2">{ai.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
