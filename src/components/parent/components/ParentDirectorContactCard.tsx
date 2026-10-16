import React from 'react';
import { Mail, Phone } from 'lucide-react';
import { AGENCY_PHONE, AGENCY_PHONE_TEL, AGENCY_PAYMENT_EMAIL } from '../../../config/agencyConfig';

export interface ParentDirectorContactCardProps {
  promptText?: string;
  variant?: 'amber' | 'blue' | 'slate';
}

export const ParentDirectorContactCard: React.FC<ParentDirectorContactCardProps> = ({
  promptText = 'Have questions or need assistance from the Agency?',
  variant = 'amber'
}) => {
  const borderClass = variant === 'blue'
    ? 'border-blue-200 bg-blue-50/70 text-blue-950'
    : variant === 'slate'
    ? 'border-slate-200 bg-slate-50 text-slate-900'
    : 'border-amber-200/80 bg-amber-50/60 text-amber-950';

  return (
    <div className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-2 text-xs ${borderClass}`}>
      <span className="font-bold">
        {promptText}
      </span>
      <div className="flex items-center gap-2">
        <a
          href={`mailto:${AGENCY_PAYMENT_EMAIL}`}
          className="inline-flex items-center gap-1 text-orange-700 hover:text-orange-900 bg-white px-2.5 py-1 rounded-lg border border-orange-300 font-bold text-[11px] transition-colors shadow-xs"
        >
          <Mail className="w-3 h-3 text-orange-600" />
          <span>{AGENCY_PAYMENT_EMAIL}</span>
        </a>
        <a
          href={`tel:${AGENCY_PHONE_TEL}`}
          className="inline-flex items-center gap-1 text-slate-800 hover:text-slate-950 bg-white px-2.5 py-1 rounded-lg border border-slate-300 font-bold text-[11px] transition-colors shadow-xs"
        >
          <Phone className="w-3 h-3 text-slate-600" />
          <span>{AGENCY_PHONE}</span>
        </a>
      </div>
    </div>
  );
};
