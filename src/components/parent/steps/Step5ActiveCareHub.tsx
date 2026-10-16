import React from 'react';
import { Child, Provider } from '../../../types';
import { 
  Utensils, 
  DollarSign, 
  Calendar, 
  Clock, 
  UserCheck, 
  AlertTriangle, 
  ShieldCheck, 
  HeartPulse, 
  FileText,
  MessageSquare
} from 'lucide-react';

export interface Step5ActiveCareHubProps {
  activeChild?: Child;
  matchedProvider: Provider | null;
  attendanceState?: Record<string, { status: string; checkIn?: string; checkOut?: string }>;
  onOpenNotes?: () => void;
}

export const Step5ActiveCareHub: React.FC<Step5ActiveCareHubProps> = ({
  activeChild,
  matchedProvider,
  attendanceState,
  onOpenNotes
}) => {
  const childAttendance = (activeChild?.id && attendanceState && attendanceState[activeChild.id]) || { status: 'not_checked_in' };
  const currentStatus = childAttendance.status || 'not_checked_in';

  const monthlyFeeFormatted = activeChild?.monthlyFee !== undefined
    ? activeChild.monthlyFee.toFixed(2)
    : activeChild?.fundingType === 'subsidy'
    ? '0.00'
    : '478.50';

  const fundingLabel = activeChild?.fundingType === 'subsidy'
    ? 'Municipal Subsidy ($0.00 Co-Pay)'
    : activeChild?.fundingType === 'private'
    ? 'Private Care Rate ($35.00/Day)'
    : activeChild?.fundingType === 'cwelcc_target'
    ? 'CWELCC Target ($10.00/Day)'
    : 'CWELCC Subsidized Fee ($22.00/Day)';

  return (
    <div className="space-y-6">
      {/* Active Status Welcome Banner */}
      <div className="bg-emerald-50 text-slate-900 p-6 rounded-3xl border-2 border-slate-900 shadow-neo flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full">
            Active Enrolment Status
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1.5">
            {activeChild?.fullName} is Actively Enrolled!
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Care Home: <strong>{matchedProvider?.name || 'Assigned Licensed Home'}</strong> ({matchedProvider?.homeAddress || matchedProvider?.neighborhood || 'Licensed Home Facility'}) • {fundingLabel} (${monthlyFeeFormatted}/mo)
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          {/* Dynamic Provider-Controlled Attendance Status Badge */}
          {currentStatus === 'present' ? (
            <div className="bg-white border-2 border-slate-900 text-slate-900 px-4 py-2 rounded-2xl font-extrabold text-xs flex items-center gap-2 shadow-neo-sm">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Today: Present & Checked In ({childAttendance.checkIn || '8:15 AM'})</span>
            </div>
          ) : currentStatus === 'absent' ? (
            <div className="bg-amber-50 border-2 border-amber-400 text-amber-950 px-4 py-2 rounded-2xl font-extrabold text-xs flex items-center gap-2 shadow-neo-sm">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span>Today: Marked Absent</span>
            </div>
          ) : currentStatus === 'sick' ? (
            <div className="bg-rose-50 border-2 border-rose-400 text-rose-950 px-4 py-2 rounded-2xl font-extrabold text-xs flex items-center gap-2 shadow-neo-sm">
              <span className="w-3 h-3 rounded-full bg-rose-500"></span>
              <span>Today: Marked Sick / Illness</span>
            </div>
          ) : currentStatus === 'vacation' ? (
            <div className="bg-blue-50 border-2 border-blue-400 text-blue-950 px-4 py-2 rounded-2xl font-extrabold text-xs flex items-center gap-2 shadow-neo-sm">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <span>Today: On Vacation</span>
            </div>
          ) : (
            <div className="bg-slate-100 border-2 border-slate-400 text-slate-700 px-4 py-2 rounded-2xl font-extrabold text-xs flex items-center gap-2 shadow-neo-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
              <span>Today: Not Checked In Yet</span>
            </div>
          )}

          {/* Quick Notes Trigger */}
          {onOpenNotes && (
            <button
              type="button"
              onClick={onOpenNotes}
              className="neo-btn bg-white hover:bg-blue-50 text-blue-950 border-2 border-slate-900 px-4 py-2 rounded-2xl font-extrabold text-xs flex items-center gap-2 shadow-neo-sm cursor-pointer"
              title="View & add care notes for your child"
            >
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span>Care Notes</span>
            </button>
          )}
        </div>
      </div>

      {/* Provider Live Attendance Note */}
      <div className="p-3 bg-white rounded-2xl border-2 border-slate-900 shadow-neo-sm flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-700">
          <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Provider Attendance Protocol:</strong> Daily attendance is logged live by your licensed home provider (<strong>{matchedProvider?.name || 'Licensed Provider'}</strong>). Check-in timestamps update automatically upon morning arrival.
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 shrink-0">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>CCEYA Verified</span>
        </div>
      </div>

      {/* 4 Care Hub Cards: Daily Program, e-Transfer Fees & Termination Rules, Health/Sabrina's Law, Closures */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Attendance & Meals */}
        <div className="bg-white p-5 rounded-2xl border-2 border-slate-900 shadow-neo space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Utensils className="w-4 h-4 text-orange-500" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Today's Program</h3>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-xl">
              <span className="font-bold text-slate-800 block">Morning Snack:</span>
              <span className="text-slate-600">Organic apple slices, whole grain crackers & milk</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl">
              <span className="font-bold text-slate-800 block">Lunch (11:45 AM):</span>
              <span className="text-slate-600">Turkey, brown rice, steamed broccoli & sweet potato</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl">
              <span className="font-bold text-slate-800 block">Outdoor Gross Motor:</span>
              <span className="text-slate-600">Supervised nature walk & backyard sandbox play</span>
            </div>
          </div>
        </div>

        {/* Card 2: e-Transfer Fee Statement & Termination Notice */}
        <div className="bg-white p-5 rounded-2xl border-2 border-slate-900 shadow-neo space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Monthly Fee Statement</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-[10px] font-bold text-emerald-800 uppercase">
                {activeChild?.fundingType === 'subsidy' ? 'Municipal Subsidy Active' : activeChild?.fundingType === 'private' ? 'Private Care Rate' : activeChild?.fundingType === 'cwelcc_target' ? 'CWELCC Target Rate' : 'CWELCC Rate Active'}
              </span>
              <p className="text-xl font-extrabold text-emerald-900 mt-0.5">${monthlyFeeFormatted} CAD / Month</p>
              <p className="text-[10px] text-emerald-700 mt-1">Due on or before the 1st of each month.</p>
            </div>

            {activeChild?.fundingType === 'subsidy' && (() => {
              const quota = activeChild.subsidizedAbsenceQuota ?? 30;
              const used = activeChild.subsidizedAbsenceDaysUsed ?? 0;
              const remaining = Math.max(0, quota - used);
              const warnThreshold = Math.max(1, quota - 5);
              const isWarning = used >= warnThreshold;
              const isExceeded = used >= quota;

              return (
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-purple-950 text-[11px] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold uppercase tracking-wider text-[10px] text-purple-900">
                      Annual Subsidized Absence Allowance
                    </span>
                    <span className="font-mono font-black text-purple-900">
                      {used} / {quota} Days
                    </span>
                  </div>
                  <div className="w-full bg-purple-200 rounded-full h-2 overflow-hidden border border-purple-300">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isExceeded ? 'bg-rose-500' :
                        isWarning ? 'bg-amber-500' : 'bg-purple-600'
                      }`}
                      style={{ width: `${Math.min(100, ((used / quota) * 100))}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-purple-800">
                    <span>{remaining} Allowable Days Remaining</span>
                    <span>{activeChild.subsidyRegion || 'Municipal'} Guidelines</span>
                  </div>
                  {isWarning && (
                    <p className="text-[10px] text-amber-900 font-bold bg-amber-100 p-1.5 rounded-lg border border-amber-300">
                      {isExceeded
                        ? `⚠️ Annual ${quota}-day quota reached. Additional absent days cannot be reimbursed by municipal subsidy.`
                        : `⚠️ Notice: ${remaining} allowable days remaining. Contact agency if extended absence is expected.`}
                    </p>
                  )}
                </div>
              );
            })()}

            {/* Overdue Termination Escalation Notice */}
            {activeChild?.eTransferStatus === 'overdue' ? (
              <div className="p-3 bg-red-50 rounded-xl border-2 border-red-400 text-red-950 text-[11px] space-y-1">
                <div className="flex items-center gap-1.5 font-extrabold text-red-700">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span>Termination Warning: Fee Overdue</span>
                </div>
                <p className="leading-snug text-red-900">
                  Under ACCS Fee Policy, if payment is not received within 3 days after the 1st of the month, child care placement may be terminated immediately.
                </p>
              </div>
            ) : (
              <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] space-y-1">
                <p className="text-slate-600"><strong>Send e-Transfer:</strong> allchildcaresolutions@gmail.com</p>
                <p className="text-slate-600"><strong>Status:</strong> <span className="text-emerald-700 font-bold">✓ Account Reconciled</span></p>
              </div>
            )}
          </div>
        </div>

        {/* Card 3: Health, Sabrina's Law & Special Clearances */}
        <div className="bg-white p-5 rounded-2xl border-2 border-slate-900 shadow-neo space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <HeartPulse className="w-4 h-4 text-rose-500" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Health & Clearances</h3>
          </div>

          <div className="space-y-2 text-xs">
            {activeChild?.epiPenRequired && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-950 text-[11px] space-y-0.5">
                <span className="font-extrabold block text-rose-900 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-rose-600" />
                  Sabrina's Law: Epi-Pen
                </span>
                <p>Expiry Date: <strong>{activeChild.epiPenExpiry || 'On File (2026-09-12)'}</strong></p>
                <p className="text-rose-700 text-[10px]">Individualized anaphylaxis plan on site.</p>
              </div>
            )}

            {activeChild?.prescriptionMeds && activeChild.prescriptionMeds.length > 0 && (
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px]">
                <span className="font-bold text-slate-800 block">Prescription Medication:</span>
                <p className="text-slate-600">{activeChild.prescriptionMeds[0].medicationName}</p>
                <p className="text-[10px] text-slate-500">Exp: {activeChild.prescriptionMeds[0].expiryDate}</p>
              </div>
            )}

            {activeChild?.courtOrderExpiry && (
              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-950">
                <span className="font-bold block text-amber-900">Custody Order Decree on File</span>
                <p className="text-[10px] text-amber-800">Review Date: {activeChild.courtOrderExpiry}</p>
              </div>
            )}

            {activeChild?.specialPermissions && activeChild.specialPermissions.length > 0 ? (
              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-950">
                <span className="font-bold block text-blue-900">Special Permission:</span>
                <p className="text-[10px] text-blue-800">{activeChild.specialPermissions[0].title}</p>
              </div>
            ) : (
              <div className="p-2 bg-slate-50 rounded-xl text-[11px] text-slate-500">
                <span>All routine medical and emergency contact clearances verified.</span>
              </div>
            )}
          </div>
        </div>

        {/* Card 4: Agency Closures & Announcements */}
        <div className="bg-white p-5 rounded-2xl border-2 border-slate-900 shadow-neo space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Calendar className="w-4 h-4 text-purple-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Closures & Calendar</h3>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
              <span className="font-bold block">Labour Day (Closed):</span>
              <span className="text-[11px]">Monday, September 7, 2026</span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl">
              <span className="font-bold text-slate-800 block">RECE Home Visitor Audit:</span>
              <span className="text-slate-600 text-[11px]">September 18, 2026 (Unannounced)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card 5: Caregiver & Family Communication Notes */}
      <div className="bg-white p-5 rounded-2xl border-2 border-slate-900 shadow-neo space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-100 gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-900 border border-blue-200">
              <MessageSquare className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Caregiver & Family Notes
              </h3>
              <p className="text-[11px] text-slate-500">
                Direct two-way care notes and updates between your family and {matchedProvider?.name || 'your licensed provider'}.
              </p>
            </div>
          </div>

          <span className="text-[10px] bg-emerald-100 text-emerald-900 font-extrabold px-2.5 py-1 rounded-full border border-emerald-300 self-start sm:self-auto flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-700" />
            <span>External Care Channel</span>
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
          <p className="text-xs text-slate-600 max-w-xl">
            View daily care notes from your provider, check nap/meal observations, or leave authorized pickup updates and reminders.
          </p>

          {onOpenNotes && (
            <button
              type="button"
              onClick={onOpenNotes}
              className="neo-btn bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-neo-sm shrink-0 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Open Notes & Care Messages</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
