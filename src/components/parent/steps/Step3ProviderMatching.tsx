import React from 'react';
import { Child, Provider, ParentGuardian, DocumentRecord } from '../../../types';
import {
  ShieldCheck,
  Clock,
  MapPin,
  Phone,
  Home,
  ArrowLeft,
  ArrowRight,
  Lock
} from 'lucide-react';
import { Avatar } from '../../common/Avatar';
import { ParentDirectorContactCard } from '../components/ParentDirectorContactCard';
import { ParentDocumentUploadSection } from '../components/ParentDocumentUploadSection';

export interface Step3ProviderMatchingProps {
  currentParent?: ParentGuardian;
  activeChild?: Child;
  matchedProvider: Provider | null;
  providersList: Provider[];
  childDocs?: DocumentRecord[];
  docUploadState?: Record<string, {
    progress: number;
    fileName: string;
    fileSize: string;
    stageText: string;
    isComplete: boolean;
  }>;
  handleDocumentUpload?: (docId: string, file: File) => void;
  handleUseSampleDoc?: (docId: string, docType: string) => void;
  setPreviewDocModal?: (modal: { title: string; url: string } | null) => void;
  onResetDocs?: () => void;
  onBackToStep2: () => void;
  onAdvanceToStep4: () => void;
}

export const Step3ProviderMatching: React.FC<Step3ProviderMatchingProps> = ({
  currentParent,
  activeChild,
  matchedProvider,
  providersList,
  childDocs,
  docUploadState,
  handleDocumentUpload,
  handleUseSampleDoc,
  setPreviewDocModal,
  onResetDocs,
  onBackToStep2,
  onAdvanceToStep4
}) => {
  // Filter licensed providers in parent's region/municipality (fallback to all providers)
  const parentRegion = (currentParent?.region || currentParent?.city || '').toLowerCase();
  const localProviders = providersList.filter(p =>
    p.region.toLowerCase().includes(parentRegion) ||
    p.neighborhood.toLowerCase().includes(parentRegion) ||
    p.homeAddress.toLowerCase().includes(parentRegion) ||
    parentRegion.includes(p.region.toLowerCase()) ||
    parentRegion.includes(p.neighborhood.toLowerCase())
  );
  const displayProviders = localProviders.length > 0 ? localProviders : providersList;

  return (
    <div className="bg-white rounded-3xl border-2 border-slate-900 shadow-neo p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b-2 border-slate-100">
        <div>
          <span className="text-xs font-mono font-bold bg-purple-100 text-purple-900 px-2.5 py-1 rounded-md border border-purple-300">
            Step 3 of 5: Meet Your Caregiver
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 mt-2">
            {matchedProvider ? 'Your Matched Home Child Care Provider' : 'Licensed Caregiver Matching & Placement'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {matchedProvider
              ? `Based on your household preferences in ${currentParent?.region || currentParent?.city || 'Durham Region'}, our placement team has officially matched ${activeChild?.fullName} with an Ontario licensed home provider.`
              : `Your digital intake forms are recorded. Our placement team is reviewing mixed-age ratios to match your family with a licensed caregiver in ${currentParent?.region || currentParent?.city || 'your community'}.`
            }
          </p>
        </div>

        {matchedProvider ? (
          <span className="text-xs font-extrabold bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-300 flex items-center gap-1.5 shadow-neo-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Officially Matched</span>
          </span>
        ) : (
          <span className="text-xs font-extrabold bg-amber-100 text-amber-900 px-3 py-1.5 rounded-xl border border-amber-300 flex items-center gap-1.5 shadow-neo-sm">
            <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
            <span>Admin Placement in Progress</span>
          </span>
        )}
      </div>

      {/* If Admin Has Formally Assigned a Provider */}
      {matchedProvider ? (
        <div className="p-6 bg-slate-50 rounded-2xl border-2 border-slate-900 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2 space-y-3 text-xs">
            <div className="flex items-center gap-3">
              <Avatar
                name={matchedProvider.name}
                photoUrl={matchedProvider.photoUrl}
                shape="rounded"
                size="lg"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-slate-900">{matchedProvider.name}</h3>
                  <span className="text-[10px] font-bold bg-orange-100 text-orange-800 px-2 py-0.5 rounded">
                    {matchedProvider.region}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Licensed Home Provider • CCEYA Regulated</p>
              </div>
            </div>

            <p className="text-slate-600 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{matchedProvider.homeAddress}</span>
            </p>

            <p className="text-slate-600 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-slate-400" />
              <span>{matchedProvider.phone}</span>
            </p>

            <div className="pt-2 flex flex-wrap gap-2 text-[11px]">
              <span className="bg-white border border-slate-300 px-2.5 py-1 rounded-lg font-bold">
                👶 Capacity: {matchedProvider.enrolledChildIds.length} / {matchedProvider.maxCapacity} Kids
              </span>
              <span className="bg-white border border-slate-300 px-2.5 py-1 rounded-lg font-bold">
                ⏰ Hours: {matchedProvider.operatingHours}
              </span>
              <span className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-2.5 py-1 rounded-lg font-bold">
                ✓ Annual Safety Inspection Passed
              </span>
            </div>
          </div>

          <div className="p-4 bg-white rounded-xl border-2 border-slate-900 shadow-neo-sm space-y-2 text-center">
            <span className="text-[11px] font-bold text-slate-500 block">Ministry Operating License</span>
            <span className="text-xs font-mono font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 block">
              CCEYA-PROV-{matchedProvider.id.toUpperCase()}
            </span>
            <p className="text-[10px] text-slate-500 font-medium">
              Licensed Capacity: {matchedProvider.maxCapacity} children
            </p>
          </div>
        </div>
      ) : (
        /* If No Provider Assigned Yet */
        <div className="space-y-4">
          <div className="p-5 bg-amber-50/60 rounded-2xl border-2 border-amber-300 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-amber-950 text-sm">Matching & Placement Review in Progress</h4>
              <p className="text-xs text-amber-900/90 leading-relaxed">
                Thank you for completing your digital intake forms! The Agency Placement Director has received {activeChild?.fullName}'s file in the Admissions Pipeline and is evaluating home capacity to assign your dedicated licensed provider. You will be notified once placement is confirmed.
              </p>
              <div className="pt-2">
                <ParentDirectorContactCard />
              </div>
            </div>
          </div>

          {/* Area Providers Showcase */}
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  <span>Licensed Home Providers in Your Region ({currentParent?.region || currentParent?.city || 'Durham Region'})</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Active licensed homes in your area. Final assignment is managed by the agency to guarantee CCEYA ratio compliance.
                </p>
              </div>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                {displayProviders.length} Active Homes
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {displayProviders.map(p => {
                const vacancies = Math.max(0, p.maxCapacity - p.enrolledChildIds.length);
                return (
                  <div key={p.id} className="p-4 bg-slate-50 border-2 border-slate-900 rounded-2xl shadow-neo-sm space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={p.name}
                          photoUrl={p.photoUrl}
                          shape="rounded"
                          size="md"
                        />
                        <div>
                          <h5 className="font-extrabold text-slate-900 text-xs">{p.name}</h5>
                          <p className="text-[11px] text-slate-500">{p.neighborhood} • {p.region}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                        vacancies > 0 ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-200 text-slate-600 border-slate-300'
                      }`}>
                        {vacancies > 0 ? `${vacancies} Spots Available` : 'At Full Ratio'}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 space-y-1 pt-2 border-t border-slate-200">
                      <p className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{p.operatingHours}</span>
                      </p>
                      <p className="flex items-center gap-1.5 text-slate-500">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>CCEYA Annual Safety Passed • CWELCC $22/Day</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 📁 Mandatory Document Upload & Verification Section */}
      {activeChild && childDocs && handleDocumentUpload && handleUseSampleDoc && setPreviewDocModal && (
        <ParentDocumentUploadSection
          activeChild={activeChild}
          childDocs={childDocs}
          docUploadState={docUploadState || {}}
          handleDocumentUpload={handleDocumentUpload}
          handleUseSampleDoc={handleUseSampleDoc}
          setPreviewDocModal={setPreviewDocModal}
          onResetDocs={onResetDocs}
          subheading={`While the Agency Director is evaluating provider home capacity and CCEYA mixed-age ratios, you can upload ${activeChild?.fullName || 'your child'}'s mandatory Ontario licensing documents below:`}
        />
      )}

      <div className="flex justify-between pt-4 border-t-2 border-slate-100">
        <button
          onClick={onBackToStep2}
          className="neo-btn bg-white hover:bg-slate-100 text-slate-800 px-4 py-2 text-xs font-bold gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Intake Forms</span>
        </button>

        {matchedProvider ? (
          <button
            onClick={onAdvanceToStep4}
            className="neo-btn bg-orange-500 hover:bg-orange-400 text-white px-6 py-2 text-xs font-bold gap-1.5 shadow-neo-sm cursor-pointer"
          >
            <span>Continue to Step 4: Document Verification</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            disabled
            className="bg-slate-100 text-slate-400 border-2 border-slate-200 px-5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-not-allowed"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Awaiting Provider Placement by Admin</span>
          </button>
        )}
      </div>
    </div>
  );
};
