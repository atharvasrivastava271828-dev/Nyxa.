'use client';

import * as React from 'react';
import { useState, useMemo, useEffect, useRef } from 'react';

// ==========================================
// TYPES & INTERFACES
// ==========================================

export type InvoiceType = 'Tax Invoice' | 'Bill of Supply' | 'Debit Note' | 'Credit Note' | 'Proforma Invoice';
export type PaymentStatus = 'UNPAID' | 'PAID' | 'PARTIALLY PAID' | 'OVERDUE';
export type TransportMode = 'Road' | 'Rail' | 'Air' | 'Ship';
export type ItemType = 'goods' | 'services';
export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED';
export type RecurringFrequency = 'Weekly' | 'Monthly' | 'Quarterly' | 'Bi-Annually' | 'Annually';
export type PrintLayout = 'a4' | 'thermal';

export interface LineItem {
  id: string;
  description: string;
  hsnSac: string;
  itemType: ItemType;
  quantity: number;
  unit: string;
  rate: number;
  discountAmount: number;
  gstRate: number; // e.g. 0, 5, 12, 18, 28
}

export interface SupplierDetails {
  name: string;
  tradeName: string;
  gstin: string;
  pan: string;
  address: string;
  city: string;
  stateCode: string;
  pincode: string;
  phone: string;
  email: string;
  logoUrl?: string;
  logoHeight?: number;
  logoAlign?: 'left' | 'center' | 'right';
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branchName: string;
  upiId: string;
}

export interface BuyerDetails {
  name: string;
  gstin: string;
  address: string;
  city: string;
  stateCode: string;
  pincode: string;
  phone: string;
  email: string;
  shippingAddressSame: boolean;
  shippingAddress: string;
  shippingCity: string;
  shippingStateCode: string;
  shippingPincode: string;
}

export interface InvoiceMetadata {
  invoiceType: InvoiceType;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  poNumber: string;
  poDate: string;
  placeOfSupplyStateCode: string;
  reverseCharge: boolean;
  lutNumber: string;
  paymentStatus: PaymentStatus;
  
  // Transport & E-Way Bill Details
  eWayBillNo: string;
  vehicleNo: string;
  transportMode: TransportMode;
  lrRrNo: string;
  dispatchDate: string;
  transporterId?: string;
}

export interface AdditionalCharges {
  shippingFreight: number;
  shippingFreightGstRate: number;
  packagingCharges: number;
  packagingChargesGstRate: number;
  extraDiscount: number;
  manualRoundOff: number;
}

export interface RecurringConfig {
  enabled: boolean;
  frequency: RecurringFrequency;
  interval: number;
  startDate: string;
  nextDate: string;
  templateName: string;
}

export interface RecurringTemplate {
  id: string;
  name: string;
  frequency: RecurringFrequency;
  supplier: SupplierDetails;
  buyer: BuyerDetails;
  items: LineItem[];
  additional: AdditionalCharges;
  terms: string[];
  notes: string;
  currency: CurrencyCode;
}

export interface InvoiceTheme {
  id: string;
  name: string;
  primaryColor: string;
  headerBg: string;
  borderColor: string;
  accentBadgeBg: string;
}

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
  defaultRateToInr: number;
  locale: string;
}

// ==========================================
// CONSTANTS & LOOKUP DATA
// ==========================================

export interface StateInfo {
  code: string;
  name: string;
  isUt?: boolean;
}

export const INDIAN_STATES: StateInfo[] = [
  { code: '01', name: 'Jammu and Kashmir' },
  { code: '02', name: 'Himachal Pradesh' },
  { code: '03', name: 'Punjab' },
  { code: '04', name: 'Chandigarh', isUt: true },
  { code: '05', name: 'Uttarakhand' },
  { code: '06', name: 'Haryana' },
  { code: '07', name: 'Delhi', isUt: true },
  { code: '08', name: 'Rajasthan' },
  { code: '09', name: 'Uttar Pradesh' },
  { code: '10', name: 'Bihar' },
  { code: '11', name: 'Sikkim' },
  { code: '12', name: 'Arunachal Pradesh' },
  { code: '13', name: 'Nagaland' },
  { code: '14', name: 'Manipur' },
  { code: '15', name: 'Mizoram' },
  { code: '16', name: 'Tripura' },
  { code: '17', name: 'Meghalaya' },
  { code: '18', name: 'Assam' },
  { code: '19', name: 'West Bengal' },
  { code: '20', name: 'Jharkhand' },
  { code: '21', name: 'Odisha' },
  { code: '22', name: 'Chhattisgarh' },
  { code: '23', name: 'Madhya Pradesh' },
  { code: '24', name: 'Gujarat' },
  { code: '26', name: 'Dadra and Nagar Haveli and Daman and Diu', isUt: true },
  { code: '27', name: 'Maharashtra' },
  { code: '29', name: 'Karnataka' },
  { code: '30', name: 'Goa' },
  { code: '31', name: 'Lakshadweep', isUt: true },
  { code: '32', name: 'Kerala' },
  { code: '33', name: 'Tamil Nadu' },
  { code: '34', name: 'Puducherry', isUt: true },
  { code: '35', name: 'Andaman and Nicobar Islands', isUt: true },
  { code: '36', name: 'Telangana' },
  { code: '37', name: 'Andhra Pradesh' },
  { code: '38', name: 'Ladakh', isUt: true },
  { code: '97', name: 'Other Territory' },
  { code: '99', name: 'Center Jurisdiction / Foreign' },
];

export const COMMON_UNITS = [
  'NOS', 'PCS', 'HRS', 'KG', 'MTR', 'BOX', 'SET', 'SQFT', 'DAY', 'MONTH', 'LOT', 'OTH'
];

export const GST_RATES = [0, 0.25, 3, 5, 12, 18, 28];

export const POPULAR_HSN_CODES = [
  { code: '998314', desc: 'IT Design & Development Services', rate: 18, type: 'services' as ItemType },
  { code: '998313', desc: 'IT Infrastructure & Support Services', rate: 18, type: 'services' as ItemType },
  { code: '998311', desc: 'Management & Business Consulting Services', rate: 18, type: 'services' as ItemType },
  { code: '998413', desc: 'Web Hosting & Cloud Data Services', rate: 18, type: 'services' as ItemType },
  { code: '998361', desc: 'Advertising & Marketing Services', rate: 18, type: 'services' as ItemType },
  { code: '8471', desc: 'Automatic Data Processing / Computers & Peripherals', rate: 18, type: 'goods' as ItemType },
  { code: '8517', desc: 'Telecommunication Apparatus & Smartphones', rate: 18, type: 'goods' as ItemType },
  { code: '8504', desc: 'Electrical Power Adaptors & Chargers', rate: 18, type: 'goods' as ItemType },
  { code: '9965', desc: 'Goods Transport Agency (GTA) Services', rate: 5, type: 'services' as ItemType },
  { code: '998211', desc: 'Legal Consultancy & Advisory Services', rate: 18, type: 'services' as ItemType },
  { code: '998222', desc: 'Accounting, Auditing & Tax Services', rate: 18, type: 'services' as ItemType },
  { code: '4820', desc: 'Registers, Notebooks & Paper Stationery', rate: 12, type: 'goods' as ItemType },
  { code: '6109', desc: 'T-Shirts, Apparel & Garments', rate: 5, type: 'goods' as ItemType },
  { code: '996331', desc: 'Catering & Food Provision Services', rate: 5, type: 'services' as ItemType },
];

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', defaultRateToInr: 1.0, locale: 'en-IN' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', defaultRateToInr: 83.50, locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', defaultRateToInr: 90.20, locale: 'de-DE' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', defaultRateToInr: 106.80, locale: 'en-GB' },
  AED: { code: 'AED', symbol: 'AED', name: 'UAE Dirham', defaultRateToInr: 22.74, locale: 'ar-AE' },
};

export const EWAY_BILL_DEFAULT_THRESHOLD = 50000; // ₹50,000 as per GST Act

export const THEMES: InvoiceTheme[] = [
  {
    id: 'navy',
    name: 'Classic Navy',
    primaryColor: '#1e3a8a',
    headerBg: 'bg-slate-900 text-white',
    borderColor: 'border-slate-300',
    accentBadgeBg: 'bg-blue-50 text-blue-800 border-blue-200',
  },
  {
    id: 'emerald',
    name: 'Emerald Green',
    primaryColor: '#065f46',
    headerBg: 'bg-emerald-900 text-white',
    borderColor: 'border-emerald-200',
    accentBadgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  {
    id: 'slate',
    name: 'Slate Monochrome',
    primaryColor: '#0f172a',
    headerBg: 'bg-zinc-900 text-white',
    borderColor: 'border-zinc-300',
    accentBadgeBg: 'bg-zinc-100 text-zinc-800 border-zinc-300',
  },
  {
    id: 'indigo',
    name: 'Modern Indigo',
    primaryColor: '#3730a3',
    headerBg: 'bg-indigo-950 text-white',
    borderColor: 'border-indigo-200',
    accentBadgeBg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  },
];

// ==========================================
// HELPER UTILITIES
// ==========================================

export function getStateName(code: string): string {
  const st = INDIAN_STATES.find((s) => s.code === code);
  return st ? `${st.name} (${st.code})` : `State (${code})`;
}

export function extractStateCodeFromGstin(gstin: string): string | null {
  if (!gstin || gstin.trim().length < 2) return null;
  const code = gstin.trim().substring(0, 2);
  const exists = INDIAN_STATES.some((s) => s.code === code);
  return exists ? code : null;
}

export function extractPanFromGstin(gstin: string): string {
  if (!gstin || gstin.trim().length < 12) return '';
  const clean = gstin.trim().toUpperCase();
  const regex = /^[0-9]{2}([A-Z]{5}[0-9]{4}[A-Z]{1})/;
  const match = clean.match(regex);
  return match ? match[1] : '';
}

export function validateGstin(gstin: string): boolean {
  if (!gstin) return false;
  const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return regex.test(gstin.trim().toUpperCase());
}

export function formatCurrency(amount: number, currencyCode: CurrencyCode = 'INR'): string {
  const info = CURRENCIES[currencyCode] || CURRENCIES.INR;
  if (currencyCode === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  }
  return new Intl.NumberFormat(info.locale, {
    style: 'currency',
    currency: info.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

export function numberToIndianWords(num: number): string {
  if (isNaN(num) || num === 0) return 'Rupees Zero Only';

  const units = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertTwoDigits = (n: number): string => {
    if (n < 20) return units[n];
    const ten = Math.floor(n / 10);
    const unit = n % 10;
    return tens[ten] + (unit ? ' ' + units[unit] : '');
  };

  const convertThreeDigits = (n: number): string => {
    const hundred = Math.floor(n / 100);
    const remainder = n % 100;
    let str = '';
    if (hundred > 0) {
      str += units[hundred] + ' Hundred';
    }
    if (remainder > 0) {
      if (str !== '') str += ' ';
      str += convertTwoDigits(remainder);
    }
    return str;
  };

  let integerPart = Math.floor(Math.abs(num));
  const decimalPart = Math.round((Math.abs(num) - integerPart) * 100);

  if (integerPart === 0 && decimalPart === 0) return 'Rupees Zero Only';

  const parts: string[] = [];

  // Crores (1,00,00,000)
  const crores = Math.floor(integerPart / 10000000);
  integerPart %= 10000000;
  if (crores > 0) {
    parts.push(convertThreeDigits(crores) + ' Crore');
  }

  // Lakhs (1,00,000)
  const lakhs = Math.floor(integerPart / 100000);
  integerPart %= 100000;
  if (lakhs > 0) {
    parts.push(convertTwoDigits(lakhs) + ' Lakh');
  }

  // Thousands (1,000)
  const thousands = Math.floor(integerPart / 1000);
  integerPart %= 1000;
  if (thousands > 0) {
    parts.push(convertTwoDigits(thousands) + ' Thousand');
  }

  // Remaining Hundreds/Tens/Units
  if (integerPart > 0) {
    parts.push(convertThreeDigits(integerPart));
  }

  let result = 'Rupees ' + parts.join(' ');
  if (decimalPart > 0) {
    result += ' and ' + convertTwoDigits(decimalPart) + ' Paise';
  }
  result += ' Only';
  return result;
}

// ==========================================
// PRESET SAMPLE DATASETS
// ==========================================

const SAMPLE_TECH_B2B = {
  supplier: {
    name: 'Nyxa Technologies Private Limited',
    tradeName: 'Nyxa Digital Services',
    gstin: '27AAAAA1234A1Z5',
    pan: 'AAAAA1234A',
    address: 'Suite 402, Quantum Tech Park, Bandra Kurla Complex',
    city: 'Mumbai',
    stateCode: '27',
    pincode: '400051',
    phone: '+91 98765 43210',
    email: 'billing@nyxa.io',
    logoHeight: 50,
    logoAlign: 'left' as const,
    bankName: 'HDFC Bank',
    accountNumber: '50200012345678',
    ifscCode: 'HDFC0000240',
    branchName: 'BKC Branch, Mumbai',
    upiId: 'nyxatech@hdfcbank',
  },
  buyer: {
    name: 'Apex Cloud Solutions India Pvt Ltd',
    gstin: '29BBBBB5678B1Z2',
    address: '7th Floor, Cyber Towers, Outer Ring Road, Bellandur',
    city: 'Bengaluru',
    stateCode: '29',
    pincode: '560103',
    phone: '+91 80 4123 9999',
    email: 'accounts@apexcloud.in',
    shippingAddressSame: true,
    shippingAddress: '7th Floor, Cyber Towers, Outer Ring Road, Bellandur',
    shippingCity: 'Bengaluru',
    shippingStateCode: '29',
    shippingPincode: '560103',
  },
  metadata: {
    invoiceType: 'Tax Invoice' as InvoiceType,
    invoiceNumber: 'NYX/2026-27/042',
    invoiceDate: '2026-07-28',
    dueDate: '2026-08-27',
    poNumber: 'PO-APEX-9921',
    poDate: '2026-07-20',
    placeOfSupplyStateCode: '29', // Inter-state (IGST)
    reverseCharge: false,
    lutNumber: '',
    paymentStatus: 'UNPAID' as PaymentStatus,
    eWayBillNo: '351099284102',
    vehicleNo: 'KA-01-MJ-8821',
    transportMode: 'Road' as TransportMode,
    lrRrNo: 'LR-99201',
    dispatchDate: '2026-07-28',
    transporterId: '29TRN998812',
  },
  items: [
    {
      id: '1',
      description: 'Enterprise Web Application Architecture & Cloud API Engineering',
      hsnSac: '998314',
      itemType: 'services' as ItemType,
      quantity: 140,
      unit: 'HRS',
      rate: 1500,
      discountAmount: 0,
      gstRate: 18,
    },
    {
      id: '2',
      description: 'DevOps Automated Deployment Pipeline & Kubernetes Setup',
      hsnSac: '998413',
      itemType: 'services' as ItemType,
      quantity: 1,
      unit: 'SET',
      rate: 45000,
      discountAmount: 5000,
      gstRate: 18,
    },
    {
      id: '3',
      description: 'Monthly Maintenance & SLA Support Subscription',
      hsnSac: '998313',
      itemType: 'services' as ItemType,
      quantity: 1,
      unit: 'MONTH',
      rate: 25000,
      discountAmount: 0,
      gstRate: 18,
    },
  ],
  additional: {
    shippingFreight: 0,
    shippingFreightGstRate: 18,
    packagingCharges: 0,
    packagingChargesGstRate: 18,
    extraDiscount: 2000,
    manualRoundOff: 0,
  },
  terms: [
    'Payment due within 30 days from the invoice date.',
    'Interest @ 18% per annum will be charged on overdue balances.',
    'Please quote invoice number on bank transfer advice.',
    'Subject to Mumbai Jurisdiction.',
  ],
  notes: 'Thank you for choosing Nyxa Technologies! For payment queries, reach out to billing@nyxa.io.',
};

const SAMPLE_HARDWARE_INTRA = {
  supplier: {
    name: 'Nyxa Hardware & Systems',
    tradeName: 'Nyxa Retail',
    gstin: '27CCCCCC9012C1Z8',
    pan: 'CCCCCC9012C',
    address: 'Plot 88, Electronic Zone, MIDC Mahape',
    city: 'Navi Mumbai',
    stateCode: '27',
    pincode: '400710',
    phone: '+91 22 2778 0000',
    email: 'sales@nyxahardware.in',
    logoHeight: 50,
    logoAlign: 'left' as const,
    bankName: 'ICICI Bank',
    accountNumber: '000405012399',
    ifscCode: 'ICIC0000004',
    branchName: 'MIDC Mahape Branch',
    upiId: 'nyxahardware@icici',
  },
  buyer: {
    name: 'Vanguard Media & Studios LLP',
    gstin: '27DDDDD3456D1Z9',
    address: '12th Floor, Trade Tower, Lower Parel',
    city: 'Mumbai',
    stateCode: '27',
    pincode: '400013',
    phone: '+91 98200 11223',
    email: 'procurement@vanguardmedia.com',
    shippingAddressSame: true,
    shippingAddress: '12th Floor, Trade Tower, Lower Parel',
    shippingCity: 'Mumbai',
    shippingStateCode: '27',
    shippingPincode: '400013',
  },
  metadata: {
    invoiceType: 'Tax Invoice' as InvoiceType,
    invoiceNumber: 'HW/2026/881',
    invoiceDate: '2026-07-29',
    dueDate: '2026-08-12',
    poNumber: 'PO-VNG-104',
    poDate: '2026-07-25',
    placeOfSupplyStateCode: '27', // Intra-state (CGST + SGST)
    reverseCharge: false,
    lutNumber: '',
    paymentStatus: 'PAID' as PaymentStatus,
    eWayBillNo: '992019481023',
    vehicleNo: 'MH-43-BP-1234',
    transportMode: 'Road' as TransportMode,
    lrRrNo: 'DTDC-8831',
    dispatchDate: '2026-07-29',
    transporterId: '27DTDC99120',
  },
  items: [
    {
      id: '1',
      description: '4K IPS Workstation Monitor 27-inch Ergonomic',
      hsnSac: '8471',
      itemType: 'goods' as ItemType,
      quantity: 6,
      unit: 'PCS',
      rate: 26500,
      discountAmount: 1500,
      gstRate: 18,
    },
    {
      id: '2',
      description: 'Wireless Ergonomic Keyboard & Precision Mouse Combo',
      hsnSac: '8471',
      itemType: 'goods' as ItemType,
      quantity: 10,
      unit: 'SET',
      rate: 4200,
      discountAmount: 200,
      gstRate: 18,
    },
    {
      id: '3',
      description: 'High-Speed CAT6 Industrial Network Cable Spool (305m)',
      hsnSac: '8517',
      itemType: 'goods' as ItemType,
      quantity: 2,
      unit: 'BOX',
      rate: 6800,
      discountAmount: 0,
      gstRate: 18,
    },
  ],
  additional: {
    shippingFreight: 1200,
    shippingFreightGstRate: 18,
    packagingCharges: 500,
    packagingChargesGstRate: 18,
    extraDiscount: 0,
    manualRoundOff: 0,
  },
  terms: [
    'Goods once sold will not be taken back without original seal.',
    'Warranty as per manufacturer terms.',
    'Subject to Navi Mumbai Jurisdiction.',
  ],
  notes: 'Payment received in full via RTGS. Thank you!',
};

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function GstInvoice() {
  // Navigation & View Mode State
  const [activeTab, setActiveTab] = useState<'edit' | 'preview' | 'thermal'>('edit');
  const [themeId, setThemeId] = useState<string>('navy');
  const [currency, setCurrency] = useState<CurrencyCode>('INR');
  const [showHsnModal, setShowHsnModal] = useState<boolean>(false);
  const [showRecurringModal, setShowRecurringModal] = useState<boolean>(false);
  const [activeItemIndexForHsn, setActiveItemIndexForHsn] = useState<number | null>(null);

  // Exchange Rates (relative to INR: 1 Foreign Unit = X INR)
  const [exchangeRates, setExchangeRates] = useState<Record<CurrencyCode, number>>({
    INR: 1.0,
    USD: 83.50,
    EUR: 90.20,
    GBP: 106.80,
    AED: 22.74,
  });

  // E-Way Bill Threshold Configuration
  const [eWayThreshold, setEWayThreshold] = useState<number>(EWAY_BILL_DEFAULT_THRESHOLD);

  // Core Form State
  const [supplier, setSupplier] = useState<SupplierDetails>(SAMPLE_TECH_B2B.supplier);
  const [buyer, setBuyer] = useState<BuyerDetails>(SAMPLE_TECH_B2B.buyer);
  const [metadata, setMetadata] = useState<InvoiceMetadata>(SAMPLE_TECH_B2B.metadata);
  const [items, setItems] = useState<LineItem[]>(SAMPLE_TECH_B2B.items);
  const [additional, setAdditional] = useState<AdditionalCharges>(SAMPLE_TECH_B2B.additional);
  const [terms, setTerms] = useState<string[]>(SAMPLE_TECH_B2B.terms);
  const [notes, setNotes] = useState<string>(SAMPLE_TECH_B2B.notes);
  const [signatoryName, setSignatoryName] = useState<string>('Authorised Signatory');
  const [signatoryTitle, setSignatoryTitle] = useState<string>('Director / Partner');
  const [signatureUrl, setSignatureUrl] = useState<string>('');

  // Recurring Billing State
  const [recurringConfig, setRecurringConfig] = useState<RecurringConfig>({
    enabled: false,
    frequency: 'Monthly',
    interval: 1,
    startDate: new Date().toISOString().split('T')[0],
    nextDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    templateName: 'Monthly Retainer Billing',
  });

  const [savedTemplates, setSavedTemplates] = useState<RecurringTemplate[]>([]);

  // Load saved templates from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('nyxa_gst_recurring_templates');
      if (stored) {
        setSavedTemplates(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load recurring templates', e);
    }
  }, []);

  // Selected theme configuration
  const currentTheme = useMemo(() => {
    return THEMES.find((t) => t.id === themeId) || THEMES[0];
  }, [themeId]);

  // ==========================================
  // PLACE OF SUPPLY & AUTO GSTIN DETECTION
  // ==========================================

  const handleSupplierGstinChange = (value: string) => {
    const cleanGstin = value.toUpperCase();
    const stateCode = extractStateCodeFromGstin(cleanGstin);
    const pan = extractPanFromGstin(cleanGstin);

    setSupplier((prev) => ({
      ...prev,
      gstin: cleanGstin,
      ...(stateCode ? { stateCode } : {}),
      ...(pan ? { pan } : {}),
    }));
  };

  const handleBuyerGstinChange = (value: string) => {
    const cleanGstin = value.toUpperCase();
    const stateCode = extractStateCodeFromGstin(cleanGstin);

    setBuyer((prev) => ({
      ...prev,
      gstin: cleanGstin,
      ...(stateCode ? { stateCode } : {}),
    }));

    if (stateCode) {
      setMetadata((prev) => ({
        ...prev,
        placeOfSupplyStateCode: stateCode,
      }));
    }
  };

  // Determine Intra-State (CGST + SGST) vs Inter-State (IGST)
  const isIntraState = useMemo(() => {
    return supplier.stateCode === metadata.placeOfSupplyStateCode;
  }, [supplier.stateCode, metadata.placeOfSupplyStateCode]);

  // Validation warnings
  const isSupplierGstinValid = useMemo(() => validateGstin(supplier.gstin), [supplier.gstin]);
  const isBuyerGstinValid = useMemo(() => validateGstin(buyer.gstin), [buyer.gstin]);

  // ==========================================
  // CALCULATION LOGIC
  // ==========================================

  const calculatedItems = useMemo(() => {
    return items.map((item) => {
      const grossAmount = (item.quantity || 0) * (item.rate || 0);
      const taxableValue = Math.max(0, grossAmount - (item.discountAmount || 0));
      const rate = item.gstRate || 0;

      let cgstRate = 0;
      let sgstRate = 0;
      let igstRate = 0;

      let cgstAmount = 0;
      let sgstAmount = 0;
      let igstAmount = 0;

      if (isIntraState) {
        cgstRate = rate / 2;
        sgstRate = rate / 2;
        cgstAmount = (taxableValue * cgstRate) / 100;
        sgstAmount = (taxableValue * sgstRate) / 100;
      } else {
        igstRate = rate;
        igstAmount = (taxableValue * igstRate) / 100;
      }

      const totalTax = cgstAmount + sgstAmount + igstAmount;
      const totalAmount = taxableValue + totalTax;

      return {
        ...item,
        grossAmount,
        taxableValue,
        cgstRate,
        sgstRate,
        igstRate,
        cgstAmount,
        sgstAmount,
        igstAmount,
        totalTax,
        totalAmount,
      };
    });
  }, [items, isIntraState]);

  // HSN/SAC Summary breakdown
  const hsnSummary = useMemo(() => {
    const summaryMap: Record<
      string,
      {
        hsnSac: string;
        gstRate: number;
        taxableValue: number;
        cgstAmount: number;
        sgstAmount: number;
        igstAmount: number;
        totalTax: number;
      }
    > = {};

    calculatedItems.forEach((item) => {
      const key = `${item.hsnSac || 'OTHER'}_${item.gstRate}`;
      if (!summaryMap[key]) {
        summaryMap[key] = {
          hsnSac: item.hsnSac || 'OTHER',
          gstRate: item.gstRate,
          taxableValue: 0,
          cgstAmount: 0,
          sgstAmount: 0,
          igstAmount: 0,
          totalTax: 0,
        };
      }
      summaryMap[key].taxableValue += item.taxableValue;
      summaryMap[key].cgstAmount += item.cgstAmount;
      summaryMap[key].sgstAmount += item.sgstAmount;
      summaryMap[key].igstAmount += item.igstAmount;
      summaryMap[key].totalTax += item.totalTax;
    });

    return Object.values(summaryMap);
  }, [calculatedItems]);

  // Totals calculations (in INR base currency)
  const totals = useMemo(() => {
    const subtotalTaxable = calculatedItems.reduce((acc, item) => acc + item.taxableValue, 0);
    const totalCgst = calculatedItems.reduce((acc, item) => acc + item.cgstAmount, 0);
    const totalSgst = calculatedItems.reduce((acc, item) => acc + item.sgstAmount, 0);
    const totalIgst = calculatedItems.reduce((acc, item) => acc + item.igstAmount, 0);

    // Freight tax
    const freightTaxable = additional.shippingFreight || 0;
    const freightCgst = isIntraState ? (freightTaxable * (additional.shippingFreightGstRate / 2)) / 100 : 0;
    const freightSgst = isIntraState ? (freightTaxable * (additional.shippingFreightGstRate / 2)) / 100 : 0;
    const freightIgst = !isIntraState ? (freightTaxable * additional.shippingFreightGstRate) / 100 : 0;

    // Packaging tax
    const pkgTaxable = additional.packagingCharges || 0;
    const pkgCgst = isIntraState ? (pkgTaxable * (additional.packagingChargesGstRate / 2)) / 100 : 0;
    const pkgSgst = isIntraState ? (pkgTaxable * (additional.packagingChargesGstRate / 2)) / 100 : 0;
    const pkgIgst = !isIntraState ? (pkgTaxable * additional.packagingChargesGstRate) / 100 : 0;

    const aggregateTaxable = subtotalTaxable + freightTaxable + pkgTaxable - (additional.extraDiscount || 0);
    const aggregateCgst = totalCgst + freightCgst + pkgCgst;
    const aggregateSgst = totalSgst + freightSgst + pkgSgst;
    const aggregateIgst = totalIgst + freightIgst + pkgIgst;
    const aggregateTax = aggregateCgst + aggregateSgst + aggregateIgst;

    const unroundedTotal = aggregateTaxable + aggregateTax;
    const roundedGrandTotal = Math.round(unroundedTotal + (additional.manualRoundOff || 0));
    const autoRoundOff = roundedGrandTotal - unroundedTotal;

    return {
      subtotalTaxable,
      aggregateTaxable,
      aggregateCgst,
      aggregateSgst,
      aggregateIgst,
      aggregateTax,
      unroundedTotal,
      autoRoundOff,
      grandTotal: roundedGrandTotal,
    };
  }, [calculatedItems, additional, isIntraState]);

  // Converted Totals based on active currency
  const convertedTotals = useMemo(() => {
    const rateToInr = exchangeRates[currency] || 1;
    return {
      grandTotal: totals.grandTotal / rateToInr,
      aggregateTaxable: totals.aggregateTaxable / rateToInr,
      aggregateTax: totals.aggregateTax / rateToInr,
      rateToInr,
    };
  }, [totals, currency, exchangeRates]);

  // E-Way Bill Threshold Status
  const eWayStatus = useMemo(() => {
    const consignmentValue = totals.grandTotal;
    const isExceeded = consignmentValue > eWayThreshold;
    const percentage = Math.min(100, Math.round((consignmentValue / eWayThreshold) * 100));
    const isApproaching = percentage >= 80 && !isExceeded;
    const isFilled = Boolean(metadata.eWayBillNo && metadata.eWayBillNo.trim().length >= 10);

    return {
      consignmentValue,
      threshold: eWayThreshold,
      isExceeded,
      isApproaching,
      percentage,
      isFilled,
    };
  }, [totals.grandTotal, eWayThreshold, metadata.eWayBillNo]);

  // Grand Total in Words (in INR)
  const amountInWords = useMemo(() => {
    return numberToIndianWords(totals.grandTotal);
  }, [totals.grandTotal]);

  // ==========================================
  // EVENT HANDLERS
  // ==========================================

  const handleAddItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: '',
      hsnSac: '998314',
      itemType: 'services',
      quantity: 1,
      unit: 'NOS',
      rate: 1000,
      discountAmount: 0,
      gstRate: 18,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleItemChange = (id: string, field: keyof LineItem, value: any) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleDuplicateItem = (itemToDuplicate: LineItem) => {
    const newItem: LineItem = {
      ...itemToDuplicate,
      id: Date.now().toString(),
      description: `${itemToDuplicate.description} (Copy)`,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleAddTerm = () => {
    setTerms((prev) => [...prev, 'New payment term / condition statement.']);
  };

  const handleRemoveTerm = (index: number) => {
    setTerms((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTermChange = (index: number, text: string) => {
    setTerms((prev) => prev.map((t, i) => (i === index ? text : t)));
  };

  // Image Upload Handlers
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSupplier((prev) => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignatureUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Preset Loaders
  const loadPreset = (preset: typeof SAMPLE_TECH_B2B) => {
    setSupplier(preset.supplier);
    setBuyer(preset.buyer);
    setMetadata(preset.metadata);
    setItems(preset.items);
    setAdditional(preset.additional);
    setTerms(preset.terms);
    setNotes(preset.notes);
  };

  const handleResetEmpty = () => {
    if (confirm('Are you sure you want to reset all invoice fields?')) {
      setSupplier({
        name: '',
        tradeName: '',
        gstin: '',
        pan: '',
        address: '',
        city: '',
        stateCode: '27',
        pincode: '',
        phone: '',
        email: '',
        logoHeight: 50,
        logoAlign: 'left',
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        branchName: '',
        upiId: '',
      });
      setBuyer({
        name: '',
        gstin: '',
        address: '',
        city: '',
        stateCode: '27',
        pincode: '',
        phone: '',
        email: '',
        shippingAddressSame: true,
        shippingAddress: '',
        shippingCity: '',
        shippingStateCode: '27',
        shippingPincode: '',
      });
      setMetadata({
        invoiceType: 'Tax Invoice',
        invoiceNumber: `INV/${new Date().getFullYear()}/001`,
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
        poNumber: '',
        poDate: '',
        placeOfSupplyStateCode: '27',
        reverseCharge: false,
        lutNumber: '',
        paymentStatus: 'UNPAID',
        eWayBillNo: '',
        vehicleNo: '',
        transportMode: 'Road',
        lrRrNo: '',
        dispatchDate: '',
        transporterId: '',
      });
      setItems([
        {
          id: '1',
          description: '',
          hsnSac: '998314',
          itemType: 'services',
          quantity: 1,
          unit: 'NOS',
          rate: 0,
          discountAmount: 0,
          gstRate: 18,
        },
      ]);
      setAdditional({
        shippingFreight: 0,
        shippingFreightGstRate: 18,
        packagingCharges: 0,
        packagingChargesGstRate: 18,
        extraDiscount: 0,
        manualRoundOff: 0,
      });
    }
  };

  // CSV Export Handler
  const handleExportCsv = () => {
    const escapeCsv = (val: any) => {
      const str = String(val ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    let csvContent = 'GST INVOICE DATA REPORT\n';
    csvContent += `Invoice Number,${escapeCsv(metadata.invoiceNumber)}\n`;
    csvContent += `Invoice Date,${escapeCsv(metadata.invoiceDate)}\n`;
    csvContent += `Due Date,${escapeCsv(metadata.dueDate)}\n`;
    csvContent += `Invoice Type,${escapeCsv(metadata.invoiceType)}\n`;
    csvContent += `Supplier Name,${escapeCsv(supplier.name)}\n`;
    csvContent += `Supplier GSTIN,${escapeCsv(supplier.gstin)}\n`;
    csvContent += `Supplier State,${escapeCsv(getStateName(supplier.stateCode))}\n`;
    csvContent += `Buyer Name,${escapeCsv(buyer.name)}\n`;
    csvContent += `Buyer GSTIN,${escapeCsv(buyer.gstin || 'URP')}\n`;
    csvContent += `Place of Supply,${escapeCsv(getStateName(metadata.placeOfSupplyStateCode))}\n`;
    csvContent += `Supply Type,${isIntraState ? 'INTRA-STATE (CGST+SGST)' : 'INTER-STATE (IGST)'}\n`;
    csvContent += `E-Way Bill No,${escapeCsv(metadata.eWayBillNo || 'N/A')}\n`;
    csvContent += `Currency,${escapeCsv(currency)} (Rate: ${exchangeRates[currency]})\n\n`;

    csvContent += 'LINE ITEMS\n';
    csvContent += '#,Description,HSN/SAC,Item Type,Quantity,Unit,Rate (INR),Discount (INR),Taxable Value (INR),GST %,CGST (INR),SGST (INR),IGST (INR),Total Amount (INR)\n';

    calculatedItems.forEach((item, idx) => {
      const row = [
        idx + 1,
        escapeCsv(item.description),
        escapeCsv(item.hsnSac),
        escapeCsv(item.itemType),
        item.quantity,
        escapeCsv(item.unit),
        item.rate,
        item.discountAmount,
        item.taxableValue.toFixed(2),
        `${item.gstRate}%`,
        item.cgstAmount.toFixed(2),
        item.sgstAmount.toFixed(2),
        item.igstAmount.toFixed(2),
        item.totalAmount.toFixed(2),
      ];
      csvContent += row.join(',') + '\n';
    });

    csvContent += '\nHSN / SAC SUMMARY\n';
    csvContent += 'HSN/SAC,GST %,Taxable Value (INR),CGST (INR),SGST (INR),IGST (INR),Total Tax (INR)\n';
    hsnSummary.forEach((h) => {
      const row = [
        escapeCsv(h.hsnSac),
        `${h.gstRate}%`,
        h.taxableValue.toFixed(2),
        h.cgstAmount.toFixed(2),
        h.sgstAmount.toFixed(2),
        h.igstAmount.toFixed(2),
        h.totalTax.toFixed(2),
      ];
      csvContent += row.join(',') + '\n';
    });

    csvContent += '\nTOTALS SUMMARY\n';
    csvContent += `Subtotal Taxable,${totals.subtotalTaxable.toFixed(2)}\n`;
    csvContent += `Shipping Freight,${additional.shippingFreight.toFixed(2)}\n`;
    csvContent += `Packaging Charges,${additional.packagingCharges.toFixed(2)}\n`;
    csvContent += `Extra Discount,${additional.extraDiscount.toFixed(2)}\n`;
    csvContent += `Total CGST,${totals.aggregateCgst.toFixed(2)}\n`;
    csvContent += `Total SGST,${totals.aggregateSgst.toFixed(2)}\n`;
    csvContent += `Total IGST,${totals.aggregateIgst.toFixed(2)}\n`;
    csvContent += `Round Off,${totals.autoRoundOff.toFixed(2)}\n`;
    csvContent += `Grand Total (INR),${totals.grandTotal.toFixed(2)}\n`;
    if (currency !== 'INR') {
      csvContent += `Grand Total (${currency}),${convertedTotals.grandTotal.toFixed(2)}\n`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GST_Invoice_${metadata.invoiceNumber.replace(/[/\\?%*:|"<>]/g, '_')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export / Import JSON
  const handleExportJson = () => {
    const data = {
      supplier,
      buyer,
      metadata,
      items,
      additional,
      terms,
      notes,
      signatoryName,
      signatoryTitle,
      currency,
      exchangeRates,
      recurringConfig,
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GST_Invoice_${metadata.invoiceNumber.replace(/[/\\?%*:|"<>]/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.supplier) setSupplier(parsed.supplier);
          if (parsed.buyer) setBuyer(parsed.buyer);
          if (parsed.metadata) setMetadata(parsed.metadata);
          if (parsed.items) setItems(parsed.items);
          if (parsed.additional) setAdditional(parsed.additional);
          if (parsed.terms) setTerms(parsed.terms);
          if (parsed.notes) setNotes(parsed.notes);
          if (parsed.signatoryName) setSignatoryName(parsed.signatoryName);
          if (parsed.signatoryTitle) setSignatoryTitle(parsed.signatoryTitle);
          if (parsed.currency) setCurrency(parsed.currency);
          if (parsed.exchangeRates) setExchangeRates(parsed.exchangeRates);
          if (parsed.recurringConfig) setRecurringConfig(parsed.recurringConfig);
          alert('Invoice loaded successfully!');
        } catch (err) {
          alert('Invalid JSON file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  // Save Recurring Template
  const handleSaveRecurringTemplate = () => {
    const namePrompt = prompt('Enter a name for this recurring template:', recurringConfig.templateName || 'Monthly Services');
    if (!namePrompt) return;

    const newTemplate: RecurringTemplate = {
      id: Date.now().toString(),
      name: namePrompt,
      frequency: recurringConfig.frequency,
      supplier,
      buyer,
      items,
      additional,
      terms,
      notes,
      currency,
    };

    const updated = [...savedTemplates, newTemplate];
    setSavedTemplates(updated);
    try {
      localStorage.setItem('nyxa_gst_recurring_templates', JSON.stringify(updated));
      alert(`Recurring template "${namePrompt}" saved!`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLoadRecurringTemplate = (template: RecurringTemplate) => {
    setSupplier(template.supplier);
    setBuyer(template.buyer);
    setItems(template.items);
    setAdditional(template.additional);
    setTerms(template.terms);
    setNotes(template.notes);
    setCurrency(template.currency);
    setRecurringConfig((prev) => ({
      ...prev,
      enabled: true,
      frequency: template.frequency,
      templateName: template.name,
    }));
    setShowRecurringModal(false);
  };

  // Print Action
  const handlePrint = (layout: PrintLayout = activeTab === 'thermal' ? 'thermal' : 'a4') => {
    if (layout === 'thermal') {
      setActiveTab('thermal');
    } else {
      setActiveTab('preview');
    }
    setTimeout(() => {
      window.print();
    }, 250);
  };

  // Apply HSN from modal
  const handleSelectHsn = (hsn: typeof POPULAR_HSN_CODES[0]) => {
    if (activeItemIndexForHsn !== null && items[activeItemIndexForHsn]) {
      const targetId = items[activeItemIndexForHsn].id;
      handleItemChange(targetId, 'hsnSac', hsn.code);
      handleItemChange(targetId, 'gstRate', hsn.rate);
      handleItemChange(targetId, 'itemType', hsn.type);
      if (!items[activeItemIndexForHsn].description) {
        handleItemChange(targetId, 'description', hsn.desc);
      }
    }
    setShowHsnModal(false);
    setActiveItemIndexForHsn(null);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans pb-24">
      {/* DYNAMIC PRINT CSS FOR A4 & 80MM THERMAL */}
      <style>{`
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-area-a4 {
            display: ${activeTab === 'preview' ? 'block' : 'none'} !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .print-area-thermal {
            display: ${activeTab === 'thermal' ? 'block' : 'none'} !important;
            width: 80mm !important;
            max-width: 80mm !important;
            margin: 0 auto !important;
            padding: 2mm !important;
            box-shadow: none !important;
            border: none !important;
          }
          @page {
            size: ${activeTab === 'thermal' ? '80mm auto' : 'A4 portrait'};
            margin: ${activeTab === 'thermal' ? '2mm' : '10mm'};
          }
        }
      `}</style>

      {/* TOP BAR / CONTROL HEADER */}
      <header className="no-print bg-[var(--card-bg)] border-b border-[var(--border)] sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--foreground)] text-[var(--background)] flex items-center justify-center font-extrabold text-xl shadow-md">
              {CURRENCIES[currency]?.symbol || '₹'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight leading-none">GST Invoice & SME Compliance Hub</h1>
                {eWayStatus.isExceeded && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    ⚡ E-Way Bill Required
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Place of Supply, HSN Summary, E-Way Threshold, Multi-Currency & 80mm Thermal Receipts
              </p>
            </div>
          </div>

          {/* Mode Switcher & Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Currency Selector */}
            <div className="flex items-center gap-1 bg-[var(--secondary-bg)] p-1 rounded-xl border border-[var(--border)]">
              <span className="text-[11px] font-semibold text-[var(--muted)] px-1.5">Currency:</span>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="nyxa-select text-xs py-1 px-2 rounded-lg font-bold w-auto"
              >
                {Object.values(CURRENCIES).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} {c.code}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="bg-[var(--secondary-bg)] p-1 rounded-xl border border-[var(--border)] flex items-center gap-1 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('edit')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'edit'
                    ? 'bg-[var(--card-bg)] shadow text-[var(--foreground)] font-bold'
                    : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editor
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'preview'
                    ? 'bg-[var(--card-bg)] shadow text-[var(--foreground)] font-bold'
                    : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                A4 Tax Invoice
              </button>
              <button
                onClick={() => setActiveTab('thermal')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'thermal'
                    ? 'bg-[var(--card-bg)] shadow text-[var(--foreground)] font-bold'
                    : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                80mm Thermal
              </button>
            </div>

            {/* Export CSV Button */}
            <button
              onClick={handleExportCsv}
              className="px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] hover:bg-[var(--secondary-bg)] text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Export invoice data & items to CSV"
            >
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              CSV Export
            </button>

            {/* Print / Save PDF Button */}
            <button
              onClick={() => handlePrint(activeTab === 'thermal' ? 'thermal' : 'a4')}
              className="nyxa-btn nyxa-btn-primary text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print / PDF
            </button>
          </div>
        </div>
      </header>

      {/* QUICK PRESET TOOLBAR */}
      <div className="no-print bg-[var(--secondary-bg)]/80 border-b border-[var(--border)] py-2.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-[var(--muted)] uppercase tracking-wider text-[10px]">Presets:</span>
            <button
              onClick={() => loadPreset(SAMPLE_TECH_B2B)}
              className="px-2.5 py-1 rounded-lg border border-[var(--border)] bg-[var(--card-bg)] hover:bg-[var(--border)] transition-colors font-medium"
            >
              ⚡ Tech Services (Inter-State IGST)
            </button>
            <button
              onClick={() => loadPreset(SAMPLE_HARDWARE_INTRA)}
              className="px-2.5 py-1 rounded-lg border border-[var(--border)] bg-[var(--card-bg)] hover:bg-[var(--border)] transition-colors font-medium"
            >
              📦 Goods Supply (Intra-State CGST+SGST)
            </button>

            {/* Recurring Billing Drawer Button */}
            <button
              onClick={() => setShowRecurringModal(true)}
              className="px-2.5 py-1 rounded-lg border border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors font-medium flex items-center gap-1"
            >
              🔄 Recurring Billing ({savedTemplates.length})
            </button>

            <button
              onClick={handleResetEmpty}
              className="px-2.5 py-1 rounded-lg border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors font-medium"
            >
              🗑️ Clear
            </button>
          </div>

          {/* JSON Export/Import & Theme Selector */}
          <div className="flex items-center gap-2">
            <label className="cursor-pointer px-2.5 py-1 rounded-lg border border-[var(--border)] bg-[var(--card-bg)] hover:bg-[var(--border)] transition-colors font-medium flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Import JSON
              <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
            </label>
            <button
              onClick={handleExportJson}
              className="px-2.5 py-1 rounded-lg border border-[var(--border)] bg-[var(--card-bg)] hover:bg-[var(--border)] transition-colors font-medium flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export JSON
            </button>

            {/* Theme Selector */}
            <select
              value={themeId}
              onChange={(e) => setThemeId(e.target.value)}
              className="nyxa-select text-xs py-1 px-2.5 rounded-lg w-auto"
            >
              {THEMES.map((t) => (
                <option key={t.id} value={t.id}>
                  Theme: {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 py-6">

        {/* ========================================== */}
        {/* TAB 1: EDITOR MODE                         */}
        {/* ========================================== */}
        {activeTab === 'edit' && (
          <div className="space-y-6">

            {/* E-WAY BILL THRESHOLD ALERT & GAUGE BAR */}
            <div
              className={`p-4 rounded-2xl border transition-all ${
                eWayStatus.isExceeded
                  ? 'bg-amber-500/10 border-amber-300 dark:border-amber-700/60'
                  : eWayStatus.isApproaching
                  ? 'bg-yellow-500/10 border-yellow-300'
                  : 'bg-[var(--card-bg)] border-[var(--border)]'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1 flex-1 min-w-[280px]">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">
                      🚚 E-Way Bill Compliance Gauge
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        eWayStatus.isExceeded
                          ? 'bg-red-500 text-white animate-pulse'
                          : eWayStatus.isApproaching
                          ? 'bg-amber-500 text-white'
                          : 'bg-emerald-500 text-white'
                      }`}
                    >
                      {eWayStatus.isExceeded
                        ? 'Mandatory Action Required'
                        : eWayStatus.isApproaching
                        ? 'Approaching Limit'
                        : 'Below Threshold'}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--muted)] m-0">
                    GST Rules mandate an E-Way bill when total consignment value exceeds{' '}
                    <strong>{formatCurrency(eWayThreshold)}</strong>. Current Invoice Total:{' '}
                    <strong className="font-mono text-[var(--foreground)]">
                      {formatCurrency(totals.grandTotal)}
                    </strong>
                  </p>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden mt-2">
                    <div
                      className={`h-full transition-all duration-500 ${
                        eWayStatus.isExceeded
                          ? 'bg-red-500'
                          : eWayStatus.isApproaching
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${eWayStatus.percentage}%` }}
                    />
                  </div>
                </div>

                {/* E-Way Bill Quick Input Fields */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <div>
                    <label className="nyxa-label text-[10px]">E-Way Bill No.</label>
                    <input
                      type="text"
                      placeholder="e.g. 351099284102"
                      value={metadata.eWayBillNo}
                      onChange={(e) =>
                        setMetadata((prev) => ({ ...prev, eWayBillNo: e.target.value }))
                      }
                      className={`nyxa-input font-mono text-xs py-1 px-2.5 w-36 ${
                        eWayStatus.isExceeded && !eWayStatus.isFilled
                          ? 'border-red-400 ring-2 ring-red-400/20'
                          : ''
                      }`}
                    />
                  </div>

                  <div>
                    <label className="nyxa-label text-[10px]">Vehicle No.</label>
                    <input
                      type="text"
                      placeholder="e.g. MH-12-AB-1234"
                      value={metadata.vehicleNo}
                      onChange={(e) =>
                        setMetadata((prev) => ({ ...prev, vehicleNo: e.target.value.toUpperCase() }))
                      }
                      className="nyxa-input font-mono uppercase text-xs py-1 px-2.5 w-32"
                    />
                  </div>

                  <div>
                    <label className="nyxa-label text-[10px]">Transport Mode</label>
                    <select
                      value={metadata.transportMode}
                      onChange={(e) =>
                        setMetadata((prev) => ({
                          ...prev,
                          transportMode: e.target.value as TransportMode,
                        }))
                      }
                      className="nyxa-select text-xs py-1 px-2 w-28"
                    >
                      <option value="Road">Road</option>
                      <option value="Rail">Rail</option>
                      <option value="Air">Air</option>
                      <option value="Ship">Ship</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* MULTI-CURRENCY CONVERSION PANEL */}
            {currency !== 'INR' && (
              <div className="p-4 rounded-2xl border border-indigo-200 bg-indigo-50/60 dark:bg-indigo-950/20 dark:border-indigo-900 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-indigo-900 dark:text-indigo-200">
                      💱 Live Multi-Currency Conversion Preview ({currency})
                    </span>
                    <span className="nyxa-badge bg-white dark:bg-slate-800 text-indigo-700 font-mono">
                      1 {currency} = ₹{exchangeRates[currency]} INR
                    </span>
                  </div>

                  {/* Rate Adjustment */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[var(--muted)]">Custom Rate:</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={exchangeRates[currency]}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 1;
                        setExchangeRates((prev) => ({ ...prev, [currency]: val }));
                      }}
                      className="nyxa-input py-1 px-2 font-mono text-xs w-24 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-indigo-100 shadow-sm space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Taxable Amount</span>
                    <p className="font-mono text-sm font-bold text-indigo-900 dark:text-indigo-300 m-0">
                      {formatCurrency(convertedTotals.aggregateTaxable, currency)}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono m-0">
                      Equivalent to {formatCurrency(totals.aggregateTaxable, 'INR')}
                    </p>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-indigo-100 shadow-sm space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">GST Tax Total</span>
                    <p className="font-mono text-sm font-bold text-indigo-900 dark:text-indigo-300 m-0">
                      {formatCurrency(convertedTotals.aggregateTax, currency)}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono m-0">
                      Equivalent to {formatCurrency(totals.aggregateTax, 'INR')}
                    </p>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-indigo-100 shadow-sm space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Grand Total ({currency})</span>
                    <p className="font-mono text-base font-extrabold text-indigo-700 dark:text-indigo-400 m-0">
                      {formatCurrency(convertedTotals.grandTotal, currency)}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono m-0">
                      Equivalent to {formatCurrency(totals.grandTotal, 'INR')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* SUPPLY TYPE BANNER */}
            <div
              className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4 transition-colors ${
                isIntraState
                  ? 'bg-blue-50/80 border-blue-200 text-blue-900'
                  : 'bg-indigo-50/80 border-indigo-200 text-indigo-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm ${
                    isIntraState ? 'bg-blue-600' : 'bg-indigo-600'
                  }`}
                >
                  {isIntraState ? 'INTRA' : 'INTER'}
                </div>
                <div>
                  <h3 className="text-sm font-bold m-0 flex items-center gap-2">
                    {isIntraState ? 'Intra-State Supply (CGST + SGST)' : 'Inter-State Supply (IGST)'}
                    <span className="nyxa-badge bg-white/80 border-current font-mono text-[10px]">
                      Supplier: {supplier.stateCode} ➔ POS: {metadata.placeOfSupplyStateCode}
                    </span>
                  </h3>
                  <p className="text-xs opacity-80 m-0 mt-0.5">
                    {isIntraState
                      ? 'Supplier and Place of Supply are in the same state. Tax is split 50% CGST and 50% SGST/UTGST.'
                      : 'Supplier and Place of Supply are in different states. Integrated Tax (IGST) is applied at full rate.'}
                  </p>
                </div>
              </div>

              {/* Quick POS Selector */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold whitespace-nowrap">Place of Supply:</label>
                <select
                  value={metadata.placeOfSupplyStateCode}
                  onChange={(e) =>
                    setMetadata((prev) => ({
                      ...prev,
                      placeOfSupplyStateCode: e.target.value,
                    }))
                  }
                  className="nyxa-select text-xs py-1.5 px-3 bg-white border-current rounded-xl font-medium"
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* DOCUMENT METADATA GRID */}
            <div className="nyxa-card gap-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--muted)] border-b pb-2 m-0">
                1. Invoice Overview & Metadata
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="nyxa-label">Invoice Type</label>
                  <select
                    value={metadata.invoiceType}
                    onChange={(e) =>
                      setMetadata((prev) => ({
                        ...prev,
                        invoiceType: e.target.value as InvoiceType,
                      }))
                    }
                    className="nyxa-select font-semibold"
                  >
                    <option value="Tax Invoice">Tax Invoice</option>
                    <option value="Bill of Supply">Bill of Supply</option>
                    <option value="Debit Note">Debit Note</option>
                    <option value="Credit Note">Credit Note</option>
                    <option value="Proforma Invoice">Proforma Invoice</option>
                  </select>
                </div>

                <div>
                  <label className="nyxa-label">Invoice Number</label>
                  <input
                    type="text"
                    value={metadata.invoiceNumber}
                    onChange={(e) =>
                      setMetadata((prev) => ({
                        ...prev,
                        invoiceNumber: e.target.value,
                      }))
                    }
                    className="nyxa-input font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="nyxa-label">Invoice Date</label>
                  <input
                    type="date"
                    value={metadata.invoiceDate}
                    onChange={(e) =>
                      setMetadata((prev) => ({
                        ...prev,
                        invoiceDate: e.target.value,
                      }))
                    }
                    className="nyxa-input"
                  />
                </div>

                <div>
                  <label className="nyxa-label">Due Date</label>
                  <input
                    type="date"
                    value={metadata.dueDate}
                    onChange={(e) =>
                      setMetadata((prev) => ({
                        ...prev,
                        dueDate: e.target.value,
                      }))
                    }
                    className="nyxa-input"
                  />
                </div>

                <div>
                  <label className="nyxa-label">P.O. Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. PO-99210"
                    value={metadata.poNumber}
                    onChange={(e) =>
                      setMetadata((prev) => ({
                        ...prev,
                        poNumber: e.target.value,
                      }))
                    }
                    className="nyxa-input"
                  />
                </div>

                <div>
                  <label className="nyxa-label">P.O. Date</label>
                  <input
                    type="date"
                    value={metadata.poDate}
                    onChange={(e) =>
                      setMetadata((prev) => ({
                        ...prev,
                        poDate: e.target.value,
                      }))
                    }
                    className="nyxa-input"
                  />
                </div>

                <div>
                  <label className="nyxa-label">Payment Status</label>
                  <select
                    value={metadata.paymentStatus}
                    onChange={(e) =>
                      setMetadata((prev) => ({
                        ...prev,
                        paymentStatus: e.target.value as PaymentStatus,
                      }))
                    }
                    className="nyxa-select font-semibold"
                  >
                    <option value="UNPAID">UNPAID</option>
                    <option value="PAID">PAID</option>
                    <option value="PARTIALLY PAID">PARTIALLY PAID</option>
                    <option value="OVERDUE">OVERDUE</option>
                  </select>
                </div>

                <div>
                  <label className="nyxa-label">Reverse Charge Applicable?</label>
                  <select
                    value={metadata.reverseCharge ? 'YES' : 'NO'}
                    onChange={(e) =>
                      setMetadata((prev) => ({
                        ...prev,
                        reverseCharge: e.target.value === 'YES',
                      }))
                    }
                    className="nyxa-select font-semibold"
                  >
                    <option value="NO">No</option>
                    <option value="YES">Yes (RCM)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SUPPLIER & BUYER INFORMATION GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* SUPPLIER DETAILS & LOGO CONTROLS */}
              <div className="nyxa-card gap-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--muted)] m-0 flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    2. Supplier Details & Branding
                  </h2>

                  {/* Logo Upload Button */}
                  <label className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {supplier.logoUrl ? 'Change Logo' : 'Upload Logo'}
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                </div>

                {/* Enhanced Logo Controls Bar */}
                {supplier.logoUrl && (
                  <div className="p-3 bg-[var(--secondary-bg)] rounded-xl border border-[var(--border)] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-html-next-image-img */}
                        <img
                          src={supplier.logoUrl}
                          alt="Supplier Logo"
                          style={{ height: `${supplier.logoHeight || 50}px` }}
                          className="object-contain max-w-[140px]"
                        />
                        <span className="text-xs text-[var(--muted)] font-medium">Logo Preview</span>
                      </div>
                      <button
                        onClick={() => setSupplier((prev) => ({ ...prev, logoUrl: undefined }))}
                        className="text-xs text-red-500 hover:underline font-semibold"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs pt-1 border-t border-[var(--border)]">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[var(--muted)] font-semibold uppercase">Height:</span>
                        <input
                          type="range"
                          min="24"
                          max="100"
                          value={supplier.logoHeight || 50}
                          onChange={(e) =>
                            setSupplier((prev) => ({
                              ...prev,
                              logoHeight: parseInt(e.target.value) || 50,
                            }))
                          }
                          className="w-24 accent-blue-600"
                        />
                        <span className="font-mono text-[10px]">{supplier.logoHeight || 50}px</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[var(--muted)] font-semibold uppercase">Align:</span>
                        <div className="flex items-center border rounded-lg bg-[var(--card-bg)] p-0.5 text-[10px]">
                          <button
                            onClick={() => setSupplier((prev) => ({ ...prev, logoAlign: 'left' }))}
                            className={`px-2 py-0.5 rounded ${supplier.logoAlign === 'left' || !supplier.logoAlign ? 'bg-blue-600 text-white font-bold' : ''}`}
                          >
                            Left
                          </button>
                          <button
                            onClick={() => setSupplier((prev) => ({ ...prev, logoAlign: 'center' }))}
                            className={`px-2 py-0.5 rounded ${supplier.logoAlign === 'center' ? 'bg-blue-600 text-white font-bold' : ''}`}
                          >
                            Center
                          </button>
                          <button
                            onClick={() => setSupplier((prev) => ({ ...prev, logoAlign: 'right' }))}
                            className={`px-2 py-0.5 rounded ${supplier.logoAlign === 'right' ? 'bg-blue-600 text-white font-bold' : ''}`}
                          >
                            Right
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="sm:col-span-2">
                    <label className="nyxa-label">Legal Business Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Nyxa Technologies Pvt Ltd"
                      value={supplier.name}
                      onChange={(e) => setSupplier((prev) => ({ ...prev, name: e.target.value }))}
                      className="nyxa-input font-bold"
                    />
                  </div>

                  <div>
                    <label className="nyxa-label">Supplier GSTIN (15 Chars)</label>
                    <input
                      type="text"
                      maxLength={15}
                      placeholder="27AAAAA1234A1Z5"
                      value={supplier.gstin}
                      onChange={(e) => handleSupplierGstinChange(e.target.value)}
                      className={`nyxa-input font-mono uppercase ${
                        supplier.gstin && !isSupplierGstinValid ? 'border-amber-400 bg-amber-50/30' : ''
                      }`}
                    />
                    {supplier.gstin && !isSupplierGstinValid && (
                      <p className="text-[10px] text-amber-600 mt-1">Check 15-char GSTIN format</p>
                    )}
                  </div>

                  <div>
                    <label className="nyxa-label">State & Code</label>
                    <select
                      value={supplier.stateCode}
                      onChange={(e) => setSupplier((prev) => ({ ...prev, stateCode: e.target.value }))}
                      className="nyxa-select font-medium"
                    >
                      {INDIAN_STATES.map((s) => (
                        <option key={s.code} value={s.code}>
                          {s.code} - {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="nyxa-label">PAN Number</label>
                    <input
                      type="text"
                      maxLength={10}
                      placeholder="AAAAA1234A"
                      value={supplier.pan}
                      onChange={(e) =>
                        setSupplier((prev) => ({
                          ...prev,
                          pan: e.target.value.toUpperCase(),
                        }))
                      }
                      className="nyxa-input font-mono uppercase"
                    />
                  </div>

                  <div>
                    <label className="nyxa-label">Phone Number</label>
                    <input
                      type="text"
                      value={supplier.phone}
                      onChange={(e) => setSupplier((prev) => ({ ...prev, phone: e.target.value }))}
                      className="nyxa-input"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="nyxa-label">Address</label>
                    <input
                      type="text"
                      value={supplier.address}
                      onChange={(e) => setSupplier((prev) => ({ ...prev, address: e.target.value }))}
                      className="nyxa-input"
                    />
                  </div>

                  <div>
                    <label className="nyxa-label">City</label>
                    <input
                      type="text"
                      value={supplier.city}
                      onChange={(e) => setSupplier((prev) => ({ ...prev, city: e.target.value }))}
                      className="nyxa-input"
                    />
                  </div>

                  <div>
                    <label className="nyxa-label">PIN Code</label>
                    <input
                      type="text"
                      value={supplier.pincode}
                      onChange={(e) => setSupplier((prev) => ({ ...prev, pincode: e.target.value }))}
                      className="nyxa-input font-mono"
                    />
                  </div>
                </div>

                {/* BANK DETAILS SUB-ACCORDION */}
                <div className="pt-2 border-t mt-2">
                  <span className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider block mb-2">
                    Bank Transfer Details
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <input
                      type="text"
                      placeholder="Bank Name (e.g. HDFC Bank)"
                      value={supplier.bankName}
                      onChange={(e) => setSupplier((prev) => ({ ...prev, bankName: e.target.value }))}
                      className="nyxa-input"
                    />
                    <input
                      type="text"
                      placeholder="A/C Number"
                      value={supplier.accountNumber}
                      onChange={(e) => setSupplier((prev) => ({ ...prev, accountNumber: e.target.value }))}
                      className="nyxa-input font-mono"
                    />
                    <input
                      type="text"
                      placeholder="IFSC Code"
                      value={supplier.ifscCode}
                      onChange={(e) =>
                        setSupplier((prev) => ({
                          ...prev,
                          ifscCode: e.target.value.toUpperCase(),
                        }))
                      }
                      className="nyxa-input font-mono uppercase"
                    />
                    <input
                      type="text"
                      placeholder="UPI ID (Optional)"
                      value={supplier.upiId}
                      onChange={(e) => setSupplier((prev) => ({ ...prev, upiId: e.target.value }))}
                      className="nyxa-input"
                    />
                  </div>
                </div>
              </div>

              {/* BUYER DETAILS */}
              <div className="nyxa-card gap-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--muted)] m-0 flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    3. Buyer Details (Billed To)
                  </h2>

                  <span className="text-[11px] font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                    POS State: {metadata.placeOfSupplyStateCode}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="sm:col-span-2">
                    <label className="nyxa-label">Customer / Business Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Apex Cloud Solutions Pvt Ltd"
                      value={buyer.name}
                      onChange={(e) => setBuyer((prev) => ({ ...prev, name: e.target.value }))}
                      className="nyxa-input font-bold"
                    />
                  </div>

                  <div>
                    <label className="nyxa-label">Buyer GSTIN (Optional for B2C)</label>
                    <input
                      type="text"
                      maxLength={15}
                      placeholder="29BBBBB5678B1Z2"
                      value={buyer.gstin}
                      onChange={(e) => handleBuyerGstinChange(e.target.value)}
                      className={`nyxa-input font-mono uppercase ${
                        buyer.gstin && !isBuyerGstinValid ? 'border-amber-400 bg-amber-50/30' : ''
                      }`}
                    />
                  </div>

                  <div>
                    <label className="nyxa-label">Buyer State & Code</label>
                    <select
                      value={buyer.stateCode}
                      onChange={(e) => {
                        const code = e.target.value;
                        setBuyer((prev) => ({ ...prev, stateCode: code }));
                        setMetadata((prev) => ({ ...prev, placeOfSupplyStateCode: code }));
                      }}
                      className="nyxa-select font-medium"
                    >
                      {INDIAN_STATES.map((s) => (
                        <option key={s.code} value={s.code}>
                          {s.code} - {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="nyxa-label">Billing Address</label>
                    <input
                      type="text"
                      value={buyer.address}
                      onChange={(e) => setBuyer((prev) => ({ ...prev, address: e.target.value }))}
                      className="nyxa-input"
                    />
                  </div>

                  <div>
                    <label className="nyxa-label">City</label>
                    <input
                      type="text"
                      value={buyer.city}
                      onChange={(e) => setBuyer((prev) => ({ ...prev, city: e.target.value }))}
                      className="nyxa-input"
                    />
                  </div>

                  <div>
                    <label className="nyxa-label">PIN Code</label>
                    <input
                      type="text"
                      value={buyer.pincode}
                      onChange={(e) => setBuyer((prev) => ({ ...prev, pincode: e.target.value }))}
                      className="nyxa-input font-mono"
                    />
                  </div>
                </div>

                {/* SHIPPING ADDRESS TOGGLE */}
                <div className="pt-3 border-t mt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[var(--foreground)]">
                    <input
                      type="checkbox"
                      checked={buyer.shippingAddressSame}
                      onChange={(e) =>
                        setBuyer((prev) => ({
                          ...prev,
                          shippingAddressSame: e.target.checked,
                        }))
                      }
                      className="rounded border-[var(--border)]"
                    />
                    Shipping Address is same as Billing Address
                  </label>

                  {!buyer.shippingAddressSame && (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-[var(--secondary-bg)] p-3 rounded-xl border">
                      <div className="sm:col-span-2">
                        <label className="nyxa-label">Shipping Address</label>
                        <input
                          type="text"
                          value={buyer.shippingAddress}
                          onChange={(e) =>
                            setBuyer((prev) => ({ ...prev, shippingAddress: e.target.value }))
                          }
                          className="nyxa-input"
                        />
                      </div>
                      <div>
                        <label className="nyxa-label">City</label>
                        <input
                          type="text"
                          value={buyer.shippingCity}
                          onChange={(e) =>
                            setBuyer((prev) => ({ ...prev, shippingCity: e.target.value }))
                          }
                          className="nyxa-input"
                        />
                      </div>
                      <div>
                        <label className="nyxa-label">State</label>
                        <select
                          value={buyer.shippingStateCode}
                          onChange={(e) =>
                            setBuyer((prev) => ({ ...prev, shippingStateCode: e.target.value }))
                          }
                          className="nyxa-select"
                        >
                          {INDIAN_STATES.map((s) => (
                            <option key={s.code} value={s.code}>
                              {s.code} - {s.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* LINE ITEMS SECTION */}
            <div className="nyxa-card gap-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--muted)] m-0">
                    4. Line Items & Tax Rates
                  </h2>
                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    Specify HSN/SAC codes, quantities, rates, and GST percentage per item.
                  </p>
                </div>

                <button
                  onClick={handleAddItem}
                  className="nyxa-btn nyxa-btn-primary text-xs py-1.5 px-3 rounded-xl flex items-center gap-1 font-bold shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Item
                </button>
              </div>

              {/* ITEMS TABLE */}
              <div className="overflow-x-auto border rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[var(--secondary-bg)] border-b text-[var(--muted)] font-semibold">
                      <th className="p-2.5 w-10 text-center">#</th>
                      <th className="p-2.5 min-w-[200px]">Item / Description</th>
                      <th className="p-2.5 w-28">HSN/SAC</th>
                      <th className="p-2.5 w-20">Qty</th>
                      <th className="p-2.5 w-24">Unit</th>
                      <th className="p-2.5 w-28">Rate ({CURRENCIES[currency]?.symbol || '₹'})</th>
                      <th className="p-2.5 w-24">Disc ({CURRENCIES[currency]?.symbol || '₹'})</th>
                      <th className="p-2.5 w-24">GST %</th>
                      <th className="p-2.5 w-32 text-right">Taxable</th>
                      <th className="p-2.5 w-32 text-right">Tax</th>
                      <th className="p-2.5 w-32 text-right">Total</th>
                      <th className="p-2.5 w-16 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {calculatedItems.map((item, idx) => {
                      const rateToInr = exchangeRates[currency] || 1;
                      const displayTaxable = item.taxableValue / rateToInr;
                      const displayTax = item.totalTax / rateToInr;
                      const displayTotal = item.totalAmount / rateToInr;

                      return (
                        <tr key={item.id} className="hover:bg-[var(--secondary-bg)]/40 transition-colors">
                          <td className="p-2 text-center font-mono font-medium text-[var(--muted)]">{idx + 1}</td>
                          <td className="p-2">
                            <textarea
                              rows={2}
                              placeholder="Enter item description..."
                              value={item.description}
                              onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                              className="nyxa-textarea text-xs p-1.5 resize-y"
                            />
                          </td>
                          <td className="p-2">
                            <div className="flex flex-col gap-1">
                              <input
                                type="text"
                                placeholder="998314"
                                value={item.hsnSac}
                                onChange={(e) => handleItemChange(item.id, 'hsnSac', e.target.value)}
                                className="nyxa-input font-mono text-xs p-1.5"
                              />
                              <button
                                onClick={() => {
                                  setActiveItemIndexForHsn(idx);
                                  setShowHsnModal(true);
                                }}
                                className="text-[10px] text-blue-600 hover:underline text-left"
                              >
                                🔍 Lookup HSN
                              </button>
                            </div>
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)
                              }
                              className="nyxa-input font-mono text-xs p-1.5"
                            />
                          </td>
                          <td className="p-2">
                            <select
                              value={item.unit}
                              onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                              className="nyxa-select text-xs p-1.5"
                            >
                              {COMMON_UNITS.map((u) => (
                                <option key={u} value={u}>
                                  {u}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="0"
                              value={item.rate}
                              onChange={(e) =>
                                handleItemChange(item.id, 'rate', parseFloat(e.target.value) || 0)
                              }
                              className="nyxa-input font-mono text-xs p-1.5"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="0"
                              value={item.discountAmount}
                              onChange={(e) =>
                                handleItemChange(item.id, 'discountAmount', parseFloat(e.target.value) || 0)
                              }
                              className="nyxa-input font-mono text-xs p-1.5"
                            />
                          </td>
                          <td className="p-2">
                            <select
                              value={item.gstRate}
                              onChange={(e) =>
                                handleItemChange(item.id, 'gstRate', parseFloat(e.target.value) || 0)
                              }
                              className="nyxa-select font-mono font-semibold text-xs p-1.5"
                            >
                              {GST_RATES.map((r) => (
                                <option key={r} value={r}>
                                  {r}%
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-2 text-right font-mono font-medium">
                            {formatCurrency(displayTaxable, currency)}
                          </td>
                          <td className="p-2 text-right font-mono text-[var(--muted)]">
                            {formatCurrency(displayTax, currency)}
                          </td>
                          <td className="p-2 text-right font-mono font-bold">
                            {formatCurrency(displayTotal, currency)}
                          </td>
                          <td className="p-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleDuplicateItem(item)}
                                title="Duplicate"
                                className="p-1 text-[var(--muted)] hover:text-[var(--foreground)]"
                              >
                                📋
                              </button>
                              {items.length > 1 && (
                                <button
                                  onClick={() => handleRemoveItem(item.id)}
                                  title="Remove"
                                  className="p-1 text-red-500 hover:text-red-700"
                                >
                                  🗑️
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ADDITIONAL CHARGES & TOTALS SUMMARY */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* ADDITIONAL CHARGES */}
              <div className="nyxa-card gap-3">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--muted)] border-b pb-2 m-0">
                  5. Freight, Discounts & Extra Charges
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="nyxa-label">Shipping / Freight (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={additional.shippingFreight}
                      onChange={(e) =>
                        setAdditional((prev) => ({
                          ...prev,
                          shippingFreight: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="nyxa-input font-mono"
                    />
                  </div>
                  <div>
                    <label className="nyxa-label">Freight GST %</label>
                    <select
                      value={additional.shippingFreightGstRate}
                      onChange={(e) =>
                        setAdditional((prev) => ({
                          ...prev,
                          shippingFreightGstRate: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="nyxa-select font-mono"
                    >
                      {GST_RATES.map((r) => (
                        <option key={r} value={r}>
                          {r}%
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="nyxa-label">Packaging Charges (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={additional.packagingCharges}
                      onChange={(e) =>
                        setAdditional((prev) => ({
                          ...prev,
                          packagingCharges: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="nyxa-input font-mono"
                    />
                  </div>
                  <div>
                    <label className="nyxa-label">Packaging GST %</label>
                    <select
                      value={additional.packagingChargesGstRate}
                      onChange={(e) =>
                        setAdditional((prev) => ({
                          ...prev,
                          packagingChargesGstRate: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="nyxa-select font-mono"
                    >
                      {GST_RATES.map((r) => (
                        <option key={r} value={r}>
                          {r}%
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="nyxa-label">Overall Extra Discount (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={additional.extraDiscount}
                      onChange={(e) =>
                        setAdditional((prev) => ({
                          ...prev,
                          extraDiscount: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="nyxa-input font-mono"
                    />
                  </div>

                  <div>
                    <label className="nyxa-label">Manual Round Off Adjustment (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={additional.manualRoundOff}
                      onChange={(e) =>
                        setAdditional((prev) => ({
                          ...prev,
                          manualRoundOff: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="nyxa-input font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* TOTALS SUMMARY CARD */}
              <div className="nyxa-card bg-[var(--secondary-bg)]/60 justify-between gap-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--muted)] border-b pb-2 m-0 flex items-center justify-between">
                  <span>Tax & Grand Total Summary</span>
                  {currency !== 'INR' && (
                    <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-mono">
                      Shown in {currency}
                    </span>
                  )}
                </h2>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">Subtotal Taxable Amount:</span>
                    <span className="font-mono font-semibold">
                      {formatCurrency(totals.subtotalTaxable / (exchangeRates[currency] || 1), currency)}
                    </span>
                  </div>

                  {additional.shippingFreight > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[var(--muted)]">Freight Charge:</span>
                      <span className="font-mono">
                        {formatCurrency(additional.shippingFreight / (exchangeRates[currency] || 1), currency)}
                      </span>
                    </div>
                  )}

                  {additional.packagingCharges > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[var(--muted)]">Packaging Charges:</span>
                      <span className="font-mono">
                        {formatCurrency(additional.packagingCharges / (exchangeRates[currency] || 1), currency)}
                      </span>
                    </div>
                  )}

                  {additional.extraDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Extra Discount:</span>
                      <span className="font-mono">
                        -{formatCurrency(additional.extraDiscount / (exchangeRates[currency] || 1), currency)}
                      </span>
                    </div>
                  )}

                  <div className="h-px bg-[var(--border)] my-1" />

                  {isIntraState ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-[var(--muted)]">Total CGST Amount:</span>
                        <span className="font-mono font-medium">
                          {formatCurrency(totals.aggregateCgst / (exchangeRates[currency] || 1), currency)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--muted)]">Total SGST Amount:</span>
                        <span className="font-mono font-medium">
                          {formatCurrency(totals.aggregateSgst / (exchangeRates[currency] || 1), currency)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between">
                      <span className="text-[var(--muted)]">Total IGST Amount:</span>
                      <span className="font-mono font-medium">
                        {formatCurrency(totals.aggregateIgst / (exchangeRates[currency] || 1), currency)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">Auto Round Off:</span>
                    <span className="font-mono">
                      {totals.autoRoundOff >= 0 ? `+${totals.autoRoundOff.toFixed(2)}` : totals.autoRoundOff.toFixed(2)}
                    </span>
                  </div>

                  <div className="h-px bg-[var(--border)] my-2" />

                  <div className="flex justify-between items-center text-base font-bold">
                    <span>Grand Total ({currency}):</span>
                    <span className="font-mono text-lg text-blue-600">
                      {formatCurrency(convertedTotals.grandTotal, currency)}
                    </span>
                  </div>

                  {currency !== 'INR' && (
                    <p className="text-[10px] text-right font-mono text-[var(--muted)] m-0">
                      (Equivalent: {formatCurrency(totals.grandTotal, 'INR')} @ 1 {currency} = ₹{exchangeRates[currency]})
                    </p>
                  )}
                </div>

                {/* Amount in words banner */}
                <div className="p-2.5 bg-[var(--card-bg)] rounded-xl border border-[var(--border)] text-xs italic font-medium text-[var(--muted)]">
                  {amountInWords}
                </div>
              </div>
            </div>

            {/* TERMS, NOTES & SIGNATORY */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* TERMS & NOTES */}
              <div className="nyxa-card gap-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--muted)] m-0">
                    6. Terms & Conditions
                  </h2>
                  <button
                    onClick={handleAddTerm}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    + Add Rule
                  </button>
                </div>

                <div className="space-y-2">
                  {terms.map((term, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[var(--muted)] w-4">{i + 1}.</span>
                      <input
                        type="text"
                        value={term}
                        onChange={(e) => handleTermChange(i, e.target.value)}
                        className="nyxa-input text-xs p-1.5 flex-1"
                      />
                      <button
                        onClick={() => handleRemoveTerm(i)}
                        className="text-red-500 hover:text-red-700 text-xs px-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t mt-2">
                  <label className="nyxa-label">Notes for Customer</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="nyxa-textarea text-xs"
                  />
                </div>
              </div>

              {/* SIGNATORY & STAMP */}
              <div className="nyxa-card gap-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--muted)] border-b pb-2 m-0">
                  7. Authorised Signatory & Digital Signature
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="nyxa-label">Signatory Name</label>
                    <input
                      type="text"
                      value={signatoryName}
                      onChange={(e) => setSignatoryName(e.target.value)}
                      className="nyxa-input font-bold"
                    />
                  </div>

                  <div>
                    <label className="nyxa-label">Signatory Title</label>
                    <input
                      type="text"
                      value={signatoryTitle}
                      onChange={(e) => setSignatoryTitle(e.target.value)}
                      className="nyxa-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="nyxa-label">Upload Signature / Digital Stamp Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSignatureUpload}
                    className="nyxa-input text-xs"
                  />
                </div>

                {signatureUrl && (
                  <div className="p-2 border rounded-xl bg-white w-36 flex flex-col items-center gap-1">
                    {/* eslint-disable-next-html-next-image-img */}
                    <img src={signatureUrl} alt="Signature" className="h-12 object-contain" />
                    <button
                      onClick={() => setSignatureUrl('')}
                      className="text-[10px] text-red-500 hover:underline"
                    >
                      Clear Signature
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 2: A4 PRINT PREVIEW / TAX INVOICE      */}
        {/* ========================================== */}
        {(activeTab === 'preview' || true) && (
          <div className={`print-area-a4 ${activeTab !== 'preview' ? 'hidden no-print' : 'block'}`}>
            <div className="max-w-[210mm] mx-auto bg-white text-slate-900 shadow-2xl rounded-2xl border border-slate-200 p-8 sm:p-10 font-sans text-xs space-y-6">
              
              {/* PREVIEW HEADER WITH LOGO ALIGNMENT */}
              <div className="flex flex-wrap justify-between items-start border-b border-slate-300 pb-6 gap-4">
                <div className="space-y-1 max-w-md">
                  {supplier.logoUrl && (
                    <div className={`mb-3 flex ${supplier.logoAlign === 'center' ? 'justify-center' : supplier.logoAlign === 'right' ? 'justify-end' : 'justify-start'}`}>
                      {/* eslint-disable-next-html-next-image-img */}
                      <img
                        src={supplier.logoUrl}
                        alt="Logo"
                        style={{ height: `${supplier.logoHeight || 50}px` }}
                        className="object-contain"
                      />
                    </div>
                  )}
                  <h2 className="text-xl font-bold tracking-tight text-slate-900">{supplier.name}</h2>
                  {supplier.tradeName && (
                    <p className="text-slate-600 font-medium text-xs">({supplier.tradeName})</p>
                  )}
                  <p className="text-slate-600 text-xs leading-relaxed">{supplier.address}, {supplier.city}, {getStateName(supplier.stateCode)} - {supplier.pincode}</p>
                  <p className="text-slate-600 text-xs">
                    <span className="font-semibold text-slate-900">GSTIN:</span>{' '}
                    <span className="font-mono">{supplier.gstin || 'N/A'}</span> |{' '}
                    <span className="font-semibold text-slate-900">PAN:</span>{' '}
                    <span className="font-mono">{supplier.pan || 'N/A'}</span>
                  </p>
                  {supplier.phone && <p className="text-slate-600 text-xs">Phone: {supplier.phone} | Email: {supplier.email}</p>}
                </div>

                <div className="text-right space-y-2">
                  <span className="inline-block px-3 py-1 bg-slate-900 text-white font-bold text-sm uppercase tracking-widest rounded-md">
                    {metadata.invoiceType}
                  </span>
                  
                  {metadata.paymentStatus && (
                    <div>
                      <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded border uppercase font-mono ${
                        metadata.paymentStatus === 'PAID'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'bg-amber-50 text-amber-700 border-amber-300'
                      }`}>
                        {metadata.paymentStatus}
                      </span>
                    </div>
                  )}

                  <div className="space-y-1 font-mono text-xs text-slate-700 pt-1">
                    <p><span className="text-slate-500 font-sans font-medium">Invoice No:</span> <strong className="text-slate-900">{metadata.invoiceNumber}</strong></p>
                    <p><span className="text-slate-500 font-sans font-medium">Date:</span> {metadata.invoiceDate}</p>
                    <p><span className="text-slate-500 font-sans font-medium">Due Date:</span> {metadata.dueDate}</p>
                    {metadata.poNumber && <p><span className="text-slate-500 font-sans font-medium">P.O. Ref:</span> {metadata.poNumber}</p>}
                  </div>
                </div>
              </div>

              {/* SUPPLY STATUS & E-WAY BILL BADGE BAR */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-wrap items-center justify-between gap-2 text-xs font-medium">
                <div>
                  <span className="text-slate-500">Place of Supply:</span>{' '}
                  <strong className="text-slate-900 font-mono">{getStateName(metadata.placeOfSupplyStateCode)}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Supply Type:</span>{' '}
                  <strong className={`font-mono ${isIntraState ? 'text-blue-700' : 'text-indigo-700'}`}>
                    {isIntraState ? 'INTRA-STATE (CGST + SGST)' : 'INTER-STATE (IGST)'}
                  </strong>
                </div>
                {metadata.eWayBillNo && (
                  <div>
                    <span className="text-slate-500">E-Way Bill No:</span>{' '}
                    <strong className="text-slate-900 font-mono">{metadata.eWayBillNo}</strong>
                  </div>
                )}
                {metadata.reverseCharge && (
                  <div className="text-red-700 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-200 text-[11px]">
                    Reverse Charge Applicable (RCM)
                  </div>
                )}
              </div>

              {/* BUYER & SHIPPING GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-slate-200 pb-6 text-xs">
                {/* Billed To */}
                <div className="space-y-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 pb-1">
                    Billed To (Details of Receiver)
                  </h3>
                  <p className="font-bold text-sm text-slate-900">{buyer.name || 'Customer Name'}</p>
                  <p className="text-slate-600">{buyer.address}</p>
                  <p className="text-slate-600">{buyer.city}, {getStateName(buyer.stateCode)} - {buyer.pincode}</p>
                  <p className="text-slate-700 font-mono mt-1">
                    <strong>GSTIN:</strong> {buyer.gstin || 'URP (Unregistered Person)'}
                  </p>
                </div>

                {/* Shipped To */}
                <div className="space-y-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 pb-1">
                    Shipped To (Consignee)
                  </h3>
                  {buyer.shippingAddressSame ? (
                    <p className="text-slate-500 italic mt-2">Same as Billing Address</p>
                  ) : (
                    <>
                      <p className="font-bold text-sm text-slate-900">{buyer.name}</p>
                      <p className="text-slate-600">{buyer.shippingAddress}</p>
                      <p className="text-slate-600">{buyer.shippingCity}, {getStateName(buyer.shippingStateCode)} - {buyer.shippingPincode}</p>
                    </>
                  )}
                  {metadata.vehicleNo && (
                    <p className="text-slate-700 font-mono text-[11px] pt-1">
                      <strong>Vehicle No:</strong> {metadata.vehicleNo} | Mode: {metadata.transportMode}
                    </p>
                  )}
                </div>
              </div>

              {/* LINE ITEMS TABLE */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px]">
                      <th className="p-2.5 text-center w-8">#</th>
                      <th className="p-2.5">Item & Description</th>
                      <th className="p-2.5 text-center">HSN/SAC</th>
                      <th className="p-2.5 text-center">Qty</th>
                      <th className="p-2.5 text-right">Rate ({CURRENCIES[currency]?.symbol || '₹'})</th>
                      <th className="p-2.5 text-right">Taxable ({CURRENCIES[currency]?.symbol || '₹'})</th>
                      <th className="p-2.5 text-center">GST %</th>
                      <th className="p-2.5 text-right">Tax Amt ({CURRENCIES[currency]?.symbol || '₹'})</th>
                      <th className="p-2.5 text-right">Total ({CURRENCIES[currency]?.symbol || '₹'})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 border-b border-slate-300">
                    {calculatedItems.map((item, idx) => {
                      const rateToInr = exchangeRates[currency] || 1;
                      return (
                        <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                          <td className="p-2.5 text-center font-mono text-slate-500">{idx + 1}</td>
                          <td className="p-2.5 font-medium text-slate-900 leading-normal whitespace-pre-wrap">{item.description}</td>
                          <td className="p-2.5 text-center font-mono text-slate-600">{item.hsnSac}</td>
                          <td className="p-2.5 text-center font-mono">{item.quantity} {item.unit}</td>
                          <td className="p-2.5 text-right font-mono font-medium">
                            {(item.rate / rateToInr).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-2.5 text-right font-mono font-medium">
                            {(item.taxableValue / rateToInr).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-2.5 text-center font-mono">{item.gstRate}%</td>
                          <td className="p-2.5 text-right font-mono text-slate-600">
                            {(item.totalTax / rateToInr).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                            {(item.totalAmount / rateToInr).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* HSN / SAC TAX SUMMARY TABLE */}
              <div className="space-y-1.5 pt-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  HSN / SAC Tax Summary Breakdown
                </h4>
                <table className="w-full text-left text-[11px] border border-slate-200">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 font-semibold text-slate-700">
                      <th className="p-1.5">HSN/SAC</th>
                      <th className="p-1.5 text-right">Taxable Val (₹)</th>
                      {isIntraState ? (
                        <>
                          <th className="p-1.5 text-right">CGST Amt (₹)</th>
                          <th className="p-1.5 text-right">SGST Amt (₹)</th>
                        </>
                      ) : (
                        <th className="p-1.5 text-right">IGST Amt (₹)</th>
                      )}
                      <th className="p-1.5 text-right">Total Tax (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {hsnSummary.map((h, i) => (
                      <tr key={i} className="font-mono">
                        <td className="p-1.5 font-bold">{h.hsnSac} ({h.gstRate}%)</td>
                        <td className="p-1.5 text-right">{h.taxableValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        {isIntraState ? (
                          <>
                            <td className="p-1.5 text-right">{h.cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            <td className="p-1.5 text-right">{h.sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                          </>
                        ) : (
                          <td className="p-1.5 text-right">{h.igstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        )}
                        <td className="p-1.5 text-right font-bold">{h.totalTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* TOTALS & AMOUNT IN WORDS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start pt-2">
                {/* Bank Details & Amount in Words */}
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-1">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Amount in Words (INR)
                    </h4>
                    <p className="font-bold text-slate-900 italic leading-snug">{amountInWords}</p>
                  </div>

                  {supplier.bankName && (
                    <div className="border border-slate-200 p-3 rounded-xl space-y-1 text-slate-700">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Bank Transfer Details
                      </h4>
                      <p><span className="font-medium text-slate-900">Bank:</span> {supplier.bankName}</p>
                      <p><span className="font-medium text-slate-900">A/C No:</span> <span className="font-mono font-bold">{supplier.accountNumber}</span></p>
                      <p><span className="font-medium text-slate-900">IFSC Code:</span> <span className="font-mono font-bold">{supplier.ifscCode}</span></p>
                      {supplier.branchName && <p><span className="font-medium text-slate-900">Branch:</span> {supplier.branchName}</p>}
                      {supplier.upiId && <p><span className="font-medium text-slate-900">UPI ID:</span> <span className="font-mono font-bold text-blue-700">{supplier.upiId}</span></p>}
                    </div>
                  )}
                </div>

                {/* Right Totals Breakdown */}
                <div className="space-y-2 text-xs font-medium border border-slate-200 p-4 rounded-xl bg-slate-50/50">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Taxable Amount:</span>
                    <span className="font-mono font-semibold">{formatCurrency(totals.subtotalTaxable)}</span>
                  </div>

                  {additional.shippingFreight > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Freight & Shipping:</span>
                      <span className="font-mono">{formatCurrency(additional.shippingFreight)}</span>
                    </div>
                  )}

                  {additional.packagingCharges > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Packaging Charges:</span>
                      <span className="font-mono">{formatCurrency(additional.packagingCharges)}</span>
                    </div>
                  )}

                  {additional.extraDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Discount:</span>
                      <span className="font-mono">-{formatCurrency(additional.extraDiscount)}</span>
                    </div>
                  )}

                  <div className="h-px bg-slate-200 my-1" />

                  {isIntraState ? (
                    <>
                      <div className="flex justify-between text-slate-600">
                        <span>Central Tax (CGST):</span>
                        <span className="font-mono">{formatCurrency(totals.aggregateCgst)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>State Tax (SGST):</span>
                        <span className="font-mono">{formatCurrency(totals.aggregateSgst)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-slate-600">
                      <span>Integrated Tax (IGST):</span>
                      <span className="font-mono">{formatCurrency(totals.aggregateIgst)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Round Off:</span>
                    <span className="font-mono">{totals.autoRoundOff >= 0 ? `+${totals.autoRoundOff.toFixed(2)}` : totals.autoRoundOff.toFixed(2)}</span>
                  </div>

                  <div className="h-px bg-slate-900 my-2" />

                  <div className="flex justify-between items-center text-sm font-bold text-slate-900">
                    <span>Grand Total (INR):</span>
                    <span className="font-mono text-base text-slate-900">{formatCurrency(totals.grandTotal, 'INR')}</span>
                  </div>

                  {currency !== 'INR' && (
                    <div className="pt-2 border-t border-slate-300 mt-2 text-right">
                      <p className="text-xs font-bold text-indigo-900 font-mono m-0">
                        Equivalent {currency}: {formatCurrency(convertedTotals.grandTotal, currency)}
                      </p>
                      <p className="text-[10px] text-slate-500 m-0">
                        Exchange Rate: 1 {currency} = ₹{exchangeRates[currency]} INR
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* TERMS & SIGNATURE FOOTER */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-200 items-end">
                {/* Terms */}
                <div className="space-y-1 text-[11px] text-slate-600">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                    Terms & Conditions
                  </h4>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {terms.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                  {notes && <p className="pt-2 text-slate-500 italic">Note: {notes}</p>}
                </div>

                {/* Authorised Signatory */}
                <div className="text-right space-y-2">
                  {signatureUrl ? (
                    <div className="flex justify-end">
                      {/* eslint-disable-next-html-next-image-img */}
                      <img src={signatureUrl} alt="Signature" className="h-14 object-contain" />
                    </div>
                  ) : (
                    <div className="h-14" />
                  )}
                  <div className="pt-2 border-t border-slate-300 inline-block text-right min-w-[180px]">
                    <p className="font-bold text-slate-900 text-xs">{signatoryName}</p>
                    <p className="text-[11px] text-slate-500">{signatoryTitle}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-1">
                      For {supplier.name || 'Supplier'}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 3: 80MM THERMAL RECEIPT VIEW           */}
        {/* ========================================== */}
        {(activeTab === 'thermal' || true) && (
          <div className={`print-area-thermal ${activeTab !== 'thermal' ? 'hidden no-print' : 'block'}`}>
            <div className="max-w-[320px] mx-auto bg-white text-black p-4 font-mono text-[11px] leading-tight border border-slate-300 shadow-xl rounded-lg space-y-3">
              
              {/* Header */}
              <div className="text-center space-y-1 pb-2 border-b border-dashed border-black">
                {supplier.logoUrl && (
                  <div className="flex justify-center mb-1">
                    {/* eslint-disable-next-html-next-image-img */}
                    <img src={supplier.logoUrl} alt="Logo" className="h-10 object-contain" />
                  </div>
                )}
                <p className="font-bold text-sm uppercase">{supplier.name}</p>
                {supplier.tradeName && <p className="text-[10px]">({supplier.tradeName})</p>}
                <p className="text-[10px]">{supplier.address}, {supplier.city}</p>
                <p className="text-[10px]">GSTIN: {supplier.gstin || 'N/A'}</p>
                {supplier.phone && <p className="text-[10px]">Ph: {supplier.phone}</p>}
              </div>

              {/* Title & Info */}
              <div className="text-center font-bold text-xs uppercase my-1">
                *** GST RECEIPT ***
              </div>

              <div className="space-y-0.5 text-[10px] border-b border-dashed border-black pb-2">
                <div className="flex justify-between">
                  <span>No: {metadata.invoiceNumber}</span>
                  <span>{metadata.invoiceDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>POS: {metadata.placeOfSupplyStateCode}</span>
                  <span>{metadata.paymentStatus}</span>
                </div>
                <p className="font-bold pt-0.5">To: {buyer.name || 'Walk-in Customer'}</p>
                {buyer.gstin && <p>Buyer GSTIN: {buyer.gstin}</p>}
              </div>

              {/* Items List */}
              <div className="space-y-1.5 border-b border-dashed border-black pb-2">
                <div className="flex justify-between font-bold border-b border-black pb-0.5 text-[10px]">
                  <span className="w-1/2">ITEM</span>
                  <span className="w-1/4 text-center">QTY</span>
                  <span className="w-1/4 text-right">AMT</span>
                </div>
                {calculatedItems.map((item, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <p className="font-bold truncate">{item.description || 'Item'}</p>
                    <div className="flex justify-between text-[10px] text-slate-800">
                      <span className="w-1/2">HSN:{item.hsnSac} ({item.gstRate}%)</span>
                      <span className="w-1/4 text-center">{item.quantity} x {item.rate}</span>
                      <span className="w-1/4 text-right font-bold">{item.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-1 text-[11px] border-b border-dashed border-black pb-2">
                <div className="flex justify-between">
                  <span>Taxable Subtotal:</span>
                  <span>₹{totals.subtotalTaxable.toFixed(2)}</span>
                </div>

                {isIntraState ? (
                  <>
                    <div className="flex justify-between text-[10px]">
                      <span>CGST Total:</span>
                      <span>₹{totals.aggregateCgst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span>SGST Total:</span>
                      <span>₹{totals.aggregateSgst.toFixed(2)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-[10px]">
                    <span>IGST Total:</span>
                    <span>₹{totals.aggregateIgst.toFixed(2)}</span>
                  </div>
                )}

                {totals.autoRoundOff !== 0 && (
                  <div className="flex justify-between text-[10px]">
                    <span>Round Off:</span>
                    <span>{totals.autoRoundOff >= 0 ? `+${totals.autoRoundOff.toFixed(2)}` : totals.autoRoundOff.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between font-extrabold text-sm pt-1 border-t border-black">
                  <span>TOTAL ({currency}):</span>
                  <span>{formatCurrency(convertedTotals.grandTotal, currency)}</span>
                </div>
              </div>

              {/* UPI Payment Scan QR Placeholder */}
              {supplier.upiId && (
                <div className="text-center py-2 space-y-1 bg-slate-50 border border-slate-200 rounded p-2">
                  <p className="font-bold text-[10px]">SCAN TO PAY VIA UPI</p>
                  <div className="w-24 h-24 mx-auto bg-white border border-black p-1 flex items-center justify-center">
                    <svg className="w-20 h-20" viewBox="0 0 100 100" fill="currentColor">
                      <path d="M0 0h30v30H0zM10 10v10h10V10zM70 0h30v30H70zM80 10v10h10V10zM0 70h30v30H0zM10 80v10h10V80zM40 10h10v10H40zM50 40h10v10H50zM40 70h10v10H40zM70 70h10v10H70zM90 90h10v10H90z" />
                    </svg>
                  </div>
                  <p className="font-mono text-[9px] truncate">{supplier.upiId}</p>
                </div>
              )}

              {/* Thermal Footer */}
              <div className="text-center text-[10px] space-y-0.5 pt-1">
                <p className="font-bold">Thank You For Your Business!</p>
                <p className="text-[9px]">Computer Generated Receipt</p>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* ========================================== */}
      {/* HSN / SAC LOOKUP MODAL                     */}
      {/* ========================================== */}
      {showHsnModal && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold m-0 flex items-center gap-2">
                🔍 HSN / SAC Quick Lookup Table
              </h3>
              <button
                onClick={() => setShowHsnModal(false)}
                className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] font-bold p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[var(--muted)] m-0">
              Select standard Indian GST HSN (Goods) or SAC (Services) code to auto-populate rate and description.
            </p>

            <div className="max-h-80 overflow-y-auto divide-y divide-[var(--border)] border rounded-xl">
              {POPULAR_HSN_CODES.map((hsn, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectHsn(hsn)}
                  className="w-full text-left p-3 hover:bg-[var(--secondary-bg)] transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                        {hsn.code}
                      </span>
                      <span className="font-semibold">{hsn.desc}</span>
                    </div>
                    <span className="text-[10px] text-[var(--muted)] uppercase tracking-wider mt-0.5 block">
                      Type: {hsn.type}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-xs bg-[var(--secondary-bg)] px-2 py-1 rounded border">
                    {hsn.rate}%
                  </span>
                </button>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowHsnModal(false)}
                className="nyxa-btn nyxa-btn-secondary text-xs py-1.5 px-4 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* RECURRING BILLING MANAGER MODAL            */}
      {/* ========================================== */}
      {showRecurringModal && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold m-0 flex items-center gap-2">
                🔄 Recurring Billing & Schedule Manager
              </h3>
              <button
                onClick={() => setShowRecurringModal(false)}
                className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] font-bold p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[var(--muted)] m-0">
              Save current invoice as a recurring template or load saved subscription billing presets.
            </p>

            <div className="p-3 bg-[var(--secondary-bg)] rounded-xl border border-[var(--border)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                  Recurring Schedule Configuration
                </span>
                <button
                  onClick={handleSaveRecurringTemplate}
                  className="nyxa-btn nyxa-btn-primary text-xs py-1 px-3 rounded-lg font-bold"
                >
                  + Save Current as Template
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="nyxa-label">Billing Frequency</label>
                  <select
                    value={recurringConfig.frequency}
                    onChange={(e) =>
                      setRecurringConfig((prev) => ({
                        ...prev,
                        frequency: e.target.value as RecurringFrequency,
                      }))
                    }
                    className="nyxa-select font-semibold"
                  >
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Bi-Annually">Bi-Annually</option>
                    <option value="Annually">Annually</option>
                  </select>
                </div>

                <div>
                  <label className="nyxa-label">Next Billing Date</label>
                  <input
                    type="date"
                    value={recurringConfig.nextDate}
                    onChange={(e) =>
                      setRecurringConfig((prev) => ({ ...prev, nextDate: e.target.value }))
                    }
                    className="nyxa-input"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] block">
                Saved Templates ({savedTemplates.length})
              </span>

              {savedTemplates.length === 0 ? (
                <div className="p-4 text-center text-xs text-[var(--muted)] border border-dashed rounded-xl">
                  No saved templates yet. Click "+ Save Current as Template" above to save your first recurring template.
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto divide-y divide-[var(--border)] border rounded-xl">
                  {savedTemplates.map((tmpl) => (
                    <div
                      key={tmpl.id}
                      className="p-3 flex items-center justify-between gap-3 text-xs hover:bg-[var(--secondary-bg)] transition-colors"
                    >
                      <div>
                        <p className="font-bold m-0">{tmpl.name}</p>
                        <p className="text-[10px] text-[var(--muted)] m-0">
                          Buyer: {tmpl.buyer.name || 'Unspecified'} | Frequency: {tmpl.frequency}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleLoadRecurringTemplate(tmpl)}
                          className="px-2.5 py-1 rounded bg-blue-600 text-white font-bold text-[10px]"
                        >
                          Load Template
                        </button>
                        <button
                          onClick={() => {
                            const updated = savedTemplates.filter((t) => t.id !== tmpl.id);
                            setSavedTemplates(updated);
                            localStorage.setItem('nyxa_gst_recurring_templates', JSON.stringify(updated));
                          }}
                          className="text-red-500 hover:text-red-700 text-xs px-1"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowRecurringModal(false)}
                className="nyxa-btn nyxa-btn-secondary text-xs py-1.5 px-4 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
