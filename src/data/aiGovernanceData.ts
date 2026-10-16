/**
 * AI Model Governance & Canadian PIPEDA Data Sovereignty Registry (Task #28)
 * ----------------------------------------------------------------------------
 * Centralized governance configuration for AI model routing, Canadian data residency,
 * and the Zero Cloud LLM Database Access architecture.
 */

import { AiGovernanceSettings, AiDomainTask, AiDomainRoutingConfig } from '../types';

export const DEFAULT_AI_DOMAIN_ROUTING: Record<AiDomainTask, AiDomainRoutingConfig> = {
  cceya_policy: {
    domain: 'cceya_policy',
    title: '1. CCEYA Regulatory & Mixed-Age Ratio Guidance',
    description: 'Statutory interpretation of O. Reg. 137/15, infant caps (3 under 2), unannounced 90-day audits, and safety compliance.',
    preferredProvider: 'gemini',
    preferredModelId: 'gemini-3.8-flash',
    piiMaskingLevel: 'strict_phipa',
    allowCloudProcessing: true
  },
  form_mutation: {
    domain: 'form_mutation',
    title: '2. Dynamic Form Schema Mutations & Versioning',
    description: 'Frontier full-codebase reasoning to add, modify, or remove fields across PAR, PROV, and HV form series.',
    preferredProvider: 'gemini',
    preferredModelId: 'gemini-3.8-flash',
    piiMaskingLevel: 'standard_pipeda',
    allowCloudProcessing: true
  },
  admissions_intake: {
    domain: 'admissions_intake',
    title: '3. Admissions Pre-Screening & Parent Consultations',
    description: 'Evaluating parent schedule inquiries, fee quotes, regional matching (Durham, York, Toronto), and discovery calls.',
    preferredProvider: 'gemini',
    preferredModelId: 'gemini-2.0-flash',
    piiMaskingLevel: 'strict_phipa',
    allowCloudProcessing: true
  },
  curated_notes: {
    domain: 'curated_notes',
    title: '4. Curated Requirements Backlog & Feedback Synthesis',
    description: 'Synthesizing client review observations and feature requests into deduplicated living Firestore requirements.',
    preferredProvider: 'gemini',
    preferredModelId: 'gemini-3.8-flash',
    piiMaskingLevel: 'standard_pipeda',
    allowCloudProcessing: true
  }
};

export const DEFAULT_AI_GOVERNANCE_SETTINGS: AiGovernanceSettings = {
  cloudDatabaseAirGapVerified: true,
  canadianDataResidencyRegion: 'northamerica-northeast1',
  strictPiiMaskingEnabled: true,
  maskOhipNumbers: true,
  maskChildSurnames: true,
  maskPhysicalAddresses: true,
  maskPhoneAndEmail: true,
  domainRouting: DEFAULT_AI_DOMAIN_ROUTING,
  lastAuditTimestamp: new Date().toISOString(),
  auditedBy: 'Agency Director'
};

const STORAGE_KEY = 'accs_ai_governance_settings';

export function loadAiGovernanceSettings(): AiGovernanceSettings {
  if (typeof window === 'undefined') return DEFAULT_AI_GOVERNANCE_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_AI_GOVERNANCE_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_AI_GOVERNANCE_SETTINGS,
      ...parsed,
      domainRouting: {
        ...DEFAULT_AI_DOMAIN_ROUTING,
        ...(parsed.domainRouting || {})
      }
    };
  } catch (e) {
    console.error('Failed to load AI governance settings:', e);
    return DEFAULT_AI_GOVERNANCE_SETTINGS;
  }
}

export function saveAiGovernanceSettings(settings: AiGovernanceSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new Event('accs_ai_governance_updated'));
  } catch (e) {
    console.error('Failed to save AI governance settings:', e);
  }
}

/**
 * Realistic Canadian PIPEDA test text for the admin playground.
 */
export const SAMPLE_PIPEDA_TEST_PAYLOAD = `Family Intake Assessment:
Child: Emily Chen (DOB: 2025-05-14)
Ontario Health Card: 4019-281-994-EC
Residence Address: 250 Yonge St S, Richmond Hill, ON L4C 1V2
Parent Contact: Grace Chen (Cell: 905-884-2200, Email: grace.chen@example.com)
Agency Head Office Contact: +1 (416) 694-7445 (allchildcaresolutions@gmail.com)
Program Request: Full-Time Toddler CWELCC space in York Region.`;
