import React, { useState } from 'react';
import { Provider } from '../../types';
import { loadAgencySettings, DEFAULT_CCEYA_TRAINING_MODULES } from '../../data/agencySettingsData';
import { 
  ShieldCheck, 
  Video, 
  ExternalLink, 
  CheckCircle2, 
  FileText, 
  Download, 
  Clock, 
  AlertCircle, 
  Calendar, 
  Building2,
  Lock,
  Printer,
  FileCheck
} from 'lucide-react';

interface ProviderComplianceHubProps {
  provider: Provider;
  docReceipts?: Record<string, string>;
  onAcknowledgeDoc?: (docId: string, timestamp?: string) => void;
  onUnacknowledgeDoc?: (docId: string) => void;
  complianceAttestations?: Record<string, boolean>;
  onToggleModule?: (modId: string) => void;
  isSignoffSubmitted?: boolean;
  submittedDate?: string | null;
  onSignoffSubmitted?: (submittedDate: string, signatureName: string) => void;
}

export interface DistributedDocument {
  id: string;
  code: string;
  title: string;
  category: 'Statutory Form' | 'Agency Policy' | 'Public Health Directive' | 'Emergency Protocol';
  description: string;
  distributedBy: string;
  distributedDate: string;
  fileSize: string;
  fileUrl?: string;
  isMandatory: boolean;
}

export const DISTRIBUTED_DOCUMENTS: DistributedDocument[] = [
  {
    id: 'doc-prov-2',
    code: 'FORM PROV-2',
    title: 'Quarterly Home Safety & Fire Inspection Checklist',
    category: 'Statutory Form',
    description: 'Mandatory CCEYA Section 26 checklist covering physical home safety, smoke detectors, carbon monoxide alarms, and fenced outdoor play areas.',
    distributedBy: 'Agency Director',
    distributedDate: '2026-10-01',
    fileSize: '1.2 MB',
    fileUrl: '/documents/provider_forms/02. Home Assessment Screening for Safety, and Required Childrens Activities Materials FINAL.pdf',
    isMandatory: true
  },
  {
    id: 'doc-prov-3',
    code: 'FORM PROV-3',
    title: 'Annual CCEYA Policy Review & Offence Declaration',
    category: 'Statutory Form',
    description: 'Statutory instrument under O. Reg. 137/15 ss. 54 & 59 for annual policy attestations and police criminal offence declarations.',
    distributedBy: 'Agency Director',
    distributedDate: '2026-10-01',
    fileSize: '878 KB',
    fileUrl: '/documents/provider_forms/03. Planning And Preparing Providers FINAL.pdf',
    isMandatory: true
  },
  {
    id: 'doc-em-1',
    code: 'FORM EM-1',
    title: 'Child Emergency Backpack & Field Outings Packet',
    category: 'Emergency Protocol',
    description: 'CCEYA Section 68 emergency evacuation cards and authorized pick-up roster required on all neighborhood outings and grab-bags.',
    distributedBy: 'Agency Director',
    distributedDate: '2026-09-15',
    fileSize: '295 KB',
    fileUrl: '/documents/bin/CITS x ACCS Home Child Care Emergency Contact List Ontario.pdf',
    isMandatory: true
  },
  {
    id: 'doc-cwelcc-memo',
    code: 'MEMO-2026-08',
    title: 'Ministry of Education CWELCC $10/Day Operating Memo',
    category: 'Agency Policy',
    description: 'Official provincial funding directive outlining fee cap guidelines, provider compensation standards, and statutory mixed-age ratios.',
    distributedBy: 'Agency Director',
    distributedDate: '2026-08-20',
    fileSize: '863 KB',
    fileUrl: '/documents/bin/(OUR CURRICULUM) (INTRO) How Does Learning Happen - Home Child Care.pdf',
    isMandatory: false
  },
  {
    id: 'doc-ph-exclusion',
    code: 'PH-DUR-2026',
    title: 'Durham & York Public Health: Pediatric Illness & Exclusion Guide',
    category: 'Public Health Directive',
    description: 'Standardized 48-hour symptom-free isolation timelines for gastrointestinal and communicable respiratory illnesses in licensed homes.',
    distributedBy: 'Sabrina Vance, RECE (Home Visitor)',
    distributedDate: '2026-09-01',
    fileSize: '550 KB',
    fileUrl: '/documents/bin/CITS x ACCS Accident Report.pdf',
    isMandatory: true
  }
];

interface TrainingModule {
  id: string;
  code: string;
  title: string;
  duration: string;
  topics: string[];
  videoUrl: string;
}

export const ProviderComplianceHub: React.FC<ProviderComplianceHubProps> = ({ 
  provider,
  docReceipts,
  onAcknowledgeDoc,
  onUnacknowledgeDoc,
  complianceAttestations,
  onToggleModule,
  isSignoffSubmitted: propIsSignoffSubmitted,
  submittedDate: propSubmittedDate,
  onSignoffSubmitted
}) => {
  const [agencySettings] = useState(loadAgencySettings);
  const trainingModules = (agencySettings.cceyaTrainingModules && agencySettings.cceyaTrainingModules.length > 0)
    ? agencySettings.cceyaTrainingModules
    : DEFAULT_CCEYA_TRAINING_MODULES;

  const currentYear = new Date().getFullYear();
  const complianceCycle = `${currentYear} / ${currentYear + 1} Licensing Year`;

  const storageKeySignoff = `accs_prov_compliance_signoff_${provider.id}_${currentYear}`;
  const storageKeyReceipts = `accs_prov_doc_receipts_${provider.id}`;

  // State for Video Module Attestations (fallback if prop not passed)
  const [localModuleAttestations, setLocalModuleAttestations] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKeySignoff);
        if (saved) return JSON.parse(saved).modules || {};
      } catch (e) {}
    }
    return {
      'mod-anaphylaxis': true,
      'mod-safe-sleep': true,
      'mod-behaviour-guidance': false,
      'mod-serious-occurrence': false
    };
  });

  const activeAttestations = complianceAttestations || localModuleAttestations;

  // State for Annual Offence Declaration (CCEYA s. 59)
  const [offenceDeclaration, setOffenceDeclaration] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKeySignoff);
        if (saved) return Boolean(JSON.parse(saved).offenceDeclaration);
      } catch (e) {}
    }
    return true;
  });

  // Legal Signature & Submission State
  const [signatureName, setSignatureName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKeySignoff);
        if (saved) return JSON.parse(saved).signatureName || provider.name;
      } catch (e) {}
    }
    return provider.name;
  });

  const [localIsSignoffSubmitted, setLocalIsSignoffSubmitted] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKeySignoff);
        if (saved) return Boolean(JSON.parse(saved).isSubmitted);
      } catch (e) {}
    }
    return false;
  });

  const [localSubmittedDate, setLocalSubmittedDate] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKeySignoff);
        if (saved) return JSON.parse(saved).submittedDate || null;
      } catch (e) {}
    }
    return null;
  });

  const activeIsSignoffSubmitted = propIsSignoffSubmitted !== undefined 
    ? propIsSignoffSubmitted 
    : localIsSignoffSubmitted;
  const activeSubmittedDate = propSubmittedDate !== undefined 
    ? propSubmittedDate 
    : localSubmittedDate;

  // State for Document Distribution Receipts (fallback if prop not passed)
  const [localAcknowledgedDocs, setLocalAcknowledgedDocs] = useState<Record<string, string>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKeyReceipts);
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      'doc-prov-2': '2026-10-01 10:15 AM',
      'doc-em-1': '2026-09-16 02:40 PM'
    };
  });

  const activeReceipts = docReceipts || localAcknowledgedDocs;

  const [activeSection, setActiveSection] = useState<'training_signoff' | 'document_shelf'>('training_signoff');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleToggleModule = (modId: string) => {
    if (activeIsSignoffSubmitted) return;
    if (onToggleModule) {
      onToggleModule(modId);
    } else {
      setLocalModuleAttestations(prev => ({
        ...prev,
        [modId]: !prev[modId]
      }));
    }
  };

  const handleAcknowledgeDoc = (docId: string) => {
    const now = new Date().toLocaleString('en-CA', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    if (onAcknowledgeDoc) {
      onAcknowledgeDoc(docId, now);
    } else {
      setLocalAcknowledgedDocs(prev => {
        const next = { ...prev, [docId]: now };
        if (typeof window !== 'undefined') {
          localStorage.setItem(storageKeyReceipts, JSON.stringify(next));
        }
        return next;
      });
    }
    setToastMessage('Document receipt verified and recorded in Agency Master Audit Ledger.');
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleUnacknowledgeDoc = (docId: string) => {
    if (onUnacknowledgeDoc) {
      onUnacknowledgeDoc(docId);
    } else {
      setLocalAcknowledgedDocs(prev => {
        const next = { ...prev };
        delete next[docId];
        if (typeof window !== 'undefined') {
          localStorage.setItem(storageKeyReceipts, JSON.stringify(next));
        }
        return next;
      });
    }
    setToastMessage('Document receipt reset.');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSubmitAnnualSignoff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signatureName.trim()) return;

    const allChecked = trainingModules.every(m => activeAttestations[m.id]);
    if (!allChecked || !offenceDeclaration) {
      alert('Please confirm all training module reviews and the statutory offence declaration before executing your annual legal sign-off.');
      return;
    }

    const todayStr = new Date().toLocaleDateString('en-CA');
    const payload = {
      isSubmitted: true,
      submittedDate: todayStr,
      signatureName: signatureName.trim(),
      offenceDeclaration,
      modules: activeAttestations
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKeySignoff, JSON.stringify(payload));
    }

    if (onSignoffSubmitted) {
      onSignoffSubmitted(todayStr, signatureName.trim());
    } else {
      setLocalIsSignoffSubmitted(true);
      setLocalSubmittedDate(todayStr);
    }
    setToastMessage('Annual CCEYA Policy Sign-Off & Offence Declaration digitally executed and filed with Agency Director.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const completedModulesCount = trainingModules.filter(m => activeAttestations[m.id]).length;
  const isAllModulesComplete = completedModulesCount === trainingModules.length;
  const unacknowledgedCount = DISTRIBUTED_DOCUMENTS.filter(d => !activeReceipts[d.id]).length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-600 text-white font-bold text-xs p-3.5 rounded-2xl shadow-neo-sm flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-white/80 hover:text-white">✕</button>
        </div>
      )}

      {/* Main Compliance Header Card */}
      <div className="bg-white rounded-3xl border-2 border-slate-900 p-6 shadow-neo-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b-2 border-slate-900">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-purple-100 text-purple-900 rounded-2xl border-2 border-slate-900 shadow-neo-sm">
              <ShieldCheck className="w-6 h-6 text-purple-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-slate-900">
                  Annual Compliance & Policy Hub
                </h2>
                <span className="text-[10px] font-mono font-bold bg-purple-100 text-purple-900 border border-purple-300 px-2 py-0.5 rounded-full">
                  {complianceCycle}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Ontario CCEYA O. Reg. 137/15 Statutory Policy Attestation, Training Modules & Agency Document Shelf
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            {activeIsSignoffSubmitted ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-900 border-2 border-emerald-500 font-extrabold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Annual Sign-Off Active ({activeSubmittedDate || 'Executed'})</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 text-amber-950 border-2 border-amber-400 font-extrabold text-xs">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Sign-Off Pending ({completedModulesCount}/{trainingModules.length} Reviewed)</span>
              </span>
            )}
          </div>
        </div>

        {/* Sub-Tabs: Training & Policy Sign-Off vs Document Distribution Shelf */}
        <div className="flex items-center gap-2 pt-4">
          <button
            onClick={() => setActiveSection('training_signoff')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 border-2 cursor-pointer ${
              activeSection === 'training_signoff'
                ? 'bg-slate-900 text-white border-slate-900 shadow-neo-sm'
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-orange-400" />
            <span>1. Mandatory Annual Training & Policy Sign-Off</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
              activeIsSignoffSubmitted 
                ? 'bg-emerald-600 text-white' 
                : activeSection === 'training_signoff' ? 'bg-amber-300 text-slate-950' : 'bg-amber-100 text-amber-950 border border-amber-300'
            }`}>
              {activeIsSignoffSubmitted ? 'Complete' : `${completedModulesCount}/${trainingModules.length} Reviewed`}
            </span>
          </button>

          <button
            onClick={() => setActiveSection('document_shelf')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 border-2 cursor-pointer ${
              activeSection === 'document_shelf'
                ? 'bg-slate-900 text-white border-slate-900 shadow-neo-sm'
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-purple-400" />
            <span>2. Agency Document & Forms Distribution Shelf</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
              unacknowledgedCount > 0
                ? activeSection === 'document_shelf' ? 'bg-amber-300 text-slate-950' : 'bg-amber-100 text-amber-950 border border-amber-300'
                : 'bg-emerald-600 text-white'
            }`}>
              {unacknowledgedCount > 0 ? `${unacknowledgedCount} Awaiting Receipt` : 'All 5 Received'}
            </span>
          </button>
        </div>
      </div>

      {/* SECTION 1: MANDATORY ANNUAL TRAINING & POLICY SIGN-OFF */}
      {activeSection === 'training_signoff' && (
        <div className="bg-white rounded-3xl border-2 border-slate-900 p-6 shadow-neo-sm space-y-6">
          <div className="border-b pb-4">
            <h3 className="text-sm font-black uppercase tracking-wide text-slate-900 flex items-center gap-2">
              <Video className="w-4 h-4 text-orange-500" />
              <span>Mandatory Annual Training Modules (CCEYA O. Reg. 137/15 s. 54)</span>
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              All licensed home child care providers must review agency policy videos annually prior to policy attestation and offence declaration.
            </p>
          </div>

          {/* Module Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trainingModules.map((mod) => {
              const isChecked = Boolean(activeAttestations[mod.id]);
              const effectiveVideoUrl = mod.videoUrl || provider.complianceVideoUrl || 'https://drive.google.com';
              return (
                <div 
                  key={mod.id}
                  className={`p-4 rounded-2xl border-2 transition-all space-y-3 ${
                    isChecked 
                      ? 'border-emerald-600 bg-emerald-50/40' 
                      : 'border-slate-300 bg-slate-50 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                        {mod.code}
                      </span>
                      <h4 className="text-xs font-black text-slate-900 mt-1">
                        {mod.title}
                      </h4>
                      <span className="text-[10px] text-slate-500 font-medium">Duration: {mod.duration}</span>
                    </div>

                    <a
                      href={effectiveVideoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-white border border-slate-400 hover:border-slate-900 rounded-lg text-[11px] font-bold text-slate-800 flex items-center gap-1 shrink-0 shadow-sm"
                    >
                      <span>Watch</span>
                      <ExternalLink className="w-3 h-3 text-orange-500" />
                    </a>
                  </div>

                  <ul className="space-y-1 text-[11px] text-slate-600">
                    {mod.topics.map((t, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-orange-500 font-bold">•</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-2 border-t border-slate-200">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={activeIsSignoffSubmitted}
                        onChange={() => handleToggleModule(mod.id)}
                        className="rounded border-slate-400 text-emerald-600 focus:ring-0 w-4 h-4"
                      />
                      <span className="text-xs font-bold text-slate-900">
                        I confirm I have watched and reviewed this module for {complianceCycle}
                      </span>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Form PROV-3 Annual Policy Declaration & Legal Sign-off */}
          <form onSubmit={handleSubmitAnnualSignoff} className="bg-slate-50 border-2 border-slate-900 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-300 pb-2">
              <span className="text-xs font-mono font-black bg-slate-900 text-white px-2 py-0.5 rounded">
                FORM PROV-3
              </span>
              <h4 className="text-xs font-black uppercase text-slate-900">
                Annual CCEYA Policy Sign-Off & Offence Declaration (s. 59)
              </h4>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={offenceDeclaration}
                  disabled={activeIsSignoffSubmitted}
                  onChange={(e) => setOffenceDeclaration(e.target.checked)}
                  className="rounded border-slate-400 text-purple-700 focus:ring-0 w-4 h-4 mt-0.5"
                />
                <span className="leading-relaxed">
                  <strong className="text-slate-900">Annual Offence Declaration (CCEYA O. Reg. 137/15 s. 59):</strong> I hereby declare that neither I nor any adult resident in my home premises have been charged with, convicted of, or found guilty of any offence under the Criminal Code (Canada), the Controlled Drugs and Substances Act, or any provincial statute since my initial Police Vulnerable Sector Check (VSC) was executed.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAllModulesComplete}
                  readOnly
                  className="rounded border-slate-400 text-emerald-600 focus:ring-0 w-4 h-4 mt-0.5"
                />
                <span className="leading-relaxed">
                  <strong className="text-slate-900">Comprehensive Policy Compliance:</strong> I understand, agree to adhere to, and strictly enforce all child protection rules, sanitary standards, sleep routines, and ratio caps defined by the Ministry of Education and DaycareOS Inc.
                </span>
              </label>
            </div>

            {/* Signature Block */}
            <div className="pt-3 border-t border-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Provider Legal Signature (Type Legal Full Name):
                </label>
                <input
                  type="text"
                  value={signatureName}
                  disabled={activeIsSignoffSubmitted}
                  onChange={(e) => setSignatureName(e.target.value)}
                  className="w-full bg-white border-2 border-slate-900 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none"
                  placeholder="e.g. Fatima Al-Mansoor"
                  required
                />
              </div>

              <div>
                {activeIsSignoffSubmitted ? (
                  <div className="bg-emerald-100 border-2 border-emerald-600 rounded-xl p-2.5 text-center text-xs font-black text-emerald-950">
                    ✓ Form PROV-3 Digitally Executed on {activeSubmittedDate}
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="w-full neo-btn bg-slate-900 hover:bg-slate-800 text-white text-xs px-4 py-2.5 font-black flex items-center justify-center gap-2 shadow-neo-sm"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Execute Annual Statutory Sign-Off</span>
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      )}

      {/* SECTION 2: AGENCY DOCUMENT & FORMS DISTRIBUTION SHELF */}
      {activeSection === 'document_shelf' && (
        <div className="bg-white rounded-3xl border-2 border-slate-900 p-6 shadow-neo-sm space-y-6">
          <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wide text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <span>Agency Document Distribution Shelf (Official Ministry Packets)</span>
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Authoritative statutory forms, Ministry circulars, and policy packages distributed directly by the Agency Director.
              </p>
            </div>
            <span className="text-[10px] font-bold bg-orange-100 text-orange-900 border border-orange-300 px-2.5 py-1 rounded-full self-start sm:self-auto font-mono">
              All Providers • ACCS Rail Active
            </span>
          </div>

          {/* Distributed Documents Table */}
          <div className="space-y-3">
            {DISTRIBUTED_DOCUMENTS.map((doc) => {
              const acknowledgedAt = activeReceipts[doc.id];
              return (
                <div 
                  key={doc.id}
                  className="p-4 bg-slate-50 border-2 border-slate-900 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:bg-slate-100/80"
                >
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-extrabold bg-slate-900 text-white px-2 py-0.5 rounded">
                        {doc.code}
                      </span>
                      <span className="text-[10px] font-bold bg-purple-100 text-purple-900 px-2 py-0.5 rounded border border-purple-200">
                        {doc.category}
                      </span>
                      {doc.isMandatory && (
                        <span className="text-[10px] font-black bg-red-100 text-red-800 px-1.5 py-0.5 rounded border border-red-200">
                          Mandatory
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-black text-slate-900">
                      {doc.title}
                    </h4>
                    <p className="text-[11px] text-slate-600">
                      {doc.description}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {doc.distributedBy} • Distributed: {doc.distributedDate} • {doc.fileSize}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 self-start md:self-center shrink-0">
                    {acknowledgedAt ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Received ({acknowledgedAt})</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUnacknowledgeDoc(doc.id)}
                          className="text-[10px] font-bold text-slate-500 hover:text-rose-700 underline px-1.5 py-1 cursor-pointer transition-colors"
                          title="Click to reset receipt status (Testing / Demo)"
                        >
                          Reset
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAcknowledgeDoc(doc.id)}
                        className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl border-2 border-slate-900 shadow-neo-sm flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                      >
                        <FileCheck className="w-3.5 h-3.5 text-slate-900" />
                        <span>Acknowledge Receipt</span>
                      </button>
                    )}

                    <a
                      href={doc.fileUrl || '/documents/provider_forms/02. Home Assessment Screening for Safety, and Required Childrens Activities Materials FINAL.pdf'}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="neo-btn bg-white hover:bg-slate-100 text-slate-900 text-xs px-3 py-1.5 font-bold flex items-center gap-1.5 border border-slate-300 cursor-pointer transition-all"
                      title={`Download official ${doc.title} (${doc.code}) PDF`}
                    >
                      <Download className="w-3.5 h-3.5 text-slate-700" />
                      <span>Download PDF</span>
                    </a>
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
