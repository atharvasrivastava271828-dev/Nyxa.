'use client';

import React, { useState, useMemo } from 'react';
import {
  Building2,
  TrendingDown,
  Sparkles,
  Copy,
  CheckCircle,
  PiggyBank,
  Award,
  Mail,
  Send,
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
  { label: 'Mid SE (₹15L)', ctc: 1500000, oldBasicRatio: 0.35, newBasicRatio: 0.5, hraRatio: 0.4 },
  { label: 'Senior SE (₹28L)', ctc: 2800000, oldBasicRatio: 0.35, newBasicRatio: 0.5, hraRatio: 0.5 },
  { label: 'Tech Lead (₹45L)', ctc: 4500000, oldBasicRatio: 0.3, newBasicRatio: 0.5, hraRatio: 0.5 },
];

export default function SalaryRestructuring() {
  // Input states
  const [ctc, setCtc] = useState<number>(2000000);
  const [oldBasicRatio, setOldBasicRatio] = useState<number>(0.35);
  const [newBasicRatio, setNewBasicRatio] = useState<number>(0.5);
  const [hraRatio, setHraRatio] = useState<number>(0.4);
  const [capPfTo15k, setCapPfTo15k] = useState<boolean>(false);
  const [includeGratuity, setIncludeGratuity] = useState<boolean>(true);

  // Email generator view toggle
  const [showEmailModal, setShowEmailModal] = useState<boolean>(false);
  const [copiedEmail, setCopiedEmail] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const applyPreset = (p: Preset) => {
    setCtc(p.ctc);
    setOldBasicRatio(p.oldBasicRatio);
    setNewBasicRatio(p.newBasicRatio);
    setHraRatio(p.hraRatio);
    showNotification(`Applied ${p.label}`);
  };

  // Salary Breakdown Engine
  const computeBreakdown = (basicPct: number) => {
    const basicAnnual = ctc * basicPct;
    const hraAnnual = basicAnnual * hraRatio;

    const pfBasisAnnual = capPfTo15k ? Math.min(basicAnnual, 180000) : basicAnnual;
    const employerPfAnnual = pfBasisAnnual * 0.12;
    const employeePfAnnual = pfBasisAnnual * 0.12;

    const gratuityAnnual = includeGratuity ? basicAnnual * 0.0481 : 0;

    const fixedComponents = basicAnnual + hraAnnual + employerPfAnnual + gratuityAnnual;
    const specialAllowanceAnnual = Math.max(0, ctc - fixedComponents);

    const grossMonthly = (basicAnnual + hraAnnual + specialAllowanceAnnual) / 12;
    const profTaxMonthly = 200;
    const employeePfMonthly = employeePfAnnual / 12;

    const monthlyTakeHomePreTax = grossMonthly - (employeePfMonthly + profTaxMonthly);
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

  const monthlyTakeHomeDelta = newBreakdown.monthlyTakeHomePreTax - oldBreakdown.monthlyTakeHomePreTax;
  const annualRetirementDelta = newBreakdown.annualRetirementSavings - oldBreakdown.annualRetirementSavings;

  // 10-Year EPF Compounded Wealth Gain (8.25% Interest)
  const year10Delta = useMemo(() => {
    const epfRate = 0.0825;
    const oldAnnual = oldBreakdown.employerPfAnnual + oldBreakdown.employeePfAnnual;
    const newAnnual = newBreakdown.employerPfAnnual + newBreakdown.employeePfAnnual;

    let oldPool = 0;
    let newPool = 0;

    for (let yr = 1; yr <= 10; yr++) {
      oldPool = (oldPool + oldAnnual) * (1 + epfRate);
      newPool = (newPool + newAnnual) * (1 + epfRate);
    }

    return Math.round(newPool - oldPool);
  }, [oldBreakdown, newBreakdown]);

  // Format currency
  const formatINR = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Math.round(amt));
  };

  // WhatsApp & Copy Summary Text
  const reportSummaryText = useMemo(() => {
    let txt = `*Labour Code 50% Basic Salary Restructuring Report*\n`;
    txt += `💼 Annual CTC: ${formatINR(ctc)}\n`;
    txt += `📊 Basic Pay Shift: ${(oldBasicRatio * 100).toFixed(0)}% ➔ ${(newBasicRatio * 100).toFixed(0)}%\n\n`;

    txt += `💵 *Monthly In-Hand Cashflow:* ${monthlyTakeHomeDelta >= 0 ? '+' : ''}${formatINR(monthlyTakeHomeDelta)} / mo\n`;
    txt += `🏦 *Annual Retirement Boost:* +${formatINR(annualRetirementDelta)} / yr\n`;
    txt += `🏆 *10-Year EPF Corpus Gain:* +${formatINR(year10Delta)}\n`;

    return txt;
  }, [ctc, oldBasicRatio, newBasicRatio, monthlyTakeHomeDelta, annualRetirementDelta, year10Delta]);

  // HR Negotiation Email
  const negotiationEmailText = useMemo(() => {
    return `Subject: CTC Structure Alignment Request (Labour Code 50% Basic)

Dear HR Team,

Thank you for providing the compensation breakup for the role.

Upon reviewing the CTC breakdown of ${formatINR(ctc)}, I noticed the Basic Pay is currently structured at ${(oldBasicRatio * 100).toFixed(0)}% of CTC.

Under the New Labour Code guidelines (mandating a minimum 50% Basic Pay allocation), I would like to request structuring the CTC with 50% Basic Pay (${formatINR(newBreakdown.basicAnnual)}/year).

Benefits of this alignment:
1. Full statutory compliance under the Labour Code on Wages.
2. Higher EPF retirement savings of +${formatINR(annualRetirementDelta)}/year.

Looking forward to receiving the revised offer letter with 50% Basic Pay.

Best regards,
[Your Name]`;
  }, [ctc, oldBasicRatio, newBreakdown, annualRetirementDelta]);

  const handleWhatsAppShare = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(reportSummaryText)}`;
    window.open(url, '_blank');
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(reportSummaryText);
    showNotification('Report copied to clipboard!');
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(negotiationEmailText);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
    showNotification('HR Negotiation Email copied!');
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-slate-900 text-slate-100 rounded-3xl shadow-2xl border border-slate-800 space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-purple-500 text-white px-4 py-2 rounded-full shadow-xl flex items-center gap-2 text-xs font-semibold animate-fade-in">
          <CheckCircle className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header & Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <span className="bg-purple-500/10 text-purple-400 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-purple-500/20">
            50% Basic Mandatory Labour Code
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-purple-400" />
            Salary Restructuring Calculator
          </h2>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs text-slate-400 font-medium">Presets:</span>
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => applyPreset(p)}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-full border border-slate-700 transition whitespace-nowrap flex items-center gap-1 font-medium"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3 Side-by-Side Highlight Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Monthly Take-Home Delta */}
        <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Monthly Cashflow Delta</p>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black font-mono text-rose-400">
            {monthlyTakeHomeDelta >= 0 ? '+' : ''}
            {formatINR(monthlyTakeHomeDelta)}
            <span className="text-xs text-slate-400 font-normal"> / mo</span>
          </p>
          <p className="text-[10px] text-slate-400">Monthly in-hand cash adjusts due to EPF increase.</p>
        </div>

        {/* Annual EPF Boost */}
        <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Annual EPF Boost</p>
            <PiggyBank className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
            +{formatINR(annualRetirementDelta)}
            <span className="text-xs text-slate-400 font-normal"> / yr</span>
          </p>
          <p className="text-[10px] text-slate-400">Combined extra retirement savings added annually.</p>
        </div>

        {/* 10-Yr EPF Wealth Gain */}
        <div className="bg-slate-800/60 p-4 rounded-2xl border border-purple-500/30 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-purple-300 uppercase tracking-wider">10-Yr EPF Wealth Gain</p>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black font-mono text-purple-300">+{formatINR(year10Delta)}</p>
          <p className="text-[10px] text-slate-400">Compounded retirement pool @ 8.25% interest.</p>
        </div>
      </div>

      {/* Main Layout: Inputs on Left, Side-by-Side Breakdown on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Sliders (6 cols) */}
        <div className="lg:col-span-6 bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">1. Salary Parameters</h3>

          {/* Annual CTC Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <label className="font-semibold text-slate-300">Annual Cost to Company (CTC)</label>
              <span className="font-mono font-bold text-purple-400">{formatINR(ctc)}</span>
            </div>
            <input
              type="range"
              min="500000"
              max="6000000"
              step="100000"
              value={ctc}
              onChange={(e) => setCtc(Number(e.target.value))}
              className="w-full accent-purple-500 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Original Basic % Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <label className="text-slate-300">Original Basic Pay (% of CTC)</label>
              <span className="font-mono font-bold text-amber-400">{(oldBasicRatio * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.25"
              max="0.45"
              step="0.05"
              value={oldBasicRatio}
              onChange={(e) => setOldBasicRatio(Number(e.target.value))}
              className="w-full accent-amber-500 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* New Wage Code Basic % Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <label className="text-slate-300">New Wage Code Basic Pay (% of CTC)</label>
              <span className="font-mono font-bold text-emerald-400">{(newBasicRatio * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.50"
              max="0.70"
              step="0.05"
              value={newBasicRatio}
              onChange={(e) => setNewBasicRatio(Number(e.target.value))}
              className="w-full accent-emerald-500 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Toggles */}
          <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-medium">HRA Rate</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setHraRatio(0.4)}
                  className={`px-2 py-1 rounded-lg text-xs font-medium transition ${
                    hraRatio === 0.4 ? 'bg-sky-600 text-white font-bold' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  40% (Non-Metro)
                </button>
                <button
                  type="button"
                  onClick={() => setHraRatio(0.5)}
                  className={`px-2 py-1 rounded-lg text-xs font-medium transition ${
                    hraRatio === 0.5 ? 'bg-sky-600 text-white font-bold' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  50% (Metro)
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-medium">PF Contribution</span>
              <button
                type="button"
                onClick={() => setCapPfTo15k(!capPfTo15k)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  capPfTo15k ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-300 border border-slate-800'
                }`}
              >
                {capPfTo15k ? 'Capped @ ₹1,800/mo' : 'Uncapped (12% Full Basic)'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Side-by-Side Comparison Card (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Side-by-Side Salary Structure
            </h3>

            <div className="space-y-2 text-xs font-mono">
              <div className="grid grid-cols-3 bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-[10px] text-slate-400 font-sans font-bold uppercase">
                <span>Component</span>
                <span className="text-right">Old ({(oldBasicRatio * 100).toFixed(0)}%)</span>
                <span className="text-right text-emerald-400">New ({(newBasicRatio * 100).toFixed(0)}%)</span>
              </div>

              <div className="grid grid-cols-3 px-2 py-1 text-slate-300">
                <span className="font-sans font-medium text-white">Basic Pay</span>
                <span className="text-right">{formatINR(oldBreakdown.basicAnnual)}</span>
                <span className="text-right font-bold text-emerald-400">{formatINR(newBreakdown.basicAnnual)}</span>
              </div>

              <div className="grid grid-cols-3 px-2 py-1 text-slate-300">
                <span className="font-sans font-medium text-white">HRA</span>
                <span className="text-right">{formatINR(oldBreakdown.hraAnnual)}</span>
                <span className="text-right">{formatINR(newBreakdown.hraAnnual)}</span>
              </div>

              <div className="grid grid-cols-3 px-2 py-1 text-slate-300">
                <span className="font-sans font-medium text-white">Employer EPF</span>
                <span className="text-right">{formatINR(oldBreakdown.employerPfAnnual)}</span>
                <span className="text-right font-bold text-purple-400">{formatINR(newBreakdown.employerPfAnnual)}</span>
              </div>

              <div className="grid grid-cols-3 px-2 py-1 text-slate-300">
                <span className="font-sans font-medium text-white">Special Allowance</span>
                <span className="text-right">{formatINR(oldBreakdown.specialAllowanceAnnual)}</span>
                <span className="text-right text-rose-400">{formatINR(newBreakdown.specialAllowanceAnnual)}</span>
              </div>

              <div className="grid grid-cols-3 bg-slate-900 p-2.5 rounded-xl border border-slate-800 font-bold text-white pt-2 font-sans">
                <span>Monthly In-Hand</span>
                <span className="text-right font-mono">{formatINR(oldBreakdown.monthlyTakeHomePreTax)}</span>
                <span className="text-right font-mono text-emerald-400">{formatINR(newBreakdown.monthlyTakeHomePreTax)}</span>
              </div>
            </div>
          </div>

          {/* HR Negotiation Email Accordion/Card */}
          <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-sky-400" />
                HR Negotiation Email Template
              </span>
              <button
                onClick={() => setShowEmailModal(!showEmailModal)}
                className="text-[11px] text-sky-400 hover:underline font-semibold"
              >
                {showEmailModal ? 'Hide Email' : 'View Email'}
              </button>
            </div>

            {showEmailModal && (
              <div className="space-y-2 pt-2 animate-fade-in">
                <textarea
                  readOnly
                  rows={8}
                  value={negotiationEmailText}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-300 font-mono focus:outline-none leading-relaxed"
                />
                <button
                  onClick={handleCopyEmail}
                  className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs py-2 rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy Negotiation Email
                </button>
              </div>
            )}
          </div>

          {/* Share Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleWhatsAppShare}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
            >
              <Send className="w-3.5 h-3.5" />
              WhatsApp Share
            </button>

            <button
              onClick={handleCopyReport}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs py-2.5 rounded-xl border border-slate-700 transition flex items-center justify-center gap-2"
            >
              <Copy className="w-3.5 h-3.5" />
              Copy Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
