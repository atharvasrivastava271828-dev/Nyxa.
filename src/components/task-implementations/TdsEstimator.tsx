'use client';

import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Award,
  CheckCircle,
  Copy,
  Sparkles,
  Shield,
  Home,
  Building,
  Send
} from 'lucide-react';

interface ScenarioPreset {
  name: string;
  grossSalary: number;
  rentPaidMonthly: number;
  isMetro: boolean;
  section80C: number;
  section80D: number;
  sectionNps: number;
}

const PRESETS: ScenarioPreset[] = [
  {
    name: 'Fresher (₹7L CTC)',
    grossSalary: 700000,
    rentPaidMonthly: 8000,
    isMetro: false,
    section80C: 50000,
    section80D: 10000,
    sectionNps: 0,
  },
  {
    name: 'Mid SE (₹18L CTC)',
    grossSalary: 1800000,
    rentPaidMonthly: 22000,
    isMetro: true,
    section80C: 150000,
    section80D: 25000,
    sectionNps: 50000,
  },
  {
    name: 'Senior Lead (₹32L CTC)',
    grossSalary: 3200000,
    rentPaidMonthly: 35000,
    isMetro: true,
    section80C: 150000,
    section80D: 50000,
    sectionNps: 50000,
  },
];

export default function TdsEstimator() {
  // Input states
  const [grossSalary, setGrossSalary] = useState<number>(1800000);
  const [rentPaidMonthly, setRentPaidMonthly] = useState<number>(22000);
  const [isMetro, setIsMetro] = useState<boolean>(true);

  // Old Regime Deductions
  const [section80C, setSection80C] = useState<number>(150000);
  const [section80D, setSection80D] = useState<number>(25000);
  const [sectionNps, setSectionNps] = useState<number>(50000);

  const [toast, setToast] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const applyPreset = (preset: ScenarioPreset) => {
    setGrossSalary(preset.grossSalary);
    setRentPaidMonthly(preset.rentPaidMonthly);
    setIsMetro(preset.isMetro);
    setSection80C(preset.section80C);
    setSection80D(preset.section80D);
    setSectionNps(preset.sectionNps);
    showNotification(`Applied ${preset.name}`);
  };

  // Basic salary & HRA calculations (Assume basic is 50% of CTC)
  const basicSalaryAnnual = grossSalary * 0.5;
  const hraReceivedAnnual = basicSalaryAnnual * 0.4;
  const rentPaidAnnual = rentPaidMonthly * 12;

  // HRA Exemption Math
  const hraExemption = useMemo(() => {
    if (rentPaidAnnual <= 0) return 0;
    const rule1 = hraReceivedAnnual;
    const rule2 = Math.max(0, rentPaidAnnual - 0.1 * basicSalaryAnnual);
    const rule3 = isMetro ? 0.5 * basicSalaryAnnual : 0.4 * basicSalaryAnnual;
    return Math.min(rule1, rule2, rule3);
  }, [hraReceivedAnnual, rentPaidAnnual, basicSalaryAnnual, isMetro]);

  // Old Regime Total Deductions & Tax
  const profTax = 2400;
  const oldRegimeTotalDeductions = useMemo(() => {
    const stdDeduction = 50000;
    const capped80C = Math.min(150000, section80C);
    const capped80D = Math.min(50000, section80D);
    const cappedNps = Math.min(50000, sectionNps);

    return stdDeduction + profTax + hraExemption + capped80C + capped80D + cappedNps;
  }, [hraExemption, section80C, section80D, sectionNps]);

  const oldRegimeTaxableIncome = useMemo(() => {
    return Math.max(0, grossSalary - oldRegimeTotalDeductions);
  }, [grossSalary, oldRegimeTotalDeductions]);

  // Old Regime Tax Math
  const oldRegimeTax = useMemo(() => {
    const income = oldRegimeTaxableIncome;
    if (income <= 250000) return 0;
    let tax = 0;
    if (income > 250000) tax += Math.min(income - 250000, 250000) * 0.05;
    if (income <= 500000) tax = 0; // Rebate 87A
    if (income > 500000) tax += Math.min(income - 500000, 500000) * 0.2;
    if (income > 1000000) tax += (income - 1000000) * 0.3;
    return tax * 1.04; // Add 4% Cess
  }, [oldRegimeTaxableIncome]);

  // New Regime Math (FY 2025-26 Std Deduction = ₹75,000)
  const newRegimeTaxableIncome = useMemo(() => {
    return Math.max(0, grossSalary - 75000);
  }, [grossSalary]);

  const newRegimeTax = useMemo(() => {
    const income = newRegimeTaxableIncome;
    if (income <= 300000) return 0;
    let tax = 0;
    if (income > 300000) tax += Math.min(income - 300000, 400000) * 0.05;
    if (income <= 700000) tax = 0; // Rebate 87A
    if (income > 700000) tax += Math.min(income - 700000, 300000) * 0.1;
    if (income > 1000000) tax += Math.min(income - 1000000, 200000) * 0.15;
    if (income > 1200000) tax += Math.min(income - 1200000, 300000) * 0.2;
    if (income > 1500000) tax += (income - 1500000) * 0.3;
    return tax * 1.04; // Add 4% Cess
  }, [newRegimeTaxableIncome]);

  // Monthly Take-home
  const oldRegimeMonthlyInHand = Math.max(0, Math.round((grossSalary - oldRegimeTax - profTax) / 12));
  const newRegimeMonthlyInHand = Math.max(0, Math.round((grossSalary - newRegimeTax - profTax) / 12));

  // Comparison
  const taxDifference = Math.abs(oldRegimeTax - newRegimeTax);
  const isNewRegimeBetter = newRegimeTax <= oldRegimeTax;

  // Format Currency
  const formatINR = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Math.round(amt));
  };

  // WhatsApp & Copy text export
  const summaryText = useMemo(() => {
    let txt = `*Income Tax & TDS Estimator (FY 2025-26)*\n`;
    txt += `💼 Gross CTC: ${formatINR(grossSalary)}\n\n`;
    txt += `🏆 *Recommendation:* ${isNewRegimeBetter ? 'New Tax Regime is Better' : 'Old Tax Regime Saves More'}\n`;
    txt += `💰 *Annual Tax Savings:* ${formatINR(taxDifference)}\n\n`;
    txt += `📊 *Old Tax Regime:*\n`;
    txt += `• Taxable Income: ${formatINR(oldRegimeTaxableIncome)}\n`;
    txt += `• Total Tax: ${formatINR(oldRegimeTax)}\n`;
    txt += `• Monthly In-Hand: ${formatINR(oldRegimeMonthlyInHand)}\n\n`;
    txt += `✨ *New Tax Regime:*\n`;
    txt += `• Taxable Income: ${formatINR(newRegimeTaxableIncome)}\n`;
    txt += `• Total Tax: ${formatINR(newRegimeTax)}\n`;
    txt += `• Monthly In-Hand: ${formatINR(newRegimeMonthlyInHand)}\n`;
    return txt;
  }, [grossSalary, isNewRegimeBetter, taxDifference, oldRegimeTaxableIncome, oldRegimeTax, oldRegimeMonthlyInHand, newRegimeTaxableIncome, newRegimeTax, newRegimeMonthlyInHand]);

  const handleWhatsAppShare = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(summaryText)}`;
    window.open(url, '_blank');
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(summaryText);
    showNotification('Report copied to clipboard!');
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-slate-900 text-slate-100 rounded-3xl shadow-2xl border border-slate-800 space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-sky-500 text-white px-4 py-2 rounded-full shadow-xl flex items-center gap-2 text-xs font-semibold animate-fade-in">
          <CheckCircle className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header & Quick Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <span className="bg-sky-500/10 text-sky-400 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-sky-500/20">
            FY 2025-26 Budget Updated
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1 flex items-center gap-2">
            <Calculator className="w-6 h-6 text-sky-400" />
            TDS & Tax Regime Estimator
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
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* High-Level Recommendation Banner */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg ${
          isNewRegimeBetter
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-100'
            : 'bg-indigo-950/40 border-indigo-500/30 text-indigo-100'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`p-2.5 rounded-xl ${
              isNewRegimeBetter ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'
            }`}
          >
            <Award className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/10">
              Recommendation
            </span>
            <h3 className="text-lg font-bold">
              {isNewRegimeBetter ? 'New Tax Regime is Better for You! 🎉' : 'Old Tax Regime Saves You More! 💡'}
            </h3>
            <p className="text-xs opacity-80">
              {isNewRegimeBetter
                ? `You save ${formatINR(taxDifference)} per year with the New Tax Regime (₹75k standard deduction).`
                : `You save ${formatINR(taxDifference)} per year under Old Tax Regime with HRA & Chapter VI-A deductions.`}
            </p>
          </div>
        </div>

        <div className="bg-slate-900/80 p-3 rounded-xl border border-white/10 text-right min-w-[140px]">
          <p className="text-[10px] text-slate-400 font-medium">Annual Tax Savings</p>
          <p className="text-xl font-black text-emerald-400 font-mono mt-0.5">{formatINR(taxDifference)}</p>
          <p className="text-[10px] text-slate-400">+{(taxDifference / 12).toFixed(0)} ₹/mo in hand</p>
        </div>
      </div>

      {/* Main Layout: Inputs on Left, Metric Comparison on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Sleek Range Sliders (6 cols) */}
        <div className="lg:col-span-6 bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-sky-400" />
            1. Income & Rent Sliders
          </h3>

          {/* Gross CTC Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <label className="font-semibold text-slate-300">Gross Annual CTC</label>
              <span className="font-mono font-bold text-sky-400">{formatINR(grossSalary)}</span>
            </div>
            <input
              type="range"
              min="300000"
              max="5000000"
              step="50000"
              value={grossSalary}
              onChange={(e) => setGrossSalary(Number(e.target.value))}
              className="w-full accent-sky-500 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Rent Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <label className="font-semibold text-slate-300">Monthly Rent Paid</label>
              <span className="font-mono font-bold text-amber-400">{formatINR(rentPaidMonthly)}/mo</span>
            </div>
            <input
              type="range"
              min="0"
              max="60000"
              step="1000"
              value={rentPaidMonthly}
              onChange={(e) => setRentPaidMonthly(Number(e.target.value))}
              className="w-full accent-amber-500 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Metro Toggle */}
          <div className="flex items-center justify-between bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-300 font-medium">City Type</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsMetro(true)}
                className={`px-2.5 py-1 rounded-lg font-medium text-xs transition ${
                  isMetro ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
                }`}
              >
                Metro (50%)
              </button>
              <button
                type="button"
                onClick={() => setIsMetro(false)}
                className={`px-2.5 py-1 rounded-lg font-medium text-xs transition ${
                  !isMetro ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
                }`}
              >
                Non-Metro (40%)
              </button>
            </div>
          </div>

          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 pt-2 border-t border-slate-800">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            2. Old Regime Deductions
          </h3>

          {/* Section 80C Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <label className="text-slate-300">Section 80C (EPF, ELSS, PPF)</label>
              <span className="font-mono text-emerald-400 font-semibold">{formatINR(section80C)} / 1.5L</span>
            </div>
            <input
              type="range"
              min="0"
              max="150000"
              step="5000"
              value={section80C}
              onChange={(e) => setSection80C(Number(e.target.value))}
              className="w-full accent-emerald-500 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Section 80D Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <label className="text-slate-300">Section 80D (Health Insurance)</label>
              <span className="font-mono text-emerald-400 font-semibold">{formatINR(section80D)} / 50k</span>
            </div>
            <input
              type="range"
              min="0"
              max="50000"
              step="2500"
              value={section80D}
              onChange={(e) => setSection80D(Number(e.target.value))}
              className="w-full accent-emerald-500 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Section 80CCD(1B) NPS Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <label className="text-slate-300">NPS Sec 80CCD(1B)</label>
              <span className="font-mono text-emerald-400 font-semibold">{formatINR(sectionNps)} / 50k</span>
            </div>
            <input
              type="range"
              min="0"
              max="50000"
              step="5000"
              value={sectionNps}
              onChange={(e) => setSectionNps(Number(e.target.value))}
              className="w-full accent-emerald-500 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Right Column: Side-by-Side Comparison Cards (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Old Regime Card */}
            <div
              className={`p-4 rounded-2xl border space-y-2 transition ${
                !isNewRegimeBetter ? 'bg-slate-800/80 border-indigo-500/50 shadow-lg' : 'bg-slate-800/30 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Old Regime</span>
                {!isNewRegimeBetter && (
                  <span className="text-[9px] bg-indigo-500/20 text-indigo-300 font-bold px-1.5 py-0.5 rounded">
                    WINNER
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <p className="text-[10px] text-slate-400">Total Tax Payable</p>
                <p className="text-xl font-black font-mono text-white">{formatINR(oldRegimeTax)}</p>
              </div>

              <div className="border-t border-slate-700/60 pt-2 space-y-1 text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>Taxable:</span>
                  <span className="font-mono text-slate-200">{formatINR(oldRegimeTaxableIncome)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Monthly In-Hand:</span>
                  <span className="font-mono text-emerald-400 font-bold">{formatINR(oldRegimeMonthlyInHand)}</span>
                </div>
              </div>
            </div>

            {/* New Regime Card */}
            <div
              className={`p-4 rounded-2xl border space-y-2 transition ${
                isNewRegimeBetter ? 'bg-slate-800/80 border-emerald-500/50 shadow-lg' : 'bg-slate-800/30 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">New Regime</span>
                {isNewRegimeBetter && (
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded">
                    WINNER
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <p className="text-[10px] text-slate-400">Total Tax Payable</p>
                <p className="text-xl font-black font-mono text-white">{formatINR(newRegimeTax)}</p>
              </div>

              <div className="border-t border-slate-700/60 pt-2 space-y-1 text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>Taxable:</span>
                  <span className="font-mono text-slate-200">{formatINR(newRegimeTaxableIncome)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Monthly In-Hand:</span>
                  <span className="font-mono text-emerald-400 font-bold">{formatINR(newRegimeMonthlyInHand)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown summary */}
          <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs text-slate-300">
            <div className="flex justify-between">
              <span>HRA Exemption Claimed:</span>
              <span className="font-mono font-bold text-amber-400">{formatINR(hraExemption)}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Old Regime Deductions:</span>
              <span className="font-mono font-bold text-emerald-400">{formatINR(oldRegimeTotalDeductions)}</span>
            </div>
          </div>

          {/* Quick Share Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleWhatsAppShare}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
            >
              <Send className="w-3.5 h-3.5" />
              WhatsApp Share
            </button>

            <button
              onClick={handleCopySummary}
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
