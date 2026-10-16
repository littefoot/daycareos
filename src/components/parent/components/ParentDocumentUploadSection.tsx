import React from 'react';
import { Child, DocumentRecord } from '../../../types';
import {
  FileText,
  Sparkles,
  CheckCircle2,
  FileCheck,
  UploadCloud,
  Loader2,
  Eye,
  ShieldCheck,
  RotateCcw,
  Download
} from 'lucide-react';

export interface ParentDocumentUploadSectionProps {
  activeChild: Child;
  childDocs: DocumentRecord[];
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
  onResetDocs?: () => void;
  subheading?: string;
}

export const ParentDocumentUploadSection: React.FC<ParentDocumentUploadSectionProps> = ({
  activeChild,
  childDocs,
  docUploadState,
  handleDocumentUpload,
  handleUseSampleDoc,
  setPreviewDocModal,
  onResetDocs,
  subheading = 'Upload proof of birth, Ontario Health Card (OHIP), and Yellow Immunization Record for Ministry licensing compliance.'
}) => {
  // Filter strictly to the 3 physical documents parent must upload
  const uploadableDocs = childDocs.filter(d => 
    d.type === 'birth_certificate' || d.type === 'health_card' || d.type === 'immunization'
  );

  const displayDocs: DocumentRecord[] = [
    uploadableDocs.find(d => d.type === 'birth_certificate') || {
      id: 'doc-birth',
      type: 'birth_certificate',
      title: '1. Child Birth Certificate / Proof of Age',
      status: 'not_submitted'
    },
    uploadableDocs.find(d => d.type === 'health_card') || {
      id: 'doc-health',
      type: 'health_card',
      title: '2. Ontario Health Card (OHIP)',
      status: 'not_submitted'
    },
    uploadableDocs.find(d => d.type === 'immunization') || {
      id: 'doc-immu',
      type: 'immunization',
      title: '3. Ontario Yellow Immunization Record',
      status: 'not_submitted'
    }
  ];

  const acceptedDocs = displayDocs.filter(d => d.status === 'accepted');

  // Filter any as-needed or supplemental documents dispatched specifically to this child
  const dispatchedDocs = childDocs.filter(d => 
    Boolean(d.formCode) || 
    Boolean(d.downloadUrl) || 
    (d.type !== 'birth_certificate' && d.type !== 'health_card' && d.type !== 'immunization')
  );

  return (
    <div className="space-y-4 pt-4 border-t-2 border-slate-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-orange-600" />
            <h3 className="text-base font-extrabold text-slate-900">
              Mandatory Ontario Licensing Documents: <span className="text-orange-600">{activeChild.fullName}</span>
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {subheading}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onResetDocs && (
            <button
              type="button"
              onClick={onResetDocs}
              className="neo-btn bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-xl border border-slate-300 gap-1 flex items-center cursor-pointer"
              title="Reset documents to unsubmitted for re-testing"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset for Re-test</span>
            </button>
          )}
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-xl border border-slate-200 shrink-0">
            {acceptedDocs.length} of {displayDocs.length} Approved
          </span>
        </div>
      </div>

      {/* Quick Testing Bar for Ontario Sample Documents */}
      <div className="p-3.5 bg-amber-50/70 border-2 border-amber-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-amber-950 font-bold">
          <FileText className="w-4 h-4 text-orange-600 shrink-0" />
          <span>Demo Shortcut (Optional):</span>
          <span className="text-[11px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-300">
            Click "Upload" below for your files, or auto-attach our demo scans:
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            for (const doc of displayDocs) {
              handleUseSampleDoc(doc.id, doc.type);
            }
          }}
          className="neo-btn bg-white hover:bg-orange-50 text-slate-900 text-xs font-extrabold px-3 py-1.5 rounded-xl border-2 border-slate-900 gap-1.5 shadow-neo-sm shrink-0 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-orange-600" />
          <span>⚡ Demo: Auto-Attach 3 Sample Scans</span>
        </button>
      </div>

      {/* Document Upload Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {displayDocs.map((doc) => {
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
                <div className="space-y-1 min-w-0">
                  <span className="font-extrabold text-slate-900 block text-xs truncate" title={doc.title}>
                    {doc.title}
                  </span>
                  <span className="text-[10px] text-slate-500 block line-clamp-2">
                    {doc.type === 'birth_certificate' ? 'CCEYA age verification & birth registry' :
                      doc.type === 'health_card' ? 'Emergency medical coverage & OHIP # verification' :
                      doc.type === 'immunization' ? 'Public Health yellow card vaccine compliance' :
                      'Ontario licensing compliance document'}
                  </span>
                </div>

                {/* Status Badge */}
                <span className={`px-2 py-0.5 rounded-full font-extrabold text-[9px] uppercase border shrink-0 ${
                  isAccepted ? 'bg-emerald-100 text-emerald-900 border-emerald-300' :
                  isUnderReview ? 'bg-amber-100 text-amber-900 border-amber-300' :
                  isRejected ? 'bg-red-100 text-red-900 border-red-300' :
                  'bg-slate-200 text-slate-700 border-slate-300'
                }`}>
                  {isAccepted ? '✓ Accepted' :
                    isUnderReview ? '⏳ In Audit' :
                    isRejected ? '⚠️ Re-upload' :
                    'Not Submitted'}
                </span>
              </div>

              {/* Visual Document Thumbnail for Parent */}
              {doc.fileUrl && (
                <div className="p-2 bg-white rounded-xl border border-slate-200 flex items-center gap-2.5 shadow-inner">
                  <div 
                    onClick={() => setPreviewDocModal({ title: doc.title, url: doc.fileUrl! })}
                    className="w-12 h-12 bg-slate-900 rounded-lg overflow-hidden shrink-0 cursor-pointer relative group border border-slate-300 shadow-sm"
                  >
                    <img 
                      src={doc.fileUrl} 
                      alt={doc.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200" 
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <Eye className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div className="space-y-0.5 min-w-0 flex-1">
                    <span className="text-[11px] font-bold text-slate-900 truncate block">
                      {doc.fileName || 'Uploaded Document File'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPreviewDocModal({ title: doc.title, url: doc.fileUrl! })}
                      className="text-[10px] text-orange-600 hover:underline font-extrabold flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Preview File</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Action Bar & Upload Button on EVERY card */}
              <div className="pt-2 border-t border-slate-200/60">
                {docUploadState[doc.id] && !docUploadState[doc.id].isComplete ? (
                  <div className="space-y-1.5 bg-white p-2.5 rounded-xl border border-orange-300 shadow-sm animate-pulse">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
                      <span className="truncate max-w-[120px]">{docUploadState[doc.id].fileName}</span>
                      <span className="text-orange-600 font-mono font-extrabold flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>{docUploadState[doc.id].progress}%</span>
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-amber-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${docUploadState[doc.id].progress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-1.5 w-full">
                    {isAccepted ? (
                      <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Verified</span>
                      </span>
                    ) : isUnderReview ? (
                      <span className="text-[10px] text-amber-800 font-bold flex items-center gap-1 truncate">
                        <FileCheck className="w-3 h-3 text-amber-600 shrink-0" />
                        <span>Auditing</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleUseSampleDoc(doc.id, doc.type)}
                        className="neo-btn bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-2 py-1 text-[10px] font-bold rounded-lg flex items-center gap-1 cursor-pointer shrink-0"
                        title="Auto-Attach Sample Document"
                      >
                        <Sparkles className="w-3 h-3 text-orange-600" />
                        <span>Sample</span>
                      </button>
                    )}

                    <label className={`neo-btn px-3 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer shadow-sm flex items-center gap-1 shrink-0 ${
                      isAccepted
                        ? 'bg-white hover:bg-slate-100 text-slate-800 border-2 border-slate-900'
                        : isUnderReview
                        ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-400'
                        : 'bg-orange-500 hover:bg-orange-400 text-white'
                    }`}>
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>{isAccepted ? 'Replace File' : isUnderReview ? 'Replace' : 'Upload File'}</span>
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

      {/* Dispatched As-Needed Agency Forms Section */}
      {dispatchedDocs.length > 0 && (
        <div className="pt-5 border-t-2 border-slate-200 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-600" />
              <h4 className="text-sm font-extrabold text-slate-900">
                Special As-Needed Forms Dispatched by Agency: <span className="text-orange-600">{activeChild.fullName}</span>
              </h4>
            </div>
            <span className="text-[11px] font-bold text-orange-950 bg-orange-100 px-2.5 py-0.5 rounded-full border border-orange-300">
              {dispatchedDocs.length} Requested
            </span>
          </div>
          <p className="text-xs text-slate-500">
            The Agency Director has requested the following statutory affidavits or accommodation plans. Download the blank template or upload your signed copy below:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {dispatchedDocs.map((doc) => {
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
                    'bg-white border-slate-900 shadow-neo-sm'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {doc.formCode && (
                          <span className="font-mono font-black text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded">
                            {doc.formCode}
                          </span>
                        )}
                        {doc.priority === 'urgent' && (
                          <span className="text-[9px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300 px-2 py-0.5 rounded-full">
                            URGENT / STATUTORY
                          </span>
                        )}
                      </div>

                      <span className={`px-2 py-0.5 rounded-full font-extrabold text-[9px] uppercase border shrink-0 ${
                        isAccepted ? 'bg-emerald-100 text-emerald-900 border-emerald-300' :
                        isUnderReview ? 'bg-amber-100 text-amber-900 border-amber-300' :
                        isRejected ? 'bg-red-100 text-red-900 border-red-300' :
                        'bg-slate-100 text-slate-700 border-slate-300'
                      }`}>
                        {isAccepted ? '✓ Accepted' :
                          isUnderReview ? '⏳ In Audit' :
                          isRejected ? '⚠️ Re-upload' :
                          'Action Required'}
                      </span>
                    </div>

                    <div>
                      <span className="font-extrabold text-slate-900 block text-xs">
                        {doc.title}
                      </span>
                      {doc.dueDate && (
                        <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                          Target Due Date: <strong className="text-slate-700 font-bold">{doc.dueDate}</strong>
                        </span>
                      )}
                    </div>

                    {doc.notes && (
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-700">
                        <span className="font-bold text-slate-900 block text-[10px] uppercase tracking-wider mb-0.5 text-orange-700">
                          Agency Note:
                        </span>
                        {doc.notes}
                      </div>
                    )}
                  </div>

                  {/* Thumbnail / Upload Status */}
                  {doc.fileUrl && (
                    <div className="p-2 bg-white rounded-xl border border-slate-200 flex items-center gap-2.5 shadow-inner">
                      <div 
                        onClick={() => setPreviewDocModal({ title: doc.title, url: doc.fileUrl! })}
                        className="w-10 h-10 bg-slate-900 rounded-lg overflow-hidden shrink-0 cursor-pointer relative group border border-slate-300 shadow-sm"
                      >
                        <img 
                          src={doc.fileUrl} 
                          alt={doc.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200" 
                        />
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Eye className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      <div className="space-y-0.5 min-w-0 flex-1">
                        <span className="text-[11px] font-bold text-slate-900 truncate block">
                          {doc.fileName || 'Uploaded Form'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setPreviewDocModal({ title: doc.title, url: doc.fileUrl! })}
                          className="text-[10px] text-orange-600 hover:underline font-extrabold flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Preview Uploaded File</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Bottom Action Bar */}
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2 flex-wrap">
                    {doc.downloadUrl && (
                      <a
                        href={doc.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="neo-btn bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 px-2.5 py-1 text-[11px] font-bold gap-1 rounded-lg cursor-pointer"
                        title="Download blank official template PDF"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-600" />
                        <span>Download Template</span>
                      </a>
                    )}

                    <label className={`neo-btn px-3 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer shadow-sm flex items-center gap-1 shrink-0 ${
                      isAccepted
                        ? 'bg-white hover:bg-slate-100 text-slate-800 border-2 border-slate-900'
                        : isUnderReview
                        ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-400'
                        : 'bg-orange-500 hover:bg-orange-400 text-white'
                    }`}>
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>{isAccepted ? 'Replace' : isUnderReview ? 'Replace' : 'Upload Completed'}</span>
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
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
