import fs from 'fs';
import path from 'path';

try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach((line) => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim();
        if (key && !process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  }
} catch (e) {
  console.error('Failed to load .env.local', e);
}

import { createAdminSupabaseClient } from './src/backend/lib/supabase-server';
import { postTask } from './src/backend/services/task.service';

async function seedIndianMvpTasks() {
  console.log('Starting seed process for 11 Indian MVP Tasks...');
  const supabase = createAdminSupabaseClient();
  
  let providerId = '00000000-0000-0000-0000-000000000000';
  const { data: users } = await supabase.from('users').select('id').limit(1);
  if (users && users.length > 0) {
    providerId = users[0].id;
  } else {
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    if (authUsers?.users && authUsers.users.length > 0) {
      providerId = authUsers.users[0].id;
    }
  }

  console.log(`Using Provider ID: ${providerId}`);

  const indianMvpTasks = [
    {
      provider_id: providerId,
      title: "Indian School Marks Percentage & Grade Calculator",
      description: "Calculate exact percentage, division, and CBSE 9-point grades for Class 9-12 with Best-of-5 support.",
      price: 0,
      class: "Education",
      kind: "Marks Calculator",
      dubs: ["}cbse", "}percentage", "}marks", "}grade", "}education"],
      inputs_required: { class: "10 or 12", board: "CBSE/ICSE", subject_marks: "list" },
      outputs_delivered: { percentage: "number", grade: "string", cgpa: "number" },
      delivery_time: "Instant",
      hosting_method: "native" as const,
      hosting_url: "https://nyxa.app/tasks/marks-calculator"
    },
    {
      provider_id: providerId,
      title: "Indian Homework & Assignment Tracker with Exam Countdown",
      description: "Track school assignments, priorities, and exam countdowns with daily task views and local storage persistence.",
      price: 0,
      class: "Education",
      kind: "Homework Tracker",
      dubs: ["}homework", "}assignments", "}study", "}countdown"],
      inputs_required: { student_name: "string", assignments: "list" },
      outputs_delivered: { dashboard: "interactive", schedule: "pdf" },
      delivery_time: "Instant",
      hosting_method: "native" as const,
      hosting_url: "https://nyxa.app/tasks/homework-tracker"
    },
    {
      provider_id: providerId,
      title: "Shared Expense Splitter (India)",
      description: "Split rent, bills, and trip expenses for flatmates and groups with auto-calculated net balances and WhatsApp export.",
      price: 0,
      class: "Business",
      kind: "Expense Splitter",
      dubs: ["}expenses", "}splitwise", "}flatmates", "}trip", "}bills"],
      inputs_required: { members: "list", expenses: "list" },
      outputs_delivered: { net_balances: "object", whatsapp_summary: "string" },
      delivery_time: "Instant",
      hosting_method: "native" as const,
      hosting_url: "https://nyxa.app/tasks/expense-splitter"
    },
    {
      provider_id: providerId,
      title: "Quick Salary & TDS Estimator (New vs Old Regime)",
      description: "Compare your monthly take-home salary and tax liability under the New vs Old Tax Regimes in India.",
      price: 0,
      class: "Business",
      kind: "TDS Estimator",
      dubs: ["}salary", "}tds", "}tax", "}income-tax", "}regime"],
      inputs_required: { annual_ctc: "number", deductions: "number" },
      outputs_delivered: { monthly_takehome: "number", recommendation: "string" },
      delivery_time: "Instant",
      hosting_method: "native" as const,
      hosting_url: "https://nyxa.app/tasks/tds-estimator"
    },
    {
      provider_id: providerId,
      title: "Priority Task Sorter for Office & Study",
      description: "Organize messy to-do lists into Eisenhower matrix buckets (Do Now, Do Next, Do Later) with time block recommendations.",
      price: 0,
      class: "Education",
      kind: "Task Sorter",
      dubs: ["}productivity", "}tasks", "}eisenhower", "}focus"],
      inputs_required: { tasks: "list" },
      outputs_delivered: { prioritized_list: "object", time_blocks: "list" },
      delivery_time: "Instant",
      hosting_method: "native" as const,
      hosting_url: "https://nyxa.app/tasks/task-sorter"
    },
    {
      provider_id: providerId,
      title: "Meeting Minutes Structurer",
      description: "Turn raw meeting notes into structured Markdown/HTML minutes complete with decisions, owners, and due dates.",
      price: 0,
      class: "Business",
      kind: "Meeting Minutes",
      dubs: ["}mom", "}meeting", "}notes", "}productivity"],
      inputs_required: { title: "string", notes: "text" },
      outputs_delivered: { markdown_mom: "string", action_items: "list" },
      delivery_time: "Instant",
      hosting_method: "native" as const,
      hosting_url: "https://nyxa.app/tasks/meeting-minutes"
    },
    {
      provider_id: providerId,
      title: "Indian GST Invoice Generator",
      description: "Generate compliant GST invoices with automatic CGST/SGST/IGST breakdown, HSN/SAC codes, and print view.",
      price: 0,
      class: "Business",
      kind: "GST Invoice",
      dubs: ["}gst", "}invoice", "}freelance", "}business", "}billing"],
      inputs_required: { supplier_gstin: "string", buyer_gstin: "string", items: "list" },
      outputs_delivered: { pdf_invoice: "file", formatted_view: "html" },
      delivery_time: "Instant",
      hosting_method: "native" as const,
      hosting_url: "https://nyxa.app/tasks/gst-invoice"
    },
    {
      provider_id: providerId,
      title: "Indian Salary Restructuring Calculator (Post-2025 Labour Codes)",
      description: "Evaluate the impact of the 50% basic pay rule on your PF, gratuity, and net monthly take-home post-2025.",
      price: 0,
      class: "Business",
      kind: "Salary Restructuring",
      dubs: ["}labour-codes", "}pf", "}gratuity", "}ctc", "}salary"],
      inputs_required: { ctc: "number", basic_percent: "number" },
      outputs_delivered: { old_vs_new_takehome: "object", pf_impact: "number" },
      delivery_time: "Instant",
      hosting_method: "native" as const,
      hosting_url: "https://nyxa.app/tasks/salary-restructuring"
    },
    {
      provider_id: providerId,
      title: "Sarkari Resume/Biodata Formatter",
      description: "Format your education and experience into standard Indian Government job application biodata (UPSC, SSC, Railways).",
      price: 0,
      class: "Education",
      kind: "Biodata Formatter",
      dubs: ["}sarkari", "}resume", "}biodata", "}upsc", "}ssc"],
      inputs_required: { personal_details: "object", education: "list" },
      outputs_delivered: { formatted_biodata: "pdf/html" },
      delivery_time: "Instant",
      hosting_method: "native" as const,
      hosting_url: "https://nyxa.app/tasks/sarkari-resume"
    },
    {
      provider_id: providerId,
      title: "Indian Document Format Validator (PAN, Aadhaar, IFSC, Pincode)",
      description: "Verify structural checksums and decode metadata for PAN, Aadhaar, IFSC branch codes, and Indian postal pincodes.",
      price: 0,
      class: "Tech",
      kind: "Document Validator",
      dubs: ["}pan", "}aadhaar", "}ifsc", "}pincode", "}validation"],
      inputs_required: { doc_type: "string", doc_number: "string" },
      outputs_delivered: { is_valid: "boolean", metadata: "object" },
      delivery_time: "Instant",
      hosting_method: "native" as const,
      hosting_url: "https://nyxa.app/tasks/document-validator"
    },
    {
      provider_id: providerId,
      title: "UPI Payment Link & QR Generator",
      description: "Create shareable UPI deep payment links (`upi://pay`) and QR codes for instant payments via PhonePe, Paytm, GooglePay.",
      price: 0,
      class: "Business",
      kind: "UPI Generator",
      dubs: ["}upi", "}qr-code", "}payments", "}phonepe", "}paytm"],
      inputs_required: { vpa: "string", payee_name: "string", amount: "number" },
      outputs_delivered: { upi_link: "string", qr_code: "image" },
      delivery_time: "Instant",
      hosting_method: "native" as const,
      hosting_url: "https://nyxa.app/tasks/upi-link-generator"
    }
  ];

  for (const task of indianMvpTasks) {
    try {
      await postTask(task);
      console.log(`✓ Created Task: ${task.title}`);
    } catch (err: any) {
      console.error(`✕ Failed to create task ${task.title}:`, err.message);
    }
  }

  console.log('Seeding complete for all 11 tasks.');
}

seedIndianMvpTasks();
