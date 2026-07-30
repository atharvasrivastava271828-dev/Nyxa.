'use client';

import React, { useState, useMemo } from 'react';
import {
  Printer,
  Plus,
  Trash2,
  RotateCcw,
  Sparkles,
  Building2,
  User,
  FileText,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Percent,
  Receipt,
  Download,
  Info,
  ChevronDown
} from 'lucide-react';

// ==========================================
// TYPES & INTERFACES
// ==========================================

export type InvoiceType = 'Tax Invoice' | 'Bill of Supply' | 'Debit Note' | 'Credit Note' | 'Proforma Invoice';
export type PaymentStatus = 'UNPAID' | 'PAID' | 'PARTIALLY PAID' | 'OVERDUE';

export interface LineItem {
  id: string;
  description: string;
  hsnSac: string;
  quantity: number;
  unit: string;
  rate: number;
  discountAmount: number;
  gstRate: number; // e.g. 0, 5, 12, 18, 28
}

export interface SupplierDetails {
  name: string;
  gstin: string;
  address: string;
  city: string;
  stateCode: string;
  pincode: string;
  phone: string;
  email: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branchName: string;
  upiId: string;
}

export interface BuyerDetails {
  name: string;
  gstin: string;
  address: string;
  city: string;
  stateCode: string;
  pincode: string;
  phone: string;
  email: string;
}

export interface InvoiceMetadata {
  invoiceType: InvoiceType;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  poNumber: string;
  placeOfSupplyStateCode: string;
  paymentStatus: PaymentStatus;
}

export interface StateInfo {
  code: string;
  name: string;
  isUt?: boolean;
}

// ==========================================
// CONSTANTS & LOOKUP DATA
// ==========================================

export const INDIAN_STATES: StateInfo[] = [
  { code: '01', name: 'Jammu and Kashmir' },
  { code: '02', name: 'Himachal Pradesh' },
  { code: '03', name: 'Punjab' },
  { code: '04', name: 'Chandigarh', isUt: true },
  { code: '05', name: 'Uttarakhand' },
  { code: '06', name: 'Haryana' },
  { code: '07', name: 'Delhi', isUt: true },
  { code: '08', name: 'Rajasthan' },
  { code: '09', name: 'Uttar Pradesh' },
  { code: '10', name: 'Bihar' },
  { code: '11', name: 'Sikkim' },
  { code: '12', name: 'Arunachal Pradesh' },
  { code: '13', name: 'Nagaland' },
  { code: '14', name: 'Manipur' },
  { code: '15', name: 'Mizoram' },
  { code: '16', name: 'Tripura' },
  { code: '17', name: 'Meghalaya' },
  { code: '18', name: 'Assam' },
  { code: '19', name: 'West Bengal' },
  { code: '20', name: 'Jharkhand' },
  { code: '21', name: 'Odisha' },
  { code: '22', name: 'Chhattisgarh' },
  { code: '23', name: 'Madhya Pradesh' },
  { code: '24', name: 'Gujarat' },
  { code: '26', name: 'Dadra & Nagar Haveli and Daman & Diu', isUt: true },
  { code: '27', name: 'Maharashtra' },
  { code: '29', name: 'Karnataka' },
  { code: '30', name: 'Goa' },
  { code: '31', name: 'Lakshadweep', isUt: true },
  { code: '32', name: 'Kerala' },
  { code: '33', name: 'Tamil Nadu' },
  { code: '34', name: 'Puducherry', isUt: true },
  { code: '35', name: 'Andaman and Nicobar Islands', isUt: true },
  { code: '36', name: 'Telangana' },
  { code: '37', name: 'Andhra Pradesh' },
  { code: '38', name: 'Ladakh', isUt: true },
  { code: '97', name: 'Other Territory' },
  { code: '99', name: 'Foreign / Center' },
];

export const COMMON_UNITS = ['NOS', 'PCS', 'HRS', 'KG', 'SET', 'BOX', 'MONTH', 'DAY', 'LOT'];
export const GST_RATES = [0, 5, 12, 18, 28];

export const THEMES = [
  { id: 'indigo', name: 'Indigo', headerBg: 'bg-indigo-900 text-white', accentBadge: 'bg-indigo-50 text-indigo-700 border-indigo-200', border: 'border-indigo-200' },
  { id: 'navy', name: 'Classic Navy', headerBg: 'bg-slate-900 text-white', accentBadge: 'bg-slate-100 text-slate-800 border-slate-200', border: 'border-slate-300' },
  { id: 'emerald', name: 'Emerald', headerBg: 'bg-emerald-900 text-white', accentBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200', border: 'border-emerald-200' },
  { id: 'slate', name: 'Monochrome', headerBg: 'bg-zinc-900 text-white', accentBadge: 'bg-zinc-100 text-zinc-800 border-zinc-300', border: 'border-zinc-300' },
];

// ==========================================
// HELPER UTILITIES
// ==========================================

export function getStateName(code: string): string {
  const st = INDIAN_STATES.find((s) => s.code === code);
  return st ? `${st.name} (${st.code})` : `State (${code})`;
}

export function extractStateCodeFromGstin(gstin: string): string | null {
  if (!gstin || gstin.trim().length < 2) return null;
  const code = gstin.trim().substring(0, 2);
  const exists = INDIAN_STATES.some((s) => s.code === code);
  return exists ? code : null;
}

export function validateGstin(gstin: string): boolean {
  if (!gstin) return false;
  const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return regex.test(gstin.trim().toUpperCase());
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

export function numberToIndianWords(num: number): string {
  if (isNaN(num) || num === 0) return 'Rupees Zero Only';

  const units = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertTwoDigits = (n: number): string => {
    if (n < 20) return units[n];
    const ten = Math.floor(n / 10);
    const unit = n % 10;
    return tens[ten] + (unit ? ' ' + units[unit] : '');
  };

  const convertThreeDigits = (n: number): string => {
    const hundred = Math.floor(n / 100);
    const remainder = n % 100;
    let str = '';
    if (hundred > 0) {
      str += units[hundred] + ' Hundred';
    }
    if (remainder > 0) {
      if (str !== '') str += ' ';
      str += convertTwoDigits(remainder);
    }
    return str;
  };

  let integerPart = Math.floor(Math.abs(num));
  const decimalPart = Math.round((Math.abs(num) - integerPart) * 100);

  if (integerPart === 0 && decimalPart === 0) return 'Rupees Zero Only';

  const parts: string[] = [];

  // Crores (1,00,00,000)
  const crores = Math.floor(integerPart / 10000000);
  integerPart %= 10000000;
  if (crores > 0) {
    parts.push(convertThreeDigits(crores) + ' Crore');
  }

  // Lakhs (1,00,000)
  const lakhs = Math.floor(integerPart / 100000);
  integerPart %= 100000;
  if (lakhs > 0) {
    parts.push(convertTwoDigits(lakhs) + ' Lakh');
  }

  // Thousands (1,000)
  const thousands = Math.floor(integerPart / 1000);
  integerPart %= 1000;
  if (thousands > 0) {
    parts.push(convertTwoDigits(thousands) + ' Thousand');
  }

  // Remaining Hundreds/Tens/Units
  if (integerPart > 0) {
    parts.push(convertThreeDigits(integerPart));
  }

  let result = 'Rupees ' + parts.join(' ');
  if (decimalPart > 0) {
    result += ' and ' + convertTwoDigits(decimalPart) + ' Paise';
  }
  result += ' Only';
  return result;
}

// ==========================================
// DEMO / INITIAL DATA
// ==========================================

const SAMPLE_INVOICE = {
  supplier: {
    name: 'Nyxa Technologies Private Limited',
    gstin: '27AAAAA1234A1Z5',
    address: 'Suite 402, Quantum Tech Park, Bandra Kurla Complex',
    city: 'Mumbai',
    stateCode: '27',
    pincode: '400051',
    phone: '+91 98765 43210',
    email: 'billing@nyxa.io',
    bankName: 'HDFC Bank',
    accountNumber: '50200012345678',
    ifscCode: 'HDFC0000240',
    branchName: 'BKC Branch, Mumbai',
    upiId: 'nyxatech@hdfcbank',
  },
  buyer: {
    name: 'Apex Cloud Solutions India Pvt Ltd',
    gstin: '29BBBBB5678B1Z2',
    address: '7th Floor, Cyber Towers, Outer Ring Road, Bellandur',
    city: 'Bengaluru',
    stateCode: '29',
    pincode: '560103',
    phone: '+91 80 4123 9999',
    email: 'accounts@apexcloud.in',
  },
  metadata: {
    invoiceType: 'Tax Invoice' as InvoiceType,
    invoiceNumber: 'NYX/2026-27/042',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    poNumber: 'PO-APEX-9921',
    placeOfSupplyStateCode: '29',
    paymentStatus: 'UNPAID' as PaymentStatus,
  },
  items: [
    {
      id: '1',
      description: 'Enterprise Web Application Architecture & Cloud API Engineering',
      hsnSac: '998314',
      quantity: 120,
      unit: 'HRS',
      rate: 1500,
      discountAmount: 0,
      gstRate: 18,
    },
    {
      id: '2',
      description: 'DevOps Automated Deployment Pipeline & Infrastructure Setup',
      hsnSac: '998413',
      quantity: 1,
      unit: 'SET',
      rate: 45000,
      discountAmount: 5000,
      gstRate: 18,
    },
    {
      id: '3',
      description: 'Monthly Managed Cloud Maintenance & Technical SLA Support',
      hsnSac: '998313',
      quantity: 1,
      unit: 'MONTH',
      rate: 25000,
      discountAmount: 0,
      gstRate: 18,
    },
  ],
  extraDiscount: 2000,
  notes: 'Thank you for your business! Please quote invoice number on bank transfer advice.',
  terms: '1. Payment due within 30 days from invoice date.\n2. Interest @ 18% per annum will be charged on overdue balances.\n3. Subject to Mumbai Jurisdiction.',
};

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function GstInvoice() {
  // Theme & State
  const [themeId, setThemeId] = useState<string>('indigo');
  const [supplier, setSupplier] = useState<SupplierDetails>(SAMPLE_INVOICE.supplier);
  const [buyer, setBuyer] = useState<BuyerDetails>(SAMPLE_INVOICE.buyer);
  const [metadata, setMetadata] = useState<InvoiceMetadata>(SAMPLE_INVOICE.metadata);
  const [items, setItems] = useState<LineItem[]>(SAMPLE_INVOICE.items);
  const [extraDiscount, setExtraDiscount] = useState<number>(SAMPLE_INVOICE.extraDiscount);
  const [notes, setNotes] = useState<string>(SAMPLE_INVOICE.notes);
  const [terms, setTerms] = useState<string>(SAMPLE_INVOICE.terms);
  const [showBankDetails, setShowBankDetails] = useState<boolean>(true);

  // Active theme selection
  const currentTheme = useMemo(() => {
    return THEMES.find((t) => t.id === themeId) || THEMES[0];
  }, [themeId]);

  // GST Auto Detection from GSTINs
  const handleSupplierGstinChange = (value: string) => {
    const clean = value.toUpperCase();
    const stateCode = extractStateCodeFromGstin(clean);
    setSupplier((prev) => ({
      ...prev,
      gstin: clean,
      ...(stateCode ? { stateCode } : {}),
    }));
  };

  const handleBuyerGstinChange = (value: string) => {
    const clean = value.toUpperCase();
    const stateCode = extractStateCodeFromGstin(clean);
    setBuyer((prev) => ({
      ...prev,
      gstin: clean,
      ...(stateCode ? { stateCode } : {}),
    }));
    if (stateCode) {
      setMetadata((prev) => ({
        ...prev,
        placeOfSupplyStateCode: stateCode,
      }));
    }
  };

  // Determine Intra-State (CGST + SGST) vs Inter-State (IGST)
  const isIntraState = useMemo(() => {
    return supplier.stateCode === metadata.placeOfSupplyStateCode;
  }, [supplier.stateCode, metadata.placeOfSupplyStateCode]);

  // Real-time Calculations
  const calculatedItems = useMemo(() => {
    return items.map((item) => {
      const grossAmount = (item.quantity || 0) * (item.rate || 0);
      const taxableValue = Math.max(0, grossAmount - (item.discountAmount || 0));
      const rate = item.gstRate || 0;

      let cgstRate = 0;
      let sgstRate = 0;
      let igstRate = 0;

      let cgstAmount = 0;
      let sgstAmount = 0;
      let igstAmount = 0;

      if (isIntraState) {
        cgstRate = rate / 2;
        sgstRate = rate / 2;
        cgstAmount = (taxableValue * cgstRate) / 100;
        sgstAmount = (taxableValue * sgstRate) / 100;
      } else {
        igstRate = rate;
        igstAmount = (taxableValue * igstRate) / 100;
      }

      const totalTax = cgstAmount + sgstAmount + igstAmount;
      const totalAmount = taxableValue + totalTax;

      return {
        ...item,
        grossAmount,
        taxableValue,
        cgstRate,
        sgstRate,
        igstRate,
        cgstAmount,
        sgstAmount,
        igstAmount,
        totalTax,
        totalAmount,
      };
    });
  }, [items, isIntraState]);

  // Overall Financial Totals
  const totals = useMemo(() => {
    const rawSubtotal = calculatedItems.reduce((acc, item) => acc + item.taxableValue, 0);
    const afterDiscountSubtotal = Math.max(0, rawSubtotal - (extraDiscount || 0));
    
    // Scale tax ratio if discount applied
    const discountMultiplier = rawSubtotal > 0 ? afterDiscountSubtotal / rawSubtotal : 1;

    const totalCgst = calculatedItems.reduce((acc, item) => acc + item.cgstAmount, 0) * discountMultiplier;
    const totalSgst = calculatedItems.reduce((acc, item) => acc + item.sgstAmount, 0) * discountMultiplier;
    const totalIgst = calculatedItems.reduce((acc, item) => acc + item.igstAmount, 0) * discountMultiplier;
    const totalTax = totalCgst + totalSgst + totalIgst;

    const grandTotalRaw = afterDiscountSubtotal + totalTax;
    const grandTotal = Math.round(grandTotalRaw);
    const roundOff = grandTotal - grandTotalRaw;

    return {
      rawSubtotal,
      extraDiscount: extraDiscount || 0,
      taxableTotal: afterDiscountSubtotal,
      totalCgst,
      totalSgst,
      totalIgst,
      totalTax,
      grandTotalRaw,
      roundOff,
      grandTotal,
    };
  }, [calculatedItems, extraDiscount]);

  // HSN/SAC Summary breakdown
  const hsnSummary = useMemo(() => {
    const summaryMap: Record<
      string,
      {
        hsnSac: string;
        gstRate: number;
        taxableValue: number;
        cgstAmount: number;
        sgstAmount: number;
        igstAmount: number;
        totalTax: number;
      }
    > = {};

    calculatedItems.forEach((item) => {
      const key = `${item.hsnSac || 'OTHER'}_${item.gstRate}`;
      if (!summaryMap[key]) {
        summaryMap[key] = {
          hsnSac: item.hsnSac || 'GENERAL',
          gstRate: item.gstRate,
          taxableValue: 0,
          cgstAmount: 0,
          sgstAmount: 0,
          igstAmount: 0,
          totalTax: 0,
        };
      }
      summaryMap[key].taxableValue += item.taxableValue;
      summaryMap[key].cgstAmount += item.cgstAmount;
      summaryMap[key].sgstAmount += item.sgstAmount;
      summaryMap[key].igstAmount += item.igstAmount;
      summaryMap[key].totalTax += item.totalTax;
    });

    return Object.values(summaryMap);
  }, [calculatedItems]);

  // Handlers for Items
  const handleAddItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: 'New Services / Products Description',
      hsnSac: '998314',
      quantity: 1,
      unit: 'NOS',
      rate: 1000,
      discountAmount: 0,
      gstRate: 18,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleUpdateItem = (id: string, key: keyof LineItem, value: any) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [key]: value } : i))
    );
  };

  const handleResetForm = () => {
    setSupplier(SAMPLE_INVOICE.supplier);
    setBuyer(SAMPLE_INVOICE.buyer);
    setMetadata(SAMPLE_INVOICE.metadata);
    setItems(SAMPLE_INVOICE.items);
    setExtraDiscount(SAMPLE_INVOICE.extraDiscount);
    setNotes(SAMPLE_INVOICE.notes);
    setTerms(SAMPLE_INVOICE.terms);
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans p-3 sm:p-6 print:p-0 print:bg-white print:text-black">
      {/* Dynamic Print Stylesheet */}
      <style>{`
        @media print {
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:border-none {
            border: none !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
          .print\\:m-0 {
            margin: 0 !important;
          }
          .print\\:w-full {
            width: 100% !important;
          }
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
        }
      `}</style>

      {/* Top Navbar / Header Controls */}
      <header className="max-w-7xl mx-auto mb-6 bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-sm">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              GST Invoice Studio
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                Client-Side Live
              </span>
            </h1>
            <p className="text-xs text-slate-500">Fast, GST-Compliant Tax Invoice Generator</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto justify-end">
          {/* Theme Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setThemeId(t.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  themeId === t.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>

          <button
            onClick={handleResetForm}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
            title="Reset to sample data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Demo
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm hover:shadow transition-all"
          >
            <Printer className="w-4 h-4" />
            Print / Save PDF
          </button>
        </div>
      </header>

      {/* Main Container - 2 Column Split */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 print:block">
        {/* ========================================== */}
        {/* LEFT COLUMN: EDIT FORM & CONTROLS          */}
        {/* ========================================== */}
        <section className="lg:col-span-5 space-y-5 print:hidden">
          {/* Invoice Basic Information */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 space-y-4">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <FileText className="w-4 h-4 text-indigo-600" />
              Invoice Meta & Supply
            </h2>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Invoice Type</label>
                <select
                  value={metadata.invoiceType}
                  onChange={(e) => setMetadata({ ...metadata, invoiceType: e.target.value as InvoiceType })}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="Tax Invoice">Tax Invoice</option>
                  <option value="Bill of Supply">Bill of Supply</option>
                  <option value="Proforma Invoice">Proforma Invoice</option>
                  <option value="Debit Note">Debit Note</option>
                  <option value="Credit Note">Credit Note</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Payment Status</label>
                <select
                  value={metadata.paymentStatus}
                  onChange={(e) => setMetadata({ ...metadata, paymentStatus: e.target.value as PaymentStatus })}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="UNPAID">UNPAID</option>
                  <option value="PAID">PAID</option>
                  <option value="PARTIALLY PAID">PARTIALLY PAID</option>
                  <option value="OVERDUE">OVERDUE</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Invoice Number</label>
                <input
                  type="text"
                  value={metadata.invoiceNumber}
                  onChange={(e) => setMetadata({ ...metadata, invoiceNumber: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">PO / Ref Number</label>
                <input
                  type="text"
                  value={metadata.poNumber}
                  onChange={(e) => setMetadata({ ...metadata, poNumber: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                  placeholder="PO-12345"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Invoice Date</label>
                <input
                  type="date"
                  value={metadata.invoiceDate}
                  onChange={(e) => setMetadata({ ...metadata, invoiceDate: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Due Date</label>
                <input
                  type="date"
                  value={metadata.dueDate}
                  onChange={(e) => setMetadata({ ...metadata, dueDate: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-slate-600 font-medium mb-1 flex items-center justify-between">
                  <span>Place of Supply (State)</span>
                  <span className="text-[10px] text-indigo-600 font-normal">
                    {isIntraState ? 'Intra-State (CGST + SGST)' : 'Inter-State (IGST)'}
                  </span>
                </label>
                <select
                  value={metadata.placeOfSupplyStateCode}
                  onChange={(e) => setMetadata({ ...metadata, placeOfSupplyStateCode: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-none"
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.code} - {s.name} {s.isUt ? '(UT)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Supplier (Seller) Details */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 space-y-3">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <Building2 className="w-4 h-4 text-indigo-600" />
              Your Details (Seller)
            </h2>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <label className="block text-slate-600 font-medium mb-1">Business Name</label>
                <input
                  type="text"
                  value={supplier.name}
                  onChange={(e) => setSupplier({ ...supplier, name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:border-indigo-500 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  GSTIN
                  {supplier.gstin && (
                    <span className={`ml-1.5 text-[10px] font-semibold ${validateGstin(supplier.gstin) ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {validateGstin(supplier.gstin) ? '✓ Valid' : 'Format Check'}
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={supplier.gstin}
                  onChange={(e) => handleSupplierGstinChange(e.target.value)}
                  className="w-full p-2 uppercase border border-slate-300 rounded-lg focus:border-indigo-500 focus:outline-none font-mono"
                  placeholder="27AAAAA1234A1Z5"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">State Code</label>
                <select
                  value={supplier.stateCode}
                  onChange={(e) => setSupplier({ ...supplier, stateCode: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-none"
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-slate-600 font-medium mb-1">Address</label>
                <input
                  type="text"
                  value={supplier.address}
                  onChange={(e) => setSupplier({ ...supplier, address: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">City</label>
                <input
                  type="text"
                  value={supplier.city}
                  onChange={(e) => setSupplier({ ...supplier, city: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Pincode</label>
                <input
                  type="text"
                  value={supplier.pincode}
                  onChange={(e) => setSupplier({ ...supplier, pincode: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Bank Details Toggle & Fields */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowBankDetails(!showBankDetails)}
                className="text-xs text-indigo-600 font-medium hover:underline flex items-center gap-1"
              >
                <CreditCard className="w-3.5 h-3.5" />
                {showBankDetails ? 'Hide Bank & Payment Details' : '+ Edit Bank & UPI Details'}
              </button>

              {showBankDetails && (
                <div className="mt-3 grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={supplier.bankName}
                      onChange={(e) => setSupplier({ ...supplier, bankName: e.target.value })}
                      className="w-full p-1.5 border border-slate-300 rounded bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Account Number</label>
                    <input
                      type="text"
                      value={supplier.accountNumber}
                      onChange={(e) => setSupplier({ ...supplier, accountNumber: e.target.value })}
                      className="w-full p-1.5 border border-slate-300 rounded bg-white focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">IFSC Code</label>
                    <input
                      type="text"
                      value={supplier.ifscCode}
                      onChange={(e) => setSupplier({ ...supplier, ifscCode: e.target.value.toUpperCase() })}
                      className="w-full p-1.5 uppercase border border-slate-300 rounded bg-white focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">UPI ID</label>
                    <input
                      type="text"
                      value={supplier.upiId}
                      onChange={(e) => setSupplier({ ...supplier, upiId: e.target.value })}
                      className="w-full p-1.5 border border-slate-300 rounded bg-white focus:outline-none font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Buyer (Customer) Details */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 space-y-3">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <User className="w-4 h-4 text-indigo-600" />
              Customer Details (Buyer)
            </h2>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <label className="block text-slate-600 font-medium mb-1">Customer / Client Name</label>
                <input
                  type="text"
                  value={buyer.name}
                  onChange={(e) => setBuyer({ ...buyer, name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:border-indigo-500 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Customer GSTIN
                  {buyer.gstin && (
                    <span className={`ml-1.5 text-[10px] font-semibold ${validateGstin(buyer.gstin) ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {validateGstin(buyer.gstin) ? '✓ Valid' : 'Format Check'}
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={buyer.gstin}
                  onChange={(e) => handleBuyerGstinChange(e.target.value)}
                  className="w-full p-2 uppercase border border-slate-300 rounded-lg focus:border-indigo-500 focus:outline-none font-mono"
                  placeholder="29BBBBB5678B1Z2"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">State Code</label>
                <select
                  value={buyer.stateCode}
                  onChange={(e) => setBuyer({ ...buyer, stateCode: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-none"
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-slate-600 font-medium mb-1">Address</label>
                <input
                  type="text"
                  value={buyer.address}
                  onChange={(e) => setBuyer({ ...buyer, address: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">City</label>
                <input
                  type="text"
                  value={buyer.city}
                  onChange={(e) => setBuyer({ ...buyer, city: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Pincode</label>
                <input
                  type="text"
                  value={buyer.pincode}
                  onChange={(e) => setBuyer({ ...buyer, pincode: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Line Items Editor */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-indigo-600" />
                Line Items ({items.length})
              </h2>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={item.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2 relative">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-500">#{index + 1}</span>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                      className="w-full p-1.5 border border-slate-300 rounded bg-white focus:outline-none font-medium text-slate-800"
                      placeholder="Item or service description"
                    />
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Delete item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-500">HSN/SAC</label>
                      <input
                        type="text"
                        value={item.hsnSac}
                        onChange={(e) => handleUpdateItem(item.id, 'hsnSac', e.target.value)}
                        className="w-full p-1 border border-slate-300 rounded bg-white font-mono text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500">Qty</label>
                      <input
                        type="number"
                        min="0"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-full p-1 border border-slate-300 rounded bg-white text-center font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500">Unit</label>
                      <select
                        value={item.unit}
                        onChange={(e) => handleUpdateItem(item.id, 'unit', e.target.value)}
                        className="w-full p-1 border border-slate-300 rounded bg-white text-center"
                      >
                        {COMMON_UNITS.map((u) => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500">Rate (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={item.rate}
                        onChange={(e) => handleUpdateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                        className="w-full p-1 border border-slate-300 rounded bg-white text-center font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500">GST %</label>
                      <select
                        value={item.gstRate}
                        onChange={(e) => handleUpdateItem(item.id, 'gstRate', parseFloat(e.target.value) || 0)}
                        className="w-full p-1 border border-slate-300 rounded bg-white text-center font-semibold text-indigo-700"
                      >
                        {GST_RATES.map((r) => (
                          <option key={r} value={r}>{r}%</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Discounts, Terms & Notes */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 space-y-3">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <Percent className="w-4 h-4 text-indigo-600" />
              Additional Discounts & Notes
            </h2>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Extra Flat Discount (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={extraDiscount}
                  onChange={(e) => setExtraDiscount(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:border-indigo-500 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Terms & Conditions</label>
                <textarea
                  rows={2}
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Notes for Buyer</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ========================================== */}
        {/* RIGHT COLUMN: LIVE PRINTABLE A4 PREVIEW   */}
        {/* ========================================== */}
        <section className="lg:col-span-7 print:w-full print:m-0">
          <div
            id="printable-invoice"
            className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden print:shadow-none print:border-none print:rounded-none min-h-[750px] flex flex-col justify-between"
          >
            {/* Top Theme Header Banner */}
            <div className={`p-6 ${currentTheme.headerBg} transition-colors flex justify-between items-start`}>
              <div>
                <h2 className="text-2xl font-black tracking-tight uppercase">{supplier.name || 'YOUR BUSINESS NAME'}</h2>
                <p className="text-xs opacity-80 mt-1 max-w-sm">{supplier.address}, {supplier.city} - {supplier.pincode}</p>
                <p className="text-xs opacity-90 mt-1 font-mono font-semibold">
                  GSTIN: {supplier.gstin || 'NOT PROVIDED'} | State Code: {supplier.stateCode}
                </p>
                {(supplier.email || supplier.phone) && (
                  <p className="text-xs opacity-75 mt-0.5">
                    {supplier.email} {supplier.phone ? `| ${supplier.phone}` : ''}
                  </p>
                )}
              </div>

              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-xs rounded font-bold text-xs tracking-wider uppercase border border-white/20">
                  {metadata.invoiceType}
                </span>
                <div className="mt-3 text-xs space-y-0.5">
                  <p className="font-bold text-base">{metadata.invoiceNumber}</p>
                  <p className="opacity-80">Date: {metadata.invoiceDate}</p>
                  {metadata.dueDate && <p className="opacity-80">Due Date: {metadata.dueDate}</p>}
                </div>
              </div>
            </div>

            {/* Billed To & Supply Info Bar */}
            <div className="p-6 bg-slate-50 border-b border-slate-200 grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">Billed To (Buyer)</p>
                <p className="font-bold text-slate-900 text-sm">{buyer.name || 'Customer Name'}</p>
                <p className="text-slate-600 mt-0.5">{buyer.address}</p>
                <p className="text-slate-600">{buyer.city} {buyer.pincode ? `- ${buyer.pincode}` : ''}</p>
                <p className="font-mono font-semibold text-slate-800 mt-1">
                  GSTIN: {buyer.gstin || 'UNREGISTERED'}
                </p>
                <p className="text-slate-500 mt-0.5">State: {getStateName(buyer.stateCode)}</p>
              </div>

              <div className="text-right space-y-1">
                <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">Supply Metadata</p>
                {metadata.poNumber && <p className="text-slate-700"><strong>PO Ref:</strong> {metadata.poNumber}</p>}
                <p className="text-slate-700"><strong>Place of Supply:</strong> {getStateName(metadata.placeOfSupplyStateCode)}</p>
                <div className="mt-2 inline-block text-[11px] font-bold px-2.5 py-1 rounded bg-slate-200 text-slate-800 border border-slate-300">
                  {isIntraState ? 'INTRA-STATE (CGST + SGST)' : 'INTER-STATE (IGST)'}
                </div>
                {metadata.paymentStatus && (
                  <div className="mt-1">
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                      metadata.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      STATUS: {metadata.paymentStatus}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Line Items Table */}
            <div className="p-6 flex-1">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-900 text-slate-700 uppercase font-bold text-[10px] tracking-wider">
                    <th className="py-2 pr-2">#</th>
                    <th className="py-2 pr-2">Description</th>
                    <th className="py-2 pr-2 text-center">HSN</th>
                    <th className="py-2 pr-2 text-center">Qty</th>
                    <th className="py-2 pr-2 text-right">Rate</th>
                    <th className="py-2 pr-2 text-right">Taxable</th>
                    <th className="py-2 pr-2 text-center">{isIntraState ? 'CGST+SGST' : 'IGST'}</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {calculatedItems.map((item, idx) => (
                    <tr key={item.id} className="text-slate-800">
                      <td className="py-2.5 pr-2 font-semibold text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 pr-2 font-medium">
                        <div>{item.description}</div>
                        {item.discountAmount > 0 && (
                          <div className="text-[10px] text-emerald-600 font-normal">
                            Discount: {formatCurrency(item.discountAmount)}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 pr-2 text-center font-mono text-slate-600">{item.hsnSac}</td>
                      <td className="py-2.5 pr-2 text-center font-medium">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="py-2.5 pr-2 text-right font-mono">{formatCurrency(item.rate)}</td>
                      <td className="py-2.5 pr-2 text-right font-mono font-medium">{formatCurrency(item.taxableValue)}</td>
                      <td className="py-2.5 pr-2 text-center font-mono text-slate-600">
                        {item.gstRate}%
                      </td>
                      <td className="py-2.5 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(item.totalAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Amount In Words Banner */}
              <div className="mt-6 p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-2">
                <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                <p className="text-xs text-slate-700 font-medium">
                  <span className="font-bold text-slate-900">Amount in Words:</span> {numberToIndianWords(totals.grandTotal)}
                </p>
              </div>

              {/* Financial Totals & HSN Summary Split */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
                {/* HSN Summary */}
                <div>
                  <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">HSN/SAC Tax Breakdown</p>
                  <table className="w-full text-[11px] border border-slate-200 text-left">
                    <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-1.5">HSN</th>
                        <th className="p-1.5 text-right">Taxable</th>
                        <th className="p-1.5 text-center">GST %</th>
                        <th className="p-1.5 text-right">Tax Amt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {hsnSummary.map((hsn, idx) => (
                        <tr key={idx} className="text-slate-700">
                          <td className="p-1.5 font-mono">{hsn.hsnSac}</td>
                          <td className="p-1.5 text-right font-mono">{formatCurrency(hsn.taxableValue)}</td>
                          <td className="p-1.5 text-center font-mono">{hsn.gstRate}%</td>
                          <td className="p-1.5 text-right font-mono font-medium">{formatCurrency(hsn.totalTax)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Subtotals & Grand Total */}
                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Taxable Subtotal:</span>
                    <span className="font-mono font-semibold text-slate-900">{formatCurrency(totals.rawSubtotal)}</span>
                  </div>

                  {totals.extraDiscount > 0 && (
                    <div className="flex justify-between py-1 border-b border-slate-100 text-emerald-700">
                      <span>Extra Discount:</span>
                      <span className="font-mono font-semibold">- {formatCurrency(totals.extraDiscount)}</span>
                    </div>
                  )}

                  {isIntraState ? (
                    <>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span>Central Tax (CGST):</span>
                        <span className="font-mono font-semibold">{formatCurrency(totals.totalCgst)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span>State Tax (SGST):</span>
                        <span className="font-mono font-semibold">{formatCurrency(totals.totalSgst)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span>Integrated Tax (IGST):</span>
                      <span className="font-mono font-semibold">{formatCurrency(totals.totalIgst)}</span>
                    </div>
                  )}

                  {Math.abs(totals.roundOff) > 0.001 && (
                    <div className="flex justify-between py-1 border-b border-slate-100 text-slate-500">
                      <span>Round Off:</span>
                      <span className="font-mono">{totals.roundOff > 0 ? `+${totals.roundOff.toFixed(2)}` : totals.roundOff.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between py-2.5 px-3 bg-slate-900 text-white rounded-lg font-bold text-sm shadow-xs">
                    <span>Grand Total:</span>
                    <span className="font-mono text-base">{formatCurrency(totals.grandTotal)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Bank Details & Authorised Signatory */}
            <div className="p-6 bg-slate-50 border-t border-slate-200 grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                {supplier.bankName && (
                  <div>
                    <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-1">Bank Payment Details</p>
                    <p className="text-slate-700"><strong>Bank:</strong> {supplier.bankName}</p>
                    <p className="text-slate-700 font-mono"><strong>A/C No:</strong> {supplier.accountNumber}</p>
                    <p className="text-slate-700 font-mono"><strong>IFSC:</strong> {supplier.ifscCode}</p>
                    {supplier.upiId && <p className="text-indigo-700 font-mono mt-1"><strong>UPI ID:</strong> {supplier.upiId}</p>}
                  </div>
                )}
                {terms && (
                  <div className="mt-2">
                    <p className="font-bold text-slate-700 text-[10px] uppercase">Terms & Conditions</p>
                    <p className="text-slate-600 whitespace-pre-line text-[11px] mt-0.5">{terms}</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-between items-end text-right">
                <div>
                  <p className="font-bold text-slate-800">{supplier.name}</p>
                  <p className="text-slate-500 text-[11px]">Authorised Signatory</p>
                </div>
                <div className="mt-12 pt-2 border-t border-slate-400 w-40 text-center text-slate-500 text-[10px]">
                  Sign & Stamp
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
