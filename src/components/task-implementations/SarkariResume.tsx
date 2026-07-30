'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  FileText,
  Printer,
  Copy,
  Download,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Award,
  User,
  BookOpen,
  Briefcase,
  CheckSquare,
  FileCheck,
  Sparkles,
  Camera,
  RefreshCw,
  Eye,
  Sliders,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';

// --- Interfaces & Types ---
export interface EducationRow {
  id: string;
  examPassed: string;
  boardUniversity: string;
  yearOfPassing: string;
  rollNumber: string;
  marksObtained: string;
  maxMarks: string;
  percentageOrCgpa: string;
  divisionGrade: string;
  subjects: string;
}

export interface ExperienceRow {
  id: string;
  organization: string;
  designation: string;
  serviceType: string;
  fromDate: string;
  toDate: string;
  payScale: string;
  natureOfDuties: string;
}

export interface LanguageRow {
  language: string;
  read: boolean;
  write: boolean;
  speak: boolean;
}

export interface DocumentChecklistItem {
  id: string;
  label: string;
  required: boolean;
  condition?: string;
  checked: boolean;
}

export interface SarkariResumeData {
  templateType: 'UPSC' | 'SSC' | 'IBPS' | 'RRB' | 'GENERAL';

  // Exam Info
  examName: string;
  postAppliedFor: string;
  registrationNo: string;
  rollNo: string;
  examMedium: string;
  preferredCenter: string;

  // Personal Info
  fullName: string;
  fathersName: string;
  mothersName: string;
  dob: string; // YYYY-MM-DD
  ageCutoffDate: string; // Reference date for age calc
  gender: string;
  category: 'GENERAL' | 'OBC' | 'SC' | 'ST' | 'EWS';
  isPwd: boolean;
  pwdType: string;
  pwdPercentage: string;
  isExServiceman: boolean;
  exServicemanServiceYears: string;
  nationality: string;
  religion: string;
  maritalStatus: string;
  identificationMark1: string;
  identificationMark2: string;

  // Contact Info
  mobileNo: string;
  alternateMobile: string;
  email: string;
  idProofType: string;
  idProofNumber: string;

  // Correspondence Address
  corrAddressLine1: string;
  corrAddressLine2: string;
  corrDistrict: string;
  corrState: string;
  corrPincode: string;

  // Permanent Address
  sameAsCorrespondence: boolean;
  permAddressLine1: string;
  permAddressLine2: string;
  permDistrict: string;
  permState: string;
  permPincode: string;

  // Education & Experience
  educationList: EducationRow[];
  experienceList: ExperienceRow[];

  // Additional Details
  languages: LanguageRow[];
  computerKnowledge: string;
  otherQualifications: string;

  // Custom Target Exam Age Limits (for age eligibility checker)
  targetExamMinAge: number;
  targetExamMaxAgeUR: number;

  // Declaration & Footer
  declarationPlace: string;
  declarationDate: string;
  customDeclaration: string;

  // Assets
  photoUrl: string;
  signatureUrl: string;

  // Styling Options
  themeBorder: 'formal' | 'classic' | 'modern';
  showQrBarcode: boolean;
  showWatermark: boolean;
}

// Preset Default Data Generator
const getPresetData = (type: 'UPSC' | 'SSC' | 'IBPS' | 'RRB' | 'GENERAL'): SarkariResumeData => {
  const baseData: SarkariResumeData = {
    templateType: type,
    examName: '',
    postAppliedFor: '',
    registrationNo: 'REG/2026/89412',
    rollNo: '260491823',
    examMedium: 'English',
    preferredCenter: 'New Delhi',

    fullName: 'RAJESH KUMAR SHARMA',
    fathersName: 'SURESH CHANDRA SHARMA',
    mothersName: 'ANITA SHARMA',
    dob: '1998-05-15',
    ageCutoffDate: '2026-01-01',
    gender: 'Male',
    category: 'OBC',
    isPwd: false,
    pwdType: '',
    pwdPercentage: '',
    isExServiceman: false,
    exServicemanServiceYears: '',
    nationality: 'Indian',
    religion: 'Hinduism',
    maritalStatus: 'Unmarried',
    identificationMark1: 'A mole on the left side of the neck',
    identificationMark2: 'A small scar on the right forehead',

    mobileNo: '9876543210',
    alternateMobile: '9876543211',
    email: 'rajesh.sharma.exam@example.com',
    idProofType: 'Aadhaar Card',
    idProofNumber: '5482 9102 3847',

    corrAddressLine1: 'H.No 142/B, Sector 15',
    corrAddressLine2: 'Near Central Park',
    corrDistrict: 'Gautam Buddha Nagar (Noida)',
    corrState: 'Uttar Pradesh',
    corrPincode: '201301',

    sameAsCorrespondence: true,
    permAddressLine1: 'H.No 142/B, Sector 15',
    permAddressLine2: 'Near Central Park',
    permDistrict: 'Gautam Buddha Nagar (Noida)',
    permState: 'Uttar Pradesh',
    permPincode: '201301',

    educationList: [
      {
        id: '1',
        examPassed: '10th / Matriculation',
        boardUniversity: 'CBSE Board, New Delhi',
        yearOfPassing: '2014',
        rollNumber: '6192834',
        marksObtained: '465',
        maxMarks: '500',
        percentageOrCgpa: '93.00%',
        divisionGrade: '1st Division with Distinction',
        subjects: 'English, Hindi, Mathematics, Science, Social Science',
      },
      {
        id: '2',
        examPassed: '12th / Intermediate (10+2)',
        boardUniversity: 'CBSE Board, New Delhi',
        yearOfPassing: '2016',
        rollNumber: '6183920',
        marksObtained: '448',
        maxMarks: '500',
        percentageOrCgpa: '89.60%',
        divisionGrade: '1st Division',
        subjects: 'Physics, Chemistry, Mathematics, English Core, Computer Science',
      },
      {
        id: '3',
        examPassed: 'Graduation (B.Tech / B.Sc / B.A)',
        boardUniversity: 'Delhi Technological University (DTU), Delhi',
        yearOfPassing: '2020',
        rollNumber: '2K16/CO/184',
        marksObtained: '8.45',
        maxMarks: '10.0',
        percentageOrCgpa: '84.50%',
        divisionGrade: '1st Division with Honours',
        subjects: 'Computer Engineering / General Studies',
      },
    ],

    experienceList: [
      {
        id: 'exp-1',
        organization: 'National Informatics Centre (NIC), MeitY',
        designation: 'Assistant Network Project Associate',
        serviceType: 'Contractual / Govt Project',
        fromDate: '2021-07-01',
        toDate: '2023-12-31',
        payScale: 'Rs. 45,000 / month consolidated',
        natureOfDuties: 'Database administration, portal testing, public grievance tracking support',
      },
    ],

    languages: [
      { language: 'Hindi', read: true, write: true, speak: true },
      { language: 'English', read: true, write: true, speak: true },
      { language: 'Sanskrit', read: true, write: false, speak: false },
    ],

    computerKnowledge: 'CCC Certified (NIELIT), Proficient in MS Office, Data Entry, Python, and SQL.',
    otherQualifications: 'NCC "C" Certificate holder (Grade A). Winner of State Level Essay Competition 2019.',

    targetExamMinAge: 21,
    targetExamMaxAgeUR: 32,

    declarationPlace: 'New Delhi',
    declarationDate: new Date().toISOString().split('T')[0],
    customDeclaration:
      'I hereby declare that all the statements made in this application / biodata are true, complete and correct to the best of my knowledge and belief. In the event of any information being found false, incorrect or ineligible being detected before or after the examination/interview, my candidature may be cancelled and legal action may be initiated against me.',

    photoUrl: '',
    signatureUrl: '',

    themeBorder: 'formal',
    showQrBarcode: true,
    showWatermark: true,
  };

  if (type === 'UPSC') {
    baseData.examName = 'Civil Services Examination (UPSC CSE 2026)';
    baseData.postAppliedFor = 'Indian Administrative Service (IAS) / IFS / IPS';
    baseData.targetExamMinAge = 21;
    baseData.targetExamMaxAgeUR = 32;
  } else if (type === 'SSC') {
    baseData.examName = 'Combined Graduate Level Examination (SSC CGL 2026)';
    baseData.postAppliedFor = 'Assistant Section Officer (ASO) / Inspector (CGST)';
    baseData.targetExamMinAge = 18;
    baseData.targetExamMaxAgeUR = 30;
  } else if (type === 'IBPS') {
    baseData.examName = 'IBPS Common Recruitment Process (CRP PO/MT-XIV 2026)';
    baseData.postAppliedFor = 'Probationary Officer / Management Trainee';
    baseData.targetExamMinAge = 20;
    baseData.targetExamMaxAgeUR = 30;
  } else if (type === 'RRB') {
    baseData.examName = 'RRB Non-Technical Popular Categories (NTPC CEN 01/2026)';
    baseData.postAppliedFor = 'Station Master / Goods Train Manager';
    baseData.targetExamMinAge = 18;
    baseData.targetExamMaxAgeUR = 33;
  } else {
    baseData.examName = 'Sarkari Job Recruitment / General Application Biodata';
    baseData.postAppliedFor = 'Executive Officer / Assistant Specialist';
    baseData.targetExamMinAge = 18;
    baseData.targetExamMaxAgeUR = 35;
  }

  return baseData;
};

// Calculate exact age in Years, Months, Days & Numeric Total Days
const calculateExactAgeDetails = (dobString: string, cutoffString: string) => {
  if (!dobString) {
    return { years: 0, months: 0, days: 0, totalYearsFloat: 0, formatted: 'N/A', valid: false };
  }
  const dob = new Date(dobString);
  const cutoff = cutoffString ? new Date(cutoffString) : new Date();

  if (isNaN(dob.getTime()) || isNaN(cutoff.getTime())) {
    return { years: 0, months: 0, days: 0, totalYearsFloat: 0, formatted: 'Invalid Date', valid: false };
  }
  if (dob > cutoff) {
    return { years: 0, months: 0, days: 0, totalYearsFloat: 0, formatted: '0 Y, 0 M, 0 D (DOB in future)', valid: false };
  }

  let years = cutoff.getFullYear() - dob.getFullYear();
  let months = cutoff.getMonth() - dob.getMonth();
  let days = cutoff.getDate() - dob.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonthLastDay = new Date(cutoff.getFullYear(), cutoff.getMonth(), 0).getDate();
    days += prevMonthLastDay;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const totalYearsFloat = years + months / 12 + days / 365.25;

  return {
    years,
    months,
    days,
    totalYearsFloat,
    formatted: `${years} Years, ${months} Months, ${days} Days`,
    valid: true,
  };
};

export default function SarkariResume() {
  const [data, setData] = useState<SarkariResumeData>(() => getPresetData('UPSC'));
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');
  const [activeTab, setActiveTab] = useState<'personal' | 'exam' | 'education' | 'experience' | 'checklist' | 'ageChecker'>('personal');
  const [copySuccess, setCopySuccess] = useState(false);
  const [zoomScale, setZoomScale] = useState<number>(100);

  // Document checklist state
  const [checklist, setChecklist] = useState<DocumentChecklistItem[]>([
    { id: '1', label: '10th / Matriculation Certificate (Date of Birth Proof)', required: true, checked: true },
    { id: '2', label: '12th / Higher Secondary Marksheet & Certificate', required: true, checked: true },
    { id: '3', label: 'Graduation Degree / Final Semester Consolidated Marksheet', required: true, checked: true },
    { id: '4', label: 'Government Identity Proof (Aadhaar / Voter ID / Passport)', required: true, checked: true },
    { id: '5', label: 'Category Certificate (OBC-NCL / SC / ST / EWS) in prescribed format', required: false, condition: 'For Reserved Categories', checked: true },
    { id: '6', label: 'Disability Certificate (Form V/VI/VII) issued by Medical Board', required: false, condition: 'For PwD candidates (>40%)', checked: false },
    { id: '7', label: 'Discharge Book & PPO Copy', required: false, condition: 'For Ex-Servicemen', checked: false },
    { id: '8', label: 'No Objection Certificate (NOC) from current Government employer', required: false, condition: 'For Serving Employees', checked: false },
    { id: '9', label: 'Passport Size Photographs (Recent, Light Background, 3.5x4.5 cm)', required: true, checked: true },
  ]);

  // Handle Photo & Signature Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'photoUrl' | 'signatureUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setData((prev) => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Preset switch
  const handlePresetSelect = (preset: 'UPSC' | 'SSC' | 'IBPS' | 'RRB' | 'GENERAL') => {
    setData(getPresetData(preset));
  };

  // Age Eligibility Calculation based on Relaxation Rules
  const ageEligibility = useMemo(() => {
    const ageInfo = calculateExactAgeDetails(data.dob, data.ageCutoffDate);
    if (!ageInfo.valid) {
      return {
        status: 'INVALID',
        color: 'slate',
        message: 'Invalid DOB or Cut-off date',
        relaxationGivenYears: 0,
        effectiveUpperLimit: data.targetExamMaxAgeUR,
        minAge: data.targetExamMinAge,
        candidateYears: 0,
      };
    }

    // Determine category relaxation
    let categoryRelaxation = 0;
    if (data.category === 'OBC') categoryRelaxation = 3;
    else if (data.category === 'SC' || data.category === 'ST') categoryRelaxation = 5;

    // Determine PwD relaxation
    let pwdRelaxation = 0;
    if (data.isPwd) {
      if (data.category === 'OBC') pwdRelaxation = 13;
      else if (data.category === 'SC' || data.category === 'ST') pwdRelaxation = 15;
      else pwdRelaxation = 10; // General / EWS
    }

    // Determine Ex-Serviceman relaxation
    let exServicemanRelaxation = 0;
    if (data.isExServiceman) {
      const svcYears = parseInt(data.exServicemanServiceYears || '3', 10);
      exServicemanRelaxation = (isNaN(svcYears) ? 3 : svcYears) + 3; // Service length + 3 yrs standard
    }

    // Maximum total relaxation allowed (use highest of category/pwd/ex-service or combine as per standard rules)
    const totalRelaxation = Math.max(categoryRelaxation, pwdRelaxation, exServicemanRelaxation);
    const effectiveUpperLimit = data.targetExamMaxAgeUR + totalRelaxation;
    const minAge = data.targetExamMinAge;

    const candidateYears = ageInfo.years;
    const isUnderAge = candidateYears < minAge;
    const isOverAge = candidateYears >= effectiveUpperLimit && (candidateYears > effectiveUpperLimit || ageInfo.months > 0 || ageInfo.days > 0);

    let status: 'ELIGIBLE' | 'OVER_AGE' | 'UNDER_AGE' = 'ELIGIBLE';
    let color = 'emerald';
    let message = `Eligible! Age (${ageInfo.years}y ${ageInfo.months}m) is within range (${minAge} - ${effectiveUpperLimit} yrs).`;

    if (isUnderAge) {
      status = 'UNDER_AGE';
      color = 'amber';
      message = `Under-age: Candidate is ${ageInfo.years} yrs old. Minimum required age is ${minAge} yrs on cutoff date.`;
    } else if (isOverAge) {
      status = 'OVER_AGE';
      color = 'rose';
      message = `Over-age: Candidate is ${ageInfo.years}y ${ageInfo.months}m old. Upper age limit is ${effectiveUpperLimit} yrs (UR ${data.targetExamMaxAgeUR}y + ${totalRelaxation}y relaxation).`;
    } else if (totalRelaxation > 0) {
      message = `Eligible via Category Relaxation! Age (${ageInfo.years}y ${ageInfo.months}m) fits relaxed limit of ${effectiveUpperLimit} yrs (+${totalRelaxation} yrs added for ${data.category}${data.isPwd ? ' / PwD' : ''}).`;
    }

    return {
      status,
      color,
      message,
      relaxationGivenYears: totalRelaxation,
      effectiveUpperLimit,
      minAge,
      candidateYears: ageInfo.years,
      candidateMonths: ageInfo.months,
      candidateDays: ageInfo.days,
      formattedAge: ageInfo.formatted,
    };
  }, [data.dob, data.ageCutoffDate, data.category, data.isPwd, data.isExServiceman, data.exServicemanServiceYears, data.targetExamMinAge, data.targetExamMaxAgeUR]);

  // Education Helpers
  const addEducationRow = () => {
    const newRow: EducationRow = {
      id: Date.now().toString(),
      examPassed: 'Graduation / Equivalent',
      boardUniversity: '',
      yearOfPassing: new Date().getFullYear().toString(),
      rollNumber: '',
      marksObtained: '',
      maxMarks: '',
      percentageOrCgpa: '',
      divisionGrade: '1st Division',
      subjects: '',
    };
    setData((prev) => ({ ...prev, educationList: [...prev.educationList, newRow] }));
  };

  const updateEducationRow = (id: string, field: keyof EducationRow, value: string) => {
    setData((prev) => ({
      ...prev,
      educationList: prev.educationList.map((row) => {
        if (row.id !== id) return row;
        const updated = { ...row, [field]: value };
        if (field === 'marksObtained' || field === 'maxMarks') {
          const obt = parseFloat(field === 'marksObtained' ? value : row.marksObtained);
          const max = parseFloat(field === 'maxMarks' ? value : row.maxMarks);
          if (!isNaN(obt) && !isNaN(max) && max > 0) {
            updated.percentageOrCgpa = `${((obt / max) * 100).toFixed(2)}%`;
          }
        }
        return updated;
      }),
    }));
  };

  const removeEducationRow = (id: string) => {
    setData((prev) => ({
      ...prev,
      educationList: prev.educationList.filter((row) => row.id !== id),
    }));
  };

  // Experience Helpers
  const addExperienceRow = () => {
    const newRow: ExperienceRow = {
      id: Date.now().toString(),
      organization: '',
      designation: '',
      serviceType: 'Permanent',
      fromDate: '',
      toDate: '',
      payScale: '',
      natureOfDuties: '',
    };
    setData((prev) => ({ ...prev, experienceList: [...prev.experienceList, newRow] }));
  };

  const updateExperienceRow = (id: string, field: keyof ExperienceRow, value: string) => {
    setData((prev) => ({
      ...prev,
      experienceList: prev.experienceList.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    }));
  };

  const removeExperienceRow = (id: string) => {
    setData((prev) => ({
      ...prev,
      experienceList: prev.experienceList.filter((row) => row.id !== id),
    }));
  };

  // Copy Plain Text Format
  const copyAsPlainText = () => {
    const ageInfo = calculateExactAgeDetails(data.dob, data.ageCutoffDate);
    const text = `
====================================================================
GOVERNMENT OF INDIA / OFFICIAL APPLICATION & RECRUITMENT BIODATA
====================================================================
EXAMINATION NAME  : ${data.examName}
POST APPLIED FOR  : ${data.postAppliedFor}
REGISTRATION NO.  : ${data.registrationNo}
ROLL NUMBER       : ${data.rollNo}
EXAM MEDIUM       : ${data.examMedium}
PREFERRED CENTER  : ${data.preferredCenter}

--------------------------------------------------------------------
1. PERSONAL DETAILS
--------------------------------------------------------------------
Full Name         : ${data.fullName}
Father's Name     : ${data.fathersName}
Mother's Name     : ${data.mothersName}
Date of Birth     : ${data.dob}
Age (as of ${data.ageCutoffDate}) : ${ageInfo.formatted}
Gender            : ${data.gender}
Category          : ${data.category} ${data.isPwd ? `(PwD: ${data.pwdType} - ${data.pwdPercentage}%)` : ''}
Ex-Serviceman     : ${data.isExServiceman ? `Yes (${data.exServicemanServiceYears} yrs)` : 'No'}
Nationality       : ${data.nationality}
Religion          : ${data.religion}
Marital Status    : ${data.maritalStatus}
ID Proof (${data.idProofType}) : ${data.idProofNumber}
Identification    : 1) ${data.identificationMark1}
                    2) ${data.identificationMark2}

--------------------------------------------------------------------
2. CONTACT & ADDRESS DETAILS
--------------------------------------------------------------------
Mobile Number     : ${data.mobileNo} (Alt: ${data.alternateMobile || 'N/A'})
Email Address     : ${data.email}
Correspondence    : ${data.corrAddressLine1}, ${data.corrAddressLine2}, ${data.corrDistrict}, ${data.corrState} - ${data.corrPincode}
Permanent Address : ${data.sameAsCorrespondence ? 'Same as Correspondence Address' : `${data.permAddressLine1}, ${data.permAddressLine2}, ${data.permDistrict}, ${data.permState} - ${data.permPincode}`}

--------------------------------------------------------------------
3. EDUCATIONAL QUALIFICATIONS
--------------------------------------------------------------------
${data.educationList
  .map(
    (e, idx) =>
      `${idx + 1}. [${e.examPassed}] Board/Univ: ${e.boardUniversity} | Year: ${e.yearOfPassing} | Roll: ${e.rollNumber} | Marks: ${e.marksObtained}/${e.maxMarks} (${e.percentageOrCgpa}) | Div: ${e.divisionGrade}`
  )
  .join('\n')}

--------------------------------------------------------------------
4. WORK EXPERIENCE
--------------------------------------------------------------------
${data.experienceList.length > 0 ? data.experienceList.map((x, idx) => `${idx + 1}. Org: ${x.organization} | Post: ${x.designation} (${x.serviceType}) | Period: ${x.fromDate} to ${x.toDate} | Duties: ${x.natureOfDuties}`).join('\n') : 'N/A'}

--------------------------------------------------------------------
5. DECLARATION
--------------------------------------------------------------------
${data.customDeclaration}

Place: ${data.declarationPlace}
Date : ${data.declarationDate}
Signature: [${data.fullName}]
====================================================================
    `.trim();

    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  // Download JSON
  const downloadJson = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sarkari_Biodata_${data.fullName.replace(/\s+/g, '_') || 'Applicant'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON
  const importJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedData = JSON.parse(event.target?.result as string);
          if (importedData && typeof importedData === 'object' && importedData.fullName) {
            setData(importedData);
          } else {
            alert('Invalid JSON format for Sarkari Resume.');
          }
        } catch (err) {
          alert('Failed to parse JSON file.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-6 font-sans">
      {/* Print CSS Overrides */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
            background: white !important;
            color: black !important;
          }
          #sarkari-print-document, #sarkari-print-document * {
            visibility: visible;
          }
          #sarkari-print-document {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 24px;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
          .page-break {
            page-break-before: always;
          }
        }
      `}</style>

      {/* Header & Main Bar */}
      <div className="max-w-7xl mx-auto mb-6 no-print">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-500/20 text-amber-300 text-xs font-semibold px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                UPSC / SSC / IBPS / RRB STANDARD FORMATTER
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1.5 flex items-center gap-2">
              Sarkari Exam Eligibility & Application Resume Suite
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Complete category age eligibility calculator, document verification checklist, and standard Indian Government multi-page print layout.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold text-sm transition shadow-lg flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </button>

            <button
              onClick={copyAsPlainText}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold text-sm transition shadow-lg flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              {copySuccess ? 'Copied Text!' : 'Copy Plain Text'}
            </button>

            <button
              onClick={downloadJson}
              className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-2 rounded-lg text-sm transition flex items-center gap-1.5 font-medium"
            >
              <Download className="w-4 h-4" />
              Export JSON
            </button>

            <label className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-2 rounded-lg text-sm cursor-pointer transition flex items-center gap-1.5 font-medium">
              <Upload className="w-4 h-4" />
              Import JSON
              <input type="file" accept=".json" onChange={importJson} className="hidden" />
            </label>
          </div>
        </div>

        {/* Presets Bar & View Mode Controls */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
              Presets:
            </span>
            {(['UPSC', 'SSC', 'IBPS', 'RRB', 'GENERAL'] as const).map((preset) => (
              <button
                key={preset}
                onClick={() => handlePresetSelect(preset)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1 ${
                  data.templateType === preset
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {preset} Format
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Zoom Slider */}
            <div className="hidden sm:flex items-center gap-2 bg-slate-900/90 border border-slate-700 rounded-lg px-2.5 py-1 text-xs">
              <span className="text-slate-400">Zoom:</span>
              <input
                type="range"
                min="60"
                max="130"
                value={zoomScale}
                onChange={(e) => setZoomScale(Number(e.target.value))}
                className="w-20 accent-amber-500 cursor-pointer"
              />
              <span className="font-mono text-amber-300 w-9 text-right">{zoomScale}%</span>
            </div>

            <div className="flex items-center bg-slate-900 rounded-lg p-1 border border-slate-700">
              <button
                onClick={() => setViewMode('editor')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                  viewMode === 'editor' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Form Editor
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition hidden md:block ${
                  viewMode === 'split' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Split View
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                  viewMode === 'preview' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                A4 Document Preview
              </button>
            </div>
          </div>
        </div>

        {/* Category Age Eligibility Summary Card */}
        <div className="mt-4 bg-slate-800/90 border border-slate-700 rounded-xl p-4 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                ageEligibility.status === 'ELIGIBLE'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : ageEligibility.status === 'UNDER_AGE'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}
            >
              {ageEligibility.status === 'ELIGIBLE' ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                <AlertCircle className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Target Exam Eligibility Status:
                </span>
                <span
                  className={`text-xs font-black px-2.5 py-0.5 rounded uppercase tracking-wider ${
                    ageEligibility.status === 'ELIGIBLE'
                      ? 'bg-emerald-500 text-slate-950'
                      : ageEligibility.status === 'UNDER_AGE'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-rose-500 text-white'
                  }`}
                >
                  {ageEligibility.status.replace('_', ' ')}
                </span>
                <span className="text-xs text-slate-400">
                  (Category: <strong className="text-amber-300">{data.category}</strong>
                  {data.isPwd ? ' + PwD' : ''})
                </span>
              </div>
              <p className="text-xs font-medium text-slate-300 mt-1">{ageEligibility.message}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs bg-slate-950/70 border border-slate-700/60 rounded-lg px-4 py-2 shrink-0">
            <div>
              <div className="text-slate-400">Candidate Age</div>
              <div className="font-bold text-amber-300">{ageEligibility.formattedAge}</div>
            </div>
            <div className="h-6 w-px bg-slate-700" />
            <div>
              <div className="text-slate-400">Effective Age Range</div>
              <div className="font-bold text-white">
                {ageEligibility.minAge} - {ageEligibility.effectiveUpperLimit} Years
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT PANE: Form Editor */}
        {(viewMode === 'editor' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'lg:col-span-6' : 'lg:col-span-12'} no-print space-y-5`}>
            {/* Navigation Tabs */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-2 flex overflow-x-auto gap-1">
              {[
                { id: 'personal', label: '1. Personal' },
                { id: 'exam', label: '2. Exam & Contact' },
                { id: 'education', label: '3. Education' },
                { id: 'experience', label: '4. Experience' },
                { id: 'ageChecker', label: '5. Age Calculator' },
                { id: 'checklist', label: '6. Checklist' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition flex-1 text-center ${
                    activeTab === tab.id
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-300 hover:bg-slate-700/60'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 1: Personal Info */}
            {activeTab === 'personal' && (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg space-y-4">
                <h3 className="text-base font-bold text-amber-400 border-b border-slate-700 pb-2 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Personal Details (As per 10th Matriculation Certificate)
                </h3>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Candidate Full Name (IN CAPITAL LETTERS) *
                  </label>
                  <input
                    type="text"
                    value={data.fullName}
                    onChange={(e) => setData({ ...data, fullName: e.target.value.toUpperCase() })}
                    placeholder="e.g. RAJESH KUMAR SHARMA"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-semibold uppercase tracking-wide"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Father's Name *</label>
                    <input
                      type="text"
                      value={data.fathersName}
                      onChange={(e) => setData({ ...data, fathersName: e.target.value.toUpperCase() })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Mother's Name *</label>
                    <input
                      type="text"
                      value={data.mothersName}
                      onChange={(e) => setData({ ...data, mothersName: e.target.value.toUpperCase() })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Date of Birth (DOB) *</label>
                    <input
                      type="date"
                      value={data.dob}
                      onChange={(e) => setData({ ...data, dob: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Age Cut-off Date *</label>
                    <input
                      type="date"
                      value={data.ageCutoffDate}
                      onChange={(e) => setData({ ...data, ageCutoffDate: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Calculated Age</label>
                    <div className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-amber-300 flex items-center h-[38px]">
                      {calculateExactAgeDetails(data.dob, data.ageCutoffDate).formatted}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Gender *</label>
                    <select
                      value={data.gender}
                      onChange={(e) => setData({ ...data, gender: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Transgender">Transgender</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Category *</label>
                    <select
                      value={data.category}
                      onChange={(e) => setData({ ...data, category: e.target.value as any })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-bold text-amber-300"
                    >
                      <option value="GENERAL">General / UR</option>
                      <option value="EWS">EWS</option>
                      <option value="OBC">OBC (Non-Creamy)</option>
                      <option value="SC">Scheduled Caste (SC)</option>
                      <option value="ST">Scheduled Tribe (ST)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Nationality</label>
                    <input
                      type="text"
                      value={data.nationality}
                      onChange={(e) => setData({ ...data, nationality: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Marital Status</label>
                    <select
                      value={data.maritalStatus}
                      onChange={(e) => setData({ ...data, maritalStatus: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="Unmarried">Unmarried</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  </div>
                </div>

                {/* Reservation Details */}
                <div className="bg-slate-900/80 border border-slate-700/80 rounded-lg p-3 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={data.isPwd}
                        onChange={(e) => setData({ ...data, isPwd: e.target.checked })}
                        className="w-4 h-4 rounded accent-amber-500"
                      />
                      Person with Benchmark Disability (PwD)
                    </label>

                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={data.isExServiceman}
                        onChange={(e) => setData({ ...data, isExServiceman: e.target.checked })}
                        className="w-4 h-4 rounded accent-amber-500"
                      />
                      Ex-Serviceman (ESM)
                    </label>
                  </div>

                  {data.isPwd && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                      <input
                        type="text"
                        placeholder="Disability Type (e.g. OH / VI / HI)"
                        value={data.pwdType}
                        onChange={(e) => setData({ ...data, pwdType: e.target.value })}
                        className="bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-white"
                      />
                      <input
                        type="text"
                        placeholder="Disability % (e.g. 40% or 50%)"
                        value={data.pwdPercentage}
                        onChange={(e) => setData({ ...data, pwdPercentage: e.target.value })}
                        className="bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                  )}

                  {data.isExServiceman && (
                    <div className="pt-2 border-t border-slate-800">
                      <input
                        type="number"
                        placeholder="Total Defence Service Years (e.g. 5)"
                        value={data.exServicemanServiceYears}
                        onChange={(e) => setData({ ...data, exServicemanServiceYears: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Identification Mark 1 (Visible)
                    </label>
                    <input
                      type="text"
                      value={data.identificationMark1}
                      onChange={(e) => setData({ ...data, identificationMark1: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Identification Mark 2 (Visible)
                    </label>
                    <input
                      type="text"
                      value={data.identificationMark2}
                      onChange={(e) => setData({ ...data, identificationMark2: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Photo & Signature Upload */}
                <div className="border-t border-slate-700 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Passport Photograph (Standard 3.5cm x 4.5cm)
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5" />
                        Choose Photo Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'photoUrl')}
                          className="hidden"
                        />
                      </label>
                      {data.photoUrl && (
                        <button
                          onClick={() => setData({ ...data, photoUrl: '' })}
                          className="text-xs text-rose-400 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Candidate Signature (Standard 3.5cm x 1.5cm)
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        Choose Signature Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'signatureUrl')}
                          className="hidden"
                        />
                      </label>
                      {data.signatureUrl && (
                        <button
                          onClick={() => setData({ ...data, signatureUrl: '' })}
                          className="text-xs text-rose-400 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Exam & Contact Info */}
            {activeTab === 'exam' && (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg space-y-4">
                <h3 className="text-base font-bold text-amber-400 border-b border-slate-700 pb-2">
                  Exam & Contact Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Examination Name *</label>
                    <input
                      type="text"
                      value={data.examName}
                      onChange={(e) => setData({ ...data, examName: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Post Applied For *</label>
                    <input
                      type="text"
                      value={data.postAppliedFor}
                      onChange={(e) => setData({ ...data, postAppliedFor: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Registration No.</label>
                    <input
                      type="text"
                      value={data.registrationNo}
                      onChange={(e) => setData({ ...data, registrationNo: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Roll Number</label>
                    <input
                      type="text"
                      value={data.rollNo}
                      onChange={(e) => setData({ ...data, rollNo: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Exam Medium</label>
                    <select
                      value={data.examMedium}
                      onChange={(e) => setData({ ...data, examMedium: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Regional Language">Regional Language</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Preferred Center</label>
                    <input
                      type="text"
                      value={data.preferredCenter}
                      onChange={(e) => setData({ ...data, preferredCenter: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Identity Proof & Contact */}
                <div className="border-t border-slate-700 pt-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">ID Proof Type *</label>
                    <select
                      value={data.idProofType}
                      onChange={(e) => setData({ ...data, idProofType: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    >
                      <option value="Aadhaar Card">Aadhaar Card</option>
                      <option value="Voter ID Card">Voter ID Card</option>
                      <option value="PAN Card">PAN Card</option>
                      <option value="Passport">Passport</option>
                      <option value="Driving License">Driving License</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">ID Proof Number *</label>
                    <input
                      type="text"
                      value={data.idProofNumber}
                      onChange={(e) => setData({ ...data, idProofNumber: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Mobile Number *</label>
                    <input
                      type="text"
                      value={data.mobileNo}
                      onChange={(e) => setData({ ...data, mobileNo: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Email Address *</label>
                    <input
                      type="email"
                      value={data.email}
                      onChange={(e) => setData({ ...data, email: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Alternate Mobile Number</label>
                    <input
                      type="text"
                      value={data.alternateMobile}
                      onChange={(e) => setData({ ...data, alternateMobile: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="border-t border-slate-700 pt-3 space-y-3">
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">Correspondence Address</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Address Line 1"
                      value={data.corrAddressLine1}
                      onChange={(e) => setData({ ...data, corrAddressLine1: e.target.value })}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Address Line 2 / Landmark"
                      value={data.corrAddressLine2}
                      onChange={(e) => setData({ ...data, corrAddressLine2: e.target.value })}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="District"
                      value={data.corrDistrict}
                      onChange={(e) => setData({ ...data, corrDistrict: e.target.value })}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={data.corrState}
                      onChange={(e) => setData({ ...data, corrState: e.target.value })}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Pincode"
                      value={data.corrPincode}
                      onChange={(e) => setData({ ...data, corrPincode: e.target.value })}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Education */}
            {activeTab === 'education' && (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                  <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Educational Qualifications (Chronological Order)
                  </h3>
                  <button
                    onClick={addEducationRow}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1 rounded-md text-xs font-bold transition flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Qualification
                  </button>
                </div>

                <div className="space-y-4">
                  {data.educationList.map((edu, idx) => (
                    <div key={edu.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-300">Degree/Exam #{idx + 1}</span>
                        {data.educationList.length > 1 && (
                          <button
                            onClick={() => removeEducationRow(edu.id)}
                            className="text-rose-400 hover:text-rose-300 text-xs flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-400">Exam / Certificate Name</label>
                          <input
                            type="text"
                            value={edu.examPassed}
                            onChange={(e) => updateEducationRow(edu.id, 'examPassed', e.target.value)}
                            placeholder="e.g. 10th / Graduation B.Tech"
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400">Board / University / Institute</label>
                          <input
                            type="text"
                            value={edu.boardUniversity}
                            onChange={(e) => updateEducationRow(edu.id, 'boardUniversity', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-400">Passing Year</label>
                          <input
                            type="text"
                            value={edu.yearOfPassing}
                            onChange={(e) => updateEducationRow(edu.id, 'yearOfPassing', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400">Roll / Reg. No.</label>
                          <input
                            type="text"
                            value={edu.rollNumber}
                            onChange={(e) => updateEducationRow(edu.id, 'rollNumber', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400">Marks Obtained / Max</label>
                          <div className="flex gap-1">
                            <input
                              type="text"
                              placeholder="Obt"
                              value={edu.marksObtained}
                              onChange={(e) => updateEducationRow(edu.id, 'marksObtained', e.target.value)}
                              className="w-1/2 bg-slate-950 border border-slate-700 rounded px-1.5 py-1.5 text-xs text-white"
                            />
                            <input
                              type="text"
                              placeholder="Max"
                              value={edu.maxMarks}
                              onChange={(e) => updateEducationRow(edu.id, 'maxMarks', e.target.value)}
                              className="w-1/2 bg-slate-950 border border-slate-700 rounded px-1.5 py-1.5 text-xs text-white"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400">% / CGPA</label>
                          <input
                            type="text"
                            value={edu.percentageOrCgpa}
                            onChange={(e) => updateEducationRow(edu.id, 'percentageOrCgpa', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-amber-300 font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: Experience */}
            {activeTab === 'experience' && (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                  <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Work Experience (If Applicable)
                  </h3>
                  <button
                    onClick={addExperienceRow}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1 rounded-md text-xs font-bold transition flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Work Experience
                  </button>
                </div>

                <div className="space-y-4">
                  {data.experienceList.map((exp, idx) => (
                    <div key={exp.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-300">Experience #{idx + 1}</span>
                        <button
                          onClick={() => removeExperienceRow(exp.id)}
                          className="text-rose-400 hover:text-rose-300 text-xs flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Organization Name"
                          value={exp.organization}
                          onChange={(e) => updateExperienceRow(exp.id, 'organization', e.target.value)}
                          className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                        />
                        <input
                          type="text"
                          placeholder="Designation / Post Held"
                          value={exp.designation}
                          onChange={(e) => updateExperienceRow(exp.id, 'designation', e.target.value)}
                          className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <input
                          type="date"
                          value={exp.fromDate}
                          onChange={(e) => updateExperienceRow(exp.id, 'fromDate', e.target.value)}
                          className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                        />
                        <input
                          type="date"
                          value={exp.toDate}
                          onChange={(e) => updateExperienceRow(exp.id, 'toDate', e.target.value)}
                          className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                        />
                        <input
                          type="text"
                          placeholder="Pay Scale / Salary"
                          value={exp.payScale}
                          onChange={(e) => updateExperienceRow(exp.id, 'payScale', e.target.value)}
                          className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: Age Calculator Deep Dive */}
            {activeTab === 'ageChecker' && (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg space-y-4">
                <h3 className="text-base font-bold text-amber-400 border-b border-slate-700 pb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Detailed Category Age Eligibility Analysis
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Exam Base Upper Limit (UR Category)
                    </label>
                    <input
                      type="number"
                      value={data.targetExamMaxAgeUR}
                      onChange={(e) => setData({ ...data, targetExamMaxAgeUR: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Exam Minimum Age</label>
                    <input
                      type="number"
                      value={data.targetExamMinAge}
                      onChange={(e) => setData({ ...data, targetExamMinAge: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-bold"
                    />
                  </div>
                </div>

                <div className="bg-slate-950 rounded-xl p-4 border border-slate-700 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Government Relaxation Breakdown Matrix
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Category Relaxation ({data.category}):</span>
                      <span className="font-bold text-amber-300">
                        {data.category === 'OBC' ? '+3 Years' : data.category === 'SC' || data.category === 'ST' ? '+5 Years' : '0 Years (UR / EWS)'}
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">PwD Benchmark Disability Relaxation:</span>
                      <span className="font-bold text-amber-300">
                        {data.isPwd ? (data.category === 'OBC' ? '+13 Years' : data.category === 'SC' || data.category === 'ST' ? '+15 Years' : '+10 Years') : '0 Years'}
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Ex-Serviceman (ESM) Extension:</span>
                      <span className="font-bold text-amber-300">
                        {data.isExServiceman ? `+${(parseInt(data.exServicemanServiceYears || '3', 10) || 3) + 3} Years` : '0 Years'}
                      </span>
                    </div>

                    <div className="flex justify-between py-2 text-sm font-black border-t border-slate-700 text-white">
                      <span>Total Effective Upper Age Limit:</span>
                      <span className="text-emerald-400">{ageEligibility.effectiveUpperLimit} Years</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: Document Checklist */}
            {activeTab === 'checklist' && (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg space-y-4">
                <h3 className="text-base font-bold text-amber-400 border-b border-slate-700 pb-2 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4" />
                  Sarkari Document Verification Checklist
                </h3>

                <div className="space-y-2">
                  {checklist.map((item) => (
                    <label
                      key={item.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border transition cursor-pointer ${
                        item.checked ? 'bg-slate-900 border-emerald-500/40 text-white' : 'bg-slate-900/50 border-slate-700 text-slate-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() =>
                          setChecklist((prev) =>
                            prev.map((c) => (c.id === item.id ? { ...c, checked: !c.checked } : c))
                          )
                        }
                        className="mt-0.5 w-4 h-4 rounded accent-emerald-500"
                      />
                      <div className="flex-1 text-xs">
                        <div className="font-semibold flex items-center gap-2">
                          {item.label}
                          {item.required && (
                            <span className="bg-rose-500/20 text-rose-300 text-[10px] px-1.5 py-0.5 rounded border border-rose-500/30">
                              Mandatory
                            </span>
                          )}
                        </div>
                        {item.condition && <div className="text-[11px] text-amber-400/80 mt-0.5">{item.condition}</div>}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* RIGHT PANE: Multi-Page A4 Document Preview */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'lg:col-span-6' : 'lg:col-span-12'} space-y-4`}>
            <div className="flex items-center justify-between no-print px-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-amber-400" />
                Live Print Preview (Official Standard Form)
              </span>
              <span className="text-xs text-slate-400">A4 Printable • 210mm x 297mm</span>
            </div>

            {/* Scaled Printable Document */}
            <div className="overflow-x-auto pb-4 flex justify-center bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div
                id="sarkari-print-document"
                style={{ transform: `scale(${zoomScale / 100})`, transformOrigin: 'top center' }}
                className="bg-white text-black p-8 shadow-2xl rounded-sm w-[210mm] min-h-[297mm] text-[12px] leading-snug font-serif space-y-4 border-2 border-slate-900 relative"
              >
                {/* Formal Header with Indian Emblem Style Title */}
                <div className="text-center border-b-2 border-black pb-4 relative">
                  <div className="text-xs font-bold tracking-widest uppercase text-slate-700">
                    APPLICATION FORM / BIODATA FOR RECRUITMENT
                  </div>
                  <h2 className="text-xl font-extrabold uppercase mt-1 tracking-tight text-slate-900">
                    {data.examName || 'GOVERNMENT OF INDIA RECRUITMENT'}
                  </h2>
                  <div className="text-sm font-bold text-slate-800 uppercase mt-0.5">
                    POST: {data.postAppliedFor || 'OFFICER / EXECUTIVE CADRE'}
                  </div>

                  {/* QR & Barcode Section */}
                  {data.showQrBarcode && (
                    <div className="absolute top-0 right-0 flex flex-col items-center">
                      <div className="w-16 h-16 bg-slate-100 border border-black p-1 flex items-center justify-center font-mono text-[9px] text-center">
                        [QR CODE]
                        <br />
                        {data.registrationNo.slice(-6)}
                      </div>
                      <span className="text-[9px] font-mono font-bold mt-0.5">{data.rollNo}</span>
                    </div>
                  )}
                </div>

                {/* Candidate Reference Info */}
                <div className="grid grid-cols-2 bg-slate-100 border border-black p-2 text-[11px] font-sans">
                  <div>
                    <strong>REGISTRATION NO:</strong> {data.registrationNo}
                  </div>
                  <div>
                    <strong>ROLL NO:</strong> {data.rollNo}
                  </div>
                  <div>
                    <strong>EXAM MEDIUM:</strong> {data.examMedium}
                  </div>
                  <div>
                    <strong>PREFERRED CENTER:</strong> {data.preferredCenter}
                  </div>
                </div>

                {/* SECTION 1: PERSONAL DETAILS */}
                <div className="border border-black">
                  <div className="bg-slate-200 border-b border-black font-bold uppercase px-2 py-1 text-[11px] flex items-center justify-between">
                    <span>1. CANDIDATE PERSONAL PARTICULARS</span>
                    <span className="text-[10px] font-normal italic">
                      As per Matriculation (10th) Certificate
                    </span>
                  </div>

                  <div className="p-3 grid grid-cols-12 gap-2">
                    <div className="col-span-9 space-y-1.5">
                      <div className="grid grid-cols-3">
                        <span className="font-semibold">Candidate Name:</span>
                        <span className="col-span-2 font-bold uppercase">{data.fullName}</span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="font-semibold">Father's Name:</span>
                        <span className="col-span-2 font-bold uppercase">{data.fathersName}</span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="font-semibold">Mother's Name:</span>
                        <span className="col-span-2 font-bold uppercase">{data.mothersName}</span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="font-semibold">Date of Birth (DOB):</span>
                        <span className="col-span-2 font-bold">{data.dob}</span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="font-semibold">Age (as of {data.ageCutoffDate}):</span>
                        <span className="col-span-2 font-bold text-slate-900">
                          {calculateExactAgeDetails(data.dob, data.ageCutoffDate).formatted}
                        </span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="font-semibold">Category / Gender:</span>
                        <span className="col-span-2 font-bold">
                          {data.category} | {data.gender}
                        </span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="font-semibold">Nationality / Religion:</span>
                        <span className="col-span-2">
                          {data.nationality} | {data.religion}
                        </span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="font-semibold">Identity Proof:</span>
                        <span className="col-span-2 font-mono">
                          {data.idProofType} - {data.idProofNumber}
                        </span>
                      </div>
                    </div>

                    {/* Passport Photo Box */}
                    <div className="col-span-3 flex flex-col items-center justify-start border border-dashed border-slate-600 p-1 bg-slate-50 min-h-[140px]">
                      {data.photoUrl ? (
                        <img
                          src={data.photoUrl}
                          alt="Candidate Passport Photo"
                          className="w-28 h-32 object-cover border border-black"
                        />
                      ) : (
                        <div className="w-28 h-32 border border-slate-400 bg-white flex flex-col items-center justify-center text-center p-2 text-[10px] text-slate-500">
                          PASSPORT PHOTO
                          <br />
                          (3.5 cm x 4.5 cm)
                          <br />
                          Self-Attested
                        </div>
                      )}
                      <span className="text-[9px] mt-1 font-bold">OFFICIAL PHOTO</span>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: CONTACT & ADDRESS */}
                <div className="border border-black">
                  <div className="bg-slate-200 border-b border-black font-bold uppercase px-2 py-1 text-[11px]">
                    2. CONTACT & MAILING ADDRESS
                  </div>
                  <div className="p-3 grid grid-cols-2 gap-4 text-[11px]">
                    <div>
                      <strong className="block border-b border-slate-300 pb-0.5 mb-1">
                        Correspondence Address:
                      </strong>
                      <div>{data.corrAddressLine1}</div>
                      <div>{data.corrAddressLine2}</div>
                      <div>
                        {data.corrDistrict}, {data.corrState} - <strong>{data.corrPincode}</strong>
                      </div>
                      <div className="mt-1">
                        <strong>Mobile:</strong> {data.mobileNo}
                      </div>
                      <div>
                        <strong>Email:</strong> {data.email}
                      </div>
                    </div>

                    <div>
                      <strong className="block border-b border-slate-300 pb-0.5 mb-1">
                        Permanent Address:
                      </strong>
                      {data.sameAsCorrespondence ? (
                        <div className="italic text-slate-600">Same as Correspondence Address</div>
                      ) : (
                        <>
                          <div>{data.permAddressLine1}</div>
                          <div>{data.permAddressLine2}</div>
                          <div>
                            {data.permDistrict}, {data.permState} - <strong>{data.permPincode}</strong>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* SECTION 3: EDUCATIONAL QUALIFICATIONS TABLE */}
                <div className="border border-black">
                  <div className="bg-slate-200 border-b border-black font-bold uppercase px-2 py-1 text-[11px]">
                    3. EDUCATIONAL QUALIFICATIONS (MATRICULATION ONWARDS)
                  </div>
                  <table className="w-full text-left border-collapse text-[10.5px]">
                    <thead>
                      <tr className="bg-slate-100 border-b border-black font-bold">
                        <th className="p-1.5 border-r border-black">Exam Passed</th>
                        <th className="p-1.5 border-r border-black">Board / University</th>
                        <th className="p-1.5 border-r border-black">Year</th>
                        <th className="p-1.5 border-r border-black">Roll No.</th>
                        <th className="p-1.5 border-r border-black">Marks / %</th>
                        <th className="p-1.5">Division</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.educationList.map((edu) => (
                        <tr key={edu.id} className="border-b border-slate-300">
                          <td className="p-1.5 border-r border-black font-bold">{edu.examPassed}</td>
                          <td className="p-1.5 border-r border-black">{edu.boardUniversity}</td>
                          <td className="p-1.5 border-r border-black font-mono">{edu.yearOfPassing}</td>
                          <td className="p-1.5 border-r border-black font-mono">{edu.rollNumber}</td>
                          <td className="p-1.5 border-r border-black font-bold">{edu.percentageOrCgpa}</td>
                          <td className="p-1.5">{edu.divisionGrade}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* SECTION 4: WORK EXPERIENCE TABLE */}
                {data.experienceList.length > 0 && (
                  <div className="border border-black">
                    <div className="bg-slate-200 border-b border-black font-bold uppercase px-2 py-1 text-[11px]">
                      4. WORK EXPERIENCE DETAILS
                    </div>
                    <table className="w-full text-left border-collapse text-[10.5px]">
                      <thead>
                        <tr className="bg-slate-100 border-b border-black font-bold">
                          <th className="p-1.5 border-r border-black">Organization</th>
                          <th className="p-1.5 border-r border-black">Designation</th>
                          <th className="p-1.5 border-r border-black">Period (From - To)</th>
                          <th className="p-1.5 border-r border-black">Pay Scale</th>
                          <th className="p-1.5">Duties</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.experienceList.map((exp) => (
                          <tr key={exp.id} className="border-b border-slate-300">
                            <td className="p-1.5 border-r border-black font-semibold">{exp.organization}</td>
                            <td className="p-1.5 border-r border-black">{exp.designation}</td>
                            <td className="p-1.5 border-r border-black text-[10px]">
                              {exp.fromDate} to {exp.toDate}
                            </td>
                            <td className="p-1.5 border-r border-black">{exp.payScale}</td>
                            <td className="p-1.5 text-[10px]">{exp.natureOfDuties}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* SECTION 5: DECLARATION & SIGNATURE */}
                <div className="border border-black p-3 space-y-3 pt-4">
                  <div className="font-bold uppercase text-[11px]">DECLARATION BY CANDIDATE</div>
                  <p className="text-[10.5px] leading-relaxed text-justify italic">{data.customDeclaration}</p>

                  <div className="flex justify-between items-end pt-6">
                    <div className="text-[11px] space-y-1">
                      <div>
                        <strong>Place:</strong> {data.declarationPlace}
                      </div>
                      <div>
                        <strong>Date:</strong> {data.declarationDate}
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center border-t border-black pt-1 w-48 text-center">
                      {data.signatureUrl ? (
                        <img src={data.signatureUrl} alt="Signature" className="h-10 object-contain mb-1" />
                      ) : (
                        <div className="h-8 border border-dashed border-slate-400 w-full mb-1 flex items-center justify-center text-[9px] text-slate-400">
                          [SIGNATURE HERE]
                        </div>
                      )}
                      <span className="font-bold text-[11px] uppercase">{data.fullName}</span>
                      <span className="text-[9px] text-slate-600">(Signature of Applicant)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
