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
  Award
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showExplainer, setShowExplainer] = useState<boolean>(false);

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

  // 5-Year EPF Compounding Calculation (EPF interest ~ 8.25% p.a.)
  const epfInterestRate = 0.0825;
  const compute5YearEpfPool = (annualContribution: number) => {
    let pool = 0;
    for (let yr = 1; yr <= 5; yr++) {
      pool = (pool + annualContribution) * (1 + epfInterestRate);
    }
    return Math.round(pool);
  };

  const old5YearEpfPool = compute5YearEpfPool(oldBreakdown.employerPfAnnual + oldBreakdown.employeePfAnnual);
  const new5YearEpfPool = compute5YearEpfPool(newBreakdown.employerPfAnnual + newBreakdown.employeePfAnnual);
  const epf5YearWealthDelta = new5YearEpfPool - old5YearEpfPool;

  // Format INR
  const formatINR = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Math.round(amt));
  };

  // Generate Export Summary Text
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
    txt += `• 5-Year EPF Retirement Pool Growth: ${formatINR(new5YearEpfPool)} (vs ${formatINR(old5YearEpfPool)} under old structure)\n`;
    txt += `• 5-Year Net Wealth Gain: +${formatINR(epf5YearWealthDelta)}\n\n`;

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

        {/* Quick Presets */}
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

        {/* 5-Year Compounded EPF Wealth */}
        <div className="bg-slate-800/80 p-5 rounded-2xl border border-purple-500/30 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-xs text-purple-300 font-semibold uppercase tracking-wider">5-Yr EPF Wealth Delta</p>
            <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold font-mono text-purple-300">
            +{formatINR(epf5YearWealthDelta)}
          </p>
          <p className="text-[11px] text-slate-400">
            Compounded EPF growth @ 8.25% p.a. tax-free interest over 5 years.
          </p>
        </div>
      </div>

      {/* Main Grid: Controls & Side-by-side Table */}
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

          {/* Stacked Component Visualization */}
          <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Visual Component Allocation Ratio
            </h4>

            <div className="space-y-3">
              {/* Old Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Old Structure (Basic: {(oldBasicRatio * 100).toFixed(0)}%)</span>
                  <span className="font-mono">{formatINR(ctc)}</span>
                </div>
                <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden flex border border-slate-800">
                  <div
                    style={{ width: `${(oldBreakdown.basicAnnual / ctc) * 100}%` }}
                    className="bg-purple-500 h-full"
                    title="Basic"
                  ></div>
                  <div
                    style={{ width: `${(oldBreakdown.hraAnnual / ctc) * 100}%` }}
                    className="bg-sky-500 h-full"
                    title="HRA"
                  ></div>
                  <div
                    style={{ width: `${(oldBreakdown.employerPfAnnual / ctc) * 100}%` }}
                    className="bg-emerald-500 h-full"
                    title="Employer PF"
                  ></div>
                  <div
                    style={{ width: `${(oldBreakdown.specialAllowanceAnnual / ctc) * 100}%` }}
                    className="bg-amber-500 h-full"
                    title="Special Allowance"
                  ></div>
                </div>
              </div>

              {/* New Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>New Wage Code (Basic: {(newBasicRatio * 100).toFixed(0)}%)</span>
                  <span className="font-mono">{formatINR(ctc)}</span>
                </div>
                <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden flex border border-slate-800">
                  <div
                    style={{ width: `${(newBreakdown.basicAnnual / ctc) * 100}%` }}
                    className="bg-purple-500 h-full"
                    title="Basic"
                  ></div>
                  <div
                    style={{ width: `${(newBreakdown.hraAnnual / ctc) * 100}%` }}
                    className="bg-sky-500 h-full"
                    title="HRA"
                  ></div>
                  <div
                    style={{ width: `${(newBreakdown.employerPfAnnual / ctc) * 100}%` }}
                    className="bg-emerald-500 h-full"
                    title="Employer PF"
                  ></div>
                  <div
                    style={{ width: `${(newBreakdown.specialAllowanceAnnual / ctc) * 100}%` }}
                    className="bg-amber-500 h-full"
                    title="Special Allowance"
                  ></div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-purple-500"></span> Basic Pay
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-sky-500"></span> HRA
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Employer PF
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-amber-500"></span> Special Allowance
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
