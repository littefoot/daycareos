import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  ShieldCheck, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Mail, 
  Award, 
  Car, 
  FileCheck2, 
  AlertCircle, 
  Lock, 
  ArrowRight,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { AccsLogo } from '../AccsLogo';
import { HomeVisitorApplicant } from '../../types';
import { FormTemplate } from '../../types/formSchema';
import { INITIAL_HOME_VISITOR_FORMS } from '../../data/homeVisitorFormsData';

interface PublicVisitorApplyPageProps {
  formsList?: FormTemplate[];
  onAddApplicant?: (applicant: HomeVisitorApplicant) => void;
  onNavigateToParentApply?: () => void;
  onNavigateToAdmin?: () => void;
}

export const PublicVisitorApplyPage: React.FC<PublicVisitorApplyPageProps> = ({
  formsList,
  onAddApplicant,
  onNavigateToParentApply,
  onNavigateToAdmin
}) => {
  // Live HV-0 Dynamic Schema Resolution (Synced with Firestore & AI Assistant)
  const visForm = formsList?.find(f => f.id === 'vis-form-0') || INITIAL_HOME_VISITOR_FORMS.find(f => f.id === 'vis-form-0');
  // Form State
  const [applicantName, setApplicantName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [receNumber, setReceNumber] = useState('');
  const [receGoodStanding, setReceGoodStanding] = useState(true);
  const [firstAidCertified, setFirstAidCertified] = useState(true);
  const [vscCleared, setVscCleared] = useState(true);
  const [hasVehicle, setHasVehicle] = useState(true);
  const [assignedRegion, setAssignedRegion] = useState<'Durham South' | 'Durham North' | 'York/Toronto'>('Durham South');
  const [experienceYears, setExperienceYears] = useState('3-5');
  const [experienceNotes, setExperienceNotes] = useState('');

  // Submission State
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [referenceCode, setReferenceCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receNumber.trim()) {
      alert('Please enter your valid College of Early Childhood Educators (RECE) Registration Number.');
      return;
    }

    setIsSubmitting(true);

    const cleanRece = receNumber.trim().toUpperCase().startsWith('RECE') 
      ? receNumber.trim().toUpperCase() 
      : `RECE #${receNumber.trim().replace(/^#+/, '')}`;

    const generatedCode = `ACCS-VIS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setReferenceCode(generatedCode);

    const newApplicant: HomeVisitorApplicant = {
      id: `vis-app-${Date.now()}`,
      applicantName: `${applicantName.trim()}, RECE`,
      email: email.trim(),
      phone: phone.trim(),
      appliedDate: new Date().toISOString().split('T')[0],
      stage: 'screening',
      receNumber: cleanRece,
      receGoodStanding,
      vscCleared,
      firstAidCertified,
      cceyaChecklistTrainingComplete: false,
      shadowInspectionsCount: 0,
      assignedRegion,
      notes: experienceNotes.trim()
        ? `[Public Onboarding VIS-0] ${experienceYears} yrs experience. ${experienceNotes.trim()}`
        : `[Public Onboarding VIS-0] Applied for RECE Home Visitor role. Ref: ${generatedCode}`
    };

    // Update Local Storage
    try {
      const existingRaw = localStorage.getItem('accs_visitor_applicants');
      const existingList = existingRaw ? JSON.parse(existingRaw) : [];
      const updatedList = [newApplicant, ...existingList];
      localStorage.setItem('accs_visitor_applicants', JSON.stringify(updatedList));
    } catch (e) {
      console.warn('Failed to update local storage for visitor applicant', e);
    }

    if (onAddApplicant) {
      onAddApplicant(newApplicant);
    }

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
                  All Child Care Solutions (ACCS)
                </span>
                <span className="bg-blue-100 text-blue-900 text-[10px] font-black px-2 py-0.5 rounded-full border border-blue-300 uppercase">
                  Form VIS-0
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Registered Early Childhood Educator (RECE) Home Visitor Employment Application
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
                <span>Parent Inquiry</span>
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
              <span className="text-[11px] font-black uppercase tracking-wider text-blue-800 bg-blue-100 border border-blue-300 px-3 py-1 rounded-full inline-block">
                Application Logged in Agency Pipeline
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                Application Received, {applicantName.split(' ')[0]}!
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                Your RECE Home Visitor employment application has been submitted to the ACCS Supervisory and Licensing Directorate.
              </p>
            </div>

            {/* Reference Badge */}
            <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-4 max-w-md mx-auto space-y-1">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                Application Tracking Reference
              </span>
              <div className="text-lg sm:text-xl font-mono font-black text-blue-900">
                {referenceCode}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {receNumber.trim().toUpperCase().startsWith('RECE') ? receNumber : `RECE #${receNumber}`} • Assigned: {assignedRegion}
              </p>
            </div>

            {/* 4-Step Visitor Onboarding Roadmap */}
            <div className="text-left bg-blue-50/70 border border-blue-200 rounded-2xl p-4 sm:p-6 space-y-3">
              <h2 className="text-xs font-black text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-700" />
                <span>RECE Home Visitor Onboarding Path</span>
              </h2>
              <ol className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <li className="p-3 bg-white border border-blue-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-black text-blue-600 uppercase">Step 1 • Registry Verification</span>
                  <p className="font-bold text-slate-900">College of ECE Audit</p>
                  <p className="text-[11px] text-slate-600 font-medium">The Agency Director verifies active standing on the Ontario College of ECE public registry.</p>
                </li>
                <li className="p-3 bg-white border border-blue-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-black text-blue-600 uppercase">Step 2 • Supervisory Interview</span>
                  <p className="font-bold text-slate-900">Clinical & Pedagogical Fit</p>
                  <p className="text-[11px] text-slate-600 font-medium">Discussion on CCEYA s. 26 inspection protocols and How Does Learning Happen? pedagogical coaching.</p>
                </li>
                <li className="p-3 bg-white border border-blue-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-black text-blue-600 uppercase">Step 3 • Shadow Inspections</span>
                  <p className="font-bold text-slate-900">2 Required Co-Visits</p>
                  <p className="text-[11px] text-slate-600 font-medium">Shadowing a Senior RECE Visitor through a 40-page Ministry checklist inspection in a licensed home.</p>
                </li>
                <li className="p-3 bg-white border border-blue-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-black text-blue-600 uppercase">Step 4 • Roster Activation</span>
                  <p className="font-bold text-slate-900">Digital Field Tablet Access</p>
                  <p className="text-[11px] text-slate-600 font-medium">Credentialing with digital field inspection tools, 90-day unannounced calendar, and assigned homes.</p>
                </li>
              </ol>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-slate-50 border-2 border-slate-900 rounded-xl text-xs font-black shadow-neo-sm transition-transform active:translate-y-0.5 cursor-pointer"
              >
                Print / Save Receipt
              </button>
              {onNavigateToAdmin && (
                <button
                  type="button"
                  onClick={onNavigateToAdmin}
                  className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white border-2 border-slate-900 rounded-xl text-xs font-black shadow-neo-sm transition-transform active:translate-y-0.5 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Return to Staff Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Application Form */
          <div className="space-y-6">
            {/* Hero Card */}
            <div className="bg-white border-2 border-slate-900 rounded-3xl p-5 sm:p-8 shadow-neo space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-blue-800 bg-blue-100 border border-blue-300 px-3 py-0.5 rounded-full inline-flex items-center gap-1">
                  <Award className="w-3 h-3 text-blue-600" />
                  <span>Licensed Agency Employment Opportunity</span>
                </span>
                <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-300">
                  CCEYA Section 26 Field Oversight
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                Apply as an RECE Home Child Care Visitor
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                ACCS employs qualified Registered Early Childhood Educators (RECEs) to oversee licensed home child care premises across Durham Region, York Region, and Toronto. Home Visitors conduct unannounced quarterly inspections (every 90 days), verify mixed-age ratios, coach providers on positive behaviour guidance, and safeguard child well-being.
              </p>
            </div>

            {/* Application Form */}
            <form onSubmit={handleSubmit} className="bg-white border-2 border-slate-900 rounded-3xl p-5 sm:p-8 shadow-neo space-y-8">
              {/* Section 1: RECE Identity & Contact */}
              <div className="space-y-4">
                <div className="border-b-2 border-slate-900 pb-2 flex items-center justify-between">
                  <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center font-bold">1</span>
                    <span>RECE Identity & Contact Information</span>
                  </h2>
                  <span className="text-[10px] font-black text-slate-500 uppercase">Step 1 of 3</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-800 mb-1">
                      Legal Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      placeholder="e.g. Sabrina Vance"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-800 mb-1">
                      Contact Cell Phone <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. (905) 555-8841"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-black text-slate-800 mb-1">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. sabrina.vance@example.com"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: College of Early Childhood Educators Credentials */}
              <div className="space-y-4">
                <div className="border-b-2 border-slate-900 pb-2 flex items-center justify-between">
                  <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center font-bold">2</span>
                    <span>College of ECE Registration & Clearances</span>
                  </h2>
                  <span className="text-[10px] font-black text-slate-500 uppercase">Step 2 of 3</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-800 mb-1">
                      College of ECE Registration Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={receNumber}
                      onChange={(e) => setReceNumber(e.target.value)}
                      placeholder="e.g. RECE #44192 or 44192"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-800 mb-1">
                      ECE Professional Experience
                    </label>
                    <select
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                    >
                      <option value="1-2">1–2 Years (Licensed Child Care)</option>
                      <option value="3-5">3–5 Years (Centre or Home Care)</option>
                      <option value="6-10">6–10 Years (Experienced Practitioner)</option>
                      <option value="10+">10+ Years (Senior Pedagogical Leader)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-800 mb-1">
                      Preferred Travel / Inspection Region <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={assignedRegion}
                      onChange={(e) => setAssignedRegion(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                    >
                      <option value="Durham South">Durham South (Oshawa / Whitby / Ajax / Pickering)</option>
                      <option value="Durham North">Durham North (Scugog / Uxbridge / Brock)</option>
                      <option value="York/Toronto">York Region / Toronto (Markham, Scarborough, East York)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-800 mb-1">
                      Standard First Aid & CPR Level C <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={firstAidCertified ? 'certified' : 'pending'}
                      onChange={(e) => setFirstAidCertified(e.target.value === 'certified')}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                    >
                      <option value="certified">Valid Current Level C (Certified)</option>
                      <option value="pending">In Progress / Renewal Scheduled</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Statutory Readiness Declarations */}
              <div className="space-y-4 bg-blue-50/50 p-4 sm:p-5 rounded-2xl border border-blue-200">
                <div className="border-b border-blue-200 pb-2">
                  <h2 className="text-xs font-black text-blue-950 uppercase tracking-wide flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-700" />
                    <span>Statutory CCEYA Compliance & Employment Readiness</span>
                  </h2>
                </div>

                <div className="space-y-3">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={receGoodStanding}
                      onChange={(e) => setReceGoodStanding(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs text-slate-800 font-medium leading-normal">
                      <strong>Good Standing Declaration:</strong> I confirm I am a member in continuous good standing with the College of Early Childhood Educators of Ontario, free of disciplinary conditions or practice restrictions. <span className="text-rose-500">*</span>
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={vscCleared}
                      onChange={(e) => setVscCleared(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs text-slate-800 font-medium leading-normal">
                      <strong>Vulnerable Sector Police Check:</strong> I have a current clear Police Vulnerable Sector Check (issued within the past 6 months) or agree to obtain one prior to entering any licensed child care premises. <span className="text-rose-500">*</span>
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={hasVehicle}
                      onChange={(e) => setHasVehicle(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs text-slate-800 font-medium leading-normal">
                      <strong>Driver's License & Mobility:</strong> I possess a valid Ontario G Driver's License and reliable vehicle access to conduct unannounced on-site inspections at licensed home premises in my assigned region. <span className="text-rose-500">*</span>
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  Licensing Experience or Additional Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={experienceNotes}
                  onChange={(e) => setExperienceNotes(e.target.value)}
                  placeholder="e.g. Familiarity with the 40-page Ministry checklist, CCEYA mixed-age ratios, infant safe sleep verification, and pedagogical coaching..."
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Submit Action */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t-2 border-slate-900">
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <Lock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Confidential employment intake stored under Canadian privacy standards.</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black shadow-neo border-2 border-slate-900 transition-all hover:translate-x-0.5 hover:translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
                >
                  <ClipboardCheck className="w-4 h-4 text-blue-200" />
                  <span>{isSubmitting ? 'Submitting Application...' : 'Submit RECE Application (VIS-0)'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};
