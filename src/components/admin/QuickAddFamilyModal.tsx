import React, { useState, useEffect } from 'react';
import { ModalPortal } from '../common/ModalPortal';
import { ParentGuardian, Child, FundingType, RegionType, AdmissionsStage } from '../../types';
import { TEST_FAMILIES_ROSTER, TestFamilyProfile } from '../../data/testFamiliesData';
import { calculateMonthlyFee } from '../../data/agencySettingsData';
import { AccsDatePicker } from '../common/AccsDatePicker';
import { 
  X, 
  User, 
  Baby, 
  Plus, 
  Trash2, 
  Send, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  Phone, 
  Mail, 
  MapPin, 
  DollarSign,
  AlertCircle,
  Users
} from 'lucide-react';

interface QuickAddFamilyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFamily: (newParent: ParentGuardian, newChildren: Child[]) => void;
}

export const QuickAddFamilyModal: React.FC<QuickAddFamilyModalProps> = ({
  isOpen,
  onClose,
  onAddFamily
}) => {
  // Parent / Guardian State
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentAddress, setParentAddress] = useState('');
  const [parentRegion, setParentRegion] = useState<RegionType>('Durham Region');
  const [autoApproveFormZero, setAutoApproveFormZero] = useState(false);

  // Sibling / Multi-Child State
  const [lastParentId, setLastParentId] = useState<string | null>(null);
  const [isAddingSiblingMode, setIsAddingSiblingMode] = useState(false);

  // Children / Sibling Group State
  const [childrenInputs, setChildrenInputs] = useState<Array<{
    id: string;
    fullName: string;
    dob: string;
    fundingType: FundingType;
    allergies: string;
    medicalNotes: string;
    epiPenRequired: boolean;
    photoUrl?: string;
  }>>([
    {
      id: `child-${Date.now()}-1`,
      fullName: '',
      dob: '2024-06-15',
      fundingType: 'cwelcc',
      allergies: '',
      medicalNotes: '',
      epiPenRequired: false,
      photoUrl: undefined
    }
  ]);

  // Generated Link State after Submission
  const [createdMagicLink, setCreatedMagicLink] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [submittedChildNames, setSubmittedChildNames] = useState<string[]>([]);

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

  const handleAddSiblingInputRow = () => {
    // Infer surname from parent
    const parts = parentName.trim().split(/\s+/);
    const parentLastName = parts.length > 1 ? parts[parts.length - 1] : '';

    setChildrenInputs(prev => [
      ...prev,
      {
        id: `child-${Date.now()}-${prev.length + 1}`,
        fullName: parentLastName ? ` ${parentLastName}` : '',
        dob: '2023-08-20',
        fundingType: 'cwelcc',
        allergies: '',
        medicalNotes: '',
        epiPenRequired: false
      }
    ]);
  };

  const handleRemoveSiblingInputRow = (index: number) => {
    if (childrenInputs.length <= 1) return;
    setChildrenInputs(prev => prev.filter((_, i) => i !== index));
  };

  const handleChildChange = (index: number, field: string, value: any) => {
    setChildrenInputs(prev => prev.map((child, i) => i === index ? { ...child, [field]: value } : child));
  };

  const handlePreloadTestProfile = (fam: TestFamilyProfile) => {
    setParentName(fam.parent1Name);
    setParentEmail(fam.parent1Email);
    setParentPhone(fam.parent1Cell);
    setParentAddress(`${fam.homeAddress}, ${fam.city}`);
    setParentRegion(fam.region);
    setChildrenInputs([
      {
        id: `child-${Date.now()}-1`,
        fullName: fam.childName,
        dob: fam.dob,
        fundingType: fam.fundingType,
        allergies: fam.allergies.filter(a => !a.startsWith('None')).join(', '),
        medicalNotes: fam.medicalNotes,
        epiPenRequired: fam.epiPenRequired,
        photoUrl: fam.photoUrl
      }
    ]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentName.trim() || !childrenInputs[0].fullName.trim()) return;

    // Use existing parentId if adding sibling, otherwise generate new
    const parentId = isAddingSiblingMode && lastParentId ? lastParentId : `parent-${Date.now()}`;
    const childIds = childrenInputs.map(c => c.id);

    // Calculate age in months and CCEYA flags
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
        photoUrl: c.photoUrl || '/children/liam_macdonald.jpg',
        admissionsStage: autoApproveFormZero ? 'docs_needed' : 'inquiry',
        parentId: parentId,
        emergencyContacts: [
          { name: parentName, relationship: 'Parent / Guardian', phone: parentPhone }
        ],
        documents: [
          { id: `doc-${Date.now()}-1`, type: 'birth_certificate', title: 'Birth Certificate', status: 'not_submitted' },
          { id: `doc-${Date.now()}-2`, type: 'health_card', title: 'Ontario Health Card (OHIP)', status: 'not_submitted' },
          { id: `doc-${Date.now()}-3`, type: 'immunization', title: 'Yellow Immunization Card', status: 'not_submitted' }
        ],
        intakeSubmissionDate: new Date().toISOString().split('T')[0]
      };
    });

    const createdParent: ParentGuardian = {
      id: parentId,
      fullName: parentName.trim(),
      email: parentEmail.trim(),
      phone: parentPhone.trim(),
      homeAddress: parentAddress.trim(),
      city: parentRegion === 'Durham Region' ? 'Oshawa' : parentRegion === 'York Region' ? 'Markham' : 'Toronto',
      region: parentRegion,
      childIds: childIds,
      formZeroApproved: autoApproveFormZero,
      formZeroNotes: autoApproveFormZero ? 'Intake initiated directly by the Agency Representative (Staff Pre-Screened).' : 'Online inquiry generated.',
      preferredStartDate: '2026-09-01',
      preferredSchedule: 'full_time'
    };

    onAddFamily(createdParent, createdChildren);

    // Save session reference for adding more siblings
    setLastParentId(parentId);
    setSubmittedChildNames(childrenInputs.map(c => c.fullName.trim()));

    // Generate Shareable Magic Portal Link
    const magicUrl = `${window.location.origin}/?role=parent&familyId=${parentId}`;
    setCreatedMagicLink(magicUrl);
  };

  const handleStartAddSiblingToSameFamily = () => {
    setIsAddingSiblingMode(true);
    setCreatedMagicLink(null);
    setCopiedLink(false);

    // Infer child surname from parent
    const parts = parentName.trim().split(/\s+/);
    const parentLastName = parts.length > 1 ? parts[parts.length - 1] : '';

    setChildrenInputs([
      {
        id: `child-${Date.now()}-1`,
        fullName: parentLastName ? ` ${parentLastName}` : '',
        dob: '2025-02-15',
        fundingType: 'cwelcc',
        allergies: '',
        medicalNotes: '',
        epiPenRequired: false
      }
    ]);
  };

  const handleCopyLink = () => {
    if (!createdMagicLink) return;
    navigator.clipboard.writeText(createdMagicLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const resetForm = () => {
    setParentName('');
    setParentEmail('');
    setParentPhone('');
    setParentAddress('');
    setParentRegion('Durham Region');
    setAutoApproveFormZero(true);
    setLastParentId(null);
    setIsAddingSiblingMode(false);
    setSubmittedChildNames([]);
    setChildrenInputs([
      {
        id: `child-${Date.now()}-1`,
        fullName: '',
        dob: '2024-06-15',
        fundingType: 'cwelcc',
        allergies: '',
        medicalNotes: '',
        epiPenRequired: false
      }
    ]);
    setCreatedMagicLink(null);
    setCopiedLink(false);
  };

  const handleModalClose = () => {
    resetForm();
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
          className="bg-white border-2 border-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] cursor-default"
        >
        {/* Modal Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500 text-white">
              {isAddingSiblingMode ? <Baby className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">
                {isAddingSiblingMode ? `Add Child / Sibling to ${parentName}'s Family` : 'New Family & Child Intake'}
              </h2>
              <p className="text-[11px] text-slate-300">
                {isAddingSiblingMode 
                  ? 'Quick-add another child linked to this registered parent household' 
                  : 'Quick-add parent inquiry and generate interactive magic portal link'}
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
            /* Success State: Show Magic Invite Link */
            <div className="space-y-5 animate-fadeIn text-xs">
              <div className="p-5 bg-emerald-50 border-2 border-emerald-400 rounded-2xl text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-700">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="text-base font-extrabold text-emerald-950">
                  {isAddingSiblingMode ? 'Sibling Added Successfully!' : 'Family Account Created Successfully!'}
                </h3>
                <p className="text-emerald-800 max-w-md mx-auto">
                  <strong>{parentName}</strong> and <strong>{submittedChildNames.join(' & ')}</strong> have been added to the admissions pipeline and Cloud Firestore.
                </p>
              </div>

              {/* Shareable Link Box */}
              <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-900 space-y-2">
                <label className="font-extrabold text-slate-900 block flex items-center justify-between">
                  <span>Interactive Magic Parent Portal Link</span>
                  <span className="text-[10px] text-orange-600 font-bold">Auto-authenticates family</span>
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
                  Send this link to the parent via SMS or Email. When opened, it pre-populates their child's registration journey and all 6 regulatory forms.
                </p>
              </div>

              {/* Action Buttons with "+ Add Child to Same Family" CTA */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleStartAddSiblingToSameFamily}
                    className="neo-btn bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 font-bold text-xs gap-1.5 shadow-neo-sm"
                    title={`Add another sibling under ${parentName}'s household`}
                  >
                    <Baby className="w-4 h-4 text-emerald-100" />
                    <span>+ Add Child to Same Family</span>
                  </button>

                  <button
                    type="button"
                    onClick={resetForm}
                    className="neo-btn bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 font-bold text-xs gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Intake Another Family</span>
                  </button>
                </div>

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
              {/* Sibling Mode Notice Banner */}
              {isAddingSiblingMode && (
                <div className="p-3.5 bg-emerald-50 border-2 border-emerald-500 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-xl bg-emerald-500 text-white">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-extrabold text-emerald-950 block text-xs">
                        Adding Sibling to {parentName}'s Family Account
                      </span>
                      <span className="text-[11px] text-emerald-800">
                        Household contact info and address are linked. Fill in the sibling's details below.
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddingSiblingMode(false)}
                    className="text-[11px] text-slate-500 hover:text-slate-900 font-bold underline"
                  >
                    Switch to New Family
                  </button>
                </div>
              )}

              {/* Human-in-the-Loop Pre-fill from 24 Realistic Profiles */}
              {!isAddingSiblingMode && (
                <div className="p-3 bg-amber-50 rounded-2xl border-2 border-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-orange-600 shrink-0" />
                    <div>
                      <span className="text-xs font-black text-slate-900 block leading-tight">
                        Stress Test: Preload from 24 Realistic Test Children
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold">
                        Populates parent, child, address, and profile photo for manual review
                      </span>
                    </div>
                  </div>
                  <select
                    onChange={(e) => {
                      const selectedFam = TEST_FAMILIES_ROSTER.find(f => f.id === e.target.value);
                      if (selectedFam) {
                        handlePreloadTestProfile(selectedFam);
                      }
                    }}
                    defaultValue=""
                    className="w-full sm:w-auto text-xs font-extrabold bg-white border-2 border-slate-900 rounded-xl px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer shadow-neo-sm"
                  >
                    <option value="" disabled>-- Select a Test Child Profile (1 to 24) --</option>
                    {TEST_FAMILIES_ROSTER.map((f, i) => (
                      <option key={f.id} value={f.id}>
                        #{i + 1}: {f.childName} ({f.ageFormatted}, {f.region})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Section 1: Parent / Guardian Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-orange-500" />
                    <h3 className="font-extrabold uppercase tracking-wider text-slate-900 text-xs">
                      1. Parent / Guardian Details
                    </h3>
                  </div>
                  {isAddingSiblingMode && (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full border border-emerald-300">
                      ✓ Pre-Linked Household
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Parent Legal Full Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Jessica Thompson"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Primary Contact Phone *</label>
                    <input
                      type="tel"
                      placeholder="e.g. (905) 555-0199"
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Primary Email Address *</label>
                    <input
                      type="email"
                      placeholder="e.g. jessica.thompson@gmail.com"
                      value={parentEmail}
                      onChange={(e) => setParentEmail(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Ontario Region *</label>
                    <select
                      value={parentRegion}
                      onChange={(e) => setParentRegion(e.target.value as RegionType)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="Durham Region">Durham Region (Oshawa, Whitby, Ajax, Pickering)</option>
                      <option value="York Region">York Region (Markham, Richmond Hill, Vaughan)</option>
                      <option value="Toronto">City of Toronto / Scarborough</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-800 block mb-1">Home Street Address & Postal Code *</label>
                    <input
                      type="text"
                      placeholder="e.g. 148 Rossland Rd W, Oshawa, ON L1G 2V8"
                      value={parentAddress}
                      onChange={(e) => setParentAddress(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Child Details */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Baby className="w-4 h-4 text-orange-500" />
                    <h3 className="font-extrabold uppercase tracking-wider text-slate-900 text-xs">
                      {isAddingSiblingMode ? '2. Sibling / Additional Child Information' : '2. Child Information'}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddSiblingInputRow}
                    className="flex items-center gap-1 text-[11px] font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-2.5 py-1 rounded-lg border border-orange-200"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Another Child Row</span>
                  </button>
                </div>

                {childrenInputs.map((child, index) => (
                  <div key={child.id} className="p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl space-y-3 relative">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">
                          {index + 1}
                        </span>
                        {isAddingSiblingMode ? `Sibling #${index + 1}` : `Child #${index + 1}`}
                      </span>

                      {childrenInputs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSiblingInputRow(index)}
                          className="text-rose-600 hover:text-rose-700 p-1 hover:bg-rose-50 rounded"
                          title="Remove child row"
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
                          placeholder="e.g. Liam MacDonald"
                          value={child.fullName}
                          onChange={(e) => handleChildChange(index, 'fullName', e.target.value)}
                          className="w-full p-2 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-orange-500"
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
                          className="w-full p-2 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="cwelcc">CWELCC $22/Day ($478.50/mo)</option>
                          <option value="subsidy">Municipal Subsidy ($0.00 Copay)</option>
                          <option value="private">Full Fee / Private ($950.00/mo)</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="font-bold text-slate-800 block mb-1">Known Allergies / Medical Conditions</label>
                        <input
                          type="text"
                          placeholder="e.g. Peanuts (Anaphylaxis), Dairy, None"
                          value={child.allergies}
                          onChange={(e) => handleChildChange(index, 'allergies', e.target.value)}
                          className="w-full p-2 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-orange-500"
                        />
                      </div>

                      <div className="sm:col-span-3 flex items-center justify-between pt-1">
                        <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={child.epiPenRequired}
                            onChange={(e) => handleChildChange(index, 'epiPenRequired', e.target.checked)}
                            className="w-4 h-4 text-orange-600 rounded"
                          />
                          <span>Epi-Pen Required</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pre-Screening Gating Option */}
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-amber-900 block">Pre-Screening Discovery Call Status (Form 0)</span>
                  <span className="text-[11px] text-amber-800">Check if you have already conducted the 10-minute intake screening call with this family.</span>
                </div>
                <label className="flex items-center gap-2 font-extrabold text-slate-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoApproveFormZero}
                    onChange={(e) => setAutoApproveFormZero(e.target.checked)}
                    className="w-4 h-4 text-orange-600 rounded"
                  />
                  <span>Screening Pre-Approved</span>
                </label>
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
                  className="neo-btn bg-orange-500 hover:bg-orange-400 text-white px-6 py-2.5 font-extrabold text-xs gap-2 shadow-neo-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {isAddingSiblingMode 
                      ? `+ Register Sibling to ${parentName}'s Family` 
                      : 'Create Family & Generate Magic Link'}
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
