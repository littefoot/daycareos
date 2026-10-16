import React, { useState, useEffect } from 'react';
import { Child, ParentGuardian, Provider } from '../../types';
import { ModalPortal } from '../common/ModalPortal';
import { calculateMonthlyFee, loadAgencySettings } from '../../data/agencySettingsData';
import { 
  X, 
  Printer, 
  Send, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  DollarSign, 
  Building2, 
  Calendar, 
  User, 
  CreditCard,
  Lock,
  Unlock,
  Check
} from 'lucide-react';
import { AGENCY_PHONE, AGENCY_PAYMENT_EMAIL } from '../../config/agencyConfig';

interface InvoiceDistributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  childrenList: Child[];
  parentsList: ParentGuardian[];
  providersList: Provider[];
  initialChildId?: string;
  onMarkPaid?: (childId: string) => void;
}

export const InvoiceDistributionModal: React.FC<InvoiceDistributionModalProps> = ({
  isOpen,
  onClose,
  childrenList,
  parentsList,
  providersList,
  initialChildId,
  onMarkPaid
}) => {
  const [selectedChildId, setSelectedChildId] = useState<string>(
    initialChildId || childrenList[0]?.id || ''
  );
  const [billingPeriod, setBillingPeriod] = useState<string>('October 2026');
  const [brandingMode, setBrandingMode] = useState<'unbranded' | 'branded'>('unbranded');
  const [releaseStatusMap, setReleaseStatusMap] = useState<Record<string, { released: boolean; releasedAt?: string }>>({});
  const [justReleased, setJustReleased] = useState(false);

  useEffect(() => {
    if (initialChildId) {
      setSelectedChildId(initialChildId);
    }
  }, [initialChildId]);

  // Load released statuses from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('accs_invoice_release_status');
      if (stored) {
        setReleaseStatusMap(JSON.parse(stored));
      }
    } catch (e) {}
  }, []);

  // Ensure body print class cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.classList.remove('has-active-print-modal');
    };
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

  if (!isOpen) return null;

  const enrolledChildren = childrenList.filter(c => c.admissionsStage === 'enrolled' && !c.isArchived);
  const currentChild = enrolledChildren.find(c => c.id === selectedChildId) || enrolledChildren[0];
  const parent = parentsList.find(p => p.id === currentChild?.parentId);
  const provider = providersList.find(p => p.id === currentChild?.providerId);
  const agencySettings = loadAgencySettings();

  const invoiceKey = `${currentChild?.id || 'none'}_${billingPeriod}`;
  const isReleased = !!releaseStatusMap[invoiceKey]?.released;
  const releasedAt = releaseStatusMap[invoiceKey]?.releasedAt;

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
      ...releaseStatusMap,
      [invoiceKey]: {
        released: nextStatus,
        releasedAt: nextStatus ? nowStr : undefined
      }
    };
    setReleaseStatusMap(updated);
    try {
      localStorage.setItem('accs_invoice_release_status', JSON.stringify(updated));
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

  const monthlyFee = currentChild?.monthlyFee ?? calculateMonthlyFee(currentChild?.fundingType || 'cwelcc');
  const invoiceNumber = `ACCS-INV-2026-${(selectedChildId || '101').replace('child-', '').padStart(3, '0')}`;

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
              <div className="w-10 h-10 rounded-2xl bg-orange-500 border-2 border-slate-900 flex items-center justify-center shadow-neo-sm shrink-0">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                    Admin Invoicing & Statement Distribution Gate
                  </h3>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                    Admin-Only Gate
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Review and release official monthly parent fee invoices without unauthorized automated broadcasts
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

          {/* Sub-Header: Controls & Gating Status Bar (Hidden on Print) */}
          <div className="p-4 bg-orange-50/60 border-b border-orange-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0 print:hidden">
            {/* Child, Period & Branding Style Selector */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-bold text-slate-700">Child:</span>
                <select
                  value={selectedChildId}
                  onChange={(e) => setSelectedChildId(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg p-1.5 font-bold text-slate-900 shadow-sm"
                >
                  {enrolledChildren.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} ({c.fundingType.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-bold text-slate-700">Period:</span>
                <select
                  value={billingPeriod}
                  onChange={(e) => setBillingPeriod(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg p-1.5 font-bold text-slate-900 shadow-sm"
                >
                  <option value="October 2026">October 2026</option>
                  <option value="November 2026">November 2026</option>
                  <option value="December 2026">December 2026</option>
                  <option value="Annual 2026 Statement">Annual 2026 Tax Statement</option>
                </select>
              </div>

              {/* Branding Toggle */}
              <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg p-0.5 shadow-sm">
                <button
                  type="button"
                  onClick={() => setBrandingMode('unbranded')}
                  className={`px-2 py-1 rounded-md font-bold transition-all cursor-pointer ${
                    brandingMode === 'unbranded'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Clean, unbranded invoice with zero logo or marketing colors"
                >
                  Clean / Unbranded (B&W)
                </button>
                <button
                  type="button"
                  onClick={() => setBrandingMode('branded')}
                  className={`px-2 py-1 rounded-md font-bold transition-all cursor-pointer ${
                    brandingMode === 'branded'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Show agency corporate name and header details"
                >
                  Agency Branded
                </button>
              </div>
            </div>

            {/* Gating Actions */}
            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={handleToggleRelease}
                className={`neo-btn px-3 py-1.5 text-xs font-black gap-1.5 transition-all cursor-pointer ${
                  isReleased 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                    : 'bg-amber-400 hover:bg-amber-500 text-slate-950'
                }`}
                title={isReleased ? "Invoice released to family. Click to withhold back to Draft." : "Click to authorize and release invoice to family."}
              >
                {isReleased ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                <span>{isReleased ? 'Released to Family ✓' : 'Authorize & Release Invoice'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="neo-btn bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 text-xs font-black gap-1.5 cursor-pointer shadow-neo-sm"
                title="Print clean official fee invoice on standard 8.5x11 paper"
              >
                <Printer className="w-3.5 h-3.5 text-orange-400" />
                <span>Print Invoice (PDF)</span>
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
                    <strong className="text-emerald-900">Released by Agency Director:</strong> Accessible to family on Family Portal (Authorized on {releasedAt || 'October 2, 2026'}).
                  </>
                ) : (
                  <>
                    <strong className="text-amber-900">Gate Active:</strong> Held in administrative draft. Invoices will NEVER automatically broadcast without explicit Director authorization.
                  </>
                )}
              </span>
            </div>
            {justReleased && (
              <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 animate-pulse">
                <Check className="w-3.5 h-3.5" /> Status Updated!
              </span>
            )}
          </div>

          {/* Printable Invoice Body */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100/70 space-y-6 print:p-0 print:m-0 print:bg-white print:overflow-visible print:max-h-none print:block">
            <div 
              id="printable-parent-invoice" 
              className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-slate-900 shadow-neo mx-auto max-w-3xl text-slate-900 space-y-5 print:max-w-none print:w-full print:p-0 print:m-0 print:border-none print:shadow-none print:rounded-none print:space-y-3.5 print:text-black"
            >
              {/* Header Block */}
              <div className="flex items-start justify-between border-b-2 border-black pb-3.5">
                <div>
                  {brandingMode === 'unbranded' ? (
                    <>
                      <h1 className="text-xl sm:text-2xl font-black tracking-tight text-black uppercase">
                        Child Care Services Invoice
                      </h1>
                      <p className="text-xs font-bold text-neutral-800 mt-0.5">
                        Official Statement of Child Care Services & Parent Fee Assessment
                      </p>
                      <p className="text-[11px] text-neutral-600 mt-1">
                        Ontario Licensed Home Child Care • Child Care and Early Years Act (CCEYA 2014, O. Reg. 137/15)
                      </p>
                    </>
                  ) : (
                    <>
                      <h1 className="text-lg sm:text-xl font-black tracking-tight text-black uppercase">
                        All Child Care Solutions Inc.
                      </h1>
                      <p className="text-xs font-semibold text-neutral-800">
                        Ontario Licensed Home Child Care Agency • CCEYA Ministry Reg. 137/15
                      </p>
                      <p className="text-[11px] text-neutral-600 mt-1">
                        Phone: {AGENCY_PHONE} (voice only) • Email: {AGENCY_PAYMENT_EMAIL}
                      </p>
                    </>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="border border-black px-3 py-1.5 inline-block text-right bg-white">
                    <span className="text-[10px] font-black uppercase tracking-wider block font-mono text-black">
                      Official Fee Invoice
                    </span>
                    <p className="text-xs font-mono font-black text-black mt-0.5">
                      {invoiceNumber}
                    </p>
                  </div>
                  <p className="text-[11px] text-neutral-700 font-semibold mt-1">
                    Date: {new Date().toLocaleDateString('en-CA')}
                  </p>
                </div>
              </div>

              {/* Bill To & Placement Details */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-black space-y-1 print:rounded-none invoice-box">
                  <p className="font-black uppercase text-[10px] text-neutral-600">Bill To (Primary Guardian)</p>
                  <p className="font-black text-black text-sm">{parent?.fullName || 'Parent Guardian'}</p>
                  <p className="text-neutral-800">{parent?.homeAddress || 'Residential Address on File'}</p>
                  <p className="text-neutral-800">{parent?.city || 'Ontario'}, {parent?.region || 'Durham Region'}</p>
                  <p className="text-neutral-700 font-mono text-[11px]">{parent?.email || 'parent@accs.ca'}</p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-black space-y-1 print:rounded-none invoice-box">
                  <p className="font-black uppercase text-[10px] text-neutral-600">Enrolment & Placement</p>
                  <p className="font-black text-black text-sm">{currentChild?.fullName || 'Child Name'}</p>
                  <p className="text-neutral-800">
                    Assigned Provider: <strong className="font-bold text-black">{provider?.name || 'Licensed Provider'}</strong>
                  </p>
                  <p className="text-neutral-800">Home Premises: {provider?.neighborhood || 'Oshawa / Durham Region'}</p>
                  <p className="text-neutral-800">Billing Cycle: <strong className="font-bold text-black">{billingPeriod}</strong></p>
                </div>
              </div>

              {/* Line Items Table */}
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-t-2 border-b-2 border-black text-left bg-white text-black">
                    <th className="py-2.5 px-3 font-black uppercase text-[10px]">Description & Funding Category</th>
                    <th className="py-2.5 px-3 font-black uppercase text-[10px] text-center">Statutory Rate</th>
                    <th className="py-2.5 px-3 font-black uppercase text-[10px] text-center">Days / Wk</th>
                    <th className="py-2.5 px-3 font-black uppercase text-[10px] text-right">Total Net Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/20">
                  <tr>
                    <td className="py-2.5 px-3">
                      <p className="font-bold text-black">
                        Licensed Home Child Care Services ({currentChild?.fullName})
                      </p>
                      <p className="text-[11px] text-neutral-600">
                        {currentChild?.fundingType === 'cwelcc' && 'Canada-Wide Early Learning and Child Care (CWELCC) Program'}
                        {currentChild?.fundingType === 'subsidy' && `Regional Fee Subsidy Program (${currentChild.subsidyRegion || 'Municipal'})`}
                        {currentChild?.fundingType === 'private' && 'Full Unsubsidized Private Care Rate'}
                        {currentChild?.fundingType === 'cwelcc_target' && 'CWELCC Target Rate ($10/day upcoming phase)'}
                      </p>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-semibold text-black">
                      {currentChild?.fundingType === 'cwelcc' && `$${agencySettings.parentCwelccDailyRate.toFixed(2)}/day`}
                      {currentChild?.fundingType === 'subsidy' && (
                        currentChild.parentContributionDailyRate && currentChild.parentContributionDailyRate > 0
                          ? `$${currentChild.parentContributionDailyRate.toFixed(2)}/day (Municipal Co-pay)`
                          : '$0.00/day (Municipal 100% Subsidy)'
                      )}
                      {currentChild?.fundingType === 'private' && `$${agencySettings.parentPrivateDailyRate.toFixed(2)}/day`}
                      {currentChild?.fundingType === 'cwelcc_target' && '$10.00/day'}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-black">
                      {currentChild?.fundingType === 'subsidy' && currentChild?.anticipatedMonthlyDays
                        ? `${currentChild.anticipatedMonthlyDays} Days/Mo`
                        : '5 Days/Wk'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-black text-black">
                      ${monthlyFee.toFixed(2)} CAD
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Subtotal & Total Block */}
              <div className="flex justify-end pt-1">
                <div className="w-72 space-y-1.5 text-xs">
                  <div className="flex justify-between text-neutral-700">
                    <span>Standard Care Subtotal:</span>
                    <span className="font-mono font-semibold">${monthlyFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-700">
                    <span>Provincial CWELCC Grant Top-Up:</span>
                    <span className="font-mono font-semibold">
                      {currentChild?.fundingType === 'cwelcc' ? `-$${(13.00 * 5 * 4.35).toFixed(2)} (Provincial)` : '$0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between font-black text-sm text-black pt-2 pb-1 border-t-2 border-b-2 border-black">
                    <span>Parent Portion Due:</span>
                    <span className="font-mono">${monthlyFee.toFixed(2)} CAD</span>
                  </div>
                </div>
              </div>

              {/* Remittance & Interac Instructions */}
              <div className="p-3.5 bg-white rounded-xl border border-black text-xs space-y-2 print:rounded-none invoice-box">
                <p className="font-black text-black uppercase tracking-wide text-[10px]">
                  Payment Rail: Interac e-Transfer Instructions
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-black">
                  <div>
                    <p className="text-[11px] text-neutral-600">Recipient Email:</p>
                    <p className="font-mono font-bold text-black text-sm">allchildcaresolutions@gmail.com</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-neutral-600">Memo / Reference Note:</p>
                    <p className="font-mono text-black font-bold">{currentChild?.fullName} - {billingPeriod}</p>
                  </div>
                </div>
                <p className="text-[10px] text-neutral-600 italic">
                  * Automatic deposit enabled. Paper cheques, cash, Pre-Authorized Debit (PAD), and credit cards are not accepted.
                </p>
              </div>

              {/* Regulatory Agency Attestation Footer */}
              <div className="border-t border-black pt-3 flex items-center justify-between text-[10px] text-neutral-700 font-medium">
                <div>
                  {brandingMode === 'unbranded' ? (
                    <>
                      <p className="font-bold text-black">Certified Statement of Child Care Services & Fee Assessment</p>
                      <p>Licensed Home Child Care Program • Ontario CCEYA Section 8</p>
                    </>
                  ) : (
                    <>
                      <p className="font-bold text-black">Certified by All Child Care Solutions Inc. • Executive Office</p>
                      <p>Authorized Signatory: Agency Director</p>
                    </>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-black">Status: {isReleased ? 'Official Issued Statement' : 'Administrative Draft'}</p>
                  <p className="font-mono">Filing Code: ON-CCEYA-FEE-2026</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Bar (Hidden on Print) */}
          <div className="p-4 border-t-2 border-slate-900 bg-slate-50 flex items-center justify-between text-xs shrink-0 print:hidden">
            <span className="text-slate-500 text-[11px]">
              Ontario Child Care and Early Years Act (CCEYA) Section 8 Billing Compliance
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
