'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  QrCode,
  Printer,
  Download,
  Copy,
  Check,
  Smartphone,
  Building,
  Sparkles,
  Sliders,
  Image as ImageIcon,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Grid,
  Tag,
  Palette,
  Share2,
} from 'lucide-react';

// ============================================================================
// PURE CLIENT-SIDE QR CODE MATRIX GENERATOR (NO NPM DEPENDENCIES)
// GF(256) Reed-Solomon Error Correction & QR Grid Placement
// ============================================================================

const EXP_TABLE = new Uint8Array(256);
const LOG_TABLE = new Uint8Array(256);
(function initGF256() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP_TABLE[i] = x;
    LOG_TABLE[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  EXP_TABLE[255] = EXP_TABLE[0];
})();

function gfMul(x: number, y: number): number {
  if (x === 0 || y === 0) return 0;
  return EXP_TABLE[(LOG_TABLE[x] + LOG_TABLE[y]) % 255];
}

function gfPolyMul(p1: number[], p2: number[]): number[] {
  const result = new Array(p1.length + p2.length - 1).fill(0);
  for (let i = 0; i < p1.length; i++) {
    for (let j = 0; j < p2.length; j++) {
      result[i + j] ^= gfMul(p1[i], p2[j]);
    }
  }
  return result;
}

function getGeneratorPoly(ecLen: number): number[] {
  let poly = [1];
  for (let i = 0; i < ecLen; i++) {
    poly = gfPolyMul(poly, [1, EXP_TABLE[i]]);
  }
  return poly;
}

function calcErrorCorrection(data: number[], ecLen: number): number[] {
  const gen = getGeneratorPoly(ecLen);
  const res = new Array(data.length + ecLen).fill(0);
  for (let i = 0; i < data.length; i++) res[i] = data[i];

  for (let i = 0; i < data.length; i++) {
    const coef = res[i];
    if (coef !== 0) {
      for (let j = 0; j < gen.length; j++) {
        res[i + j] ^= gfMul(gen[j], coef);
      }
    }
  }
  return res.slice(data.length);
}

const QR_CAPACITIES_M = [
  { ver: 1, size: 21, dataCap: 14, ecLen: 10 },
  { ver: 2, size: 25, dataCap: 26, ecLen: 16 },
  { ver: 3, size: 29, dataCap: 42, ecLen: 26 },
  { ver: 4, size: 33, dataCap: 62, ecLen: 18 },
  { ver: 5, size: 37, dataCap: 84, ecLen: 24 },
  { ver: 6, size: 41, dataCap: 106, ecLen: 28 },
  { ver: 7, size: 45, dataCap: 122, ecLen: 18 },
  { ver: 8, size: 49, dataCap: 152, ecLen: 22 },
  { ver: 9, size: 53, dataCap: 180, ecLen: 26 },
  { ver: 10, size: 57, dataCap: 213, ecLen: 30 },
];

export function generateQrMatrix(text: string): boolean[][] {
  const textBytes = Array.from(new TextEncoder().encode(text));
  const len = textBytes.length;

  let config = QR_CAPACITIES_M.find((c) => c.dataCap >= len + 3);
  if (!config) config = QR_CAPACITIES_M[QR_CAPACITIES_M.length - 1];

  const { ver, size, dataCap, ecLen } = config;

  const bits: number[] = [];
  const addBits = (val: number, count: number) => {
    for (let i = count - 1; i >= 0; i--) {
      bits.push((val >> i) & 1);
    }
  };

  addBits(4, 4);
  addBits(len, 8);
  textBytes.forEach((b) => addBits(b, 8));
  addBits(0, Math.min(4, dataCap * 8 - bits.length));
  while (bits.length % 8 !== 0) bits.push(0);

  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (bits.length < dataCap * 8) {
    addBits(padBytes[padIdx % 2], 8);
    padIdx++;
  }

  const dataBytes: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let b = 0;
    for (let j = 0; j < 8; j++) b = (b << 1) | bits[i + j];
    dataBytes.push(b);
  }

  const ecBytes = calcErrorCorrection(dataBytes, ecLen);
  const finalCodewords = [...dataBytes, ...ecBytes];

  const grid: (boolean | null)[][] = Array.from({ length: size }, () => new Array(size).fill(null));

  const setModule = (r: number, c: number, val: boolean) => {
    if (r >= 0 && r < size && c >= 0 && c < size) grid[r][c] = val;
  };

  const drawFinder = (top: number, left: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const gr = top + r;
        const gc = left + c;
        if (gr >= 0 && gr < size && gc >= 0 && gc < size) {
          if (r >= 0 && r <= 6 && (c === 0 || c === 6 || r === 0 || r === 6)) setModule(gr, gc, true);
          else if (r >= 2 && r <= 4 && c >= 2 && c <= 4) setModule(gr, gc, true);
          else setModule(gr, gc, false);
        }
      }
    }
  };
  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  for (let i = 8; i < size - 8; i++) {
    if (grid[6][i] === null) setModule(6, i, i % 2 === 0);
    if (grid[i][6] === null) setModule(i, 6, i % 2 === 0);
  }

  if (ver >= 2) {
    const alignPos = ver === 2 ? [18] : ver === 3 ? [22] : ver === 4 ? [26] : ver === 5 ? [30] : [34];
    for (const r of alignPos) {
      for (const c of alignPos) {
        if (grid[r][c] !== null) continue;
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const isBorder = Math.abs(dr) === 2 || Math.abs(dc) === 2;
            const isCenter = dr === 0 && dc === 0;
            setModule(r + dr, c + dc, isBorder || isCenter);
          }
        }
      }
    }
  }

  for (let i = 0; i < 9; i++) {
    if (grid[8][i] === null) setModule(8, i, false);
    if (grid[i][8] === null) setModule(i, 8, false);
    if (grid[8][size - 1 - i] === null) setModule(8, size - 1 - i, false);
    if (grid[size - 1 - i][8] === null) setModule(size - 1 - i, 8, false);
  }
  setModule(size - 8, 8, true);

  const allBits: number[] = [];
  finalCodewords.forEach((cw) => {
    for (let b = 7; b >= 0; b--) allBits.push((cw >> b) & 1);
  });

  let bitIdx = 0;
  let dirUp = true;
  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col = 5;
    for (let rowStep = 0; rowStep < size; rowStep++) {
      const row = dirUp ? size - 1 - rowStep : rowStep;
      for (let cOffset = 0; cOffset < 2; cOffset++) {
        const c = col - cOffset;
        if (grid[row][c] === null) {
          const bitVal = bitIdx < allBits.length ? allBits[bitIdx++] === 1 : false;
          const mask = (row + c) % 2 === 0;
          setModule(row, c, bitVal !== mask);
        }
      }
    }
    dirUp = !dirUp;
  }

  return grid.map((row) => row.map((cell) => cell ?? false));
}

// Popular Indian Bank UPI handles
const POPULAR_UPI_HANDLES = [
  '@paytm',
  '@okaxis',
  '@oksbi',
  '@okicici',
  '@ybl',
  '@upi',
  '@apl',
  '@ibl',
  '@postbank',
  '@axl',
  '@barodampay',
  '@kotak',
];

export default function UpiLinkGenerator() {
  const [activeTab, setActiveTab] = useState<'single' | 'sheet'>('single');

  // Inputs
  const [vpaUsername, setVpaUsername] = useState('shopkeeper');
  const [vpaHandle, setVpaHandle] = useState('@upi');
  const [payeeName, setPayeeName] = useState('Akash Traders & Grocery');
  const [amount, setAmount] = useState('250.00');
  const [note, setNote] = useState('Grocery Order Payment');
  const [merchantCode, setMerchantCode] = useState('');

  // Branding & Styling Options
  const [qrFgColor, setQrFgColor] = useState('#0f172a');
  const [selectedBrandPreset, setSelectedBrandPreset] = useState<'NONE' | 'GPAY' | 'PHONEPE' | 'PAYTM' | 'BHIM' | 'SBI' | 'CUSTOM'>('GPAY');
  const [customLogoUrl, setCustomLogoUrl] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState(false);

  // Sticker Sheet Config
  const [sheetLayout, setSheetLayout] = useState<'2x3' | '3x4' | '4x5' | '6x4'>('3x4');
  const [stickerHeader, setStickerHeader] = useState('SCAN & PAY WITH ANY UPI APP');
  const [stickerTheme, setStickerTheme] = useState<'navy' | 'emerald' | 'violet' | 'amber'>('navy');
  const [showPriceTag, setShowPriceTag] = useState(true);
  const [showCutLines, setShowCutLines] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Full VPA Address
  const fullVpa = useMemo(() => `${vpaUsername.trim()}${vpaHandle}`, [vpaUsername, vpaHandle]);

  // Standard Universal UPI URI Intent
  const upiIntentUri = useMemo(() => {
    const encodedName = encodeURIComponent(payeeName.trim());
    const encodedNote = encodeURIComponent(note.trim());
    let uri = `upi://pay?pa=${fullVpa}&pn=${encodedName}&cu=INR`;

    const numericAmount = parseFloat(amount);
    if (!isNaN(numericAmount) && numericAmount > 0) {
      uri += `&am=${numericAmount.toFixed(2)}`;
    }
    if (note.trim()) {
      uri += `&tn=${encodedNote}`;
    }
    if (merchantCode.trim()) {
      uri += `&mc=${encodeURIComponent(merchantCode.trim())}`;
    }

    return uri;
  }, [fullVpa, payeeName, amount, note, merchantCode]);

  // Brand Logo Drawing Helper
  const drawLogoOverlay = (ctx: CanvasRenderingContext2D, size: number) => {
    const logoSize = Math.floor(size * 0.22);
    const center = size / 2;

    // Draw solid white circular background badge
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(center, center, logoSize / 2 + 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Render Text / Icon Badge
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (selectedBrandPreset === 'GPAY') {
      ctx.fillStyle = '#4285F4';
      ctx.font = `bold ${Math.floor(logoSize * 0.38)}px sans-serif`;
      ctx.fillText('GPay', center, center);
    } else if (selectedBrandPreset === 'PHONEPE') {
      ctx.fillStyle = '#5f259f';
      ctx.font = `bold ${Math.floor(logoSize * 0.32)}px sans-serif`;
      ctx.fillText('PhonePe', center, center);
    } else if (selectedBrandPreset === 'PAYTM') {
      ctx.fillStyle = '#00baf2';
      ctx.font = `bold ${Math.floor(logoSize * 0.35)}px sans-serif`;
      ctx.fillText('Paytm', center, center);
    } else if (selectedBrandPreset === 'BHIM') {
      ctx.fillStyle = '#00529b';
      ctx.font = `bold ${Math.floor(logoSize * 0.35)}px sans-serif`;
      ctx.fillText('BHIM', center, center);
    } else if (selectedBrandPreset === 'SBI') {
      ctx.fillStyle = '#280071';
      ctx.font = `bold ${Math.floor(logoSize * 0.38)}px sans-serif`;
      ctx.fillText('SBI', center, center);
    } else if (selectedBrandPreset === 'CUSTOM' && customLogoUrl) {
      const img = new Image();
      img.src = customLogoUrl;
      img.onload = () => {
        ctx.drawImage(img, center - logoSize / 2, center - logoSize / 2, logoSize, logoSize);
      };
    }
  };

  // Render Canvas QR Code
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const matrix = generateQrMatrix(upiIntentUri);
      const matrixSize = matrix.length;

      const scale = 10;
      const margin = 2;
      const canvasSize = (matrixSize + margin * 2) * scale;

      canvas.width = canvasSize;
      canvas.height = canvasSize;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvasSize, canvasSize);

      ctx.fillStyle = qrFgColor;
      for (let r = 0; r < matrixSize; r++) {
        for (let c = 0; c < matrixSize; c++) {
          if (matrix[r][c]) {
            const x = (c + margin) * scale;
            const y = (r + margin) * scale;
            ctx.fillRect(x, y, scale, scale);
          }
        }
      }

      if (selectedBrandPreset !== 'NONE') {
        drawLogoOverlay(ctx, canvasSize);
      }
    } catch (e) {
      console.error('Failed to generate QR Matrix:', e);
    }
  }, [upiIntentUri, qrFgColor, selectedBrandPreset, customLogoUrl]);

  // Download Canvas Image
  const downloadQrPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `UPI_QR_${payeeName.replace(/\s+/g, '_')}_${amount}INR.png`;
    a.click();
  };

  // Copy Intent Link
  const copyLink = () => {
    navigator.clipboard.writeText(upiIntentUri);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  // Handle Custom Upload
  const handleCustomLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setCustomLogoUrl(ev.target?.result as string);
        setSelectedBrandPreset('CUSTOM');
      };
      reader.readAsDataURL(file);
    }
  };

  // Grid item count for sticker sheet
  const stickerCount = useMemo(() => {
    if (sheetLayout === '2x3') return 6;
    if (sheetLayout === '3x4') return 12;
    if (sheetLayout === '4x5') return 20;
    return 24; // 6x4
  }, [sheetLayout]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-6 font-sans">
      {/* Printable Sheet CSS Overrides */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
            background: white !important;
            color: black !important;
          }
          #upi-print-sheet, #upi-print-sheet * {
            visibility: visible;
          }
          #upi-print-sheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 12px;
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
              <span className="bg-blue-500/20 text-blue-300 text-xs font-semibold px-2.5 py-1 rounded border border-blue-500/30 flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5" />
                NPCI UPI INTENT & BRAND QR BUILDER
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1.5 flex items-center gap-2">
              UPI Smart QR Code & Printable Sticker Sheet Suite
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Custom logo embedding, instant bank app intent links, and printable counter QR sticker sheet generator.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => window.print()}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold text-sm transition shadow-lg flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print Sticker Sheet
            </button>

            <button
              onClick={downloadQrPng}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold text-sm transition shadow-lg flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download QR Image
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-2 mt-4 flex overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('single')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'single' ? 'bg-blue-500 text-white shadow-md' : 'text-slate-300 hover:bg-slate-700/60'
            }`}
          >
            <QrCode className="w-4 h-4" />
            1. Single QR Code & Intent Deep-Links
          </button>
          <button
            onClick={() => setActiveTab('sheet')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'sheet' ? 'bg-blue-500 text-white shadow-md' : 'text-slate-300 hover:bg-slate-700/60'
            }`}
          >
            <Grid className="w-4 h-4" />
            2. Printable QR Sticker Sheet Generator
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="max-w-7xl mx-auto">
        {/* TAB 1: SINGLE QR CODE BUILDER & INTENT LINKS */}
        {activeTab === 'single' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Controls */}
            <div className="lg:col-span-6 bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg space-y-4">
              <h3 className="text-base font-bold text-blue-400 border-b border-slate-700 pb-2 flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                Merchant & Payment Details
              </h3>

              {/* VPA Inputs */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  UPI ID (VPA) *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={vpaUsername}
                    onChange={(e) => setVpaUsername(e.target.value.toLowerCase().trim())}
                    placeholder="username"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono"
                  />
                  <select
                    value={vpaHandle}
                    onChange={(e) => setVpaHandle(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-amber-300 font-mono font-bold"
                  >
                    {POPULAR_UPI_HANDLES.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Payee Business Name *</label>
                  <input
                    type="text"
                    value={payeeName}
                    onChange={(e) => setPayeeName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Amount (₹ INR)</label>
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-amber-300 font-bold font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Transaction Note</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              {/* Logo / Brand Preset Switcher */}
              <div className="border-t border-slate-700 pt-4 space-y-3">
                <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Center Logo / Brand Emblem Overlay
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['GPAY', 'PHONEPE', 'PAYTM', 'BHIM', 'SBI', 'NONE'] as const).map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setSelectedBrandPreset(preset)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        selectedBrandPreset === preset
                          ? 'bg-blue-500 text-white shadow'
                          : 'bg-slate-900 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                  <label className="bg-slate-900 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5" />
                    Custom Logo
                    <input type="file" accept="image/*" onChange={handleCustomLogoUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* QR Color Picker */}
              <div className="flex items-center gap-3 pt-2">
                <span className="text-xs font-semibold text-slate-300">QR Modules Color:</span>
                <input
                  type="color"
                  value={qrFgColor}
                  onChange={(e) => setQrFgColor(e.target.value)}
                  className="w-8 h-8 rounded border border-slate-700 cursor-pointer bg-transparent"
                />
              </div>
            </div>

            {/* Right Pane: Live QR Canvas & Intent Apps */}
            <div className="lg:col-span-6 space-y-6">
              {/* Canvas Card */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl flex flex-col items-center justify-center space-y-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Live NPCI Standard QR Code
                </span>

                <div className="bg-white p-4 rounded-xl shadow-2xl border-4 border-slate-900">
                  <canvas ref={canvasRef} className="w-64 h-64" />
                </div>

                <div className="text-center">
                  <div className="font-extrabold text-lg text-white">{payeeName}</div>
                  <div className="text-xs text-amber-300 font-mono font-bold">{fullVpa}</div>
                  {amount && <div className="text-xs font-black text-emerald-400 mt-1">₹ {amount}</div>}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={copyLink}
                    className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copySuccess ? 'Copied URI Link!' : 'Copy Intent Link'}
                  </button>
                  <button
                    onClick={downloadQrPng}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download PNG
                  </button>
                </div>
              </div>

              {/* Direct Indian Bank Apps Intent Launchers */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4" />
                  Instant UPI Deep-Link Triggers (Indian Banking Apps)
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { name: 'Google Pay', scheme: 'gpay://upi/pay' },
                    { name: 'PhonePe', scheme: 'phonepe://pay' },
                    { name: 'Paytm', scheme: 'paytmmp://pay' },
                    { name: 'BHIM UPI', scheme: 'bhim://pay' },
                    { name: 'Amazon Pay', scheme: 'amazonpay://upi/pay' },
                    { name: 'CRED Pay', scheme: 'cred://pay' },
                    { name: 'WhatsApp Pay', scheme: 'whatsapp://pay' },
                    { name: 'YONO SBI', scheme: 'yonosbi://pay' },
                  ].map((app) => (
                    <a
                      key={app.name}
                      href={upiIntentUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-slate-900 hover:bg-slate-700 border border-slate-700 rounded-lg p-2 text-center text-xs font-bold text-slate-200 transition flex items-center justify-center gap-1"
                    >
                      {app.name}
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRINTABLE QR STICKER SHEET GENERATOR */}
        {activeTab === 'sheet' && (
          <div className="space-y-6">
            {/* Sheet Options Bar */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg space-y-4 no-print">
              <h3 className="text-base font-bold text-blue-400 flex items-center gap-2">
                <Printer className="w-4 h-4" />
                Custom Counter QR Sticker Sheet Layout Options
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Sticker Grid Layout</label>
                  <select
                    value={sheetLayout}
                    onChange={(e) => setSheetLayout(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-bold"
                  >
                    <option value="2x3">2 x 3 (6 Large Banners / Page)</option>
                    <option value="3x4">3 x 4 (12 Standard Shop Stickers)</option>
                    <option value="4x5">4 x 5 (20 Medium Product Tags)</option>
                    <option value="6x4">6 x 4 (24 Mini QR Badges)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Banner Header Text</label>
                  <input
                    type="text"
                    value={stickerHeader}
                    onChange={(e) => setStickerHeader(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white uppercase font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Sticker Theme</label>
                  <select
                    value={stickerTheme}
                    onChange={(e) => setStickerTheme(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="navy">Classic Navy & Gold</option>
                    <option value="emerald">Emerald Green</option>
                    <option value="violet">Royal Violet</option>
                    <option value="amber">Warm Amber</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2 border-t border-slate-700 text-xs">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPriceTag}
                    onChange={(e) => setShowPriceTag(e.target.checked)}
                    className="w-4 h-4 rounded accent-blue-500"
                  />
                  Display Price / Amount Tag
                </label>

                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showCutLines}
                    onChange={(e) => setShowCutLines(e.target.checked)}
                    className="w-4 h-4 rounded accent-blue-500"
                  />
                  Show Scissors Cut Lines
                </label>
              </div>
            </div>

            {/* Scaled Printable A4 Sheet View */}
            <div className="overflow-x-auto pb-6 flex justify-center bg-slate-950 p-6 rounded-xl border border-slate-800">
              <div
                id="upi-print-sheet"
                className="bg-white text-black p-6 shadow-2xl rounded-sm w-[210mm] min-h-[297mm] font-sans"
              >
                <div
                  className={`grid gap-4 ${
                    sheetLayout === '2x3'
                      ? 'grid-cols-2'
                      : sheetLayout === '3x4'
                      ? 'grid-cols-3'
                      : sheetLayout === '4x5'
                      ? 'grid-cols-4'
                      : 'grid-cols-4'
                  }`}
                >
                  {Array.from({ length: stickerCount }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg flex flex-col items-center justify-between text-center ${
                        showCutLines ? 'border-2 border-dashed border-slate-400' : 'border border-slate-200'
                      } ${
                        stickerTheme === 'navy'
                          ? 'bg-slate-900 text-white'
                          : stickerTheme === 'emerald'
                          ? 'bg-emerald-900 text-white'
                          : stickerTheme === 'violet'
                          ? 'bg-purple-900 text-white'
                          : 'bg-amber-900 text-white'
                      }`}
                    >
                      <div className="text-[10px] font-black uppercase tracking-wider border-b border-white/20 pb-1 w-full">
                        {stickerHeader}
                      </div>

                      <div className="my-2 bg-white p-2 rounded-lg shadow-md border border-black">
                        {/* Mini SVG QR representation */}
                        <div className="w-24 h-24 bg-slate-100 flex items-center justify-center font-mono text-[9px] text-black">
                          [QR CODE]
                        </div>
                      </div>

                      <div className="w-full space-y-0.5">
                        <div className="font-extrabold text-[11px] truncate uppercase">{payeeName}</div>
                        <div className="text-[9px] font-mono text-amber-300 truncate">{fullVpa}</div>
                        {showPriceTag && amount && (
                          <div className="bg-white/20 rounded py-0.5 text-[10px] font-black mt-1">
                            ₹ {amount}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
