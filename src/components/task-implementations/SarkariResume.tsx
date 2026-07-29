'use client';

import React, { useState, useEffect, useRef } from 'react';

// --- Interfaces & Types ---
export interface EducationRow {
  id: string;
  examPassed: string; // 10th / Matric, 12th / Inter, Graduation, Post Graduation, Diploma, Others
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
  serviceType: string; // Permanent / Contractual / Ad-hoc / Govt
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

export interface SarkariResumeData {
  // Preset Info
  templateType: 'UPSC' | 'SSC' | 'IBPS' | 'RRB' | 'GENERAL';
  
  // Exam Info
  examName: string;
  postAppliedFor: string;
  registrationNo: string;
  rollNo: string;
  examMedium: string;
  preferredCenter: string;

  // Personal Info
  fullName: string; // Auto uppercase option
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

  // Declaration & Footer
  declarationPlace: string;
  declarationDate: string;
  customDeclaration: string;
  
  // Assets
  photoUrl: string;
  signatureUrl: string;
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

    declarationPlace: 'New Delhi',
    declarationDate: new Date().toISOString().split('T')[0],
    customDeclaration:
      'I hereby declare that all the statements made in this application / biodata are true, complete and correct to the best of my knowledge and belief. In the event of any information being found false, incorrect or ineligible being detected before or after the examination/interview, my candidature may be cancelled and legal action may be initiated against me.',

    photoUrl: '',
    signatureUrl: '',
  };

  if (type === 'UPSC') {
    baseData.examName = 'Civil Services Examination (CSE) 2026';
    baseData.postAppliedFor = 'Indian Administrative Service (IAS) / IFS / IPS';
  } else if (type === 'SSC') {
    baseData.examName = 'Combined Graduate Level Examination (SSC CGL 2026)';
    baseData.postAppliedFor = 'Assistant Section Officer (ASO) / Inspector (CGST)';
  } else if (type === 'IBPS') {
    baseData.examName = 'IBPS Common Recruitment Process (CRP PO/MT-XIV)';
    baseData.postAppliedFor = 'Probationary Officer / Management Trainee';
  } else if (type === 'RRB') {
    baseData.examName = 'RRB Non-Technical Popular Categories (NTPC CEN 01/2026)';
    baseData.postAppliedFor = 'Station Master / Goods Train Manager';
  } else {
    baseData.examName = 'Sarkari Job Recruitment / General Biodata';
    baseData.postAppliedFor = 'General Executive Post';
  }

  return baseData;
};

// Calculate exact age in Years, Months, Days
const calculateExactAge = (dobString: string, cutoffString: string): string => {
  if (!dobString) return 'N/A';
  const dob = new Date(dobString);
  const cutoff = cutoffString ? new Date(cutoffString) : new Date();

  if (isNaN(dob.getTime()) || isNaN(cutoff.getTime())) return 'Invalid Date';
  if (dob > cutoff) return '0 Years, 0 Months, 0 Days (DOB in future)';

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

  return `${years} Years, ${months} Months, ${days} Days`;
};

export default function SarkariResume() {
  const [data, setData] = useState<SarkariResumeData>(() => getPresetData('UPSC'));
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');
  const [activeTab, setActiveTab] = useState<'personal' | 'exam' | 'education' | 'experience' | 'declaration'>('personal');
  const [copySuccess, setCopySuccess] = useState(false);

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
        // Auto calculate percentage if marksObtained & maxMarks are numeric
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

  // Language helpers
  const toggleLanguageOption = (index: number, field: 'read' | 'write' | 'speak') => {
    setData((prev) => {
      const updatedLangs = [...prev.languages];
      updatedLangs[index] = { ...updatedLangs[index], [field]: !updatedLangs[index][field] };
      return { ...prev, languages: updatedLangs };
    });
  };

  // Copy Plain Text Format
  const copyAsPlainText = () => {
    const text = `
====================================================================
GOVERNMENT OF INDIA / RECRUITMENT BIODATA & APPLICATION FORMAT
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
Age (as of ${data.ageCutoffDate}) : ${calculateExactAge(data.dob, data.ageCutoffDate)}
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
            alert('Biodata data imported successfully!');
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

  // Trigger Print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-6 font-sans">
      {/* Print Specific CSS Override */}
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
            padding: 20px;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Header & Controls Bar */}
      <div className="max-w-7xl mx-auto mb-6 no-print">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-500/20 text-amber-300 text-xs font-semibold px-2.5 py-1 rounded border border-amber-500/30">
                OFFICIAL FORMATTER
              </span>
              <span className="text-xs text-slate-400">UPSC • SSC • BANKING • RAILWAYS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Sarkari Biodata & Resume Generator
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Standard Indian Government examination application biodata format with auto-age calculator & print-ready layout.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium text-sm transition shadow-lg flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print / Save PDF
            </button>

            <button
              onClick={copyAsPlainText}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium text-sm transition shadow-lg flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              {copySuccess ? 'Copied Text!' : 'Copy Text Format'}
            </button>

            <button
              onClick={downloadJson}
              className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-2 rounded-lg text-sm transition flex items-center gap-1.5"
              title="Download Data JSON"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export JSON
            </button>

            <label className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-2 rounded-lg text-sm cursor-pointer transition flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Import JSON
              <input type="file" accept=".json" onChange={importJson} className="hidden" />
            </label>
          </div>
        </div>

        {/* Preset Selector & View Switcher Bar */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
              Load Preset Exam:
            </span>
            {(['UPSC', 'SSC', 'IBPS', 'RRB', 'GENERAL'] as const).map((preset) => (
              <button
                key={preset}
                onClick={() => handlePresetSelect(preset)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  data.templateType === preset
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {preset === 'GENERAL' ? 'Standard Biodata' : `${preset} Format`}
              </button>
            ))}
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

      {/* Main Container */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT PANE: Form Editor */}
        {(viewMode === 'editor' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'lg:col-span-6' : 'lg:col-span-12'} no-print space-y-5`}>
            {/* Form Section Navigation Tabs */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-2 flex overflow-x-auto gap-1">
              {[
                { id: 'personal', label: '1. Personal Info' },
                { id: 'exam', label: '2. Exam & Contact' },
                { id: 'education', label: '3. Education' },
                { id: 'experience', label: '4. Experience' },
                { id: 'declaration', label: '5. Declaration & Photo' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition flex-1 text-center ${
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
                <h3 className="text-base font-bold text-amber-400 border-b border-slate-700 pb-2">
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
                    <label className="block text-xs font-medium text-slate-300 mb-1">Cut-off Reference Date</label>
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
                      {calculateExactAge(data.dob, data.ageCutoffDate)}
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
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-semibold"
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

                {/* Reservation / Special Category Checks */}
                <div className="bg-slate-900/80 border border-slate-700/80 rounded-lg p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isPwd"
                      checked={data.isPwd}
                      onChange={(e) => setData({ ...data, isPwd: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                    />
                    <label htmlFor="isPwd" className="text-xs font-semibold text-slate-200">
                      Person with Benchmark Disability (PwD)
                    </label>
                  </div>

                  {data.isPwd && (
                    <div className="flex gap-2 col-span-1 sm:col-span-2">
                      <input
                        type="text"
                        placeholder="Disability Type (e.g. OH / VI / HI)"
                        value={data.pwdType}
                        onChange={(e) => setData({ ...data, pwdType: e.target.value })}
                        className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                      />
                      <input
                        type="text"
                        placeholder="Disability % (e.g. 40%)"
                        value={data.pwdPercentage}
                        onChange={(e) => setData({ ...data, pwdPercentage: e.target.value })}
                        className="w-32 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isEsm"
                      checked={data.isExServiceman}
                      onChange={(e) => setData({ ...data, isExServiceman: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                    />
                    <label htmlFor="isEsm" className="text-xs font-semibold text-slate-200">
                      Ex-Serviceman (ESM)
                    </label>
                  </div>

                  {data.isExServiceman && (
                    <div className="col-span-1 sm:col-span-2">
                      <input
                        type="text"
                        placeholder="Total Service Duration (e.g. 15 Years in Indian Army)"
                        value={data.exServicemanServiceYears}
                        onChange={(e) => setData({ ...data, exServicemanServiceYears: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                      />
                    </div>
                  )}
                </div>

                {/* Identification Marks */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Visible Identification Mark 1</label>
                    <input
                      type="text"
                      value={data.identificationMark1}
                      onChange={(e) => setData({ ...data, identificationMark1: e.target.value })}
                      placeholder="e.g. A mole on the left side of neck"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Visible Identification Mark 2</label>
                    <input
                      type="text"
                      value={data.identificationMark2}
                      onChange={(e) => setData({ ...data, identificationMark2: e.target.value })}
                      placeholder="e.g. A scar on right index finger"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Exam & Contact Info */}
            {activeTab === 'exam' && (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg space-y-4">
                <h3 className="text-base font-bold text-amber-400 border-b border-slate-700 pb-2">
                  Exam & Contact Information
                </h3>

                {/* Exam Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Examination / Notification Name *</label>
                    <input
                      type="text"
                      value={data.examName}
                      onChange={(e) => setData({ ...data, examName: e.target.value })}
                      placeholder="e.g. UPSC Civil Services Exam 2026"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Post / Cadre Applied For *</label>
                    <input
                      type="text"
                      value={data.postAppliedFor}
                      onChange={(e) => setData({ ...data, postAppliedFor: e.target.value })}
                      placeholder="e.g. Assistant Section Officer / IAS"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Registration ID / No.</label>
                    <input
                      type="text"
                      value={data.registrationNo}
                      onChange={(e) => setData({ ...data, registrationNo: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Roll Number</label>
                    <input
                      type="text"
                      value={data.rollNo}
                      onChange={(e) => setData({ ...data, rollNo: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Exam Medium</label>
                    <select
                      value={data.examMedium}
                      onChange={(e) => setData({ ...data, examMedium: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Regional / Vernacular">Regional / Vernacular</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Preferred Exam City</label>
                    <input
                      type="text"
                      value={data.preferredCenter}
                      onChange={(e) => setData({ ...data, preferredCenter: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Identity Proof & Contact */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-700/60">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Mobile Number *</label>
                    <input
                      type="text"
                      value={data.mobileNo}
                      onChange={(e) => setData({ ...data, mobileNo: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Email Address *</label>
                    <input
                      type="email"
                      value={data.email}
                      onChange={(e) => setData({ ...data, email: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Govt ID Type & Number</label>
                    <div className="flex gap-2">
                      <select
                        value={data.idProofType}
                        onChange={(e) => setData({ ...data, idProofType: e.target.value })}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-xs text-white"
                      >
                        <option value="Aadhaar Card">Aadhaar</option>
                        <option value="PAN Card">PAN Card</option>
                        <option value="Voter ID">Voter ID</option>
                        <option value="Passport">Passport</option>
                      </select>
                      <input
                        type="text"
                        value={data.idProofNumber}
                        onChange={(e) => setData({ ...data, idProofNumber: e.target.value })}
                        placeholder="ID Number"
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Addresses */}
                <div className="space-y-3 pt-2 border-t border-slate-700/60">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Correspondence Address</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Address Line 1"
                      value={data.corrAddressLine1}
                      onChange={(e) => setData({ ...data, corrAddressLine1: e.target.value })}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Address Line 2"
                      value={data.corrAddressLine2}
                      onChange={(e) => setData({ ...data, corrAddressLine2: e.target.value })}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="District"
                      value={data.corrDistrict}
                      onChange={(e) => setData({ ...data, corrDistrict: e.target.value })}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={data.corrState}
                      onChange={(e) => setData({ ...data, corrState: e.target.value })}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Pincode"
                      value={data.corrPincode}
                      onChange={(e) => setData({ ...data, corrPincode: e.target.value })}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="sameAddress"
                      checked={data.sameAsCorrespondence}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          sameAsCorrespondence: e.target.checked,
                          permAddressLine1: e.target.checked ? prev.corrAddressLine1 : prev.permAddressLine1,
                          permAddressLine2: e.target.checked ? prev.corrAddressLine2 : prev.permAddressLine2,
                          permDistrict: e.target.checked ? prev.corrDistrict : prev.permDistrict,
                          permState: e.target.checked ? prev.corrState : prev.permState,
                          permPincode: e.target.checked ? prev.corrPincode : prev.permPincode,
                        }))
                      }
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                    />
                    <label htmlFor="sameAddress" className="text-xs font-semibold text-amber-300">
                      Permanent Address is same as Correspondence Address
                    </label>
                  </div>

                  {!data.sameAsCorrespondence && (
                    <div className="space-y-3 pt-2 bg-slate-950 p-3 rounded-lg border border-slate-700">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Permanent Address</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Address Line 1"
                          value={data.permAddressLine1}
                          onChange={(e) => setData({ ...data, permAddressLine1: e.target.value })}
                          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                        />
                        <input
                          type="text"
                          placeholder="Address Line 2"
                          value={data.permAddressLine2}
                          onChange={(e) => setData({ ...data, permAddressLine2: e.target.value })}
                          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <input
                          type="text"
                          placeholder="District"
                          value={data.permDistrict}
                          onChange={(e) => setData({ ...data, permDistrict: e.target.value })}
                          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                        />
                        <input
                          type="text"
                          placeholder="State"
                          value={data.permState}
                          onChange={(e) => setData({ ...data, permState: e.target.value })}
                          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                        />
                        <input
                          type="text"
                          placeholder="Pincode"
                          value={data.permPincode}
                          onChange={(e) => setData({ ...data, permPincode: e.target.value })}
                          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: Educational Qualifications */}
            {activeTab === 'education' && (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                  <h3 className="text-base font-bold text-amber-400">Educational Qualifications (Chronological Order)</h3>
                  <button
                    onClick={addEducationRow}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition flex items-center gap-1 shadow"
                  >
                    + Add Qualification
                  </button>
                </div>

                <div className="space-y-4">
                  {data.educationList.map((row, index) => (
                    <div key={row.id} className="bg-slate-900 border border-slate-700 rounded-xl p-4 space-y-3 relative">
                      <div className="flex items-center justify-between">
                        <span className="bg-slate-800 text-amber-400 border border-amber-500/30 text-xs font-bold px-2.5 py-0.5 rounded">
                          Level #{index + 1}
                        </span>
                        {data.educationList.length > 1 && (
                          <button
                            onClick={() => removeEducationRow(row.id)}
                            className="text-red-400 hover:text-red-300 text-xs font-medium flex items-center gap-1"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Exam / Degree Passed</label>
                          <input
                            type="text"
                            value={row.examPassed}
                            onChange={(e) => updateEducationRow(row.id, 'examPassed', e.target.value)}
                            placeholder="e.g. 10th / B.Tech"
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Board / University</label>
                          <input
                            type="text"
                            value={row.boardUniversity}
                            onChange={(e) => updateEducationRow(row.id, 'boardUniversity', e.target.value)}
                            placeholder="e.g. CBSE / Delhi Univ"
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Passing Year & Roll No.</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={row.yearOfPassing}
                              onChange={(e) => updateEducationRow(row.id, 'yearOfPassing', e.target.value)}
                              placeholder="Year"
                              className="w-20 bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs text-white"
                            />
                            <input
                              type="text"
                              value={row.rollNumber}
                              onChange={(e) => updateEducationRow(row.id, 'rollNumber', e.target.value)}
                              placeholder="Roll No"
                              className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs text-white"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Marks Obtained</label>
                          <input
                            type="text"
                            value={row.marksObtained}
                            onChange={(e) => updateEducationRow(row.id, 'marksObtained', e.target.value)}
                            placeholder="e.g. 450"
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Max Marks / Scale</label>
                          <input
                            type="text"
                            value={row.maxMarks}
                            onChange={(e) => updateEducationRow(row.id, 'maxMarks', e.target.value)}
                            placeholder="e.g. 500"
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">% or CGPA</label>
                          <input
                            type="text"
                            value={row.percentageOrCgpa}
                            onChange={(e) => updateEducationRow(row.id, 'percentageOrCgpa', e.target.value)}
                            placeholder="e.g. 90.0%"
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-amber-300 font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Division / Grade</label>
                          <input
                            type="text"
                            value={row.divisionGrade}
                            onChange={(e) => updateEducationRow(row.id, 'divisionGrade', e.target.value)}
                            placeholder="1st Div"
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Main Subjects / Specialization</label>
                        <input
                          type="text"
                          value={row.subjects}
                          onChange={(e) => updateEducationRow(row.id, 'subjects', e.target.value)}
                          placeholder="e.g. Physics, Math, Chemistry, Computer Science"
                          className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: Work Experience & Skills */}
            {activeTab === 'experience' && (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg space-y-5">
                <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                  <h3 className="text-base font-bold text-amber-400">Work Experience (If Applicable)</h3>
                  <button
                    onClick={addExperienceRow}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition flex items-center gap-1 shadow"
                  >
                    + Add Experience
                  </button>
                </div>

                {data.experienceList.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No work experience added yet. Click "+ Add Experience" above if required.</p>
                ) : (
                  <div className="space-y-4">
                    {data.experienceList.map((exp, idx) => (
                      <div key={exp.id} className="bg-slate-900 border border-slate-700 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-300">Experience #{idx + 1}</span>
                          <button
                            onClick={() => removeExperienceRow(exp.id)}
                            className="text-red-400 hover:text-red-300 text-xs"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Organization / Govt Department"
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

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <select
                            value={exp.serviceType}
                            onChange={(e) => updateExperienceRow(exp.id, 'serviceType', e.target.value)}
                            className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                          >
                            <option value="Permanent">Permanent</option>
                            <option value="Contractual">Contractual</option>
                            <option value="Ad-hoc">Ad-hoc</option>
                            <option value="Govt Project">Govt Project</option>
                            <option value="Private Sector">Private Sector</option>
                          </select>
                          <input
                            type="date"
                            value={exp.fromDate}
                            onChange={(e) => updateExperienceRow(exp.id, 'fromDate', e.target.value)}
                            className="bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs text-white"
                          />
                          <input
                            type="date"
                            value={exp.toDate}
                            onChange={(e) => updateExperienceRow(exp.id, 'toDate', e.target.value)}
                            className="bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs text-white"
                          />
                          <input
                            type="text"
                            placeholder="Pay Scale / Pay Level"
                            value={exp.payScale}
                            onChange={(e) => updateExperienceRow(exp.id, 'payScale', e.target.value)}
                            className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>

                        <input
                          type="text"
                          placeholder="Brief Nature of Duties"
                          value={exp.natureOfDuties}
                          onChange={(e) => updateExperienceRow(exp.id, 'natureOfDuties', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Languages Known & Computer Knowledge */}
                <div className="pt-3 border-t border-slate-700/60 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400">Languages & Technical Proficiency</h4>

                  <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 space-y-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Languages Known</label>
                    {data.languages.map((lang, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-800 last:border-0">
                        <span className="font-medium text-slate-200 w-24">{lang.language}</span>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={lang.read}
                              onChange={() => toggleLanguageOption(idx, 'read')}
                              className="rounded text-amber-500"
                            />
                            <span className="text-slate-400">Read</span>
                          </label>
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={lang.write}
                              onChange={() => toggleLanguageOption(idx, 'write')}
                              className="rounded text-amber-500"
                            />
                            <span className="text-slate-400">Write</span>
                          </label>
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={lang.speak}
                              onChange={() => toggleLanguageOption(idx, 'speak')}
                              className="rounded text-amber-500"
                            />
                            <span className="text-slate-400">Speak</span>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Computer / IT Skills</label>
                    <input
                      type="text"
                      value={data.computerKnowledge}
                      onChange={(e) => setData({ ...data, computerKnowledge: e.target.value })}
                      placeholder="e.g. CCC Certificate, MS Office, Typing Speed 40 WPM"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Other Extra Qualifications / NCC / Sports</label>
                    <input
                      type="text"
                      value={data.otherQualifications}
                      onChange={(e) => setData({ ...data, otherQualifications: e.target.value })}
                      placeholder="e.g. NCC 'B' Certificate, District Sports Medalist"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: Declaration & Photo Upload */}
            {activeTab === 'declaration' && (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg space-y-4">
                <h3 className="text-base font-bold text-amber-400 border-b border-slate-700 pb-2">
                  Declaration, Place & Photograph Upload
                </h3>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Self-Declaration Undertaking Text</label>
                  <textarea
                    rows={4}
                    value={data.customDeclaration}
                    onChange={(e) => setData({ ...data, customDeclaration: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500 leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Place of Application</label>
                    <input
                      type="text"
                      value={data.declarationPlace}
                      onChange={(e) => setData({ ...data, declarationPlace: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Date</label>
                    <input
                      type="date"
                      value={data.declarationDate}
                      onChange={(e) => setData({ ...data, declarationDate: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                    />
                  </div>
                </div>

                {/* Upload Passport Photo & Signature */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-700/60">
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 text-center space-y-2">
                    <span className="block text-xs font-bold text-slate-300">Passport Photo Upload</span>
                    {data.photoUrl ? (
                      <div className="relative inline-block">
                        <img src={data.photoUrl} alt="Photo" className="w-24 h-32 object-cover rounded border border-amber-400 mx-auto" />
                        <button
                          onClick={() => setData({ ...data, photoUrl: '' })}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="w-24 h-32 border-2 border-dashed border-slate-700 rounded mx-auto flex flex-col items-center justify-center text-slate-500">
                        <span className="text-[10px]">Passport Photo</span>
                        <span className="text-[9px] text-slate-600">(3.5cm x 4.5cm)</span>
                      </div>
                    )}
                    <label className="block bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded cursor-pointer transition border border-slate-600">
                      Select Photo Image
                      <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'photoUrl')} className="hidden" />
                    </label>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 text-center space-y-2">
                    <span className="block text-xs font-bold text-slate-300">Specimen Signature Upload</span>
                    {data.signatureUrl ? (
                      <div className="relative inline-block">
                        <img src={data.signatureUrl} alt="Signature" className="w-36 h-16 object-contain rounded border border-amber-400 mx-auto bg-white p-1" />
                        <button
                          onClick={() => setData({ ...data, signatureUrl: '' })}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="w-36 h-16 border-2 border-dashed border-slate-700 rounded mx-auto flex flex-col items-center justify-center text-slate-500">
                        <span className="text-[10px]">Candidate Signature</span>
                      </div>
                    )}
                    <label className="block bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded cursor-pointer transition border border-slate-600">
                      Select Signature Image
                      <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'signatureUrl')} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* RIGHT PANE: A4 Print Preview Document */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'lg:col-span-6' : 'lg:col-span-12'} flex flex-col items-center`}>
            {/* Paper Container */}
            <div
              id="sarkari-print-document"
              className="w-full max-w-[800px] bg-white text-black p-6 md:p-10 shadow-2xl rounded border border-slate-300 font-serif leading-tight text-slate-900 text-sm"
              style={{ minHeight: '1050px' }}
            >
              {/* Document Header */}
              <div className="text-center border-b-2 border-slate-900 pb-4 mb-4 relative">
                <div className="uppercase tracking-widest text-[11px] font-bold text-slate-700">
                  APPLICATION BIODATA FOR GOVERNMENT EXAMINATIONS
                </div>
                <h2 className="text-xl md:text-2xl font-black uppercase text-slate-900 mt-1 tracking-wide">
                  {data.examName || 'RECRUITMENT APPLICATION FORM'}
                </h2>
                <div className="text-xs font-bold text-slate-800 mt-0.5">
                  POST APPLIED FOR: <span className="underline uppercase">{data.postAppliedFor || 'GENERAL POST'}</span>
                </div>

                {/* Photo Placeholder Box top right */}
                <div className="absolute top-0 right-0 w-24 h-32 border-2 border-slate-900 flex flex-col items-center justify-center bg-slate-50 text-[10px] text-slate-600 text-center p-1 font-sans">
                  {data.photoUrl ? (
                    <img src={data.photoUrl} alt="Photo" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <span>AFFIX RECENT</span>
                      <span>PASSPORT SIZE</span>
                      <span>PHOTOGRAPH</span>
                      <span>HERE</span>
                    </>
                  )}
                </div>
              </div>

              {/* Exam Credentials Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-sans font-semibold border-b border-slate-400 pb-3 mb-4 bg-slate-100 p-2 rounded">
                <div>
                  <span className="text-slate-600 block">Registration No:</span>
                  <span className="font-bold">{data.registrationNo || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-600 block">Roll Number:</span>
                  <span className="font-bold">{data.rollNo || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-600 block">Medium:</span>
                  <span className="font-bold">{data.examMedium}</span>
                </div>
                <div>
                  <span className="text-slate-600 block">Exam City:</span>
                  <span className="font-bold">{data.preferredCenter}</span>
                </div>
              </div>

              {/* 1. PERSONAL DETAILS TABLE */}
              <div className="mb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider bg-slate-800 text-white px-2 py-1 mb-2 font-sans">
                  1. Personal Details (As per Matriculation Certificate)
                </h3>
                <table className="w-full text-xs border-collapse border border-slate-400 font-sans">
                  <tbody>
                    <tr className="border-b border-slate-300">
                      <td className="w-1/3 p-1.5 font-bold bg-slate-50 border-r border-slate-300">1. Full Name (In Block Letters)</td>
                      <td className="p-1.5 font-extrabold uppercase text-slate-900" colSpan={3}>{data.fullName}</td>
                    </tr>
                    <tr className="border-b border-slate-300">
                      <td className="p-1.5 font-bold bg-slate-50 border-r border-slate-300">2. Father's Name</td>
                      <td className="p-1.5 uppercase">{data.fathersName}</td>
                      <td className="p-1.5 font-bold bg-slate-50 border-r border-slate-300">3. Mother's Name</td>
                      <td className="p-1.5 uppercase">{data.mothersName}</td>
                    </tr>
                    <tr className="border-b border-slate-300">
                      <td className="p-1.5 font-bold bg-slate-50 border-r border-slate-300">4. Date of Birth (DD-MM-YYYY)</td>
                      <td className="p-1.5">{data.dob}</td>
                      <td className="p-1.5 font-bold bg-slate-50 border-r border-slate-300">5. Computed Age (as on {data.ageCutoffDate})</td>
                      <td className="p-1.5 font-bold text-amber-900">{calculateExactAge(data.dob, data.ageCutoffDate)}</td>
                    </tr>
                    <tr className="border-b border-slate-300">
                      <td className="p-1.5 font-bold bg-slate-50 border-r border-slate-300">6. Gender & Marital Status</td>
                      <td className="p-1.5">{data.gender} / {data.maritalStatus}</td>
                      <td className="p-1.5 font-bold bg-slate-50 border-r border-slate-300">7. Category / Reservation</td>
                      <td className="p-1.5 font-bold">{data.category} {data.isPwd ? `(PwD ${data.pwdType})` : ''}</td>
                    </tr>
                    <tr className="border-b border-slate-300">
                      <td className="p-1.5 font-bold bg-slate-50 border-r border-slate-300">8. Nationality & Religion</td>
                      <td className="p-1.5">{data.nationality} / {data.religion}</td>
                      <td className="p-1.5 font-bold bg-slate-50 border-r border-slate-300">9. Ex-Serviceman Status</td>
                      <td className="p-1.5">{data.isExServiceman ? `Yes (${data.exServicemanServiceYears})` : 'No'}</td>
                    </tr>
                    <tr className="border-b border-slate-300">
                      <td className="p-1.5 font-bold bg-slate-50 border-r border-slate-300">10. ID Proof ({data.idProofType})</td>
                      <td className="p-1.5 font-mono">{data.idProofNumber}</td>
                      <td className="p-1.5 font-bold bg-slate-50 border-r border-slate-300">11. Contact Mobile & Email</td>
                      <td className="p-1.5">{data.mobileNo} | {data.email}</td>
                    </tr>
                    <tr>
                      <td className="p-1.5 font-bold bg-slate-50 border-r border-slate-300">12. Visible Identification Marks</td>
                      <td className="p-1.5" colSpan={3}>
                        1) {data.identificationMark1 || 'None'} <br />
                        2) {data.identificationMark2 || 'None'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 2. ADDRESS DETAILS */}
              <div className="mb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider bg-slate-800 text-white px-2 py-1 mb-2 font-sans">
                  2. Postal & Communication Address
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs font-sans">
                  <div className="border border-slate-400 p-2 rounded">
                    <span className="font-bold block border-b border-slate-300 pb-1 mb-1 text-slate-700">Correspondence Address:</span>
                    <div>{data.corrAddressLine1}</div>
                    <div>{data.corrAddressLine2}</div>
                    <div>{data.corrDistrict}, {data.corrState} - <span className="font-bold">{data.corrPincode}</span></div>
                  </div>
                  <div className="border border-slate-400 p-2 rounded">
                    <span className="font-bold block border-b border-slate-300 pb-1 mb-1 text-slate-700">Permanent Address:</span>
                    {data.sameAsCorrespondence ? (
                      <em className="text-slate-500">Same as Correspondence Address</em>
                    ) : (
                      <>
                        <div>{data.permAddressLine1}</div>
                        <div>{data.permAddressLine2}</div>
                        <div>{data.permDistrict}, {data.permState} - <span className="font-bold">{data.permPincode}</span></div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. EDUCATION TABLE */}
              <div className="mb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider bg-slate-800 text-white px-2 py-1 mb-2 font-sans">
                  3. Educational Qualifications (Academic Record)
                </h3>
                <table className="w-full text-[11px] border-collapse border border-slate-400 font-sans text-left">
                  <thead>
                    <tr className="bg-slate-200 text-slate-900 border-b border-slate-400 font-bold text-center">
                      <th className="p-1 border-r border-slate-300">Exam Passed</th>
                      <th className="p-1 border-r border-slate-300">Board / University</th>
                      <th className="p-1 border-r border-slate-300">Year</th>
                      <th className="p-1 border-r border-slate-300">Roll No</th>
                      <th className="p-1 border-r border-slate-300">Marks</th>
                      <th className="p-1 border-r border-slate-300">% / CGPA</th>
                      <th className="p-1">Division</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.educationList.map((edu) => (
                      <tr key={edu.id} className="border-b border-slate-300 text-center">
                        <td className="p-1 font-semibold text-left border-r border-slate-300">{edu.examPassed}</td>
                        <td className="p-1 text-left border-r border-slate-300">{edu.boardUniversity}</td>
                        <td className="p-1 border-r border-slate-300">{edu.yearOfPassing}</td>
                        <td className="p-1 border-r border-slate-300 font-mono text-[10px]">{edu.rollNumber}</td>
                        <td className="p-1 border-r border-slate-300">{edu.marksObtained}/{edu.maxMarks}</td>
                        <td className="p-1 font-bold border-r border-slate-300">{edu.percentageOrCgpa}</td>
                        <td className="p-1">{edu.divisionGrade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 4. WORK EXPERIENCE */}
              {data.experienceList.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider bg-slate-800 text-white px-2 py-1 mb-2 font-sans">
                    4. Employment / Work Experience Details
                  </h3>
                  <table className="w-full text-[11px] border-collapse border border-slate-400 font-sans text-left">
                    <thead>
                      <tr className="bg-slate-200 text-slate-900 border-b border-slate-400 font-bold">
                        <th className="p-1 border-r border-slate-300">Organization</th>
                        <th className="p-1 border-r border-slate-300">Designation</th>
                        <th className="p-1 border-r border-slate-300">Type</th>
                        <th className="p-1 border-r border-slate-300">Period</th>
                        <th className="p-1">Duties / Pay</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.experienceList.map((exp) => (
                        <tr key={exp.id} className="border-b border-slate-300">
                          <td className="p-1 font-medium border-r border-slate-300">{exp.organization}</td>
                          <td className="p-1 border-r border-slate-300">{exp.designation}</td>
                          <td className="p-1 border-r border-slate-300">{exp.serviceType}</td>
                          <td className="p-1 border-r border-slate-300 text-[10px]">{exp.fromDate} to {exp.toDate}</td>
                          <td className="p-1 text-[10px]">{exp.natureOfDuties} ({exp.payScale})</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 5. ADDITIONAL SKILLS */}
              <div className="mb-4 text-xs font-sans border border-slate-300 p-2.5 rounded bg-slate-50">
                <div className="mb-1">
                  <span className="font-bold text-slate-800">Languages Known: </span>
                  {data.languages
                    .filter((l) => l.read || l.write || l.speak)
                    .map((l) => `${l.language} (${[l.read && 'Read', l.write && 'Write', l.speak && 'Speak'].filter(Boolean).join(', ')})`)
                    .join(' | ')}
                </div>
                {data.computerKnowledge && (
                  <div className="mb-1">
                    <span className="font-bold text-slate-800">Computer Proficiency: </span>
                    {data.computerKnowledge}
                  </div>
                )}
                {data.otherQualifications && (
                  <div>
                    <span className="font-bold text-slate-800">Other Achievements / NCC: </span>
                    {data.otherQualifications}
                  </div>
                )}
              </div>

              {/* 6. SELF DECLARATION & SIGNATURE */}
              <div className="mt-6 pt-4 border-t-2 border-slate-800 font-sans">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1">
                  UNDERTAKING & DECLARATION
                </h3>
                <p className="text-[11px] text-slate-800 leading-normal text-justify mb-8 italic">
                  "{data.customDeclaration}"
                </p>

                <div className="flex justify-between items-end text-xs pt-4">
                  <div>
                    <p><span className="font-bold">Place:</span> {data.declarationPlace}</p>
                    <p><span className="font-bold">Date:</span> {data.declarationDate}</p>
                  </div>

                  <div className="text-center w-48">
                    {data.signatureUrl ? (
                      <img src={data.signatureUrl} alt="Signature" className="h-12 mx-auto object-contain mb-1" />
                    ) : (
                      <div className="h-12 border-b border-slate-800 border-dashed mb-1"></div>
                    )}
                    <span className="font-bold block uppercase text-slate-900">({data.fullName})</span>
                    <span className="text-[10px] text-slate-600 block">Signature of the Applicant</span>
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
