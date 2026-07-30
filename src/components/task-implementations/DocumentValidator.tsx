'use client';

import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Search,
  CreditCard,
  Building,
  MapPin,
  Copy,
  Check,
  Sparkles,
  HelpCircle,
  FileCheck,
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
};

// --- PAN HOLDER TYPE DECODER ---
const PAN_HOLDER_TYPES: Record<string, { type: string; category: string; desc: string }> = {
  P: { type: 'Individual (Person)', category: 'Personal', desc: 'Individual Taxpayer / Natural Person' },
  C: { type: 'Company', category: 'Corporate', desc: 'Registered Private or Public Limited Company' },
  H: { type: 'Hindu Undivided Family (HUF)', category: 'Family Trust', desc: 'Hindu Undivided Family tax entity' },
  A: { type: 'Association of Persons (AOP)', category: 'Entity', desc: 'Group of persons formed for common purpose' },
  B: { type: 'Body of Individuals (BOI)', category: 'Entity', desc: 'Conglomerate of individuals' },
  G: { type: 'Government Agency', category: 'Government', desc: 'Central / State Government Body or Ministry' },
  J: { type: 'Artificial Juridical Person', category: 'Legal Body', desc: 'Public universities, statutory authorities' },
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

type DocType = 'AUTO' | 'PAN' | 'AADHAAR' | 'IFSC' | 'PINCODE';

export default function DocumentValidator() {
  const [query, setQuery] = useState('ABCDE1234F');
  const [selectedType, setSelectedType] = useState<DocType>('AUTO');
  const [copied, setCopied] = useState(false);

  // Validation & Decoding Engine
  const result = useMemo(() => {
    const raw = query.trim();
    if (!raw) return null;

    const upper = raw.toUpperCase();
    const digitsOnly = raw.replace(/\D/g, '');

    // Auto-detect type if set to AUTO
    let docType: 'PAN' | 'AADHAAR' | 'IFSC' | 'PINCODE' | 'UNKNOWN' = 'UNKNOWN';

    if (selectedType !== 'AUTO') {
      docType = selectedType;
    } else {
      if (/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(upper) || (upper.length === 10 && /^[A-Z]{3}/.test(upper))) {
        docType = 'PAN';
      } else if (digitsOnly.length === 12) {
        docType = 'AADHAAR';
      } else if (/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(upper) || (upper.length === 11 && /^[A-Z]{4}/.test(upper))) {
        docType = 'IFSC';
      } else if (digitsOnly.length === 6 && !upper.includes(' ')) {
        docType = 'PINCODE';
      } else {
        // Fallback checks
        if (upper.length === 10) docType = 'PAN';
        else if (digitsOnly.length > 8 && digitsOnly.length <= 12) docType = 'AADHAAR';
        else if (upper.length === 11) docType = 'IFSC';
        else if (digitsOnly.length === 6) docType = 'PINCODE';
      }
    }

    // 1. PAN Analysis
    if (docType === 'PAN') {
      const isFormatValid = /^[A-Z]{3}[PCHABGJLFTF][A-Z]{1}[0-9]{4}[A-Z]{1}$/.test(upper);
      if (upper.length !== 10) {
        return {
          type: 'PAN' as const,
          isValid: false,
          error: `PAN must be exactly 10 characters (entered ${upper.length})`,
          metadata: [],
        };
      }
      const holderChar = upper[3];
      const holderInfo = PAN_HOLDER_TYPES[holderChar];

      if (!holderInfo) {
        return {
          type: 'PAN' as const,
          isValid: false,
          error: `4th character '${holderChar}' is not a valid PAN holder type`,
          metadata: [],
        };
      }

      return {
        type: 'PAN' as const,
        isValid: isFormatValid,
        error: isFormatValid ? undefined : 'Invalid PAN format or checksum',
        metadata: [
          { label: 'Holder Type', value: holderInfo.type },
          { label: 'Category', value: holderInfo.category },
          { label: 'Description', value: holderInfo.desc },
          { label: 'Surname Initial', value: `Letter '${upper[4]}'` },
          { label: 'Series Code', value: upper.slice(0, 3) },
        ],
      };
    }

    // 2. Aadhaar Analysis
    if (docType === 'AADHAAR') {
      if (digitsOnly.length !== 12) {
        return {
          type: 'Aadhaar' as const,
          isValid: false,
          error: `Aadhaar must contain 12 numeric digits (found ${digitsOnly.length})`,
          metadata: [],
        };
      }
      if (!/^[2-9]/.test(digitsOnly)) {
        return {
          type: 'Aadhaar' as const,
          isValid: false,
          error: 'Aadhaar number cannot start with 0 or 1',
          metadata: [],
        };
      }
      const isVerhoeffValid = validateVerhoeff(digitsOnly);
      const masked = `•••• •••• ${digitsOnly.slice(8)}`;

      return {
        type: 'Aadhaar' as const,
        isValid: isVerhoeffValid,
        error: isVerhoeffValid ? undefined : 'Failed 12-Digit Verhoeff Checksum Algorithm',
        metadata: [
          { label: 'Verhoeff Checksum', value: isVerhoeffValid ? 'Passed (Valid)' : 'Failed (Typo)' },
          { label: 'Masked Display', value: masked },
          { label: 'Digit Length', value: '12 Digits' },
          { label: 'Prefix Check', value: 'Passed (Starts 2-9)' },
        ],
      };
    }

    // 3. IFSC Analysis
    if (docType === 'IFSC') {
      if (upper.length !== 11) {
        return {
          type: 'IFSC' as const,
          isValid: false,
          error: `IFSC must be exactly 11 characters (entered ${upper.length})`,
          metadata: [],
        };
      }
      const bankCode = upper.slice(0, 4);
      if (!/^[A-Z]{4}/.test(bankCode)) {
        return {
          type: 'IFSC' as const,
          isValid: false,
          error: 'First 4 characters must be bank alphabetic code',
          metadata: [],
        };
      }
      if (upper[4] !== '0') {
        return {
          type: 'IFSC' as const,
          isValid: false,
          error: `5th character must be mandatory '0' (found '${upper[4]}')`,
          metadata: [],
        };
      }

      const bankInfo = BANK_DICTIONARY[bankCode];
      const bankName = bankInfo ? bankInfo.name : `${bankCode} Scheduled Bank`;

      return {
        type: 'IFSC' as const,
        isValid: true,
        metadata: [
          { label: 'Bank Name', value: bankName },
          { label: 'Branch Code', value: upper.slice(5) },
          { label: 'HQ Location', value: bankInfo?.hq || 'India' },
          { label: 'Bank Type', value: bankInfo?.type || 'Scheduled Bank' },
          { label: 'MICR Prefix', value: bankInfo?.micrPrefix || 'N/A' },
        ],
      };
    }

    // 4. Pincode Analysis
    if (docType === 'PINCODE') {
      if (digitsOnly.length !== 6) {
        return {
          type: 'Pincode' as const,
          isValid: false,
          error: `Pincode must be 6 digits (entered ${digitsOnly.length})`,
          metadata: [],
        };
      }
      if (!/^[1-9][0-9]{5}$/.test(digitsOnly)) {
        return {
          type: 'Pincode' as const,
          isValid: false,
          error: 'Indian Pincode cannot start with 0',
          metadata: [],
        };
      }
      const zoneDigit = digitsOnly[0];
      const zoneInfo = PINCODE_ZONES[zoneDigit];

      return {
        type: 'Pincode' as const,
        isValid: true,
        metadata: [
          { label: 'Postal Zone', value: zoneInfo?.region || 'Indian Postal Zone' },
          { label: 'States / UTs', value: zoneInfo?.states || 'India' },
          { label: 'Pincode Digits', value: digitsOnly },
          { label: 'Sub-Region Code', value: digitsOnly.slice(0, 3) },
        ],
      };
    }

    return {
      type: 'Unknown' as const,
      isValid: false,
      error: 'Unrecognized document number format. Please check your entry.',
      metadata: [],
    };
  }, [query, selectedType]);

  const copyResult = () => {
    if (!result) return;
    const text = `${result.type}: ${query} -> ${result.isValid ? 'VALID' : 'INVALID'}\n${result.metadata
      .map((m) => `${m.label}: ${m.value}`)
      .join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sampleInputs = [
    { label: 'Sample PAN', val: 'ABCDE1234F', type: 'PAN' as const },
    { label: 'Sample Aadhaar', val: '5482 9102 3847', type: 'AADHAAR' as const },
    { label: 'Sample IFSC', val: 'SBIN0001234', type: 'IFSC' as const },
    { label: 'Sample Pincode', val: '110001', type: 'PINCODE' as const },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 md:p-10 font-sans flex flex-col items-center justify-center">
      <div className="w-full max-w-3xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" /> Verhoeff & Pattern Verification Engine
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--foreground)]">
            Document & ID Validator
          </h1>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            Instant validation & metadata extraction for PAN, Aadhaar (Verhoeff), IFSC & Pincodes.
          </p>
        </div>

        {/* Input Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter PAN, Aadhaar, IFSC code, or Pincode..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-base sm:text-lg font-mono font-bold text-white focus:outline-none focus:border-emerald-500 tracking-wide transition"
            />
          </div>

          {/* Quick Filter Buttons & Samples */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 pt-3">
            <div className="flex items-center gap-1 overflow-x-auto">
              {(['AUTO', 'PAN', 'AADHAAR', 'IFSC', 'PINCODE'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    selectedType === t
                      ? 'bg-emerald-500 text-slate-950 shadow'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {sampleInputs.map((s) => (
                <button
                  key={s.label}
                  onClick={() => {
                    setQuery(s.val);
                    setSelectedType('AUTO');
                  }}
                  className="text-[11px] bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold px-2.5 py-1 rounded-lg transition"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Validation Result Card */}
        {result && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in duration-200">
            {/* Status Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                {result.isValid ? (
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
                    <XCircle className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {result.type} Document
                    </span>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                        result.isValid ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
                      }`}
                    >
                      {result.isValid ? 'VALID FORMAT' : 'INVALID'}
                    </span>
                  </div>
                  <div className="text-lg font-mono font-bold text-white mt-0.5">{query}</div>
                </div>
              </div>

              <button
                onClick={copyResult}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-slate-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Summary'}
              </button>
            </div>

            {/* Error Message if invalid */}
            {!result.isValid && result.error && (
              <div className="bg-rose-950/40 border border-rose-500/40 text-rose-200 p-4 rounded-xl text-xs font-semibold">
                ⚠️ {result.error}
              </div>
            )}

            {/* Decoded Metadata Grid */}
            {result.metadata.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Decoded Intelligence Metadata
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {result.metadata.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col justify-between"
                    >
                      <span className="text-slate-400 text-[11px] font-medium">{item.label}</span>
                      <span className="text-white font-bold mt-1 text-sm">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
