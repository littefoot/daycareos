import React, { useState } from 'react';
import { Provider, Child, AttendanceEntry } from '../../types';
import { 
  loadLogosFromStorage, 
  loadActivePrintLogoId, 
  AGENCY_ENTITIES 
} from '../../data/agencyLogosData';
import { OnBrandClockPicker } from '../common/OnBrandClockPicker';
import { 
  Printer, 
  Sparkles, 
  Check, 
  Building2, 
  Lock, 
  History, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  Calendar,
  FileCheck,
  ChevronDown,
  X,
  DollarSign,
  ShieldCheck,
  Save,
  Edit3
} from 'lucide-react';

interface ProviderTimesheetViewProps {
  provider: Provider;
  childrenList: Child[];
  attendanceState?: Record<string, AttendanceEntry>;
  onClose?: () => void;
}

export interface DailyTimesheetRow {
  day: number;
  // Child Attendance (Single Daily Session)
  childIn: string;
  childOut: string;
  childHours: number;
  // Provider Operational Working Hours (Home Daycare Operating Shift for CWELCC)
  providerIn: string;
  providerOut: string;
  providerHours: number;
  // Status or Variance Note (e.g. Present, Absent, Sick, Stat Holiday)
  status: string;
  notes: string;
}

import { calculateNetCareHours, parseFlexibleTimeToMinutes, normalizeTimeString } from '../../utils/timeUtils';

export interface TimesheetAuditLog {
  id: string;
  timestamp: string;
  providerId: string;
  providerName: string;
  childName: string;
  day: number;
  field: string;
  previousValue: string | number;
  newValue: string | number;
}

// Re-export or alias for backwards compatibility
const calculateDiffHours = calculateNetCareHours;

export function generateTimesheetRows(
  monthName: string,
  yearStr: string,
  child: Child | undefined,
  attendanceState: Record<string, AttendanceEntry>
): DailyTimesheetRow[] {
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthIndex = monthNames.findIndex(m => m.toLowerCase() === monthName.toLowerCase());
  const validMonth = monthIndex >= 0 ? monthIndex : 9; // default to October (index 9)
  const year = parseInt(yearStr, 10) || 2026;

  const daysInMonth = new Date(year, validMonth + 1, 0).getDate();

  const now = new Date();
  const isSelectedCurrentMonth = now.getFullYear() === year && now.getMonth() === validMonth;
  const todayDateNum = now.getDate();

  const liveAttendance = child ? attendanceState[child.id] : undefined;

  return Array.from({ length: 31 }, (_, i) => {
    const dayNum = i + 1;
    if (dayNum > daysInMonth) {
      return {
        day: dayNum,
        childIn: '',
        childOut: '',
        childHours: 0,
        providerIn: '',
        providerOut: '',
        providerHours: 0,
        status: 'N/A',
        notes: ''
      };
    }

    const dateObj = new Date(year, validMonth, dayNum);
    const dayOfWeek = dateObj.getDay(); // 0 = Sun, 6 = Sat
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (isWeekend) {
      return {
        day: dayNum,
        childIn: '',
        childOut: '',
        childHours: 0,
        providerIn: '',
        providerOut: '',
        providerHours: 0,
        status: 'Weekend',
        notes: ''
      };
    }

    // Weekdays
    const isToday = isSelectedCurrentMonth && dayNum === todayDateNum;

    if (isToday && liveAttendance) {
      const inT = liveAttendance.checkIn || '8:00 AM';
      const outT = liveAttendance.checkOut || '4:30 PM';
      const hours = liveAttendance.netHours || calculateDiffHours(inT, outT) || 8.5;
      const statusLabel = liveAttendance.status === 'departed'
        ? 'Departed'
        : (liveAttendance.status === 'present' ? 'In Care' : (liveAttendance.status === 'sick' ? 'Sick' : (liveAttendance.status === 'absent' ? 'Absent' : 'Verified Care')));
      
      const pickupNote = liveAttendance.pickedUpBy ? ` • Picked up by ${liveAttendance.pickedUpBy}` : '';

      return {
        day: dayNum,
        childIn: liveAttendance.status === 'absent' ? '' : inT,
        childOut: liveAttendance.status === 'absent' ? '' : outT,
        childHours: liveAttendance.status === 'absent' ? 0 : hours,
        providerIn: '7:30 AM',
        providerOut: '5:30 PM',
        providerHours: 10.0,
        status: statusLabel,
        notes: `${child?.fundingType.toUpperCase() || 'CWELCC'}${pickupNote}`
      };
    }

    return {
      day: dayNum,
      childIn: '8:00 AM',
      childOut: '4:30 PM',
      childHours: 8.5,
      providerIn: '7:30 AM',
      providerOut: '5:30 PM',
      providerHours: 10.0,
      status: 'Verified Care',
      notes: child?.fundingType.toUpperCase() || 'CWELCC'
    };
  });
}

export const ProviderTimesheetView: React.FC<ProviderTimesheetViewProps> = ({
  provider,
  childrenList,
  attendanceState = {},
  onClose
}) => {
  const enrolledChildren = childrenList.filter(c => c.providerId === provider.id);
  const [selectedChildId, setSelectedChildId] = useState<string>(enrolledChildren[0]?.id || '');
  const selectedChild = childrenList.find(c => c.id === selectedChildId) || enrolledChildren[0];

  const currentMonthName = new Date().toLocaleString('en-US', { month: 'long' });
  const currentYearStr = String(new Date().getFullYear());

  // Official Agency Media & Logo Sync (Synchronized with Master Ministry Audit Binder)
  const logosList = loadLogosFromStorage();
  const activeLogoId = loadActivePrintLogoId();
  const activeLogo = logosList.find(l => l.id === activeLogoId) || logosList.find(l => l.agencyEntity === 'accs') || logosList[0];
  const accsEntity = AGENCY_ENTITIES['accs'];

  const [month, setMonth] = useState(currentMonthName);
  const [year, setYear] = useState(currentYearStr);
  const storageKey = `accs_timesheet_state_${provider.id}_${month}_${year}_${selectedChildId}`;
  const [providerSignature, setProviderSignature] = useState(provider.name);
  const [parentSignature, setParentSignature] = useState('');
  const [generalNotes, setGeneralNotes] = useState('');
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  
  // Submission & Administrative Approval States
  const [isSubmitted, setIsSubmitted] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`accs_timesheet_state_${provider.id}_${currentMonthName}_${currentYearStr}_${enrolledChildren[0]?.id}`);
        if (saved) return Boolean(JSON.parse(saved).isSubmitted);
      } catch (e) {}
    }
    return false;
  });

  const [submittedTimestamp, setSubmittedTimestamp] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`accs_timesheet_state_${provider.id}_${currentMonthName}_${currentYearStr}_${enrolledChildren[0]?.id}`);
        if (saved) return JSON.parse(saved).submittedTimestamp || null;
      } catch (e) {}
    }
    return null;
  });

  const [isApprovedByAdmin, setIsApprovedByAdmin] = useState<boolean>(false);
  const [isPaidOut, setIsPaidOut] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [updateToast, setUpdateToast] = useState<string | null>(null);

  // Audit trail for manual edits
  const [auditLogs, setAuditLogs] = useState<TimesheetAuditLog[]>([]);
  const [showAuditDrawer, setShowAuditDrawer] = useState(false);

  // Mobile Touch Clock Picker Modal State
  const [activeClockEdit, setActiveClockEdit] = useState<{
    rowIdx: number;
    field: 'childIn' | 'childOut' | 'providerIn' | 'providerOut';
    day: number;
    label: string;
    currentVal: string;
  } | null>(null);
  const [clockPickerModalValue, setClockPickerModalValue] = useState<string>('');

  // 31 days initialized and auto-synced with live daily attendance
  const [rows, setRows] = useState<DailyTimesheetRow[]>(() => {
    return generateTimesheetRows(currentMonthName, currentYearStr, selectedChild, attendanceState);
  });

  // Re-sync whenever selected child, month, year, or live attendance updates
  React.useEffect(() => {
    setRows(generateTimesheetRows(month, year, selectedChild, attendanceState));
    setHasUnsavedChanges(false);
  }, [month, year, selectedChildId, attendanceState]);

  // Handle Escape key to dismiss clock edit modal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeClockEdit) {
        setActiveClockEdit(null);
      }
    };
    if (activeClockEdit) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeClockEdit]);

  // Handle row changes with automated duration math and audit logging
  const handleRowChange = (dayIdx: number, field: keyof DailyTimesheetRow, val: string | number) => {
    if (isApprovedByAdmin || isPaidOut) return; // Locked once confirmed or paid

    setHasUnsavedChanges(true);
    setRows(prev => {
      const next = [...prev];
      const prevRow = next[dayIdx];
      const prevVal = prevRow[field];

      const target = { ...prevRow, [field]: val };

      // Auto-compute child hours if childIn or childOut changes (supports flexible times like '4pm')
      if (field === 'childIn' || field === 'childOut') {
        const computed = calculateDiffHours(target.childIn, target.childOut);
        target.childHours = computed;
        if (computed > 0 && !target.status) {
          target.status = 'Present';
        }
      }

      // Auto-compute provider working hours if providerIn or providerOut changes
      if (field === 'providerIn' || field === 'providerOut') {
        target.providerHours = calculateDiffHours(target.providerIn, target.providerOut);
      }

      next[dayIdx] = target;

      // Log audit trail if changed manually
      if (prevVal !== val && prevVal !== '' && prevVal !== 0) {
        const newLog: TimesheetAuditLog = {
          id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          providerId: provider.id,
          providerName: provider.name,
          childName: selectedChild?.fullName || 'Child',
          day: dayIdx + 1,
          field: String(field),
          previousValue: prevVal,
          newValue: val
        };
        setAuditLogs(logs => [newLog, ...logs]);
      }

      return next;
    });
  };

  const handleOpenClockEdit = (
    rowIdx: number, 
    field: 'childIn' | 'childOut' | 'providerIn' | 'providerOut',
    day: number,
    label: string,
    currentVal: string
  ) => {
    if (isApprovedByAdmin || isPaidOut) return;
    const initialVal = currentVal || (field.includes('Out') ? '4:30 PM' : '8:00 AM');
    setClockPickerModalValue(initialVal);
    setActiveClockEdit({
      rowIdx,
      field,
      day,
      label,
      currentVal: initialVal
    });
  };

  const handleApplyClockEdit = (formatted12h: string) => {
    if (!activeClockEdit) return;
    const { rowIdx, field } = activeClockEdit;
    handleRowChange(rowIdx, field, formatted12h);
    setActiveClockEdit(null);
  };

  // 1-Click Auto-Fill from live daily check-in logs & standard provider working hours
  const handleAutoFill = () => {
    if (isApprovedByAdmin || isPaidOut) return;
    setRows(generateTimesheetRows(month, year, selectedChild, attendanceState));
    setHasUnsavedChanges(true);
    setIsAutoFilled(true);
    setTimeout(() => setIsAutoFilled(false), 2500);
  };

  // Summary Metrics
  const totalChildHours = rows.reduce((sum, r) => sum + (Number(r.childHours) || 0), 0);
  const totalDaysPresent = rows.filter(r => r.childHours > 0).length;
  const totalProviderOperatingHours = rows.reduce((sum, r) => sum + (Number(r.providerHours) || 0), 0);
  const DAILY_RATE = 35.00; // Locked statutory rate ($35.00/day)
  const estimatedPayout = totalDaysPresent * DAILY_RATE;

  // Timesheet submission & updating (Permitted until Agency Director confirms or pays out)
  const handleSubmitTimesheet = () => {
    if (!providerSignature.trim() || isApprovedByAdmin || isPaidOut) return;
    const nowTimestamp = new Date().toLocaleString([], { 
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
    
    setIsSubmitted(true);
    setSubmittedTimestamp(nowTimestamp);
    setHasUnsavedChanges(false);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`accs_timesheet_state_${provider.id}_${month}_${year}_${selectedChildId}`, JSON.stringify({
          isSubmitted: true,
          submittedTimestamp: nowTimestamp,
          isApprovedByAdmin,
          isPaidOut,
          providerSignature,
          parentSignature,
          generalNotes,
          rows
        }));
      } catch (e) {}
    }

    setUpdateToast(isSubmitted ? '✓ Timesheet updates saved for the Agency Director!' : '✓ Timesheet submitted for the Agency Director\'s review!');
    setTimeout(() => setUpdateToast(null), 3000);
  };

  return (
    <div className="bg-white rounded-3xl border-2 border-slate-900 p-4 sm:p-8 space-y-6 shadow-neo-sm">
      {/* On-Screen Action Bar (Hidden when Printing) */}
      <div className="no-print print:hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 bg-slate-50 border-2 border-slate-900 rounded-2xl">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Child:</span>
            <select
              value={selectedChildId}
              onChange={(e) => setSelectedChildId(e.target.value)}
              className="bg-white border-2 border-slate-900 rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-none"
            >
              {enrolledChildren.map(c => (
                <option key={c.id} value={c.id}>{c.fullName}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Month:</span>
            <input
              type="text"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-24 bg-white border-2 border-slate-900 rounded-xl px-2 py-1 text-xs font-bold focus:outline-none text-center"
            />
            <input
              type="text"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-16 bg-white border-2 border-slate-900 rounded-xl px-2 py-1 text-xs font-bold focus:outline-none text-center"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-orange-100/90 px-3 py-1.5 border border-orange-300 rounded-xl text-xs font-black text-orange-950">
            <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
            <span>Agency: All Child Care Solutions Inc.</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Audit Log Drawer Toggle */}
          {auditLogs.length > 0 && (
            <button
              onClick={() => setShowAuditDrawer(!showAuditDrawer)}
              className="neo-btn bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs px-3 py-2 font-bold flex items-center gap-1.5 border border-slate-300"
            >
              <History className="w-3.5 h-3.5 text-slate-700" />
              <span>Audit Log ({auditLogs.length})</span>
            </button>
          )}

          {/* 1-Click Auto-Fill */}
          <button
            onClick={handleAutoFill}
            className="neo-btn bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3.5 py-2 font-black flex items-center gap-1.5 shadow-neo-sm"
          >
            {isAutoFilled ? <Check className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5 text-yellow-300" />}
            <span>Auto-Fill Hours</span>
          </button>

          <button
            onClick={() => window.print()}
            className="neo-btn bg-slate-900 hover:bg-slate-800 text-white text-xs px-4 py-2 font-black flex items-center gap-1.5 shadow-neo-sm"
          >
            <Printer className="w-4 h-4 text-orange-400" />
            <span>Print Sheet</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-2 border-2 border-slate-900 rounded-xl text-xs font-bold hover:bg-slate-200"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Audit Log Drawer (Admin & Provider Accountability) */}
      {showAuditDrawer && (
        <div className="no-print bg-amber-50/70 border-2 border-amber-400 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-amber-300">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-amber-700" />
              <h4 className="text-xs font-black text-amber-950 uppercase tracking-wide">
                Admin Audit Trail: Timesheet Attendance Overrides
              </h4>
            </div>
            <button
              onClick={() => setShowAuditDrawer(false)}
              className="text-amber-800 hover:text-amber-950 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-40 overflow-y-auto space-y-1.5 text-[11px] font-mono">
            {auditLogs.map(log => (
              <div key={log.id} className="p-2 bg-white rounded-lg border border-amber-200 flex items-center justify-between gap-2">
                <span className="text-slate-500 font-bold">{log.timestamp}</span>
                <span className="font-bold text-slate-800">Day {log.day} ({log.field})</span>
                <span className="text-red-600 line-through">{String(log.previousValue)}</span>
                <span className="text-slate-400">➔</span>
                <span className="text-emerald-700 font-bold">{String(log.newValue)}</span>
                <span className="text-[10px] text-slate-500">by {log.providerName}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Provider Payout & Verified Hours Summary Bar */}
      <div className="no-print grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border-2 border-slate-900">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Verified Care Days</span>
          <p className="text-lg font-black text-slate-900">{totalDaysPresent} Days</p>
          <span className="text-[10px] text-slate-500 font-mono">{totalChildHours.toFixed(1)} Child Hours</span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Provider Operating Hours</span>
          <p className="text-lg font-black text-slate-900">{totalProviderOperatingHours.toFixed(1)} hrs</p>
          <span className="text-[10px] text-emerald-700 font-semibold">CWELCC Grant Reconciled</span>
        </div>

        <div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Daily Rate</span>
            <span title="Read-only statutory rate"><Lock className="w-3 h-3 text-slate-400" /></span>
          </div>
          <p className="text-lg font-black text-purple-700">${DAILY_RATE.toFixed(2)} / day</p>
          <span className="text-[10px] text-purple-600 font-bold">Immutable Rate</span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Estimated Monthly Payout</span>
          <p className="text-lg font-black text-emerald-600">${estimatedPayout.toFixed(2)} CAD</p>
          <span className="text-[10px] text-slate-500 font-mono">{totalDaysPresent} × ${DAILY_RATE.toFixed(2)}</span>
        </div>
      </div>

      {/* Submission & Approval Status Banner */}
      {isSubmitted && (
        <div className={`no-print border-2 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-neo-sm ${
          isPaidOut ? 'bg-emerald-50 border-emerald-500' :
          isApprovedByAdmin ? 'bg-blue-50 border-blue-500' :
          'bg-amber-50 border-amber-500'
        }`}>
          <div className="flex items-center gap-3">
            {isPaidOut ? (
              <DollarSign className="w-6 h-6 text-emerald-600 flex-shrink-0" />
            ) : isApprovedByAdmin ? (
              <ShieldCheck className="w-6 h-6 text-blue-600 flex-shrink-0" />
            ) : (
              <Clock className="w-6 h-6 text-amber-600 flex-shrink-0" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-black uppercase tracking-wide text-slate-900">
                  {isPaidOut
                    ? 'Timesheet Paid Out — Locked for Records'
                    : isApprovedByAdmin
                    ? 'Timesheet Approved by the Agency Director — Locked for Payroll'
                    : 'Timesheet Submitted for Review (Changes Permitted)'}
                </h4>
                {hasUnsavedChanges && !isApprovedByAdmin && !isPaidOut && (
                  <span className="bg-amber-200 text-amber-950 px-2 py-0.5 rounded text-[10px] font-black uppercase border border-amber-300 animate-pulse">
                    Unsaved Edits
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-700 mt-0.5">
                {isPaidOut
                  ? `Direct provider payout of $${estimatedPayout.toFixed(2)} CAD has been disbursed. Locked for CCEYA financial audit.`
                  : isApprovedByAdmin
                  ? `Verified and approved by the Agency Director on ${submittedTimestamp}. Payout is queued for disbursement.`
                  : `Digitally submitted by ${providerSignature} on ${submittedTimestamp}. As long as the Agency Director hasn't confirmed or paid out this sheet yet, you can freely make changes and click "Save & Update Submitted Timesheet" below.`}
              </p>
            </div>
          </div>

          {/* Quick simulator status toggle for testing */}
          <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0 bg-white/80 p-1.5 rounded-xl border border-slate-300 text-[10px] font-bold">
            <span className="text-slate-500 px-1">Admin Status:</span>
            <button
              type="button"
              onClick={() => { setIsApprovedByAdmin(false); setIsPaidOut(false); }}
              className={`px-2 py-1 rounded-lg transition-colors ${!isApprovedByAdmin && !isPaidOut ? 'bg-amber-500 text-white font-black' : 'text-slate-700 hover:bg-slate-100'}`}
              title="Submitted and pending the agency's review (editable)"
            >
              Pending
            </button>
            <button
              type="button"
              onClick={() => { setIsApprovedByAdmin(true); setIsPaidOut(false); }}
              className={`px-2 py-1 rounded-lg transition-colors ${isApprovedByAdmin && !isPaidOut ? 'bg-blue-600 text-white font-black' : 'text-slate-700 hover:bg-slate-100'}`}
              title="Simulate the Agency Director approving the timesheet (locks edits)"
            >
              Approved
            </button>
            <button
              type="button"
              onClick={() => { setIsApprovedByAdmin(true); setIsPaidOut(true); }}
              className={`px-2 py-1 rounded-lg transition-colors ${isPaidOut ? 'bg-emerald-600 text-white font-black' : 'text-slate-700 hover:bg-slate-100'}`}
              title="Simulate timesheet paid out (locks edits)"
            >
              Paid
            </button>
          </div>
        </div>
      )}

      {updateToast && (
        <div className="no-print bg-emerald-600 text-white font-bold text-xs p-3 rounded-2xl shadow-neo-sm flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{updateToast}</span>
          </div>
          <button onClick={() => setUpdateToast(null)} className="text-white/80 hover:text-white">✕</button>
        </div>
      )}

      {/* Printable Sheet Surface (Form PROV-1 Standardized Single Daily Session) */}
      <div className="print-timesheet-fit max-w-[850px] mx-auto bg-white p-6 border-2 border-slate-900 text-slate-900 font-sans text-xs space-y-4 print:p-0 print:border-none">
        {/* Header Ribbon - Aligned with Physical Ministry Audit Binder */}
        <div className="flex items-start justify-between pb-3 border-b-2 border-slate-900 gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src={activeLogo.url}
              alt={accsEntity.name}
              className="h-16 w-auto max-w-[210px] object-contain"
              onError={(e) => {
                if (activeLogo.localFallbackUrl) (e.target as HTMLImageElement).src = activeLogo.localFallbackUrl;
              }}
            />
            <div>
              <h2 className="text-base font-black text-slate-900 leading-tight">
                {accsEntity.name}
              </h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                Official Paper Form Template
              </p>
              <p className="text-[9px] font-mono text-slate-500 font-semibold mt-0.5">
                Ministry License: <span className="font-bold text-slate-900">{accsEntity.licenseNumber}</span>
              </p>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <div className="flex items-center justify-end gap-2">
              <span className="text-xs font-mono font-extrabold bg-slate-900 text-white px-2 py-0.5 rounded">
                FORM PROV-1
              </span>
              <span className="text-[10px] font-mono text-slate-500 font-bold">v2026.1</span>
            </div>
            <h1 className="text-sm font-black tracking-tight uppercase text-slate-900 mt-1.5">
              Provider Monthly Attendance & Working Hours Timesheet
            </h1>
            <p className="text-[10px] text-slate-500 mt-0.5 max-w-[340px] ml-auto">
              Ontario CCEYA Statutory Attendance & Provincial CWELCC Operating Hours Reconciliation (Days 1–31)
            </p>
          </div>
        </div>

        {/* Info Rows */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs border-b border-slate-300 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-bold">Month:</span>
            <span className="border-b border-slate-900 flex-1 px-1 font-bold">{month}</span>
            <span className="font-bold ml-2">Year:</span>
            <span className="border-b border-slate-900 w-16 px-1 font-bold text-center">{year}</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold justify-end">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input 
                type="checkbox" 
                checked={true} 
                readOnly 
                className="rounded text-slate-900 focus:ring-0"
              />
              <span className="text-slate-900 font-bold">All Child Care Solutions Inc.</span>
            </label>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              ✓ Statutory Compliance Active
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold">[Child Name] Last:</span>
            <span className="border-b border-slate-900 flex-1 px-1 font-bold">{selectedChild?.fullName.split(' ').slice(1).join(' ') || ''}</span>
            <span className="font-bold">First:</span>
            <span className="border-b border-slate-900 flex-1 px-1 font-bold">{selectedChild?.fullName.split(' ')[0] || ''}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold">[Provider Name] Last:</span>
            <span className="border-b border-slate-900 flex-1 px-1 font-bold">{provider.name.split(' ').slice(1).join(' ')}</span>
            <span className="font-bold">First:</span>
            <span className="border-b border-slate-900 flex-1 px-1 font-bold">{provider.name.split(' ')[0]}</span>
            <span className="font-bold">Phone:</span>
            <span className="border-b border-slate-900 w-28 px-1 font-bold">{provider.phone}</span>
          </div>
        </div>

        {/* 31-Day Consolidated Attendance & Operating Hours Table */}
        <div className="border-2 border-slate-900">
          <table className="w-full text-[10px] text-center border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-black text-[9px] uppercase tracking-wide">
                <th className="border-r border-slate-700 py-1 w-10">DATE</th>
                <th colSpan={3} className="border-r border-slate-700 py-1 bg-orange-600">
                  CHILD ATTENDANCE (SINGLE SESSION)
                </th>
                <th colSpan={3} className="border-r border-slate-700 py-1 bg-slate-800">
                  PROVIDER OPERATIONAL SHIFT (CWELCC)
                </th>
                <th className="py-1 w-28 bg-slate-700">STATUS / NOTES</th>
              </tr>
              <tr className="bg-slate-100 border-b-2 border-slate-900 font-extrabold text-[9px] text-slate-800">
                <th className="border-r border-slate-900 py-0.5">DAY</th>
                <th className="border-r border-slate-300 py-0.5 w-18">ARRIVAL IN</th>
                <th className="border-r border-slate-300 py-0.5 w-18">DEPART OUT</th>
                <th className="border-r border-slate-900 py-0.5 w-16 bg-orange-50 font-black text-orange-950">DAILY HRS</th>
                <th className="border-r border-slate-300 py-0.5 w-18">SHIFT OPEN</th>
                <th className="border-r border-slate-300 py-0.5 w-18">SHIFT CLOSE</th>
                <th className="border-r border-slate-900 py-0.5 w-16 bg-slate-200 font-black text-slate-950">OPER. HRS</th>
                <th className="py-0.5">COMMENTS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {rows.map((row, idx) => (
                <tr key={row.day} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                  <td className="border-r border-slate-900 font-bold py-0.5 bg-slate-100">{row.day}</td>
                  
                  {/* Child Attendance Single Daily Session */}
                  <td className="border-r border-slate-300 py-0.5">
                    <div className="relative group flex items-center justify-center">
                      <input
                        type="text"
                        value={row.childIn}
                        disabled={isApprovedByAdmin || isPaidOut}
                        onChange={(e) => handleRowChange(idx, 'childIn', e.target.value)}
                        placeholder="—"
                        className="w-full text-center bg-transparent focus:outline-none font-medium disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                      />
                      {!isApprovedByAdmin && !isPaidOut && (
                        <button
                          type="button"
                          onClick={() => handleOpenClockEdit(idx, 'childIn', row.day, 'Child Arrival', row.childIn)}
                          className="opacity-40 hover:opacity-100 group-hover:opacity-100 p-0.5 text-orange-500 hover:text-orange-600 cursor-pointer no-print"
                          title="Touch Clock Picker"
                        >
                          <Clock className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="border-r border-slate-300 py-0.5">
                    <div className="relative group flex items-center justify-center">
                      <input
                        type="text"
                        value={row.childOut}
                        disabled={isApprovedByAdmin || isPaidOut}
                        onChange={(e) => handleRowChange(idx, 'childOut', e.target.value)}
                        placeholder="—"
                        className="w-full text-center bg-transparent focus:outline-none font-medium disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                      />
                      {!isApprovedByAdmin && !isPaidOut && (
                        <button
                          type="button"
                          onClick={() => handleOpenClockEdit(idx, 'childOut', row.day, 'Child Departure', row.childOut)}
                          className="opacity-40 hover:opacity-100 group-hover:opacity-100 p-0.5 text-orange-500 hover:text-orange-600 cursor-pointer no-print"
                          title="Touch Clock Picker"
                        >
                          <Clock className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="border-r border-slate-900 py-0.5 bg-orange-50/50">
                    <input
                      type="number"
                      step="0.5"
                      value={row.childHours || ''}
                      disabled={isApprovedByAdmin || isPaidOut}
                      onChange={(e) => handleRowChange(idx, 'childHours', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full text-center bg-transparent font-black text-orange-950 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </td>

                  {/* Provider Operational Working Hours */}
                  <td className="border-r border-slate-300 py-0.5">
                    <div className="relative group flex items-center justify-center">
                      <input
                        type="text"
                        value={row.providerIn}
                        disabled={isApprovedByAdmin || isPaidOut}
                        onChange={(e) => handleRowChange(idx, 'providerIn', e.target.value)}
                        placeholder="—"
                        className="w-full text-center bg-transparent focus:outline-none font-medium disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                      />
                      {!isApprovedByAdmin && !isPaidOut && (
                        <button
                          type="button"
                          onClick={() => handleOpenClockEdit(idx, 'providerIn', row.day, 'Shift Open', row.providerIn)}
                          className="opacity-40 hover:opacity-100 group-hover:opacity-100 p-0.5 text-slate-500 hover:text-slate-800 cursor-pointer no-print"
                          title="Touch Clock Picker"
                        >
                          <Clock className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="border-r border-slate-300 py-0.5">
                    <div className="relative group flex items-center justify-center">
                      <input
                        type="text"
                        value={row.providerOut}
                        disabled={isApprovedByAdmin || isPaidOut}
                        onChange={(e) => handleRowChange(idx, 'providerOut', e.target.value)}
                        placeholder="—"
                        className="w-full text-center bg-transparent focus:outline-none font-medium disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                      />
                      {!isApprovedByAdmin && !isPaidOut && (
                        <button
                          type="button"
                          onClick={() => handleOpenClockEdit(idx, 'providerOut', row.day, 'Shift Close', row.providerOut)}
                          className="opacity-40 hover:opacity-100 group-hover:opacity-100 p-0.5 text-slate-500 hover:text-slate-800 cursor-pointer no-print"
                          title="Touch Clock Picker"
                        >
                          <Clock className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="border-r border-slate-900 py-0.5 bg-slate-100">
                    <input
                      type="number"
                      step="0.5"
                      value={row.providerHours || ''}
                      disabled={isApprovedByAdmin || isPaidOut}
                      onChange={(e) => handleRowChange(idx, 'providerHours', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full text-center bg-transparent font-black text-slate-950 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </td>

                  {/* Notes / Status */}
                  <td className="py-0.5 px-1">
                    <input
                      type="text"
                      value={row.notes}
                      disabled={isApprovedByAdmin || isPaidOut}
                      onChange={(e) => handleRowChange(idx, 'notes', e.target.value)}
                      placeholder=""
                      className="w-full text-center bg-transparent text-[9px] focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-200 border-t-2 border-slate-900 font-extrabold text-[10px]">
                <td className="py-1.5 border-r border-slate-900 font-black">TOTALS</td>
                <td colSpan={2} className="text-right pr-2 py-1.5 border-r border-slate-300 text-slate-700">
                  Child Attendance Hours:
                </td>
                <td className="py-1.5 border-r border-slate-900 font-black font-mono bg-orange-100 text-orange-950">
                  {totalChildHours.toFixed(1)} hrs
                </td>
                <td colSpan={2} className="text-right pr-2 py-1.5 border-r border-slate-300 text-slate-700">
                  Provider Operating Hours:
                </td>
                <td className="py-1.5 border-r border-slate-900 font-black font-mono bg-slate-300 text-slate-950">
                  {totalProviderOperatingHours.toFixed(1)} hrs
                </td>
                <td className="py-1.5 font-black text-slate-900 text-center font-mono">
                  {totalDaysPresent} Care Days
                </td>
              </tr>
              <tr className="bg-slate-900 text-white font-black text-[10px]">
                <td colSpan={5} className="py-1.5 pl-3 text-left">
                  MONTHLY PAYOUT CALCULATION: {totalDaysPresent} verified care days × $35.00/day
                </td>
                <td colSpan={3} className="py-1.5 pr-3 text-right font-mono text-emerald-400 text-xs">
                  TOTAL ESTIMATED PAYOUT: ${estimatedPayout.toFixed(2)} CAD
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Bottom Signatures & Notes */}
        <div className="space-y-3 pt-3 border-t border-slate-300 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold">Provider Signature:</span>
              <input
                type="text"
                value={providerSignature}
                disabled={isApprovedByAdmin || isPaidOut}
                onChange={(e) => setProviderSignature(e.target.value)}
                className="flex-1 border-b border-slate-900 font-bold px-1 focus:outline-none disabled:opacity-60"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">Parent Signature:</span>
              <input
                type="text"
                value={parentSignature}
                disabled={isApprovedByAdmin || isPaidOut}
                onChange={(e) => setParentSignature(e.target.value)}
                placeholder="Parent verification signature"
                className="flex-1 border-b border-slate-900 font-bold px-1 focus:outline-none disabled:opacity-60"
              />
            </div>
          </div>

          <div className="flex items-start gap-2">
            <span className="font-bold pt-1">Notes / Variance:</span>
            <textarea
              rows={2}
              value={generalNotes}
              disabled={isApprovedByAdmin || isPaidOut}
              onChange={(e) => setGeneralNotes(e.target.value)}
              placeholder="Enter any statutory holiday, illness, or variance notes for the Agency Director..."
              className="flex-1 p-1.5 border border-slate-300 rounded text-xs focus:outline-none disabled:opacity-60"
            />
          </div>

          <div className="no-print pt-2 flex items-center justify-between gap-3">
            <div className="text-[11px] text-slate-500 font-medium">
              {isPaidOut ? (
                <span className="text-emerald-700 font-bold">✓ Payout completed. Record archived.</span>
              ) : isApprovedByAdmin ? (
                <span className="text-blue-700 font-bold">✓ Timesheet confirmed and approved by the Agency Director.</span>
              ) : isSubmitted ? (
                <span className="text-amber-700 font-bold">ℹ️ Edits are open until the Agency Director confirms or pays out.</span>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSubmitTimesheet}
                disabled={isApprovedByAdmin || isPaidOut || !providerSignature.trim()}
                className={`neo-btn text-white px-5 py-2 text-xs font-black flex items-center gap-2 shadow-neo-sm transition-all ${
                  isPaidOut
                    ? 'bg-emerald-800 opacity-60 cursor-not-allowed'
                    : isApprovedByAdmin
                    ? 'bg-blue-800 opacity-60 cursor-not-allowed'
                    : isSubmitted && hasUnsavedChanges
                    ? 'bg-orange-500 hover:bg-orange-400'
                    : isSubmitted
                    ? 'bg-slate-800 hover:bg-slate-700'
                    : 'bg-slate-900 hover:bg-slate-800'
                }`}
              >
                {isPaidOut ? (
                  <>
                    <Lock className="w-4 h-4 text-emerald-300" />
                    <span>Timesheet Paid Out — Locked</span>
                  </>
                ) : isApprovedByAdmin ? (
                  <>
                    <Lock className="w-4 h-4 text-blue-300" />
                    <span>Approved by the Agency Director — Locked</span>
                  </>
                ) : isSubmitted ? (
                  <>
                    <FileCheck className="w-4 h-4 text-orange-400" />
                    <span>{hasUnsavedChanges ? '💾 Save & Re-Submit Updated Timesheet' : '✓ Timesheet Submitted (Click to Re-save)'}</span>
                  </>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4 text-orange-400" />
                    <span>Submit Timesheet for Payroll Verification</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* On-Brand Touch Clock Picker Modal for Timesheet Cells */}
      {activeClockEdit && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setActiveClockEdit(null);
            }
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
                  Day {activeClockEdit.day}: Set {activeClockEdit.label}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveClockEdit(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Select time using the mobile touch clock dial (zero typing required):
            </p>

            <OnBrandClockPicker
              value={clockPickerModalValue}
              onChange={(formatted12h) => setClockPickerModalValue(formatted12h)}
              presetType={activeClockEdit.field.includes('Out') ? 'departure' : 'arrival'}
              label={`${activeClockEdit.label} Time`}
            />

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveClockEdit(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleApplyClockEdit(clockPickerModalValue)}
                className="neo-btn bg-orange-600 hover:bg-orange-500 text-white px-4 py-1.5 text-xs font-bold shadow-neo-sm"
              >
                Apply Time
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
