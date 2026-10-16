import React, { useState, useEffect } from 'react';
import { Provider, Child, ParentGuardian, AttendanceEntry, ProviderApplicant } from '../../types';
import { INITIAL_PROVIDER_APPLICANTS } from '../../data/mockData';
import { ModalPortal } from '../common/ModalPortal';
import { Avatar } from '../common/Avatar';
import { OnBrandClockPicker } from '../common/OnBrandClockPicker';
import { VariedEnrolmentTimesheetView } from './VariedEnrolmentTimesheetView';
import { ProviderTimesheetView } from './ProviderTimesheetView';
import { ProviderComplianceHub, DISTRIBUTED_DOCUMENTS } from './ProviderComplianceHub';
import { DEFAULT_CCEYA_TRAINING_MODULES } from '../../data/agencySettingsData';
import { 
  Home, 
  Users, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  LayoutDashboard,
  AlertCircle, 
  FileCheck, 
  Phone, 
  ShieldCheck, 
  Send, 
  PenTool,
  Check,
  FileSpreadsheet,
  Printer,
  Video,
  ExternalLink,
  AlertTriangle,
  LogOut,
  LogIn,
  Edit3,
  UserCheck,
  Sparkles,
  Lock,
  X,
  Baby,
  Mail,
  FileText,
  MessageSquare,
  Bell,
  ChevronRight,
  BookOpen,
  RotateCcw,
  Wifi,
  WifiOff
} from 'lucide-react';
import { isOnline, subscribeToNetworkStatus } from '../../utils/offlineSync';
import { GatedNotesModal } from '../common/notes/GatedNotesModal';
import { PhysicalBinderModal, PrintMode } from '../admin/PhysicalBinderModal';
import { ALL_INITIAL_FORMS } from '../../data/allFormsData';
import { INITIAL_HOME_VISITORS } from '../../data/mockData';
import { FormTemplate } from '../../types/formSchema';
import { HomeVisitor } from '../../types';

export function applicantToProvider(applicant: ProviderApplicant): Provider {
  const firstName = applicant.applicantName.split(' ')[0] || applicant.applicantName;
  return {
    id: applicant.id,
    name: applicant.applicantName,
    homeName: `${firstName}'s Licensed Home Care`,
    homeAddress: applicant.address || `${applicant.neighborhood}, ${applicant.city}`,
    neighborhood: applicant.neighborhood || `${applicant.city} Area`,
    region: applicant.region || 'Durham Region',
    phone: applicant.phone,
    email: applicant.email,
    maxCapacity: applicant.targetCapacity || 6,
    maxUnderThree: 3,
    maxUnderTwo: 3,
    ownChildrenUnderSix: applicant.existingChildrenCount || 0,
    ownChildrenUnderFour: 0,
    acceptsSchoolAge: true,
    enrolledChildIds: [],
    rating: 5.0,
    bio: applicant.notes || `CCEYA Licensed Home Child Care Provider candidate in ${applicant.neighborhood}. Stage: ${applicant.stage}.`,
    photoUrl: applicant.photoUrl || '/providers/fatima_al_mansoor.jpg',
    operatingHours: '7:30 AM – 5:30 PM (Mon–Fri)',
    annualComplianceStatus: applicant.stage === 'licensed_active' ? 'compliant' : 'renewal_due'
  };
}

export function getApplicantStageLabel(stage: string): string {
  switch (stage) {
    case 'applied': return 'Stage 1: Application Received';
    case 'vsc_screening': return 'Stage 2: VSC & Clearances';
    case 'home_inspection': return 'Stage 3: Form 02 Safety Audit';
    case 'contract_orientation': return 'Stage 4: Contract Signed';
    case 'licensed_active': return 'Stage 5: Licensed & Active';
    default: return stage;
  }
}

interface ProviderPortalProps {
  providersList: Provider[];
  childrenList: Child[];
  parentsList?: ParentGuardian[];
  applicantsList?: ProviderApplicant[];
  attendanceState?: Record<string, AttendanceEntry>;
  onToggleAttendance?: (
    childId: string, 
    newStatus: string, 
    checkIn?: string, 
    checkOut?: string, 
    pickedUpBy?: string, 
    netHours?: number
  ) => void;
  magicProviderId?: string | null;
  formsList?: FormTemplate[];
  visitorsList?: HomeVisitor[];
  onOpenBinderModal?: (providerId?: string, initialMode?: PrintMode) => void;
}

import { 
  calculateNetCareHours, 
  parseFlexibleTimeToMinutes, 
  normalizeTimeString, 
  formatToTimeInputValue, 
  formatToISOTimestamp 
} from '../../utils/timeUtils';

// Time parsing and duration calculation utilities (Re-exports)
const parseTimeToMinutes = parseFlexibleTimeToMinutes;

function getEffectiveCurrentTimeMinutes(mode: 'real' | '12:30' | '17:00'): number {
  if (mode === '12:30') return 750;  // 12:30 PM (750 minutes)
  if (mode === '17:00') return 1020; // 5:00 PM (1020 minutes)
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

function getCurrentTimeString(mode: 'real' | '12:30' | '17:00'): string {
  if (mode === '12:30') return '12:30 PM';
  if (mode === '17:00') return '5:00 PM';
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export const ProviderPortal: React.FC<ProviderPortalProps> = ({
  providersList,
  childrenList,
  parentsList = [],
  applicantsList,
  attendanceState: externalAttendanceState,
  onToggleAttendance,
  magicProviderId,
  formsList,
  visitorsList,
  onOpenBinderModal
}) => {
  const [cachedApplicants] = useState<ProviderApplicant[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('accs_provider_applicants');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_PROVIDER_APPLICANTS;
  });

  const applicants = applicantsList || cachedApplicants;

  const urlProviderId = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('providerId') : null;
  const initialProvTarget = magicProviderId || urlProviderId;

  const isValidProvider = Boolean(initialProvTarget && providersList.some(p => p.id === initialProvTarget));
  const isValidApplicant = Boolean(initialProvTarget && applicants.some(a => a.id === initialProvTarget));

  const validInitialId = (isValidProvider || isValidApplicant)
    ? initialProvTarget!
    : (providersList[0]?.id || (applicants[0]?.id || ''));

  const [selectedProviderId, setSelectedProviderId] = useState<string>(validInitialId);
  const [isFormZeroModalOpen, setIsFormZeroModalOpen] = useState(false);
  const [notesChild, setNotesChild] = useState<Child | null>(null);

  // PWA Tablet Offline Detection State
  const [isOnlineState, setIsOnlineState] = useState<boolean>(() => isOnline());
  useEffect(() => {
    return subscribeToNetworkStatus(setIsOnlineState);
  }, []);

  // Physical Binder Printing Modal State
  const [isBinderModalOpen, setIsBinderModalOpen] = useState(false);
  const [binderModalSection, setBinderModalSection] = useState<PrintMode>('all');
  const [binderModalChildId, setBinderModalChildId] = useState<string>('all');

  const handleOpenBinderModal = (section: PrintMode = 'all', childId: string = 'all') => {
    setBinderModalSection(section);
    setBinderModalChildId(childId);
    setIsBinderModalOpen(true);
    if (onOpenBinderModal) {
      onOpenBinderModal(selectedProviderId, section);
    }
  };

  useEffect(() => {
    if (initialProvTarget && (providersList.some(p => p.id === initialProvTarget) || applicants.some(a => a.id === initialProvTarget))) {
      setSelectedProviderId(initialProvTarget);
    }
  }, [initialProvTarget, providersList, applicants]);

  const [localAttendanceState, setLocalAttendanceState] = useState<Record<string, AttendanceEntry>>({
    'child-1': { status: 'present', checkIn: '8:15 AM' },
    'child-2': { status: 'departed', checkIn: '8:15 AM', checkOut: '4:45 PM', pickedUpBy: 'Sarah Connor (Mother)', netHours: 8.5 },
    'child-3': { status: 'present', checkIn: '8:45 AM' },
    'child-4': { status: 'absent' }
  });

  const attendanceState = externalAttendanceState || localAttendanceState;

  // Time Simulation Mode for testing 12:30 PM and 5:00 PM compliance sentinels
  const [timeSimulationMode, setTimeSimulationMode] = useState<'real' | '12:30' | '17:00'>('real');

  // Tap Out / Departure Modal State
  const [tapOutModalChild, setTapOutModalChild] = useState<Child | null>(null);
  const [tapOutForm, setTapOutForm] = useState<{
    checkIn: string;
    checkOut: string;
    pickedUpBy: string;
    customPickedUpBy: string;
    notes: string;
  }>({
    checkIn: '8:00 AM',
    checkOut: '4:45 PM',
    pickedUpBy: '',
    customPickedUpBy: '',
    notes: ''
  });
  const [activeTapOutTimeField, setActiveTapOutTimeField] = useState<'checkOut' | 'checkIn'>('checkOut');

  // Manual Time Override Modal State (for adjusting arrival or departure time directly)
  const [timeOverrideModal, setTimeOverrideModal] = useState<{
    child: Child;
    target: 'checkIn' | 'checkOut';
    currentTime: string;
  } | null>(null);
  const [overrideTimeValue, setOverrideTimeValue] = useState<string>('');

  const [timesheetSubmitted, setTimesheetSubmitted] = useState(false);
  const [providerSignature, setProviderSignature] = useState('');

  const selectedApplicant = applicants.find(a => a.id === selectedProviderId);
  const isApplicantMode = Boolean(selectedApplicant);

  const currentProvider: Provider = selectedApplicant
    ? applicantToProvider(selectedApplicant)
    : (providersList.find(p => p.id === selectedProviderId) || providersList[0] || (applicants[0] ? applicantToProvider(applicants[0]) : null as any));
  const enrolledChildren = childrenList.filter(c => c.providerId === currentProvider?.id);

  // Time & Compliance Sentinel calculations
  const effectiveMinutes = getEffectiveCurrentTimeMinutes(timeSimulationMode);
  const isPast1230PM = effectiveMinutes >= 750;
  const isPast500PM = effectiveMinutes >= 1020;

  // 12:30 PM: scheduled kids not signed in
  const missingSignInKids = enrolledChildren.filter(c => {
    const st = attendanceState[c.id]?.status;
    return !st || st === 'not_checked_in';
  });

  // 5:00 PM: kids currently signed in (present) but not tapped out
  const missingSignOutKids = enrolledChildren.filter(c => {
    const att = attendanceState[c.id];
    return att?.status === 'present' && !att.checkOut;
  });

  // Action & Compliance Alerts Tab State
  const [alertFilterTab, setAlertFilterTab] = useState<'all' | 'attendance' | 'timesheet' | 'compliance' | 'medical'>('all');

  // Provider Compliance & Training Status calculations
  const currentYear = new Date().getFullYear();
  const storageKeySignoff = `accs_prov_compliance_signoff_${currentProvider?.id}_${currentYear}`;
  const storageKeyReceipts = `accs_prov_doc_receipts_${currentProvider?.id}`;

  const [complianceAttestations, setComplianceAttestations] = useState<Record<string, boolean>>(() => {
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

  const [isSignoffSubmitted, setIsSignoffSubmitted] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && currentProvider?.id) {
      try {
        const saved = localStorage.getItem(storageKeySignoff);
        if (saved) return Boolean(JSON.parse(saved).isSubmitted);
      } catch (e) {}
    }
    return false;
  });

  const [signoffSubmittedDate, setSignoffSubmittedDate] = useState<string | null>(() => {
    if (typeof window !== 'undefined' && currentProvider?.id) {
      try {
        const saved = localStorage.getItem(storageKeySignoff);
        if (saved) return JSON.parse(saved).submittedDate || null;
      } catch (e) {}
    }
    return null;
  });

  const [docReceipts, setDocReceipts] = useState<Record<string, string>>(() => {
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

  useEffect(() => {
    if (typeof window !== 'undefined' && currentProvider?.id) {
      try {
        const savedSignoff = localStorage.getItem(storageKeySignoff);
        if (savedSignoff) {
          const parsed = JSON.parse(savedSignoff);
          setComplianceAttestations(parsed.modules || {});
          setIsSignoffSubmitted(Boolean(parsed.isSubmitted));
          setSignoffSubmittedDate(parsed.submittedDate || null);
        } else {
          setComplianceAttestations({
            'mod-anaphylaxis': true,
            'mod-safe-sleep': true,
            'mod-behaviour-guidance': false,
            'mod-serious-occurrence': false
          });
          setIsSignoffSubmitted(false);
          setSignoffSubmittedDate(null);
        }

        const savedReceipts = localStorage.getItem(storageKeyReceipts);
        if (savedReceipts) {
          setDocReceipts(JSON.parse(savedReceipts));
        } else {
          setDocReceipts({
            'doc-prov-2': '2026-10-01 10:15 AM',
            'doc-em-1': '2026-09-16 02:40 PM'
          });
        }
      } catch (e) {}
    }
  }, [currentProvider?.id, storageKeySignoff, storageKeyReceipts]);

  // Synchronized Document Receipt Handlers
  const handleAcknowledgeDoc = (docId: string, timestamp?: string) => {
    const now = timestamp || new Date().toLocaleString('en-CA', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    setDocReceipts(prev => {
      const next = { ...prev, [docId]: now };
      if (typeof window !== 'undefined' && currentProvider?.id) {
        localStorage.setItem(storageKeyReceipts, JSON.stringify(next));
      }
      return next;
    });
  };

  const handleUnacknowledgeDoc = (docId: string) => {
    setDocReceipts(prev => {
      const next = { ...prev };
      delete next[docId];
      if (typeof window !== 'undefined' && currentProvider?.id) {
        localStorage.setItem(storageKeyReceipts, JSON.stringify(next));
      }
      return next;
    });
  };

  const handleToggleComplianceModule = (modId: string) => {
    setComplianceAttestations(prev => {
      const next = { ...prev, [modId]: !prev[modId] };
      if (typeof window !== 'undefined' && currentProvider?.id) {
        try {
          const savedSignoff = localStorage.getItem(storageKeySignoff);
          const parsed = savedSignoff ? JSON.parse(savedSignoff) : {};
          localStorage.setItem(storageKeySignoff, JSON.stringify({ ...parsed, modules: next }));
        } catch (e) {}
      }
      return next;
    });
  };

  const handleComplianceSignoffSubmitted = (dateStr: string, name?: string) => {
    setIsSignoffSubmitted(true);
    setSignoffSubmittedDate(dateStr);
    if (typeof window !== 'undefined' && currentProvider?.id) {
      try {
        const savedSignoff = localStorage.getItem(storageKeySignoff);
        const parsed = savedSignoff ? JSON.parse(savedSignoff) : {};
        localStorage.setItem(storageKeySignoff, JSON.stringify({
          ...parsed,
          isSubmitted: true,
          submittedDate: dateStr,
          signatureName: name || currentProvider?.name
        }));
      } catch (e) {}
    }
  };

  const completedTrainingModulesCount = DEFAULT_CCEYA_TRAINING_MODULES.filter(m => complianceAttestations[m.id]).length;
  const totalTrainingModulesCount = DEFAULT_CCEYA_TRAINING_MODULES.length;
  const pendingTrainingModulesCount = isSignoffSubmitted 
    ? 0 
    : (totalTrainingModulesCount - completedTrainingModulesCount);

  const unacknowledgedDocs = DISTRIBUTED_DOCUMENTS.filter(d => !docReceipts[d.id]);
  const subsidizedAbsenceWarnings = enrolledChildren.filter(c => (c.subsidizedAbsenceDaysUsed || 0) >= Math.max(1, (c.subsidizedAbsenceQuota ?? 30) - 5));

  const attendanceAlertsCount = (isPast1230PM && missingSignInKids.length > 0 ? 1 : 0) +
    (isPast500PM && missingSignOutKids.length > 0 ? 1 : 0) +
    subsidizedAbsenceWarnings.length;

  const timesheetAlertsCount = timesheetSubmitted ? 0 : 1;

  // Compliance Action Count: pending unreviewed training modules + unacknowledged documents + annual renewal status
  const complianceAlertsCount = pendingTrainingModulesCount + unacknowledgedDocs.length + 
    (currentProvider?.annualComplianceStatus === 'renewal_due' && !isSignoffSubmitted ? 1 : 0);

  const medicalAlertsCount = enrolledChildren.filter(c => c.allergies.length > 0 || c.epiPenRequired).length;

  const totalActionAlertsCount = attendanceAlertsCount + timesheetAlertsCount + complianceAlertsCount + medicalAlertsCount;

  // Physical Binder Completed State (Persisted per Provider)
  const [isBinderCompleted, setIsBinderCompleted] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && currentProvider?.id) {
      return localStorage.getItem(`accs_provider_binder_completed_${currentProvider.id}`) === 'true';
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && currentProvider?.id) {
      const saved = localStorage.getItem(`accs_provider_binder_completed_${currentProvider.id}`);
      setIsBinderCompleted(saved === 'true');
    }
  }, [currentProvider?.id]);

  const handleToggleBinderCompleted = () => {
    const next = !isBinderCompleted;
    setIsBinderCompleted(next);
    if (typeof window !== 'undefined' && currentProvider?.id) {
      localStorage.setItem(`accs_provider_binder_completed_${currentProvider.id}`, String(next));
    }
  };

  // Tab Notification Counts (Number in Circle)
  const attendanceTabCount = attendanceAlertsCount > 0 ? attendanceAlertsCount : (missingSignOutKids.length > 0 ? missingSignOutKids.length : 1);
  const variedTimesheetTabCount = timesheetAlertsCount > 0 ? timesheetAlertsCount : 1;
  const monthlyTimesheetTabCount = timesheetAlertsCount > 0 ? timesheetAlertsCount : 1;
  const complianceTabCount = complianceAlertsCount;

  const handleToggleAttendance = (
    childId: string, 
    newStatus: string, 
    checkIn?: string, 
    checkOut?: string, 
    pickedUpBy?: string, 
    netHours?: number
  ) => {
    if (onToggleAttendance) {
      onToggleAttendance(childId, newStatus, checkIn, checkOut, pickedUpBy, netHours);
    } else {
      const nowStr = getCurrentTimeString(timeSimulationMode);
      setLocalAttendanceState(prev => {
        const existing = prev[childId] || { status: 'not_checked_in' };
        const resolvedCheckIn = checkIn !== undefined 
          ? checkIn 
          : (newStatus === 'present' ? (existing.checkIn || nowStr) : existing.checkIn);
        const resolvedCheckOut = checkOut !== undefined
          ? checkOut
          : (newStatus === 'departed' ? (existing.checkOut || nowStr) : (newStatus === 'present' ? undefined : existing.checkOut));
        const resolvedPickup = pickedUpBy !== undefined ? pickedUpBy : existing.pickedUpBy;
        const resolvedNetHours = netHours !== undefined ? netHours : existing.netHours;

        return {
          ...prev,
          [childId]: {
            ...existing,
            status: newStatus,
            checkIn: resolvedCheckIn,
            checkOut: resolvedCheckOut,
            pickedUpBy: resolvedPickup,
            netHours: resolvedNetHours
          }
        };
      });
    }
  };

  // 1-Tap Arrival (Tap In)
  const handleTapIn = (childId: string) => {
    const nowStr = getCurrentTimeString(timeSimulationMode);
    handleToggleAttendance(childId, 'present', nowStr, undefined, undefined, undefined);
  };

  // Mark status (Absent, Sick, etc.)
  const handleMarkStatus = (childId: string, status: string) => {
    handleToggleAttendance(childId, status, undefined, undefined, undefined, undefined);
  };

  // Open Tap Out Modal
  const handleOpenTapOut = (child: Child) => {
    const att = attendanceState[child.id];
    const currentIn = att?.checkIn || '8:00 AM';
    const defaultOut = getCurrentTimeString(timeSimulationMode);
    
    // Find parent record to extract primary and secondary guardian names
    const parent = parentsList.find(p => p.id === child.parentId);
    const primaryGuardian = parent?.fullName || 'Primary Parent / Guardian';
    
    setTapOutForm({
      checkIn: currentIn,
      checkOut: defaultOut,
      pickedUpBy: primaryGuardian,
      customPickedUpBy: '',
      notes: ''
    });
    setActiveTapOutTimeField('checkOut');
    setTapOutModalChild(child);
  };

  // Confirm Tap Out (Departure)
  const handleConfirmTapOut = () => {
    if (!tapOutModalChild) return;
    const resolvedPickup = tapOutForm.pickedUpBy === '__custom__'
      ? (tapOutForm.customPickedUpBy.trim() || 'Authorized Delegate')
      : tapOutForm.pickedUpBy;

    const normalizedIn = normalizeTimeString(tapOutForm.checkIn) || tapOutForm.checkIn.trim();
    const normalizedOut = normalizeTimeString(tapOutForm.checkOut) || tapOutForm.checkOut.trim();
    const netHours = calculateNetCareHours(tapOutForm.checkIn, tapOutForm.checkOut);

    handleToggleAttendance(
      tapOutModalChild.id,
      'departed',
      normalizedIn,
      normalizedOut,
      resolvedPickup,
      netHours
    );
    setTapOutModalChild(null);
  };

  // Re-open Check-In (if child was tapped out prematurely)
  const handleReopenCheckIn = (childId: string) => {
    const att = attendanceState[childId];
    handleToggleAttendance(childId, 'present', att?.checkIn || '8:00 AM', undefined, undefined, undefined);
  };

  // Open Time Override Modal
  const handleOpenTimeOverride = (child: Child, target: 'checkIn' | 'checkOut') => {
    const att = attendanceState[child.id];
    const cur = target === 'checkIn' ? (att?.checkIn || '8:00 AM') : (att?.checkOut || '4:45 PM');
    setTimeOverrideModal({ child, target, currentTime: cur });
    setOverrideTimeValue(cur);
  };

  // Save Time Override
  const handleSaveTimeOverride = () => {
    if (!timeOverrideModal || !overrideTimeValue.trim()) return;
    const { child, target } = timeOverrideModal;
    const att = attendanceState[child.id] || { status: 'present' };

    const normalizedOverride = normalizeTimeString(overrideTimeValue) || overrideTimeValue.trim();

    const newIn = target === 'checkIn' ? normalizedOverride : att.checkIn;
    const newOut = target === 'checkOut' ? normalizedOverride : att.checkOut;
    const newNetHours = (newIn && newOut) ? calculateNetCareHours(newIn, newOut) : att.netHours;

    handleToggleAttendance(
      child.id,
      att.status || 'present',
      newIn,
      newOut,
      att.pickedUpBy,
      newNetHours
    );
    setTimeOverrideModal(null);
  };

  const handleTimesheetSubmit = () => {
    if (!providerSignature.trim()) return;
    setTimesheetSubmitted(true);
  };

  const [activeSubView, setActiveSubView] = useState<'attendance' | 'varied_timesheet' | 'monthly_timesheet' | 'compliance'>('attendance');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Provider Header & Home Daycare Selector */}
      <div className="no-print print:hidden bg-white p-5 rounded-2xl border-2 border-slate-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-neo-sm">
        <div className="flex items-center gap-4">
          <Avatar
            name={currentProvider.name}
            photoUrl={currentProvider.photoUrl}
            size="xl"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                isApplicantMode
                  ? 'bg-purple-100 text-purple-900 border-purple-300'
                  : 'bg-amber-100 text-amber-900 border-amber-300'
              }`}>
                {isApplicantMode ? 'Candidate Onboarding Hub' : 'Provider Hub'}
              </span>
              <h1 className="text-xl font-extrabold text-slate-900">{currentProvider.name}</h1>
            </div>
            <p className="text-xs font-semibold text-orange-600 mt-0.5">{currentProvider.homeName}</p>
            <p className="text-[11px] text-slate-500">{currentProvider.homeAddress}, {currentProvider.neighborhood} ({currentProvider.region})</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* PWA Tablet Offline Indicator */}
          {!isOnlineState && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border-2 border-amber-600 rounded-xl text-amber-950 text-xs font-black shadow-neo-sm">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <WifiOff className="w-3.5 h-3.5 text-rose-600" />
              <span>Offline Mode (Tablet Local)</span>
            </div>
          )}

          {/* Print On-Site Binder CTA */}
          <button
            type="button"
            onClick={() => handleOpenBinderModal('all')}
            className={`neo-btn text-xs px-3.5 py-2 font-black flex items-center gap-1.5 shadow-neo-sm cursor-pointer shrink-0 transition-all ${
              isBinderCompleted 
                ? 'bg-emerald-700 hover:bg-emerald-600 text-white' 
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
            title="Print official on-site Ministry compliance binder, backpack cards, and rosters for this home"
          >
            {isBinderCompleted ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
            ) : (
              <Printer className="w-3.5 h-3.5 text-orange-400" />
            )}
            <span>{isBinderCompleted ? 'Binder Printed & Ready' : 'Print On-Site Binder'}</span>
          </button>

          {/* Switch Active Provider Profile for Demo */}
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-300 text-xs">
            <span className="font-bold text-slate-600">Simulate Home:</span>
            <select
              value={selectedProviderId}
              onChange={(e) => {
                setSelectedProviderId(e.target.value);
                setTimesheetSubmitted(false);
              }}
              className="bg-white border-2 border-slate-900 rounded-lg p-1 font-bold text-slate-900 focus:outline-none"
            >
              <optgroup label="Active Licensed Providers">
                {providersList.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.neighborhood})</option>
                ))}
              </optgroup>
              {applicants.length > 0 && (
                <optgroup label="Onboarding Candidates & Applicants">
                  {applicants.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.applicantName} ({a.neighborhood} • {getApplicantStageLabel(a.stage)})
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Onboarding Candidate Status Banner (Visible when viewing candidate profile) */}
      {isApplicantMode && selectedApplicant && (
        <div className="no-print print:hidden bg-purple-50 border-2 border-slate-900 rounded-3xl p-5 sm:p-6 shadow-neo-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-purple-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-800 bg-purple-100 border border-purple-300 px-2.5 py-0.5 rounded-full">
                  CCEYA Provider Onboarding Candidate
                </span>
                <span className="text-xs font-bold text-slate-500 font-mono">
                  Ref: {selectedApplicant.id}
                </span>
              </div>
              <h2 className="text-lg font-black text-slate-900 mt-1">
                {getApplicantStageLabel(selectedApplicant.stage)}
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                Welcome, {selectedApplicant.applicantName}! As the Agency Director conducts your consultations and CCEYA safety audit, your licensed capacity of up to {selectedApplicant.targetCapacity || 6} children will be activated here for daily attendance and guaranteed $35/day CWELCC timesheet submissions.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsFormZeroModalOpen(true)}
                className="neo-btn bg-white hover:bg-purple-100 text-purple-950 border-2 border-slate-900 px-3.5 py-1.5 text-xs font-bold gap-1.5 shadow-neo-sm cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-purple-700" />
                <span>View Form PROV-0</span>
              </button>

              <a
                href="tel:5555555555"
                className="neo-btn bg-purple-700 hover:bg-purple-800 text-white border-2 border-slate-900 px-3.5 py-1.5 text-xs font-bold gap-1.5 shadow-neo-sm cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call the Agency</span>
              </a>
            </div>
          </div>

          {/* 5-Step Visual Stepper */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            {[
              { num: 1, label: 'Form 01 Intake', stageKey: 'applied' },
              { num: 2, label: '18+ VSC & Medicals', stageKey: 'vsc_screening' },
              { num: 3, label: 'Form 02 Inspection', stageKey: 'home_inspection' },
              { num: 4, label: 'Form 04 Contract', stageKey: 'contract_orientation' },
              { num: 5, label: 'Licensed Active', stageKey: 'licensed_active' }
            ].map(step => {
              const stageOrder = ['applied', 'vsc_screening', 'home_inspection', 'contract_orientation', 'licensed_active'];
              const currentIdx = stageOrder.indexOf(selectedApplicant.stage);
              const stepIdx = stageOrder.indexOf(step.stageKey);
              const isDone = stepIdx < currentIdx || (stepIdx === 4 && selectedApplicant.stage === 'licensed_active');
              const isCurrent = step.stageKey === selectedApplicant.stage;

              return (
                <div
                  key={step.num}
                  className={`p-2.5 rounded-xl border-2 transition-all ${
                    isCurrent
                      ? 'bg-purple-700 text-white border-slate-900 shadow-sm'
                      : isDone
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-950 font-bold'
                      : 'bg-white border-slate-200 text-slate-400 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    ) : (
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                        isCurrent ? 'bg-white text-purple-900' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {step.num}
                      </span>
                    )}
                    <span className="text-[11px] font-bold truncate">{step.label}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Compliance Checklist Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-[11px]">
            <div className="p-2.5 bg-white border border-purple-200 rounded-xl space-y-0.5">
              <span className="text-[10px] font-black uppercase text-purple-700">Adults 18+ VSC</span>
              <p className={`font-bold ${selectedApplicant.householdAdultsVscComplete ? 'text-emerald-700' : 'text-amber-700'}`}>
                {selectedApplicant.householdAdultsVscComplete ? '✓ Cleared (All Adults)' : 'Pending VSC Check'}
              </p>
              <p className="text-[10px] text-slate-500">{selectedApplicant.householdAdultsCount} adults in home</p>
            </div>

            <div className="p-2.5 bg-white border border-purple-200 rounded-xl space-y-0.5">
              <span className="text-[10px] font-black uppercase text-purple-700">Medical Clearance</span>
              <p className={`font-bold ${selectedApplicant.medicalClearanceReceived ? 'text-emerald-700' : 'text-amber-700'}`}>
                {selectedApplicant.medicalClearanceReceived ? '✓ Medical Form Verified' : 'Awaiting Physician Form'}
              </p>
              <p className="text-[10px] text-slate-500">Immunization record</p>
            </div>

            <div className="p-2.5 bg-white border border-purple-200 rounded-xl space-y-0.5">
              <span className="text-[10px] font-black uppercase text-purple-700">First Aid & CPR</span>
              <p className={`font-bold ${selectedApplicant.firstAidCprLevelCVerified ? 'text-emerald-700' : 'text-amber-700'}`}>
                {selectedApplicant.firstAidCprLevelCVerified ? '✓ Level C Current' : 'Pending Verification'}
              </p>
              <p className="text-[10px] text-slate-500">Standard First Aid</p>
            </div>

            <div className="p-2.5 bg-white border border-purple-200 rounded-xl space-y-0.5">
              <span className="text-[10px] font-black uppercase text-purple-700">Form 02 Safety Audit</span>
              <p className={`font-bold ${selectedApplicant.homeInspectionPassed ? 'text-emerald-700' : 'text-amber-700'}`}>
                {selectedApplicant.homeInspectionPassed ? '✓ CCEYA Inspection Passed' : 'Pending RECE Audit'}
              </p>
              <p className="text-[10px] text-slate-500">{selectedApplicant.residenceType} ({selectedApplicant.ownsHome ? 'Owned' : 'Leased'})</p>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Navigation Switcher (Daily Attendance vs 5-Week Timesheet vs 31-Day Timesheet vs Annual Compliance) */}
      <div className="no-print grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 bg-slate-100 p-1.5 rounded-2xl border-2 border-slate-900 shadow-neo-sm">
        {/* Tab 1: Dashboard & Attendance */}
        <button
          onClick={() => setActiveSubView('attendance')}
          className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer group ${
            activeSubView === 'attendance'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-700 hover:bg-slate-200'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 text-orange-400 shrink-0" />
          <span className="text-center">Dashboard & Attendance</span>
          <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black font-mono shrink-0 shadow-2xs ${
            activeSubView === 'attendance'
              ? 'bg-orange-500 text-white'
              : 'bg-rose-500 text-white'
          }`}>
            {attendanceTabCount}
          </span>
        </button>

        {/* Tab 2: 5-Week Varied Enrolment Timesheet */}
        <button
          onClick={() => setActiveSubView('varied_timesheet')}
          className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer group ${
            activeSubView === 'varied_timesheet'
              ? 'bg-amber-400 text-slate-950 shadow-2xs'
              : 'text-slate-700 hover:bg-slate-200'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-slate-900 shrink-0" />
          <span className="text-center">5-Week Varied Enrolment Timesheet</span>
          <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black font-mono shrink-0 shadow-2xs ${
            activeSubView === 'varied_timesheet'
              ? 'bg-slate-900 text-white'
              : 'bg-amber-200 text-amber-950 border border-amber-400'
          }`}>
            {variedTimesheetTabCount}
          </span>
        </button>

        {/* Tab 3: 31-Day Attendance Sheet (Printable) */}
        <button
          onClick={() => setActiveSubView('monthly_timesheet')}
          className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer group ${
            activeSubView === 'monthly_timesheet'
              ? 'bg-emerald-600 text-white shadow-2xs'
              : 'text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Printer className="w-4 h-4 text-white shrink-0" />
          <span className="text-center">31-Day Attendance Sheet (Printable)</span>
          <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black font-mono shrink-0 shadow-2xs ${
            activeSubView === 'monthly_timesheet'
              ? 'bg-white text-emerald-900'
              : 'bg-emerald-100 text-emerald-950 border border-emerald-400'
          }`}>
            {monthlyTimesheetTabCount}
          </span>
        </button>

        {/* Tab 4: Annual Compliance & Documents */}
        <button
          onClick={() => setActiveSubView('compliance')}
          className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer group ${
            activeSubView === 'compliance'
              ? 'bg-purple-700 text-white shadow-2xs'
              : 'text-slate-700 hover:bg-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0" />
          <span className="text-center">Annual Compliance & Documents</span>
          <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black font-mono shrink-0 shadow-2xs ${
            activeSubView === 'compliance'
              ? 'bg-amber-300 text-purple-950'
              : complianceTabCount > 0
              ? 'bg-purple-100 text-purple-950 border border-purple-300'
              : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
          }`}>
            {complianceTabCount > 0 ? complianceTabCount : '✓'}
          </span>
        </button>
      </div>

      {/* Conditional Sub-View Rendering */}
      {activeSubView === 'varied_timesheet' && (
        <VariedEnrolmentTimesheetView
          provider={currentProvider}
          childrenList={childrenList}
          attendanceState={attendanceState}
          onClose={() => setActiveSubView('attendance')}
        />
      )}

      {activeSubView === 'monthly_timesheet' && (
        <ProviderTimesheetView
          provider={currentProvider}
          childrenList={childrenList}
          attendanceState={attendanceState}
          onClose={() => setActiveSubView('attendance')}
        />
      )}

      {activeSubView === 'compliance' && (
        <ProviderComplianceHub
          provider={currentProvider}
          docReceipts={docReceipts}
          onAcknowledgeDoc={handleAcknowledgeDoc}
          onUnacknowledgeDoc={handleUnacknowledgeDoc}
          complianceAttestations={complianceAttestations}
          onToggleModule={handleToggleComplianceModule}
          isSignoffSubmitted={isSignoffSubmitted}
          submittedDate={signoffSubmittedDate}
          onSignoffSubmitted={handleComplianceSignoffSubmitted}
        />
      )}

      {activeSubView === 'attendance' && (
        <>
          {/* Daily Attendance & Critical Medical Roster */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Daily Attendance Logging (2 Cols) */}
            <div className="lg:col-span-2 bg-white rounded-2xl border-2 border-slate-900 p-5 space-y-4 shadow-neo-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b-2 border-slate-100 gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <LayoutDashboard className="w-5 h-5 text-orange-500" />
                    <span>Dashboard & Attendance</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    CCEYA 2-Tap Workflow: Arrival timestamps, departure timestamps, and authorized custody verification.
                  </p>
                </div>

                {/* Date & Interactive Time Simulation Tester Bar */}
                <div className="flex flex-col items-end gap-1.5">
                  <span className="text-xs font-mono font-bold bg-slate-100 px-3 py-1 rounded-xl border border-slate-300">
                    {new Date().toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>

                  {/* Simulation Pill Controls */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-300 text-[10px] font-bold">
                    <span className="text-slate-500 px-1">Sentinel Test:</span>
                    <button
                      type="button"
                      onClick={() => setTimeSimulationMode('real')}
                      className={`px-2 py-0.5 rounded-lg transition-all ${
                        timeSimulationMode === 'real'
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Real Time
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimeSimulationMode('12:30')}
                      className={`px-2 py-0.5 rounded-lg transition-all ${
                        timeSimulationMode === '12:30'
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      12:30 PM Check
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimeSimulationMode('17:00')}
                      className={`px-2 py-0.5 rounded-lg transition-all ${
                        timeSimulationMode === '17:00'
                          ? 'bg-orange-500 text-white font-black'
                          : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      5:00 PM Check
                    </button>
                  </div>
                </div>
              </div>

              {/* 12:30 PM Missing Morning Sign-In Alert Banner */}
              {isPast1230PM && missingSignInKids.length > 0 && (
                <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-neo-sm">
                  <div className="flex items-start gap-2.5 text-amber-950 font-bold">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-extrabold text-amber-900 text-xs">
                        12:30 PM Attendance Sentinel: {missingSignInKids.length} Scheduled Child{missingSignInKids.length > 1 ? 'ren' : ''} Missing Sign-In
                      </p>
                      <p className="text-[11px] font-normal text-amber-800 mt-0.5">
                        Under Ontario CCEYA s. 8 & agency liability rules, physical child whereabouts must be verified by 12:30 PM. Please record arrival or mark absent:
                        <span className="font-bold ml-1">({missingSignInKids.map(c => c.fullName).join(', ')})</span>.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    {missingSignInKids.slice(0, 3).map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleTapIn(c.id)}
                        className="neo-btn bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 text-[10px] font-extrabold cursor-pointer"
                      >
                        Tap In {c.fullName.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 5:00 PM Missing Evening Sign-Out Alert Banner */}
              {isPast500PM && missingSignOutKids.length > 0 && (
                <div className="bg-orange-50 border-2 border-orange-400 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-neo-sm">
                  <div className="flex items-start gap-2.5 text-orange-950 font-bold">
                    <Clock className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-extrabold text-orange-900 text-xs">
                        5:00 PM Departure Sentinel: {missingSignOutKids.length} Child{missingSignOutKids.length > 1 ? 'ren' : ''} Still Signed In
                      </p>
                      <p className="text-[11px] font-normal text-orange-800 mt-0.5">
                        Closing inspection required: Tap out departing children and record the authorized adult collecting each child for emergency liability custody:
                        <span className="font-bold ml-1">({missingSignOutKids.map(c => c.fullName).join(', ')})</span>.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    {missingSignOutKids.slice(0, 3).map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleOpenTapOut(c)}
                        className="neo-btn bg-orange-600 hover:bg-orange-500 text-white px-2.5 py-1 text-[10px] font-extrabold cursor-pointer"
                      >
                        Tap Out {c.fullName.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 2-Tap Child Attendance Cards */}
              <div className="space-y-3">
                {enrolledChildren.map(child => {
                  const currentAttendance = attendanceState[child.id] || { status: 'not_checked_in' };
                  const status = currentAttendance.status || 'not_checked_in';
                  const isPresent = status === 'present';
                  const isDeparted = status === 'departed';
                  const isAbsent = status === 'absent';
                  const isSick = status === 'sick';
                  const isNotCheckedIn = status === 'not_checked_in';

                  return (
                    <div
                      key={child.id}
                      className={`p-4 rounded-2xl border-2 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                        isPresent 
                          ? 'bg-emerald-50/60 border-emerald-500 shadow-sm' 
                          : isDeparted
                          ? 'bg-slate-50 border-slate-400'
                          : isAbsent || isSick
                          ? 'bg-amber-50/40 border-amber-300'
                          : 'bg-white border-slate-900 shadow-neo-sm'
                      }`}
                    >
                      {/* Left: Child Details & Custody Info */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Avatar
                          name={child.fullName}
                          photoUrl={child.photoUrl}
                          shape="circle"
                          size="md"
                        />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-slate-900">{child.fullName}</h4>
                            <button
                              type="button"
                              onClick={() => setNotesChild(child)}
                              className="text-[10px] bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold px-2 py-0.5 rounded-full border border-blue-300 flex items-center gap-1 cursor-pointer transition-colors"
                              title={`View & add notes for ${child.fullName}`}
                            >
                              <MessageSquare className="w-2.5 h-2.5 text-blue-700" />
                              <span>Notes</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenBinderModal('emergency_cards', child.id)}
                              className="text-[10px] bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold px-2 py-0.5 rounded-full border border-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
                              title={`Print Emergency Outing Backpack Wallet Card for ${child.fullName}`}
                            >
                              <Printer className="w-2.5 h-2.5 text-amber-700" />
                              <span>Wallet Card</span>
                            </button>
                            {isPresent && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-900 font-extrabold px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                In Care
                              </span>
                            )}
                            {isDeparted && (
                              <span className="text-[10px] bg-slate-200 text-slate-800 font-bold px-2 py-0.5 rounded-full border border-slate-300">
                                Departed
                              </span>
                            )}
                            {isAbsent && (
                              <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-full border border-red-300">
                                Absent
                              </span>
                            )}
                            {isSick && (
                              <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full border border-amber-300">
                                Sick
                              </span>
                            )}
                            {isNotCheckedIn && (
                              <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full border border-slate-300">
                                Not Checked In
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <p className="text-[11px] text-slate-500">
                              Age: {child.ageYearsFormatted} • {child.fundingType.toUpperCase()}
                            </p>
                            {child.fundingType === 'subsidy' && (() => {
                              const quota = child.subsidizedAbsenceQuota ?? 30;
                              const used = child.subsidizedAbsenceDaysUsed ?? 0;
                              const remaining = Math.max(0, quota - used);
                              const warnThreshold = Math.max(1, quota - 5);
                              return (
                                <span
                                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                    used >= quota
                                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                                      : used >= warnThreshold
                                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                                      : 'bg-purple-100 text-purple-800 border-purple-200'
                                  }`}
                                  title={`Annual Subsidized Absence Allowance: Maximum ${quota} days per calendar year under municipal subsidy contract`}
                                >
                                  Subsidized: {used}/{quota} Absences ({remaining} Left)
                                </span>
                              );
                            })()}
                          </div>

                          {/* Live Timestamps & Custody Pick-Up Badges */}
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
                            {isPresent && (
                              <div className="flex items-center gap-1.5 bg-emerald-100/70 text-emerald-950 font-semibold px-2 py-0.5 rounded-lg border border-emerald-300">
                                <Clock className="w-3 h-3 text-emerald-700" />
                                <span>Arrived: {currentAttendance.checkIn || '8:00 AM'}</span>
                                <button
                                  type="button"
                                  onClick={() => handleOpenTimeOverride(child, 'checkIn')}
                                  title="Adjust arrival timestamp"
                                  className="text-emerald-700 hover:text-emerald-900 ml-1 p-0.5 rounded hover:bg-emerald-200/50"
                                >
                                  <Edit3 className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            )}

                            {isDeparted && (
                              <>
                                <div className="flex items-center gap-1.5 bg-slate-200/80 text-slate-900 font-semibold px-2 py-0.5 rounded-lg border border-slate-300">
                                  <Clock className="w-3 h-3 text-slate-600" />
                                  <span>In: {currentAttendance.checkIn || '8:00 AM'} • Out: {currentAttendance.checkOut || '4:45 PM'}</span>
                                  {currentAttendance.netHours && (
                                    <span className="bg-slate-300 text-slate-900 text-[10px] font-bold px-1.5 py-0.2 rounded font-mono">
                                      {currentAttendance.netHours} hrs
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleOpenTapOut(child)}
                                    title="Edit departure details"
                                    className="text-slate-600 hover:text-slate-900 ml-1 p-0.5 rounded hover:bg-slate-300"
                                  >
                                    <Edit3 className="w-2.5 h-2.5" />
                                  </button>
                                </div>

                                {currentAttendance.pickedUpBy && (
                                  <div className="flex items-center gap-1 bg-amber-100/70 text-amber-950 text-[10px] font-semibold px-2 py-0.5 rounded-lg border border-amber-300">
                                    <UserCheck className="w-3 h-3 text-amber-700" />
                                    <span>Picked up by: <strong className="font-bold">{currentAttendance.pickedUpBy}</strong></span>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: 2-Tap Action Buttons */}
                      <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                        {/* CASE 1: Not Checked In */}
                        {isNotCheckedIn && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleTapIn(child.id)}
                              className="neo-btn bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 text-xs font-black gap-1.5 shadow-neo-sm cursor-pointer whitespace-nowrap"
                            >
                              <LogIn className="w-3.5 h-3.5" />
                              <span>Tap In (Arrival)</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleMarkStatus(child.id, 'absent')}
                              className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 cursor-pointer whitespace-nowrap"
                            >
                              Absent
                            </button>

                            <button
                              type="button"
                              onClick={() => handleMarkStatus(child.id, 'sick')}
                              className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 cursor-pointer whitespace-nowrap"
                            >
                              Sick
                            </button>
                          </>
                        )}

                        {/* CASE 2: Currently In Care (Present) */}
                        {isPresent && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenTapOut(child)}
                              className="neo-btn bg-orange-600 hover:bg-orange-500 text-white px-3.5 py-1.5 text-xs font-black gap-1.5 shadow-neo-sm cursor-pointer whitespace-nowrap"
                            >
                              <LogOut className="w-3.5 h-3.5" />
                              <span>Tap Out (Departure)</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleMarkStatus(child.id, 'absent')}
                              className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-300 cursor-pointer whitespace-nowrap transition-colors"
                            >
                              Change to Absent
                            </button>
                          </>
                        )}

                        {/* CASE 3: Departed */}
                        {isDeparted && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenTapOut(child)}
                              className="neo-btn bg-white hover:bg-slate-100 text-slate-800 px-3 py-1.5 text-xs font-black gap-1.5 border-2 border-slate-900 shadow-2xs cursor-pointer whitespace-nowrap transition-all active:scale-95"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                              <span>Edit Departure</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleReopenCheckIn(child.id)}
                              className="neo-btn bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-2 border-emerald-600/40 px-2.5 py-1.5 text-xs font-black gap-1.5 cursor-pointer whitespace-nowrap transition-all active:scale-95 shadow-2xs"
                              title="Reopen care if child has not actually departed"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Re-open Care</span>
                            </button>
                          </>
                        )}

                        {/* CASE 4: Absent or Sick */}
                        {(isAbsent || isSick) && (
                          <button
                            type="button"
                            onClick={() => handleTapIn(child.id)}
                            className="neo-btn bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 text-xs font-bold gap-1 shadow-neo-sm"
                          >
                            <LogIn className="w-3 h-3 text-orange-400" />
                            <span>Arrived Late (Tap In)</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {enrolledChildren.length === 0 && (
                  <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 space-y-2">
                    <Baby className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">
                      {isApplicantMode ? 'No Enrolled Children Yet (Onboarding in Progress)' : 'No Children Currently Assigned to This Home'}
                    </p>
                    <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                      {isApplicantMode
                        ? `Once CCEYA licensing and Form 04 contract are finalized with the Agency Director, your licensed capacity of up to ${selectedApplicant?.targetCapacity || 6} children will be assigned here.`
                        : 'Children matched through the Admissions Pipeline will appear here for daily check-in.'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action & Compliance Alerts Hub (1 Col) */}
            <div className="bg-white rounded-2xl border-2 border-slate-900 p-5 space-y-4 shadow-neo-sm flex flex-col">
              <div className="pb-3 border-b-2 border-slate-100">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-orange-600" />
                    <span>Action & Compliance Alerts</span>
                  </h3>
                  {totalActionAlertsCount > 0 ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-100 text-rose-900 border border-rose-300 flex items-center gap-1 shadow-2xs">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      <span>{totalActionAlertsCount} Action{totalActionAlertsCount !== 1 ? 's' : ''}</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>All Clear</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Attendance sentinels, monthly timesheets, CCEYA annual compliance, and child medical alerts.
                </p>

                {/* Category Filter Pills */}
                <div className="flex items-center gap-1 overflow-x-auto pt-3 pb-1 text-xs no-scrollbar">
                  {[
                    { id: 'all', label: 'All', count: totalActionAlertsCount, isUrgent: totalActionAlertsCount > 0 },
                    { id: 'attendance', label: 'Attendance', count: attendanceAlertsCount, isUrgent: (isPast1230PM && missingSignInKids.length > 0) || (isPast500PM && missingSignOutKids.length > 0) },
                    { id: 'timesheet', label: 'Timesheets', count: timesheetAlertsCount, isUrgent: !timesheetSubmitted },
                    { id: 'compliance', label: 'Compliance', count: complianceAlertsCount, isUrgent: complianceAlertsCount > 0 },
                    { id: 'medical', label: 'Medical', count: medicalAlertsCount, isUrgent: medicalAlertsCount > 0 }
                  ].map(tab => {
                    const isActive = alertFilterTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setAlertFilterTab(tab.id as any)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                          isActive
                            ? 'bg-slate-900 text-white shadow-2xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                        }`}
                      >
                        <span>{tab.label}</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                          isActive
                            ? 'bg-slate-800 text-white'
                            : tab.isUrgent && tab.count > 0
                            ? 'bg-rose-100 text-rose-900 border border-rose-300'
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {tab.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Alert Content List */}
              <div className="space-y-3.5 max-h-[720px] overflow-y-auto pr-1">
                {/* 🖨️ Quick-Print On-Site Binder Forms Toolbar Card */}
                <div className={`p-3.5 rounded-2xl border-2 transition-all space-y-2.5 shadow-2xs ${
                  isBinderCompleted 
                    ? 'bg-emerald-50/70 border-emerald-600' 
                    : 'bg-gradient-to-br from-amber-50 to-orange-50 border-slate-900'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded flex items-center gap-1 font-bold ${
                      isBinderCompleted
                        ? 'bg-emerald-200 text-emerald-950 border border-emerald-400'
                        : 'bg-orange-200 text-orange-950 border border-orange-300'
                    }`}>
                      {isBinderCompleted ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                          <span>Physical Binder Complete</span>
                        </>
                      ) : (
                        <>
                          <Printer className="w-3 h-3 text-orange-700" />
                          <span>Physical Binder Print Hub</span>
                        </>
                      )}
                    </span>
                    <span className={`text-[10px] font-bold ${isBinderCompleted ? 'text-emerald-700 font-extrabold' : 'text-slate-500'}`}>
                      {isBinderCompleted ? '✓ Verified On-Site' : 'Ministry Ready'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-700 font-medium">
                    {isBinderCompleted
                      ? '✓ Physical binder forms, emergency wallet cards, and monthly attendance sheets are printed and prepared in your home binder.'
                      : 'Print official CCEYA compliance documents & emergency cards for your physical home binder:'}
                  </p>

                  <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => handleOpenBinderModal('emergency_cards')}
                      className="p-2 bg-white hover:bg-orange-100/60 text-slate-900 border-2 border-slate-900 rounded-xl text-[11px] font-extrabold flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                      title="Print emergency wallet cards for all enrolled children"
                    >
                      <Baby className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                      <span>Wallet Cards</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSubView('monthly_timesheet')}
                      className="p-2 bg-white hover:bg-orange-100/60 text-slate-900 border-2 border-slate-900 rounded-xl text-[11px] font-extrabold flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                      title="Open and print 31-Day Attendance Sheet"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>31-Day Sheet</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenBinderModal('cover_sheet')}
                      className="p-2 bg-white hover:bg-orange-100/60 text-slate-900 border-2 border-slate-900 rounded-xl text-[11px] font-extrabold flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                      title="Print Official Ministry Inspection Cover Sheet"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>Binder Cover</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenBinderModal('all')}
                      className="p-2 bg-slate-900 hover:bg-slate-800 text-white border-2 border-slate-900 rounded-xl text-[11px] font-extrabold flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                      title="Print Full On-Site Physical Binder"
                    >
                      <Printer className="w-3.5 h-3.5 text-white shrink-0" />
                      <span>Full Binder</span>
                    </button>
                  </div>

                  {/* 1-Click Mark Complete Toggle */}
                  <div className="pt-1.5 border-t border-slate-200/80">
                    <button
                      type="button"
                      onClick={handleToggleBinderCompleted}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-2xs border-2 ${
                        isBinderCompleted
                          ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border-emerald-600'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white border-slate-900'
                      }`}
                      title={isBinderCompleted ? 'Click to mark binder as incomplete' : 'Mark on-site physical binder as printed and verified'}
                    >
                      <CheckCircle2 className={`w-4 h-4 ${isBinderCompleted ? 'text-emerald-700' : 'text-white'}`} />
                      <span>{isBinderCompleted ? '✓ Marked as Complete (Click to Undo)' : 'Mark Physical Binder as Complete'}</span>
                    </button>
                  </div>
                </div>

                {/* 1. ATTENDANCE ALERTS SECTION */}
                {(alertFilterTab === 'all' || alertFilterTab === 'attendance') && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-500 pt-0.5 border-b border-slate-200 pb-1">
                      <span className="flex items-center gap-1.5 text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-orange-500" />
                        <span>Attendance Sentinels</span>
                      </span>
                      <span className="text-[10px] bg-slate-100 px-1.5 py-0.2 rounded font-mono font-bold text-slate-600">
                        {attendanceAlertsCount} Alert{attendanceAlertsCount !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* 12:30 PM Missing Morning Sign-In Sentinel Alert */}
                    {isPast1230PM && missingSignInKids.length > 0 && (
                      <div className="p-3 bg-amber-50 rounded-xl border-2 border-amber-400 space-y-2 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-200 text-amber-950 border border-amber-300">
                            12:30 PM Attendance Sentinel
                          </span>
                          <span className="text-[10px] font-bold text-amber-900">CCEYA s. 8</span>
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>{missingSignInKids.length} Scheduled Child{missingSignInKids.length > 1 ? 'ren' : ''} Missing Sign-In</span>
                          </h4>
                          <p className="text-[11px] text-amber-800 mt-0.5">
                            Physical child whereabouts must be verified by 12:30 PM. Please record arrival or mark absent:
                          </p>
                        </div>
                        <div className="space-y-1.5 pt-1">
                          {missingSignInKids.map(c => (
                            <div key={c.id} className="p-2 bg-white rounded-lg border border-amber-300 flex items-center justify-between gap-2 text-xs">
                              <span className="font-bold text-slate-900 truncate">{c.fullName}</span>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleTapIn(c.id)}
                                  className="neo-btn bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-0.5 text-[10px] font-extrabold cursor-pointer"
                                >
                                  Tap In
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMarkStatus(c.id, 'absent')}
                                  className="neo-btn bg-slate-200 hover:bg-slate-300 text-slate-800 px-2 py-0.5 text-[10px] font-extrabold cursor-pointer"
                                >
                                  Absent
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 5:00 PM Missing Evening Sign-Out Alert */}
                    {isPast500PM && missingSignOutKids.length > 0 && (
                      <div className="p-3 bg-orange-50 rounded-xl border-2 border-orange-400 space-y-2 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-orange-200 text-orange-950 border border-orange-300">
                            5:00 PM Closing Sentinel
                          </span>
                          <span className="text-[10px] font-bold text-orange-900">Custody Hand-off</span>
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-orange-950 flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-orange-600 shrink-0" />
                            <span>{missingSignOutKids.length} Child{missingSignOutKids.length > 1 ? 'ren' : ''} Still Signed In</span>
                          </h4>
                          <p className="text-[11px] text-orange-800 mt-0.5">
                            Closing custody check required. Tap out departing children and record authorized pickup adult:
                          </p>
                        </div>
                        <div className="space-y-1.5 pt-1">
                          {missingSignOutKids.map(c => (
                            <div key={c.id} className="p-2 bg-white rounded-lg border border-orange-300 flex items-center justify-between gap-2 text-xs">
                              <div>
                                <p className="font-bold text-slate-900 truncate">{c.fullName}</p>
                                <p className="text-[10px] text-slate-500 font-mono">In care since {attendanceState[c.id]?.checkIn || '8:00 AM'}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleOpenTapOut(c)}
                                className="neo-btn bg-orange-600 hover:bg-orange-500 text-white px-2.5 py-1 text-[10px] font-extrabold cursor-pointer shrink-0"
                              >
                                Tap Out
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Subsidized Absence Quota Warnings */}
                    {subsidizedAbsenceWarnings.length > 0 && (
                      <div className="p-3 bg-rose-50 rounded-xl border-2 border-rose-300 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-rose-200 text-rose-950 border border-rose-300">
                            Absence Quota Warning
                          </span>
                          <span className="text-[10px] font-bold text-rose-800">Subsidy Cap</span>
                        </div>
                        {subsidizedAbsenceWarnings.map(c => (
                          <div key={c.id} className="p-2 bg-white rounded-lg border border-rose-200 flex items-center justify-between gap-2">
                            <span className="font-bold text-slate-900">{c.fullName}</span>
                            <span className="text-[10px] font-mono font-bold bg-rose-100 text-rose-900 px-2 py-0.5 rounded">
                              {c.subsidizedAbsenceDaysUsed} / {c.subsidizedAbsenceQuota ?? 30} Days
                            </span>
                          </div>
                        ))}
                        <p className="text-[11px] text-rose-800 pt-0.5">
                          5 or fewer allowable absent days remaining before regional municipal subsidy review.
                        </p>
                      </div>
                    )}

                    {/* Attendance All-Clear Badge */}
                    {attendanceAlertsCount === 0 && (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs flex items-center gap-2 text-emerald-950">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <p className="font-bold">Daily Attendance Compliant</p>
                          <p className="text-[11px] text-emerald-700">All children accounted for under Ontario CCEYA standards.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. TIMESHEETS & SUBSIDY SECTION */}
                {(alertFilterTab === 'all' || alertFilterTab === 'timesheet') && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-500 pt-1 border-b border-slate-200 pb-1">
                      <span className="flex items-center gap-1.5 text-slate-700">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Timesheets & Subsidy</span>
                      </span>
                      <span className="text-[10px] bg-slate-100 px-1.5 py-0.2 rounded font-mono font-bold text-slate-600">
                        {timesheetSubmitted ? 'Submitted' : 'Pending'}
                      </span>
                    </div>

                    {/* Monthly Subsidy Timesheet Submission Card */}
                    {!timesheetSubmitted ? (
                      <div className="p-3 bg-amber-50 rounded-xl border-2 border-amber-300 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-200 text-amber-950 border border-amber-300 font-mono">
                            August 2026 Timesheet
                          </span>
                          <span className="text-[10px] font-bold text-amber-900">Pending Signature</span>
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900">68 Child Care Days ($2,380.00 CAD Guaranteed)</p>
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            Verified in daily attendance. Submit with digital signature to the Agency Director for municipal payroll.
                          </p>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              const el = document.getElementById('monthly-timesheet-section');
                              if (el) {
                                el.scrollIntoView({ behavior: 'smooth' });
                              } else {
                                setActiveSubView('monthly_timesheet');
                              }
                            }}
                            className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                          >
                            <PenTool className="w-3.5 h-3.5" />
                            <span>Review & Sign Below</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveSubView('monthly_timesheet')}
                            className="py-1.5 px-2.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5 text-slate-600" />
                            <span>31-Day View</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-200 text-emerald-950 font-mono">
                            August 2026
                          </span>
                          <span className="text-[10px] font-extrabold text-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Submitted
                          </span>
                        </div>
                        <p className="font-extrabold text-emerald-950 text-xs">Timesheet Submitted to the Agency Director</p>
                        <p className="text-[11px] text-emerald-800">
                          Signed by {providerSignature || currentProvider.name}. Queued for agency subsidy approval and guaranteed $35/day disbursement.
                        </p>
                        <button
                          type="button"
                          onClick={() => setActiveSubView('monthly_timesheet')}
                          className="text-[11px] font-bold text-emerald-900 underline flex items-center gap-1 pt-0.5 cursor-pointer"
                        >
                          <span>Inspect 31-Day Attendance Log</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {/* 5-Week Timesheet shortcut */}
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900">5-Week Varied Timesheet</p>
                        <p className="text-[10px] text-slate-500">Live attendance sync active</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveSubView('varied_timesheet')}
                        className="neo-btn bg-amber-400 hover:bg-amber-300 text-slate-950 px-2.5 py-1 text-[10px] font-extrabold cursor-pointer"
                      >
                        Open Grid
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. ANNUAL COMPLIANCE & DOCUMENTS SECTION */}
                {(alertFilterTab === 'all' || alertFilterTab === 'compliance') && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-500 pt-1 border-b border-slate-200 pb-1">
                      <span className="flex items-center gap-1.5 text-slate-700">
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                        <span>Compliance & Documents</span>
                      </span>
                      <span className="text-[10px] bg-slate-100 px-1.5 py-0.2 rounded font-mono font-bold text-slate-600">
                        {complianceAlertsCount > 0 ? `${complianceAlertsCount} Action${complianceAlertsCount !== 1 ? 's' : ''}` : 'Compliant'}
                      </span>
                    </div>

                    {/* Annual Licensing Status */}
                    {currentProvider?.annualComplianceStatus === 'renewal_due' ? (
                      <div className="p-3 bg-purple-50 rounded-xl border-2 border-purple-300 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-purple-200 text-purple-950 border border-purple-300">
                            Annual Licensing
                          </span>
                          <span className="text-[10px] font-bold text-purple-900">Renewal Due</span>
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-purple-950 flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                            <span>Annual CCEYA Policy Renewal</span>
                          </h4>
                          <p className="text-[11px] text-purple-900 mt-0.5">
                            Offence declaration, annual safety review, and insurance rider required for {currentProvider?.name}.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveSubView('compliance')}
                          className="w-full py-1.5 px-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                          <span>Open Annual Compliance Hub</span>
                        </button>
                      </div>
                    ) : (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs flex items-center gap-2 text-emerald-950">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <p className="font-bold">CCEYA Annual Licensing Active</p>
                          <p className="text-[11px] text-emerald-700">Home facility & annual policy attestations compliant.</p>
                        </div>
                      </div>
                    )}

                    {/* Mandatory Training Modules */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <Video className="w-3.5 h-3.5 text-purple-600" />
                          <span>CCEYA Training Modules</span>
                        </span>
                        <span className="text-[10px] bg-slate-200 px-1.5 py-0.2 rounded font-mono font-bold text-slate-700">
                          {completedTrainingModulesCount} / {totalTrainingModulesCount} Done
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div
                          className="bg-purple-600 h-1.5 rounded-full transition-all"
                          style={{ width: `${(completedTrainingModulesCount / totalTrainingModulesCount) * 100}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-600">
                        {pendingTrainingModulesCount > 0
                          ? `${pendingTrainingModulesCount} statutory video module(s) pending annual watch & attestation.`
                          : 'All 4 statutory video modules attested.'}
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveSubView('compliance')}
                        className="text-[11px] font-bold text-purple-700 hover:text-purple-900 underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Watch & Attest Training Videos</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Distributed Agency Documents Shelf */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          <span>Policy Document Shelf</span>
                        </span>
                        <span className="text-[10px] bg-slate-200 px-1.5 py-0.2 rounded font-mono font-bold text-slate-700">
                          {unacknowledgedDocs.length > 0 ? `${unacknowledgedDocs.length} Pending` : 'All Read'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        {unacknowledgedDocs.length > 0
                          ? `${unacknowledgedDocs.length} mandatory document(s) distributed by the Agency Director await review.`
                          : 'All distributed policy directives acknowledged.'}
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveSubView('compliance')}
                        className="text-[11px] font-bold text-blue-700 hover:text-blue-900 underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Open Compliance Document Shelf</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                {/* 4. CRITICAL MEDICAL & SAFETY SECTION */}
                {(alertFilterTab === 'all' || alertFilterTab === 'medical') && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-500 pt-1 border-b border-slate-200 pb-1">
                      <span className="flex items-center gap-1.5 text-slate-700">
                        <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                        <span>Critical Medical & Emergency</span>
                      </span>
                      <span className="text-[10px] bg-slate-100 px-1.5 py-0.2 rounded font-mono font-bold text-slate-600">
                        {enrolledChildren.length} Children
                      </span>
                    </div>

                    {enrolledChildren.length === 0 ? (
                      <div className="p-5 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center space-y-1">
                        <ShieldCheck className="w-5 h-5 text-slate-400 mx-auto" />
                        <p className="text-xs font-bold text-slate-600">No Critical Medical Alerts</p>
                        <p className="text-[11px] text-slate-400">
                          Child allergies, Epi-Pen locations, and emergency contacts will be populated once children are assigned.
                        </p>
                      </div>
                    ) : (
                      enrolledChildren.map(child => (
                        <div
                          key={child.id}
                          className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                            child.allergies.length > 0 || child.epiPenRequired
                              ? 'bg-red-50/60 border-2 border-red-300 shadow-2xs'
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-slate-900">{child.fullName}</span>
                            <span className="text-[10px] bg-slate-200 px-1.5 py-0.2 rounded font-mono font-bold">{child.ageYearsFormatted}</span>
                          </div>

                          {child.allergies.length > 0 ? (
                            <div className="bg-red-100 text-red-900 p-2 rounded-lg font-bold text-[11px] border border-red-300 space-y-1">
                              <div className="flex items-start gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                                <span>Allergies: {child.allergies.join(', ')}</span>
                              </div>
                              {child.epiPenRequired && (
                                <div className="text-[10px] text-red-950 font-black bg-white/80 px-2 py-0.5 rounded border border-red-300">
                                  Epi-Pen in Front Pocket (Sabrina&apos;s Law Protocol)
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-emerald-700 font-semibold text-[11px] flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>No known allergies</span>
                            </p>
                          )}

                          <div className="pt-1 border-t border-slate-200 text-[11px] text-slate-600 space-y-0.5">
                            <p className="font-semibold text-slate-800">Authorized Emergency Contacts:</p>
                            {child.emergencyContacts.map((c, i) => {
                              const cleanName = (c.name || '').replace(new RegExp(`(\\s*\\(${c.relationship}\\))+$`, 'i'), '').trim();
                              return (
                                <div key={i} className="flex items-center justify-between py-0.2 text-[11px]">
                                  <span className="truncate text-slate-700">• {cleanName} ({c.relationship || 'Emergency'}):</span>
                                  <a href={`tel:${c.phone}`} className="font-bold text-blue-700 hover:underline shrink-0 ml-1">
                                    {c.phone}
                                  </a>
                                </div>
                              );
                            })}
                          </div>

                          {/* Quick Care Notes & Wallet Card Trigger in Medical Card */}
                          <div className="pt-1.5 border-t border-slate-200 grid grid-cols-2 gap-1.5">
                            <button
                              type="button"
                              onClick={() => setNotesChild(child)}
                              className="py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-2xs truncate"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span className="truncate">Care Notes</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenBinderModal('emergency_cards', child.id)}
                              className="py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-2xs truncate"
                              title={`Print CCEYA backpack emergency wallet card for ${child.fullName}`}
                            >
                              <Printer className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                              <span className="truncate">Wallet Card</span>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Monthly Subsidy Timesheet Submission Card */}
          <div id="monthly-timesheet-section" className="bg-white rounded-2xl border-2 border-slate-900 p-5 shadow-neo-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 border-b-2 border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-orange-500" />
                  <span>Monthly Subsidy & Attendance Timesheet Submission</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Submit your verified monthly attendance timesheet to the Agency Director for agency municipal subsidy reporting and payroll.
                </p>
              </div>

              <span className="text-xs bg-purple-100 text-purple-800 font-extrabold px-3 py-1 rounded-xl">
                August 2026 Timesheet
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Total Child Care Days</span>
                <p className="text-xl font-extrabold text-slate-900 mt-1">68 Days</p>
                <p className="text-[10px] text-slate-500 font-mono">Verified in daily attendance</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-1 text-slate-500 font-bold uppercase text-[10px]">
                  <span>Daily Rate</span>
                  <span title="Read-only statutory rate"><Lock className="w-3 h-3 text-slate-400" /></span>
                </div>
                <p className="text-xl font-extrabold text-purple-700 mt-1">$35.00 / day</p>
                <p className="text-[10px] text-purple-600">CWELCC + Municipal Guaranteed</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Estimated Provider Payout</span>
                <p className="text-xl font-extrabold text-emerald-600 mt-1">$2,380.00 CAD</p>
                <p className="text-[10px] text-emerald-700 font-mono">68 Days × $35.00/day</p>
              </div>
            </div>

            {/* Digital Signature & Submission Form */}
            {timesheetSubmitted ? (
              <div className="p-4 bg-emerald-50 border-2 border-emerald-400 rounded-2xl flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wide">
                    Your timesheet has been submitted to the agency for payroll verification.
                  </h4>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Digitally signed by <strong className="font-bold">{providerSignature}</strong> on {new Date().toLocaleDateString()}. Locked for agency review.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-end gap-3">
                <div className="flex-1 w-full text-xs">
                  <label className="font-bold text-slate-800 block mb-1">
                    Provider Digital Signature (Type Full Legal Name) *
                  </label>
                  <input
                    type="text"
                    placeholder={currentProvider.name}
                    value={providerSignature}
                    onChange={(e) => setProviderSignature(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <button
                  onClick={handleTimesheetSubmit}
                  disabled={!providerSignature.trim()}
                  className="neo-btn bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white px-5 py-2 text-xs font-bold gap-2 whitespace-nowrap"
                >
                  <PenTool className="w-4 h-4" />
                  <span>Submit Timesheet for Payroll Verification</span>
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* 2-TAP DEPARTURE (TAP OUT) MODAL                                            */}
      {/* ========================================================================= */}
      {tapOutModalChild && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setTapOutModalChild(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl border-2 border-slate-900 max-w-lg w-full p-6 space-y-5 shadow-neo max-h-[90vh] overflow-y-auto cursor-default"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b-2 border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-500 text-white rounded-2xl shadow-neo-sm">
                  <LogOut className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Record Departure: {tapOutModalChild.fullName}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ontario CCEYA Liability Record • Departure & Custody Handoff
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setTapOutModalChild(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Timestamps & Net Hours Calculator with Mobile Clock Picker */}
            <div className="bg-slate-50 p-3 sm:p-4 rounded-2xl border-2 border-slate-900 space-y-3">
              {/* Field Selector Pill Tabs (Departure vs Arrival) */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span>Time Recording (Touch to Select)</span>
                </span>
                <span className="text-[10px] text-slate-500 font-bold hidden sm:inline">
                  No typing required • Touch dial
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-200/80 p-1.5 rounded-2xl border border-slate-300">
                <button
                  type="button"
                  onClick={() => setActiveTapOutTimeField('checkOut')}
                  className={`py-2 px-3 rounded-xl text-left transition-all cursor-pointer ${
                    activeTapOutTimeField === 'checkOut'
                      ? 'bg-orange-500 text-white shadow-neo-sm border-2 border-slate-900'
                      : 'bg-white/80 hover:bg-white text-slate-800 border-2 border-transparent'
                  }`}
                >
                  <div className="text-[10px] font-black uppercase tracking-wider opacity-90">
                    Departure (Now)
                  </div>
                  <div className="text-sm font-black font-mono mt-0.5">
                    {tapOutForm.checkOut || 'Select Time'}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTapOutTimeField('checkIn')}
                  className={`py-2 px-3 rounded-xl text-left transition-all cursor-pointer ${
                    activeTapOutTimeField === 'checkIn'
                      ? 'bg-orange-500 text-white shadow-neo-sm border-2 border-slate-900'
                      : 'bg-white/80 hover:bg-white text-slate-800 border-2 border-transparent'
                  }`}
                >
                  <div className="text-[10px] font-black uppercase tracking-wider opacity-90">
                    Arrival (Morning)
                  </div>
                  <div className="text-sm font-black font-mono mt-0.5">
                    {tapOutForm.checkIn || 'Select Time'}
                  </div>
                </button>
              </div>

              {/* On-Brand Clock Picker Component */}
              <OnBrandClockPicker
                value={activeTapOutTimeField === 'checkOut' ? tapOutForm.checkOut : tapOutForm.checkIn}
                onChange={(formatted12h) => {
                  if (activeTapOutTimeField === 'checkOut') {
                    setTapOutForm(prev => ({ ...prev, checkOut: formatted12h }));
                  } else {
                    setTapOutForm(prev => ({ ...prev, checkIn: formatted12h }));
                  }
                }}
                presetType={activeTapOutTimeField === 'checkOut' ? 'departure' : 'arrival'}
                label={activeTapOutTimeField === 'checkOut' ? 'Departure Time (Tap Out)' : 'Arrival Time (Tap In)'}
              />

              {/* Calculated Net Care Duration Result */}
              {(() => {
                const netHrs = calculateNetCareHours(tapOutForm.checkIn, tapOutForm.checkOut);
                return (
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600">Calculated Net Care Duration:</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-black px-2.5 py-0.5 rounded-lg border font-mono ${
                        netHrs > 0
                          ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                          : 'bg-rose-100 text-rose-950 border-rose-300'
                      }`}>
                        {netHrs} Hours
                      </span>
                      {netHrs > 0 && (
                        <span className="text-[10px] text-emerald-700 font-bold hidden sm:inline">
                          ✓ CCEYA Billable
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Authorized Pick-Up Adult Custody Handoff */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-900 block">
                Authorized Adult Collecting Child (Mandatory for CCEYA Liability) *
              </label>
              <p className="text-[11px] text-slate-500">
                Select the verified guardian or authorized delegate receiving custody:
              </p>

              <div className="space-y-2">
                {(() => {
                  const parent = parentsList.find(p => p.id === tapOutModalChild.parentId);
                  const guardian1 = parent?.fullName || 'Primary Parent / Guardian';
                  const guardian2 = parent?.secondaryGuardianName;
                  const emergencyContacts = tapOutModalChild.emergencyContacts || [];

                  const options: { label: string; sub: string; value: string }[] = [
                    { label: guardian1, sub: 'Primary Guardian', value: guardian1 }
                  ];

                  if (guardian2) {
                    options.push({ label: guardian2, sub: 'Second Guardian', value: `${guardian2} (Second Guardian)` });
                  }

                  emergencyContacts.forEach(c => {
                    const cleanName = (c.name || '').replace(new RegExp(`(\\s*\\(${c.relationship}\\))+$`, 'i'), '').trim();
                    options.push({ 
                      label: cleanName, 
                      sub: `${c.relationship || 'Emergency Contact'} • ${c.phone}`, 
                      value: `${cleanName} (${c.relationship || 'Emergency Contact'})` 
                    });
                  });

                  return (
                    <>
                      {options.map((opt, i) => (
                        <label
                          key={i}
                          className={`flex items-center justify-between p-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                            tapOutForm.pickedUpBy === opt.value
                              ? 'bg-amber-50/80 border-slate-900 shadow-neo-sm'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="radio"
                              name="pickedUpBy"
                              value={opt.value}
                              checked={tapOutForm.pickedUpBy === opt.value}
                              onChange={() => setTapOutForm(prev => ({ ...prev, pickedUpBy: opt.value }))}
                              className="text-orange-600 focus:ring-orange-500"
                            />
                            <div>
                              <span className="text-xs font-bold text-slate-900 block">{opt.label}</span>
                              <span className="text-[10px] text-slate-500">{opt.sub}</span>
                            </div>
                          </div>
                          <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded">
                            Verified
                          </span>
                        </label>
                      ))}

                      {/* Custom write-in authorized delegate */}
                      <label
                        className={`flex flex-col p-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                          tapOutForm.pickedUpBy === '__custom__'
                            ? 'bg-amber-50/80 border-slate-900 shadow-neo-sm'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 mb-1.5">
                          <input
                            type="radio"
                            name="pickedUpBy"
                            value="__custom__"
                            checked={tapOutForm.pickedUpBy === '__custom__'}
                            onChange={() => setTapOutForm(prev => ({ ...prev, pickedUpBy: '__custom__' }))}
                            className="text-orange-600 focus:ring-orange-500"
                          />
                          <span className="text-xs font-bold text-slate-900">
                            Other Authorized Delegate (One-time Written Permission)
                          </span>
                        </div>

                        {tapOutForm.pickedUpBy === '__custom__' && (
                          <input
                            type="text"
                            placeholder="Enter full name of authorized adult (e.g. Aunt Maria Santos)"
                            value={tapOutForm.customPickedUpBy}
                            onChange={(e) => setTapOutForm(prev => ({ ...prev, customPickedUpBy: e.target.value }))}
                            className="w-full mt-1 bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium focus:ring-2 focus:ring-orange-500"
                            autoFocus
                          />
                        )}
                      </label>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Optional Handoff Notes */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Care Handoff & Daily Notes (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Meals, nap times, temperament, or items sent home (e.g., lunchbox, wet clothes)..."
                value={tapOutForm.notes}
                onChange={(e) => setTapOutForm(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t-2 border-slate-100">
              <button
                type="button"
                onClick={() => setTapOutModalChild(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmTapOut}
                className="neo-btn bg-orange-600 hover:bg-orange-500 text-white px-5 py-2 text-xs font-black gap-2 shadow-neo-sm"
              >
                <Check className="w-4 h-4" />
                <span>Confirm Departure & Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MANUAL TIME OVERRIDE MODAL                                                */}
      {/* ========================================================================= */}
      {timeOverrideModal && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setTimeOverrideModal(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl border-2 border-slate-900 max-w-md w-full p-5 space-y-4 shadow-neo cursor-default"
          >
            <div className="flex items-center justify-between pb-2 border-b-2 border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-500" />
                <h3 className="text-sm font-extrabold text-slate-900">
                  Adjust {timeOverrideModal.target === 'checkIn' ? 'Arrival' : 'Departure'} Time
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setTimeOverrideModal(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Update {timeOverrideModal.target === 'checkIn' ? 'arrival' : 'departure'} timestamp for <strong className="text-slate-800">{timeOverrideModal.child.fullName}</strong>:
            </p>

            <OnBrandClockPicker
              value={overrideTimeValue}
              onChange={(formatted12h) => setOverrideTimeValue(formatted12h)}
              presetType={timeOverrideModal.target === 'checkIn' ? 'arrival' : 'departure'}
              label={`${timeOverrideModal.target === 'checkIn' ? 'Arrival' : 'Departure'} Time`}
            />

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setTimeOverrideModal(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveTimeOverride}
                className="neo-btn bg-slate-900 hover:bg-slate-800 text-white px-4 py-1.5 text-xs font-bold shadow-neo-sm"
              >
                Save Timestamp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: View Form PROV-0 Submitted Details */}
      {isFormZeroModalOpen && selectedApplicant && (
        <ModalPortal>
          <div 
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsFormZeroModalOpen(false);
            }}
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-lg rounded-3xl border-2 border-slate-900 shadow-neo p-6 space-y-4 max-h-[85vh] overflow-y-auto cursor-default"
            >
              <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900">
                <div>
                  <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">
                    CCEYA Home Care Registration Record
                  </span>
                  <h3 className="text-lg font-black text-slate-900">
                    Form PROV-0: {selectedApplicant.applicantName}
                  </h3>
                  <p className="text-xs text-slate-500">{selectedApplicant.email} • {selectedApplicant.phone}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFormZeroModalOpen(false)}
                  className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5">
                  <p className="font-bold text-slate-800">Home Facility Information</p>
                  <p><span className="text-slate-500">Address:</span> {selectedApplicant.address}, {selectedApplicant.city} ({selectedApplicant.region})</p>
                  <p><span className="text-slate-500">Neighborhood:</span> {selectedApplicant.neighborhood}</p>
                  <p><span className="text-slate-500">Dwelling Type:</span> <span className="capitalize">{selectedApplicant.residenceType}</span> ({selectedApplicant.ownsHome ? 'Owned' : 'Leased'})</p>
                  <p><span className="text-slate-500">Target Licensed Capacity:</span> {selectedApplicant.targetCapacity || 6} children max</p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5">
                  <p className="font-bold text-slate-800">Household & Safety Screening</p>
                  <p><span className="text-slate-500">Household Adults (18+):</span> {selectedApplicant.householdAdultsCount}</p>
                  <p><span className="text-slate-500">Provider's Own Children:</span> {selectedApplicant.existingChildrenCount || 0}</p>
                  <p><span className="text-slate-500">Languages Spoken:</span> {(selectedApplicant.languages || ['English']).join(', ')}</p>
                </div>

                <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 space-y-1">
                  <p className="font-bold text-purple-900">Application Notes & Onboarding Status</p>
                  <p className="text-purple-800 text-[11px]">{selectedApplicant.notes}</p>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormZeroModalOpen(false)}
                  className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 cursor-pointer"
                >
                  Close Record
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Gated Notes Modal for Provider */}
      {notesChild && (
        <GatedNotesModal
          isOpen={!!notesChild}
          onClose={() => setNotesChild(null)}
          targetType="child"
          targetId={notesChild.id}
          targetName={notesChild.fullName}
          currentUser={{
            role: 'provider',
            userId: currentProvider.id,
            userName: currentProvider.name,
            providerId: currentProvider.id
          }}
          targetChild={notesChild}
        />
      )}

      {/* Physical Binder Modal for On-Site Compliance Printing */}
      <PhysicalBinderModal
        isOpen={isBinderModalOpen}
        onClose={() => setIsBinderModalOpen(false)}
        providersList={providersList}
        childrenList={childrenList}
        parentsList={parentsList}
        visitorsList={visitorsList || INITIAL_HOME_VISITORS}
        formsList={formsList || ALL_INITIAL_FORMS}
        initialProviderId={selectedProviderId}
        initialScope="single_provider"
        initialPrintSection={binderModalSection}
        initialChildId={binderModalChildId}
      />
    </div>
  );
};
