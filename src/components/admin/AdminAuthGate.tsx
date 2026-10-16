import React, { useState } from 'react';
import { 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Building2, 
  User, 
  Check, 
  Laptop
} from 'lucide-react';
import { AccsLogo } from '../AccsLogo';
import { doc, setDoc } from '../../lib/clientDb';

interface AdminAuthGateProps {
  onSuccess: (userData?: { email: string; name: string; provider: 'google' | 'email' | 'guest' }) => void;
  onCancelToParent?: () => void;
}

export const AdminAuthGate: React.FC<AdminAuthGateProps> = ({
  onSuccess,
  onCancelToParent
}) => {
  const [authMode, setAuthMode] = useState<'standard' | 'google_prompt'>('standard');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [organization, setOrganization] = useState('');
  const [joinMailingList, setJoinMailingList] = useState(true);
  
  // Google specific prompt state
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Helper to persist lead to mailing list
  const recordLead = (leadData: {
    email: string;
    name: string;
    organization?: string;
    provider: 'google' | 'email' | 'guest';
    subscribed: boolean;
  }) => {
    const timestamp = new Date().toISOString();
    const leadId = `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    const record = {
      id: leadId,
      ...leadData,
      source: 'daycare_os_portfolio_demo',
      createdAt: timestamp,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
    };

    if (typeof window !== 'undefined') {
      try {
        // 1. Save to local storage mailing list array
        const raw = localStorage.getItem('daycare_os_mailing_list_leads');
        const list = raw ? JSON.parse(raw) : [];
        list.unshift(record);
        localStorage.setItem('daycare_os_mailing_list_leads', JSON.stringify(list));

        // 2. Set current active session
        localStorage.setItem('daycare_os_user_email', leadData.email);
        localStorage.setItem('daycare_os_user_name', leadData.name);
        localStorage.setItem('daycare_os_auth_provider', leadData.provider);
        sessionStorage.setItem('daycare_os_session_active', 'true');
      } catch (e) {
        console.warn('Failed to save lead to local storage:', e);
      }
    }

    // 3. Save into client database collection for in-app reactive visibility
    try {
      setDoc(doc(null, 'mailing_list_leads', leadId), record).catch(() => {});
    } catch (e) {}

    return record;
  };

  // Handle Work Email Submission
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage('Verifying credentials & granting demo access...');

    const cleanName = fullName.trim() || cleanEmail.split('@')[0];
    recordLead({
      email: cleanEmail,
      name: cleanName,
      organization: organization.trim() || 'Independent Evaluator',
      provider: 'email',
      subscribed: joinMailingList
    });

    setTimeout(() => {
      onSuccess({ email: cleanEmail, name: cleanName, provider: 'email' });
    }, 600);
  };

  // Handle Google Sign-In Simulation
  const handleGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = googleEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter your Google account email.');
      return;
    }

    setIsSubmitting(true);
    const cleanName = googleName.trim() || cleanEmail.split('@')[0];
    recordLead({
      email: cleanEmail,
      name: cleanName,
      provider: 'google',
      subscribed: true
    });

    setTimeout(() => {
      onSuccess({ email: cleanEmail, name: cleanName, provider: 'google' });
    }, 600);
  };

  // Handle Instant Guest Access
  const handleGuestAccess = () => {
    recordLead({
      email: 'guest@daycare-os.ca',
      name: 'Guest Evaluator',
      organization: 'Portfolio Preview',
      provider: 'guest',
      subscribed: false
    });
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('daycare_os_guest_access', 'true');
      } catch (e) {}
    }
    onSuccess({ email: 'guest@daycare-os.ca', name: 'Guest Evaluator', provider: 'guest' });
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="bg-white border-2 border-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-neo space-y-6 animate-scaleUp">
        
        {/* Header Branding */}
        <div className="text-center space-y-3 pb-4 border-b-2 border-slate-100">
          <div className="flex justify-center mb-1">
            <AccsLogo size="lg" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 border-2 border-slate-900 rounded-full text-[11px] font-black text-orange-700 shadow-neo-sm">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span>INTERACTIVE DEMO ACCESS</span>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Sign In to Experience DaycareOS
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
              Experience the full Ontario CCEYA compliance suite, 2-tap attendance, admissions CRM, and dynamic form studio.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border-2 border-red-500 rounded-2xl flex items-center gap-2.5 text-xs text-red-900 font-bold animate-fadeIn">
            <span className="text-red-600 font-black">!</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Notice */}
        {successMessage && (
          <div className="p-3 bg-emerald-50 border-2 border-emerald-500 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-900 font-bold animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {authMode === 'standard' ? (
          <div className="space-y-5">
            {/* 1. Continue with Google Button */}
            <button
              type="button"
              onClick={() => setAuthMode('google_prompt')}
              disabled={isSubmitting}
              className="w-full neo-btn bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-900 py-3 px-4 font-black text-sm shadow-neo-sm hover:shadow-neo flex items-center justify-center gap-3 transition-all cursor-pointer"
            >
              {/* Google 4-Color SVG Icon */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t-2 border-slate-200 w-full" />
              <span className="bg-white px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 absolute">
                Or Sign In with Email
              </span>
            </div>

            {/* 2. Email Sign-In Form (Lead Capture) */}
            <form onSubmit={handleEmailSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Sarah Connor"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-900 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700">
                  Work / Personal Email <span className="text-orange-600">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. sarah@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-900 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700">
                  Organization / Role <span className="text-slate-400 font-medium">(Optional)</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. Sunshine Child Care / Evaluator"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-900 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Mailing list opt-in checkbox */}
              <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={joinMailingList}
                  onChange={(e) => setJoinMailingList(e.target.checked)}
                  className="mt-0.5 rounded border-2 border-slate-900 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-[11px] font-bold text-slate-600 leading-tight">
                  Receive product updates, architectural breakdowns, and demo insights from CloudJ.ca.
                </span>
              </label>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={!email.trim() || isSubmitting}
                className="w-full neo-btn bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white py-3 px-4 font-black text-sm gap-2 shadow-neo-sm hover:shadow-neo flex items-center justify-center transition-all cursor-pointer mt-2"
              >
                <span>{isSubmitting ? 'Accessing Demo...' : 'Enter Interactive Demo'}</span>
                <ArrowRight className="w-4 h-4 text-orange-400" />
              </button>
            </form>

            {/* Fast Guest Access Link */}
            <div className="text-center pt-1 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">Just evaluating the tech?</span>
              <button
                type="button"
                onClick={handleGuestAccess}
                className="text-[11px] font-black text-orange-600 hover:text-orange-700 underline cursor-pointer"
              >
                Explore as Guest →
              </button>
            </div>
          </div>
        ) : (
          /* Google Account Sign-In Prompt */
          <form onSubmit={handleGoogleSubmit} className="space-y-4 animate-fadeIn">
            <div className="bg-slate-50 border-2 border-slate-200 p-4 rounded-2xl space-y-3">
              <div className="flex items-center gap-2.5">
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <div>
                  <h4 className="text-xs font-black text-slate-900">Google Account Sign-In</h4>
                  <p className="text-[10px] text-slate-500">Fast sign-in with your Google profile</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-slate-600">
                  Google Email
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  placeholder="your.name@gmail.com"
                  className="w-full px-3 py-2 bg-white border-2 border-slate-900 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-slate-600">
                  Your Name
                </label>
                <input
                  type="text"
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-3 py-2 bg-white border-2 border-slate-900 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAuthMode('standard')}
                className="neo-btn bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 px-4 font-extrabold text-xs border-2 border-slate-900 cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!googleEmail.trim() || isSubmitting}
                className="flex-1 neo-btn bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 font-black text-xs border-2 border-slate-900 shadow-neo-sm hover:shadow-neo flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isSubmitting ? 'Authenticating...' : 'Sign in with Google'}</span>
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

        {/* Security / Privacy Footnote */}
        <div className="pt-3 border-t border-slate-100 text-center space-y-1.5">
          <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Client Privacy Protected • In-Browser Reactive Sandbox</span>
          </div>
          <p className="text-[10px] text-slate-400">
            Real client data & child records are completely air-gapped. Customer emails are collected for product updates only.
          </p>
        </div>

      </div>
    </div>
  );
};
