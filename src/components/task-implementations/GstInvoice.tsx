'use client';

import React, { useState, useMemo } from 'react';
import { Printer, Plus, Trash2, RotateCcw, Sparkles, Share2, Copy, Check, Download, Send } from 'lucide-react';

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  gstRate: number;
}

export default function GstInvoice() {
  const [invoiceNumber, setInvoiceNumber] = useState('INV-2026-001');
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [currency, setCurrency] = useState('₹');
  const [copied, setCopied] = useState(false);

  // Supplier
  const [supplierName, setSupplierName] = useState('Apex Digital Solutions');
  const [supplierGstin, setSupplierGstin] = useState('27AAAAA0000A1Z5');
  const [supplierAddress, setSupplierAddress] = useState('Suite 402, Tech Park, Mumbai');

  // Buyer
  const [buyerName, setBuyerName] = useState('Acme Global Technologies');
  const [buyerGstin, setBuyerGstin] = useState('27BBBCC1111B1Z2');
  const [buyerAddress, setBuyerAddress] = useState('12 Innovation Boulevard, Bengaluru');

  // Line items
  const [items, setItems] = useState<LineItem[]>([
    { id: '1', description: 'UI/UX Web Application Design', quantity: 1, rate: 25000, gstRate: 18 },
    { id: '2', description: 'Cloud Infrastructure & Setup', quantity: 1, rate: 15000, gstRate: 18 }
  ]);

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), description: 'New Service / Product', quantity: 1, rate: 5000, gstRate: 18 }
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof LineItem, val: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: val } : item));
  };

  const loadDemoData = () => {
    setInvoiceNumber('INV-2026-042');
    setSupplierName('Nexus Creative Studio');
    setSupplierGstin('07AACCN9876C1Z9');
    setSupplierAddress('Connaught Place, New Delhi');
    setBuyerName('Hyperion Logistics Ltd');
    setBuyerGstin('07BBBDD5432B1Z1');
    setBuyerAddress('Cyber Hub, Gurugram');
    setItems([
      { id: '1', description: 'Brand Strategy & Visual Design', quantity: 1, rate: 45000, gstRate: 18 },
      { id: '2', description: 'Monthly Retainer (SEO & Content)', quantity: 2, rate: 12500, gstRate: 18 }
    ]);
  };

  const resetForm = () => {
    setInvoiceNumber('INV-2026-001');
    setSupplierName('');
    setSupplierGstin('');
    setSupplierAddress('');
    setBuyerName('');
    setBuyerGstin('');
    setBuyerAddress('');
    setItems([{ id: '1', description: '', quantity: 1, rate: 0, gstRate: 18 }]);
  };

  // Totals
  const totals = useMemo(() => {
    let subtotal = 0;
    let totalGst = 0;

    items.forEach(item => {
      const amount = (item.quantity || 0) * (item.rate || 0);
      const gst = (amount * (item.gstRate || 0)) / 100;
      subtotal += amount;
      totalGst += gst;
    });

    const cgst = totalGst / 2;
    const sgst = totalGst / 2;
    const grandTotal = subtotal + totalGst;

    return { subtotal, cgst, sgst, totalGst, grandTotal };
  }, [items]);

  const handlePrint = () => {
    window.print();
  };

  // WhatsApp Share
  const handleWhatsAppShare = () => {
    const text = `🧾 *TAX INVOICE: ${invoiceNumber}*\nFrom: ${supplierName || 'Seller'}\nTo: ${buyerName || 'Client'}\nDate: ${invoiceDate}\n\n*Total Amount:* ${currency}${totals.grandTotal.toLocaleString('en-IN')}\n\nGenerated via Nyxa (https://nyxa.vercel.app/tasks/gst-invoice)`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Copy Summary
  const handleCopySummary = () => {
    const text = `INVOICE SUMMARY (${invoiceNumber})
Seller: ${supplierName}
Buyer: ${buyerName}
Date: ${invoiceDate}
Subtotal: ${currency}${totals.subtotal.toLocaleString('en-IN')}
Total GST: ${currency}${totals.totalGst.toLocaleString('en-IN')}
Grand Total: ${currency}${totals.grandTotal.toLocaleString('en-IN')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download JSON Backup
  const handleDownloadJson = () => {
    const data = {
      invoiceNumber,
      invoiceDate,
      supplier: { name: supplierName, gstin: supplierGstin, address: supplierAddress },
      buyer: { name: buyerName, gstin: buyerGstin, address: buyerAddress },
      items,
      totals
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoiceNumber || 'invoice'}.json`;
    a.click();
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[var(--card-bg)] p-6 rounded-3xl border border-[var(--border)] shadow-sm print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">GST & Tax Invoice Generator</h1>
          <p className="text-xs text-[var(--muted)]">Create, share, and print professional invoices instantly.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Currency Switcher */}
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="nyxa-input text-xs font-bold py-1.5 px-2.5 w-auto"
          >
            <option value="₹">INR (₹)</option>
            <option value="$">USD ($)</option>
            <option value="€">EUR (€)</option>
            <option value="£">GBP (£)</option>
          </select>

          <button
            onClick={loadDemoData}
            className="nyxa-btn nyxa-btn-secondary text-xs px-3 py-2 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Demo
          </button>

          <button
            onClick={handleCopySummary}
            className="nyxa-btn nyxa-btn-secondary text-xs px-3 py-2 flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>

          <button
            onClick={handleWhatsAppShare}
            className="nyxa-btn nyxa-btn-secondary text-xs px-3 py-2 flex items-center gap-1.5 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10"
          >
            <Send className="w-3.5 h-3.5" /> WhatsApp
          </button>

          <button
            onClick={handleDownloadJson}
            className="nyxa-btn nyxa-btn-secondary text-xs px-3 py-2 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-blue-500" /> JSON
          </button>

          <button
            onClick={resetForm}
            className="nyxa-btn nyxa-btn-secondary text-xs px-3 py-2 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" /> Reset
          </button>

          <button
            onClick={handlePrint}
            className="nyxa-btn nyxa-btn-primary text-xs px-4 py-2 flex items-center gap-1.5 shadow-md hover:scale-105 transition-transform"
          >
            <Printer className="w-4 h-4" /> Print / PDF
          </button>
        </div>
      </div>

      {/* Main Grid: Left Inputs, Right A4 Invoice Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Column */}
        <div className="lg:col-span-5 space-y-6 print:hidden">
          {/* Invoice Meta */}
          <div className="nyxa-card p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Invoice Info</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="nyxa-label text-[10px]">Invoice #</label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={e => setInvoiceNumber(e.target.value)}
                  className="nyxa-input text-xs"
                />
              </div>
              <div>
                <label className="nyxa-label text-[10px]">Date</label>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={e => setInvoiceDate(e.target.value)}
                  className="nyxa-input text-xs"
                />
              </div>
            </div>
          </div>

          {/* Your Business */}
          <div className="nyxa-card p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Your Business (Seller)</h3>
            <input
              type="text"
              placeholder="Business Name"
              value={supplierName}
              onChange={e => setSupplierName(e.target.value)}
              className="nyxa-input text-xs"
            />
            <input
              type="text"
              placeholder="GSTIN Number (e.g. 27AAAAA0000A1Z5)"
              value={supplierGstin}
              onChange={e => setSupplierGstin(e.target.value)}
              className="nyxa-input text-xs font-mono"
            />
            <input
              type="text"
              placeholder="Business Address & City"
              value={supplierAddress}
              onChange={e => setSupplierAddress(e.target.value)}
              className="nyxa-input text-xs"
            />
          </div>

          {/* Client Details */}
          <div className="nyxa-card p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Client Details (Buyer)</h3>
            <input
              type="text"
              placeholder="Client / Company Name"
              value={buyerName}
              onChange={e => setBuyerName(e.target.value)}
              className="nyxa-input text-xs"
            />
            <input
              type="text"
              placeholder="Client GSTIN (Optional)"
              value={buyerGstin}
              onChange={e => setBuyerGstin(e.target.value)}
              className="nyxa-input text-xs font-mono"
            />
            <input
              type="text"
              placeholder="Client Address & City"
              value={buyerAddress}
              onChange={e => setBuyerAddress(e.target.value)}
              className="nyxa-input text-xs"
            />
          </div>

          {/* Line Items Input */}
          <div className="nyxa-card p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Items & Services</h3>
              <button onClick={addItem} className="text-xs text-emerald-500 font-bold flex items-center gap-1 hover:underline">
                <Plus className="w-3.5 h-3.5" /> Add Row
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={item.id} className="p-3 bg-[var(--secondary-bg)] rounded-xl border border-[var(--border)] space-y-2">
                  <div className="flex justify-between items-center gap-2">
                    <input
                      type="text"
                      placeholder={`Item ${idx + 1} Description`}
                      value={item.description}
                      onChange={e => updateItem(item.id, 'description', e.target.value)}
                      className="nyxa-input text-xs flex-grow"
                    />
                    {items.length > 1 && (
                      <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 p-1">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[9px] uppercase text-[var(--muted)] font-bold">Qty</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))}
                        className="nyxa-input text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase text-[var(--muted)] font-bold">Rate ({currency})</label>
                      <input
                        type="number"
                        value={item.rate}
                        onChange={e => updateItem(item.id, 'rate', Number(e.target.value))}
                        className="nyxa-input text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase text-[var(--muted)] font-bold">GST %</label>
                      <select
                        value={item.gstRate}
                        onChange={e => updateItem(item.id, 'gstRate', Number(e.target.value))}
                        className="nyxa-input text-xs"
                      >
                        <option value={0}>0%</option>
                        <option value={5}>5%</option>
                        <option value={12}>12%</option>
                        <option value={18}>18%</option>
                        <option value={28}>28%</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Printable A4 Invoice Preview */}
        <div className="lg:col-span-7 bg-white text-slate-900 p-8 rounded-3xl shadow-xl border border-slate-200 print:shadow-none print:border-none print:p-0 print:m-0">
          <div className="border-b border-slate-200 pb-6 mb-6 flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">TAX INVOICE</span>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-1">{supplierName || 'Your Business Name'}</h2>
              {supplierGstin && <p className="text-xs font-mono text-slate-600 mt-1">GSTIN: {supplierGstin}</p>}
              {supplierAddress && <p className="text-xs text-slate-500 mt-0.5 max-w-xs">{supplierAddress}</p>}
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full uppercase tracking-wider mb-2">
                ORIGINAL
              </span>
              <p className="text-sm font-bold text-slate-900">{invoiceNumber}</p>
              <p className="text-xs text-slate-500">Date: {invoiceDate}</p>
            </div>
          </div>

          {/* Bill To */}
          <div className="bg-slate-50 p-4 rounded-xl mb-6 border border-slate-100">
            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block mb-1">BILLED TO</span>
            <strong className="text-sm text-slate-900 block">{buyerName || 'Client Name'}</strong>
            {buyerGstin && <p className="text-xs font-mono text-slate-600 mt-0.5">GSTIN: {buyerGstin}</p>}
            {buyerAddress && <p className="text-xs text-slate-500 mt-0.5">{buyerAddress}</p>}
          </div>

          {/* Items Table */}
          <table className="w-full text-xs text-left mb-6 border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-900 text-slate-900">
                <th className="py-2 font-bold">#</th>
                <th className="py-2 font-bold">Item Description</th>
                <th className="py-2 font-bold text-center">Qty</th>
                <th className="py-2 font-bold text-right">Rate</th>
                <th className="py-2 font-bold text-right">GST %</th>
                <th className="py-2 font-bold text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item, idx) => {
                const itemTotal = item.quantity * item.rate;
                return (
                  <tr key={item.id}>
                    <td className="py-3 text-slate-400">{idx + 1}</td>
                    <td className="py-3 font-medium text-slate-900">{item.description || 'Service'}</td>
                    <td className="py-3 text-center text-slate-700">{item.quantity}</td>
                    <td className="py-3 text-right text-slate-700">{currency}{item.rate.toLocaleString('en-IN')}</td>
                    <td className="py-3 text-right text-slate-500">{item.gstRate}%</td>
                    <td className="py-3 text-right font-bold text-slate-900">{currency}{itemTotal.toLocaleString('en-IN')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Totals Summary */}
          <div className="flex flex-col items-end pt-4 border-t border-slate-200 space-y-1.5 text-xs">
            <div className="flex justify-between w-64 text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-900">{currency}{totals.subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between w-64 text-slate-500">
              <span>CGST:</span>
              <span>{currency}{totals.cgst.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between w-64 text-slate-500">
              <span>SGST:</span>
              <span>{currency}{totals.sgst.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between w-64 text-base font-bold text-slate-900 pt-2 border-t border-slate-900">
              <span>Grand Total:</span>
              <span>{currency}{totals.grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-12 pt-6 border-t border-slate-100 text-center text-[10px] text-slate-400">
            Thank you for your business! Generated instantly via Nyxa.
          </div>
        </div>
      </div>
    </div>
  );
}
