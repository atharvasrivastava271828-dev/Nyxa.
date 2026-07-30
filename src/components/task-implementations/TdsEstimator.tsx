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
  Sparkles,
  BarChart3,
  FileText,
  Zap,
  Sliders,
  Check,
  ZapOff
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

// Form 16 Pre-loaded Sample Templates
const FORM16_SAMPLES = [
  {
    name: 'TCS Software Engineer Form 16',
    text: `FORM NO. 16 - PART B (FY 2025-26)
Certificate under Section 203 of the Income-tax Act, 1961
Employer: Tata Consultancy Services Ltd (PAN: AAACT1234F)
--------------------------------------------------------
1. Gross Salary under Section 17(1):         ₹1,650,000
2. Less: Allowances exempt u/s 10:
   - House Rent Allowance u/s 10(13A):       ₹210,000
3. Balance (1 - 2):                          ₹1,440,000
4. Deductions under Section 16:
   - Standard Deduction u/s 16(ia):          ₹50,000
   - Tax on Employment (Prof Tax):           ₹2,400
5. Total Deductions under Chapter VI-A:
   - Section 80C (EPF/ELSS):                ₹150,000
   - Section 80D (Health Insurance):        ₹25,000
   - Section 80CCD(1B) (NPS):                ₹50,000
   - Section 24(b) (Home Loan Interest):     ₹0
========================================================
Total Taxable Income (Old Regime):           ₹1,162,600
Total Tax Deducted at Source (TDS):          ₹165,391`,
    parsed: {
      grossSalary: 1650000,
      rentPaidMonthly: 20000,
      hraReceived: 210000,
      section80C: 150000,
      section80D: 25000,
      sectionNps: 50000,
      homeLoanInterest: 0,
      profTax: 2400,
    },
  },
  {
    name: 'Flipkart Product Lead Form 16',
    text: `FORM NO. 16 - PART B (FY 2025-26)
Employer: Flipkart India Pvt Ltd (PAN: AABCF9921K)
--------------------------------------------------------
1. Gross Salary under Section 17(1):         ₹3,400,000
2. Less: Allowances exempt u/s 10 (HRA):     ₹420,000
3. Standard Deduction:                       ₹50,000
4. Professional Tax:                          ₹2,400
5. Chapter VI-A Deductions:
   - Section 80C:                             ₹120,000
   - Section 80D:                             ₹45,000
   - Section 80CCD(1B) NPS:                   ₹50,000
   - Home Loan Interest Sec 24(b):            ₹160,000
========================================================
Total Tax Deducted at Source (TDS):          ₹572,000`,
    parsed: {
      grossSalary: 3400000,
      rentPaidMonthly: 35000,
      hraReceived: 420000,
      section80C: 120000,
      section80D: 45000,
      sectionNps: 50000,
      homeLoanInterest: 160000,
      profTax: 2400,
    },
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

  // Active Tab & Accordions
  const [activeTab, setActiveTab] = useState<'calculator' | 'charts' | 'wizard' | 'form16'>('calculator');
  const [showSlabBreakdown, setShowSlabBreakdown] = useState<boolean>(false);
  const [showHraCalculator, setShowHraCalculator] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form 16 parser states
  const [form16Text, setForm16Text] = useState<string>(FORM16_SAMPLES[0].text);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

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
    showToast(`Applied "${preset.name.split(' ')[0]}" preset`);
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

    slabs.push({ range: '₹0 - ₹2,50,000', rate: '0%', amount: 0 });

    if (income > 250000) {
      const slabAmt = Math.min(income - 250000, 250000);
      const slabTax = slabAmt * 0.05;
      tax += slabTax;
      slabs.push({ range: '₹2,50,001 - ₹5,00,000', rate: '5%', amount: slabTax });
    }

    if (income <= 500000) {
      tax = 0;
    }

    if (income > 500000) {
      const slabAmt = Math.min(income - 500000, 500000);
      const slabTax = slabAmt * 0.2;
      tax += slabTax;
      slabs.push({ range: '₹5,00,001 - ₹10,00,000', rate: '20%', amount: slabTax });
    }

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

    slabs.push({ range: '₹0 - ₹3,00,000', rate: '0%', amount: 0 });

    if (income > 300000) {
      const slabAmt = Math.min(income - 300000, 400000);
      const slabTax = slabAmt * 0.05;
      tax += slabTax;
      slabs.push({ range: '₹3,00,001 - ₹7,00,000', rate: '5%', amount: slabTax });
    }

    if (income <= 700000) {
      tax = 0;
    }

    if (income > 700000) {
      const slabAmt = Math.min(income - 700000, 300000);
      const slabTax = slabAmt * 0.1;
      tax += slabTax;
      slabs.push({ range: '₹7,00,001 - ₹10,00,000', rate: '10%', amount: slabTax });
    }

    if (income > 1000000) {
      const slabAmt = Math.min(income - 1000000, 200000);
      const slabTax = slabAmt * 0.15;
      tax += slabTax;
      slabs.push({ range: '₹10,00,001 - ₹12,00,000', rate: '15%', amount: slabTax });
    }

    if (income > 1200000) {
      const slabAmt = Math.min(income - 1200000, 300000);
      const slabTax = slabAmt * 0.2;
      tax += slabTax;
      slabs.push({ range: '₹12,00,001 - ₹15,00,000', rate: '20%', amount: slabTax });
    }

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
  const breakEvenDeductionNeeded = useMemo(() => {
    const targetTax = newRegimeTaxCalculated.totalTax;
    if (targetTax === 0) return 375000;

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

  // 80C/80D Optimization Wizard Math
  const optimizationWizardStats = useMemo(() => {
    const max80C = 150000;
    const max80D = 50000;
    const maxNps = 50000;
    const maxHomeLoan = 200000;

    const gap80C = Math.max(0, max80C - section80C);
    const gap80D = Math.max(0, max80D - section80D);
    const gapNps = Math.max(0, maxNps - sectionNps);
    const gapHomeLoan = Math.max(0, maxHomeLoan - homeLoanInterest);

    const totalUnclaimedDeductions = gap80C + gap80D + gapNps + gapHomeLoan;
    // Marginal tax rate estimate (approx 31.2% for >10L income)
    const marginalRate = oldRegimeTaxableIncome > 1000000 ? 0.312 : oldRegimeTaxableIncome > 500000 ? 0.208 : 0.052;
    const potentialTaxSavings = totalUnclaimedDeductions * marginalRate;

    return {
      gap80C,
      gap80D,
      gapNps,
      gapHomeLoan,
      totalUnclaimedDeductions,
      potentialTaxSavings,
    };
  }, [section80C, section80D, sectionNps, homeLoanInterest, oldRegimeTaxableIncome]);

  const handleAutoMaximizeDeductions = () => {
    setSection80C(150000);
    setSection80D(50000);
    setSectionNps(50000);
    showToast('Auto-maximized 80C, 80D & 80CCD(1B) NPS deductions!');
  };

  // Form 16 Parser Logic
  const handleParseForm16 = () => {
    if (!form16Text.trim()) return;

    let parsedGross = 1800000;
    let parsedHra = 360000;
    let parsed80C = 150000;
    let parsed80D = 25000;
    let parsedNps = 50000;
    let parsedHL = 0;

    const grossMatch = form16Text.match(/(?:Gross Salary|Section 17\(1\))[\s:=]*[₹Rs\.]*\s*([\d,]+)/i);
    if (grossMatch && grossMatch[1]) {
      parsedGross = parseInt(grossMatch[1].replace(/,/g, ''), 10);
    }

    const hraMatch = form16Text.match(/(?:HRA|House Rent Allowance|u\/s 10\(13A\))[\s:=]*[₹Rs\.]*\s*([\d,]+)/i);
    if (hraMatch && hraMatch[1]) {
      parsedHra = parseInt(hraMatch[1].replace(/,/g, ''), 10);
    }

    const cMatch = form16Text.match(/(?:Section 80C|80C)[\s:=]*[₹Rs\.]*\s*([\d,]+)/i);
    if (cMatch && cMatch[1]) {
      parsed80C = parseInt(cMatch[1].replace(/,/g, ''), 10);
    }

    const dMatch = form16Text.match(/(?:Section 80D|80D)[\s:=]*[₹Rs\.]*\s*([\d,]+)/i);
    if (dMatch && dMatch[1]) {
      parsed80D = parseInt(dMatch[1].replace(/,/g, ''), 10);
    }

    const npsMatch = form16Text.match(/(?:Section 80CCD\(1B\)|NPS)[\s:=]*[₹Rs\.]*\s*([\d,]+)/i);
    if (npsMatch && npsMatch[1]) {
      parsedNps = parseInt(npsMatch[1].replace(/,/g, ''), 10);
    }

    setGrossSalary(parsedGross);
    setHraReceivedAnnual(parsedHra);
    setSection80C(parsed80C);
    setSection80D(parsed80D);
    setSectionNps(parsedNps);

    showToast('Form 16 parsed & populated into estimator!');
  };

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
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-sky-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

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

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('calculator')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'calculator' ? 'bg-sky-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Calculator className="w-4 h-4" />
          Primary Calculator
        </button>

        <button
          onClick={() => setActiveTab('charts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'charts' ? 'bg-sky-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          SVG Tax Burden Charts
        </button>

        <button
          onClick={() => setActiveTab('wizard')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'wizard' ? 'bg-sky-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4 text-amber-400" />
          80C/80D Max Optimization Wizard
        </button>

        <button
          onClick={() => setActiveTab('form16')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'form16' ? 'bg-sky-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4 text-purple-400" />
          Form 16 Parser
        </button>
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

      {/* TAB 1: Primary Calculator */}
      {activeTab === 'calculator' && (
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
          </div>
        </div>
      )}

      {/* TAB 2: Interactive SVG Tax Burden Charts */}
      {activeTab === 'charts' && (
        <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/80 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              Visual SVG Tax Burden & Net In-Hand Comparison
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Comparative breakdown showing Tax Payable vs Monthly Take-Home cash across Old & New regimes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chart 1: Tax Burden Comparison Bar Chart */}
            <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Annual Tax Burden (Lower is Better)
              </h4>

              <div className="h-56 flex items-end justify-center gap-12 pt-6 pb-2 border-b border-slate-800">
                {/* Old Regime Bar */}
                <div className="flex flex-col items-center gap-2 group w-24">
                  <span className="text-xs font-mono font-bold text-rose-400">
                    {formatINR(oldRegimeTaxCalculated.totalTax)}
                  </span>
                  <div className="w-full bg-slate-800 rounded-t-xl overflow-hidden h-36 flex items-end">
                    <div
                      style={{
                        height: `${Math.max(10, Math.min(100, (oldRegimeTaxCalculated.totalTax / (grossSalary * 0.35)) * 100))}%`,
                      }}
                      className="w-full bg-indigo-500 group-hover:bg-indigo-400 transition-all duration-500 rounded-t-xl"
                    ></div>
                  </div>
                  <span className="text-xs font-semibold text-slate-300">Old Regime</span>
                </div>

                {/* New Regime Bar */}
                <div className="flex flex-col items-center gap-2 group w-24">
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {formatINR(newRegimeTaxCalculated.totalTax)}
                  </span>
                  <div className="w-full bg-slate-800 rounded-t-xl overflow-hidden h-36 flex items-end">
                    <div
                      style={{
                        height: `${Math.max(10, Math.min(100, (newRegimeTaxCalculated.totalTax / (grossSalary * 0.35)) * 100))}%`,
                      }}
                      className="w-full bg-emerald-500 group-hover:bg-emerald-400 transition-all duration-500 rounded-t-xl"
                    ></div>
                  </div>
                  <span className="text-xs font-semibold text-slate-300">New Regime</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 text-center">
                Effective Tax Rate: Old Regime{' '}
                <strong className="text-white font-mono">
                  {((oldRegimeTaxCalculated.totalTax / grossSalary) * 100).toFixed(1)}%
                </strong>{' '}
                vs New Regime{' '}
                <strong className="text-emerald-400 font-mono">
                  {((newRegimeTaxCalculated.totalTax / grossSalary) * 100).toFixed(1)}%
                </strong>
              </p>
            </div>

            {/* Chart 2: Monthly In-Hand Cash Flow Stacked Visual */}
            <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Monthly Gross Distribution Breakdown
              </h4>

              <div className="space-y-4 pt-2">
                {/* Old Regime Stack */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-indigo-400">Old Regime Monthly (₹{(grossSalary / 12).toFixed(0)})</span>
                    <span className="text-slate-300 font-mono">{formatINR(oldRegimeMonthlyTakeHome)}/mo In-Hand</span>
                  </div>
                  <div className="w-full h-5 bg-slate-800 rounded-lg overflow-hidden flex">
                    <div
                      style={{ width: `${(oldRegimeMonthlyTakeHome / (grossSalary / 12)) * 100}%` }}
                      className="bg-indigo-500 h-full"
                      title="Net Take Home"
                    ></div>
                    <div
                      style={{ width: `${((oldRegimeTaxCalculated.totalTax / 12) / (grossSalary / 12)) * 100}%` }}
                      className="bg-rose-500 h-full"
                      title="TDS Income Tax"
                    ></div>
                  </div>
                </div>

                {/* New Regime Stack */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-emerald-400">New Regime Monthly (₹{(grossSalary / 12).toFixed(0)})</span>
                    <span className="text-slate-300 font-mono">{formatINR(newRegimeMonthlyTakeHome)}/mo In-Hand</span>
                  </div>
                  <div className="w-full h-5 bg-slate-800 rounded-lg overflow-hidden flex">
                    <div
                      style={{ width: `${(newRegimeMonthlyTakeHome / (grossSalary / 12)) * 100}%` }}
                      className="bg-emerald-500 h-full"
                      title="Net Take Home"
                    ></div>
                    <div
                      style={{ width: `${((newRegimeTaxCalculated.totalTax / 12) / (grossSalary / 12)) * 100}%` }}
                      className="bg-rose-500 h-full"
                      title="TDS Income Tax"
                    ></div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-6 text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-500"></span> Take-Home Cash
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-rose-500"></span> TDS Tax Cut
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 80C/80D Max Optimization Wizard */}
      {activeTab === 'wizard' && (
        <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/80 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/60 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-400" />
                Section 80C & 80D Tax Optimization Wizard
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Identify unclaimed exemptions to maximize tax savings under the Old Tax Regime.
              </p>
            </div>

            <button
              onClick={handleAutoMaximizeDeductions}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition shadow-lg flex items-center justify-center gap-1.5"
            >
              <Zap className="w-4 h-4" />
              Auto-Maximize Deductions
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1">
              <p className="text-xs text-slate-400 font-semibold uppercase">Unclaimed Deductions Room</p>
              <p className="text-2xl font-extrabold font-mono text-amber-400">
                {formatINR(optimizationWizardStats.totalUnclaimedDeductions)}
              </p>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1">
              <p className="text-xs text-slate-400 font-semibold uppercase">Potential Tax Savings Potential</p>
              <p className="text-2xl font-extrabold font-mono text-emerald-400">
                +{formatINR(optimizationWizardStats.potentialTaxSavings)}
              </p>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1">
              <p className="text-xs text-slate-400 font-semibold uppercase">Current Old Regime Deductions</p>
              <p className="text-2xl font-extrabold font-mono text-white">
                {formatINR(oldRegimeTotalDeductions)}
              </p>
            </div>
          </div>

          {/* Section Wise Cards */}
          <div className="space-y-3">
            {/* 80C Card */}
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white">Section 80C (PPF, ELSS, EPF, Life Insurance)</h4>
                  <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">Max ₹1,50,000</span>
                </div>
                <p className="text-xs text-slate-400">
                  Current: <strong className="text-white font-mono">{formatINR(section80C)}</strong> • Room available:{' '}
                  <strong className="text-amber-400 font-mono">{formatINR(optimizationWizardStats.gap80C)}</strong>
                </p>
              </div>

              <button
                onClick={() => setSection80C(150000)}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-sky-400 font-semibold px-3 py-1.5 rounded-lg border border-slate-700 transition"
              >
                Set to Max ₹1.5L
              </button>
            </div>

            {/* 80D Card */}
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white">Section 80D (Self & Family Health Insurance)</h4>
                  <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">Max ₹50,000</span>
                </div>
                <p className="text-xs text-slate-400">
                  Current: <strong className="text-white font-mono">{formatINR(section80D)}</strong> • Room available:{' '}
                  <strong className="text-amber-400 font-mono">{formatINR(optimizationWizardStats.gap80D)}</strong>
                </p>
              </div>

              <button
                onClick={() => setSection80D(50000)}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-sky-400 font-semibold px-3 py-1.5 rounded-lg border border-slate-700 transition"
              >
                Set to Max ₹50k
              </button>
            </div>

            {/* 80CCD(1B) NPS */}
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white">Section 80CCD(1B) (Voluntary NPS Contribution)</h4>
                  <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">Extra ₹50,000 Limit</span>
                </div>
                <p className="text-xs text-slate-400">
                  Current: <strong className="text-white font-mono">{formatINR(sectionNps)}</strong> • Room available:{' '}
                  <strong className="text-amber-400 font-mono">{formatINR(optimizationWizardStats.gapNps)}</strong>
                </p>
              </div>

              <button
                onClick={() => setSectionNps(50000)}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-sky-400 font-semibold px-3 py-1.5 rounded-lg border border-slate-700 transition"
              >
                Set to Max ₹50k
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Form 16 Text Parser */}
      {activeTab === 'form16' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-slate-800/60 p-5 rounded-2xl border border-slate-700/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                Paste Form 16 / Salary Slip Text
              </h3>
              <div className="flex gap-1.5">
                {FORM16_SAMPLES.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => setForm16Text(s.text)}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded border border-slate-700 transition"
                  >
                    Sample {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={12}
              value={form16Text}
              onChange={(e) => setForm16Text(e.target.value)}
              placeholder="Paste Form 16 Part B plain text or Salary Slip text here..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500"
            ></textarea>

            <button
              onClick={handleParseForm16}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-md flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              Parse & Auto-Populate Estimator
            </button>
          </div>

          <div className="lg:col-span-6 bg-slate-800/60 p-5 rounded-2xl border border-slate-700/80 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-700/60 pb-3">
              <Info className="w-4 h-4 text-sky-400" />
              Form 16 Import Instructions
            </h3>

            <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
              <p>
                <strong>What gets extracted?</strong> The parser regex automatically identifies:
              </p>
              <ul className="list-disc list-inside text-slate-400 space-y-1 pl-1">
                <li>Gross Salary under Sec 17(1)</li>
                <li>Exempt HRA Allowance under Sec 10(13A)</li>
                <li>Section 80C investments (EPF, ELSS, PPF)</li>
                <li>Section 80D health insurance premiums</li>
                <li>Section 80CCD(1B) NPS contributions</li>
              </ul>
              <p className="text-slate-400 pt-2">
                Clicking &quot;Parse & Auto-Populate Estimator&quot; will instantly configure the entire New vs Old tax regime
                calculator based on your actual Form 16 figures!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
