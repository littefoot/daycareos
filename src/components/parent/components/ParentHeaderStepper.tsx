import React from 'react';
import { ParentGuardian, Child } from '../../../types';
import {
  Baby,
  Mail,
  Check,
  Lock,
  User,
  Users,
  FileText,
  Home,
  FileCheck,
  Heart
} from 'lucide-react';

export interface ParentHeaderStepperProps {
  currentParent?: ParentGuardian;
  selectedParentId: string;
  onSelectParentId: (id: string) => void;
  parentsList: ParentGuardian[];
  parentChildren: Child[];
  activeChild?: Child;
  onSelectChildId: (id: string) => void;
  currentStep: number;
  onSelectStep: (stepNum: number) => void;
  childMaxStep: number;
  isMagicLink?: boolean;
}

export const JOURNEY_STEPS = [
  { num: 1, label: 'Inquiry & Call', icon: User, desc: 'Preliminary Screening' },
  { num: 2, label: 'Intake Forms', icon: FileText, desc: 'Child & Medical Data' },
  { num: 3, label: 'Meet Your Caregiver', icon: Home, desc: 'Placement Selection' },
  { num: 4, label: 'Documents & Fee', icon: FileCheck, desc: 'OHIP, Vaccines & e-Transfer' },
  { num: 5, label: 'Active Care Hub', icon: Heart, desc: 'Live Attendance & Updates' }
];

export const ParentHeaderStepper: React.FC<ParentHeaderStepperProps> = ({
  currentParent,
  selectedParentId,
  onSelectParentId,
  parentsList,
  parentChildren,
  activeChild,
  onSelectChildId,
  currentStep,
  onSelectStep,
  childMaxStep,
  isMagicLink = false
}) => {
  return (
    <div className="space-y-4 print:hidden no-print">
      {/* Top Banner with Family Context & Simulator */}
      <div className="bg-white rounded-2xl p-5 border-2 border-slate-900 shadow-neo flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs bg-emerald-100 text-emerald-900 font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
              Family & Parent Portal
            </span>
            <h1 className="text-xl font-extrabold text-slate-900">Welcome to Your Family Portal</h1>
            <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-300 flex items-center gap-1.5 shadow-sm">
              <Users className="w-3.5 h-3.5 text-orange-600" />
              <span>
                {currentParent?.secondaryGuardianName
                  ? `Household: ${currentParent.fullName} & ${currentParent.secondaryGuardianName}`
                  : currentParent?.fullName
                  ? `Household: ${currentParent.fullName}`
                  : 'Family Household Account'}
              </span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Ontario Licensed Home Child Care • Track your family's journey from intake to ongoing daily attendance.
          </p>
        </div>

        {/* Demo Account Switcher (Visible whenever multiple parents are available for staff/admin simulation) */}
        {parentsList.length > 1 && (
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-2xl border-2 border-slate-900 shadow-neo-sm text-xs">
            <Users className="w-4 h-4 text-orange-600 shrink-0" />
            <span className="font-extrabold text-slate-900 whitespace-nowrap">Simulate Parent:</span>
            <select
              value={selectedParentId}
              onChange={(e) => onSelectParentId(e.target.value)}
              className="bg-white border-2 border-slate-900 rounded-xl py-1 px-2.5 font-bold text-slate-900 focus:outline-none cursor-pointer"
            >
              {parentsList.map(p => (
                <option key={p.id} value={p.id}>
                  {p.fullName} ({p.formZeroApproved ? 'Approved / Enrolled' : 'Pre-Screening Pending'})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 🌟 1 2 3 4 5 HORIZONTAL GAMIFIED PROGRESS BAR WITH INTEGRATED CHILD SWITCHER */}
      <div className="bg-white rounded-3xl p-6 shadow-neo border-2 border-slate-900 space-y-4">
        {/* Header with Title, Progress Percentage & Child Switcher Bar */}
        <div className="space-y-3 pb-3 border-b-2 border-slate-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
                Admissions & Enrolment Journey
              </span>
              <h2 className="text-base font-extrabold text-slate-900 mt-1">
                Path to Licensed Care: <span className="text-orange-600">{activeChild?.fullName}</span>
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600 font-bold bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <span>Step {currentStep} of 5</span>
              <span className="text-emerald-700 bg-emerald-100 px-2 py-0.2 rounded-md font-extrabold">
                {Math.round((currentStep / 5) * 100)}% Completed
              </span>
            </div>
          </div>

          {/* DYNAMIC INTEGRATED CHILD SWITCHER CARDS (Visible on ALL steps) */}
          {parentChildren.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold text-slate-700 flex items-center gap-1.5">
                  <Baby className="w-3.5 h-3.5 text-orange-500" />
                  <span>Select Registered Child to View Their Specific Progress:</span>
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {parentChildren.length} Registered {parentChildren.length === 1 ? 'Child' : 'Children'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {parentChildren.map((c) => {
                  const isSelected = activeChild?.id === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => onSelectChildId(c.id)}
                      className={`p-3 rounded-2xl border-2 text-left transition-all flex items-center justify-between gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-orange-50/90 border-orange-500 shadow-neo-sm ring-2 ring-orange-500 scale-[1.01]'
                          : 'bg-slate-50 hover:bg-white border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-extrabold text-xs truncate ${isSelected ? 'text-orange-950' : 'text-slate-800'}`}>
                            {c.fullName}
                          </span>
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse flex-shrink-0" />
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                          DOB: {c.dob} • {c.ageYearsFormatted}
                        </span>
                      </div>

                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase border ${
                          c.admissionsStage === 'enrolled' ? 'bg-emerald-100 text-emerald-900 border-emerald-300' :
                          c.admissionsStage === 'contract' ? 'bg-orange-100 text-orange-900 border-orange-300' :
                          c.admissionsStage === 'matching' ? 'bg-purple-100 text-purple-900 border-purple-300' :
                          c.admissionsStage === 'docs_needed' ? 'bg-blue-100 text-blue-900 border-blue-300' :
                          'bg-amber-100 text-amber-900 border-amber-300'
                        }`}>
                          {c.admissionsStage === 'inquiry' ? '1. Inquiry Call' :
                           c.admissionsStage === 'docs_needed' ? '2. Digital Forms' :
                           c.admissionsStage === 'matching' ? '3. Home Match' :
                           c.admissionsStage === 'contract' ? '4. Contract' : '5. Active'}
                        </span>
                        {isSelected ? (
                          <span className="text-[9px] font-extrabold text-orange-600">Active Viewing</span>
                        ) : (
                          <span className="text-[9px] text-slate-400 hover:text-slate-600 font-medium">Click to switch</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* The 5 Step Indicators with Gating Locks strictly for this child */}
        <div className="grid grid-cols-5 gap-2 sm:gap-3 pt-1">
          {JOURNEY_STEPS.map((step) => {
            const isUnlocked = step.num <= (childMaxStep >= 3 ? 4 : childMaxStep);
            const isDone = step.num < childMaxStep;
            const isCurrent = currentStep === step.num;

            return (
              <button
                key={step.num}
                disabled={!isUnlocked}
                onClick={() => isUnlocked && onSelectStep(step.num)}
                className={`flex flex-col items-center text-center p-2.5 sm:p-3 rounded-2xl border-2 transition-all ${
                  isCurrent
                    ? 'bg-orange-500 text-white border-slate-900 shadow-neo-sm scale-[1.02] cursor-pointer'
                    : isDone
                    ? 'bg-emerald-50 text-emerald-950 border-emerald-400 hover:bg-emerald-100/70 cursor-pointer'
                    : !isUnlocked
                    ? 'bg-slate-100/80 text-slate-400 border-dashed border-slate-300 opacity-60 cursor-not-allowed'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-400 hover:bg-white cursor-pointer'
                }`}
                title={!isUnlocked ? `Locked for ${activeChild?.fullName}: Awaiting staff screening call approval` : step.label}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-xs mb-1.5 transition-all ${
                  isCurrent
                    ? 'bg-white text-orange-600 shadow-sm border border-orange-200'
                    : isDone
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : !isUnlocked
                    ? 'bg-slate-200 text-slate-500 border border-slate-300'
                    : 'bg-white text-slate-700 border border-slate-300'
                }`}>
                  {isDone ? <Check className="w-4 h-4" /> : !isUnlocked ? <Lock className="w-3.5 h-3.5 text-slate-500" /> : step.num}
                </div>

                <span className={`text-[11px] sm:text-xs font-bold leading-tight line-clamp-1 ${
                  isCurrent ? 'text-white font-extrabold' : isDone ? 'text-emerald-950' : !isUnlocked ? 'text-slate-400' : 'text-slate-700'
                }`}>
                  {step.label}
                </span>

                <span className={`hidden sm:block text-[9px] mt-0.5 line-clamp-1 font-medium ${
                  isCurrent ? 'text-orange-100' : isDone ? 'text-emerald-700' : !isUnlocked ? 'text-slate-400' : 'text-slate-400'
                }`}>
                  {!isUnlocked ? '🔒 Locked' : step.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
