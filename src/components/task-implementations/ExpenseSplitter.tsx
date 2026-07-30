'use client';

import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Receipt,
  Share2,
  CheckCircle,
  Copy,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Send,
  Check
} from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  upiId?: string;
  avatarColor: string;
}

interface Expense {
  id: string;
  title: string;
  amount: number;
  paidBy: string; // participant ID
  date: string;
  category: string;
  splitParticipants: string[]; // participant IDs included in equal split
}

const AVATAR_COLORS = [
  'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
  'bg-sky-500/20 text-sky-400 border-sky-500/40',
  'bg-amber-500/20 text-amber-400 border-amber-500/40',
  'bg-purple-500/20 text-purple-400 border-purple-500/40',
  'bg-rose-500/20 text-rose-400 border-rose-500/40',
  'bg-indigo-500/20 text-indigo-400 border-indigo-500/40',
];

const PRESETS = [
  {
    name: '🏖️ Goa Beach Trip',
    participants: [
      { id: '1', name: 'Rahul Sharma', upiId: 'rahul@okicici', avatarColor: AVATAR_COLORS[0] },
      { id: '2', name: 'Priya Patel', upiId: 'priya@okhdfc', avatarColor: AVATAR_COLORS[1] },
      { id: '3', name: 'Amit Verma', upiId: 'amit@paytm', avatarColor: AVATAR_COLORS[2] },
      { id: '4', name: 'Sneha Rao', upiId: 'sneha@ybl', avatarColor: AVATAR_COLORS[3] },
    ],
    expenses: [
      { id: 'e1', title: 'Villa Stay', amount: 16000, paidBy: '1', date: '2026-07-20', category: '🏠 Stay', splitParticipants: ['1', '2', '3', '4'] },
      { id: 'e2', title: 'Beach Dinner', amount: 4800, paidBy: '2', date: '2026-07-21', category: '🍕 Food', splitParticipants: ['1', '2', '3', '4'] },
      { id: 'e3', title: 'Car Rental & Fuel', amount: 3200, paidBy: '3', date: '2026-07-22', category: '🚕 Travel', splitParticipants: ['1', '2', '3', '4'] },
    ],
  },
  {
    name: '🏢 Indiranagar Flat',
    participants: [
      { id: '1', name: 'Rohan', upiId: 'rohan@upi', avatarColor: AVATAR_COLORS[0] },
      { id: '2', name: 'Karan', upiId: 'karan@sbi', avatarColor: AVATAR_COLORS[1] },
      { id: '3', name: 'Vikram', upiId: 'vikram@axis', avatarColor: AVATAR_COLORS[2] },
    ],
    expenses: [
      { id: 'ef1', title: 'Monthly Rent', amount: 45000, paidBy: '1', date: '2026-07-01', category: '🏠 Rent', splitParticipants: ['1', '2', '3'] },
      { id: 'ef2', title: 'Cook Salary', amount: 9000, paidBy: '2', date: '2026-07-05', category: '🧹 Help', splitParticipants: ['1', '2', '3'] },
      { id: 'ef3', title: 'Electricity & WiFi', amount: 4800, paidBy: '3', date: '2026-07-10', category: '⚡ Bills', splitParticipants: ['1', '2', '3'] },
    ],
  },
];

export default function ExpenseSplitter() {
  const [groupName, setGroupName] = useState('🏖️ Goa Beach Trip');
  const [participants, setParticipants] = useState<Participant[]>(PRESETS[0].participants);
  const [expenses, setExpenses] = useState<Expense[]>(PRESETS[0].expenses);

  // New Participant Input
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonUpi, setNewPersonUpi] = useState('');
  const [showAddPerson, setShowAddPerson] = useState(false);

  // New Expense Input
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [category, setCategory] = useState('🍕 Food');
  const [splitWith, setSplitWith] = useState<string[]>([]);

  // Feedback Toast & Copied state
  const [toast, setToast] = useState<string | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const showNotification = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Load Preset
  const handleSelectPreset = (preset: typeof PRESETS[0]) => {
    setGroupName(preset.name);
    setParticipants(preset.participants);
    setExpenses(preset.expenses);
    showNotification(`Loaded ${preset.name}`);
  };

  // Add Participant
  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonName.trim()) return;
    const newP: Participant = {
      id: Date.now().toString(),
      name: newPersonName.trim(),
      upiId: newPersonUpi.trim() || undefined,
      avatarColor: AVATAR_COLORS[participants.length % AVATAR_COLORS.length],
    };
    setParticipants([...participants, newP]);
    setNewPersonName('');
    setNewPersonUpi('');
    setShowAddPerson(false);
    showNotification(`Added ${newP.name}`);
  };

  // Delete Participant
  const handleDeleteParticipant = (id: string) => {
    setParticipants(participants.filter((p) => p.id !== id));
    setExpenses(expenses.filter((e) => e.paidBy !== id).map((e) => ({
      ...e,
      splitParticipants: e.splitParticipants.filter((pid) => pid !== id),
    })));
  };

  // Add Expense
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!title.trim() || isNaN(num) || num <= 0) return;
    const payer = paidBy || (participants[0]?.id ?? '');
    if (!payer) return;

    const participantsInSplit = splitWith.length > 0 ? splitWith : participants.map((p) => p.id);

    const newExp: Expense = {
      id: 'exp_' + Date.now(),
      title: title.trim(),
      amount: num,
      paidBy: payer,
      date: new Date().toISOString().split('T')[0],
      category,
      splitParticipants: participantsInSplit,
    };

    setExpenses([newExp, ...expenses]);
    setTitle('');
    setAmount('');
    setSplitWith([]);
    showNotification('Expense added!');
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter((e) => e.id !== id));
  };

  // Calculations
  const totalSpend = useMemo(() => {
    return expenses.reduce((acc, curr) => acc + curr.amount, 0);
  }, [expenses]);

  const perPersonFairShare = useMemo(() => {
    return participants.length > 0 ? Math.round(totalSpend / participants.length) : 0;
  }, [totalSpend, participants]);

  // Net Balance per participant
  const balances = useMemo(() => {
    const map: Record<string, { paid: number; owes: number; net: number }> = {};
    participants.forEach((p) => {
      map[p.id] = { paid: 0, owes: 0, net: 0 };
    });

    expenses.forEach((e) => {
      if (map[e.paidBy]) {
        map[e.paidBy].paid += e.amount;
      }
      if (e.splitParticipants.length > 0) {
        const share = e.amount / e.splitParticipants.length;
        e.splitParticipants.forEach((pId) => {
          if (map[pId]) {
            map[pId].owes += share;
          }
        });
      }
    });

    Object.keys(map).forEach((pId) => {
      map[pId].net = map[pId].paid - map[pId].owes;
    });

    return map;
  }, [participants, expenses]);

  // Simplified Settlement Plan
  const settlementPlan = useMemo(() => {
    const debtors: { id: string; name: string; amount: number }[] = [];
    const creditors: { id: string; name: string; amount: number }[] = [];

    participants.forEach((p) => {
      const net = balances[p.id]?.net || 0;
      if (net < -0.5) debtors.push({ id: p.id, name: p.name, amount: Math.abs(net) });
      else if (net > 0.5) creditors.push({ id: p.id, name: p.name, amount: net });
    });

    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const plan: { fromName: string; toName: string; amount: number; toUpi?: string }[] = [];
    let dIdx = 0;
    let cIdx = 0;

    while (dIdx < debtors.length && cIdx < creditors.length) {
      const debtor = debtors[dIdx];
      const creditor = creditors[cIdx];
      const settlementAmt = Math.min(debtor.amount, creditor.amount);

      if (settlementAmt > 0.5) {
        const creditorP = participants.find((p) => p.id === creditor.id);
        plan.push({
          fromName: debtor.name,
          toName: creditor.name,
          amount: Math.round(settlementAmt),
          toUpi: creditorP?.upiId,
        });
      }

      debtor.amount -= settlementAmt;
      creditor.amount -= settlementAmt;

      if (debtor.amount < 0.5) dIdx++;
      if (creditor.amount < 0.5) cIdx++;
    }

    return plan;
  }, [participants, balances]);

  // Format currency
  const formatINR = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Math.round(amt));
  };

  // Export summary text for WhatsApp & Copy
  const formattedSummaryText = useMemo(() => {
    let txt = `*${groupName.trim() || 'Expense Split'}*\n`;
    txt += `💰 Total Spend: ${formatINR(totalSpend)}\n`;
    txt += `👥 Fair Share: ${formatINR(perPersonFairShare)}/person\n\n`;

    txt += `⚖️ *Net Balances:*\n`;
    participants.forEach((p) => {
      const net = balances[p.id]?.net || 0;
      if (net > 0.5) txt += `• ${p.name}: Gets back +${formatINR(net)}\n`;
      else if (net < -0.5) txt += `• ${p.name}: Owes -${formatINR(Math.abs(net))}\n`;
      else txt += `• ${p.name}: Settled (₹0)\n`;
    });

    txt += `\n🔄 *Settlement Plan:*\n`;
    if (settlementPlan.length === 0) {
      txt += `✅ Everyone is fully settled up!\n`;
    } else {
      settlementPlan.forEach((st, i) => {
        txt += `${i + 1}. *${st.fromName}* ➔ *${st.toName}*: ${formatINR(st.amount)}`;
        if (st.toUpi) txt += ` (UPI: ${st.toUpi})`;
        txt += `\n`;
      });
    }

    return txt;
  }, [groupName, totalSpend, perPersonFairShare, participants, balances, settlementPlan]);

  const handleWhatsAppShare = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(formattedSummaryText)}`;
    window.open(url, '_blank');
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(formattedSummaryText);
    showNotification('Summary copied to clipboard!');
  };

  const toggleParticipantSplit = (pId: string) => {
    const current = splitWith.length > 0 ? splitWith : participants.map((p) => p.id);
    if (current.includes(pId)) {
      if (current.length > 1) {
        setSplitWith(current.filter((id) => id !== pId));
      }
    } else {
      setSplitWith([...current, pId]);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-slate-900 text-slate-100 rounded-3xl shadow-2xl border border-slate-800 space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-500 text-white px-4 py-2 rounded-full shadow-xl flex items-center gap-2 text-xs font-semibold animate-fade-in">
          <CheckCircle className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header & Quick Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              Client-Side Fast Splitter
            </span>
          </div>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="text-xl sm:text-2xl font-black text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-emerald-500 focus:outline-none mt-1 transition"
          />
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs text-slate-400 font-medium">Presets:</span>
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectPreset(p)}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-full border border-slate-700 transition whitespace-nowrap flex items-center gap-1 font-medium"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              {p.name.split(' ')[1] || p.name}
            </button>
          ))}
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-800/60 p-3.5 sm:p-4 rounded-2xl border border-slate-800 space-y-1">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Spend</p>
          <p className="text-lg sm:text-2xl font-black font-mono text-white">{formatINR(totalSpend)}</p>
        </div>

        <div className="bg-slate-800/60 p-3.5 sm:p-4 rounded-2xl border border-slate-800 space-y-1">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Fair Share</p>
          <p className="text-lg sm:text-2xl font-black font-mono text-emerald-400">{formatINR(perPersonFairShare)}</p>
        </div>

        <div className="bg-slate-800/60 p-3.5 sm:p-4 rounded-2xl border border-slate-800 space-y-1">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</p>
          <p className="text-xs sm:text-sm font-bold text-slate-200 mt-1">
            {settlementPlan.length === 0 ? '✨ All Settled' : `${settlementPlan.length} Transfers`}
          </p>
        </div>
      </div>

      {/* Participants Pill Bar & Inline Add */}
      <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-sky-400" />
            Group Participants ({participants.length})
          </h3>
          <button
            onClick={() => setShowAddPerson(!showAddPerson)}
            className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Friend
          </button>
        </div>

        {showAddPerson && (
          <form onSubmit={handleAddParticipant} className="flex flex-wrap items-center gap-2 pt-1 animate-fade-in">
            <input
              type="text"
              placeholder="Friend's Name"
              value={newPersonName}
              onChange={(e) => setNewPersonName(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 flex-1 min-w-[140px]"
            />
            <input
              type="text"
              placeholder="UPI ID (e.g. rahul@upi)"
              value={newPersonUpi}
              onChange={(e) => setNewPersonUpi(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 flex-1 min-w-[160px]"
            />
            <button
              type="submit"
              className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition"
            >
              Add
            </button>
          </form>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          {participants.map((p) => {
            const net = balances[p.id]?.net || 0;
            return (
              <div
                key={p.id}
                className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs"
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${p.avatarColor}`}>
                  {p.name.charAt(0)}
                </div>
                <span className="font-semibold text-slate-200">{p.name}</span>
                <span
                  className={`font-mono text-[11px] font-bold ${
                    net > 0.5 ? 'text-emerald-400' : net < -0.5 ? 'text-rose-400' : 'text-slate-400'
                  }`}
                >
                  {net > 0.5 ? `+₹${Math.round(net)}` : net < -0.5 ? `-₹${Math.round(Math.abs(net))}` : '₹0'}
                </span>
                {participants.length > 2 && (
                  <button
                    onClick={() => handleDeleteParticipant(p.id)}
                    className="text-slate-500 hover:text-rose-400 ml-1 transition"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Fast Expense Form & Settlement Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Quick Add Expense & History (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <form onSubmit={handleAddExpense} className="bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-emerald-400" />
              Add Expense
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="What was paid for?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />

              <input
                type="number"
                placeholder="Amount (₹)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500"
              />

              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="" disabled>Who Paid?</option>
                {participants.map((p) => (
                  <option key={p.id} value={p.id}>
                    Paid by {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Split pills */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400">Split among:</span>
              <div className="flex flex-wrap gap-1.5">
                {participants.map((p) => {
                  const active = (splitWith.length === 0 ? participants.map((x) => x.id) : splitWith).includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => toggleParticipantSplit(p.id)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition ${
                        active
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-900 text-slate-500 border-slate-800'
                      }`}
                    >
                      {p.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 rounded-xl transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/40"
            >
              <Plus className="w-4 h-4" />
              Add Expense
            </button>
          </form>

          {/* Expenses History */}
          <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Recent Expenses ({expenses.length})</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {expenses.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No expenses added yet.</p>
              ) : (
                expenses.map((exp) => {
                  const payer = participants.find((p) => p.id === exp.paidBy);
                  return (
                    <div
                      key={exp.id}
                      className="bg-slate-900 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <p className="font-semibold text-white">{exp.title}</p>
                        <p className="text-[10px] text-slate-400">
                          Paid by <strong className="text-slate-300">{payer?.name || 'Unknown'}</strong> ({exp.splitParticipants.length} people)
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-emerald-400">{formatINR(exp.amount)}</span>
                        <button
                          onClick={() => handleDeleteExpense(exp.id)}
                          className="text-slate-500 hover:text-rose-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: 1-Click Settlement Plan & Share (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Optimized Settlement Plan
              </h3>
              <span className="text-[10px] font-medium text-slate-500">Min. Transfers Algorithm</span>
            </div>

            <div className="space-y-2">
              {settlementPlan.length === 0 ? (
                <div className="bg-emerald-950/30 border border-emerald-500/20 p-4 rounded-xl text-center space-y-1">
                  <p className="text-xs font-bold text-emerald-400">✨ All Settled!</p>
                  <p className="text-[11px] text-slate-400">No pending balances remaining between participants.</p>
                </div>
              ) : (
                settlementPlan.map((st, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-rose-400">{st.fromName}</span>
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                      <span className="font-bold text-emerald-400">{st.toName}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-white text-sm">{formatINR(st.amount)}</span>
                      {st.toUpi && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(st.toUpi!);
                            setCopiedIdx(idx);
                            setTimeout(() => setCopiedIdx(null), 2000);
                          }}
                          className="text-[10px] bg-slate-800 hover:bg-slate-700 text-sky-400 px-2 py-1 rounded-lg border border-slate-700 transition flex items-center gap-1"
                        >
                          {copiedIdx === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          UPI
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Quick Share Buttons */}
            <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2">
              <button
                onClick={handleWhatsAppShare}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
              >
                <Send className="w-3.5 h-3.5" />
                WhatsApp Share
              </button>

              <button
                onClick={handleCopySummary}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs py-2.5 rounded-xl border border-slate-700 transition flex items-center justify-center gap-2"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy Summary
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
