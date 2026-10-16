import { AgencyPolicySettings, FundingType } from '../types';
import { saveAgencySettingsToFirestore } from '../services/firebaseService';
import { AGENCY_PHONE, AGENCY_PHONE_NOTICE, AGENCY_PAYMENT_EMAIL, DIRECTOR_TITLE } from '../config/agencyConfig';

export const DEFAULT_CCEYA_TRAINING_MODULES = [
  {
    id: 'mod-anaphylaxis',
    code: 'CCEYA s. 39',
    title: "Anaphylaxis Management & Sabrina's Law Protocol",
    duration: '18 mins',
    topics: [
      'Recognizing early anaphylactic distress and respiratory triggers',
      'Epi-Pen auto-injector tactile administration protocol',
      'Immediate 911 dispatch and secondary emergency caregiver procedures',
      'Allergen avoidance and strict food cross-contamination prevention'
    ],
    videoUrl: 'https://drive.google.com/drive/folders/1A_ACCS_Training_Sabrinas_Law'
  },
  {
    id: 'mod-safe-sleep',
    code: 'CCEYA s. 33.1',
    title: 'Safe Sleep Standards & SIDS Reduction Protocol',
    duration: '14 mins',
    topics: [
      'Statutory back-to-sleep position for all infants under 12 months',
      'Firm mattress standards and zero plush bedding, bumper, or blanket policy',
      'Mandatory 15-minute direct physical observation and breathing check intervals',
      'Daily sleep log documentation and parental preference agreements'
    ],
    videoUrl: 'https://drive.google.com/drive/folders/1B_ACCS_Training_Safe_Sleep'
  },
  {
    id: 'mod-behaviour-guidance',
    code: 'CCEYA s. 48',
    title: 'Positive Behaviour Guidance & Prohibited Practices',
    duration: '22 mins',
    topics: [
      'Developmentally appropriate positive redirection and communication',
      'Statutory prohibition of corporal punishment, harsh, or degrading treatment',
      'Zero deprivation of food, rest, or toilet access under Ontario law',
      'De-escalation techniques for toddler and preschool emotional dysregulation'
    ],
    videoUrl: 'https://drive.google.com/drive/folders/1C_ACCS_Training_Behaviour_Guidance'
  },
  {
    id: 'mod-serious-occurrence',
    code: 'CCEYA s. 68',
    title: 'Serious Occurrence Reporting (SOR) & Evacuation Drills',
    duration: '16 mins',
    topics: [
      'Statutory definition of Serious Occurrences under O. Reg. 137/15',
      `Mandatory 24-hour notification protocol to the ${DIRECTOR_TITLE}`,
      'Emergency Grab-Bag maintenance with child health cards & emergency wallet cards',
      'Monthly timed fire evacuation drills and documentation logs'
    ],
    videoUrl: 'https://drive.google.com/drive/folders/1D_ACCS_Training_Serious_Occurrences'
  }
];

export const DEFAULT_AGENCY_SETTINGS: AgencyPolicySettings = {
  cwelccPhase: 'current_22',
  parentCwelccDailyRate: 22.00,
  parentPrivateDailyRate: 35.00,
  municipalSubsidyCopay: 0.00,
  providerDailyCompensation: 35.00,
  provincialCwelccTopUpGrant: 13.00,
  primaryETransferRecipient: AGENCY_PAYMENT_EMAIL,
  agencyPhone: AGENCY_PHONE,
  agencyPhoneNotice: AGENCY_PHONE_NOTICE,
  statutorySources: [
    {
      id: 'statute-cceya-2014',
      title: 'Child Care and Early Years Act, 2014',
      governingBody: 'Ontario Provincial Legislature',
      url: 'https://www.ontario.ca/laws/statute/14c11',
      legislationCitation: 'S.O. 2014, c. 11',
      lastChecked: '2026-10-02',
      status: 'verified_active',
      keyRules: [
        's. 8: Maximum 6 children per licensed home child care premises at any one time',
        's. 8: No more than 3 children under 3 years old (< 36 months) in care at any one time',
        's. 8: No more than 3 children under 2 years old (< 24 months) in care at any one time',
        's. 26: Mandatory unannounced home visitor quarterly premises inspections by qualified RECE (every 90 days)',
        's. 6: Prohibition against operating an unlicensed home child care premises without agency agreement',
        's. 10: Prohibition against operating in premises with safety hazards or non-compliant egress',
        's. 35: Mandatory parent handbook disclosure and transparent communication of agency policies',
        's. 49: Serious occurrence reporting mandate (must be reported to Ministry within 24 hours)'
      ]
    },
    {
      id: 'manual-licensing-2026',
      title: 'Ministry Home Child Care Licensing Manual',
      governingBody: 'Ontario Ministry of Education',
      url: 'https://www.ontario.ca/page/home-child-care-licensing-manual',
      legislationCitation: 'O. Reg. 137/15 (General)',
      lastChecked: '2026-10-02',
      status: 'verified_active',
      keyRules: [
        'Section 8(2): Mixed-age statutory ratio calculations (including provider\'s own children < 4 yrs)',
        'Section 43: Daily physical attendance log with exact arrival & departure tracking and authorized pickup adult',
        'Section 33.1: Safe Sleep Protocol: Infants placed on backs on firm crib mattress; periodic direct physical visual checks',
        'Section 48: Emergency medical, allergy protocols, and Sabrina\'s Law (individual anaphylaxis plan & EpiPen accessible)',
        'Section 42: Nutrition standards conforming to Canada\'s Food Guide; weekly posted menus and drinking water access',
        'Section 40: Standard Level C Infant/Child CPR & First Aid certified provider on premises at all times',
        'Section 46: Emergency management procedures, monthly fire drill logs, working smoke & CO alarms on every level',
        'Section 48: Prohibited practices: zero corporal punishment, harsh/degrading measures, or physical confinement',
        'Section 57: Vulnerable Sector Checks (VSC) required for all adults (18+) residing in home, renewed every 5 years',
        'Section 58: Annual signed offence declarations by provider and household adults between 5-year VSC renewals',
        'Section 54: Record retention mandate: all child and provider records preserved for at least 3 years after discharge'
      ]
    },
    {
      id: 'guideline-durham-subsidy',
      title: 'Durham Region Child Care Fee Subsidy Directives',
      governingBody: 'Regional Municipality of Durham',
      url: 'https://www.durham.ca/en/living-here/child-care.aspx',
      legislationCitation: 'Durham Children\'s Services Operating Agreement',
      lastChecked: '2026-10-02',
      status: 'verified_active',
      keyRules: [
        '100% municipal fee coverage ($0.00 parent co-pay) for eligible families in Oshawa, Whitby & Pickering',
        'Direct monthly municipal provider compensation disbursement standard: $35.00/day',
        '30 allowable absence days per calendar year per subsidized child before regional subsidy risk',
        'Parent proof of employment or educational enrolment verification required semi-annually for renewal',
        'Mandatory electronic attendance timesheet submission to regional caseworkers by 5th business day of month'
      ]
    },
    {
      id: 'guideline-toronto-york',
      title: 'City of Toronto & York Region CWELCC Guidelines',
      governingBody: 'Toronto Children\'s Services / York Community Services',
      url: 'https://www.toronto.ca/community-people/children-parenting/children-programs-activities/licensed-child-care/',
      legislationCitation: 'Canada-Wide Early Learning and Child Care (CWELCC) Agreement',
      lastChecked: '2026-10-02',
      status: 'verified_active',
      keyRules: [
        'CWELCC parent fee ceiling: $22.00/day transition toward $10.00/day provincial target',
        'Licensed provider compensation standard: $35.00/day per child space',
        'Universal electronic Interac e-Transfer banking reconciliation mandate (cash/cheques decommissioned)',
        'Provincial CWELCC operational top-up grant ($13.00/day current, transitioning to $25.00/day)',
        'Non-reduction mandate: Provider earnings cannot be decreased by enrollment in provincial fee reduction',
        'Standard parent fee statement and enrollment contract delivery within 14 calendar days of placement'
      ]
    }
  ],
  maxCapacityTotal: 6,
  maxCapacityUnderThree: 3,
  maxCapacityUnderTwo: 3,
  quarterlyAuditFrequencyDays: 90,
  lastPolicyReviewDate: '2026-10-02',
  autoCheckMinistryUpdates: true,
  cceyaTrainingModules: DEFAULT_CCEYA_TRAINING_MODULES
};

const STORAGE_KEY = 'accs_agency_policy_settings';

export const loadAgencySettings = (): AgencyPolicySettings => {
  if (typeof window === 'undefined') return DEFAULT_AGENCY_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_AGENCY_SETTINGS;
    const parsed = JSON.parse(raw);
    
    // Merge statutory sources to ensure updated canonical rules propagate immediately
    const userCustomSources = (parsed.statutorySources || []).filter((s: any) => !DEFAULT_AGENCY_SETTINGS.statutorySources.some(d => d.id === s.id));
    const mergedCanonicalSources = DEFAULT_AGENCY_SETTINGS.statutorySources.map(defaultSrc => {
      const existing = (parsed.statutorySources || []).find((s: any) => s.id === defaultSrc.id);
      if (!existing) return defaultSrc;
      return {
        ...defaultSrc,
        ...existing,
        keyRules: defaultSrc.keyRules.length > (existing.keyRules?.length || 0) ? defaultSrc.keyRules : existing.keyRules
      };
    });

    // Merge training modules
    const mergedModules = (parsed.cceyaTrainingModules && parsed.cceyaTrainingModules.length > 0)
      ? parsed.cceyaTrainingModules
      : DEFAULT_CCEYA_TRAINING_MODULES;

    return {
      ...DEFAULT_AGENCY_SETTINGS,
      ...parsed,
      statutorySources: [...mergedCanonicalSources, ...userCustomSources],
      cceyaTrainingModules: mergedModules
    };
  } catch (err) {
    console.warn('Failed to load agency settings, using defaults:', err);
    return DEFAULT_AGENCY_SETTINGS;
  }
};

/**
 * Universal dynamic monthly fee calculator based on active agency policy rates.
 * Ontario standard: 5 days/wk * 4.35 average weeks per month = 21.75 active care days.
 */
export const calculateMonthlyFee = (
  fundingType: FundingType,
  settings?: AgencyPolicySettings
): number => {
  const current = settings || loadAgencySettings();
  const avgDaysPerMonth = 21.75;
  if (fundingType === 'cwelcc') {
    return Math.round(current.parentCwelccDailyRate * avgDaysPerMonth * 100) / 100;
  }
  if (fundingType === 'subsidy') {
    return Math.round(current.municipalSubsidyCopay * avgDaysPerMonth * 100) / 100;
  }
  if (fundingType === 'private') {
    return Math.round(current.parentPrivateDailyRate * avgDaysPerMonth * 100) / 100;
  }
  return Math.round(current.parentCwelccDailyRate * avgDaysPerMonth * 100) / 100;
};

export const saveAgencySettings = (settings: AgencyPolicySettings) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('accs_settings_updated', { detail: settings }));
  } catch (err) {
    console.error('Failed to save agency settings locally:', err);
  }

  // Persist to Cloud Firestore in the background for cross-device synchronization
  try {
    saveAgencySettingsToFirestore(settings).catch(err => {
      console.warn('Background Firestore save error for agency settings:', err);
    });
  } catch (err) {
    console.warn('Failed to dispatch Firestore save for agency settings:', err);
  }
};
