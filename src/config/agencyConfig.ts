/**
 * DaycareOS Central Agency Configuration
 * ----------------------------------------------------------------------------
 * Single source of truth for agency identity strings that appear across the
 * Admin, Provider, Home Visitor and Parent portals, printouts and emails.
 *
 * Standalone showcase platform for CloudJ.ca.
 */

/** Official agency head office / 24/7 hotline. Voice-only line (no SMS). */
export const AGENCY_PHONE = '+1 (416) 555-CARE';

/** Plain digits for tel: links. */
export const AGENCY_PHONE_TEL = '+14165552273';

/** Short notice displayed beside every phone number reference. */
export const AGENCY_PHONE_NOTICE = 'Voice-Only Line (Please do not send SMS)';

/** Compact phone + notice string for footers and printouts. */
export const AGENCY_PHONE_WITH_NOTICE = `${AGENCY_PHONE} (voice only, no SMS)`;

/** Sole Interac e-Transfer payment rail. */
export const AGENCY_PAYMENT_EMAIL = 'billing@daycare-os.ca';

/** Legal agency name. */
export const AGENCY_LEGAL_NAME = 'DaycareOS Child Care Network';

/** Application display titles. */
export const APP_TITLE = 'DaycareOS';
export const APP_SUBTITLE = 'Licensed Child Care Platform';
export const APP_FULL_TITLE = `${AGENCY_LEGAL_NAME} — ${APP_SUBTITLE}`;

/**
 * Institutional role titles.
 * - Director: formal approvals, contracts, licensing, executive sign-offs.
 * - Representative: pre-screening, discovery calls, parent consultations.
 */
export const DIRECTOR_TITLE = 'Agency Director';
export const REPRESENTATIVE_TITLE = 'Agency Representative';

/** Standardized onboarding navigation labels. */
export const ONBOARDING_LABELS = {
  parent: 'Parent Intake',
  provider: 'Provider Application',
  visitor: 'Home Visitor Application'
} as const;
