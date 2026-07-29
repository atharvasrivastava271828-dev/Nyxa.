import { createAdminSupabaseClient } from '@/backend/lib/supabase-server';

export interface CreateTaskDTO {
  provider_id: string;
  title: string;
  description: string;
  price: number;
  class: string;
  kind: string;
  dubs: string[];
  inputs_required: Record<string, any>;
  outputs_delivered: Record<string, any>;
  delivery_time: string;
  hosting_method: 'link' | 'iframe' | 'native';
  hosting_url: string;
}

/**
 * Publishes a new standardized task to the catalog.
 *
 * @param data The provider input defining the task template
 * @returns The created task database record
 */
export async function postTask(data: CreateTaskDTO) {
  const supabase = createAdminSupabaseClient();
  
  const { data: task, error } = await supabase
    .from('tasks')
    .insert({
      provider_id: data.provider_id,
      title: data.title,
      description: data.description,
      price: data.price,
      class: data.class,
      kind: data.kind,
      dubs: data.dubs,
      inputs_required: data.inputs_required,
      outputs_delivered: data.outputs_delivered,
      delivery_time: data.delivery_time,
      hosting_method: data.hosting_method,
      hosting_url: data.hosting_url,
      status: 'active'
    })
    .select()
    .single();

  if (error) {
    console.error('[TaskService] Failed to insert task:', error);
    throw new Error('Failed to create task catalog entry.');
  }

  return task;
}

const staticIndianMvpTasks = [
  {
    id: "marks-calculator",
    provider_id: "00000000-0000-0000-0000-000000000000",
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
    hosting_url: "https://nyxa.app/tasks/marks-calculator",
    status: "active"
  },
  {
    id: "homework-tracker",
    provider_id: "00000000-0000-0000-0000-000000000000",
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
    hosting_url: "https://nyxa.app/tasks/homework-tracker",
    status: "active"
  },
  {
    id: "expense-splitter",
    provider_id: "00000000-0000-0000-0000-000000000000",
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
    hosting_url: "https://nyxa.app/tasks/expense-splitter",
    status: "active"
  },
  {
    id: "tds-estimator",
    provider_id: "00000000-0000-0000-0000-000000000000",
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
    hosting_url: "https://nyxa.app/tasks/tds-estimator",
    status: "active"
  },
  {
    id: "task-sorter",
    provider_id: "00000000-0000-0000-0000-000000000000",
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
    hosting_url: "https://nyxa.app/tasks/task-sorter",
    status: "active"
  },
  {
    id: "meeting-minutes",
    provider_id: "00000000-0000-0000-0000-000000000000",
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
    hosting_url: "https://nyxa.app/tasks/meeting-minutes",
    status: "active"
  },
  {
    id: "gst-invoice",
    provider_id: "00000000-0000-0000-0000-000000000000",
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
    hosting_url: "https://nyxa.app/tasks/gst-invoice",
    status: "active"
  },
  {
    id: "salary-restructuring",
    provider_id: "00000000-0000-0000-0000-000000000000",
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
    hosting_url: "https://nyxa.app/tasks/salary-restructuring",
    status: "active"
  },
  {
    id: "sarkari-resume",
    provider_id: "00000000-0000-0000-0000-000000000000",
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
    hosting_url: "https://nyxa.app/tasks/sarkari-resume",
    status: "active"
  },
  {
    id: "document-validator",
    provider_id: "00000000-0000-0000-0000-000000000000",
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
    hosting_url: "https://nyxa.app/tasks/document-validator",
    status: "active"
  },
  {
    id: "upi-link-generator",
    provider_id: "00000000-0000-0000-0000-000000000000",
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
    hosting_url: "https://nyxa.app/tasks/upi-link-generator",
    status: "active"
  }
];

export async function getTasks() {
  try {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) return data;
  } catch (err) {
    console.warn('[TaskService] Supabase offline, using static task catalog fallback.');
  }

  return staticIndianMvpTasks;
}

export async function getTaskById(id: string) {
  try {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (!error && data) return data;
  } catch (err) {
    console.warn(`[TaskService] Supabase lookup failed for ${id}, using static task catalog.`);
  }

  const found = staticIndianMvpTasks.find(t => t.id === id || t.title.toLowerCase().includes(id.toLowerCase()));
  if (found) return found;

  // Generic fallback object if not matched by exact ID
  return {
    id: id,
    provider_id: "00000000-0000-0000-0000-000000000000",
    title: id.replace(/-/g, ' ').toUpperCase(),
    description: "Interactive client-side task outcome generator.",
    price: 0,
    class: "Business",
    kind: "Utility",
    dubs: ["}utility"],
    inputs_required: {},
    outputs_delivered: {},
    delivery_time: "Instant",
    hosting_method: "native" as const,
    hosting_url: `https://nyxa.app/tasks/${id}`,
    status: "active"
  };
}
