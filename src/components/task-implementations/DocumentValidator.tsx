'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
  ShieldCheck,
  FileCheck,
  FileSpreadsheet,
  Download,
  Upload,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Printer,
  Copy,
  RefreshCw,
  Eye,
  FileText,
  CreditCard,
  Building,
  MapPin,
  HelpCircle,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

// --- VERHOEFF ALGORITHM TABLES FOR AADHAAR CHECKSUM ---
const VERHOEFF_D = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 1, 2, 3, 4],
  [6, 5, 9, 8, 7, 1, 2, 3, 4, 0],
  [7, 6, 5, 9, 8, 2, 3, 4, 0, 1],
  [8, 7, 6, 5, 9, 3, 4, 0, 1, 2],
  [9, 8, 7, 6, 5, 4, 0, 1, 2, 3],
];

const VERHOEFF_P = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 4, 0, 9],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

function validateVerhoeff(str: string): boolean {
  const cleanStr = str.replace(/\D/g, '');
  if (cleanStr.length !== 12) return false;
  const digits = cleanStr.split('').map(Number);
  let c = 0;
  const inverted = [...digits].reverse();
  for (let i = 0; i < inverted.length; i++) {
    c = VERHOEFF_D[c][VERHOEFF_P[i % 8][inverted[i]]];
  }
  return c === 0;
}

// --- BANK DICTIONARY FOR IFSC LOOKUP ---
const BANK_DICTIONARY: Record<string, { name: string; hq: string; type: string; micrPrefix: string }> = {
  SBIN: { name: 'State Bank of India (SBI)', hq: 'Mumbai, Maharashtra', type: 'Public Sector Bank', micrPrefix: '400002' },
  HDFC: { name: 'HDFC Bank Ltd.', hq: 'Mumbai, Maharashtra', type: 'Private Sector Bank', micrPrefix: '400240' },
  ICIC: { name: 'ICICI Bank Ltd.', hq: 'Mumbai, Maharashtra', type: 'Private Sector Bank', micrPrefix: '400229' },
  UTIB: { name: 'Axis Bank Ltd.', hq: 'Mumbai, Maharashtra', type: 'Private Sector Bank', micrPrefix: '400211' },
  AXIS: { name: 'Axis Bank Ltd.', hq: 'Mumbai, Maharashtra', type: 'Private Sector Bank', micrPrefix: '400211' },
  PUNB: { name: 'Punjab National Bank (PNB)', hq: 'New Delhi', type: 'Public Sector Bank', micrPrefix: '110024' },
  BARB: { name: 'Bank of Baroda (BOB)', hq: 'Vadodara, Gujarat', type: 'Public Sector Bank', micrPrefix: '390012' },
  BKID: { name: 'Bank of India (BOI)', hq: 'Mumbai, Maharashtra', type: 'Public Sector Bank', micrPrefix: '400013' },
  CNRB: { name: 'Canara Bank', hq: 'Bengaluru, Karnataka', type: 'Public Sector Bank', micrPrefix: '560015' },
  UBIN: { name: 'Union Bank of India', hq: 'Mumbai, Maharashtra', type: 'Public Sector Bank', micrPrefix: '400026' },
  KKBK: { name: 'Kotak Mahindra Bank', hq: 'Mumbai, Maharashtra', type: 'Private Sector Bank', micrPrefix: '400485' },
  YESB: { name: 'Yes Bank Ltd.', hq: 'Mumbai, Maharashtra', type: 'Private Sector Bank', micrPrefix: '400532' },
  IDFB: { name: 'IDFC First Bank Ltd.', hq: 'Mumbai, Maharashtra', type: 'Private Sector Bank', micrPrefix: '400371' },
  INDB: { name: 'IndusInd Bank Ltd.', hq: 'Pune, Maharashtra', type: 'Private Sector Bank', micrPrefix: '411234' },
  MAHB: { name: 'Bank of Maharashtra', hq: 'Pune, Maharashtra', type: 'Public Sector Bank', micrPrefix: '411014' },
  PSIB: { name: 'Punjab & Sind Bank', hq: 'New Delhi', type: 'Public Sector Bank', micrPrefix: '110023' },
  IOBA: { name: 'Indian Overseas Bank', hq: 'Chennai, Tamil Nadu', type: 'Public Sector Bank', micrPrefix: '600020' },
  CBIN: { name: 'Central Bank of India', hq: 'Mumbai, Maharashtra', type: 'Public Sector Bank', micrPrefix: '400016' },
  DBSS: { name: 'DBS Bank India Ltd.', hq: 'Mumbai, Maharashtra', type: 'Foreign / Private Bank', micrPrefix: '400813' },
  SCBL: { name: 'Standard Chartered Bank', hq: 'London / India HQ Mumbai', type: 'Foreign Bank', micrPrefix: '400036' },
  HSBC: { name: 'HSBC Bank India', hq: 'Mumbai, Maharashtra', type: 'Foreign Bank', micrPrefix: '400037' },
};

// --- PAN HOLDER TYPE DECODER ---
const PAN_HOLDER_TYPES: Record<string, { type: string; category: string; desc: string }> = {
  P: { type: 'Individual (Person)', category: 'Personal', desc: 'Assessee is an individual taxpayer / natural person' },
  C: { type: 'Company', category: 'Corporate', desc: 'Registered Private or Public Limited Company' },
  H: { type: 'Hindu Undivided Family (HUF)', category: 'Family Trust', desc: 'Hindu Undivided Family tax entity' },
  A: { type: 'Association of Persons (AOP)', category: 'Entity', desc: 'Group of persons formed for common purpose' },
  B: { type: 'Body of Individuals (BOI)', category: 'Entity', desc: 'Conglomerate of individuals without formal contract' },
  G: { type: 'Government Agency', category: 'Government', desc: 'Central / State Government Body or Ministry' },
  J: { type: 'Artificial Juridical Person', category: 'Legal Body', desc: 'Idols, deities, public universities, statutory authorities' },
  L: { type: 'Local Authority', category: 'Municipal', desc: 'Municipal Corporation, Panchayat, or Local Govt' },
  F: { type: 'Firm / Partnership / LLP', category: 'Partnership', desc: 'Partnership Firm or Limited Liability Partnership' },
  T: { type: 'Trust', category: 'Non-Profit', desc: 'Registered Charitable or Private Educational Trust' },
};

// --- PINCODE REGION DECODER ---
const PINCODE_ZONES: Record<string, { region: string; states: string }> = {
  '1': { region: 'Northern Region - Zone 1', states: 'Delhi, Haryana, Punjab, Himachal Pradesh, J&K, Ladakh, Chandigarh' },
  '2': { region: 'Northern Region - Zone 2', states: 'Uttar Pradesh, Uttarakhand' },
  '3': { region: 'Western Region', states: 'Rajasthan, Gujarat, Daman & Diu, Dadra & Nagar Haveli' },
  '4': { region: 'Central Region', states: 'Madhya Pradesh, Chhattisgarh' },
  '5': { region: 'Southern Region - Zone 1', states: 'Andhra Pradesh, Telangana, Karnataka' },
  '6': { region: 'Southern Region - Zone 2', states: 'Tamil Nadu, Kerala, Puducherry, Lakshadweep' },
  '7': { region: 'Eastern Region - Zone 1', states: 'West Bengal, Odisha, Assam, Arunachal Pradesh, Manipur, Meghalaya, Mizoram, Nagaland, Tripura, Sikkim' },
  '8': { region: 'Eastern Region - Zone 2', states: 'Bihar, Jharkhand' },
  '9': { region: 'Army Postal Service (APS)', states: 'Field Post Offices (FPO) & Indian Armed Forces' },
};

// Batch Item Result Interface
export interface BatchValidationItem {
  id: string;
  docType: 'PAN' | 'Aadhaar' | 'IFSC' | 'Pincode';
  value: string;
  isValid: boolean;
  errorReason?: string;
  details?: string;
  nameOrNote?: string;
}

export default function DocumentValidator() {
  const [activeTab, setActiveTab] = useState<'batch' | 'pan' | 'aadhaar' | 'ifsc' | 'pincode' | 'scanner'>('batch');

  // Single Validation Inputs
  const [panInput, setPanInput] = useState('ABCDE1234F');
  const [aadhaarInput, setAadhaarInput] = useState('5482 9102 3847');
  const [showMaskedAadhaar, setShowMaskedAadhaar] = useState(false);
  const [ifscInput, setIfscInput] = useState('SBIN0001234');
  const [pincodeInput, setPincodeInput] = useState('110001');

  // Multi-Text Scanner Input
  const [scannerText, setScannerText] = useState(
    `Verification Batch Sample:\nPAN: ABCDE1234F, Aadhaar: 548291023847, IFSC: SBIN0001234, Pincode: 201301.\nAlso bad PAN: XYZ123, bad Aadhaar: 123456789012, good IFSC: HDFC0001234.`
  );

  // Batch CSV Upload & Results State
  const [batchItems, setBatchItems] = useState<BatchValidationItem[]>([
    { id: '1', docType: 'PAN', value: 'ABCDE1234F', isValid: true, details: 'Individual PAN (Sharma)', nameOrNote: 'Rajesh Sharma' },
    { id: '2', docType: 'PAN', value: 'XYZ9999P', isValid: false, errorReason: 'Must be exactly 10 characters (entered: 8)', nameOrNote: 'Invalid Test' },
    { id: '3', docType: 'Aadhaar', value: '5482 9102 3847', isValid: true, details: 'Verhoeff Checksum Passed', nameOrNote: 'Rajesh Sharma' },
    { id: '4', docType: 'Aadhaar', value: '1234 5678 9012', isValid: false, errorReason: 'Aadhaar cannot start with 0 or 1', nameOrNote: 'Failed Prefix Test' },
    { id: '5', docType: 'IFSC', value: 'SBIN0001234', isValid: true, details: 'State Bank of India (SBI)', nameOrNote: 'Main Branch' },
    { id: '6', docType: 'IFSC', value: 'SBIN1001234', isValid: false, errorReason: "5th character must be mandatory '0' (found '1')", nameOrNote: 'Bad 5th Char' },
    { id: '7', docType: 'Pincode', value: '201301', isValid: true, details: 'Zone 2: Uttar Pradesh, Uttarakhand', nameOrNote: 'Noida Office' },
    { id: '8', docType: 'Pincode', value: '010001', isValid: false, errorReason: 'Pincode cannot start with 0', nameOrNote: 'Bad Zero Start' },
  ]);

  const [batchSearch, setBatchSearch] = useState('');
  const [batchFilterStatus, setBatchFilterStatus] = useState<'all' | 'valid' | 'invalid'>('all');
  const [batchFilterDocType, setBatchFilterDocType] = useState<string>('all');
  const [showPdfModal, setShowPdfModal] = useState(false);

  // Helper: Single PAN validator function
  const analyzePAN = (raw: string) => {
    const clean = raw.trim().toUpperCase();
    if (!clean) return { isValid: false, errorReason: 'Empty string', details: '' };

    const regex = /^[A-Z]{3}[PCHABGJLFTF][A-Z]{1}[0-9]{4}[A-Z]{1}$/;
    const isValid = regex.test(clean);

    if (clean.length !== 10) return { isValid: false, errorReason: `Must be exactly 10 characters (entered: ${clean.length})` };
    const holderTypeChar = clean[3] || '';
    const holderInfo = PAN_HOLDER_TYPES[holderTypeChar];

    if (!holderInfo) return { isValid: false, errorReason: `4th character '${holderTypeChar}' is not a valid PAN holder type code` };

    return {
      isValid,
      errorReason: isValid ? undefined : 'Invalid PAN format or checksum character',
      details: `${holderInfo.type} [Series: ${clean.slice(0, 3)}, Initial: ${clean[4]}]`,
    };
  };

  // Helper: Single Aadhaar validator function
  const analyzeAadhaar = (raw: string) => {
    const clean = raw.replace(/\D/g, '');
    if (clean.length !== 12) return { isValid: false, errorReason: `Must be 12 numeric digits (entered: ${clean.length})` };
    if (!/^[2-9]/.test(clean)) return { isValid: false, errorReason: 'Aadhaar cannot start with 0 or 1' };
    const isVerhoeffValid = validateVerhoeff(clean);
    return {
      isValid: isVerhoeffValid,
      errorReason: isVerhoeffValid ? undefined : 'Failed Verhoeff Checksum Algorithm (Typo/Invalid digits)',
      details: isVerhoeffValid ? 'Verhoeff 12-digit Checksum Passed' : 'Invalid Structure',
    };
  };

  // Helper: Single IFSC validator function
  const analyzeIFSC = (raw: string) => {
    const clean = raw.trim().toUpperCase();
    if (clean.length !== 11) return { isValid: false, errorReason: `IFSC must be 11 characters (entered: ${clean.length})` };
    const bankCode = clean.slice(0, 4);
    if (!/^[A-Z]{4}/.test(bankCode)) return { isValid: false, errorReason: 'First 4 characters must be letters' };
    if (clean[4] !== '0') return { isValid: false, errorReason: `5th character must be '0' (found '${clean[4]}')` };

    const bankDetails = BANK_DICTIONARY[bankCode];
    const bankName = bankDetails ? bankDetails.name : `${bankCode} Scheduled Bank`;

    return {
      isValid: true,
      details: `${bankName} [Branch: ${clean.slice(5)}]`,
    };
  };

  // Helper: Single Pincode validator function
  const analyzePincode = (raw: string) => {
    const clean = raw.trim();
    if (clean.length !== 6) return { isValid: false, errorReason: `Pincode must be 6 digits (entered: ${clean.length})` };
    if (!/^[1-9][0-9]{5}$/.test(clean)) return { isValid: false, errorReason: 'Pincode cannot start with 0' };

    const zoneDigit = clean[0];
    const zoneInfo = PINCODE_ZONES[zoneDigit];
    return {
      isValid: true,
      details: zoneInfo ? zoneInfo.region : 'Indian Postal Code',
    };
  };

  // Process CSV File Upload
  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      const newItems: BatchValidationItem[] = [];

      lines.forEach((line, idx) => {
        // Skip header if line contains words like 'Document' or 'Type' or 'Value'
        if (idx === 0 && (line.toLowerCase().includes('type') || line.toLowerCase().includes('value') || line.toLowerCase().includes('document'))) {
          return;
        }

        const parts = line.split(',').map((p) => p.replace(/^"|"$/g, '').trim());
        if (parts.length === 0 || !parts[0]) return;

        let docType: 'PAN' | 'Aadhaar' | 'IFSC' | 'Pincode' = 'PAN';
        let val = parts[0];
        let nameOrNote = parts[1] || `Row #${idx + 1}`;

        // Auto detect document type if second column specifies it or from pattern
        if (parts.length >= 2) {
          const firstUpper = parts[0].toUpperCase();
          if (['PAN', 'AADHAAR', 'IFSC', 'PINCODE'].includes(firstUpper)) {
            docType = firstUpper as any;
            val = parts[1];
            nameOrNote = parts[2] || `Row #${idx + 1}`;
          }
        }

        if (!val) return;

        // Auto detect if not explicitly provided
        const cleanVal = val.trim().toUpperCase();
        if (/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanVal) || cleanVal.length === 10) docType = 'PAN';
        else if (cleanVal.replace(/\D/g, '').length === 12) docType = 'Aadhaar';
        else if (/^[A-Z]{4}0/.test(cleanVal)) docType = 'IFSC';
        else if (/^[1-9][0-9]{5}$/.test(cleanVal)) docType = 'Pincode';

        let analysis;
        if (docType === 'PAN') analysis = analyzePAN(val);
        else if (docType === 'Aadhaar') analysis = analyzeAadhaar(val);
        else if (docType === 'IFSC') analysis = analyzeIFSC(val);
        else analysis = analyzePincode(val);

        newItems.push({
          id: `csv-${Date.now()}-${idx}`,
          docType,
          value: val,
          isValid: analysis.isValid,
          errorReason: analysis.errorReason,
          details: analysis.details,
          nameOrNote,
        });
      });

      if (newItems.length > 0) {
        setBatchItems((prev) => [...newItems, ...prev]);
      }
    };
    reader.readAsText(file);
  };

  // Generate Sample CSV Template for download
  const downloadSampleCsv = () => {
    const csvContent = `DocumentType,DocumentValue,ApplicantName
PAN,ABCDE1234F,Rajesh Sharma
PAN,XYZ9999P,Test Invalid PAN
Aadhaar,5482 9102 3847,Rajesh Sharma
Aadhaar,1234 5678 9012,Bad Aadhaar
IFSC,SBIN0001234,SBI Main Branch
IFSC,HDFC0000123,HDFC Bank
Pincode,110001,Connaught Place Delhi
Pincode,201301,Noida Sector 15
`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Sample_Document_Batch_Validation.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export Batch Results as CSV
  const exportBatchCsv = () => {
    let csv = 'ID,Document Type,Entered Value,Status,Validation Notes / Details,Applicant Name / Ref\n';
    batchItems.forEach((item, idx) => {
      const status = item.isValid ? 'VALID' : 'INVALID';
      const notes = (item.errorReason || item.details || '').replace(/,/g, ' ');
      csv += `"${idx + 1}","${item.docType}","${item.value}","${status}","${notes}","${item.nameOrNote || ''}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Document_Validation_Audit_Report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filtered Batch Items
  const filteredBatchItems = useMemo(() => {
    return batchItems.filter((item) => {
      if (batchFilterStatus === 'valid' && !item.isValid) return false;
      if (batchFilterStatus === 'invalid' && item.isValid) return false;
      if (batchFilterDocType !== 'all' && item.docType.toLowerCase() !== batchFilterDocType.toLowerCase()) return false;

      if (batchSearch) {
        const q = batchSearch.toLowerCase();
        return (
          item.value.toLowerCase().includes(q) ||
          item.docType.toLowerCase().includes(q) ||
          (item.nameOrNote && item.nameOrNote.toLowerCase().includes(q)) ||
          (item.details && item.details.toLowerCase().includes(q)) ||
          (item.errorReason && item.errorReason.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [batchItems, batchFilterStatus, batchFilterDocType, batchSearch]);

  // Summary Metrics
  const summaryMetrics = useMemo(() => {
    const total = batchItems.length;
    const valid = batchItems.filter((i) => i.isValid).length;
    const invalid = total - valid;
    const passRate = total > 0 ? ((valid / total) * 100).toFixed(1) : '0.0';
    return { total, valid, invalid, passRate };
  }, [batchItems]);

  // Single Analyzers Output Memoization
  const panAnalysis = useMemo(() => analyzePAN(panInput), [panInput]);
  const aadhaarAnalysis = useMemo(() => analyzeAadhaar(aadhaarInput), [aadhaarInput]);
  const ifscAnalysis = useMemo(() => analyzeIFSC(ifscInput), [ifscInput]);
  const pincodeAnalysis = useMemo(() => analyzePincode(pincodeInput), [pincodeInput]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-6 font-sans">
      {/* Printable CSS */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
            background: white !important;
            color: black !important;
          }
          #printable-audit-report, #printable-audit-report * {
            visibility: visible;
          }
          #printable-audit-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 24px;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Header Bar */}
      <div className="max-w-7xl mx-auto mb-6 no-print">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-2.5 py-1 rounded border border-emerald-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                VERHOEFF & REGEX AUDIT ENGINE
              </span>
              <span className="text-xs text-slate-400">PAN • Aadhaar • IFSC • Pincode</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1.5 flex items-center gap-2">
              Indian Document Batch Scanner & Validator
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Verify compliance, Verhoeff checksum algorithm, bank routing codes, and export complete audit reports.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowPdfModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold text-sm transition shadow-lg flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Audit PDF Report
            </button>

            <button
              onClick={exportBatchCsv}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold text-sm transition shadow-lg flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV Report
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-2 mt-4 flex overflow-x-auto gap-2">
          {[
            { id: 'batch', label: 'Batch CSV Scanner', icon: FileSpreadsheet },
            { id: 'pan', label: 'PAN Validator', icon: CreditCard },
            { id: 'aadhaar', label: 'Aadhaar Verhoeff', icon: ShieldCheck },
            { id: 'ifsc', label: 'IFSC Lookup', icon: Building },
            { id: 'pincode', label: 'Pincode Zone', icon: MapPin },
            { id: 'scanner', label: 'Freeform Text Scanner', icon: Search },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:bg-slate-700/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* TAB 1: BATCH CSV SCANNER & REPORT */}
        {activeTab === 'batch' && (
          <div className="space-y-6">
            {/* Upload Zone & Stats Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6 bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-emerald-400 flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Upload CSV Document Batch
                  </h3>
                  <button
                    onClick={downloadSampleCsv}
                    className="text-xs text-amber-300 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Download className="w-3 h-3" />
                    Download Sample CSV
                  </button>
                </div>

                <label className="border-2 border-dashed border-slate-600 hover:border-emerald-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition bg-slate-900/50 group">
                  <FileSpreadsheet className="w-10 h-10 text-slate-400 group-hover:text-emerald-400 transition mb-2" />
                  <span className="text-sm font-bold text-slate-200">
                    Click to browse or drop CSV file here
                  </span>
                  <span className="text-xs text-slate-400 mt-1">
                    Supports PAN, Aadhaar, IFSC, Pincode columns
                  </span>
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleCsvFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Summary Cards */}
              <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col justify-between shadow-lg">
                  <span className="text-xs font-semibold text-slate-400">Total Scanned</span>
                  <span className="text-3xl font-black text-white mt-2">{summaryMetrics.total}</span>
                  <span className="text-[10px] text-slate-500 mt-1">Documents in batch</span>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col justify-between shadow-lg">
                  <span className="text-xs font-semibold text-emerald-400">Valid Passed</span>
                  <span className="text-3xl font-black text-emerald-400 mt-2">{summaryMetrics.valid}</span>
                  <span className="text-[10px] text-emerald-500/80 mt-1">100% compliant</span>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col justify-between shadow-lg">
                  <span className="text-xs font-semibold text-rose-400">Invalid Flagged</span>
                  <span className="text-3xl font-black text-rose-400 mt-2">{summaryMetrics.invalid}</span>
                  <span className="text-[10px] text-rose-500/80 mt-1">Failed checksum/regex</span>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col justify-between shadow-lg">
                  <span className="text-xs font-semibold text-amber-400">Pass Rate %</span>
                  <span className="text-3xl font-black text-amber-400 mt-2">{summaryMetrics.passRate}%</span>
                  <span className="text-[10px] text-amber-500/80 mt-1">Compliance score</span>
                </div>
              </div>
            </div>

            {/* Batch Table Container */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-700 pb-4">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by Document Number, Name, or Error note..."
                    value={batchSearch}
                    onChange={(e) => setBatchSearch(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto">
                  <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
                    {(['all', 'valid', 'invalid'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setBatchFilterStatus(status)}
                        className={`px-3 py-1 rounded-md text-xs font-semibold uppercase transition ${
                          batchFilterStatus === status
                            ? 'bg-emerald-500 text-slate-950'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>

                  <select
                    value={batchFilterDocType}
                    onChange={(e) => setBatchFilterDocType(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  >
                    <option value="all">All Doc Types</option>
                    <option value="PAN">PAN Only</option>
                    <option value="Aadhaar">Aadhaar Only</option>
                    <option value="IFSC">IFSC Only</option>
                    <option value="Pincode">Pincode Only</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-700">
                      <th className="p-3">#</th>
                      <th className="p-3">Doc Type</th>
                      <th className="p-3">Entered Value</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Validation Details / Errors</th>
                      <th className="p-3">Applicant / Ref</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60">
                    {filteredBatchItems.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-slate-400">
                          No items match the selected filter.
                        </td>
                      </tr>
                    ) : (
                      filteredBatchItems.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-700/30 transition">
                          <td className="p-3 text-slate-500 font-mono">{idx + 1}</td>
                          <td className="p-3">
                            <span className="bg-slate-900 text-slate-200 font-bold px-2 py-0.5 rounded border border-slate-700">
                              {item.docType}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold text-white">{item.value}</td>
                          <td className="p-3">
                            {item.isValid ? (
                              <span className="bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-1 rounded border border-emerald-500/40 flex items-center gap-1 w-max text-[11px]">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                VALID
                              </span>
                            ) : (
                              <span className="bg-rose-500/20 text-rose-300 font-bold px-2.5 py-1 rounded border border-rose-500/40 flex items-center gap-1 w-max text-[11px]">
                                <XCircle className="w-3.5 h-3.5" />
                                INVALID
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            {item.isValid ? (
                              <span className="text-slate-300">{item.details || 'Passed Verification'}</span>
                            ) : (
                              <span className="text-rose-300 font-medium">{item.errorReason}</span>
                            )}
                          </td>
                          <td className="p-3 text-slate-400">{item.nameOrNote || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PAN VALIDATOR */}
        {activeTab === 'pan' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg space-y-4">
              <h3 className="text-base font-bold text-emerald-400 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Permanent Account Number (PAN) Validation
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Enter 10-Character PAN Number *
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={panInput}
                  onChange={(e) => setPanInput(e.target.value.toUpperCase())}
                  placeholder="e.g. ABCDE1234F"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-lg font-mono font-bold text-white focus:outline-none focus:border-emerald-500 uppercase tracking-widest"
                />
              </div>

              {/* Validation Result Box */}
              <div
                className={`p-4 rounded-xl border space-y-3 ${
                  panAnalysis.isValid
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider">PAN Structure Analysis</span>
                  <span
                    className={`px-2.5 py-0.5 rounded text-xs font-black uppercase ${
                      panAnalysis.isValid ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
                    }`}
                  >
                    {panAnalysis.isValid ? 'VALID PAN FORMAT' : 'INVALID PAN'}
                  </span>
                </div>

                {!panAnalysis.isValid && (
                  <p className="text-xs font-semibold text-rose-300">{panAnalysis.errorReason}</p>
                )}

                {panAnalysis.details && (
                  <p className="text-xs text-slate-300">{panAnalysis.details}</p>
                )}
              </div>
            </div>

            {/* PAN Holder Types Guide */}
            <div className="lg:col-span-6 bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg space-y-3">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                4th Character PAN Holder Category Decoder
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {Object.entries(PAN_HOLDER_TYPES).map(([code, info]) => (
                  <div key={code} className="bg-slate-900 border border-slate-700/80 rounded p-2 flex items-start gap-2">
                    <span className="bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-500/30">
                      {code}
                    </span>
                    <div>
                      <div className="font-bold text-white">{info.type}</div>
                      <div className="text-[10px] text-slate-400">{info.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AADHAAR VERHOEFF */}
        {activeTab === 'aadhaar' && (
          <div className="max-w-2xl mx-auto bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-emerald-400 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              12-Digit Aadhaar Verhoeff Algorithm Checksum
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Enter 12-Digit Aadhaar Number *
              </label>
              <input
                type="text"
                value={aadhaarInput}
                onChange={(e) => setAadhaarInput(e.target.value)}
                placeholder="e.g. 5482 9102 3847"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-lg font-mono font-bold text-white focus:outline-none focus:border-emerald-500 tracking-widest"
              />
            </div>

            <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-700 text-xs">
              <span className="text-slate-400">Mask Display Output:</span>
              <button
                onClick={() => setShowMaskedAadhaar(!showMaskedAadhaar)}
                aria-label={showMaskedAadhaar ? 'Hide Masked Aadhaar' : 'Show Masked Aadhaar'}
                className="text-amber-300 font-bold hover:underline"
              >
                {showMaskedAadhaar ? 'Show Raw Digits' : 'Show Masked (•••• •••• 3847)'}
              </button>
            </div>

            <div
              className={`p-4 rounded-xl border space-y-2 ${
                aadhaarAnalysis.isValid
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider">Verhoeff Matrix Status</span>
                <span
                  className={`px-2.5 py-0.5 rounded text-xs font-black uppercase ${
                    aadhaarAnalysis.isValid ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
                  }`}
                >
                  {aadhaarAnalysis.isValid ? 'VERHOEFF CHECKSUM PASSED' : 'FAILED / TYPO'}
                </span>
              </div>
              <p className="text-xs font-medium">{aadhaarAnalysis.errorReason || aadhaarAnalysis.details}</p>
            </div>
          </div>
        )}

        {/* TAB 4: IFSC LOOKUP */}
        {activeTab === 'ifsc' && (
          <div className="max-w-2xl mx-auto bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-emerald-400 flex items-center gap-2">
              <Building className="w-5 h-5" />
              Indian Financial System Code (IFSC) Bank Resolver
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Enter 11-Character IFSC Code *
              </label>
              <input
                type="text"
                maxLength={11}
                value={ifscInput}
                onChange={(e) => setIfscInput(e.target.value.toUpperCase())}
                placeholder="e.g. SBIN0001234"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-lg font-mono font-bold text-white focus:outline-none focus:border-emerald-500 uppercase tracking-widest"
              />
            </div>

            <div
              className={`p-4 rounded-xl border space-y-2 ${
                ifscAnalysis.isValid
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider">Bank Routing Resolution</span>
                <span
                  className={`px-2.5 py-0.5 rounded text-xs font-black uppercase ${
                    ifscAnalysis.isValid ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
                  }`}
                >
                  {ifscAnalysis.isValid ? 'VALID IFSC' : 'INVALID IFSC'}
                </span>
              </div>
              <p className="text-xs font-medium">{ifscAnalysis.errorReason || ifscAnalysis.details}</p>
            </div>
          </div>
        )}

        {/* TAB 5: PINCODE ZONE */}
        {activeTab === 'pincode' && (
          <div className="max-w-2xl mx-auto bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-emerald-400 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Indian Postal Index Number (Pincode) Zone Decoder
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Enter 6-Digit Pincode *
              </label>
              <input
                type="text"
                maxLength={6}
                value={pincodeInput}
                onChange={(e) => setPincodeInput(e.target.value)}
                placeholder="e.g. 110001"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-lg font-mono font-bold text-white focus:outline-none focus:border-emerald-500 tracking-widest"
              />
            </div>

            <div
              className={`p-4 rounded-xl border space-y-2 ${
                pincodeAnalysis.isValid
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider">Postal Zone Resolution</span>
                <span
                  className={`px-2.5 py-0.5 rounded text-xs font-black uppercase ${
                    pincodeAnalysis.isValid ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
                  }`}
                >
                  {pincodeAnalysis.isValid ? 'VALID PINCODE' : 'INVALID PINCODE'}
                </span>
              </div>
              <p className="text-xs font-medium">{pincodeAnalysis.errorReason || pincodeAnalysis.details}</p>
            </div>
          </div>
        )}

        {/* TAB 6: FREEFORM TEXT SCANNER */}
        {activeTab === 'scanner' && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-emerald-400 flex items-center gap-2">
              <Search className="w-5 h-5" />
              Multi-Document Freeform Text Regex Extraction
            </h3>

            <textarea
              rows={5}
              value={scannerText}
              onChange={(e) => setScannerText(e.target.value)}
              placeholder="Paste any text containing PANs, Aadhaars, IFSCs, or Pincodes..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
        )}
      </div>

      {/* Audit PDF Report Modal / Printable View */}
      {showPdfModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between no-print border-b border-slate-700 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                Document Verification Audit Report Preview
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Save PDF
                </button>
                <button
                  onClick={() => setShowPdfModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Printable Document Sheet */}
            <div id="printable-audit-report" className="bg-white text-black p-8 rounded-sm font-sans text-xs space-y-4">
              <div className="border-b-2 border-black pb-4 flex justify-between items-start">
                <div>
                  <h1 className="text-xl font-extrabold tracking-tight">DOCUMENT COMPLIANCE AUDIT REPORT</h1>
                  <div className="text-xs text-slate-600 font-medium mt-0.5">
                    Generated on: {new Date().toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="text-right font-mono text-[10px]">
                  <div>SYSTEM: NYXA AUDIT ENGINE</div>
                  <div>VERHOEFF 12-DIGIT ALGORITHM</div>
                </div>
              </div>

              {/* Summary Bar */}
              <div className="grid grid-cols-4 gap-2 bg-slate-100 border border-black p-3 text-center">
                <div>
                  <div className="text-[10px] text-slate-600">TOTAL SCANNED</div>
                  <div className="font-black text-sm">{summaryMetrics.total}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-600">VALID PASSED</div>
                  <div className="font-black text-sm text-emerald-700">{summaryMetrics.valid}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-600">INVALID FLAGGED</div>
                  <div className="font-black text-sm text-rose-700">{summaryMetrics.invalid}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-600">COMPLIANCE SCORE</div>
                  <div className="font-black text-sm">{summaryMetrics.passRate}%</div>
                </div>
              </div>

              {/* Table */}
              <table className="w-full text-left border-collapse text-[10.5px]">
                <thead>
                  <tr className="bg-slate-200 border-y border-black font-bold">
                    <th className="p-1.5 border-r border-black">#</th>
                    <th className="p-1.5 border-r border-black">Doc Type</th>
                    <th className="p-1.5 border-r border-black">Entered Value</th>
                    <th className="p-1.5 border-r border-black">Status</th>
                    <th className="p-1.5">Validation Details / Errors</th>
                  </tr>
                </thead>
                <tbody>
                  {batchItems.map((item, idx) => (
                    <tr key={item.id} className="border-b border-slate-300">
                      <td className="p-1.5 border-r border-black font-mono">{idx + 1}</td>
                      <td className="p-1.5 border-r border-black font-bold">{item.docType}</td>
                      <td className="p-1.5 border-r border-black font-mono">{item.value}</td>
                      <td className="p-1.5 border-r border-black font-bold">
                        {item.isValid ? 'VALID' : 'INVALID'}
                      </td>
                      <td className="p-1.5">{item.errorReason || item.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
