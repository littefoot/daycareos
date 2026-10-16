import React, { useState } from 'react';
import { ParentGuardian, Child, Provider, AdmissionsStage } from '../../types';
import { ModalPortal } from '../common/ModalPortal';
import { calculateMonthlyFee, loadAgencySettings } from '../../data/agencySettingsData';
import { AccsDatePicker } from '../common/AccsDatePicker';
import { Avatar } from '../common/Avatar';
import { GatedNotesModal } from '../common/notes/GatedNotesModal';
import { sendParentPortalEmail } from '../../services/resendService';
import { 
  Users, 
  Baby, 
  Search, 
  Filter, 
  Copy, 
  Check, 
  ExternalLink, 
  Mail, 
  Phone, 
  MapPin, 
  DollarSign, 
  ShieldCheck, 
  Clock, 
  Calendar,
  AlertTriangle,
  ChevronRight,
  FileText,
  Edit3,
  Trash2,
  Plus,
  X,
  Sparkles,
  Archive,
  ArchiveRestore,
  FolderArchive,
  Send,
  FolderDown,
  MessageSquare
} from 'lucide-react';

interface FamilyDirectoryProps {
  parentsList: ParentGuardian[];
  childrenList: Child[];
  providersList: Provider[];
  onUpdateChildStage: (childId: string, newStage: AdmissionsStage) => void;
  onOpenAddModal: () => void;
  onOpenAddChildModal?: () => void;
  onUpdateFamily?: (updatedParent: ParentGuardian, updatedChildren: Child[]) => void;
  onDeleteFamily?: (parentId: string) => void;
  onArchiveChild?: (childId: string, isArchived: boolean) => void;
  onArchiveFamily?: (parentId: string, isArchived: boolean) => void;
  onOpenDispatchModal?: (childId?: string, templateId?: string) => void;
  onOpenDocumentBin?: () => void;
}

export const FamilyDirectory: React.FC<FamilyDirectoryProps> = ({
  parentsList,
  childrenList,
  providersList,
  onUpdateChildStage,
  onOpenAddModal,
  onOpenAddChildModal,
  onUpdateFamily,
  onDeleteFamily,
  onArchiveChild,
  onArchiveFamily,
  onOpenDispatchModal,
  onOpenDocumentBin
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'family' | 'child'>('child');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [showArchived, setShowArchived] = useState<boolean>(false);
  const [copiedParentId, setCopiedParentId] = useState<string | null>(null);
  const [sendingEmailParentId, setSendingEmailParentId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ title: string; message: string; type: 'success' | 'error' } | null>(null);

  // Edit Family Modal State
  const [editingParent, setEditingParent] = useState<ParentGuardian | null>(null);
  const [editingChildren, setEditingChildren] = useState<Child[]>([]);
  const [saveSuccessBanner, setSaveSuccessBanner] = useState(false);
  const [activeNotesChild, setActiveNotesChild] = useState<Child | null>(null);

  // Archive Counts
  const archivedParentsCount = parentsList.filter(p => p.isArchived).length;
  const archivedChildrenCount = childrenList.filter(c => c.isArchived).length;
  const totalArchivedCount = archivedParentsCount + archivedChildrenCount;

  const handleStartEditFamily = (parent: ParentGuardian) => {
    setEditingParent({ ...parent });
    const famKids = childrenList.filter(c => c.parentId === parent.id);
    setEditingChildren(JSON.parse(JSON.stringify(famKids)));
  };

  const handleUpdateEditingChild = (childId: string, field: keyof Child, value: any) => {
    setEditingChildren(prev => prev.map(c => {
      if (c.id !== childId) return c;
      const updated = { ...c, [field]: value };
      if (field === 'fundingType') {
        updated.monthlyFee = calculateMonthlyFee(value);
      }
      return updated;
    }));
  };

  const handleAddChildToFamily = () => {
    if (!editingParent) return;
    const newKidId = `child-${Date.now()}`;
    const newKid: Child = {
      id: newKidId,
      fullName: 'New Sibling',
      dob: '2024-01-01',
      ageMonths: 24,
      ageYearsFormatted: '2 yrs 0 mos',
      isUnderTwo: false,
      isUnderThree: true,
      fundingType: 'cwelcc',
      monthlyFee: calculateMonthlyFee('cwelcc'),
      eTransferDueDay: 1,
      eTransferStatus: 'pending',
      allergies: [],
      dietaryRestrictions: [],
      medicalNotes: '',
      epiPenRequired: false,
      admissionsStage: 'enrolled',
      parentId: editingParent.id,
      emergencyContacts: [
        { name: editingParent.fullName, relationship: 'Parent', phone: editingParent.phone }
      ],
      documents: []
    };
    setEditingChildren(prev => [...prev, newKid]);
  };

  const handleRemoveChildFromFamily = (childId: string) => {
    setEditingChildren(prev => prev.filter(c => c.id !== childId));
  };

  const handleSaveFamilyChanges = () => {
    if (!editingParent || !onUpdateFamily) return;
    const updatedParent = {
      ...editingParent,
      childIds: editingChildren.map(c => c.id)
    };
    onUpdateFamily(updatedParent, editingChildren);
    setSaveSuccessBanner(true);
    setTimeout(() => {
      setSaveSuccessBanner(false);
      setEditingParent(null);
    }, 1200);
  };

  const handleDeleteFamilyClick = (parentId: string) => {
    if (window.confirm('Are you sure you want to permanently remove this family and all registered children?')) {
      if (onDeleteFamily) {
        onDeleteFamily(parentId);
      }
      setEditingParent(null);
    }
  };

  // Filter Parents
  const filteredParents = parentsList.filter(parent => {
    if (!showArchived && parent.isArchived) return false;

    const matchesSearch = 
      parent.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      parent.phone.includes(searchQuery) ||
      parent.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      childrenList.some(c => c.parentId === parent.id && c.fullName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRegion = selectedRegion === 'all' || parent.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  // Filter Children
  const filteredChildren = childrenList.filter(child => {
    if (!showArchived && child.isArchived) return false;
    const parent = parentsList.find(p => p.id === child.parentId);
    if (!showArchived && parent?.isArchived) return false;

    const matchesSearch = 
      child.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (parent && parent.fullName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRegion = selectedRegion === 'all' || (parent && parent.region === selectedRegion);
    return matchesSearch && matchesRegion;
  });

  const handleCopyParentLink = (parentId: string) => {
    const url = `${window.location.origin}/?role=parent&familyId=${parentId}`;
    navigator.clipboard.writeText(url);
    setCopiedParentId(parentId);
    setTimeout(() => setCopiedParentId(null), 3000);
  };

  const handleSendParentEmail = async (parent: ParentGuardian, child?: Child) => {
    if (!parent.email || !parent.email.includes('@')) {
      setToast({
        title: 'No Email on File',
        message: `Parent ${parent.fullName} does not have a valid email address.`,
        type: 'error'
      });
      setTimeout(() => setToast(null), 4000);
      return;
    }

    setSendingEmailParentId(parent.id);
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const portalUrl = child 
      ? `${origin}/?role=parent&familyId=${parent.id}&childId=${child.id}`
      : `${origin}/?role=parent&familyId=${parent.id}`;

    const famKids = childrenList.filter(c => c.parentId === parent.id);
    const childDisplayName = child?.fullName || (famKids.length > 0 ? famKids.map(k => k.fullName).join(', ') : 'Your Child');

    const res = await sendParentPortalEmail({
      to: parent.email,
      parentName: parent.fullName,
      childName: childDisplayName,
      portalUrl: portalUrl,
      senderName: 'Agency Director'
    });

    setSendingEmailParentId(null);

    if (res.success) {
      setToast({
        title: res.simulated ? 'Portal Link Dispatched (Sandbox Mode)' : 'Magic Link Sent via Resend!',
        message: `Interactive registration portal link dispatched to ${parent.email}`,
        type: 'success'
      });
    } else {
      setToast({
        title: 'Email Dispatch Error',
        message: res.error || 'Failed to dispatch email via Resend',
        type: 'error'
      });
    }
    setTimeout(() => setToast(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header Controls & Search Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border-2 border-slate-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-neo-sm">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-extrabold text-slate-900">Families & Children Directory</h2>
            <span className="text-xs bg-slate-100 text-slate-800 font-bold px-2.5 py-0.5 rounded-full border border-slate-300">
              {filteredParents.length} Families • {filteredChildren.length} Children
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Searchable roster of all household guardian accounts, enrolled siblings, emergency contacts, and admissions stages.
          </p>
        </div>

        {/* View Toggle & Document Bin Action */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto flex-wrap">
          {onOpenDocumentBin && (
            <button
              type="button"
              onClick={onOpenDocumentBin}
              className="neo-btn bg-amber-50 hover:bg-amber-100 text-amber-950 border-2 border-slate-900 px-3 py-1.5 text-xs font-black gap-1.5 shadow-neo-sm cursor-pointer"
              title="Browse and distribute As-Needed Agency Forms & Blank PDF Templates"
            >
              <FolderDown className="w-3.5 h-3.5 text-amber-600" />
              <span>As-Needed Forms Bin</span>
            </button>
          )}

          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-300 text-xs font-bold">
            <button
              onClick={() => setViewMode('child')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'child' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Baby className="w-3.5 h-3.5" />
              <span>By Child ({filteredChildren.length})</span>
            </button>
            <button
              onClick={() => setViewMode('family')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'family' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>By Family ({filteredParents.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by parent, child, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Show Archived Toggle */}
          <button
            type="button"
            onClick={() => setShowArchived(!showArchived)}
            className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
              showArchived
                ? 'bg-amber-100 border-amber-400 text-amber-950 shadow-sm'
                : 'bg-white border-slate-300 text-slate-600 hover:text-slate-900'
            }`}
            title="Toggle visibility of archived families and children (Initially Off)"
          >
            <FolderArchive className="w-4 h-4 text-amber-600" />
            <span>{showArchived ? 'Showing Archived' : 'Show Archived'}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
              showArchived ? 'bg-amber-200 text-amber-900' : 'bg-slate-100 text-slate-600'
            }`}>
              {totalArchivedCount}
            </span>
          </button>

          <span className="font-bold text-slate-600 ml-1">Region:</span>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="bg-white border border-slate-300 rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Municipalities</option>
            <option value="Durham Region">Durham Region (Oshawa, Whitby)</option>
            <option value="York Region">York Region (Markham)</option>
            <option value="Toronto">Toronto / Scarborough</option>
          </select>
        </div>
      </div>

      {/* VIEW 1: BY FAMILY & SIBLINGS */}
      {viewMode === 'family' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredParents.map(parent => {
            const familyChildren = childrenList.filter(c => c.parentId === parent.id && (showArchived || !c.isArchived));
            const totalFees = familyChildren.reduce((acc, c) => acc + (c.isArchived ? 0 : c.monthlyFee), 0);

            return (
              <div
                key={parent.id}
                className={`rounded-2xl border-2 p-5 flex flex-col justify-between gap-4 transition-all ${
                  parent.isArchived 
                    ? 'bg-amber-50/40 border-dashed border-amber-400 opacity-90 shadow-neo-sm' 
                    : 'bg-white border-slate-900 shadow-neo-sm hover:shadow-neo hover:-translate-y-0.5'
                }`}
              >
                <div className="space-y-3">
                  {/* Family Header */}
                  <div className="flex items-start justify-between gap-3 pb-3 border-b-2 border-slate-100">
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={parent.fullName}
                        photoUrl={parent.photoUrl}
                        size="lg"
                        className="rounded-xl border-2 border-slate-900 shadow-2xs shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-extrabold text-slate-900 leading-tight">{parent.fullName}</h3>
                          {parent.isArchived ? (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full border bg-amber-200 text-amber-900 border-amber-400 flex items-center gap-1">
                              <FolderArchive className="w-3 h-3" />
                              <span>Archived</span>
                            </span>
                          ) : (
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                              parent.formZeroApproved 
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-300' 
                                : 'bg-amber-100 text-amber-900 border-amber-300'
                            }`}>
                              {parent.formZeroApproved ? '✓ Screened' : 'Screening Call Pending'}
                            </span>
                          )}
                          <span className="text-[10px] font-black uppercase tracking-wider text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                            {familyChildren.length} {familyChildren.length === 1 ? 'Child' : 'Children'}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-500 mt-0.5">
                          Household Account {parent.secondaryGuardianName ? `• ${parent.fullName} & ${parent.secondaryGuardianName}` : ''}
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{parent.homeAddress || parent.city} ({parent.region})</span>
                        </p>
                      </div>
                    </div>

                    {/* Top-Right Magic Link Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleSendParentEmail(parent)}
                        disabled={sendingEmailParentId === parent.id}
                        className="neo-btn bg-amber-50 hover:bg-amber-100 text-amber-950 text-[10px] font-extrabold px-2.5 py-1.5 rounded-xl border-2 border-slate-900 shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                        title={`Send interactive registration portal link via email to ${parent.email || parent.fullName}`}
                      >
                        <Mail className="w-3.5 h-3.5 text-amber-600" />
                        <span>{sendingEmailParentId === parent.id ? 'Sending...' : 'Email Portal'}</span>
                      </button>

                      <div className="flex items-center bg-orange-50/90 border-2 border-slate-900 rounded-xl p-0.5 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => handleCopyParentLink(parent.id)}
                          className="bg-white hover:bg-orange-100 text-orange-950 text-[10px] font-extrabold px-2.5 py-1 rounded-lg border border-orange-300 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                          title={`Copy direct magic parent portal link for ${parent.fullName}`}
                        >
                          {copiedParentId === parent.id ? (
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
                          href={`/?role=parent&familyId=${parent.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 px-1.5 hover:bg-orange-200 text-orange-800 rounded-lg transition-colors flex items-center gap-0.5 text-[10px] font-bold"
                          title="Open Family Portal in new tab"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Standardized Contact Bar */}
                  <div className="flex flex-wrap items-center gap-3 py-2 px-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                    <a href={`tel:${parent.phone}`} className="flex items-center gap-1.5 hover:text-orange-600 font-medium">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{parent.phone}</span>
                    </a>
                    <a href={`mailto:${parent.email}`} className="flex items-center gap-1.5 hover:text-orange-600 font-medium truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{parent.email}</span>
                    </a>
                    {parent.secondaryGuardianPhone && (
                      <span className="text-slate-500 text-[11px] hidden sm:inline">
                        • 2nd Contact: {parent.secondaryGuardianPhone}
                      </span>
                    )}
                  </div>

                  {/* Children / Sibling Roster */}
                  <div className="mt-2 space-y-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      Enrolled Children & Placement
                    </span>
                    {familyChildren.map(child => {
                      const matchedProv = providersList.find(p => p.id === child.providerId);

                      return (
                        <div
                          key={child.id}
                          className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                            child.isArchived 
                              ? 'bg-amber-100/50 border-amber-300 opacity-80' 
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">
                              {child.fullName.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-extrabold text-slate-900">{child.fullName}</span>
                                {child.isArchived && (
                                  <span className="text-[9px] bg-amber-200 text-amber-900 font-bold px-1.5 py-0.2 rounded border border-amber-400">
                                    Archived
                                  </span>
                                )}
                                <span className="text-[10px] font-mono bg-white px-1.5 py-0.2 rounded border border-slate-200 text-slate-600 font-bold">
                                  {child.ageYearsFormatted}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500">
                                {matchedProv ? `Home: ${matchedProv.name} (${matchedProv.neighborhood})` : 'Awaiting Provider Match'}
                              </p>
                              {/* Dispatched As-Needed Forms Badges */}
                              {(() => {
                                const asNeededDocs = (child.documents || []).filter(d => Boolean(d.formCode) || Boolean(d.downloadUrl));
                                if (asNeededDocs.length === 0) return null;
                                return (
                                  <div className="flex items-center gap-1 mt-1 flex-wrap">
                                    {asNeededDocs.map(d => (
                                      <span
                                        key={d.id}
                                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                                          d.status === 'accepted' ? 'bg-emerald-50 text-emerald-900 border-emerald-300' :
                                          d.status === 'under_review' ? 'bg-amber-50 text-amber-900 border-amber-300' :
                                          'bg-orange-50 text-orange-900 border-orange-300'
                                        }`}
                                        title={`${d.title} - ${d.status.replace('_', ' ')}`}
                                      >
                                        {d.formCode || 'Doc'}: {d.status === 'accepted' ? '✓ Approved' : d.status === 'under_review' ? '⏳ In Audit' : 'Action Req'}
                                      </span>
                                    ))}
                                  </div>
                                );
                              })()}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                              child.isArchived ? 'bg-slate-200 text-slate-700' :
                              child.admissionsStage === 'enrolled' ? 'bg-emerald-100 text-emerald-800' :
                              child.admissionsStage === 'matching' ? 'bg-purple-100 text-purple-800' :
                              child.admissionsStage === 'docs_needed' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {child.isArchived ? 'Archived' : child.admissionsStage.replace('_', ' ')}
                            </span>

                            {/* Gated Notes Button */}
                            <button
                              type="button"
                              onClick={() => setActiveNotesChild(child)}
                              className="p-1 px-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300 rounded font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                              title={`View & add gated notes for ${child.fullName}`}
                            >
                              <MessageSquare className="w-3 h-3 text-blue-600" />
                              <span className="hidden sm:inline">Notes</span>
                            </button>

                            {/* Dispatch As-Needed Form Button */}
                            {onOpenDispatchModal && !child.isArchived && (
                              <button
                                type="button"
                                onClick={() => onOpenDispatchModal(child.id)}
                                className="p-1 px-1.5 bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-300 rounded font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                                title={`Dispatch as-needed form or affidavit to ${child.fullName}`}
                              >
                                <Send className="w-3 h-3 text-orange-600" />
                                <span className="hidden sm:inline">Dispatch Form</span>
                              </button>
                            )}

                            {child.isArchived ? (
                              <button
                                type="button"
                                onClick={() => onArchiveChild && onArchiveChild(child.id, false)}
                                className="px-2 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 rounded font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                                title="Restore child to active roster"
                              >
                                <ArchiveRestore className="w-3 h-3 text-emerald-700" />
                                <span>Restore</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`Archive ${child.fullName}? They will be safely hidden from active rosters and ratio counts.`)) {
                                    if (onArchiveChild) onArchiveChild(child.id, true);
                                  }
                                }}
                                className="text-slate-400 hover:text-amber-700 p-1 rounded hover:bg-slate-200 cursor-pointer"
                                title="Archive child"
                              >
                                <Archive className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Standardized Card Footer */}
                <div className="pt-3 border-t-2 border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="text-slate-600 font-medium">
                    Monthly CWELCC: <strong className="text-slate-900 font-extrabold text-sm">${totalFees.toFixed(2)}</strong>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {parent.isArchived ? (
                      <button
                        type="button"
                        onClick={() => onArchiveFamily && onArchiveFamily(parent.id, false)}
                        className="neo-btn bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300 px-3 py-1.5 text-xs font-bold gap-1.5 cursor-pointer"
                        title="Restore family and all associated children to active roster"
                      >
                        <ArchiveRestore className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Restore Family</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Archive ${parent.fullName}'s family? This will safely hide the family and associated children from active rosters without deleting data.`)) {
                            if (onArchiveFamily) onArchiveFamily(parent.id, true);
                          }
                        }}
                        className="neo-btn bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-900 border-slate-300 hover:border-amber-400 px-2.5 py-1.5 text-xs font-bold gap-1 cursor-pointer"
                        title="Archive entire family record"
                      >
                        <Archive className="w-3.5 h-3.5 text-amber-600" />
                        <span>Archive</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleStartEditFamily(parent)}
                      className="neo-btn bg-orange-50 hover:bg-orange-100 text-orange-900 border-orange-300 px-3 py-1.5 text-xs font-bold gap-1.5 cursor-pointer"
                      title="Edit family & children details"
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
      )}

      {/* VIEW 2: BY INDIVIDUAL CHILD TABLE */}
      {viewMode === 'child' && (
        <div className="bg-white border-2 border-slate-900 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-mono uppercase text-[11px] tracking-wider">
                  <th className="py-3.5 px-4">Child Name</th>
                  <th className="py-3.5 px-4">CCEYA Age Category</th>
                  <th className="py-3.5 px-4">Parent / Guardian</th>
                  <th className="py-3.5 px-4">Funding Program</th>
                  <th className="py-3.5 px-4">Assigned Home</th>
                  <th className="py-3.5 px-4">Admissions Stage</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredChildren.map(child => {
                  const parent = parentsList.find(p => p.id === child.parentId);
                  const matchedProv = providersList.find(p => p.id === child.providerId);

                  return (
                    <tr key={child.id} className={`transition-colors ${child.isArchived ? 'bg-amber-50/50 hover:bg-amber-50' : 'hover:bg-slate-50'}`}>
                      <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">
                          {child.fullName.charAt(0)}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span>{child.fullName}</span>
                          {child.isArchived && (
                            <span className="text-[9px] bg-amber-200 text-amber-900 font-bold px-1.5 py-0.2 rounded border border-amber-400">
                              Archived
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {child.ageYearsFormatted} ({child.isUnderTwo ? '< 2yo' : child.isUnderThree ? '< 3yo' : '3-6yo'})
                      </td>

                      <td className="py-3.5 px-4 text-slate-700">
                        {parent ? parent.fullName : 'Unknown'}
                        {parent?.isArchived && <span className="ml-1 text-[10px] text-amber-700 font-bold">(Archived)</span>}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            child.fundingType === 'cwelcc' ? 'bg-emerald-100 text-emerald-800' :
                            child.fundingType === 'subsidy' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-800'
                          }`}>
                            {child.fundingType.toUpperCase()}
                          </span>
                          {child.fundingType === 'subsidy' && (() => {
                            const quota = child.subsidizedAbsenceQuota ?? 30;
                            const used = child.subsidizedAbsenceDaysUsed ?? 0;
                            const warnThreshold = Math.max(1, quota - 5);
                            return (
                              <span
                                className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded border ${
                                  used >= quota
                                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                                    : used >= warnThreshold
                                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                                    : 'bg-purple-50 text-purple-800 border-purple-200'
                                }`}
                                title={`Annual Subsidized Absence Ledger: ${used} of ${quota} allowable days used (${Math.max(0, quota - used)} remaining)`}
                              >
                                {used}/{quota} Absences
                              </span>
                            );
                          })()}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {matchedProv ? (
                          <span className="font-semibold text-slate-800">
                            {matchedProv.name} <span className="text-slate-500 font-normal text-xs">({matchedProv.region})</span>
                          </span>
                        ) : (
                          <span className="text-amber-600 font-medium">Unassigned</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          value={child.admissionsStage}
                          onChange={(e) => onUpdateChildStage(child.id, e.target.value as AdmissionsStage)}
                          className="bg-slate-50 border border-slate-300 rounded-lg p-1 text-xs font-bold text-slate-800"
                        >
                          <option value="inquiry">1. Inquiry & Screening</option>
                          <option value="docs_needed">2. Forms & Doc Audit</option>
                          <option value="matching">3. Home Matching</option>
                          <option value="contract">4. Final Contract & Fees</option>
                          <option value="enrolled">5. Active Enrolment</option>
                          <option value="waitlisted">Waitlisted</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveNotesChild(child)}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300 rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                            title={`View & add gated notes for ${child.fullName}`}
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                            <span>Notes</span>
                          </button>

                          {onOpenDispatchModal && !child.isArchived && (
                            <button
                              type="button"
                              onClick={() => onOpenDispatchModal(child.id)}
                              className="px-2.5 py-1 bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-300 rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                              title={`Dispatch as-needed form to ${child.fullName}`}
                            >
                              <Send className="w-3.5 h-3.5 text-orange-600" />
                              <span>Dispatch</span>
                            </button>
                          )}

                          {child.isArchived ? (
                            <button
                              type="button"
                              onClick={() => onArchiveChild && onArchiveChild(child.id, false)}
                              className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer"
                              title="Restore child to active roster"
                            >
                              <ArchiveRestore className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Restore</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Archive ${child.fullName}? They will be safely hidden from active rosters and ratio counts.`)) {
                                  if (onArchiveChild) onArchiveChild(child.id, true);
                                }
                              }}
                              className="px-2 py-1 text-slate-500 hover:text-amber-800 hover:bg-amber-50 rounded-lg border border-slate-200 font-bold text-xs flex items-center gap-1 cursor-pointer"
                              title="Archive child"
                            >
                              <Archive className="w-3.5 h-3.5 text-amber-600" />
                              <span>Archive</span>
                            </button>
                          )}

                          {parent && (
                            <button
                              onClick={() => handleStartEditFamily(parent)}
                              className="neo-btn bg-orange-50 hover:bg-orange-100 text-orange-900 border-orange-300 px-2 py-1 text-xs font-bold gap-1 cursor-pointer"
                              title="Edit family record"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-orange-600" />
                              <span>Edit</span>
                            </button>
                          )}
                          {parent && (
                            <button
                              onClick={() => handleSendParentEmail(parent, child)}
                              disabled={sendingEmailParentId === parent.id}
                              className="neo-btn bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 px-2 py-1 text-xs font-bold gap-1 cursor-pointer disabled:opacity-50"
                              title={`Send interactive registration portal link via email to ${parent.email}`}
                            >
                              <Mail className="w-3.5 h-3.5 text-amber-600" />
                              <span>{sendingEmailParentId === parent.id ? 'Sending...' : 'Email'}</span>
                            </button>
                          )}
                          {parent && (
                            <button
                              onClick={() => handleCopyParentLink(parent.id)}
                              className="neo-btn bg-white hover:bg-slate-50 text-slate-800 px-2 py-1 text-xs font-bold gap-1 cursor-pointer"
                              title="Copy magic portal link"
                            >
                              {copiedParentId === parent.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-orange-500" />}
                              <span>{copiedParentId === parent.id ? 'Copied' : 'Link'}</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EDIT FAMILY MODAL */}
      {editingParent && (
        <ModalPortal>
          <div 
            onClick={(e) => {
              if (e.target === e.currentTarget) setEditingParent(null);
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
                    <Edit3 className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Edit Family Record: {editingParent.fullName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Update household legal guardian information, contact methods, and enrolled children.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setEditingParent(null)}
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
                    <span>Family record and child profiles updated & synced to Cloud Firestore!</span>
                  </div>
                )}

            {/* Section 1: Guardian Information */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-orange-500" />
                <span>Guardian / Household Details</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Guardian Full Name *</label>
                  <input
                    type="text"
                    value={editingParent.fullName}
                    onChange={(e) => setEditingParent({ ...editingParent, fullName: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Phone Number *</label>
                  <input
                    type="text"
                    value={editingParent.phone}
                    onChange={(e) => setEditingParent({ ...editingParent, phone: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={editingParent.email}
                    onChange={(e) => setEditingParent({ ...editingParent, email: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Region / Municipality</label>
                  <select
                    value={editingParent.region}
                    onChange={(e: any) => setEditingParent({ ...editingParent, region: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  >
                    <option value="Durham Region">Durham Region (Oshawa, Whitby)</option>
                    <option value="York Region">York Region (Markham, Richmond Hill)</option>
                    <option value="Toronto">Toronto / GTA</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-800 block mb-1">Home Street Address</label>
                  <input
                    type="text"
                    value={editingParent.homeAddress}
                    onChange={(e) => setEditingParent({ ...editingParent, homeAddress: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                    placeholder="e.g. 45 King St E, Oshawa, ON"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Children & Siblings */}
            <div className="space-y-3 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Baby className="w-3.5 h-3.5 text-orange-500" />
                  <span>Children & Sibling Profiles ({editingChildren.length})</span>
                </h4>

                <button
                  type="button"
                  onClick={handleAddChildToFamily}
                  className="px-2.5 py-1 rounded-lg border border-orange-300 bg-orange-50 hover:bg-orange-100 text-orange-900 font-bold text-xs flex items-center gap-1"
                >
                  <Plus className="w-3 h-3 text-orange-600" />
                  <span>Add Sibling</span>
                </button>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {editingChildren.map((kid, idx) => (
                  <div key={kid.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-300 space-y-3 text-xs">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        <span>Child: {kid.fullName}</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => handleRemoveChildFromFamily(kid.id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                        title="Remove child from family"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Legal Full Name</label>
                        <input
                          type="text"
                          value={kid.fullName}
                          onChange={(e) => handleUpdateEditingChild(kid.id, 'fullName', e.target.value)}
                          className="w-full p-1.5 bg-white border border-slate-300 rounded-lg font-medium"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Date of Birth (YYYY-MM-DD)</label>
                        <AccsDatePicker
                          value={kid.dob}
                          onChange={(val) => handleUpdateEditingChild(kid.id, 'dob', val)}
                          mode="birthdate"
                          placeholder="YYYY-MM-DD"
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Funding Program</label>
                        <select
                          value={kid.fundingType}
                          onChange={(e: any) => {
                            const newFunding = e.target.value;
                            let autoFee = calculateMonthlyFee(newFunding);
                            if (newFunding === 'subsidy') {
                              const rate = kid.parentContributionDailyRate ?? 0;
                              const days = kid.anticipatedMonthlyDays ?? 21;
                              autoFee = Math.round(rate * days * 100) / 100;
                            }
                            setEditingChildren(prev => prev.map(c => c.id === kid.id ? {
                              ...c,
                              fundingType: newFunding,
                              monthlyFee: autoFee
                            } : c));
                          }}
                          className="w-full p-1.5 bg-white border border-slate-300 rounded-lg font-medium font-bold"
                        >
                          <option value="cwelcc">CWELCC Program (${calculateMonthlyFee('cwelcc')}/mo)</option>
                          <option value="subsidy">Municipal Subsidy</option>
                          <option value="private">Private Fee (${calculateMonthlyFee('private')}/mo)</option>
                        </select>
                      </div>

                      {kid.fundingType === 'subsidy' ? (
                        <>
                          <div>
                            <label className="font-bold text-slate-700 block mb-1">
                              Parent Contribution ($/day)
                            </label>
                            <input
                              type="number"
                              step="0.25"
                              min="0"
                              placeholder="0.00"
                              value={kid.parentContributionDailyRate ?? 0}
                              onChange={(e) => {
                                const rate = parseFloat(e.target.value) || 0;
                                const days = kid.anticipatedMonthlyDays ?? 21;
                                const calculatedFee = Math.round(rate * days * 100) / 100;
                                setEditingChildren(prev => prev.map(c => c.id === kid.id ? {
                                  ...c,
                                  parentContributionDailyRate: rate,
                                  monthlyFee: calculatedFee
                                } : c));
                              }}
                              className="w-full p-1.5 bg-white border border-slate-300 rounded-lg font-bold text-purple-900"
                            />
                            <span className="text-[10px] text-slate-500 block mt-0.5">Assessed daily co-pay</span>
                          </div>

                          <div>
                            <label className="font-bold text-slate-700 block mb-1">
                              Anticipated Days / Mo
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="31"
                              placeholder="21"
                              value={kid.anticipatedMonthlyDays ?? 21}
                              onChange={(e) => {
                                const days = parseInt(e.target.value) || 21;
                                const rate = kid.parentContributionDailyRate ?? 0;
                                const calculatedFee = Math.round(rate * days * 100) / 100;
                                setEditingChildren(prev => prev.map(c => c.id === kid.id ? {
                                  ...c,
                                  anticipatedMonthlyDays: days,
                                  monthlyFee: calculatedFee
                                } : c));
                              }}
                              className="w-full p-1.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-900"
                            />
                            <span className="text-[10px] text-slate-500 block mt-0.5">Monthly billing days</span>
                          </div>

                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Monthly Co-Pay Invoice ($)</label>
                            <input
                              type="number"
                              step="0.50"
                              value={kid.monthlyFee}
                              onChange={(e) => handleUpdateEditingChild(kid.id, 'monthlyFee', parseFloat(e.target.value) || 0)}
                              className="w-full p-1.5 bg-white border border-slate-300 rounded-lg font-bold text-purple-900"
                            />
                            <span className="text-[10px] text-purple-700 font-bold block mt-0.5">
                              ${(kid.parentContributionDailyRate ?? 0).toFixed(2)} × {kid.anticipatedMonthlyDays ?? 21}d = ${kid.monthlyFee.toFixed(2)}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Monthly Fee ($)</label>
                          <input
                            type="number"
                            step="0.50"
                            value={kid.monthlyFee}
                            onChange={(e) => handleUpdateEditingChild(kid.id, 'monthlyFee', parseFloat(e.target.value) || 0)}
                            className="w-full p-1.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-900"
                          />
                        </div>
                      )}

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Assigned Provider</label>
                        <select
                          value={kid.providerId || ''}
                          onChange={(e) => handleUpdateEditingChild(kid.id, 'providerId', e.target.value || undefined)}
                          className="w-full p-1.5 bg-white border border-slate-300 rounded-lg font-medium"
                        >
                          <option value="">Awaiting Provider Match</option>
                          {providersList.map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({p.neighborhood})</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Admissions Stage</label>
                        <select
                          value={kid.admissionsStage}
                          onChange={(e: any) => handleUpdateEditingChild(kid.id, 'admissionsStage', e.target.value)}
                          className="w-full p-1.5 bg-white border border-slate-300 rounded-lg font-bold"
                        >
                          <option value="inquiry">1. Inquiry & Screening</option>
                          <option value="docs_needed">2. Forms & Doc Audit</option>
                          <option value="matching">3. Home Matching</option>
                          <option value="contract">4. Final Contract</option>
                          <option value="enrolled">5. Active Enrolment</option>
                          <option value="waitlisted">Waitlisted</option>
                        </select>
                      </div>

                      <div className="sm:col-span-3">
                        <label className="font-bold text-slate-700 block mb-1">Medical Notes & Allergies</label>
                        <input
                          type="text"
                          value={kid.medicalNotes || ''}
                          onChange={(e) => handleUpdateEditingChild(kid.id, 'medicalNotes', e.target.value)}
                          className="w-full p-1.5 bg-white border border-slate-300 rounded-lg font-medium text-slate-800"
                          placeholder="e.g. Peanut anaphylaxis, carries Epi-Pen"
                        />
                      </div>

                      {kid.fundingType === 'subsidy' && (() => {
                        const quota = kid.subsidizedAbsenceQuota ?? 30;
                        const used = kid.subsidizedAbsenceDaysUsed ?? 0;
                        const remaining = Math.max(0, quota - used);
                        const isAtRisk = used >= quota;
                        const isNearRisk = used >= quota * 0.8;

                        return (
                          <div className="sm:col-span-3 p-3 bg-purple-50/70 rounded-xl border border-purple-200 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-xs text-purple-950 flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-purple-700" />
                                <span>Municipal Subsidized Absence Quota Ledger</span>
                              </span>
                              <span className={`text-xs font-mono font-black px-2 py-0.5 rounded ${
                                isAtRisk
                                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                  : isNearRisk
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-purple-100 text-purple-900 border border-purple-300'
                              }`}>
                                {used} / {quota} Days Used ({remaining} Days Left)
                              </span>
                            </div>

                            <div className="w-full bg-purple-200 rounded-full h-2.5 overflow-hidden border border-purple-300">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  isAtRisk ? 'bg-rose-600' :
                                  isNearRisk ? 'bg-amber-500' : 'bg-purple-600'
                                }`}
                                style={{ width: `${Math.min(100, ((used / (quota || 1)) * 100))}%` }}
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
                              <div>
                                <label className="text-[10px] font-bold text-slate-600 block mb-1">Allocated Bank (Quota)</label>
                                <input
                                  type="number"
                                  min="0"
                                  max="120"
                                  value={kid.subsidizedAbsenceQuota ?? 30}
                                  onChange={(e) => handleUpdateEditingChild(kid.id, 'subsidizedAbsenceQuota', parseInt(e.target.value) || 0)}
                                  className="w-full p-1 bg-white border border-slate-300 rounded text-center font-bold text-xs font-mono text-purple-900"
                                  placeholder="e.g. 30"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] font-bold text-slate-600 block mb-1">Absences Used (Days)</label>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateEditingChild(kid.id, 'subsidizedAbsenceDaysUsed', Math.max(0, used - 1))}
                                    className="px-2 py-1 bg-white border border-slate-300 rounded font-bold hover:bg-slate-100 text-xs"
                                    title="Decrement 1 day"
                                  >
                                    -
                                  </button>
                                  <input
                                    type="number"
                                    min="0"
                                    max="120"
                                    value={used}
                                    onChange={(e) => handleUpdateEditingChild(kid.id, 'subsidizedAbsenceDaysUsed', parseInt(e.target.value) || 0)}
                                    className="w-full p-1 bg-white border border-slate-300 rounded text-center font-bold text-xs font-mono"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateEditingChild(kid.id, 'subsidizedAbsenceDaysUsed', used + 1)}
                                    className="px-2 py-1 bg-white border border-slate-300 rounded font-bold hover:bg-slate-100 text-xs"
                                    title="Increment 1 day"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>

                              <div>
                                <label className="text-[10px] font-bold text-slate-600 block mb-1">Subsidy Region</label>
                                <input
                                  type="text"
                                  value={kid.subsidyRegion || 'Durham Region'}
                                  onChange={(e) => handleUpdateEditingChild(kid.id, 'subsidyRegion', e.target.value)}
                                  className="w-full p-1 bg-white border border-slate-300 rounded font-medium text-xs"
                                  placeholder="e.g. Durham Region, Toronto"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] font-bold text-slate-600 block mb-1">Caseworker / Case #</label>
                                <input
                                  type="text"
                                  value={kid.subsidyCaseNumber || ''}
                                  onChange={(e) => handleUpdateEditingChild(kid.id, 'subsidyCaseNumber', e.target.value)}
                                  className="w-full p-1 bg-white border border-slate-300 rounded font-medium text-xs font-mono"
                                  placeholder="e.g. DUR-88219-CW"
                                />
                              </div>
                            </div>

                            <p className="text-[10px] text-slate-600 leading-snug">
                              * Regional subsidy contracts allocate a bulk bank of allowable absent/sick days per calendar year. Days beyond this quota risk municipal clawbacks.
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                ))}
              </div>
              </div>
              </div>

              {/* Modal Actions / Pinned Footer */}
              <div className="p-4 border-t-2 border-slate-900 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (editingParent) {
                        const willArchive = !editingParent.isArchived;
                        const msg = willArchive
                          ? `Archive ${editingParent.fullName}'s family? This will safely hide the family and children without deleting data.`
                          : `Restore ${editingParent.fullName}'s family to active roster?`;
                        if (window.confirm(msg)) {
                          if (onArchiveFamily) onArchiveFamily(editingParent.id, willArchive);
                          setEditingParent(null);
                        }
                      }
                    }}
                    className="px-3 py-2 rounded-xl border border-slate-300 hover:bg-amber-50 text-slate-700 hover:text-amber-900 font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    {editingParent.isArchived ? <ArchiveRestore className="w-4 h-4 text-emerald-600" /> : <Archive className="w-4 h-4 text-amber-600" />}
                    <span>{editingParent.isArchived ? 'Restore Family' : 'Archive Family'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteFamilyClick(editingParent.id)}
                    className="text-red-600 hover:text-red-800 font-bold flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingParent(null)}
                    className="px-4 py-2 rounded-xl border-2 border-slate-300 bg-white hover:bg-slate-50 font-bold text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveFamilyChanges}
                    className="neo-btn bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 font-bold gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Save Family Changes</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Gated Notes Modal */}
      {activeNotesChild && (
        <GatedNotesModal
          isOpen={!!activeNotesChild}
          onClose={() => setActiveNotesChild(null)}
          targetType="child"
          targetId={activeNotesChild.id}
          targetName={activeNotesChild.fullName}
          currentUser={{
            role: 'admin',
            userId: 'admin-1',
            userName: 'Agency Director'
          }}
          targetChild={activeNotesChild}
        />
      )}

      {/* Email / Status Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom duration-200">
          <div className={`p-4 rounded-xl border-2 border-slate-900 shadow-neo flex items-start gap-3 max-w-md ${
            toast.type === 'error' ? 'bg-rose-50 text-rose-950' : 'bg-amber-50 text-amber-950'
          }`}>
            {toast.type === 'error' ? (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            ) : (
              <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="text-sm font-black">{toast.title}</div>
              <div className="text-xs text-slate-600 font-semibold mt-0.5">{toast.message}</div>
            </div>
            <button onClick={() => setToast(null)} className="ml-auto text-slate-400 hover:text-slate-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
