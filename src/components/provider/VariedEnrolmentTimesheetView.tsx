import React, { useState, useEffect } from 'react';
import { Provider, Child, AttendanceEntry } from '../../types';
import { 
  loadLogosFromStorage, 
  loadActivePrintLogoId, 
  AGENCY_ENTITIES 
} from '../../data/agencyLogosData';
import { 
  Printer, 
  Sparkles, 
  Check, 
  RotateCcw, 
  Building2, 
  Calendar, 
  User, 
  Home, 
  Download,
  Info
} from 'lucide-react';

interface VariedEnrolmentTimesheetViewProps {
  provider: Provider;
  childrenList: Child[];
  attendanceState?: Record<string, AttendanceEntry>;
  onClose?: () => void;
}

interface DayRow {
  dayName: string; // Sun, Mon, Tues, Wed, Thurs, Fri, Sat
  dateNum: string; // Day of month or date string
  inTime: string;
  outTime: string;
  schedule: string;
  legendCode: 'SE' | 'AE' | 'CE' | 'NP' | 'H' | '';
  hrsAttendedDifferent: string;
}

interface WeekCardData {
  weekNum: number;
  days: DayRow[];
  totalDaysCharged: number;
  parentsInitial: string;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'];

export function generateVariedEnrolmentWeeks(
  billingMonth: string,
  child: Child | undefined,
  attendanceState: Record<string, AttendanceEntry>
): WeekCardData[] {
  const parts = billingMonth.split(' ');
  const mName = parts[0] || 'October';
  const year = parseInt(parts[1], 10) || 2026;
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthIndex = monthNames.findIndex(m => m.toLowerCase() === mName.toLowerCase());
  const validMonth = monthIndex >= 0 ? monthIndex : 9; // default to October (index 9)

  const firstDayOfMonth = new Date(year, validMonth, 1);
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun

  const now = new Date();
  const isSelectedCurrentMonth = now.getFullYear() === year && now.getMonth() === validMonth;
  const todayDateNum = now.getDate();

  const liveAttendance = child ? attendanceState[child.id] : undefined;
  const initial = child?.emergencyContacts[0]?.name.split(' ').map(n => n[0]).join('') || 'ST';

  const startDate = new Date(year, validMonth, 1 - startDayOfWeek);
  const curr = new Date(startDate);

  const weeks: WeekCardData[] = [];

  for (let w = 1; w <= 5; w++) {
    const days: DayRow[] = [];
    let chargedDaysInWeek = 0;

    for (let d = 0; d < 7; d++) {
      const dayName = DAYS_OF_WEEK[d];
      const isWeekend = dayName === 'Sun' || dayName === 'Sat';
      const isCurrentMonth = curr.getMonth() === validMonth;
      const dateNumStr = isCurrentMonth ? `${curr.getDate()}` : '';
      const dayDate = curr.getDate();
      const isToday = isSelectedCurrentMonth && isCurrentMonth && dayDate === todayDateNum;

      if (!isCurrentMonth || isWeekend) {
        days.push({
          dayName,
          dateNum: dateNumStr,
          inTime: '',
          outTime: '',
          schedule: '',
          legendCode: '',
          hrsAttendedDifferent: ''
        });
      } else {
        // Enrolled Weekday in current billing month
        if (isToday && liveAttendance) {
          const inT = liveAttendance.checkIn || '8:00 AM';
          const outT = liveAttendance.checkOut || '4:30 PM';
          const hrs = liveAttendance.netHours || 8.5;
          const status = liveAttendance.status;
          const legendCode: DayRow['legendCode'] = status === 'sick' ? 'SE' : (status === 'absent' ? 'AE' : '');
          
          days.push({
            dayName,
            dateNum: dateNumStr,
            inTime: status === 'absent' ? '' : inT,
            outTime: status === 'absent' ? '' : outT,
            schedule: status === 'absent' ? 'Absent' : `Full Day (${hrs} hrs)`,
            legendCode,
            hrsAttendedDifferent: (status !== 'absent' && hrs !== 8.5) ? `${hrs}` : ''
          });
          if (status !== 'absent') chargedDaysInWeek++;
        } else {
          days.push({
            dayName,
            dateNum: dateNumStr,
            inTime: '8:00 AM',
            outTime: '4:30 PM',
            schedule: 'Full Day',
            legendCode: '',
            hrsAttendedDifferent: ''
          });
          chargedDaysInWeek++;
        }
      }

      curr.setDate(curr.getDate() + 1);
    }

    weeks.push({
      weekNum: w,
      days,
      totalDaysCharged: chargedDaysInWeek,
      parentsInitial: initial
    });
  }

  return weeks;
}

export const VariedEnrolmentTimesheetView: React.FC<VariedEnrolmentTimesheetViewProps> = ({
  provider,
  childrenList,
  attendanceState = {},
  onClose
}) => {
  const enrolledChildren = childrenList.filter(c => c.providerId === provider.id);
  const [selectedChildId, setSelectedChildId] = useState<string>(enrolledChildren[0]?.id || '');
  const selectedChild = childrenList.find(c => c.id === selectedChildId) || enrolledChildren[0];

  // Default to current active month (e.g. October 2026)
  const currentMonthStr = `${new Date().toLocaleString('en-US', { month: 'long' })} ${new Date().getFullYear()}`;
  const [billingMonth, setBillingMonth] = useState(currentMonthStr);

  // Official Agency Media & Logo Sync (Synchronized with Master Ministry Audit Binder)
  const logosList = loadLogosFromStorage();
  const activeLogoId = loadActivePrintLogoId();
  const activeLogo = logosList.find(l => l.id === activeLogoId) || logosList.find(l => l.agencyEntity === 'accs') || logosList[0];
  const accsEntity = AGENCY_ENTITIES['accs'];

  const [parentSignature, setParentSignature] = useState('');
  const [isAutoFilled, setIsAutoFilled] = useState(false);

  // Initialize and auto-sync 5 Weeks of schedule data with live attendance and calendar dates
  const [weeks, setWeeks] = useState<WeekCardData[]>(() => {
    return generateVariedEnrolmentWeeks(currentMonthStr, selectedChild, attendanceState);
  });

  // Re-sync when child, month, or live attendance state changes
  useEffect(() => {
    setWeeks(generateVariedEnrolmentWeeks(billingMonth, selectedChild, attendanceState));
  }, [billingMonth, selectedChildId, attendanceState]);

  // Manual trigger for Auto-fill schedule
  const handleAutoFillFromAttendance = () => {
    if (!selectedChild) return;
    setWeeks(generateVariedEnrolmentWeeks(billingMonth, selectedChild, attendanceState));
    setIsAutoFilled(true);
    setTimeout(() => setIsAutoFilled(false), 3000);
  };

  const handleDayChange = (
    weekIdx: number, 
    dayIdx: number, 
    field: keyof DayRow, 
    value: string
  ) => {
    setWeeks(prev => {
      const next = [...prev];
      const targetWeek = { ...next[weekIdx] };
      const targetDays = [...targetWeek.days];
      targetDays[dayIdx] = { ...targetDays[dayIdx], [field]: value };
      targetWeek.days = targetDays;

      // Recalculate days charged
      targetWeek.totalDaysCharged = targetDays.filter(
        d => (d.inTime || d.legendCode) && d.legendCode !== 'NP'
      ).length;

      next[weekIdx] = targetWeek;
      return next;
    });
  };

  const handlePrint = () => {
    window.print();
  };

  // Grand Total of days charged across all 5 weeks
  const grandTotalDays = weeks.reduce((sum, w) => sum + (Number(w.totalDaysCharged) || 0), 0);

  return (
    <div className="bg-white rounded-3xl border-2 border-slate-900 p-4 sm:p-8 space-y-6">
      {/* On-Screen Action Bar (Hidden when Printing) */}
      <div className="no-print print:hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 bg-slate-50 border-2 border-slate-900 rounded-2xl">
        <div className="flex flex-wrap items-center gap-3">
          {/* Child Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Child:</span>
            <select
              value={selectedChildId}
              onChange={(e) => setSelectedChildId(e.target.value)}
              className="bg-white border-2 border-slate-900 rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-none"
            >
              {enrolledChildren.map(c => (
                <option key={c.id} value={c.id}>{c.fullName} ({c.ageYearsFormatted})</option>
              ))}
            </select>
          </div>

          {/* Month Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Month:</span>
            <select
              value={billingMonth}
              onChange={(e) => setBillingMonth(e.target.value)}
              className="bg-white border-2 border-slate-900 rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-none"
            >
              <option value="September 2026">September 2026</option>
              <option value="October 2026">October 2026</option>
              <option value="November 2026">November 2026</option>
              <option value="December 2026">December 2026</option>
              <option value="August 2026">August 2026</option>
            </select>
          </div>

          {/* Agency Identification Badge */}
          <div className="flex items-center gap-1.5 bg-orange-100/90 px-3 py-1.5 border border-orange-300 rounded-xl text-xs font-black text-orange-950">
            <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
            <span>Agency: DaycareOS Inc.</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleAutoFillFromAttendance}
            className="neo-btn bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3.5 py-2 font-black flex items-center gap-1.5 shadow-neo-sm"
            title="Auto-fill timesheet using actual child attendance logs"
          >
            {isAutoFilled ? <Check className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5 text-yellow-300" />}
            <span>{isAutoFilled ? 'Attendance Applied!' : 'Auto-Fill from Live Attendance'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="neo-btn bg-slate-900 hover:bg-slate-800 text-white text-xs px-4 py-2 font-black flex items-center gap-1.5 shadow-neo-sm"
          >
            <Printer className="w-4 h-4 text-orange-400" />
            <span>Print 5-Week Timesheet</span>
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

      {/* 5-Week Timesheet Printable Document Surface */}
      <div className="varied-timesheet-print-surface max-w-[850px] mx-auto bg-white p-2 sm:p-6 border-2 border-slate-800 text-slate-900 font-sans text-xs">
        {/* Header Ribbon (Aligned with Physical Ministry Audit Binder) */}
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
                FORM PROV-1B
              </span>
              <span className="text-[10px] font-mono text-slate-500 font-bold">v2026.1</span>
            </div>
            <h1 className="text-sm font-black tracking-tight uppercase text-slate-900 mt-1.5">
              Varied Enrolment Timesheet
            </h1>
            <p className="text-[10px] text-slate-500 mt-0.5 max-w-[340px] ml-auto">
              Official Ministry of Education Attendance & Subsidy Timesheet (5-Week Extended Cycle)
            </p>
          </div>
        </div>

        {/* Metadata Fields Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 py-3 border-b-2 border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Child's Name:</span>
            <span className="flex-1 border-b border-slate-900 font-bold px-1 text-slate-900">
              {selectedChild?.fullName || '________________________________'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Month:</span>
            <span className="flex-1 border-b border-slate-900 font-bold px-1 text-slate-900">
              {billingMonth}
            </span>
          </div>

          <div className="sm:col-span-2 flex items-center gap-2">
            <span className="font-bold text-slate-800">Child Care Service Provider:</span>
            <span className="flex-1 border-b border-slate-900 font-bold px-1 text-slate-900">
              {provider.name} — {provider.homeName} ({provider.homeAddress})
            </span>
          </div>
        </div>

        {/* 5-Week Cards Grid (Strict Image Format: 2-Column Responsive) */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {weeks.map((week, wIdx) => (
            <div 
              key={week.weekNum} 
              className={`border-2 border-slate-900 text-[11px] ${wIdx === 4 ? 'md:col-span-2 md:max-w-md md:mx-auto w-full' : ''}`}
            >
              {/* Card Table Header */}
              <div className="grid grid-cols-12 bg-slate-100 border-b-2 border-slate-900 font-bold text-center py-1">
                <div className="col-span-2 border-r border-slate-900">DATE</div>
                <div className="col-span-2 border-r border-slate-900 text-slate-900 font-extrabold">
                  Week {week.weekNum}
                </div>
                <div className="col-span-3 border-r border-slate-900">Schedule</div>
                <div className="col-span-2 border-r border-slate-900 leading-tight text-[9px]">Legend Code</div>
                <div className="col-span-3 leading-tight text-[9px]">Hrs. Attended if different</div>
              </div>

              {/* 7 Days: Sunday through Saturday (Each with In & Out rows) */}
              <div className="divide-y divide-slate-300">
                {week.days.map((day, dIdx) => (
                  <div key={day.dayName} className="grid grid-cols-12 items-center text-[10px]">
                    {/* Day Name & Date */}
                    <div className="col-span-2 text-center font-bold border-r border-slate-900 py-1 bg-slate-50">
                      <div>{day.dayName}</div>
                      <input
                        type="text"
                        placeholder="Date"
                        value={day.dateNum}
                        onChange={(e) => handleDayChange(wIdx, dIdx, 'dateNum', e.target.value)}
                        className="w-full text-center text-[9px] bg-transparent focus:outline-none"
                      />
                    </div>

                    {/* In / Out Sub-rows */}
                    <div className="col-span-2 border-r border-slate-900 divide-y divide-slate-300 text-center font-semibold">
                      <div className="py-0.5 flex items-center justify-between px-1">
                        <span className="text-slate-400 text-[9px]">In:</span>
                        <input
                          type="text"
                          value={day.inTime}
                          onChange={(e) => handleDayChange(wIdx, dIdx, 'inTime', e.target.value)}
                          className="w-10 text-center text-[9px] focus:outline-none"
                        />
                      </div>
                      <div className="py-0.5 flex items-center justify-between px-1">
                        <span className="text-slate-400 text-[9px]">Out:</span>
                        <input
                          type="text"
                          value={day.outTime}
                          onChange={(e) => handleDayChange(wIdx, dIdx, 'outTime', e.target.value)}
                          className="w-10 text-center text-[9px] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Schedule */}
                    <div className="col-span-3 border-r border-slate-900 px-1 py-1">
                      <input
                        type="text"
                        value={day.schedule}
                        onChange={(e) => handleDayChange(wIdx, dIdx, 'schedule', e.target.value)}
                        placeholder="e.g. 8am–4:30pm"
                        className="w-full text-[10px] text-center bg-transparent focus:outline-none"
                      />
                    </div>

                    {/* Legend Code Dropdown */}
                    <div className="col-span-2 border-r border-slate-900 px-0.5 py-1 text-center">
                      <select
                        value={day.legendCode}
                        onChange={(e) => handleDayChange(wIdx, dIdx, 'legendCode', e.target.value as any)}
                        className="w-full text-center font-bold text-[10px] bg-transparent focus:outline-none"
                      >
                        <option value="">—</option>
                        <option value="SE">SE</option>
                        <option value="AE">AE</option>
                        <option value="CE">CE</option>
                        <option value="NP">NP</option>
                        <option value="H">H</option>
                      </select>
                    </div>

                    {/* Hrs Attended if Different */}
                    <div className="col-span-3 px-1 py-1 text-center">
                      <input
                        type="text"
                        value={day.hrsAttendedDifferent}
                        onChange={(e) => handleDayChange(wIdx, dIdx, 'hrsAttendedDifferent', e.target.value)}
                        placeholder="—"
                        className="w-full text-center text-[10px] bg-transparent focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Days Charged & Parents Initial Footer Strip */}
              <div className="grid grid-cols-12 border-t-2 border-slate-900 bg-slate-50 text-[10px] font-bold">
                <div className="col-span-8 p-1.5 border-r border-slate-900 flex items-center justify-between">
                  <span>Total Days Charged:</span>
                  <input
                    type="number"
                    value={week.totalDaysCharged}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setWeeks(prev => {
                        const next = [...prev];
                        next[wIdx] = { ...next[wIdx], totalDaysCharged: val };
                        return next;
                      });
                    }}
                    className="w-12 text-center font-bold bg-white border border-slate-300 rounded focus:outline-none"
                  />
                </div>

                <div className="col-span-4 p-1.5 flex items-center justify-between">
                  <span>Parents Initial:</span>
                  <input
                    type="text"
                    value={week.parentsInitial}
                    onChange={(e) => {
                      const val = e.target.value;
                      setWeeks(prev => {
                        const next = [...prev];
                        next[wIdx] = { ...next[wIdx], parentsInitial: val };
                        return next;
                      });
                    }}
                    placeholder="Initials"
                    className="w-12 text-center uppercase font-bold bg-white border border-slate-300 rounded focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Grand Total Summary Box */}
        <div className="mt-4 p-2.5 bg-slate-100 border-2 border-slate-900 flex items-center justify-between text-xs font-bold">
          <span>Month Grand Total (All 5 Weeks):</span>
          <span className="text-base font-black font-mono text-slate-900">
            {grandTotalDays} Billable Care Days
          </span>
        </div>

        {/* Legend and Parent Signature Footer (Strict Image Replica) */}
        <div className="mt-5 pt-3 border-t-2 border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 items-end text-xs">
          {/* Parent Signature Block */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">Parent Signature:</span>
              <input
                type="text"
                value={parentSignature}
                onChange={(e) => setParentSignature(e.target.value)}
                placeholder="Type full legal name as digital signature"
                className="flex-1 border-b-2 border-slate-900 px-1 font-semibold text-slate-800 focus:outline-none"
              />
            </div>
            <p className="text-[10px] text-slate-500">
              I certify that the above recorded care days and hours reflect the care provided for this billing period.
            </p>
          </div>

          {/* Explanatory Legend Block */}
          <div className="bg-slate-50 p-2.5 border border-slate-300 rounded-lg text-[10px] leading-tight space-y-1">
            <div className="font-bold text-slate-900 underline uppercase tracking-wider">LEGEND</div>
            <div className="text-slate-700">
              <span className="font-bold text-slate-900">SE</span> - Sick on scheduled day, insufficient notice, payment expected
            </div>
            <div className="text-slate-700">
              <span className="font-bold text-slate-900">AE</span> - Absent on scheduled day, insufficient notice, payment expected
            </div>
            <div className="text-slate-700">
              <span className="font-bold text-slate-900">CE</span> - Time changed, insufficient notice, payment expected for scheduled hours
            </div>
            <div className="text-slate-700">
              <span className="font-bold text-slate-900">NP</span> - No payment expected
            </div>
            <div className="text-slate-700">
              <span className="font-bold text-slate-900">H</span> - Statutory Holiday
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
