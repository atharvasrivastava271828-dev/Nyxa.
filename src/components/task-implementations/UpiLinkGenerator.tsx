'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  QrCode,
  Copy,
  Check,
  Share2,
  Download,
  Sparkles,
  Smartphone,
  Building2,
  ExternalLink,
} from 'lucide-react';

// ============================================================================
// PURE CLIENT-SIDE QR CODE MATRIX GENERATOR (NO NPM DEPENDENCIES)
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

function generateQrMatrix(text: string): boolean[][] {
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

const POPULAR_HANDLES = ['@paytm', '@okaxis', '@oksbi', '@okicici', '@ybl', '@upi'];

export default function UpiLinkGenerator() {
  const [upiId, setUpiId] = useState('');
  const [payeeName, setPayeeName] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [copied, setCopied] = useState(false);

  const loadDemoData = () => {
    setUpiId('merchant@upi');
    setPayeeName('Apex Store');
    setAmount('250');
    setNote('Store Purchase');
  };

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate UPI URI
  const upiUri = useMemo(() => {
    const cleanId = upiId.trim();
    const cleanName = encodeURIComponent(payeeName.trim());
    const cleanNote = encodeURIComponent(note.trim());

    let uri = `upi://pay?pa=${cleanId}&pn=${cleanName}&cu=INR`;
    const numAmount = parseFloat(amount);
    if (!isNaN(numAmount) && numAmount > 0) {
      uri += `&am=${numAmount.toFixed(2)}`;
    }
    if (note.trim()) {
      uri += `&tn=${cleanNote}`;
    }
    return uri;
  }, [upiId, payeeName, amount, note]);

  // Render QR Code onto Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const matrix = generateQrMatrix(upiUri);
      const matrixSize = matrix.length;
      const scale = 10;
      const margin = 2;
      const canvasSize = (matrixSize + margin * 2) * scale;

      canvas.width = canvasSize;
      canvas.height = canvasSize;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvasSize, canvasSize);

      ctx.fillStyle = '#0f172a'; // Slate 900
      for (let r = 0; r < matrixSize; r++) {
        for (let c = 0; c < matrixSize; c++) {
          if (matrix[r][c]) {
            const x = (c + margin) * scale;
            const y = (r + margin) * scale;
            ctx.fillRect(x, y, scale, scale);
          }
        }
      }

      // Add clean central badge
      const badgeSize = Math.floor(canvasSize * 0.22);
      const center = canvasSize / 2;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(center, center, badgeSize / 2 + 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#2563eb';
      ctx.font = `bold ${Math.floor(badgeSize * 0.4)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('UPI', center, center);
    } catch (e) {
      console.error('QR rendering error:', e);
    }
  }, [upiUri]);

  // Copy Link
  const copyLink = () => {
    navigator.clipboard.writeText(upiUri);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // WhatsApp Share Link
  const shareWhatsApp = () => {
    const text = `Pay ₹${amount || '0'} to ${payeeName} via UPI:\n${upiUri}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Download QR Code image
  const downloadQr = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `UPI_QR_${payeeName.replace(/\s+/g, '_')}.png`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 md:p-10 font-sans flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <QrCode className="w-3.5 h-3.5" /> Instant UPI Payment Link & QR Generator
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            UPI QR Code & Link Generator
          </h1>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            Generate standard NPCI payment QR codes and deep links instantly for Google Pay, PhonePe, Paytm & BHIM.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Left Form */}
          <div className="md:col-span-7 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                UPI ID (VPA) *
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. name@upi"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-blue-500 transition"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {POPULAR_HANDLES.map((handle) => (
                  <button
                    key={handle}
                    type="button"
                    onClick={() => {
                      const prefix = upiId.split('@')[0] || 'shopkeeper';
                      setUpiId(`${prefix}${handle}`);
                    }}
                    className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono px-2 py-0.5 rounded transition"
                  >
                    {handle}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Payee / Business Name *
              </label>
              <input
                type="text"
                value={payeeName}
                onChange={(e) => setPayeeName(e.target.value)}
                placeholder="e.g. Akash Traders"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-semibold focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Amount (₹ INR)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 250"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-amber-400 font-bold font-mono focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Note / Remarks
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Grocery payment"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Right Live QR & Actions */}
          <div className="md:col-span-5 flex flex-col items-center justify-center space-y-5 bg-slate-950/60 p-6 rounded-xl border border-slate-800/80">
            {/* Live QR Canvas */}
            <div className="bg-white p-3 rounded-2xl shadow-xl border-4 border-slate-800">
              <canvas ref={canvasRef} className="w-52 h-52 sm:w-56 sm:h-56" />
            </div>

            <div className="text-center space-y-0.5">
              <div className="font-bold text-base text-white">{payeeName || 'Payee Name'}</div>
              <div className="text-xs font-mono text-slate-400">{upiId || 'upi-id@bank'}</div>
              {amount && (
                <div className="text-sm font-black text-emerald-400 mt-1">₹ {amount} INR</div>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="w-full space-y-2.5 pt-1">
              <button
                onClick={copyLink}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-lg flex items-center justify-center gap-2"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied UPI Intent Link!' : 'Copy UPI Intent Link'}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={shareWhatsApp}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  WhatsApp
                </button>

                <button
                  onClick={downloadQr}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5 border border-slate-700"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Launcher Info */}
        <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Smartphone className="w-3.5 h-3.5 text-slate-400" />
          Works with GPay, PhonePe, Paytm, BHIM, Amazon Pay, Cred & All Banking Apps
        </div>
      </div>
    </div>
  );
}
