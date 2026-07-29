'use client';

import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Receipt,
  DollarSign,
  Share2,
  CheckCircle,
  Copy,
  PieChart,
  ArrowRightLeft,
  Calendar,
  Sparkles,
  Search,
  Filter,
  Check
} from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  upiId?: string;
}

type CategoryType =
  | 'Rent'
  | 'Bills & Utilities'
  | 'Groceries'
  | 'Dining & Swiggy'
  | 'Travel & Fuel'
  | 'Maid & House Help'
  | 'Entertainment'
  | 'Others';

interface Expense {
  id: string;
  title: string;
  amount: number;
  paidBy: string; // participant ID
  date: string;
  category: CategoryType;
  splitType: 'EQUAL' | 'CUSTOM';
  // Array of participant IDs included in equal split, or mapping of id -> amount
  splitParticipants: string[]; // for equal split
  customSplit?: Record<string, number>; // for custom split
}

const CATEGORY_COLORS: Record<CategoryType, { bg: string; text: string; border: string }> = {
  Rent: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
  'Bills & Utilities': { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  Groceries: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  'Dining & Swiggy': { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
  'Travel & Fuel': { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/30' },
  'Maid & House Help': { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  Entertainment: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  Others: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' },
};

const CATEGORY_EMOJIS: Record<CategoryType, string> = {
  Rent: '🏠',
  'Bills & Utilities': '⚡',
  Groceries: '🛒',
  'Dining & Swiggy': '🍕',
  'Travel & Fuel': '🚕',
  'Maid & House Help': '🧹',
  Entertainment: '🎬',
  Others: '📦',
};

// Initial preset datasets
const GOA_TRIP_PRESET = {
  groupName: '🏖️ Goa Beach Trip 2026',
  participants: [
    { id: '1', name: 'Rahul Sharma', upiId: 'rahul@okicici' },
    { id: '2', name: 'Priya Patel', upiId: 'priya@okhdfc' },
    { id: '3', name: 'Amit Verma', upiId: 'amit@paytm' },
    { id: '4', name: 'Sneha Rao', upiId: 'sneha@ybl' },
  ],
  expenses: [
    {
      id: 'e1',
      title: 'Villa Stay Deposit',
      amount: 16000,
      paidBy: '1',
      date: '2026-07-20',
      category: 'Rent' as CategoryType,
      splitType: 'EQUAL' as const,
      splitParticipants: ['1', '2', '3', '4'],
    },
    {
      id: 'e2',
      title: 'Beachside Seafood & Drinks',
      amount: 4800,
      paidBy: '2',
      date: '2026-07-21',
      category: 'Dining & Swiggy' as CategoryType,
      splitType: 'EQUAL' as const,
      splitParticipants: ['1', '2', '3', '4'],
    },
    {
      id: 'e3',
      title: 'Car Rental & Fuel',
      amount: 3200,
      paidBy: '3',
      date: '2026-07-22',
      category: 'Travel & Fuel' as CategoryType,
      splitType: 'EQUAL' as const,
      splitParticipants: ['1', '2', '3', '4'],
    },
    {
      id: 'e4',
      title: 'Supermarket Snacks & Drinks',
      amount: 1500,
      paidBy: '4',
      date: '2026-07-22',
      category: 'Groceries' as CategoryType,
      splitType: 'EQUAL' as const,
      splitParticipants: ['1', '2', '3', '4'],
    },
  ],
};

const BANGALORE_FLAT_PRESET = {
  groupName: '🏢 Indiranagar Flat 302',
  participants: [
    { id: '1', name: 'Rohan (Room 1)', upiId: 'rohan@upi' },
    { id: '2', name: 'Karan (Room 2)', upiId: 'karan@sbi' },
    { id: '3', name: 'Vikram (Room 3)', upiId: 'vikram@axis' },
  ],
  expenses: [
    {
      id: 'ef1',
      title: 'Monthly Rent',
      amount: 45000,
      paidBy: '1',
      date: '2026-07-01',
      category: 'Rent' as CategoryType,
      splitType: 'EQUAL' as const,
      splitParticipants: ['1', '2', '3'],
    },
    {
      id: 'ef2',
      title: 'Cook & Maid Salary',
      amount: 9000,
      paidBy: '2',
      date: '2026-07-05',
      category: 'Maid & House Help' as CategoryType,
      splitType: 'EQUAL' as const,
      splitParticipants: ['1', '2', '3'],
    },
    {
      id: 'ef3',
      title: 'BESCOM Electricity Bill',
      amount: 3600,
      paidBy: '3',
      date: '2026-07-10',
      category: 'Bills & Utilities' as CategoryType,
      splitType: 'EQUAL' as const,
      splitParticipants: ['1', '2', '3'],
    },
    {
      id: 'ef4',
      title: 'ACT FiberNet Wifi',
      amount: 1200,
      paidBy: '1',
      date: '2026-07-12',
      category: 'Bills & Utilities' as CategoryType,
      splitType: 'EQUAL' as const,
      splitParticipants: ['1', '2', '3'],
    },
  ],
};

export default function ExpenseSplitter() {
  const [groupName, setGroupName] = useState('🏖️ Goa Beach Trip 2026');
  const [participants, setParticipants] = useState<Participant[]>(GOA_TRIP_PRESET.participants);
  const [expenses, setExpenses] = useState<Expense[]>(GOA_TRIP_PRESET.expenses);

  // Form states for adding participant
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonUpi, setNewPersonUpi] = useState('');

  // Form states for adding expense
  const [showAddModal, setShowAddModal] = useState(false);
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expPaidBy, setExpPaidBy] = useState('');
  const [expCategory, setExpCategory] = useState<CategoryType>('Dining & Swiggy');
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [expSplitType, setExpSplitType] = useState<'EQUAL' | 'CUSTOM'>('EQUAL');
  const [selectedSplitIds, setSelectedSplitIds] = useState<string[]>([]);
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});

  // Filter & tab states
  const [activeTab, setActiveTab] = useState<'expenses' | 'settlement' | 'breakdown' | 'whatsapp'>('settlement');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Pre-fill selected participants when opening expense modal
  const handleOpenAddModal = () => {
    if (participants.length === 0) {
      showToast('Please add at least one participant first!');
      return;
    }
    setExpTitle('');
    setExpAmount('');
    setExpPaidBy(participants[0]?.id || '');
    setExpCategory('Dining & Swiggy');
    setExpDate(new Date().toISOString().split('T')[0]);
    setExpSplitType('EQUAL');
    setSelectedSplitIds(participants.map((p) => p.id));
    const initCustom: Record<string, string> = {};
    participants.forEach((p) => (initCustom[p.id] = ''));
    setCustomAmounts(initCustom);
    setShowAddModal(true);
  };

  // Add new participant
  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonName.trim()) return;
    const newP: Participant = {
      id: Date.now().toString(),
      name: newPersonName.trim(),
      upiId: newPersonUpi.trim() || undefined,
    };
    setParticipants([...participants, newP]);
    setNewPersonName('');
    setNewPersonUpi('');
    showToast(`Added ${newP.name}`);
  };

  // Delete participant
  const handleDeleteParticipant = (id: string) => {
    if (expenses.some((e) => e.paidBy === id || e.splitParticipants.includes(id))) {
      if (!confirm('This participant has expenses associated with them. Are you sure you want to remove them?')) {
        return;
      }
    }
    setParticipants(participants.filter((p) => p.id !== id));
    setExpenses(expenses.filter((e) => e.paidBy !== id));
    showToast('Participant removed');
  };

  // Save new expense
  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(expAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid expense amount.');
      return;
    }
    if (!expTitle.trim()) {
      alert('Please enter an expense title.');
      return;
    }
    if (!expPaidBy) {
      alert('Please select who paid for this expense.');
      return;
    }

    if (expSplitType === 'EQUAL') {
      if (selectedSplitIds.length === 0) {
        alert('Select at least one participant to split among.');
        return;
      }
      const newExp: Expense = {
        id: 'exp_' + Date.now(),
        title: expTitle.trim(),
        amount: numAmount,
        paidBy: expPaidBy,
        date: expDate,
        category: expCategory,
        splitType: 'EQUAL',
        splitParticipants: selectedSplitIds,
      };
      setExpenses([newExp, ...expenses]);
    } else {
      // Custom split validation
      let sumCustom = 0;
      const parsedCustom: Record<string, number> = {};
      const splitParts: string[] = [];

      for (const pId of participants.map((p) => p.id)) {
        const val = parseFloat(customAmounts[pId] || '0');
        if (!isNaN(val) && val > 0) {
          parsedCustom[pId] = val;
          sumCustom += val;
          splitParts.push(pId);
        }
      }

      if (Math.abs(sumCustom - numAmount) > 0.5) {
        alert(`Custom split total (₹${sumCustom.toFixed(2)}) must equal total expense amount (₹${numAmount.toFixed(2)})`);
        return;
      }

      const newExp: Expense = {
        id: 'exp_' + Date.now(),
        title: expTitle.trim(),
        amount: numAmount,
        paidBy: expPaidBy,
        date: expDate,
        category: expCategory,
        splitType: 'CUSTOM',
        splitParticipants: splitParts,
        customSplit: parsedCustom,
      };
      setExpenses([newExp, ...expenses]);
    }

    setShowAddModal(false);
    showToast('Expense added successfully!');
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter((e) => e.id !== id));
    showToast('Expense deleted');
  };

  // Load Preset
  const handleLoadPreset = (preset: typeof GOA_TRIP_PRESET) => {
    setGroupName(preset.groupName);
    setParticipants(preset.participants);
    setExpenses(preset.expenses);
    showToast(`Loaded "${preset.groupName}" preset!`);
  };

  const handleClearAll = () => {
    if (confirm('Clear all participants and expenses?')) {
      setGroupName('New Expense Group');
      setParticipants([]);
      setExpenses([]);
      showToast('Cleared all data.');
    }
  };

  // Calculations: Total spent, net balance per participant
  const totalGroupSpend = useMemo(() => {
    return expenses.reduce((acc, curr) => acc + curr.amount, 0);
  }, [expenses]);

  const participantBalances = useMemo(() => {
    const map: Record<string, { paid: number; owes: number; net: number }> = {};
    participants.forEach((p) => {
      map[p.id] = { paid: 0, owes: 0, net: 0 };
    });

    expenses.forEach((e) => {
      // Add paid amount
      if (map[e.paidBy]) {
        map[e.paidBy].paid += e.amount;
      }

      // Add owes amount
      if (e.splitType === 'EQUAL' && e.splitParticipants.length > 0) {
        const share = e.amount / e.splitParticipants.length;
        e.splitParticipants.forEach((pId) => {
          if (map[pId]) {
            map[pId].owes += share;
          }
        });
      } else if (e.splitType === 'CUSTOM' && e.customSplit) {
        Object.entries(e.customSplit).forEach(([pId, amt]) => {
          if (map[pId]) {
            map[pId].owes += amt;
          }
        });
      }
    });

    // Compute net balance: paid - owes
    Object.keys(map).forEach((pId) => {
      map[pId].net = map[pId].paid - map[pId].owes;
    });

    return map;
  }, [participants, expenses]);

  // Debt Simplification Algorithm (Greedy Settlement Plan)
  const settlementPlan = useMemo(() => {
    // Collect creditors (net > 0) and debtors (net < 0)
    const debtors: { id: string; name: string; amount: number }[] = [];
    const creditors: { id: string; name: string; amount: number }[] = [];

    participants.forEach((p) => {
      const net = participantBalances[p.id]?.net || 0;
      if (net < -0.01) {
        debtors.push({ id: p.id, name: p.name, amount: Math.abs(net) });
      } else if (net > 0.01) {
        creditors.push({ id: p.id, name: p.name, amount: net });
      }
    });

    // Sort to optimize matching
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const transactions: { fromId: string; fromName: string; toId: string; toName: string; amount: number; toUpi?: string }[] = [];

    let dIdx = 0;
    let cIdx = 0;

    while (dIdx < debtors.length && cIdx < creditors.length) {
      const debtor = debtors[dIdx];
      const creditor = creditors[cIdx];
      const settlementAmt = Math.min(debtor.amount, creditor.amount);

      if (settlementAmt > 0.5) {
        const creditorP = participants.find((p) => p.id === creditor.id);
        transactions.push({
          fromId: debtor.id,
          fromName: debtor.name,
          toId: creditor.id,
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

    return transactions;
  }, [participants, participantBalances]);

  // Category breakdown
  const categoryStats = useMemo(() => {
    const catMap: Record<CategoryType, number> = {
      Rent: 0,
      'Bills & Utilities': 0,
      Groceries: 0,
      'Dining & Swiggy': 0,
      'Travel & Fuel': 0,
      'Maid & House Help': 0,
      Entertainment: 0,
      Others: 0,
    };

    expenses.forEach((e) => {
      catMap[e.category] = (catMap[e.category] || 0) + e.amount;
    });

    return Object.entries(catMap)
      .map(([cat, total]) => ({
        category: cat as CategoryType,
        total,
        percentage: totalGroupSpend > 0 ? (total / totalGroupSpend) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [expenses, totalGroupSpend]);

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const matchesSearch =
        exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        participants.find((p) => p.id === exp.paidBy)?.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = categoryFilter === 'ALL' || exp.category === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [expenses, searchQuery, categoryFilter, participants]);

  // Format currency in Indian Numbering format
  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Generate formatted WhatsApp text export
  const whatsappExportText = useMemo(() => {
    let text = `*${groupName.trim() || 'Expense Splitter Summary'}*\n`;
    text += `💰 *Total Group Spend:* ${formatINR(totalGroupSpend)}\n`;
    text += `👥 *Total Participants:* ${participants.length}\n\n`;

    text += `📊 *Category Breakdown:*\n`;
    categoryStats.forEach((c) => {
      if (c.total > 0) {
        text += `${CATEGORY_EMOJIS[c.category]} ${c.category}: ${formatINR(c.total)} (${c.percentage.toFixed(1)}%)\n`;
      }
    });

    text += `\n⚖️ *Individual Net Balances:*\n`;
    participants.forEach((p) => {
      const bal = participantBalances[p.id]?.net || 0;
      if (bal > 0.5) {
        text += `• ${p.name}: Gets back +${formatINR(bal)}\n`;
      } else if (bal < -0.5) {
        text += `• ${p.name}: Owes -${formatINR(Math.abs(bal))}\n`;
      } else {
        text += `• ${p.name}: Settled (₹0)\n`;
      }
    });

    text += `\n🔁 *Settlement Plan (Minimum Transfers):*\n`;
    if (settlementPlan.length === 0) {
      text += `✅ Everyone is fully settled up!\n`;
    } else {
      settlementPlan.forEach((st, idx) => {
        text += `${idx + 1}. 🔴 *${st.fromName}* pays 🟢 *${st.toName}*: ${formatINR(st.amount)}`;
        if (st.toUpi) {
          text += ` (UPI: ${st.toUpi})`;
        }
        text += `\n`;
      });
    }

    text += `\nCalculated via Nyxa Expense Splitter ⚡`;
    return text;
  }, [groupName, totalGroupSpend, participants, categoryStats, participantBalances, settlementPlan]);

  const handleCopyWhatsAppText = () => {
    navigator.clipboard.writeText(whatsappExportText);
    showToast('Summary copied to clipboard!');
  };

  const handleOpenWhatsAppUrl = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(whatsappExportText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-slate-800 space-y-6">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/10 text-emerald-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-500/20">
              India Flatmate & Trip Splitter
            </span>
            <span className="text-xs text-slate-400">Zero Server Cost • Local Calculation</span>
          </div>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="text-2xl sm:text-3xl font-extrabold text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-emerald-500 focus:outline-none mt-1 w-full max-w-md transition"
            placeholder="Group Name (e.g. Goa Trip 2026)"
          />
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleLoadPreset(GOA_TRIP_PRESET)}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Preset: Goa Trip
          </button>
          <button
            onClick={() => handleLoadPreset(BANGALORE_FLAT_PRESET)}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            Preset: BLR Flat
          </button>
          <button
            onClick={handleClearAll}
            className="text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 px-3 py-1.5 rounded-lg border border-rose-500/30 transition flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>

      {/* Group Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60">
          <p className="text-xs font-medium text-slate-400">Total Group Spend</p>
          <p className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1">{formatINR(totalGroupSpend)}</p>
        </div>
        <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60">
          <p className="text-xs font-medium text-slate-400">Active Participants</p>
          <p className="text-xl sm:text-2xl font-bold text-white mt-1">{participants.length} People</p>
        </div>
        <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60">
          <p className="text-xs font-medium text-slate-400">Avg Spend / Person</p>
          <p className="text-xl sm:text-2xl font-bold text-sky-400 mt-1">
            {formatINR(participants.length > 0 ? totalGroupSpend / participants.length : 0)}
          </p>
        </div>
        <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60">
          <p className="text-xs font-medium text-slate-400">Transfers Needed</p>
          <p className="text-xl sm:text-2xl font-bold text-amber-400 mt-1">{settlementPlan.length} Steps</p>
        </div>
      </div>

      {/* Participants Management Card */}
      <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            Group Participants ({participants.length})
          </h3>
        </div>

        {/* Add participant inline form */}
        <form onSubmit={handleAddParticipant} className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Participant Name (e.g. Rahul)"
            value={newPersonName}
            onChange={(e) => setNewPersonName(e.target.value)}
            className="flex-1 min-w-[160px] bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
          <input
            type="text"
            placeholder="UPI ID (Optional, e.g. name@upi)"
            value={newPersonUpi}
            onChange={(e) => setNewPersonUpi(e.target.value)}
            className="flex-1 min-w-[160px] bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium px-4 py-1.5 rounded-lg transition flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Person
          </button>
        </form>

        {/* Participants Chips */}
        <div className="flex flex-wrap gap-2 pt-1">
          {participants.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No participants added yet. Add people to start splitting expenses.</p>
          ) : (
            participants.map((p) => {
              const net = participantBalances[p.id]?.net || 0;
              const isCreditor = net > 0.5;
              const isDebtor = net < -0.5;

              return (
                <div
                  key={p.id}
                  className="bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-sm text-xs"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center text-[10px]">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-100">{p.name}</p>
                    {p.upiId && <p className="text-[10px] text-slate-400">{p.upiId}</p>}
                  </div>
                  <div className="ml-1 text-[11px] font-bold">
                    {isCreditor && <span className="text-emerald-400">+{formatINR(net)}</span>}
                    {isDebtor && <span className="text-rose-400">-{formatINR(Math.abs(net))}</span>}
                    {!isCreditor && !isDebtor && <span className="text-slate-400">Settled</span>}
                  </div>
                  <button
                    onClick={() => handleDeleteParticipant(p.id)}
                    className="text-slate-500 hover:text-rose-400 transition ml-1"
                    title="Remove participant"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Tabs Navigation & Add Expense Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('settlement')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'settlement'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            Balances & Settlement ({settlementPlan.length})
          </button>

          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'expenses'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            All Expenses ({expenses.length})
          </button>

          <button
            onClick={() => setActiveTab('breakdown')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'breakdown'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            Category Breakdown
          </button>

          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'whatsapp'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            WhatsApp Export
          </button>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs transition shadow-lg flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Add New Expense
        </button>
      </div>

      {/* TAB 1: Balances & Settlement Plan */}
      {activeTab === 'settlement' && (
        <div className="space-y-6">
          {/* Individual Balances Table */}
          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/70">
            <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Individual Net Balance Breakdown
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono text-[11px]">
                  <tr>
                    <th className="px-4 py-2 rounded-l-lg">Participant</th>
                    <th className="px-4 py-2">Total Paid</th>
                    <th className="px-4 py-2">Total Share Owes</th>
                    <th className="px-4 py-2 rounded-r-lg">Net Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {participants.map((p) => {
                    const stats = participantBalances[p.id] || { paid: 0, owes: 0, net: 0 };
                    return (
                      <tr key={p.id} className="hover:bg-slate-800/40">
                        <td className="px-4 py-3 font-semibold text-white flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-emerald-300 font-bold">
                            {p.name.charAt(0)}
                          </div>
                          {p.name}
                        </td>
                        <td className="px-4 py-3 text-emerald-400 font-mono">{formatINR(stats.paid)}</td>
                        <td className="px-4 py-3 text-rose-400 font-mono">{formatINR(stats.owes)}</td>
                        <td className="px-4 py-3 font-bold font-mono">
                          {stats.net > 0.5 && <span className="text-emerald-400">Gets back {formatINR(stats.net)}</span>}
                          {stats.net < -0.5 && <span className="text-rose-400">Owes {formatINR(Math.abs(stats.net))}</span>}
                          {Math.abs(stats.net) <= 0.5 && <span className="text-slate-500">Settled (₹0)</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Minimal Settlement Plan */}
          <div className="bg-slate-800/60 rounded-xl p-5 border border-slate-700/70 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ArrowRightLeft className="w-5 h-5 text-emerald-400" />
                  Optimized Settlement Plan (Minimum Transfers)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Greedy algorithm reduces complex group debts down to the fewest direct payments.
                </p>
              </div>
            </div>

            {settlementPlan.length === 0 ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-xl text-center space-y-2">
                <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
                <p className="text-emerald-300 font-bold text-sm">Everyone is all settled up!</p>
                <p className="text-xs text-slate-400">There are no pending balances between group members.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {settlementPlan.map((st, i) => (
                  <div
                    key={i}
                    className="bg-slate-900 p-4 rounded-xl border border-slate-700/80 flex items-center justify-between shadow-sm hover:border-slate-600 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-rose-400">{st.fromName}</span>
                        <span className="text-slate-500">pays</span>
                        <span className="font-bold text-emerald-400">{st.toName}</span>
                      </div>
                      <p className="text-xl font-extrabold text-white font-mono">{formatINR(st.amount)}</p>
                      {st.toUpi && (
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                          <span>UPI:</span>
                          <span className="text-sky-300">{st.toUpi}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => {
                          const text = `${st.fromName} pays ${st.toName} ${formatINR(st.amount)}${st.toUpi ? ` via UPI ${st.toUpi}` : ''}`;
                          navigator.clipboard.writeText(text);
                          showToast('Transfer detail copied!');
                        }}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                        title="Copy transfer detail"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: All Expenses */}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search expense or person..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Categories</option>
                {Object.keys(CATEGORY_COLORS).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Expense Cards List */}
          {filteredExpenses.length === 0 ? (
            <div className="bg-slate-800/30 border border-slate-800 p-8 rounded-xl text-center space-y-2">
              <Receipt className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-slate-400 text-xs font-medium">No expenses found matching your filter.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredExpenses.map((exp) => {
                const payer = participants.find((p) => p.id === exp.paidBy);
                const catStyle = CATEGORY_COLORS[exp.category] || CATEGORY_COLORS.Others;

                return (
                  <div
                    key={exp.id}
                    className="bg-slate-800/70 p-4 rounded-xl border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:border-slate-600 transition"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-xl text-lg ${catStyle.bg} ${catStyle.border} border`}>
                        {CATEGORY_EMOJIS[exp.category]}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-sm">{exp.title}</h4>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-md font-medium border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                          >
                            {exp.category}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            {exp.date}
                          </span>
                          <span>
                            Paid by <strong className="text-emerald-400 font-semibold">{payer?.name || 'Unknown'}</strong>
                          </span>
                          <span>•</span>
                          <span>
                            Split: <strong className="text-slate-300">{exp.splitParticipants.length} people</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-700/50">
                      <div className="text-right">
                        <p className="text-lg font-extrabold text-white font-mono">{formatINR(exp.amount)}</p>
                        <p className="text-[10px] text-slate-400">
                          {exp.splitType === 'EQUAL'
                            ? `~${formatINR(exp.amount / (exp.splitParticipants.length || 1))}/person`
                            : 'Custom Split'}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                        title="Delete expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Category Breakdown */}
      {activeTab === 'breakdown' && (
        <div className="space-y-6">
          <div className="bg-slate-800/60 p-5 rounded-xl border border-slate-700/70 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-400" />
              Category Expenses Distribution
            </h3>

            <div className="space-y-4">
              {categoryStats.map((c) => {
                return (
                  <div key={c.category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200 flex items-center gap-2">
                        <span>{CATEGORY_EMOJIS[c.category]}</span>
                        {c.category}
                      </span>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="font-bold text-white">{formatINR(c.total)}</span>
                        <span className="text-slate-400 text-[11px]">({c.percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          c.category === 'Rent'
                            ? 'bg-rose-500'
                            : c.category === 'Bills & Utilities'
                            ? 'bg-amber-500'
                            : c.category === 'Groceries'
                            ? 'bg-emerald-500'
                            : c.category === 'Dining & Swiggy'
                            ? 'bg-orange-500'
                            : c.category === 'Travel & Fuel'
                            ? 'bg-sky-500'
                            : c.category === 'Maid & House Help'
                            ? 'bg-purple-500'
                            : c.category === 'Entertainment'
                            ? 'bg-indigo-500'
                            : 'bg-slate-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, c.percentage))}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: WhatsApp Shareable Text Export */}
      {activeTab === 'whatsapp' && (
        <div className="space-y-4">
          <div className="bg-slate-800/60 p-5 rounded-xl border border-slate-700/70 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-emerald-400" />
                  Formatted WhatsApp Summary Export
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Copy or share this text directly to your flatmate / trip WhatsApp group.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyWhatsAppText}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy Text
                </button>

                <button
                  onClick={handleOpenWhatsAppUrl}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-md"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Open WhatsApp
                </button>
              </div>
            </div>

            <textarea
              readOnly
              rows={12}
              value={whatsappExportText}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-500 leading-relaxed shadow-inner"
            />
          </div>
        </div>
      )}

      {/* ADD EXPENSE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                Add New Shared Expense
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 rounded-md hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Expense Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Swiggy Lunch / Electricity Bill / House Rent"
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    placeholder="e.g. 2400"
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value as CategoryType)}
                    className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500"
                  >
                    {Object.keys(CATEGORY_COLORS).map((cat) => (
                      <option key={cat} value={cat}>
                        {CATEGORY_EMOJIS[cat as CategoryType]} {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Paid By</label>
                  <select
                    value={expPaidBy}
                    onChange={(e) => setExpPaidBy(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500"
                  >
                    {participants.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Split Mode Selector */}
              <div className="space-y-2 border-t border-slate-800 pt-3">
                <label className="block text-xs font-semibold text-slate-200">Split Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setExpSplitType('EQUAL')}
                    className={`py-1.5 text-xs font-medium rounded-lg border transition ${
                      expSplitType === 'EQUAL'
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    Split Equally
                  </button>

                  <button
                    type="button"
                    onClick={() => setExpSplitType('CUSTOM')}
                    className={`py-1.5 text-xs font-medium rounded-lg border transition ${
                      expSplitType === 'CUSTOM'
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    Custom / Unequal
                  </button>
                </div>
              </div>

              {/* Equal split checkboxes */}
              {expSplitType === 'EQUAL' && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-400">Select people who share this expense:</p>
                  <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                    {participants.map((p) => {
                      const isSelected = selectedSplitIds.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedSplitIds(selectedSplitIds.filter((id) => id !== p.id));
                            } else {
                              setSelectedSplitIds([...selectedSplitIds, p.id]);
                            }
                          }}
                          className={`p-2 rounded-lg text-xs font-medium border flex items-center justify-between transition ${
                            isSelected
                              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                              : 'bg-slate-800 border-slate-700 text-slate-400'
                          }`}
                        >
                          <span>{p.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Custom split inputs */}
              {expSplitType === 'CUSTOM' && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-400">Enter exact share per person (Sum must equal ₹{expAmount || '0'}):</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {participants.map((p) => (
                      <div key={p.id} className="flex items-center justify-between gap-2">
                        <span className="text-xs text-slate-300">{p.name}</span>
                        <input
                          type="number"
                          placeholder="₹ 0"
                          value={customAmounts[p.id] || ''}
                          onChange={(e) =>
                            setCustomAmounts({
                              ...customAmounts,
                              [p.id]: e.target.value,
                            })
                          }
                          className="w-28 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 border-t border-slate-800 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition shadow-md"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
