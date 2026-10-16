import React, { useState, useEffect } from 'react';
import { 
  UserRole, 
  Provider, 
  Child, 
  ParentGuardian, 
  DailyActionAlert, 
  AdmissionsStage, 
  DocumentRecord, 
  DocumentStatus,
  HomeVisitor,
  HomeInspectionRecord,
  AttendanceEntry
} from './types';
import { FormTemplate, FormVersionRecord, FormField, FormSection } from './types/formSchema';
import { 
  INITIAL_PROVIDERS, 
  INITIAL_CHILDREN, 
  INITIAL_PARENTS, 
  INITIAL_ALERTS,
  INITIAL_HOME_VISITORS,
  INITIAL_INSPECTIONS,
  getProviderPhoto,
  getVisitorPhoto
} from './data/mockData';
import { getAllTestFamiliesData } from './data/testFamiliesData';
import { ALL_INITIAL_FORMS } from './data/allFormsData';
import { 
  subscribeToForms, 
  subscribeToParents, 
  subscribeToChildren, 
  subscribeToAttendance,
  subscribeToProviders,
  subscribeToVisitors,
  subscribeToInspections,
  saveInspectionToFirestore,
  seedInitialFirestoreData,
  updateAttendanceInFirestore,
  saveFormTemplatesToFirestore,
  saveFormVersion,
  getFormVersionHistory,
  rollbackFormToVersion,
  resetFormToFactoryDefault,
  clearAgencyDataToFresh,
  subscribeToAgencySettings,
  COLLECTIONS 
} from './services/firebaseService';
import { calculateMonthlyFee } from './data/agencySettingsData';
import { db } from './lib/firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { Header } from './components/Header';
import { AdminCommandCentre } from './components/admin/AdminCommandCentre';
import { ProviderPortal } from './components/provider/ProviderPortal';
import { ParentPortal } from './components/parent/ParentPortal';
import { HomeVisitorPortal } from './components/visitor/HomeVisitorPortal';
import { PublicRegistrationPage } from './components/public/PublicRegistrationPage';
import { PublicProviderApplyPage } from './components/public/PublicProviderApplyPage';
import { PublicVisitorApplyPage } from './components/public/PublicVisitorApplyPage';
import { PhysicalBinderModal } from './components/admin/PhysicalBinderModal';
import { PdfSignerModal } from './components/common/PdfSignerModal';
import { TestFamiliesSandbox } from './components/sandbox/TestFamiliesSandbox';
import { AdminAuthGate } from './components/admin/AdminAuthGate';
import { AccsAiAssistant, FormActionPayload } from './components/chat/AccsAiAssistant';
import { calculateComplianceAlerts } from './lib/complianceEngine';
import { cacheInspectionsLocally } from './utils/offlineSync';

export const App: React.FC = () => {
  // Parse Magic Link & Registration Query Parameters and Pathname
  const pathname = typeof window !== 'undefined' ? window.location.pathname.toLowerCase() : '';
  const urlParams = new URLSearchParams(window.location.search);
  const magicFamilyId = urlParams.get('familyId') || urlParams.get('parentId');
  const magicProviderId = urlParams.get('providerId');
  const magicVisitorId = urlParams.get('visitorId');
  const isMagicLink = Boolean(magicFamilyId) || Boolean(magicProviderId) || Boolean(magicVisitorId);
  const isSandboxView = pathname.includes('/sandbox') || pathname.includes('/test-families') || urlParams.get('view') === 'sandbox' || urlParams.get('role') === 'sandbox';
  const isRegisterView = pathname.includes('/register') || pathname.includes('/apply') || urlParams.get('view') === 'register' || urlParams.get('view') === 'apply' || urlParams.get('role') === 'register';
  const isApplyProviderView = pathname.includes('/apply-provider') || urlParams.get('role') === 'apply-provider' || urlParams.get('view') === 'apply-provider';
  const isApplyVisitorView = pathname.includes('/apply-visitor') || urlParams.get('role') === 'apply-visitor' || urlParams.get('view') === 'apply-visitor';
  
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    // Require Google or Email sign-in on first visit to capture customer info for mailing list
    if (typeof window !== 'undefined') {
      try {
        const userEmail = localStorage.getItem('daycare_os_user_email');
        const sessionActive = sessionStorage.getItem('daycare_os_session_active');
        const guestAccess = localStorage.getItem('daycare_os_guest_access');
        if (userEmail || sessionActive === 'true' || guestAccess === 'true') {
          return true;
        }
      } catch (e) {}
    }
    return false;
  });

  const initialRole: UserRole = isApplyProviderView
    ? 'apply-provider'
    : isApplyVisitorView
    ? 'apply-visitor'
    : isSandboxView
    ? 'sandbox'
    : isRegisterView 
    ? 'register' 
    : (Boolean(magicProviderId) || urlParams.get('role') === 'provider')
    ? 'provider'
    : (Boolean(magicVisitorId) || urlParams.get('role') === 'visitor')
    ? 'visitor'
    : (Boolean(magicFamilyId) || urlParams.get('role') === 'parent')
    ? 'parent' 
    : ((urlParams.get('role') as UserRole) || 'admin');

  const [currentRole, setCurrentRole] = useState<UserRole>(initialRole);
  const [activeFamilyId, setActiveFamilyId] = useState<string | undefined>(magicFamilyId || undefined);
  const [activeVisitorId, setActiveVisitorId] = useState<string | undefined>(magicVisitorId || undefined);
  const [activeProviderId, setActiveProviderId] = useState<string | undefined>(magicProviderId || undefined);
  const [activeBrand, setActiveBrand] = useState<string>('All Child Care Solutions');

  const handleLogoutAdmin = () => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('accs_admin_authenticated');
        sessionStorage.removeItem('accs_site_authenticated');
        localStorage.removeItem('accs_admin_session_active');
        localStorage.removeItem('accs_site_authenticated');
      } catch (e) {}
    }
    setIsAdminAuthenticated(false);
  };
  
  // Central Application Data State
  const [providers, setProviders] = useState<Provider[]>(INITIAL_PROVIDERS);
  const [children, setChildren] = useState<Child[]>(INITIAL_CHILDREN);
  const [parents, setParents] = useState<ParentGuardian[]>(INITIAL_PARENTS);
  const [alerts, setAlerts] = useState<DailyActionAlert[]>(INITIAL_ALERTS);
  const [formsList, setFormsList] = useState<FormTemplate[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('accs_cached_forms');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return ALL_INITIAL_FORMS;
  });
  const [homeVisitors, setHomeVisitors] = useState<HomeVisitor[]>(INITIAL_HOME_VISITORS);
  const [homeInspections, setHomeInspections] = useState<HomeInspectionRecord[]>(INITIAL_INSPECTIONS);
  const [isBinderModalOpen, setIsBinderModalOpen] = useState(false);
  const [isPdfSignerOpen, setIsPdfSignerOpen] = useState(false);

  // Responsive Side-Docking AI Assistant Split-View State (Task #27)
  const [isAiDockOpen, setIsAiDockOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('accs_ai_dock_open') === 'true';
      } catch (e) {
        return false;
      }
    }
    return false;
  });

  const [panelWidthMode, setPanelWidthMode] = useState<'quarter' | 'third'>(() => {
    if (typeof window !== 'undefined') {
      try {
        return (localStorage.getItem('accs_ai_panel_width') as 'quarter' | 'third') || 'quarter';
      } catch (e) {
        return 'quarter';
      }
    }
    return 'quarter';
  });

  useEffect(() => {
    try {
      localStorage.setItem('accs_ai_dock_open', String(isAiDockOpen));
    } catch (e) {}
  }, [isAiDockOpen]);

  // Initial prompt auto-loaded into AI Chatbot input (from Action Queue card, etc.)
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string | null>(null);

  const handleOpenAiWithPrompt = (prompt: string) => {
    setIsAiDockOpen(true);
    setAiInitialPrompt(prompt);
  };

  useEffect(() => {
    try {
      localStorage.setItem('accs_ai_panel_width', panelWidthMode);
    } catch (e) {}
  }, [panelWidthMode]);

  // Admin Portal Active Sub-Tab State
  const [adminActiveTab, setAdminActiveTab] = useState<'command' | 'families' | 'providers' | 'visitors' | 'forms' | 'financials' | 'settings'>('command');

  const handleNavigateAdminDashboard = () => {
    setCurrentRole('admin');
    setAdminActiveTab('command');
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('role', 'admin');
      url.searchParams.delete('familyId');
      url.searchParams.delete('providerId');
      url.searchParams.delete('childId');
      window.history.pushState({}, '', url.toString());
    } catch (e) {}
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('accs-navigate-admin-dashboard'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Track dismissed alert IDs locally
  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('accs_dismissed_alerts');
        return cached ? JSON.parse(cached) : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Provider-Controlled Daily Attendance State: [childId]: AttendanceEntry
  const [attendanceState, setAttendanceState] = useState<Record<string, AttendanceEntry>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('accs_attendance_cache');
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (e) {
        console.warn('Attendance cache read error:', e);
      }
    }
    return {
      'child-1': { status: 'present', checkIn: '8:15 AM' },
      'child-2': { status: 'departed', checkIn: '8:15 AM', checkOut: '4:45 PM', pickedUpBy: 'Sarah Connor (Mother)', netHours: 8.5 },
      'child-3': { status: 'present', checkIn: '8:45 AM' },
      'child-4': { status: 'absent' }
    };
  });

  // Calculate dynamic compliance alerts deterministically
  const activeAlerts = React.useMemo(() => {
    const computed = calculateComplianceAlerts({
      providers,
      homeVisitors,
      children,
      parents,
      attendanceState: attendanceState || {}
    });
    return computed.filter(a => !dismissedAlertIds.includes(a.id));
  }, [providers, homeVisitors, children, parents, attendanceState, dismissedAlertIds]);

  const handleAddVisitor = (newVisitor: HomeVisitor) => {
    setHomeVisitors(prev => [newVisitor, ...prev]);
  };

  const handleUpdateVisitor = (updatedVisitor: HomeVisitor) => {
    setHomeVisitors(prev => prev.map(v => v.id === updatedVisitor.id ? updatedVisitor : v));
  };

  const handleDeleteVisitor = (visitorId: string) => {
    setHomeVisitors(prev => prev.filter(v => v.id !== visitorId));
  };

  const handleSaveInspection = async (inspection: HomeInspectionRecord) => {
    setHomeInspections(prev => [inspection, ...prev]);
    try {
      await saveInspectionToFirestore(inspection);
      await cacheInspectionsLocally([inspection]);
    } catch (err) {
      console.warn('Inspection immediate remote save warning (record preserved locally):', err);
    }
  };

  const handleToggleAttendance = async (
    childId: string, 
    newStatus: string, 
    checkIn?: string, 
    checkOut?: string, 
    pickedUpBy?: string, 
    netHours?: number
  ) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setAttendanceState(prev => {
      const existing = prev[childId] || { status: 'not_checked_in' };
      const resolvedCheckIn = checkIn !== undefined 
        ? checkIn 
        : (newStatus === 'present' ? (existing.checkIn || nowTime) : existing.checkIn);
      const resolvedCheckOut = checkOut !== undefined
        ? checkOut
        : (newStatus === 'departed' ? (existing.checkOut || nowTime) : (newStatus === 'present' ? undefined : existing.checkOut));
      const resolvedPickedUpBy = pickedUpBy !== undefined ? pickedUpBy : existing.pickedUpBy;
      const resolvedNetHours = netHours !== undefined ? netHours : existing.netHours;

      const updatedEntry: AttendanceEntry = {
        ...existing,
        status: newStatus,
        checkIn: resolvedCheckIn,
        checkOut: resolvedCheckOut,
        pickedUpBy: resolvedPickedUpBy,
        netHours: resolvedNetHours
      };

      const next = {
        ...prev,
        [childId]: updatedEntry
      };

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('accs_attendance_cache', JSON.stringify(next));
          if ('BroadcastChannel' in window) {
            const bc = new BroadcastChannel('accs_attendance_channel');
            bc.postMessage({ 
              type: 'ATTENDANCE_UPDATE', 
              childId, 
              status: newStatus, 
              checkIn: resolvedCheckIn, 
              checkOut: resolvedCheckOut,
              pickedUpBy: resolvedPickedUpBy,
              netHours: resolvedNetHours,
              fullState: next 
            });
            bc.close();
          }
        } catch (e) {
          console.warn('Attendance broadcast error:', e);
        }
      }
      return next;
    });

    // Cloud Firestore Sync
    await updateAttendanceInFirestore(childId, newStatus, checkIn, checkOut, pickedUpBy, netHours);
  };

  // Real-time Firestore subscriptions & cross-tab synchronization
  useEffect(() => {
    // 1. Form Templates
    const unsubForms = subscribeToForms((liveForms) => {
      if (liveForms && liveForms.length > 0) {
        // Remote Firestore forms are the single authoritative source of truth.
        // No cascading, no field merging, no resurrection of intentionally deleted fields.
        const remoteMap = new Map(liveForms.map(f => [f.id, f]));

        const mergedForms = ALL_INITIAL_FORMS.map(initForm => {
          const remote = remoteMap.get(initForm.id);
          // If remote form exists with sections, use it directly as the sole source of truth!
          if (remote && Array.isArray(remote.sections) && remote.sections.length > 0) {
            return remote;
          }
          return initForm;
        });

        // Also preserve any brand-new custom forms created by Admin in Firestore
        const customForms = liveForms.filter(rf => !ALL_INITIAL_FORMS.some(init => init.id === rf.id));
        const finalForms = [...mergedForms, ...customForms];

        setFormsList(finalForms);
        try {
          localStorage.setItem('accs_cached_forms', JSON.stringify(finalForms));
        } catch (e) {}
      }
    });

    // 2. Parents / Families
    const unsubParents = subscribeToParents((liveParents) => {
      if (liveParents && liveParents.length > 0) {
        setParents(liveParents);
      }
    });

    // 3. Children
    const unsubChildren = subscribeToChildren((liveChildren) => {
      if (liveChildren && liveChildren.length > 0) {
        setChildren(liveChildren);
      }
    });

    // 4. Real-time Daily Attendance from Cloud Firestore
    const unsubAttendance = subscribeToAttendance((remoteAttendance) => {
      if (remoteAttendance && Object.keys(remoteAttendance).length > 0) {
        setAttendanceState(prev => {
          const merged = { ...prev, ...remoteAttendance };
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('accs_attendance_cache', JSON.stringify(merged));
            } catch (e) {}
          }
          return merged;
        });
      }
    });

    // 5. Licensed Providers from Cloud Firestore
    const unsubProviders = subscribeToProviders((liveProviders) => {
      if (liveProviders && liveProviders.length > 0) {
        setProviders(liveProviders.map(p => ({
          ...p,
          photoUrl: getProviderPhoto(p)
        })));
      }
    });

    // 6. Home Visitors from Cloud Firestore
    const unsubVisitors = subscribeToVisitors((liveVisitors) => {
      if (liveVisitors && liveVisitors.length > 0) {
        setHomeVisitors(liveVisitors.map(v => ({
          ...v,
          photoUrl: getVisitorPhoto(v)
        })));
      }
    });

    // 7. Home Inspections from Cloud Firestore
    const unsubInspections = subscribeToInspections((liveInspections) => {
      if (liveInspections && liveInspections.length > 0) {
        setHomeInspections(liveInspections);
      }
    });

    // 8. Agency Policy & Compliance Settings from Cloud Firestore
    const unsubSettings = subscribeToAgencySettings((remoteSettings) => {
      if (remoteSettings) {
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('accs_agency_policy_settings', JSON.stringify(remoteSettings));
            window.dispatchEvent(new CustomEvent('accs_settings_updated', { detail: remoteSettings }));
          } catch (e) {}
        }
      }
    });

    // 9. Cross-Tab Real-time Broadcast Channel & LocalStorage Listeners
    let channel: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channel = new BroadcastChannel('accs_attendance_channel');
      channel.onmessage = (event) => {
        if (event.data?.type === 'ATTENDANCE_UPDATE' && event.data.fullState) {
          setAttendanceState(event.data.fullState);
        }
      };
    }

    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key === 'accs_attendance_cache' && event.newValue) {
        try {
          setAttendanceState(JSON.parse(event.newValue));
        } catch (e) {}
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageEvent);
    }

    return () => {
      if (unsubForms) unsubForms();
      if (unsubParents) unsubParents();
      if (unsubChildren) unsubChildren();
      if (unsubAttendance) unsubAttendance();
      if (unsubProviders) unsubProviders();
      if (unsubVisitors) unsubVisitors();
      if (unsubInspections) unsubInspections();
      if (unsubSettings) unsubSettings();
      if (channel) channel.close();
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageEvent);
      }
    };
  }, []);

  // Handlers for Admin Pipeline & Intake with Cloud Firestore Real-Time Sync
  const handleUpdateChildStage = async (childId: string, newStage: AdmissionsStage) => {
    setChildren(prev => prev.map(c => c.id === childId ? { ...c, admissionsStage: newStage } : c));
    try {
      await setDoc(doc(db, COLLECTIONS.CHILDREN, childId), { admissionsStage: newStage }, { merge: true });
    } catch (err) {
      console.warn('Firestore update child stage warning:', err);
    }
  };

  const handleDenyChild = async (childId: string, reason?: string) => {
    setChildren(prev => prev.map(c => c.id === childId ? { 
      ...c, 
      admissionsStage: 'withdrawn',
      withdrawnReason: reason || c.withdrawnReason || 'Denied during screening'
    } : c));
    setAlerts(prev => prev.filter(a => a.actionableTarget !== childId));
    try {
      await setDoc(doc(db, COLLECTIONS.CHILDREN, childId), { 
        admissionsStage: 'withdrawn',
        withdrawnReason: reason || 'Denied during screening'
      }, { merge: true });
    } catch (err) {
      console.warn('Firestore deny child warning:', err);
    }
  };

  const [isSeedingData, setIsSeedingData] = useState(false);

  const handleSeedAndLoadData = async () => {
    setIsSeedingData(true);
    try {
      const { children: testChildren, parents: testParents } = getAllTestFamiliesData();
      setChildren(testChildren);
      setParents(testParents);
      setProviders(INITIAL_PROVIDERS);
      setHomeVisitors(INITIAL_HOME_VISITORS);
      setHomeInspections(INITIAL_INSPECTIONS);
      setAttendanceState({
        'child-fam-8': { status: 'present', checkIn: '8:15 AM' },
        'child-fam-12': { status: 'present', checkIn: '8:30 AM' },
        'child-fam-21': { status: 'present', checkIn: '8:45 AM' },
        'child-fam-22': { status: 'present', checkIn: '9:00 AM' },
        'child-fam-10': { status: 'present', checkIn: '8:30 AM' },
        'child-fam-11': { status: 'present', checkIn: '6:45 AM' }
      });
      // Push to Cloud Firestore so the hosted live site mirrors local!
      await seedInitialFirestoreData();
    } catch (err) {
      console.warn('Seed database error:', err);
    } finally {
      setIsSeedingData(false);
    }
  };

  const handleAssignProvider = async (childId: string, providerId: string) => {
    setChildren(prev => prev.map(c => c.id === childId ? { ...c, providerId } : c));
    try {
      await setDoc(doc(db, COLLECTIONS.CHILDREN, childId), { providerId }, { merge: true });
    } catch (err) {
      console.warn('Firestore assign provider warning:', err);
    }
  };

  const handleUpdateDocStatus = async (
    childId: string, 
    docId: string, 
    status: DocumentStatus, 
    extraData?: { fileName?: string; fileUrl?: string; uploadedAt?: string }
  ) => {
    let updatedDocsList: DocumentRecord[] = [];
    setChildren(prev => prev.map(c => {
      if (c.id !== childId) return c;
      const existingDocs = c.documents || [];
      const docExists = existingDocs.some(d => d.id === docId);
      const updatedDocs: DocumentRecord[] = docExists
        ? existingDocs.map(d => d.id === docId ? { ...d, status, ...(extraData || {}) } : d)
        : [...existingDocs, { id: docId, type: 'immunization' as const, title: 'Document', status, ...(extraData || {}) }];
      updatedDocsList = updatedDocs;
      return { ...c, documents: updatedDocs };
    }));
    try {
      if (updatedDocsList.length > 0) {
        await setDoc(doc(db, COLLECTIONS.CHILDREN, childId), { documents: updatedDocsList }, { merge: true });
      }
    } catch (err) {
      console.warn('Firestore update doc status warning:', err);
    }
  };

  const handleApproveFormZero = async (parentId: string) => {
    setParents(prev => prev.map(p => p.id === parentId ? { ...p, formZeroApproved: true } : p));
    setAlerts(prev => prev.filter(a => a.category !== 'screening'));
    try {
      await setDoc(doc(db, COLLECTIONS.PARENTS, parentId), { formZeroApproved: true }, { merge: true });
    } catch (err) {
      console.warn('Firestore approve parent formZero warning:', err);
    }
  };

  const handleDismissAlert = (alertId: string) => {
    setDismissedAlertIds(prev => {
      const next = [...prev, alertId];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('accs_dismissed_alerts', JSON.stringify(next));
        } catch (e) {}
      }
      return next;
    });
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  const handleSaveForms = (updatedForms: FormTemplate[]) => {
    setFormsList(updatedForms);
    saveFormTemplatesToFirestore(updatedForms);
  };

  const handleSaveSingleForm = async (form: FormTemplate, changeSummary: string, author?: string) => {
    setFormsList(prev => prev.map(f => f.id === form.id ? form : f));
    return await saveFormVersion(form, changeSummary, author || 'Agency Director (Admin)');
  };

  const handleRollbackFormVersion = async (formId: string, versionRecord: FormVersionRecord) => {
    const res = await rollbackFormToVersion(formId, versionRecord, 'Agency Director (Admin Rollback)');
    if (res.success) {
      setFormsList(prev => prev.map(f => f.id === formId ? { 
        ...versionRecord.formSnapshot, 
        version: `2026.${res.newVersion}`, 
        versionNumber: res.newVersion,
        lastUpdated: new Date().toISOString()
      } : f));
    }
    return res;
  };

  const handleResetFormToFactory = async (formId: string) => {
    const res = await resetFormToFactoryDefault(formId, 'Agency Director (Factory Reset)');
    if (res.success) {
      const defaultForm = ALL_INITIAL_FORMS.find(f => f.id === formId);
      if (defaultForm) {
        setFormsList(prev => prev.map(f => f.id === formId ? { 
          ...defaultForm, 
          version: `2026.${res.newVersion}`, 
          versionNumber: res.newVersion,
          lastUpdated: new Date().toISOString()
        } : f));
      }
    }
    return res;
  };

  const handleFetchFormVersions = async (formId: string) => {
    return await getFormVersionHistory(formId);
  };

  const handleApplyAiFormAction = async (action: FormActionPayload) => {
    const actionsToRun: FormActionPayload[] = (action.action === 'BATCH_ACTIONS' && action.actions)
      ? action.actions
      : [action];

    if (actionsToRun.length === 0) {
      return { success: false, error: 'No actions to apply' };
    }

    const formId = action.formId || actionsToRun[0].formId || '';
    const rawFormTarget = formId.toLowerCase().trim();
    const targetForm = formsList.find(f => 
      f.id.toLowerCase() === rawFormTarget ||
      f.formCode.toLowerCase() === rawFormTarget ||
      f.id.replace('form-', '').toLowerCase() === rawFormTarget ||
      f.id.replace('-form-', '-').toLowerCase() === rawFormTarget ||
      f.formCode.toLowerCase().replace('-', '') === rawFormTarget.replace('-', '') ||
      f.title.toLowerCase().includes(rawFormTarget)
    );

    if (!targetForm) {
      return { success: false, error: `Target Form "${formId}" not found in active registry.` };
    }

    let updatedSections = [...targetForm.sections];

    const findSectionIndex = (secId?: string): number => {
      if (!secId) return 0;
      const clean = secId.toLowerCase().trim();
      let idx = updatedSections.findIndex(s => s.id.toLowerCase() === clean);
      if (idx >= 0) return idx;
      idx = updatedSections.findIndex(s => s.id.toLowerCase().includes(clean) || clean.includes(s.id.toLowerCase()));
      if (idx >= 0) return idx;
      idx = updatedSections.findIndex(s => s.title.toLowerCase().includes(clean) || clean.includes(s.title.toLowerCase()));
      if (idx >= 0) return idx;
      const numMatch = clean.match(/\b([1-9])\b/);
      if (numMatch) {
        const parsed = parseInt(numMatch[1], 10) - 1;
        if (parsed >= 0 && parsed < updatedSections.length) return parsed;
      }
      return 0;
    };

    for (const act of actionsToRun) {
      if (act.action === 'ADD_SECTION') {
        const newSec: FormSection = {
          id: act.sectionId || `sec-${Date.now()}`,
          title: act.sectionTitle || 'New Section',
          description: act.sectionDescription || '',
          fields: act.fields || []
        };
        updatedSections.push(newSec);
      } else if (act.action === 'REMOVE_SECTION' && act.sectionId) {
        const secIdx = findSectionIndex(act.sectionId);
        if (secIdx >= 0 && updatedSections.length > 1) {
          updatedSections.splice(secIdx, 1);
        }
      } else if (act.action === 'UPDATE_WHOLE_FORM' && act.sections) {
        updatedSections = act.sections;
      } else if (act.action === 'ADD_FIELD' && act.field) {
        const secIdx = findSectionIndex(act.sectionId);
        const targetSec = updatedSections[secIdx];

        // Ensure field has safe identifiers
        if (!act.field.id) {
          act.field.id = `f-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
        }
        if (!act.field.name) {
          act.field.name = act.field.label.toLowerCase().replace(/[^a-z0-9]/g, '_');
        }
        if (!act.field.gridCols) {
          act.field.gridCols = (act.field.type === 'textarea' || act.field.type === 'consent_clause' || act.field.type === 'signature') ? 1 : 2;
        }

        // If field already exists by name or id, replace it; otherwise append/insert
        const existingFieldIdx = targetSec.fields.findIndex(f => f.id === act.field!.id || f.name === act.field!.name);
        let updatedFields: FormField[];
        if (existingFieldIdx >= 0) {
          updatedFields = targetSec.fields.map((fld, idx) => idx === existingFieldIdx ? act.field! : fld);
        } else {
          // If inserting a last name field, place it right after f0-1 / parent_first_name if present
          if (act.field.name === 'parent_last_name' || act.field.id === 'f0-1-last') {
            const f01Idx = targetSec.fields.findIndex(f => f.id === 'f0-1' || f.name === 'parent_first_name' || f.name === 'parent_full_name');
            if (f01Idx >= 0) {
              updatedFields = [
                ...targetSec.fields.slice(0, f01Idx + 1),
                act.field,
                ...targetSec.fields.slice(f01Idx + 1)
              ];
            } else {
              updatedFields = [...targetSec.fields, act.field];
            }
          } else {
            updatedFields = [...targetSec.fields, act.field];
          }
        }

        updatedSections[secIdx] = { ...targetSec, fields: updatedFields };
      } else if (act.action === 'MOVE_FIELD') {
        const secIdx = findSectionIndex(act.sectionId);
        const targetSec = updatedSections[secIdx];
        const fldId = act.fieldId || act.field?.id || act.field?.name;

        const fldIdx = targetSec.fields.findIndex(f => f.id === fldId || f.name === fldId);
        if (fldIdx >= 0) {
          const fieldsCopy = [...targetSec.fields];
          const [extracted] = fieldsCopy.splice(fldIdx, 1);
          const itemToInsert = act.field || extracted;
          
          const pos: any = act.targetPosition ?? act.position ?? 'top';
          if (pos === 'top' || pos === 'first' || pos === 0) {
            fieldsCopy.unshift(itemToInsert);
          } else if (pos === 'bottom' || pos === 'last') {
            fieldsCopy.push(itemToInsert);
          } else if (act.afterFieldId) {
            const afterIdx = fieldsCopy.findIndex(f => f.id === act.afterFieldId || f.name === act.afterFieldId);
            if (afterIdx >= 0) {
              fieldsCopy.splice(afterIdx + 1, 0, itemToInsert);
            } else {
              fieldsCopy.push(itemToInsert);
            }
          } else if (act.beforeFieldId) {
            const beforeIdx = fieldsCopy.findIndex(f => f.id === act.beforeFieldId || f.name === act.beforeFieldId);
            if (beforeIdx >= 0) {
              fieldsCopy.splice(beforeIdx, 0, itemToInsert);
            } else {
              fieldsCopy.unshift(itemToInsert);
            }
          } else if (typeof pos === 'number' && pos >= 0) {
            fieldsCopy.splice(pos, 0, itemToInsert);
          } else {
            fieldsCopy.unshift(itemToInsert);
          }
          updatedSections[secIdx] = { ...targetSec, fields: fieldsCopy };
        }
      } else if ((act.action === 'REORDER_FIELDS' || act.action === 'REPLACE_SECTION_FIELDS')) {
        const secIdx = findSectionIndex(act.sectionId);
        const targetSec = updatedSections[secIdx];
        if (act.fields) {
          updatedSections[secIdx] = { ...targetSec, fields: act.fields };
        } else if (act.orderedFieldIds) {
          const fieldMap = new Map(targetSec.fields.map(f => [f.id, f]));
          const reordered: FormField[] = [];
          for (const id of act.orderedFieldIds) {
            const f = fieldMap.get(id);
            if (f) {
              reordered.push(f);
              fieldMap.delete(id);
            }
          }
          for (const f of fieldMap.values()) {
            reordered.push(f);
          }
          updatedSections[secIdx] = { ...targetSec, fields: reordered };
        }
      } else if (act.action === 'UPDATE_FIELD' && act.field) {
        const isMoveToTop = act.targetPosition === 'top' || 
                            act.position === 'top' || 
                            act.field.order === 0 ||
                            act.changeSummary?.toLowerCase().includes('to the top') || 
                            act.changeSummary?.toLowerCase().includes('top of') ||
                            act.changeSummary?.toLowerCase().includes('renders first');

        const secIdx = findSectionIndex(act.sectionId);
        const targetSec = updatedSections[secIdx];
        const fldId = act.fieldId || act.field.id || act.field.name;
        const fldIdx = targetSec.fields.findIndex(f => f.id === fldId || f.name === fldId);

        if (isMoveToTop) {
          if (fldIdx >= 0) {
            const fieldsCopy = [...targetSec.fields];
            fieldsCopy.splice(fldIdx, 1);
            fieldsCopy.unshift(act.field);
            updatedSections[secIdx] = { ...targetSec, fields: fieldsCopy };
          } else {
            updatedSections[secIdx] = { ...targetSec, fields: [act.field, ...targetSec.fields] };
          }
        } else if (act.targetPosition === 'bottom' || act.position === 'bottom') {
          if (fldIdx >= 0) {
            const fieldsCopy = [...targetSec.fields];
            fieldsCopy.splice(fldIdx, 1);
            fieldsCopy.push(act.field);
            updatedSections[secIdx] = { ...targetSec, fields: fieldsCopy };
          } else {
            updatedSections[secIdx] = { ...targetSec, fields: [...targetSec.fields, act.field] };
          }
        } else {
          updatedSections = updatedSections.map(sec => ({
            ...sec,
            fields: sec.fields.map(fld => 
              fld.id === act.field!.id || 
              fld.name === act.field!.name || 
              (act.fieldId && (fld.id === act.fieldId || fld.name === act.fieldId)) 
                ? act.field! 
                : fld
            )
          }));
        }
      } else if (act.action === 'REMOVE_FIELD' && act.fieldId) {
        updatedSections = updatedSections.map(sec => ({
          ...sec,
          fields: sec.fields.filter(fld => fld.id !== act.fieldId && fld.name !== act.fieldId)
        }));
      }
    }

    // Normalize field order integers across all sections
    updatedSections = updatedSections.map(sec => ({
      ...sec,
      fields: sec.fields.map((fld, idx) => ({ ...fld, order: idx }))
    }));

    const updatedForm: FormTemplate = {
      ...targetForm,
      sections: updatedSections,
      lastUpdated: new Date().toISOString()
    };

    setFormsList(prev => {
      const next = prev.map(f => f.id === updatedForm.id ? updatedForm : f);
      try {
        localStorage.setItem('accs_cached_forms', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    const combinedSummary = action.changeSummary || actionsToRun.map(a => a.changeSummary).join('; ');
    const res = await saveFormVersion(updatedForm, combinedSummary, 'AI Assistant (Frontier LLM)');
    return { success: res.success, versionNumber: res.versionNumber };
  };

  const handleMarkPaid = async (childId: string) => {
    setChildren(prev => prev.map(c => c.id === childId ? { ...c, eTransferStatus: 'paid' } : c));
    setAlerts(prev => prev.filter(a => a.actionableTarget !== childId));
    try {
      await setDoc(doc(db, COLLECTIONS.CHILDREN, childId), { eTransferStatus: 'paid' }, { merge: true });
    } catch (err) {
      console.warn('Firestore mark paid warning:', err);
    }
  };

  const handleCompleteIntake = (newChildData: Partial<Child>, newParentData: Partial<ParentGuardian>) => {
    const newChildId = `child-${Date.now()}`;
    const newParentId = `parent-${Date.now()}`;

    const newChild: Child = {
      id: newChildId,
      fullName: newChildData.fullName || 'New Child',
      dob: newChildData.dob || '2024-01-01',
      ageMonths: 24,
      ageYearsFormatted: '2 yrs 0 mos',
      isUnderTwo: false,
      isUnderThree: true,
      fundingType: newChildData.fundingType || 'cwelcc',
      monthlyFee: calculateMonthlyFee(newChildData.fundingType || 'cwelcc'),
      eTransferDueDay: 31,
      eTransferStatus: 'pending',
      allergies: newChildData.allergies || [],
      dietaryRestrictions: newChildData.dietaryRestrictions || [],
      medicalNotes: newChildData.medicalNotes || '',
      epiPenRequired: newChildData.epiPenRequired || false,
      admissionsStage: 'docs_needed',
      parentId: newParentId,
      emergencyContacts: [
        { name: newParentData.fullName || 'Parent', relationship: 'Parent', phone: newParentData.phone || '' }
      ],
      documents: [
        { id: `doc-${Date.now()}-1`, type: 'birth_certificate', title: 'Birth Certificate', status: 'under_review' },
        { id: `doc-${Date.now()}-2`, type: 'health_card', title: 'Health Card', status: 'under_review' }
      ]
    };

    const newParent: ParentGuardian = {
      id: newParentId,
      fullName: newParentData.fullName || 'New Parent',
      email: newParentData.email || '',
      phone: newParentData.phone || '',
      homeAddress: newParentData.homeAddress || '',
      city: 'Oshawa',
      region: 'Durham Region',
      childIds: [newChildId],
      formZeroApproved: true,
      preferredStartDate: '2026-09-01',
      preferredSchedule: 'full_time'
    };

    setChildren(prev => [newChild, ...prev]);
    setParents(prev => [newParent, ...prev]);
  };

  const handleAddFamily = async (newParent: ParentGuardian, newChildren: Child[]) => {
    // Sanitize to plain object without undefined
    const cleanParent: ParentGuardian = JSON.parse(JSON.stringify(newParent));
    const cleanChildren: Child[] = JSON.parse(JSON.stringify(newChildren));

    setParents(prev => {
      const exists = prev.some(p => p.id === cleanParent.id);
      if (exists) {
        return prev.map(p => p.id === cleanParent.id ? {
          ...p,
          ...cleanParent,
          childIds: Array.from(new Set([...p.childIds, ...cleanChildren.map(c => c.id)]))
        } : p);
      }
      return [cleanParent, ...prev];
    });

    setChildren(prev => {
      const newIds = new Set(cleanChildren.map(c => c.id));
      const filteredPrev = prev.filter(c => !newIds.has(c.id));
      return [...cleanChildren, ...filteredPrev];
    });

    try {
      // Save to Cloud Firestore
      await setDoc(doc(db, COLLECTIONS.PARENTS, cleanParent.id), cleanParent, { merge: true });
      for (const child of cleanChildren) {
        await setDoc(doc(db, COLLECTIONS.CHILDREN, child.id), child, { merge: true });
      }
    } catch (err) {
      console.error('Firestore write error in handleAddFamily:', err);
    }
  };

  const handleUpdateFamily = async (updatedParent: ParentGuardian, updatedChildren: Child[]) => {
    setParents(prev => prev.map(p => p.id === updatedParent.id ? updatedParent : p));
    setChildren(prev => {
      const otherChildren = prev.filter(c => c.parentId !== updatedParent.id);
      return [...updatedChildren, ...otherChildren];
    });

    try {
      await setDoc(doc(db, COLLECTIONS.PARENTS, updatedParent.id), updatedParent, { merge: true });
      for (const child of updatedChildren) {
        await setDoc(doc(db, COLLECTIONS.CHILDREN, child.id), child, { merge: true });
      }
    } catch (err) {
      console.warn('Firestore update family error:', err);
    }
  };

  const handleDeleteFamily = async (parentId: string) => {
    setParents(prev => prev.filter(p => p.id !== parentId));
    setChildren(prev => prev.filter(c => c.parentId !== parentId));

    try {
      await deleteDoc(doc(db, COLLECTIONS.PARENTS, parentId));
    } catch (err) {
      console.warn('Firestore delete parent error:', err);
    }
  };

  const handleUpdateChildProfile = async (childId: string, updates: Partial<Child>) => {
    setChildren(prev => prev.map(c => c.id === childId ? { ...c, ...updates } : c));
    try {
      await setDoc(doc(db, COLLECTIONS.CHILDREN, childId), updates, { merge: true });
    } catch (err) {
      console.warn('Firestore update child error:', err);
    }
  };

  const handleUpdateParentProfile = async (parentId: string, updates: Partial<ParentGuardian>) => {
    setParents(prev => prev.map(p => p.id === parentId ? { ...p, ...updates } : p));
    try {
      await setDoc(doc(db, COLLECTIONS.PARENTS, parentId), updates, { merge: true });
    } catch (err) {
      console.warn('Firestore update parent error:', err);
    }
  };

  const handleUpdateProvider = async (updatedProvider: Provider) => {
    setProviders(prev => prev.map(p => p.id === updatedProvider.id ? updatedProvider : p));
    try {
      await setDoc(doc(db, COLLECTIONS.PROVIDERS, updatedProvider.id), updatedProvider, { merge: true });
    } catch (err) {
      console.warn('Firestore update provider error:', err);
    }
  };

  const handleAddProvider = async (newProvider: Provider) => {
    setProviders(prev => [newProvider, ...prev]);
    try {
      await setDoc(doc(db, COLLECTIONS.PROVIDERS, newProvider.id), newProvider);
    } catch (err) {
      console.warn('Firestore add provider error:', err);
    }
  };

  const handleDeleteProvider = async (providerId: string) => {
    setProviders(prev => prev.filter(p => p.id !== providerId));
    try {
      await deleteDoc(doc(db, COLLECTIONS.PROVIDERS, providerId));
    } catch (err) {
      console.warn('Firestore delete provider error:', err);
    }
  };

  const handleUpdateChildFee = async (childId: string, updates: Partial<Child>) => {
    setChildren(prev => prev.map(c => c.id === childId ? { ...c, ...updates } : c));
    try {
      await setDoc(doc(db, COLLECTIONS.CHILDREN, childId), updates, { merge: true });
    } catch (err) {
      console.warn('Firestore update child fee error:', err);
    }
  };

  const handleArchiveChild = async (childId: string, isArchived: boolean) => {
    const archivedAt = isArchived ? new Date().toISOString() : undefined;
    setChildren(prev => prev.map(c => c.id === childId ? { ...c, isArchived, archivedAt } : c));
    try {
      await setDoc(doc(db, COLLECTIONS.CHILDREN, childId), { isArchived, archivedAt: archivedAt || null }, { merge: true });
    } catch (err) {
      console.warn('Firestore archive child error:', err);
    }
  };

  const handleArchiveFamily = async (parentId: string, isArchived: boolean) => {
    const archivedAt = isArchived ? new Date().toISOString() : undefined;
    setParents(prev => prev.map(p => p.id === parentId ? { ...p, isArchived, archivedAt } : p));
    // Also archive associated children if family is archived
    setChildren(prev => prev.map(c => c.parentId === parentId ? { ...c, isArchived, archivedAt } : c));
    try {
      await setDoc(doc(db, COLLECTIONS.PARENTS, parentId), { isArchived, archivedAt: archivedAt || null }, { merge: true });
      const famKids = children.filter(c => c.parentId === parentId);
      for (const kid of famKids) {
        await setDoc(doc(db, COLLECTIONS.CHILDREN, kid.id), { isArchived, archivedAt: archivedAt || null }, { merge: true });
      }
    } catch (err) {
      console.warn('Firestore archive family error:', err);
    }
  };

  const handleAutoGenerateMonthlyFees = async () => {
    const updated = children.map(c => {
      if (c.admissionsStage === 'enrolled') {
        return {
          ...c,
          eTransferStatus: 'pending' as const,
          monthlyFee: calculateMonthlyFee(c.fundingType),
          eTransferDueDay: 1
        };
      }
      return c;
    });

    setChildren(updated);
    try {
      for (const child of updated.filter(c => c.admissionsStage === 'enrolled')) {
        await setDoc(doc(db, COLLECTIONS.CHILDREN, child.id), {
          eTransferStatus: 'pending',
          monthlyFee: child.monthlyFee,
          eTransferDueDay: 1
        }, { merge: true });
      }
    } catch (err) {
      console.warn('Firestore batch fee sync error:', err);
    }
  };

  const handleClearDemoData = async () => {
    // 1. Reset React memory state to absolute clean slate (0 records, 0 queue items)
    setChildren([]);
    setParents([]);
    setProviders([]);
    setHomeVisitors([]);
    setHomeInspections([]);
    setAlerts([]);
    setDismissedAlertIds([]);
    setAttendanceState({});
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('accs_dismissed_alerts');
        localStorage.removeItem('accs_attendance_cache');
        localStorage.removeItem('accs_calendar_events');
        localStorage.removeItem('accs_provider_applicants');
        localStorage.removeItem('accs_visitor_applicants');
      } catch (e) {}
    }
    // 2. Wipe Firestore collections
    await clearAgencyDataToFresh();
  };

  // Universal Global Site Password Gate:
  // Completely locks the entire application until the access password is provided.
  // Gating all portals, application routes, headers, and AI assistant chat bubbles.
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-canvas-sand text-ink-body selection:bg-orange-200">
        <main className="flex-1 flex items-center justify-center p-4">
          <AdminAuthGate onSuccess={() => setIsAdminAuthenticated(true)} />
        </main>
        <footer className="bg-white border-t-2 border-slate-900 py-6 text-center text-xs text-slate-500 font-medium">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>© 2026 DaycareOS Child Care Network • Licensed under Ontario Ministry of Education & CCEYA</p>
            <p className="text-[11px] text-slate-400">
              DaycareOS Interactive Portfolio Showcase • Client-Side Sandbox
            </p>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-canvas-sand text-ink-body">
      {/* Top Interactive Role Switcher & Branding Header (Hidden for public applicant registration pages) */}
      {currentRole !== 'register' && currentRole !== 'apply-provider' && currentRole !== 'apply-visitor' && (
        <Header
          currentRole={currentRole}
          onRoleChange={setCurrentRole}
          onNavigateHome={handleNavigateAdminDashboard}
          activeBrand={activeBrand}
          onBrandChange={setActiveBrand}
          alertCount={activeAlerts.length}
          onOpenBinder={() => setIsBinderModalOpen(true)}
          onOpenPdfSigner={() => setIsPdfSignerOpen(true)}
          isParentPortalMode={Boolean(magicFamilyId) || currentRole === 'parent'}
          isAdminAuthenticated={isAdminAuthenticated}
          onLogoutAdmin={handleLogoutAdmin}
        />
      )}

      {/* Dynamic Split-View Workspace: 3/4 Main Content & 1/4 Side-Docked AI Panel */}
      <div className="flex-1 flex w-full relative min-h-0">
        {/* Main Workspace Column (contracts to 3/4 or 2/3 on lg+ viewports when AI is open) */}
        <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isAiDockOpen 
            ? panelWidthMode === 'third' 
              ? 'lg:w-2/3 lg:max-w-[66.666%]' 
              : 'lg:w-3/4 lg:max-w-[75%]'
            : 'w-full max-w-full'
        }`}>
          {/* Main Dynamic Portal View */}
          <main className="flex-1">
        {currentRole === 'admin' && (
          <AdminCommandCentre
            activeTab={adminActiveTab}
            onTabChange={setAdminActiveTab}
            providersList={providers}
            childrenList={children}
            parentsList={parents}
            alertsList={activeAlerts}
            formsList={formsList}
            visitorsList={homeVisitors}
            inspectionsList={homeInspections}
            attendanceState={attendanceState}
            onDismissAlert={handleDismissAlert}
            onUpdateChildStage={handleUpdateChildStage}
            onApproveFormZero={handleApproveFormZero}
            onSaveForms={handleSaveForms}
            onMarkPaid={handleMarkPaid}
            onAddFamily={handleAddFamily}
            onUpdateFamily={handleUpdateFamily}
            onDeleteFamily={handleDeleteFamily}
            onUpdateProvider={handleUpdateProvider}
            onAddProvider={handleAddProvider}
            onDeleteProvider={handleDeleteProvider}
            onAddVisitor={handleAddVisitor}
            onUpdateVisitor={handleUpdateVisitor}
            onDeleteVisitor={handleDeleteVisitor}
            onNavigateToVisitorPortal={(visitorId) => {
              setActiveVisitorId(visitorId);
              setCurrentRole('visitor');
            }}
            onUpdateChildFee={handleUpdateChildFee}
            onAutoGenerateMonthlyFees={handleAutoGenerateMonthlyFees}
            onDenyChild={handleDenyChild}
            onAssignProvider={handleAssignProvider}
            onUpdateDocStatus={handleUpdateDocStatus}
            onArchiveChild={handleArchiveChild}
            onArchiveFamily={handleArchiveFamily}
            onClearDemoData={handleClearDemoData}
            onLoad24Profiles={handleSeedAndLoadData}
            isSeedingData={isSeedingData}
            onSaveSingleForm={handleSaveSingleForm}
            onRollbackForm={handleRollbackFormVersion}
            onResetFormToFactory={handleResetFormToFactory}
            onFetchFormVersions={handleFetchFormVersions}
            onOpenBinderModal={() => setIsBinderModalOpen(true)}
            onOpenAiWithPrompt={handleOpenAiWithPrompt}
          />
        )}

        {currentRole === 'visitor' && (
          <HomeVisitorPortal
            visitorsList={homeVisitors}
            providersList={providers}
            childrenList={children}
            inspectionsList={homeInspections}
            onSaveInspection={handleSaveInspection}
            attendanceState={attendanceState}
            initialVisitorId={activeVisitorId || magicVisitorId || undefined}
            magicVisitorId={magicVisitorId}
          />
        )}

        {currentRole === 'provider' && (
          <ProviderPortal
            providersList={providers}
            childrenList={children}
            parentsList={parents}
            attendanceState={attendanceState}
            onToggleAttendance={handleToggleAttendance}
            magicProviderId={activeProviderId || magicProviderId}
            formsList={formsList}
            visitorsList={homeVisitors}
          />
        )}

        {currentRole === 'parent' && (
          <ParentPortal
            parentsList={parents}
            childrenList={children}
            formsList={formsList}
            providersList={providers}
            attendanceState={attendanceState}
            onCompleteIntake={handleCompleteIntake}
            onUpdateDocStatus={handleUpdateDocStatus}
            onUpdateChildStage={handleUpdateChildStage}
            onUpdateChildProfile={handleUpdateChildProfile}
            onUpdateParentProfile={handleUpdateParentProfile}
            magicFamilyId={activeFamilyId || magicFamilyId}
            magicChildId={urlParams.get('childId')}
            isMagicLink={isMagicLink || Boolean(activeFamilyId)}
          />
        )}

        {currentRole === 'register' && (
          <PublicRegistrationPage
            formsList={formsList}
            onAddFamily={handleAddFamily}
            onNavigateToParentPortal={(familyId) => {
              setActiveFamilyId(familyId);
              setCurrentRole('parent');
            }}
            onNavigateToAdmin={() => setCurrentRole('admin')}
          />
        )}

        {currentRole === 'apply-provider' && (
          <PublicProviderApplyPage
            formsList={formsList}
            onAddApplicant={(newApp) => {
              try {
                const existing = JSON.parse(localStorage.getItem('accs_provider_applicants') || '[]');
                localStorage.setItem('accs_provider_applicants', JSON.stringify([newApp, ...existing]));
              } catch (e) {}
            }}
            onNavigateToParentApply={() => setCurrentRole('register')}
            onNavigateToAdmin={() => setCurrentRole('admin')}
            onNavigateToProviderPortal={(provId) => {
              if (provId) {
                setActiveProviderId(provId);
              }
              setCurrentRole('provider');
              try {
                const url = new URL(window.location.href);
                url.searchParams.set('role', 'provider');
                if (provId) {
                  url.searchParams.set('providerId', provId);
                } else {
                  url.searchParams.delete('providerId');
                }
                window.history.pushState({}, '', url.toString());
              } catch (e) {}
            }}
          />
        )}

        {currentRole === 'apply-visitor' && (
          <PublicVisitorApplyPage
            formsList={formsList}
            onAddApplicant={(newApp) => {
              try {
                const existing = JSON.parse(localStorage.getItem('accs_visitor_applicants') || '[]');
                localStorage.setItem('accs_visitor_applicants', JSON.stringify([newApp, ...existing]));
              } catch (e) {}
            }}
            onNavigateToParentApply={() => setCurrentRole('register')}
            onNavigateToAdmin={() => setCurrentRole('admin')}
          />
        )}

        {currentRole === 'sandbox' && (
          <TestFamiliesSandbox />
        )}
          </main>
        </div>

        {/* Responsive Side-Docking AI Assistant Panel (1/4 Width Split-View Canvas) */}
        <AccsAiAssistant
          isOpen={isAiDockOpen}
          onToggleOpen={() => setIsAiDockOpen(prev => !prev)}
          onClose={() => setIsAiDockOpen(false)}
          panelWidthMode={panelWidthMode}
          onToggleWidthMode={() => setPanelWidthMode(prev => prev === 'quarter' ? 'third' : 'quarter')}
          initialPrompt={aiInitialPrompt}
          onClearInitialPrompt={() => setAiInitialPrompt(null)}
          childrenList={children}
          providersList={providers}
          parentsList={parents}
          alertsList={activeAlerts}
          formsList={formsList}
          attendanceState={attendanceState}
          visitorsList={homeVisitors}
          currentRole={currentRole}
          onApplyFormAction={handleApplyAiFormAction}
          onResetFormToFactory={handleResetFormToFactory}
        />
      </div>

      {/* Footer — 100% Full Width across the entire viewport */}
      <footer className="w-full bg-white border-t-2 border-slate-900 py-6 text-center text-xs text-slate-500 font-medium z-10 shrink-0">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 DaycareOS Child Care Network • Licensed under Ontario Ministry of Education & CCEYA</p>
          <p className="text-[11px] text-slate-400">
            Powered by Google Firebase Real-Time Engine • All Rights Reserved
          </p>
        </div>
      </footer>

      {/* Physical Binder Licensing Inspection Modal */}
      <PhysicalBinderModal
        isOpen={isBinderModalOpen}
        onClose={() => setIsBinderModalOpen(false)}
        providersList={providers}
        childrenList={children}
        parentsList={parents}
        visitorsList={homeVisitors}
        formsList={formsList}
      />

      {/* Open-Source PDF Reader & E-Signer Modal */}
      <PdfSignerModal
        isOpen={isPdfSignerOpen}
        onClose={() => setIsPdfSignerOpen(false)}
      />
    </div>
  );
};

export default App;
