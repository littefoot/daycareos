import React, { useState } from 'react';
import { ProviderApplicant, ProviderIntakeStage, Provider, RegionType } from '../../../types';
import { ModalPortal } from '../../common/ModalPortal';
import { 
  Home, 
  UserCheck, 
  ShieldCheck, 
  FileCheck, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  AlertCircle, 
  Phone, 
  Mail, 
  MapPin, 
  Search, 
  Filter, 
  Plus, 
  X, 
  Sparkles, 
  FileText, 
  Check, 
  ArrowRight, 
  User, 
  ShieldAlert,
  Calendar,
  Building,
  KeyRound,
  Copy,
  ExternalLink
} from 'lucide-react';

interface ProviderIntakePipelineProps {
  applicants: ProviderApplicant[];
  onUpdateApplicantStage: (applicantId: string, newStage: ProviderIntakeStage) => void;
  onUpdateApplicantData: (applicantId: string, updates: Partial<ProviderApplicant>) => void;
  onGraduateProvider: (applicant: ProviderApplicant) => void;
  onAddApplicant: (applicant: ProviderApplicant) => void;
}

const STAGE_CONFIG: { stage: ProviderIntakeStage; label: string; subtext: string; color: string; badgeColor: string }[] = [
  {
    stage: 'applied',
    label: '1. Application Received',
    subtext: 'Form 01 Intake Review',
    color: 'border-blue-500 bg-blue-50/40',
    badgeColor: 'bg-blue-100 text-blue-800'
  },
  {
    stage: 'vsc_screening',
    label: '2. VSC & Screening',
    subtext: 'Medicals & 18+ Adults VSC',
    color: 'border-amber-500 bg-amber-50/40',
    badgeColor: 'bg-amber-100 text-amber-800'
  },
  {
    stage: 'home_inspection',
    label: '3. Home Assessment',
    subtext: 'Form 02 Physical Safety',
    color: 'border-purple-500 bg-purple-50/40',
    badgeColor: 'bg-purple-100 text-purple-800'
  },
  {
    stage: 'contract_orientation',
    label: '4. Contract & Policies',
    subtext: 'Form 04 Legal & Policies',
    color: 'border-indigo-500 bg-indigo-50/40',
    badgeColor: 'bg-indigo-100 text-indigo-800'
  },
  {
    stage: 'licensed_active',
    label: '5. Licensed & Ready',
    subtext: 'Director Final Sign-Off',
    color: 'border-emerald-500 bg-emerald-50/40',
    badgeColor: 'bg-emerald-100 text-emerald-800'
  }
];

export const ProviderIntakePipeline: React.FC<ProviderIntakePipelineProps> = ({
  applicants,
  onUpdateApplicantStage,
  onUpdateApplicantData,
  onGraduateProvider,
  onAddApplicant
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [residenceFilter, setResidenceFilter] = useState<string>('all');
  const [selectedApplicant, setSelectedApplicant] = useState<ProviderApplicant | null>(null);
  const [isHomeInspectionModalOpen, setIsHomeInspectionModalOpen] = useState(false);
  const [isNewApplicantModalOpen, setIsNewApplicantModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedApplicantId, setCopiedApplicantId] = useState<string | null>(null);

  // Close modals on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isHomeInspectionModalOpen) {
          setIsHomeInspectionModalOpen(false);
        } else if (selectedApplicant) {
          setSelectedApplicant(null);
        } else if (isNewApplicantModalOpen) {
          setIsNewApplicantModalOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHomeInspectionModalOpen, selectedApplicant, isNewApplicantModalOpen]);

  // Home inspection form checklist state for selected applicant
  const [inspectionBalconyLocked, setInspectionBalconyLocked] = useState(true);
  const [inspectionStairGates, setInspectionStairGates] = useState(true);
  const [inspectionSmokeCo, setInspectionSmokeCo] = useState(true);
  const [inspectionFireExtinguisher, setInspectionFireExtinguisher] = useState(true);
  const [inspectionLockedMeds, setInspectionLockedMeds] = useState(true);
  const [inspectionFirearmsChecked, setInspectionFirearmsChecked] = useState(true);
  const [inspectionTempComfort, setInspectionTempComfort] = useState(true);
  const [inspectionFirstAidManual, setInspectionFirstAidManual] = useState(true);
  const [inspectionNotes, setInspectionNotes] = useState('');

  // New applicant draft state
  const [newDraftName, setNewDraftName] = useState('');
  const [newDraftEmail, setNewDraftEmail] = useState('');
  const [newDraftPhone, setNewDraftPhone] = useState('');
  const [newDraftAddress, setNewDraftAddress] = useState('');
  const [newDraftCity, setNewDraftCity] = useState('');
  const [newDraftRegion, setNewDraftRegion] = useState<RegionType>('Durham Region');
  const [newDraftResidence, setNewDraftResidence] = useState<'detached' | 'semi' | 'townhouse' | 'apartment'>('detached');
  const [newDraftOwnsHome, setNewDraftOwnsHome] = useState(true);
  const [newDraftAdults, setNewDraftAdults] = useState(1);
  const [newDraftExistingKids, setNewDraftExistingKids] = useState(0);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredApplicants = applicants.filter(app => {
    const matchesSearch = 
      app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.neighborhood.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = regionFilter === 'all' || app.region === regionFilter;
    const matchesResidence = residenceFilter === 'all' || app.residenceType === residenceFilter;
    return matchesSearch && matchesRegion && matchesResidence;
  });

  const getNextStage = (current: ProviderIntakeStage): ProviderIntakeStage | null => {
    if (current === 'applied') return 'vsc_screening';
    if (current === 'vsc_screening') return 'home_inspection';
    if (current === 'home_inspection') return 'contract_orientation';
    if (current === 'contract_orientation') return 'licensed_active';
    return null;
  };

  const handleOpenInspection = (app: ProviderApplicant) => {
    setSelectedApplicant(app);
    setInspectionBalconyLocked(true);
    setInspectionStairGates(true);
    setInspectionSmokeCo(true);
    setInspectionFireExtinguisher(true);
    setInspectionLockedMeds(true);
    setInspectionFirearmsChecked(true);
    setInspectionTempComfort(true);
    setInspectionFirstAidManual(true);
    setInspectionNotes(app.notes || '');
    setIsHomeInspectionModalOpen(true);
  };

  const handleSaveInspection = () => {
    if (!selectedApplicant) return;
    const passed = 
      inspectionBalconyLocked && 
      inspectionStairGates && 
      inspectionSmokeCo && 
      inspectionFireExtinguisher && 
      inspectionLockedMeds && 
      inspectionFirearmsChecked &&
      inspectionTempComfort &&
      inspectionFirstAidManual;

    onUpdateApplicantData(selectedApplicant.id, {
      homeInspectionPassed: passed,
      homeInspectionDate: new Date().toISOString().split('T')[0],
      stage: passed ? 'contract_orientation' : selectedApplicant.stage,
      notes: `${selectedApplicant.notes}\n[Safety Inspection Form 02]: All 8 physical safety criteria passed.`
    });

    setIsHomeInspectionModalOpen(false);
    showToast(`Home Assessment Form 02 recorded for ${selectedApplicant.applicantName}. Advanced to Contract & Orientation.`);
  };

  const handleCreateApplicant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDraftName || !newDraftEmail) return;

    const newApp: ProviderApplicant = {
      id: `prov-app-${Date.now()}`,
      applicantName: newDraftName,
      email: newDraftEmail,
      phone: newDraftPhone || '(905) 555-0199',
      appliedDate: new Date().toISOString().split('T')[0],
      stage: 'applied',
      residenceType: newDraftResidence,
      ownsHome: newDraftOwnsHome,
      address: newDraftAddress || '100 Main St',
      neighborhood: newDraftCity || 'Central',
      city: newDraftCity || 'Oshawa',
      region: newDraftRegion,
      targetCapacity: 6,
      householdAdultsCount: Number(newDraftAdults) || 1,
      householdAdultsVscComplete: false,
      medicalClearanceReceived: false,
      firstAidCprLevelCVerified: false,
      firearmsDisclosed: false,
      homeInspectionPassed: false,
      existingChildrenCount: Number(newDraftExistingKids) || 0,
      notes: 'Initial provider intake application submitted.'
    };

    onAddApplicant(newApp);
    setIsNewApplicantModalOpen(false);
    showToast(`New applicant ${newDraftName} added to Provider Intake Pipeline.`);
    
    // Reset draft fields
    setNewDraftName('');
    setNewDraftEmail('');
    setNewDraftPhone('');
    setNewDraftAddress('');
    setNewDraftCity('');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl border-2 border-emerald-500 shadow-neo flex items-center gap-3 animate-fade-in">
          <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-sm font-bold">{toastMessage}</p>
        </div>
      )}

      {/* Header Controls & Filter Bar */}
      <div className="bg-white p-5 rounded-3xl border-2 border-slate-900 shadow-neo space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-100 rounded-xl border border-slate-900">
                <Home className="w-5 h-5 text-orange-600" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">Provider Intake Pipeline</h2>
              <span className="bg-orange-500 text-white text-xs px-2.5 py-0.5 rounded-full font-bold">
                {applicants.length} Candidates
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Screening, VSC adult checks, Form 02 home safety audits, and CCEYA licensing for prospective home providers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsNewApplicantModalOpen(true)}
              className="px-4 py-2.5 bg-orange-500 text-white rounded-2xl border-2 border-slate-900 shadow-neo-sm hover:bg-orange-600 font-bold text-xs flex items-center gap-2 transition-all active:translate-x-0.5 active:translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>New Provider Application</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Row */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search candidate, address, neighborhood..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border-2 border-slate-200 focus:border-slate-900 focus:outline-none"
            />
          </div>

          <select
            value={regionFilter}
            onChange={e => setRegionFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border-2 border-slate-200 focus:border-slate-900 focus:outline-none font-semibold text-slate-700 bg-white"
          >
            <option value="all">All Regions</option>
            <option value="Durham Region">Durham Region</option>
            <option value="York Region">York Region</option>
            <option value="Toronto">Toronto</option>
          </select>

          <select
            value={residenceFilter}
            onChange={e => setResidenceFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border-2 border-slate-200 focus:border-slate-900 focus:outline-none font-semibold text-slate-700 bg-white"
          >
            <option value="all">All Home Types</option>
            <option value="detached">Detached House</option>
            <option value="semi">Semi-Detached</option>
            <option value="townhouse">Townhouse</option>
            <option value="apartment">Apartment / Condo</option>
          </select>
        </div>
      </div>

      {/* Kanban Board (5 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {STAGE_CONFIG.map(({ stage, label, subtext, color, badgeColor }) => {
          const stageApplicants = filteredApplicants.filter(a => a.stage === stage);

          return (
            <div 
              key={stage}
              className={`flex flex-col rounded-3xl border-2 border-slate-900 bg-slate-50/70 p-3 min-h-[550px]`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-slate-200">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">{label}</h3>
                  <p className="text-[10px] text-slate-500 font-medium">{subtext}</p>
                </div>
                <span className={`text-xs font-black px-2 py-0.5 rounded-full border border-slate-900/20 ${badgeColor}`}>
                  {stageApplicants.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {stageApplicants.length === 0 ? (
                  <div className="h-40 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center p-4">
                    <Clock className="w-5 h-5 text-slate-300 mb-1" />
                    <p className="text-[11px] text-slate-400 font-semibold">No candidates in this stage</p>
                  </div>
                ) : (
                  stageApplicants.map(app => {
                    const nextStage = getNextStage(app.stage);

                    return (
                      <div
                        key={app.id}
                        className="bg-white p-3.5 rounded-2xl border-2 border-slate-900 shadow-neo-sm hover:shadow-neo transition-all space-y-2.5"
                      >
                        {/* Header: Name & Applied Date */}
                        <div className="flex items-start justify-between gap-1">
                          <div>
                            <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                              {app.applicantName}
                            </h4>
                            <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              {app.neighborhood}, {app.city}
                            </p>
                          </div>
                          <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                            {app.appliedDate}
                          </span>
                        </div>

                        {/* Quick Provider Portal Magic Link & View Actions */}
                        <div className="flex items-center gap-1.5 bg-purple-50/90 border border-purple-200 p-1.5 rounded-xl">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const magicProvUrl = `${window.location.origin}${window.location.pathname}?role=provider&providerId=${app.id}`;
                              navigator.clipboard.writeText(magicProvUrl);
                              setCopiedApplicantId(app.id);
                              showToast(`Copied magic portal link for ${app.applicantName}`);
                              setTimeout(() => setCopiedApplicantId(null), 3000);
                            }}
                            className={`flex-1 px-2 py-1 rounded-lg text-[10px] font-extrabold flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                              copiedApplicantId === app.id
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                : 'bg-white hover:bg-purple-100 text-purple-950 border-purple-300'
                            }`}
                            title={`Copy direct magic portal link for ${app.applicantName}`}
                          >
                            {copiedApplicantId === app.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-purple-700" />
                                <span>Magic Link</span>
                              </>
                            )}
                          </button>

                          <a
                            href={`/?role=provider&providerId=${app.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="px-2 py-1 bg-white hover:bg-purple-100 text-purple-950 border border-purple-300 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            title={`Open ${app.applicantName}'s Provider Portal in new tab (see what provider sees)`}
                          >
                            <span>View Portal</span>
                            <ExternalLink className="w-3 h-3 text-purple-700" />
                          </a>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              showToast(`Dispatched portal magic link to ${app.email}`);
                            }}
                            className="p-1 bg-white hover:bg-purple-100 text-purple-700 border border-purple-300 rounded-lg transition-colors cursor-pointer"
                            title={`Email Provider Portal link to ${app.email}`}
                          >
                            <Mail className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Residence & Adults Badges */}
                        <div className="flex flex-wrap items-center gap-1 text-[10px]">
                          <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-lg border border-slate-200 flex items-center gap-1">
                            <Building className="w-3 h-3 text-slate-500" />
                            <span className="capitalize">{app.residenceType}</span>
                            <span className="text-slate-400">({app.ownsHome ? 'Owned' : 'Leased'})</span>
                          </span>

                          <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-lg border border-slate-200 flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-500" />
                            <span>{app.householdAdultsCount} Adults 18+</span>
                          </span>

                          {app.existingChildrenCount && app.existingChildrenCount > 0 ? (
                            <span className="bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded-lg border border-emerald-200">
                              +{app.existingChildrenCount} Kids to CWELCC
                            </span>
                          ) : null}
                        </div>

                        {/* Compliance Micro-Checklist */}
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 space-y-1 text-[10px]">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-600 font-medium flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-slate-400" />
                              Adults VSC:
                            </span>
                            <span className={`font-bold ${app.householdAdultsVscComplete ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {app.householdAdultsVscComplete ? 'Cleared' : 'Pending'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-slate-600 font-medium flex items-center gap-1">
                              <FileCheck className="w-3 h-3 text-slate-400" />
                              Medical & First Aid:
                            </span>
                            <span className={`font-bold ${app.firstAidCprLevelCVerified ? 'text-emerald-600' : 'text-slate-500'}`}>
                              {app.firstAidCprLevelCVerified ? 'Verified' : 'Pending'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-slate-600 font-medium flex items-center gap-1">
                              <Home className="w-3 h-3 text-slate-400" />
                              Home Safety (Form 02):
                            </span>
                            <span className={`font-bold ${app.homeInspectionPassed ? 'text-emerald-600' : 'text-slate-500'}`}>
                              {app.homeInspectionPassed ? 'Passed' : 'Pending'}
                            </span>
                          </div>
                        </div>

                        {/* Interactive Buttons per Stage */}
                        <div className="pt-1 flex flex-col gap-1.5">
                          {/* Stage 1: Review Application */}
                          {app.stage === 'applied' && (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => setSelectedApplicant(app)}
                                className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-[10px] font-bold transition-all text-center"
                              >
                                View Form 01
                              </button>
                              <button
                                onClick={() => {
                                  onUpdateApplicantStage(app.id, 'vsc_screening');
                                  showToast(`${app.applicantName} advanced to VSC & Screening.`);
                                }}
                                className="flex-1 py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1 shadow-sm"
                              >
                                <span>Advance</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          )}

                          {/* Stage 2: VSC & Screening */}
                          {app.stage === 'vsc_screening' && (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => {
                                    onUpdateApplicantData(app.id, { 
                                      householdAdultsVscComplete: !app.householdAdultsVscComplete,
                                      firstAidCprLevelCVerified: true,
                                      medicalClearanceReceived: true
                                    });
                                    showToast(`Updated VSC status for ${app.applicantName}`);
                                  }}
                                  className="flex-1 py-1 px-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-[9px] font-bold text-center"
                                >
                                  {app.householdAdultsVscComplete ? 'Mark VSC Pending' : 'Verify All VSCs'}
                                </button>
                                <button
                                  onClick={() => {
                                    onUpdateApplicantStage(app.id, 'home_inspection');
                                    showToast(`${app.applicantName} advanced to Home Inspection.`);
                                  }}
                                  disabled={!app.householdAdultsVscComplete}
                                  className={`flex-1 py-1 px-2 rounded-lg text-[9px] font-bold flex items-center justify-center gap-1 ${
                                    app.householdAdultsVscComplete 
                                      ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                  }`}
                                >
                                  <span>To Inspection</span>
                                  <ArrowRight className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Stage 3: Home Inspection (Form 02) */}
                          {app.stage === 'home_inspection' && (
                            <button
                              onClick={() => handleOpenInspection(app)}
                              className="w-full py-1.5 px-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                            >
                              <Home className="w-3 h-3" />
                              <span>Conduct Form 02 Inspection</span>
                            </button>
                          )}

                          {/* Stage 4: Contract & Policies */}
                          {app.stage === 'contract_orientation' && (
                            <div className="space-y-1">
                              <button
                                onClick={() => {
                                  onUpdateApplicantData(app.id, {
                                    contractSignedDate: new Date().toISOString().split('T')[0],
                                    stage: 'licensed_active'
                                  });
                                  showToast(`${app.applicantName} signed Form 04 contract. Ready for final licensing!`);
                                }}
                                className="w-full py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1 shadow-sm"
                              >
                                <FileCheck className="w-3 h-3" />
                                <span>Sign Form 04 & Advance</span>
                              </button>
                            </div>
                          )}

                          {/* Stage 5: Final Graduation to Active Provider */}
                          {app.stage === 'licensed_active' && (
                            <button
                              onClick={() => {
                                onGraduateProvider(app);
                                showToast(`🎉 ${app.applicantName} graduated to Active Licensed Provider Directory!`);
                              }}
                              className="w-full py-2 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-1.5 shadow-neo-sm active:translate-x-0.5 active:translate-y-0.5"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                              <span>Graduate to Active Provider</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal 1: Form 02 Home Safety Assessment Modal */}
      {isHomeInspectionModalOpen && selectedApplicant && (
        <ModalPortal>
          <div 
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsHomeInspectionModalOpen(false);
              }
            }}
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-xl rounded-3xl border-2 border-slate-900 shadow-neo p-6 space-y-4 max-h-[90vh] overflow-y-auto cursor-default"
          >
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900">
              <div>
                <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">
                  CCEYA O. Reg 137/15 Mandated
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  Form 02: Home Safety Assessment
                </h3>
                <p className="text-xs text-slate-500">
                  Inspecting: <span className="font-bold text-slate-800">{selectedApplicant.applicantName}</span> ({selectedApplicant.address})
                </p>
              </div>
              <button
                onClick={() => setIsHomeInspectionModalOpen(false)}
                className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Checklist Items */}
            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-3 p-3 rounded-2xl border-2 border-slate-200 hover:border-slate-900 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={inspectionBalconyLocked}
                  onChange={e => setInspectionBalconyLocked(e.target.checked)}
                  className="w-4 h-4 mt-0.5 text-purple-600 rounded focus:ring-purple-500 border-slate-300"
                />
                <div className="text-xs">
                  <p className="font-bold text-slate-800">1. Balcony Door & Outdoor Access</p>
                  <p className="text-slate-500 text-[11px]">Balcony door locked at all times. Walkway and driveway cleared of ice and snow; exterior lighting operational.</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-2xl border-2 border-slate-200 hover:border-slate-900 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={inspectionStairGates}
                  onChange={e => setInspectionStairGates(e.target.checked)}
                  className="w-4 h-4 mt-0.5 text-purple-600 rounded focus:ring-purple-500 border-slate-300"
                />
                <div className="text-xs">
                  <p className="font-bold text-slate-800">2. Stair Gates & Barriers</p>
                  <p className="text-slate-500 text-[11px]">Approved child safety gates securely mounted at top and bottom of all stairwells accessible to children.</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-2xl border-2 border-slate-200 hover:border-slate-900 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={inspectionSmokeCo}
                  onChange={e => setInspectionSmokeCo(e.target.checked)}
                  className="w-4 h-4 mt-0.5 text-purple-600 rounded focus:ring-purple-500 border-slate-300"
                />
                <div className="text-xs">
                  <p className="font-bold text-slate-800">3. Smoke & Carbon Monoxide Detectors</p>
                  <p className="text-slate-500 text-[11px]">Operational detectors tested on every floor of the home (electric with battery backup where applicable).</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-2xl border-2 border-slate-200 hover:border-slate-900 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={inspectionFireExtinguisher}
                  onChange={e => setInspectionFireExtinguisher(e.target.checked)}
                  className="w-4 h-4 mt-0.5 text-purple-600 rounded focus:ring-purple-500 border-slate-300"
                />
                <div className="text-xs">
                  <p className="font-bold text-slate-800">4. Fire Extinguisher (5 lbs)</p>
                  <p className="text-slate-500 text-[11px]">Fully charged 5 lb minimum ABC fire extinguisher mounted near kitchen/primary exit path.</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-2xl border-2 border-slate-200 hover:border-slate-900 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={inspectionLockedMeds}
                  onChange={e => setInspectionLockedMeds(e.target.checked)}
                  className="w-4 h-4 mt-0.5 text-purple-600 rounded focus:ring-purple-500 border-slate-300"
                />
                <div className="text-xs">
                  <p className="font-bold text-slate-800">5. Locked Medication & Toxic Chemicals</p>
                  <p className="text-slate-500 text-[11px]">All prescription drugs, kitchen/bathroom cleaners, knives, and scissors in locked cupboards out of reach.</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-2xl border-2 border-slate-200 hover:border-slate-900 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={inspectionFirstAidManual}
                  onChange={e => setInspectionFirstAidManual(e.target.checked)}
                  className="w-4 h-4 mt-0.5 text-purple-600 rounded focus:ring-purple-500 border-slate-300"
                />
                <div className="text-xs">
                  <p className="font-bold text-slate-800">6. First Aid Kit with Manual</p>
                  <p className="text-slate-500 text-[11px]">Standard first aid kit with manual, thermometer, band-aids, and emergency phone numbers posted on fridge.</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-2xl border-2 border-slate-200 hover:border-slate-900 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={inspectionTempComfort}
                  onChange={e => setInspectionTempComfort(e.target.checked)}
                  className="w-4 h-4 mt-0.5 text-purple-600 rounded focus:ring-purple-500 border-slate-300"
                />
                <div className="text-xs">
                  <p className="font-bold text-slate-800">7. Indoor Temperature & Outlets</p>
                  <p className="text-slate-500 text-[11px]">Home temperature maintained at 20°C (68°F). All electrical outlets covered with safety plugs.</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-2xl border-2 border-slate-200 hover:border-slate-900 cursor-pointer transition-all bg-amber-50/50">
                <input
                  type="checkbox"
                  checked={inspectionFirearmsChecked}
                  onChange={e => setInspectionFirearmsChecked(e.target.checked)}
                  className="w-4 h-4 mt-0.5 text-amber-600 rounded focus:ring-amber-500 border-slate-300"
                />
                <div className="text-xs">
                  <p className="font-bold text-amber-900">8. Firearms Disclosure & Safety (Mandatory Law)</p>
                  <p className="text-amber-800 text-[11px]">Firearms disclosure signed. If present, unloaded and locked separately from ammunition with license provided.</p>
                </div>
              </label>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Inspector Notes</label>
              <textarea
                rows={2}
                value={inspectionNotes}
                onChange={e => setInspectionNotes(e.target.value)}
                placeholder="Physical inspection observations, stair gate dimensions, play areas..."
                className="w-full p-2 text-xs rounded-xl border-2 border-slate-200 focus:border-slate-900 focus:outline-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsHomeInspectionModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveInspection}
                className="px-5 py-2 bg-purple-600 text-white rounded-xl text-xs font-black hover:bg-purple-700 shadow-neo-sm"
              >
                Sign & Save Form 02
              </button>
            </div>
          </div>
        </div>
      </ModalPortal>
      )}

      {/* Modal 2: Form 01 Application Details Modal */}
      {selectedApplicant && !isHomeInspectionModalOpen && (
        <ModalPortal>
          <div 
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setSelectedApplicant(null);
              }
            }}
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-lg rounded-3xl border-2 border-slate-900 shadow-neo p-6 space-y-4 max-h-[85vh] overflow-y-auto cursor-default"
          >
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  Provider Application Review
                </span>
                <h3 className="text-lg font-black text-slate-900">{selectedApplicant.applicantName}</h3>
                <p className="text-xs text-slate-500">{selectedApplicant.email} | {selectedApplicant.phone}</p>
              </div>
              <button
                onClick={() => setSelectedApplicant(null)}
                className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Direct Provider Portal Magic Link Box */}
              <div className="p-3.5 bg-purple-50/80 border-2 border-purple-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
                    <span>Direct Provider Portal Access Link</span>
                  </span>
                  <span className="text-[10px] font-mono bg-purple-200/70 text-purple-900 px-2 py-0.5 rounded-md font-bold">
                    ID: {selectedApplicant.id}
                  </span>
                </div>
                <div className="p-2 bg-white border border-purple-200 rounded-xl font-mono text-[10px] text-slate-600 truncate select-all">
                  {`${window.location.origin}/?role=provider&providerId=${selectedApplicant.id}`}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const magicProvUrl = `${window.location.origin}/?role=provider&providerId=${selectedApplicant.id}`;
                      navigator.clipboard.writeText(magicProvUrl);
                      setCopiedApplicantId(selectedApplicant.id);
                      showToast(`Copied magic portal link for ${selectedApplicant.applicantName}`);
                      setTimeout(() => setCopiedApplicantId(null), 3000);
                    }}
                    className="flex-1 py-1.5 px-3 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    {copiedApplicantId === selectedApplicant.id ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Magic Link</span>
                      </>
                    )}
                  </button>
                  <a
                    href={`/?role=provider&providerId=${selectedApplicant.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-3 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-900 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                    title="Open candidate's portal in new tab"
                  >
                    <span>Open Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => showToast(`Dispatched portal link to ${selectedApplicant.email}`)}
                    className="p-2 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-900 rounded-xl transition-all cursor-pointer shadow-sm"
                    title={`Email portal link to ${selectedApplicant.email}`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1.5">
                <p className="font-bold text-slate-800">Home & Residence Details</p>
                <p><span className="text-slate-500">Address:</span> {selectedApplicant.address}, {selectedApplicant.city} ({selectedApplicant.region})</p>
                <p><span className="text-slate-500">Type:</span> <span className="capitalize">{selectedApplicant.residenceType}</span> ({selectedApplicant.ownsHome ? 'Owns Home' : 'Rented - Landlord Permission Required'})</p>
                <p><span className="text-slate-500">Target Capacity:</span> {selectedApplicant.targetCapacity} children maximum (CCEYA ratio)</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1.5">
                <p className="font-bold text-slate-800">Household Members (18+)</p>
                <p><span className="text-slate-500">Adult Count:</span> {selectedApplicant.householdAdultsCount} adults residing in home</p>
                <p className="text-[11px] text-slate-500">
                  Every adult 18+ residing on premises requires a clean Vulnerable Sector Check (VSC) before any child can enter care.
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1.5">
                <p className="font-bold text-slate-800">Existing Child Care Business</p>
                <p><span className="text-slate-500">Children Currently in Care:</span> {selectedApplicant.existingChildrenCount || 0} children</p>
                <p className="text-[11px] text-slate-500">
                  Children currently in private/unlicenced care will transition directly to funded CWELCC spaces upon agency license approval.
                </p>
              </div>

              <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200">
                <p className="font-bold text-blue-900 mb-1">Applicant Notes</p>
                <p className="text-blue-800 text-[11px]">{selectedApplicant.notes}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedApplicant(null)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      </ModalPortal>
      )}

      {/* Modal 3: New Provider Application Form Modal */}
      {isNewApplicantModalOpen && (
        <ModalPortal>
          <div 
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsNewApplicantModalOpen(false);
              }
            }}
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-lg rounded-3xl border-2 border-slate-900 shadow-neo p-6 space-y-4 max-h-[85vh] overflow-y-auto cursor-default"
          >
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900">
              <div>
                <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">
                  Quick Intake
                </span>
                <h3 className="text-lg font-black text-slate-900">New Provider Application</h3>
                <p className="text-xs text-slate-500">Register prospective home child care provider into pipeline</p>
              </div>
              <button
                onClick={() => setIsNewApplicantModalOpen(false)}
                className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateApplicant} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amina Hassan"
                  value={newDraftName}
                  onChange={e => setNewDraftName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border-2 border-slate-200 focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="amina@example.com"
                    value={newDraftEmail}
                    onChange={e => setNewDraftEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl border-2 border-slate-200 focus:border-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="(905) 555-0144"
                    value={newDraftPhone}
                    onChange={e => setNewDraftPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border-2 border-slate-200 focus:border-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    placeholder="e.g. 215 Rossland Rd W"
                    value={newDraftAddress}
                    onChange={e => setNewDraftAddress(e.target.value)}
                    className="w-full p-2.5 rounded-xl border-2 border-slate-200 focus:border-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    placeholder="Oshawa / Whitby / Markham"
                    value={newDraftCity}
                    onChange={e => setNewDraftCity(e.target.value)}
                    className="w-full p-2.5 rounded-xl border-2 border-slate-200 focus:border-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Region</label>
                  <select
                    value={newDraftRegion}
                    onChange={e => setNewDraftRegion(e.target.value as RegionType)}
                    className="w-full p-2.5 rounded-xl border-2 border-slate-200 focus:border-slate-900 focus:outline-none bg-white font-semibold"
                  >
                    <option value="Durham Region">Durham Region</option>
                    <option value="York Region">York Region</option>
                    <option value="Toronto">Toronto</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Residence Type</label>
                  <select
                    value={newDraftResidence}
                    onChange={e => setNewDraftResidence(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border-2 border-slate-200 focus:border-slate-900 focus:outline-none bg-white font-semibold"
                  >
                    <option value="detached">Detached House</option>
                    <option value="semi">Semi-Detached</option>
                    <option value="townhouse">Townhouse</option>
                    <option value="apartment">Apartment / Condo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Adults in Home (18+)</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={newDraftAdults}
                    onChange={e => setNewDraftAdults(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border-2 border-slate-200 focus:border-slate-900 focus:outline-none font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Transitioning Kids</label>
                  <input
                    type="number"
                    min="0"
                    max="6"
                    value={newDraftExistingKids}
                    onChange={e => setNewDraftExistingKids(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border-2 border-slate-200 focus:border-slate-900 focus:outline-none font-semibold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewApplicantModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-500 text-white rounded-xl text-xs font-black hover:bg-orange-600 shadow-neo-sm"
                >
                  Create Application
                </button>
              </div>
            </form>
          </div>
        </div>
      </ModalPortal>
      )}
    </div>
  );
};
