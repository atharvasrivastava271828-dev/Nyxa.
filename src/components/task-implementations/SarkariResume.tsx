'use client';

import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  Plus,
  Trash2,
  User,
  BookOpen,
  Briefcase,
  Camera,
  Upload,
  Copy,
  Check,
  ShieldCheck,
} from 'lucide-react';

export interface EducationItem {
  id: string;
  degree: string;
  board: string;
  year: string;
  marks: string;
  percentage: string;
}

export interface ExperienceItem {
  id: string;
  organization: string;
  designation: string;
  period: string;
  duties: string;
}

export interface SarkariResumeData {
  fullName: string;
  fathersName: string;
  mothersName: string;
  dob: string;
  gender: string;
  category: string;
  mobile: string;
  email: string;
  idProofType: string;
  idProofNumber: string;
  address: string;
  district: string;
  state: string;
  pincode: string;
  educationList: EducationItem[];
  experienceList: ExperienceItem[];
  declarationPlace: string;
  declarationDate: string;
  photoUrl: string;
  signatureUrl: string;
}

const DEFAULT_DATA: SarkariResumeData = {
  fullName: 'RAJESH KUMAR SHARMA',
  fathersName: 'SURESH CHANDRA SHARMA',
  mothersName: 'ANITA SHARMA',
  dob: '1998-05-15',
  gender: 'Male',
  category: 'OBC',
  mobile: '9876543210',
  email: 'rajesh.sharma@example.com',
  idProofType: 'Aadhaar Card',
  idProofNumber: '5482 9102 3847',
  address: 'H.No 142/B, Sector 15, Near Central Park',
  district: 'Gautam Buddha Nagar',
  state: 'Uttar Pradesh',
  pincode: '201301',
  educationList: [
    {
      id: '1',
      degree: '10th / High School',
      board: 'CBSE Board, New Delhi',
      year: '2014',
      marks: '465 / 500',
      percentage: '93.00%',
    },
    {
      id: '2',
      degree: '12th / Intermediate',
      board: 'CBSE Board, New Delhi',
      year: '2016',
      marks: '448 / 500',
      percentage: '89.60%',
    },
    {
      id: '3',
      degree: 'B.Tech (Computer Engg)',
      board: 'Delhi Technological University',
      year: '2020',
      marks: '8.45 / 10 CGPA',
      percentage: '84.50%',
    },
  ],
  experienceList: [
    {
      id: 'exp-1',
      organization: 'National Informatics Centre (NIC)',
      designation: 'Project Associate',
      period: '2021 - 2023',
      duties: 'Database administration & public grievance portal maintenance.',
    },
  ],
  declarationPlace: 'New Delhi',
  declarationDate: new Date().toISOString().split('T')[0],
  photoUrl: '',
  signatureUrl: '',
};

export default function SarkariResume() {
  const [data, setData] = useState<SarkariResumeData>(DEFAULT_DATA);
  const [copied, setCopied] = useState(false);

  // Education Handlers
  const addEducation = () => {
    const newItem: EducationItem = {
      id: Date.now().toString(),
      degree: 'Graduation / Degree',
      board: '',
      year: new Date().getFullYear().toString(),
      marks: '',
      percentage: '',
    };
    setData({ ...data, educationList: [...data.educationList, newItem] });
  };

  const updateEducation = (id: string, field: keyof EducationItem, val: string) => {
    setData({
      ...data,
      educationList: data.educationList.map((item) => (item.id === id ? { ...item, [field]: val } : item)),
    });
  };

  const removeEducation = (id: string) => {
    setData({ ...data, educationList: data.educationList.filter((item) => item.id !== id) });
  };

  // Experience Handlers
  const addExperience = () => {
    const newItem: ExperienceItem = {
      id: Date.now().toString(),
      organization: '',
      designation: '',
      period: '',
      duties: '',
    };
    setData({ ...data, experienceList: [...data.experienceList, newItem] });
  };

  const updateExperience = (id: string, field: keyof ExperienceItem, val: string) => {
    setData({
      ...data,
      experienceList: data.experienceList.map((item) => (item.id === id ? { ...item, [field]: val } : item)),
    });
  };

  const removeExperience = (id: string) => {
    setData({ ...data, experienceList: data.experienceList.filter((item) => item.id !== id) });
  };

  // Image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'photoUrl' | 'signatureUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setData((prev) => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Copy Plain Text
  const copyAsText = () => {
    const text = `
SARKARI BIODATA / APPLICATION FORM
==================================
FULL NAME     : ${data.fullName}
FATHER'S NAME : ${data.fathersName}
MOTHER'S NAME : ${data.mothersName}
DOB           : ${data.dob} | GENDER: ${data.gender} | CATEGORY: ${data.category}
MOBILE        : ${data.mobile} | EMAIL: ${data.email}
ID PROOF      : ${data.idProofType} - ${data.idProofNumber}
ADDRESS       : ${data.address}, ${data.district}, ${data.state} - ${data.pincode}

QUALIFICATIONS:
${data.educationList.map((e) => `- ${e.degree} | ${e.board} | ${e.year} | ${e.percentage}`).join('\n')}

EXPERIENCE:
${data.experienceList.map((x) => `- ${x.designation} at ${x.organization} (${x.period})`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 font-sans">
      {/* CSS for printing */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
            background: white !important;
            color: black !important;
          }
          #printable-biodata, #printable-biodata * {
            visibility: visible;
          }
          #printable-biodata {
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

      {/* Header Bar */}
      <div className="max-w-7xl mx-auto mb-6 no-print flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" /> Official A4 Format Generator
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Sarkari Resume & Biodata Builder
          </h1>
          <p className="text-xs text-slate-400">
            Fill basic details to generate a clean, official A4 printable Biodata for Indian Govt applications.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => window.print()}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow flex items-center gap-2"
          >
            <Printer className="w-4 h-4" /> Print A4 Biodata
          </button>
          <button
            onClick={copyAsText}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow flex items-center gap-2"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied Text!' : 'Copy Plain Text'}
          </button>
        </div>
      </div>

      {/* Side-by-Side Editor & Preview */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form Editor */}
        <div className="lg:col-span-6 space-y-5 no-print">
          {/* Personal Information */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
              <User className="w-4 h-4" /> Personal Information
            </h3>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Full Candidate Name (IN CAPITAL) *</label>
              <input
                type="text"
                value={data.fullName}
                onChange={(e) => setData({ ...data, fullName: e.target.value.toUpperCase() })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-bold uppercase"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Father&apos;s Name *</label>
                <input
                  type="text"
                  value={data.fathersName}
                  onChange={(e) => setData({ ...data, fathersName: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white uppercase"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Mother&apos;s Name *</label>
                <input
                  type="text"
                  value={data.mothersName}
                  onChange={(e) => setData({ ...data, mothersName: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={data.dob}
                  onChange={(e) => setData({ ...data, dob: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Gender</label>
                <select
                  value={data.gender}
                  onChange={(e) => setData({ ...data, gender: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Transgender">Transgender</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Category</label>
                <select
                  value={data.category}
                  onChange={(e) => setData({ ...data, category: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-amber-400 font-bold"
                >
                  <option value="GENERAL">GENERAL / UR</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="EWS">EWS</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Mobile Number</label>
                <input
                  type="text"
                  value={data.mobile}
                  onChange={(e) => setData({ ...data, mobile: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  value={data.email}
                  onChange={(e) => setData({ ...data, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">ID Proof Type</label>
                <input
                  type="text"
                  value={data.idProofType}
                  onChange={(e) => setData({ ...data, idProofType: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">ID Proof Number</label>
                <input
                  type="text"
                  value={data.idProofNumber}
                  onChange={(e) => setData({ ...data, idProofNumber: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Full Postal Address</label>
              <input
                type="text"
                value={data.address}
                onChange={(e) => setData({ ...data, address: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="District"
                value={data.district}
                onChange={(e) => setData({ ...data, district: e.target.value })}
                className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
              />
              <input
                type="text"
                placeholder="State"
                value={data.state}
                onChange={(e) => setData({ ...data, state: e.target.value })}
                className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
              />
              <input
                type="text"
                placeholder="Pincode"
                value={data.pincode}
                onChange={(e) => setData({ ...data, pincode: e.target.value })}
                className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono"
              />
            </div>
          </div>

          {/* Education Table Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Educational Qualifications
              </h3>
              <button
                onClick={addEducation}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-2.5 py-1 rounded-lg text-xs transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            <div className="space-y-3">
              {data.educationList.map((item) => (
                <div key={item.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      placeholder="Exam / Degree"
                      value={item.degree}
                      onChange={(e) => updateEducation(item.id, 'degree', e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white font-bold w-2/3"
                    />
                    <button
                      onClick={() => removeEducation(item.id)}
                      className="text-rose-400 hover:text-rose-300 text-xs p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <input
                      type="text"
                      placeholder="Board / University"
                      value={item.board}
                      onChange={(e) => updateEducation(item.id, 'board', e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Year"
                      value={item.year}
                      onChange={(e) => updateEducation(item.id, 'year', e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white font-mono"
                    />
                    <input
                      type="text"
                      placeholder="% / CGPA"
                      value={item.percentage}
                      onChange={(e) => updateEducation(item.id, 'percentage', e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-amber-300 font-bold"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Photos Upload */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Passport Photo</label>
              <label className="bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition text-xs text-slate-300">
                <Camera className="w-4 h-4 mb-1 text-amber-400" />
                Upload Photo
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'photoUrl')} className="hidden" />
              </label>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Signature</label>
              <label className="bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition text-xs text-slate-300">
                <Upload className="w-4 h-4 mb-1 text-emerald-400" />
                Upload Signature
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'signatureUrl')} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        {/* Right Printable A4 Preview Sheet */}
        <div className="lg:col-span-6 flex justify-center">
          <div
            id="printable-biodata"
            className="bg-white text-black p-8 rounded-sm shadow-2xl w-full max-w-[210mm] min-h-[297mm] text-xs font-serif space-y-4 border border-slate-300"
          >
            {/* Header */}
            <div className="text-center border-b-2 border-black pb-3 relative">
              <h1 className="text-lg font-extrabold tracking-wide uppercase">CANDIDATE BIODATA</h1>
              <div className="text-[10px] text-slate-600 font-sans tracking-widest uppercase">
                RECRUITMENT APPLICATION FORM
              </div>
            </div>

            {/* Main Details + Photo */}
            <div className="grid grid-cols-12 gap-3 border border-black p-3 text-[11px]">
              <div className="col-span-9 space-y-1.5">
                <div>
                  <strong>Full Name:</strong> <span className="font-bold uppercase">{data.fullName}</span>
                </div>
                <div>
                  <strong>Father&apos;s Name:</strong> <span className="uppercase">{data.fathersName}</span>
                </div>
                <div>
                  <strong>Mother&apos;s Name:</strong> <span className="uppercase">{data.mothersName}</span>
                </div>
                <div>
                  <strong>Date of Birth:</strong> {data.dob}
                </div>
                <div>
                  <strong>Gender / Category:</strong> {data.gender} | {data.category}
                </div>
                <div>
                  <strong>Mobile / Email:</strong> {data.mobile} | {data.email}
                </div>
                <div>
                  <strong>ID Proof:</strong> {data.idProofType} ({data.idProofNumber})
                </div>
                <div>
                  <strong>Address:</strong> {data.address}, {data.district}, {data.state} - {data.pincode}
                </div>
              </div>

              <div className="col-span-3 flex flex-col items-center justify-start border border-dashed border-black p-1 bg-slate-50 min-h-[120px]">
                {data.photoUrl ? (
                  <img src={data.photoUrl} alt="Photo" className="w-24 h-28 object-cover border border-black" />
                ) : (
                  <div className="w-24 h-28 border border-slate-400 bg-white flex items-center justify-center text-center text-[9px] text-slate-400 p-1">
                    PASSPORT PHOTO
                  </div>
                )}
              </div>
            </div>

            {/* Education Table */}
            <div className="border border-black">
              <div className="bg-slate-100 border-b border-black font-bold uppercase px-2 py-1 text-[11px]">
                EDUCATIONAL QUALIFICATIONS
              </div>
              <table className="w-full text-left border-collapse text-[10.5px]">
                <thead>
                  <tr className="bg-slate-200 border-b border-black font-bold">
                    <th className="p-1.5 border-r border-black">Degree / Exam</th>
                    <th className="p-1.5 border-r border-black">Board / University</th>
                    <th className="p-1.5 border-r border-black">Year</th>
                    <th className="p-1.5">Percentage / CGPA</th>
                  </tr>
                </thead>
                <tbody>
                  {data.educationList.map((item) => (
                    <tr key={item.id} className="border-b border-slate-300">
                      <td className="p-1.5 border-r border-black font-bold">{item.degree}</td>
                      <td className="p-1.5 border-r border-black">{item.board}</td>
                      <td className="p-1.5 border-r border-black font-mono">{item.year}</td>
                      <td className="p-1.5 font-bold">{item.percentage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Experience Table if present */}
            {data.experienceList.length > 0 && (
              <div className="border border-black">
                <div className="bg-slate-100 border-b border-black font-bold uppercase px-2 py-1 text-[11px]">
                  WORK EXPERIENCE
                </div>
                <table className="w-full text-left border-collapse text-[10.5px]">
                  <thead>
                    <tr className="bg-slate-200 border-b border-black font-bold">
                      <th className="p-1.5 border-r border-black">Organization</th>
                      <th className="p-1.5 border-r border-black">Designation</th>
                      <th className="p-1.5">Period</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.experienceList.map((item) => (
                      <tr key={item.id} className="border-b border-slate-300">
                        <td className="p-1.5 border-r border-black font-semibold">{item.organization}</td>
                        <td className="p-1.5 border-r border-black">{item.designation}</td>
                        <td className="p-1.5">{item.period}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Declaration & Signature */}
            <div className="border border-black p-3 space-y-2 pt-3">
              <div className="font-bold uppercase text-[10.5px]">DECLARATION</div>
              <p className="text-[10px] leading-relaxed italic">
                I hereby declare that all the information provided above is true and correct to the best of my knowledge and belief.
              </p>

              <div className="flex justify-between items-end pt-4">
                <div className="text-[10px]">
                  <div>Date: {data.declarationDate}</div>
                  <div>Place: {data.declarationPlace}</div>
                </div>

                <div className="flex flex-col items-center justify-center border-t border-black pt-1 w-40 text-center">
                  {data.signatureUrl ? (
                    <img src={data.signatureUrl} alt="Signature" className="h-8 object-contain mb-1" />
                  ) : (
                    <div className="h-6 border border-dashed border-slate-300 w-full mb-1 flex items-center justify-center text-[8px] text-slate-400">
                      SIGNATURE
                    </div>
                  )}
                  <span className="font-bold text-[10px] uppercase">{data.fullName}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
