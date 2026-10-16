import React, { useState, useEffect } from 'react';
import { HomeVisitor, Provider, Child, HomeInspectionRecord, InspectionChecklistItem } from '../../types';
import { ModalPortal } from '../common/ModalPortal';
import { 
  ShieldCheck, 
  MapPin, 
  Phone, 
  ExternalLink, 
  Clock, 
  Calendar, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  FileCheck, 
  Plus, 
  PenTool, 
  AlertCircle,
  ClipboardList,
  HeartHandshake,
  Check,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Info,
  BookOpen,
  Sparkles,
  Smile,
  MessageSquare,
  Baby,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';
import { GatedNotesModal } from '../common/notes/GatedNotesModal';
import { 
  queueInspectionOffline, 
  getQueuedInspections, 
  syncQueuedInspections, 
  isOnline, 
  subscribeToNetworkStatus 
} from '../../utils/offlineSync';
import { saveInspectionToFirestore } from '../../services/firebaseService';
import { 
  MINISTRY_CCEYA_DOMAINS, 
  OFFICIAL_BEHAVIOUR_TECHNIQUES, 
  CceyaDomain, 
  BehaviourTechniqueItem 
} from '../../data/cceyaChecklistData';
import { getProviderPhoto, getVisitorPhoto } from '../../data/mockData';

interface HomeVisitorPortalProps {
  visitorsList: HomeVisitor[];
  providersList: Provider[];
  childrenList: Child[];
  inspectionsList: HomeInspectionRecord[];
  onSaveInspection: (inspection: HomeInspectionRecord) => void;
  attendanceState?: Record<string, { status: string; checkIn?: string; checkOut?: string }>;
  initialVisitorId?: string;
  magicVisitorId?: string | null;
}

export const HomeVisitorPortal: React.FC<HomeVisitorPortalProps> = ({
  visitorsList,
  providersList,
  childrenList,
  inspectionsList,
  onSaveInspection,
  attendanceState = {},
  initialVisitorId,
  magicVisitorId
}) => {
  const urlVisitorId = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('visitorId') : null;
  const targetVisitorId = magicVisitorId || initialVisitorId || urlVisitorId;
  const validVisitorId = (targetVisitorId && visitorsList.some(v => v.id === targetVisitorId))
    ? targetVisitorId
    : (visitorsList[0]?.id || 'visitor-1');

  const [selectedVisitorId, setSelectedVisitorId] = useState<string>(validVisitorId);

  useEffect(() => {
    if (targetVisitorId && visitorsList.some(v => v.id === targetVisitorId)) {
      setSelectedVisitorId(targetVisitorId);
    }
  }, [targetVisitorId, visitorsList]);

  const activeVisitor = visitorsList.find(v => v.id === selectedVisitorId) || visitorsList[0];
  const assignedProviders = providersList.filter(p => activeVisitor?.assignedProviderIds.includes(p.id));

  // Inspection Modal State
  const [activeInspectionProvider, setActiveInspectionProvider] = useState<Provider | null>(null);
  const [inspectionType, setInspectionType] = useState<'quarterly_cceya' | 'behaviour_management' | 'spot_check'>('quarterly_cceya');
  const [activeNotesProvider, setActiveNotesProvider] = useState<Provider | null>(null);
  const [activeNotesChild, setActiveNotesChild] = useState<Child | null>(null);

  // PWA Tablet Offline Sync State
  const [isOnlineState, setIsOnlineState] = useState<boolean>(() => isOnline());
  const [queuedCount, setQueuedCount] = useState<number>(0);
  const [isSyncingQueue, setIsSyncingQueue] = useState<boolean>(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  // Monitor local offline queue and sync state
  const refreshQueueCount = async () => {
    try {
      const queued = await getQueuedInspections();
      setQueuedCount(queued.length);
    } catch (e) {
      console.warn('Error reading queued inspections:', e);
    }
  };

  const triggerQueueSync = async () => {
    if (isSyncingQueue) return;
    setIsSyncingQueue(true);
    try {
      const { successCount } = await syncQueuedInspections(async (record) => {
        onSaveInspection(record);
        await saveInspectionToFirestore(record);
      });
      await refreshQueueCount();
      if (successCount > 0) {
        setSyncStatusMsg(`✓ Auto-synced ${successCount} offline inspection(s) to Cloud Firestore.`);
        setTimeout(() => setSyncStatusMsg(null), 5000);
      }
    } catch (err) {
      console.warn('Queue sync error:', err);
    } finally {
      setIsSyncingQueue(false);
    }
  };

  useEffect(() => {
    refreshQueueCount();
    const unsub = subscribeToNetworkStatus((online) => {
      setIsOnlineState(online);
      if (online) {
        triggerQueueSync();
      }
    });

    const handleQueueChange = () => refreshQueueCount();
    window.addEventListener('accs_offline_queue_changed', handleQueueChange);

    return () => {
      unsub();
      window.removeEventListener('accs_offline_queue_changed', handleQueueChange);
    };
  }, []);
  
  // Close inspection modal on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeInspectionProvider) {
        setActiveInspectionProvider(null);
      }
    };
    if (activeInspectionProvider) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeInspectionProvider]);

  // 12-Domain Ministry CCEYA Checklist State
  const [checklist, setChecklist] = useState<InspectionChecklistItem[]>(() => 
    MINISTRY_CCEYA_DOMAINS.flatMap(d => d.items)
  );
  const [expandedDomains, setExpandedDomains] = useState<Record<string, boolean>>({
    'domain-1': true,
    'domain-2': true,
    'domain-3': true
  });

  // Decoupled Behaviour Management Coaching State
  const [observationSetting, setObservationSetting] = useState<string>('Morning Free Play');
  const [behaviourTechniques, setBehaviourTechniques] = useState<BehaviourTechniqueItem[]>(() => 
    OFFICIAL_BEHAVIOUR_TECHNIQUES.map(t => ({ ...t }))
  );
  const [coachingGoals, setCoachingGoals] = useState<string>('');

  // Ratio Verification State (Only relevant for physical CCEYA quarterly inspection)
  const [headcount, setHeadcount] = useState<number>(4);
  const [underThree, setUnderThree] = useState<number>(2);
  const [underTwo, setUnderTwo] = useState<number>(1);
  const [correctiveActions, setCorrectiveActions] = useState('');
  const [inspectionNotes, setInspectionNotes] = useState('');
  const [visitorSig, setVisitorSig] = useState(activeVisitor?.name || '');
  const [providerSig, setProviderSig] = useState('');
  const [inspectionSuccess, setInspectionSuccess] = useState(false);

  // Filter inspections for this visitor
  const visitorInspections = inspectionsList.filter(i => i.visitorId === activeVisitor?.id);

  const handleStartInspection = (provider: Provider, type: 'quarterly_cceya' | 'behaviour_management' | 'spot_check') => {
    setActiveInspectionProvider(provider);
    setInspectionType(type);
    
    if (type === 'behaviour_management') {
      setBehaviourTechniques(OFFICIAL_BEHAVIOUR_TECHNIQUES.map(t => ({ ...t })));
      setObservationSetting('Morning Free Play');
      setCoachingGoals('');
    } else {
      setChecklist(MINISTRY_CCEYA_DOMAINS.flatMap(d => d.items.map(item => ({ ...item }))));
      // Expand first 3 domains by default
      setExpandedDomains({
        'domain-1': true,
        'domain-2': true,
        'domain-3': true
      });
    }

    // Auto-calculate initial headcount from provider's current enrolled children
    const enrolled = childrenList.filter(c => c.providerId === provider.id);
    const u3 = enrolled.filter(c => c.isUnderThree).length;
    const u2 = enrolled.filter(c => c.isUnderTwo).length;
    
    setHeadcount(enrolled.length + provider.ownChildrenUnderSix);
    setUnderThree(u3);
    setUnderTwo(u2);
    setCorrectiveActions('');
    setInspectionNotes('');
    setVisitorSig(activeVisitor?.name || '');
    setProviderSig(provider.name);
    setInspectionSuccess(false);
  };

  const handleToggleChecklistItem = (id: string) => {
    setChecklist(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, passed: !item.passed };
      }
      return item;
    }));
  };

  const handleToggleDomain = (domainId: string) => {
    setExpandedDomains(prev => ({
      ...prev,
      [domainId]: !prev[domainId]
    }));
  };

  const handleExpandAllDomains = (expand: boolean) => {
    const updated: Record<string, boolean> = {};
    MINISTRY_CCEYA_DOMAINS.forEach(d => {
      updated[d.id] = expand;
    });
    setExpandedDomains(updated);
  };

  const handleToggleBehaviourTechnique = (id: string) => {
    setBehaviourTechniques(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, isCompliant: !item.isCompliant };
      }
      return item;
    }));
  };

  const handleUpdateBehaviourNote = (id: string, notes: string) => {
    setBehaviourTechniques(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, notes };
      }
      return item;
    }));
  };

  const handleSaveInspectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInspectionProvider) return;

    let newRecord: HomeInspectionRecord;

    if (inspectionType === 'behaviour_management') {
      // Decoupled Behaviour Management Coaching Submission (Zero Ratio math required)
      const anyNeedCoaching = behaviourTechniques.some(t => !t.isCompliant);
      const convertedItems: InspectionChecklistItem[] = behaviourTechniques.map(t => ({
        id: t.id,
        label: `${t.technique}: ${t.description}`,
        category: 'behaviour',
        riskLevel: t.id === 'tech-8' ? 'critical' : 'high',
        passed: t.isCompliant,
        notes: t.notes
      }));

      newRecord = {
        id: `insp-beh-${Date.now()}`,
        providerId: activeInspectionProvider.id,
        providerName: activeInspectionProvider.name,
        homeName: activeInspectionProvider.homeName,
        visitorId: activeVisitor.id,
        visitorName: activeVisitor.name,
        inspectionDate: new Date().toISOString().split('T')[0],
        quarter: 'Q3',
        type: 'behaviour_management',
        status: anyNeedCoaching ? 'conditional' : 'compliant',
        headcountVerified: headcount,
        underThreeCount: underThree,
        underTwoCount: underTwo,
        ratioCompliant: true,
        checklistItems: convertedItems,
        observationSetting,
        correctiveActions: coachingGoals.trim() || undefined,
        actionDueDate: anyNeedCoaching ? new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0] : undefined,
        visitorSignature: visitorSig,
        providerSignature: providerSig,
        signedAt: new Date().toISOString(),
        notes: inspectionNotes.trim() || undefined
      };
    } else {
      // Ministry CCEYA Section 26 Quarterly Inspection Submission
      const totalAllowed = 6;
      const maxU2 = activeInspectionProvider.maxUnderTwo ?? 3;
      const maxU3 = activeInspectionProvider.maxUnderThree ?? 3;
      const isOverTotal = headcount > totalAllowed;
      const isOverU3 = underThree > maxU3;
      const isOverU2 = underTwo > maxU2;
      const isRatioOk = !isOverTotal && !isOverU3 && !isOverU2;

      const anyFailed = checklist.some(item => !item.passed);
      const finalStatus = anyFailed || !isRatioOk ? (correctiveActions.trim() ? 'conditional' : 'non_compliant') : 'compliant';

      newRecord = {
        id: `insp-cceya-${Date.now()}`,
        providerId: activeInspectionProvider.id,
        providerName: activeInspectionProvider.name,
        homeName: activeInspectionProvider.homeName,
        visitorId: activeVisitor.id,
        visitorName: activeVisitor.name,
        inspectionDate: new Date().toISOString().split('T')[0],
        quarter: 'Q3',
        type: 'quarterly_cceya',
        status: finalStatus,
        headcountVerified: headcount,
        underThreeCount: underThree,
        underTwoCount: underTwo,
        ratioCompliant: isRatioOk,
        checklistItems: checklist,
        correctiveActions: correctiveActions.trim() || undefined,
        actionDueDate: anyFailed ? new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0] : undefined,
        visitorSignature: visitorSig,
        providerSignature: providerSig,
        signedAt: new Date().toISOString(),
        notes: inspectionNotes.trim() || undefined
      };
    }

    // Process Save: Online vs Dead Zone Offline Queueing
    const currentlyOnline = isOnline();
    if (!currentlyOnline) {
      await queueInspectionOffline(newRecord);
      onSaveInspection(newRecord);
      await refreshQueueCount();
      setInspectionSuccess(true);
      setSyncStatusMsg(`⚡ Saved locally in Offline Dead Zone Mode! This inspection will automatically push to Cloud Firestore once connected.`);
      setTimeout(() => {
        setActiveInspectionProvider(null);
        setInspectionSuccess(false);
      }, 1800);
      return;
    }

    // Online: Save in-memory, Firestore, and fallback to offline queue if network drops mid-request
    try {
      onSaveInspection(newRecord);
      await saveInspectionToFirestore(newRecord);
    } catch (err) {
      console.warn('Network issue saving inspection, queueing offline:', err);
      await queueInspectionOffline(newRecord);
      await refreshQueueCount();
      setSyncStatusMsg(`⚡ Network drop detected. Inspection queued locally and will auto-sync when connection restores.`);
    }

    setInspectionSuccess(true);
    setTimeout(() => {
      setActiveInspectionProvider(null);
      setInspectionSuccess(false);
    }, 1800);
  };

  // CCEYA Ratio verification logic
  const isRatioViolated = headcount > 6 || underThree > 3 || underTwo > (activeInspectionProvider?.maxUnderTwo ?? 3);

  return (
    <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-3.5 sm:py-6 space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
      {/* Top Mobile Field Header */}
      <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border-2 border-slate-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-3.5 sm:gap-4 shadow-neo-sm">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <img
            src={getVisitorPhoto(activeVisitor)}
            alt={activeVisitor?.name || 'Home Visitor'}
            onError={(e) => {
              const target = e.currentTarget;
              const fallback = getVisitorPhoto(activeVisitor);
              if (target.src !== fallback) {
                target.src = fallback;
              }
            }}
            className="w-13 h-13 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl border-2 border-slate-900 object-cover shadow-neo-sm shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="bg-orange-500 text-white font-black text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 rounded-full shadow-neo-sm">
                Visitor Portal
              </span>
              <span className="bg-emerald-100 text-emerald-950 font-bold text-[10px] sm:text-xs px-2 py-0.5 rounded-full border border-emerald-300">
                {activeVisitor?.receNumber}
              </span>
              {(magicVisitorId || urlVisitorId) && (
                <span className="bg-blue-100 text-blue-900 font-extrabold text-[9px] sm:text-[10px] px-2.5 py-0.5 rounded-full border border-blue-300 flex items-center gap-1 shadow-2xs">
                  <CheckCircle2 className="w-3 h-3 text-blue-600 shrink-0" />
                  <span>Magic Field</span>
                </span>
              )}
            </div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 mt-1 truncate">{activeVisitor?.name}</h1>
            <p className="text-xs font-semibold text-slate-500 truncate">
              {activeVisitor?.title} • {activeVisitor?.region}
            </p>
          </div>
        </div>

        {/* Right Header: Connectivity / Offline Dead Zone Badge & Visitor Profile */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 w-full md:w-auto">
          {/* PWA Tablet Connectivity & Sync Status Badge */}
          {isOnlineState && queuedCount === 0 ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 bg-emerald-50 border-2 border-emerald-600 rounded-xl sm:rounded-2xl text-emerald-900 text-xs font-black shadow-neo-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <Wifi className="w-4 h-4 text-emerald-700" />
              <span className="hidden sm:inline">Tablet PWA:</span>
              <span>Live Online</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 sm:py-2 bg-amber-50 border-2 border-amber-600 rounded-xl sm:rounded-2xl text-amber-950 text-xs font-black shadow-neo-sm">
              <span className={`w-2.5 h-2.5 rounded-full ${!isOnlineState ? 'bg-rose-500 animate-ping' : 'bg-amber-500'}`} />
              {!isOnlineState ? (
                <WifiOff className="w-4 h-4 text-rose-600" />
              ) : (
                <Wifi className="w-4 h-4 text-amber-600" />
              )}
              <span>{!isOnlineState ? 'Offline Dead Zone' : 'Online'}</span>
              {queuedCount > 0 && (
                <span className="bg-amber-200 border border-amber-400 px-1.5 py-0.5 rounded-full text-[10px]">
                  {queuedCount} Queued
                </span>
              )}
              {isOnlineState && queuedCount > 0 && (
                <button
                  type="button"
                  onClick={triggerQueueSync}
                  disabled={isSyncingQueue}
                  className="ml-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold text-[11px] rounded-lg border border-slate-900 shadow-neo-sm active:translate-y-0.5 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncingQueue ? 'animate-spin' : ''}`} />
                  <span>{isSyncingQueue ? 'Syncing...' : 'Sync Now'}</span>
                </button>
              )}
            </div>
          )}

          {/* Switch Active Visitor Profile for Demonstration */}
          <div className="w-full sm:w-auto flex items-center gap-2 bg-slate-50 p-2 rounded-xl sm:rounded-2xl border-2 border-slate-900 text-xs">
            <span className="font-black text-slate-700 shrink-0">Visitor:</span>
            <select
              value={selectedVisitorId}
              onChange={(e) => setSelectedVisitorId(e.target.value)}
              className="w-full min-w-0 bg-white border-2 border-slate-900 rounded-lg sm:rounded-xl p-1.5 font-bold text-slate-900 focus:outline-none cursor-pointer truncate"
            >
              {visitorsList.map(v => (
                <option key={v.id} value={v.id}>{v.name} ({v.region})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Sync Status Alert Toast / Banner */}
      {syncStatusMsg && (
        <div className="p-3 bg-amber-100 border-2 border-amber-500 rounded-2xl text-xs font-black text-amber-950 flex items-center justify-between gap-2 shadow-neo-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>{syncStatusMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setSyncStatusMsg(null)}
            className="text-amber-800 hover:text-amber-950 text-xs font-bold underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Field Operations Banner */}
      <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-950 text-xs">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-amber-600 shrink-0" />
          <div>
            <p className="font-extrabold text-sm">CCEYA Section 26 Quarterly Inspection Protocol</p>
            <p className="text-[11px] text-amber-800">
              Unannounced quarterly home inspections must be completed every 90 days. Always reconcile in-person headcount against provider's live daily attendance.
            </p>
          </div>
        </div>
        <div className="bg-white border border-amber-300 px-3 py-1.5 rounded-xl font-mono font-bold text-slate-900 shrink-0">
          Q3 2026 Cycle Active
        </div>
      </div>

      {/* Assigned Providers Caseload List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-500" />
            <span>Assigned Homes Caseload ({assignedProviders.length})</span>
          </h2>
          <span className="text-xs font-semibold text-slate-500">
            Tap a home to review safety files or launch an on-site audit
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {assignedProviders.map(provider => {
            const enrolled = childrenList.filter(c => c.providerId === provider.id);
            const providerInspections = inspectionsList.filter(i => i.providerId === provider.id);
            const latest = providerInspections[0];

            // Calculate ratio stats
            const totalKids = enrolled.length + provider.ownChildrenUnderSix;
            const under3 = enrolled.filter(c => c.isUnderThree).length;
            const under2 = enrolled.filter(c => c.isUnderTwo).length;

            return (
              <div
                key={provider.id}
                className="bg-white rounded-3xl border-2 border-slate-900 p-5 space-y-4 flex flex-col justify-between"
              >
                <div>
                  {/* Home Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={getProviderPhoto(provider)}
                        alt={provider.name}
                        onError={(e) => {
                          const target = e.currentTarget;
                          const fallback = getProviderPhoto(provider);
                          if (target.src !== fallback) {
                            target.src = fallback;
                          }
                        }}
                        className="w-14 h-14 rounded-2xl border-2 border-slate-900 object-cover shadow-neo-sm"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-base text-slate-900 leading-tight">{provider.name}</h3>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                            provider.annualComplianceStatus === 'compliant'
                              ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                              : 'bg-amber-100 text-amber-950 border-amber-300'
                          }`}>
                            {provider.annualComplianceStatus === 'compliant' ? 'Compliant' : 'Renewal Due'}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-orange-600 mt-0.5">{provider.homeName}</p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{provider.homeAddress}, {provider.neighborhood}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 1-Tap Field Quick Actions (Call & Maps) */}
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100">
                    <a
                      href={`tel:${provider.phone}`}
                      className="neo-btn bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs py-2 px-2 sm:px-3 flex items-center justify-center gap-1.5 font-bold truncate"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">Call Provider</span>
                    </a>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(provider.homeAddress + ', Ontario')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="neo-btn bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs py-2 px-2 sm:px-3 flex items-center justify-center gap-1.5 font-bold truncate"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">Directions</span>
                    </a>
                  </div>

                  {/* Real-time Ratios & Headcount Card */}
                  <div className="mt-3 p-3 bg-slate-50 rounded-2xl border-2 border-slate-200 text-xs space-y-2">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-slate-700 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-orange-500" />
                        <span>CCEYA Capacity & Group Balance</span>
                      </span>
                      <span className="font-mono bg-white px-2 py-0.5 rounded-lg border border-slate-300">
                        {totalKids} / 6 Children
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                      <div className="p-1.5 bg-white rounded-xl border border-slate-200">
                        <span className="block text-slate-500 text-[9px] uppercase font-bold">Total Max</span>
                        <span className="font-extrabold text-slate-900">{totalKids}/6</span>
                      </div>
                      <div className="p-1.5 bg-white rounded-xl border border-slate-200">
                        <span className="block text-slate-500 text-[9px] uppercase font-bold">Under 3</span>
                        <span className="font-extrabold text-slate-900">{under3}/3</span>
                      </div>
                      <div className="p-1.5 bg-white rounded-xl border border-slate-200">
                        <span className="block text-slate-500 text-[9px] uppercase font-bold">Under 2</span>
                        <span className="font-extrabold text-slate-900">{under2}/{provider.maxUnderTwo ?? 3}</span>
                      </div>
                    </div>

                    {provider.ownChildrenUnderSix > 0 && (
                      <p className="text-[10px] text-amber-700 font-semibold italic">
                        Includes {provider.ownChildrenUnderSix} provider's own child under age 6 counted directly against ratio.
                      </p>
                    )}
                  </div>

                  {/* Latest Inspection Pill */}
                  <div className="mt-3 text-xs flex items-center justify-between p-2.5 bg-slate-100 rounded-xl">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span className="font-semibold text-slate-700">Last CCEYA Inspection:</span>
                    </div>
                    <span className="font-bold text-slate-900">
                      {latest ? `${latest.inspectionDate} (${latest.status})` : 'Aug 18, 2026 (Compliant)'}
                    </span>
                  </div>

                  {/* Enrolled Children Notes Badges */}
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                      <span>Children in Care ({enrolled.length})</span>
                      <span className="text-[10px] text-blue-600 font-medium">Click child for notes</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {enrolled.map(child => (
                        <button
                          key={child.id}
                          type="button"
                          onClick={() => setActiveNotesChild(child)}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50/70 hover:bg-blue-100 text-blue-950 border border-blue-200 rounded-lg text-[10px] font-bold transition-colors cursor-pointer shadow-2xs"
                          title={`View & add notes for ${child.fullName}`}
                        >
                          <Baby className="w-3 h-3 text-orange-500" />
                          <span>{child.fullName}</span>
                          <MessageSquare className="w-2.5 h-2.5 text-blue-600 ml-0.5" />
                        </button>
                      ))}
                      {enrolled.length === 0 && (
                        <span className="text-[10px] text-slate-400 italic">No assigned children</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Audit Action Buttons & Provider Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleStartInspection(provider, 'quarterly_cceya')}
                    className="neo-btn bg-orange-500 hover:bg-orange-600 text-white text-xs py-2 px-2 flex items-center justify-center gap-1 font-black shadow-neo-sm"
                  >
                    <ClipboardList className="w-3.5 h-3.5" />
                    <span>Quarterly</span>
                  </button>

                  <button
                    onClick={() => handleStartInspection(provider, 'behaviour_management')}
                    className="neo-btn bg-slate-900 hover:bg-slate-800 text-white text-xs py-2 px-2 flex items-center justify-center gap-1 font-black shadow-neo-sm"
                  >
                    <HeartHandshake className="w-3.5 h-3.5 text-orange-400" />
                    <span>Behaviour</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveNotesProvider(provider)}
                    className="neo-btn bg-blue-50 hover:bg-blue-100 text-blue-900 border-blue-300 text-xs py-2 px-2 flex items-center justify-center gap-1 font-bold shadow-neo-sm cursor-pointer"
                    title={`View or add notes for ${provider.name}`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                    <span>Notes</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Historical Completed Inspections Log */}
      <div className="bg-white rounded-3xl border-2 border-slate-900 p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b-2 border-slate-100">
          <div>
            <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-600" />
              <span>Signed Inspection Records Log</span>
            </h3>
            <p className="text-xs text-slate-500">
              Tamper-evident CCEYA compliance records signed on-site and synchronized to the agency's CRM.
            </p>
          </div>
          <span className="text-xs font-mono font-bold bg-slate-100 px-3 py-1 rounded-xl">
            {visitorInspections.length} Reports on File
          </span>
        </div>

        <div className="space-y-3">
          {visitorInspections.map(insp => (
            <div
              key={insp.id}
              className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-slate-900">{insp.providerName}</span>
                  <span className="text-slate-500 font-semibold">({insp.homeName})</span>
                  <span className={`px-2 py-0.5 rounded-full font-black text-[10px] border ${
                    insp.status === 'compliant'
                      ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                      : 'bg-amber-100 text-amber-950 border-amber-300'
                  }`}>
                    {insp.status.toUpperCase()}
                  </span>
                  {(insp as any).offlineQueued && (
                    <span className="bg-amber-100 text-amber-950 border border-amber-400 font-extrabold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                      <WifiOff className="w-2.5 h-2.5 text-amber-700" />
                      <span>Offline Queued</span>
                    </span>
                  )}
                </div>
                <p className="text-slate-600 text-[11px] mt-1">
                  Type: <span className="font-bold text-slate-800">{insp.type.replace('_', ' ').toUpperCase()}</span> • 
                  Headcount Verified: <span className="font-bold text-slate-800">{insp.headcountVerified} kids</span> • 
                  Audited by: <span className="font-bold text-slate-800">{insp.visitorName}</span>
                </p>
                {insp.notes && (
                  <p className="text-[11px] text-slate-500 italic mt-1">"{insp.notes}"</p>
                )}
              </div>

              <div className="text-right shrink-0">
                <div className="font-mono font-bold text-slate-700">{insp.inspectionDate}</div>
                <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                  Signatures: {insp.visitorSignature ? '✓ Visitor' : ''} {insp.providerSignature ? '✓ Provider' : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Digital In-Home Inspection Modal */}
      {activeInspectionProvider && (
        <ModalPortal>
          <div 
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setActiveInspectionProvider(null);
              }
            }}
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl border-2 border-slate-900 max-w-3xl w-full flex flex-col max-h-[92vh] overflow-hidden animate-fadeIn cursor-default"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between p-5 border-b-2 border-slate-900 bg-slate-50 shrink-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border shadow-2xs ${
                      inspectionType === 'behaviour_management'
                        ? 'bg-purple-100 text-purple-950 border-purple-300'
                        : 'bg-orange-100 text-orange-950 border-orange-300'
                    }`}>
                      {inspectionType === 'behaviour_management' 
                        ? 'ACCS x CITS Pedagogical Coaching' 
                        : 'Ministry CCEYA Section 26 Quarterly Inspection'}
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md">
                      {inspectionType === 'behaviour_management' 
                        ? '10 Positive Guidance Techniques' 
                        : '12 Statutory Domains (v.08 2023-12-11)'}
                    </span>
                    {!isOnlineState && (
                      <span className="text-[10px] font-extrabold bg-amber-200 text-amber-950 border border-amber-400 px-2 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
                        <WifiOff className="w-3 h-3 text-amber-800" />
                        <span>Offline Dead Zone Active (Local Tablet Sync)</span>
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-black text-slate-900">
                    {activeInspectionProvider.name} — {inspectionType === 'behaviour_management' ? 'Behaviour Guidance Audit' : 'On-Site CCEYA Inspection'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {activeInspectionProvider.homeAddress} • Auditor: <strong className="text-slate-800">{activeVisitor.name} ({activeVisitor.receNumber})</strong>
                  </p>
                </div>
                <button
                  onClick={() => setActiveInspectionProvider(null)}
                  className="text-slate-400 hover:text-slate-800 font-black text-xl p-1 cursor-pointer transition-colors"
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto flex-1 bg-white">
                {inspectionSuccess ? (
                  <div className="py-12 text-center space-y-3">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500 shadow-neo-sm">
                      <Check className="w-8 h-8" />
                    </div>
                    <h4 className="text-lg font-black text-slate-900">
                      {inspectionType === 'behaviour_management' 
                        ? 'Behaviour Coaching Audit Certified!' 
                        : 'Ministry CCEYA Inspection Certified & Recorded!'}
                    </h4>
                    <p className="text-xs text-slate-600 max-w-md mx-auto">
                      Audit report successfully timestamped and synced to the agency's Admin Command Centre and Ministry Audit Binder.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSaveInspectionSubmit} className="space-y-6 text-xs">
                    
                    {/* ========================================================================= */}
                    {/* CASE 1: DECOUPLED BEHAVIOUR MANAGEMENT AUDIT (Pedagogical Coaching)     */}
                    {/* ========================================================================= */}
                    {inspectionType === 'behaviour_management' ? (
                      <div className="space-y-5">
                        {/* Pedagogical Guidance Banner */}
                        <div className="bg-purple-50 border-2 border-purple-300 rounded-2xl p-4 text-purple-950 space-y-1.5">
                          <div className="flex items-center gap-2 font-black text-xs">
                            <HeartHandshake className="w-4 h-4 text-purple-600" />
                            <span>ACCS x CITS Positive Guidance & Behaviour Monitoring Standard</span>
                          </div>
                          <p className="text-[11px] text-purple-900 leading-relaxed">
                            Under <strong>CCEYA s. 48 & O. Reg. 137/15 s. 48</strong>, this quarterly observation evaluates caregiver-child guidance techniques, emotional regulation, and positive reinforcement during live routines. <em>(Physical headcount and capacity ratio calculations are decoupled from this audit).</em>
                          </p>
                        </div>

                        {/* Observation Setting Selector */}
                        <div className="bg-slate-50 p-3.5 rounded-2xl border-2 border-slate-200 space-y-2">
                          <label className="block text-[11px] font-black text-slate-800">
                            Select Live Observation Routine / Setting:
                          </label>
                          <div className="flex flex-wrap gap-1.5">
                            {[
                              'Morning Free Play',
                              'Circle Time / Group Routine',
                              'Outdoor Gross Motor Play',
                              'Lunch & Meal Routine',
                              'Transitions & Tidy Up'
                            ].map((setting) => (
                              <button
                                key={setting}
                                type="button"
                                onClick={() => setObservationSetting(setting)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                  observationSetting === setting
                                    ? 'bg-purple-600 text-white border-purple-700 shadow-neo-sm'
                                    : 'bg-white text-slate-700 border-slate-300 hover:border-slate-800'
                                }`}
                              >
                                {setting}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 10 Positive Guidance Techniques */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                              <span>10 Core Pedagogical Techniques ({behaviourTechniques.filter(t => t.isCompliant).length}/10 Demonstrating)</span>
                            </label>
                            <span className="text-[10px] text-slate-500 font-medium">
                              Tap to toggle Demonstrating / Needs Coaching
                            </span>
                          </div>

                          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                            {behaviourTechniques.map((tech, idx) => (
                              <div
                                key={tech.id}
                                className={`p-3 rounded-2xl border-2 transition-all ${
                                  tech.isCompliant
                                    ? 'bg-emerald-50/70 border-emerald-400 text-emerald-950'
                                    : 'bg-amber-50/70 border-amber-400 text-amber-950'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-black text-xs text-slate-900">
                                        #{idx + 1}. {tech.technique}
                                      </span>
                                      {tech.id === 'tech-8' && (
                                        <span className="bg-rose-100 text-rose-900 border border-rose-300 text-[9px] font-black px-1.5 py-0.2 rounded">
                                          CCEYA S. 48 MANDATORY
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-slate-600 leading-snug">
                                      {tech.description}
                                    </p>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleToggleBehaviourTechnique(tech.id)}
                                    className={`px-3 py-1.5 rounded-xl font-black text-[10px] uppercase shrink-0 transition-all border cursor-pointer ${
                                      tech.isCompliant
                                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                                        : 'bg-amber-600 text-white border-amber-700 shadow-2xs'
                                    }`}
                                  >
                                    {tech.isCompliant ? '✓ Demonstrating' : 'Needs Coaching'}
                                  </button>
                                </div>

                                <div className="mt-2 pt-2 border-t border-slate-200/60">
                                  <input
                                    type="text"
                                    placeholder="Add field observation or coaching note for this technique (optional)..."
                                    value={tech.notes || ''}
                                    onChange={(e) => handleUpdateBehaviourNote(tech.id, e.target.value)}
                                    className="w-full px-2.5 py-1 bg-white/90 border border-slate-300 rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-purple-500"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Coaching Goals & Next Steps */}
                        <div>
                          <label className="block font-black text-slate-800 mb-1">
                            Collaborative Coaching Plan & Strengths Observed:
                          </label>
                          <textarea
                            rows={2}
                            placeholder="Document caregiver strengths, child engagement highlights, or agreed guidance goals for next quarter..."
                            value={coachingGoals}
                            onChange={(e) => setCoachingGoals(e.target.value)}
                            className="w-full p-2.5 bg-slate-50 border-2 border-slate-900 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      </div>
                    ) : (
                      /* ========================================================================= */
                      /* CASE 2: MINISTRY CCEYA SECTION 26 QUARTERLY INSPECTION (12 DOMAINS)     */
                      /* ========================================================================= */
                      <div className="space-y-5">
                        {/* Real-time Headcount & Ratio Reconciliation Bar */}
                        <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-900 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                              <Users className="w-4 h-4 text-orange-500" />
                              <span>Physical In-Person Headcount (CCEYA Ratio Check)</span>
                            </span>
                            <span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border ${
                              isRatioViolated ? 'bg-red-100 text-red-900 border-red-400' : 'bg-emerald-100 text-emerald-900 border-emerald-400'
                            }`}>
                              {isRatioViolated ? 'RATIO EXCEEDED' : 'RATIO COMPLIANT'}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                Total Kids in House (Max 6):
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="10"
                                value={headcount}
                                onChange={(e) => setHeadcount(parseInt(e.target.value) || 0)}
                                className="w-full p-2 bg-white border-2 border-slate-900 rounded-xl font-mono font-bold text-center"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                Under 3 Yrs (Max 3):
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="6"
                                value={underThree}
                                onChange={(e) => setUnderThree(parseInt(e.target.value) || 0)}
                                className="w-full p-2 bg-white border-2 border-slate-900 rounded-xl font-mono font-bold text-center"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                Under 2 Yrs (Max {activeInspectionProvider?.maxUnderTwo ?? 3}):
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="6"
                                value={underTwo}
                                onChange={(e) => setUnderTwo(parseInt(e.target.value) || 0)}
                                className="w-full p-2 bg-white border-2 border-slate-900 rounded-xl font-mono font-bold text-center"
                              />
                            </div>
                          </div>
                        </div>

                        {/* 12-Domain Accordion Controls */}
                        <div className="flex items-center justify-between pt-1">
                          <div>
                            <label className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                              <BookOpen className="w-4 h-4 text-orange-500" />
                              <span>12 Ministry Regulatory Domains ({checklist.filter(c => c.passed).length}/{checklist.length} Passed)</span>
                            </label>
                            <span className="text-[10px] text-slate-500">
                              Based on Quarterly Checklist Home Visitor EN v.08 2023-12-11 Fillable FINAL
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleExpandAllDomains(true)}
                              className="text-[10px] font-bold text-orange-600 hover:underline cursor-pointer"
                            >
                              Expand All
                            </button>
                            <span className="text-slate-300">•</span>
                            <button
                              type="button"
                              onClick={() => handleExpandAllDomains(false)}
                              className="text-[10px] font-bold text-slate-500 hover:underline cursor-pointer"
                            >
                              Collapse All
                            </button>
                          </div>
                        </div>

                        {/* 12-Domain Progressive Accordion List */}
                        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                          {MINISTRY_CCEYA_DOMAINS.map(domain => {
                            const isExpanded = expandedDomains[domain.id];
                            const domainItemIds = domain.items.map(i => i.id);
                            const currentDomainItems = checklist.filter(c => domainItemIds.includes(c.id));
                            const domainPassedCount = currentDomainItems.filter(c => c.passed).length;
                            const isDomainAllPassed = domainPassedCount === currentDomainItems.length;

                            return (
                              <div
                                key={domain.id}
                                className="rounded-2xl border-2 border-slate-900 bg-white overflow-hidden shadow-2xs"
                              >
                                {/* Accordion Domain Header */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleDomain(domain.id)}
                                  className="w-full p-3.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer"
                                >
                                  <div className="flex items-center gap-2.5">
                                    <span className="w-6 h-6 rounded-lg bg-orange-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                                      {domain.domainNumber}
                                    </span>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <h4 className="font-extrabold text-xs text-slate-900">
                                          {domain.title}
                                        </h4>
                                        <span className="text-[10px] font-mono text-slate-500 font-semibold">
                                          [{domain.cceyaClause}]
                                        </span>
                                      </div>
                                      <p className="text-[10px] text-slate-500 line-clamp-1">
                                        {domain.description}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                                      isDomainAllPassed
                                        ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                                        : 'bg-amber-100 text-amber-950 border-amber-300'
                                    }`}>
                                      {domainPassedCount}/{currentDomainItems.length}
                                    </span>
                                    {isExpanded ? (
                                      <ChevronUp className="w-4 h-4 text-slate-500" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4 text-slate-500" />
                                    )}
                                  </div>
                                </button>

                                {/* Accordion Domain Items (Expanded) */}
                                {isExpanded && (
                                  <div className="p-3 bg-white border-t border-slate-200 space-y-2">
                                    {currentDomainItems.map(item => (
                                      <div
                                        key={item.id}
                                        className={`p-2.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                                          item.passed
                                            ? 'bg-emerald-50/50 border-emerald-300 text-emerald-950'
                                            : 'bg-rose-50/70 border-rose-400 text-rose-950'
                                        }`}
                                      >
                                        <div className="space-y-1">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            {item.code && (
                                              <span className="font-mono font-black text-[10px] bg-slate-100 border border-slate-300 text-slate-800 px-1.5 py-0.2 rounded">
                                                {item.code}
                                              </span>
                                            )}
                                            {item.riskLevel && (
                                              <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded border ${
                                                item.riskLevel === 'critical'
                                                  ? 'bg-rose-100 text-rose-900 border-rose-300'
                                                  : item.riskLevel === 'high'
                                                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                                                  : item.riskLevel === 'moderate'
                                                  ? 'bg-yellow-100 text-yellow-900 border-yellow-300'
                                                  : 'bg-slate-100 text-slate-800 border-slate-300'
                                              }`}>
                                                {item.riskLevel}
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-xs font-bold leading-snug text-slate-900">
                                            {item.label}
                                          </p>
                                          {item.notes && (
                                            <p className="text-[10px] text-slate-500 italic">
                                              Note: {item.notes}
                                            </p>
                                          )}
                                        </div>

                                        <button
                                          type="button"
                                          onClick={() => handleToggleChecklistItem(item.id)}
                                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all border shrink-0 cursor-pointer ${
                                            item.passed
                                              ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                                              : 'bg-rose-600 text-white border-rose-700 shadow-2xs'
                                          }`}
                                        >
                                          {item.passed ? '✓ PASS' : 'FAIL'}
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Corrective Actions (Shown if any failed or ratio violated) */}
                        {(checklist.some(i => !i.passed) || isRatioViolated) && (
                          <div className="p-3.5 bg-red-50 border-2 border-red-400 rounded-2xl space-y-2">
                            <div className="flex items-center gap-1.5 text-red-900 font-black">
                              <AlertTriangle className="w-4 h-4 text-red-600" />
                              <span>14-Day Corrective Action Remediation Plan Required:</span>
                            </div>
                            <textarea
                              rows={2}
                              required
                              placeholder="Specify required correction (e.g., replace expired first aid supplies, secure lockbox key, reduce daily attendance to 6)..."
                              value={correctiveActions}
                              onChange={(e) => setCorrectiveActions(e.target.value)}
                              className="w-full p-2 bg-white border border-red-300 rounded-xl text-xs focus:outline-none"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* General Auditor Notes */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Auditor Field Observations & Child Play Engagement Notes:
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Document child engagement, outdoor play conditions, or recommendations..."
                        value={inspectionNotes}
                        onChange={(e) => setInspectionNotes(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border-2 border-slate-900 rounded-xl text-xs focus:outline-none"
                      />
                    </div>

                    {/* Legal Signatures */}
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Home Visitor Signature (RECE)</label>
                        <input
                          type="text"
                          required
                          value={visitorSig}
                          onChange={(e) => setVisitorSig(e.target.value)}
                          className="w-full p-2 bg-slate-50 border-2 border-slate-900 rounded-xl font-bold"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Provider On-Site Signature</label>
                        <input
                          type="text"
                          required
                          value={providerSig}
                          onChange={(e) => setProviderSig(e.target.value)}
                          className="w-full p-2 bg-slate-50 border-2 border-slate-900 rounded-xl font-bold"
                        />
                      </div>
                    </div>

                    {/* Modal Actions */}
                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => setActiveInspectionProvider(null)}
                        className="px-4 py-2 border-2 border-slate-900 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="neo-btn bg-orange-500 hover:bg-orange-600 text-white text-xs px-6 py-2.5 font-black flex items-center gap-1.5 shadow-neo-sm cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          {!isOnlineState 
                            ? 'Certify & Save to Tablet (Offline Dead Zone)' 
                            : (inspectionType === 'behaviour_management' 
                                ? 'Certify & Record Coaching Audit' 
                                : 'Submit & Certify CCEYA Inspection')}
                        </span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Gated Notes Modal for Provider */}
      {activeNotesProvider && (
        <GatedNotesModal
          isOpen={!!activeNotesProvider}
          onClose={() => setActiveNotesProvider(null)}
          targetType="provider"
          targetId={activeNotesProvider.id}
          targetName={activeNotesProvider.name}
          currentUser={{
            role: 'visitor',
            userId: activeVisitor.id,
            userName: activeVisitor.name,
            assignedProviderIds: activeVisitor.assignedProviderIds
          }}
          targetProvider={activeNotesProvider}
        />
      )}

      {/* Gated Notes Modal for Child */}
      {activeNotesChild && (
        <GatedNotesModal
          isOpen={!!activeNotesChild}
          onClose={() => setActiveNotesChild(null)}
          targetType="child"
          targetId={activeNotesChild.id}
          targetName={activeNotesChild.fullName}
          currentUser={{
            role: 'visitor',
            userId: activeVisitor.id,
            userName: activeVisitor.name,
            assignedProviderIds: activeVisitor.assignedProviderIds
          }}
          targetChild={activeNotesChild}
        />
      )}
    </div>
  );
};
