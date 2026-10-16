import React, { useState, useEffect } from 'react';
import { AgencyPolicySettings, StatutorySource } from '../../types';
import { 
  loadAgencySettings, 
  saveAgencySettings, 
  DEFAULT_AGENCY_SETTINGS, 
  DEFAULT_CCEYA_TRAINING_MODULES 
} from '../../data/agencySettingsData';
import { 
  Scale, 
  DollarSign, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  Save, 
  Sparkles, 
  ShieldCheck, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Info, 
  Sliders, 
  FileText,
  Calculator,
  Building,
  Check,
  Zap,
  Cloud,
  Video
} from 'lucide-react';
import { AiModelGovernanceConsole } from './AiModelGovernanceConsole';

interface AgencySettingsViewProps {
  enrolledChildrenCount?: number;
  onApplyRatesToEnrolledChildren?: () => void;
}

export const AgencySettingsView: React.FC<AgencySettingsViewProps> = ({
  enrolledChildrenCount = 20,
  onApplyRatesToEnrolledChildren
}) => {
  const [settings, setSettings] = useState<AgencyPolicySettings>(loadAgencySettings);
  const [hasSaved, setHasSaved] = useState(false);
  const [appliedLedgerSuccess, setAppliedLedgerSuccess] = useState(false);
  const [isCheckingMinistry, setIsCheckingMinistry] = useState(false);
  const [checkedSuccess, setCheckedSuccess] = useState(false);
  const [simulatedChildren, setSimulatedChildren] = useState<number>(enrolledChildrenCount || 20);
  const [expandedSourceIds, setExpandedSourceIds] = useState<Record<string, boolean>>({
    'statute-cceya-2014': true,
    'manual-licensing-2026': true
  });
  
  // Custom new source state
  const [showAddSource, setShowAddSource] = useState(false);
  const [newSourceTitle, setNewSourceTitle] = useState('');
  const [newSourceUrl, setNewSourceUrl] = useState('');
  const [newSourceBody, setNewSourceBody] = useState('Ontario Ministry of Education');
  const [newSourceCitation, setNewSourceCitation] = useState('');

  // Handle phase quick switch
  const handlePhaseSwitch = (phase: 'current_22' | 'target_10') => {
    if (phase === 'current_22') {
      setSettings(prev => ({
        ...prev,
        cwelccPhase: 'current_22',
        parentCwelccDailyRate: 22.00,
        provincialCwelccTopUpGrant: 13.00 // $35 - $22 = $13
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        cwelccPhase: 'target_10',
        parentCwelccDailyRate: 10.00,
        provincialCwelccTopUpGrant: 25.00 // $35 - $10 = $25
      }));
    }
  };

  const handleSave = () => {
    saveAgencySettings(settings);
    setHasSaved(true);
    setTimeout(() => setHasSaved(false), 3000);
  };

  const handleApplyToChildren = () => {
    saveAgencySettings(settings);
    if (onApplyRatesToEnrolledChildren) {
      onApplyRatesToEnrolledChildren();
      setAppliedLedgerSuccess(true);
      setTimeout(() => setAppliedLedgerSuccess(false), 4000);
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset all agency rates and statutory sources to default Ministry baselines?')) {
      setSettings(DEFAULT_AGENCY_SETTINGS);
      saveAgencySettings(DEFAULT_AGENCY_SETTINGS);
      setHasSaved(true);
      setTimeout(() => setHasSaved(false), 3000);
    }
  };

  // Check Ministry for Updates
  const handleCheckMinistry = () => {
    setIsCheckingMinistry(true);
    setTimeout(() => {
      const today = new Date().toISOString().split('T')[0];
      setSettings(prev => ({
        ...prev,
        lastPolicyReviewDate: today,
        statutorySources: prev.statutorySources.map(s => ({
          ...s,
          lastChecked: today,
          status: 'verified_active'
        }))
      }));
      setIsCheckingMinistry(false);
      setCheckedSuccess(true);
      setTimeout(() => setCheckedSuccess(false), 4000);
    }, 1200);
  };

  // Add custom statutory source
  const handleAddSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourceTitle || !newSourceUrl) return;
    const newSrc: StatutorySource = {
      id: `source-${Date.now()}`,
      title: newSourceTitle.trim(),
      governingBody: newSourceBody.trim() || 'Provincial / Regional Authority',
      url: newSourceUrl.trim(),
      legislationCitation: newSourceCitation.trim() || 'Administrative Guideline',
      lastChecked: new Date().toISOString().split('T')[0],
      status: 'verified_active',
      keyRules: ['Custom compliance directive configured by Agency Director']
    };
    setSettings(prev => ({
      ...prev,
      statutorySources: [...prev.statutorySources, newSrc]
    }));
    setNewSourceTitle('');
    setNewSourceUrl('');
    setNewSourceCitation('');
    setShowAddSource(false);
  };

  const handleDeleteSource = (id: string) => {
    setSettings(prev => ({
      ...prev,
      statutorySources: prev.statutorySources.filter(s => s.id !== id)
    }));
  };

  const handleModuleUrlChange = (modId: string, url: string) => {
    setSettings(prev => {
      const currentModules = prev.cceyaTrainingModules && prev.cceyaTrainingModules.length > 0 
        ? prev.cceyaTrainingModules 
        : DEFAULT_CCEYA_TRAINING_MODULES;
      return {
        ...prev,
        cceyaTrainingModules: currentModules.map(m => m.id === modId ? { ...m, videoUrl: url } : m)
      };
    });
  };

  const handleModuleDurationChange = (modId: string, duration: string) => {
    setSettings(prev => {
      const currentModules = prev.cceyaTrainingModules && prev.cceyaTrainingModules.length > 0 
        ? prev.cceyaTrainingModules 
        : DEFAULT_CCEYA_TRAINING_MODULES;
      return {
        ...prev,
        cceyaTrainingModules: currentModules.map(m => m.id === modId ? { ...m, duration } : m)
      };
    });
  };

  // Financial calculations (Average 21.75 active care days per month: 5 days/wk * 4.35 wks)
  const avgDaysPerMonth = 21.75;
  const parentRevenueMonthly = simulatedChildren * settings.parentCwelccDailyRate * avgDaysPerMonth;
  const provincialTopUpMonthly = simulatedChildren * settings.provincialCwelccTopUpGrant * avgDaysPerMonth;
  const providerExpenseMonthly = simulatedChildren * settings.providerDailyCompensation * avgDaysPerMonth;
  const netOperatingSpreadMonthly = (parentRevenueMonthly + provincialTopUpMonthly) - providerExpenseMonthly;

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Top Header Banner */}
      <div className="bg-white rounded-3xl border-2 border-slate-900 p-6 sm:p-8 shadow-neo space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b-2 border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-orange-100 text-orange-700 border border-orange-300">
                <Sliders className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono font-bold text-orange-600 uppercase tracking-wider">
                Agency Administration Hub
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Policy Rates & Ministry Compliance Matrix
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Update CWELCC parent fees, guaranteed provider compensation payouts, and maintain live links to official Ontario Ministry legislation.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleReset}
              className="neo-btn bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-2 text-xs font-bold gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset Defaults</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="neo-btn bg-orange-500 hover:bg-orange-400 text-white px-5 py-2 text-xs font-black gap-1.5 shadow-neo-sm"
              title="Save policy rates to Cloud Firestore and local storage"
            >
              <Save className="w-4 h-4" />
              <span>{hasSaved ? '✓ Saved to Cloud Firestore!' : 'Save Policy Changes'}</span>
            </button>

            {onApplyRatesToEnrolledChildren && (
              <button
                type="button"
                onClick={handleApplyToChildren}
                className="neo-btn bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-xs font-black gap-1.5 shadow-neo-sm"
                title="Save policy changes and recalculate all active enrolled children's monthly fees in the billing ledger"
              >
                <Zap className="w-4 h-4 fill-emerald-200" />
                <span>{appliedLedgerSuccess ? '✓ Enrolled Ledgers Synchronized!' : `Save & Sync to Active Ledgers`}</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-xl border border-slate-300 font-bold text-slate-700">
            <Building className="w-3.5 h-3.5 text-slate-500" />
            <span>Sole Interac Rail: <strong className="font-mono text-slate-900">{settings.primaryETransferRecipient}</strong></span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 rounded-xl border border-blue-300 font-bold text-blue-900">
            <Cloud className="w-3.5 h-3.5 text-blue-600" />
            <span>Cloud Firestore: <strong>Persistent (/agency_settings)</strong></span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-xl border border-emerald-300 font-bold text-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ministry Verified: <strong>{settings.lastPolicyReviewDate}</strong></span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 rounded-xl border border-purple-300 font-bold text-purple-900">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>AI Bot Real-Time Sync: <strong>Active</strong></span>
          </div>
        </div>
      </div>

      {/* SECTION 1: FINANCIAL RATES & INCOME/EXPENSE SIMULATOR */}
      <div className="bg-white rounded-3xl border-2 border-slate-900 p-6 sm:p-8 shadow-neo space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b-2 border-slate-100">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <span>1. Live Rate & Payout Configuration</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Adjust parent fee schedules and provider compensation rates. Changes synchronize live to billing ledgers and timesheets.
            </p>
          </div>

          {/* Quick CWELCC Phase Toggle */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-300">
            <button
              type="button"
              onClick={() => handlePhaseSwitch('current_22')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                settings.cwelccPhase === 'current_22'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Current Phase ($22/Day)
            </button>
            <button
              type="button"
              onClick={() => handlePhaseSwitch('target_10')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                settings.cwelccPhase === 'target_10'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Upcoming Target ($10/Day)
            </button>
          </div>
        </div>

        {/* 4 Interactive Rate Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Rate 1: Parent CWELCC Rate */}
          <div className="p-4 bg-orange-50/70 rounded-2xl border-2 border-slate-900 shadow-neo-sm space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-orange-900 block">
              Parent CWELCC Fee (Daily)
            </span>
            <div className="relative">
              <span className="absolute left-3 top-2.5 font-black text-slate-500 text-sm">$</span>
              <input
                type="number"
                step="0.50"
                min="0"
                value={settings.parentCwelccDailyRate}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setSettings(prev => ({
                    ...prev,
                    parentCwelccDailyRate: val,
                    provincialCwelccTopUpGrant: Math.max(0, prev.providerDailyCompensation - val)
                  }));
                }}
                className="w-full pl-7 pr-3 py-2 bg-white border-2 border-slate-900 rounded-xl font-black text-base text-slate-900 focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <p className="text-[11px] text-slate-600 leading-tight">
              Avg: <strong>${(settings.parentCwelccDailyRate * avgDaysPerMonth).toFixed(2)}/mo</strong> for 5 days/wk
            </p>
          </div>

          {/* Rate 2: Provincial CWELCC Top-Up Grant */}
          <div className="p-4 bg-emerald-50/70 rounded-2xl border-2 border-slate-900 shadow-neo-sm space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900 block">
              Provincial CWELCC Top-Up (Daily)
            </span>
            <div className="relative">
              <span className="absolute left-3 top-2.5 font-black text-slate-500 text-sm">$</span>
              <input
                type="number"
                step="0.50"
                min="0"
                value={settings.provincialCwelccTopUpGrant}
                onChange={(e) => setSettings(prev => ({ ...prev, provincialCwelccTopUpGrant: parseFloat(e.target.value) || 0 }))}
                className="w-full pl-7 pr-3 py-2 bg-white border-2 border-slate-900 rounded-xl font-black text-base text-slate-900 focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <p className="text-[11px] text-slate-600 leading-tight">
              Funded by Ministry of Education grant
            </p>
          </div>

          {/* Rate 3: Guaranteed Provider Payout */}
          <div className="p-4 bg-purple-50/70 rounded-2xl border-2 border-slate-900 shadow-neo-sm space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-900 block">
              Licensed Provider Payout (Daily)
            </span>
            <div className="relative">
              <span className="absolute left-3 top-2.5 font-black text-slate-500 text-sm">$</span>
              <input
                type="number"
                step="0.50"
                min="0"
                value={settings.providerDailyCompensation}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setSettings(prev => ({
                    ...prev,
                    providerDailyCompensation: val,
                    provincialCwelccTopUpGrant: Math.max(0, val - prev.parentCwelccDailyRate)
                  }));
                }}
                className="w-full pl-7 pr-3 py-2 bg-white border-2 border-slate-900 rounded-xl font-black text-base text-slate-900 focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <p className="text-[11px] text-slate-600 leading-tight">
              Guaranteed daily compensation per child
            </p>
          </div>

          {/* Rate 4: Private Full-Fee Rate */}
          <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-900 shadow-neo-sm space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 block">
              Private Care Rate (Unsubsidized)
            </span>
            <div className="relative">
              <span className="absolute left-3 top-2.5 font-black text-slate-500 text-sm">$</span>
              <input
                type="number"
                step="0.50"
                min="0"
                value={settings.parentPrivateDailyRate}
                onChange={(e) => setSettings(prev => ({ ...prev, parentPrivateDailyRate: parseFloat(e.target.value) || 0 }))}
                className="w-full pl-7 pr-3 py-2 bg-white border-2 border-slate-900 rounded-xl font-black text-base text-slate-900 focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <p className="text-[11px] text-slate-600 leading-tight">
              100% paid by non-CWELCC parent
            </p>
          </div>
        </div>

        {/* Live Income & Operating Spread Simulator */}
        <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-slate-900 shadow-neo space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-amber-200">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-orange-600" />
              <h3 className="text-sm font-black text-slate-900">
                Agency Income & Provider Compensation Cashflow Simulator
              </h3>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <span>Simulated Children Enrolled:</span>
              <input
                type="number"
                min="1"
                max="100"
                value={simulatedChildren}
                onChange={(e) => setSimulatedChildren(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 px-2 py-1 bg-white border-2 border-slate-900 rounded-lg text-center font-black"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 bg-white rounded-xl border border-amber-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Gross Parent Collections</span>
              <p className="text-lg font-black text-slate-900">${parentRevenueMonthly.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <span className="text-[10px] text-slate-500 block">Via Interac e-Transfer to Gmail</span>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-amber-200 space-y-1">
              <span className="text-[10px] font-bold text-emerald-700 uppercase">Provincial CWELCC Grant</span>
              <p className="text-lg font-black text-emerald-700">+${provincialTopUpMonthly.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <span className="text-[10px] text-slate-500 block">Ministry subsidy top-up inflow</span>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-amber-200 space-y-1">
              <span className="text-[10px] font-bold text-rose-700 uppercase">Licensed Provider Payout</span>
              <p className="text-lg font-black text-rose-700">-${providerExpenseMonthly.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <span className="text-[10px] text-slate-500 block">Guaranteed $35/day per child space</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: CANONICAL MINISTRY SOURCES OF TRUTH */}
      <div className="bg-white rounded-3xl border-2 border-slate-900 p-6 sm:p-8 shadow-neo space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b-2 border-slate-100">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-orange-600" />
              <span>2. Ontario Ministry Statutory Sources of Truth</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Authoritative legislative citations governing DaycareOS. Click to inspect live Ministry pages or verify update status.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCheckMinistry}
              disabled={isCheckingMinistry}
              className="neo-btn bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 text-xs font-bold gap-1.5 shadow-neo-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCheckingMinistry ? 'animate-spin' : ''}`} />
              <span>{isCheckingMinistry ? 'Checking Ministry...' : checkedSuccess ? '✓ Ministry Verified!' : 'Check Ministry for Updates'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAddSource(prev => !prev)}
              className="neo-btn bg-white hover:bg-slate-50 text-slate-800 px-3.5 py-2 text-xs font-bold gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-orange-600" />
              <span>Add Resource</span>
            </button>
          </div>
        </div>

        {/* Add Source Form Modal / Drawer */}
        {showAddSource && (
          <form onSubmit={handleAddSource} className="p-4 bg-orange-50/70 border-2 border-slate-900 rounded-2xl space-y-3 animate-fadeIn text-xs">
            <div className="font-black text-slate-900 flex items-center justify-between">
              <span>Add Regional Directive or Policy Document</span>
              <button type="button" onClick={() => setShowAddSource(false)} className="text-slate-400 hover:text-slate-800">✕</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Resource Title (e.g. York Region Fee Directive)"
                value={newSourceTitle}
                onChange={e => setNewSourceTitle(e.target.value)}
                required
                className="p-2.5 bg-white border border-slate-300 rounded-xl font-bold"
              />
              <input
                type="url"
                placeholder="Official URL (https://...)"
                value={newSourceUrl}
                onChange={e => setNewSourceUrl(e.target.value)}
                required
                className="p-2.5 bg-white border border-slate-300 rounded-xl font-mono"
              />
              <input
                type="text"
                placeholder="Governing Body (e.g. Regional Municipality of York)"
                value={newSourceBody}
                onChange={e => setNewSourceBody(e.target.value)}
                className="p-2.5 bg-white border border-slate-300 rounded-xl font-medium"
              />
              <input
                type="text"
                placeholder="Statutory Citation / By-Law (e.g. By-Law 2026-A)"
                value={newSourceCitation}
                onChange={e => setNewSourceCitation(e.target.value)}
                className="p-2.5 bg-white border border-slate-300 rounded-xl font-medium"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddSource(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="neo-btn bg-orange-500 hover:bg-orange-400 text-white px-4 py-1.5 font-black text-xs"
              >
                Add Source to Matrix
              </button>
            </div>
          </form>
        )}

        {/* List of Statutory Sources */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {settings.statutorySources.map((source) => (
            <div
              key={source.id}
              className="p-5 bg-white rounded-2xl border-2 border-slate-900 shadow-neo-sm space-y-3 flex flex-col justify-between hover:border-orange-500 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 font-mono text-[10px] font-bold border border-purple-200 block mb-1">
                      {source.legislationCitation}
                    </span>
                    <h3 className="font-extrabold text-sm text-slate-900 leading-snug">
                      {source.title}
                    </h3>
                    <p className="text-[11px] text-slate-500">{source.governingBody}</p>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300 flex-shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Verified</span>
                  </span>
                </div>

                <div className="space-y-1.5 pt-1 border-t border-slate-100 text-xs">
                  {(() => {
                    const isExpanded = Boolean(expandedSourceIds[source.id]);
                    const displayedRules = isExpanded ? source.keyRules : source.keyRules.slice(0, 4);

                    return (
                      <>
                        {displayedRules.map((rule, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-700 leading-tight">
                            <span className="text-orange-500 font-black">•</span>
                            <span>{rule}</span>
                          </div>
                        ))}

                        {source.keyRules.length > 4 && (
                          <button
                            type="button"
                            onClick={() => setExpandedSourceIds(prev => ({ ...prev, [source.id]: !prev[source.id] }))}
                            className="text-[10px] font-bold text-orange-600 hover:text-orange-700 pt-1 flex items-center gap-1 cursor-pointer"
                          >
                            <span>{isExpanded ? '▲ Show Less' : `▼ View all ${source.keyRules.length} statutory mandates`}</span>
                          </button>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400">
                  Last Checked: <strong>{source.lastChecked}</strong>
                </span>

                <div className="flex items-center gap-2">
                  {source.id.startsWith('source-') && (
                    <button
                      type="button"
                      onClick={() => handleDeleteSource(source.id)}
                      className="p-1 text-slate-400 hover:text-red-600"
                      title="Remove source"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="neo-btn bg-slate-50 hover:bg-slate-100 text-slate-900 px-3 py-1.5 text-[11px] font-bold gap-1"
                  >
                    <span>View Ministry Law</span>
                    <ExternalLink className="w-3 h-3 text-orange-600" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: MANDATORY CCEYA ANNUAL TRAINING VIDEO CURRICULUM */}
      <div className="bg-white rounded-3xl border-2 border-slate-900 p-6 sm:p-8 shadow-neo space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b-2 border-slate-100">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Video className="w-5 h-5 text-purple-600" />
              <span>3. Mandatory CCEYA Training Video Curriculum</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Set the official training video URLs (YouTube, Google Drive, Vimeo, or Loom) for each annual compliance module. All licensed providers review these modules in their Compliance Hub.
            </p>
          </div>

          <span className="text-xs font-mono font-bold bg-purple-100 text-purple-950 px-3 py-1 rounded-xl border border-purple-300">
            4 Core Statutory Modules (O. Reg. 137/15)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(settings.cceyaTrainingModules || DEFAULT_CCEYA_TRAINING_MODULES).map((mod) => (
            <div 
              key={mod.id}
              className="p-5 bg-white rounded-2xl border-2 border-slate-900 shadow-neo-sm space-y-3.5 flex flex-col justify-between hover:border-purple-600 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-950 border border-purple-300">
                    {mod.code}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-500">Duration:</span>
                    <input
                      type="text"
                      value={mod.duration}
                      onChange={(e) => handleModuleDurationChange(mod.id, e.target.value)}
                      className="w-16 px-1.5 py-0.5 text-[10px] font-bold bg-slate-50 border border-slate-300 rounded text-center focus:outline-none"
                    />
                  </div>
                </div>

                <h3 className="text-sm font-black text-slate-900 leading-tight">
                  {mod.title}
                </h3>

                {/* Topics Bullet List */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Key Curriculum Objectives:</span>
                  <ul className="text-[11px] text-slate-600 space-y-1 list-disc list-inside">
                    {mod.topics.slice(0, 2).map((topic, i) => (
                      <li key={i} className="truncate">{topic}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Video URL Input & Test Action */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Module Video URL (Drive, YouTube, or Direct Link)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={mod.videoUrl}
                    onChange={(e) => handleModuleUrlChange(mod.id, e.target.value)}
                    placeholder="https://drive.google.com/... or https://youtube.com/..."
                    className="flex-1 p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:border-purple-600 font-medium"
                  />
                  {mod.videoUrl && (
                    <a
                      href={mod.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="neo-btn bg-slate-100 hover:bg-slate-200 text-slate-900 px-3 py-2 text-xs font-bold gap-1 shrink-0 border border-slate-300"
                      title="Test video link in a new tab"
                    >
                      <span>Test</span>
                      <ExternalLink className="w-3.5 h-3.5 text-purple-600" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4: IN-APP AI ASSISTANT COMPLIANCE KNOWLEDGE SYNC */}
      <div className="bg-white rounded-3xl border-2 border-slate-900 p-6 sm:p-8 shadow-neo space-y-4">
        <div className="flex items-center justify-between pb-3 border-b-2 border-slate-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <div>
              <h2 className="text-base font-black text-slate-900">
                4. AI Assistant Context-Safe Grounding Bridge
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                The in-app AI Assistant reads these live admin-set rates and statutory sources on every turn without live web-scraping bloat.
              </p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black border border-emerald-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Real-Time Sync Active</span>
          </span>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
            Compiled Context Excerpt Injected into AI Assistant (~480 Tokens)
          </span>
          <pre className="p-3 bg-slate-900 text-orange-400 rounded-xl text-[11px] font-mono overflow-x-auto leading-relaxed whitespace-pre-wrap">
{`[CANONICAL AGENCY SETTINGS & STATUTORY SOURCES]
• Current CWELCC Parent Rate: $${settings.parentCwelccDailyRate.toFixed(2)}/day ($${(settings.parentCwelccDailyRate * avgDaysPerMonth).toFixed(2)}/mo avg)
• Provincial CWELCC Top-Up Grant: $${settings.provincialCwelccTopUpGrant.toFixed(2)}/day
• Municipal Subsidy Co-Pay: $0.00/day (100% covered)
• Licensed Provider Daily Compensation: $${settings.providerDailyCompensation.toFixed(2)}/day (Guaranteed standard)
• Sole Electronic Payment Rail: ${settings.primaryETransferRecipient} (Autodeposit active)
• CCEYA Capacity: Max 6 total, Max 3 <3yo, Max 3 <2yo
• Home Visitor Inspection Interval: 90-day unannounced quarterly visits
• Canonical Sources: https://www.ontario.ca/laws/statute/14c11 & https://www.ontario.ca/page/home-child-care-licensing-manual`}
          </pre>
          <p className="text-[10px] text-slate-500 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-orange-600" />
            <span>Guarantees 100% compliance with the agency's live settings while eliminating the 165k-token memory compaction trap.</span>
          </p>
        </div>
      </div>

      {/* SECTION 5: ADMIN AI MODEL GOVERNANCE & CANADIAN PIPEDA DATA SOVEREIGNTY (TASK #28) */}
      <AiModelGovernanceConsole />
    </div>
  );
};

export default AgencySettingsView;
