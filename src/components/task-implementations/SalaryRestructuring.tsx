'use client';

import React, { useState, useMemo } from 'react';
import {
  Building2,
  Briefcase,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  ShieldCheck,
  Info,
  Sparkles,
  Copy,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  PiggyBank,
  Award,
  BarChart3,
  Mail,
  Printer,
  Download,
  FileText,
  Sliders,
  Check
} from 'lucide-react';

interface Preset {
  label: string;
  ctc: number;
  oldBasicRatio: number;
  newBasicRatio: number;
  hraRatio: number;
}

const PRESETS: Preset[] = [
  { label: 'Mid SE (₹15 Lakhs)', ctc: 1500000, oldBasicRatio: 0.35, newBasicRatio: 0.5, hraRatio: 0.4 },
  { label: 'Senior SE (₹28 Lakhs)', ctc: 2800000, oldBasicRatio: 0.35, newBasicRatio: 0.5, hraRatio: 0.5 },
  { label: 'Tech Lead (₹45 Lakhs)', ctc: 4500000, oldBasicRatio: 0.3, newBasicRatio: 0.5, hraRatio: 0.5 },
];

export default function SalaryRestructuring() {
  // Input States
  const [ctc, setCtc] = useState<number>(2000000); // Annual CTC ₹20 Lakhs
  const [oldBasicRatio, setOldBasicRatio] = useState<number>(0.35); // 35% Basic originally
  const [newBasicRatio, setNewBasicRatio] = useState<number>(0.5); // 50% Basic under Labour Code
  const [hraRatio, setHraRatio] = useState<number>(0.4); // 40% of Basic for HRA
  const [capPfTo15k, setCapPfTo15k] = useState<boolean>(false); // Uncapped PF by default
  const [includeGratuity, setIncludeGratuity] = useState<boolean>(true); // 4.81% of basic
  const [epfInterestRate, setEpfInterestRate] = useState<number>(0.0825); // 8.25% p.a.

  // Navigation & Modal States
  const [activeTab, setActiveTab] = useState<'calculator' | 'projection' | 'email' | 'proposal'>('calculator');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showExplainer, setShowExplainer] = useState<boolean>(false);

  // Email Generator States
  const [candidateName, setCandidateName] = useState('Rahul Sharma');
  const [recruiterName, setRecruiterName] = useState('Ananya Sen (HR Lead)');
  const [companyName, setCompanyName] = useState('TechCorp India Pvt Ltd');
  const [targetRole, setTargetRole] = useState('Senior Software Engineer');
  const [emailTone, setEmailTone] = useState<'HR_COMPLIANCE' | 'DIPLOMATIC_COUNTER' | 'EXECUTIVE'>('HR_COMPLIANCE');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const applyPreset = (p: Preset) => {
    setCtc(p.ctc);
    setOldBasicRatio(p.oldBasicRatio);
    setNewBasicRatio(p.newBasicRatio);
    setHraRatio(p.hraRatio);
    showToast(`Applied ${p.label} preset`);
  };

  // Helper to compute salary breakdown for a given basic ratio
  const computeBreakdown = (basicPct: number) => {
    const basicAnnual = ctc * basicPct;
    const hraAnnual = basicAnnual * hraRatio;

    // Employer PF (12% of basic or capped at ₹1,800/mo = ₹21,600/yr if capped)
    const pfBasisAnnual = capPfTo15k ? Math.min(basicAnnual, 180000) : basicAnnual;
    const employerPfAnnual = pfBasisAnnual * 0.12;
    const employeePfAnnual = pfBasisAnnual * 0.12;

    // Gratuity provision (4.81% of basic = 15/26 days per year of service)
    const gratuityAnnual = includeGratuity ? basicAnnual * 0.0481 : 0;

    // Special / Balancing Allowance = CTC - (Basic + HRA + Employer PF + Gratuity)
    const fixedComponents = basicAnnual + hraAnnual + employerPfAnnual + gratuityAnnual;
    const specialAllowanceAnnual = Math.max(0, ctc - fixedComponents);

    // Monthly Gross Salary = Basic + HRA + Special Allowance
    const grossMonthly = (basicAnnual + hraAnnual + specialAllowanceAnnual) / 12;

    // Monthly Deductions = Employee PF + Professional Tax (~₹200/mo)
    const profTaxMonthly = 200;
    const employeePfMonthly = employeePfAnnual / 12;
    const totalDeductionsMonthly = employeePfMonthly + profTaxMonthly;

    // Gross Take-home (before Income Tax TDS)
    const monthlyTakeHomePreTax = grossMonthly - totalDeductionsMonthly;

    // Total Retirement Contribution (Employer PF + Employee PF + Gratuity)
    const annualRetirementSavings = employerPfAnnual + employeePfAnnual + gratuityAnnual;

    return {
      basicAnnual,
      hraAnnual,
      employerPfAnnual,
      employeePfAnnual,
      gratuityAnnual,
      specialAllowanceAnnual,
      grossMonthly,
      employeePfMonthly,
      monthlyTakeHomePreTax,
      annualRetirementSavings,
    };
  };

  const oldBreakdown = useMemo(() => computeBreakdown(oldBasicRatio), [ctc, oldBasicRatio, hraRatio, capPfTo15k, includeGratuity]);
  const newBreakdown = useMemo(() => computeBreakdown(newBasicRatio), [ctc, newBasicRatio, hraRatio, capPfTo15k, includeGratuity]);

  // Key Deltas
  const monthlyTakeHomeDelta = newBreakdown.monthlyTakeHomePreTax - oldBreakdown.monthlyTakeHomePreTax;
  const annualRetirementDelta = newBreakdown.annualRetirementSavings - oldBreakdown.annualRetirementSavings;

  // 10-Year EPF Compounding Projection Engine
  const yearByYearProjections = useMemo(() => {
    const oldAnnualContribution = oldBreakdown.employerPfAnnual + oldBreakdown.employeePfAnnual;
    const newAnnualContribution = newBreakdown.employerPfAnnual + newBreakdown.employeePfAnnual;

    let oldPool = 0;
    let newPool = 0;

    const list: { year: number; oldWealth: number; newWealth: number; delta: number }[] = [];

    for (let yr = 1; yr <= 10; yr++) {
      oldPool = (oldPool + oldAnnualContribution) * (1 + epfInterestRate);
      newPool = (newPool + newAnnualContribution) * (1 + epfInterestRate);
      list.push({
        year: yr,
        oldWealth: Math.round(oldPool),
        newWealth: Math.round(newPool),
        delta: Math.round(newPool - oldPool),
      });
    }

    return list;
  }, [oldBreakdown, newBreakdown, epfInterestRate]);

  const year5Delta = yearByYearProjections[4]?.delta || 0;
  const year10Delta = yearByYearProjections[9]?.delta || 0;

  // Format INR
  const formatINR = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Math.round(amt));
  };

  // Negotiation Email Template Engine
  const generatedNegotiationEmail = useMemo(() => {
    const newInHand = formatINR(newBreakdown.monthlyTakeHomePreTax);
    const oldInHand = formatINR(oldBreakdown.monthlyTakeHomePreTax);
    const pfIncrease = formatINR(annualRetirementDelta);
    const formattedCtc = formatINR(ctc);

    if (emailTone === 'HR_COMPLIANCE') {
      return `Subject: CTC Component Restructuring Request - ${targetRole} - ${candidateName}

Dear ${recruiterName},

Thank you for sending over the compensation details for the ${targetRole} position at ${companyName}. I am thrilled about the opportunity to contribute to the team.

Upon reviewing the proposed CTC breakdown of ${formattedCtc}, I noticed that the Basic Pay is currently structured at ${(oldBasicRatio * 100).toFixed(0)}% of the total CTC.

In light of the Ministry of Labour & Employment's New Wage Code guidelines (requiring a minimum 50% Basic + DA allocation), I would like to request an adjustment to align the CTC structure with the 50% Basic rule.

Key advantages of this alignment:
1. Labour Code Statutory Compliance for ${companyName}.
2. Enhanced EPF retirement savings of +${pfIncrease} per year.
3. Transparent tax structure with optimized HRA benefits.

Please let me know if we can update the offer letter to reflect a 50% Basic Pay (${formatINR(newBreakdown.basicAnnual)}/yr) structure.

Looking forward to your positive response.

Best regards,
${candidateName}
Phone / LinkedIn`;
    } else if (emailTone === 'DIPLOMATIC_COUNTER') {
      return `Subject: Offer Revision & CTC Structure Discussion - ${candidateName}

Dear ${recruiterName},

I hope this email finds you well.

I am very excited about the offer to join ${companyName} as ${targetRole}. After evaluating the monthly in-hand cashflow, I observed that increasing the Basic Pay to 50% under the new wage guidelines adjusts my monthly take-home to ${newInHand}.

To ensure that my net monthly in-hand remains unimpacted by the higher statutory EPF deductions (+${pfIncrease}/yr into EPF), I would like to request a slight upward adjustment of ${formatINR(Math.abs(monthlyTakeHomeDelta) * 12)} in the fixed CTC base.

This will allow us to achieve full 50% Labour Code compliance while maintaining the target in-hand monthly salary.

I appreciate your consideration and flexibility on this matter.

Warm regards,
${candidateName}`;
    } else {
      return `Subject: Executive Offer & Labour Code Structure Alignment - ${candidateName}

Dear ${recruiterName},

Thank you for discussing the executive offer for the ${targetRole} leadership position at ${companyName}.

I have reviewed the proposed annual CTC of ${formattedCtc}. To ensure optimal statutory compliance and long-term retirement wealth compounding, I propose structuring the compensation as follows:

• Basic Pay (50% CTC): ${formatINR(newBreakdown.basicAnnual)} / year
• HRA Allowance (${(hraRatio * 100).toFixed(0)}% Basic): ${formatINR(newBreakdown.hraAnnual)} / year
• Uncapped Employer EPF (12% Basic): ${formatINR(newBreakdown.employerPfAnnual)} / year
• Flexible Special Allowance: ${formatINR(newBreakdown.specialAllowanceAnnual)} / year

This structure maximizes our 10-year compounded EPF pool to ${formatINR(yearByYearProjections[9]?.newWealth || 0)} while keeping company costs strictly within the agreed ${formattedCtc} CTC budget.

Please confirm if the HR team can issue the formal offer letter with these parameters.

Sincerely,
${candidateName}`;
    }
  }, [emailTone, candidateName, recruiterName, companyName, targetRole, ctc, oldBasicRatio, newBreakdown, oldBreakdown, annualRetirementDelta, monthlyTakeHomeDelta, hraRatio, yearByYearProjections]);

  // Report Text Export
  const generateReportText = () => {
    let txt = `*Nyxa Labour Code 50% Basic Salary Restructuring Report*\n`;
    txt += `💼 Total Annual CTC: ${formatINR(ctc)}\n`;
    txt += `📊 Basic Pay Shift: ${(oldBasicRatio * 100).toFixed(0)}% ➔ ${(newBasicRatio * 100).toFixed(0)}%\n\n`;

    txt += `💵 *Monthly In-Hand Cashflow Impact:*\n`;
    txt += `• Old Monthly In-Hand (Pre-TDS): ${formatINR(oldBreakdown.monthlyTakeHomePreTax)}\n`;
    txt += `• New Monthly In-Hand (Pre-TDS): ${formatINR(newBreakdown.monthlyTakeHomePreTax)}\n`;
    txt += `• Monthly Change: ${monthlyTakeHomeDelta >= 0 ? '+' : ''}${formatINR(monthlyTakeHomeDelta)} / month\n\n`;

    txt += `🏦 *Retirement & Wealth Accumulation Impact:*\n`;
    txt += `• Annual Extra PF + Gratuity Boost: +${formatINR(annualRetirementDelta)} / year\n`;
    txt += `• 5-Year EPF Wealth Delta: +${formatINR(year5Delta)}\n`;
    txt += `• 10-Year EPF Wealth Delta: +${formatINR(year10Delta)}\n\n`;

    txt += `Calculated via Nyxa Labour Code Restructuring Engine ⚡`;
    return txt;
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-slate-800 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-purple-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-purple-500/10 text-purple-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-purple-500/20">
              New Wage Code Legislation Impact
            </span>
            <span className="text-xs text-slate-400">50% Basic Pay Mandatory Rule</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-purple-400" />
            Salary Restructuring Calculator
          </h2>
        </div>

        {/* Quick Presets & Copy Report */}
        <div className="flex flex-wrap items-center gap-2">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => applyPreset(p)}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              {p.label}
            </button>
          ))}

          <button
            onClick={() => {
              navigator.clipboard.writeText(generateReportText());
              showToast('Summary report copied!');
            }}
            className="text-xs bg-purple-600 hover:bg-purple-500 text-white font-semibold px-3 py-1.5 rounded-lg transition flex items-center gap-1 shadow-md"
          >
            <Copy className="w-3.5 h-3.5" />
            Copy Report
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('calculator')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'calculator' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          CTC Breakdown Calculator
        </button>

        <button
          onClick={() => setActiveTab('projection')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'projection' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          10-Year EPF Wealth Projection
        </button>

        <button
          onClick={() => setActiveTab('email')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'email' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Mail className="w-4 h-4 text-sky-400" />
          CTC Negotiation Email Generator
        </button>

        <button
          onClick={() => setActiveTab('proposal')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'proposal' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Printer className="w-4 h-4 text-amber-400" />
          HR Proposal Exporter
        </button>
      </div>

      {/* Impact Overview Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Monthly Cashflow Delta Card */}
        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Monthly Take-Home Delta</p>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold font-mono text-rose-400">
            {monthlyTakeHomeDelta >= 0 ? '+' : ''}
            {formatINR(monthlyTakeHomeDelta)}
            <span className="text-xs text-slate-400 font-normal"> / mo</span>
          </p>
          <p className="text-[11px] text-slate-400">
            Monthly in-hand cash drops slightly because higher EPF is deducted directly from Basic Pay.
          </p>
        </div>

        {/* Annual Retirement Accumulation Boost */}
        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Annual EPF & Gratuity Boost</p>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400">
            +{formatINR(annualRetirementDelta)}
            <span className="text-xs text-slate-400 font-normal"> / yr</span>
          </p>
          <p className="text-[11px] text-slate-400">
            Combined employer & employee EPF + gratuity savings increase drastically each year.
          </p>
        </div>

        {/* 10-Year Compounded EPF Wealth */}
        <div className="bg-slate-800/80 p-5 rounded-2xl border border-purple-500/30 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-xs text-purple-300 font-semibold uppercase tracking-wider">10-Yr EPF Wealth Gain</p>
            <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold font-mono text-purple-300">
            +{formatINR(year10Delta)}
          </p>
          <p className="text-[11px] text-slate-400">
            Compounded EPF growth @ {(epfInterestRate * 100).toFixed(2)}% p.a. tax-free interest over 10 years.
          </p>
        </div>
      </div>

      {/* TAB 1: Calculator */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column (5 cols) */}
          <div className="lg:col-span-5 bg-slate-800/40 p-5 rounded-2xl border border-slate-800 space-y-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-700/60 pb-2">
              <Briefcase className="w-4 h-4 text-purple-400" />
              Configure Salary & Wage Code Parameters
            </h3>

            {/* Annual CTC */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <label className="font-semibold text-slate-200">Total Annual CTC (Cost to Company)</label>
                <span className="font-mono font-bold text-purple-400">{formatINR(ctc)}</span>
              </div>
              <input
                type="number"
                min="300000"
                max="10000000"
                step="100000"
                value={ctc}
                onChange={(e) => setCtc(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
              />
              <input
                type="range"
                min="500000"
                max="6000000"
                step="100000"
                value={ctc}
                onChange={(e) => setCtc(Number(e.target.value))}
                className="w-full accent-purple-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Old Basic Pay % Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <label className="font-semibold text-slate-300">Original Basic Pay (% of CTC)</label>
                <span className="font-mono text-amber-400 font-bold">{(oldBasicRatio * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.25"
                max="0.45"
                step="0.05"
                value={oldBasicRatio}
                onChange={(e) => setOldBasicRatio(Number(e.target.value))}
                className="w-full accent-amber-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* New Mandated Basic Pay % Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <label className="font-semibold text-slate-300">New Wage Code Basic Pay (% of CTC)</label>
                <span className="font-mono text-emerald-400 font-bold">{(newBasicRatio * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.50"
                max="0.70"
                step="0.05"
                value={newBasicRatio}
                onChange={(e) => setNewBasicRatio(Number(e.target.value))}
                className="w-full accent-emerald-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-[10px] text-slate-400">
                *The New Labour Code strictly mandates a minimum of 50% Basic + DA.
              </p>
            </div>

            {/* HRA Ratio */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <label className="font-semibold text-slate-300">HRA (% of Basic Pay)</label>
                <span className="font-mono text-sky-400 font-bold">{(hraRatio * 100).toFixed(0)}%</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setHraRatio(0.4)}
                  className={`py-1.5 text-xs font-medium rounded-lg border transition ${
                    hraRatio === 0.4
                      ? 'bg-sky-600 text-white border-sky-500 font-bold'
                      : 'bg-slate-900 text-slate-400 border-slate-700'
                  }`}
                >
                  40% (Non-Metro)
                </button>
                <button
                  type="button"
                  onClick={() => setHraRatio(0.5)}
                  className={`py-1.5 text-xs font-medium rounded-lg border transition ${
                    hraRatio === 0.5
                      ? 'bg-sky-600 text-white border-sky-500 font-bold'
                      : 'bg-slate-900 text-slate-400 border-slate-700'
                  }`}
                >
                  50% (Metro)
                </button>
              </div>
            </div>

            {/* Options Toggles */}
            <div className="space-y-2 pt-2 border-t border-slate-700/60">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">PF Contribution Capping</span>
                <button
                  type="button"
                  onClick={() => setCapPfTo15k(!capPfTo15k)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    capPfTo15k ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {capPfTo15k ? 'Capped @ ₹1,800/mo' : 'Uncapped (12% Full Basic)'}
                </button>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Include Gratuity in CTC</span>
                <button
                  type="button"
                  onClick={() => setIncludeGratuity(!includeGratuity)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    includeGratuity ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {includeGratuity ? 'Yes (4.81% Basic)' : 'No'}
                </button>
              </div>
            </div>

            {/* Wage Code Explainer Card Toggle */}
            <button
              onClick={() => setShowExplainer(!showExplainer)}
              className="w-full p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-left text-xs text-purple-300 font-semibold flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Info className="w-4 h-4 text-purple-400" />
                Why are companies restructuring CTC?
              </span>
              <span className="text-xs">{showExplainer ? '▲' : '▼'}</span>
            </button>

            {showExplainer && (
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-2 leading-relaxed">
                <p>
                  <strong>The 50% Basic Rule:</strong> Under the Labour Code on Wages, allowances (HRA, Special Allowance,
                  etc.) cannot exceed 50% of the total salary. Hence, Basic Pay + DA must be at least 50%.
                </p>
                <p>
                  <strong>Impact:</strong> Because EPF (12%) and Gratuity (4.81%) are linked to Basic Pay, increasing Basic Pay
                  increases retirement contributions. This reduces the leftover &quot;Special Allowance&quot;, resulting in slightly
                  lower monthly cash in hand, but substantially higher retirement wealth.
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Detailed Side-by-Side Breakdown Table (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/70 space-y-4 shadow-md">
              <h3 className="text-sm font-bold text-white flex items-center justify-between border-b border-slate-700/60 pb-3">
                <span className="flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-purple-400" />
                  Side-by-Side CTC Structure Comparison
                </span>
                <span className="text-xs font-mono text-slate-400">All amounts annual (₹)</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 uppercase font-mono text-[10px]">
                    <tr>
                      <th className="p-2.5 rounded-l-lg">CTC Component</th>
                      <th className="p-2.5 text-right">
                        Old Structure ({(oldBasicRatio * 100).toFixed(0)}%)
                      </th>
                      <th className="p-2.5 text-right text-emerald-400 font-bold">
                        New Wage Code ({(newBasicRatio * 100).toFixed(0)}%)
                      </th>
                      <th className="p-2.5 text-right rounded-r-lg">Delta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono">
                    {/* Basic Pay */}
                    <tr>
                      <td className="p-2.5 font-semibold text-white font-sans">Basic Pay (Per Annum)</td>
                      <td className="p-2.5 text-right">{formatINR(oldBreakdown.basicAnnual)}</td>
                      <td className="p-2.5 text-right font-bold text-emerald-400">
                        {formatINR(newBreakdown.basicAnnual)}
                      </td>
                      <td className="p-2.5 text-right text-emerald-400">
                        +{formatINR(newBreakdown.basicAnnual - oldBreakdown.basicAnnual)}
                      </td>
                    </tr>

                    {/* HRA */}
                    <tr>
                      <td className="p-2.5 font-semibold text-white font-sans">HRA Allocation</td>
                      <td className="p-2.5 text-right">{formatINR(oldBreakdown.hraAnnual)}</td>
                      <td className="p-2.5 text-right text-slate-200">{formatINR(newBreakdown.hraAnnual)}</td>
                      <td className="p-2.5 text-right text-emerald-400">
                        +{formatINR(newBreakdown.hraAnnual - oldBreakdown.hraAnnual)}
                      </td>
                    </tr>

                    {/* Employer PF */}
                    <tr>
                      <td className="p-2.5 font-semibold text-white font-sans">Employer EPF (12%)</td>
                      <td className="p-2.5 text-right">{formatINR(oldBreakdown.employerPfAnnual)}</td>
                      <td className="p-2.5 text-right text-slate-200">{formatINR(newBreakdown.employerPfAnnual)}</td>
                      <td className="p-2.5 text-right text-purple-400">
                        +{formatINR(newBreakdown.employerPfAnnual - oldBreakdown.employerPfAnnual)}
                      </td>
                    </tr>

                    {/* Gratuity */}
                    {includeGratuity && (
                      <tr>
                        <td className="p-2.5 font-semibold text-white font-sans">Gratuity Provision</td>
                        <td className="p-2.5 text-right">{formatINR(oldBreakdown.gratuityAnnual)}</td>
                        <td className="p-2.5 text-right text-slate-200">{formatINR(newBreakdown.gratuityAnnual)}</td>
                        <td className="p-2.5 text-right text-purple-400">
                          +{formatINR(newBreakdown.gratuityAnnual - oldBreakdown.gratuityAnnual)}
                        </td>
                      </tr>
                    )}

                    {/* Special Allowance */}
                    <tr>
                      <td className="p-2.5 font-semibold text-white font-sans">Special / Flexible Allowance</td>
                      <td className="p-2.5 text-right">{formatINR(oldBreakdown.specialAllowanceAnnual)}</td>
                      <td className="p-2.5 text-right text-rose-400">
                        {formatINR(newBreakdown.specialAllowanceAnnual)}
                      </td>
                      <td className="p-2.5 text-right text-rose-400">
                        {formatINR(newBreakdown.specialAllowanceAnnual - oldBreakdown.specialAllowanceAnnual)}
                      </td>
                    </tr>

                    {/* TOTAL CTC */}
                    <tr className="bg-slate-900/60 font-bold border-t border-slate-700">
                      <td className="p-2.5 text-white font-sans">Total Annual CTC</td>
                      <td className="p-2.5 text-right text-white">{formatINR(ctc)}</td>
                      <td className="p-2.5 text-right text-white">{formatINR(ctc)}</td>
                      <td className="p-2.5 text-right text-slate-400 font-normal font-sans">₹0 (Fixed)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Monthly Take-Home Comparison Drawer */}
            <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/70 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Monthly In-Hand Cash Flow Comparison (Pre-Tax)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1">
                  <p className="text-[11px] text-slate-400">Old Structure In-Hand</p>
                  <p className="text-xl font-bold font-mono text-white">
                    {formatINR(oldBreakdown.monthlyTakeHomePreTax)}
                    <span className="text-xs text-slate-400 font-normal"> / mo</span>
                  </p>
                  <p className="text-[10px] text-slate-500">Employee PF: {formatINR(oldBreakdown.employeePfMonthly)}/mo</p>
                </div>

                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1">
                  <p className="text-[11px] text-slate-400">New Wage Code In-Hand</p>
                  <p className="text-xl font-bold font-mono text-emerald-400">
                    {formatINR(newBreakdown.monthlyTakeHomePreTax)}
                    <span className="text-xs text-slate-400 font-normal"> / mo</span>
                  </p>
                  <p className="text-[10px] text-slate-500">Employee PF: {formatINR(newBreakdown.employeePfMonthly)}/mo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 10-Year EPF Wealth Projection Chart */}
      {activeTab === 'projection' && (
        <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/80 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/60 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
                10-Year EPF Compounded Wealth Projection (8.25% Interest)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Visualizing long-term retirement wealth accumulation growth under Old vs New 50% Basic Labour Code.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">EPF Interest Rate:</span>
              <select
                value={epfInterestRate}
                onChange={(e) => setEpfInterestRate(Number(e.target.value))}
                className="bg-slate-900 border border-slate-700 text-xs text-emerald-400 font-mono font-bold rounded-lg px-2.5 py-1 focus:outline-none"
              >
                <option value={0.0815}>8.15% p.a.</option>
                <option value={0.0825}>8.25% p.a. (Current)</option>
                <option value={0.085}>8.50% p.a.</option>
              </select>
            </div>
          </div>

          {/* SVG Line / Bar Compounding Chart */}
          <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="h-64 flex items-end justify-between gap-2 pt-8 pb-2 border-b border-slate-800">
              {yearByYearProjections.map((p) => {
                const maxVal = yearByYearProjections[9].newWealth;
                const newHeight = Math.max(10, Math.min(100, (p.newWealth / maxVal) * 100));
                const oldHeight = Math.max(10, Math.min(100, (p.oldWealth / maxVal) * 100));

                return (
                  <div key={p.year} className="flex-1 flex flex-col items-center gap-1 group">
                    <span className="text-[10px] font-mono text-emerald-400 font-bold opacity-0 group-hover:opacity-100 transition">
                      +₹{(p.delta / 1000).toFixed(0)}k
                    </span>
                    <div className="w-full max-w-[32px] bg-slate-800 rounded-t-lg overflow-hidden h-48 flex items-end justify-center gap-1 px-1">
                      <div
                        style={{ height: `${oldHeight}%` }}
                        className="w-1/2 bg-indigo-500/60 rounded-t transition-all"
                        title={`Year ${p.year} Old: ${formatINR(p.oldWealth)}`}
                      ></div>
                      <div
                        style={{ height: `${newHeight}%` }}
                        className="w-1/2 bg-emerald-500 rounded-t transition-all"
                        title={`Year ${p.year} New: ${formatINR(p.newWealth)}`}
                      ></div>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400">Y{p.year}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 text-xs pt-2">
              <div className="flex items-center gap-6">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-3 h-3 rounded bg-indigo-500/60"></span> Old Structure EPF
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <span className="w-3 h-3 rounded bg-emerald-500"></span> New 50% Basic Wage Code EPF
                </span>
              </div>

              <div className="text-right font-mono">
                <span className="text-slate-400">10-Year EPF Net Advantage: </span>
                <span className="text-emerald-400 font-bold text-sm">+{formatINR(year10Delta)}</span>
              </div>
            </div>
          </div>

          {/* Table Breakdown */}
          <div className="bg-slate-900/60 rounded-xl overflow-hidden border border-slate-800">
            <table className="w-full text-xs text-left text-slate-300 font-mono">
              <thead className="bg-slate-900 text-slate-400 font-sans uppercase text-[10px]">
                <tr>
                  <th className="p-3">Year</th>
                  <th className="p-3">Old EPF Corpus</th>
                  <th className="p-3 text-emerald-400">New 50% Basic EPF Corpus</th>
                  <th className="p-3 text-purple-400 text-right">Wealth Delta (+Gain)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {yearByYearProjections.map((p) => (
                  <tr key={p.year} className="hover:bg-slate-800/40">
                    <td className="p-3 font-bold font-sans text-white">Year {p.year}</td>
                    <td className="p-3 text-slate-300">{formatINR(p.oldWealth)}</td>
                    <td className="p-3 text-emerald-400 font-bold">{formatINR(p.newWealth)}</td>
                    <td className="p-3 text-purple-400 font-bold text-right">+{formatINR(p.delta)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CTC Negotiation Email Generator */}
      {activeTab === 'email' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Form (5 cols) */}
          <div className="lg:col-span-5 bg-slate-800/60 p-5 rounded-2xl border border-slate-700/80 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-700/60 pb-3">
              <Mail className="w-4 h-4 text-sky-400" />
              Configure Negotiation Parameters
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Your Name</label>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">HR / Recruiter Name</label>
                <input
                  type="text"
                  value={recruiterName}
                  onChange={(e) => setRecruiterName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Position / Role</label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Tone & Strategy</label>
                <select
                  value={emailTone}
                  onChange={(e) => setEmailTone(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500 font-semibold"
                >
                  <option value="HR_COMPLIANCE">HR Compliance & Statutory 50% Basic Alignment</option>
                  <option value="DIPLOMATIC_COUNTER">Diplomatic Counter-Offer (Protect In-Hand Cash)</option>
                  <option value="EXECUTIVE">Executive Level Compensation Structuring Request</option>
                </select>
              </div>
            </div>
          </div>

          {/* Email Preview & Copy (7 cols) */}
          <div className="lg:col-span-7 bg-slate-800/60 p-5 rounded-2xl border border-slate-700/80 space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Generated Email Draft
                </h3>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedNegotiationEmail);
                    showToast('Email draft copied to clipboard!');
                  }}
                  className="bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 shadow-md"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy Draft
                </button>
              </div>

              <textarea
                rows={16}
                readOnly
                value={generatedNegotiationEmail}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-200 focus:outline-none leading-relaxed mt-4"
              ></textarea>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: HR Restructuring Proposal Exporter */}
      {activeTab === 'proposal' && (
        <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/80 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Printer className="w-5 h-5 text-amber-400" />
                Formal HR Proposal Document
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Print-friendly formal restructuring proposal ready for HR management review.
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition shadow-lg flex items-center justify-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              Print / Export PDF Proposal
            </button>
          </div>

          {/* Printable Proposal Card */}
          <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 text-slate-200 space-y-6 shadow-2xl font-sans">
            {/* Proposal Header */}
            <div className="flex justify-between items-start border-b border-slate-800 pb-6">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-purple-400 uppercase">
                  Nyxa Financial Engine • Official Proposal
                </span>
                <h2 className="text-xl font-bold text-white mt-1">Salary Restructuring & Labour Code Proposal</h2>
                <p className="text-xs text-slate-400 mt-0.5">Reference ID: PROPOSAL-2026-WAGECODE-50B</p>
              </div>

              <div className="text-right text-xs text-slate-400 space-y-0.5">
                <p>Date: {new Date().toLocaleDateString('en-IN')}</p>
                <p>Prepared For: <strong className="text-white">{companyName} HR Team</strong></p>
                <p>Candidate: <strong className="text-white">{candidateName}</strong></p>
              </div>
            </div>

            {/* Proposal Summary */}
            <div className="space-y-2 text-xs leading-relaxed text-slate-300">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">1. Executive Summary</h4>
              <p>
                This proposal outlines the restructuring of annual CTC ({formatINR(ctc)}) to comply with the Ministry of
                Labour & Employment statutory guidelines under the New Wage Code legislation. The proposed model shifts
                the Basic Pay component from {(oldBasicRatio * 100).toFixed(0)}% to the mandatory 50% threshold.
              </p>
            </div>

            {/* CTC Breakdown Table */}
            <div className="space-y-2">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">2. Proposed CTC Component Breakdown</h4>
              <table className="w-full text-xs text-left text-slate-300 font-mono">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Component</th>
                    <th className="p-2.5 text-right">Original ({(oldBasicRatio * 100).toFixed(0)}%)</th>
                    <th className="p-2.5 text-right text-emerald-400 font-bold">Proposed 50% Basic</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  <tr>
                    <td className="p-2.5 font-sans font-semibold text-white">Basic Salary</td>
                    <td className="p-2.5 text-right">{formatINR(oldBreakdown.basicAnnual)}</td>
                    <td className="p-2.5 text-right text-emerald-400 font-bold">{formatINR(newBreakdown.basicAnnual)}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-sans font-semibold text-white">HRA Allowance</td>
                    <td className="p-2.5 text-right">{formatINR(oldBreakdown.hraAnnual)}</td>
                    <td className="p-2.5 text-right text-slate-200">{formatINR(newBreakdown.hraAnnual)}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-sans font-semibold text-white">Employer EPF (12%)</td>
                    <td className="p-2.5 text-right">{formatINR(oldBreakdown.employerPfAnnual)}</td>
                    <td className="p-2.5 text-right text-purple-400 font-bold">{formatINR(newBreakdown.employerPfAnnual)}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-sans font-semibold text-white">Special Allowance</td>
                    <td className="p-2.5 text-right">{formatINR(oldBreakdown.specialAllowanceAnnual)}</td>
                    <td className="p-2.5 text-right text-rose-400">{formatINR(newBreakdown.specialAllowanceAnnual)}</td>
                  </tr>
                  <tr className="bg-slate-900 font-bold">
                    <td className="p-2.5 text-white">Total Cost to Company (CTC)</td>
                    <td className="p-2.5 text-right text-white">{formatINR(ctc)}</td>
                    <td className="p-2.5 text-right text-white">{formatINR(ctc)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Long-term EPF Savings */}
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-1 text-xs">
              <h4 className="font-bold text-emerald-400 uppercase tracking-wider text-[11px]">3. Strategic Benefits</h4>
              <p className="text-slate-300">
                • 10-Year EPF Retirement Accumulation: Increases from {formatINR(yearByYearProjections[9].oldWealth)} to{' '}
                <strong className="text-emerald-400 font-mono">{formatINR(yearByYearProjections[9].newWealth)}</strong> (+{formatINR(year10Delta)} net wealth gain).
              </p>
            </div>

            {/* Signature Blocks */}
            <div className="pt-8 flex justify-between items-end text-xs text-slate-400 border-t border-slate-800">
              <div className="space-y-8">
                <p>Prepared By:</p>
                <div className="border-t border-slate-700 pt-1 w-48 font-bold text-white">
                  {candidateName}
                </div>
              </div>

              <div className="space-y-8 text-right">
                <p>Approved By (HR / Management):</p>
                <div className="border-t border-slate-700 pt-1 w-48 font-bold text-white">
                  Authorized Signatory
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
