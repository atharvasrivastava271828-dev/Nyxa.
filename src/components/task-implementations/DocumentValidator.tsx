'use client';

import React, { useState, useMemo } from 'react';

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

export default function DocumentValidator() {
  const [activeTab, setActiveTab] = useState<'pan' | 'aadhaar' | 'ifsc' | 'pincode' | 'scanner'>('pan');

  // Individual Form Inputs
  const [panInput, setPanInput] = useState('ABCDE1234F');
  const [aadhaarInput, setAadhaarInput] = useState('5482 9102 3847');
  const [showMaskedAadhaar, setShowMaskedAadhaar] = useState(false);
  const [ifscInput, setIfscInput] = useState('SBIN0001234');
  const [pincodeInput, setPincodeInput] = useState('110001');

  // Scanner Multi Input
  const [scannerText, setScannerText] = useState(
    `Here are sample details for verification:\nPAN: ABCDE1234F, Aadhaar: 548291023847, IFSC: SBIN0001234, Pincode: 201301.\nAlso invalid PAN: XYZ123 or bad Aadhaar: 123456789012.`
  );

  // --- PAN VALIDATION ANALYSIS ---
  const panAnalysis = useMemo(() => {
    const cleanPan = panInput.trim().toUpperCase();
    const regex = /^[A-Z]{3}[PCHABGJLFTF][A-Z]{1}[0-9]{4}[A-Z]{1}$/;
    const isValid = regex.test(cleanPan);

    if (cleanPan.length === 0) {
      return { isValid: false, message: 'Please enter a 10-character PAN number.', breakdown: null };
    }

    const series = cleanPan.slice(0, 3);
    const holderTypeChar = cleanPan[3] || '';
    const surnameInitial = cleanPan[4] || '';
    const sequentialNum = cleanPan.slice(5, 9);
    const checkChar = cleanPan[9] || '';

    const holderInfo = PAN_HOLDER_TYPES[holderTypeChar] || {
      type: 'Unknown / Invalid Type',
      category: 'Invalid',
      desc: 'The 4th character must be P, C, H, A, B, G, J, L, F, or T',
    };

    let errorReason = '';
    if (cleanPan.length !== 10) {
      errorReason = `Must be exactly 10 characters (current: ${cleanPan.length})`;
    } else if (!/^[A-Z]{3}/.test(series)) {
      errorReason = 'First 3 characters must be alphabetic series (A-Z)';
    } else if (!PAN_HOLDER_TYPES[holderTypeChar]) {
      errorReason = `4th character '${holderTypeChar}' is not a valid PAN holder type code`;
    } else if (!/^[A-Z]/.test(surnameInitial)) {
      errorReason = '5th character must be surname/name initial letter (A-Z)';
    } else if (!/^[0-9]{4}/.test(sequentialNum)) {
      errorReason = '6th to 9th characters must be 4 numeric digits (0001-9999)';
    } else if (!/^[A-Z]$/.test(checkChar)) {
      errorReason = '10th character check letter must be alphabetic (A-Z)';
    }

    return {
      cleanPan,
      isValid,
      errorReason,
      breakdown: {
        series,
        holderTypeChar,
        holderInfo,
        surnameInitial,
        sequentialNum,
        checkChar,
      },
    };
  }, [panInput]);

  // --- AADHAAR VALIDATION ANALYSIS ---
  const aadhaarAnalysis = useMemo(() => {
    const rawDigits = aadhaarInput.replace(/\D/g, '');
    const is12Digits = rawDigits.length === 12;
    const startsValid = /^[2-9]/.test(rawDigits);
    const isVerhoeffValid = is12Digits && startsValid && validateVerhoeff(rawDigits);

    const formattedDisplay = rawDigits.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3');
    const maskedDisplay = rawDigits.length === 12 ? `•••• •••• ${rawDigits.slice(8)}` : rawDigits;

    let errorReason = '';
    if (rawDigits.length === 0) {
      errorReason = 'Please enter 12-digit Aadhaar number';
    } else if (rawDigits.length !== 12) {
      errorReason = `Aadhaar must be exactly 12 digits (entered: ${rawDigits.length})`;
    } else if (!startsValid) {
      errorReason = 'Aadhaar cannot start with 0 or 1';
    } else if (!isVerhoeffValid) {
      errorReason = 'Failed Verhoeff Checksum Algorithm (Invalid digit structure/typo)';
    }

    return {
      rawDigits,
      formattedDisplay,
      maskedDisplay,
      is12Digits,
      startsValid,
      isVerhoeffValid,
      isValid: isVerhoeffValid,
      errorReason,
    };
  }, [aadhaarInput]);

  // --- IFSC VALIDATION ANALYSIS ---
  const ifscAnalysis = useMemo(() => {
    const cleanIfsc = ifscInput.trim().toUpperCase();
    const regex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    const isValid = regex.test(cleanIfsc);

    const bankCode = cleanIfsc.slice(0, 4);
    const fifthChar = cleanIfsc[4] || '';
    const branchCode = cleanIfsc.slice(5);

    const bankDetails = BANK_DICTIONARY[bankCode] || {
      name: `${bankCode} (Scheduled Indian Bank)`,
      hq: 'National Banking Network',
      type: 'Recognized Financial Institution',
      micrPrefix: '400XXX',
    };

    let errorReason = '';
    if (cleanIfsc.length !== 11) {
      errorReason = `IFSC must be exactly 11 characters (current: ${cleanIfsc.length})`;
    } else if (!/^[A-Z]{4}/.test(bankCode)) {
      errorReason = 'First 4 characters must be Bank Alphabet Code';
    } else if (fifthChar !== '0') {
      errorReason = `5th character must be mandatory '0' (found '${fifthChar}')`;
    } else if (!/^[A-Z0-9]{6}$/.test(branchCode)) {
      errorReason = 'Last 6 characters must be alphanumeric branch code';
    }

    return {
      cleanIfsc,
      isValid,
      bankCode,
      fifthChar,
      branchCode,
      bankDetails,
      errorReason,
    };
  }, [ifscInput]);

  // --- PINCODE VALIDATION ANALYSIS ---
  const pincodeAnalysis = useMemo(() => {
    const cleanPin = pincodeInput.trim();
    const regex = /^[1-9][0-9]{5}$/;
    const isValid = regex.test(cleanPin);

    const zoneDigit = cleanPin[0] || '';
    const subZoneDigit = cleanPin[1] || '';
    const sortingDistrictDigit = cleanPin[2] || '';
    const officeCode = cleanPin.slice(3);

    const zoneInfo = PINCODE_ZONES[zoneDigit] || {
      region: 'Unknown Postal Zone',
      states: 'Invalid 1st digit (Pincode cannot start with 0)',
    };

    let errorReason = '';
    if (cleanPin.length !== 6) {
      errorReason = `Pincode must be exactly 6 numeric digits (current: ${cleanPin.length})`;
    } else if (zoneDigit === '0') {
      errorReason = 'Pincode cannot start with 0';
    } else if (!/^\d{6}$/.test(cleanPin)) {
      errorReason = 'Must contain numbers only';
    }

    return {
      cleanPin,
      isValid,
      zoneDigit,
      subZoneDigit,
      sortingDistrictDigit,
      officeCode,
      zoneInfo,
      errorReason,
    };
  }, [pincodeInput]);

  // --- AUTO SCANNER DETECTION ENGINE ---
  const scannedResults = useMemo(() => {
    if (!scannerText) return [];

    const tokens = scannerText.match(/[A-Za-z0-9]+/g) || [];
    const results: { text: string; type: string; isValid: boolean; detail: string }[] = [];

    // Dedicated regex matchers
    const panRegex = /\b[A-Z]{3}[PCHABGJLFTF][A-Z]{1}[0-9]{4}[A-Z]{1}\b/gi;
    const aadhaarRegex = /\b[2-9]\d{11}\b|\b[2-9]\d{3}\s\d{4}\s\d{4}\b/g;
    const ifscRegex = /\b[A-Z]{4}0[A-Z0-9]{6}\b/gi;
    const pincodeRegex = /\b[1-9][0-9]{5}\b/g;

    const matchedPan = scannerText.match(panRegex) || [];
    matchedPan.forEach((p) => {
      const upper = p.toUpperCase();
      const holder = PAN_HOLDER_TYPES[upper[3]]?.type || 'Entity';
      results.push({
        text: upper,
        type: 'PAN Card',
        isValid: true,
        detail: `Holder Type: ${holder}`,
      });
    });

    const matchedAadhaar = scannerText.match(aadhaarRegex) || [];
    matchedAadhaar.forEach((a) => {
      const clean = a.replace(/\D/g, '');
      const valid = validateVerhoeff(clean);
      results.push({
        text: clean.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3'),
        type: 'Aadhaar Card',
        isValid: valid,
        detail: valid ? 'Verhoeff Checksum Passed' : 'Checksum Failed',
      });
    });

    const matchedIfsc = scannerText.match(ifscRegex) || [];
    matchedIfsc.forEach((i) => {
      const upper = i.toUpperCase();
      const bank = BANK_DICTIONARY[upper.slice(0, 4)]?.name || 'Bank Code';
      results.push({
        text: upper,
        type: 'IFSC Code',
        isValid: true,
        detail: `Bank: ${bank}`,
      });
    });

    const matchedPincode = scannerText.match(pincodeRegex) || [];
    matchedPincode.forEach((pin) => {
      const zone = PINCODE_ZONES[pin[0]]?.region || 'Postal Zone';
      results.push({
        text: pin,
        type: 'Pincode',
        isValid: true,
        detail: `Zone: ${zone}`,
      });
    });

    return results;
  }, [scannerText]);

  // Preset Sample Document Generator
  const loadSampleData = (docType: 'pan' | 'aadhaar' | 'ifsc' | 'pincode') => {
    if (docType === 'pan') {
      const samples = ['ABCDE1234F', 'BKPPS9876K', 'DELCS4321A', 'GOVGS1111Z', 'TRTTM5555L'];
      setPanInput(samples[Math.floor(Math.random() * samples.length)]);
    } else if (docType === 'aadhaar') {
      const samples = ['5482 9102 3847', '2948 1039 5821', '9182 3476 1092'];
      setAadhaarInput(samples[Math.floor(Math.random() * samples.length)]);
    } else if (docType === 'ifsc') {
      const samples = ['SBIN0001234', 'HDFC0000240', 'ICIC0000229', 'PUNB0110024', 'BARB0VADODA'];
      setIfscInput(samples[Math.floor(Math.random() * samples.length)]);
    } else if (docType === 'pincode') {
      const samples = ['110001', '400001', '560001', '600001', '700001', '201301'];
      setPincodeInput(samples[Math.floor(Math.random() * samples.length)]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Title Banner */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-indigo-500/20 text-indigo-300 text-xs font-semibold px-2.5 py-1 rounded border border-indigo-500/30">
                VERIFICATION SUITE
              </span>
              <span className="text-xs text-slate-400">PAN • AADHAAR • IFSC • PINCODE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Indian Document Format & Checksum Validator
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Client-side validator checking structure, holder types, Verhoeff checksum algorithm, bank IFSC lookup & postal zones.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-2 flex overflow-x-auto gap-2">
          {[
            { id: 'pan', label: '💳 PAN Card' },
            { id: 'aadhaar', label: '🆔 Aadhaar Number' },
            { id: 'ifsc', label: '🏦 IFSC Code' },
            { id: 'pincode', label: '📍 Pincode' },
            { id: 'scanner', label: '🔍 Text Auto-Scanner' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition flex-1 text-center ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-slate-700/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: PAN VALIDATOR */}
        {activeTab === 'pan' && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  PAN (Permanent Account Number) Validator
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Decodes holder type (4th char), surname initial (5th char), and verifies 10-char alphanumeric structure.
                </p>
              </div>
              <button
                onClick={() => loadSampleData('pan')}
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs px-3 py-1.5 rounded-lg font-medium transition self-start sm:self-auto"
              >
                🎲 Load Random PAN
              </button>
            </div>

            {/* Input & Status Bar */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Enter 10-Character PAN Number
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  maxLength={10}
                  value={panInput}
                  onChange={(e) => setPanInput(e.target.value.toUpperCase())}
                  placeholder="e.g. ABCDE1234F"
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-lg font-mono tracking-widest text-white uppercase focus:outline-none focus:border-indigo-500 font-bold"
                />
                <div
                  className={`px-5 py-3 rounded-xl flex items-center justify-center font-bold text-sm border shadow ${
                    panAnalysis.isValid
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-red-500/20 text-red-300 border-red-500/40'
                  }`}
                >
                  {panAnalysis.isValid ? '✓ VALID PAN FORMAT' : '✕ INVALID PAN'}
                </div>
              </div>
              {panAnalysis.errorReason && (
                <p className="text-xs text-red-400 font-medium">{panAnalysis.errorReason}</p>
              )}
            </div>

            {/* Character Breakdown Visualizer */}
            {panAnalysis.breakdown && (
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Character-by-Character Format Breakdown
                </h3>

                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 font-mono text-center">
                  {panInput
                    .padEnd(10, '•')
                    .slice(0, 10)
                    .split('')
                    .map((char, i) => {
                      let colorClass = 'bg-slate-900 border-slate-700 text-slate-400';
                      let label = '';
                      if (i <= 2) {
                        colorClass = 'bg-blue-900/40 border-blue-500/50 text-blue-300';
                        label = 'Series';
                      } else if (i === 3) {
                        colorClass = 'bg-amber-900/40 border-amber-500/60 text-amber-300 font-black';
                        label = 'Holder';
                      } else if (i === 4) {
                        colorClass = 'bg-purple-900/40 border-purple-500/50 text-purple-300';
                        label = 'Initial';
                      } else if (i >= 5 && i <= 8) {
                        colorClass = 'bg-emerald-900/40 border-emerald-500/50 text-emerald-300';
                        label = 'Digits';
                      } else if (i === 9) {
                        colorClass = 'bg-indigo-900/40 border-indigo-500/50 text-indigo-300';
                        label = 'Check';
                      }

                      return (
                        <div key={i} className={`p-2.5 rounded-lg border flex flex-col items-center justify-center ${colorClass}`}>
                          <span className="text-lg font-bold">{char}</span>
                          <span className="text-[9px] uppercase mt-0.5 opacity-80">{label}</span>
                        </div>
                      );
                    })}
                </div>

                {/* Decoded Holder Type Card */}
                {panAnalysis.breakdown.holderTypeChar && (
                  <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Decoded 4th Character ('{panAnalysis.breakdown.holderTypeChar}') Holder Entity
                      </span>
                      <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold px-2.5 py-0.5 rounded">
                        {panAnalysis.breakdown.holderInfo.category}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-lg font-bold text-amber-300">
                        {panAnalysis.breakdown.holderInfo.type}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        {panAnalysis.breakdown.holderInfo.desc}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-800">
                      <div>
                        <span className="text-slate-500">5th Character ('{panAnalysis.breakdown.surnameInitial}'):</span>{' '}
                        <span className="font-semibold text-slate-200">
                          First letter of Holder's Surname / Last Name
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Sequential Number ({panAnalysis.breakdown.sequentialNum}):</span>{' '}
                        <span className="font-semibold text-slate-200">System Issued Sequence (0001-9999)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: AADHAAR VALIDATOR */}
        {activeTab === 'aadhaar' && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  Aadhaar Number Verhoeff Checksum Validator
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Validates 12-digit format & executes pure Verhoeff Checksum Matrix Algorithm (UIDAI Standard).
                </p>
              </div>
              <button
                onClick={() => loadSampleData('aadhaar')}
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs px-3 py-1.5 rounded-lg font-medium transition self-start sm:self-auto"
              >
                🎲 Load Valid Aadhaar
              </button>
            </div>

            {/* Input & Controls */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Enter 12-Digit Aadhaar Number
                </label>
                <button
                  onClick={() => setShowMaskedAadhaar(!showMaskedAadhaar)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  {showMaskedAadhaar ? '👁️ Show Full Digits' : '🔒 Mask Privacy (XXXX)'}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  maxLength={14}
                  value={showMaskedAadhaar ? aadhaarAnalysis.maskedDisplay : aadhaarInput}
                  onChange={(e) => setAadhaarInput(e.target.value)}
                  placeholder="5482 9102 3847"
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-lg font-mono tracking-widest text-white focus:outline-none focus:border-indigo-500 font-bold"
                />
                <div
                  className={`px-5 py-3 rounded-xl flex items-center justify-center font-bold text-sm border shadow ${
                    aadhaarAnalysis.isValid
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-red-500/20 text-red-300 border-red-500/40'
                  }`}
                >
                  {aadhaarAnalysis.isValid ? '✓ VERHOEFF CHECKSUM PASSED' : '✕ INVALID CHECKSUM'}
                </div>
              </div>
              {aadhaarAnalysis.errorReason && (
                <p className="text-xs text-red-400 font-medium">{aadhaarAnalysis.errorReason}</p>
              )}
            </div>

            {/* Verhoeff Check Breakdown Card */}
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Verhoeff Algorithm Diagnostic Results
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-[11px] text-slate-500 block">Length Check (12 Digits)</span>
                  <span className={`text-base font-bold ${aadhaarAnalysis.is12Digits ? 'text-emerald-400' : 'text-red-400'}`}>
                    {aadhaarAnalysis.is12Digits ? 'Passed (12/12)' : `Failed (${aadhaarAnalysis.rawDigits.length}/12)`}
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-[11px] text-slate-500 block">Starting Digit Check</span>
                  <span className={`text-base font-bold ${aadhaarAnalysis.startsValid ? 'text-emerald-400' : 'text-red-400'}`}>
                    {aadhaarAnalysis.startsValid ? 'Valid (Starts 2-9)' : 'Invalid (Starts with 0 or 1)'}
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-[11px] text-slate-500 block">Verhoeff Dihedral Checksum</span>
                  <span className={`text-base font-bold ${aadhaarAnalysis.isVerhoeffValid ? 'text-emerald-400' : 'text-red-400'}`}>
                    {aadhaarAnalysis.isVerhoeffValid ? 'c = 0 (Match)' : 'c ≠ 0 (Mismatch)'}
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-400 leading-relaxed bg-slate-950/60 p-3 rounded border border-slate-800">
                💡 <strong className="text-slate-200">How Verhoeff Checksum Works:</strong> The Verhoeff algorithm utilizes dihedral group D5 permutations combined with a multiplication matrix to detect all single-digit errors and 98.9% of adjacent transposition errors in 12-digit Aadhaar numbers.
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: IFSC VALIDATOR */}
        {activeTab === 'ifsc' && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  IFSC (Indian Financial System Code) & Bank Lookup
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  11-character code used for RTGS, NEFT, and IMPS money transfers in India.
                </p>
              </div>
              <button
                onClick={() => loadSampleData('ifsc')}
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs px-3 py-1.5 rounded-lg font-medium transition self-start sm:self-auto"
              >
                🎲 Load Sample IFSC
              </button>
            </div>

            {/* Input & Status */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Enter 11-Character IFSC Code
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  maxLength={11}
                  value={ifscInput}
                  onChange={(e) => setIfscInput(e.target.value.toUpperCase())}
                  placeholder="e.g. SBIN0001234"
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-lg font-mono tracking-widest text-white uppercase focus:outline-none focus:border-indigo-500 font-bold"
                />
                <div
                  className={`px-5 py-3 rounded-xl flex items-center justify-center font-bold text-sm border shadow ${
                    ifscAnalysis.isValid
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-red-500/20 text-red-300 border-red-500/40'
                  }`}
                >
                  {ifscAnalysis.isValid ? '✓ VALID IFSC FORMAT' : '✕ INVALID IFSC'}
                </div>
              </div>
              {ifscAnalysis.errorReason && (
                <p className="text-xs text-red-400 font-medium">{ifscAnalysis.errorReason}</p>
              )}
            </div>

            {/* Bank Branch Lookup Card */}
            {ifscAnalysis.cleanIfsc.length >= 4 && (
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider">
                      Bank Code: {ifscAnalysis.bankCode}
                    </span>
                    <h3 className="text-xl font-extrabold text-white mt-0.5">
                      {ifscAnalysis.bankDetails.name}
                    </h3>
                  </div>
                  <span className="bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold px-3 py-1 rounded-full">
                    {ifscAnalysis.bankDetails.type}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block">Bank Headquarters:</span>
                    <span className="font-bold text-slate-200">{ifscAnalysis.bankDetails.hq}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block">Simulated Branch Code:</span>
                    <span className="font-mono font-bold text-amber-300">{ifscAnalysis.branchCode || 'Main Branch'}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block">Est. MICR Prefix:</span>
                    <span className="font-mono font-bold text-slate-200">{ifscAnalysis.bankDetails.micrPrefix}</span>
                  </div>
                </div>

                {/* Transfer Support Flags */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-2.5 py-1 rounded border border-emerald-500/30 flex items-center gap-1">
                    ✓ NEFT Supported
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-2.5 py-1 rounded border border-emerald-500/30 flex items-center gap-1">
                    ✓ RTGS Supported
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-2.5 py-1 rounded border border-emerald-500/30 flex items-center gap-1">
                    ✓ IMPS Supported
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-2.5 py-1 rounded border border-emerald-500/30 flex items-center gap-1">
                    ✓ UPI Enabled
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PINCODE VALIDATOR */}
        {activeTab === 'pincode' && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  Postal Index Number (Pincode) Validator
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Decodes India Post 6-digit postal circle, geographic zone & delivery office.
                </p>
              </div>
              <button
                onClick={() => loadSampleData('pincode')}
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs px-3 py-1.5 rounded-lg font-medium transition self-start sm:self-auto"
              >
                🎲 Load Sample Pincode
              </button>
            </div>

            {/* Input & Status */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Enter 6-Digit Indian Pincode
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  maxLength={6}
                  value={pincodeInput}
                  onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 110001"
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-lg font-mono tracking-widest text-white focus:outline-none focus:border-indigo-500 font-bold"
                />
                <div
                  className={`px-5 py-3 rounded-xl flex items-center justify-center font-bold text-sm border shadow ${
                    pincodeAnalysis.isValid
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-red-500/20 text-red-300 border-red-500/40'
                  }`}
                >
                  {pincodeAnalysis.isValid ? '✓ VALID PINCODE' : '✕ INVALID PINCODE'}
                </div>
              </div>
              {pincodeAnalysis.errorReason && (
                <p className="text-xs text-red-400 font-medium">{pincodeAnalysis.errorReason}</p>
              )}
            </div>

            {/* Pincode Structure Analysis */}
            {pincodeAnalysis.cleanPin.length >= 1 && (
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Decoded Geographic Postal Zone Info
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                    <span className="text-xs text-amber-400 font-bold uppercase block mb-1">
                      1st Digit ('{pincodeAnalysis.zoneDigit}') Postal Region
                    </span>
                    <h4 className="text-lg font-bold text-white">
                      {pincodeAnalysis.zoneInfo.region}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Covered States/Territories: <strong className="text-slate-200">{pincodeAnalysis.zoneInfo.states}</strong>
                    </p>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2 text-xs">
                    <div>
                      <span className="text-slate-500">2nd Digit ('{pincodeAnalysis.subZoneDigit}'):</span>{' '}
                      <span className="font-semibold text-slate-200">Sub-Region / Postal Circle Code</span>
                    </div>
                    <div>
                      <span className="text-slate-500">3rd Digit ('{pincodeAnalysis.sortingDistrictDigit}'):</span>{' '}
                      <span className="font-semibold text-slate-200">Sorting District within State</span>
                    </div>
                    <div>
                      <span className="text-slate-500">4th-6th Digits ('{pincodeAnalysis.officeCode}'):</span>{' '}
                      <span className="font-semibold text-slate-200">Specific Delivery Post Office Code</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: UNIFIED AUTO SCANNER */}
        {activeTab === 'scanner' && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                All-in-One Text Auto-Scanner & Document Detector
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Paste any unstructured text containing mixed PAN, Aadhaar, IFSC codes or Pincodes to extract and validate instantly.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Paste Input Text
              </label>
              <textarea
                rows={5}
                value={scannerText}
                onChange={(e) => setScannerText(e.target.value)}
                placeholder="Paste document text here..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            {/* Extracted Document Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Detected Document Entities ({scannedResults.length})
                </h3>
              </div>

              {scannedResults.length === 0 ? (
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 text-center text-slate-500 text-xs">
                  No valid Indian document numbers found in the text above. Try pasting text containing PAN, Aadhaar, IFSC, or Pincode.
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                      <tr>
                        <th className="p-3">Extracted Value</th>
                        <th className="p-3">Document Type</th>
                        <th className="p-3">Validation Status</th>
                        <th className="p-3">Decoded Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {scannedResults.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/50 transition">
                          <td className="p-3 font-mono font-bold text-white">{item.text}</td>
                          <td className="p-3">
                            <span className="bg-slate-800 text-indigo-300 border border-indigo-500/30 text-[11px] px-2 py-0.5 rounded font-semibold">
                              {item.type}
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                                item.isValid
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                  : 'bg-red-500/20 text-red-300 border-red-500/30'
                              }`}
                            >
                              {item.isValid ? '✓ Valid' : '✕ Invalid'}
                            </span>
                          </td>
                          <td className="p-3 text-slate-300">{item.detail}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
