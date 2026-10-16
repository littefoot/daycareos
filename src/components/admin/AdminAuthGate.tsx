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
  Laptop,
  Send,
  RefreshCw,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { AccsLogo } from '../AccsLogo';
import { doc, setDoc } from '../../lib/clientDb';
import { sendMagicLinkEmail, signInWithGoogleOAuth } from '../../lib/firebaseAuth';
import { syncLeadToMaster } from '../../services/leadSyncService';

interface AdminAuthGateProps {
  onSuccess: (userData?: { email: string; name: string; provider: 'google' | 'email' }) => void;
  onCancelToParent?: () => void;
}

export const AdminAuthGate: React.FC<AdminAuthGateProps> = ({
  onSuccess,
  onCancelToParent
}) => {
  // 'input' = initial entry, 'sent' = magic link dispatched, waiting for user click
  const [step, setStep] = useState<'input' | 'sent'>('input');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [organization, setOrganization] = useState('');
  const [joinMailingList, setJoinMailingList] = useState(true);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Helper to persist verified lead to mailing list & local database
  const recordLead = (leadData: {
    email: string;
    name: string;
    organization?: string;
    provider: 'google' | 'email';
    verified: boolean;
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
        // Prevent duplicate consecutive entries
        const filtered = list.filter((l: any) => l.email !== leadData.email);
        filtered.unshift(record);
        localStorage.setItem('daycare_os_mailing_list_leads', JSON.stringify(filtered));

        // 2. Set active session
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

    // 4. Synchronize immediately to Protoss 2027 Master CRM
    syncLeadToMaster({
      email: leadData.email,
      name: leadData.name,
      organization: leadData.organization,
      source: 'daycare-os-demo',
      verified: leadData.verified,
      provider: leadData.provider,
      subscribed: leadData.subscribed
    }).catch(() => {});

    return record;
  };

  // Handle Google OAuth Sign-In (Direct Cryptographic Verification)
  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await signInWithGoogleOAuth();
      if (res.success && res.email) {
        const userEmail = res.email || 'verified_google_user@gmail.com';
        const userName = res.name || userEmail.split('@')[0];
        
        recordLead({
          email: userEmail,
          name: userName,
          organization: 'Google Account',
          provider: 'google',
          verified: true,
          subscribed: true
        });

        onSuccess({ email: userEmail, name: userName, provider: 'google' });
      } else if (res.error) {
        setErrorMessage(res.error);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Google Sign-In failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Magic Link Dispatch
  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMessage('Please enter a valid work or personal email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Store pending info so when they click magic link we retain their name/org
      if (typeof window !== 'undefined') {
        localStorage.setItem('daycare_os_pending_name', fullName.trim() || cleanEmail.split('@')[0]);
        localStorage.setItem('daycare_os_pending_org', organization.trim() || 'Evaluator');
        localStorage.setItem('daycare_os_pending_subscribed', String(joinMailingList));
      }

      const res = await sendMagicLinkEmail(cleanEmail);
      if (res.success) {
        setStep('sent');
        setSuccessNotice(`Magic link dispatched to ${cleanEmail}`);
      } else {
        setErrorMessage(res.error || 'Failed to dispatch magic link. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Unexpected network error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend Magic Link
  const handleResendMagicLink = async () => {
    if (!email) return;
    setIsResending(true);
    setErrorMessage(null);
    try {
      const res = await sendMagicLinkEmail(email.trim().toLowerCase());
      if (res.success) {
        setSuccessNotice(`New magic link dispatched! Please check your spam folder if delayed.`);
      } else {
        setErrorMessage(res.error || 'Failed to resend email.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resend email.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white border-2 border-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-neo relative my-auto space-y-6">
        
        {/* Top Header Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AccsLogo size="sm" />
            <span className="text-[11px] font-black uppercase tracking-wider bg-orange-100 text-orange-900 border border-orange-300 px-2 py-0.5 rounded-full">
              Demo Access Gate
            </span>
          </div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            CloudJ.ca
          </span>
        </div>

        {/* State 1: Input Credentials */}
        {step === 'input' ? (
          <>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>Unlock DaycareOS Demo</span>
                <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Experience the live licensed child care operations suite, real-time CCEYA ratios, and parent intake CRM.
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="bg-rose-50 border-2 border-rose-300 text-rose-800 p-3 rounded-xl text-xs font-bold flex items-start gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Fast Google 1-Click Verification */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
                className="w-full neo-btn bg-white hover:bg-slate-50 text-slate-900 py-3 px-4 font-black text-xs border-2 border-slate-900 shadow-neo-sm hover:shadow-neo flex items-center justify-center gap-3 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                <span>{isSubmitting ? 'Authenticating with Google...' : 'Continue with Google'}</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded border border-emerald-300">
                  Instant
                </span>
              </button>

              {/* Visual Divider */}
              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[10px] font-black uppercase text-slate-400 tracking-wider shrink-0">
                  Or Email Magic Link
                </span>
                <div className="border-t border-slate-200 w-full" />
              </div>
            </div>

            {/* Magic Link Request Form */}
            <form onSubmit={handleSendMagicLink} className="space-y-3.5">
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
                    placeholder="name@organization.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-900 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700">
                    Your Name
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Sarah M."
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border-2 border-slate-900 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700">
                    Organization
                  </label>
                  <div className="relative">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="e.g. Sunshine Care"
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border-2 border-slate-900 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Mailing list opt-in */}
              <label className="flex items-start gap-2 pt-0.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={joinMailingList}
                  onChange={(e) => setJoinMailingList(e.target.checked)}
                  className="mt-0.5 rounded border-2 border-slate-900 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-[10px] font-bold text-slate-600 leading-tight">
                  Receive product updates, architectural breakdowns & demo releases from CloudJ.ca.
                </span>
              </label>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={!email.trim() || isSubmitting}
                className="w-full neo-btn bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white py-3 px-4 font-black text-xs gap-2 shadow-neo-sm hover:shadow-neo flex items-center justify-center transition-all cursor-pointer mt-1"
              >
                <Send className="w-4 h-4 text-orange-400" />
                <span>{isSubmitting ? 'Sending Magic Link...' : 'Email Me A Magic Link'}</span>
              </button>
            </form>

            <div className="text-center pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-400 text-[11px]">
                Instant verification available via <strong className="text-slate-600">Google Sign-In</strong> above.
              </span>
            </div>
          </>
        ) : (
          /* State 2: Check Your Inbox */
          <div className="space-y-5 animate-fadeIn">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-orange-100 border-2 border-slate-900 rounded-3xl mx-auto flex items-center justify-center shadow-neo-sm">
                <Mail className="w-8 h-8 text-orange-600 animate-bounce" />
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Check Your Inbox</h3>
                <p className="text-xs text-slate-600 mt-1">
                  We emailed a cryptographic passwordless sign-in link to:
                </p>
                <div className="inline-block mt-2 bg-slate-100 border-2 border-slate-900 px-3 py-1.5 rounded-xl font-mono text-xs font-black text-slate-900 break-all">
                  {email}
                </div>
              </div>
            </div>

            {/* Instruction steps */}
            <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 space-y-2.5 text-xs">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                <span className="text-slate-700 font-bold">Open the email from <strong>DaycareOS (Firebase)</strong> in your inbox.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                <span className="text-slate-700 font-bold">Click the <strong>Sign In</strong> link inside the email.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                <span className="text-slate-700 font-bold">Your browser will instantly unlock full access to the demo!</span>
              </div>
            </div>

            {/* Success or Error Notice */}
            {successNotice && (
              <div className="bg-emerald-50 border-2 border-emerald-300 text-emerald-800 p-2.5 rounded-xl text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successNotice}</span>
              </div>
            )}
            {errorMessage && (
              <div className="bg-rose-50 border-2 border-rose-300 text-rose-800 p-2.5 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleResendMagicLink}
                disabled={isResending}
                className="w-full neo-btn bg-white hover:bg-slate-50 text-slate-800 py-2.5 px-4 font-extrabold text-xs border-2 border-slate-900 shadow-neo-sm hover:shadow-neo flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                <span>{isResending ? 'Resending...' : 'Resend Magic Link'}</span>
              </button>

              <button
                type="button"
                onClick={() => setStep('input')}
                className="w-full text-center text-xs font-black text-slate-500 hover:text-slate-900 py-1.5 cursor-pointer"
              >
                Use a different email address
              </button>
            </div>

            <div className="text-center pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-500 text-[11px] font-medium">
                Link expires in 15 minutes. Check spam or junk folder if delayed.
              </span>
            </div>
          </div>
        )}

        {/* Security / Privacy Footnote */}
        <div className="pt-2 border-t border-slate-100 text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Zero-Trust Verification • In-Browser Reactive Sandbox</span>
          </div>
          <p className="text-[10px] text-slate-400">
            Powered by Google Identity Platform on project daycare-os-2026. Real client records remain 100% air-gapped.
          </p>
        </div>

      </div>
    </div>
  );
};
