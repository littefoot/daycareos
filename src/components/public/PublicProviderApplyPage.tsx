import React, { useState } from 'react';
import { 
  Home, 
  ShieldCheck, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Mail, 
  Baby, 
  FileCheck2, 
  AlertCircle, 
  Lock, 
  ExternalLink,
  ArrowRight,
  Sparkles,
  Users,
  Printer
} from 'lucide-react';
import { AccsLogo } from '../AccsLogo';
import { ProviderApplicant, RegionType } from '../../types';
import { FormTemplate, FormField } from '../../types/formSchema';
import { INITIAL_PROVIDER_FORMS } from '../../data/providerFormsData';

interface PublicProviderApplyPageProps {
  formsList?: FormTemplate[];
  onAddApplicant?: (applicant: ProviderApplicant) => void;
  onNavigateToParentApply?: () => void;
  onNavigateToAdmin?: () => void;
  onNavigateToProviderPortal?: (providerId?: string) => void;
}

export const PublicProviderApplyPage: React.FC<PublicProviderApplyPageProps> = ({
  formsList,
  onAddApplicant,
  onNavigateToParentApply,
  onNavigateToAdmin,
  onNavigateToProviderPortal
}) => {
  // Live PROV-0 Dynamic Schema Resolution (Synced with Firestore & AI Assistant)
  const provForm = formsList?.find(f => f.id === 'prov-form-0') || INITIAL_PROVIDER_FORMS.find(f => f.id === 'prov-form-0');
  const provFormFields: FormField[] = provForm ? provForm.sections.flatMap(s => s.fields) : [];

  const sec1 = provForm?.sections.find(s => s.id === 'sec-p0-1') || provForm?.sections[0];
  const sec2 = provForm?.sections.find(s => s.id === 'sec-p0-2') || provForm?.sections[1];
  const sec3 = provForm?.sections.find(s => s.id === 'sec-p0-3') || provForm?.sections[2];
  const sec4 = provForm?.sections.find(s => s.id === 'sec-p0-4') || provForm?.sections[3];

  const fencedConsentField = provFormFields.find(f => 
    f.name === 'fenced_yard_declaration' || f.name === 'fenced_yard' || f.id === 'fp0-fenced'
  );
  const cceyaConsentField = provFormFields.find(f => 
    f.name === 'cceya_oversight_consent' || f.name === 'cceyaConsent' || f.id === 'fp0-cceya'
  );

  // Dynamic custom fields added by AI Chatbot / Form Builder Studio
  const standardProvKeys = new Set([
    'provider_full_name', 'provider_cell', 'provider_email', 'languages_spoken', 
    'home_address', 'neighborhood', 'city_municipality', 'dwelling_type', 'ownership_status', 
    'ece_cpr_cert', 'own_children_under_6', 'household_adults_count', 'transition_notes', 
    'fenced_yard_declaration', 'cceya_oversight_consent', 'fenced_yard',
    'fp0-1', 'fp0-2', 'fp0-3', 'fp0-lang', 'fp0-address', 'fp0-neigh', 'fp0-city', 
    'fp0-dwelling', 'fp0-owner', 'fp0-4', 'fp0-5', 'fp0-adults', 'fp0-notes', 
    'fp0-fenced', 'fp0-cceya'
  ]);
  const dynamicCustomFields = provFormFields.filter(f => !standardProvKeys.has(f.name) && !standardProvKeys.has(f.id));
  const sec4CustomFields = (sec4?.fields || []).filter(f => !standardProvKeys.has(f.name) && !standardProvKeys.has(f.id));
  const nonSec4CustomFields = dynamicCustomFields.filter(f => !sec4CustomFields.some(s4 => s4.id === f.id));
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({});
  // Form State
  const [applicantName, setApplicantName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('Oshawa');
  const [region, setRegion] = useState<RegionType>('Durham Region');
  const [residenceType, setResidenceType] = useState<'detached' | 'semi' | 'townhouse' | 'apartment'>('detached');
  const [ownsHome, setOwnsHome] = useState(true);
  const [firstAidLevel, setFirstAidLevel] = useState('Standard First Aid & CPR Level C (Current)');
  const [ownChildrenCount, setOwnChildrenCount] = useState(0);
  const [householdAdults, setHouseholdAdults] = useState(2);
  const [fencedYardConsent, setFencedYardConsent] = useState(false);
  const [cceyaConsent, setCceyaConsent] = useState(false);
  const [languages, setLanguages] = useState<string[]>(['English']);
  const [transitionNotes, setTransitionNotes] = useState('');

  // Submission State
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [referenceCode, setReferenceCode] = useState('');
  const [submittedApplicantId, setSubmittedApplicantId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleLanguage = (lang: string) => {
    setLanguages(prev => 
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fencedYardConsent || !cceyaConsent) {
      alert('Please review and confirm all required CCEYA home facility and safety declarations.');
      return;
    }

    setIsSubmitting(true);

    const generatedCode = `ACCS-PROV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setReferenceCode(generatedCode);

    const customEntries = Object.entries(customFieldValues)
      .filter(([_, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `${k}: ${v === true ? 'Agreed' : v}`)
      .join(' | ');

    const newApplicant: ProviderApplicant = {
      id: `prov-app-${Date.now()}`,
      applicantName: applicantName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      appliedDate: new Date().toISOString().split('T')[0],
      stage: 'applied',
      residenceType,
      ownsHome,
      address: address.trim(),
      neighborhood: neighborhood.trim() || `${city} Area`,
      city,
      region,
      targetCapacity: 6,
      householdAdultsCount: Number(householdAdults),
      householdAdultsVscComplete: false,
      medicalClearanceReceived: false,
      firstAidCprLevelCVerified: firstAidLevel.includes('Current'),
      firearmsDisclosed: false,
      homeInspectionPassed: false,
      existingChildrenCount: Number(ownChildrenCount),
      languages: languages.length > 0 ? languages : ['English'],
      notes: transitionNotes.trim() 
        ? `[Public Onboarding PROV-0] ${transitionNotes.trim()}${customEntries ? ` [Custom: ${customEntries}]` : ''}` 
        : `[Public Onboarding PROV-0] Submitted initial home facility registration.${customEntries ? ` [Custom: ${customEntries}]` : ''} Ref: ${generatedCode}`
    };

    // Update Local Storage
    try {
      const existingRaw = localStorage.getItem('accs_provider_applicants');
      const existingList = existingRaw ? JSON.parse(existingRaw) : [];
      const updatedList = [newApplicant, ...existingList];
      localStorage.setItem('accs_provider_applicants', JSON.stringify(updatedList));
    } catch (e) {
      console.warn('Failed to update local storage for provider applicant', e);
    }

    if (onAddApplicant) {
      onAddApplicant(newApplicant);
    }

    setSubmittedApplicantId(newApplicant.id);
    setIsSubmitting(false);
    setIsSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-slate-900 pb-16">
      {/* Top Banner & Public Header */}
      <header className="border-b-2 border-slate-900 bg-white sticky top-0 z-30 shadow-neo-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AccsLogo size="sm" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
                  DaycareOS (ACCS)
                </span>
                <span className="bg-purple-100 text-purple-900 text-[10px] font-black px-2 py-0.5 rounded-full border border-purple-300 uppercase">
                  Form PROV-0
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Licensed Home Child Care Provider Enrolment & Facility Application
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onNavigateToParentApply && (
              <button
                type="button"
                onClick={onNavigateToParentApply}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 rounded-xl text-xs font-black transition-colors cursor-pointer"
              >
                <Baby className="w-3.5 h-3.5 text-amber-700" />
                <span>Parent Inquiry (PAR-0)</span>
              </button>
            )}
            {onNavigateToAdmin && (
              <button
                type="button"
                onClick={onNavigateToAdmin}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-black transition-colors cursor-pointer"
              >
                <span>Staff Portal</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 pt-6 sm:pt-8">
        {isSubmitted ? (
          /* Submission Confirmation Card */
          <div className="bg-white border-2 border-slate-900 rounded-3xl p-6 sm:p-10 shadow-neo space-y-6 text-center animate-in fade-in duration-300">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-slate-900 shadow-neo-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <span className="text-[11px] font-black uppercase tracking-wider text-purple-700 bg-purple-100 border border-purple-300 px-3 py-1 rounded-full inline-block">
                Application Received & Logged
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                Thank You, {applicantName.split(' ')[0]}!
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                Your home facility onboarding application has been securely submitted to the <strong>DaycareOS (ACCS)</strong> Central Admissions team.
              </p>
            </div>

            {/* Reference Badge */}
            <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-4 max-w-md mx-auto space-y-1">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                Permanent Application Tracking Code
              </span>
              <div className="text-lg sm:text-xl font-mono font-black text-purple-900">
                {referenceCode}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Please retain this code for your initial consultation interview with the Agency Director.
              </p>
            </div>

            {/* 4-Step Onboarding Roadmap */}
            <div className="text-left bg-purple-50/70 border border-purple-200 rounded-2xl p-4 sm:p-6 space-y-3">
              <h2 className="text-xs font-black text-purple-950 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-purple-700" />
                <span>CCEYA Provider Onboarding Journey (Next Steps)</span>
              </h2>
              <ol className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <li className="p-3 bg-white border border-purple-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-black text-purple-600 uppercase">Step 1 • Initial Phone Call</span>
                  <p className="font-bold text-slate-900">Pre-Screening Consultation</p>
                  <p className="text-[11px] text-slate-600 font-medium">The Agency Director will contact you at {phone} within 1–2 business days.</p>
                </li>
                <li className="p-3 bg-white border border-purple-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-black text-purple-600 uppercase">Step 2 • Background Clearances</span>
                  <p className="font-bold text-slate-900">Vulnerable Sector & Health</p>
                  <p className="text-[11px] text-slate-600 font-medium">Police VSC checks for all household adults and physician medical immunization clearance.</p>
                </li>
                <li className="p-3 bg-white border border-purple-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-black text-purple-600 uppercase">Step 3 • In-Person Inspection</span>
                  <p className="font-bold text-slate-900">CCEYA Home Safety Audit</p>
                  <p className="text-[11px] text-slate-600 font-medium">An unannounced on-site visit by an ACCS Registered Early Childhood Educator (RECE) Home Visitor.</p>
                </li>
                <li className="p-3 bg-white border border-purple-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-black text-purple-600 uppercase">Step 4 • Contract & Roster</span>
                  <p className="font-bold text-slate-900">Affiliation Contract & Placement Matching</p>
                  <p className="text-[11px] text-slate-600 font-medium">Digital affiliation contract signing, neighborhood child matching, and scheduled agency direct deposit.</p>
                </li>
              </ol>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-slate-50 border-2 border-slate-900 rounded-xl text-xs font-black shadow-neo-sm transition-transform active:translate-y-0.5 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-slate-700" />
                <span>Print / Save Application Receipt</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onNavigateToProviderPortal) {
                    onNavigateToProviderPortal(submittedApplicantId);
                  } else {
                    window.location.href = `/?role=provider${submittedApplicantId ? `&providerId=${submittedApplicantId}` : ''}`;
                  }
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white border-2 border-slate-900 rounded-xl text-xs font-black shadow-neo-sm transition-transform active:translate-y-0.5 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Access Provider Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Subtle fallback switch for parents who applied here by mistake */}
            {onNavigateToParentApply && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={onNavigateToParentApply}
                  className="text-[11px] font-bold text-slate-500 hover:text-orange-600 underline underline-offset-2 transition-colors cursor-pointer"
                >
                  Looking for child care instead? Switch to Parent Intake (PAR-0)
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Application Form */
          <div className="space-y-6">
            {/* Hero Value Card */}
            <div className="bg-white border-2 border-slate-900 rounded-3xl p-5 sm:p-8 shadow-neo space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-purple-800 bg-purple-100 border border-purple-300 px-3 py-0.5 rounded-full inline-flex items-center gap-1">
                  <Home className="w-3 h-3 text-purple-600" />
                  <span>Licensed Home Child Care Agency Enrolment</span>
                </span>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                  Ontario Ministry of Education Licensed Agency • Semi-Monthly Agency Remittance
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                Operate a Licensed Home Daycare in Durham, York or Toronto
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                {provForm?.description || "Join DaycareOS (ACCS) as an independent licensed home provider. We provide competitive agency compensation funded via CWELCC provincial allocations and parent fees, pre-screened neighborhood family matching, dedicated RECE Home Visitor safety coaching, and zero unpaid parent fees."}
              </p>
            </div>

            {/* The Application Form (Form PROV-0) */}
            <form onSubmit={handleSubmit} className="bg-white border-2 border-slate-900 rounded-3xl p-5 sm:p-8 shadow-neo space-y-8">
              {/* Section 1: Provider Identity & Contact */}
              <div className="space-y-4">
                <div className="border-b-2 border-slate-900 pb-2 flex items-center justify-between">
                  <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[11px] flex items-center justify-center font-bold">1</span>
                    <span>{sec1?.title || 'Section 1: Provider Identity & Contact Information'}</span>
                  </h2>
                  <span className="text-[10px] font-black text-slate-500 uppercase">Step 1 of 4</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-800 mb-1">
                      Legal Full Name (as on Government ID) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      placeholder="e.g. Fatima Al-Mansoor"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-800 mb-1">
                      Primary Contact Cell Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. (905) 555-4412"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-800 mb-1">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. fatima.care@example.com"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-800 mb-1">
                      Primary Languages Spoken in Home
                    </label>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {['English', 'French', 'Farsi', 'Hindi', 'Gujarati', 'Twi', 'Urdu', 'Arabic', 'Spanish', 'Tagalog'].map((lang) => {
                        const isSelected = languages.includes(lang);
                        return (
                          <button
                            key={lang}
                            type="button"
                            onClick={() => toggleLanguage(lang)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                              isSelected 
                                ? 'bg-purple-600 text-white border-purple-800' 
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {isSelected && <span className="mr-1">✓</span>}
                            {lang}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Facility Premises & Location */}
              <div className="space-y-4">
                <div className="border-b-2 border-slate-900 pb-2 flex items-center justify-between">
                  <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[11px] flex items-center justify-center font-bold">2</span>
                    <span>{sec2?.title || 'Section 2: Home Facility Premises & Location'}</span>
                  </h2>
                  <span className="text-[10px] font-black text-slate-500 uppercase">Step 2 of 4</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-black text-slate-800 mb-1">
                      Facility Street Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. 419 Harmony Rd N"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-800 mb-1">
                      Neighborhood / Community
                    </label>
                    <input
                      type="text"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      placeholder="e.g. Oshawa North"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-800 mb-1">
                      City / Town <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={city}
                      onChange={(e) => {
                        const newCity = e.target.value;
                        setCity(newCity);
                        if (['Oshawa', 'Whitby', 'Pickering', 'Ajax'].includes(newCity)) {
                          setRegion('Durham Region');
                        } else if (['Markham', 'Richmond Hill', 'Vaughan'].includes(newCity)) {
                          setRegion('York Region');
                        } else {
                          setRegion('Toronto');
                        }
                      }}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer"
                    >
                      <option value="Oshawa">Oshawa (Durham)</option>
                      <option value="Whitby">Whitby (Durham)</option>
                      <option value="Pickering">Pickering (Durham)</option>
                      <option value="Ajax">Ajax (Durham)</option>
                      <option value="Markham">Markham (York)</option>
                      <option value="Richmond Hill">Richmond Hill (York)</option>
                      <option value="Toronto">Toronto / East York / Scarborough</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-800 mb-1">
                      Dwelling Type
                    </label>
                    <select
                      value={residenceType}
                      onChange={(e) => setResidenceType(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer"
                    >
                      <option value="detached">Single Detached Home</option>
                      <option value="semi">Semi-Detached Home</option>
                      <option value="townhouse">Townhouse</option>
                      <option value="apartment">Apartment / Condo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-800 mb-1">
                      Ownership Status
                    </label>
                    <select
                      value={ownsHome ? 'owns' : 'rents'}
                      onChange={(e) => setOwnsHome(e.target.value === 'owns')}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer"
                    >
                      <option value="owns">Homeowner</option>
                      <option value="rents">Tenant / Renting (Landlord consent required)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Capacity & Safety Screening */}
              <div className="space-y-4">
                <div className="border-b-2 border-slate-900 pb-2 flex items-center justify-between">
                  <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[11px] flex items-center justify-center font-bold">3</span>
                    <span>{sec3?.title || 'Section 3: Capacity & Safety Screening'}</span>
                  </h2>
                  <span className="text-[10px] font-black text-slate-500 uppercase">Step 3 of 4</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-800 mb-1">
                      First Aid & CPR Certification <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={firstAidLevel}
                      onChange={(e) => setFirstAidLevel(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer"
                    >
                      <option value="Standard First Aid & CPR Level C (Current)">Standard First Aid & CPR Level C (Current)</option>
                      <option value="Emergency First Aid (Renewal Needed)">Emergency First Aid (Renewal Needed)</option>
                      <option value="Registered Early Childhood Educator (RECE)">Registered Early Childhood Educator (RECE)</option>
                      <option value="Not Yet Certified (Willing to complete)">Not Yet Certified (Willing to complete)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-800 mb-1">
                      Own Children Under Age 6 in Care <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={ownChildrenCount}
                      onChange={(e) => setOwnChildrenCount(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer"
                    >
                      <option value={0}>0 (No children under 6 residing at home)</option>
                      <option value={1}>1 Child under age 6</option>
                      <option value={2}>2 Children under age 6</option>
                      <option value={3}>3+ Children under age 6</option>
                    </select>
                    <p className="text-[10px] text-slate-500 mt-1 font-medium">Under CCEYA s. 8, own children under age 4 (or under 6 under agency contract) count towards max 6 capacity.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-800 mb-1">
                      Adult Residents (Age 18+) in Home <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={householdAdults}
                      onChange={(e) => setHouseholdAdults(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer"
                    >
                      <option value={1}>1 Adult (Provider only)</option>
                      <option value={2}>2 Adults (e.g. Spouse / Partner)</option>
                      <option value={3}>3 Adults (e.g. Adult child or parent)</option>
                      <option value={4}>4+ Adults residing in home</option>
                    </select>
                    <p className="text-[10px] text-slate-500 mt-1 font-medium">All adults aged 18+ must provide a clear Vulnerable Sector Police Check.</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">
                    Existing Children or Families Seeking Immediate Care (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={transitionNotes}
                    onChange={(e) => setTransitionNotes(e.target.value)}
                    placeholder="e.g. Currently caring for 2 neighborhood children privately who wish to enroll with ACCS..."
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

              {/* Dynamic Custom Fields Added via AI Assistant / Form Builder Studio */}
              {nonSec4CustomFields.length > 0 && (
                <div className="pt-2 border-t-2 border-purple-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span className="font-extrabold text-xs text-slate-900">
                      Additional Provider Onboarding Inquiries (Dynamic Form Schema)
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {nonSec4CustomFields.map(field => (
                      <div key={field.id} className={field.gridCols === 1 ? 'sm:col-span-2' : ''}>
                        {field.type === 'consent_clause' || field.type === 'checkbox' ? (
                          <label className="flex items-start gap-3 p-3.5 bg-purple-50/70 border border-purple-300 rounded-xl cursor-pointer hover:bg-purple-100/60 transition-colors">
                            <input
                              type="checkbox"
                              checked={Boolean(customFieldValues[field.name])}
                              onChange={(e) => setCustomFieldValues(prev => ({ ...prev, [field.name]: e.target.checked }))}
                              required={field.required}
                              className="w-5 h-5 text-purple-600 mt-0.5 rounded focus:ring-purple-500 border-2 border-slate-900 cursor-pointer"
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
                            <label className="block text-xs font-black text-slate-800 mb-1">
                              {field.label} {field.required && '*'}
                            </label>
                            {field.type === 'textarea' ? (
                              <textarea
                                rows={2}
                                placeholder={field.placeholder || `Enter ${field.label}`}
                                value={customFieldValues[field.name] || ''}
                                onChange={(e) => setCustomFieldValues(prev => ({ ...prev, [field.name]: e.target.value }))}
                                required={field.required}
                                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                              />
                            ) : field.type === 'dropdown' && field.options ? (
                              <select
                                value={customFieldValues[field.name] || ''}
                                onChange={(e) => setCustomFieldValues(prev => ({ ...prev, [field.name]: e.target.value }))}
                                required={field.required}
                                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer"
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
                                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                              />
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 4: Mandatory Safety Declarations */}
              <div className="space-y-4 bg-purple-50/50 p-4 sm:p-5 rounded-2xl border border-purple-200">
                <div className="border-b border-purple-200 pb-2">
                  <h2 className="text-xs font-black text-purple-950 uppercase tracking-wide flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-purple-700" />
                    <span>{sec4?.title || 'Section 4: Safety Declarations & Consents'}</span>
                  </h2>
                </div>

                <div className="space-y-3">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={fencedYardConsent}
                      onChange={(e) => setFencedYardConsent(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                    />
                    <span className="text-xs text-slate-800 font-medium leading-normal">
                      {fencedConsentField?.label || 'Fenced Outdoor Play Area Confirmation: I confirm my home facility has access to a secure, safely fenced outdoor play area or approved local park space with zero unprotected water hazards.'} <span className="text-rose-500">*</span>
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={cceyaConsent}
                      onChange={(e) => setCceyaConsent(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                    />
                    <span className="text-xs text-slate-800 font-medium leading-normal">
                      {cceyaConsentField?.label || 'Agency Oversight & Inspection Consent: I agree to comply with licensed child care ratios, maintain safe home standards, and welcome unannounced quarterly inspections by an ACCS RECE Home Visitor.'} <span className="text-rose-500">*</span>
                    </span>
                  </label>

                  {/* Any custom consent clauses added directly to Section 4 (e.g. via AI Assistant or Form Builder Studio) */}
                  {sec4CustomFields.map(field => (
                    <label key={field.id} className="flex items-start gap-2.5 cursor-pointer pt-2 border-t border-purple-200">
                      <input
                        type="checkbox"
                        required={field.required}
                        checked={Boolean(customFieldValues[field.name])}
                        onChange={(e) => setCustomFieldValues(prev => ({ ...prev, [field.name]: e.target.checked }))}
                        className="mt-0.5 w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                      />
                      <div className="text-xs text-slate-800 leading-normal">
                        <span className="font-semibold block text-slate-900">
                          {field.label} {field.required && <span className="text-rose-500">*</span>}
                        </span>
                        {field.helpText && (
                          <span className="text-[11px] text-slate-500 block mt-0.5 font-normal">
                            {field.helpText}
                          </span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit Action */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t-2 border-slate-900">
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <Lock className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>Secure Canadian cloud data residency (PIPEDA / PHIPA Compliant).</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-xs font-black shadow-neo border-2 border-slate-900 transition-all hover:translate-x-0.5 hover:translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
                >
                  <Home className="w-4 h-4 text-purple-200" />
                  <span>{isSubmitting ? 'Submitting Application...' : 'Submit Provider Application (PROV-0)'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};
