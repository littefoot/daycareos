import React, { useState, useEffect } from 'react';
import { Child, AdmissionsStage, ParentGuardian, Provider, DocumentStatus, DocumentRecord } from '../../../types';
import { calculateMonthlyFee } from '../../../data/agencySettingsData';
import { Avatar } from '../../common/Avatar';
import { ModalPortal } from '../../common/ModalPortal';
import { AccsDatePicker } from '../../common/AccsDatePicker';
import { 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  UserCheck, 
  FileText, 
  MapPin, 
  Phone, 
  Mail, 
  Sparkles,
  AlertCircle,
  Search,
  Filter,
  X,
  PhoneCall,
  Copy,
  Check,
  Home,
  FileSignature,
  DollarSign,
  HeartHandshake,
  UserX,
  Send,
  ExternalLink,
  Lock,
  AlertTriangle,
  Eye,
  ShieldAlert,
  FileCheck,
  RefreshCw,
  Calculator,
  ShieldCheck,
  Archive,
  ArchiveRestore,
  Calendar,
  User,
  Baby
} from 'lucide-react';
import { sendParentPortalEmail } from '../../../services/resendService';

export interface FamilyIntakePipelineProps {
  childrenList: Child[];
  parentsList: ParentGuardian[];
  providersList: Provider[];
  onUpdateChildStage: (childId: string, newStage: AdmissionsStage) => void;
  onApproveFormZero: (parentId: string) => void;
  onAssignProvider?: (childId: string, providerId: string) => void;
  onDenyChild?: (childId: string, reason?: string) => void;
  onUpdateDocStatus?: (childId: string, docId: string, status: DocumentStatus) => void;
  onUpdateChildFee?: (childId: string, updates: Partial<Child>) => void;
  onArchiveChild?: (childId: string, isArchived: boolean) => void;
}

export const FamilyIntakePipeline: React.FC<FamilyIntakePipelineProps> = ({
  childrenList,
  parentsList,
  providersList,
  onUpdateChildStage,
  onApproveFormZero,
  onAssignProvider,
  onDenyChild,
  onUpdateDocStatus,
  onUpdateChildFee,
  onArchiveChild
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [activeAuditedDoc, setActiveAuditedDoc] = useState<{ doc: DocumentRecord; child: Child } | null>(null);
  const [isViewingFormZero, setIsViewingFormZero] = useState<boolean>(false);
  const [copiedParentId, setCopiedParentId] = useState<string | null>(null);
  const [matchingRegionFilter, setMatchingRegionFilter] = useState<string>('All');
  const [toast, setToast] = useState<{ message: string; subtext?: string } | null>(null);
  const [adminPaymentRefs, setAdminPaymentRefs] = useState<Record<string, string>>({});

  // Waitlist visibility & actions state
  const [showWaitlist, setShowWaitlist] = useState<boolean>(true);
  const [showWithdrawnDrawer, setShowWithdrawnDrawer] = useState<boolean>(false);
  const [inquiryActionChild, setInquiryActionChild] = useState<Child | null>(null);
  const [actionModalTab, setActionModalTab] = useState<'waitlist' | 'deny'>('waitlist');
  const [denyReason, setDenyReason] = useState<string>('Out of Service Area (Outside agency catchment zone)');
  const [customDenyNotes, setCustomDenyNotes] = useState<string>('');
  const [waitlistNotesInput, setWaitlistNotesInput] = useState<string>('');
  const [waitlistDateInput, setWaitlistDateInput] = useState<string>('2027-01-01');
  const [isUnbornToggle, setIsUnbornToggle] = useState<boolean>(false);

  // Keep open selectedChild and activeAuditedDoc in sync with live childrenList updates
  useEffect(() => {
    if (selectedChild) {
      const live = childrenList.find(c => c.id === selectedChild.id);
      if (live) {
        setSelectedChild(live);
        if (activeAuditedDoc) {
          const liveDoc = live.documents?.find(d => d.id === activeAuditedDoc.doc.id);
          if (liveDoc) {
            setActiveAuditedDoc({ doc: liveDoc, child: live });
          }
        }
      }
    }
  }, [childrenList]);

  const showToast = (message: string, subtext?: string) => {
    setToast({ message, subtext });
    setTimeout(() => setToast(null), 4000);
  };

  // Helper to check strict Ontario CCEYA enrolment compliance
  const getComplianceStatus = (child: Child) => {
    const hasPlacementHome = Boolean(child.providerId);
    const docs = child.documents || [];
    const unapprovedDocs = docs.filter(d => d.status !== 'accepted');
    const hasApprovedDocs = docs.length > 0 && unapprovedDocs.length === 0;
    const isEnrolmentReady = hasPlacementHome && hasApprovedDocs;

    return {
      hasPlacementHome,
      docs,
      unapprovedDocs,
      hasApprovedDocs,
      isEnrolmentReady
    };
  };

  // The 5 Actionable Admissions Pipeline Stages
  const stages: { 
    id: AdmissionsStage; 
    label: string; 
    shortLabel: string;
    subtext: string;
    badgeBg: string; 
    headerColor: string;
  }[] = [
    { 
      id: 'inquiry', 
      label: '1. New Inquiries (Call Needed)', 
      shortLabel: 'Inquiries',
      subtext: '10-Min Screening Call', 
      badgeBg: 'bg-amber-100 text-amber-900 border border-amber-300',
      headerColor: 'border-amber-400'
    },
    { 
      id: 'docs_needed', 
      label: '2. Digital Forms & Docs', 
      shortLabel: 'Digital Intake',
      subtext: 'PAR-1 to 5 & OHIP Audit', 
      badgeBg: 'bg-blue-100 text-blue-900 border border-blue-300',
      headerColor: 'border-blue-400'
    },
    { 
      id: 'matching', 
      label: '3. Provider Matching', 
      shortLabel: 'Matching',
      subtext: 'Home Selection & Ratio Fit', 
      badgeBg: 'bg-purple-100 text-purple-900 border border-purple-300',
      headerColor: 'border-purple-400'
    },
    { 
      id: 'contract', 
      label: '4. Final Contract & Fees', 
      shortLabel: 'Contract',
      subtext: 'PAR-5 E-Sign & e-Transfer', 
      badgeBg: 'bg-orange-100 text-orange-900 border border-orange-300',
      headerColor: 'border-orange-400'
    },
    { 
      id: 'enrolled', 
      label: '5. Active Enrolment', 
      shortLabel: 'Active Care',
      subtext: 'Enrolled on Daily Roster', 
      badgeBg: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
      headerColor: 'border-emerald-500'
    }
  ];

  const getParent = (parentId: string) => parentsList.find(p => p.id === parentId);
  const getProvider = (providerId?: string) => providersList.find(p => p.id === providerId);

  const filteredChildren = childrenList.filter(c => {
    if (c.admissionsStage === 'withdrawn' || c.admissionsStage === 'waitlisted' || c.isArchived) return false;
    const parent = getParent(c.parentId);
    return (
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (parent && parent.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (parent && parent.phone.includes(searchTerm)) ||
      c.allergies.some(a => a.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const waitlistChildren = childrenList.filter(c => {
    if (c.admissionsStage !== 'waitlisted' || c.isArchived) return false;
    const parent = getParent(c.parentId);
    return (
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (parent && parent.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (parent && parent.phone.includes(searchTerm)) ||
      c.allergies.some(a => a.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const withdrawnChildren = childrenList.filter(c => c.admissionsStage === 'withdrawn');

  const handleCopyParentLink = (parentId: string, e?: React.MouseEvent, childId?: string) => {
    if (e) e.stopPropagation();
    const url = childId 
      ? `${window.location.origin}/?role=parent&familyId=${parentId}&childId=${childId}`
      : `${window.location.origin}/?role=parent&familyId=${parentId}`;
    navigator.clipboard.writeText(url);
    setCopiedParentId(childId || parentId);
    showToast('📋 Magic Link Copied!', url);
    setTimeout(() => setCopiedParentId(null), 3000);
  };

  const handleSendPortalEmail = async (parent: ParentGuardian, child: Child, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const portalUrl = `${origin}/?role=parent&familyId=${parent.id}&childId=${child.id}`;

    if (!parent.email || !parent.email.includes('@')) {
      showToast('⚠️ No Email on File', `Parent ${parent.fullName} does not have a valid email address.`);
      return;
    }

    const res = await sendParentPortalEmail({
      to: parent.email,
      parentName: parent.fullName,
      childName: child.fullName,
      portalUrl: portalUrl,
      senderName: 'Agency Director'
    });

    if (res.success) {
      showToast(
        res.simulated ? '✉️ Portal Link Dispatched (Sandbox Mode)' : '🚀 Magic Link Sent via Resend!',
        `Interactive registration portal link dispatched to ${parent.email}`
      );
    } else {
      showToast('⚠️ Email Dispatch Error', res.error || 'Failed to dispatch email');
    }
  };

  const handleApproveScreening = (child: Child, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const parent = getParent(child.parentId);
    if (parent) {
      onApproveFormZero(parent.id);
      if (parent.email) {
        handleSendPortalEmail(parent, child);
      }
    }
    // Advance THIS specific child to docs_needed
    onUpdateChildStage(child.id, 'docs_needed');
    if (selectedChild?.id === child.id) {
      setSelectedChild(prev => prev ? { ...prev, admissionsStage: 'docs_needed' } : null);
    }
    showToast(
      '✨ Screening Approved & Magic Link Dispatched!',
      `Approved screening for ${child.fullName}. Dispatched to ${parent?.email || 'parent on file'}`
    );
  };

  const handleDenyScreening = (child: Child, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setInquiryActionChild(child);
    setActionModalTab('deny');
    setDenyReason('Out of Service Area (Outside agency catchment zone)');
    setCustomDenyNotes('');
  };

  const handleOpenWaitlistModal = (child: Child, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setInquiryActionChild(child);
    setActionModalTab('waitlist');
    setIsUnbornToggle(Boolean(child.isUnborn));
    setWaitlistDateInput(child.expectedDueDate || child.desiredStartDate || '2027-01-01');
    setWaitlistNotesInput(child.waitlistNotes || '');
  };

  const handleConfirmInquiryAction = () => {
    if (!inquiryActionChild) return;
    const child = inquiryActionChild;

    if (actionModalTab === 'waitlist') {
      if (onUpdateChildFee) {
        onUpdateChildFee(child.id, {
          waitlistNotes: waitlistNotesInput.trim() || undefined,
          desiredStartDate: waitlistDateInput,
          isUnborn: isUnbornToggle,
          expectedDueDate: isUnbornToggle ? waitlistDateInput : undefined
        });
      }
      onUpdateChildStage(child.id, 'waitlisted');
      if (selectedChild?.id === child.id) {
        setSelectedChild(prev => prev ? { 
          ...prev, 
          admissionsStage: 'waitlisted',
          waitlistNotes: waitlistNotesInput.trim() || undefined,
          desiredStartDate: waitlistDateInput,
          isUnborn: isUnbornToggle,
          expectedDueDate: isUnbornToggle ? waitlistDateInput : undefined
        } : null);
      }
      showToast('⏳ Moved to Waitlist', `${child.fullName} placed on waitlist with target date ${waitlistDateInput}.`);
    } else {
      // Denial / Withdrawn
      const finalReason = customDenyNotes.trim() ? `${denyReason}: ${customDenyNotes.trim()}` : denyReason;
      if (onDenyChild) {
        onDenyChild(child.id, finalReason);
      } else {
        if (onUpdateChildFee) {
          onUpdateChildFee(child.id, { withdrawnReason: finalReason });
        }
        onUpdateChildStage(child.id, 'withdrawn');
      }
      if (selectedChild?.id === child.id) {
        setSelectedChild(null);
      }
      showToast('🚫 Intake Marked Withdrawn', `${child.fullName} moved to Withdrawn archive.`);
    }
    setInquiryActionChild(null);
  };

  const handleAuditDocStatusChange = (childId: string, docId: string, newStatus: DocumentStatus) => {
    if (onUpdateDocStatus) {
      onUpdateDocStatus(childId, docId, newStatus);
    }
    if (selectedChild?.id === childId) {
      setSelectedChild(prev => prev ? {
        ...prev,
        documents: prev.documents.map(d => d.id === docId ? { ...d, status: newStatus } : d)
      } : null);
    }
    if (activeAuditedDoc && activeAuditedDoc.doc.id === docId) {
      setActiveAuditedDoc(prev => prev ? {
        ...prev,
        doc: { ...prev.doc, status: newStatus }
      } : null);
    }
    showToast(
      newStatus === 'accepted' ? '✓ Document Verified' : '⚠️ Replacement Requested',
      `Updated status to ${newStatus.replace('_', ' ')}`
    );
  };

  // Pipeline Counts for Header Summary
  const inquiryCount = filteredChildren.filter(c => c.admissionsStage === 'inquiry').length;
  const docsCount = filteredChildren.filter(c => c.admissionsStage === 'docs_needed').length;
  const matchCount = filteredChildren.filter(c => c.admissionsStage === 'matching').length;
  const contractCount = filteredChildren.filter(c => c.admissionsStage === 'contract').length;
  const enrolledCount = filteredChildren.filter(c => c.admissionsStage === 'enrolled').length;

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white border-2 border-orange-500 rounded-2xl p-4 shadow-neo-lg flex items-center gap-3 animate-slideUp">
          <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
            <Send className="w-4 h-4" />
          </div>
          <div>
            <p className="font-extrabold text-xs text-white">{toast.message}</p>
            {toast.subtext && <p className="text-[11px] text-slate-300 font-mono mt-0.5">{toast.subtext}</p>}
          </div>
          <button onClick={() => setToast(null)} className="ml-2 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border-2 border-slate-900">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-slate-900">Admissions & Intake Pipeline</h2>
            <span className="text-xs bg-orange-100 text-orange-800 font-bold px-2.5 py-0.5 rounded-full border border-orange-300">
              Deterministic Action Snapshot
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            <strong>Active Snapshot:</strong> {inquiryCount} discovery call{inquiryCount !== 1 ? 's' : ''} needed • {docsCount} parent{docsCount !== 1 ? 's' : ''} completing forms • {matchCount} to match • {enrolledCount} in active care.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={() => {
              const url = `${window.location.origin}/?role=register`;
              navigator.clipboard.writeText(url);
              showToast('📋 Public Intake Link Copied!', url);
            }}
            className="neo-btn bg-white hover:bg-orange-50 text-slate-900 border-2 border-slate-900 px-3 py-2 text-xs font-bold flex items-center gap-1.5 shadow-neo-sm whitespace-nowrap cursor-pointer"
            title="Copy dedicated public URL to send to parents to start the Form 0 pre-screening intake"
          >
            <Copy className="w-3.5 h-3.5 text-orange-600" />
            <span>Copy Parent Intake Link</span>
          </button>

          <a
            href="/?role=register"
            target="_blank"
            rel="noreferrer"
            className="neo-btn bg-orange-500 hover:bg-orange-600 text-white border-2 border-slate-900 p-2 text-xs font-bold flex items-center justify-center shadow-neo-sm cursor-pointer"
            title="Open Public Intake & Registration Form in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={() => setShowWithdrawnDrawer(true)}
            className="neo-btn bg-white hover:bg-red-50 text-slate-900 border-2 border-slate-900 px-3 py-2 text-xs font-bold flex items-center gap-1.5 shadow-neo-sm whitespace-nowrap cursor-pointer"
            title="View all denied or withdrawn applications and restore them if needed"
          >
            <UserX className="w-3.5 h-3.5 text-red-600" />
            <span>Withdrawn ({withdrawnChildren.length})</span>
          </button>

          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by child, parent, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
            />
          </div>
        </div>
      </div>

      {/* 5-Column Kanban Board */}
      <div className="w-full max-w-full grid grid-cols-1 md:grid-cols-5 gap-3.5 overflow-x-auto no-scrollbar pb-4">
        {stages.map(stage => {
          const stageChildren = filteredChildren.filter(c => c.admissionsStage === stage.id);
          
          return (
            <div 
              key={stage.id}
              className={`bg-slate-50 border-2 border-slate-900 rounded-2xl p-3 flex flex-col w-full min-w-0 md:min-w-[250px] ${stage.headerColor}`}
            >
              {/* Column Header */}
              <div className="pb-2.5 mb-3 border-b-2 border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900 leading-tight">{stage.label}</span>
                  <div className="flex items-center gap-1">
                    <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${stage.badgeBg}`}>
                      {stageChildren.length}
                    </span>
                    {stage.id === 'inquiry' && waitlistChildren.length > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-900 border border-purple-300" title={`${waitlistChildren.length} on waitlist`}>
                        +{waitlistChildren.length} waitlist
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">{stage.subtext}</p>

                {/* Step 1: Waitlist Show/Hide Toggle */}
                {stage.id === 'inquiry' && (
                  <button
                    type="button"
                    onClick={() => setShowWaitlist(!showWaitlist)}
                    className={`mt-2 w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold transition-all border-2 cursor-pointer ${
                      showWaitlist
                        ? 'bg-purple-600 text-white border-purple-900 shadow-neo-sm'
                        : 'bg-white hover:bg-purple-50 text-purple-900 border-purple-300'
                    }`}
                    title="Toggle display of early applicants, unborn infants, and future start date waitlist"
                  >
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{showWaitlist ? 'Hide Waitlist' : 'Show Waitlist'}</span>
                    </div>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${
                      showWaitlist ? 'bg-purple-800 text-purple-100' : 'bg-purple-100 text-purple-900'
                    }`}>
                      {waitlistChildren.length}
                    </span>
                  </button>
                )}
              </div>

              {/* Child Cards inside Column */}
              <div className="space-y-3 flex-1 min-h-[360px]">
                {/* Dedicated Waitlist Sub-lane for Step 1 */}
                {stage.id === 'inquiry' && showWaitlist && (
                  <div className="mb-3 p-2.5 rounded-2xl bg-purple-50/80 border-2 border-purple-300 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-purple-950 tracking-wider flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-purple-700" />
                        <span>Early & Unborn Waitlist</span>
                      </span>
                      <span className="text-[10px] font-black bg-purple-200 text-purple-900 px-1.5 py-0.2 rounded-full">
                        {waitlistChildren.length}
                      </span>
                    </div>
                    <p className="text-[9px] text-purple-800 font-medium">
                      Applicants applying months in advance or pre-birth.
                    </p>

                    {waitlistChildren.length === 0 ? (
                      <div className="p-3 text-center text-[10px] text-purple-700 bg-white rounded-xl border border-purple-200">
                        No applicants currently on the waitlist.
                      </div>
                    ) : (
                      waitlistChildren.map(child => {
                        const parent = getParent(child.parentId);
                        return (
                          <div
                            key={child.id}
                            onClick={() => setSelectedChild(child)}
                            className={`p-2.5 rounded-xl border-2 transition-all bg-white hover:-translate-y-0.5 space-y-2 cursor-pointer ${
                              selectedChild?.id === child.id ? 'border-purple-600 ring-2 ring-purple-400' : 'border-purple-300 shadow-sm'
                            }`}
                          >
                            {/* Badges */}
                            <div className="flex flex-wrap items-center gap-1 justify-between">
                              {child.isUnborn ? (
                                <span className="text-[9px] font-black bg-purple-100 text-purple-900 px-1.5 py-0.5 rounded border border-purple-300 flex items-center gap-1">
                                  <Baby className="w-3 h-3 text-purple-700" />
                                  <span>🍼 Due {child.expectedDueDate || '2027'} (Unborn)</span>
                                </span>
                              ) : (
                                <span className="text-[9px] font-bold bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded border border-slate-200">
                                  {child.ageYearsFormatted}
                                </span>
                              )}
                              <span className="text-[9px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">
                                Waitlisted
                              </span>
                            </div>

                            {/* Child & Parent */}
                            <div className="flex items-center gap-2">
                              <Avatar name={child.fullName} photoUrl={child.photoUrl} size="sm" shape="circle" />
                              <div className="min-w-0">
                                <h5 className="text-xs font-black text-slate-900 truncate">{child.fullName}</h5>
                                <p className="text-[10px] text-slate-500 font-medium truncate">{parent?.fullName || 'Parent'}</p>
                              </div>
                            </div>

                            {/* Target Date & Notes */}
                            <div className="text-[10px] text-slate-600 bg-slate-50 p-1.5 rounded-lg border border-slate-200 space-y-0.5">
                              <div className="flex items-center justify-between font-bold">
                                <span className="text-slate-500">Needs Care:</span>
                                <span className="text-purple-950 font-black">{child.desiredStartDate || 'Flexible'}</span>
                              </div>
                              {child.waitlistNotes && (
                                <p className="text-[9px] text-slate-500 italic truncate font-medium">"{child.waitlistNotes}"</p>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="grid grid-cols-2 gap-1 pt-1 border-t border-slate-100">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUpdateChildStage(child.id, 'inquiry');
                                  showToast('🚀 Moved to Active Inquiry', `${child.fullName} is now in the 10-min screening queue.`);
                                }}
                                className="neo-btn bg-amber-400 hover:bg-amber-300 text-slate-900 text-[9px] py-1 px-1 font-extrabold flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                                title="Move to Active Inquiry for 10-min screening call"
                              >
                                <PhoneCall className="w-2.5 h-2.5" />
                                <span>To Inquiry</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setInquiryActionChild(child);
                                  setActionModalTab('deny');
                                }}
                                className="py-1 px-1 rounded-lg text-[9px] font-bold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 flex items-center justify-center gap-1 cursor-pointer"
                                title="Deny or withdraw waitlist application"
                              >
                                <UserX className="w-2.5 h-2.5" />
                                <span>Withdraw</span>
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
                {stageChildren.map(child => {
                  const parent = getParent(child.parentId);
                  const provider = getProvider(child.providerId);
                  const compliance = getComplianceStatus(child);

                  return (
                    <div
                      key={child.id}
                      onClick={() => setSelectedChild(child)}
                      className={`p-3 rounded-2xl border-2 cursor-pointer transition-all bg-white hover:-translate-y-0.5 flex flex-col justify-between space-y-2.5 ${
                        selectedChild?.id === child.id ? 'border-orange-500 ring-2 ring-orange-400' : 'border-slate-900'
                      }`}
                    >
                      <div>
                        {/* Top Badges & Quick Magic Link Actions */}
                        <div className="flex items-center justify-between mb-2 gap-1">
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-extrabold uppercase bg-orange-100 text-orange-900 px-2 py-0.5 rounded-md border border-orange-200">
                              {child.ageYearsFormatted}
                            </span>
                            
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase ${
                              child.fundingType === 'cwelcc' ? 'bg-emerald-100 text-emerald-800' :
                              child.fundingType === 'subsidy' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {child.fundingType}
                            </span>
                          </div>

                          {/* Quick Magic Link & Email Actions (Available on Every Card) */}
                          {parent && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => handleCopyParentLink(parent.id, e, child.id)}
                                className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold flex items-center gap-1 transition-all border ${
                                  copiedParentId === child.id 
                                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300' 
                                    : 'bg-slate-100 hover:bg-orange-100 text-slate-700 hover:text-orange-900 border-slate-200'
                                }`}
                                title={`Copy ${child.fullName}'s direct portal magic link to clipboard`}
                              >
                                {copiedParentId === child.id ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-600" />
                                    <span>Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3 text-slate-600" />
                                    <span>Link</span>
                                  </>
                                )}
                              </button>

                              <button
                                onClick={(e) => handleSendPortalEmail(parent, child, e)}
                                className="p-1 rounded-md bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 border border-slate-200 transition-colors cursor-pointer"
                                title={`Resend Portal Magic Link to ${parent.email || 'parent'} via Resend API`}
                              >
                                <Mail className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Child Name & Parent Contact */}
                        <div className="flex items-center gap-2.5 mb-1.5">
                          <Avatar
                            name={child.fullName}
                            photoUrl={child.photoUrl}
                            shape="circle"
                            size="sm"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-extrabold text-slate-900 leading-tight truncate">{child.fullName}</h4>
                            <p className="text-[11px] text-slate-600 font-medium truncate">{parent?.fullName || 'Parent'}</p>
                          </div>
                        </div>

                        {/* Allergies / Medical Note */}
                        {child.allergies.length > 0 && (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                            <AlertCircle className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{child.allergies.join(', ')}</span>
                          </div>
                        )}
                      </div>

                      {/* STAGE-SPECIFIC ACTIONABLE NEXT STEP BOX */}
                      <div className="pt-2 border-t border-slate-100 space-y-2">
                        {/* STAGE 1: INQUIRY (10-Min Call Needed) */}
                        {stage.id === 'inquiry' && (
                          <div className="space-y-1.5">
                            <div className="text-[10px] font-bold text-amber-800 bg-amber-50 p-1.5 rounded-lg border border-amber-200 flex items-center justify-between">
                              <span>Next: 10-Min Discovery Call</span>
                              {parent?.phone && (
                                <a
                                  href={`tel:${parent.phone}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-amber-900 hover:underline font-extrabold flex items-center gap-0.5"
                                >
                                  <PhoneCall className="w-3 h-3 text-amber-700" />
                                  <span>Call</span>
                                </a>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-3 gap-1">
                              <button
                                onClick={(e) => handleApproveScreening(child, e)}
                                className="col-span-1 neo-btn bg-amber-400 hover:bg-amber-300 text-slate-900 py-1.5 px-1 text-[9px] font-extrabold gap-0.5 shadow-sm justify-center cursor-pointer"
                                title="Approves screening, generates magic link, and emails parent"
                              >
                                <UserCheck className="w-3 h-3" />
                                <span>Approve</span>
                              </button>
                              
                              <button
                                onClick={(e) => handleOpenWaitlistModal(child, e)}
                                className="col-span-1 py-1.5 px-1 rounded-xl text-[9px] font-extrabold bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-300 transition-colors flex items-center justify-center gap-0.5 cursor-pointer"
                                title="Move to Waitlist (early application, unborn baby, or future start date)"
                              >
                                <Clock className="w-3 h-3 text-purple-600" />
                                <span>Waitlist</span>
                              </button>

                              <button
                                onClick={(e) => handleDenyScreening(child, e)}
                                className="col-span-1 py-1.5 px-1 rounded-xl text-[9px] font-extrabold bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 transition-colors flex items-center justify-center gap-0.5 cursor-pointer"
                                title="Deny intake (out of area / no spot)"
                              >
                                <UserX className="w-3 h-3 text-red-600" />
                                <span>Deny</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* STAGE 2: DIGITAL FORMS & DOCS (STRICT GATING) */}
                        {stage.id === 'docs_needed' && (
                          <div className="space-y-1.5">
                            <div className="text-[10px] font-bold text-blue-800 bg-blue-50 p-1.5 rounded-lg border border-blue-200 flex items-center justify-between">
                              <span>{compliance.hasApprovedDocs ? '✓ All Docs Approved' : `Pending: ${compliance.unapprovedDocs.length} Docs`}</span>
                              <FileText className="w-3.5 h-3.5 text-blue-600" />
                            </div>
                            <button
                              disabled={!compliance.hasApprovedDocs}
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateChildStage(child.id, 'matching');
                              }}
                              className={`w-full py-1.5 text-[11px] font-extrabold gap-1 shadow-sm rounded-xl transition-all flex items-center justify-center ${
                                compliance.hasApprovedDocs
                                  ? 'neo-btn bg-blue-500 hover:bg-blue-400 text-white cursor-pointer'
                                  : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed opacity-75'
                              }`}
                              title={!compliance.hasApprovedDocs ? 'Cannot advance to matching until all documents are submitted and approved' : 'Advance to Matching'}
                            >
                              {compliance.hasApprovedDocs ? <ArrowRight className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                              <span>{compliance.hasApprovedDocs ? 'Forms Done ➔ Matching' : 'Docs Incomplete'}</span>
                            </button>
                          </div>
                        )}

                        {/* STAGE 3: PROVIDER MATCHING */}
                        {stage.id === 'matching' && (
                          <div className="space-y-1.5">
                            <div className="text-[10px] font-bold text-purple-800 bg-purple-50 p-1.5 rounded-lg border border-purple-200">
                              <span>Next: Select Provider Home</span>
                            </div>
                            <select
                              value={child.providerId || ''}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                e.stopPropagation();
                                if (onAssignProvider) onAssignProvider(child.id, e.target.value);
                              }}
                              className={`w-full text-[10px] font-bold rounded-lg p-1 ${
                                child.providerId ? 'bg-white border border-slate-300 text-slate-800' : 'bg-purple-50 border-2 border-purple-300 text-purple-900'
                              }`}
                            >
                              <option value="">— Select Home Match —</option>
                              {providersList.map(p => (
                                <option key={p.id} value={p.id}>
                                  {p.name} ({p.neighborhood})
                                </option>
                              ))}
                            </select>
                            <button
                              disabled={!child.providerId}
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateChildStage(child.id, 'contract');
                              }}
                              className={`w-full py-1.5 text-[11px] font-extrabold gap-1 shadow-sm rounded-xl transition-all flex items-center justify-center ${
                                child.providerId
                                  ? 'neo-btn bg-purple-600 hover:bg-purple-500 text-white cursor-pointer'
                                  : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed opacity-75'
                              }`}
                              title={!child.providerId ? 'Please select a provider home before advancing' : 'Advance to Contract'}
                            >
                              {child.providerId ? <ArrowRight className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                              <span>{child.providerId ? 'Matched ➔ Contract' : 'Select Home First'}</span>
                            </button>
                          </div>
                        )}

                        {/* STAGE 4: FINAL CONTRACT & FEES (ADMIN PAYMENT VERIFICATION & ENROLMENT CONFIRMATION) */}
                        {stage.id === 'contract' && (
                          <div className="space-y-2">
                            {compliance.isEnrolmentReady ? (
                              <div className="text-[10px] font-bold text-emerald-800 bg-emerald-50 p-2 rounded-xl border border-emerald-200 flex items-center justify-between">
                                <span>✓ Home & Docs Verified</span>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              </div>
                            ) : (
                              <div className="text-[10px] font-bold text-red-800 bg-red-50 p-2 rounded-xl border border-red-200">
                                <span>⚠️ Needs: {!compliance.hasPlacementHome ? 'Placement Home' : ''}{!compliance.hasPlacementHome && !compliance.hasApprovedDocs ? ' & ' : ''}{!compliance.hasApprovedDocs ? 'Approved Docs' : ''}</span>
                              </div>
                            )}

                            {/* Bank Email Confirmation Number Input for Agency Director */}
                            <div className="space-y-1 bg-white p-2 rounded-xl border-2 border-slate-900 shadow-sm text-left">
                              <label className="text-[9px] font-extrabold text-slate-700 uppercase block tracking-wider">
                                Bank Confirmation #
                              </label>
                              <input
                                type="text"
                                onClick={(e) => e.stopPropagation()}
                                placeholder="e.g. CA1234567890"
                                value={adminPaymentRefs[child.id] !== undefined ? adminPaymentRefs[child.id] : 'CA-EMAIL-VERIFIED'}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  setAdminPaymentRefs(prev => ({ ...prev, [child.id]: e.target.value }));
                                }}
                                className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-[10px] font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
                              />
                            </div>

                            <button
                              disabled={!compliance.isEnrolmentReady}
                              onClick={(e) => {
                                e.stopPropagation();
                                const refNum = adminPaymentRefs[child.id] || 'CA-EMAIL-VERIFIED';
                                onUpdateChildStage(child.id, 'enrolled');
                                showToast('🛡️ Payment Verified & Enrolment Confirmed!', `${child.fullName} is now enrolled. Confirmation ${refNum} logged.`);
                              }}
                              className={`w-full py-2 text-[11px] font-extrabold gap-1.5 shadow-neo-sm rounded-xl transition-all flex items-center justify-center ${
                                compliance.isEnrolmentReady
                                  ? 'neo-btn bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                                  : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed opacity-75'
                              }`}
                              title={!compliance.isEnrolmentReady ? 'Enrolment Gated: Must assign provider home and approve all documents' : 'Attach Confirmation & Finalize Enrolment'}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Verify Payment & Enrol</span>
                            </button>
                          </div>
                        )}

                        {/* STAGE 5: ACTIVE ENROLMENT */}
                        {stage.id === 'enrolled' && (
                          <div className="space-y-1">
                            <div className="text-[10px] text-emerald-800 bg-emerald-50 p-1.5 rounded-lg border border-emerald-200 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                              <span className="font-bold truncate">{provider?.name || 'Assigned Home'}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 block text-center font-bold">
                              Active in Daily Care
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {stageChildren.length === 0 && (
                  <div className="h-36 flex flex-col items-center justify-center text-center p-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
                    <span>No children in this stage</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Child Detail Popup Modal */}
      {selectedChild && (
        <ModalPortal>
          <div 
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedChild(null);
            }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn cursor-pointer"
          >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white border-2 border-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp cursor-default"
          >
            {/* Modal Header */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar
                  name={selectedChild.fullName}
                  photoUrl={selectedChild.photoUrl}
                  shape="circle"
                  size="lg"
                  className="border-2 border-white"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-extrabold text-white">{selectedChild.fullName}</h3>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-orange-500 text-white shadow-neo-sm">
                      {selectedChild.ageYearsFormatted}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    DOB: {selectedChild.dob} • {selectedChild.fundingType.toUpperCase()} Funding (${selectedChild.monthlyFee}/mo)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedChild(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Parent Portal Access Action Ribbon */}
            {(() => {
              const p = getParent(selectedChild.parentId);
              if (!p) return null;
              return (
                <div className="px-6 py-2.5 bg-orange-50/70 border-b-2 border-slate-900 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900">Parent Access:</span>
                    <span className="text-slate-600 font-medium truncate max-w-[240px]">{p.fullName} ({p.email || p.phone})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyParentLink(p.id, undefined, selectedChild.id)}
                      className="neo-btn bg-white hover:bg-slate-50 text-slate-900 px-3 py-1 text-xs font-bold gap-1.5 border-2 border-slate-900 shadow-neo-sm"
                      title="Copy child-specific parent magic link to clipboard"
                    >
                      {copiedParentId === selectedChild.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-blue-600" />}
                      <span>{copiedParentId === selectedChild.id ? 'Magic Link Copied!' : 'Copy Magic Link'}</span>
                    </button>

                    <button
                      onClick={(e) => handleSendPortalEmail(p, selectedChild, e)}
                      className="neo-btn bg-blue-500 hover:bg-blue-400 text-white px-3 py-1 text-xs font-bold gap-1.5 shadow-neo-sm cursor-pointer"
                      title="Resend magic portal access email to parent via Resend"
                    >
                      <Mail className="w-3.5 h-3.5 text-white" />
                      <span>Resend Email</span>
                    </button>

                    <a
                      href={`/?role=parent&familyId=${p.id}&childId=${selectedChild.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 bg-white hover:bg-slate-100 text-slate-800 rounded-xl border-2 border-slate-900 transition-colors shadow-neo-sm flex items-center gap-1 text-[11px] font-bold"
                      title="Open Parent Portal in new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-orange-600" />
                      <span>View Portal</span>
                    </a>

                    <button
                      onClick={() => {
                        if (window.confirm(`Archive ${selectedChild.fullName}? They will be safely hidden from the active admissions pipeline and rosters.`)) {
                          if (onArchiveChild) onArchiveChild(selectedChild.id, true);
                          setSelectedChild(null);
                          showToast('📁 Child Archived', `${selectedChild.fullName} moved to archives.`);
                        }
                      }}
                      className="p-1.5 bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-900 rounded-xl border-2 border-slate-900 transition-colors shadow-neo-sm flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                      title="Archive child record"
                    >
                      <Archive className="w-3.5 h-3.5 text-amber-600" />
                      <span>Archive</span>
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Top Meta Status Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Admissions Stage</span>
                  <span className="text-xs font-extrabold text-slate-900 capitalize mt-0.5 block">
                    {selectedChild.admissionsStage.replace('_', ' ')}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">CCEYA Category</span>
                  <span className="text-xs font-extrabold text-slate-900 mt-0.5 block">
                    {selectedChild.isUnderTwo ? '<2 Years (Infant)' : selectedChild.isUnderThree ? '<3 Years (Toddler)' : 'Preschool (3-6yo)'}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">e-Transfer Fee</span>
                  <span className="text-xs font-extrabold text-slate-900 mt-0.5 block">
                    ${selectedChild.monthlyFee.toFixed(2)}/mo
                  </span>
                </div>

                <div className={`p-2.5 rounded-xl border ${
                  selectedChild.providerId ? 'bg-slate-50 border-slate-200' : 'bg-red-50 border-red-300'
                }`}>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Placement Home</span>
                  <span className={`text-xs font-extrabold mt-0.5 block truncate ${
                    selectedChild.providerId ? 'text-slate-900' : 'text-red-700'
                  }`}>
                    {getProvider(selectedChild.providerId)?.name || '⚠️ Unassigned'}
                  </span>
                </div>
              </div>

              {/* 3 Detail Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Parent & Emergency Contacts */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5 text-xs pb-1 border-b border-slate-200">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Parent & Contacts</span>
                  </h4>
                  {(() => {
                    const parent = getParent(selectedChild.parentId);
                    return (
                      <div className="space-y-1.5 text-[11px]">
                        <p className="font-extrabold text-slate-900">{parent?.fullName || 'Parent'}</p>
                        <p className="text-slate-600 font-bold">{parent?.phone}</p>
                        <p className="text-slate-500 truncate">{parent?.email}</p>
                        <p className="text-slate-400 text-[10px]">{parent?.homeAddress || parent?.region}</p>
                      </div>
                    );
                  })()}
                </div>

                {/* Medical & Allergies */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5 text-xs pb-1 border-b border-slate-200">
                    <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                    <span>Medical & Allergies</span>
                  </h4>
                  <div className="space-y-1 text-[11px]">
                    <p className="font-bold text-slate-800">
                      {selectedChild.allergies.length > 0 ? selectedChild.allergies.join(', ') : 'No known allergies'}
                    </p>
                    <p className="text-slate-500 text-[10px] leading-relaxed">
                      {selectedChild.medicalNotes || 'No special medical instructions.'}
                    </p>
                    {selectedChild.epiPenRequired && (
                      <span className="inline-block mt-1 bg-red-100 text-red-800 text-[10px] font-extrabold px-2 py-0.5 rounded border border-red-300">
                        ⚠️ SABRINA'S LAW: EPI-PEN
                      </span>
                    )}
                  </div>
                </div>

                {/* Admissions Progression & Schedule Request */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                    <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5 text-xs">
                      <FileCheck className="w-3.5 h-3.5 text-orange-500" />
                      <span>Intake & Admissions Progress</span>
                    </h4>
                    <span className="text-[10px] text-slate-500 font-bold font-mono">
                      Stage {
                        selectedChild.admissionsStage === 'inquiry' ? '1/5' :
                        selectedChild.admissionsStage === 'docs_needed' ? '2/5' :
                        selectedChild.admissionsStage === 'matching' ? '3/5' :
                        selectedChild.admissionsStage === 'contract' ? '4/5' : '5/5'
                      }
                    </span>
                  </div>
                  
                  <div className="space-y-1.5 text-[11px]">
                    <div 
                      onClick={() => setIsViewingFormZero(true)}
                      className="flex items-center justify-between p-1.5 bg-white hover:bg-emerald-50 rounded-lg border border-slate-200 hover:border-emerald-400 transition-all cursor-pointer group"
                      title="Click to view submitted Pre-Screening Form"
                    >
                      <span className="font-bold text-slate-700 flex items-center gap-1 group-hover:text-emerald-950">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Form 0: Pre-Screening</span>
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase flex items-center gap-0.5 group-hover:bg-emerald-200">
                        <Eye className="w-2.5 h-2.5" />
                        <span>View Form</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-1.5 bg-white rounded-lg border border-slate-200">
                      <span className="font-bold text-slate-700 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-blue-600" />
                        <span>Target Start Date</span>
                      </span>
                      <span className="font-mono text-slate-900 font-bold text-[10px]">
                        {getParent(selectedChild.parentId)?.preferredStartDate || selectedChild.intakeSubmissionDate || 'Immediate'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-1.5 bg-white rounded-lg border border-slate-200">
                      <span className="font-bold text-slate-700 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-orange-600" />
                        <span>Desired Schedule</span>
                      </span>
                      <span className="font-mono text-slate-900 font-bold text-[10px] uppercase">
                        {getParent(selectedChild.parentId)?.preferredSchedule?.replace('_', ' ') || 'Full Time (M-F)'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* STAGE-AWARE FORMS & COMPLIANCE LIFECYCLE SECTION */}
              {selectedChild.admissionsStage === 'inquiry' ? (
                /* STAGE 1: SHOW INTAKE FORM AS SUBMITTED + DIGITAL FORMS & PHYSICAL SCANS AS STANDBY / GREYED OUT */
                <div className="p-4 bg-white rounded-2xl border-2 border-slate-900 space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 border-b border-slate-100 gap-2">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-orange-600" />
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-900">
                          Admissions Package & Document Lifecycle
                        </h4>
                        <p className="text-[10px] text-slate-500">
                          Step 1 focuses on the discovery screening call. Digital forms and physical scans are unlocked after screening approval.
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                      <PhoneCall className="w-3 h-3 text-emerald-600" />
                      <span>Discovery Call Pending</span>
                    </span>
                  </div>

                  {/* 4 Cards: Form 0 (Submitted) + Digital Forms (Greyed) + 3 Physical Scans (Greyed) + Contract (Greyed) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {/* Card 1: Form 0 Pre-Screening (Clickable to view submitted form) */}
                    <div 
                      onClick={() => setIsViewingFormZero(true)}
                      className="p-3 bg-emerald-50/80 hover:bg-emerald-100/90 border-2 border-emerald-400 hover:border-emerald-500 rounded-2xl flex flex-col justify-between space-y-2 shadow-sm cursor-pointer transition-all hover:scale-[1.02] group"
                      title="Click to inspect full submitted Pre-Screening Form"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-extrabold text-[11px] text-emerald-950 flex items-center gap-1">
                            <span>PAR-0: Pre-Screening</span>
                          </span>
                          <span className="px-1.5 py-0.2 rounded font-extrabold text-[9px] bg-emerald-200 text-emerald-900 border border-emerald-300 uppercase flex items-center gap-1">
                            <Eye className="w-2.5 h-2.5" />
                            <span>View</span>
                          </span>
                        </div>
                        <p className="text-[10px] text-emerald-800 font-medium leading-relaxed">
                          Initial parent intake form with care schedule, location, and emergency contacts.
                        </p>
                      </div>
                      <div className="pt-2 border-t border-emerald-200 text-[10px] text-emerald-900 font-semibold space-y-0.5">
                        <p className="flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Submitted & Ready</span>
                          </span>
                          <span className="text-[9px] text-emerald-700 underline group-hover:text-emerald-950 font-bold">
                            Inspect ➔
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Card 2: Digital Forms PAR-1 to PAR-4 (Greyed Out) */}
                    <div className="p-3 bg-slate-50/80 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col justify-between space-y-2 opacity-65">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-extrabold text-[11px] text-slate-700">Digital Forms (PAR 1-4)</span>
                          <span className="px-1.5 py-0.2 rounded font-extrabold text-[9px] bg-slate-200 text-slate-700 border border-slate-300 uppercase flex items-center gap-0.5">
                            <Lock className="w-2.5 h-2.5" /> Step 2
                          </span>
                        </div>
                        <ul className="text-[9px] text-slate-600 space-y-0.5 list-disc list-inside">
                          <li>PAR-1: Child Application</li>
                          <li>PAR-2: Outings Wallet</li>
                          <li>PAR-3: Sabrina's Medical</li>
                          <li>PAR-4: Outdoor Play</li>
                        </ul>
                      </div>
                      <div className="pt-2 border-t border-slate-200 text-[9px] text-slate-500 italic">
                        Sent via Magic Link after call
                      </div>
                    </div>

                    {/* Card 3: 3 Physical Scans (Greyed Out) */}
                    <div className="p-3 bg-slate-50/80 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col justify-between space-y-2 opacity-65">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-extrabold text-[11px] text-slate-700">Physical Scans (3)</span>
                          <span className="px-1.5 py-0.2 rounded font-extrabold text-[9px] bg-slate-200 text-slate-700 border border-slate-300 uppercase flex items-center gap-0.5">
                            <Lock className="w-2.5 h-2.5" /> Step 2/3
                          </span>
                        </div>
                        <ul className="text-[9px] text-slate-600 space-y-0.5 list-disc list-inside">
                          <li>Birth Certificate</li>
                          <li>Ontario Health Card</li>
                          <li>Yellow Vaccine Card</li>
                        </ul>
                      </div>
                      <div className="pt-2 border-t border-slate-200 text-[9px] text-slate-500 italic">
                        Uploaded by parent in Step 2/3
                      </div>
                    </div>

                    {/* Card 4: Master Contract PAR-5 (Greyed Out) */}
                    <div className="p-3 bg-slate-50/80 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col justify-between space-y-2 opacity-65">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-extrabold text-[11px] text-slate-700">PAR-5: Contract</span>
                          <span className="px-1.5 py-0.2 rounded font-extrabold text-[9px] bg-slate-200 text-slate-700 border border-slate-300 uppercase flex items-center gap-0.5">
                            <Lock className="w-2.5 h-2.5" /> Step 4
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-600 leading-relaxed">
                          CWELCC $22/day parent agreement & digital legal e-signature.
                        </p>
                      </div>
                      <div className="pt-2 border-t border-slate-200 text-[9px] text-slate-500 italic">
                        Generated upon Home Match
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* STAGE 2+: ACTIVE COMPLIANCE DOCUMENT AUDIT CARDS */
                <div className="p-4 bg-white rounded-2xl border-2 border-slate-900 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-orange-600" />
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-900">
                          Mandatory Physical Compliance Documents ({
                            selectedChild.documents.filter(d => ['birth_certificate', 'health_card', 'immunization'].includes(d.type)).length
                          })
                        </h4>
                        <p className="text-[10px] text-slate-500">
                          Official Ontario licensing documents audited by agency staff.
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                      {selectedChild.documents.filter(d => ['birth_certificate', 'health_card', 'immunization'].includes(d.type) && d.status === 'accepted').length} of {
                        selectedChild.documents.filter(d => ['birth_certificate', 'health_card', 'immunization'].includes(d.type)).length
                      } Approved
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {selectedChild.documents
                      .filter(d => ['birth_certificate', 'health_card', 'immunization'].includes(d.type))
                      .map((doc) => {
                        const isAccepted = doc.status === 'accepted';
                        const isUnderReview = doc.status === 'under_review';
                        const isRejected = doc.status === 'replacement_requested';
                        const isNotSubmitted = doc.status === 'not_submitted';

                        const sampleMap: Record<string, { url: string; name: string }> = {
                          birth_certificate: { url: '/documents/ontario-birth-certificate.jpg', name: 'ontario-birth-certificate.jpg' },
                          health_card: { url: '/documents/ontario-health-card.jpg', name: 'ontario-health-card.jpg' },
                          immunization: { url: '/documents/ontario-immunization-yellow-card.jpg', name: 'ontario-immunization-yellow-card.jpg' }
                        };
                        const effectiveUrl = doc.fileUrl || sampleMap[doc.type]?.url || '/documents/ontario-birth-certificate.jpg';
                        const effectiveName = doc.fileName || sampleMap[doc.type]?.name || 'ontario-compliance-doc.jpg';

                        return (
                          <div
                            key={doc.id}
                            className={`p-3 rounded-2xl border-2 transition-all flex flex-col justify-between space-y-2.5 ${
                              isAccepted
                                ? 'bg-emerald-50/60 border-emerald-400 shadow-sm'
                                : isUnderReview
                                ? 'bg-amber-50/70 border-amber-300 shadow-neo-sm'
                                : isRejected
                                ? 'bg-red-50/60 border-red-300'
                                : 'bg-slate-50 border-slate-300'
                            }`}
                          >
                            {/* Card Header & Status */}
                            <div>
                              <div className="flex items-start justify-between gap-1.5 mb-1.5">
                                <span className="font-extrabold text-slate-900 text-xs truncate max-w-[130px]" title={doc.title}>
                                  {doc.title}
                                </span>
                                <span className={`px-2 py-0.2 rounded-full font-extrabold text-[9px] uppercase border flex-shrink-0 ${
                                  isAccepted ? 'bg-emerald-100 text-emerald-900 border-emerald-300' :
                                  isUnderReview ? 'bg-amber-100 text-amber-900 border-amber-300' :
                                  isRejected ? 'bg-red-100 text-red-900 border-red-300' :
                                  'bg-slate-200 text-slate-700 border-slate-300'
                                }`}>
                                  {isAccepted ? '✓ Approved' : isUnderReview ? '⏳ Under Review' : isRejected ? '⚠️ Resubmit' : 'Not Submitted'}
                                </span>
                              </div>

                              {/* Visual Thumbnail */}
                              <div 
                                onClick={() => {
                                  if (!isNotSubmitted) {
                                    setActiveAuditedDoc({ doc: { ...doc, fileUrl: effectiveUrl, fileName: effectiveName }, child: selectedChild });
                                  }
                                }}
                                className={`w-full h-28 bg-slate-900 rounded-xl overflow-hidden relative ${
                                  isNotSubmitted ? 'cursor-default' : 'cursor-pointer group'
                                } border border-slate-800 shadow-inner flex items-center justify-center`}
                              >
                                {isNotSubmitted ? (
                                  <div className="text-center p-3 space-y-1">
                                    <Lock className="w-6 h-6 text-slate-500 mx-auto" />
                                    <span className="text-[10px] text-slate-400 font-bold block">Awaiting Parent Upload</span>
                                    <span className="text-[9px] text-slate-500 block font-normal">Inputted in Step 4</span>
                                  </div>
                                ) : (
                                  <>
                                    <img 
                                      src={effectiveUrl} 
                                      alt={doc.title} 
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                    />
                                    <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-white font-bold text-[10px]">
                                      <Eye className="w-3.5 h-3.5" />
                                      <span>Inspect Scan</span>
                                    </div>
                                  </>
                                )}
                              </div>

                              {/* Metadata */}
                              <div className="mt-2 text-[10px] text-slate-500 space-y-0.5">
                                <p className="truncate font-mono font-medium text-slate-700">{isNotSubmitted ? 'Pending parent submission (Step 4)' : (doc.fileName || effectiveName)}</p>
                                <p className="text-[9px] text-slate-400">
                                  {isNotSubmitted ? 'Required for Ministry Audit' : doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Ontario Specimen Attached'}
                                </p>
                              </div>
                            </div>

                            {/* Audit Action Buttons for Staff */}
                            <div className="pt-2 border-t border-slate-200/60 flex items-center gap-1.5">
                              {isNotSubmitted ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleCopyParentLink(selectedChild.parentId, undefined, selectedChild.id);
                                    showToast('✉️ Reminder Sent', `Parent upload link copied for ${selectedChild.fullName}.`);
                                  }}
                                  className="w-full py-1.5 rounded-lg text-[10px] font-extrabold bg-orange-100 hover:bg-orange-200 text-orange-900 border border-orange-300 flex items-center justify-center gap-1"
                                >
                                  <Mail className="w-3 h-3" />
                                  <span>Remind Parent</span>
                                </button>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleAuditDocStatusChange(selectedChild.id, doc.id, 'accepted')}
                                    className={`flex-1 py-1 rounded-lg text-[10px] font-extrabold transition-all flex items-center justify-center gap-1 ${
                                      isAccepted 
                                        ? 'bg-emerald-600 text-white shadow-sm' 
                                        : 'bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    }`}
                                    title="Approve document"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>{isAccepted ? 'Approved' : 'Approve'}</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleAuditDocStatusChange(selectedChild.id, doc.id, 'replacement_requested')}
                                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                                      isRejected 
                                        ? 'bg-red-600 text-white border-red-600' 
                                        : 'bg-white hover:bg-red-100 text-red-700 border-red-200'
                                    }`}
                                    title="Request resubmission"
                                  >
                                    <span>Reject</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setActiveAuditedDoc({ doc: { ...doc, fileUrl: effectiveUrl, fileName: effectiveName }, child: selectedChild })}
                                    className="p-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
                                    title="Inspect scan in lightbox"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* DYNAMIC STAGE-SPECIFIC ACTION BAR (IN POPUP MODAL) */}
              <div className="p-4 bg-orange-50/80 rounded-2xl border-2 border-orange-200 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-extrabold text-slate-900 block text-xs">Stage-Specific Action Plan</span>
                    <span className="text-[11px] text-slate-600">
                      Deterministic next step for {selectedChild.fullName}
                    </span>
                  </div>

                  {/* Manual Stage Override Dropdown */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-bold">Override:</span>
                    <select
                      value={selectedChild.admissionsStage}
                      onChange={(e) => {
                        const next = e.target.value as AdmissionsStage;
                        onUpdateChildStage(selectedChild.id, next);
                        setSelectedChild(prev => prev ? { ...prev, admissionsStage: next } : null);
                      }}
                      className="bg-white border border-slate-300 text-[11px] font-bold rounded-lg p-1.5 text-slate-800 focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="inquiry">1. New Inquiry</option>
                      <option value="docs_needed">2. Digital Forms & Docs</option>
                      <option value="matching">3. Provider Matching</option>
                      <option value="contract">4. Final Contract & Fees</option>
                      <option value="enrolled">5. Active Enrolment</option>
                      <option value="waitlisted">Waitlisted</option>
                      <option value="withdrawn">Withdrawn / Denied</option>
                    </select>
                  </div>
                </div>

                {/* STAGE 1 POPUP ACTIONS */}
                {selectedChild.admissionsStage === 'inquiry' && (
                  <div className="pt-2 border-t border-orange-200/60 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {getParent(selectedChild.parentId)?.phone && (
                        <a
                          href={`tel:${getParent(selectedChild.parentId)?.phone}`}
                          className="neo-btn bg-white hover:bg-slate-100 text-slate-900 px-3 py-1.5 text-xs font-bold gap-1.5"
                        >
                          <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Call Parent</span>
                        </a>
                      )}
                      <button
                        onClick={(e) => handleOpenWaitlistModal(selectedChild, e)}
                        className="neo-btn bg-purple-50 hover:bg-purple-100 text-purple-900 px-3 py-1.5 text-xs font-bold gap-1.5 border border-purple-300 cursor-pointer"
                      >
                        <Clock className="w-3.5 h-3.5 text-purple-600" />
                        <span>Place on Waitlist</span>
                      </button>

                      <button
                        onClick={(e) => handleDenyScreening(selectedChild, e)}
                        className="neo-btn bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1.5 text-xs font-bold gap-1.5 border border-red-300 cursor-pointer"
                      >
                        <UserX className="w-3.5 h-3.5 text-red-600" />
                        <span>Deny Screening</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleApproveScreening(selectedChild)}
                      className="neo-btn bg-amber-400 hover:bg-amber-300 text-slate-900 px-4 py-2 text-xs font-extrabold gap-1.5 shadow-neo-sm"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Approve Screening & Email Magic Link</span>
                    </button>
                  </div>
                )}

                {/* STAGE 2 POPUP ACTIONS (STRICT DOCUMENT GATING) */}
                {selectedChild.admissionsStage === 'docs_needed' && (() => {
                  const compliance = getComplianceStatus(selectedChild);
                  return (
                    <div className="pt-2 border-t border-orange-200/60 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyParentLink(selectedChild.parentId)}
                          className="neo-btn bg-white hover:bg-slate-100 text-slate-900 px-3 py-1.5 text-xs font-bold gap-1.5"
                        >
                          <Copy className="w-3.5 h-3.5 text-blue-600" />
                          <span>Copy Parent Magic Link</span>
                        </button>
                        <button
                          onClick={(e) => {
                            const p = getParent(selectedChild.parentId);
                            if (p) handleSendPortalEmail(p, selectedChild, e);
                          }}
                          className="neo-btn bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1.5 text-xs font-bold gap-1.5 border border-blue-300 cursor-pointer"
                        >
                          <Mail className="w-3.5 h-3.5 text-blue-600" />
                          <span>Resend Portal Email</span>
                        </button>
                      </div>

                      <button
                        disabled={!compliance.hasApprovedDocs}
                        onClick={() => {
                          onUpdateChildStage(selectedChild.id, 'matching');
                          setSelectedChild(prev => prev ? { ...prev, admissionsStage: 'matching' } : null);
                          showToast('🏡 Advanced to Matching', 'Child ready for provider home selection.');
                        }}
                        className={`px-4 py-2 text-xs font-extrabold gap-1.5 rounded-xl shadow-neo-sm flex items-center ${
                          compliance.hasApprovedDocs
                            ? 'neo-btn bg-blue-500 hover:bg-blue-400 text-white cursor-pointer'
                            : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed opacity-75'
                        }`}
                        title={!compliance.hasApprovedDocs ? 'All documents must be approved before moving to matching' : 'Advance to Matching'}
                      >
                        {compliance.hasApprovedDocs ? <ArrowRight className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        <span>{compliance.hasApprovedDocs ? 'Forms Complete ➔ Move to Matching' : `Incomplete (${compliance.unapprovedDocs.length} Pending)`}</span>
                      </button>
                    </div>
                  );
                })()}

                {/* STAGE 3 POPUP ACTIONS (RICH PROVIDER HOME MATCHING GRID) */}
                {selectedChild.admissionsStage === 'matching' && (() => {
                  const parent = getParent(selectedChild.parentId);
                  
                  const filteredProviders = providersList.filter(p => {
                    if (matchingRegionFilter === 'All') return true;
                    return p.region.toLowerCase().includes(matchingRegionFilter.toLowerCase());
                  });

                  const assignedProvider = providersList.find(p => p.id === selectedChild.providerId);

                  return (
                    <div className="pt-3 border-t border-orange-200/60 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <Home className="w-4 h-4 text-purple-600" />
                            <h4 className="font-extrabold text-xs text-slate-900">Select Licensed Provider Home</h4>
                            {parent?.region && (
                              <span className="text-[10px] bg-purple-100 text-purple-900 font-bold px-2 py-0.5 rounded-full border border-purple-200">
                                Preferred Area: {parent.region}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Select a verified CCEYA-compliant home provider below to assign placement for <strong className="text-slate-800">{selectedChild.fullName}</strong>.
                          </p>
                        </div>

                        {/* Region Filter Pills */}
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                          {['All', 'Durham', 'York', 'Toronto'].map((reg) => (
                            <button
                              key={reg}
                              type="button"
                              onClick={() => setMatchingRegionFilter(reg)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all ${
                                matchingRegionFilter === reg
                                  ? 'bg-purple-600 text-white shadow-sm'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                              }`}
                            >
                              {reg === 'All' ? 'All Areas' : reg}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Providers Cards Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                        {filteredProviders.map(provider => {
                          const isAssigned = (selectedChild.providerId === provider.id);
                          const enrolledCount = provider.enrolledChildIds?.length || childrenList.filter(c => c.providerId === provider.id && c.admissionsStage === 'enrolled').length;
                          const spotsAvailable = Math.max(0, provider.maxCapacity - enrolledCount);
                          const isFull = spotsAvailable === 0;

                          return (
                            <div
                              key={provider.id}
                              onClick={() => {
                                if (onAssignProvider) onAssignProvider(selectedChild.id, provider.id);
                                setSelectedChild(prev => prev ? { ...prev, providerId: provider.id } : null);
                              }}
                              className={`p-3 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                                isAssigned
                                  ? 'bg-purple-50/90 border-purple-600 shadow-neo-sm ring-2 ring-purple-400'
                                  : 'bg-white hover:bg-slate-50 border-slate-900 shadow-neo-sm'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2.5">
                                  <Avatar name={provider.name} photoUrl={provider.photoUrl} size="md" />
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <h5 className="font-extrabold text-xs text-slate-900">{provider.name}</h5>
                                      {isAssigned && (
                                        <span className="bg-purple-600 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full">
                                          ✓ Assigned
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] font-bold text-purple-700">{provider.homeName}</p>
                                    <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                                      <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                      <span>{provider.neighborhood} • {provider.region}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Capacity & Ratio Stats */}
                              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1 text-[10px]">
                                <span className={`px-2 py-0.5 rounded-md font-extrabold border ${
                                  spotsAvailable > 1 
                                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300' 
                                    : spotsAvailable === 1
                                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                                    : 'bg-red-100 text-red-900 border-red-300'
                                }`}>
                                  {isFull ? '⚠️ 0 Spots (Full)' : `✓ ${spotsAvailable} of ${provider.maxCapacity} Spots Available`}
                                </span>

                                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold text-[10px]">
                                  CWELCC $22/Day
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Bottom Selection Confirmation Bar */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-orange-200/60">
                        <div className="text-xs font-bold text-slate-700">
                          {assignedProvider ? (
                            <span>Selected: <strong className="text-purple-700">{assignedProvider.name}</strong> ({assignedProvider.homeName})</span>
                          ) : (
                            <span className="text-amber-700">⚠️ Click a provider card above to assign home placement</span>
                          )}
                        </div>

                        <button
                          disabled={!selectedChild.providerId}
                          onClick={() => {
                            onUpdateChildStage(selectedChild.id, 'contract');
                            setSelectedChild(prev => prev ? { ...prev, admissionsStage: 'contract' } : null);
                            showToast('✍️ Advanced to Contract', 'Contract terms generated for signature.');
                          }}
                          className={`px-4 py-2 text-xs font-extrabold gap-1.5 rounded-xl shadow-neo-sm flex items-center ${
                            selectedChild.providerId
                              ? 'neo-btn bg-purple-600 hover:bg-purple-500 text-white cursor-pointer'
                              : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed opacity-75'
                          }`}
                        >
                          <span>Confirm Home ➔ Move to Step 4 (Contract)</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* STAGE 4 POPUP ACTIONS (STRICT ONTARIO CCEYA GATING & FUNDING CONFIGURATOR) */}
                {selectedChild.admissionsStage === 'contract' && (() => {
                  const compliance = getComplianceStatus(selectedChild);
                  
                  const activeDays: string[] = (selectedChild.careDays && selectedChild.careDays.length > 0)
                    ? selectedChild.careDays
                    : ['MON', 'TUES', 'WED', 'THURS', 'FRI'];
                  const currentFundingType = selectedChild.fundingType || 'cwelcc';
                  const daysPerWeek = activeDays.length > 0 ? activeDays.length : 5;

                  const isSubsidy = currentFundingType === 'subsidy';
                  const isPrivate = currentFundingType === 'private';
                  const isCwelccTarget = currentFundingType === 'cwelcc_target';

                  const dailyParentRate = isSubsidy 
                    ? (selectedChild.parentContributionDailyRate ?? 0)
                    : isPrivate ? 35.00 : isCwelccTarget ? 10.00 : 22.00;
                  const weeklyParentRate = dailyParentRate * daysPerWeek;
                  const calculatedMonthlyFee = isSubsidy 
                    ? (selectedChild.monthlyFee ?? Math.round(dailyParentRate * (selectedChild.anticipatedMonthlyDays || 21) * 100) / 100)
                    : Math.round(weeklyParentRate * 4.35 * 100) / 100;
                  const providerDailyPayout = 35.00;
                  const providerMonthlyPayout = Math.round(providerDailyPayout * daysPerWeek * 4.35 * 100) / 100;

                  const handleAdminToggleDay = (day: string) => {
                    const exists = activeDays.includes(day);
                    const nextDays = exists ? activeDays.filter(d => d !== day) : [...activeDays, day];
                    const finalDays = nextDays.length > 0 ? nextDays : [day];
                    const newDaysCount = finalDays.length;
                    const newWeeklyRate = dailyParentRate * newDaysCount;
                    const newMonthlyFee = isSubsidy 
                      ? (selectedChild.parentContributionDailyRate ? Math.round(selectedChild.parentContributionDailyRate * (selectedChild.anticipatedMonthlyDays || Math.round(newDaysCount * 4.35)) * 100) / 100 : 0)
                      : Math.round(newWeeklyRate * 4.35 * 100) / 100;
                    
                    if (onUpdateChildFee) {
                      onUpdateChildFee(selectedChild.id, { careDays: finalDays, monthlyFee: newMonthlyFee });
                    }
                    setSelectedChild(prev => prev ? { ...prev, careDays: finalDays, monthlyFee: newMonthlyFee } : null);
                  };

                  const handleAdminPresetDays = (preset: 'cwelcc' | 'part_time' | 'all') => {
                    const finalDays = preset === 'cwelcc' 
                      ? ['MON', 'TUES', 'WED', 'THURS', 'FRI']
                      : preset === 'part_time'
                      ? ['MON', 'WED', 'FRI']
                      : ['MON', 'TUES', 'WED', 'THURS', 'FRI', 'SAT', 'SUN'];
                    const newDaysCount = finalDays.length;
                    const newWeeklyRate = dailyParentRate * newDaysCount;
                    const newMonthlyFee = isSubsidy 
                      ? (selectedChild.parentContributionDailyRate ? Math.round(selectedChild.parentContributionDailyRate * (selectedChild.anticipatedMonthlyDays || Math.round(newDaysCount * 4.35)) * 100) / 100 : 0)
                      : Math.round(newWeeklyRate * 4.35 * 100) / 100;
                    
                    if (onUpdateChildFee) {
                      onUpdateChildFee(selectedChild.id, { careDays: finalDays, monthlyFee: newMonthlyFee });
                    }
                    setSelectedChild(prev => prev ? { ...prev, careDays: finalDays, monthlyFee: newMonthlyFee } : null);
                  };

                  const handleAdminSetFunding = (funding: 'cwelcc' | 'subsidy' | 'private' | 'cwelcc_target') => {
                    const rate = funding === 'subsidy' 
                      ? (selectedChild.parentContributionDailyRate ?? 0) 
                      : funding === 'private' ? 35.00 : funding === 'cwelcc_target' ? 10.00 : 22.00;
                    const newWeeklyRate = rate * daysPerWeek;
                    const newMonthlyFee = funding === 'subsidy' 
                      ? (selectedChild.parentContributionDailyRate ? Math.round(selectedChild.parentContributionDailyRate * (selectedChild.anticipatedMonthlyDays || 21) * 100) / 100 : 0)
                      : Math.round(newWeeklyRate * 4.35 * 100) / 100;
                    
                    if (onUpdateChildFee) {
                      onUpdateChildFee(selectedChild.id, { fundingType: funding, monthlyFee: newMonthlyFee });
                    }
                    setSelectedChild(prev => prev ? { ...prev, fundingType: funding, monthlyFee: newMonthlyFee } : null);
                  };

                  return (
                    <div className="pt-2 border-t border-orange-200/60 space-y-4">
                      {/* 🌟 1. INTERACTIVE CCEYA FUNDING MODEL & SCHEDULE CONFIGURATOR FOR ADMIN */}
                      <div className="p-4 bg-white rounded-2xl border-2 border-slate-900 space-y-3.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-orange-500 text-white flex items-center justify-center font-bold">
                              <Calculator className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wide">
                                CCEYA Funding Model & Fee Agreement Configurator
                              </h4>
                              <p className="text-[10px] text-slate-500">Configure child's funding stream and required days. Changes sync live to Parent Portal.</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-300 text-emerald-950 font-bold text-[10px]">
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            <span>Live Synced to Parent Portal</span>
                          </div>
                        </div>

                        {/* Schedule & Funding Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 text-xs">
                          {/* 1. Care Days Toggle Grid (5 Cols) */}
                          <div className="lg:col-span-6 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                                  1. Days of Care Required ({daysPerWeek} Days/Wk)
                                </span>
                                <span className="text-[9px] font-bold text-orange-700 bg-orange-100 px-1.5 py-0.2 rounded">
                                  Admin Toggle
                                </span>
                              </div>

                              <div className="grid grid-cols-7 gap-1">
                                {['MON', 'TUES', 'WED', 'THURS', 'FRI', 'SAT', 'SUN'].map(day => {
                                  const isSelected = activeDays.includes(day);
                                  return (
                                    <button
                                      key={day}
                                      type="button"
                                      onClick={() => handleAdminToggleDay(day)}
                                      className={`py-1.5 px-0.5 rounded-lg text-center font-black text-[10px] transition-all border cursor-pointer ${
                                        isSelected
                                          ? 'bg-orange-500 text-white border-orange-600 shadow-sm scale-105'
                                          : 'bg-white text-slate-500 border-slate-300 hover:border-slate-800'
                                      }`}
                                      title={`Toggle ${day}`}
                                    >
                                      {day}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-1 flex-wrap text-[10px]">
                              <span className="text-slate-400 font-bold">Presets:</span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleAdminPresetDays('cwelcc')}
                                  className="px-2 py-0.5 bg-white hover:bg-orange-100 text-slate-700 font-bold border border-slate-300 rounded"
                                >
                                  Mon–Fri
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleAdminPresetDays('part_time')}
                                  className="px-2 py-0.5 bg-white hover:bg-slate-200 text-slate-700 font-bold border border-slate-300 rounded"
                                >
                                  M/W/F
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleAdminPresetDays('all')}
                                  className="px-2 py-0.5 bg-white hover:bg-slate-200 text-slate-700 font-bold border border-slate-300 rounded"
                                >
                                  7 Days
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* 2. CCEYA Funding Model Selector (6 Cols) */}
                          <div className="lg:col-span-6 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 flex flex-col justify-between">
                            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                              2. CCEYA Funding Stream Assignment
                            </span>

                            <div className="grid grid-cols-2 gap-1.5">
                              {/* CWELCC Current ($22) */}
                              <button
                                type="button"
                                onClick={() => handleAdminSetFunding('cwelcc')}
                                className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                                  currentFundingType === 'cwelcc'
                                    ? 'bg-emerald-100/80 border-emerald-500 text-emerald-950 font-black shadow-neo-sm ring-1 ring-emerald-500'
                                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400 font-medium'
                                }`}
                              >
                                <div className="text-[10px] font-bold truncate">CWELCC Current</div>
                                <div className="text-xs font-black text-emerald-700">$22.00 / day</div>
                              </button>

                              {/* CWELCC Target ($10) */}
                              <button
                                type="button"
                                onClick={() => handleAdminSetFunding('cwelcc_target')}
                                className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                                  currentFundingType === 'cwelcc_target'
                                    ? 'bg-emerald-100/80 border-emerald-500 text-emerald-950 font-black shadow-neo-sm ring-1 ring-emerald-500'
                                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400 font-medium'
                                }`}
                              >
                                <div className="text-[10px] font-bold truncate">CWELCC Target</div>
                                <div className="text-xs font-black text-emerald-700">$10.00 / day</div>
                              </button>

                              {/* Municipal Subsidy */}
                              <button
                                type="button"
                                onClick={() => handleAdminSetFunding('subsidy')}
                                className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                                  currentFundingType === 'subsidy'
                                    ? 'bg-purple-100/80 border-purple-500 text-purple-950 font-black shadow-neo-sm ring-1 ring-purple-500'
                                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400 font-medium'
                                }`}
                              >
                                <div className="text-[10px] font-bold truncate">Municipal Subsidy</div>
                                <div className="text-xs font-black text-purple-700">
                                  {selectedChild.parentContributionDailyRate && selectedChild.parentContributionDailyRate > 0
                                    ? `$${selectedChild.parentContributionDailyRate.toFixed(2)}/day Co-Pay`
                                    : '$0.00 Co-Pay'}
                                </div>
                              </button>

                              {/* Private ($35) */}
                              <button
                                type="button"
                                onClick={() => handleAdminSetFunding('private')}
                                className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                                  currentFundingType === 'private'
                                    ? 'bg-amber-100/80 border-amber-500 text-amber-950 font-black shadow-neo-sm ring-1 ring-amber-500'
                                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400 font-medium'
                                }`}
                              >
                                <div className="text-[10px] font-bold truncate">Private Non-CWELCC</div>
                                <div className="text-xs font-black text-amber-800">$35.00 / day</div>
                              </button>
                            </div>

                            <p className="text-[10px] text-slate-500 pt-0.5">
                              {isSubsidy ? (selectedChild.parentContributionDailyRate && selectedChild.parentContributionDailyRate > 0 ? `Assessed parental daily contribution ($${selectedChild.parentContributionDailyRate.toFixed(2)}/day)` : 'Covered by Municipal Child Care Subsidy ($0 parent co-pay)') : isPrivate ? 'Full unsubsidized private parent rate ($35.00/day)' : isCwelccTarget ? 'Provincial CWELCC $10/day upcoming rate' : 'Ontario CWELCC standard enrolled phase ($22.00/day)'}
                            </p>
                          </div>
                        </div>

                        {/* 🌟 2. ADMIN LIVE PARENT PRICING DISPLAY CARD */}
                        <div className="p-3.5 bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/50 rounded-xl border-2 border-emerald-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded">
                                Price Shown to Parent on Portal
                              </span>
                              <span className="text-[10px] text-emerald-900 font-mono font-bold">
                                {isSubsidy ? (selectedChild.parentContributionDailyRate && selectedChild.parentContributionDailyRate > 0 ? `$${selectedChild.parentContributionDailyRate.toFixed(2)}/day × ${selectedChild.anticipatedMonthlyDays || 21} days` : '100% Subsidized ($0 Co-Pay)') : `$${dailyParentRate.toFixed(2)}/day × ${daysPerWeek} days × 4.35 wks`}
                              </span>
                            </div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-black text-emerald-900">
                                ${calculatedMonthlyFee.toFixed(2)} <span className="text-xs font-bold text-slate-600">CAD / Month</span>
                              </span>
                              <span className="text-xs font-bold text-emerald-700">
                                (${weeklyParentRate.toFixed(2)} / week)
                              </span>
                            </div>
                          </div>

                          {/* Provider Statutory Compensation Notice */}
                          <div className="p-2.5 bg-white/90 rounded-lg border border-emerald-300 text-[11px] text-slate-700 space-y-0.5 sm:text-right">
                            <span className="font-extrabold text-slate-900 block flex items-center sm:justify-end gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Provider Payout: $35.00/day</span>
                            </span>
                            <span className="text-slate-600 font-mono text-[10px] block">
                              ${providerMonthlyPayout.toFixed(2)}/mo per child
                            </span>
                            <span className="text-[9px] text-emerald-800 font-bold block">
                              Ontario Ministry Statutory Rate
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Compliance Status Checklist Banner */}
                      <div className={`p-3 rounded-xl border-2 text-xs space-y-2 ${
                        compliance.isEnrolmentReady 
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-950' 
                          : 'bg-amber-50 border-amber-300 text-amber-950'
                      }`}>
                        <div className="flex items-center justify-between font-bold">
                          <span className="flex items-center gap-1.5">
                            {compliance.isEnrolmentReady ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-amber-600" />}
                            <span>Ontario CCEYA Mandatory Enrolment Requirements</span>
                          </span>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase ${
                            compliance.isEnrolmentReady ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
                          }`}>
                            {compliance.isEnrolmentReady ? 'Ready for Enrolment' : 'Compliance Incomplete'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                          {/* Requirement 1: Home Placement */}
                          <div className="flex items-center justify-between p-2 bg-white/90 rounded-lg border border-slate-200">
                            <span className="font-bold text-slate-700">1. Placement Home:</span>
                            {compliance.hasPlacementHome ? (
                              <span className="font-extrabold text-emerald-700 flex items-center gap-1">
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{getProvider(selectedChild.providerId)?.name}</span>
                              </span>
                            ) : (
                              <div className="flex items-center gap-1">
                                <select
                                  value=""
                                  onChange={(e) => {
                                    if (onAssignProvider) onAssignProvider(selectedChild.id, e.target.value);
                                    setSelectedChild(prev => prev ? { ...prev, providerId: e.target.value } : null);
                                  }}
                                  className="bg-red-50 text-red-800 border-2 border-red-300 text-[10px] font-bold rounded p-1"
                                >
                                  <option value="">⚠️ Assign Home Now</option>
                                  {providersList.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} ({p.neighborhood})</option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>

                          {/* Requirement 2: Regulatory Documents */}
                          <div className="flex items-center justify-between p-2 bg-white/90 rounded-lg border border-slate-200">
                            <span className="font-bold text-slate-700">2. Regulatory Docs ({selectedChild.documents.length}):</span>
                            {compliance.hasApprovedDocs ? (
                              <span className="font-extrabold text-emerald-700 flex items-center gap-1">
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>All Approved</span>
                              </span>
                            ) : (
                              <span className="font-extrabold text-red-700">
                                ⚠️ {compliance.unapprovedDocs.length} Pending Approval
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Footer */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-slate-200">
                        <div className="flex items-center gap-2 flex-1 max-w-sm">
                          <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider shrink-0">
                            Interac Conf #:
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. CA1234567890"
                            value={adminPaymentRefs[selectedChild.id] !== undefined ? adminPaymentRefs[selectedChild.id] : 'CA-EMAIL-VERIFIED'}
                            onChange={(e) => {
                              const val = e.target.value;
                              setAdminPaymentRefs(prev => ({ ...prev, [selectedChild.id]: val }));
                            }}
                            className="p-1.5 bg-slate-50 border-2 border-slate-900 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500 w-full"
                          />
                        </div>

                        <button
                          disabled={!compliance.isEnrolmentReady}
                          onClick={() => {
                            const refNum = adminPaymentRefs[selectedChild.id] || 'CA-EMAIL-VERIFIED';
                            onUpdateChildStage(selectedChild.id, 'enrolled');
                            setSelectedChild(prev => prev ? { ...prev, admissionsStage: 'enrolled' } : null);
                            showToast('🛡️ Payment Verified & Enrolment Confirmed!', `${selectedChild.fullName} is now active. Ref: ${refNum}`);
                          }}
                          className={`px-5 py-2.5 text-xs font-extrabold gap-1.5 rounded-xl shadow-neo-sm flex items-center ${
                            compliance.isEnrolmentReady
                              ? 'neo-btn bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                              : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed opacity-75'
                          }`}
                        >
                          {compliance.isEnrolmentReady ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                          <span>{compliance.isEnrolmentReady ? 'Verify Payment & Confirm Enrolment' : 'Enrolment Gated'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* STAGE 5 POPUP ACTIONS */}
                {selectedChild.admissionsStage === 'enrolled' && (
                  <div className="pt-2 border-t border-orange-200/60 flex items-center justify-between gap-2">
                    <span className="text-emerald-900 font-extrabold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Child is fully enrolled and active in daily licensed care.</span>
                    </span>

                    <button
                      onClick={() => setSelectedChild(null)}
                      className="neo-btn bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-xs font-bold"
                    >
                      <span>Close</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">ID: {selectedChild.id}</span>
              <button
                onClick={() => setSelectedChild(null)}
                className="neo-btn bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </ModalPortal>
      )}

      {/* 📑 DEDICATED DOCUMENT AUDIT & PREVIEW POPUP MODAL */}
      {activeAuditedDoc && (
        <ModalPortal>
          <div 
            onClick={(e) => {
              if (e.target === e.currentTarget) setActiveAuditedDoc(null);
            }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn cursor-pointer"
          >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white border-2 border-slate-900 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col animate-scaleUp cursor-default"
          >
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-orange-500 text-white rounded-lg">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">{activeAuditedDoc.doc.title}</h3>
                  <p className="text-[10px] text-slate-300">
                    Child: {activeAuditedDoc.child.fullName} • Type: {activeAuditedDoc.doc.type.replace('_', ' ').toUpperCase()}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveAuditedDoc(null)}
                className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Document Details & Visual Specimen Card */}
            <div className="p-5 space-y-4 text-xs">
              {/* Status Pill & Metadata */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Submission Status</span>
                  <span className={`inline-block mt-0.5 px-2.5 py-0.5 rounded-full font-extrabold text-[10px] uppercase border ${
                    activeAuditedDoc.doc.status === 'accepted' ? 'bg-emerald-100 text-emerald-900 border-emerald-300' :
                    activeAuditedDoc.doc.status === 'under_review' ? 'bg-amber-100 text-amber-900 border-amber-300' :
                    'bg-red-100 text-red-900 border-red-300'
                  }`}>
                    {activeAuditedDoc.doc.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Uploaded Date</span>
                  <span className="font-mono text-slate-800 text-[11px]">
                    {activeAuditedDoc.doc.uploadedAt || activeAuditedDoc.child.intakeSubmissionDate || 'Pending Submission'}
                  </span>
                </div>
              </div>

              {/* Document Specimen Simulation */}
              {(() => {
                const sampleMap: Record<string, { url: string; name: string }> = {
                  birth_certificate: { url: '/documents/ontario-birth-certificate.jpg', name: 'ontario-birth-certificate.jpg' },
                  health_card: { url: '/documents/ontario-health-card.jpg', name: 'ontario-health-card.jpg' },
                  immunization: { url: '/documents/ontario-immunization-yellow-card.jpg', name: 'ontario-immunization-yellow-card.jpg' },
                  allergy_plan: { url: '/documents/ontario-birth-certificate.jpg', name: 'anaphylaxis_action_plan.jpg' },
                  religious_exemption: { url: '/documents/ontario-health-card.jpg', name: 'master_parent_contract.pdf' }
                };
                const scanUrl = activeAuditedDoc.doc.fileUrl || sampleMap[activeAuditedDoc.doc.type]?.url || '/documents/ontario-birth-certificate.jpg';
                const scanName = activeAuditedDoc.doc.fileName || sampleMap[activeAuditedDoc.doc.type]?.name || 'ontario-document-scan.jpg';

                return (
                  <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-900 space-y-3">
                    {/* Actual Visual Attachment */}
                    <div className="w-full max-h-96 bg-slate-950 rounded-xl overflow-hidden border-2 border-slate-900 flex items-center justify-center p-2 relative shadow-inner">
                      <img 
                        src={scanUrl} 
                        alt={activeAuditedDoc.doc.title}
                        className="max-h-96 w-full object-contain rounded-lg shadow-md"
                      />
                      <a
                        href={scanUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute top-3 right-3 bg-slate-900/90 hover:bg-slate-900 text-white px-3 py-1.5 rounded-xl text-[11px] font-bold border border-slate-700 flex items-center gap-1.5 shadow-md cursor-pointer"
                        title="Open full resolution in new browser tab"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open Original File</span>
                      </a>
                    </div>

                    <div className="py-2.5 px-3.5 space-y-2 bg-white rounded-xl border border-slate-200 shadow-sm text-left">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-[10px]">
                        <span className="font-extrabold text-slate-900 flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-orange-600" />
                          <span>DOCUMENT SPECIMEN VERIFICATION</span>
                        </span>
                        <span className="font-mono text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {scanName}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
                        <p><strong>Child:</strong> {activeAuditedDoc.child.fullName}</p>
                        <p><strong>DOB:</strong> {activeAuditedDoc.child.dob} ({activeAuditedDoc.child.ageYearsFormatted})</p>
                        <p><strong>Doc ID:</strong> <span className="font-mono text-[10px]">{activeAuditedDoc.doc.id}</span></p>
                        <p><strong>Compliance Standard:</strong> Ontario CCEYA Regulation 137/15</p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Action Buttons in Document Viewer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                {activeAuditedDoc.doc.status === 'not_submitted' && (
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[11px] text-red-700 font-bold flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>Cannot approve: Document missing</span>
                    </span>
                    <button
                      onClick={() => {
                        showToast('✉️ Reminder Dispatched!', `Sent document request to ${getParent(activeAuditedDoc.child.parentId)?.email}`);
                        setActiveAuditedDoc(null);
                      }}
                      className="neo-btn bg-orange-500 hover:bg-orange-400 text-white px-3.5 py-1.5 text-xs font-bold gap-1"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email Reminder</span>
                    </button>
                  </div>
                )}

                {activeAuditedDoc.doc.status === 'under_review' && (
                  <div className="flex items-center justify-between w-full gap-2">
                    <button
                      onClick={() => handleAuditDocStatusChange(activeAuditedDoc.child.id, activeAuditedDoc.doc.id, 'replacement_requested')}
                      className="neo-btn bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1.5 text-xs font-bold border border-red-300"
                    >
                      Request Replacement
                    </button>

                    <button
                      onClick={() => handleAuditDocStatusChange(activeAuditedDoc.child.id, activeAuditedDoc.doc.id, 'accepted')}
                      className="neo-btn bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-1.5 text-xs font-extrabold gap-1 shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve Document</span>
                    </button>
                  </div>
                )}

                {activeAuditedDoc.doc.status === 'accepted' && (
                  <div className="flex items-center justify-between w-full">
                    <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Verified & Approved by Agency Director (Admin)</span>
                    </span>
                    <button
                      onClick={() => handleAuditDocStatusChange(activeAuditedDoc.child.id, activeAuditedDoc.doc.id, 'under_review')}
                      className="text-xs text-slate-500 hover:underline font-medium"
                    >
                      Revert Status
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </ModalPortal>
      )}
      {/* 📋 DEDICATED FORM PAR-0 PRE-SCREENING AUDIT MODAL */}
      {isViewingFormZero && selectedChild && (() => {
        const parent = getParent(selectedChild.parentId);
        return (
          <ModalPortal>
            <div 
              onClick={(e) => {
                if (e.target === e.currentTarget) setIsViewingFormZero(false);
              }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn print-modal-container cursor-pointer"
            >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="bg-white border-2 border-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col animate-scaleUp max-h-[90vh] print-modal-content cursor-default"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500 text-slate-950 font-black rounded-xl">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold bg-emerald-400 text-slate-950 px-2 py-0.2 rounded uppercase">
                        FORM PAR-0
                      </span>
                      <span className="text-xs text-slate-400">CCEYA Regulation 137/15</span>
                    </div>
                    <h3 className="text-base font-extrabold text-white">Initial Intake & Pre-Screening Record</h3>
                  </div>
                </div>

                <button
                  onClick={() => setIsViewingFormZero(false)}
                  className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer print:hidden no-print"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <div className="p-6 overflow-y-auto space-y-5 text-xs print-modal-body">
                {/* Official Status Banner */}
                <div className="p-3.5 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <div>
                      <span className="font-extrabold text-emerald-950 text-xs block">
                        Form 0 Submitted & Ready for Discovery Call
                      </span>
                      <span className="text-[11px] text-emerald-800">
                        Submitted on {selectedChild.intakeSubmissionDate || 'Current Admissions Cycle'} • Digital Signature Verified
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-200 text-emerald-900 border border-emerald-400 uppercase">
                    ✓ Verified Intake
                  </span>
                </div>

                {/* Section 1: Household & Guardian Profile */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 print-avoid-break">
                  <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 pb-2 border-b border-slate-200">
                    <User className="w-3.5 h-3.5 text-orange-600" />
                    <span>1. Household & Guardian Identification</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Parent / Guardian Legal Name</span>
                      <span className="font-extrabold text-slate-900 text-xs">{parent?.fullName || 'Not on file'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Primary Contact Phone</span>
                      <a href={`tel:${parent?.phone}`} className="font-mono font-extrabold text-emerald-700 text-xs hover:underline flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        <span>{parent?.phone || 'Not on file'}</span>
                      </a>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Contact Email</span>
                      <a href={`mailto:${parent?.email}`} className="font-mono text-slate-800 text-xs hover:underline flex items-center gap-1">
                        <Mail className="w-3 h-3 text-orange-600" />
                        <span>{parent?.email || 'Not on file'}</span>
                      </a>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Municipality / Service Region</span>
                      <span className="font-bold text-slate-800 text-xs flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>{parent?.region || 'Durham Region (Oshawa, Whitby)'}</span>
                      </span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Residential Address</span>
                      <span className="font-medium text-slate-800 text-xs">{parent?.homeAddress || `${parent?.city || 'Durham Region'}, Ontario`}</span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Child Enrollment Details & Schedule Request */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 print-avoid-break">
                  <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 pb-2 border-b border-slate-200">
                    <Baby className="w-3.5 h-3.5 text-blue-600" />
                    <span>2. Child Enrollment & Placement Requirements</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Child Legal Name</span>
                      <span className="font-extrabold text-slate-900 text-xs">{selectedChild.fullName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Date of Birth & Age</span>
                      <span className="font-extrabold text-slate-900 text-xs">
                        {selectedChild.dob} ({selectedChild.ageYearsFormatted})
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Desired Start Date</span>
                      <span className="font-mono font-extrabold text-slate-900 text-xs flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-blue-600" />
                        <span>{parent?.preferredStartDate || selectedChild.intakeSubmissionDate || 'Immediate'}</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Desired Care Schedule</span>
                      <span className="font-extrabold text-slate-900 text-xs uppercase flex items-center gap-1">
                        <Clock className="w-3 h-3 text-orange-600" />
                        <span>{parent?.preferredSchedule?.replace('_', ' ') || 'Full Time (5 Days/wk)'}</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Funding Stream</span>
                      <span className="font-extrabold text-emerald-800 text-xs">
                        {selectedChild.fundingType === 'cwelcc' ? 'Ontario CWELCC ($22 ➔ $10/Day)' :
                         selectedChild.fundingType === 'subsidy' ? 'Municipal Regional Subsidy ($0 Co-pay)' : 'Private Care ($35/Day)'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Estimated Parent Fee</span>
                      <span className="font-extrabold text-slate-900 text-xs font-mono">
                        ${selectedChild.monthlyFee ? selectedChild.monthlyFee.toFixed(2) : calculateMonthlyFee(selectedChild.fundingType || 'cwelcc').toFixed(2)} / Month
                      </span>
                    </div>

                    {selectedChild.fundingType === 'subsidy' && (() => {
                      const quota = selectedChild.subsidizedAbsenceQuota ?? 30;
                      const used = selectedChild.subsidizedAbsenceDaysUsed ?? 0;
                      const remaining = Math.max(0, quota - used);
                      const warnThreshold = Math.max(1, quota - 5);

                      return (
                        <div className="sm:col-span-3 mt-2 pt-2 border-t border-slate-200">
                          <div className="flex items-center justify-between pb-1">
                            <span className="text-[10px] font-bold text-purple-900 uppercase">
                              Municipal {quota}-Day Subsidized Absence Ledger
                            </span>
                            <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded border ${
                              used >= quota
                                ? 'bg-rose-100 text-rose-800 border-rose-300'
                                : used >= warnThreshold
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : 'bg-purple-100 text-purple-900 border-purple-300'
                            }`}>
                              {used} / {quota} Days Used ({remaining} Remaining)
                            </span>
                          </div>
                          <div className="w-full bg-purple-200 rounded-full h-2 overflow-hidden border border-purple-300">
                            <div
                              className={`h-full rounded-full transition-all ${
                                used >= quota ? 'bg-rose-600' :
                                used >= warnThreshold ? 'bg-amber-500' : 'bg-purple-600'
                              }`}
                              style={{ width: `${Math.min(100, ((used / quota) * 100))}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[9px] text-slate-500 mt-1 font-medium">
                            <span>Case #: {selectedChild.subsidyCaseNumber || 'On File'} • {selectedChild.subsidyRegion || 'Municipal Region'}</span>
                            <span>Annual {quota}-Day Policy Cap</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Section 3: Health, Allergies & Sabrina's Law */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 print-avoid-break">
                  <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 pb-2 border-b border-slate-200">
                    <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                    <span>3. Health, Medical & Allergy Disclosure</span>
                  </h4>
                  <div className="space-y-2 text-slate-700">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Disclosed Allergies / Dietary Needs</span>
                      <span className="font-bold text-slate-900 text-xs">
                        {selectedChild.allergies && selectedChild.allergies.length > 0 ? selectedChild.allergies.join(', ') : 'None reported on initial intake.'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Medical / Special Instructions</span>
                      <p className="text-xs text-slate-600 leading-relaxed bg-white p-2.5 rounded-xl border border-slate-200">
                        {selectedChild.medicalNotes || parent?.formZeroNotes || 'No special medical instructions or physical accommodations requested on Form 0.'}
                      </p>
                    </div>
                    {selectedChild.epiPenRequired && (
                      <div className="p-2 bg-red-100 text-red-900 rounded-xl border border-red-300 font-extrabold text-[11px] flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                        <span>SABRINA'S LAW (ONTARIO STATUTE): Child carries an emergency Epi-Pen for anaphylaxis.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 🖋️ Official Ontario Ministry CCEYA Licensing Staff Sign-Off & Verification Block (Print Only) */}
                <div className="hidden print:block pt-4 mt-6 border-t-2 border-slate-900 space-y-4 print-avoid-break">
                  <div className="flex items-center justify-between text-[10px] text-slate-800 pb-2 border-b border-slate-300">
                    <div>
                      <p className="font-extrabold text-slate-950 text-xs">ALL CHILD CARE SOLUTIONS INC.</p>
                      <p className="text-[10px] text-slate-600">Ontario Licensed Home Child Care Agency • CCEYA Regulation 137/15</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-[10px] font-bold text-slate-900">Audit Document: ACCS-PAR-0-2026</p>
                      <p className="text-[10px] text-slate-500">Intake Print Date: {new Date().toLocaleDateString('en-CA')}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 pt-4">
                    <div className="border-t-2 border-slate-800 pt-2 text-[10px] space-y-1">
                      <p className="font-extrabold text-slate-950">Agency Director / Intake Staff</p>
                      <p className="text-slate-600 text-[9px]">CCEYA Screening Call Verified & Authorized</p>
                      <p className="text-slate-400 text-[8px] font-mono">Date: ________________________</p>
                    </div>
                    <div className="border-t-2 border-slate-800 pt-2 text-[10px] space-y-1">
                      <p className="font-extrabold text-slate-950">{parent?.fullName || 'Parent / Legal Guardian'}</p>
                      <p className="text-slate-600 text-[9px]">Parent Acknowledgement & Accuracy Attestation</p>
                      <p className="text-slate-400 text-[8px] font-mono">Signature: ____________________</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer with Staff Call & Approval Actions (Hidden during print) */}
              <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 print:hidden no-print">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="neo-btn bg-white hover:bg-slate-100 text-slate-900 px-3.5 py-2 text-xs font-bold gap-1.5 border border-slate-300 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Print Form</span>
                  </button>
                  {parent?.phone && (
                    <a
                      href={`tel:${parent.phone}`}
                      className="neo-btn bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 text-xs font-bold gap-1.5 shadow-sm"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Call {parent.fullName}</span>
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {selectedChild.admissionsStage === 'inquiry' && (
                    <button
                      onClick={() => {
                        handleApproveScreening(selectedChild);
                        setIsViewingFormZero(false);
                      }}
                      className="neo-btn bg-amber-400 hover:bg-amber-300 text-slate-900 px-4 py-2 text-xs font-extrabold gap-1.5 shadow-neo-sm cursor-pointer"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Approve Screening & Advance Child</span>
                    </button>
                  )}
                  <button
                    onClick={() => setIsViewingFormZero(false)}
                    className="neo-btn bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 text-xs font-bold cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
        );
      })()}

      {/* INTAKE ACTION MODAL: WAITLIST OR DENY / WITHDRAW */}
      {inquiryActionChild && (() => {
        const parent = getParent(inquiryActionChild.parentId);
        return (
          <ModalPortal>
            <div 
              onClick={(e) => {
                if (e.target === e.currentTarget) setInquiryActionChild(null);
              }}
              className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in cursor-pointer"
            >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="bg-white border-3 border-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-neo space-y-5 cursor-default"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2.5 rounded-2xl border-2 ${
                    actionModalTab === 'waitlist' ? 'bg-purple-100 border-purple-600 text-purple-900' : 'bg-red-100 border-red-600 text-red-900'
                  }`}>
                    {actionModalTab === 'waitlist' ? <Clock className="w-5 h-5" /> : <UserX className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      {actionModalTab === 'waitlist' ? 'Place on Early / Unborn Waitlist' : 'Deny Application / Mark Withdrawn'}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {inquiryActionChild.fullName} • {parent?.fullName || 'Parent'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setInquiryActionChild(null)}
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tab Switcher: Waitlist vs Deny */}
              <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-300 gap-1">
                <button
                  type="button"
                  onClick={() => setActionModalTab('waitlist')}
                  className={`flex-1 py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    actionModalTab === 'waitlist' 
                      ? 'bg-purple-600 text-white shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>⏳ Move to Waitlist</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActionModalTab('deny')}
                  className={`flex-1 py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    actionModalTab === 'deny' 
                      ? 'bg-red-600 text-white shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserX className="w-3.5 h-3.5" />
                  <span>🚫 Deny / Withdraw</span>
                </button>
              </div>

              {/* Child Info Snippet */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-500">Age / Status:</span>
                  <span className="text-slate-900 font-extrabold">{inquiryActionChild.isUnborn ? `🍼 Due ${inquiryActionChild.expectedDueDate || '2027'} (Unborn)` : inquiryActionChild.ageYearsFormatted}</span>
                </div>
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-500">Parent Phone:</span>
                  <span className="text-slate-900">{parent?.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-500">Region:</span>
                  <span className="text-slate-900">{parent?.region || 'Durham Region'}</span>
                </div>
              </div>

              {actionModalTab === 'waitlist' ? (
                /* Waitlist Form */
                <div className="space-y-3.5 text-xs">
                  <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 text-purple-950 text-[11px] leading-relaxed">
                    <strong>Waitlist Function:</strong> Preserves the application without denial. Ideal for expectant parents with unborn infants or parents applying months ahead of their desired start date.
                  </div>

                  <label className="flex items-center gap-2 p-2.5 bg-purple-50/50 rounded-xl border border-purple-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isUnbornToggle}
                      onChange={(e) => setIsUnbornToggle(e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded cursor-pointer"
                    />
                    <span className="font-extrabold text-purple-950 flex items-center gap-1 text-[11px]">
                      <Baby className="w-4 h-4 text-purple-700" />
                      <span>Child is not born yet (Expectant Parent / Unborn Infant)</span>
                    </span>
                  </label>

                  <div>
                    <label className="font-extrabold text-slate-900 block mb-1">
                      {isUnbornToggle ? 'Expected Due Date *' : 'Target Care Start Date *'}
                    </label>
                    <AccsDatePicker
                      value={waitlistDateInput}
                      onChange={setWaitlistDateInput}
                      mode="future"
                      placeholder="YYYY-MM-DD"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="font-extrabold text-slate-900 block mb-1">
                      Waitlist Notes & Follow-up Trigger
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Mom on maternity leave until Jan 2027. Contact in Nov 2026 to confirm spot."
                      value={waitlistNotesInput}
                      onChange={(e) => setWaitlistNotesInput(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-800"
                    />
                  </div>
                </div>
              ) : (
                /* Deny / Withdraw Form */
                <div className="space-y-3.5 text-xs">
                  <div className="p-3 bg-red-50 rounded-2xl border border-red-200 text-red-950 text-[11px] leading-relaxed">
                    <strong>Deny Application:</strong> Moves this intake into the Withdrawn archive. Zero data loss — you can view, review, or restore this application at any time from the "Withdrawn" button in the pipeline toolbar.
                  </div>

                  <div>
                    <label className="font-extrabold text-slate-900 block mb-1">
                      Primary Reason for Denial / Withdrawal *
                    </label>
                    <select
                      value={denyReason}
                      onChange={(e) => setDenyReason(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 cursor-pointer"
                    >
                      <option value="Out of Service Area (Outside agency catchment zone)">Out of Service Area (Outside agency catchment zone)</option>
                      <option value="No Capacity for Age Group (All infant/toddler licensed spaces full)">No Capacity for Age Group (All infant/toddler spaces full)</option>
                      <option value="Schedule Mismatch (Requires overnight, weekend, or extended hours)">Schedule Mismatch (Requires overnight/extended hours)</option>
                      <option value="Parent Chose Alternative Child Care Option">Parent Chose Alternative Child Care Option</option>
                      <option value="Non-Responsive to Screening Calls (3+ attempts made)">Non-Responsive to Screening Calls (3+ attempts made)</option>
                      <option value="Parent Voluntarily Withdrew Application">Parent Voluntarily Withdrew Application</option>
                      <option value="Other / Mutual Decision">Other / Mutual Decision</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-extrabold text-slate-900 block mb-1">
                      Additional Notes / Administrator Memo (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Lives in Peterborough, outside our Oshawa/Whitby route."
                      value={customDenyNotes}
                      onChange={(e) => setCustomDenyNotes(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-800"
                    />
                  </div>
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setInquiryActionChild(null)}
                  className="neo-btn bg-white hover:bg-slate-100 text-slate-800 text-xs px-4 py-2 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmInquiryAction}
                  className={`neo-btn text-white text-xs px-5 py-2 font-black shadow-neo-sm cursor-pointer ${
                    actionModalTab === 'waitlist' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {actionModalTab === 'waitlist' ? 'Confirm Waitlist Placement' : 'Confirm Denial & Withdraw'}
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
        );
      })()}

      {/* WITHDRAWN / DENIED APPLICATIONS ARCHIVE MODAL */}
      {showWithdrawnDrawer && (
        <ModalPortal>
          <div 
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowWithdrawnDrawer(false);
            }}
            className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in cursor-pointer"
          >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white border-3 border-slate-900 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-neo cursor-default"
          >
            {/* Header */}
            <div className="p-5 border-b-2 border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-red-100 border-2 border-red-600 text-red-700">
                  <UserX className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Withdrawn & Denied Inquiries</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {withdrawnChildren.length} applicant{withdrawnChildren.length !== 1 ? 's' : ''} in historical archive. Full transparency with 1-click restore.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowWithdrawnDrawer(false)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body List */}
            <div className="p-5 overflow-y-auto space-y-3 flex-1">
              {withdrawnChildren.length === 0 ? (
                <div className="p-8 text-center text-slate-500 font-bold bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300">
                  No withdrawn or denied applications on file.
                </div>
              ) : (
                withdrawnChildren.map(child => {
                  const parent = getParent(child.parentId);
                  return (
                    <div
                      key={child.id}
                      className="p-4 rounded-2xl border-2 border-slate-900 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-orange-500 transition-all shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar name={child.fullName} photoUrl={child.photoUrl} size="md" shape="circle" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-black text-slate-900">{child.fullName}</h4>
                            <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                              {child.ageYearsFormatted}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 font-medium mt-0.5">
                            Parent: <strong>{parent?.fullName || 'Parent on file'}</strong> • {parent?.phone || 'No phone'} • {parent?.region || 'Durham'}
                          </p>
                          <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-200 max-w-fit">
                            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate">Reason: {child.withdrawnReason || 'Denied during initial intake screening'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateChildStage(child.id, 'inquiry');
                            showToast('🔄 Restored to Inquiry', `${child.fullName} moved back to Step 1: New Inquiries.`);
                          }}
                          className="neo-btn bg-amber-400 hover:bg-amber-300 text-slate-900 text-xs px-3 py-1.5 font-extrabold gap-1 shadow-sm cursor-pointer"
                          title="Restore to Step 1 Inquiry for screening call"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Restore to Inquiry</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateChildStage(child.id, 'waitlisted');
                            showToast('⏳ Moved to Waitlist', `${child.fullName} moved to early applicant waitlist.`);
                          }}
                          className="neo-btn bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-400 text-xs px-3 py-1.5 font-bold gap-1 cursor-pointer"
                          title="Move to Waitlist instead of withdrawn"
                        >
                          <Clock className="w-3 h-3 text-purple-700" />
                          <span>Waitlist</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t-2 border-slate-100 bg-slate-50 rounded-b-3xl flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Zero data loss: Withdrawn records remain accessible for regulatory audit tracking.
              </span>
              <button
                type="button"
                onClick={() => setShowWithdrawnDrawer(false)}
                className="neo-btn bg-slate-900 hover:bg-slate-800 text-white text-xs px-5 py-2 font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </ModalPortal>
      )}
    </div>
  );
};


export const AdmissionsPipeline = FamilyIntakePipeline;
