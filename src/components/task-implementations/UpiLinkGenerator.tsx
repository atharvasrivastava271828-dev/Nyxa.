'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';

// ============================================================================
// PURE CLIENT-SIDE QR CODE MATRIX GENERATOR (NO NPM DEPENDENCIES)
// GF(256) Reed-Solomon Error Correction & QR Grid Placement
// ============================================================================

// GF(256) Log & Exp tables for Galois Field arithmetic (Primitive Poly: 0x11D = 285)
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

// Version capacities (Byte mode, Level M)
// V1: 14 bytes, V2: 26, V3: 42, V4: 62, V5: 84, V6: 106, V7: 122, V8: 152, V9: 180, V10: 213
const QR_CAPACITIES_M = [
  { ver: 1, size: 21, dataCap: 14, ecLen: 10 },
  { ver: 2, size: 25, dataCap: 26, ecLen: 16 },
  { ver: 3, size: 29, dataCap: 42, ecLen: 26 },
  { ver: 4, size: 33, dataCap: 62, ecLen: 18 }, // 2 blocks
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

  // Pick suitable version
  let config = QR_CAPACITIES_M.find((c) => c.dataCap >= len + 3);
  if (!config) config = QR_CAPACITIES_M[QR_CAPACITIES_M.length - 1];

  const { ver, size, dataCap, ecLen } = config;

  // Build BitStream
  const bits: number[] = [];
  const addBits = (val: number, count: number) => {
    for (let i = count - 1; i >= 0; i--) {
      bits.push((val >> i) & 1);
    }
  };

  // 1. Byte Mode Indicator (0100)
  addBits(4, 4);
  // 2. Character Count Indicator (8 bits for V1-9)
  addBits(len, 8);
  // 3. Data bytes
  textBytes.forEach((b) => addBits(b, 8));
  // 4. Terminator (up to 4 zeros)
  addBits(0, Math.min(4, dataCap * 8 - bits.length));
  // 5. Align to byte boundary
  while (bits.length % 8 !== 0) bits.push(0);

  // 6. Pad Bytes
  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (bits.length < dataCap * 8) {
    addBits(padBytes[padIdx % 2], 8);
    padIdx++;
  }

  // Convert bits to byte data array
  const dataBytes: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let b = 0;
    for (let j = 0; j < 8; j++) b = (b << 1) | bits[i + j];
    dataBytes.push(b);
  }

  // Compute EC codewords
  const ecBytes = calcErrorCorrection(dataBytes, ecLen);
  const finalCodewords = [...dataBytes, ...ecBytes];

  // Grid Matrix
  const grid: (boolean | null)[][] = Array.from({ length: size }, () => new Array(size).fill(null));

  // Helper: set module
  const setModule = (r: number, c: number, val: boolean) => {
    if (r >= 0 && r < size && c >= 0 && c < size) grid[r][c] = val;
  };

  // 1. Finder Patterns (7x7) at 3 corners
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

  // 2. Timing Patterns
  for (let i = 8; i < size - 8; i++) {
    if (grid[6][i] === null) setModule(6, i, i % 2 === 0);
    if (grid[i][6] === null) setModule(i, 6, i % 2 === 0);
  }

  // 3. Alignment Patterns for Version >= 2
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

  // 4. Reserve Format Info Area
  for (let i = 0; i < 9; i++) {
    if (grid[8][i] === null) setModule(8, i, false);
    if (grid[i][8] === null) setModule(i, 8, false);
    if (grid[8][size - 1 - i] === null) setModule(8, size - 1 - i, false);
    if (grid[size - 1 - i][8] === null) setModule(size - 1 - i, 8, false);
  }
  setModule(size - 8, 8, true); // Dark module

  // 5. Place Data Bits in Zig-Zag pattern
  const allBits: number[] = [];
  finalCodewords.forEach((cw) => {
    for (let b = 7; b >= 0; b--) allBits.push((cw >> b) & 1);
  });

  let bitIdx = 0;
  let dirUp = true;
  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col = 5; // Skip timing column
    for (let rowStep = 0; rowStep < size; rowStep++) {
      const row = dirUp ? size - 1 - rowStep : rowStep;
      for (let cOffset = 0; cOffset < 2; cOffset++) {
        const c = col - cOffset;
        if (grid[row][c] === null) {
          const bitVal = bitIdx < allBits.length ? allBits[bitIdx++] === 1 : false;
          // Apply standard mask (Pattern 0: (row + col) % 2 === 0)
          const mask = (row + c) % 2 === 0;
          setModule(row, c, bitVal !== mask);
        }
      }
    }
    dirUp = !dirUp;
  }

  // Convert to boolean grid (null -> false)
  return grid.map((row) => row.map((cell) => cell ?? false));
}

// Popular Indian Bank UPI handles list
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

export interface SavedUpiPreset {
  id: string;
  vpa: string;
  payeeName: string;
  amount: string;
  note: string;
  timestamp: string;
}

export default function UpiLinkGenerator() {
  // Input State
  const [vpaUsername, setVpaUsername] = useState('shopkeeper');
  const [vpaHandle, setVpaHandle] = useState('@upi');
  const [payeeName, setPayeeName] = useState('Akash Traders');
  const [amount, setAmount] = useState('250.00');
  const [note, setNote] = useState('Grocery Order');
  const [merchantCode, setMerchantCode] = useState('');
  const [refId, setRefId] = useState('');

  // Styling & Customization State
  const [qrFgColor, setQrFgColor] = useState('#0f172a'); // slate-900
  const [qrBgColor, setQrBgColor] = useState('#ffffff');
  const [includeEmblem, setIncludeEmblem] = useState(true);

  // Saved Presets History
  const [savedPresets, setSavedPresets] = useState<SavedUpiPreset[]>([
    {
      id: 'preset-1',
      vpa: 'kirana.store@paytm',
      payeeName: 'Kirana Supermarket',
      amount: '500.00',
      note: 'Monthly Supplies',
      timestamp: 'Today 10:30 AM',
    },
    {
      id: 'preset-2',
      vpa: 'coffee.house@okaxis',
      payeeName: 'Blue Tokai Cafe',
      amount: '340.00',
      note: 'Coffee & Snacks',
      timestamp: 'Yesterday',
    },
  ]);

  const [copySuccess, setCopySuccess] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Full VPA Address
  const fullVpa = useMemo(() => {
    const username = vpaUsername.trim();
    if (username.includes('@')) return username;
    return `${username}${vpaHandle}`;
  }, [vpaUsername, vpaHandle]);

  // Construct UPI Deep Link URL
  const upiDeepLink = useMemo(() => {
    const params = new URLSearchParams();
    if (fullVpa) params.append('pa', fullVpa);
    if (payeeName.trim()) params.append('pn', payeeName.trim());
    if (amount && parseFloat(amount) > 0) params.append('am', parseFloat(amount).toFixed(2));
    if (note.trim()) params.append('tn', note.trim());
    params.append('cu', 'INR');
    if (merchantCode.trim()) params.append('mc', merchantCode.trim());
    if (refId.trim()) params.append('tr', refId.trim());

    return `upi://pay?${params.toString()}`;
  }, [fullVpa, payeeName, amount, note, merchantCode, refId]);

  // Generate QR Matrix
  const qrMatrix = useMemo(() => {
    try {
      return generateQrMatrix(upiDeepLink);
    } catch (e) {
      return generateQrMatrix(`upi://pay?pa=${fullVpa}`);
    }
  }, [upiDeepLink, fullVpa]);

  // Draw Canvas for Download
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !qrMatrix.length) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const moduleCount = qrMatrix.length;
    const cellSize = 10;
    const padding = 20;
    const canvasSize = moduleCount * cellSize + padding * 2;

    canvas.width = canvasSize;
    canvas.height = canvasSize;

    // Fill Background
    ctx.fillStyle = qrBgColor;
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Fill Modules
    ctx.fillStyle = qrFgColor;
    for (let r = 0; r < moduleCount; r++) {
      for (let c = 0; c < moduleCount; c++) {
        if (qrMatrix[r][c]) {
          ctx.fillRect(padding + c * cellSize, padding + r * cellSize, cellSize, cellSize);
        }
      }
    }

    // Optional Center Emblem (₹ Badge)
    if (includeEmblem) {
      const center = canvasSize / 2;
      const badgeSize = cellSize * 5;
      ctx.fillStyle = qrBgColor;
      ctx.beginPath();
      ctx.arc(center, center, badgeSize / 2 + 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0284c7'; // sky-600
      ctx.beginPath();
      ctx.arc(center, center, badgeSize / 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('₹', center, center + 1);
    }
  }, [qrMatrix, qrFgColor, qrBgColor, includeEmblem]);

  // Action: Copy Deep Link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(upiDeepLink);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Action: WhatsApp Share
  const handleShareWhatsapp = () => {
    const message = `Payment Request via UPI\n\nPayee: ${payeeName}\nUPI ID: ${fullVpa}\nAmount: ${amount ? `₹${amount}` : 'Flexible'}\nNote: ${note || 'N/A'}\n\nClick link to pay directly with GPay/PhonePe/Paytm:\n${upiDeepLink}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Action: Download QR PNG Image
  const handleDownloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = `UPI_QR_${fullVpa.replace(/[@.]/g, '_')}.png`;
    link.click();
  };

  // Save current preset
  const saveCurrentPreset = () => {
    if (!fullVpa) return;
    const newPreset: SavedUpiPreset = {
      id: Date.now().toString(),
      vpa: fullVpa,
      payeeName: payeeName || 'Payee',
      amount: amount || '0',
      note: note || '-',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setSavedPresets((prev) => [newPreset, ...prev.slice(0, 4)]);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Title Banner */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-2.5 py-1 rounded border border-emerald-500/30">
                INSTANT PAYMENTS
              </span>
              <span className="text-xs text-slate-400">BHIM UPI • GPAY • PHONEPE • PAYTM</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              UPI Payment Link & Vector QR Code Generator
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Generate zero-fee NPCI compliant UPI payment deep links, QR codes & one-click mobile app payment triggers.
            </p>
          </div>

          <button
            onClick={saveCurrentPreset}
            className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 self-start md:self-auto border border-slate-600 shadow"
          >
            ★ Bookmark This Payment Preset
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: Input Form */}
          <div className="lg:col-span-7 bg-slate-800 border border-slate-700 rounded-xl p-5 sm:p-6 shadow-xl space-y-5">
            <h2 className="text-lg font-bold text-white border-b border-slate-700 pb-3 flex items-center justify-between">
              <span>UPI Payment Parameters</span>
              <span className="text-xs text-emerald-400 font-mono font-semibold">{fullVpa}</span>
            </h2>

            {/* VPA Builder */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Virtual Payment Address (UPI ID / VPA) *
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={vpaUsername}
                  onChange={(e) => setVpaUsername(e.target.value)}
                  placeholder="Username or Mobile"
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
                {!vpaUsername.includes('@') && (
                  <select
                    value={vpaHandle}
                    onChange={(e) => setVpaHandle(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-emerald-300 font-mono font-bold focus:outline-none focus:border-emerald-500"
                  >
                    {POPULAR_UPI_HANDLES.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Payee Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Payee Business / Individual Name *
              </label>
              <input
                type="text"
                value={payeeName}
                onChange={(e) => setPayeeName(e.target.value)}
                placeholder="e.g. Akash Traders"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-semibold"
              />
            </div>

            {/* Amount & Presets */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Requested Amount (₹ INR - Optional)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00 (Leave blank for flexible user entry)"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-base text-amber-300 font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Quick Amount Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-slate-400 mr-1">Quick Presets:</span>
                {['50', '100', '250', '500', '1000', '2000'].map((presetVal) => (
                  <button
                    key={presetVal}
                    onClick={() => setAmount(presetVal)}
                    className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs px-2.5 py-1 rounded font-semibold transition"
                  >
                    ₹{presetVal}
                  </button>
                ))}
                <button
                  onClick={() => setAmount('')}
                  className="text-slate-400 hover:text-slate-300 text-xs px-2 py-1 underline"
                >
                  Clear Amount
                </button>
              </div>
            </div>

            {/* Transaction Note */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Transaction Note / Remarks
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Dinner bill split / Order #9021"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Advanced Merchant Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-700/60">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Merchant Category Code (MCC)
                </label>
                <input
                  type="text"
                  value={merchantCode}
                  onChange={(e) => setMerchantCode(e.target.value)}
                  placeholder="e.g. 5411 (Grocery)"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Transaction Ref ID (TR)
                </label>
                <input
                  type="text"
                  value={refId}
                  onChange={(e) => setRefId(e.target.value)}
                  placeholder="e.g. TXN987123"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            {/* Customization Controls */}
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                QR Code Styling Controls
              </h3>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs text-slate-300">
                    <span>Pattern Color:</span>
                    <input
                      type="color"
                      value={qrFgColor}
                      onChange={(e) => setQrFgColor(e.target.value)}
                      className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                    />
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-300">
                    <span>Background:</span>
                    <input
                      type="color"
                      value={qrBgColor}
                      onChange={(e) => setQrBgColor(e.target.value)}
                      className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                    />
                  </label>
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={includeEmblem}
                    onChange={(e) => setIncludeEmblem(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>Show Central ₹ Emblem Badge</span>
                </label>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive QR & Action Bar */}
          <div className="lg:col-span-5 space-y-5">
            {/* Display Card */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl text-center flex flex-col items-center space-y-4">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                SCAN TO PAY VIA ANY UPI APP
              </span>

              {/* Vector SVG Render Display */}
              <div
                className="p-4 rounded-2xl shadow-2xl transition transform hover:scale-[1.02]"
                style={{ backgroundColor: qrBgColor }}
              >
                <svg
                  width="220"
                  height="220"
                  viewBox={`0 0 ${qrMatrix.length} ${qrMatrix.length}`}
                  className="mx-auto"
                >
                  {qrMatrix.map((row, r) =>
                    row.map((cell, c) =>
                      cell ? (
                        <rect
                          key={`${r}-${c}`}
                          x={c}
                          y={r}
                          width="1.02"
                          height="1.02"
                          fill={qrFgColor}
                        />
                      ) : null
                    )
                  )}
                </svg>
              </div>

              {/* Hidden Canvas for PNG Export */}
              <canvas ref={canvasRef} className="hidden" />

              {/* Payee Info Banner */}
              <div className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-left text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Paying To:</span>
                  <span className="font-bold text-white">{payeeName || 'Merchant'}</span>
                </div>
                <div className="flex justify-between items-center font-mono">
                  <span className="text-slate-400">UPI ID:</span>
                  <span className="font-semibold text-emerald-400">{fullVpa}</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-1 border-t border-slate-800 font-bold">
                  <span className="text-slate-400 text-xs">Amount:</span>
                  <span className="text-amber-300">
                    {amount && parseFloat(amount) > 0 ? `₹${parseFloat(amount).toFixed(2)}` : 'User Defined'}
                  </span>
                </div>
              </div>

              {/* Instant Action Buttons */}
              <div className="w-full grid grid-cols-2 gap-2">
                <button
                  onClick={handleCopyLink}
                  className="bg-slate-700 hover:bg-slate-600 text-white py-2.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  {copySuccess ? 'Copied Link!' : 'Copy UPI Link'}
                </button>

                <button
                  onClick={handleShareWhatsapp}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-1.146 4.189 4.289-1.124z" />
                  </svg>
                  WhatsApp Share
                </button>
              </div>

              <button
                onClick={handleDownloadPng}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download High-Res QR Image (PNG)
              </button>
            </div>

            {/* Direct App Launch Triggers */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-xl space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Direct Mobile Payment Deep Links
              </h3>
              <p className="text-[11px] text-slate-400">
                Tapping these links on a mobile device will directly launch the corresponding payment application:
              </p>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <a
                  href={upiDeepLink}
                  className="bg-slate-900 hover:bg-slate-700 border border-slate-700 text-slate-200 py-2 rounded text-center text-xs font-bold transition"
                >
                  🌐 Any UPI
                </a>
                <a
                  href={`gpay://pay?pa=${fullVpa}&pn=${encodeURIComponent(payeeName)}`}
                  className="bg-slate-900 hover:bg-slate-700 border border-slate-700 text-slate-200 py-2 rounded text-center text-xs font-bold transition"
                >
                  💙 GPay
                </a>
                <a
                  href={`phonepe://pay?pa=${fullVpa}&pn=${encodeURIComponent(payeeName)}`}
                  className="bg-slate-900 hover:bg-slate-700 border border-slate-700 text-slate-200 py-2 rounded text-center text-xs font-bold transition"
                >
                  💜 PhonePe
                </a>
                <a
                  href={`paytmmp://pay?pa=${fullVpa}&pn=${encodeURIComponent(payeeName)}`}
                  className="bg-slate-900 hover:bg-slate-700 border border-slate-700 text-slate-200 py-2 rounded text-center text-xs font-bold transition"
                >
                  🩵 Paytm
                </a>
                <a
                  href={`bhim://pay?pa=${fullVpa}&pn=${encodeURIComponent(payeeName)}`}
                  className="bg-slate-900 hover:bg-slate-700 border border-slate-700 text-slate-200 py-2 rounded text-center text-xs font-bold transition"
                >
                  🟠 BHIM
                </a>
                <a
                  href={`cred://pay?pa=${fullVpa}&pn=${encodeURIComponent(payeeName)}`}
                  className="bg-slate-900 hover:bg-slate-700 border border-slate-700 text-slate-200 py-2 rounded text-center text-xs font-bold transition"
                >
                  🖤 Cred
                </a>
              </div>
            </div>

            {/* Recent Presets History */}
            {savedPresets.length > 0 && (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-xl space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Saved / Recent QR Presets
                </h3>
                <div className="space-y-1.5">
                  {savedPresets.map((preset) => (
                    <div
                      key={preset.id}
                      onClick={() => {
                        const [uname, handle] = preset.vpa.split('@');
                        setVpaUsername(uname || preset.vpa);
                        if (handle) setVpaHandle(`@${handle}`);
                        setPayeeName(preset.payeeName);
                        setAmount(preset.amount);
                        setNote(preset.note);
                      }}
                      className="bg-slate-900 hover:bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs cursor-pointer transition flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-white block">{preset.payeeName}</span>
                        <span className="font-mono text-slate-400 text-[11px]">{preset.vpa}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-amber-300 block">₹{preset.amount}</span>
                        <span className="text-[10px] text-slate-500">{preset.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
