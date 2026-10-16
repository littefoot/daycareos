import React, { useState, useEffect } from 'react';
import { Child, DocumentRecord, DocumentType, ParentGuardian } from '../../types';
import { ModalPortal } from '../common/ModalPortal';
import { AS_NEEDED_DOCUMENT_TEMPLATES, AsNeededDocumentTemplate } from '../../data/asNeededFormsData';
import { AccsDatePicker } from '../common/AccsDatePicker';
import { sendParentPortalEmail, EmailDispatchResult } from '../../services/resendService';
import { 
  Send, 
  X, 
  FileText, 
  Check, 
  AlertCircle, 
  Calendar, 
  Clock, 
  ShieldAlert, 
  ExternalLink, 
  Copy, 
  Sparkles,
  User,
  Baby
} from 'lucide-react';

interface DispatchFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  childrenList: Child[];
  parentsList?: ParentGuardian[];
  preSelectedChildId?: string;
  preSelectedTemplateId?: string;
  onDispatch: (childId: string, newDoc: DocumentRecord, customNote: string) => void;
}

export const DispatchFormModal: React.FC<DispatchFormModalProps> = ({
  isOpen,
  onClose,
  childrenList,
  parentsList = [],
  preSelectedChildId,
  preSelectedTemplateId,
  onDispatch
}) => {
  const [selectedChildId, setSelectedChildId] = useState<string>(
    preSelectedChildId || (childrenList.length > 0 ? childrenList[0].id : '')
  );

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    preSelectedTemplateId || AS_NEEDED_DOCUMENT_TEMPLATES[0].id
  );

  // Set default due date: 14 days from now
  const defaultDueDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  };

  const [dueDate, setDueDate] = useState<string>(defaultDueDate());
  const [priority, setPriority] = useState<'normal' | 'urgent'>('normal');
  const [customNotes, setCustomNotes] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [dispatchSuccess, setDispatchSuccess] = useState<boolean>(false);
  const [emailResult, setEmailResult] = useState<EmailDispatchResult | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);

  // When selected template changes, pre-populate default notes
  const currentTemplate = AS_NEEDED_DOCUMENT_TEMPLATES.find(t => t.id === selectedTemplateId) || AS_NEEDED_DOCUMENT_TEMPLATES[0];

  React.useEffect(() => {
    if (preSelectedChildId) {
      setSelectedChildId(preSelectedChildId);
    }
  }, [preSelectedChildId]);

  React.useEffect(() => {
    if (preSelectedTemplateId) {
      setSelectedTemplateId(preSelectedTemplateId);
      const t = AS_NEEDED_DOCUMENT_TEMPLATES.find(item => item.id === preSelectedTemplateId);
      if (t?.defaultNotes) {
        setCustomNotes(t.defaultNotes);
      }
    } else if (currentTemplate?.defaultNotes && !customNotes) {
      setCustomNotes(currentTemplate.defaultNotes);
    }
  }, [preSelectedTemplateId, selectedTemplateId]);

  // Close on Escape key
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const targetChild = childrenList.find(c => c.id === selectedChildId);

  // Map template formCode to DocumentType
  const resolveDocType = (formCode: string): DocumentType => {
    if (formCode.includes('SUP-4A')) return 'religious_exemption';
    if (formCode.includes('SUP-4B')) return 'medical_exemption';
    if (formCode.includes('SUP-1')) return 'individualized_support_plan';
    if (formCode.includes('SUP-2')) return 'accident_report';
    if (formCode.includes('SUP-3')) return 'medication_plan';
    if (formCode.includes('SUP-5')) return 'food_restrictions_plan';
    return 'as_needed_supplemental';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetChild) return;

    const newDocId = `doc-${currentTemplate.formCode.toLowerCase()}-${Date.now()}`;
    const newDocRecord: DocumentRecord = {
      id: newDocId,
      type: resolveDocType(currentTemplate.formCode),
      title: currentTemplate.title,
      status: 'not_submitted',
      formCode: currentTemplate.formCode,
      downloadUrl: currentTemplate.pdfUrl,
      notes: customNotes || currentTemplate.defaultNotes || '',
      dispatchedAt: new Date().toISOString(),
      dispatchedBy: 'Agency Director',
      dueDate: dueDate,
      priority: priority,
      targetAudience: currentTemplate.targetAudience,
      digitalFormId: currentTemplate.digitalFormId
    };

    onDispatch(targetChild.id, newDocRecord, customNotes);
    setDispatchSuccess(true);

    // 1-Click Interactive Email Dispatch via Resend API
    const targetParent = parentsList.find(p => p.id === targetChild.parentId);
    if (targetParent?.email && targetParent.email.includes('@')) {
      setIsSendingEmail(true);
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const portalUrl = `${origin}/?role=parent&familyId=${targetChild.parentId}&childId=${targetChild.id}`;

      sendParentPortalEmail({
        to: targetParent.email,
        parentName: targetParent.fullName,
        childName: targetChild.fullName,
        portalUrl,
        formTitle: currentTemplate.title,
        formCode: currentTemplate.formCode,
        dueDate,
        priority,
        customNotes,
        senderName: 'Agency Director'
      }).then(res => {
        setEmailResult(res);
        setIsSendingEmail(false);
      }).catch(err => {
        console.warn('Dispatch email error:', err);
        setIsSendingEmail(false);
      });
    }
  };

  const handleCopyParentLink = () => {
    if (!targetChild) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const link = `${origin}/?role=parent&familyId=${targetChild.parentId}`;
    navigator.clipboard.writeText(link);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <ModalPortal>
      <div 
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
      >
        <div 
          className="bg-white border-2 border-slate-900 rounded-3xl shadow-neo max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-900 cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-5 bg-gradient-to-r from-orange-50 to-amber-50 border-b-2 border-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center border-2 border-slate-900 shadow-neo-sm">
                <Send className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight text-slate-900">
                  Dispatch As-Needed Form
                </h2>
                <p className="text-xs font-medium text-slate-600">
                  Distribute targeted agency forms or exemption affidavits to child records
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            {dispatchSuccess ? (
              <div className="p-6 bg-emerald-50 border-2 border-emerald-500 rounded-2xl text-center space-y-4">
                <div className="w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-neo-sm border-2 border-slate-900">
                  <Check className="w-7 h-7 stroke-[3]" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-emerald-950">
                    Form Dispatched Successfully!
                  </h3>
                  <p className="text-xs text-emerald-800 mt-1 max-w-md mx-auto">
                    <strong>{currentTemplate.title}</strong> is now attached to <strong>{targetChild?.fullName}</strong>.
                  </p>
                  {emailResult && (
                    <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-emerald-300 rounded-full text-xs font-bold text-emerald-900 shadow-2xs">
                      <span>✉️</span>
                      <span>
                        {emailResult.simulated 
                          ? `Dispatched to ${emailResult.recipient} (Sandbox Mode)` 
                          : `Sent via Resend to ${emailResult.recipient}`}
                      </span>
                    </div>
                  )}
                  {isSendingEmail && (
                    <p className="text-[11px] text-emerald-700 animate-pulse mt-1">
                      Dispatching transactional notification via Resend API...
                    </p>
                  )}
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleCopyParentLink}
                    className="neo-btn bg-white hover:bg-slate-50 text-slate-900 border-slate-900 px-4 py-2 text-xs font-bold gap-2 cursor-pointer"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
                    <span>{isCopied ? 'Link Copied!' : 'Copy Parent Portal Direct Link'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDispatchSuccess(false);
                      setEmailResult(null);
                      onClose();
                    }}
                    className="neo-btn bg-slate-900 hover:bg-slate-800 text-white border-slate-900 px-5 py-2 text-xs font-bold cursor-pointer"
                  >
                    Done & Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 1. Target Child Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Baby className="w-3.5 h-3.5 text-orange-600" />
                    <span>Select Target Child / Household</span>
                  </label>
                  <select
                    value={selectedChildId}
                    onChange={(e) => setSelectedChildId(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:border-slate-900 focus:bg-white outline-none transition-colors"
                  >
                    {childrenList.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.fullName} • Age: {c.ageYearsFormatted} • Stage: {c.admissionsStage.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Target Form Template Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-orange-600" />
                    <span>Select Form from Agency Bin</span>
                  </label>
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => {
                      setSelectedTemplateId(e.target.value);
                      const t = AS_NEEDED_DOCUMENT_TEMPLATES.find(item => item.id === e.target.value);
                      if (t?.defaultNotes) {
                        setCustomNotes(t.defaultNotes);
                      }
                    }}
                    className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:border-slate-900 focus:bg-white outline-none transition-colors"
                  >
                    {AS_NEEDED_DOCUMENT_TEMPLATES.map(tmpl => (
                      <option key={tmpl.id} value={tmpl.id}>
                        [{tmpl.formCode}] {tmpl.title} ({tmpl.category})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selected Form Quick Spec Card */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-orange-700 bg-orange-100 px-2 py-0.5 rounded text-[10px] border border-orange-300">
                        {currentTemplate.formCode}
                      </span>
                      <span className="font-extrabold text-slate-900">{currentTemplate.title}</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {currentTemplate.fileSizeFormatted}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {currentTemplate.description}
                  </p>
                  <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-200/60 font-medium">
                    <span>Statutory Ref: {currentTemplate.statutoryReference}</span>
                    <a
                      href={currentTemplate.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Preview Blank Template</span>
                    </a>
                  </div>
                </div>

                {/* 3. Priority and Due Date Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                      <span>Priority</span>
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setPriority('normal')}
                        className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                          priority === 'normal'
                            ? 'bg-slate-900 text-white border-slate-900 shadow-neo-sm'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        Normal Review
                      </button>
                      <button
                        type="button"
                        onClick={() => setPriority('urgent')}
                        className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                          priority === 'urgent'
                            ? 'bg-rose-600 text-white border-rose-900 shadow-neo-sm'
                            : 'bg-white text-rose-700 border-rose-300 hover:bg-rose-50'
                        }`}
                      >
                        Urgent / Statutory
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-orange-600" />
                      <span>Target Due Date</span>
                    </label>
                    <AccsDatePicker
                      value={dueDate}
                      onChange={setDueDate}
                      mode="future"
                      className="w-full text-xs py-2"
                    />
                  </div>
                </div>

                {/* 4. Custom Note to Parent / Provider */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Instructions / Custom Note from Agency</span>
                    <span className="text-[10px] text-slate-400 font-normal">Visible to Parent</span>
                  </label>
                  <textarea
                    rows={3}
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    placeholder="e.g. Please have your pediatrician sign and stamp Section 3 before the unannounced inspection..."
                    className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:border-slate-900 focus:bg-white outline-none resize-none font-medium"
                  />
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t-2 border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="neo-btn bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300 px-4 py-2 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="neo-btn bg-orange-500 hover:bg-orange-600 text-white border-slate-900 px-6 py-2 text-xs font-extrabold gap-2 cursor-pointer shadow-neo-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Dispatch Form to Parent</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};
