import React from 'react';
import { Child, Provider, ParentGuardian } from '../../../types';
import {
  FileText,
  Sparkles,
  Check,
  CheckCircle2,
  FileCheck,
  UploadCloud,
  Loader2,
  Eye,
  Calculator,
  ShieldCheck,
  Clock,
  Send,
  ArrowLeft
} from 'lucide-react';
import { ParentDirectorContactCard } from '../components/ParentDirectorContactCard';

export interface Step4DocumentsPaymentProps {
  activeChild: Child;
  currentParent?: ParentGuardian;
  matchedProvider: Provider | null;
  getSmartFieldValue: (formId: string, fieldName: string) => any;
  handleInputChange: (formId: string, fieldName: string, value: any) => void;
  docUploadState: Record<string, {
    progress: number;
    fileName: string;
    fileSize: string;
    stageText: string;
    isComplete: boolean;
  }>;
  handleDocumentUpload: (docId: string, file: File) => void;
  handleUseSampleDoc: (docId: string, docType: string) => void;
  setPreviewDocModal: (modal: { title: string; url: string } | null) => void;
  parentPaymentRefInput: string;
  setParentPaymentRefInput: (val: string) => void;
  parentPaymentSubmitted: boolean;
  setParentPaymentSubmitted: (val: boolean) => void;
  setSubmittedBanner: (banner: string | null) => void;
  onBackToStep3: () => void;
}

export const Step4DocumentsPayment: React.FC<Step4DocumentsPaymentProps> = ({
  activeChild,
  currentParent: _currentParent,
  matchedProvider,
  getSmartFieldValue,
  handleInputChange,
  docUploadState,
  handleDocumentUpload,
  handleUseSampleDoc,
  setPreviewDocModal,
  parentPaymentRefInput,
  setParentPaymentRefInput,
  parentPaymentSubmitted,
  setParentPaymentSubmitted,
  setSubmittedBanner,
  onBackToStep3
}) => {
  const childDocs = activeChild?.documents && activeChild.documents.length > 0
    ? activeChild.documents
    : [
      { id: `doc-1`, type: 'birth_certificate' as const, title: 'Child Birth Certificate / Proof of Age', status: 'not_submitted' as const },
      { id: `doc-2`, type: 'health_card' as const, title: 'Ontario Health Card (OHIP)', status: 'not_submitted' as const },
      { id: `doc-3`, type: 'immunization' as const, title: 'Ontario Yellow Immunization Record', status: 'not_submitted' as const }
    ];

  const pendingDocs = childDocs.filter(d => d.status === 'not_submitted' || d.status === 'replacement_requested');
  const acceptedDocs = childDocs.filter(d => d.status === 'accepted');
  const allUploaded = pendingDocs.length === 0;

  return (
    <div className="bg-white rounded-3xl border-2 border-slate-900 shadow-neo p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b-2 border-slate-100">
        <div>
          <span className="text-xs font-mono font-bold bg-blue-100 text-blue-900 px-2.5 py-1 rounded-md border border-blue-300">
            Step 4 of 5: Document Audits & Regulatory Verification
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 mt-2">
            Ontario Health & Licensing Verification: <span className="text-orange-600">{activeChild?.fullName}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Upload immunization records and verify health card details to satisfy Ministry licensing compliance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            {acceptedDocs.length} of {childDocs.length} Approved
          </span>
        </div>
      </div>

      {/* Quick Testing Bar for Ontario Sample Documents */}
      <div className="p-3.5 bg-amber-50/70 border-2 border-amber-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-amber-950 font-bold">
          <FileText className="w-4 h-4 text-orange-600 shrink-0" />
          <span>Ontario Compliance Samples Available (/public/documents/):</span>
          <span className="text-[11px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-300">
            Birth Certificate • OHIP Card • Yellow Card
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            for (const doc of childDocs) {
              handleUseSampleDoc(doc.id, doc.type);
            }
          }}
          className="neo-btn bg-white hover:bg-orange-50 text-slate-900 text-xs font-extrabold px-3 py-1.5 rounded-xl border-2 border-slate-900 gap-1.5 shadow-neo-sm shrink-0 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-orange-600" />
          <span>⚡ Auto-Attach All 3 Ontario Samples</span>
        </button>
      </div>

      {/* Document Upload Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {childDocs.map((doc) => {
          const isAccepted = doc.status === 'accepted';
          const isUnderReview = doc.status === 'under_review';
          const isRejected = doc.status === 'replacement_requested';

          return (
            <div
              key={doc.id}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between space-y-3 ${
                isAccepted ? 'bg-emerald-50/70 border-emerald-400' :
                isUnderReview ? 'bg-amber-50/70 border-amber-300' :
                isRejected ? 'bg-red-50 border-red-300' :
                'bg-slate-50 border-slate-900 shadow-neo-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <span className="font-extrabold text-slate-900 block text-xs">{doc.title}</span>
                  <span className="text-[10px] text-slate-500 block">
                    {doc.type === 'birth_certificate' ? 'CCEYA mixed ratio calculation verification' :
                      doc.type === 'health_card' ? 'Emergency medical coverage & OHIP # verification' :
                      doc.type === 'immunization' ? 'Public Health vaccine compliance check' :
                      'Ontario licensing compliance document'}
                  </span>
                </div>

                {/* Status Badge */}
                <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-[10px] uppercase border flex-shrink-0 ${
                  isAccepted ? 'bg-emerald-100 text-emerald-900 border-emerald-300' :
                  isUnderReview ? 'bg-amber-100 text-amber-900 border-amber-300' :
                  isRejected ? 'bg-red-100 text-red-900 border-red-300' :
                  'bg-slate-200 text-slate-700 border-slate-300'
                }`}>
                  {isAccepted ? '✓ Accepted' :
                    isUnderReview ? '⏳ Under Review' :
                    isRejected ? '⚠️ Resubmit Needed' :
                    'Not Submitted'}
                </span>
              </div>

              {/* Visual Document Thumbnail for Parent */}
              {doc.fileUrl && (
                <div className="p-2 bg-white rounded-xl border border-slate-200 flex items-center gap-3 shadow-inner">
                  <div 
                    onClick={() => setPreviewDocModal({ title: doc.title, url: doc.fileUrl! })}
                    className="w-14 h-14 bg-slate-900 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer relative group border border-slate-300 shadow-sm"
                  >
                    <img 
                      src={doc.fileUrl} 
                      alt={doc.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200" 
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <Eye className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="space-y-0.5 min-w-0 flex-1">
                    <span className="text-[11px] font-bold text-slate-900 truncate block">
                      {doc.fileName || 'Uploaded Document File'}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Canadian Cloud Storage Verified
                    </span>
                    <button
                      type="button"
                      onClick={() => setPreviewDocModal({ title: doc.title, url: doc.fileUrl! })}
                      className="text-[10px] text-orange-600 hover:underline font-extrabold flex items-center gap-1 mt-0.5 cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Preview Full Scan</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Action Bar & Upload Progress per Document */}
              <div className="pt-2 border-t border-slate-200/60">
                {docUploadState[doc.id] && !docUploadState[doc.id].isComplete ? (
                  <div className="space-y-2 bg-white p-3 rounded-xl border border-orange-300 shadow-sm animate-pulse">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span className="flex items-center gap-1.5 truncate max-w-[200px]">
                        <FileText className="w-4 h-4 text-orange-600 flex-shrink-0" />
                        <span className="truncate">{docUploadState[doc.id].fileName}</span>
                        <span className="text-[10px] text-slate-400 font-normal">({docUploadState[doc.id].fileSize})</span>
                      </span>
                      <span className="text-orange-600 font-mono font-extrabold flex items-center gap-1">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{docUploadState[doc.id].progress}%</span>
                      </span>
                    </div>

                    {/* Progress Track */}
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${docUploadState[doc.id].progress}%` }}
                      />
                    </div>

                    <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-orange-500 flex-shrink-0" />
                      <span>{docUploadState[doc.id].stageText}</span>
                    </p>
                  </div>
                ) : isAccepted ? (
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Verified by the Agency Director</span>
                    </span>
                  </div>
                ) : isUnderReview ? (
                  <div className="flex items-center justify-between w-full">
                    <div className="space-y-0.5">
                      <span className="text-[11px] text-amber-900 font-bold flex items-center gap-1">
                        <FileCheck className="w-3.5 h-3.5 text-amber-600" />
                        <span>{docUploadState[doc.id]?.fileName || 'Document File Uploaded'}</span>
                        {docUploadState[doc.id]?.fileSize && (
                          <span className="text-[10px] text-slate-400 font-normal">({docUploadState[doc.id].fileSize})</span>
                        )}
                      </span>
                      <p className="text-[10px] text-amber-800/80">Uploaded to Canadian Cloud Storage • Staff auditing copy</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleUseSampleDoc(doc.id, doc.type)}
                        className="neo-btn bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 px-2 py-1 text-[10px] font-bold rounded-lg cursor-pointer"
                        title="Attach Ontario Sample Record"
                      >
                        Sample
                      </button>
                      <label className="neo-btn bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 px-2.5 py-1 text-[11px] font-bold cursor-pointer rounded-lg shadow-sm">
                        <span>Replace</span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*,.pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleDocumentUpload(doc.id, file);
                          }}
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <button
                      type="button"
                      onClick={() => handleUseSampleDoc(doc.id, doc.type)}
                      className="neo-btn bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 text-[10px] font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                      title="Auto-Attach Sample Document"
                    >
                      <Sparkles className="w-3 h-3 text-orange-600" />
                      <span>Use Sample</span>
                    </button>
                    <label className="neo-btn bg-orange-500 hover:bg-orange-400 text-white px-3 py-1.5 rounded-xl text-xs font-extrabold gap-1 cursor-pointer shadow-sm flex items-center">
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>{isRejected ? 'Re-upload' : 'Upload File / Photo'}</span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleDocumentUpload(doc.id, file);
                        }}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CWELCC MONTHLY FEE STATEMENT & STEP-BY-STEP PAYMENT INSTRUCTIONS */}
      {acceptedDocs.length === childDocs.length && (() => {
        const rawDays = activeChild.careDays || getSmartFieldValue('par-form-1', 'days_of_care_multiselect') || getSmartFieldValue('par-form-0', 'days_of_care_multiselect');
        const selectedDays: string[] = Array.isArray(rawDays)
          ? rawDays
          : (typeof rawDays === 'string' && rawDays ? rawDays.split(', ') : ['MON', 'TUES', 'WED', 'THURS', 'FRI']);
        const daysPerWeek = selectedDays.length > 0 ? selectedDays.length : 5;
        const currentFundingType = activeChild.fundingType || 'cwelcc';
        const isEvening = Boolean(getSmartFieldValue('par-form-1', 'evening_care_required') || getSmartFieldValue('par-form-0', 'evening_care_required'));
        
        const isSubsidy = currentFundingType === 'subsidy';
        const isPrivate = currentFundingType === 'private';
        const isCwelccTarget = currentFundingType === 'cwelcc_target';
        
        // Official Ontario Pricing Structure:
        // - CWELCC Current Phase Rate: $22.00 / day
        // - CWELCC Upcoming Target: $10.00 / day
        // - Municipal Subsidy: $0.00 parent co-pay or assessed daily contribution rate
        // - Private Non-CWELCC: $35.00 / day
        // - Provider Statutory Compensation: $35.00 / day per child
        const dailyParentRate = isSubsidy 
          ? (activeChild.parentContributionDailyRate ?? 0)
          : isPrivate ? 35.00 : isCwelccTarget ? 10.00 : 22.00;
        const weeklyParentRate = dailyParentRate * daysPerWeek;
        const calculatedMonthlyFee = isSubsidy 
          ? (activeChild.monthlyFee ?? Math.round(dailyParentRate * (activeChild.anticipatedMonthlyDays || 21) * 100) / 100)
          : Math.round(weeklyParentRate * 4.35 * 100) / 100;

        return (
          <div className="p-5 bg-gradient-to-br from-emerald-50/90 via-teal-50/50 to-amber-50/40 rounded-2xl border-2 border-emerald-400 shadow-neo space-y-5 animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-emerald-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <h3 className="font-extrabold text-sm text-emerald-950">
                    Step 4 Documents Approved — Monthly Fee Statement & Payment Instructions
                  </h3>
                  <p className="text-[11px] text-emerald-800 font-medium">
                    Ontario CWELCC Child Care Program Enrolment for {activeChild.fullName}
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full font-extrabold text-xs uppercase flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Documents Verified</span>
              </span>
            </div>

            {/* 3-Column Financial & Placement Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {/* 1. Monthly Rate */}
              <div className="p-4 bg-white rounded-xl border border-emerald-200 shadow-sm space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                  Total Amount Per Month
                </span>
                <p className="text-2xl font-black text-emerald-700">
                  ${calculatedMonthlyFee.toFixed(2)} <span className="text-xs font-bold text-slate-500">CAD / mo</span>
                </p>
                <span className="text-[10px] text-emerald-800 font-semibold block">
                  {isSubsidy ? (dailyParentRate > 0 ? `✓ Municipal Child Care Subsidy ($${dailyParentRate.toFixed(2)}/Day Co-Pay)` : '✓ Municipal Child Care Subsidy ($0.00 Co-Pay)') : isPrivate ? '✓ Private Care Rate ($35/Day)' : isCwelccTarget ? '✓ CWELCC Target Rate ($10/Day)' : `✓ CWELCC Rate ($22/Day → $478.50/mo)`}
                </span>
              </div>

              {/* 2. Assigned Home Facility */}
              <div className="p-4 bg-white rounded-xl border border-emerald-200 shadow-sm space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                  Matched Placement Home
                </span>
                <p className="text-sm font-extrabold text-slate-900 truncate">
                  {matchedProvider ? matchedProvider.name : 'Elena Rostova'}
                </p>
                <span className="text-[10px] text-slate-600 block truncate font-medium">
                  {matchedProvider ? matchedProvider.homeName : 'Little Explorers Nest'}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  {matchedProvider ? matchedProvider.neighborhood : 'Markham / Scarborough'}
                </span>
              </div>

              {/* 3. Payment Destination */}
              <div className="p-4 bg-white rounded-xl border border-emerald-200 shadow-sm space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                  e-Transfer Recipient
                </span>
                <p className="text-xs font-extrabold text-slate-900 truncate font-mono">
                  allchildcaresolutions@gmail.com
                </p>
                <span className="text-[10px] text-slate-600 block">
                  Due on <strong>1st of each month</strong>
                </span>
                <span className="text-[10px] text-purple-700 font-bold block">
                  Autodeposit Enabled
                </span>
              </div>
            </div>

            {/* 🌟 READ-ONLY ASSIGNED CCEYA FUNDING & CARE SCHEDULE STATEMENT */}
            <div className="p-4 bg-white/95 rounded-2xl border-2 border-emerald-300 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-emerald-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Calculator className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="font-extrabold text-xs text-emerald-950 uppercase tracking-wide">
                    Assigned Care Schedule & Official CCEYA Fee Breakdown
                  </h4>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-mono">
                  Formula: (Daily Rate × Care Days/Wk) × 4.35 Avg Wks/Mo
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 text-xs">
                {/* 1. Care Schedule Overview (Read-Only) */}
                <div className="lg:col-span-4 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                      1. Assigned Care Schedule
                    </span>
                    <div className="grid grid-cols-7 gap-1">
                      {['MON', 'TUES', 'WED', 'THURS', 'FRI', 'SAT', 'SUN'].map(day => {
                        const isDaySelected = selectedDays.includes(day);
                        return (
                          <div
                            key={day}
                            className={`text-[10px] py-1 px-0.5 rounded-lg font-black border text-center ${
                              isDaySelected
                                ? 'bg-orange-500 text-white border-orange-600 shadow-sm'
                                : 'bg-slate-100 text-slate-400 border-slate-200 opacity-60'
                            }`}
                          >
                            {day}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                    <span className="font-extrabold text-slate-900">
                      {daysPerWeek} Active Days / Week
                    </span>
                    {isEvening && <span className="text-orange-600 font-bold text-[10px]">(+ Evening Care)</span>}
                  </div>
                </div>

                {/* 2. CCEYA Funding Program (Read-Only) */}
                <div className="lg:col-span-5 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                      2. Assigned CCEYA Funding Stream
                    </span>

                    <div className="p-2.5 bg-white rounded-xl border-2 border-emerald-400 shadow-sm space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-slate-900">
                          {isSubsidy ? 'Municipal Child Care Subsidy' : isPrivate ? 'Private Non-CWELCC Care' : isCwelccTarget ? 'CWELCC Target Rate' : 'CWELCC Enrolled Program'}
                        </span>
                        <span className="text-xs font-black text-emerald-700 font-mono">
                          ${dailyParentRate.toFixed(2)} / day
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        {isSubsidy ? (dailyParentRate > 0 ? `Assessed Municipal parental contribution ($${dailyParentRate.toFixed(2)}/day).` : 'Covers 100% of parent portion via Regional Municipal Subsidy.') : isPrivate ? 'Full standard unsubsidized care rate.' : isCwelccTarget ? 'Upcoming Ontario $10/day childcare target phase.' : 'Ontario CWELCC standard statutory parent rate ($22/day).'}
                      </p>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400">
                    Official funding tier verified by the Agency Director.
                  </p>
                </div>

                {/* 3 & 4. Subtotal & Monthly Fee Due (Read-Only) */}
                <div className="lg:col-span-3 grid grid-cols-1 gap-2">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      3. Weekly Subtotal
                    </span>
                    <p className="text-sm font-extrabold text-slate-900">
                      {isSubsidy ? (dailyParentRate > 0 ? `$${(dailyParentRate * daysPerWeek).toFixed(2)} / wk` : '$0.00 / wk') : `$${weeklyParentRate.toFixed(2)} CAD`}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {isSubsidy ? (dailyParentRate > 0 ? `$${dailyParentRate.toFixed(2)} × ${daysPerWeek} days/wk` : 'Subsidized Tier') : `$${dailyParentRate.toFixed(2)} × ${daysPerWeek} days/wk`}
                    </p>
                  </div>

                  <div className="p-2.5 bg-emerald-50 rounded-xl border-2 border-emerald-300 space-y-0.5">
                    <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">
                      4. Total Monthly Fee
                    </span>
                    <p className="text-base font-black text-emerald-800">
                      ${calculatedMonthlyFee.toFixed(2)} CAD
                    </p>
                    <p className="text-[10px] text-emerald-700 font-mono">
                      {isSubsidy ? (dailyParentRate > 0 ? `$${dailyParentRate.toFixed(2)}/day × ${activeChild.anticipatedMonthlyDays || 21} days` : '$0.00 Parent Co-Pay') : `$${weeklyParentRate.toFixed(2)} × 4.35 wks`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ontario CWELCC Regulatory Compliance Notice */}
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-slate-600">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Ontario Ministry of Education Licensed Agency:</strong> All child care spaces operate in strict compliance with the Child Care and Early Years Act (CCEYA) and Canada-Wide Early Learning and Child Care (CWELCC) standards.
                  </span>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-300 shrink-0">
                  Ontario Ministry Compliant
                </span>
              </div>
            </div>

            {/* Sole Payment Method: Interac e-Transfer */}
            <div className="p-5 bg-white rounded-2xl border-2 border-slate-900 shadow-neo space-y-3 text-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-orange-100 border border-orange-300 text-orange-700 flex items-center justify-center font-black text-xs">
                    1
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">Official Payment Method: Interac e-Transfer</h4>
                    <p className="text-[11px] text-slate-500">Sole payment rail for All Child Care Solutions (cheques and cash are not accepted)</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-extrabold text-[10px] border border-emerald-300">
                  Autodeposit Active
                </span>
              </div>

              <ol className="space-y-2 text-slate-700 text-xs list-decimal list-inside leading-relaxed">
                <li>Log into your Canadian online banking app (TD, RBC, Scotiabank, CIBC, BMO, etc.).</li>
                <li>Send your payment of <strong className="text-emerald-700 font-extrabold">${calculatedMonthlyFee.toFixed(2)} CAD</strong> to:
                  <span className="inline-flex items-center gap-1.5 font-mono font-black text-slate-900 bg-orange-50 px-3 py-1 rounded-lg my-1 border-2 border-slate-900 shadow-neo-sm">
                    allchildcaresolutions@gmail.com
                  </span>
                </li>
                <li>In the e-Transfer memo/message field, include: <strong className="text-slate-900 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">"{activeChild.fullName} - Care Fee"</strong></li>
                <li>Autodeposit is active on this account; no security question or password is required.</li>
              </ol>
            </div>

            {/* Parent Reference Submission & Admin Verification Gate */}
            <div className="p-4 bg-amber-50 rounded-xl border-2 border-amber-300 space-y-3">
              <div className="flex items-start gap-2.5">
                <Clock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-xs text-amber-950">
                    Admin Payment Verification & Final Enrolment Confirmation
                  </h4>
                  <p className="text-[11px] text-amber-900 leading-relaxed mt-0.5">
                    Once your e-Transfer is sent to <strong className="text-slate-900">allchildcaresolutions@gmail.com</strong>, enter your bank reference number below. Agency staff will verify the transaction confirmation and activate your child's enrolment to unlock Step 5 (Active Care Hub).
                  </p>
                </div>
              </div>

              {/* Reference Number Submission Form */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-amber-200">
                <input
                  type="text"
                  placeholder="e.g. Interac Ref # CA1234567890 (or 'Paid in Person')"
                  value={parentPaymentRefInput}
                  onChange={(e) => setParentPaymentRefInput(e.target.value)}
                  className="flex-1 p-2.5 bg-white border-2 border-slate-900 rounded-xl font-mono text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />

                <button
                  type="button"
                  onClick={() => {
                    const refCode = parentPaymentRefInput.trim() || 'e-Transfer Sent by Parent';
                    handleInputChange('par-form-5', 'payment_reference_code', refCode);
                    handleInputChange('par-form-5', 'payment_submitted_at', new Date().toISOString());
                    setParentPaymentSubmitted(true);
                    setSubmittedBanner(`✓ Payment reference "${refCode}" submitted to the Agency Director for verification.`);
                    setTimeout(() => setSubmittedBanner(null), 5000);
                  }}
                  className="neo-btn bg-orange-500 hover:bg-orange-400 text-white px-4 py-2.5 text-xs font-extrabold rounded-xl shadow-neo-sm flex items-center justify-center gap-1.5 cursor-pointer flex-shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{parentPaymentSubmitted ? '✓ Reference Sent' : 'Notify Director Payment Sent'}</span>
                </button>
              </div>

              {parentPaymentSubmitted && (
                <div className="p-2.5 bg-emerald-100 border border-emerald-300 rounded-lg text-emerald-950 font-bold text-[11px] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Notification dispatched to Agency (allchildcaresolutions@gmail.com). Enrolment will activate as soon as bank receipt is verified.</span>
                </div>
              )}

              {/* Reach out to Agency prompt */}
              <ParentDirectorContactCard
                promptText="Have questions about e-Transfer or fee confirmation?"
                variant="amber"
              />
            </div>
          </div>
        );
      })()}

      {/* Bottom Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t-2 border-slate-100">
        <button
          onClick={onBackToStep3}
          className="neo-btn bg-white hover:bg-slate-100 text-slate-800 px-4 py-2 text-xs font-bold gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Provider Matching</span>
        </button>

        {allUploaded ? (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-emerald-700 font-bold">
              ✓ All documents submitted for staff verification.
            </span>
          </div>
        ) : (
          <span className="text-[11px] text-amber-800 font-bold bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
            ⚠️ Please upload all {pendingDocs.length} pending document{pendingDocs.length !== 1 ? 's' : ''} above.
          </span>
        )}
      </div>
    </div>
  );
};
