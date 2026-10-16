import React, { useState, useEffect } from 'react';
import { Provider, Child, RegionType } from '../../types';
import { Avatar } from '../common/Avatar';
import { ModalPortal } from '../common/ModalPortal';
import { AccsDatePicker } from '../common/AccsDatePicker';
import { 
  Home, 
  MapPin, 
  Phone, 
  Mail, 
  Users, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Baby, 
  Plus, 
  Star,
  Edit3,
  Trash2,
  X,
  Check,
  Clock,
  Sparkles,
  Copy,
  ExternalLink,
  Link,
  Video,
  FileText,
  Save,
  Settings,
  Search,
  MessageSquare
} from 'lucide-react';
import { loadAgencySettings, saveAgencySettings, DEFAULT_CCEYA_TRAINING_MODULES } from '../../data/agencySettingsData';
import { TrainingModuleConfig } from '../../types';
import { ProviderT4AModal } from './ProviderT4AModal';
import { GatedNotesModal } from '../common/notes/GatedNotesModal';

interface ProviderDirectoryProps {
  providersList: Provider[];
  childrenList: Child[];
  onAssignChildToProvider?: (childId: string, providerId: string) => void;
  onUpdateProvider?: (updatedProvider: Provider) => void;
  onAddProvider?: (newProvider: Provider) => void;
  onDeleteProvider?: (providerId: string) => void;
  openAddTrigger?: number;
}

export const ProviderDirectory: React.FC<ProviderDirectoryProps> = ({
  providersList,
  childrenList,
  onUpdateProvider,
  onAddProvider,
  onDeleteProvider,
  openAddTrigger
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [complianceModalProvider, setComplianceModalProvider] = useState<Provider | null>(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [saveSuccessBanner, setSaveSuccessBanner] = useState(false);
  const [copiedProviderId, setCopiedProviderId] = useState<string | null>(null);
  const [isT4AModalOpen, setIsT4AModalOpen] = useState(false);
  const [selectedT4AProviderId, setSelectedT4AProviderId] = useState<string>('');
  const [activeNotesProvider, setActiveNotesProvider] = useState<Provider | null>(null);
  const [agencySettings, setAgencySettings] = useState(loadAgencySettings);
  const [showTrainingCurriculumModal, setShowTrainingCurriculumModal] = useState(false);
  const [editingModules, setEditingModules] = useState<TrainingModuleConfig[]>(() => {
    const s = loadAgencySettings();
    return s.cceyaTrainingModules && s.cceyaTrainingModules.length > 0 
      ? s.cceyaTrainingModules 
      : DEFAULT_CCEYA_TRAINING_MODULES;
  });

  const handleOpenCurriculumModal = () => {
    const s = loadAgencySettings();
    setEditingModules(s.cceyaTrainingModules && s.cceyaTrainingModules.length > 0 ? s.cceyaTrainingModules : DEFAULT_CCEYA_TRAINING_MODULES);
    setShowTrainingCurriculumModal(true);
  };

  const handleSaveTrainingCurriculum = () => {
    const current = loadAgencySettings();
    const updated = {
      ...current,
      cceyaTrainingModules: editingModules
    };
    saveAgencySettings(updated);
    setAgencySettings(updated);
    setShowTrainingCurriculumModal(false);
    setSaveSuccessBanner(true);
    setTimeout(() => setSaveSuccessBanner(false), 3000);
  };

  const filteredProviders = providersList.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.homeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.homeAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.neighborhood.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRegion = selectedRegion === 'all' || p.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  const handleStartEdit = (provider: Provider) => {
    setEditingProvider({ ...provider });
    setIsAddMode(false);
  };

  const handleStartAdd = () => {
    const newProv: Provider = {
      id: `prov-${Date.now()}`,
      name: 'New Provider Name',
      homeName: 'Little Explorers Home Academy',
      homeAddress: '100 Central Ave',
      neighborhood: 'Downtown Oshawa',
      region: 'Durham Region',
      phone: '(905) 555-0199',
      email: 'provider@allchildcaresolutions.com',
      photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      maxCapacity: 6,
      maxUnderThree: 3,
      maxUnderTwo: 3, // CCEYA standard: 3 under 2
      ownChildrenUnderSix: 0,
      ownChildrenUnderFour: 0,
      acceptsSchoolAge: true,
      enrolledChildIds: [],
      annualComplianceStatus: 'compliant',
      rating: 4.9,
      operatingHours: '7:30 AM - 5:30 PM',
      bio: 'CCEYA Licensed Home Child Care facility offering nature-based play, nutrition-certified meal plans, and bilingual early literacy.',
      complianceVideoUrl: 'https://drive.google.com/drive/folders/accs-compliance-training',
      vscExpiryDate: '2028-08-01',
      offenceDeclDate: '2027-08-01',
      firstAidExpiryDate: '2027-08-01',
      homeInsuranceExpiryDate: '2027-08-01'
    };
    setEditingProvider(newProv);
    setIsAddMode(true);
  };

  // Listen for open trigger from parent sub-nav
  useEffect(() => {
    if (openAddTrigger && openAddTrigger > 0) {
      handleStartAdd();
    }
  }, [openAddTrigger]);

  const handleSaveProvider = () => {
    if (!editingProvider) return;
    if (isAddMode && onAddProvider) {
      onAddProvider(editingProvider);
    } else if (!isAddMode && onUpdateProvider) {
      onUpdateProvider(editingProvider);
    }
    setSaveSuccessBanner(true);
    setTimeout(() => {
      setSaveSuccessBanner(false);
      setEditingProvider(null);
    }, 1200);
  };

  const handleDeleteProviderClick = (providerId: string) => {
    if (window.confirm('Are you sure you want to remove this licensed provider from the network?')) {
      if (onDeleteProvider) {
        onDeleteProvider(providerId);
      }
      setEditingProvider(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="bg-white p-5 rounded-2xl border-2 border-slate-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-neo-sm">
        <div>
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-extrabold text-slate-900">Provider Network & CCEYA Ratio Capacity</h2>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
              Ontario Ministry Regulated
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Monitor real-time mixed-age ratios under Ontario CCEYA: Max 6 total, max 3 under 2, and provider's own children under 4 counted toward capacity.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            type="button"
            onClick={handleOpenCurriculumModal}
            className="neo-btn bg-purple-700 hover:bg-purple-800 text-white px-3.5 py-2 text-xs font-bold gap-1.5 shadow-neo-sm cursor-pointer"
            title="Configure the 4 annual CCEYA training video URLs for all providers"
          >
            <Video className="w-3.5 h-3.5 text-amber-300" />
            <span>Training Videos (4 Modules)</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by provider, home name, address, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <span className="font-bold text-slate-600 ml-1">Region:</span>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="bg-white border border-slate-300 rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Service Regions</option>
            <option value="Durham Region">Durham Region (Oshawa, Whitby)</option>
            <option value="York Region">York Region (Markham)</option>
            <option value="Toronto">Toronto / Scarborough</option>
          </select>
        </div>
      </div>

      {/* Provider Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProviders.map(provider => {
          const enrolled = childrenList.filter(c => c.providerId === provider.id && !c.isArchived);
          
          // Calculate CCEYA Mixed Age Ratios
          const underTwoCount = enrolled.filter(c => c.isUnderTwo).length;
          const underThreeCount = enrolled.filter(c => c.isUnderThree).length;
          const ownKidsUnderFour = provider.ownChildrenUnderFour ?? (provider.ownChildrenUnderSix ?? 0);
          const totalEnrolled = enrolled.length + ownKidsUnderFour;
          const remainingSpots = Math.max(0, provider.maxCapacity - totalEnrolled);
          const maxUnderTwoLimit = provider.maxUnderTwo ?? 3;

          const isOverCapacity = totalEnrolled > provider.maxCapacity;
          const isUnderTwoMaxed = underTwoCount >= maxUnderTwoLimit;
          const isUnderThreeMaxed = underThreeCount >= provider.maxUnderThree;

          return (
            <div
              key={provider.id}
              className="bg-white border-2 border-slate-900 rounded-2xl p-5 transition-all flex flex-col justify-between shadow-neo-sm hover:shadow-neo hover:-translate-y-0.5 gap-4"
            >
              <div className="space-y-3">
                {/* Provider Header */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b-2 border-slate-100">
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={provider.name}
                      photoUrl={provider.photoUrl}
                      size="lg"
                      className="rounded-xl border-2 border-slate-900 shadow-2xs shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-extrabold text-slate-900 leading-tight">{provider.name}</h3>
                        <span className="flex items-center text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                          {provider.rating}
                        </span>
                        <button
                          type="button"
                          onClick={() => setComplianceModalProvider(provider)}
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border cursor-pointer flex items-center gap-1 ${
                            provider.annualComplianceStatus === 'compliant'
                              ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                              : 'bg-amber-100 text-amber-950 border-amber-300'
                          }`}
                          title="Click to view full compliance dossier"
                        >
                          <ShieldCheck className="w-3 h-3 text-slate-700" />
                          <span>{provider.annualComplianceStatus === 'compliant' ? 'Licensed' : 'Renewal Due'}</span>
                        </button>
                      </div>
                      <p className="text-xs font-bold text-orange-600 mt-0.5">{provider.homeName}</p>
                      <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{provider.homeAddress}, {provider.neighborhood} ({provider.region})</span>
                      </p>

                      {/* Badges: School-Age & Own Children in Ratio */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        {provider.acceptsSchoolAge && (
                          <span className="text-[10px] font-extrabold bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-lg">
                            School-Age (6–12yr) Supported
                          </span>
                        )}
                        {ownKidsUnderFour > 0 && (
                          <span className="text-[10px] font-extrabold bg-purple-50 text-purple-800 border border-purple-200 px-2 py-0.5 rounded-lg">
                            {ownKidsUnderFour} Own Child (&lt;4yr) in Ratio
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Top-Right Magic Link Actions */}
                  <div className="flex items-center bg-orange-50/90 border-2 border-slate-900 rounded-xl p-0.5 shadow-2xs shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        const magicProvUrl = `${window.location.origin}${window.location.pathname}?role=provider&providerId=${provider.id}`;
                        navigator.clipboard.writeText(magicProvUrl);
                        setCopiedProviderId(provider.id);
                        setTimeout(() => setCopiedProviderId(null), 3000);
                      }}
                      className="bg-white hover:bg-orange-100 text-orange-950 text-[10px] font-extrabold px-2.5 py-1 rounded-lg border border-orange-300 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                      title={`Copy direct magic portal link for ${provider.name}`}
                    >
                      {copiedProviderId === provider.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-800">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-orange-600" />
                          <span>Magic Link</span>
                        </>
                      )}
                    </button>

                    <a
                      href={`/?role=provider&providerId=${provider.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 px-1.5 hover:bg-orange-200 text-orange-800 rounded-lg transition-colors flex items-center gap-0.5 text-[10px] font-bold"
                      title="Open Provider Portal in new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Standardized Contact Bar */}
                <div className="flex flex-wrap items-center gap-3 py-2 px-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                  <a href={`tel:${provider.phone}`} className="flex items-center gap-1.5 hover:text-orange-600 font-medium">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{provider.phone}</span>
                  </a>
                  <a href={`mailto:${provider.email}`} className="flex items-center gap-1.5 hover:text-orange-600 font-medium truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{provider.email}</span>
                  </a>
                  <span className="flex items-center gap-1.5 text-slate-500 font-medium ml-auto hidden sm:flex">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{provider.operatingHours}</span>
                  </span>
                </div>

                {/* Capacity & Ratio Metrics */}
                <div className="grid grid-cols-3 gap-2 my-2">
                  <div className={`p-2.5 rounded-xl border ${
                    isOverCapacity ? 'bg-red-50 border-red-300 text-red-900' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-400">Total Kids</span>
                    <span className="text-base font-extrabold">{totalEnrolled} / {provider.maxCapacity}</span>
                    <span className="text-[9px] block text-slate-500 mt-0.5">
                      {remainingSpots > 0 ? `${remainingSpots} spots open` : 'Full capacity'}
                      {ownKidsUnderFour > 0 ? ` (${ownKidsUnderFour} own <4yo)` : ''}
                    </span>
                  </div>

                  <div className={`p-2.5 rounded-xl border ${
                    isUnderThreeMaxed ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-400">&lt; 3 Years</span>
                    <span className="text-base font-extrabold">{underThreeCount} / {provider.maxUnderThree}</span>
                    <span className="text-[9px] block text-slate-500 mt-0.5">Toddler limit (max 3)</span>
                  </div>

                  <div className={`p-2.5 rounded-xl border ${
                    isUnderTwoMaxed ? 'bg-red-50 border-red-300 text-red-900' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-400">&lt; 2 Years</span>
                    <span className="text-base font-extrabold">{underTwoCount} / {maxUnderTwoLimit}</span>
                    <span className="text-[9px] block text-slate-500 mt-0.5">Infant limit (max 3)</span>
                  </div>
                </div>

                {/* Enrolled Roster */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                    Assigned Children ({enrolled.length})
                  </span>

                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {enrolled.map(child => (
                      <div
                        key={child.id}
                        className="p-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[9px]">
                            {child.fullName[0]}
                          </div>
                          <div>
                            <span className="font-bold text-slate-800">{child.fullName}</span>
                            <span className="text-[10px] text-slate-500 ml-2">({child.ageYearsFormatted})</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {child.allergies.length > 0 && (
                            <span className="bg-red-100 text-red-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                              {child.allergies[0]}
                            </span>
                          )}
                          <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded ${
                            child.fundingType === 'cwelcc' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {child.fundingType.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}

                    {enrolled.length === 0 && (
                      <p className="text-xs text-slate-400 italic p-2 bg-slate-50 rounded-lg">
                        No children currently assigned to this home.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Standardized Card Footer */}
              <div className="pt-3 border-t-2 border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="text-slate-600 font-medium flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Capacity:</span>
                  <span className={`font-bold ${remainingSpots > 0 ? 'text-emerald-700' : 'text-slate-900'}`}>
                    {remainingSpots > 0 ? `${remainingSpots} spots available` : 'Full capacity'}
                  </span>
                  {ownKidsUnderFour > 0 && (
                    <span className="text-slate-400 text-[11px]">({ownKidsUnderFour} own &lt;4yo)</span>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setActiveNotesProvider(provider)}
                    className="neo-btn bg-blue-50 hover:bg-blue-100 text-blue-900 border-blue-300 px-3 py-1.5 text-xs font-bold gap-1.5 cursor-pointer shadow-sm"
                    title="View & add gated notes for this provider"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                    <span>Notes</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setComplianceModalProvider(provider)}
                    className="neo-btn bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300 px-3 py-1.5 text-xs font-bold gap-1.5 cursor-pointer"
                    title="Click to view full compliance dossier"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Compliance Dossier</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStartEdit(provider)}
                    className="neo-btn bg-orange-50 hover:bg-orange-100 text-orange-900 border-orange-300 px-3 py-1.5 text-xs font-bold gap-1.5 cursor-pointer"
                    title="Edit provider information"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-orange-600" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* EDIT / ADD PROVIDER MODAL */}
      {editingProvider && (
        <ModalPortal>
          <div 
            onClick={(e) => {
              if (e.target === e.currentTarget) setEditingProvider(null);
            }}
            className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl border-2 border-slate-900 shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden animate-fadeIn cursor-default"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b-2 border-slate-900 bg-white shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-orange-100 text-orange-900 border border-orange-300">
                    <Home className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      {isAddMode ? 'Register New Home Child Care Provider' : `Edit Provider: ${editingProvider.name}`}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Manage Ministry CCEYA home capacity ratios, address, contact details, and compliance state.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setEditingProvider(null)}
                  className="p-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Scrollable Body */}
              <div className="p-6 overflow-y-auto space-y-5 flex-1">
                {/* Success Feedback Banner */}
                {saveSuccessBanner && (
                  <div className="p-3 bg-emerald-50 border-2 border-emerald-500 rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-2 animate-fadeIn">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Provider profile saved and synchronized to Cloud Firestore!</span>
                  </div>
                )}

                {/* Provider Form Inputs */}
                <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Provider Legal Name *</label>
                  <input
                    type="text"
                    value={editingProvider.name}
                    onChange={(e) => setEditingProvider({ ...editingProvider, name: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Home Academy / Facility Name *</label>
                  <input
                    type="text"
                    value={editingProvider.homeName}
                    onChange={(e) => setEditingProvider({ ...editingProvider, homeName: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Street Address *</label>
                  <input
                    type="text"
                    value={editingProvider.homeAddress}
                    onChange={(e) => setEditingProvider({ ...editingProvider, homeAddress: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Neighborhood / District</label>
                  <input
                    type="text"
                    value={editingProvider.neighborhood}
                    onChange={(e) => setEditingProvider({ ...editingProvider, neighborhood: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Region / Municipality</label>
                  <select
                    value={editingProvider.region}
                    onChange={(e: any) => setEditingProvider({ ...editingProvider, region: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  >
                    <option value="Durham Region">Durham Region (Oshawa, Whitby)</option>
                    <option value="York Region">York Region (Markham, Richmond Hill)</option>
                    <option value="Toronto">Toronto / GTA</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Phone Number *</label>
                  <input
                    type="text"
                    value={editingProvider.phone}
                    onChange={(e) => setEditingProvider({ ...editingProvider, phone: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={editingProvider.email}
                    onChange={(e) => setEditingProvider({ ...editingProvider, email: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Operating Hours</label>
                  <input
                    type="text"
                    value={editingProvider.operatingHours}
                    onChange={(e) => setEditingProvider({ ...editingProvider, operatingHours: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                    placeholder="e.g. 7:30 AM - 5:30 PM"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">CCEYA Compliance Status</label>
                  <select
                    value={editingProvider.annualComplianceStatus}
                    onChange={(e: any) => setEditingProvider({ ...editingProvider, annualComplianceStatus: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="compliant">Compliant (Licensed Active)</option>
                    <option value="renewal_due">Renewal Due (Inspection Needed)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Photo URL</label>
                  <input
                    type="text"
                    value={editingProvider.photoUrl}
                    onChange={(e) => setEditingProvider({ ...editingProvider, photoUrl: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-600"
                  />
                </div>
              </div>

              {/* CCEYA Capacity Ratios */}
              <div className="p-3.5 bg-orange-50/70 border border-orange-200 rounded-2xl space-y-2">
                <span className="font-bold text-orange-950 block">CCEYA Ontario Mixed-Age Capacity Limits</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-0.5 text-[11px]">Max Capacity (Max 6)</label>
                    <input
                      type="number"
                      max={6}
                      min={1}
                      value={editingProvider.maxCapacity}
                      onChange={(e) => setEditingProvider({ ...editingProvider, maxCapacity: parseInt(e.target.value) || 6 })}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded-lg font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-0.5 text-[11px]">Max Under 3 (Max 3)</label>
                    <input
                      type="number"
                      max={3}
                      min={0}
                      value={editingProvider.maxUnderThree}
                      onChange={(e) => setEditingProvider({ ...editingProvider, maxUnderThree: parseInt(e.target.value) || 3 })}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded-lg font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-0.5 text-[11px]">Max Under 2 (Max 3)</label>
                    <input
                      type="number"
                      max={3}
                      min={0}
                      value={editingProvider.maxUnderTwo ?? 3}
                      onChange={(e) => setEditingProvider({ ...editingProvider, maxUnderTwo: parseInt(e.target.value) || 3 })}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded-lg font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-0.5 text-[11px]">Own Kids &lt; 4 (In Ratio)</label>
                    <input
                      type="number"
                      max={6}
                      min={0}
                      value={editingProvider.ownChildrenUnderFour ?? 0}
                      onChange={(e) => setEditingProvider({ ...editingProvider, ownChildrenUnderFour: parseInt(e.target.value) || 0 })}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded-lg font-bold"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="acceptsSchoolAgeCheck"
                    checked={editingProvider.acceptsSchoolAge ?? false}
                    onChange={(e) => setEditingProvider({ ...editingProvider, acceptsSchoolAge: e.target.checked })}
                    className="w-4 h-4 rounded text-orange-500 border-slate-300 focus:ring-orange-400"
                  />
                  <label htmlFor="acceptsSchoolAgeCheck" className="text-xs font-bold text-slate-800 cursor-pointer">
                    Accepts School-Age Children (6 to 12 Years) for before/after school care
                  </label>
                </div>
              </div>

              {/* Regulatory Compliance Expiration Dates */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <span className="font-bold text-slate-900 block">Regulatory Compliance & Expiry Dates</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-0.5 text-[11px]">VSC Police Check (5-yr expiry)</label>
                    <AccsDatePicker
                      value={editingProvider.vscExpiryDate || ''}
                      onChange={(val) => setEditingProvider({ ...editingProvider, vscExpiryDate: val })}
                      mode="future"
                      placeholder="YYYY-MM-DD"
                      className="w-full text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-0.5 text-[11px]">Offence Declaration (1-yr renewal)</label>
                    <AccsDatePicker
                      value={editingProvider.offenceDeclDate || ''}
                      onChange={(val) => setEditingProvider({ ...editingProvider, offenceDeclDate: val })}
                      mode="future"
                      placeholder="YYYY-MM-DD"
                      className="w-full text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-0.5 text-[11px]">First Aid & CPR Level C (3-yr expiry)</label>
                    <AccsDatePicker
                      value={editingProvider.firstAidExpiryDate || ''}
                      onChange={(val) => setEditingProvider({ ...editingProvider, firstAidExpiryDate: val })}
                      mode="future"
                      placeholder="YYYY-MM-DD"
                      className="w-full text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-0.5 text-[11px]">Home Daycare Insurance ($2M Rider)</label>
                    <AccsDatePicker
                      value={editingProvider.homeInsuranceExpiryDate || ''}
                      onChange={(val) => setEditingProvider({ ...editingProvider, homeInsuranceExpiryDate: val })}
                      mode="future"
                      placeholder="YYYY-MM-DD"
                      className="w-full text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2 p-3.5 bg-purple-50/70 border-2 border-purple-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Video className="w-4 h-4 text-purple-700" />
                        <span className="text-[11px] font-black text-purple-950 uppercase">Mandatory CCEYA Annual Training Videos</span>
                      </div>
                      <p className="text-xs text-slate-700 mt-0.5">
                        All 4 modules (Anaphylaxis, Safe Sleep, Behaviour Guidance, Serious Occurrence) are assigned agency-wide per video.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenCurriculumModal}
                      className="neo-btn bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold px-3 py-1.5 gap-1 shrink-0 cursor-pointer shadow-sm"
                    >
                      <Settings className="w-3.5 h-3.5 text-amber-300" />
                      <span>Edit Video URLs (4 Modules)</span>
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Provider Bio & Program Description</label>
                <textarea
                  rows={2}
                  value={editingProvider.bio}
                  onChange={(e) => setEditingProvider({ ...editingProvider, bio: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                />
              </div>
              </div>
              </div>

              {/* Modal Actions / Pinned Footer */}
              <div className="p-4 border-t-2 border-slate-900 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
                {!isAddMode ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteProviderClick(editingProvider.id)}
                    className="text-red-600 hover:text-red-800 font-bold flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Remove Provider</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingProvider(null)}
                    className="px-4 py-2 rounded-xl border-2 border-slate-300 bg-white hover:bg-slate-50 font-bold text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveProvider}
                    className="neo-btn bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 font-bold gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>{isAddMode ? 'Create Provider' : 'Save Provider Changes'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* COMPLIANCE & EXPIRATION DOSSIER MODAL */}
      {complianceModalProvider && (
        <ModalPortal>
          <div 
            onClick={(e) => {
              if (e.target === e.currentTarget) setComplianceModalProvider(null);
            }}
            className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl border-2 border-slate-900 shadow-neo max-w-3xl w-full flex flex-col max-h-[90vh] overflow-hidden animate-fadeIn cursor-default"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b-2 border-slate-900 bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-900 border-2 border-emerald-400">
                  <ShieldCheck className="w-6 h-6 text-emerald-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900">
                      Compliance Dossier: {complianceModalProvider.name}
                    </h3>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                      complianceModalProvider.annualComplianceStatus === 'compliant' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {complianceModalProvider.annualComplianceStatus === 'compliant' ? 'Licensed Active' : 'Renewal Due'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {complianceModalProvider.homeName} • {complianceModalProvider.region}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setComplianceModalProvider(null)}
                className="p-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
            {/* CCEYA Annual Training Videos (4 Modules) */}
            <div className="p-4 bg-purple-50/70 border-2 border-purple-300 rounded-2xl space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-purple-200 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-purple-700 text-white rounded-xl">
                    <Video className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase text-purple-950">
                      Mandatory Annual Training Videos (4 Modules)
                    </h4>
                    <p className="text-[11px] text-purple-900">
                      Individual compliance videos required for annual CCEYA policy sign-off (O. Reg. 137/15).
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleOpenCurriculumModal}
                  className="neo-btn bg-white hover:bg-purple-100 text-purple-900 border border-purple-400 px-2.5 py-1 text-[11px] font-bold gap-1 cursor-pointer shrink-0"
                >
                  <Settings className="w-3 h-3 text-purple-600" />
                  <span>Configure Video URLs</span>
                </button>
              </div>

              {/* 4 Video Links Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {(agencySettings.cceyaTrainingModules || DEFAULT_CCEYA_TRAINING_MODULES).map((mod) => (
                  <div key={mod.id} className="p-2.5 bg-white border border-purple-200 rounded-xl flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-mono font-bold bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded">
                          {mod.code}
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold">{mod.duration}</span>
                      </div>
                      <p className="text-xs font-bold text-slate-900 truncate mt-0.5">{mod.title}</p>
                    </div>

                    <a
                      href={mod.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="neo-btn bg-slate-900 hover:bg-slate-800 text-white px-2.5 py-1 text-[10px] font-bold gap-1 shrink-0"
                      title={`Watch ${mod.title}`}
                    >
                      <span>Watch</span>
                      <ExternalLink className="w-3 h-3 text-orange-400" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* 2-Column Compliance Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Column 1: Core Statutory Clearances */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-extrabold text-slate-900 uppercase tracking-wider block text-[11px]">
                  Core Statutory Documents
                </span>

                <div className="space-y-2">
                  <div className="p-2 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold block">Vulnerable Sector Check (5yr)</span>
                      <span className="text-[11px] text-slate-500">Due: {complianceModalProvider.vscExpiryDate || 'Not on file'}</span>
                    </div>
                    <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      {complianceModalProvider.vscExpiryDate ? 'On File' : 'Missing'}
                    </span>
                  </div>

                  <div className="p-2 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold block">Annual Offence Declaration (1yr)</span>
                      <span className="text-[11px] text-slate-500">Due: {complianceModalProvider.offenceDeclDate || 'Not on file'}</span>
                    </div>
                    <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      Annual Renewal
                    </span>
                  </div>

                  <div className="p-2 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold block">Standard First Aid & CPR Level C (3yr)</span>
                      <span className="text-[11px] text-slate-500">Expires: {complianceModalProvider.firstAidExpiryDate || 'Not on file'}</span>
                    </div>
                    <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      Certified
                    </span>
                  </div>

                  <div className="p-2 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold block">Tetanus Immunization (10yr)</span>
                      <span className="text-[11px] text-slate-500">Booster: {complianceModalProvider.tetanusExpiryDate || 'Verified on file'}</span>
                    </div>
                    <span className="text-[10px] font-extrabold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                      10-Year Cycle
                    </span>
                  </div>

                  <div className="p-2 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold block">TB Test / Chest X-Ray (2yr)</span>
                      <span className="text-[11px] text-slate-500">Expires: {complianceModalProvider.tbXrayExpiryDate || 'Verified baseline'}</span>
                    </div>
                    <span className="text-[10px] font-extrabold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                      2-Year Cycle
                    </span>
                  </div>
                </div>
              </div>

              {/* Column 2: Legal, Tax & Household Members */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-extrabold text-slate-900 uppercase tracking-wider block text-[11px]">
                  Insurance, T4A & Household (18+)
                </span>

                <div className="space-y-2">
                  <div className="p-2 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold block">Daycare Liability Insurance ($2M)</span>
                      <span className="text-[11px] text-slate-500">Policy Renewal: {complianceModalProvider.homeInsuranceExpiryDate || 'Annual'}</span>
                    </div>
                    <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      Rider Active
                    </span>
                  </div>

                  <div className="p-2 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold block">Independent Contractor Agreement</span>
                      <span className="text-[11px] text-slate-500">Renewal: {complianceModalProvider.contractRenewalDate || 'Annual 1yr'}</span>
                    </div>
                    <span className="text-[10px] font-extrabold bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                      Agency Signed
                    </span>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold block text-xs">CRA T4A Remuneration Statement</span>
                        <span className="text-[11px] text-slate-500">Due: Before last working day of February</span>
                      </div>
                      <span className="text-[10px] font-extrabold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                        Annual Feb
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedT4AProviderId(complianceModalProvider.id);
                        setIsT4AModalOpen(true);
                      }}
                      className="w-full neo-btn bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300 py-1.5 px-3 text-xs font-bold gap-1.5 justify-center cursor-pointer shadow-none"
                      title="Generate official CRA T4A Statement of Remuneration"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-700" />
                      <span>Generate CRA T4A Slip</span>
                    </button>
                  </div>

                  {/* Household Members */}
                  <div className="pt-2 border-t border-slate-200">
                    <span className="font-bold block mb-1.5 text-slate-800">Adult Household Members (18+)</span>
                    {complianceModalProvider.householdAdults && complianceModalProvider.householdAdults.length > 0 ? (
                      complianceModalProvider.householdAdults.map(adult => (
                        <div key={adult.id} className="p-2 bg-white rounded-xl border border-slate-200 text-[11px] space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{adult.name} ({adult.relationship})</span>
                            <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                              adult.status === 'compliant' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {adult.status}
                            </span>
                          </div>
                          <p className="text-slate-500">
                            VSC: {adult.vscExpiryDate || 'Pending'} • Offence Decl: {adult.offenceDeclDate || 'Pending'} • Behaviour Policy: {adult.behaviourMgmtSignedDate ? 'Signed' : 'Not Signed'}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 italic text-[11px]">Zero additional adult residents registered in home.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t-2 border-slate-900 bg-slate-50 flex justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setComplianceModalProvider(null)}
                  className="neo-btn bg-slate-900 text-white hover:bg-slate-800 px-5 py-2 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Training Curriculum Modal (Admin Sets the 4 Video URLs directly) */}
      {showTrainingCurriculumModal && (
        <ModalPortal>
          <div 
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowTrainingCurriculumModal(false);
            }}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl border-2 border-slate-900 max-w-2xl w-full shadow-neo max-h-[90vh] flex flex-col animate-scaleUp overflow-hidden cursor-default"
            >
              <div className="p-5 border-b-2 border-slate-900 flex items-center justify-between bg-purple-50">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-purple-700 text-white rounded-xl">
                    <Video className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Configure Annual CCEYA Training Videos
                    </h3>
                    <p className="text-xs text-slate-600">
                      Set direct video URLs (YouTube, Google Drive, Vimeo, Loom) for the 4 statutory modules.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTrainingCurriculumModal(false)}
                  className="p-1.5 rounded-xl border border-slate-300 hover:bg-white text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4 text-xs">
                <div className="p-3 bg-purple-100/60 rounded-xl border border-purple-200 text-purple-950 font-medium">
                  Saving here updates the video URLs for <strong>all licensed providers</strong> instantly across their Provider Hub and Compliance Dossiers.
                </div>

                <div className="space-y-4">
                  {editingModules.map((mod, idx) => (
                    <div key={mod.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-300 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-950 border border-purple-300">
                            {mod.code}
                          </span>
                          <span className="font-bold text-slate-900">{mod.title}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-500 font-bold">Duration:</span>
                          <input
                            type="text"
                            value={mod.duration}
                            onChange={(e) => {
                              const next = [...editingModules];
                              next[idx] = { ...next[idx], duration: e.target.value };
                              setEditingModules(next);
                            }}
                            className="w-16 px-1.5 py-0.5 text-[10px] font-bold bg-white border border-slate-300 rounded text-center focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500 block">
                          Direct Video URL (YouTube, Vimeo, Google Drive file, or Loom)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="url"
                            value={mod.videoUrl}
                            onChange={(e) => {
                              const next = [...editingModules];
                              next[idx] = { ...next[idx], videoUrl: e.target.value };
                              setEditingModules(next);
                            }}
                            placeholder="https://drive.google.com/file/d/... or https://youtube.com/watch?v=..."
                            className="flex-1 p-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-medium focus:outline-none focus:border-purple-600"
                          />
                          {mod.videoUrl && (
                            <a
                              href={mod.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="neo-btn bg-slate-100 hover:bg-slate-200 text-slate-900 px-3 py-2 text-xs font-bold gap-1 shrink-0 border border-slate-300"
                              title="Test link in new tab"
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

              <div className="p-4 border-t-2 border-slate-900 bg-slate-50 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowTrainingCurriculumModal(false)}
                  className="px-4 py-2 border-2 border-slate-300 bg-white rounded-xl text-xs font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveTrainingCurriculum}
                  className="neo-btn bg-purple-700 hover:bg-purple-800 text-white px-5 py-2 text-xs font-black gap-1.5 shadow-neo-sm cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Video URLs for All Providers</span>
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* CRA T4A Provider Tax Remuneration Modal (Task #11) */}
      <ProviderT4AModal
        isOpen={isT4AModalOpen}
        onClose={() => setIsT4AModalOpen(false)}
        providersList={providersList}
        childrenList={childrenList}
        initialProviderId={selectedT4AProviderId}
      />

      {/* Gated Notes Modal for Provider */}
      {activeNotesProvider && (
        <GatedNotesModal
          isOpen={!!activeNotesProvider}
          onClose={() => setActiveNotesProvider(null)}
          targetType="provider"
          targetId={activeNotesProvider.id}
          targetName={activeNotesProvider.name}
          currentUser={{
            role: 'admin',
            userId: 'admin-1',
            userName: 'Agency Director'
          }}
          targetProvider={activeNotesProvider}
        />
      )}
    </div>
  );
};
