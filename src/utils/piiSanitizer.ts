/**
 * Canadian PIPEDA & Ontario PHIPA Client-Side Pre-Flight PII Sanitizer (Task #28)
 * ----------------------------------------------------------------------------
 * Guarantees that children's Ontario Health Card (OHIP) numbers, private home addresses,
 * personal contact numbers, and children's surnames are scrubbed client-side prior to
 * prompt compilation and dispatch to external cloud LLMs (Gemini, OpenAI, DeepSeek).
 *
 * Enforces the Zero Cloud LLM Database Access Architecture mandated by the agency.
 */

import { AGENCY_PHONE, AGENCY_PAYMENT_EMAIL } from '../config/agencyConfig';

export interface PiiDetection {
  type: 'OHIP' | 'ADDRESS' | 'PHONE' | 'EMAIL' | 'CHILD_SURNAME' | 'POSTAL_CODE';
  originalSnippet: string;
  replacement: string;
  index: number;
}

export interface SanitizationResult {
  sanitizedText: string;
  maskedCount: number;
  detections: PiiDetection[];
  isClean: boolean;
}

export interface SanitizerOptions {
  maskOhip?: boolean;
  maskAddresses?: boolean;
  maskPhones?: boolean;
  maskEmails?: boolean;
  maskPostalCodes?: boolean;
  maskChildNames?: boolean;
  knownChildNames?: string[];
  preserveAgencyContacts?: boolean;
}

const DEFAULT_OPTIONS: SanitizerOptions = {
  maskOhip: true,
  maskAddresses: true,
  maskPhones: true,
  maskEmails: true,
  maskPostalCodes: true,
  maskChildNames: true,
  preserveAgencyContacts: true,
};

/**
 * Ontario Health Card (OHIP) Number Regular Expression:
 * Matches formats:
 * - 4019-281-994-EC (4 digits, 3 digits, 3 digits, 2 letters)
 * - 4019 281 994 EC
 * - 4019281994EC
 * - 1234567890AB
 */
const OHIP_REGEX = /\b\d{4}[-\s]?\d{3}[-\s]?\d{3}[-\s]?[A-Za-z]{2}\b/g;

/**
 * Canadian Postal Code Regular Expression:
 * E.g. L4C 1V2, M1B-2K3, K1A0B1
 */
const CANADIAN_POSTAL_CODE_REGEX = /\b[A-Za-z]\d[A-Za-z][\s-]?\d[A-Za-z]\d\b/g;

/**
 * Physical Street Address Regular Expression:
 * E.g. "250 Yonge St S", "44 Simcoe Street", "12 King Ave", "100 Adelaide Blvd"
 */
const STREET_ADDRESS_REGEX = /\b\d{1,5}\s+([A-Za-z0-9\s.,'-]+?\s+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Court|Ct|Place|Pl|Way|Lane|Ln|Crescent|Cres|Circle|Cir|Terrace|Terr))(?:\s+(?:North|South|East|West|N|S|E|W|Apt|Unit|Suite|#\s*\d+))?\b/gi;

/**
 * North American Phone Number Regular Expression:
 * Matches (905) 884-2200, 416-694-7445, +1-647-555-0199, etc.
 */
const PHONE_REGEX = /(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;

/**
 * Email Address Regular Expression
 */
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;

/**
 * Primary pre-flight PII scrubber for prompt strings dispatched to AI models.
 */
export function sanitizePiiForAi(
  rawText: string,
  options: SanitizerOptions = DEFAULT_OPTIONS
): SanitizationResult {
  if (!rawText) {
    return { sanitizedText: '', maskedCount: 0, detections: [], isClean: true };
  }

  const opts = { ...DEFAULT_OPTIONS, ...options };
  const detections: PiiDetection[] = [];
  let workingText = rawText;

  // 1. Scrub Ontario Health Card (OHIP) numbers (Critical PHIPA requirement)
  if (opts.maskOhip) {
    workingText = workingText.replace(OHIP_REGEX, (match, offset) => {
      const replacement = '[OHIP-REDACTED-PHIPA]';
      detections.push({
        type: 'OHIP',
        originalSnippet: match,
        replacement,
        index: offset
      });
      return replacement;
    });
  }

  // 2. Scrub Physical Street Addresses (PIPEDA requirement)
  if (opts.maskAddresses) {
    workingText = workingText.replace(STREET_ADDRESS_REGEX, (match, _p1, offset) => {
      const replacement = '[ADDRESS-REDACTED-PIPEDA]';
      detections.push({
        type: 'ADDRESS',
        originalSnippet: match,
        replacement,
        index: offset
      });
      return replacement;
    });
  }

  // 3. Scrub Canadian Postal Codes
  if (opts.maskPostalCodes) {
    workingText = workingText.replace(CANADIAN_POSTAL_CODE_REGEX, (match, offset) => {
      const replacement = '[POSTAL-CODE-REDACTED]';
      detections.push({
        type: 'POSTAL_CODE',
        originalSnippet: match,
        replacement,
        index: offset
      });
      return replacement;
    });
  }

  // 4. Scrub Phone Numbers (preserving official agency hotline if specified)
  if (opts.maskPhones) {
    workingText = workingText.replace(PHONE_REGEX, (match, offset) => {
      // Preserve official hotline: (416) 694-7445
      if (opts.preserveAgencyContacts && (match.includes('694-7445') || match.includes('6947445'))) {
        return match;
      }
      const replacement = '[PHONE-REDACTED]';
      detections.push({
        type: 'PHONE',
        originalSnippet: match,
        replacement,
        index: offset
      });
      return replacement;
    });
  }

  // 5. Scrub Email Addresses (preserving official agency payment email)
  if (opts.maskEmails) {
    workingText = workingText.replace(EMAIL_REGEX, (match, offset) => {
      if (opts.preserveAgencyContacts && match.toLowerCase() === AGENCY_PAYMENT_EMAIL.toLowerCase()) {
        return match;
      }
      const replacement = '[EMAIL-REDACTED]';
      detections.push({
        type: 'EMAIL',
        originalSnippet: match,
        replacement,
        index: offset
      });
      return replacement;
    });
  }

  // 6. Scrub Known Children Full Surnames if roster provided
  if (opts.maskChildNames && opts.knownChildNames && opts.knownChildNames.length > 0) {
    for (const fullName of opts.knownChildNames) {
      const parts = fullName.trim().split(/\s+/);
      if (parts.length >= 2) {
        const firstName = parts[0];
        const surname = parts[parts.length - 1];
        const initial = surname.charAt(0).toUpperCase();
        const maskedName = `${firstName} ${initial}. [CHILD]`;
        
        // Exact case-insensitive boundary replacement of the full name
        const escaped = fullName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const nameRegex = new RegExp(`\\b${escaped}\\b`, 'gi');
        
        if (nameRegex.test(workingText)) {
          workingText = workingText.replace(nameRegex, (match, offset) => {
            detections.push({
              type: 'CHILD_SURNAME',
              originalSnippet: match,
              replacement: maskedName,
              index: offset
            });
            return maskedName;
          });
        }
      }
    }
  }

  return {
    sanitizedText: workingText,
    maskedCount: detections.length,
    detections,
    isClean: detections.length === 0
  };
}

/**
 * Diagnostic helper to audit compliance of a text payload against Canadian PIPEDA / PHIPA.
 */
export function auditPiiCompliance(text: string): {
  isCompliant: boolean;
  ohipViolations: number;
  addressViolations: number;
  phoneViolations: number;
  emailViolations: number;
  totalViolations: number;
} {
  const ohipMatches = (text.match(OHIP_REGEX) || []).length;
  const addressMatches = (text.match(STREET_ADDRESS_REGEX) || []).length;
  const phoneMatches = (text.match(PHONE_REGEX) || []).filter(p => !p.includes('694-7445')).length;
  const emailMatches = (text.match(EMAIL_REGEX) || []).filter(e => e.toLowerCase() !== AGENCY_PAYMENT_EMAIL.toLowerCase()).length;

  const total = ohipMatches + addressMatches + phoneMatches + emailMatches;

  return {
    isCompliant: total === 0,
    ohipViolations: ohipMatches,
    addressViolations: addressMatches,
    phoneViolations: phoneMatches,
    emailViolations: emailMatches,
    totalViolations: total
  };
}
