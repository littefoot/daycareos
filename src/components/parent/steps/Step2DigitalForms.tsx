import React from 'react';
import { Child, ParentGuardian, DocumentRecord } from '../../../types';
import { FormTemplate } from '../../../types/formSchema';
import {
  Layers,
  Check,
  Clock,
  Lock,
  ArrowRight,
  Printer,
  Calendar,
  Camera,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Send,
  FileCheck
} from 'lucide-react';
import { ScheduleDaysMultiselectField } from '../components/ScheduleDaysMultiselectField';
import { AccsDatePicker } from '../../common/AccsDatePicker';
import { ParentDocumentUploadSection } from '../components/ParentDocumentUploadSection';

export interface Step2DigitalFormsProps {
  parentForms: FormTemplate[];
  activeFormId: string;
  setActiveFormId: (formId: string) => void;
  formCompletionStatus: Record<string, 'completed' | 'in_progress' | 'pending'>;
  activeForm: FormTemplate;
  activeChild?: Child;
  currentParent?: ParentGuardian;
  getSmartFieldValue: (formId: string, fieldName: string) => any;
  handleInputChange: (formId: string, fieldName: string, value: any) => void;
  handleFormSubmit: (e: React.FormEvent, formId: string) => void;
  submittedBanner: string | null;
  onAdvanceToStep3: () => void;
  currentStep: number;
  childDocs?: DocumentRecord[];
  docUploadState?: Record<string, {
    progress: number;
    fileName: string;
    fileSize: string;
    stageText: string;
    isComplete: boolean;
  }>;
  handleDocumentUpload?: (docId: string, file: File) => void;
  handleUseSampleDoc?: (docId: string, docType: string) => void;
  setPreviewDocModal?: (modal: { title: string; url: string } | null) => void;
  onResetDocs?: () => void;
}

export const Step2DigitalForms: React.FC<Step2DigitalFormsProps> = ({
  parentForms,
  activeFormId,
  setActiveFormId,
  formCompletionStatus,
  activeForm,
  activeChild,
  currentParent: _currentParent,
  getSmartFieldValue,
  handleInputChange,
  handleFormSubmit,
  submittedBanner,
  onAdvanceToStep3,
  currentStep,
  childDocs,
  docUploadState,
  handleDocumentUpload,
  handleUseSampleDoc,
  setPreviewDocModal,
  onResetDocs
}) => {
  const isFormZero = activeForm?.id === 'par-form-0';
  const isFormZeroReadOnly = isFormZero && currentStep >= 2;
  const isDocsActive = activeFormId === 'statutory-docs';

  // Compute document status counts for Step 2 badge display
  const statutoryDocs = (childDocs || []).filter(d => 
    d.type === 'birth_certificate' || d.type === 'health_card' || d.type === 'immunization'
  );
  const approvedDocsCount = statutoryDocs.filter(d => d.status === 'accepted').length;
  const uploadedDocsCount = statutoryDocs.filter(d => 
    d.status === 'accepted' || d.status === 'under_review' || docUploadState?.[d.id]?.isComplete
  ).length;
  const completedFormsCount = parentForms.filter(f => f.id === 'par-form-0' || formCompletionStatus[f.id] === 'completed').length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Assigned Parent Forms Checklist (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border-2 border-slate-900 shadow-neo p-5 space-y-4 print:hidden no-print forms-sidebar">
          <div className="pb-3 border-b-2 border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>Required Forms Checklist</span>
              </h2>
              <p className="text-[11px] text-slate-500">Live schemas loaded from Form Builder</p>
            </div>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
              {parentForms.length} Forms + 3 Docs
            </span>
          </div>

          <div className="space-y-2">
            {/* Form 0: Initial Intake & Pre-Screening */}
            {parentForms.filter(f => f.id === 'par-form-0').map(form => {
              const isForm0 = true;
              const status = 'completed';
              const isActive = activeFormId === form.id;

              return (
                <div
                  key={form.id}
                  onClick={() => setActiveFormId(form.id)}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-2 ${
                    isActive
                      ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-300 shadow-neo-sm'
                      : 'bg-slate-50/80 hover:bg-white border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-white border border-slate-300 text-slate-700">
                      {form.formCode}
                    </span>

                    <span className="text-[10px] font-extrabold px-2 py-0.2 rounded-full flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <Check className="w-3 text-emerald-600" />
                      <span>Approved (Step 1)</span>
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs font-bold text-slate-900 leading-tight">{form.title}</h3>
                      <Lock className="w-3 h-3 text-slate-400" />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{form.description}</p>
                  </div>
                </div>
              );
            })}

            {/* 📁 Mandatory Statutory Licensing Documents Checklist Item */}
            <div
              onClick={() => setActiveFormId('statutory-docs')}
              className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-2 ${
                isDocsActive
                  ? 'bg-orange-50 border-orange-500 ring-2 ring-orange-400 shadow-neo-sm'
                  : uploadedDocsCount === 3
                  ? 'bg-emerald-50/50 hover:bg-emerald-50 border-emerald-300'
                  : 'bg-slate-50 hover:bg-white border-slate-200 hover:border-slate-400'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-orange-100 text-orange-950 border border-orange-300">
                  DOCS
                </span>

                <span className={`text-[10px] font-extrabold px-2 py-0.2 rounded-full flex items-center gap-1 ${
                  approvedDocsCount === 3
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : uploadedDocsCount > 0
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  {approvedDocsCount === 3 ? (
                    <>
                      <Check className="w-3 text-emerald-600" />
                      <span>3 of 3 Approved</span>
                    </>
                  ) : (
                    <span>{uploadedDocsCount} of 3 Uploaded</span>
                  )}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-orange-600" />
                  <h3 className="text-xs font-bold text-slate-900 leading-tight">Mandatory Licensing Documents</h3>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">Birth Certificate, OHIP Card & Yellow Record</p>
              </div>
            </div>

            {/* Forms 1 through 5 */}
            {parentForms.filter(f => f.id !== 'par-form-0').map(form => {
              const status = formCompletionStatus[form.id] || 'pending';
              const isActive = activeFormId === form.id;

              return (
                <div
                  key={form.id}
                  onClick={() => setActiveFormId(form.id)}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-2 ${
                    isActive
                      ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-300 shadow-neo-sm'
                      : 'bg-slate-50 hover:bg-white border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-white border border-slate-300 text-slate-700">
                      {form.formCode}
                    </span>

                    <span className={`text-[10px] font-extrabold px-2 py-0.2 rounded-full flex items-center gap-1 ${
                      status === 'completed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                      status === 'in_progress' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {status === 'completed' && <Check className="w-3 text-emerald-600" />}
                      {status === 'in_progress' && <Clock className="w-3 h-3 text-amber-600" />}
                      <span>
                        {status === 'completed' ? 'Completed' : status === 'in_progress' ? 'In Progress' : 'Pending'}
                      </span>
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-slate-900 leading-tight">{form.title}</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{form.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2">
            <button
              onClick={onAdvanceToStep3}
              className="w-full neo-btn bg-slate-900 hover:bg-slate-800 text-white py-2.5 text-xs font-bold gap-2 justify-center cursor-pointer"
            >
              <span>Proceed to Step 3: Provider Matching</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold px-1 mt-1.5">
              <span>Forms: {completedFormsCount}/5</span>
              <span>Docs: {uploadedDocsCount}/3 Uploaded</span>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Form Renderer OR Statutory Documents Upload Section */}
        <div className="lg:col-span-8 bg-white rounded-2xl border-2 border-slate-900 shadow-neo p-6 space-y-6 printable-form-container">
          {isDocsActive ? (
            <div className="space-y-6">
              <div className="pb-4 border-b-2 border-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold bg-orange-600 text-white px-2 py-0.5 rounded">
                      DOCS
                    </span>
                    <h2 className="text-base font-extrabold text-slate-900">
                      Mandatory Ontario Licensing Documents
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Upload required statutory files for {activeChild?.fullName || 'child'} to complete licensing compliance.
                  </p>
                </div>
                <span className="text-[11px] font-bold bg-slate-100 px-3 py-1 rounded-xl border border-slate-300 text-slate-700">
                  Canadian Cloud Storage (northamerica-northeast1)
                </span>
              </div>

              {activeChild && handleDocumentUpload && handleUseSampleDoc && setPreviewDocModal && (
                <ParentDocumentUploadSection
                  activeChild={activeChild}
                  childDocs={childDocs || []}
                  docUploadState={docUploadState || {}}
                  handleDocumentUpload={handleDocumentUpload}
                  handleUseSampleDoc={handleUseSampleDoc}
                  setPreviewDocModal={setPreviewDocModal}
                  onResetDocs={onResetDocs}
                  subheading={`Upload proof of birth, Ontario Health Card (OHIP), and Yellow Immunization Record for ${activeChild.fullName}:`}
                />
              )}
            </div>
          ) : (
            <>
              {submittedBanner === activeForm?.id && (
                <div className="p-4 bg-emerald-50 border-2 border-emerald-400 rounded-2xl flex items-center gap-3 animate-fadeIn print:hidden no-print">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900">{activeForm?.title} Submitted Successfully!</h4>
                    <p className="text-[11px] text-emerald-700">Form entries saved to Cloud Firestore and synced with the agency's records.</p>
                  </div>
                </div>
              )}

          {/* Form 0 Locked / Read-Only Pre-Screening Banner in Step 2 */}
          {isFormZeroReadOnly && (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-400 rounded-2xl flex items-start gap-3 print:hidden no-print">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-emerald-900">0. Initial Intake & Pre-Screening Form — Approved & Recorded</h4>
                <p className="text-[11px] text-emerald-700 mt-0.5 leading-relaxed">
                  This initial inquiry was submitted during Step 1 and approved by staff. Responses are pre-filled below in read-only mode for your regulatory record-keeping.
                </p>
              </div>
            </div>
          )}

          {activeForm ? (
            <form onSubmit={(e) => handleFormSubmit(e, activeForm.id)} className="space-y-6">
              {/* Clean Ontario Agency Print-Only Header (Appears ONLY on printed paper / PDF) */}
              <div className="print-only-banner pb-4 mb-4 border-b-2 border-slate-900">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-lg font-black tracking-tight text-slate-900 uppercase">DaycareOS Inc.</h1>
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">
                      Ontario Licensed Home Child Care Agency • Ministry of Education & CCEYA
                    </p>
                    <p className="text-[10px] text-slate-500">Durham Region • York Region • City of Toronto</p>
                  </div>
                  <div className="text-right text-[10px] font-mono text-slate-700">
                    <p><strong>Child:</strong> {activeChild?.fullName || 'Child'}</p>
                    <p><strong>Form:</strong> {activeForm.formCode} — {activeForm.title}</p>
                    <p><strong>Printed Date:</strong> {new Date().toLocaleDateString('en-CA')}</p>
                  </div>
                </div>
              </div>

              {/* On-Screen Form Title & Meta Header */}
              <div className="pb-4 border-b-2 border-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 print:hidden no-print">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold bg-slate-900 text-white px-2 py-0.5 rounded">
                      {activeForm.formCode}
                    </span>
                    <h2 className="text-base font-extrabold text-slate-900">{activeForm.title}</h2>
                    {isFormZeroReadOnly && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                        Read-Only Record
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{activeForm.description}</p>
                </div>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="neo-btn bg-white hover:bg-slate-50 text-slate-800 px-3 py-1.5 text-xs font-bold gap-1.5 print:hidden no-print cursor-pointer"
                  title="Print paper copy"
                >
                  <Printer className="w-3.5 h-3.5 text-orange-600" />
                  <span>Print Form</span>
                </button>
              </div>

              {/* Dynamically Rendered Form Sections & Fields from Schema */}
              <div className="space-y-6">
                {activeForm.sections.map(sec => {
                  if (sec.id === 'sec-1-hours-care') {
                    const rawDays = getSmartFieldValue(activeForm.id, 'days_of_care_multiselect');
                    const daysVal: string[] = Array.isArray(rawDays)
                      ? rawDays
                      : (typeof rawDays === 'string' && rawDays ? rawDays.split(', ') : ['MON', 'TUES', 'WED', 'THURS', 'FRI']);
                    const isEveningVal: boolean = Boolean(getSmartFieldValue(activeForm.id, 'evening_care_required'));

                    return (
                      <div key={sec.id} className="space-y-4">
                        <ScheduleDaysMultiselectField
                          formId={activeForm.id}
                          isReadOnly={isFormZeroReadOnly}
                          selectedDays={daysVal}
                          isEvening={isEveningVal}
                          onChange={(newDays, nextEvening) => {
                            handleInputChange(activeForm.id, 'days_of_care_multiselect', newDays);
                            handleInputChange(activeForm.id, 'evening_care_required', nextEvening);
                          }}
                        />
                      </div>
                    );
                  }

                  return (
                    <div key={sec.id} className="space-y-4 form-section-card print-avoid-break">
                      <div className="pb-1 border-b border-slate-200">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">{sec.title}</h3>
                        {sec.description && <p className="text-[11px] text-slate-500">{sec.description}</p>}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        {sec.fields
                          .filter(field => field.name !== 'agency_selection' && field.name !== 'agency_name')
                          .slice()
                          .sort((a, b) => {
                            if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
                            if (a.order !== undefined) return a.order - 999;
                            if (b.order !== undefined) return 999 - b.order;
                            return 0;
                          })
                          .map(field => {
                          const val = getSmartFieldValue(activeForm.id, field.name);

                          return (
                            <div key={field.id} className={field.gridCols === 1 ? 'sm:col-span-2' : ''}>
                              {field.type === 'consent_clause' ? (
                                <label className={`flex items-start gap-2.5 p-3.5 border-2 rounded-xl transition-all ${
                                  isFormZeroReadOnly
                                    ? 'bg-slate-100/80 border-slate-300 cursor-not-allowed'
                                    : 'bg-slate-50 hover:bg-orange-50/50 border-slate-900 cursor-pointer'
                                }`}>
                                  <input
                                    type="checkbox"
                                    disabled={isFormZeroReadOnly}
                                    checked={!!val}
                                    onChange={(e) => handleInputChange(activeForm.id, field.name, e.target.checked)}
                                    className="w-4 h-4 text-orange-600 mt-0.5 rounded focus:ring-orange-500 shrink-0"
                                    required={field.required && !isFormZeroReadOnly}
                                  />
                                  <span className="font-bold text-slate-800 leading-snug">{field.label}</span>
                                </label>
                              ) : field.type === 'notice_block' ? (
                                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 font-bold flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
                                  <span>{field.label}</span>
                                </div>
                              ) : field.type === 'signature' ? (
                                <div className={`p-4 rounded-xl border-2 space-y-1.5 ${
                                  isFormZeroReadOnly ? 'bg-slate-100 border-slate-300' : 'bg-slate-50 border-slate-900'
                                }`}>
                                  <label className="font-bold text-slate-900 block">
                                    {field.label} {field.required && !isFormZeroReadOnly && '*'}
                                  </label>
                                  <input
                                    type="text"
                                    disabled={isFormZeroReadOnly}
                                    placeholder={field.placeholder || 'Type Full Legal Name as Signature'}
                                    value={val}
                                    onChange={(e) => handleInputChange(activeForm.id, field.name, e.target.value)}
                                    className={`w-full p-2.5 rounded-xl font-mono text-sm ${
                                      isFormZeroReadOnly ? 'bg-slate-50 text-slate-700 border-slate-300 cursor-not-allowed' : 'bg-white border border-slate-300 focus:ring-2 focus:ring-orange-500'
                                    }`}
                                    required={field.required && !isFormZeroReadOnly}
                                  />
                                  <p className="text-[10px] text-slate-400 font-mono">Legally binding digital signature timestamped upon submission.</p>
                                </div>
                              ) : field.type === 'dropdown' ? (
                                <div>
                                  <label className="font-bold text-slate-800 block mb-1">
                                    {field.label} {field.required && !isFormZeroReadOnly && '*'}
                                  </label>
                                  <select
                                    disabled={isFormZeroReadOnly}
                                    value={val}
                                    onChange={(e) => handleInputChange(activeForm.id, field.name, e.target.value)}
                                    className={`w-full p-2.5 rounded-xl font-medium ${
                                      isFormZeroReadOnly
                                        ? 'bg-slate-100 text-slate-700 border border-slate-300 cursor-not-allowed'
                                        : 'bg-slate-50 border-2 border-slate-900 focus:ring-2 focus:ring-orange-500'
                                    }`}
                                    required={field.required && !isFormZeroReadOnly}
                                  >
                                    <option value="">Select option...</option>
                                    {field.options?.map(opt => (
                                      <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                  </select>
                                  {field.helpText && <p className="text-[10px] text-slate-400 mt-1">{field.helpText}</p>}
                                </div>
                              ) : field.type === 'textarea' ? (
                                <div className="space-y-1">
                                  <label className="font-bold text-slate-800 block">
                                    {field.label} {field.required && !isFormZeroReadOnly && '*'}
                                  </label>
                                  <textarea
                                    disabled={isFormZeroReadOnly}
                                    rows={3}
                                    placeholder={field.placeholder}
                                    value={val}
                                    onChange={(e) => handleInputChange(activeForm.id, field.name, e.target.value)}
                                    className={`w-full p-2.5 rounded-xl font-medium ${
                                      isFormZeroReadOnly
                                        ? 'bg-slate-100 text-slate-700 border border-slate-300 cursor-not-allowed'
                                        : 'bg-slate-50 border-2 border-slate-900 focus:ring-2 focus:ring-orange-500'
                                    }`}
                                    required={field.required && !isFormZeroReadOnly}
                                  />
                                  {field.helpText && <p className="text-[10px] text-slate-400 mt-1">{field.helpText}</p>}
                                </div>
                              ) : field.type === 'checkbox' ? (
                                <label className={`flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all ${
                                  isFormZeroReadOnly
                                    ? 'bg-slate-100/80 border-slate-300 cursor-not-allowed'
                                    : 'bg-slate-50 hover:bg-orange-50/50 border-slate-900 cursor-pointer'
                                }`}>
                                  <input
                                    type="checkbox"
                                    disabled={isFormZeroReadOnly}
                                    checked={Boolean(val)}
                                    onChange={(e) => handleInputChange(activeForm.id, field.name, e.target.checked)}
                                    className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                                  />
                                  <span className="font-bold text-slate-800 text-xs">{field.label}</span>
                                </label>
                              ) : field.type === 'file_upload' || field.name === 'child_photo_wallet' || field.id === 'f2-child-photo' ? (
                                <div className="p-4 bg-orange-50/70 border-2 border-orange-300 rounded-2xl space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div className="p-1.5 rounded-lg bg-orange-500 text-white shadow-neo-sm">
                                        <Camera className="w-4 h-4" />
                                      </div>
                                      <div>
                                        <label className="font-extrabold text-slate-900 block text-xs">
                                          {field.label} {field.required && !isFormZeroReadOnly && '*'}
                                        </label>
                                        <p className="text-[11px] text-slate-500">
                                          Photo will appear on the Ontario CCEYA emergency wallet card carried in the provider's bag for park outings.
                                        </p>
                                      </div>
                                    </div>
                                    <span className="text-[10px] bg-orange-200 text-orange-950 font-bold px-2 py-0.5 rounded-full border border-orange-300">
                                      CCEYA Emergency Badge
                                    </span>
                                  </div>

                                  {/* Current Photo Display or Upload / Camera Buttons */}
                                  {val || activeChild?.photoUrl ? (
                                    <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border-2 border-slate-900 shadow-neo-sm">
                                      <div className="flex items-center gap-3">
                                        <img
                                          src={val || activeChild?.photoUrl}
                                          alt={activeChild?.fullName || 'Child'}
                                          className="w-14 h-14 rounded-xl object-cover border-2 border-slate-900 shadow-neo-sm"
                                        />
                                        <div>
                                          <span className="text-xs font-extrabold text-slate-900 block">
                                            {activeChild?.fullName || 'Child'} ID Photo
                                          </span>
                                          <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            Verified for Emergency Wallet Card
                                          </span>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <label className="neo-btn bg-white hover:bg-slate-50 text-slate-800 text-xs px-3 py-1.5 font-bold rounded-xl cursor-pointer border-2 border-slate-900 gap-1.5 shadow-neo-sm">
                                          <UploadCloud className="w-3.5 h-3.5 text-orange-600" />
                                          <span>Upload File</span>
                                          <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            disabled={isFormZeroReadOnly}
                                            onChange={(e) => {
                                              const file = e.target.files?.[0];
                                              if (file) {
                                                const reader = new FileReader();
                                                reader.onload = (ev) => {
                                                  const dataUrl = ev.target?.result as string;
                                                  handleInputChange(activeForm.id, field.name, dataUrl);
                                                  if (activeChild) activeChild.photoUrl = dataUrl;
                                                };
                                                reader.readAsDataURL(file);
                                              }
                                            }}
                                          />
                                        </label>

                                        <label className="neo-btn bg-orange-500 hover:bg-orange-400 text-white text-xs px-3 py-1.5 font-bold rounded-xl cursor-pointer gap-1.5 shadow-neo-sm">
                                          <Camera className="w-3.5 h-3.5" />
                                          <span>Take Picture</span>
                                          <input
                                            type="file"
                                            accept="image/*"
                                            capture="user"
                                            className="hidden"
                                            disabled={isFormZeroReadOnly}
                                            onChange={(e) => {
                                              const file = e.target.files?.[0];
                                              if (file) {
                                                const reader = new FileReader();
                                                reader.onload = (ev) => {
                                                  const dataUrl = ev.target?.result as string;
                                                  handleInputChange(activeForm.id, field.name, dataUrl);
                                                  if (activeChild) activeChild.photoUrl = dataUrl;
                                                };
                                                reader.readAsDataURL(file);
                                              }
                                            }}
                                          />
                                        </label>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                      <label className="neo-btn bg-white hover:bg-orange-50 text-slate-800 border-2 border-slate-900 p-3 text-xs font-extrabold rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-neo-sm transition-all text-center">
                                        <UploadCloud className="w-4 h-4 text-orange-600" />
                                        <span>Upload Image from Device</span>
                                        <input
                                          type="file"
                                          accept="image/*"
                                          className="hidden"
                                          disabled={isFormZeroReadOnly}
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                              const reader = new FileReader();
                                              reader.onload = (ev) => {
                                                const dataUrl = ev.target?.result as string;
                                                handleInputChange(activeForm.id, field.name, dataUrl);
                                                if (activeChild) activeChild.photoUrl = dataUrl;
                                              };
                                              reader.readAsDataURL(file);
                                            }
                                          }}
                                        />
                                      </label>

                                      <label className="neo-btn bg-orange-500 hover:bg-orange-400 text-white border-2 border-slate-900 p-3 text-xs font-extrabold rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-neo-sm transition-all text-center">
                                        <Camera className="w-4 h-4" />
                                        <span>Take Picture with Camera</span>
                                        <input
                                          type="file"
                                          accept="image/*"
                                          capture="user"
                                          className="hidden"
                                          disabled={isFormZeroReadOnly}
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                              const reader = new FileReader();
                                              reader.onload = (ev) => {
                                                const dataUrl = ev.target?.result as string;
                                                handleInputChange(activeForm.id, field.name, dataUrl);
                                                if (activeChild) activeChild.photoUrl = dataUrl;
                                              };
                                              reader.readAsDataURL(file);
                                            }
                                          }}
                                        />
                                      </label>
                                    </div>
                                  )}
                                </div>
                              ) : field.type === 'date' ? (() => {
                                const isDobField = field.name === 'dob' || 
                                  field.name === 'date_of_birth' || 
                                  field.name === 'birth_date' || 
                                  field.name === 'child_dob' ||
                                  field.name.toLowerCase().includes('birth') ||
                                  field.label.toLowerCase().includes('birth');
                                const dateVal = val || (isDobField ? activeChild?.dob || '' : '');

                                return (
                                  <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                      <label className="font-bold text-slate-800 block">
                                        {field.label} {field.required && !isFormZeroReadOnly && '*'}
                                      </label>
                                      {!isFormZeroReadOnly && !isDobField && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const today = new Date().toISOString().split('T')[0];
                                            handleInputChange(activeForm.id, field.name, today);
                                          }}
                                          className="text-[11px] font-bold text-orange-700 hover:text-orange-900 bg-orange-100/70 hover:bg-orange-200 px-2 py-0.5 rounded-lg border border-orange-300 transition-all flex items-center gap-1 cursor-pointer"
                                          title="Apply today's date"
                                        >
                                          <Calendar className="w-3 h-3 text-orange-600" />
                                          <span>Today</span>
                                        </button>
                                      )}
                                    </div>

                                    <AccsDatePicker
                                      value={dateVal}
                                      onChange={(newDate) => handleInputChange(activeForm.id, field.name, newDate)}
                                      placeholder={field.placeholder || (isDobField ? 'YYYY-MM-DD (Child DOB)' : 'YYYY-MM-DD')}
                                      required={field.required && !isFormZeroReadOnly}
                                      disabled={isFormZeroReadOnly}
                                      mode={isDobField ? 'birthdate' : 'general'}
                                      minYear={isDobField ? new Date().getFullYear() - 13 : 2020}
                                      maxYear={isDobField ? new Date().getFullYear() : new Date().getFullYear() + 3}
                                      className="w-full"
                                    />

                                    {!isFormZeroReadOnly && !isDobField && (
                                      <div className="flex items-center gap-2 pt-0.5">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const today = new Date().toISOString().split('T')[0];
                                            handleInputChange(activeForm.id, field.name, today);
                                          }}
                                          className="neo-btn bg-slate-50 hover:bg-orange-50 text-slate-800 text-[11px] px-2.5 py-1 font-bold rounded-lg border border-slate-300 gap-1.5 shadow-sm cursor-pointer"
                                        >
                                          <Calendar className="w-3.5 h-3.5 text-orange-600" />
                                          <span>Automatically Apply Today's Date ({new Date().toISOString().split('T')[0]})</span>
                                        </button>
                                      </div>
                                    )}
                                    {field.helpText && <p className="text-[10px] text-slate-400 mt-1">{field.helpText}</p>}
                                  </div>
                                );
                              })() : (
                                <div className="space-y-1">
                                  <label className="font-bold text-slate-800 block">
                                    {field.label} {field.required && !isFormZeroReadOnly && '*'}
                                  </label>
                                  <input
                                    type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
                                    disabled={isFormZeroReadOnly}
                                    placeholder={field.placeholder}
                                    value={val}
                                    onChange={(e) => handleInputChange(activeForm.id, field.name, e.target.value)}
                                    className={`w-full p-2.5 rounded-xl font-medium ${
                                      isFormZeroReadOnly
                                        ? 'bg-slate-100 text-slate-700 border border-slate-300 cursor-not-allowed'
                                        : 'bg-slate-50 border-2 border-slate-900 focus:ring-2 focus:ring-orange-500'
                                    }`}
                                    required={field.required && !isFormZeroReadOnly}
                                  />
                                  {field.helpText && <p className="text-[10px] text-slate-400 mt-1">{field.helpText}</p>}
                                </div>
                              )}


                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Form Submission Action Buttons */}
              <div className="pt-4 border-t-2 border-slate-100 flex items-center justify-between print:hidden no-print">
                {isFormZeroReadOnly ? (
                  <>
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Pre-Screening Approved (Read-Only)</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        const nextForm = parentForms.find(f => f.id !== 'par-form-0')?.id || 'par-form-1';
                        setActiveFormId(nextForm);
                      }}
                      className="neo-btn bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 text-xs font-bold gap-2 shadow-neo-sm cursor-pointer"
                    >
                      <span>Continue to Form 1 (Master Application)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-xs text-slate-400 font-medium">
                      {formCompletionStatus[activeForm.id] === 'completed' ? '✓ Saved' : 'Unsaved Changes'}
                    </span>

                    <button
                      type="submit"
                      className="neo-btn bg-orange-500 hover:bg-orange-400 text-white px-6 py-2.5 text-xs font-extrabold gap-2 shadow-neo-sm cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>Save & Submit {activeForm.formCode}</span>
                    </button>
                  </>
                )}
              </div>
            </form>
          ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
