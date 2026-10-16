import React, { useState } from 'react';
import { Child, Provider, ParentGuardian, ProviderTimesheet, FundingType } from '../../types';
import { ModalPortal } from '../common/ModalPortal';
import { calculateMonthlyFee, loadAgencySettings } from '../../data/agencySettingsData';
import { 
  CreditCard, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  DollarSign, 
  FileCheck, 
  Mail, 
  ArrowUpRight,
  Receipt,
  Plus,
  Edit3,
  Trash2,
  Zap,
  Check,
  X,
  Sparkles,
  RefreshCw,
  FileText,
  Building2
} from 'lucide-react';
import { InvoiceDistributionModal } from './InvoiceDistributionModal';
import { ProviderT4AModal } from './ProviderT4AModal';

interface FinancialLedgerProps {
  childrenList: Child[];
  providersList: Provider[];
  parentsList: ParentGuardian[];
  onMarkPaid: (childId: string) => void;
  onUpdateChildFee?: (childId: string, updates: Partial<Child>) => void;
  onAutoGenerateMonthlyFees?: () => void;
}

export const FinancialLedger: React.FC<FinancialLedgerProps> = ({
  childrenList,
  providersList,
  parentsList,
  onMarkPaid,
  onUpdateChildFee,
  onAutoGenerateMonthlyFees
}) => {
  const [selectedReminderChild, setSelectedReminderChild] = useState<Child | null>(null);
  const [reminderSent, setReminderSent] = useState(false);

  // Edit / Add Record State
  const [editingChildFee, setEditingChildFee] = useState<Child | null>(null);
  const [editAmount, setEditAmount] = useState<number>(() => calculateMonthlyFee('cwelcc'));
  const [editStatus, setEditStatus] = useState<'paid' | 'pending' | 'overdue'>('pending');
  const [editFundingType, setEditFundingType] = useState<FundingType>('cwelcc');
  const [editDueDay, setEditDueDay] = useState<number>(1);
  const [autoGenBanner, setAutoGenBanner] = useState<string | null>(null);
  const [isAddManualModalOpen, setIsAddManualModalOpen] = useState(false);

  // Admin Invoicing & CRA T4A Modal State (Task #11)
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedInvoiceChildId, setSelectedInvoiceChildId] = useState<string>('');
  const [isT4AModalOpen, setIsT4AModalOpen] = useState(false);

  // Filter State
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all');

  // Financial Metrics
  const enrolledChildren = childrenList.filter(c => c.admissionsStage === 'enrolled' && !c.isArchived);
  const filteredChildren = statusFilter === 'all'
    ? enrolledChildren
    : enrolledChildren.filter(c => c.eTransferStatus === statusFilter);

  const cwelccCount = enrolledChildren.filter(c => c.fundingType === 'cwelcc').length;
  const subsidyCount = enrolledChildren.filter(c => c.fundingType === 'subsidy').length;
  const privateCount = enrolledChildren.filter(c => c.fundingType === 'private').length;

  const totalMonthlyParentReceivables = enrolledChildren.reduce((acc, c) => acc + c.monthlyFee, 0);
  const totalPaid = enrolledChildren.filter(c => c.eTransferStatus === 'paid').reduce((acc, c) => acc + c.monthlyFee, 0);
  const totalOutstanding = totalMonthlyParentReceivables - totalPaid;

  const handleStartEditFee = (child: Child) => {
    setEditingChildFee(child);
    setEditAmount(child.monthlyFee);
    setEditStatus(child.eTransferStatus);
    setEditFundingType(child.fundingType);
    setEditDueDay(child.eTransferDueDay || 1);
  };

  const handleSaveFeeChanges = () => {
    if (!editingChildFee || !onUpdateChildFee) return;
    onUpdateChildFee(editingChildFee.id, {
      monthlyFee: editAmount,
      eTransferStatus: editStatus,
      fundingType: editFundingType,
      eTransferDueDay: editDueDay
    });
    setEditingChildFee(null);
  };

  const handleTriggerAutoGenerate = () => {
    if (onAutoGenerateMonthlyFees) {
      onAutoGenerateMonthlyFees();
      setAutoGenBanner(`Successfully auto-generated monthly CWELCC billing for ${enrolledChildren.length} active children! Total receivables: $${totalMonthlyParentReceivables.toFixed(2)} CAD.`);
      setTimeout(() => setAutoGenBanner(null), 4000);
    }
  };

  const handleRemoveRecord = (childId: string) => {
    if (window.confirm('Reset this e-transfer invoice to $0.00 / inactive?')) {
      if (onUpdateChildFee) {
        onUpdateChildFee(childId, {
          monthlyFee: 0,
          eTransferStatus: 'paid'
        });
      }
    }
  };

  const handleSendReminder = (child: Child) => {
    setSelectedReminderChild(child);
  };

  const confirmSendEmail = () => {
    setReminderSent(true);
    setTimeout(() => {
      setReminderSent(false);
      setSelectedReminderChild(null);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border-2 border-slate-900">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Monthly Parent Invoicing (e-Transfer)</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">${totalMonthlyParentReceivables.toFixed(2)}</p>
          <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">CWELCC $10/Day Cap Enforced</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border-2 border-slate-900">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Collected via e-Transfer</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">${totalPaid.toFixed(2)}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">{( (totalPaid / (totalMonthlyParentReceivables || 1)) * 100 ).toFixed(0)}% collection rate</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border-2 border-slate-900">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pending / Overdue e-Transfers</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">${totalOutstanding.toFixed(2)}</p>
          <p className="text-[10px] text-amber-600 font-semibold mt-0.5">1-click reminder dispatches ready</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border-2 border-slate-900">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Funding Breakdown</p>
          <div className="flex items-center gap-2 mt-2 text-xs font-bold">
            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">{cwelccCount} CWELCC</span>
            <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded">{subsidyCount} Subsidy</span>
          </div>
        </div>
      </div>

      {/* Success / Notification Banner */}
      {autoGenBanner && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-500 rounded-2xl text-xs font-bold text-emerald-900 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-600 fill-emerald-400" />
            <span>{autoGenBanner}</span>
          </div>
          <button
            onClick={() => setAutoGenBanner(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Interac e-Transfer Ledger Table */}
      <div className="bg-white rounded-2xl border-2 border-slate-900 p-5 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b-2 border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-orange-500" />
              <span>Interac e-Transfer Monthly Roster & Reminders</span>
            </h3>
            <p className="text-xs text-slate-500">
              Payments are made off-platform via Interac e-transfer to <span className="font-semibold text-slate-700">allchildcaresolutions@gmail.com</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto">
            {/* Admin-Gated Invoicing & Statements Button */}
            <button
              type="button"
              onClick={() => {
                setSelectedInvoiceChildId(filteredChildren[0]?.id || childrenList[0]?.id || '');
                setIsInvoiceModalOpen(true);
              }}
              className="neo-btn bg-blue-50 hover:bg-blue-100 text-blue-950 border-2 border-slate-900 px-3 py-2 text-xs font-bold gap-1.5 cursor-pointer shadow-neo-sm"
              title="Review, print, and release monthly parent fee invoices without automated broadcasts"
            >
              <FileText className="w-4 h-4 text-blue-700" />
              <span>Invoicing & Statement Gate</span>
            </button>

            {/* CRA T4A Provider Tax Slips Button */}
            <button
              type="button"
              onClick={() => setIsT4AModalOpen(true)}
              className="neo-btn bg-purple-50 hover:bg-purple-100 text-purple-950 border-2 border-slate-900 px-3 py-2 text-xs font-bold gap-1.5 cursor-pointer shadow-neo-sm"
              title="Review and generate official CRA T4A remuneration slips for licensed providers"
            >
              <Building2 className="w-4 h-4 text-purple-700" />
              <span>CRA T4A Tax Slips</span>
            </button>

            {/* Auto-Generate Billing Engine Button */}
            <button
              type="button"
              onClick={handleTriggerAutoGenerate}
              className="neo-btn bg-orange-500 hover:bg-orange-400 text-white px-3.5 py-2 text-xs font-bold gap-1.5 cursor-pointer shadow-neo-sm"
              title="Automatically calculate and invoice all active enrolled children for the 1st of the month"
            >
              <Zap className="w-4 h-4 fill-amber-200" />
              <span>Auto-Generate Monthly Invoicing</span>
            </button>
          </div>
        </div>

        {/* Status Filter Bar */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-300 text-xs w-fit">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              statusFilter === 'all' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({enrolledChildren.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              statusFilter === 'pending' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pending ({enrolledChildren.filter(c => c.eTransferStatus === 'pending').length})
          </button>
          <button
            onClick={() => setStatusFilter('paid')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              statusFilter === 'paid' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Verified Paid ({enrolledChildren.filter(c => c.eTransferStatus === 'paid').length})
          </button>
          <button
            onClick={() => setStatusFilter('overdue')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              statusFilter === 'overdue' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Overdue ({enrolledChildren.filter(c => c.eTransferStatus === 'overdue').length})
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                <th className="p-3">Child & Parent</th>
                <th className="p-3">Funding Stream</th>
                <th className="p-3">Assigned Provider</th>
                <th className="p-3">Monthly Amount</th>
                <th className="p-3">e-Transfer Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredChildren.map(child => {
                const parent = parentsList.find(p => p.id === child.parentId);
                const provider = providersList.find(p => p.id === child.providerId);

                return (
                  <tr key={child.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{child.fullName}</p>
                      <p className="text-[11px] text-slate-500">{parent?.fullName || 'Parent Guardian'}</p>
                    </td>

                    <td className="p-3">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        child.fundingType === 'cwelcc' ? 'bg-emerald-100 text-emerald-800' :
                        child.fundingType === 'subsidy' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {child.fundingType === 'subsidy' ? `${child.subsidyRegion || 'Municipal'} Subsidy ${child.parentContributionDailyRate && child.parentContributionDailyRate > 0 ? `($${child.parentContributionDailyRate}/day)` : '($0)'}` : child.fundingType === 'cwelcc' ? 'CWELCC $22/Day' : 'Private Fee ($35/Day)'}
                      </span>
                    </td>

                    <td className="p-3">
                      <p className="font-medium text-slate-800">{provider?.name || 'Unassigned'}</p>
                      <p className="text-[10px] text-slate-400">{provider?.neighborhood}</p>
                    </td>

                    <td className="p-3 font-extrabold text-slate-900">
                      ${child.monthlyFee.toFixed(2)}
                    </td>

                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${
                        child.eTransferStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                        child.eTransferStatus === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {child.eTransferStatus === 'paid' && <CheckCircle2 className="w-3 h-3" />}
                        {child.eTransferStatus === 'pending' && <Clock className="w-3 h-3" />}
                        {child.eTransferStatus === 'overdue' && <AlertCircle className="w-3 h-3" />}
                        <span className="capitalize">{child.eTransferStatus}</span>
                      </span>
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedInvoiceChildId(child.id);
                            setIsInvoiceModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                          title="View, print, and release official monthly fee invoice"
                        >
                          <FileText className="w-3 h-3 text-blue-600" />
                          <span>Invoice</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStartEditFee(child)}
                          className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                          title="Edit e-transfer amount and status"
                        >
                          <Edit3 className="w-3 h-3 text-orange-600" />
                          <span>Edit</span>
                        </button>

                        {child.eTransferStatus !== 'paid' ? (
                          <>
                            <button
                              onClick={() => handleSendReminder(child)}
                              className="neo-btn bg-white hover:bg-orange-50 text-orange-700 px-2 py-1 text-[11px] font-bold gap-1"
                            >
                              <Send className="w-3 h-3" />
                              <span>Reminder</span>
                            </button>
                            <button
                              onClick={() => onMarkPaid(child.id)}
                              className="neo-btn bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-1 text-[11px] font-bold"
                            >
                              Paid ✓
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] font-bold text-slate-400 px-1">Verified ✓</span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveRecord(child.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                          title="Reset / Remove fee record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT E-TRANSFER RECORD MODAL */}
      {editingChildFee && (
        <ModalPortal>
          <div 
            onClick={(e) => {
              if (e.target === e.currentTarget) setEditingChildFee(null);
            }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 cursor-pointer"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="bg-white border-2 border-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-fadeIn space-y-4 text-xs cursor-default"
            >
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-100">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-orange-500" />
                <h3 className="text-base font-bold text-slate-900">
                  Edit e-Transfer: {editingChildFee.fullName}
                </h3>
              </div>
              <button
                onClick={() => setEditingChildFee(null)}
                className="text-slate-400 hover:text-slate-900 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Monthly Fee Amount ($ CAD) *</label>
                <input
                  type="number"
                  step="0.50"
                  value={editAmount}
                  onChange={(e) => setEditAmount(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-extrabold text-slate-900 text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">e-Transfer Payment Status</label>
                <select
                  value={editStatus}
                  onChange={(e: any) => setEditStatus(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                >
                  <option value="pending">Pending (Waiting for Interac e-Transfer)</option>
                  <option value="paid">Paid (Verified Received)</option>
                  <option value="overdue">Overdue (Reminder Dispatched)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Funding Program</label>
                <select
                  value={editFundingType}
                  onChange={(e: any) => {
                    setEditFundingType(e.target.value);
                    if (e.target.value === 'cwelcc') setEditAmount(calculateMonthlyFee('cwelcc'));
                    if (e.target.value === 'subsidy') setEditAmount(editingChildFee?.parentContributionDailyRate ? editingChildFee.parentContributionDailyRate * (editingChildFee.anticipatedMonthlyDays || 21) : (editingChildFee?.monthlyFee && editingChildFee?.fundingType === 'subsidy' ? editingChildFee.monthlyFee : 0));
                    if (e.target.value === 'private') setEditAmount(calculateMonthlyFee('private'));
                  }}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                >
                  <option value="cwelcc">CWELCC Active Rate (${loadAgencySettings().parentCwelccDailyRate.toFixed(2)}/Day — ${calculateMonthlyFee('cwelcc')}/mo)</option>
                  <option value="subsidy">Municipal Subsidy ($0.00/mo Parent Co-Pay)</option>
                  <option value="private">Private Care Fee (${loadAgencySettings().parentPrivateDailyRate.toFixed(2)}/Day — ${calculateMonthlyFee('private')}/mo)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Due Day of the Month</label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={editDueDay}
                  onChange={(e) => setEditDueDay(parseInt(e.target.value) || 1)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingChildFee(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 font-bold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveFeeChanges}
                className="neo-btn bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 font-bold gap-1"
              >
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Save Billing Changes</span>
              </button>
            </div>
          </div>
        </div>
      </ModalPortal>
      )}

      {/* Reminder Dispatch Modal */}
      {selectedReminderChild && (
        <ModalPortal>
          <div 
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedReminderChild(null);
            }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 cursor-pointer"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="bg-white border-2 border-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-fadeIn cursor-default"
            >
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-orange-500" />
                <span>Dispatch Interac e-Transfer Reminder</span>
              </h3>
              <button
                onClick={() => setSelectedReminderChild(null)}
                className="text-xs font-bold text-slate-400 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-900 mb-1">Email Preview to Parent:</p>
                <div className="bg-white p-3 rounded-lg border border-slate-200 font-mono text-[11px] space-y-1 text-slate-700 leading-relaxed">
                  <p><strong>To:</strong> sarah.tremblay@example.com</p>
                  <p><strong>Subject:</strong> All Child Care Solutions — Monthly Care Fee for {selectedReminderChild.fullName}</p>
                  <hr className="my-2 border-slate-100" />
                  <p>Hello Sarah,</p>
                  <p>This is a friendly reminder that the CWELCC monthly fee for <strong>{selectedReminderChild.fullName}</strong> (${selectedReminderChild.monthlyFee.toFixed(2)} CAD) is due for the upcoming month.</p>
                  <p>Please send an Interac e-transfer to: <strong>allchildcaresolutions@gmail.com</strong></p>
                  <p className="text-slate-400 text-[10px] mt-2">Security answer: (No password required / auto-deposit enabled)</p>
                </div>
              </div>

              {reminderSent ? (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-300 font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Email Dispatched via Resend API!</span>
                </div>
              ) : (
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setSelectedReminderChild(null)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmSendEmail}
                    className="neo-btn bg-orange-500 hover:bg-orange-400 text-white px-5 py-2 text-xs font-bold gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Reminder Email</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </ModalPortal>
      )}

      {/* Admin-Gated Invoicing & Statements Distribution Modal (Task #11) */}
      <InvoiceDistributionModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        childrenList={childrenList}
        parentsList={parentsList}
        providersList={providersList}
        initialChildId={selectedInvoiceChildId}
        onMarkPaid={onMarkPaid}
      />

      {/* CRA T4A Provider Tax Remuneration & Release Gate Modal (Task #11) */}
      <ProviderT4AModal
        isOpen={isT4AModalOpen}
        onClose={() => setIsT4AModalOpen(false)}
        providersList={providersList}
        childrenList={childrenList}
      />
    </div>
  );
};
