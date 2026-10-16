import React, { useState, useMemo, useEffect } from 'react';
import { ModalPortal } from '../common/ModalPortal';
import { ParentGuardian, Child, FundingType } from '../../types';
import { calculateMonthlyFee } from '../../data/agencySettingsData';
import { AccsDatePicker } from '../common/AccsDatePicker';
import { 
  X, 
  User, 
  Baby, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Sparkles, 
  Search, 
  Users, 
  Phone, 
  Mail, 
  MapPin, 
  AlertCircle
} from 'lucide-react';

interface AddChildToExistingModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentsList: ParentGuardian[];
  childrenList: Child[];
  onAddChildrenToFamily: (parent: ParentGuardian, newChildren: Child[]) => void;
  defaultParentId?: string;
}

export const AddChildToExistingModal: React.FC<AddChildToExistingModalProps> = ({
  isOpen,
  onClose,
  parentsList,
  childrenList,
  onAddChildrenToFamily,
  defaultParentId
}) => {
  const [selectedParentId, setSelectedParentId] = useState<string>(defaultParentId || (parentsList[0]?.id || ''));
  const [searchQuery, setSearchQuery] = useState('');
  
  // New Sibling / Children State
  const [childrenInputs, setChildrenInputs] = useState<Array<{
    id: string;
    fullName: string;
    dob: string;
    fundingType: FundingType;
    allergies: string;
    medicalNotes: string;
    epiPenRequired: boolean;
  }>>([
    {
      id: `child-${Date.now()}-1`,
      fullName: '',
      dob: '2024-08-15',
      fundingType: 'cwelcc',
      allergies: '',
      medicalNotes: '',
      epiPenRequired: false
    }
  ]);

  const [createdMagicLink, setCreatedMagicLink] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [submittedChildNames, setSubmittedChildNames] = useState<string[]>([]);

  // Find currently selected parent
  const selectedParent = useMemo(() => {
    return parentsList.find(p => p.id === selectedParentId) || parentsList[0];
  }, [parentsList, selectedParentId]);

  // Find all existing children of the selected parent
  const existingSiblings = useMemo(() => {
    if (!selectedParent) return [];
    return childrenList.filter(c => c.parentId === selectedParent.id || selectedParent.childIds.includes(c.id));
  }, [selectedParent, childrenList]);

  // Filter parents by search query
  const filteredParents = useMemo(() => {
    if (!searchQuery.trim()) return parentsList;
    const q = searchQuery.toLowerCase();
    return parentsList.filter(p => {
      const pMatch = p.fullName.toLowerCase().includes(q) || 
                     p.email.toLowerCase().includes(q) || 
                     p.phone.includes(q) ||
                     p.city.toLowerCase().includes(q);
      const childMatch = childrenList.some(c => 
        (c.parentId === p.id || p.childIds.includes(c.id)) && c.fullName.toLowerCase().includes(q)
      );
      return pMatch || childMatch;
    });
  }, [parentsList, childrenList, searchQuery]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Extract family surname
  const parentSurname = selectedParent ? selectedParent.fullName.trim().split(/\s+/).pop() || '' : '';

  const handleSelectParent = (parentId: string) => {
    setSelectedParentId(parentId);
    const parent = parentsList.find(p => p.id === parentId);
    const surname = parent ? parent.fullName.trim().split(/\s+/).pop() || '' : '';
    
    // Auto-update empty child name with surname
    setChildrenInputs(prev => prev.map(c => {
      if (!c.fullName.trim()) {
        return { ...c, fullName: surname ? ` ${surname}` : '' };
      }
      return c;
    }));
  };

  const handleAddChildRow = () => {
    setChildrenInputs(prev => [
      ...prev,
      {
        id: `child-${Date.now()}-${prev.length + 1}`,
        fullName: parentSurname ? ` ${parentSurname}` : '',
        dob: '2025-01-20',
        fundingType: 'cwelcc',
        allergies: '',
        medicalNotes: '',
        epiPenRequired: false
      }
    ]);
  };

  const handleRemoveChildRow = (index: number) => {
    if (childrenInputs.length <= 1) return;
    setChildrenInputs(prev => prev.filter((_, i) => i !== index));
  };

  const handleChildChange = (index: number, field: string, value: any) => {
    setChildrenInputs(prev => prev.map((child, i) => i === index ? { ...child, [field]: value } : child));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParent || !childrenInputs[0].fullName.trim()) return;

    // Calculate age in months and CCEYA flags for all new children
    const createdChildren: Child[] = childrenInputs.map(c => {
      const birthDate = new Date(c.dob);
      const today = new Date();
      const months = Math.max(1, Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30.4375)));
      const years = Math.floor(months / 12);
      const remMonths = months % 12;

      return {
        id: c.id,
        fullName: c.fullName.trim(),
        dob: c.dob,
        ageMonths: months,
        ageYearsFormatted: `${years} yr${years !== 1 ? 's' : ''} ${remMonths} mo${remMonths !== 1 ? 's' : ''}`,
        isUnderTwo: months < 24,
        isUnderThree: months < 36,
        fundingType: c.fundingType,
        monthlyFee: calculateMonthlyFee(c.fundingType),
        eTransferDueDay: 31,
        eTransferStatus: 'pending',
        allergies: c.allergies ? c.allergies.split(',').map(s => s.trim()).filter(Boolean) : [],
        dietaryRestrictions: [],
        medicalNotes: c.medicalNotes,
        epiPenRequired: c.epiPenRequired,
        photoUrl: '/children/liam_macdonald.jpg',
        admissionsStage: 'docs_needed',
        parentId: selectedParent.id,
        emergencyContacts: [
          { name: selectedParent.fullName, relationship: 'Parent / Guardian', phone: selectedParent.phone }
        ],
        documents: [
          { id: `doc-${Date.now()}-1`, type: 'birth_certificate', title: 'Birth Certificate', status: 'not_submitted' },
          { id: `doc-${Date.now()}-2`, type: 'health_card', title: 'Ontario Health Card (OHIP)', status: 'not_submitted' },
          { id: `doc-${Date.now()}-3`, type: 'immunization', title: 'Yellow Immunization Card', status: 'not_submitted' }
        ],
        intakeSubmissionDate: new Date().toISOString().split('T')[0]
      };
    });

    onAddChildrenToFamily(selectedParent, createdChildren);

    setSubmittedChildNames(childrenInputs.map(c => c.fullName.trim()));
    const magicUrl = `${window.location.origin}/?role=parent&familyId=${selectedParent.id}`;
    setCreatedMagicLink(magicUrl);
  };

  const handleCopyLink = () => {
    if (!createdMagicLink) return;
    navigator.clipboard.writeText(createdMagicLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleReset = () => {
    setCreatedMagicLink(null);
    setCopiedLink(false);
    setSubmittedChildNames([]);
    setChildrenInputs([
      {
        id: `child-${Date.now()}-1`,
        fullName: parentSurname ? ` ${parentSurname}` : '',
        dob: '2024-08-15',
        fundingType: 'cwelcc',
        allergies: '',
        medicalNotes: '',
        epiPenRequired: false
      }
    ]);
  };

  const handleModalClose = () => {
    handleReset();
    onClose();
  };

  return (
    <ModalPortal>
      <div 
        onClick={(e) => {
          if (e.target === e.currentTarget) handleModalClose();
        }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn cursor-pointer"
      >
        <div 
          onClick={(e) => e.stopPropagation()}
          className="bg-white border-2 border-slate-900 rounded-3xl max-w-2xl w-full shadow-neo-lg overflow-hidden flex flex-col max-h-[90vh] cursor-default"
        >
        {/* Modal Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500 text-white shadow-neo-sm">
              <Baby className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Add Child to Existing Family</h2>
              <p className="text-[11px] text-slate-300">
                Register a new sibling or additional child under an existing parent household
              </p>
            </div>
          </div>

          <button
            onClick={handleModalClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {createdMagicLink ? (
            /* Success State */
            <div className="space-y-5 animate-fadeIn text-xs">
              <div className="p-5 bg-emerald-50 border-2 border-emerald-400 rounded-2xl text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-700">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="text-base font-extrabold text-emerald-950">Sibling Added Successfully!</h3>
                <p className="text-emerald-800 max-w-md mx-auto">
                  <strong>{submittedChildNames.join(' & ')}</strong> has been registered under <strong>{selectedParent?.fullName}</strong>'s household alongside {existingSiblings.map(s => s.fullName).join(', ')}.
                </p>
              </div>

              {/* Shareable Link Box */}
              <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-900 space-y-2">
                <label className="font-extrabold text-slate-900 block flex items-center justify-between">
                  <span>Interactive Magic Parent Portal Link</span>
                  <span className="text-[10px] text-orange-600 font-bold">Includes All Registered Children</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={createdMagicLink}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono text-xs text-slate-700 select-all"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="neo-btn bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 font-bold text-xs gap-1.5 flex-shrink-0"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Send this link to {selectedParent?.fullName}. The parent can now toggle between their registered children in the Parent Portal.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleReset}
                  className="neo-btn bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 font-bold text-xs gap-1.5"
                >
                  <Baby className="w-4 h-4" />
                  <span>+ Add Another Sibling</span>
                </button>

                <button
                  type="button"
                  onClick={handleModalClose}
                  className="neo-btn bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 font-bold text-xs"
                >
                  Done / Close
                </button>
              </div>
            </div>
          ) : (
            /* Input Form */
            <form onSubmit={handleSubmit} className="space-y-6 text-xs">
              {/* Section 1: Select Registered Parent / Household */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <h3 className="font-extrabold uppercase tracking-wider text-slate-900 text-xs">
                      1. Select Registered Parent Household
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">
                    {parentsList.length} Families Registered
                  </span>
                </div>

                {/* Search Bar for Families */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search parent name, phone, email, or existing child name..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 text-xs"
                  />
                </div>

                {/* Parent Dropdown Select */}
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Select Family *</label>
                  <select
                    value={selectedParentId}
                    onChange={(e) => handleSelectParent(e.target.value)}
                    className="w-full p-2.5 bg-white border-2 border-slate-900 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                    required
                  >
                    {filteredParents.map((parent) => {
                      const childrenOfParent = childrenList.filter(c => 
                        c.parentId === parent.id || parent.childIds.includes(c.id)
                      );
                      return (
                        <option key={parent.id} value={parent.id}>
                          {parent.fullName} ({parent.city}, {parent.region}) — {childrenOfParent.length} Child: {childrenOfParent.map(c => c.fullName).join(', ') || 'None'}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Selected Parent Info Summary Card */}
                {selectedParent && (
                  <div className="p-3.5 bg-emerald-50/70 border-2 border-emerald-300 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-neo-sm">
                          {selectedParent.fullName.charAt(0)}
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-900 text-xs block">{selectedParent.fullName}</span>
                          <span className="text-[10px] text-emerald-800 font-bold">{selectedParent.region} ({selectedParent.city})</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-200 text-emerald-950 font-bold text-[10px] rounded-full">
                        ✓ Pre-Linked Household
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1 border-t border-emerald-200">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                        <span>{selectedParent.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0 truncate" />
                        <span className="truncate">{selectedParent.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:col-span-2">
                        <MapPin className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                        <span className="truncate">{selectedParent.homeAddress}</span>
                      </div>
                    </div>

                    {existingSiblings.length > 0 && (
                      <div className="pt-2 border-t border-emerald-200 flex items-center gap-2 text-[11px]">
                        <span className="font-bold text-slate-700">Currently Enrolled Children:</span>
                        <div className="flex flex-wrap gap-1">
                          {existingSiblings.map(sib => (
                            <span key={sib.id} className="bg-white border border-emerald-300 text-emerald-950 px-2 py-0.5 rounded-md font-bold text-[10px]">
                              {sib.fullName} ({sib.ageYearsFormatted})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Section 2: New Sibling / Child Details */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Baby className="w-4 h-4 text-orange-500" />
                    <h3 className="font-extrabold uppercase tracking-wider text-slate-900 text-xs">
                      2. New Sibling / Child Information
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddChildRow}
                    className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Another Sibling Row</span>
                  </button>
                </div>

                {childrenInputs.map((child, index) => (
                  <div key={child.id} className="p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl space-y-3 relative">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">
                          {index + 1}
                        </span>
                        Sibling #{index + 1}
                      </span>

                      {childrenInputs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveChildRow(index)}
                          className="text-rose-600 hover:text-rose-700 p-1 hover:bg-rose-50 rounded"
                          title="Remove sibling row"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="font-bold text-slate-800 block mb-1">Child Legal Name (First Last) *</label>
                        <input
                          type="text"
                          placeholder={`e.g. Emma ${parentSurname || 'Surname'}`}
                          value={child.fullName}
                          onChange={(e) => handleChildChange(index, 'fullName', e.target.value)}
                          className="w-full p-2 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-800 block mb-1">Date of Birth (YYYY-MM-DD) *</label>
                        <AccsDatePicker
                          value={child.dob}
                          onChange={(val) => handleChildChange(index, 'dob', val)}
                          mode="birthdate"
                          placeholder="YYYY-MM-DD"
                          required
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-800 block mb-1">CCEYA Funding Model *</label>
                        <select
                          value={child.fundingType}
                          onChange={(e) => handleChildChange(index, 'fundingType', e.target.value)}
                          className="w-full p-2 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="cwelcc">CWELCC $10/Day ($217.50/mo)</option>
                          <option value="subsidy">Municipal Subsidy ($0.00 Copay)</option>
                          <option value="private">Full Fee / Private ($950.00/mo)</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="font-bold text-slate-800 block mb-1">Known Allergies / Medical Conditions</label>
                        <input
                          type="text"
                          placeholder="e.g. Peanuts, Dairy, None"
                          value={child.allergies}
                          onChange={(e) => handleChildChange(index, 'allergies', e.target.value)}
                          className="w-full p-2 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div className="sm:col-span-3 flex items-center justify-between pt-1">
                        <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={child.epiPenRequired}
                            onChange={(e) => handleChildChange(index, 'epiPenRequired', e.target.checked)}
                            className="w-4 h-4 text-emerald-600 rounded"
                          />
                          <span>Epi-Pen Required</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="neo-btn bg-white hover:bg-slate-100 text-slate-700 px-4 py-2 font-bold text-xs"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="neo-btn bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 font-extrabold text-xs gap-2 shadow-neo-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    + Register Sibling to {selectedParent?.fullName || 'Family'}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  </ModalPortal>
);
};
