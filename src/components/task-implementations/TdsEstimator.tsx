'use client';

import React, { useState, useMemo } from 'react';
import {
  Calculator,
  TrendingDown,
  TrendingUp,
  Award,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Info,
  DollarSign,
  Shield,
  Building,
  Home,
  Percent,
  Sparkles
} from 'lucide-react';

interface ScenarioPreset {
  name: string;
  grossSalary: number;
  basicRatio: number; // e.g., 0.5 for 50%
  hraReceived: number;
  rentPaidMonthly: number;
  isMetro: boolean;
  section80C: number;
  section80D: number;
  sectionNps: number;
  homeLoanInterest: number;
  profTax: number;
}

const PRESETS: ScenarioPreset[] = [
  {
    name: 'Fresher / Junior SE (₹7 Lakhs CTC)',
    grossSalary: 700000,
    basicRatio: 0.5,
    hraReceived: 140000,
    rentPaidMonthly: 8000,
    isMetro: false,
    section80C: 50000,
    section80D: 10000,
    sectionNps: 0,
    homeLoanInterest: 0,
    profTax: 2400,
  },
  {
    name: 'Mid-Level Software Engg (₹18 Lakhs CTC)',
    grossSalary: 1800000,
    basicRatio: 0.5,
    hraReceived: 360000,
    rentPaidMonthly: 22000,
    isMetro: true,
    section80C: 150000,
    section80D: 25000,
    sectionNps: 50000,
    homeLoanInterest: 0,
    profTax: 2400,
  },
  {
    name: 'Senior Lead / Staff Engg (₹32 Lakhs CTC)',
    grossSalary: 3200000,
    basicRatio: 0.5,
    hraReceived: 640000,
    rentPaidMonthly: 35000,
    isMetro: true,
    section80C: 150000,
    section80D: 50000,
    sectionNps: 50000,
    homeLoanInterest: 180000,
    profTax: 2400,
  },
];

export default function TdsEstimator() {
  // Primary Income Input States
  const [grossSalary, setGrossSalary] = useState<number>(1800000);
  const [basicRatio, setBasicRatio] = useState<number>(0.5); // 50% basic
  const [hraReceivedAnnual, setHraReceivedAnnual] = useState<number>(360000);
  const [rentPaidMonthly, setRentPaidMonthly] = useState<number>(22000);
  const [isMetro, setIsMetro] = useState<boolean>(true);
  const [profTax, setProfTax] = useState<number>(2400);

  // Deduction States for Old Tax Regime
  const [section80C, setSection80C] = useState<number>(150000); // Capped at 1.5L
  const [section80D, setSection80D] = useState<number>(25000); // Health insurance
  const [sectionNps, setSectionNps] = useState<number>(50000); // 80CCD(1B) Capped at 50k
  const [homeLoanInterest, setHomeLoanInterest] = useState<number>(0); // Sec 24(b) Capped at 2L

  // UI accordion toggles
  const [showSlabBreakdown, setShowSlabBreakdown] = useState<boolean>(false);
  const [showHraCalculator, setShowHraCalculator] = useState<boolean>(false);

  // Apply Scenario Preset
  const applyPreset = (preset: ScenarioPreset) => {
    setGrossSalary(preset.grossSalary);
    setBasicRatio(preset.basicRatio);
    setHraReceivedAnnual(preset.hraReceived);
    setRentPaidMonthly(preset.rentPaidMonthly);
    setIsMetro(preset.isMetro);
    setSection80C(preset.section80C);
    setSection80D(preset.section80D);
    setSectionNps(preset.sectionNps);
    setHomeLoanInterest(preset.homeLoanInterest);
    setProfTax(preset.profTax);
  };

  // Calculations
  const basicSalaryAnnual = useMemo(() => grossSalary * basicRatio, [grossSalary, basicRatio]);
  const rentPaidAnnual = useMemo(() => rentPaidMonthly * 12, [rentPaidMonthly]);

  // HRA Exemption Calculation (Minimum of 3 rules)
  const hraExemption = useMemo(() => {
    if (rentPaidAnnual <= 0) return 0;
    const rule1 = hraReceivedAnnual;
    const rule2 = Math.max(0, rentPaidAnnual - 0.1 * basicSalaryAnnual);
    const rule3 = isMetro ? 0.5 * basicSalaryAnnual : 0.4 * basicSalaryAnnual;

    return Math.min(rule1, rule2, rule3);
  }, [hraReceivedAnnual, rentPaidAnnual, basicSalaryAnnual, isMetro]);

  // Total Deductions for Old Regime
  const oldRegimeTotalDeductions = useMemo(() => {
    const stdDeduction = 50000;
    const capped80C = Math.min(150000, section80C);
    const capped80D = Math.min(100000, section80D);
    const cappedNps = Math.min(50000, sectionNps);
    const cappedHomeLoan = Math.min(200000, homeLoanInterest);

    return stdDeduction + profTax + hraExemption + capped80C + capped80D + cappedNps + cappedHomeLoan;
  }, [profTax, hraExemption, section80C, section80D, sectionNps, homeLoanInterest]);

  // Old Regime Taxable Income
  const oldRegimeTaxableIncome = useMemo(() => {
    return Math.max(0, grossSalary - oldRegimeTotalDeductions);
  }, [grossSalary, oldRegimeTotalDeductions]);

  // New Regime Taxable Income (Budget 2024 / FY 2025-26 Std Deduction = ₹75,000)
  const newRegimeStdDeduction = 75000;
  const newRegimeTaxableIncome = useMemo(() => {
    return Math.max(0, grossSalary - newRegimeStdDeduction);
  }, [grossSalary]);

  // Tax Calculation Engine: Old Regime Slabs
  const oldRegimeTaxCalculated = useMemo(() => {
    let income = oldRegimeTaxableIncome;
    if (income <= 250000) return { tax: 0, cess: 0, totalTax: 0, slabs: [] };

    let tax = 0;
    const slabs: { range: string; rate: string; amount: number }[] = [];

    // Slab 1: 0 to 2.5L @ 0%
    slabs.push({ range: '₹0 - ₹2,50,000', rate: '0%', amount: 0 });

    // Slab 2: 2.5L to 5L @ 5%
    if (income > 250000) {
      const slabAmt = Math.min(income - 250000, 250000);
      const slabTax = slabAmt * 0.05;
      tax += slabTax;
      slabs.push({ range: '₹2,50,001 - ₹5,00,000', rate: '5%', amount: slabTax });
    }

    // Section 87A rebate for Old Regime if taxable income <= 5L
    if (income <= 500000) {
      tax = 0;
    }

    // Slab 3: 5L to 10L @ 20%
    if (income > 500000) {
      const slabAmt = Math.min(income - 500000, 500000);
      const slabTax = slabAmt * 0.2;
      tax += slabTax;
      slabs.push({ range: '₹5,00,001 - ₹10,00,000', rate: '20%', amount: slabTax });
    }

    // Slab 4: Above 10L @ 30%
    if (income > 1000000) {
      const slabAmt = income - 1000000;
      const slabTax = slabAmt * 0.3;
      tax += slabTax;
      slabs.push({ range: 'Above ₹10,00,000', rate: '30%', amount: slabTax });
    }

    const cess = tax * 0.04;
    return { tax, cess, totalTax: tax + cess, slabs };
  }, [oldRegimeTaxableIncome]);

  // Tax Calculation Engine: New Regime Slabs (FY 2025-26 Revised Budget 2024 Slabs)
  const newRegimeTaxCalculated = useMemo(() => {
    let income = newRegimeTaxableIncome;
    if (income <= 300000) return { tax: 0, cess: 0, totalTax: 0, slabs: [] };

    let tax = 0;
    const slabs: { range: string; rate: string; amount: number }[] = [];

    // 0 - 3L @ 0%
    slabs.push({ range: '₹0 - ₹3,00,000', rate: '0%', amount: 0 });

    // 3L - 7L @ 5%
    if (income > 300000) {
      const slabAmt = Math.min(income - 300000, 400000);
      const slabTax = slabAmt * 0.05;
      tax += slabTax;
      slabs.push({ range: '₹3,00,001 - ₹7,00,000', rate: '5%', amount: slabTax });
    }

    // 87A Rebate in New Regime: Full tax rebate if taxable income <= ₹7,00,000
    if (income <= 700000) {
      tax = 0;
    }

    // 7L - 10L @ 10%
    if (income > 700000) {
      const slabAmt = Math.min(income - 700000, 300000);
      const slabTax = slabAmt * 0.1;
      tax += slabTax;
      slabs.push({ range: '₹7,00,001 - ₹10,00,000', rate: '10%', amount: slabTax });
    }

    // 10L - 12L @ 15%
    if (income > 1000000) {
      const slabAmt = Math.min(income - 1000000, 200000);
      const slabTax = slabAmt * 0.15;
      tax += slabTax;
      slabs.push({ range: '₹10,00,001 - ₹12,00,000', rate: '15%', amount: slabTax });
    }

    // 12L - 15L @ 20%
    if (income > 1200000) {
      const slabAmt = Math.min(income - 1200000, 300000);
      const slabTax = slabAmt * 0.2;
      tax += slabTax;
      slabs.push({ range: '₹12,00,001 - ₹15,00,000', rate: '20%', amount: slabTax });
    }

    // Above 15L @ 30%
    if (income > 1500000) {
      const slabAmt = income - 1500000;
      const slabTax = slabAmt * 0.3;
      tax += slabTax;
      slabs.push({ range: 'Above ₹15,00,000', rate: '30%', amount: slabTax });
    }

    const cess = tax * 0.04;
    return { tax, cess, totalTax: tax + cess, slabs };
  }, [newRegimeTaxableIncome]);

  // Take-home calculations
  const oldRegimeMonthlyTakeHome = useMemo(() => {
    const annualNet = grossSalary - oldRegimeTaxCalculated.totalTax - profTax;
    return Math.max(0, Math.round(annualNet / 12));
  }, [grossSalary, oldRegimeTaxCalculated.totalTax, profTax]);

  const newRegimeMonthlyTakeHome = useMemo(() => {
    const annualNet = grossSalary - newRegimeTaxCalculated.totalTax - profTax;
    return Math.max(0, Math.round(annualNet / 12));
  }, [grossSalary, newRegimeTaxCalculated.totalTax, profTax]);

  // Difference comparison
  const taxDifference = useMemo(() => {
    return Math.abs(oldRegimeTaxCalculated.totalTax - newRegimeTaxCalculated.totalTax);
  }, [oldRegimeTaxCalculated.totalTax, newRegimeTaxCalculated.totalTax]);

  const isNewRegimeBetter = newRegimeTaxCalculated.totalTax <= oldRegimeTaxCalculated.totalTax;

  // Break-even deduction threshold calculation for Old Regime
  // Estimates minimum deductions required in Old Regime to beat New Regime
  const breakEvenDeductionNeeded = useMemo(() => {
    const targetTax = newRegimeTaxCalculated.totalTax;
    if (targetTax === 0) return 375000; // rough threshold

    // Simple search for break-even deduction
    let testDed = 50000;
    while (testDed < grossSalary) {
      const taxable = Math.max(0, grossSalary - testDed);
      let t = 0;
      if (taxable > 250000) t += Math.min(taxable - 250000, 250000) * 0.05;
      if (taxable <= 500000) t = 0;
      if (taxable > 500000) t += Math.min(taxable - 500000, 500000) * 0.2;
      if (taxable > 1000000) t += (taxable - 1000000) * 0.3;
      t = t * 1.04;

      if (t <= targetTax) {
        return testDed;
      }
      testDed += 5000;
    }
    return testDed;
  }, [grossSalary, newRegimeTaxCalculated.totalTax]);

  // Currency formatter
  const formatINR = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Math.round(amt));
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-slate-800 space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-sky-500/10 text-sky-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-sky-500/20">
              FY 2025-26 / Budget 2024 Updated
            </span>
            <span className="text-xs text-slate-400">Income Tax & TDS Estimator</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 flex items-center gap-2">
            <Calculator className="w-7 h-7 text-sky-400" />
            New vs Old Tax Regime Calculator
          </h2>
        </div>

        {/* Quick Scenario Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Quick Presets:</span>
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => applyPreset(p)}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              {p.name.split(' ')[0]} {p.name.split(' ')[1]}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendation Banner */}
      <div
        className={`p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg ${
          isNewRegimeBetter
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-100'
            : 'bg-indigo-950/40 border-indigo-500/40 text-indigo-100'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`p-3 rounded-xl ${
              isNewRegimeBetter ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'
            }`}
          >
            <Award className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/10">
                Optimal Recommendation
              </span>
              <span className="text-xs opacity-80">Based on your inputs</span>
            </div>
            <h3 className="text-xl font-bold">
              {isNewRegimeBetter ? 'New Tax Regime is Better for You! 🎉' : 'Old Tax Regime Saves You More! 💡'}
            </h3>
            <p className="text-xs opacity-90 leading-relaxed max-w-2xl">
              {isNewRegimeBetter
                ? `You save ${formatINR(taxDifference)} per year in taxes by choosing the New Tax Regime (FY 2025-26 slabs with ₹75,000 standard deduction).`
                : `You save ${formatINR(taxDifference)} per year in taxes under the Old Tax Regime thanks to your HRA, 80C, 80D, and other exemptions.`}
            </p>
          </div>
        </div>

        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-white/10 text-right min-w-[180px]">
          <p className="text-[11px] text-slate-400 font-medium">Annual Tax Savings</p>
          <p className="text-2xl font-black text-emerald-400 font-mono mt-0.5">{formatINR(taxDifference)}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            +{(taxDifference / 12).toFixed(0)} ₹/month in hand
          </p>
        </div>
      </div>

      {/* Main Grid: Inputs Column & Side-by-Side Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form (5 cols) */}
        <div className="lg:col-span-5 bg-slate-800/40 p-5 rounded-2xl border border-slate-800 space-y-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-700/60 pb-2">
            <Building className="w-4 h-4 text-sky-400" />
            1. Income & Salary Structure
          </h3>

          {/* Annual CTC Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <label className="font-semibold text-slate-200">Gross Annual Salary / CTC</label>
              <span className="font-mono font-bold text-sky-400">{formatINR(grossSalary)}</span>
            </div>
            <input
              type="number"
              min="300000"
              max="10000000"
              step="50000"
              value={grossSalary}
              onChange={(e) => setGrossSalary(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
            />
            <input
              type="range"
              min="300000"
              max="5000000"
              step="50000"
              value={grossSalary}
              onChange={(e) => setGrossSalary(Number(e.target.value))}
              className="w-full accent-sky-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Basic Pay % */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <label className="font-semibold text-slate-200">Basic Salary (% of CTC)</label>
              <span className="font-mono text-slate-300">
                {(basicRatio * 100).toFixed(0)}% ({formatINR(basicSalaryAnnual)}/yr)
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[0.4, 0.5, 0.6].map((ratio) => (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => {
                    setBasicRatio(ratio);
                    setHraReceivedAnnual(grossSalary * ratio * 0.4);
                  }}
                  className={`py-1.5 text-xs font-medium rounded-lg border transition ${
                    basicRatio === ratio
                      ? 'bg-sky-600 text-white border-sky-500 font-bold'
                      : 'bg-slate-900 text-slate-400 border-slate-700'
                  }`}
                >
                  {(ratio * 100).toFixed(0)}% Basic
                </button>
              ))}
            </div>
          </div>

          {/* HRA & Rent Details */}
          <div className="space-y-3 pt-2 border-t border-slate-700/60">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Home className="w-4 h-4 text-amber-400" />
                2. HRA & Rent Details (Old Regime)
              </h3>
              <button
                type="button"
                onClick={() => setShowHraCalculator(!showHraCalculator)}
                className="text-[11px] text-sky-400 hover:underline flex items-center gap-1"
              >
                {showHraCalculator ? 'Hide HRA details' : 'View HRA math'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Monthly Rent Paid (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={rentPaidMonthly}
                  onChange={(e) => setRentPaidMonthly(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">HRA Component in Salary (Annual)</label>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  value={hraReceivedAnnual}
                  onChange={(e) => setHraReceivedAnnual(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Metro Toggle */}
            <div className="flex items-center justify-between bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/80">
              <span className="text-xs text-slate-300 font-medium">City Metro Status</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsMetro(true)}
                  className={`px-3 py-1 text-xs rounded-md font-medium transition ${
                    isMetro ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
                  }`}
                >
                  Metro (50%)
                </button>
                <button
                  type="button"
                  onClick={() => setIsMetro(false)}
                  className={`px-3 py-1 text-xs rounded-md font-medium transition ${
                    !isMetro ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
                  }`}
                >
                  Non-Metro (40%)
                </button>
              </div>
            </div>

            {/* HRA Math Dropdown info */}
            {showHraCalculator && (
              <div className="bg-slate-900 p-3 rounded-lg border border-amber-500/30 text-[11px] space-y-1.5 text-slate-300">
                <p className="font-bold text-amber-400">HRA Exemption Math (Lowest of 3):</p>
                <p>1. Actual HRA Received: {formatINR(hraReceivedAnnual)}</p>
                <p>
                  2. Rent Paid minus 10% Basic: {formatINR(rentPaidAnnual)} - {formatINR(0.1 * basicSalaryAnnual)} ={' '}
                  <strong className="text-white">
                    {formatINR(Math.max(0, rentPaidAnnual - 0.1 * basicSalaryAnnual))}
                  </strong>
                </p>
                <p>
                  3. {isMetro ? '50%' : '40%'} of Basic Pay:{' '}
                  {formatINR((isMetro ? 0.5 : 0.4) * basicSalaryAnnual)}
                </p>
                <div className="border-t border-slate-800 pt-1 font-bold text-emerald-400 flex justify-between">
                  <span>Calculated Exempt HRA:</span>
                  <span>{formatINR(hraExemption)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Section 80 Deductions (Old Regime) */}
          <div className="space-y-3 pt-2 border-t border-slate-700/60">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              3. Tax Deductions (Old Regime Only)
            </h3>

            {/* Section 80C */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <label className="text-slate-300">Section 80C (EPF, PPF, ELSS, LIC)</label>
                <span className="font-mono text-emerald-400 font-semibold">{formatINR(section80C)} / 1.5L</span>
              </div>
              <input
                type="number"
                min="0"
                max="150000"
                step="5000"
                value={section80C}
                onChange={(e) => setSection80C(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Section 80D */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <label className="text-slate-300">Section 80D (Health Insurance)</label>
                <span className="font-mono text-emerald-400 font-semibold">{formatINR(section80D)}</span>
              </div>
              <input
                type="number"
                min="0"
                max="100000"
                step="5000"
                value={section80D}
                onChange={(e) => setSection80D(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Section 80CCD(1B) NPS */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <label className="text-slate-300">NPS Sec 80CCD(1B) (Voluntary)</label>
                <span className="font-mono text-emerald-400 font-semibold">{formatINR(sectionNps)} / 50k</span>
              </div>
              <input
                type="number"
                min="0"
                max="50000"
                step="5000"
                value={sectionNps}
                onChange={(e) => setSectionNps(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Home Loan Interest Sec 24(b) */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <label className="text-slate-300">Home Loan Interest Sec 24(b)</label>
                <span className="font-mono text-emerald-400 font-semibold">{formatINR(homeLoanInterest)} / 2L</span>
              </div>
              <input
                type="number"
                min="0"
                max="200000"
                step="10000"
                value={homeLoanInterest}
                onChange={(e) => setHomeLoanInterest(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Side-by-Side Comparison Cards & Slabs (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* NEW REGIME CARD */}
            <div
              className={`p-5 rounded-2xl border transition relative space-y-4 shadow-md ${
                isNewRegimeBetter
                  ? 'bg-slate-800/90 border-emerald-500 ring-2 ring-emerald-500/30'
                  : 'bg-slate-800/50 border-slate-700'
              }`}
            >
              {isNewRegimeBetter && (
                <span className="absolute -top-3 right-4 bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md">
                  RECOMMENDED
                </span>
              )}

              <div className="border-b border-slate-700/60 pb-3">
                <h4 className="font-bold text-white text-base">New Tax Regime</h4>
                <p className="text-[11px] text-slate-400">Default Regime (FY 2025-26 Revised Slabs)</p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Gross Salary:</span>
                  <span className="font-mono text-slate-200">{formatINR(grossSalary)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Standard Deduction:</span>
                  <span className="font-mono text-emerald-400">-{formatINR(newRegimeStdDeduction)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Other Exemptions:</span>
                  <span className="font-mono text-slate-500">N/A</span>
                </div>
                <div className="flex justify-between border-t border-slate-700/60 pt-2 font-semibold">
                  <span className="text-slate-300">Net Taxable Income:</span>
                  <span className="font-mono text-white">{formatINR(newRegimeTaxableIncome)}</span>
                </div>
              </div>

              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700/60 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Income Tax:</span>
                  <span className="font-mono text-slate-200">{formatINR(newRegimeTaxCalculated.tax)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Health & Edu Cess (4%):</span>
                  <span className="font-mono text-slate-200">{formatINR(newRegimeTaxCalculated.cess)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold pt-1 border-t border-slate-800">
                  <span className="text-slate-200">Total Tax Payable:</span>
                  <span className="font-mono text-rose-400">{formatINR(newRegimeTaxCalculated.totalTax)}</span>
                </div>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-center">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Monthly In-Hand Salary</p>
                <p className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
                  {formatINR(newRegimeMonthlyTakeHome)}
                </p>
                <p className="text-[10px] text-slate-400">TDS: {formatINR(newRegimeTaxCalculated.totalTax / 12)}/mo</p>
              </div>
            </div>

            {/* OLD REGIME CARD */}
            <div
              className={`p-5 rounded-2xl border transition relative space-y-4 shadow-md ${
                !isNewRegimeBetter
                  ? 'bg-slate-800/90 border-indigo-500 ring-2 ring-indigo-500/30'
                  : 'bg-slate-800/50 border-slate-700'
              }`}
            >
              {!isNewRegimeBetter && (
                <span className="absolute -top-3 right-4 bg-indigo-500 text-white font-black text-[10px] uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md">
                  RECOMMENDED
                </span>
              )}

              <div className="border-b border-slate-700/60 pb-3">
                <h4 className="font-bold text-white text-base">Old Tax Regime</h4>
                <p className="text-[11px] text-slate-400">Allows HRA, 80C, 80D & Home Loan exemptions</p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Gross Salary:</span>
                  <span className="font-mono text-slate-200">{formatINR(grossSalary)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Deductions:</span>
                  <span className="font-mono text-emerald-400">-{formatINR(oldRegimeTotalDeductions)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 pl-2">
                  <span>(Std Ded + HRA + 80C + 80D)</span>
                </div>
                <div className="flex justify-between border-t border-slate-700/60 pt-2 font-semibold">
                  <span className="text-slate-300">Net Taxable Income:</span>
                  <span className="font-mono text-white">{formatINR(oldRegimeTaxableIncome)}</span>
                </div>
              </div>

              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700/60 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Income Tax:</span>
                  <span className="font-mono text-slate-200">{formatINR(oldRegimeTaxCalculated.tax)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Health & Edu Cess (4%):</span>
                  <span className="font-mono text-slate-200">{formatINR(oldRegimeTaxCalculated.cess)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold pt-1 border-t border-slate-800">
                  <span className="text-slate-200">Total Tax Payable:</span>
                  <span className="font-mono text-rose-400">{formatINR(oldRegimeTaxCalculated.totalTax)}</span>
                </div>
              </div>

              <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-xl text-center">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Monthly In-Hand Salary</p>
                <p className="text-2xl font-black text-indigo-300 font-mono mt-0.5">
                  {formatINR(oldRegimeMonthlyTakeHome)}
                </p>
                <p className="text-[10px] text-slate-400">TDS: {formatINR(oldRegimeTaxCalculated.totalTax / 12)}/mo</p>
              </div>
            </div>
          </div>

          {/* Break-Even Insight Box */}
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <Info className="w-4 h-4" />
              <span>Break-Even Deductions Analysis</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              To make the <strong className="text-white">Old Tax Regime</strong> cheaper than the New Regime for a salary of{' '}
              <strong className="text-sky-400">{formatINR(grossSalary)}</strong>, you need total deductions & exemptions of at least{' '}
              <strong className="text-emerald-400 font-mono text-sm">{formatINR(breakEvenDeductionNeeded)}</strong> per year.
            </p>
            <p className="text-slate-400 text-[11px]">
              Your current configured deductions under Old Regime total{' '}
              <strong className="text-white font-mono">{formatINR(oldRegimeTotalDeductions)}</strong>.
            </p>
          </div>

          {/* Accordion: Detailed Slab-by-Slab Breakdown */}
          <div className="bg-slate-800/40 rounded-xl border border-slate-800 overflow-hidden">
            <button
              onClick={() => setShowSlabBreakdown(!showSlabBreakdown)}
              className="w-full p-4 flex items-center justify-between text-xs font-bold text-slate-200 hover:bg-slate-800/60 transition"
            >
              <span className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-sky-400" />
                View Detailed Slab-by-Slab Tax Breakdown
              </span>
              {showSlabBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showSlabBreakdown && (
              <div className="p-4 border-t border-slate-800 space-y-4 text-xs">
                {/* New Regime Slabs Table */}
                <div className="space-y-2">
                  <p className="font-bold text-emerald-400 text-[11px] uppercase tracking-wider">
                    New Tax Regime Slabs (FY 2025-26)
                  </p>
                  <table className="w-full text-left text-slate-300">
                    <thead className="bg-slate-900 text-slate-400 font-mono text-[10px]">
                      <tr>
                        <th className="p-2">Income Slab</th>
                        <th className="p-2">Tax Rate</th>
                        <th className="p-2 text-right">Tax Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {newRegimeTaxCalculated.slabs.map((s, idx) => (
                        <tr key={idx}>
                          <td className="p-2">{s.range}</td>
                          <td className="p-2 font-mono text-sky-400">{s.rate}</td>
                          <td className="p-2 text-right font-mono font-semibold text-slate-200">
                            {formatINR(s.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Old Regime Slabs Table */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <p className="font-bold text-indigo-400 text-[11px] uppercase tracking-wider">
                    Old Tax Regime Slabs
                  </p>
                  <table className="w-full text-left text-slate-300">
                    <thead className="bg-slate-900 text-slate-400 font-mono text-[10px]">
                      <tr>
                        <th className="p-2">Income Slab</th>
                        <th className="p-2">Tax Rate</th>
                        <th className="p-2 text-right">Tax Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {oldRegimeTaxCalculated.slabs.map((s, idx) => (
                        <tr key={idx}>
                          <td className="p-2">{s.range}</td>
                          <td className="p-2 font-mono text-sky-400">{s.rate}</td>
                          <td className="p-2 text-right font-mono font-semibold text-slate-200">
                            {formatINR(s.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
