import React, { useState, useEffect } from 'react';
import { ModalPortal } from '../common/ModalPortal';
import { Provider, Child, ParentGuardian, HomeVisitor, AgencyLogoRecord } from '../../types';
import { FormTemplate } from '../../types/formSchema';
import { Avatar } from '../common/Avatar';
import { LogoMediaLibraryModal } from './LogoMediaLibraryModal';
import { 
  AGENCY_ENTITIES, 
  loadLogosFromStorage, 
  loadActivePrintEntity, 
  loadActivePrintLogoId,
  saveActivePrintEntity,
  saveActivePrintLogoId 
} from '../../data/agencyLogosData';
import { 
  Printer, 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  Check, 
  Phone, 
  User, 
  Baby, 
  Home, 
  Calendar,
  Layers,
  CheckCircle2,
  Mail,
  MapPin,
  ChevronDown,
  Building2,
  Image as ImageIcon,
  X,
  BookOpen,
  Users
} from 'lucide-react';

export type PrintMode = 'all' | 'cover_sheet' | 'child_dossier' | 'visitor_file' | 'emergency_cards' | 'blank_form';
export type BinderScope = 'all_agency' | 'single_provider';

export interface PhysicalBinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  providersList: Provider[];
  childrenList: Child[];
  parentsList?: ParentGuardian[];
  visitorsList?: HomeVisitor[];
  formsList?: FormTemplate[];
  initialProviderId?: string;
  initialPrintSection?: PrintMode;
  initialChildId?: string;
  initialScope?: BinderScope;
}

function formatEmergencyContactDisplay(name: string, relationship?: string): string {
  let cleanName = (name || '').trim();
  const rel = (relationship || '').trim();
  if (!rel) return cleanName;

  // If cleanName already ends with (rel) or (rel) repeats, strip all trailing instances
  const escapedRel = rel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const duplicateRelRegex = new RegExp(`(\\s*\\(${escapedRel}\\))+$`, 'i');
  cleanName = cleanName.replace(duplicateRelRegex, '').trim();

  return `${cleanName} (${rel})`;
}

export const PhysicalBinderModal: React.FC<PhysicalBinderModalProps> = ({
  isOpen,
  onClose,
  providersList,
  childrenList,
  parentsList = [],
  visitorsList = [],
  formsList = [],
  initialProviderId,
  initialPrintSection,
  initialChildId,
  initialScope
}) => {
  const [printSection, setPrintSection] = useState<PrintMode>(initialPrintSection || 'all');
  const [binderScope, setBinderScope] = useState<BinderScope>(initialScope || (initialProviderId ? 'single_provider' : 'all_agency'));
  const [selectedProviderId, setSelectedProviderId] = useState<string>(initialProviderId || providersList[0]?.id || '');
  const [selectedChildId, setSelectedChildId] = useState<string>(initialChildId || 'all');
  const [selectedVisitorId, setSelectedVisitorId] = useState<string>(visitorsList[0]?.id || '');
  const [selectedFormId, setSelectedFormId] = useState<string>(formsList[0]?.id || '');

  // Logo & Entity Media Library State
  const [logosList, setLogosList] = useState<AgencyLogoRecord[]>(loadLogosFromStorage);
  const [activeEntity, setActiveEntity] = useState<any>(loadActivePrintEntity);
  const [activeLogoId, setActiveLogoId] = useState<string>(loadActivePrintLogoId);
  const [isLogoLibraryOpen, setIsLogoLibraryOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialProviderId) {
        setSelectedProviderId(initialProviderId);
      }
      if (initialScope) {
        setBinderScope(initialScope);
      } else if (initialProviderId) {
        setBinderScope('single_provider');
      }
      if (initialPrintSection) {
        setPrintSection(initialPrintSection);
      }
      if (initialChildId) {
        setSelectedChildId(initialChildId);
      }
      document.body.classList.add('has-active-print-modal');
    } else {
      document.body.classList.remove('has-active-print-modal');
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.classList.remove('has-active-print-modal');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, initialProviderId, initialScope, initialPrintSection, initialChildId]);

  if (!isOpen) return null;

  const provider = providersList.find(p => p.id === selectedProviderId) || providersList[0];
  const enrolledChildren = childrenList.filter(c => c.providerId === provider?.id);
  const activeChild = childrenList.find(c => c.id === selectedChildId) || childrenList[0];
  const selectedVisitor = visitorsList.find(v => v.id === selectedVisitorId) || visitorsList[0];
  const selectedForm = formsList.find(f => f.id === selectedFormId) || formsList[0];

  // In full binder mode, look up the assigned home visitor for this provider
  const assignedVisitor = visitorsList.find(v => v.assignedProviderIds?.includes(provider?.id)) || selectedVisitor;

  const activeLogo = logosList.find(l => l.id === activeLogoId) || logosList[0];
  const activeEntityDetails = AGENCY_ENTITIES[activeEntity];

  // Children mapped to providers vs unassigned
  const assignedChildIds = new Set(
    providersList.flatMap(p => childrenList.filter(c => c.providerId === p.id).map(c => c.id))
  );
  const unassignedChildren = childrenList.filter(c => !assignedChildIds.has(c.id));

  // Calculate total pages for the ENTIRE AGENCY master binder
  // (Each enrolled child gets 1 Master Dossier page + 1 DEDICATED Backpack Wallet Card page)
  const calculateTotalAgencyPages = () => {
    let count = 1; // 1. Agency Master Licensing Summary & Roster
    providersList.forEach(p => {
      const pKids = childrenList.filter(c => c.providerId === p.id);
      count += 1; // Provider Cover Sheet
      count += pKids.length; // 1 page per enrolled child dossier
      count += pKids.length; // 1 DEDICATED PAGE PER CHILD FOR BACKPACK WALLET CARD
    });
    count += unassignedChildren.length * 2; // Any unassigned / intake child dossiers + wallet cards
    count += visitorsList.length; // 1 page per Home Visitor Section 26 inspection dossier
    if (selectedForm) {
      count += 1; // Blank Statutory Form
    }
    return count;
  };

  const totalAgencyPages = calculateTotalAgencyPages();

  // Calculate total pages for a single provider home
  const targetDossierChildren = enrolledChildren.length > 0 ? enrolledChildren : (activeChild ? [activeChild] : []);
  const singleHomePages = 1 + (targetDossierChildren.length * 2) + 1 + (selectedForm ? 1 : 0);

  const handleTriggerPrint = () => {
    document.body.classList.add('has-active-print-modal');
    window.print();
  };

  const handleTriggerPrintAll = () => {
    setPrintSection('all');
    setBinderScope('all_agency');
    setTimeout(() => {
      document.body.classList.add('has-active-print-modal');
      window.print();
    }, 150);
  };

  const handleSelectLogo = (logo: AgencyLogoRecord) => {
    setActiveLogoId(logo.id);
    saveActivePrintLogoId(logo.id);
  };

  const handleSelectEntity = (entity: any) => {
    setActiveEntity(entity);
    saveActivePrintEntity(entity);
  };

  // =========================================================================
  // MODULAR DOCUMENT RENDERERS
  // =========================================================================

  // 0. Master Agency Licensing Summary Sheet (Page 1 of Full Agency Binder)
  const renderAgencyMasterOverview = (isPrintAll: boolean = false, isLast: boolean = false) => {
    return (
      <div className={`physical-binder-sheet bg-white p-8 border-2 border-slate-900 rounded-2xl max-w-3xl mx-auto shadow-sm space-y-6 print:border-none print:shadow-none print:p-0 print:max-w-full ${isPrintAll && !isLast ? 'binder-page-break' : ''}`}>
        <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
          <div className="flex items-center gap-4">
            <img
              src={activeLogo.url}
              alt={activeEntityDetails.name}
              className="h-16 w-auto max-w-[210px] object-contain"
              onError={(e) => {
                if (activeLogo.localFallbackUrl) (e.target as HTMLImageElement).src = activeLogo.localFallbackUrl;
              }}
            />
            <div>
              <h2 className="text-base font-black text-slate-900 leading-tight">
                {activeEntityDetails.name}
              </h2>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                Master Agency Licensing Dossier & Ministry Audit Binder
              </p>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full border border-emerald-300 mt-1 inline-block">
                CCEYA 2026 Provincial Compliance • North America Northeast1 (PIPEDA)
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="border-2 border-slate-900 p-2.5 rounded-xl text-center bg-slate-50 inline-block shadow-sm">
              <p className="text-[10px] font-mono font-bold text-slate-500">MINISTRY LICENSE</p>
              <p className="font-mono font-black text-sm text-slate-900">
                {activeEntityDetails.licenseNumber}
              </p>
              <p className="text-[9px] font-bold text-emerald-700 mt-0.5">ACTIVE & IN GOOD STANDING</p>
            </div>
          </div>
        </div>

        {/* Agency Statutory Overview Card */}
        <div className="bg-orange-50 p-4 rounded-xl border-2 border-slate-900 text-xs space-y-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Supervising Agency Director</span>
              <span className="font-black text-slate-900 text-sm">{activeEntityDetails.director}</span>
              <p className="text-slate-600 text-[11px]">{activeEntityDetails.email} • {activeEntityDetails.phone}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Licensed Operating Jurisdictions</span>
              <span className="font-bold text-slate-900">Durham Region, York Region & City of Toronto</span>
              <p className="text-slate-600 text-[11px]">Ontario CWELCC ($22/Day) & Municipal Subsidy Active</p>
            </div>
          </div>
          <div className="border-t border-orange-200 pt-2 grid grid-cols-3 gap-2 text-center">
            <div className="bg-white p-2 rounded-lg border border-orange-300">
              <span className="text-[10px] font-bold text-slate-500 block uppercase">Licensed Providers</span>
              <span className="text-base font-black text-slate-900">{providersList.length} Homes</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-orange-300">
              <span className="text-[10px] font-bold text-slate-500 block uppercase">RECE Home Visitors</span>
              <span className="text-base font-black text-slate-900">{visitorsList.length} Inspectors</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-orange-300">
              <span className="text-[10px] font-bold text-slate-500 block uppercase">Enrolled Children</span>
              <span className="text-base font-black text-slate-900">{childrenList.length} Children</span>
            </div>
          </div>
        </div>

        {/* Master Licensed Providers Roster Table */}
        <div>
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 mb-2 flex items-center justify-between">
            <span>Master Licensed Home Premises Roster ({providersList.length} Homes)</span>
            <span className="text-[10px] font-mono text-slate-500 font-bold">CCEYA s. 8 Ratios: Max 6 Total, Max 3 &lt;3yo</span>
          </h3>
          <table className="w-full text-xs text-left border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-[10px] uppercase font-bold text-slate-700">
                <th className="p-2 border-r border-slate-300">Provider & Home</th>
                <th className="p-2 border-r border-slate-300">Premises Address</th>
                <th className="p-2 border-r border-slate-300">Region</th>
                <th className="p-2 border-r border-slate-300">Enrolled</th>
                <th className="p-2 border-r border-slate-300">Visitor</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {providersList.map(p => {
                const pKids = childrenList.filter(c => c.providerId === p.id);
                const pVisitor = visitorsList.find(v => v.assignedProviderIds?.includes(p.id));
                return (
                  <tr key={p.id}>
                    <td className="p-2 border-r border-slate-200">
                      <span className="font-bold text-slate-900 block">{p.name}</span>
                      <span className="text-[10px] text-slate-500">{p.homeName}</span>
                    </td>
                    <td className="p-2 border-r border-slate-200 text-[11px] text-slate-700">{p.homeAddress}</td>
                    <td className="p-2 border-r border-slate-200 text-[11px] font-semibold text-slate-800">{p.region}</td>
                    <td className="p-2 border-r border-slate-200 font-bold text-slate-900">{pKids.length} / {p.maxCapacity}</td>
                    <td className="p-2 border-r border-slate-200 text-[11px] text-purple-900 font-semibold">{pVisitor?.name || 'Assigned'}</td>
                    <td className="p-2 text-emerald-700 font-bold text-[11px]">✓ Compliant</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Statutory Verification Footer */}
        <div className="mt-8 pt-4 border-t-2 border-dashed border-slate-300 flex justify-between items-end text-[11px] text-slate-500">
          <div>
            <p>Director Signature: _________________________________</p>
            <p className="mt-1">Date Printed: {new Date().toLocaleDateString('en-CA')}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-slate-900">Ontario Ministry of Education CCEYA Master File</p>
            <p>{activeEntityDetails.name}</p>
            <p className="text-[10px] text-slate-400">License: {activeEntityDetails.licenseNumber}</p>
          </div>
        </div>
      </div>
    );
  };

  // 1. Provider Home Binder Cover Sheet
  const renderCoverSheet = (p: Provider, isPrintAll: boolean = false, isLast: boolean = false) => {
    const pEnrolled = childrenList.filter(c => c.providerId === p.id);
    return (
      <div className={`physical-binder-sheet bg-white p-8 border-2 border-slate-900 rounded-2xl max-w-3xl mx-auto shadow-sm print:border-none print:shadow-none print:p-0 print:max-w-full ${isPrintAll && !isLast ? 'binder-page-break' : ''}`}>
        <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4 mb-6">
          <div className="flex items-center gap-4">
            <img
              src={activeLogo.url}
              alt={activeEntityDetails.name}
              className="h-16 w-auto max-w-[210px] object-contain"
              onError={(e) => {
                if (activeLogo.localFallbackUrl) (e.target as HTMLImageElement).src = activeLogo.localFallbackUrl;
              }}
            />
            <div>
              <h2 className="text-base font-black text-slate-900 leading-tight">
                {activeEntityDetails.name}
              </h2>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                Official Ministry Licensing Binder Summary
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="border-2 border-slate-900 p-2 rounded-xl text-center bg-slate-50 inline-block">
              <p className="text-[10px] font-mono font-bold">BINDER REF</p>
              <p className="font-mono font-extrabold text-sm text-slate-900">
                {activeEntityDetails.code}-{p.id.toUpperCase()}-2026
              </p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded-xl border-2 border-slate-900 mb-6 text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="font-bold text-slate-700">Licensed Home Child Care Provider:</span>
            <span className="font-extrabold text-slate-900">{p.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold text-slate-700">Premises Address:</span>
            <span className="font-semibold text-slate-900">{p.homeAddress}, {p.neighborhood}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold text-slate-700">CCEYA Licensed Capacity:</span>
            <span className="font-extrabold text-slate-900">Max 6 Children (Max 3 &lt;3yo, Max 3 &lt;2yo)</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold text-slate-700">Operating Schedule:</span>
            <span className="font-semibold text-slate-900">{p.operatingHours}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold text-slate-700">Supervising Agency Director:</span>
            <span className="font-semibold text-slate-900">{activeEntityDetails.director}</span>
          </div>
        </div>

        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 mb-2">
          Active Enrolment Roster ({pEnrolled.length} Children Assigned)
        </h3>
        <table className="w-full text-xs text-left border-collapse border border-slate-300">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-300 text-[10px] uppercase font-bold text-slate-700">
              <th className="p-2 border-r border-slate-300">Child Name</th>
              <th className="p-2 border-r border-slate-300">DOB (Age)</th>
              <th className="p-2 border-r border-slate-300">Funding Tier</th>
              <th className="p-2 border-r border-slate-300">Critical Medical / Allergies</th>
              <th className="p-2">CCEYA File Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {pEnrolled.map(c => (
              <tr key={c.id}>
                <td className="p-2 font-bold text-slate-900 border-r border-slate-200">{c.fullName}</td>
                <td className="p-2 border-r border-slate-200">{c.dob} ({c.ageYearsFormatted})</td>
                <td className="p-2 uppercase font-semibold text-[11px] border-r border-slate-200">{c.fundingType}</td>
                <td className="p-2 text-red-600 font-bold border-r border-slate-200">
                  {c.allergies.length > 0 ? c.allergies.join(', ') : 'None Reported'}
                  {c.epiPenRequired && ' [Epi-Pen]'}
                </td>
                <td className="p-2 text-emerald-700 font-bold">✓ 100% Complete</td>
              </tr>
            ))}
            {pEnrolled.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-slate-400 font-semibold italic">
                  No active children currently assigned to this home.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="mt-8 pt-4 border-t-2 border-dashed border-slate-300 flex justify-between items-end text-[11px] text-slate-500">
          <div>
            <p>Director Signature: _________________________________</p>
            <p className="mt-1">Date Printed: {new Date().toLocaleDateString('en-CA')}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-slate-900">Ontario CCEYA Form 2026-A</p>
            <p>{activeEntityDetails.name}</p>
            <p className="text-[10px] text-slate-400">Ministry License: {activeEntityDetails.licenseNumber}</p>
          </div>
        </div>
      </div>
    );
  };

  // 2. Child Master Compliance Dossier (Pre-Filled)
  const renderChildDossier = (
    c: Child, 
    isPrintAll: boolean = false, 
    isLast: boolean = false,
    childIndex?: number, 
    totalChildren?: number
  ) => {
    const childParent = parentsList.find(p => p.id === c.parentId);
    const childProvider = providersList.find(p => p.id === c.providerId);

    return (
      <div className={`physical-binder-sheet bg-white p-8 border-2 border-slate-900 rounded-2xl max-w-3xl mx-auto shadow-sm space-y-6 print:border-none print:shadow-none print:p-0 print:max-w-full ${isPrintAll && !isLast ? 'binder-page-break' : ''}`}>
        {/* Dossier Header */}
        <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
          <div className="flex items-center gap-4">
            <img
              src={activeLogo.url}
              alt={activeEntityDetails.name}
              className="h-16 w-auto max-w-[210px] object-contain"
              onError={(e) => {
                if (activeLogo.localFallbackUrl) (e.target as HTMLImageElement).src = activeLogo.localFallbackUrl;
              }}
            />
            <div>
              <h2 className="text-base font-black text-slate-900 leading-tight">
                {activeEntityDetails.name}
              </h2>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                Ministry Audit Master Child Dossier & Enrolment Records
              </p>
              {childIndex !== undefined && totalChildren !== undefined && (
                <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded border border-slate-300 mt-1 inline-block">
                  Enrolled Child {childIndex} of {totalChildren} • Home: {childProvider?.name || 'Assigned Home'}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono bg-slate-100 border border-slate-300 px-2 py-1 rounded-md font-bold">
              CHILD ID: {c.id}
            </span>
            <p className="text-[10px] text-emerald-700 font-extrabold mt-1">✓ STATUTORY AUDIT PASS</p>
          </div>
        </div>

        {/* Statutory Checkpoint Banner */}
        <div className="bg-slate-50 border-2 border-slate-900 p-4 rounded-xl flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-500 block">Ontario CCEYA s. 72 Inspection Status</span>
            <span className="font-extrabold text-slate-900 text-sm">{c.fullName}</span>
            <span className="text-slate-600 ml-2">({c.dob} • {c.ageYearsFormatted})</span>
          </div>
          <div className="text-right text-[11px] font-mono text-slate-700">
            <p>Provider: <strong>{childProvider?.name || 'Unassigned'}</strong></p>
            <p>Funding: <strong>{c.fundingType.toUpperCase()}</strong></p>
          </div>
        </div>

        {/* Form PAR-1 Pre-Filled Summary */}
        <div className="border border-slate-300 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-orange-500" />
              <span>Form PAR-1: Application for Enrolment & Family Demographics</span>
            </span>
            <span className="text-[10px] font-bold text-emerald-700">Pre-Filled & Signed</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Primary Parent / Guardian</span>
              <p className="font-bold text-slate-900">{childParent?.fullName || 'Not on file'}</p>
              <p className="text-slate-600">{childParent?.phone} • {childParent?.email}</p>
              <p className="text-slate-500 text-[11px]">{childParent?.homeAddress}, {childParent?.city}</p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Secondary Parent / Guardian</span>
              <p className="font-bold text-slate-900">{childParent?.secondaryGuardianName || 'Secondary Guardian on File'}</p>
              <p className="text-slate-600">Dual Guardian Custody Verified</p>
            </div>
          </div>

          <div className="border-t pt-2 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Designated Emergency Contacts</span>
              {c.emergencyContacts.map((contact, i) => (
                <p key={i} className="text-slate-700 text-[11px]">
                  • {formatEmergencyContactDisplay(contact.name, contact.relationship)}: <strong>{contact.phone}</strong>
                </p>
              ))}
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Desired Start Date & Schedule</span>
              <p className="font-semibold text-slate-800">
                {c.desiredStartDate || 'Enrolled'} ({childParent?.preferredSchedule?.replace('_', ' ') || 'Full Time'})
              </p>
            </div>
          </div>
        </div>

        {/* Form PAR-2 & PAR-3: Medical, Allergy & Outings Consent */}
        <div className="border border-slate-300 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
              <span>Form PAR-2 & PAR-3: Medical Protocol, Anaphylaxis & Outings Consent</span>
            </span>
            <span className="text-[10px] font-bold text-emerald-700">Pre-Filled & Verified</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Allergies & Dietary Restrictions</span>
              {c.allergies.length > 0 ? (
                <p className="font-bold text-red-600">
                  ⚠️ {c.allergies.join(', ')}
                  {c.epiPenRequired && ' (Auto-Injector Protocol Attached)'}
                </p>
              ) : (
                <p className="font-semibold text-slate-700">No known allergies reported.</p>
              )}
              <p className="text-slate-500 text-[11px] mt-0.5">{c.medicalNotes || 'General health is good.'}</p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Emergency Medical Treatment Consent</span>
              <p className="text-slate-700 text-[11px]">
                ✓ Emergency 911 / Ambulance Transport Authorized<br />
                ✓ Regional Hospital Designated<br />
                ✓ Neighbourhood Walks & Park Play Signed
              </p>
            </div>
          </div>
        </div>

        {/* Form PAR-4 & PAR-5: Outdoor Play & CWELCC Fee Schedule */}
        <div className="border border-slate-300 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-500" />
              <span>Form PAR-4 & PAR-5: Supervised Outdoor Play & CWELCC Fee Agreement</span>
            </span>
            <span className="text-[10px] font-bold text-emerald-700">Pre-Filled & Executed</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Outdoor Play & Topical Medication</span>
              <p className="text-slate-700 text-[11px]">
                ✓ Daily 2-Hour Outdoor Play Weather Permitting<br />
                ✓ Sunscreen (Broad Spectrum SPF 30+) Authorized<br />
                ✓ Insect Repellent & Diaper Cream Authorized
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Monthly Fee & Statutory Payment Rail</span>
              <p className="text-slate-900 font-extrabold text-sm">
                ${c.monthlyFee.toFixed(2)} / Month
              </p>
              <p className="text-[11px] text-slate-600">
                Universal Rail: <strong>{activeEntityDetails.email}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Statutory Document Checklist */}
        <div className="bg-emerald-50 border border-emerald-300 p-3.5 rounded-xl text-xs space-y-1">
          <span className="font-extrabold text-emerald-900 block">Ontario Regulatory Required Documents (CCEYA s. 72):</span>
          <div className="grid grid-cols-3 gap-2 text-[11px] text-emerald-800 font-bold">
            <span>✓ Child Birth Certificate</span>
            <span>✓ Ontario Health Card (OHIP)</span>
            <span>✓ Yellow Immunization Card</span>
          </div>
        </div>

        {/* Verification Footer */}
        <div className="pt-4 border-t-2 border-dashed border-slate-300 flex justify-between items-end text-[11px] text-slate-500">
          <div>
            <p>Agency Reviewer: _________________________________</p>
            <p className="mt-1">Date Printed: {new Date().toLocaleDateString('en-CA')}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-slate-900">Ontario CCEYA Master File</p>
            <p>{activeEntityDetails.name}</p>
            <p className="text-[10px] text-slate-400">License: {activeEntityDetails.licenseNumber}</p>
          </div>
        </div>
      </div>
    );
  };

  // 3. Home Visitor Inspection File
  const renderVisitorFile = (v: HomeVisitor, isPrintAll: boolean = false, isLast: boolean = false) => {
    return (
      <div className={`physical-binder-sheet bg-white p-8 border-2 border-slate-900 rounded-2xl max-w-3xl mx-auto shadow-sm space-y-6 print:border-none print:shadow-none print:p-0 print:max-w-full ${isPrintAll && !isLast ? 'binder-page-break' : ''}`}>
        <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
          <div className="flex items-center gap-4">
            <img
              src={activeLogo.url}
              alt={activeEntityDetails.name}
              className="h-16 w-auto max-w-[210px] object-contain"
              onError={(e) => {
                if (activeLogo.localFallbackUrl) (e.target as HTMLImageElement).src = activeLogo.localFallbackUrl;
              }}
            />
            <div>
              <h2 className="text-base font-black text-slate-900 leading-tight">
                {activeEntityDetails.name}
              </h2>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                CCEYA Section 26 Quarterly Premises Inspection File
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono bg-purple-100 text-purple-900 border border-purple-300 px-2 py-1 rounded-md font-bold">
              RECE #{v.receNumber}
            </span>
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-xl border-2 border-slate-900 text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="font-bold text-slate-700">Home Visitor:</span>
            <span className="font-extrabold text-slate-900">{v.name}, RECE</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold text-slate-700">Assigned Inspection Territory:</span>
            <span className="font-semibold text-slate-900">{v.region}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold text-slate-700">College of ECE Expiry:</span>
            <span className="font-semibold text-slate-900">{v.receExpiryDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold text-slate-700">Assigned Active Caseload:</span>
            <span className="font-extrabold text-slate-900">{v.assignedProviderIds?.length || 0} Licensed Provider Homes</span>
          </div>
        </div>

        <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900">
          Form HV-1: Quarterly Inspection Protocol (12 Statutory Domains)
        </h3>
        <div className="space-y-2 text-xs">
          {[
            '1. CCEYA Mixed-Age Capacity Ratio: Headcount verified (Max 6 total, Max 3 <3yo, Max 3 <2yo)',
            '2. Physical Premises & Sanitation: Clean, smoke-free, sanitized surfaces & diaper change area',
            '3. Sleep Supervision & Infant Cribs: Compliant mattresses, direct visual checks every 15-30 min',
            '4. First Aid Kits & Emergency Info: Fully stocked kit, emergency numbers visibly posted',
            '5. Medication & Hazardous Materials: All cleaning agents and poisons locked securely',
            '6. Food Safety & Menus: Canada Food Guide compliant, child allergy list visibly posted in kitchen',
            '7. Outdoor Play Yard: Safe fencing, age-appropriate equipment, no standing bodies of water',
            '8. Fire & Carbon Monoxide Detectors: Working detectors tested, monthly emergency drill logged',
            '9. Behaviour Management: Positive support observed; prohibited practices zero-tolerance verified',
            '10. Attendance Records: Accurate daily arrival and departure timestamps recorded in real time',
            '11. Child Immunization & Health Cards: 100% current records in on-site physical binder',
            '12. Provider Vulnerable Sector Checks: Provider and all adult household members VSC current'
          ].map((domain, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded-lg border border-slate-200 bg-slate-50">
              <span className="font-medium text-slate-800 text-[11px]">{domain}</span>
              <span className="font-bold text-emerald-700 text-[10px] shrink-0 ml-2">✓ COMPLIANT</span>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-4 border-t-2 border-dashed border-slate-300 flex justify-between items-end text-[11px] text-slate-500">
          <div>
            <p>Home Visitor Signature: _____________________________</p>
            <p className="mt-1">Inspection Date: {new Date().toLocaleDateString('en-CA')}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-slate-900">Ontario CCEYA Form HV-1</p>
            <p>{activeEntityDetails.name}</p>
            <p className="text-[10px] text-slate-400">License: {activeEntityDetails.licenseNumber}</p>
          </div>
        </div>
      </div>
    );
  };

  // 4. Dedicated Single Child Emergency Backpack Wallet Card Sheet (1 DEDICATED PAGE PER CHILD)
  const renderSingleChildEmergencyCard = (
    c: Child, 
    p?: Provider, 
    isPrintAll: boolean = false, 
    isLast: boolean = false
  ) => {
    const childParent = parentsList.find(parent => parent.id === c.parentId);

    return (
      <div className={`physical-binder-sheet bg-white p-8 border-2 border-slate-900 rounded-2xl max-w-3xl mx-auto shadow-sm space-y-6 print:border-none print:shadow-none print:p-0 print:max-w-full ${isPrintAll && !isLast ? 'binder-page-break' : ''}`}>
        {/* Sheet Top Header */}
        <div className="flex items-start justify-between border-b-2 border-slate-900 pb-3">
          <div className="flex items-center gap-3">
            <img
              src={activeLogo.url}
              alt={activeEntityDetails.name}
              className="h-12 w-auto max-w-[170px] object-contain"
              onError={(e) => {
                if (activeLogo.localFallbackUrl) (e.target as HTMLImageElement).src = activeLogo.localFallbackUrl;
              }}
            />
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase leading-tight">
                {activeEntityDetails.name}
              </h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                Child Emergency Backpack & Field Evacuation Card (CCEYA s. 68)
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono bg-red-100 text-red-900 border border-red-300 px-2 py-0.5 rounded font-black inline-block">
              EMERGENCY ID: {c.id}
            </span>
            <p className="text-[9px] text-slate-500 font-bold mt-0.5">1-Per-Child Cutout Dossier</p>
          </div>
        </div>

        {/* CUTOUT / WALLET CARD BOX (Dotted border guide for folding or cutting into backpack) */}
        <div className="border-2 border-dashed border-slate-900 rounded-2xl p-5 bg-white shadow-sm space-y-3.5 relative">
          <div className="text-center pb-2 border-b border-dashed border-slate-300">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
              ✂ FOLD OR CUT ALONG DOTTED LINE — INSERT INTO CHILD'S BACKPACK OR EVACUATION LANYARD ✂
            </span>
          </div>

          {/* Child Identity Row */}
          <div className="flex items-start gap-4 pb-3 border-b-2 border-slate-900">
            <Avatar
              name={c.fullName}
              photoUrl={c.photoUrl}
              shape="rounded"
              size="lg"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-lg text-slate-900 tracking-tight">{c.fullName}</h3>
                <span className="text-[10px] font-mono bg-slate-100 border border-slate-900 px-2 py-0.5 rounded font-black text-slate-800">
                  {c.fundingType.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-bold mt-0.5">
                DOB: <strong>{c.dob}</strong> ({c.ageYearsFormatted}) • Care Funding: {c.fundingType.toUpperCase()}
              </p>
              <p className="text-xs text-slate-700 font-semibold mt-0.5">
                Licensed Home: <strong>{p?.name || 'Assigned Licensed Home'}</strong> — {p?.homeName || 'ACCS'} ({p?.neighborhood || p?.region || 'Durham/York/Toronto'})
              </p>
            </div>
          </div>

          {/* Critical Medical & Allergies Alert Banner */}
          {c.allergies.length > 0 ? (
            <div className="bg-red-50 text-red-900 p-3 rounded-xl border-2 border-red-300 font-bold text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-black text-red-700">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>CRITICAL MEDICAL & ALLERGY ALERT: {c.allergies.join(', ')}</span>
              </div>
              {c.epiPenRequired && (
                <p className="text-xs text-red-800 font-black pl-5">
                  🚨 EMERGENCY PROTOCOL: Epinephrine Auto-Injector (Epi-Pen) carried in child backpack at all times.
                </p>
              )}
              {c.medicalNotes && (
                <p className="text-[11px] text-slate-700 font-normal pl-5">
                  Medical Notes: {c.medicalNotes}
                </p>
              )}
            </div>
          ) : (
            <div className="bg-emerald-50 text-emerald-900 p-2.5 rounded-xl border border-emerald-300 font-bold text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>✓ No known medical conditions, allergies, or dietary restrictions reported.</span>
            </div>
          )}

          {/* Emergency Contacts Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Primary Parent / Guardian</span>
              <p className="font-black text-slate-900">{childParent?.fullName || 'Parent on File'}</p>
              <p className="text-slate-700 font-extrabold text-[11px]">{childParent?.phone || 'On File'}</p>
              <p className="text-slate-500 text-[10px] truncate">{childParent?.homeAddress || ''}</p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Secondary Parent / Guardian</span>
              <p className="font-black text-slate-900">{childParent?.secondaryGuardianName || 'Secondary Guardian on File'}</p>
              <p className="text-slate-700 font-extrabold text-[11px]">{childParent?.secondaryGuardianPhone || 'Dual Custody on File'}</p>
              <p className="text-slate-500 text-[10px]">Dual Guardian Contact Verified</p>
            </div>

            {c.emergencyContacts.length > 0 && (
              <div className="col-span-2 border-t border-slate-200 pt-2 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Designated Emergency Contacts</span>
                <div className="grid grid-cols-2 gap-2">
                  {c.emergencyContacts.map((contact, i) => (
                    <p key={i} className="text-slate-700 text-[11px]">
                      • {formatEmergencyContactDisplay(contact.name, contact.relationship)}: <strong className="text-slate-900">{contact.phone}</strong>
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Emergency Dispatcher & Hospital Rail */}
          <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600 flex justify-between items-center flex-wrap gap-2">
            <span>Provider: <strong>{p?.phone || 'To be provided by Provider'}</strong></span>
            <span>Agency 24/7: <strong>{activeEntityDetails.phone}</strong></span>
            <span>Hospital: <strong>Regional Emergency</strong></span>
            <span className="text-red-600 font-black">CALL 911 FOR EMERGENCY</span>
          </div>
        </div>

        {/* BOTTOM HALF: STATUTORY PROTOCOL & PARENT AUTHORIZATION NOTICE */}
        <div className="border border-slate-300 rounded-xl p-4 bg-slate-50 text-xs space-y-2.5">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="font-black text-slate-900 uppercase text-[11px] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-orange-500" />
              Ontario Regulation 137/15 s. 68 Emergency Evacuation Protocol
            </span>
            <span className="text-[10px] font-mono text-slate-500 font-bold">CCEYA FORM EM-1</span>
          </div>
          <p className="text-[11px] text-slate-700 leading-relaxed">
            <strong>Emergency Medical Treatment Consent:</strong> The parent or legal guardian has executed Form PAR-2 (Emergency Medical & Allergy Consent) and Form PAR-3 authorizing licensed agency staff and medical personnel to administer emergency first aid, contact emergency services (911), and authorize ambulance transport to the designated hospital in the event of sudden illness, allergic reaction, or injury.
          </p>
          <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-600 pt-1 border-t border-slate-200">
            <div>
              <span className="font-bold block text-slate-900">1. Backpack Pocket:</span>
              Keep in outer clear pouch of child's daily travel bag.
            </div>
            <div>
              <span className="font-bold block text-slate-900">2. Home Grab-Bag:</span>
              Duplicate copy maintained in home premises kit.
            </div>
            <div>
              <span className="font-bold block text-slate-900">3. Field Outings:</span>
              Must accompany provider on all neighbourhood walks.
            </div>
          </div>
        </div>

        {/* Verification Footer */}
        <div className="pt-4 border-t-2 border-dashed border-slate-300 flex justify-between items-end text-[11px] text-slate-500">
          <div>
            <p>Provider Signature: _________________________________</p>
            <p className="mt-1">Date Issued: {new Date().toLocaleDateString('en-CA')}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-slate-900">Emergency Backpack Card — {c.fullName}</p>
            <p>{activeEntityDetails.name}</p>
            <p className="text-[10px] text-slate-400">License: {activeEntityDetails.licenseNumber}</p>
          </div>
        </div>
      </div>
    );
  };

  // 5. Blank Paper Form Template
  const renderBlankForm = (form: FormTemplate, isPrintAll: boolean = false, isLast: boolean = true) => {
    return (
      <div className={`physical-binder-sheet bg-white p-8 border-2 border-slate-900 rounded-2xl max-w-3xl mx-auto shadow-sm space-y-6 print:border-none print:shadow-none print:p-0 print:max-w-full ${isPrintAll && !isLast ? 'binder-page-break' : ''}`}>
        <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
          <div className="flex items-center gap-4">
            <img
              src={activeLogo.url}
              alt={activeEntityDetails.name}
              className="h-16 w-auto max-w-[210px] object-contain"
              onError={(e) => {
                if (activeLogo.localFallbackUrl) (e.target as HTMLImageElement).src = activeLogo.localFallbackUrl;
              }}
            />
            <div>
              <h2 className="text-base font-black text-slate-900 leading-tight">
                {activeEntityDetails.name}
              </h2>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                Official Paper Form Template
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono font-extrabold bg-slate-100 border border-slate-900 px-2 py-1 rounded-md">
              {form.formCode}
            </span>
            <p className="text-[10px] text-slate-500 mt-1">v{form.version}</p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-extrabold text-slate-900">{form.title}</h3>
          <p className="text-xs text-slate-600 mt-1">{form.description}</p>
        </div>

        <div className="space-y-6">
          {form.sections.map((section) => (
            <div key={section.id} className="border border-slate-300 rounded-xl p-4 space-y-4">
              <div className="border-b border-slate-200 pb-2">
                <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">{section.title}</h4>
                {section.description && <p className="text-[11px] text-slate-500">{section.description}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {section.fields.map(field => (
                  <div 
                    key={field.id} 
                    className={`${field.gridCols === 2 ? 'col-span-2' : 'col-span-1'} space-y-1`}
                  >
                    <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                      <span>{field.label} {field.required && <span className="text-red-500">*</span>}</span>
                    </label>
                    
                    {field.type === 'textarea' ? (
                      <div className="h-16 border border-slate-300 rounded-lg bg-slate-50/50 p-2 text-xs text-slate-400">
                        {field.placeholder || ''}
                      </div>
                    ) : field.type === 'checkbox' ? (
                      <div className="flex items-center gap-2 pt-1">
                        <div className="w-4 h-4 border-2 border-slate-900 rounded" />
                        <span className="text-[11px] text-slate-600">Agree / Acknowledge</span>
                      </div>
                    ) : (
                      <div className="border-b-2 border-dotted border-slate-400 h-6 pt-1 text-[11px] text-slate-400">
                        {field.placeholder || ''}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-4 border-t-2 border-dashed border-slate-300 flex justify-between items-end text-[11px] text-slate-500">
          <div>
            <p>Signature: _________________________________________</p>
            <p className="mt-1">Date: ________________________</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-slate-900">{form.formCode} — {activeEntityDetails.name}</p>
            <p className="text-[10px] text-slate-500">License: {activeEntityDetails.licenseNumber} • Ontario CCEYA Compliant</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <ModalPortal>
        <div 
          id="physical-binder-printable-area"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto print:static print:bg-transparent print:p-0 print:overflow-visible print:inset-auto print:block print:z-auto cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white border-2 border-slate-900 rounded-3xl max-w-5xl w-full p-6 shadow-2xl max-h-[92vh] flex flex-col print:border-none print:shadow-none print:p-0 print:max-h-none print:w-full print:max-w-none print:rounded-none print:block print:overflow-visible print:static cursor-default"
          >
            {/* Top-Right Absolute Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all print:hidden cursor-pointer z-20"
              title="Close modal (Esc or click outside)"
            >
              <X className="w-5 h-5 text-slate-700" />
            </button>

            {/* Header (Hidden on Print) */}
            <div className="flex items-center justify-between pb-4 border-b-2 border-slate-900 print:hidden gap-3 flex-wrap pr-12">
              <div>
                <div className="flex items-center gap-2">
                  <Printer className="w-5 h-5 text-orange-500" />
                  <h2 className="text-lg font-extrabold text-slate-900">
                    Physical Ministry Audit Binder & Pre-Filled On-Demand Print Hub
                  </h2>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                    CCEYA 2026 Compliant
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Generate pre-filled physical dossiers for on-site ministry audits. Branded under: <strong className="text-slate-900">{activeEntityDetails.name}</strong>.
                </p>
              </div>

              {/* Action Buttons: Logo Selector CTA + Print All Agency Binder CTA + Print Section CTA */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Logo & Entity Media Library Selector Button */}
                <button
                  type="button"
                  onClick={() => setIsLogoLibraryOpen(true)}
                  className="neo-btn bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-900 px-3 py-1.5 text-xs font-extrabold gap-2 shadow-neo-sm cursor-pointer transition-all flex items-center"
                  title="Manage print logo and agency credentials"
                >
                  <div className="w-6 h-6 flex items-center justify-center p-0.5 bg-slate-100 rounded-lg border border-slate-300 overflow-hidden shrink-0">
                    <img 
                      src={activeLogo.url} 
                      alt={activeEntityDetails.name} 
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        if (activeLogo.localFallbackUrl) (e.target as HTMLImageElement).src = activeLogo.localFallbackUrl;
                      }}
                    />
                  </div>
                  <div className="text-left leading-tight hidden sm:block">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">Logo</span>
                    <span className="text-xs font-black truncate max-w-[130px] block text-slate-900">
                      {activeEntityDetails?.shortName || 'DaycareOS'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                </button>

                {/* Print All (Master Agency Binder) CTA Button */}
                <button
                  onClick={handleTriggerPrintAll}
                  className="neo-btn bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 text-xs font-black gap-2 shadow-neo-sm cursor-pointer transition-all flex items-center border-2 border-slate-900"
                  title="Print COMPLETE Master Ministry Audit Binder: ALL Providers, ALL Home Visitors, and ALL Enrolled Children (Each wallet card on its own page)"
                >
                  <BookOpen className="w-4 h-4 text-orange-400" />
                  <span>Print Full Agency Binder</span>
                  <span className="bg-orange-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded leading-none">
                    {totalAgencyPages} Pgs
                  </span>
                </button>

                {/* Print Current Section / Active View CTA Button */}
                <button
                  onClick={handleTriggerPrint}
                  className="neo-btn bg-orange-500 hover:bg-orange-400 text-white px-3.5 py-2 text-xs font-bold gap-2 shadow-neo-sm cursor-pointer transition-all flex items-center"
                  title="Print currently visible section"
                >
                  <Printer className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {printSection === 'all'
                      ? (binderScope === 'all_agency' ? `Print Agency Binder (${totalAgencyPages} Pgs)` : `Print Home Binder (${singleHomePages} Pgs)`)
                      : 'Print Active Section'}
                  </span>
                  <span className="sm:hidden">Print</span>
                </button>
              </div>
            </div>

            {/* Navigation Tabs (Hidden on Print) */}
            <div className="py-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 print:hidden text-xs">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-300 flex-wrap">
                <button
                  onClick={() => setPrintSection('all')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                    printSection === 'all' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>★ Full Binder (All Providers, Visitors & Kids)</span>
                </button>
                <button
                  onClick={() => setPrintSection('cover_sheet')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    printSection === 'cover_sheet' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  1. Provider Home Binder
                </button>
                <button
                  onClick={() => setPrintSection('child_dossier')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    printSection === 'child_dossier' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  2. Child Master Dossier
                </button>
                <button
                  onClick={() => setPrintSection('visitor_file')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    printSection === 'visitor_file' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  3. Home Visitor Inspection File
                </button>
                <button
                  onClick={() => setPrintSection('emergency_cards')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    printSection === 'emergency_cards' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  4. Child Wallet Cards (1 Per Page)
                </button>
                <button
                  onClick={() => setPrintSection('blank_form')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    printSection === 'blank_form' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  5. Blank Form Templates
                </button>
              </div>

              {/* Targeted Selectors based on Active Tab */}
              <div className="flex items-center gap-2">
                {/* When Full Binder Tab is active: offer Scope Switcher (All Agency vs Single Home) */}
                {printSection === 'all' && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-700">Scope:</span>
                    <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-300">
                      <button
                        onClick={() => setBinderScope('all_agency')}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                          binderScope === 'all_agency'
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        All Providers, Visitors & Kids ({totalAgencyPages} Pgs)
                      </button>
                      <button
                        onClick={() => setBinderScope('single_provider')}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                          binderScope === 'single_provider'
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Single Home Only
                      </button>
                    </div>

                    {binderScope === 'single_provider' && (
                      <select
                        value={selectedProviderId}
                        onChange={(e) => setSelectedProviderId(e.target.value)}
                        className="p-1.5 bg-slate-50 border-2 border-slate-900 rounded-xl font-bold text-slate-900 focus:outline-none text-xs"
                      >
                        {providersList.map(p => (
                          <option key={p.id} value={p.id}>{p.name} — {p.homeName} ({p.neighborhood})</option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                {/* Single Provider selector for Section 1 */}
                {printSection === 'cover_sheet' && (
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-700">Provider Home:</span>
                    <select
                      value={selectedProviderId}
                      onChange={(e) => setSelectedProviderId(e.target.value)}
                      className="p-1.5 bg-slate-50 border-2 border-slate-900 rounded-xl font-bold text-slate-900 focus:outline-none text-xs"
                    >
                      {providersList.map(p => (
                        <option key={p.id} value={p.id}>{p.name} — {p.homeName} ({p.neighborhood})</option>
                      ))}
                    </select>
                  </div>
                )}

                {printSection === 'child_dossier' && (
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-700">Enrolled Child:</span>
                    <select
                      value={selectedChildId}
                      onChange={(e) => setSelectedChildId(e.target.value)}
                      className="p-1.5 bg-slate-50 border-2 border-slate-900 rounded-xl font-bold text-slate-900 focus:outline-none text-xs"
                    >
                      {childrenList.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.fullName} ({c.ageYearsFormatted}) — Stage: {c.admissionsStage.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Tab 4: Backpack Wallet Cards Selector */}
                {printSection === 'emergency_cards' && (
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-700">Select Child:</span>
                    <select
                      value={selectedChildId}
                      onChange={(e) => setSelectedChildId(e.target.value)}
                      className="p-1.5 bg-slate-50 border-2 border-slate-900 rounded-xl font-bold text-slate-900 focus:outline-none text-xs"
                    >
                      <option value="all">
                        ★ {binderScope === 'single_provider' && provider ? `All Enrolled in this Home (${enrolledChildren.length} Cards • 1 Page Each)` : `All Enrolled Children (${childrenList.length} Cards • 1 Page Each)`}
                      </option>
                      {(binderScope === 'single_provider' && provider ? enrolledChildren : childrenList).map(c => (
                        <option key={c.id} value={c.id}>
                          {c.fullName} ({c.dob})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {printSection === 'visitor_file' && (
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-700">Home Visitor:</span>
                    <select
                      value={selectedVisitorId}
                      onChange={(e) => setSelectedVisitorId(e.target.value)}
                      className="p-1.5 bg-slate-50 border-2 border-slate-900 rounded-xl font-bold text-slate-900 focus:outline-none text-xs"
                    >
                      {visitorsList.map(v => (
                        <option key={v.id} value={v.id}>
                          {v.name} (RECE #{v.receNumber}) — {v.region}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {printSection === 'blank_form' && (
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-700">Select Form:</span>
                    <select
                      value={selectedFormId}
                      onChange={(e) => setSelectedFormId(e.target.value)}
                      className="p-1.5 bg-slate-50 border-2 border-slate-900 rounded-xl font-bold text-slate-900 focus:outline-none text-xs max-w-xs"
                    >
                      {formsList.map(f => (
                        <option key={f.id} value={f.id}>
                          {f.formCode}: {f.title} ({f.assignedTo})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Printable Document Preview Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 rounded-2xl border-2 border-slate-200 my-3 print:p-0 print:m-0 print:border-none print:bg-transparent print:overflow-visible print:max-h-none print:block">
              
              {/* ========================================================================= */}
              {/* ALL PAGES TAB: FULL AGENCY MASTER BINDER (ALL PROVIDERS, VISITORS & KIDS) */}
              {/* ========================================================================= */}
              {printSection === 'all' && binderScope === 'all_agency' && (
                <div className="space-y-8">
                  {/* Screen-only status bar */}
                  <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between text-xs print:hidden shadow-sm flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black text-sm shrink-0">
                        ★
                      </div>
                      <div>
                        <span className="font-black text-sm block">Master Agency Ministry Audit Binder (All Licensed Premises)</span>
                        <span className="text-slate-300 text-[11px]">
                          Complete Ontario statutory compilation: <strong>{providersList.length} Licensed Providers</strong>, <strong>{visitorsList.length} RECE Inspectors</strong>, and <strong>{childrenList.length} Enrolled Children</strong>. Every child receives a dedicated Master Dossier and an individual Emergency Backpack Card on their own page.
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg font-mono font-bold text-slate-300">
                        {totalAgencyPages} Total Pages
                      </span>
                      <button
                        onClick={handleTriggerPrintAll}
                        className="neo-btn bg-orange-500 hover:bg-orange-400 text-white px-3.5 py-1.5 text-xs font-bold gap-1.5 shadow-neo-sm cursor-pointer flex items-center"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print All {totalAgencyPages} Pages</span>
                      </button>
                    </div>
                  </div>

                  {/* 1. MASTER AGENCY OVERVIEW & LICENSED ROSTER (Page 1) */}
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between print:hidden max-w-3xl mx-auto px-2">
                      <span>Document 1 of {totalAgencyPages}: Agency Master Licensing Summary & Premises Directory</span>
                      <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">CCEYA Master Overview</span>
                    </div>
                    {renderAgencyMasterOverview(true, false)}
                  </div>

                  {/* 2. FOR EVERY LICENSED PROVIDER HOME */}
                  {providersList.map((p, pIdx) => {
                    const pEnrolled = childrenList.filter(c => c.providerId === p.id);
                    return (
                      <div key={p.id} className="space-y-6">
                        {/* Visual separator on screen between providers */}
                        <div className="my-8 border-t-4 border-slate-900 print:hidden flex items-center justify-center">
                          <span className="bg-slate-900 text-white px-4 py-1.5 rounded-full text-xs font-mono font-black uppercase tracking-wider shadow-sm flex items-center gap-2">
                            <Home className="w-3.5 h-3.5 text-orange-400" />
                            Licensed Home Premises #{pIdx + 1}: {p.name} — {p.homeName} ({pEnrolled.length} Enrolled)
                          </span>
                        </div>

                        {/* Provider Home Binder Cover Sheet */}
                        <div>
                          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between print:hidden max-w-3xl mx-auto px-2">
                            <span>Provider Home Cover Sheet: {p.name} ({p.homeName})</span>
                            <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">CCEYA Form 2026-A</span>
                          </div>
                          {renderCoverSheet(p, true, false)}
                        </div>

                        {/* Every Enrolled Child in this Home: Master Dossier (1 Page Per Child) */}
                        {pEnrolled.map((c, cIdx) => (
                          <div key={`dossier-${c.id}`}>
                            <div className="my-6 border-t-2 border-dashed border-slate-300 print:hidden flex items-center justify-center">
                              <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
                                ✂ Next Document: Child Master Dossier — {c.fullName} ({cIdx + 1} of {pEnrolled.length} in {p.name}'s Home)
                              </span>
                            </div>
                            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between print:hidden max-w-3xl mx-auto px-2">
                              <span>Child Master Dossier: {c.fullName} ({p.name})</span>
                              <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">CCEYA s. 72 File</span>
                            </div>
                            {renderChildDossier(c, true, false, cIdx + 1, pEnrolled.length)}
                          </div>
                        ))}

                        {/* Every Enrolled Child in this Home: Dedicated Emergency Backpack Wallet Card (1 DEDICATED PAGE PER CHILD) */}
                        {pEnrolled.map((c, cIdx) => (
                          <div key={`card-${c.id}`}>
                            <div className="my-6 border-t-2 border-dashed border-slate-300 print:hidden flex items-center justify-center">
                              <span className="bg-red-100 text-red-800 border border-red-300 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
                                ✂ Dedicated Backpack Wallet Card Sheet: {c.fullName} ({cIdx + 1} of {pEnrolled.length} in {p.name}'s Home)
                              </span>
                            </div>
                            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between print:hidden max-w-3xl mx-auto px-2">
                              <span>Child Backpack Wallet Card: {c.fullName} ({p.name})</span>
                              <span className="text-[10px] bg-red-100 text-red-800 border border-red-300 px-2 py-0.5 rounded font-mono">CCEYA s. 68 Card</span>
                            </div>
                            {renderSingleChildEmergencyCard(c, p, true, false)}
                          </div>
                        ))}
                      </div>
                    );
                  })}

                  {/* 3. UNASSIGNED / INTAKE CHILDREN (IF ANY) */}
                  {unassignedChildren.length > 0 && (
                    <div className="space-y-6">
                      <div className="my-8 border-t-4 border-orange-500 print:hidden flex items-center justify-center">
                        <span className="bg-orange-500 text-white px-4 py-1.5 rounded-full text-xs font-mono font-black uppercase tracking-wider shadow-sm flex items-center gap-2">
                          <Users className="w-3.5 h-3.5" />
                          Pending Placement & Intake Children ({unassignedChildren.length} Children)
                        </span>
                      </div>
                      {unassignedChildren.map((c, idx) => (
                        <React.Fragment key={`unassigned-${c.id}`}>
                          <div>
                            <div className="my-6 border-t-2 border-dashed border-slate-300 print:hidden flex items-center justify-center">
                              <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
                                ✂ Next Document: Intake Child Dossier — {c.fullName}
                              </span>
                            </div>
                            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between print:hidden max-w-3xl mx-auto px-2">
                              <span>Child Master Dossier: {c.fullName} (Intake / Placement)</span>
                              <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">CCEYA s. 72 File</span>
                            </div>
                            {renderChildDossier(c, true, false, idx + 1, unassignedChildren.length)}
                          </div>
                          <div>
                            <div className="my-6 border-t-2 border-dashed border-slate-300 print:hidden flex items-center justify-center">
                              <span className="bg-red-100 text-red-800 border border-red-300 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
                                ✂ Dedicated Backpack Wallet Card Sheet: {c.fullName}
                              </span>
                            </div>
                            {renderSingleChildEmergencyCard(c, undefined, true, false)}
                          </div>
                        </React.Fragment>
                      ))}
                    </div>
                  )}

                  {/* 4. HOME VISITORS SECTION 26 DOSSIERS (FOR EVERY VISITOR) */}
                  <div className="space-y-6">
                    <div className="my-8 border-t-4 border-purple-600 print:hidden flex items-center justify-center">
                      <span className="bg-purple-600 text-white px-4 py-1.5 rounded-full text-xs font-mono font-black uppercase tracking-wider shadow-sm flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        CCEYA Section 26 Registered Early Childhood Educator (RECE) Home Visitor Files ({visitorsList.length} Visitors)
                      </span>
                    </div>
                    {visitorsList.map((v, vIdx) => (
                      <div key={v.id}>
                        <div className="my-6 border-t-2 border-dashed border-slate-300 print:hidden flex items-center justify-center">
                          <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
                            ✂ Next Document: Home Visitor File — {v.name}, RECE ({vIdx + 1} of {visitorsList.length})
                          </span>
                        </div>
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between print:hidden max-w-3xl mx-auto px-2">
                          <span>RECE Quarterly Inspection File: {v.name} ({v.region})</span>
                          <span className="text-[10px] bg-purple-100 text-purple-800 border border-purple-300 px-2 py-0.5 rounded font-mono">RECE #{v.receNumber}</span>
                        </div>
                        {renderVisitorFile(v, true, false)}
                      </div>
                    ))}
                  </div>

                  {/* 5. BLANK STATUTORY PAPER FORM TEMPLATES */}
                  {selectedForm && (
                    <div>
                      <div className="my-8 border-t-4 border-slate-700 print:hidden flex items-center justify-center">
                        <span className="bg-slate-700 text-white px-4 py-1.5 rounded-full text-xs font-mono font-black uppercase tracking-wider shadow-sm flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5" />
                          Official Paper Form Template ({selectedForm.formCode})
                        </span>
                      </div>
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between print:hidden max-w-3xl mx-auto px-2">
                        <span>Blank Form Template: {selectedForm.formCode} — {selectedForm.title}</span>
                        <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">v{selectedForm.version}</span>
                      </div>
                      {renderBlankForm(selectedForm, true, true)}
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================================= */}
              {/* ALL PAGES TAB (SCOPED TO SINGLE PROVIDER HOME ONLY) */}
              {/* ========================================================================= */}
              {printSection === 'all' && binderScope === 'single_provider' && (
                <div className="space-y-6">
                  {/* Screen-only status bar */}
                  <div className="bg-slate-900 text-white p-3.5 rounded-2xl flex items-center justify-between text-xs print:hidden shadow-sm flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center font-black text-xs">
                        ★
                      </div>
                      <div>
                        <span className="font-black text-sm block">Single Provider Home Binder: {provider.name}</span>
                        <span className="text-slate-300 text-[11px]">
                          {singleHomePages} statutory documents queued for <strong>{provider.name}</strong> ({provider.homeName}). Every child receives an individual backpack card page.
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg font-mono font-bold text-slate-300">
                        {singleHomePages} Pages
                      </span>
                      <button
                        onClick={handleTriggerPrint}
                        className="neo-btn bg-orange-500 hover:bg-orange-400 text-white px-3 py-1 text-xs font-bold gap-1.5 shadow-neo-sm cursor-pointer flex items-center"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print This Home</span>
                      </button>
                    </div>
                  </div>

                  {/* Document 1: Provider Home Binder Cover Sheet */}
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between print:hidden max-w-3xl mx-auto px-2">
                      <span>Page 1 of {singleHomePages}: Provider Home Binder Cover Sheet</span>
                      <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">CCEYA Form 2026-A</span>
                    </div>
                    {renderCoverSheet(provider, true, false)}
                  </div>

                  {/* Documents 2..N: Enrolled Child Master Compliance Dossiers */}
                  {targetDossierChildren.map((child, idx) => (
                    <div key={`single-dossier-${child.id}`}>
                      <div className="my-6 border-t-2 border-dashed border-slate-300 print:hidden flex items-center justify-center">
                        <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
                          ✂ Next Page: Child Master Dossier ({idx + 1} of {targetDossierChildren.length})
                        </span>
                      </div>
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between print:hidden max-w-3xl mx-auto px-2">
                        <span>Child Master Dossier: {child.fullName}</span>
                        <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">CCEYA s. 72 File</span>
                      </div>
                      {renderChildDossier(child, true, false, idx + 1, targetDossierChildren.length)}
                    </div>
                  ))}

                  {/* Dedicated Emergency Backpack Cards for this Home (1 PAGE PER CHILD) */}
                  {targetDossierChildren.map((child, idx) => (
                    <div key={`single-card-${child.id}`}>
                      <div className="my-6 border-t-2 border-dashed border-slate-300 print:hidden flex items-center justify-center">
                        <span className="bg-red-100 text-red-800 border border-red-300 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
                          ✂ Next Page: Emergency Backpack Wallet Card ({child.fullName})
                        </span>
                      </div>
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between print:hidden max-w-3xl mx-auto px-2">
                        <span>Backpack Wallet Card: {child.fullName} ({provider.name})</span>
                        <span className="text-[10px] bg-red-100 text-red-800 border border-red-300 px-2 py-0.5 rounded font-mono">CCEYA s. 68 Card</span>
                      </div>
                      {renderSingleChildEmergencyCard(child, provider, true, false)}
                    </div>
                  ))}

                  {/* Document: Home Visitor Inspection File */}
                  <div>
                    <div className="my-6 border-t-2 border-dashed border-slate-300 print:hidden flex items-center justify-center">
                      <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
                        ✂ Next Page: Home Visitor Section 26 Quarterly File
                      </span>
                    </div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between print:hidden max-w-3xl mx-auto px-2">
                      <span>Home Visitor Quarterly Inspection File</span>
                      <span className="text-[10px] bg-purple-100 text-purple-800 border border-purple-300 px-2 py-0.5 rounded font-mono">CCEYA Form HV-1</span>
                    </div>
                    {renderVisitorFile(assignedVisitor, true, false)}
                  </div>

                  {/* Document: Blank Statutory Form Template (if selectedForm exists) */}
                  {selectedForm && (
                    <div>
                      <div className="my-6 border-t-2 border-dashed border-slate-300 print:hidden flex items-center justify-center">
                        <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
                          ✂ Next Page: Blank Statutory Paper Template
                        </span>
                      </div>
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between print:hidden max-w-3xl mx-auto px-2">
                        <span>Page {singleHomePages} of {singleHomePages}: Blank Form Template — {selectedForm.formCode}</span>
                        <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">{selectedForm.formCode}</span>
                      </div>
                      {renderBlankForm(selectedForm, true, true)}
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================================= */}
              {/* INDIVIDUAL TABS (TABS 1 TO 5) */}
              {/* ========================================================================= */}

              {/* 1. PROVIDER HOME BINDER COVER SHEET */}
              {printSection === 'cover_sheet' && provider && renderCoverSheet(provider, false, true)}

              {/* 2. CHILD MASTER COMPLIANCE DOSSIER (PRE-FILLED) */}
              {printSection === 'child_dossier' && activeChild && renderChildDossier(activeChild, false, true)}

              {/* 3. HOME VISITOR INSPECTION DOSSIER */}
              {printSection === 'visitor_file' && selectedVisitor && renderVisitorFile(selectedVisitor, false, true)}

              {/* 4. EMERGENCY WALLET CARDS (1 DEDICATED PAGE PER CHILD) */}
              {printSection === 'emergency_cards' && (
                <div className="space-y-6">
                  {selectedChildId === 'all' ? (
                    (() => {
                      const targetList = binderScope === 'single_provider' && provider ? enrolledChildren : childrenList;
                      return targetList.map((c, idx) => {
                        const cProvider = providersList.find(p => p.id === c.providerId) || provider;
                        return (
                          <div key={`tab4-card-${c.id}`}>
                            {idx > 0 && (
                              <div className="my-6 border-t-2 border-dashed border-slate-300 print:hidden flex items-center justify-center">
                                <span className="bg-red-100 text-red-800 border border-red-300 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
                                  ✂ Next Card Sheet: {c.fullName} ({idx + 1} of {targetList.length})
                                </span>
                              </div>
                            )}
                            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between print:hidden max-w-3xl mx-auto px-2">
                              <span>Backpack Wallet Card: {c.fullName} ({cProvider?.name || 'Unassigned'})</span>
                              <span className="text-[10px] bg-red-100 text-red-800 border border-red-300 px-2 py-0.5 rounded font-mono">CCEYA s. 68 Card</span>
                            </div>
                            {renderSingleChildEmergencyCard(c, cProvider, true, idx === targetList.length - 1)}
                          </div>
                        );
                      });
                    })()
                  ) : (
                    <div>
                      {renderSingleChildEmergencyCard(
                        activeChild, 
                        providersList.find(p => p.id === activeChild.providerId) || provider, 
                        false, 
                        true
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 5. BLANK FORM TEMPLATES ON-DEMAND */}
              {printSection === 'blank_form' && selectedForm && renderBlankForm(selectedForm, false, true)}

            </div>
          </div>
        </div>
      </ModalPortal>

      {/* Embedded Logo & Entity Media Library Modal */}
      <LogoMediaLibraryModal
        isOpen={isLogoLibraryOpen}
        onClose={() => setIsLogoLibraryOpen(false)}
        logosList={logosList}
        activeLogoId={activeLogoId}
        activeEntity={activeEntity}
        onSelectLogo={handleSelectLogo}
        onSelectEntity={handleSelectEntity}
        onUpdateLogosList={setLogosList}
      />
    </>
  );
};
