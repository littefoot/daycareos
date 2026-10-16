import React from 'react';
import { ParentGuardian, Child } from '../../../types';
import { CheckCircle2, Clock, Sparkles, ArrowRight, Lock, Baby } from 'lucide-react';
import { ParentDirectorContactCard } from '../components/ParentDirectorContactCard';

export interface Step1InquiryCallProps {
  currentParent?: ParentGuardian;
  activeChild?: Child;
  parentChildren: Child[];
  onSelectChildId: (id: string) => void;
  isChildScreeningApproved: boolean;
  onAdvanceToStep2: () => void;
}

export const Step1InquiryCall: React.FC<Step1InquiryCallProps> = ({
  currentParent,
  activeChild,
  parentChildren,
  onSelectChildId,
  isChildScreeningApproved,
  onAdvanceToStep2
}) => {
  return (
    <div className="bg-white rounded-3xl border-2 border-slate-900 shadow-neo p-6 sm:p-8 space-y-6">
      <div className="flex items-start justify-between gap-4 pb-4 border-b-2 border-slate-100">
        <div>
          <span className="text-xs font-mono font-bold bg-amber-100 text-amber-900 px-2.5 py-1 rounded-md border border-amber-300">
            Step 1 of 5: Initial Inquiry & Pre-Screening
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 mt-2">
            Screening Call Status: <span className="text-orange-600">{activeChild?.fullName}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Under Ontario CCEYA licensing standards, an Agency Representative conducts an initial intake call with every family to assess schedule, care region, and funding eligibility before unlocking the complete enrolment package.
          </p>
        </div>

        {isChildScreeningApproved ? (
          <span className="flex items-center gap-1 text-xs font-extrabold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Screening Completed for {activeChild?.fullName}</span>
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs font-extrabold text-amber-800 bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-300">
            <Clock className="w-4 h-4 text-amber-600 animate-spin" />
            <span>Call Pending</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <h3 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">Submitted Inquiry & Children Summary</h3>
          <div className="space-y-1.5 text-slate-700">
            <p><strong>Parent / Guardian:</strong> {currentParent?.fullName}</p>
            <p><strong>Primary Phone:</strong> {currentParent?.phone}</p>
            <p><strong>Email Address:</strong> {currentParent?.email}</p>
            <p><strong>Municipality / Region:</strong> {currentParent?.region || 'Durham Region'}</p>
            <p><strong>Preferred Schedule:</strong> Full-time (CWELCC $22/Day)</p>
          </div>

          <div className="pt-2 border-t border-slate-200 text-slate-500 text-[11px] flex items-center gap-1.5 font-medium">
            <Baby className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
            <span>Viewing active child: <strong className="text-slate-900">{activeChild?.fullName}</strong>. Switch siblings anytime in the journey card above.</span>
          </div>
        </div>

        <div className="p-5 bg-orange-50 rounded-2xl border-2 border-orange-200 space-y-3">
          <h3 className="font-extrabold text-orange-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-orange-600" />
            <span>What Happens Next?</span>
          </h3>
          <ul className="space-y-2 text-orange-800 list-disc list-inside leading-relaxed">
            <li>An Agency Representative reviews home provider availability in your neighbourhood.</li>
            <li>You'll receive a brief 10-minute discovery call to confirm your start date.</li>
            <li>Upon approval for each child, Step 2 unlocks their digital registration forms.</li>
          </ul>
        </div>
      </div>

      <div className="pt-4 border-t-2 border-slate-100">
        {isChildScreeningApproved ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full">
            <span className="text-emerald-700 font-extrabold text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Screening Approved for {activeChild?.fullName} — Digital Forms Unlocked!</span>
            </span>
            <button
              onClick={onAdvanceToStep2}
              className="neo-btn bg-orange-500 hover:bg-orange-400 text-white px-6 py-2.5 text-xs font-bold gap-2 shadow-neo-sm cursor-pointer"
            >
              <span>Continue to Step 2: Digital Intake Forms</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full p-4 bg-amber-50 rounded-2xl border-2 border-amber-300">
              <div className="flex items-center gap-2 text-amber-950 font-bold text-xs">
                <Lock className="w-4 h-4 text-amber-700 flex-shrink-0" />
                <span>Step 2 is Locked: An Agency Representative is reviewing provider availability for {activeChild?.fullName}.</span>
              </div>
              <button
                type="button"
                disabled
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 text-slate-500 border border-slate-300 cursor-not-allowed flex items-center gap-1.5 opacity-80 shrink-0"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Awaiting Discovery Call Approval</span>
              </button>
            </div>

            <ParentDirectorContactCard
              promptText="Have questions or need to update your schedule before the screening call?"
              variant="amber"
            />
          </div>
        )}
      </div>
    </div>
  );
};
