import React, { useState, useEffect } from 'react';
import { Provider, Child } from '../../types';
import { ModalPortal } from '../common/ModalPortal';
import { 
  X, 
  Printer, 
  ShieldCheck, 
  FileText, 
  Building2, 
  Calendar, 
  User, 
  Lock, 
  Unlock, 
  Check, 
  Eye, 
  EyeOff,
  AlertCircle,
  DollarSign
} from 'lucide-react';
import { AGENCY_PHONE, AGENCY_PAYMENT_EMAIL } from '../../config/agencyConfig';

interface ProviderT4AModalProps {
  isOpen: boolean;
  onClose: () => void;
  providersList: Provider[];
  childrenList: Child[];
  initialProviderId?: string;
}

export const ProviderT4AModal: React.FC<ProviderT4AModalProps> = ({
  isOpen,
  onClose,
  providersList,
  childrenList,
  initialProviderId
}) => {
  const [selectedProviderId, setSelectedProviderId] = useState<string>(
    initialProviderId || providersList[0]?.id || ''
  );
  const [taxYear, setTaxYear] = useState<string>('2026');
  const [showSin, setShowSin] = useState<boolean>(false);
  const [t4aReleaseMap, setT4aReleaseMap] = useState<Record<string, { released: boolean; releasedAt?: string }>>({});
  const [justReleased, setJustReleased] = useState<boolean>(false);

  useEffect(() => {
    if (initialProviderId) {
      setSelectedProviderId(initialProviderId);
    }
  }, [initialProviderId]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('accs_t4a_release_status');
      if (stored) {
        setT4aReleaseMap(JSON.parse(stored));
      }
    } catch (e) {}
  }, []);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Clean up print classes on unmount
  useEffect(() => {
    return () => {
      document.body.classList.remove('has-active-print-modal');
    };
  }, []);

  if (!isOpen) return null;

  const currentProvider = providersList.find(p => p.id === selectedProviderId) || providersList[0];
  const assignedKids = childrenList.filter(c => c.providerId === currentProvider?.id && c.admissionsStage === 'enrolled' && !c.isArchived);

  // Remuneration Calculation: $35.00/day guaranteed statutory compensation
  // Assuming 240 operating days/year average per enrolled space
  const estimatedAnnualDays = assignedKids.length * 240;
  const grossRemuneration = estimatedAnnualDays * 35.00;

  const releaseKey = `${currentProvider?.id || 'none'}_${taxYear}`;
  const isReleased = !!t4aReleaseMap[releaseKey]?.released;
  const releasedAt = t4aReleaseMap[releaseKey]?.releasedAt;

  const handleToggleRelease = () => {
    const nextStatus = !isReleased;
    const nowStr = new Date().toLocaleString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const updated = {
      ...t4aReleaseMap,
      [releaseKey]: {
        released: nextStatus,
        releasedAt: nextStatus ? nowStr : undefined
      }
    };
    setT4aReleaseMap(updated);
    try {
      localStorage.setItem('accs_t4a_release_status', JSON.stringify(updated));
    } catch (e) {}

    if (nextStatus) {
      setJustReleased(true);
      setTimeout(() => setJustReleased(false), 3000);
    }
  };

  const handlePrint = () => {
    document.body.classList.add('has-active-print-modal');
    window.print();
    window.addEventListener(
      'afterprint',
      () => {
        document.body.classList.remove('has-active-print-modal');
      },
      { once: true }
    );
  };

  const maskedSin = '***-***-842';
  const fullSin = '542-819-842';

  return (
    <ModalPortal>
      <div 
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto cursor-pointer print:static print:bg-transparent print:p-0 print:overflow-visible print:inset-auto print:block print:z-auto print:m-0"
      >
        <div 
          onClick={(e) => e.stopPropagation()}
          className="bg-white border-2 border-slate-900 rounded-3xl shadow-neo-lg w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 cursor-default print:border-none print:shadow-none print:p-0 print:max-h-none print:w-full print:max-w-none print:rounded-none print:block print:overflow-visible print:static print:m-0"
        >
          {/* Header (Hidden on Print) */}
          <div className="p-4 sm:p-5 border-b-2 border-slate-900 bg-slate-50 flex items-center justify-between gap-3 shrink-0 print:hidden">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 border-2 border-slate-900 flex items-center justify-center shadow-neo-sm shrink-0">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                    CRA T4A Provider Tax Remuneration & Release Gate
                  </h3>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-300">
                    Official CRA Format
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Annual statement of self-employed home child care provider remuneration under Ontario CCEYA s. 8
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full border-2 border-slate-900 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors shadow-neo-sm shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Sub-Header Controls (Hidden on Print) */}
          <div className="p-4 bg-blue-50/60 border-b border-blue-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0 print:hidden">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-bold text-slate-700">Licensed Provider:</span>
                <select
                  value={selectedProviderId}
                  onChange={(e) => setSelectedProviderId(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg p-1.5 font-bold text-slate-900 shadow-sm"
                >
                  {providersList.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.neighborhood || p.region})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-bold text-slate-700">Tax Year:</span>
                <select
                  value={taxYear}
                  onChange={(e) => setTaxYear(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg p-1.5 font-bold text-slate-900 shadow-sm"
                >
                  <option value="2026">2026 (Current Tax Year)</option>
                  <option value="2025">2025</option>
                </select>
              </div>
            </div>

            {/* Gate Actions */}
            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={handleToggleRelease}
                className={`neo-btn px-3 py-1.5 text-xs font-black gap-1.5 transition-all cursor-pointer ${
                  isReleased 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                    : 'bg-amber-400 hover:bg-amber-500 text-slate-950'
                }`}
                title={isReleased ? "T4A released to provider. Click to withhold back to Draft." : "Authorize and release T4A slip to provider."}
              >
                {isReleased ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                <span>{isReleased ? 'Released to Provider ✓' : 'Authorize & Release T4A'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="neo-btn bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 text-xs font-black gap-1.5 cursor-pointer shadow-neo-sm"
                title="Print CRA-compliant T4A Slip on standard 8.5x11 paper"
              >
                <Printer className="w-3.5 h-3.5 text-orange-400" />
                <span>Print T4A Slip (PDF)</span>
              </button>
            </div>
          </div>

          {/* Gating Status Alert Banner (Hidden on Print) */}
          <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs shrink-0 print:hidden">
            <div className="flex items-center gap-2">
              <ShieldCheck className={`w-4 h-4 ${isReleased ? 'text-emerald-600' : 'text-amber-600'}`} />
              <span className="font-semibold text-slate-700">
                {isReleased ? (
                  <>
                    <strong className="text-emerald-900">Official CRA T4A Slip Released:</strong> Distributed to {currentProvider.name} on {releasedAt || 'October 2, 2026'}.
                  </>
                ) : (
                  <>
                    <strong className="text-amber-900">Admin Gate Active:</strong> Held in Draft. Official CRA distribution deadline is the last working day of February.
                  </>
                )}
              </span>
            </div>
            {justReleased && (
              <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 animate-pulse">
                <Check className="w-3.5 h-3.5" /> Release Status Updated!
              </span>
            )}
          </div>

          {/* Printable CRA T4A Slip Body */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100/70 space-y-6 print:p-0 print:m-0 print:bg-white print:overflow-visible print:max-h-none print:block">
            <div 
              id="printable-provider-t4a" 
              className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-slate-900 shadow-neo mx-auto max-w-3xl text-slate-900 space-y-4 print:max-w-none print:w-full print:p-0 print:m-0 print:border-none print:shadow-none print:rounded-none print:space-y-3 print:text-black"
            >
              {/* CRA Official Form Header */}
              <div className="flex items-start justify-between border-b-2 border-black pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black px-2 py-0.5 border border-black bg-white text-black font-mono">
                      CRA / ARC
                    </span>
                    <span className="font-mono text-xs font-bold text-neutral-800">
                      Form T4A (26)
                    </span>
                  </div>
                  <h1 className="text-base sm:text-lg font-black tracking-tight text-black mt-1 uppercase">
                    Statement of Other Income & Remuneration
                  </h1>
                  <p className="text-[11px] text-neutral-700">
                    Canada Revenue Agency • Self-Employed Licensed Child Care Provider Remuneration
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-black font-mono">{taxYear}</span>
                  <p className="text-[10px] text-neutral-600 uppercase font-bold">Taxation Year</p>
                </div>
              </div>

              {/* Payer and Recipient Information Boxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Payer Box */}
                <div className="p-3 bg-white rounded-xl border border-black space-y-1 print:rounded-none t4a-box">
                  <span className="text-[9px] font-bold uppercase text-neutral-600 block">
                    Payer's Name and Address / Nom et adresse du payeur
                  </span>
                  <p className="font-black text-black">ALL CHILD CARE SOLUTIONS INC.</p>
                  <p className="text-neutral-800 text-[11px]">Ontario Licensed Home Child Care Agency</p>
                  <p className="text-neutral-700 text-[11px]">{AGENCY_PHONE} • {AGENCY_PAYMENT_EMAIL}</p>
                  <div className="pt-1 mt-1 border-t border-black/30">
                    <span className="text-[9px] font-bold uppercase text-neutral-600 block">
                      Payer's Account Number / Numéro de compte (CRA BN)
                    </span>
                    <p className="font-mono font-bold text-black text-[11px]">84729 1102 RC0001</p>
                  </div>
                </div>

                {/* Recipient Box */}
                <div className="p-3 bg-white rounded-xl border border-black space-y-1 print:rounded-none t4a-box">
                  <span className="text-[9px] font-bold uppercase text-neutral-600 block">
                    Recipient's Name and Address / Nom et adresse du bénéficiaire
                  </span>
                  <p className="font-black text-black text-sm">{currentProvider.name}</p>
                  <p className="text-neutral-800 text-[11px]">{currentProvider.homeAddress || 'Residential Premises Address'}</p>
                  <p className="text-neutral-800 text-[11px]">{currentProvider.neighborhood}, Ontario</p>
                  <div className="pt-1 mt-1 border-t border-black/30 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-bold uppercase text-neutral-600 block">
                        Box 014: Recipient's SIN / NAS du bénéficiaire
                      </span>
                      <p className="font-mono font-bold text-black text-[11px]">
                        {showSin ? fullSin : maskedSin}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowSin(!showSin)}
                      className="text-slate-500 hover:text-slate-800 p-1 print:hidden"
                      title={showSin ? "Mask SIN" : "Reveal SIN"}
                    >
                      {showSin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Official CRA Box Layout */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                {/* Box 028: Other Income / Child Care Remuneration */}
                <div className="p-3 bg-white rounded-xl border-2 border-black col-span-2 print:rounded-none t4a-box">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase text-black">
                      Box 028: Other Income (Child Care Remuneration)
                    </span>
                    <span className="font-mono text-[9px] font-bold text-black border border-black px-1.5 py-0.5 rounded">
                      Box 028
                    </span>
                  </div>
                  <p className="text-xl font-black font-mono text-black mt-1">
                    ${grossRemuneration.toFixed(2)} CAD
                  </p>
                  <p className="text-[10px] text-neutral-700 mt-0.5">
                    Statutory guaranteed compensation: $35.00/day across {estimatedAnnualDays} active care days.
                  </p>
                </div>

                {/* Box 048: Fees for Services */}
                <div className="p-3 bg-white rounded-xl border border-black print:rounded-none t4a-box">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase text-neutral-600">Fees for Services</span>
                    <span className="font-mono text-[9px] font-bold text-black border border-black px-1 rounded">048</span>
                  </div>
                  <p className="text-base font-extrabold font-mono text-black mt-1">$0.00</p>
                  <p className="text-[9px] text-neutral-500 mt-0.5">Reported in Box 028</p>
                </div>

                {/* Box 022: Income Tax Deducted */}
                <div className="p-3 bg-white rounded-xl border border-black print:rounded-none t4a-box">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase text-neutral-600">Tax Deducted</span>
                    <span className="font-mono text-[9px] font-bold text-black border border-black px-1 rounded">022</span>
                  </div>
                  <p className="text-base font-extrabold font-mono text-black mt-1">$0.00</p>
                  <p className="text-[9px] text-neutral-500 mt-0.5">Self-Employed (T1)</p>
                </div>
              </div>

              {/* Active Enrolment Breakdown */}
              <div className="p-3 bg-white rounded-xl border border-black text-xs space-y-1.5 print:rounded-none t4a-box">
                <span className="text-[10px] font-black uppercase text-black block">
                  Enrolled Placement & Grant Reconciliation Summary ({assignedKids.length} Children)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  {assignedKids.map(k => (
                    <div key={k.id} className="p-1.5 bg-white rounded border border-black/40 font-medium">
                      <p className="font-bold text-black">{k.fullName}</p>
                      <p className="text-neutral-600 text-[10px]">{k.fundingType.toUpperCase()} • $35.00/day</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* CRA Filing & Certification Footer */}
              <div className="p-3 bg-white rounded-xl border border-black text-[10px] text-neutral-800 space-y-1 print:rounded-none t4a-box">
                <p className="font-bold text-black">
                  Information for Recipient (Licensed Child Care Provider):
                </p>
                <p className="leading-relaxed">
                  As an independent licensed home child care provider affiliated with DaycareOS Inc., report the amount in Box 028 as gross business/self-employed income on Line 13500 (or Form T2125 Statement of Business or Professional Activities) of your personal T1 Income Tax Return. Retain this slip with your official tax records.
                </p>
              </div>

              <div className="border-t border-black pt-3 flex items-center justify-between text-[10px] text-neutral-700 font-medium">
                <div>
                  <p className="font-bold text-black">Certified by the Agency Director</p>
                  <p>DaycareOS Inc. • Executive Office</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-black">Copy 2: For Recipient's Records</p>
                  <p className="font-mono">Filing Deadline: February 28, {parseInt(taxYear) + 1}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Bar (Hidden on Print) */}
          <div className="p-4 border-t-2 border-slate-900 bg-slate-50 flex items-center justify-between text-xs shrink-0 print:hidden">
            <span className="text-slate-500 text-[11px]">
              Canada Revenue Agency (CRA) Statutory Remuneration Reporting
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 font-bold text-slate-700 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};
