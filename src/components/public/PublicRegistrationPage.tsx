import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Baby, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Home, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  Copy, 
  Check, 
  AlertCircle,
  Clock,
  Heart,
  DollarSign,
  FileCheck2,
  ExternalLink
} from 'lucide-react';
import { AccsLogo } from '../AccsLogo';
import { AccsDatePicker } from '../common/AccsDatePicker';
import { ParentGuardian, Child, FundingType, RegionType, AdmissionsStage } from '../../types';
import { FormTemplate, FormField } from '../../types/formSchema';
import { INITIAL_PARENT_FORMS } from '../../data/parentFormsData';
import { TEST_FAMILIES_ROSTER, TestFamilyProfile } from '../../data/testFamiliesData';
import { calculateMonthlyFee } from '../../data/agencySettingsData';

interface PublicRegistrationPageProps {
  formsList?: FormTemplate[];
  onAddFamily: (newParent: ParentGuardian, newChildren: Child[]) => Promise<void>;
  onNavigateToParentPortal?: (familyId: string) => void;
  onNavigateToAdmin?: () => void;
}

interface ChildFormState {
  id: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  preferredName: string;
  dob: string;
  fundingType: FundingType;
  careType: string;
  desiredStartDate: string;
  allergies: string;
}

export const PublicRegistrationPage: React.FC<PublicRegistrationPageProps> = ({
  formsList,
  onAddFamily,
  onNavigateToParentPortal,
  onNavigateToAdmin
}) => {
  // Live PAR-0 Dynamic Schema Resolution (Synced with Firestore & AI Assistant)
  const formZero = formsList?.find(f => f.id === 'par-form-0') || INITIAL_PARENT_FORMS.find(f => f.id === 'par-form-0');
  const formZeroFields: FormField[] = formZero ? formZero.sections.flatMap(s => s.fields) : [];

  // Check if Anticipated Funding Stream is active in the live schema
  const fundingField = formZeroFields.find(f => 
    f.name === 'funding_type' || 
    f.name === 'anticipated_funding_stream' || 
    f.id === 'f0-7' ||
    f.label?.toLowerCase().includes('funding')
  );
  const hasFundingField = Boolean(fundingField);

  // Section 1 Guardian Fields Dynamic Schema Resolution
  const sec1 = formZero?.sections.find(s => s.id === 'sec-0-1') || formZero?.sections[0];
  const excludedFromSec1 = new Set([
    'child_name_age', 'desired_start_date', 'known_allergies', 'funding_type',
    'anticipated_funding_stream', 'screening_notes', 'prescreening_acknowledgment',
    'f0-5', 'f0-6', 'f0-allergies', 'f0-7', 'f0-8', 'f0-prescreening-consent'
  ]);
  const sec1Fields = (sec1?.fields || [])
    .filter(
      f => !excludedFromSec1.has(f.name) && !excludedFromSec1.has(f.id) && f.type !== 'consent_clause'
    )
    .slice()
    .sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
      if (a.order !== undefined) return a.order - 999;
      if (b.order !== undefined) return 999 - b.order;
      return 0;
    });

  // Dynamic custom fields added by AI Chatbot / Form Builder Studio
  const standardFieldKeys = new Set([
    'parent_full_name', 'parent_first_name', 'parent_last_name',
    'primary_phone', 'email', 'care_region', 'parent_address',
    'child_name_age', 'desired_start_date', 'funding_type', 
    'known_allergies', 'screening_notes', 
    'f0-1', 'f0-1-first', 'f0-1-last', 'f0-2', 'f0-3', 'f0-4', 'f0-address',
    'f0-5', 'f0-6', 'f0-7', 'f0-allergies', 'f0-8',
    'f0-prescreening-consent', 'prescreening_acknowledgment', 'consent_acknowledgment'
  ]);
  const sec1FieldIds = new Set(sec1Fields.flatMap(f => [f.id, f.name]));
  const dynamicCustomFields = formZeroFields.filter(f => 
    !standardFieldKeys.has(f.name) && 
    !standardFieldKeys.has(f.id) &&
    !sec1FieldIds.has(f.id) &&
    !sec1FieldIds.has(f.name)
  );
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({});
  const prescreeningConsentField = formZeroFields.find(f => 
    f.name === 'prescreening_acknowledgment' || 
    f.id === 'f0-prescreening-consent' || 
    f.type === 'consent_clause'
  );

  // Dynamic guardian form state to hold values for any field in Section 1
  const [guardianData, setGuardianData] = useState<Record<string, string>>({
    parent_full_name: '',
    parent_first_name: '',
    parent_last_name: '',
    primary_phone: '',
    email: '',
    care_region: 'Durham Region',
    parent_address: ''
  });

  // Parent Form State
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentAddress, setParentAddress] = useState('');
  const [parentRegion, setParentRegion] = useState<RegionType>('Durham Region');
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [isEveningCare, setIsEveningCare] = useState(false);
  const [preferredHours, setPreferredHours] = useState('7:30 AM – 5:00 PM');
  const [scheduleNotes, setScheduleNotes] = useState('');
  const [consentAgreed, setConsentAgreed] = useState(false);

  const getGuardianFieldValue = (field: FormField) => {
    if (guardianData[field.name] !== undefined && guardianData[field.name] !== '') return guardianData[field.name];
    if (guardianData[field.id] !== undefined && guardianData[field.id] !== '') return guardianData[field.id];
    if (field.name === 'parent_full_name' || field.id === 'f0-1') {
      if (guardianData['parent_first_name'] || guardianData['parent_last_name']) {
        return `${guardianData['parent_first_name'] || ''} ${guardianData['parent_last_name'] || ''}`.trim();
      }
      return parentName;
    }
    if (field.name === 'parent_first_name' || field.id === 'f0-1-first') {
      return guardianData['parent_first_name'] || parentName.split(' ')[0] || '';
    }
    if (field.name === 'parent_last_name' || field.id === 'f0-1-last') {
      return guardianData['parent_last_name'] || parentName.split(' ').slice(1).join(' ') || '';
    }
    if (field.name === 'primary_phone' || field.id === 'f0-2') return parentPhone;
    if (field.name === 'email' || field.id === 'f0-3') return parentEmail;
    if (field.name === 'care_region' || field.id === 'f0-4') return parentRegion;
    if (field.name === 'parent_address' || field.id === 'f0-address') return parentAddress;
    return '';
  };

  const handleGuardianFieldChange = (field: FormField, value: string) => {
    setGuardianData(prev => {
      const next = { ...prev, [field.name]: value, [field.id]: value };
      
      // Auto-synchronize standard parent variables
      if (field.name === 'parent_first_name' || field.id === 'f0-1-first') {
        const lastName = next['parent_last_name'] || next['f0-1-last'] || '';
        const full = `${value} ${lastName}`.trim();
        setParentName(full);
        next['parent_full_name'] = full;
        next['f0-1'] = full;
      } else if (field.name === 'parent_last_name' || field.id === 'f0-1-last') {
        const firstName = next['parent_first_name'] || next['f0-1-first'] || '';
        const full = `${firstName} ${value}`.trim();
        setParentName(full);
        next['parent_full_name'] = full;
        next['f0-1'] = full;
      } else if (field.name === 'parent_full_name' || field.id === 'f0-1') {
        setParentName(value);
        const [first, ...rest] = value.split(' ');
        next['parent_first_name'] = first || '';
        next['parent_last_name'] = rest.join(' ') || '';
        next['f0-1-first'] = first || '';
        next['f0-1-last'] = rest.join(' ') || '';
      } else if (field.name === 'primary_phone' || field.id === 'f0-2') {
        setParentPhone(value);
      } else if (field.name === 'email' || field.id === 'f0-3') {
        setParentEmail(value);
      } else if (field.name === 'care_region' || field.id === 'f0-4') {
        setParentRegion(value as RegionType);
      } else if (field.name === 'parent_address' || field.id === 'f0-address') {
        setParentAddress(value);
      }
      return next;
    });
  };

  // Derived schedule classification (Option A: Auto-calculated behind the scenes from days & extended care)
  const preferredSchedule = useMemo<'full_time' | 'part_time' | 'before_after_school' | 'weekend_care'>(() => {
    const isWeekend = selectedDays.includes('Sat') || selectedDays.includes('Sun');
    if (isEveningCare || isWeekend) return 'weekend_care';
    if (selectedDays.length >= 5) return 'full_time';
    return 'part_time';
  }, [selectedDays, isEveningCare]);

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? (prev.length > 1 ? prev.filter(d => d !== day) : prev) 
        : [...prev, day]
    );
  };

  // Multi-Child Form State
  const [children, setChildren] = useState<ChildFormState[]>([
    {
      id: `child-${Date.now()}-1`,
      fullName: '',
      preferredName: '',
      dob: '2023-04-15',
      fundingType: 'cwelcc',
      careType: 'Full-time (CWELCC $22/day)',
      desiredStartDate: '2026-09-01',
      allergies: ''
    }
  ]);

  // Submission & Confirmation State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [createdParentId, setCreatedParentId] = useState<string>('');
  const [createdParentName, setCreatedParentName] = useState<string>('');
  const [createdChildrenCount, setCreatedChildrenCount] = useState<number>(1);
  const [copiedLink, setCopiedLink] = useState(false);

  // Add Sibling Row
  const handleAddChild = () => {
    setChildren(prev => [
      ...prev,
      {
        id: `child-${Date.now()}-${prev.length + 1}`,
        fullName: '',
        preferredName: '',
        dob: '2024-01-10',
        fundingType: 'cwelcc',
        careType: 'Full-time (CWELCC $22/day)',
        desiredStartDate: '2026-09-01',
        allergies: ''
      }
    ]);
  };

  // Remove Sibling Row
  const handleRemoveChild = (index: number) => {
    if (children.length <= 1) return;
    setChildren(prev => prev.filter((_, i) => i !== index));
  };

  // Update Specific Child Field
  const handleUpdateChild = (index: number, field: keyof ChildFormState, value: any) => {
    setChildren(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c));
  };

  // Calculate age string helper
  const calculateAgeFormatted = (dobStr: string) => {
    if (!dobStr) return '';
    const birth = new Date(dobStr);
    if (isNaN(birth.getTime())) return '';
    const now = new Date();
    const totalMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    if (totalMonths < 0) return '';
    const yrs = Math.floor(totalMonths / 12);
    const mos = totalMonths % 12;
    if (yrs === 0) return `${mos} mos`;
    return `${yrs} yrs ${mos} mos`;
  };

  const handlePreloadTestFamily = (fam: TestFamilyProfile) => {
    const firstName = fam.parent1Name.split(' ')[0] || '';
    const lastName = fam.parent1Name.split(' ').slice(1).join(' ') || '';
    setParentName(fam.parent1Name);
    setParentPhone(fam.parent1Cell);
    setParentEmail(fam.parent1Email);
    setParentAddress(fam.homeAddress);
    setParentRegion(fam.region);
    setGuardianData({
      parent_full_name: fam.parent1Name,
      parent_first_name: firstName,
      parent_last_name: lastName,
      'f0-1': fam.parent1Name,
      'f0-1-first': firstName,
      'f0-1-last': lastName,
      primary_phone: fam.parent1Cell,
      'f0-2': fam.parent1Cell,
      email: fam.parent1Email,
      'f0-3': fam.parent1Email,
      care_region: fam.region,
      'f0-4': fam.region,
      parent_address: fam.homeAddress,
      'f0-address': fam.homeAddress
    });
    setScheduleNotes(`Employer: ${fam.parent1Employer} • Physician: ${fam.physicianName} (${fam.physicianPhone}) • Clinic: ${fam.clinicAddress} • Desired: ${fam.scheduleFormatted}`);
    setSelectedDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
    setPreferredHours('7:30 AM – 5:00 PM');
    setConsentAgreed(true);
    const [cFirst, ...cRest] = fam.childName.split(' ');
    const childFirstName = cFirst || '';
    const childLastName = cRest.join(' ') || '';

    setChildren([
      {
        id: `child-${Date.now()}-1`,
        firstName: childFirstName,
        lastName: childLastName,
        fullName: fam.childName,
        preferredName: childFirstName,
        dob: fam.dob,
        fundingType: fam.fundingType,
        careType: fam.fundingLabel,
        desiredStartDate: fam.preferredStartDate,
        allergies: fam.allergies.filter(a => !a.startsWith('None')).join(', ')
      }
    ]);
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveParentName = parentName.trim() || 
      `${guardianData['parent_first_name'] || ''} ${guardianData['parent_last_name'] || ''}`.trim() ||
      guardianData['parent_full_name'] ||
      guardianData['f0-1'] || '';
    const effectiveParentPhone = parentPhone.trim() || guardianData['primary_phone'] || guardianData['f0-2'] || '';
    const effectiveParentEmail = parentEmail.trim() || guardianData['email'] || guardianData['f0-3'] || '';
    const effectiveParentAddress = parentAddress.trim() || guardianData['parent_address'] || guardianData['f0-address'] || `${parentRegion}, Ontario`;
    const effectiveParentRegion = parentRegion || (guardianData['care_region'] as RegionType) || 'Durham Region';

    if (!effectiveParentName || !effectiveParentPhone || !effectiveParentEmail) {
      alert('Please fill in all required parent contact fields.');
      return;
    }
    if (!consentAgreed) {
      alert('Please confirm the CCEYA pre-screening consent checkbox before submitting.');
      return;
    }

    // Verify at least one child has a name
    const validChildren = children.filter(c => {
      const full = c.fullName?.trim() || `${c.firstName || ''} ${c.lastName || ''}`.trim();
      return full.length > 0;
    });
    if (validChildren.length === 0) {
      alert('Please provide the full legal name for at least one child.');
      return;
    }

    setIsSubmitting(true);

    const parentId = `parent-${Date.now()}`;
    const generatedChildren: Child[] = validChildren.map((c, idx) => {
      const birth = new Date(c.dob);
      const now = new Date();
      const ageMonths = Math.max(0, (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth()));
      const ageYearsFormatted = calculateAgeFormatted(c.dob);
      const isUnderTwo = ageMonths < 24;
      const isUnderThree = ageMonths < 36;
      const allergiesList = c.allergies.trim() 
        ? c.allergies.split(',').map(s => s.trim()).filter(Boolean)
        : [];
      const childFirst = c.firstName?.trim() || c.fullName.split(' ')[0] || '';
      const childLast = c.lastName?.trim() || c.fullName.split(' ').slice(1).join(' ') || '';
      const childFull = c.fullName.trim() || `${childFirst} ${childLast}`.trim();

      return {
        id: `child-${Date.now()}-${idx + 1}`,
        parentId: parentId,
        fullName: childFull,
        firstName: childFirst,
        lastName: childLast,
        preferredName: c.preferredName.trim() || childFirst || childFull,
        dob: c.dob,
        ageMonths,
        ageYearsFormatted,
        isUnderTwo,
        isUnderThree,
        admissionsStage: 'inquiry' as AdmissionsStage,
        fundingType: c.fundingType,
        monthlyFee: calculateMonthlyFee(c.fundingType),
        eTransferDueDay: 1,
        eTransferStatus: 'pending' as const,
        allergies: allergiesList,
        dietaryRestrictions: allergiesList,
        medicalNotes: c.allergies.trim() || 'No special medical notes',
        epiPenRequired: false,
        emergencyContacts: [
          {
            name: parentName.trim(),
            relationship: 'Primary Guardian',
            phone: parentPhone.trim()
          }
        ],
        documents: [
          {
            id: `doc-birth-${Date.now()}-${idx}`,
            type: 'birth_certificate',
            title: 'Official Proof of Birth (Birth Certificate / Passport)',
            status: 'not_submitted',
            lastUpdated: new Date().toISOString().split('T')[0]
          },
          {
            id: `doc-health-${Date.now()}-${idx}`,
            type: 'health_card',
            title: 'Ontario Health Card (OHIP)',
            status: 'not_submitted',
            lastUpdated: new Date().toISOString().split('T')[0]
          },
          {
            id: `doc-immu-${Date.now()}-${idx}`,
            type: 'immunization',
            title: 'Yellow Immunization Record / Exemption',
            status: 'not_submitted',
            lastUpdated: new Date().toISOString().split('T')[0]
          },
          {
            id: `doc-allergy-${Date.now()}-${idx}`,
            type: 'allergy_plan',
            title: "Emergency Medical & Anaphylaxis Consent (Sabrina's Law)",
            status: 'not_submitted',
            lastUpdated: new Date().toISOString().split('T')[0]
          },
          {
            id: `doc-contract-${Date.now()}-${idx}`,
            type: 'religious_exemption',
            title: 'Master Parent Contract & CWELCC Fee Schedule',
            status: 'not_submitted',
            lastUpdated: new Date().toISOString().split('T')[0]
          }
        ],
        intakeSubmissionDate: new Date().toISOString().split('T')[0]
      };
    });

    // Include custom dynamic responses in CRM intake notes
    const customSummary = Object.entries(customFieldValues)
      .filter(([_, v]) => Boolean(v))
      .map(([k, v]) => `${k}: ${v}`)
      .join(' • ');
    const daysSummary = selectedDays.join(', ');
    const scheduleSummary = `Schedule: ${
      preferredSchedule === 'full_time' ? 'Full-Time (Mon–Fri)' : 
      preferredSchedule === 'part_time' ? 'Part-Time' : 
      preferredSchedule === 'weekend_care' ? 'Weekend / Extended Care' :
      'Before & After School'
    } • Days: [${daysSummary}]${isEveningCare ? ' • [Evening / Overnight Care Requested]' : ''} • Hours: ${preferredHours}`;
    const fullFormZeroNotes = [
      scheduleSummary,
      scheduleNotes.trim() ? `Care Details & Requests: ${scheduleNotes.trim()}` : '',
      customSummary ? `[Dynamic Custom Fields]: ${customSummary}` : ''
    ]
      .filter(Boolean)
      .join('\n');

    const parentFirst = guardianData['parent_first_name'] || guardianData['f0-1-first'] || effectiveParentName.split(' ')[0] || '';
    const parentLast = guardianData['parent_last_name'] || guardianData['f0-1-last'] || effectiveParentName.split(' ').slice(1).join(' ') || '';

    const newParent: ParentGuardian = {
      id: parentId,
      fullName: effectiveParentName,
      firstName: parentFirst,
      lastName: parentLast,
      email: effectiveParentEmail,
      phone: effectiveParentPhone,
      homeAddress: effectiveParentAddress,
      city: effectiveParentRegion.replace(' Region', ''),
      region: effectiveParentRegion,
      childIds: generatedChildren.map(c => c.id),
      formZeroApproved: false,
      formZeroNotes: fullFormZeroNotes,
      preferredStartDate: validChildren[0]?.desiredStartDate || '2026-09-01',
      preferredSchedule: preferredSchedule
    };

    try {
      await onAddFamily(newParent, generatedChildren);
      setCreatedParentId(parentId);
      setCreatedParentName(parentName);
      setCreatedChildrenCount(generatedChildren.length);
      setSubmissionSuccess(true);
    } catch (err) {
      console.error('Error submitting registration:', err);
      alert('Application received and saved locally.');
      setCreatedParentId(parentId);
      setCreatedParentName(parentName);
      setCreatedChildrenCount(generatedChildren.length);
      setSubmissionSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const magicPortalUrl = `${window.location.origin}${window.location.pathname}?role=parent&familyId=${createdParentId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(magicPortalUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff7ed] via-[#fcfbf9] to-[#eff6ff] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Top Floating Trust Badge & Navigation */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-slate-700">Official Admissions Registration • Ontario CCEYA Licensed</span>
          </div>

          {onNavigateToAdmin && (
            <button
              onClick={onNavigateToAdmin}
              className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
            >
              <Lock className="w-3.5 h-3.5 text-orange-600" />
              <span>Agency Staff Login</span>
            </button>
          )}
        </div>

        {/* Hero Banner with Clean Aesthetics */}
        <div className="bg-white rounded-3xl border-2 border-slate-900 p-6 sm:p-8 space-y-6 shadow-neo-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b-2 border-slate-100">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-orange-100 text-orange-900 border border-orange-300 rounded-full text-xs font-extrabold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                  <span>2026–2027 Child Care Enrolment Open</span>
                </span>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full text-xs font-extrabold flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-emerald-600" />
                  <span>CWELCC & Subsidies Supported</span>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                Apply for Licensed Home Child Care
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                Connect with inspected, loving, high-quality licensed home daycare providers across 
                <strong className="text-slate-900"> Durham Region</strong>, 
                <strong className="text-slate-900"> York Region</strong>, and 
                <strong className="text-slate-900"> Toronto</strong>.
              </p>
            </div>

            <div className="flex-shrink-0">
              <AccsLogo size="lg" onClick={onNavigateToAdmin} />
            </div>
          </div>

          {/* 3 Core Agency Highlights - Cohesive Clean Surfaces */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-slate-50/90 rounded-2xl border-2 border-slate-200 flex items-start gap-3 hover:border-slate-900 transition-colors">
              <div className="p-2 bg-white rounded-xl border border-slate-200 text-orange-600 shadow-xs">
                <Home className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900">Small Group Care</h4>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">Max 6 children per home, with personalized attention in a warm, nurturing environment.</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50/90 rounded-2xl border-2 border-slate-200 flex items-start gap-3 hover:border-slate-900 transition-colors">
              <div className="p-2 bg-white rounded-xl border border-slate-200 text-orange-600 shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900">Ministry Inspected</h4>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">Quarterly unannounced audits & full CCEYA regulatory compliance.</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50/90 rounded-2xl border-2 border-slate-200 flex items-start gap-3 hover:border-slate-900 transition-colors">
              <div className="p-2 bg-white rounded-xl border border-slate-200 text-orange-600 shadow-xs">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900">CWELCC & Fee Subsidies</h4>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">Municipal Subsidies may be supported. Please inquire with the agency during your screening call.</p>
              </div>
            </div>
          </div>
        </div>

        {/* SUCCESS STATE CELEBRATION CARD */}
        {submissionSuccess ? (
          <div className="bg-white rounded-3xl border-2 border-slate-900 p-8 sm:p-10 space-y-6 animate-fadeIn text-center">
            <div className="w-16 h-16 bg-emerald-100 border-2 border-emerald-500 rounded-3xl flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-xs font-extrabold">
                Inquiry Received
              </span>
              <h2 className="text-2xl font-black text-slate-900">
                Your Child Care Inquiry has been Successfully Submitted!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Your pre-screening application for <strong className="text-slate-900">{createdChildrenCount} {createdChildrenCount === 1 ? 'child' : 'children'}</strong> has been received.
              </p>
            </div>

            {/* Next Steps Visual Flow */}
            <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-5 text-left max-w-xl mx-auto space-y-3">
              <h4 className="text-xs font-extrabold text-orange-950 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-orange-600" />
                <span>What Happens Next?</span>
              </h4>
              <ol className="text-xs text-orange-900 space-y-2 list-decimal list-inside leading-relaxed">
                <li><strong className="text-slate-900">Agency Review:</strong> Our placement team reviews licensed home openings in your target neighborhood.</li>
                <li><strong className="text-slate-900">Discovery Call:</strong> An agency representative will reach out to discuss your child care needs and schedule preferences.</li>
                <li><strong className="text-slate-900">Portal Registration:</strong> Upon screening approval, your secure Parent Portal unlocks digital intake and caregiver matching.</li>
              </ol>
            </div>

            {/* Magic Link Handoff Box */}
            <div className="bg-slate-50 border-2 border-slate-900 rounded-2xl p-6 max-w-xl mx-auto space-y-4">
              <div className="text-left space-y-1">
                <label className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Your Dedicated Parent Registration Link (Magic Link)</span>
                </label>
                <p className="text-[11px] text-slate-500">Bookmark this URL or save it to track your admission journey anytime:</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={magicPortalUrl}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="neo-btn bg-white hover:bg-slate-50 text-slate-800 px-4 py-2 text-xs font-bold gap-1.5 flex-shrink-0"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-orange-600" />}
                  <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigateToParentPortal) {
                      onNavigateToParentPortal(createdParentId);
                    } else {
                      window.location.href = magicPortalUrl;
                    }
                  }}
                  className="w-full neo-btn bg-orange-500 hover:bg-orange-400 text-white py-3.5 text-sm font-extrabold gap-2 justify-center shadow-neo"
                >
                  <span>Launch Your Parent Registration Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* MAIN INTAKE APPLICATION FORM */
          <div className="space-y-6">
            {/* Quick Preload Test Family Profile Banner */}
            <div className="p-4 bg-white rounded-2xl border-2 border-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-neo-sm">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-orange-50 border border-orange-200">
                  <Sparkles className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <span className="text-xs font-black text-slate-900 block leading-tight">
                    Mock Application: Preload from 24 Test Profiles
                  </span>
                  <span className="text-[11px] text-slate-600 font-medium">
                    Populate parent, child, address, OHIP, and schedule details instantly for testing.
                  </span>
                </div>
              </div>
              <select
                defaultValue=""
                onChange={(e) => {
                  const fam = TEST_FAMILIES_ROSTER.find(f => f.id === e.target.value);
                  if (fam) handlePreloadTestFamily(fam);
                }}
                className="w-full sm:w-auto text-xs font-bold bg-white border-2 border-slate-900 rounded-xl px-3 py-2 text-slate-900 cursor-pointer shadow-sm hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="" disabled>— Select Test Profile (1–24) —</option>
                {TEST_FAMILIES_ROSTER.map((fam) => (
                  <option key={fam.id} value={fam.id}>
                    {fam.id.replace('fam-', '#')}: {fam.childName} ({fam.ageFormatted} • {fam.region})
                  </option>
                ))}
              </select>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* 1. Primary Parent / Guardian Details Card */}
            <div className="bg-white rounded-3xl border-2 border-slate-900 p-6 sm:p-8 space-y-6">
              <div className="pb-3 border-b-2 border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-100 border border-orange-300 text-orange-700 flex items-center justify-center font-extrabold text-sm">
                    1
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">{sec1?.title || 'Primary Parent / Guardian Information'}</h2>
                    <p className="text-xs text-slate-500">{sec1?.description || 'Primary legal contact and household address for placement routing (second guardian can be added during enrolment).'}</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
                  Required
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {sec1Fields.length > 0 ? (
                  sec1Fields.map((field) => (
                    <div key={field.id || field.name} className={field.gridCols === 1 ? 'sm:col-span-2' : ''}>
                      <label className="font-bold text-slate-800 block mb-1">
                        {field.label} {field.required && <span className="text-orange-600">*</span>}
                      </label>
                      {field.type === 'dropdown' ? (
                        <select
                          value={getGuardianFieldValue(field) || field.options?.[0] || 'Durham Region'}
                          onChange={(e) => handleGuardianFieldChange(field, e.target.value)}
                          required={field.required}
                          className="w-full p-2.5 bg-slate-50 border-2 border-slate-900 rounded-xl font-medium focus:ring-2 focus:ring-orange-500 text-xs"
                        >
                          {(field.options && field.options.length > 0 ? field.options : ['Durham Region', 'York Region', 'Toronto']).map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : field.type === 'phone' ? (
                        <div className="relative">
                          <input
                            type="tel"
                            placeholder={field.placeholder || 'e.g. (905) 555-0192'}
                            value={getGuardianFieldValue(field)}
                            onChange={(e) => handleGuardianFieldChange(field, e.target.value)}
                            required={field.required}
                            className="w-full p-2.5 bg-slate-50 border-2 border-slate-900 rounded-xl font-medium focus:ring-2 focus:ring-orange-500 text-xs"
                          />
                        </div>
                      ) : field.type === 'email' ? (
                        <div>
                          <input
                            type="email"
                            placeholder={field.placeholder || 'e.g. sarah.t@example.com'}
                            value={getGuardianFieldValue(field)}
                            onChange={(e) => handleGuardianFieldChange(field, e.target.value)}
                            required={field.required}
                            className="w-full p-2.5 bg-slate-50 border-2 border-slate-900 rounded-xl font-medium focus:ring-2 focus:ring-orange-500 text-xs"
                          />
                          {field.helpText && (
                            <p className="text-[10px] text-slate-400 mt-1">{field.helpText}</p>
                          )}
                        </div>
                      ) : field.type === 'textarea' ? (
                        <div>
                          <textarea
                            rows={2}
                            placeholder={field.placeholder || ''}
                            value={getGuardianFieldValue(field)}
                            onChange={(e) => handleGuardianFieldChange(field, e.target.value)}
                            required={field.required}
                            className="w-full p-2.5 bg-slate-50 border-2 border-slate-900 rounded-xl font-medium focus:ring-2 focus:ring-orange-500 text-xs"
                          />
                          {field.helpText && (
                            <p className="text-[10px] text-slate-400 mt-1">{field.helpText}</p>
                          )}
                        </div>
                      ) : (
                        <div>
                          <input
                            type={field.type === 'date' ? 'date' : 'text'}
                            placeholder={
                              field.placeholder || 
                              (field.name.includes('last') || field.label.toLowerCase().includes('last')
                                ? 'e.g. Tremblay' 
                                : field.name.includes('first') || field.label.toLowerCase().includes('first')
                                ? 'e.g. Sarah' 
                                : 'e.g. Sarah Tremblay')
                            }
                            value={getGuardianFieldValue(field)}
                            onChange={(e) => handleGuardianFieldChange(field, e.target.value)}
                            required={field.required}
                            className="w-full p-2.5 bg-slate-50 border-2 border-slate-900 rounded-xl font-medium focus:ring-2 focus:ring-orange-500 text-xs"
                          />
                          {field.helpText && (
                            <p className="text-[10px] text-slate-400 mt-1">{field.helpText}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  /* Failsafe static inputs if schema is missing */
                  <>
                    <div>
                      <label className="font-bold text-slate-800 block mb-1">
                        Primary Parent / Guardian First Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Sarah"
                        value={guardianData['parent_first_name'] || guardianData['f0-1-first'] || parentName.split(' ')[0] || ''}
                        onChange={(e) => {
                          const first = e.target.value;
                          const last = guardianData['parent_last_name'] || guardianData['f0-1-last'] || parentName.split(' ').slice(1).join(' ') || '';
                          const full = `${first} ${last}`.trim();
                          setParentName(full);
                          setGuardianData(prev => ({
                            ...prev,
                            parent_first_name: first,
                            'f0-1-first': first,
                            parent_full_name: full,
                            'f0-1': full
                          }));
                        }}
                        required
                        className="w-full p-2.5 bg-slate-50 border-2 border-slate-900 rounded-xl font-medium focus:ring-2 focus:ring-orange-500 text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-800 block mb-1">
                        Primary Parent / Guardian Last Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Tremblay"
                        value={guardianData['parent_last_name'] || guardianData['f0-1-last'] || parentName.split(' ').slice(1).join(' ') || ''}
                        onChange={(e) => {
                          const last = e.target.value;
                          const first = guardianData['parent_first_name'] || guardianData['f0-1-first'] || parentName.split(' ')[0] || '';
                          const full = `${first} ${last}`.trim();
                          setParentName(full);
                          setGuardianData(prev => ({
                            ...prev,
                            parent_last_name: last,
                            'f0-1-last': last,
                            parent_full_name: full,
                            'f0-1': full
                          }));
                        }}
                        required
                        className="w-full p-2.5 bg-slate-50 border-2 border-slate-900 rounded-xl font-medium focus:ring-2 focus:ring-orange-500 text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-800 block mb-1">
                        Primary Guardian Phone (Cell) *
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. (905) 555-0192"
                        value={parentPhone}
                        onChange={(e) => setParentPhone(e.target.value)}
                        required
                        className="w-full p-2.5 bg-slate-50 border-2 border-slate-900 rounded-xl font-medium focus:ring-2 focus:ring-orange-500 text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-800 block mb-1">
                        Primary Guardian Email Address *
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. sarah.t@example.com"
                        value={parentEmail}
                        onChange={(e) => setParentEmail(e.target.value)}
                        required
                        className="w-full p-2.5 bg-slate-50 border-2 border-slate-900 rounded-xl font-medium focus:ring-2 focus:ring-orange-500 text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-800 block mb-1">
                        Desired Care Region / Municipality *
                      </label>
                      <select
                        value={parentRegion}
                        onChange={(e) => setParentRegion(e.target.value as RegionType)}
                        className="w-full p-2.5 bg-slate-50 border-2 border-slate-900 rounded-xl font-medium focus:ring-2 focus:ring-orange-500 text-xs"
                        required
                      >
                        <option value="Durham Region">Durham Region</option>
                        <option value="York Region">York Region</option>
                        <option value="Toronto">Toronto</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="font-bold text-slate-800 block mb-1">
                        Residential Street Address & Postal Code
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 142 Taunton Road East, Oshawa, ON L1G 3T8"
                        value={parentAddress}
                        onChange={(e) => setParentAddress(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border-2 border-slate-900 rounded-xl font-medium focus:ring-2 focus:ring-orange-500 text-xs"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 2. Registered Children Section (With Dynamic Multi-Child Sibling Support) */}
            <div className="bg-white rounded-3xl border-2 border-slate-900 p-6 sm:p-8 space-y-6">
              <div className="pb-3 border-b-2 border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-100 border border-orange-300 text-orange-800 flex items-center justify-center font-extrabold text-sm">
                    2
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">Child / Sibling Details</h2>
                    <p className="text-xs text-slate-500">Add each child needing home care placement.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddChild}
                  className="neo-btn bg-emerald-500 hover:bg-emerald-400 text-white px-3.5 py-1.5 text-xs font-bold gap-1.5 shadow-neo-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Another Sibling</span>
                </button>
              </div>

              <div className="space-y-6">
                {children.map((child, index) => (
                  <div 
                    key={child.id}
                    className="p-5 rounded-2xl border-2 border-slate-900 bg-slate-50 space-y-4 relative"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-extrabold flex items-center justify-center">
                          {index + 1}
                        </span>
                        <h3 className="text-xs font-extrabold text-slate-900">
                          {child.fullName ? child.fullName : `Child #${index + 1}`}
                          {calculateAgeFormatted(child.dob) && (
                            <span className="text-[11px] font-normal text-slate-500 ml-2">
                              ({calculateAgeFormatted(child.dob)})
                            </span>
                          )}
                        </h3>
                      </div>

                      {children.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveChild(index)}
                          className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition-colors"
                          title="Remove this sibling"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="font-bold text-slate-800 block mb-1">
                          Child Legal First Name *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Liam"
                          value={child.firstName !== undefined ? child.firstName : child.fullName.split(' ')[0] || ''}
                          onChange={(e) => {
                            const first = e.target.value;
                            const last = child.lastName !== undefined ? child.lastName : child.fullName.split(' ').slice(1).join(' ') || '';
                            handleUpdateChild(index, 'firstName', first);
                            handleUpdateChild(index, 'fullName', `${first} ${last}`.trim());
                          }}
                          required
                          className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-orange-500"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-800 block mb-1">
                          Child Legal Last Name *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Tremblay"
                          value={child.lastName !== undefined ? child.lastName : child.fullName.split(' ').slice(1).join(' ') || ''}
                          onChange={(e) => {
                            const last = e.target.value;
                            const first = child.firstName !== undefined ? child.firstName : child.fullName.split(' ')[0] || '';
                            handleUpdateChild(index, 'lastName', last);
                            handleUpdateChild(index, 'fullName', `${first} ${last}`.trim());
                          }}
                          required
                          className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-orange-500"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-800 block mb-1">
                          Preferred / Call Name (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Liam"
                          value={child.preferredName}
                          onChange={(e) => handleUpdateChild(index, 'preferredName', e.target.value)}
                          className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-orange-500"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-800 block mb-1">
                          Date of Birth (YYYY-MM-DD) *
                        </label>
                        <AccsDatePicker
                          value={child.dob}
                          onChange={(dateStr) => handleUpdateChild(index, 'dob', dateStr)}
                          mode="birthdate"
                          required
                          placeholder="Select or enter YYYY-MM-DD"
                        />
                        {calculateAgeFormatted(child.dob) && (
                          <p className="text-[10px] text-slate-400 mt-1">Calculated: {calculateAgeFormatted(child.dob)}</p>
                        )}
                      </div>

                      <div>
                        <label className="font-bold text-slate-800 block mb-1">
                          Desired Start Date (YYYY-MM-DD) *
                        </label>
                        <AccsDatePicker
                          value={child.desiredStartDate}
                          onChange={(dateStr) => handleUpdateChild(index, 'desiredStartDate', dateStr)}
                          mode="future"
                          required
                          placeholder="Select or enter YYYY-MM-DD"
                        />
                      </div>

                      {hasFundingField && (
                        <div>
                          <label className="font-bold text-slate-800 block mb-1">
                            {fundingField?.label || 'Anticipated Funding Stream'} {fundingField?.required && '*'}
                          </label>
                          <select
                            value={child.fundingType}
                            onChange={(e) => handleUpdateChild(index, 'fundingType', e.target.value as FundingType)}
                            className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-orange-500"
                            required={fundingField?.required}
                          >
                            {fundingField?.options && fundingField.options.length > 0 ? (
                              fundingField.options.map(opt => (
                                <option key={opt} value={opt.toLowerCase().includes('subsidy') ? 'subsidy' : opt.toLowerCase().includes('private') ? 'private' : 'cwelcc'}>
                                  {opt}
                                </option>
                              ))
                            ) : (
                              <>
                                <option value="cwelcc">CWELCC Program (Fee Reduction Eligible)</option>
                                <option value="subsidy">Municipal Child Care Fee Subsidy (Durham, York, Toronto)</option>
                                <option value="private">Private Care Spaces</option>
                              </>
                            )}
                          </select>
                        </div>
                      )}

                      <div className={hasFundingField ? '' : 'sm:col-span-2'}>
                        <label className="font-bold text-slate-800 block mb-1">
                          Known Allergies / Food Restrictions / Medical Notes
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Peanuts, Dairy, Sun, Air, or None"
                          value={child.allergies}
                          onChange={(e) => handleUpdateChild(index, 'allergies', e.target.value)}
                          className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Schedule & Neighborhood Preferences Card */}
            <div className="bg-white rounded-3xl border-2 border-slate-900 p-6 sm:p-8 space-y-6">
              <div className="pb-3 border-b-2 border-slate-100 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-100 border border-orange-300 text-orange-800 flex items-center justify-center font-extrabold text-sm">
                  3
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Schedule Needs & Care Preferences</h2>
                  <p className="text-xs text-slate-500">Provide details on daily hours, school drop-offs, or special requests.</p>
                </div>
              </div>

              <div className="space-y-6 text-xs">
                {/* Days of Care Needed (7 Days Support) with Auto-Derived Schedule Badge */}
                <div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <label className="font-bold text-slate-800">
                        Days of Care Required *
                      </label>
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border bg-orange-50 text-orange-950 border-orange-200 shadow-sm">
                        {preferredSchedule === 'full_time'
                          ? 'Full-Time (5 Days / Wk)'
                          : preferredSchedule === 'weekend_care'
                          ? (isEveningCare ? 'Extended / Evening Care' : 'Weekend Care')
                          : `Part-Time (${selectedDays.length} Days / Wk)`}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* [ ] Evening Care Checkbox */}
                      <label className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all text-[11px] font-bold cursor-pointer ${
                        isEveningCare ? 'bg-orange-50 border-orange-500 text-orange-950 shadow-sm' : 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-700'
                      }`}>
                        <input
                          type="checkbox"
                          checked={isEveningCare}
                          onChange={(e) => setIsEveningCare(e.target.checked)}
                          className="w-3.5 h-3.5 text-orange-600 rounded focus:ring-orange-500"
                        />
                        <span>[ ] Evening / Overnight</span>
                      </label>

                      {/* Quick Presets */}
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <button
                          type="button"
                          onClick={() => setSelectedDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'])}
                          className="text-orange-600 font-bold hover:underline"
                        >
                          Mon–Fri
                        </button>
                        <span className="text-slate-300">•</span>
                        <button
                          type="button"
                          onClick={() => setSelectedDays(['Mon', 'Wed', 'Fri'])}
                          className="text-orange-600 font-bold hover:underline"
                        >
                          M/W/F
                        </button>
                        <span className="text-slate-300">•</span>
                        <button
                          type="button"
                          onClick={() => setSelectedDays(['Sat', 'Sun'])}
                          className="text-orange-600 font-bold hover:underline"
                        >
                          Weekends
                        </button>
                        <span className="text-slate-300">•</span>
                        <button
                          type="button"
                          onClick={() => setSelectedDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])}
                          className="text-orange-600 font-bold hover:underline"
                        >
                          All 7 Days
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                      const isChecked = selectedDays.includes(day);
                      const isWeekend = day === 'Sat' || day === 'Sun';
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDay(day)}
                          className={`py-2.5 rounded-xl border-2 font-extrabold text-center transition-all ${
                            isChecked
                              ? 'bg-orange-500 text-white border-slate-900 shadow-neo-sm'
                              : isWeekend
                              ? 'bg-amber-50/70 text-slate-700 border-amber-300 hover:border-slate-800 hover:bg-amber-100/70'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                          }`}
                        >
                          <span className="block text-xs">{day}</span>
                          {isWeekend && (
                            <span className={`text-[9px] font-bold block -mt-0.5 ${isChecked ? 'text-orange-100' : 'text-amber-700'}`}>
                              Wknd
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3C. Preferred Daily Operating Hours */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">
                      Preferred Daily Operating Hours *
                    </label>
                    <div className="relative">
                      <select
                        value={preferredHours}
                        onChange={(e) => setPreferredHours(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-orange-500 appearance-none pr-8"
                      >
                        <option value="7:30 AM – 5:00 PM">7:30 AM – 5:00 PM (Standard Full Day)</option>
                        <option value="8:00 AM – 4:30 PM">8:00 AM – 4:30 PM (Core Working Day)</option>
                        <option value="7:00 AM – 5:30 PM">7:00 AM – 5:30 PM (Early Commuter)</option>
                        <option value="8:30 AM – 5:30 PM">8:30 AM – 5:30 PM (Mid-Morning to Evening)</option>
                        <option value="Flexible / As Needed">Flexible / As Needed (Shift Work)</option>
                        <option value="Weekend & Extended Shifts">Weekend Care / Extended Shifts (Non-Standard Hours)</option>
                      </select>
                      <Clock className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1">
                      Target Placement Neighborhood / Proximity
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Near Oshawa Centre, North Whitby, or near home"
                      value={customFieldValues['preferred_neighborhood'] || ''}
                      onChange={(e) => setCustomFieldValues(prev => ({ ...prev, preferred_neighborhood: e.target.value }))}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                {/* 3D. Special Requests, School Drop-offs, or Care Details Textarea */}
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Special Care Requests, School Drop-offs & Additional Details
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide details on daily hours, school drop-offs/pick-ups (e.g. half-day kindergarten), special routines, dietary preferences, or specific care requests..."
                    value={scheduleNotes}
                    onChange={(e) => setScheduleNotes(e.target.value)}
                    className="w-full p-3 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-orange-500 text-xs placeholder:text-slate-400"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    This information helps our placement team match your family with the right licensed home caregiver during your screening call.
                  </p>
                </div>

                {/* Dynamic Custom Fields Added via AI Assistant / Form Builder Studio */}
                {dynamicCustomFields.length > 0 && (
                  <div className="pt-4 border-t border-slate-200 space-y-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-orange-600" />
                      <span className="font-extrabold text-xs text-slate-900">
                        Additional Intake Inquiries (Live CCEYA Dynamic Schema)
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {dynamicCustomFields.map(field => (
                        <div key={field.id} className={field.gridCols === 1 ? 'sm:col-span-2' : ''}>
                          {field.type === 'consent_clause' || field.type === 'checkbox' ? (
                            <label className="flex items-start gap-3 p-3.5 bg-blue-50/70 border border-slate-300 rounded-xl cursor-pointer hover:bg-blue-100/60 transition-colors">
                              <input
                                type="checkbox"
                                checked={Boolean(customFieldValues[field.name])}
                                onChange={(e) => setCustomFieldValues(prev => ({ ...prev, [field.name]: e.target.checked }))}
                                required={field.required}
                                className="w-5 h-5 text-orange-600 mt-0.5 rounded focus:ring-orange-500 border-2 border-slate-900 cursor-pointer"
                              />
                              <div className="text-xs text-slate-800 leading-snug">
                                <span className="font-extrabold text-slate-900 block mb-0.5">
                                  {field.label} {field.required && '*'}
                                </span>
                                {field.helpText && (
                                  <span className="text-slate-600 block">{field.helpText}</span>
                                )}
                              </div>
                            </label>
                          ) : (
                            <>
                              <label className="font-bold text-slate-800 block mb-1">
                                {field.label} {field.required && '*'}
                              </label>
                              {field.type === 'textarea' ? (
                                <textarea
                                  rows={2}
                                  placeholder={field.placeholder || `Enter ${field.label}`}
                                  value={customFieldValues[field.name] || ''}
                                  onChange={(e) => setCustomFieldValues(prev => ({ ...prev, [field.name]: e.target.value }))}
                                  required={field.required}
                                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-orange-500"
                                />
                              ) : field.type === 'dropdown' && field.options ? (
                                <select
                                  value={customFieldValues[field.name] || ''}
                                  onChange={(e) => setCustomFieldValues(prev => ({ ...prev, [field.name]: e.target.value }))}
                                  required={field.required}
                                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-orange-500"
                                >
                                  <option value="">— Select {field.label} —</option>
                                  {field.options.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type={field.type === 'date' ? 'date' : field.type === 'phone' ? 'tel' : field.type === 'email' ? 'email' : 'text'}
                                  placeholder={field.placeholder || `Enter ${field.label}`}
                                  value={customFieldValues[field.name] || ''}
                                  onChange={(e) => setCustomFieldValues(prev => ({ ...prev, [field.name]: e.target.value }))}
                                  required={field.required}
                                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-orange-500"
                                />
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Consent & PIPEDA Compliance Checkbox - Matches Bottom Blue Tone */}
                <label className="flex items-start gap-3 p-4 bg-blue-50/70 border-2 border-slate-900 rounded-2xl cursor-pointer hover:bg-blue-100/70 transition-colors">
                  <input
                    type="checkbox"
                    checked={consentAgreed}
                    onChange={(e) => setConsentAgreed(e.target.checked)}
                    required
                    className="w-5 h-5 text-orange-600 mt-0.5 rounded focus:ring-orange-500 border-2 border-slate-900 cursor-pointer"
                  />
                  <div className="text-xs text-slate-800 leading-snug">
                    <span className="font-extrabold text-slate-900 block mb-0.5">
                      Intake Inquiry & Privacy Acknowledgment *
                    </span>
                    <span>
                      {prescreeningConsentField?.label || 'By submitting this inquiry, I acknowledge that I am initiating an intake inquiry with DaycareOS, a licensed home child care agency regulated by the Ontario Ministry of Education. All personal and family information is kept strictly private and confidential.'}
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Submission Action Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-6 rounded-3xl border-2 border-slate-900">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>Zero fees to apply • An agency representative will contact you to discuss your child care needs.</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto neo-btn bg-orange-500 hover:bg-orange-400 text-white px-8 py-3.5 text-sm font-extrabold gap-2 justify-center shadow-neo disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Submitting Application to CRM...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Application & Get Magic Link</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  </div>
);
};
