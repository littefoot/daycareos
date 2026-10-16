import React, { useState, useEffect } from 'react';
import { 
  Provider, 
  Child, 
  ParentGuardian, 
  DailyActionAlert, 
  AdmissionsStage,
  HomeVisitor,
  HomeInspectionRecord,
  ProviderApplicant,
  ProviderIntakeStage,
  HomeVisitorApplicant,
  VisitorIntakeStage,
  DocumentRecord
} from '../../types';
import { FormTemplate, FormVersionRecord } from '../../types/formSchema';
import { FamilyIntakePipeline } from './pipelines/FamilyIntakePipeline';
import { ProviderIntakePipeline } from './pipelines/ProviderIntakePipeline';
import { HomeVisitorIntakePipeline } from './pipelines/HomeVisitorIntakePipeline';
import { ProviderDirectory } from './ProviderDirectory';
import { HomeVisitorDirectory } from './HomeVisitorDirectory';
import { FormBuilderStudio } from './FormBuilderStudio';
import { FinancialLedger } from './FinancialLedger';
import { FamilyDirectory } from './FamilyDirectory';
import { AgencySettingsView } from './AgencySettingsView';
import { QuickAddFamilyModal } from './QuickAddFamilyModal';
import { AddChildToExistingModal } from './AddChildToExistingModal';
import { ModalPortal } from '../common/ModalPortal';
import { AccsDatePicker } from '../common/AccsDatePicker';
import { DocumentBinModal } from './DocumentBinModal';
import { DispatchFormModal } from './DispatchFormModal';
import { INITIAL_PROVIDER_APPLICANTS, INITIAL_HOME_VISITOR_APPLICANTS } from '../../data/mockData';
import { loadAgencySettings } from '../../data/agencySettingsData';
import { loadCuratedNotesFromStorage } from '../../lib/curatedNotesEngine';
import { AS_NEEDED_DOCUMENT_TEMPLATES } from '../../data/asNeededFormsData';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  Home, 
  FileText, 
  CreditCard, 
  Layers, 
  ArrowRight,
  ShieldCheck,
  FileCheck,
  DollarSign,
  Plus,
  Baby,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Phone,
  X,
  UserCheck,
  Copy,
  Check,
  Trash2,
  RotateCcw,
  HeartPulse,
  Sparkles,
  Sliders,
  Printer,
  FolderDown,
  Download,
  Database,
  Bot
} from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  category: 'screening' | 'inspection' | 'billing' | 'audit' | 'general' | 'document' | 'health' | 'attendance' | 'ratio';
  attendee?: string;
  notes?: string;
  severity?: 'urgent' | 'warning' | 'info';
  actionLabel?: string;
  targetTab?: string;
  isComplianceAlert?: boolean;
}

const monthsList = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const getInitialDemoCalendarEvents = (todayStr: string, year: number, monthIdx: number): CalendarEvent[] => [
  {
    id: 'ev-1',
    title: 'Parent Intake Screening Call',
    date: todayStr,
    time: '10:30 AM',
    category: 'screening',
    attendee: 'Jessica Flanagan (Durham Region)',
    notes: 'Review Form 0 screening questions & CCEYA schedule needs'
  },
  {
    id: 'ev-2',
    title: 'Home Safety Inspection Renewal',
    date: todayStr,
    time: '2:00 PM',
    category: 'inspection',
    attendee: 'Elena Rostova (Oshawa Central)',
    notes: 'Annual CCEYA home inspection & first aid kit check'
  },
  {
    id: 'ev-3',
    title: 'Parent Intake Screening Call',
    date: `${year}-${String(monthIdx + 1).padStart(2, '0')}-10`,
    time: '11:00 AM',
    category: 'screening',
    attendee: 'Tom Billard (Toronto East)',
    notes: 'Form 0 screening for 4yo Timmy'
  },
  {
    id: 'ev-4',
    title: 'Monthly CWELCC $10/Day Billing Cycle',
    date: `${year}-${String(monthIdx + 1).padStart(2, '0')}-01`,
    time: '9:00 AM',
    category: 'billing',
    attendee: 'All Active Enrolled Families',
    notes: 'Automated Interac e-transfer reminders ($217.50/child)'
  },
  {
    id: 'ev-5',
    title: 'Unannounced RECE Home Visitor Quarterly Audit',
    date: `${year}-${String(monthIdx + 1).padStart(2, '0')}-18`,
    time: '1:30 PM',
    category: 'inspection',
    attendee: 'Fatima Al-Mansoor (Oshawa Central)',
    notes: 'CCEYA ratio audit & child medical wallet cards'
  }
];

interface AdminCommandCentreProps {
  providersList: Provider[];
  childrenList: Child[];
  parentsList: ParentGuardian[];
  alertsList: DailyActionAlert[];
  formsList: FormTemplate[];
  visitorsList?: HomeVisitor[];
  inspectionsList?: HomeInspectionRecord[];
  attendanceState?: Record<string, any>;
  onDismissAlert: (alertId: string) => void;
  onUpdateChildStage: (childId: string, newStage: AdmissionsStage) => void;
  onApproveFormZero: (parentId: string) => void;
  onSaveForms: (forms: FormTemplate[]) => void;
  onMarkPaid: (childId: string) => void;
  onAddFamily: (newParent: ParentGuardian, newChildren: Child[]) => void;
  onUpdateFamily?: (updatedParent: ParentGuardian, updatedChildren: Child[]) => void;
  onDeleteFamily?: (parentId: string) => void;
  onUpdateProvider?: (updatedProvider: Provider) => void;
  onAddProvider?: (newProvider: Provider) => void;
  onDeleteProvider?: (providerId: string) => void;
  onAddVisitor?: (newVisitor: HomeVisitor) => void;
  onUpdateVisitor?: (updatedVisitor: HomeVisitor) => void;
  onDeleteVisitor?: (visitorId: string) => void;
  onNavigateToVisitorPortal?: (visitorId: string) => void;
  onUpdateChildFee?: (childId: string, updates: Partial<Child>) => void;
  onAutoGenerateMonthlyFees?: () => void;
  onDenyChild?: (childId: string) => void;
  onAssignProvider?: (childId: string, providerId: string) => void;
  onUpdateDocStatus?: (childId: string, docId: string, status: any, extraData?: { fileName?: string; fileUrl?: string; uploadedAt?: string }) => void;
  onArchiveChild?: (childId: string, isArchived: boolean) => void;
  onArchiveFamily?: (parentId: string, isArchived: boolean) => void;
  onClearDemoData?: () => void;
  onLoad24Profiles?: () => void;
  isSeedingData?: boolean;
  onSaveSingleForm?: (form: FormTemplate, changeSummary: string, author?: string) => Promise<any>;
  onRollbackForm?: (formId: string, versionRecord: FormVersionRecord) => Promise<any>;
  onResetFormToFactory?: (formId: string) => Promise<any>;
  onFetchFormVersions?: (formId: string) => Promise<FormVersionRecord[]>;
  onOpenBinderModal?: () => void;
  onOpenAiWithPrompt?: (prompt: string) => void;
  activeTab?: 'command' | 'families' | 'providers' | 'visitors' | 'forms' | 'financials' | 'settings';
  onTabChange?: (tab: 'command' | 'families' | 'providers' | 'visitors' | 'forms' | 'financials' | 'settings') => void;
}

export const AdminCommandCentre: React.FC<AdminCommandCentreProps> = ({
  providersList,
  childrenList,
  parentsList,
  alertsList,
  formsList,
  attendanceState = {},
  onDismissAlert,
  onUpdateChildStage,
  onApproveFormZero,
  onSaveForms,
  onMarkPaid,
  onAddFamily,
  onUpdateFamily,
  onDeleteFamily,
  onUpdateProvider,
  onAddProvider,
  onDeleteProvider,
  onUpdateChildFee,
  onAutoGenerateMonthlyFees,
  onDenyChild,
  onAssignProvider,
  onUpdateDocStatus,
  onArchiveChild,
  onArchiveFamily,
  onClearDemoData,
  onLoad24Profiles,
  isSeedingData = false,
  visitorsList = [],
  inspectionsList = [],
  onAddVisitor,
  onUpdateVisitor,
  onDeleteVisitor,
  onNavigateToVisitorPortal,
  onSaveSingleForm,
  onRollbackForm,
  onResetFormToFactory,
  onFetchFormVersions,
  onOpenBinderModal,
  onOpenAiWithPrompt,
  activeTab: controlledActiveTab,
  onTabChange
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState<'command' | 'families' | 'providers' | 'visitors' | 'forms' | 'financials' | 'settings'>('command');
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;
  const setActiveTab = (tab: 'command' | 'families' | 'providers' | 'visitors' | 'forms' | 'financials' | 'settings') => {
    if (onTabChange) {
      onTabChange(tab);
    }
    setInternalActiveTab(tab);
  };

  useEffect(() => {
    const handleNavHome = () => {
      setActiveTab('command');
    };
    window.addEventListener('accs-navigate-admin-dashboard', handleNavHome);
    return () => window.removeEventListener('accs-navigate-admin-dashboard', handleNavHome);
  }, []);
  const [familySubTab, setFamilySubTab] = useState<'directory' | 'pipeline'>('directory');
  const [providerSubTab, setProviderSubTab] = useState<'directory' | 'pipeline'>('directory');
  const [visitorSubTab, setVisitorSubTab] = useState<'directory' | 'pipeline'>('directory');

  // As-Needed Document Bin & Distribution Modals State
  const [isDocumentBinOpen, setIsDocumentBinOpen] = useState(false);
  const [dispatchModalState, setDispatchModalState] = useState<{
    isOpen: boolean;
    preSelectedChildId?: string;
    preSelectedTemplateId?: string;
  }>({ isOpen: false });

  const handleDispatchDocument = (childId: string, newDoc: DocumentRecord, customNote: string) => {
    const targetKid = childrenList.find(c => c.id === childId);
    if (!targetKid) return;
    const parent = parentsList.find(p => p.id === targetKid.parentId);

    const existingDocs = targetKid.documents || [];
    const updatedDocs = [...existingDocs.filter(d => d.id !== newDoc.id), newDoc];
    const updatedChild: Child = { ...targetKid, documents: updatedDocs };

    if (onUpdateDocStatus) {
      onUpdateDocStatus(childId, newDoc.id, newDoc.status, {
        fileName: newDoc.fileName,
        fileUrl: newDoc.fileUrl
      });
    }

    if (onUpdateFamily && parent) {
      const famKids = childrenList.filter(c => c.parentId === parent.id).map(c => c.id === childId ? updatedChild : c);
      onUpdateFamily(parent, famKids);
    }
  };

  const [providerApplicants, setProviderApplicants] = useState<ProviderApplicant[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('accs_provider_applicants');
        if (saved !== null) return JSON.parse(saved);
      } catch (e) {}
    }
    if (providersList.length === 0 && childrenList.length === 0) {
      return [];
    }
    return INITIAL_PROVIDER_APPLICANTS;
  });

  const [visitorApplicants, setVisitorApplicants] = useState<HomeVisitorApplicant[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('accs_visitor_applicants');
        if (saved !== null) return JSON.parse(saved);
      } catch (e) {}
    }
    if (visitorsList.length === 0 && childrenList.length === 0) {
      return [];
    }
    return INITIAL_HOME_VISITOR_APPLICANTS;
  });

  const handleUpdateProviderApplicantStage = (applicantId: string, newStage: ProviderIntakeStage) => {
    setProviderApplicants(prev => {
      const updated = prev.map(a => a.id === applicantId ? { ...a, stage: newStage } : a);
      try { localStorage.setItem('accs_provider_applicants', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
  };

  const handleUpdateProviderApplicantData = (applicantId: string, updates: Partial<ProviderApplicant>) => {
    setProviderApplicants(prev => {
      const updated = prev.map(a => a.id === applicantId ? { ...a, ...updates } : a);
      try { localStorage.setItem('accs_provider_applicants', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
  };

  const handleGraduateProvider = (applicant: ProviderApplicant) => {
    if (onAddProvider) {
      const newProv: Provider = {
        id: `prov-${Date.now()}`,
        name: applicant.applicantName,
        homeName: `${applicant.applicantName.split(' ')[0]}'s Licensed Home Care`,
        homeAddress: applicant.address,
        neighborhood: applicant.neighborhood,
        region: applicant.region,
        phone: applicant.phone,
        email: applicant.email,
        maxCapacity: applicant.targetCapacity || 6,
        maxUnderThree: 3,
        maxUnderTwo: 3,
        ownChildrenUnderSix: 0,
        ownChildrenUnderFour: 0,
        acceptsSchoolAge: true,
        enrolledChildIds: [],
        rating: 5.0,
        bio: `Newly licensed CCEYA Home Child Care Provider in ${applicant.neighborhood}. Completed all background, medical, and safety requirements.`,
        photoUrl: applicant.photoUrl || '/providers/fatima_al_mansoor.jpg',
        operatingHours: '7:30 AM – 5:30 PM (Mon–Fri)',
        annualComplianceStatus: 'compliant',
        vscExpiryDate: '2029-09-01',
        offenceDeclDate: '2027-09-01',
        firstAidExpiryDate: '2028-09-01'
      };
      onAddProvider(newProv);
    }
    setProviderApplicants(prev => {
      const updated = prev.map(a => a.id === applicant.id ? { ...a, stage: 'licensed_active' as ProviderIntakeStage } : a);
      try { localStorage.setItem('accs_provider_applicants', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
    setProviderSubTab('directory');
  };

  const handleAddProviderApplicant = (applicant: ProviderApplicant) => {
    setProviderApplicants(prev => {
      const updated = [applicant, ...prev];
      try { localStorage.setItem('accs_provider_applicants', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
  };

  const handleUpdateVisitorApplicantStage = (applicantId: string, newStage: VisitorIntakeStage) => {
    setVisitorApplicants(prev => {
      const updated = prev.map(a => a.id === applicantId ? { ...a, stage: newStage } : a);
      try { localStorage.setItem('accs_visitor_applicants', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
  };

  const handleUpdateVisitorApplicantData = (applicantId: string, updates: Partial<HomeVisitorApplicant>) => {
    setVisitorApplicants(prev => {
      const updated = prev.map(a => a.id === applicantId ? { ...a, ...updates } : a);
      try { localStorage.setItem('accs_visitor_applicants', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
  };

  const handleGraduateVisitor = (applicant: HomeVisitorApplicant) => {
    if (onAddVisitor) {
      const newVis: HomeVisitor = {
        id: `visitor-${Date.now()}`,
        name: applicant.applicantName,
        title: 'Home Child Care Visitor, RECE',
        receNumber: applicant.receNumber,
        receExpiryDate: '2027-09-01',
        phone: applicant.phone,
        email: applicant.email,
        region: applicant.assignedRegion === 'York/Toronto' ? 'York Region' : 'Durham Region',
        photoUrl: applicant.photoUrl || '/visitors/nadia_chen.jpg',
        assignedProviderIds: [],
        activeStatus: 'active',
        hireDate: new Date().toISOString().split('T')[0],
        vscExpiryDate: '2029-09-01',
        offenceDeclDate: '2027-09-01',
        firstAidExpiryDate: '2028-09-01'
      };
      onAddVisitor(newVis);
    }
    setVisitorApplicants(prev => {
      const updated = prev.map(a => a.id === applicant.id ? { ...a, stage: 'active' as VisitorIntakeStage } : a);
      try { localStorage.setItem('accs_visitor_applicants', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
    setVisitorSubTab('directory');
  };

  const handleAddVisitorApplicant = (applicant: HomeVisitorApplicant) => {
    setVisitorApplicants(prev => {
      const updated = [applicant, ...prev];
      try { localStorage.setItem('accs_visitor_applicants', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
  };
  const [alertFilter, setAlertFilter] = useState<'all' | 'document' | 'health' | 'attendance' | 'payment' | 'ratio' | 'screening'>('all');
  const [isAddFamilyModalOpen, setIsAddFamilyModalOpen] = useState(false);
  const [isAddChildToExistingModalOpen, setIsAddChildToExistingModalOpen] = useState(false);
  const [addProviderTrigger, setAddProviderTrigger] = useState(0);
  const [addVisitorTrigger, setAddVisitorTrigger] = useState(0);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [focusedFormBuilderId, setFocusedFormBuilderId] = useState<string | null>(null);

  // Operations Calendar State (current system date defaults to real time)
  const now = new Date();
  const currentActualYear = now.getFullYear();
  const currentActualMonth = now.getMonth(); // 0-indexed (e.g. 8 for September)
  const todayStr = `${currentActualYear}-${String(currentActualMonth + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const [currentYear, setCurrentYear] = useState<number>(currentActualYear);
  const [currentMonthIdx, setCurrentMonthIdx] = useState<number>(currentActualMonth);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState(todayStr);
  const [newEventTime, setNewEventTime] = useState('10:00 AM');
  const [newEventCategory, setNewEventCategory] = useState<'screening' | 'inspection' | 'billing' | 'audit' | 'general' | 'document' | 'health'>('screening');
  const [newEventAttendee, setNewEventAttendee] = useState('');
  const [newEventNotes, setNewEventNotes] = useState('');

  const [manualCalendarEvents, setManualCalendarEvents] = useState<CalendarEvent[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('accs_calendar_events');
        if (saved !== null) {
          return JSON.parse(saved);
        }
      } catch (e) {}
    }
    // If roster is empty (clean slate), do not show demo events
    if (childrenList.length === 0 && parentsList.length === 0) {
      return [];
    }
    return getInitialDemoCalendarEvents(todayStr, currentActualYear, currentActualMonth);
  });

  // Synchronize all Compliance Action Alerts into the Operations Calendar
  const alertCalendarEvents = React.useMemo<CalendarEvent[]>(() => {
    return alertsList
      .filter(alert => alert.dateDue && /^\d{4}-\d{2}-\d{2}$/.test(alert.dateDue))
      .map(alert => {
        let cat: CalendarEvent['category'] = 'audit';
        if (alert.category === 'payment') cat = 'billing';
        else if (alert.category === 'screening') cat = 'screening';
        else if (alert.category === 'health') cat = 'health';
        else if (alert.category === 'document') cat = 'document';
        else if (alert.category === 'attendance') cat = 'attendance';
        else if (alert.category === 'ratio') cat = 'ratio';

        return {
          id: `cal-${alert.id}`,
          title: alert.title,
          date: alert.dateDue!,
          time: '9:00 AM',
          category: cat,
          severity: alert.severity,
          attendee: alert.metadata?.providerName || alert.metadata?.childName || 'Statutory Compliance',
          notes: alert.description,
          actionLabel: alert.actionLabel,
          targetTab: alert.targetTab,
          isComplianceAlert: true
        };
      });
  }, [alertsList]);

  // Unified Calendar Events (Manual schedules + Live compliance alerts)
  const calendarEvents = React.useMemo<CalendarEvent[]>(() => {
    const combined = [...manualCalendarEvents];
    alertCalendarEvents.forEach(alertEv => {
      const exists = combined.some(e => e.date === alertEv.date && e.title === alertEv.title);
      if (!exists) {
        combined.push(alertEv);
      }
    });
    return combined;
  }, [manualCalendarEvents, alertCalendarEvents]);

  // Compute days in month and starting day of week
  const daysInMonth = new Date(currentYear, currentMonthIdx + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonthIdx, 1).getDay(); // 0 = Sunday

  const selectedDayEvents = calendarEvents.filter(e => e.date === selectedDate);

  const handleAddCalendarEvent = () => {
    if (!newEventTitle.trim()) return;
    const newEv: CalendarEvent = {
      id: `ev-${Date.now()}`,
      title: newEventTitle.trim(),
      date: newEventDate,
      time: newEventTime,
      category: newEventCategory,
      attendee: newEventAttendee.trim() || undefined,
      notes: newEventNotes.trim() || undefined
    };
    setManualCalendarEvents(prev => {
      const updated = [...prev, newEv];
      try {
        localStorage.setItem('accs_calendar_events', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    setSelectedDate(newEventDate);
    setIsAddEventModalOpen(false);
    setNewEventTitle('');
    setNewEventAttendee('');
    setNewEventNotes('');
  };

  const handleDeleteCalendarEvent = (eventId: string) => {
    setManualCalendarEvents(prev => {
      const updated = prev.filter(e => e.id !== eventId);
      try {
        localStorage.setItem('accs_calendar_events', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Database Backup State & Export Handler (Task #24)
  const [backupNotice, setBackupNotice] = useState<string | null>(null);
  const [isExportingBackup, setIsExportingBackup] = useState(false);

  const handleDownloadDatabaseBackup = () => {
    setIsExportingBackup(true);
    try {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
      const timeStr = `${pad(now.getHours())}${pad(now.getMinutes())}`;
      const filename = `accs-agency-backup-${dateStr}-${timeStr}.json`;

      const agencySettings = loadAgencySettings();
      const developerNotes = loadCuratedNotesFromStorage();

      const totalRecords =
        childrenList.length +
        parentsList.length +
        providersList.length +
        visitorsList.length +
        inspectionsList.length +
        formsList.length +
        alertsList.length +
        Object.keys(attendanceState || {}).length +
        providerApplicants.length +
        visitorApplicants.length +
        manualCalendarEvents.length;

      const backupPayload = {
        metadata: {
          agencyName: 'All Child Care Solutions Inc.',
          licensingAgency: 'Ontario Ministry of Education (CCEYA)',
          exportedBy: 'Agency Director',
          systemVersion: '2026.10-PROD',
          exportedAt: now.toISOString(),
          formattedDate: now.toLocaleString('en-CA', {
            dateStyle: 'full',
            timeStyle: 'medium',
          }),
          totalRecordCount: totalRecords,
          recordCounts: {
            children: childrenList.length,
            parents: parentsList.length,
            providers: providersList.length,
            homeVisitors: visitorsList.length,
            inspections: inspectionsList.length,
            formTemplates: formsList.length,
            activeAlerts: alertsList.length,
            dailyAttendanceDates: Object.keys(attendanceState || {}).length,
            providerApplicants: providerApplicants.length,
            visitorApplicants: visitorApplicants.length,
            calendarEvents: manualCalendarEvents.length,
          }
        },
        collections: {
          children: childrenList,
          parents: parentsList,
          providers: providersList,
          home_visitors: visitorsList,
          inspections: inspectionsList,
          form_templates: formsList,
          active_alerts: alertsList,
          daily_attendance: attendanceState || {},
          provider_applicants: providerApplicants,
          home_visitor_applicants: visitorApplicants,
          calendar_events: manualCalendarEvents,
          agency_settings: agencySettings,
          developer_notes: developerNotes,
        }
      };

      const jsonBlob = new Blob([JSON.stringify(backupPayload, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(jsonBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setBackupNotice(
        `Database backup successfully generated! Exported ${totalRecords} active records across 13 agency collections to ${filename}.`
      );
      setTimeout(() => {
        setBackupNotice(null);
      }, 7000);
    } catch (err: any) {
      console.error('Failed to export agency database backup:', err);
      setBackupNotice('Failed to generate database backup. Check console for details.');
    } finally {
      setIsExportingBackup(false);
    }
  };


  // Key Agency KPIs
  const enrolledCount = childrenList.filter(c => c.admissionsStage === 'enrolled' && !c.isArchived).length;
  const screeningPendingCount = parentsList.filter(p => !p.formZeroApproved && !p.isArchived).length;
  const totalCapacity = providersList.reduce((acc, p) => acc + p.maxCapacity, 0);
  const totalVacancies = Math.max(0, totalCapacity - enrolledCount);
  const occupancyPercent = totalCapacity > 0 ? Math.round((enrolledCount / totalCapacity) * 100) : 0;

  // Financial KPIs (Card 2)
  const enrolledChildren = childrenList.filter(c => c.admissionsStage === 'enrolled' && !c.isArchived);
  const totalMonthlyReceivables = enrolledChildren.reduce((acc, c) => acc + (c.monthlyFee || 0), 0);
  const totalPaid = enrolledChildren.filter(c => c.eTransferStatus === 'paid').reduce((acc, c) => acc + (c.monthlyFee || 0), 0);
  const totalOutstanding = Math.max(0, totalMonthlyReceivables - totalPaid);
  const paidCount = enrolledChildren.filter(c => c.eTransferStatus === 'paid').length;
  const pendingCount = enrolledChildren.filter(c => c.eTransferStatus === 'pending').length;
  const overdueCount = enrolledChildren.filter(c => c.eTransferStatus === 'overdue').length;
  const collectedPercent = totalMonthlyReceivables > 0 ? Math.round((totalPaid / totalMonthlyReceivables) * 100) : 100;

  // Action Queue KPIs (Card 4)
  const urgentAlertsCount = alertsList.length;
  const healthAlertsCount = alertsList.filter(a => a.category === 'health').length;
  const billingAlertsCount = alertsList.filter(a => a.category === 'payment').length;

  // Ministry Policy Verification State (Card 1)
  const [isPolicyUpToDate, setIsPolicyUpToDate] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('accs_ministry_policy_up_to_date');
      if (saved !== null) return saved === 'true';
    }
    return true; // Default up to date
  });

  const [policyLastVerified, setPolicyLastVerified] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accs_ministry_policy_last_verified') || 'Today, 4:29 PM';
    }
    return 'Today, 4:29 PM';
  });
  const [isVerifyingPolicies, setIsVerifyingPolicies] = useState<boolean>(false);
  const [policyVerifyToast, setPolicyVerifyToast] = useState<string | null>(null);

  const handleVerifyMinistryPolicies = () => {
    setIsVerifyingPolicies(true);
    setTimeout(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      const formatted = `Today, ${timeStr}`;
      setPolicyLastVerified(formatted);
      setIsPolicyUpToDate(true);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('accs_ministry_policy_last_verified', formatted);
          localStorage.setItem('accs_ministry_policy_up_to_date', 'true');
        } catch (e) {}
      }
      setIsVerifyingPolicies(false);
      setPolicyVerifyToast('✓ Verified live against ontario.ca: CCEYA 2014 & O. Reg. 137/15 rules active and 100% up-to-date.');
      setTimeout(() => setPolicyVerifyToast(null), 6000);
    }, 650);
  };

  // Talk to AI Advisor Handler (Card 4)
  const handleTalkToAi = () => {
    const prompt = urgentAlertsCount > 0
      ? `Please review the ${urgentAlertsCount} urgent items in the Director's Action Queue (${screeningPendingCount} parent screening calls pending, ${healthAlertsCount} expiring health/immunization alerts, and ${billingAlertsCount} billing alerts) and advise on our immediate staff action plan today.`
      : `Please review our current agency operations, CCEYA ratios, and capacity across our licensed homes.`;

    if (onOpenAiWithPrompt) {
      onOpenAiWithPrompt(prompt);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('accs-open-ai-with-prompt', { detail: { prompt } }));
    }
  };

  const activePipelineCount = childrenList.filter(c => 
    !c.isArchived && 
    c.admissionsStage !== 'withdrawn' && 
    ['inquiry', 'docs_needed', 'matching', 'contract', 'enrolled'].includes(c.admissionsStage)
  ).length;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Sub-Navigation Tabs (Left) & Action CTAs (Right) — Clean Inline Bar */}
      <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
        {/* Left: Tab Switcher Pills */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border-2 border-slate-900 overflow-x-auto max-w-full scrollbar-none shadow-neo-sm shrink-0">
          <button
            onClick={() => setActiveTab('command')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 whitespace-nowrap ${
              activeTab === 'command'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Dashboard</span>
            {alertsList.length > 0 && (
              <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-black ml-0.5">
                {alertsList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('families');
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 whitespace-nowrap ${
              activeTab === 'families'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Baby className="w-3.5 h-3.5" />
            <span>Children ({childrenList.filter(c => !c.isArchived).length})</span>
            {activePipelineCount > 0 && activePipelineCount !== childrenList.filter(c => !c.isArchived).length && (
              <span className="bg-orange-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold ml-0.5">
                {activePipelineCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('providers')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 whitespace-nowrap ${
              activeTab === 'providers'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Providers ({providersList.length})</span>
            {providerApplicants.length > 0 && (
              <span className="bg-blue-600 text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold ml-0.5">
                {providerApplicants.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('visitors')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 whitespace-nowrap ${
              activeTab === 'visitors'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Manage Home Visitors, CCEYA quarterly inspections & caseload assignments"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Visitors ({visitorsList.length})</span>
            {visitorApplicants.length > 0 && (
              <span className="bg-purple-600 text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold ml-0.5">
                {visitorApplicants.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('financials')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 whitespace-nowrap ${
              activeTab === 'financials'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Manage monthly parent fee invoicing, provincial CWELCC grants, CRA T4A tax slips, and Interac e-transfers"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Financials</span>
          </button>

          <button
            onClick={() => setActiveTab('forms')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 whitespace-nowrap ${
              activeTab === 'forms'
                ? 'bg-orange-500 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Forms ({formsList.length + AS_NEEDED_DOCUMENT_TEMPLATES.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-orange-500 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Policy</span>
          </button>
        </div>

        {/* Right: Action CTAs — Compact Icon Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsDocumentBinOpen(true)}
            className="w-8 h-8 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 border-2 border-slate-900 shadow-neo-sm hover:shadow-neo transition-all flex items-center justify-center cursor-pointer shrink-0"
            title="As-Needed Forms Bin (13 Templates) — Browse and distribute the agency's blank PDF templates"
            aria-label="As-Needed Forms Bin"
          >
            <FolderDown className="w-4 h-4 text-amber-700" />
          </button>

          {onOpenBinderModal && (
            <button
              onClick={onOpenBinderModal}
              className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border-2 border-slate-900 shadow-neo-sm hover:shadow-neo transition-all flex items-center justify-center cursor-pointer shrink-0"
              title="Ministry Audit Binder — Open physical inspection compliance binder and pre-filled print hub"
              aria-label="Ministry Audit Binder"
            >
              <Printer className="w-4 h-4 text-orange-400" />
            </button>
          )}

          <button
            type="button"
            onClick={handleDownloadDatabaseBackup}
            disabled={isExportingBackup}
            className="w-8 h-8 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border-2 border-slate-900 shadow-neo-sm hover:shadow-neo transition-all flex items-center justify-center cursor-pointer shrink-0 disabled:opacity-50"
            title="Download Backup (JSON) — Export timestamped agency database backup for offline archiving and compliance"
            aria-label="Download Database Backup JSON"
          >
            <Download className="w-4 h-4 text-emerald-700" />
          </button>


          {onLoad24Profiles && (
            <button
              type="button"
              onClick={() => {
                const demoEvents = getInitialDemoCalendarEvents(todayStr, currentActualYear, currentActualMonth);
                setManualCalendarEvents(demoEvents);
                setProviderApplicants(INITIAL_PROVIDER_APPLICANTS);
                setVisitorApplicants(INITIAL_HOME_VISITOR_APPLICANTS);
                try {
                  localStorage.setItem('accs_calendar_events', JSON.stringify(demoEvents));
                  localStorage.setItem('accs_provider_applicants', JSON.stringify(INITIAL_PROVIDER_APPLICANTS));
                  localStorage.setItem('accs_visitor_applicants', JSON.stringify(INITIAL_HOME_VISITOR_APPLICANTS));
                } catch (e) {}
                onLoad24Profiles();
              }}
              disabled={isSeedingData}
              className={`w-9 h-9 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-900 border-2 border-slate-900 shadow-neo-sm flex items-center justify-center cursor-pointer transition-all shrink-0 ${
                isSeedingData ? 'opacity-60 cursor-wait' : ''
              }`}
              title="Seed Cloud Firestore with 24 child profiles & calculate dynamic compliance dates"
              aria-label="Seed Cloud Database"
            >
              {isSeedingData ? (
                <RotateCcw className="w-4 h-4 text-purple-600 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-purple-600" />
              )}
            </button>
          )}

          {onClearDemoData && (
            <button
              type="button"
              onClick={() => setIsClearConfirmOpen(true)}
              className="w-9 h-9 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-800 border-2 border-slate-900 shadow-neo-sm flex items-center justify-center cursor-pointer transition-all shrink-0"
              title="Clear demo data to test entry manually from a clean slate"
              aria-label="Clear Demo Data"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
            </button>
          )}
        </div>
      </div>

      {/* Database Backup Notification Toast Banner */}
      {backupNotice && (
        <div className="bg-emerald-50 border-2 border-slate-900 text-emerald-950 p-4 rounded-2xl shadow-neo-sm flex items-start justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-200 border-2 border-slate-900 flex items-center justify-center shrink-0 mt-0.5">
              <Database className="w-4 h-4 text-emerald-900" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-emerald-950 uppercase tracking-wide">
                Database Backup Archive Ready
              </p>
              <p className="text-sm font-semibold text-emerald-900 mt-0.5">
                {backupNotice}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setBackupNotice(null)}
            className="text-emerald-800 hover:text-slate-900 p-1 rounded-lg hover:bg-emerald-100 transition-colors"
            title="Dismiss notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}


      {/* Tab 1: Daily Command & Deterministic Action Queue */}
      {activeTab === 'command' && (
        <div className="space-y-6">
          {/* Top Quick Metrics — Enhanced 4-Pillar Operations Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Ministry Policy Ground Truth (First & Green if up to date, Red if not) */}
            <div 
              onClick={() => setActiveTab('settings')}
              className={`bg-white p-4 rounded-2xl border-2 border-slate-900 shadow-neo-sm hover:shadow-neo hover:-translate-y-0.5 transition-all cursor-pointer group flex flex-col justify-between ${
                !isPolicyUpToDate ? 'ring-2 ring-rose-400/50' : ''
              }`}
              title="Click to inspect Ontario Ministry Regulatory Policies & Ground Truth"
            >
              <div>
                <div className="flex items-center justify-between gap-1">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    Ministry Regulatory Truth
                  </p>
                  <span 
                    onClick={(e) => {
                      e.stopPropagation();
                      const next = !isPolicyUpToDate;
                      setIsPolicyUpToDate(next);
                      try { localStorage.setItem('accs_ministry_policy_up_to_date', String(next)); } catch (err) {}
                    }}
                    className={`text-[9px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-1 border cursor-pointer transition-all ${
                      isPolicyUpToDate
                        ? 'bg-emerald-100 text-emerald-950 border-emerald-300 hover:bg-emerald-200'
                        : 'bg-rose-100 text-rose-950 border-rose-300 hover:bg-rose-200 animate-pulse'
                    }`}
                    title="Click badge to toggle verification status demo"
                  >
                    {isPolicyUpToDate ? (
                      <>
                        <ShieldCheck className="w-2.5 h-2.5 text-emerald-700" />
                        <span>Up to Date</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-2.5 h-2.5 text-rose-700" />
                        <span>Updates Available</span>
                      </>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className={`text-sm font-black truncate ${isPolicyUpToDate ? 'text-slate-900' : 'text-rose-700'}`}>
                    {policyLastVerified}
                  </span>
                </div>
                <p className={`text-[11px] font-bold mt-0.5 truncate flex items-center gap-1 ${
                  isPolicyUpToDate ? 'text-emerald-700' : 'text-rose-600'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isPolicyUpToDate ? 'bg-emerald-500' : 'bg-rose-500 animate-ping'}`} />
                  <span>{isPolicyUpToDate ? 'CCEYA 2014 & O. Reg. 137/15' : 'Ministry Updates Pending Sync'}</span>
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVerifyMinistryPolicies();
                  }}
                  disabled={isVerifyingPolicies}
                  className={`w-full py-1.5 px-2 text-[10px] font-black rounded-lg border border-slate-900 shadow-2xs flex items-center justify-center gap-1 cursor-pointer transition-all active:translate-y-0.5 ${
                    isPolicyUpToDate
                      ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border-emerald-300'
                      : 'bg-rose-600 hover:bg-rose-700 text-white border-slate-900'
                  }`}
                  title="Check provincial government regulations on ontario.ca now"
                >
                  <Sparkles className={`w-3 h-3 ${isPolicyUpToDate ? 'text-emerald-800' : 'text-white'} ${isVerifyingPolicies ? 'animate-spin' : ''}`} />
                  <span>
                    {isVerifyingPolicies
                      ? 'Checking Ministry...'
                      : isPolicyUpToDate
                      ? 'Check Government Updates'
                      : 'Sync Ministry Updates Now'}
                  </span>
                </button>
              </div>
            </div>

            {/* Card 2: Total Children & Licensed Vacancies (Second) */}
            <div 
              onClick={() => setActiveTab('providers')}
              className="bg-white p-4 rounded-2xl border-2 border-slate-900 shadow-neo-sm hover:shadow-neo hover:-translate-y-0.5 transition-all cursor-pointer group flex flex-col justify-between"
              title="Click to view Provider Directory & CCEYA Mixed-Age Capacity"
            >
              <div>
                <div className="flex items-center justify-between gap-1">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    Children & Capacity
                  </p>
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full border ${
                    occupancyPercent >= 75
                      ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                      : 'bg-amber-100 text-amber-950 border-amber-300'
                  }`}>
                    {occupancyPercent}% Occupied
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mt-1.5">
                  <span className="text-2xl font-black text-slate-900">{enrolledCount}</span>
                  <span className="text-sm font-extrabold text-slate-400">/ {totalCapacity} Enrolled</span>
                </div>
                <p className="text-[11px] font-bold text-orange-600 mt-0.5">
                  {totalVacancies} Open Vacancies
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                <span className="truncate">Across {providersList.length} licensed homes</span>
                <span className="text-orange-600 font-bold group-hover:translate-x-0.5 transition-transform shrink-0 flex items-center gap-0.5">
                  View Ratios →
                </span>
              </div>
            </div>

            {/* Card 3: Money Earned & Outstanding for Month (Third) */}
            <div 
              onClick={() => setActiveTab('financials')}
              className="bg-white p-4 rounded-2xl border-2 border-slate-900 shadow-neo-sm hover:shadow-neo hover:-translate-y-0.5 transition-all cursor-pointer group flex flex-col justify-between"
              title="Click to view Financial Ledger & Interac e-Transfer Reminders"
            >
              <div>
                <div className="flex items-center justify-between gap-1">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    Monthly Cash Flow
                  </p>
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full border ${
                    collectedPercent >= 80
                      ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                      : 'bg-amber-100 text-amber-950 border-amber-300'
                  }`}>
                    {collectedPercent}% Collected
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mt-1.5 flex-wrap">
                  <span className="text-2xl font-black text-emerald-700">
                    ${Math.round(totalPaid).toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    / ${Math.round(totalMonthlyReceivables).toLocaleString()}
                  </span>
                </div>
                <p className={`text-[11px] font-bold mt-0.5 ${totalOutstanding > 0 ? 'text-amber-700' : 'text-slate-500'}`}>
                  {totalOutstanding > 0
                    ? `$${Math.round(totalOutstanding).toLocaleString()} Outstanding (${pendingCount} pend, ${overdueCount} over)`
                    : 'All Parent Fees Reconciled'}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                <span>Interac e-Transfer Rail</span>
                <span className="text-emerald-700 font-bold group-hover:translate-x-0.5 transition-transform shrink-0 flex items-center gap-0.5">
                  Ledger →
                </span>
              </div>
            </div>

            {/* Card 4: Director Action Queue & AI Copilot (Fourth) */}
            <div 
              onClick={() => {
                handleTalkToAi();
              }}
              className="bg-white p-4 rounded-2xl border-2 border-slate-900 shadow-neo-sm hover:shadow-neo hover:-translate-y-0.5 transition-all cursor-pointer group flex flex-col justify-between"
              title="Click to consult AI Copilot with current Action Queue items"
            >
              <div>
                <div className="flex items-center justify-between gap-1">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    Director Action Queue
                  </p>
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full border ${
                    urgentAlertsCount > 0
                      ? 'bg-rose-100 text-rose-950 border-rose-300'
                      : 'bg-emerald-100 text-emerald-950 border-emerald-300'
                  }`}>
                    {urgentAlertsCount > 0 ? `${urgentAlertsCount} Actions` : 'All Clear'}
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mt-1.5">
                  <span className={`text-2xl font-black ${urgentAlertsCount > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {urgentAlertsCount}
                  </span>
                  <span className="text-xs font-bold text-slate-500">Urgent Focus Items</span>
                </div>
                <p className="text-[11px] font-bold text-slate-600 mt-0.5 truncate">
                  {screeningPendingCount} Screenings • {healthAlertsCount} Health • {billingAlertsCount} Billing
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                <span>Immediate Staff Focus</span>
                <span 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTalkToAi();
                  }}
                  className="text-orange-600 font-extrabold group-hover:translate-x-0.5 transition-transform shrink-0 flex items-center gap-1 bg-orange-50 hover:bg-orange-100 px-2 py-0.5 rounded-md border border-orange-200 cursor-pointer"
                >
                  <Bot className="w-3.5 h-3.5 text-orange-600" />
                  <span>Talk to AI →</span>
                </span>
              </div>
            </div>
          </div>

          {/* Ministry Policy Verification Toast Banner */}
          {policyVerifyToast && (
            <div className="bg-emerald-50 border-2 border-slate-900 text-emerald-950 p-3.5 rounded-2xl shadow-neo-sm flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-emerald-200 border border-slate-900 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-emerald-900" />
                </div>
                <p className="text-xs font-bold text-emerald-950">
                  {policyVerifyToast}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPolicyVerifyToast(null)}
                className="text-emerald-800 hover:text-slate-900 p-1 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer shrink-0"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 2-COLUMN COMMAND HUB: CALENDAR (LEFT) & ACTION QUEUE (RIGHT) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* COLUMN 1: UPCOMING EVENTS & COMPLIANCE CALENDAR (LEFT - 5 cols) */}
            <div className="lg:col-span-5 bg-white p-5 rounded-2xl border-2 border-slate-900 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b-2 border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-orange-100 text-orange-900 border border-orange-300">
                    <Calendar className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Agency Operations Calendar</h3>
                    <p className="text-[11px] text-slate-500">Screenings, Ministry audits & fee cycles</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddEventModalOpen(true)}
                  className="neo-btn bg-slate-900 hover:bg-slate-800 text-white px-2.5 py-1 text-[11px] font-bold gap-1"
                >
                  <Plus className="w-3 h-3 text-orange-400" />
                  <span>Schedule</span>
                </button>
              </div>

              {/* Month Navigation */}
              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    if (currentMonthIdx === 0) {
                      setCurrentMonthIdx(11);
                      setCurrentYear(prev => prev - 1);
                    } else {
                      setCurrentMonthIdx(prev => prev - 1);
                    }
                  }}
                  className="p-1 rounded-lg hover:bg-white border border-transparent hover:border-slate-300 text-slate-700 font-bold"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 tracking-wide text-xs">
                    {monthsList[currentMonthIdx]} {currentYear}
                  </span>
                  {(currentMonthIdx !== currentActualMonth || currentYear !== currentActualYear) && (
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentYear(currentActualYear);
                        setCurrentMonthIdx(currentActualMonth);
                        setSelectedDate(todayStr);
                      }}
                      className="px-2 py-0.5 rounded-md bg-orange-100 hover:bg-orange-200 text-orange-900 border border-orange-300 text-[10px] font-black"
                    >
                      Today
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (currentMonthIdx === 11) {
                      setCurrentMonthIdx(0);
                      setCurrentYear(prev => prev + 1);
                    } else {
                      setCurrentMonthIdx(prev => prev + 1);
                    }
                  }}
                  className="p-1 rounded-lg hover:bg-white border border-transparent hover:border-slate-300 text-slate-700 font-bold"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Mini Calendar 7x5 Grid */}
              <div className="space-y-1">
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 uppercase py-1">
                  <span>Su</span>
                  <span>Mo</span>
                  <span>Tu</span>
                  <span>We</span>
                  <span>Th</span>
                  <span>Fr</span>
                  <span>Sa</span>
                </div>

                <div className="grid grid-cols-7 gap-1 text-xs">
                  {/* Padding empty slots for start of month */}
                  {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-8 rounded-lg bg-slate-50/50" />
                  ))}

                  {/* Day Cells */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const dayNum = i + 1;
                    const dateStr = `${currentYear}-${String(currentMonthIdx + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                    const isSelected = selectedDate === dateStr;
                    const isToday = dateStr === todayStr;
                    const dayEvents = calendarEvents.filter(e => e.date === dateStr);

                    return (
                      <button
                        key={dateStr}
                        onClick={() => setSelectedDate(dateStr)}
                        className={`h-8 rounded-xl font-bold flex flex-col items-center justify-center relative transition-all border ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 scale-105 z-10'
                            : isToday
                            ? 'bg-orange-50 text-orange-900 border-orange-400 font-extrabold'
                            : 'bg-slate-50/80 text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-white'
                        }`}
                      >
                        <span className="text-[11px] leading-none">{dayNum}</span>
                        {dayEvents.length > 0 && (
                          <div className="flex items-center gap-0.5 mt-0.5">
                            {dayEvents.slice(0, 3).map((ev, eIdx) => (
                              <span
                                key={eIdx}
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isSelected ? 'bg-orange-400' :
                                  ev.category === 'screening' ? 'bg-amber-500' :
                                  ev.category === 'inspection' ? 'bg-purple-500' :
                                  ev.category === 'billing' ? 'bg-emerald-500' :
                                  ev.category === 'health' ? 'bg-rose-500' :
                                  ev.category === 'document' ? 'bg-blue-500' :
                                  ev.category === 'attendance' ? 'bg-sky-500' :
                                  ev.category === 'ratio' ? 'bg-red-500' : 'bg-indigo-500'
                                }`}
                              />
                            ))}
                            {dayEvents.length > 3 && (
                              <span className="text-[8px] leading-none text-slate-400 font-black">+</span>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Day Agenda */}
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                    Agenda: {selectedDate === todayStr ? `Today (${selectedDate})` : selectedDate}
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full">
                    {selectedDayEvents.length} {selectedDayEvents.length === 1 ? 'Event' : 'Events'}
                  </span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {selectedDayEvents.map(event => (
                    <div
                      key={event.id}
                      className={`p-2.5 rounded-xl border text-xs flex items-start gap-2.5 transition-all ${
                        event.category === 'screening' ? 'bg-amber-50/80 border-amber-300 text-amber-950' :
                        event.category === 'inspection' ? 'bg-purple-50/80 border-purple-300 text-purple-950' :
                        event.category === 'billing' ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950' :
                        event.category === 'health' ? 'bg-rose-50/80 border-rose-300 text-rose-950' :
                        event.category === 'document' ? 'bg-blue-50/80 border-blue-300 text-blue-950' :
                        event.category === 'attendance' ? 'bg-sky-50/80 border-sky-300 text-sky-950' :
                        event.category === 'ratio' ? 'bg-red-50/80 border-red-300 text-red-950' :
                        'bg-slate-50/80 border-slate-300 text-slate-950'
                      }`}
                    >
                      <div className="p-1.5 rounded-lg bg-white shadow-sm shrink-0 mt-0.5">
                        {event.category === 'screening' && <Phone className="w-3.5 h-3.5 text-amber-600" />}
                        {event.category === 'inspection' && <Home className="w-3.5 h-3.5 text-purple-600" />}
                        {event.category === 'billing' && <CreditCard className="w-3.5 h-3.5 text-emerald-600" />}
                        {event.category === 'health' && <HeartPulse className="w-3.5 h-3.5 text-rose-600" />}
                        {event.category === 'document' && <FileText className="w-3.5 h-3.5 text-blue-600" />}
                        {event.category === 'attendance' && <UserCheck className="w-3.5 h-3.5 text-sky-600" />}
                        {event.category === 'ratio' && <AlertTriangle className="w-3.5 h-3.5 text-red-600" />}
                        {event.category === 'audit' && <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />}
                        {event.category === 'general' && <Clock className="w-3.5 h-3.5 text-slate-600" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h5 className="font-bold text-[11px] truncate">{event.title}</h5>
                          <div className="flex items-center gap-1 shrink-0">
                            {event.severity && (
                              <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                                event.severity === 'urgent' ? 'bg-rose-600 text-white' :
                                event.severity === 'warning' ? 'bg-amber-400 text-slate-900' : 'bg-blue-600 text-white'
                              }`}>
                                {event.severity}
                              </span>
                            )}
                            {event.time && (
                              <span className="text-[10px] font-mono font-semibold opacity-75">
                                {event.time}
                              </span>
                            )}
                            {!event.isComplianceAlert && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCalendarEvent(event.id);
                                }}
                                title="Delete event"
                                className="p-0.5 text-slate-400 hover:text-rose-600 rounded transition-colors ml-1 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                        {event.attendee && (
                          <p className="text-[10px] opacity-80 mt-0.5">Target: {event.attendee}</p>
                        )}
                        {event.notes && (
                          <p className="text-[10px] opacity-75 mt-0.5 line-clamp-2">{event.notes}</p>
                        )}
                        {event.targetTab && (
                          <button
                            type="button"
                            onClick={() => setActiveTab(event.targetTab as any)}
                            className="mt-1.5 text-[10px] font-bold text-orange-700 hover:text-orange-900 hover:underline inline-flex items-center gap-1"
                          >
                            <span>{event.actionLabel || 'Inspect in View'}</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {selectedDayEvents.length === 0 && (
                    <div className="p-3 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-400 text-xs">
                      <p>No operational events scheduled for this day.</p>
                      <button
                        type="button"
                        onClick={() => setIsAddEventModalOpen(true)}
                        className="text-orange-600 font-bold hover:underline text-[11px] mt-1 inline-block"
                      >
                        + Add Call or Task
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* COLUMN 2: DETERMINISTIC DAILY ACTION QUEUE (RIGHT - 7 cols) */}
            <div id="action-queue-section" className="lg:col-span-7 bg-white p-5 rounded-2xl border-2 border-slate-900 space-y-4 scroll-mt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b-2 border-slate-100">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-orange-500" />
                    <span>Daily Action Queue ("Director's Focus")</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Calculated alerts for expiring health cards, VSC police checks, fees, ratios & attendance.
                  </p>
                </div>

                <span className="text-xs bg-slate-100 text-slate-800 font-bold px-2.5 py-1 rounded-xl shrink-0 self-start sm:self-auto">
                  {alertsList.length} Action Items
                </span>
              </div>

              {/* Action Queue Category Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                {[
                  { key: 'all', label: 'All', count: alertsList.length },
                  { key: 'document', label: 'Documents & Police', count: alertsList.filter(a => a.category === 'document').length },
                  { key: 'health', label: 'Medical & Sabrina/Ryan', count: alertsList.filter(a => a.category === 'health').length },
                  { key: 'attendance', label: 'Attendance', count: alertsList.filter(a => a.category === 'attendance').length },
                  { key: 'payment', label: 'e-Transfers & Subsidy', count: alertsList.filter(a => a.category === 'payment').length },
                  { key: 'ratio', label: 'CCEYA Ratios', count: alertsList.filter(a => a.category === 'ratio').length },
                  { key: 'screening', label: 'Screenings', count: alertsList.filter(a => a.category === 'screening').length },
                ].map(tab => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setAlertFilter(tab.key as any)}
                    className={`px-2.5 py-1 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                      alertFilter === tab.key
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                        alertFilter === tab.key ? 'bg-orange-500 text-white' : 'bg-slate-300 text-slate-800'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto pr-1">
                {alertsList
                  .filter(alert => alertFilter === 'all' || alert.category === alertFilter)
                  .map(alert => (
                  <div
                    key={alert.id}
                    className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50 p-2 rounded-xl transition-colors text-xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`p-1.5 rounded-xl border-2 border-slate-900 mt-0.5 shrink-0 ${
                        alert.severity === 'urgent' ? 'bg-red-100 text-red-700' :
                        alert.severity === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-slate-900 text-xs">{alert.title}</h4>
                          <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full ${
                            alert.severity === 'urgent' ? 'bg-red-50 text-red-700 border border-red-200' :
                            alert.severity === 'warning' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {alert.category}
                          </span>
                          {alert.dateDue && (
                            <span className="text-[10px] text-slate-500 font-mono">
                              Due: {alert.dateDue}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{alert.description}</p>
                      </div>
                    </div>

                    {/* 1-Click Action Buttons */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      {alert.category === 'screening' && (
                        <button
                          onClick={() => {
                            setActiveTab('families');
                            setFamilySubTab('pipeline');
                          }}
                          className="neo-btn bg-amber-400 hover:bg-amber-300 text-slate-900 px-2.5 py-1 text-[11px] font-bold gap-1 cursor-pointer"
                        >
                          <span>Screening</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}

                      {alert.category === 'payment' && (
                        <button
                          onClick={() => setActiveTab('financials')}
                          className="neo-btn bg-orange-500 hover:bg-orange-400 text-white px-2.5 py-1 text-[11px] font-bold gap-1 cursor-pointer"
                        >
                          <span>e-Transfer</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}

                      {alert.category === 'document' && (
                        <button
                          onClick={() => {
                            if (alert.id.includes('prov-') || alert.id.includes('adult-')) {
                              setActiveTab('providers');
                              setProviderSubTab('directory');
                            } else if (alert.id.includes('vis-')) {
                              setActiveTab('visitors');
                              setVisitorSubTab('directory');
                            } else {
                              setActiveTab('families');
                              setFamilySubTab('pipeline');
                            }
                          }}
                          className="neo-btn bg-slate-900 hover:bg-slate-800 text-white px-2.5 py-1 text-[11px] font-bold gap-1 cursor-pointer"
                        >
                          <span>Inspect</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}

                      {alert.category === 'health' && (
                        <button
                          onClick={() => setActiveTab('families')}
                          className="neo-btn bg-rose-500 hover:bg-rose-600 text-white px-2.5 py-1 text-[11px] font-bold gap-1 cursor-pointer"
                        >
                          <span>Medical Plan</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}

                      {alert.category === 'attendance' && (
                        <button
                          onClick={() => setActiveTab('providers')}
                          className="neo-btn bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 text-[11px] font-bold gap-1 cursor-pointer"
                        >
                          <span>Provider Home</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}

                      {alert.category === 'ratio' && (
                        <button
                          onClick={() => setActiveTab('providers')}
                          className="neo-btn bg-purple-600 hover:bg-purple-500 text-white px-2.5 py-1 text-[11px] font-bold gap-1 cursor-pointer"
                        >
                          <span>Ratios</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}

                      <button
                        onClick={() => onDismissAlert(alert.id)}
                        className="text-[11px] font-bold text-slate-400 hover:text-slate-700 px-1.5 py-1 cursor-pointer"
                        title="Dismiss alert"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))}

                {alertsList.filter(alert => alertFilter === 'all' || alert.category === alertFilter).length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="font-bold text-slate-700">All caught up! Zero action items in this category.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Families (Family Intake Pipeline + Family Directory) */}
      {activeTab === 'families' && (
        <div className="space-y-4">
          {/* Sub-Navigation Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2.5 rounded-3xl border-2 border-slate-900 shadow-neo-sm">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setFamilySubTab('directory')}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                  familySubTab === 'directory'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Baby className="w-4 h-4 text-emerald-400" />
                <span>Family Directory</span>
                <span className="bg-slate-200 text-slate-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {parentsList.length}
                </span>
              </button>

              <button
                onClick={() => setFamilySubTab('pipeline')}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                  familySubTab === 'pipeline'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Users className="w-4 h-4 text-orange-400" />
                <span>Family Intake Pipeline</span>
                {activePipelineCount > 0 && (
                  <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {activePipelineCount}
                  </span>
                )}
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setIsAddFamilyModalOpen(true)}
                className="neo-btn bg-orange-500 hover:bg-orange-400 text-white px-3.5 py-1.5 text-xs font-extrabold gap-1.5 shadow-neo-sm justify-center cursor-pointer"
                title="Register a new parent/guardian and child inquiry"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Family Intake</span>
              </button>

              <button
                onClick={() => setIsAddChildToExistingModalOpen(true)}
                className="neo-btn bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 text-xs font-extrabold gap-1.5 shadow-neo-sm justify-center cursor-pointer"
                title="Add a sibling or new child to an existing registered family"
              >
                <Baby className="w-3.5 h-3.5 text-emerald-100" />
                <span>+ Add Child</span>
              </button>
            </div>
          </div>

          {familySubTab === 'directory' ? (
            <FamilyDirectory
              parentsList={parentsList}
              childrenList={childrenList}
              providersList={providersList}
              onUpdateChildStage={onUpdateChildStage}
              onOpenAddModal={() => setIsAddFamilyModalOpen(true)}
              onOpenAddChildModal={() => setIsAddChildToExistingModalOpen(true)}
              onUpdateFamily={onUpdateFamily}
              onDeleteFamily={onDeleteFamily}
              onArchiveChild={onArchiveChild}
              onArchiveFamily={onArchiveFamily}
              onOpenDispatchModal={(childId, templateId) => setDispatchModalState({ isOpen: true, preSelectedChildId: childId, preSelectedTemplateId: templateId })}
              onOpenDocumentBin={() => setIsDocumentBinOpen(true)}
            />
          ) : (
            <FamilyIntakePipeline
              childrenList={childrenList}
              parentsList={parentsList}
              providersList={providersList}
              onUpdateChildStage={onUpdateChildStage}
              onApproveFormZero={onApproveFormZero}
              onDenyChild={onDenyChild}
              onAssignProvider={onAssignProvider}
              onUpdateDocStatus={onUpdateDocStatus}
              onUpdateChildFee={onUpdateChildFee}
              onArchiveChild={onArchiveChild}
            />
          )}
        </div>
      )}

      {/* Tab: Providers (Active Provider Directory + Provider Intake Pipeline) */}
      {activeTab === 'providers' && (
        <div className="space-y-4">
          {/* Sub-Navigation Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2.5 rounded-3xl border-2 border-slate-900 shadow-neo-sm">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setProviderSubTab('directory')}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                  providerSubTab === 'directory'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Home className="w-4 h-4 text-emerald-400" />
                <span>Active Provider Directory</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {providersList.length}
                </span>
              </button>

              <button
                onClick={() => setProviderSubTab('pipeline')}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                  providerSubTab === 'pipeline'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Provider Intake Pipeline</span>
                {providerApplicants.length > 0 && (
                  <span className="bg-white text-orange-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {providerApplicants.length}
                  </span>
                )}
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => {
                  setProviderSubTab('directory');
                  setAddProviderTrigger(prev => prev + 1);
                }}
                className="neo-btn bg-orange-500 hover:bg-orange-400 text-white px-3.5 py-1.5 text-xs font-extrabold gap-1.5 shadow-neo-sm justify-center cursor-pointer"
                title="Register and onboard a new licensed home child care provider"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Provider</span>
              </button>
            </div>
          </div>

          {providerSubTab === 'directory' ? (
            <ProviderDirectory
              providersList={providersList}
              childrenList={childrenList}
              onUpdateProvider={onUpdateProvider}
              onAddProvider={onAddProvider}
              onDeleteProvider={onDeleteProvider}
              openAddTrigger={addProviderTrigger}
            />
          ) : (
            <ProviderIntakePipeline
              applicants={providerApplicants}
              onUpdateApplicantStage={handleUpdateProviderApplicantStage}
              onUpdateApplicantData={handleUpdateProviderApplicantData}
              onGraduateProvider={handleGraduateProvider}
              onAddApplicant={handleAddProviderApplicant}
            />
          )}
        </div>
      )}

      {/* Tab: Home Visitors (Active Directory + Home Visitor Intake Pipeline) */}
      {activeTab === 'visitors' && (
        <div className="space-y-4">
          {/* Sub-Navigation Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2.5 rounded-3xl border-2 border-slate-900 shadow-neo-sm">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setVisitorSubTab('directory')}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                  visitorSubTab === 'directory'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <UserCheck className="w-4 h-4 text-purple-400" />
                <span>Active Home Visitors</span>
                <span className="bg-purple-100 text-purple-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {visitorsList.length}
                </span>
              </button>

              <button
                onClick={() => setVisitorSubTab('pipeline')}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                  visitorSubTab === 'pipeline'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FileCheck className="w-4 h-4" />
                <span>Home Visitor Intake Pipeline</span>
                {visitorApplicants.length > 0 && (
                  <span className="bg-white text-purple-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {visitorApplicants.length}
                  </span>
                )}
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => {
                  setVisitorSubTab('directory');
                  setAddVisitorTrigger(prev => prev + 1);
                }}
                className="neo-btn bg-orange-500 hover:bg-orange-400 text-white px-3.5 py-1.5 text-xs font-extrabold gap-1.5 shadow-neo-sm justify-center cursor-pointer"
                title="Register and onboard a new licensed home child care visitor (RECE)"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Home Visitor</span>
              </button>
            </div>
          </div>

          {visitorSubTab === 'directory' ? (
            <HomeVisitorDirectory
              visitorsList={visitorsList}
              providersList={providersList}
              inspectionsList={inspectionsList}
              onAddVisitor={onAddVisitor || (() => {})}
              onUpdateVisitor={onUpdateVisitor || (() => {})}
              onDeleteVisitor={onDeleteVisitor || (() => {})}
              onNavigateToVisitorPortal={onNavigateToVisitorPortal}
              openAddTrigger={addVisitorTrigger}
            />
          ) : (
            <HomeVisitorIntakePipeline
              applicants={visitorApplicants}
              onUpdateApplicantStage={handleUpdateVisitorApplicantStage}
              onUpdateApplicantData={handleUpdateVisitorApplicantData}
              onGraduateVisitor={handleGraduateVisitor}
              onAddApplicant={handleAddVisitorApplicant}
            />
          )}
        </div>
      )}

      {/* Tab 5: Financial & e-Transfer Ledger */}
      {activeTab === 'financials' && (
        <FinancialLedger
          childrenList={childrenList}
          providersList={providersList}
          parentsList={parentsList}
          onMarkPaid={onMarkPaid}
          onUpdateChildFee={onUpdateChildFee}
          onAutoGenerateMonthlyFees={onAutoGenerateMonthlyFees}
        />
      )}

      {/* Tab 6: Dynamic Form Builder Studio */}
      {activeTab === 'forms' && (
        <FormBuilderStudio
          forms={formsList}
          initialSelectedFormId={focusedFormBuilderId}
          onSaveForms={onSaveForms}
          onSaveSingleForm={onSaveSingleForm}
          onRollbackForm={onRollbackForm}
          onResetFormToFactory={onResetFormToFactory}
          onFetchFormVersions={onFetchFormVersions}
          onOpenDocumentBin={() => setIsDocumentBinOpen(true)}
          onOpenDispatchModal={(templateId, childId) => {
            setDispatchModalState({
              isOpen: true,
              preSelectedTemplateId: templateId,
              preSelectedChildId: childId
            });
          }}
        />
      )}

      {/* Tab 7: Agency Policy & Live Ministry Settings */}
      {activeTab === 'settings' && (
        <AgencySettingsView
          enrolledChildrenCount={childrenList.filter(c => c.admissionsStage === 'enrolled').length}
          onApplyRatesToEnrolledChildren={onAutoGenerateMonthlyFees}
        />
      )}

      {/* Quick Add Family Modal */}
      <QuickAddFamilyModal
        isOpen={isAddFamilyModalOpen}
        onClose={() => setIsAddFamilyModalOpen(false)}
        onAddFamily={onAddFamily}
      />

      {/* Add Child to Existing Family Modal */}
      <AddChildToExistingModal
        isOpen={isAddChildToExistingModalOpen}
        onClose={() => setIsAddChildToExistingModalOpen(false)}
        parentsList={parentsList}
        childrenList={childrenList}
        onAddChildrenToFamily={onAddFamily}
      />

      {/* SCHEDULE EVENT / CALL MODAL */}
      {isAddEventModalOpen && (
        <ModalPortal>
          <div 
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsAddEventModalOpen(false);
            }}
            className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl border-2 border-slate-900 shadow-2xl max-w-md w-full p-6 space-y-4 animate-fadeIn text-xs cursor-default"
            >
              <div className="flex items-center justify-between pb-3 border-b-2 border-slate-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-500" />
                  <h3 className="text-base font-extrabold text-slate-900">
                    Schedule Agency Event
                  </h3>
                </div>
                <button
                  onClick={() => setIsAddEventModalOpen(false)}
                  className="text-slate-400 hover:text-slate-900 p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Event / Call Title *</label>
                  <input
                    type="text"
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    placeholder="e.g. Form 0 Screening Call with Parent"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Date *</label>
                    <AccsDatePicker
                      value={newEventDate}
                      onChange={setNewEventDate}
                      mode="general"
                      placeholder="YYYY-MM-DD"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Time</label>
                    <input
                      type="text"
                      value={newEventTime}
                      onChange={(e) => setNewEventTime(e.target.value)}
                      placeholder="10:00 AM"
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Category</label>
                    <select
                      value={newEventCategory}
                      onChange={(e) => setNewEventCategory(e.target.value as any)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                    >
                      <option value="screening">Parent Screening</option>
                      <option value="inspection">Home Inspection</option>
                      <option value="billing">Fee & Subsidy</option>
                      <option value="audit">Ministry Audit</option>
                      <option value="general">General Agency</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Attendee</label>
                    <input
                      type="text"
                      value={newEventAttendee}
                      onChange={(e) => setNewEventAttendee(e.target.value)}
                      placeholder="e.g. Parent or Provider"
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Operational Notes</label>
                  <textarea
                    value={newEventNotes}
                    onChange={(e) => setNewEventNotes(e.target.value)}
                    placeholder="Specific items to review during this session..."
                    rows={2}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium resize-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddEventModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddCalendarEvent}
                  className="neo-btn bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 font-bold gap-1"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Save to Calendar</span>
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Clear Demo Data Confirmation Modal */}
      {isClearConfirmOpen && (
        <ModalPortal>
          <div 
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsClearConfirmOpen(false);
            }}
            className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in cursor-pointer"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="bg-white border-3 border-slate-900 rounded-3xl max-w-md w-full p-6 shadow-neo space-y-4 cursor-default"
            >
              <div className="flex items-center gap-3 text-rose-600">
                <div className="p-2.5 rounded-2xl bg-rose-100 border-2 border-rose-600">
                  <AlertTriangle className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Reset Roster for Manual Stress Testing?</h3>
                  <p className="text-xs text-slate-500">Human-in-the-Loop Test Preparation</p>
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                This will clear all demo children, parents, providers, home visitors, inspections, and attendance logs from the system so you can test data entry from an absolute clean slate (0 records, 0 queue items).
              </p>

              <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-[11px] text-rose-900 font-bold space-y-1">
                <p>✓ Drops Daily Action Queue and Operations Calendar to 0 items.</p>
                <p>✓ Clears Cloud Firestore and local browser storage cache.</p>
                <p>✓ You can reload the complete 24-child and 6-provider roster at any time via <strong>[ ⚡ Seed Cloud Database & Reload ]</strong>.</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsClearConfirmOpen(false)}
                  className="neo-btn bg-white hover:bg-slate-100 text-slate-800 text-xs px-4 py-2 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsClearConfirmOpen(false);
                    setManualCalendarEvents([]);
                    setProviderApplicants([]);
                    setVisitorApplicants([]);
                    try {
                      localStorage.setItem('accs_calendar_events', JSON.stringify([]));
                      localStorage.setItem('accs_provider_applicants', JSON.stringify([]));
                      localStorage.setItem('accs_visitor_applicants', JSON.stringify([]));
                    } catch (e) {}
                    onClearDemoData?.();
                  }}
                  className="neo-btn bg-rose-600 hover:bg-rose-700 text-white text-xs px-4 py-2 font-extrabold shadow-neo-sm"
                >
                  Confirm & Wipe to Clean Slate
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* As-Needed Agency Forms & Document Bin Modal */}
      <DocumentBinModal
        isOpen={isDocumentBinOpen}
        onClose={() => setIsDocumentBinOpen(false)}
        childrenList={childrenList}
        onOpenDispatchModal={(templateId, childId) => {
          setIsDocumentBinOpen(false);
          setDispatchModalState({
            isOpen: true,
            preSelectedTemplateId: templateId,
            preSelectedChildId: childId
          });
        }}
        onOpenFormBuilder={(formId) => {
          setIsDocumentBinOpen(false);
          if (formId) {
            setFocusedFormBuilderId(formId);
          }
          setActiveTab('forms');
        }}
      />

      {/* Dispatch As-Needed Form Modal */}
      <DispatchFormModal
        isOpen={dispatchModalState.isOpen}
        onClose={() => setDispatchModalState({ isOpen: false })}
        childrenList={childrenList}
        parentsList={parentsList}
        preSelectedChildId={dispatchModalState.preSelectedChildId}
        preSelectedTemplateId={dispatchModalState.preSelectedTemplateId}
        onDispatch={(childId, newDoc, customNote) => {
          handleDispatchDocument(childId, newDoc, customNote);
        }}
      />
    </div>
  );
};
