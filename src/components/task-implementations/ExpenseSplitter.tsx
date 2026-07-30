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
  Check,
  Download,
  Upload,
  Repeat,
  FileSpreadsheet,
  Zap,
  RefreshCw,
  FileText,
  ChevronRight
} from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  upiId?: string;
  avatarColor?: string;
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
  splitParticipants: string[]; // participant IDs in split
  customSplit?: Record<string, number>;
  notes?: string;
}

interface RecurringExpense {
  id: string;
  title: string;
  amount: number;
  paidBy: string;
  category: CategoryType;
  frequency: 'Monthly' | 'Weekly';
  dueDateDay: number; // e.g. 1st or 5th of month
  splitParticipants: string[];
  active: boolean;
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

const AVATAR_COLORS = [
  'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
  'bg-sky-500/20 text-sky-400 border-sky-500/40',
  'bg-amber-500/20 text-amber-400 border-amber-500/40',
  'bg-purple-500/20 text-purple-400 border-purple-500/40',
  'bg-rose-500/20 text-rose-400 border-rose-500/40',
  'bg-indigo-500/20 text-indigo-400 border-indigo-500/40',
];

interface GroupPreset {
  groupName: string;
  participants: Participant[];
  expenses: Expense[];
  recurring: RecurringExpense[];
}

// Presets
const GOA_TRIP_PRESET: GroupPreset = {
  groupName: '🏖️ Goa Beach Trip 2026',
  participants: [
    { id: '1', name: 'Rahul Sharma', upiId: 'rahul@okicici', avatarColor: AVATAR_COLORS[0] },
    { id: '2', name: 'Priya Patel', upiId: 'priya@okhdfc', avatarColor: AVATAR_COLORS[1] },
    { id: '3', name: 'Amit Verma', upiId: 'amit@paytm', avatarColor: AVATAR_COLORS[2] },
    { id: '4', name: 'Sneha Rao', upiId: 'sneha@ybl', avatarColor: AVATAR_COLORS[3] },
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
  recurring: [
    {
      id: 'r1',
      title: 'Goa Scooter Daily Rental',
      amount: 1200,
      paidBy: '3',
      category: 'Travel & Fuel' as CategoryType,
      frequency: 'Weekly',
      dueDateDay: 1,
      splitParticipants: ['1', '2', '3', '4'],
      active: true,
    },
  ],
};

const BANGALORE_FLAT_PRESET: GroupPreset = {
  groupName: '🏢 Indiranagar Flat 302',
  participants: [
    { id: '1', name: 'Rohan (Room 1)', upiId: 'rohan@upi', avatarColor: AVATAR_COLORS[0] },
    { id: '2', name: 'Karan (Room 2)', upiId: 'karan@sbi', avatarColor: AVATAR_COLORS[1] },
    { id: '3', name: 'Vikram (Room 3)', upiId: 'vikram@axis', avatarColor: AVATAR_COLORS[2] },
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
  recurring: [
    {
      id: 'rf1',
      title: 'Flat Maid Salary',
      amount: 9000,
      paidBy: '2',
      category: 'Maid & House Help' as CategoryType,
      frequency: 'Monthly',
      dueDateDay: 1,
      splitParticipants: ['1', '2', '3'],
      active: true,
    },
    {
      id: 'rf2',
      title: 'WiFi Broadband',
      amount: 1200,
      paidBy: '1',
      category: 'Bills & Utilities' as CategoryType,
      frequency: 'Monthly',
      dueDateDay: 10,
      splitParticipants: ['1', '2', '3'],
      active: true,
    },
  ],
};

// OCR Sample Receipt Templates
const RECEIPT_SAMPLES = [
  {
    name: 'Swiggy Gourmet Order',
    text: `SWIGGY FOOD DELIVERY
Order #8839210
Date: 2026-07-28
----------------------------
1x Butter Chicken Handi     ₹480
2x Garlic Butter Naan       ₹160
1x Dal Makhani Special      ₹320
1x Gulab Jamun (2 pcs)      ₹140
----------------------------
Item Total:                 ₹1100
Packaging & Taxes:           ₹140
Delivery Partner Tip:        ₹50
============================
TOTAL AMOUNT:               ₹1290
Paid via UPI by Rahul`,
    parsed: {
      title: 'Swiggy Dinner Order',
      amount: 1290,
      category: 'Dining & Swiggy' as CategoryType,
    },
  },
  {
    name: 'DMart Supermarket Grocery',
    text: `D-MART HYPERMARKET (INDIRANAGAR)
Bill No: DM/2026/09941
Date: 2026-07-25
----------------------------
Fortune Sunflower Oil 5L    ₹720
Aashirvaad Atta 10kg        ₹440
Amul Butter 500g            ₹275
Surf Excel Detergent 2kg    ₹390
Surf Liquid Wash 1L         ₹215
----------------------------
Sub Total:                  ₹2040
CGST @ 2.5%:                 ₹51
SGST @ 2.5%:                 ₹51
============================
GRAND TOTAL:                ₹2142
Thank You For Shopping!`,
    parsed: {
      title: 'D-Mart Monthly Grocery',
      amount: 2142,
      category: 'Groceries' as CategoryType,
    },
  },
  {
    name: 'Shell Petrol Pump Fuel',
    text: `SHELL INDIA PETROLEUM
Outlet #4029 - MG Road
Date: 2026-07-27
Fuel Type: V-Power Gasoline
Volume: 28.50 Litres
Rate: ₹106.50 / L
----------------------------
Total Amount:               ₹3035.25
GST Tax:                    INCLUDED
============================
PAYMENT RECEIVED:           ₹3035
Transaction ID: SHL8839210`,
    parsed: {
      title: 'Shell Petrol Pump Fuel',
      amount: 3035,
      category: 'Travel & Fuel' as CategoryType,
    },
  },
];

export default function ExpenseSplitter() {
  const [groupName, setGroupName] = useState('🏖️ Goa Beach Trip 2026');
  const [participants, setParticipants] = useState<Participant[]>(GOA_TRIP_PRESET.participants);
  const [expenses, setExpenses] = useState<Expense[]>(GOA_TRIP_PRESET.expenses);
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>(GOA_TRIP_PRESET.recurring);

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

  // Recurring form states
  const [recTitle, setRecTitle] = useState('');
  const [recAmount, setRecAmount] = useState('');
  const [recPaidBy, setRecPaidBy] = useState('');
  const [recCategory, setRecCategory] = useState<CategoryType>('Bills & Utilities');
  const [recFrequency, setRecFrequency] = useState<'Monthly' | 'Weekly'>('Monthly');

  // OCR Parser states
  const [ocrText, setOcrText] = useState(RECEIPT_SAMPLES[0].text);
  const [ocrResult, setOcrResult] = useState<{ title: string; amount: number; category: CategoryType } | null>(null);

  // Filter & tab states
  const [activeTab, setActiveTab] = useState<'settlement' | 'graph' | 'expenses' | 'recurring' | 'ocr' | 'breakdown' | 'whatsapp'>('settlement');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hoveredParticipantId, setHoveredParticipantId] = useState<string | null>(null);

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
      avatarColor: AVATAR_COLORS[participants.length % AVATAR_COLORS.length],
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

  // Add Recurring Expense
  const handleAddRecurring = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmt = parseFloat(recAmount);
    if (!recTitle.trim() || isNaN(numAmt) || numAmt <= 0 || !recPaidBy) {
      alert('Please fill out all recurring expense fields correctly.');
      return;
    }
    const newRec: RecurringExpense = {
      id: 'rec_' + Date.now(),
      title: recTitle.trim(),
      amount: numAmt,
      paidBy: recPaidBy,
      category: recCategory,
      frequency: recFrequency,
      dueDateDay: 1,
      splitParticipants: participants.map((p) => p.id),
      active: true,
    };
    setRecurringExpenses([...recurringExpenses, newRec]);
    setRecTitle('');
    setRecAmount('');
    showToast(`Scheduled recurring expense "${newRec.title}"`);
  };

  // Post Due Recurring Expense to active expenses list
  const handlePostRecurringToExpenses = (rec: RecurringExpense) => {
    const newExp: Expense = {
      id: 'exp_' + Date.now(),
      title: `${rec.title} (${rec.frequency})`,
      amount: rec.amount,
      paidBy: rec.paidBy,
      date: new Date().toISOString().split('T')[0],
      category: rec.category,
      splitType: 'EQUAL',
      splitParticipants: rec.splitParticipants.length > 0 ? rec.splitParticipants : participants.map((p) => p.id),
    };
    setExpenses([newExp, ...expenses]);
    showToast(`Posted "${rec.title}" into active expenses!`);
  };

  // Simulated OCR Text Parser
  const handleParseOCRText = () => {
    if (!ocrText.trim()) return;

    let detectedTitle = 'Parsed Bill Expense';
    let detectedAmount = 0;
    let detectedCat: CategoryType = 'Dining & Swiggy';

    // Regex extraction strategies for title and total amount
    const totalMatch = ocrText.match(/(?:TOTAL|GRAND TOTAL|TOTAL AMOUNT|AMOUNT|PAYMENT RECEIVED)[\s:=]*[₹Rs\.]*\s*([\d,]+\.?\d*)/i);
    if (totalMatch && totalMatch[1]) {
      detectedAmount = parseFloat(totalMatch[1].replace(/,/g, ''));
    }

    const lines = ocrText.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length > 0) {
      detectedTitle = lines[0].substring(0, 32);
    }

    // Category detection based on keywords
    const lower = ocrText.toLowerCase();
    if (lower.includes('swiggy') || lower.includes('zomato') || lower.includes('food') || lower.includes('restaurant')) {
      detectedCat = 'Dining & Swiggy';
    } else if (lower.includes('mart') || lower.includes('grocery') || lower.includes('supermarket') || lower.includes('bazaar')) {
      detectedCat = 'Groceries';
    } else if (lower.includes('petrol') || lower.includes('fuel') || lower.includes('uber') || lower.includes('ola') || lower.includes('shell')) {
      detectedCat = 'Travel & Fuel';
    } else if (lower.includes('rent') || lower.includes('flat') || lower.includes('villa')) {
      detectedCat = 'Rent';
    } else if (lower.includes('bescom') || lower.includes('electricity') || lower.includes('wifi') || lower.includes('bill')) {
      detectedCat = 'Bills & Utilities';
    }

    setOcrResult({
      title: detectedTitle,
      amount: detectedAmount > 0 ? detectedAmount : 500,
      category: detectedCat,
    });
    showToast('Receipt parsed successfully!');
  };

  const handleApplyOCRToModal = () => {
    if (!ocrResult) return;
    setExpTitle(ocrResult.title);
    setExpAmount(ocrResult.amount.toString());
    setExpCategory(ocrResult.category);
    setExpPaidBy(participants[0]?.id || '');
    setExpDate(new Date().toISOString().split('T')[0]);
    setExpSplitType('EQUAL');
    setSelectedSplitIds(participants.map((p) => p.id));
    setShowAddModal(true);
  };

  // Load Preset
  const handleLoadPreset = (preset: PresetGroup) => {
    setGroupName(preset.groupName);
    setParticipants(preset.participants);
    setExpenses(preset.expenses);
    setRecurringExpenses(preset.recurring || []);
    showToast(`Loaded "${preset.groupName}" preset!`);
  };

  const handleClearAll = () => {
    if (confirm('Clear all participants and expenses?')) {
      setGroupName('New Expense Group');
      setParticipants([]);
      setExpenses([]);
      setRecurringExpenses([]);
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
      if (map[e.paidBy]) {
        map[e.paidBy].paid += e.amount;
      }

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

    Object.keys(map).forEach((pId) => {
      map[pId].net = map[pId].paid - map[pId].owes;
    });

    return map;
  }, [participants, expenses]);

  // Debt Simplification Algorithm (Greedy Settlement Plan)
  const settlementPlan = useMemo(() => {
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

  // CSV Export Engine
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += `GROUP SUMMARY: ${groupName.replace(/,/g, ' ')}\n`;
    csvContent += `Total Spend,${totalGroupSpend}\n`;
    csvContent += `Total Participants,${participants.length}\n\n`;

    csvContent += `EXPENSES BREAKDOWN\nTitle,Category,Amount,Paid By,Date,Split Type\n`;
    expenses.forEach((e) => {
      const payerName = participants.find((p) => p.id === e.paidBy)?.name || 'Unknown';
      csvContent += `"${e.title}",${e.category},${e.amount},"${payerName}",${e.date},${e.splitType}\n`;
    });

    csvContent += `\nSETTLEMENT PLAN (MINIMUM TRANSFERS)\nFrom (Debtor),To (Creditor),Amount (INR),UPI ID\n`;
    settlementPlan.forEach((st) => {
      csvContent += `"${st.fromName}","${st.toName}",${st.amount},"${st.toUpi || ''}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${groupName.replace(/[^a-zA-Z0-9]/g, '_')}_Summary.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported CSV file!');
  };

  // WhatsApp text export
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

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-slate-800 space-y-6">
      {/* Toast Notification */}
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
            <span className="text-xs text-slate-400">Zero Server Cost • Graph Settlement • Receipt OCR</span>
          </div>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="text-2xl sm:text-3xl font-extrabold text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-emerald-500 focus:outline-none mt-1 w-full max-w-md transition"
            placeholder="Group Name (e.g. Goa Trip 2026)"
          />
        </div>

        {/* Quick Presets & Export Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleLoadPreset(GOA_TRIP_PRESET)}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Goa Trip
          </button>
          <button
            onClick={() => handleLoadPreset(BANGALORE_FLAT_PRESET)}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            BLR Flat
          </button>
          <button
            onClick={handleExportCSV}
            className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 shadow-md"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            CSV Export
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
                  onMouseEnter={() => setHoveredParticipantId(p.id)}
                  onMouseLeave={() => setHoveredParticipantId(null)}
                  className={`bg-slate-800 border rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-sm text-xs transition ${
                    hoveredParticipantId === p.id ? 'border-emerald-400 ring-2 ring-emerald-500/20' : 'border-slate-700/80'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full font-bold flex items-center justify-center text-[10px] border ${p.avatarColor || AVATAR_COLORS[0]}`}>
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-100">{p.name}</p>
                    {p.upiId && <p className="text-[10px] text-slate-400">{p.upiId}</p>}
                  </div>
                  <div className="ml-1 text-[11px] font-bold font-mono">
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
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('settlement')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'settlement' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            Settlement ({settlementPlan.length})
          </button>

          <button
            onClick={() => setActiveTab('graph')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'graph' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Settlement Graph
          </button>

          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'expenses' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            Expenses ({expenses.length})
          </button>

          <button
            onClick={() => setActiveTab('recurring')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'recurring' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Repeat className="w-3.5 h-3.5 text-sky-400" />
            Recurring ({recurringExpenses.length})
          </button>

          <button
            onClick={() => setActiveTab('ocr')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'ocr' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-rose-400" />
            Receipt OCR Parser
          </button>

          <button
            onClick={() => setActiveTab('breakdown')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'breakdown' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            Breakdown
          </button>

          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'whatsapp' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-400" />
            Export & Share
          </button>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs transition shadow-lg flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Add Expense
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
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border ${p.avatarColor || AVATAR_COLORS[0]}`}>
                            {p.name.charAt(0)}
                          </div>
                          {p.name}
                        </td>
                        <td className="px-4 py-3 text-emerald-400 font-mono">{formatINR(stats.paid)}</td>
                        <td className="px-4 py-3 text-rose-400 font-mono">{formatINR(stats.owes)}</td>
                        <td className="px-4 py-3 font-bold font-mono">
                          {stats.net > 0.5 && <span className="text-emerald-400">Gets back +{formatINR(stats.net)}</span>}
                          {stats.net < -0.5 && <span className="text-rose-400">Owes -{formatINR(Math.abs(stats.net))}</span>}
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
                  Optimized Settlement Plan (Minimum Money Transfers)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Greedy debt simplification reduces N(N-1) potential transfers to a minimal path.
                </p>
              </div>
            </div>

            {settlementPlan.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/50 rounded-xl border border-slate-800">
                <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
                <p className="text-sm font-semibold text-slate-200">Everyone is completely settled!</p>
                <p className="text-xs text-slate-500 mt-1">No money transfers are required across group members.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {settlementPlan.map((st, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900 p-4 rounded-xl border border-slate-700/80 flex flex-col justify-between space-y-3 hover:border-emerald-500/50 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center text-xs border border-rose-500/30">
                          {st.fromName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{st.fromName}</p>
                          <p className="text-[10px] text-rose-400 font-medium">Debtor (Pays)</p>
                        </div>
                      </div>

                      <div className="text-center px-2">
                        <ChevronRight className="w-5 h-5 text-emerald-400 mx-auto" />
                        <span className="text-[10px] font-bold text-emerald-400 font-mono">{formatINR(st.amount)}</span>
                      </div>

                      <div className="flex items-center gap-2 text-right">
                        <div>
                          <p className="text-xs font-bold text-white">{st.toName}</p>
                          <p className="text-[10px] text-emerald-400 font-medium">Creditor (Receives)</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs border border-emerald-500/30">
                          {st.toName.charAt(0)}
                        </div>
                      </div>
                    </div>

                    {st.toUpi && (
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                        <span className="text-slate-400 font-mono">UPI ID: {st.toUpi}</span>
                        <a
                          href={`upi://pay?pa=${st.toUpi}&pn=${encodeURIComponent(st.toName)}&am=${st.amount}&cu=INR`}
                          className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-md font-semibold transition border border-emerald-500/30 flex items-center gap-1"
                        >
                          Pay via UPI
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Visual Settlement Graph */}
      {activeTab === 'graph' && (
        <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/60 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                Interactive Directed Settlement Graph
              </h3>
              <p className="text-xs text-slate-400">
                Visual circular graph mapping money flows from debtors (red nodes) to creditors (green nodes).
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1 text-rose-400 font-medium">
                <span className="w-3 h-3 rounded-full bg-rose-500/40 border border-rose-500"></span> Debtor (Owes)
              </span>
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <span className="w-3 h-3 rounded-full bg-emerald-500/40 border border-emerald-500"></span> Creditor (Gets back)
              </span>
            </div>
          </div>

          {participants.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-10">Add participants and expenses to generate settlement graph.</p>
          ) : (
            <div className="relative w-full h-[400px] bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center justify-center overflow-hidden p-4">
              <svg className="w-full h-full absolute inset-0 pointer-events-none">
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="28"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3.5, 0 7" fill="#10B981" />
                  </marker>
                </defs>

                {/* Draw SVG directed edges for settlements */}
                {settlementPlan.map((st, idx) => {
                  const debtorIdx = participants.findIndex((p) => p.id === st.fromId);
                  const creditorIdx = participants.findIndex((p) => p.id === st.toId);
                  if (debtorIdx === -1 || creditorIdx === -1) return null;

                  const totalP = participants.length;
                  const centerX = 250;
                  const centerY = 200;
                  const radius = 140;

                  const angleD = (debtorIdx / totalP) * 2 * Math.PI - Math.PI / 2;
                  const angleC = (creditorIdx / totalP) * 2 * Math.PI - Math.PI / 2;

                  const xD = centerX + radius * Math.cos(angleD);
                  const yD = centerY + radius * Math.sin(angleD);
                  const xC = centerX + radius * Math.cos(angleC);
                  const yC = centerY + radius * Math.sin(angleC);

                  const midX = (xD + xC) / 2;
                  const midY = (yD + yC) / 2;

                  return (
                    <g key={idx}>
                      <line
                        x1={xD}
                        y1={yD}
                        x2={xC}
                        y2={yC}
                        stroke="#10B981"
                        strokeWidth="2.5"
                        strokeDasharray="4 2"
                        markerEnd="url(#arrowhead)"
                      />
                      <rect
                        x={midX - 35}
                        y={midY - 12}
                        width="70"
                        height="24"
                        rx="12"
                        fill="#0F172A"
                        stroke="#10B981"
                        strokeWidth="1"
                      />
                      <text
                        x={midX}
                        y={midY + 4}
                        fill="#10B981"
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        ₹{st.amount}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Render Participant Nodes in Circle */}
              <div className="relative w-[500px] h-[400px] flex items-center justify-center">
                {participants.map((p, idx) => {
                  const totalP = participants.length;
                  const radius = 140;
                  const angle = (idx / totalP) * 2 * Math.PI - Math.PI / 2;
                  const x = 250 + radius * Math.cos(angle) - 45; // 90px node width center offset
                  const y = 200 + radius * Math.sin(angle) - 40; // 80px node height center offset
                  const net = participantBalances[p.id]?.net || 0;
                  const isCreditor = net > 0.5;
                  const isDebtor = net < -0.5;

                  return (
                    <div
                      key={p.id}
                      style={{ left: `${x}px`, top: `${y}px` }}
                      className={`absolute w-[90px] h-[80px] rounded-2xl border-2 flex flex-col items-center justify-center p-2 text-center shadow-xl transition transform hover:scale-105 z-10 cursor-pointer ${
                        isCreditor
                          ? 'bg-emerald-950/90 border-emerald-500 text-emerald-100'
                          : isDebtor
                          ? 'bg-rose-950/90 border-rose-500 text-rose-100'
                          : 'bg-slate-800 border-slate-600 text-slate-300'
                      }`}
                    >
                      <div className="w-6 h-6 rounded-full bg-slate-900 border border-white/20 font-bold flex items-center justify-center text-[10px]">
                        {p.name.charAt(0)}
                      </div>
                      <p className="text-[11px] font-bold truncate max-w-[80px] mt-0.5">{p.name.split(' ')[0]}</p>
                      <p className="text-[10px] font-mono font-bold mt-0.5">
                        {isCreditor && `+₹${Math.round(net)}`}
                        {isDebtor && `-₹${Math.round(Math.abs(net))}`}
                        {!isCreditor && !isDebtor && '₹0'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Expenses List */}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search expenses by title or payer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Categories</option>
                {Object.keys(CATEGORY_COLORS).map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_EMOJIS[cat as CategoryType]} {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Expense Cards */}
          {filteredExpenses.length === 0 ? (
            <div className="p-8 text-center bg-slate-800/40 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-400">No expenses found matching filter criteria.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredExpenses.map((exp) => {
                const payer = participants.find((p) => p.id === exp.paidBy);
                const catStyle = CATEGORY_COLORS[exp.category];

                return (
                  <div
                    key={exp.id}
                    className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl p-4 flex items-center justify-between gap-4 transition shadow-sm"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="text-2xl p-2 bg-slate-900 rounded-xl border border-slate-700/80">
                        {CATEGORY_EMOJIS[exp.category]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-white">{exp.title}</h4>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
                            {exp.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Paid by <strong className="text-slate-200">{payer?.name || 'Unknown'}</strong> on {exp.date} • Split among {exp.splitParticipants.length} people ({exp.splitType})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-base font-extrabold font-mono text-emerald-400">{formatINR(exp.amount)}</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          ({formatINR(exp.amount / (exp.splitParticipants.length || 1))}/person)
                        </p>
                      </div>

                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-700/50 transition"
                        title="Delete Expense"
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

      {/* TAB 4: Recurring Expense Scheduler */}
      {activeTab === 'recurring' && (
        <div className="space-y-6">
          <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/80 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Repeat className="w-4 h-4 text-sky-400" />
              Schedule Recurring Flatmate & Household Expenses
            </h3>

            <form onSubmit={handleAddRecurring} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              <input
                type="text"
                placeholder="Title (e.g. Monthly Rent)"
                value={recTitle}
                onChange={(e) => setRecTitle(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
              />
              <input
                type="number"
                placeholder="Amount (₹)"
                value={recAmount}
                onChange={(e) => setRecAmount(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
              />
              <select
                value={recPaidBy}
                onChange={(e) => setRecPaidBy(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-sky-500"
              >
                <option value="">Paid By...</option>
                {participants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <select
                value={recCategory}
                onChange={(e) => setRecCategory(e.target.value as CategoryType)}
                className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-sky-500"
              >
                {Object.keys(CATEGORY_COLORS).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs px-4 py-1.5 rounded-lg transition flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Schedule
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recurringExpenses.map((rec) => {
              const payer = participants.find((p) => p.id === rec.paidBy);
              return (
                <div
                  key={rec.id}
                  className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-700/80 text-xl">
                      {CATEGORY_EMOJIS[rec.category]}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{rec.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {rec.frequency} • Paid by {payer?.name || 'Unknown'}
                      </p>
                      <p className="text-[10px] font-mono text-emerald-400 font-bold mt-1">{formatINR(rec.amount)}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePostRecurringToExpenses(rec)}
                    className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-lg border border-emerald-500/30 transition flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Post Due
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: Receipt OCR Parser */}
      {activeTab === 'ocr' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-slate-800/60 p-5 rounded-2xl border border-slate-700/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-rose-400" />
                Paste Bill / Receipt Text
              </h3>
              <div className="flex gap-1.5">
                {RECEIPT_SAMPLES.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => setOcrText(s.text)}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded border border-slate-700 transition"
                  >
                    Sample {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={12}
              value={ocrText}
              onChange={(e) => setOcrText(e.target.value)}
              placeholder="Paste raw bill text or receipt snippet here..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-rose-500"
            ></textarea>

            <button
              onClick={handleParseOCRText}
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-2 rounded-xl transition shadow-md flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              Simulate Receipt OCR Parsing
            </button>
          </div>

          <div className="lg:col-span-6 bg-slate-800/60 p-5 rounded-2xl border border-slate-700/80 space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-700/60 pb-3">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Parsed Bill Results
              </h3>

              {!ocrResult ? (
                <div className="p-8 text-center text-slate-500 text-xs italic">
                  Click &quot;Simulate Receipt OCR Parsing&quot; to extract merchant, total amount, and category automatically.
                </div>
              ) : (
                <div className="p-4 bg-slate-900 rounded-xl border border-slate-700 space-y-3 mt-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Extracted Merchant Title:</span>
                    <span className="font-bold text-white">{ocrResult.title}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Detected Category:</span>
                    <span className="font-semibold text-emerald-400">{ocrResult.category}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-800 pt-2 text-sm font-bold">
                    <span className="text-slate-300">Total Amount Extracted:</span>
                    <span className="font-mono text-xl text-emerald-400">{formatINR(ocrResult.amount)}</span>
                  </div>
                </div>
              )}
            </div>

            {ocrResult && (
              <button
                onClick={handleApplyOCRToModal}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-2.5 rounded-xl transition shadow-lg flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Import into New Expense Modal
              </button>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: Category Breakdown */}
      {activeTab === 'breakdown' && (
        <div className="space-y-6">
          <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/70 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-400" />
              Category Spend Breakdown
            </h3>

            <div className="space-y-3">
              {categoryStats.map((c) => {
                const catStyle = CATEGORY_COLORS[c.category];
                return (
                  <div key={c.category} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="flex items-center gap-2 font-semibold text-slate-200">
                        <span>{CATEGORY_EMOJIS[c.category]}</span>
                        <span>{c.category}</span>
                      </span>
                      <span className="font-mono text-slate-300">
                        {formatINR(c.total)} ({c.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div
                        style={{ width: `${c.percentage}%` }}
                        className={`h-full transition-all duration-500 ${catStyle.bg.replace('/10', '')}`}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: WhatsApp & Export */}
      {activeTab === 'whatsapp' && (
        <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/70 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-emerald-400" />
                Formatted WhatsApp & Text Summary
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Copy and paste directly into your WhatsApp flatmate or trip group.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(whatsappExportText);
                  showToast('Copied summary to clipboard!');
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 shadow-md"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy Summary
              </button>
              <button
                onClick={() => {
                  const url = `https://wa.me/?text=${encodeURIComponent(whatsappExportText)}`;
                  window.open(url, '_blank');
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs px-3.5 py-2 rounded-lg border border-slate-700 transition flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                Open WhatsApp
              </button>
            </div>
          </div>

          <pre className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {whatsappExportText}
          </pre>
        </div>
      )}

      {/* MODAL: Add New Expense */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-400" />
                Add New Group Expense
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Expense Title</label>
                <input
                  type="text"
                  placeholder="e.g. Swiggy Dinner / BESCOM Bill"
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Paid By</label>
                  <select
                    value={expPaidBy}
                    onChange={(e) => setExpPaidBy(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500"
                    required
                  >
                    {participants.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-slate-300">Split Method</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setExpSplitType('EQUAL')}
                      className={`text-xs px-2.5 py-1 rounded-md font-semibold transition ${
                        expSplitType === 'EQUAL' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      Equal Split
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpSplitType('CUSTOM')}
                      className={`text-xs px-2.5 py-1 rounded-md font-semibold transition ${
                        expSplitType === 'CUSTOM' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      Custom Split
                    </button>
                  </div>
                </div>

                {expSplitType === 'EQUAL' ? (
                  <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                    {participants.map((p) => {
                      const isSelected = selectedSplitIds.includes(p.id);
                      return (
                        <label
                          key={p.id}
                          className="flex items-center justify-between p-2 bg-slate-800/60 rounded-lg border border-slate-700/50 text-xs cursor-pointer"
                        >
                          <span className="font-medium text-slate-200">{p.name}</span>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedSplitIds([...selectedSplitIds, p.id]);
                              } else {
                                setSelectedSplitIds(selectedSplitIds.filter((id) => id !== p.id));
                              }
                            }}
                            className="accent-emerald-500 w-4 h-4 rounded"
                          />
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                    {participants.map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-2 bg-slate-800/60 rounded-lg text-xs">
                        <span className="font-medium text-slate-200">{p.name}</span>
                        <input
                          type="number"
                          placeholder="Amount ₹"
                          value={customAmounts[p.id] || ''}
                          onChange={(e) =>
                            setCustomAmounts({
                              ...customAmounts,
                              [p.id]: e.target.value,
                            })
                          }
                          className="w-24 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition shadow-lg"
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
