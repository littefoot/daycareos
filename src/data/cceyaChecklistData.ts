import { InspectionChecklistItem } from '../types';

export interface CceyaDomain {
  id: string;
  domainNumber: number;
  title: string;
  description: string;
  cceyaClause: string;
  items: InspectionChecklistItem[];
}

/**
 * Official 12 Regulatory Domains from:
 * Ministry of Education Standard Home Visitor Checklist (Quarterly Checklist Home Visitor EN v.08)
 * Governed by CCEYA 2014 & Ontario Regulation 137/15: General
 */
export const MINISTRY_CCEYA_DOMAINS: CceyaDomain[] = [
  {
    id: 'domain-1',
    domainNumber: 1,
    title: 'Headcount & Mixed-Age Capacity Ratios',
    description: 'Statutory verification of children present against license limits and active attendance log.',
    cceyaClause: 'CCEYA ss. 6(3) & O. Reg. 137/15 s. 8',
    items: [
      {
        id: 'cceya-1-1',
        code: 's. 8(1)',
        clause: 'CCEYA ss. 6(3)1.i.A & O. Reg. 137/15 s. 8(1)',
        label: 'Total children present does not exceed statutory maximum of 6 (including provider\'s own young children).',
        category: 'ratios',
        riskLevel: 'high',
        passed: true
      },
      {
        id: 'cceya-1-2',
        code: 's. 8(2)(b)',
        clause: 'O. Reg. 137/15 s. 8(2)(b)',
        label: 'No more than 3 children younger than 3 years of age (<36 months) in care.',
        category: 'ratios',
        riskLevel: 'high',
        passed: true
      },
      {
        id: 'cceya-1-3',
        code: 's. 8(2)(a)',
        clause: 'CCEYA ss. 6(3)1.iv.A & O. Reg. 137/15 s. 8(2)(a)',
        label: 'No more than 3 children younger than 2 years of age (<24 months) in care.',
        category: 'ratios',
        riskLevel: 'high',
        passed: true
      }
    ]
  },
  {
    id: 'domain-2',
    domainNumber: 2,
    title: 'Provider\'s Own Children & Adult Household Screening',
    description: 'Vulnerable Sector Checks (VSC) on file for all adult residents and regular visitors.',
    cceyaClause: 'O. Reg. 137/15 ss. 53–61',
    items: [
      {
        id: 'cceya-2-1',
        code: 's. 8(3)',
        clause: 'CCEYA ss. 6(3)1.ii & O. Reg. 137/15 s. 8(3)',
        label: 'Provider\'s own children under age 4 (or under 6 on school break) accurately deducted from available capacity.',
        category: 'admin',
        riskLevel: 'high',
        passed: true
      },
      {
        id: 'cceya-2-2',
        code: 's. 53',
        clause: 'O. Reg. 137/15 s. 53',
        label: 'Vulnerable Sector Checks and annual offence declarations current and on file for all adult household residents.',
        category: 'admin',
        riskLevel: 'critical',
        passed: true
      },
      {
        id: 'cceya-2-3',
        code: 's. 54',
        clause: 'O. Reg. 137/15 s. 54',
        label: 'No unapproved or unscreened individuals have unsupervised access to children in care.',
        category: 'safety',
        riskLevel: 'critical',
        passed: true
      }
    ]
  },
  {
    id: 'domain-3',
    domainNumber: 3,
    title: 'Physical Premises, Heating & Scald Prevention',
    description: 'Physical assessment of premises, temperature control, and hot water scald safeguards.',
    cceyaClause: 'O. Reg. 137/15 ss. 20–22',
    items: [
      {
        id: 'cceya-3-1',
        code: 's. 22',
        clause: 'O. Reg. 137/15 s. 22',
        label: 'Hot water temperature at all child-accessible taps does not exceed 49°C (120°F) to prevent scalds.',
        category: 'safety',
        riskLevel: 'high',
        passed: true,
        notes: 'Tested at 44°C'
      },
      {
        id: 'cceya-3-2',
        code: 's. 20',
        clause: 'O. Reg. 137/15 s. 20',
        label: 'Indoor premises clean, well-lit, properly ventilated, and temperature maintained between 20°C and 25°C.',
        category: 'safety',
        riskLevel: 'moderate',
        passed: true
      },
      {
        id: 'cceya-3-3',
        code: 's. 28',
        clause: 'O. Reg. 137/15 s. 28',
        label: 'Outdoor yard fenced (minimum 1.2m) with self-closing and self-latching gate; zero standing bodies of water.',
        category: 'safety',
        riskLevel: 'critical',
        passed: true
      }
    ]
  },
  {
    id: 'domain-4',
    domainNumber: 4,
    title: 'Equipment, Play Materials & Furnishings',
    description: 'Developmentally appropriate, non-toxic, clean furnishings and play equipment.',
    cceyaClause: 'O. Reg. 137/15 s. 19',
    items: [
      {
        id: 'cceya-4-1',
        code: 's. 19(1)',
        clause: 'O. Reg. 137/15 s. 19(1)',
        label: 'Play materials and equipment meet Canadian safety standards and are suitable for developmental ages of children in care.',
        category: 'safety',
        riskLevel: 'moderate',
        passed: true
      },
      {
        id: 'cceya-4-2',
        code: 's. 19(2)',
        clause: 'O. Reg. 137/15 s. 19(2)',
        label: 'Furniture, cots, high chairs, and strollers are sturdy, clean, and in good repair with safety harnesses functional.',
        category: 'safety',
        riskLevel: 'moderate',
        passed: true
      }
    ]
  },
  {
    id: 'domain-5',
    domainNumber: 5,
    title: 'Sabrina\'s Law, Anaphylaxis & Medical Supervision',
    description: 'Individualized medical plans, epinephrine auto-injectors, and emergency medical consents.',
    cceyaClause: 'CCEYA s. 36 & O. Reg. 137/15 s. 39',
    items: [
      {
        id: 'cceya-5-1',
        code: 's. 39(1)',
        clause: 'CCEYA s. 36 / Sabrina\'s Law',
        label: 'Individualized anaphylaxis plans with child photographs posted prominently in food preparation and eating areas.',
        category: 'health',
        riskLevel: 'critical',
        passed: true
      },
      {
        id: 'cceya-5-2',
        code: 's. 39(2)',
        clause: 'O. Reg. 137/15 s. 39(2)',
        label: 'Unexpired Epi-Pens / auto-injectors on premises, easily accessible to adults but out of reach of children.',
        category: 'health',
        riskLevel: 'critical',
        passed: true
      },
      {
        id: 'cceya-5-3',
        code: 's. 35',
        clause: 'O. Reg. 137/15 s. 35',
        label: 'Up-to-date immunization records (Form Yellow Card or valid medical exemption) verified for every enrolled child.',
        category: 'health',
        riskLevel: 'high',
        passed: true
      }
    ]
  },
  {
    id: 'domain-6',
    domainNumber: 6,
    title: 'Medication Administration & Hazardous Substance Storage',
    description: 'Prescription drug authorization, locked lockboxes, and hazardous chemical security.',
    cceyaClause: 'O. Reg. 137/15 ss. 40 & 21',
    items: [
      {
        id: 'cceya-6-1',
        code: 's. 40(1)',
        clause: 'O. Reg. 137/15 s. 40(1)',
        label: 'All prescription and OTC medications stored in dedicated locked box inaccessible to children.',
        category: 'health',
        riskLevel: 'critical',
        passed: true
      },
      {
        id: 'cceya-6-2',
        code: 's. 40(2)',
        clause: 'O. Reg. 137/15 s. 40(2)',
        label: 'Written parental authorization form and medication administration log properly documented with exact dosage and times.',
        category: 'health',
        riskLevel: 'high',
        passed: true
      },
      {
        id: 'cceya-6-3',
        code: 's. 21',
        clause: 'O. Reg. 137/15 s. 21',
        label: 'Cleaning chemicals, toxic substances, lighters, and plastic bags stored in locked cupboards out of children\'s reach.',
        category: 'safety',
        riskLevel: 'critical',
        passed: true
      }
    ]
  },
  {
    id: 'domain-7',
    domainNumber: 7,
    title: 'Sanitary Practices, Disinfection & Diapering',
    description: 'Infection prevention, hand hygiene, sanitization protocols, and diaper change standards.',
    cceyaClause: 'O. Reg. 137/15 s. 23',
    items: [
      {
        id: 'cceya-7-1',
        code: 's. 23(1)',
        clause: 'O. Reg. 137/15 s. 23(1)',
        label: 'Designated diaper changing area with non-porous cleanable surface, disinfected after every single use.',
        category: 'health',
        riskLevel: 'moderate',
        passed: true
      },
      {
        id: 'cceya-7-2',
        code: 's. 23(2)',
        clause: 'O. Reg. 137/15 s. 23(2)',
        label: 'Proper hand hygiene practiced by provider and encouraged for children before meals and after toileting/diapering.',
        category: 'health',
        riskLevel: 'moderate',
        passed: true
      },
      {
        id: 'cceya-7-3',
        code: 's. 24',
        clause: 'O. Reg. 137/15 s. 24',
        label: 'First aid kits fully stocked (gauze, tape, CPR barrier, scissors) and stored with emergency contact wallet cards.',
        category: 'safety',
        riskLevel: 'high',
        passed: true
      }
    ]
  },
  {
    id: 'domain-8',
    domainNumber: 8,
    title: 'Nutrition, Food Safety & Canada\'s Food Guide',
    description: 'Nutritious meal provision, 2-week posted menus, and allergy cross-contamination prevention.',
    cceyaClause: 'O. Reg. 137/15 ss. 42–44',
    items: [
      {
        id: 'cceya-8-1',
        code: 's. 42',
        clause: 'O. Reg. 137/15 s. 42',
        label: 'Weekly food menus posted at least 2 weeks in advance, planned in accordance with Canada\'s Food Guide.',
        category: 'nutrition',
        riskLevel: 'moderate',
        passed: true
      },
      {
        id: 'cceya-8-2',
        code: 's. 43',
        clause: 'O. Reg. 137/15 s. 43',
        label: 'Fresh drinking water available and easily accessible to children throughout the day.',
        category: 'nutrition',
        riskLevel: 'moderate',
        passed: true
      },
      {
        id: 'cceya-8-3',
        code: 's. 44',
        clause: 'O. Reg. 137/15 s. 44',
        label: 'Food prepared, stored, and refrigerated safely; special dietary and religious restrictions strictly honored.',
        category: 'nutrition',
        riskLevel: 'high',
        passed: true
      }
    ]
  },
  {
    id: 'domain-9',
    domainNumber: 9,
    title: 'Safe Sleep Supervision & Direct Visual Checks',
    description: 'Health Canada compliant sleep surfaces, sudden infant death safeguards, and logged visual checks.',
    cceyaClause: 'O. Reg. 137/15 ss. 33.1 & 33.2',
    items: [
      {
        id: 'cceya-9-1',
        code: 's. 33.1',
        clause: 'O. Reg. 137/15 s. 33.1',
        label: 'Infants under 12 months placed on their backs on firm, flat Health Canada compliant cribs/mattresses with zero loose blankets or pillows.',
        category: 'sleep',
        riskLevel: 'critical',
        passed: true
      },
      {
        id: 'cceya-9-2',
        code: 's. 33.2',
        clause: 'O. Reg. 137/15 s. 33.2',
        label: 'Direct visual sleep checks conducted and physically logged in daily records every 30 minutes for sleeping children.',
        category: 'sleep',
        riskLevel: 'critical',
        passed: true
      }
    ]
  },
  {
    id: 'domain-10',
    domainNumber: 10,
    title: 'Program Planning & Daily Outdoor Play',
    description: 'Statutory minimum of 2 hours daily outdoor play (weather permitting) and structured routines.',
    cceyaClause: 'O. Reg. 137/15 s. 47',
    items: [
      {
        id: 'cceya-10-1',
        code: 's. 47(1)',
        clause: 'O. Reg. 137/15 s. 47(1)',
        label: 'Children in care for 6+ hours spend a minimum of two hours outdoors daily (weather permitting) engaged in active gross motor play.',
        category: 'safety',
        riskLevel: 'moderate',
        passed: true
      },
      {
        id: 'cceya-10-2',
        code: 's. 46',
        clause: 'O. Reg. 137/15 s. 46',
        label: 'Daily program schedule provides a balance of active, quiet, indoor, outdoor, individual, and group activities.',
        category: 'admin',
        riskLevel: 'low',
        passed: true
      }
    ]
  },
  {
    id: 'domain-11',
    domainNumber: 11,
    title: 'Child Guidance & Prohibited Practices',
    description: 'Strict enforcement of positive guidance techniques; absolute zero tolerance for physical restraint or humiliation.',
    cceyaClause: 'CCEYA s. 48 & O. Reg. 137/15 s. 48',
    items: [
      {
        id: 'cceya-11-1',
        code: 's. 48(1)',
        clause: 'CCEYA s. 48 / O. Reg. 137/15 s. 48',
        label: 'Zero corporal punishment, physical restraint, confinement, or locking children in rooms.',
        category: 'behaviour',
        riskLevel: 'critical',
        passed: true
      },
      {
        id: 'cceya-11-2',
        code: 's. 48(2)',
        clause: 'O. Reg. 137/15 s. 48',
        label: 'Zero harsh or degrading measures, humiliation, yelling, or depriving child of basic needs (food, shelter, rest, toilet).',
        category: 'behaviour',
        riskLevel: 'critical',
        passed: true
      }
    ]
  },
  {
    id: 'domain-12',
    domainNumber: 12,
    title: 'Serious Occurrences, Fire Drills & Daily Attendance',
    description: '24-hour Ministry reporting protocol, monthly fire evacuation rehearsals, and daily written attendance records.',
    cceyaClause: 'O. Reg. 137/15 ss. 38, 45 & 50',
    items: [
      {
        id: 'cceya-12-1',
        code: 's. 38',
        clause: 'O. Reg. 137/15 s. 38',
        label: 'Serious occurrence policy posted; licensee aware of mandatory 24-hour reporting protocol to Ministry CCLS system.',
        category: 'admin',
        riskLevel: 'high',
        passed: true
      },
      {
        id: 'cceya-12-2',
        code: 's. 45',
        clause: 'O. Reg. 137/15 s. 45',
        label: 'Monthly fire drills conducted and logged with exact dates, evacuation times, and routes used; smoke/CO alarms tested monthly.',
        category: 'safety',
        riskLevel: 'critical',
        passed: true
      },
      {
        id: 'cceya-12-3',
        code: 's. 50',
        clause: 'O. Reg. 137/15 s. 50',
        label: 'Daily written attendance records maintained in real time with exact arrival and departure timestamps for every child.',
        category: 'admin',
        riskLevel: 'high',
        passed: true
      }
    ]
  }
];

/**
 * ACCS x CITS Official Behaviour Management Quarterly Monitoring Techniques & Checklist
 * Source: docs/forms_source_of_truth/home_visitor_forms/ACCS x CITS Behaviour Management Quarterly Monitoring Techniques and Check List (Internal).pdf
 */
export interface BehaviourTechniqueItem {
  id: string;
  technique: string;
  description: string;
  isCompliant: boolean;
  notes?: string;
}

export const OFFICIAL_BEHAVIOUR_TECHNIQUES: BehaviourTechniqueItem[] = [
  {
    id: 'tech-1',
    technique: 'Positive Intervention',
    description: 'Inappropriate behaviours are proactively redirected using constructive and positive intervention methods.',
    isCompliant: true
  },
  {
    id: 'tech-2',
    technique: 'Firm, Positive Communication & Body Language',
    description: 'Provider maintains firm, encouraging vocal tone and open, supportive body language during guidance.',
    isCompliant: true
  },
  {
    id: 'tech-3',
    technique: 'Positive Reinforcement',
    description: 'Constructive and cooperative behaviours are consistently recognized with positive praise and encouragement.',
    isCompliant: true
  },
  {
    id: 'tech-4',
    technique: 'Clear Expectations & No Problem-Child Labeling',
    description: 'Expectations and guidelines are stated clearly with reasonable limits. Does not label child or repeatedly call their name as a "problem child".',
    isCompliant: true
  },
  {
    id: 'tech-5',
    technique: 'Child Responsibility & Age-Appropriate Problem Solving',
    description: 'Children are encouraged to understand the consequences of their actions and engage in supported problem-solving.',
    isCompliant: true
  },
  {
    id: 'tech-6',
    technique: 'Separating Behaviour from Child Identity',
    description: 'It is explicitly the behaviour—never the child\'s worth or identity—that is identified as needing modification.',
    isCompliant: true
  },
  {
    id: 'tech-7',
    technique: 'Sit-Out Protocol (Strict Last Resort)',
    description: 'Sit-out / quiet time used solely as a last chance cool-down. Provider reports any sit-outs to Agency Supervisor; excessive use flagged.',
    isCompliant: true
  },
  {
    id: 'tech-8',
    technique: 'Zero Tolerance for Prohibited Techniques',
    description: 'Provider completely refrains from yelling, belittling, shaming, or any form of corporal punishment or physical restraint.',
    isCompliant: true
  },
  {
    id: 'tech-9',
    technique: 'Modeling Expected Attitudes & Behaviours',
    description: 'Provider actively models the empathy, fairness, respect, and emotional regulation expected of the children.',
    isCompliant: true
  },
  {
    id: 'tech-10',
    technique: 'Patience & Calm Demeanor in Repetition',
    description: 'Exercises patience and remains calm when directing behaviour or relaying safety information repeatedly.',
    isCompliant: true
  }
];
