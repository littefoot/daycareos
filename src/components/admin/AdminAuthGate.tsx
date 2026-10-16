import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ArrowRight, KeyRound, AlertCircle, ShieldCheck } from 'lucide-react';
import { AccsLogo } from '../AccsLogo';

interface AdminAuthGateProps {
  onSuccess: () => void;
  onCancelToParent?: () => void;
}

export const AdminAuthGate: React.FC<AdminAuthGateProps> = ({
  onSuccess,
  onCancelToParent
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const inputClean = password.trim().toLowerCase();
    // Accept either doubleve123 or accs2026
    if (inputClean === 'doubleve123' || inputClean === 'accs2026') {
      try {
        sessionStorage.setItem('accs_admin_authenticated', 'true');
        sessionStorage.setItem('accs_site_authenticated', 'true');
        localStorage.setItem('accs_admin_session_active', 'true');
        localStorage.setItem('accs_site_authenticated', 'true');
      } catch (err) {}
      onSuccess();
    } else {
      setErrorMessage('Incorrect security password. Access is restricted to authorized personnel.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="bg-white border-2 border-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-neo space-y-6 animate-scaleUp">
        {/* Header Branding */}
        <div className="text-center space-y-3 pb-4 border-b-2 border-slate-100">
          <div className="flex justify-center mb-2">
            <AccsLogo size="md" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 border-2 border-slate-900 rounded-full text-[11px] font-black text-orange-700 shadow-neo-sm">
            <Lock className="w-3.5 h-3.5 text-orange-500" />
            <span>PROTECTED STAGING PREVIEW</span>
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">All Child Care Solutions</h2>
            <p className="text-xs text-slate-500 mt-1">
              Restricted client staging preview for the Agency Director & authorized agency operations. Enter the password to unlock the site.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border-2 border-red-500 rounded-2xl flex items-start gap-2.5 text-xs text-red-900 font-bold animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
              Agency Access Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                autoFocus
                placeholder="Enter access password..."
                className="w-full pl-4 pr-11 py-3 bg-slate-50 border-2 border-slate-900 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 p-1"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              CCEYA compliance & parent/provider health records are protected.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!password.trim() || isSubmitting}
            className="w-full neo-btn bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 font-extrabold text-sm gap-2 shadow-neo-sm flex items-center justify-center cursor-pointer"
          >
            <KeyRound className="w-4 h-4 text-orange-400" />
            <span>{isSubmitting ? 'Authenticating...' : 'Unlock Site Access'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Security / Compliance Footnote */}
        <div className="pt-4 border-t border-slate-100 text-center">
          <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Canadian PIPEDA / PHIPA Data Residency Enforced</span>
          </div>
          {onCancelToParent && (
            <div className="mt-2">
              <button
                type="button"
                onClick={onCancelToParent}
                className="text-[11px] text-slate-400 hover:text-orange-600 font-bold underline cursor-pointer"
              >
                Return
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
