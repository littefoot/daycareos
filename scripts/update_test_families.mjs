import fs from 'fs';
import path from 'path';

const filePath = 'c:/Projects/allchildcaresolutions/src/data/testFamiliesData.ts';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update imports and TestFamilyProfile interface
const newInterfaceHeader = `import { AdmissionsStage, Child, ParentGuardian, FundingType, RegionType, DocumentRecord, PrescriptionRecord, SpecialPermissionRecord } from '../types';

export interface TestFamilyProfile {
  id: string;
  childName: string;
  dob: string; // YYYY-MM-DD
  ageMonths: number;
  ageFormatted: string;
  ageGroup: 'Infant' | 'Toddler' | 'Preschool' | 'Kindergarten';
  gender: 'Male' | 'Female';
  photoUrl: string;
  ohip: string; // 10 digits + 2 version code
  parent1Name: string;
  parent1Cell: string;
  parent1Email: string;
  parent1Relationship: string;
  parent1Employer: string;
  parent2Name: string;
  parent2Cell: string;
  parent2Relationship: string;
  homeAddress: string;
  city: string;
  postalCode: string;
  region: RegionType;
  fundingType: FundingType;
  fundingLabel: string;
  monthlyFee: number;
  scheduleDays: string[];
  scheduleFormatted: string;
  hoursOfCare: string;
  eveningCare: boolean;
  preferredStartDate: string;
  allergies: string[];
  epiPenRequired: boolean;
  dietaryRestrictions: string[];
  medicalNotes: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyRelationship: string;
  physicianName: string;
  physicianPhone: string;
  clinicAddress: string;
  // CRM Admissions Pipeline State
  admissionsStage: AdmissionsStage;
  isUnborn?: boolean;
  expectedDueDate?: string;
  waitlistNotes?: string;
  withdrawnReason?: string;
  assignedProviderId?: string;
  assignedProviderName?: string;
}`;

content = content.replace(/export interface TestFamilyProfile \{[\s\S]*?\n\}/, newInterfaceHeader);

// 2. Stage mapping for each family
const stageOverrides = {
  'fam-1': {
    admissionsStage: 'inquiry'
  },
  'fam-2': {
    admissionsStage: 'inquiry'
  },
  'fam-3': {
    admissionsStage: 'docs_needed'
  },
  'fam-4': {
    admissionsStage: 'docs_needed'
  },
  'fam-5': {
    admissionsStage: 'matching',
    assignedProviderId: 'prov-1',
    assignedProviderName: 'Fatima Al-Mansoor'
  },
  'fam-6': {
    admissionsStage: 'matching',
    assignedProviderId: 'prov-3',
    assignedProviderName: 'Elena Rostova'
  },
  'fam-7': {
    admissionsStage: 'matching',
    assignedProviderId: 'prov-2',
    assignedProviderName: 'Grace Mirembe'
  },
  'fam-8': {
    admissionsStage: 'enrolled',
    assignedProviderId: 'prov-1',
    assignedProviderName: 'Fatima Al-Mansoor'
  },
  'fam-9': {
    admissionsStage: 'contract',
    assignedProviderId: 'prov-1',
    assignedProviderName: 'Fatima Al-Mansoor'
  },
  'fam-10': {
    admissionsStage: 'enrolled',
    assignedProviderId: 'prov-5',
    assignedProviderName: 'Amara Okafor'
  },
  'fam-11': {
    admissionsStage: 'enrolled',
    assignedProviderId: 'prov-6',
    assignedProviderName: 'Chloe Tremblay'
  },
  'fam-12': {
    admissionsStage: 'enrolled',
    assignedProviderId: 'prov-2',
    assignedProviderName: 'Grace Mirembe'
  },
  'fam-13': {
    admissionsStage: 'contract',
    assignedProviderId: 'prov-2',
    assignedProviderName: 'Grace Mirembe'
  },
  'fam-14': {
    admissionsStage: 'waitlisted',
    isUnborn: false,
    newPreferredStartDate: '2027-09-01',
    waitlistNotes: 'Applied 12 months in advance for September 2027 Toddler placement.'
  },
  'fam-15': {
    admissionsStage: 'inquiry'
  },
  'fam-16': {
    admissionsStage: 'waitlisted',
    isUnborn: true,
    expectedDueDate: '2027-02-10',
    newPreferredStartDate: '2027-09-01',
    waitlistNotes: 'Expecting baby girl in February 2027. Advance infant registration.'
  },
  'fam-17': {
    admissionsStage: 'docs_needed'
  },
  'fam-18': {
    admissionsStage: 'inquiry'
  },
  'fam-19': {
    admissionsStage: 'matching',
    assignedProviderId: 'prov-4',
    assignedProviderName: 'Maria Santos'
  },
  'fam-20': {
    admissionsStage: 'docs_needed'
  },
  'fam-21': {
    admissionsStage: 'enrolled',
    assignedProviderId: 'prov-3',
    assignedProviderName: 'Elena Rostova'
  },
  'fam-22': {
    admissionsStage: 'enrolled',
    assignedProviderId: 'prov-4',
    assignedProviderName: 'Maria Santos'
  },
  'fam-23': {
    admissionsStage: 'withdrawn',
    withdrawnReason: 'Relocated out of catchment area (Moved to Barrie, Ontario)'
  },
  'fam-24': {
    admissionsStage: 'waitlisted',
    isUnborn: true,
    expectedDueDate: '2026-12-15',
    newPreferredStartDate: '2027-05-01',
    waitlistNotes: 'Expecting baby in December 2026. Mother on statutory maternity leave until May 2027.'
  }
};

// Inject the extra properties before the closing bracket of each family object
for (const [famId, fields] of Object.entries(stageOverrides)) {
  const famRegex = new RegExp(`(id:\\s*'${famId}'[\\s\\S]*?clinicAddress:[^\\n]+)`, 'g');
  content = content.replace(famRegex, (match) => {
    let modified = match;
    if (fields.newPreferredStartDate) {
      modified = modified.replace(/preferredStartDate:\s*'[^']+'/, `preferredStartDate: '${fields.newPreferredStartDate}'`);
    }
    let additions = '';
    for (const [k, v] of Object.entries(fields)) {
      if (k === 'newPreferredStartDate') continue;
      if (typeof v === 'boolean') {
        additions += `,\n    ${k}: ${v}`;
      } else {
        additions += `,\n    ${k}: '${v}'`;
      }
    }
    return modified + additions;
  });
}

// 3. Append helper transformation functions at the bottom
const helpers = `

/**
 * Converts a TestFamilyProfile into a rich, production-grade Child entity
 */
export function testFamilyToChild(fam: TestFamilyProfile): Child {
  const birthDate = new Date(fam.dob);
  const today = new Date();
  const months = fam.isUnborn ? -2 : Math.max(1, Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30.4375)));
  const years = Math.max(0, Math.floor(months / 12));
  const remMonths = Math.max(0, months % 12);

  const docs: DocumentRecord[] = [
    {
      id: \`doc-\${fam.id}-1\`,
      type: 'birth_certificate',
      title: 'Birth Certificate',
      status: fam.admissionsStage === 'inquiry' || fam.admissionsStage === 'waitlisted' ? 'not_submitted' : 'accepted',
      fileName: \`\${fam.childName.toLowerCase().replace(/\\s+/g, '_')}_birth_cert.pdf\`,
      uploadedAt: '2026-08-15'
    },
    {
      id: \`doc-\${fam.id}-2\`,
      type: 'health_card',
      title: \`Ontario Health Card (\${fam.ohip})\`,
      status: fam.admissionsStage === 'inquiry' || fam.admissionsStage === 'waitlisted' ? 'not_submitted' : 'accepted',
      fileName: \`\${fam.childName.toLowerCase().replace(/\\s+/g, '_')}_ohip.jpg\`,
      uploadedAt: '2026-08-15'
    },
    {
      id: \`doc-\${fam.id}-3\`,
      type: 'immunization',
      title: 'Yellow Immunization Card',
      status: fam.admissionsStage === 'inquiry' || fam.admissionsStage === 'waitlisted'
        ? 'not_submitted'
        : fam.admissionsStage === 'docs_needed'
        ? 'under_review'
        : 'accepted',
      fileName: \`\${fam.childName.toLowerCase().replace(/\\s+/g, '_')}_yellow_card.pdf\`,
      uploadedAt: '2026-08-16'
    }
  ];

  if (fam.epiPenRequired) {
    docs.push({
      id: \`doc-\${fam.id}-4\`,
      type: 'allergy_plan',
      title: 'Anaphylaxis Emergency Plan (Sabrina\\'s Law)',
      status: 'accepted',
      fileName: \`\${fam.childName.toLowerCase().replace(/\\s+/g, '_')}_epipen_plan.pdf\`,
      uploadedAt: '2026-08-18'
    });
  }

  // Realistic Expiry Dates & Medical Records
  let epiPenExpiry: string | undefined = undefined;
  if (fam.id === 'fam-5') {
    epiPenExpiry = '2026-09-20'; // Sabrina's Law: Due in 11 days!
  } else if (fam.id === 'fam-1') {
    epiPenExpiry = '2026-10-15'; // Valid 35 days
  }

  let asthmaPufferExpiry: string | undefined = undefined;
  if (fam.id === 'fam-21') {
    asthmaPufferExpiry = '2026-09-04'; // Ryan's Law: Expired 5 days ago!
  } else if (fam.id === 'fam-15') {
    asthmaPufferExpiry = '2027-05-15'; // Valid
  }

  let immunizationExpiryDate: string | undefined = undefined;
  if (fam.id === 'fam-22') {
    immunizationExpiryDate = '2026-08-25'; // Overdue 15 days!
  } else if (fam.id === 'fam-18') {
    immunizationExpiryDate = '2026-09-22'; // 18m booster due in 13 days
  }

  let subsidyRegion: RegionType | undefined = undefined;
  let subsidyCaseNumber: string | undefined = undefined;
  let subsidyExpiryDate: string | undefined = undefined;
  if (fam.id === 'fam-7') {
    subsidyRegion = 'Durham Region';
    subsidyCaseNumber = 'DUR-88219-CW';
    subsidyExpiryDate = '2026-09-15'; // Due in 6 days
  } else if (fam.id === 'fam-3') {
    subsidyRegion = 'Durham Region';
    subsidyCaseNumber = 'DUR-77312-CW';
    subsidyExpiryDate = '2026-10-01';
  }

  let courtOrderExpiry: string | undefined = undefined;
  let courtOrderDetails: string | undefined = undefined;
  if (fam.id === 'fam-11') {
    courtOrderExpiry = '2026-09-25'; // Due in 16 days
    courtOrderDetails = 'Ontario Family Court Order #FO-2025-991: Sole maternal custody. Pick-up strictly restricted to mother and maternal grandmother.';
  }

  let prescriptionMeds: PrescriptionRecord[] | undefined = undefined;
  if (fam.id === 'fam-8') {
    prescriptionMeds = [
      {
        id: 'rx-1',
        medicationName: 'Amoxicillin Oral Suspension',
        dosage: '5ml twice daily with meals',
        instructions: 'Give 5ml orally after breakfast and dinner; keep refrigerated.',
        expiryDate: '2026-09-14', // Due in 5 days
        prescribingDoctor: 'Dr. Katherine Bell, MD'
      }
    ];
  }

  return {
    id: \`child-\${fam.id}\`,
    fullName: fam.childName,
    dob: fam.dob,
    ageMonths: Math.max(0, months),
    ageYearsFormatted: fam.isUnborn ? \`🍼 Due \${fam.expectedDueDate}\` : \`\${years} yr\${years !== 1 ? 's' : ''} \${remMonths} mo\${remMonths !== 1 ? 's' : ''}\`,
    isUnderTwo: months < 24,
    isUnderThree: months < 36,
    isSchoolAge: months >= 72,
    fundingType: fam.fundingType,
    monthlyFee: fam.monthlyFee,
    eTransferDueDay: 1,
    eTransferStatus: fam.id === 'fam-4' ? 'overdue' : fam.admissionsStage === 'enrolled' ? 'paid' : 'pending',
    allergies: fam.allergies.filter(a => !a.startsWith('None')),
    dietaryRestrictions: fam.dietaryRestrictions,
    medicalNotes: fam.medicalNotes,
    epiPenRequired: fam.epiPenRequired,
    epiPenExpiry,
    asthmaPufferExpiry,
    immunizationExpiryDate,
    courtOrderExpiry,
    courtOrderDetails,
    subsidyRegion,
    subsidyCaseNumber,
    subsidyExpiryDate,
    prescriptionMeds,
    photoUrl: fam.photoUrl,
    admissionsStage: fam.admissionsStage,
    providerId: fam.assignedProviderId,
    parentId: \`parent-\${fam.id}\`,
    emergencyContacts: [
      { name: \`\${fam.emergencyContactName} (\${fam.emergencyRelationship})\`, relationship: fam.emergencyRelationship, phone: fam.emergencyContactPhone },
      { name: \`\${fam.parent1Name} (\${fam.parent1Relationship})\`, relationship: fam.parent1Relationship, phone: fam.parent1Cell }
    ],
    documents: docs,
    intakeSubmissionDate: '2026-08-20',
    desiredStartDate: fam.preferredStartDate,
    isUnborn: fam.isUnborn,
    expectedDueDate: fam.expectedDueDate,
    waitlistNotes: fam.waitlistNotes,
    withdrawnReason: fam.withdrawnReason
  };
}

/**
 * Converts a TestFamilyProfile into a ParentGuardian entity
 */
export function testFamilyToParent(fam: TestFamilyProfile): ParentGuardian {
  let contractExpiryDate: string | undefined = undefined;
  if (fam.id === 'fam-8') {
    contractExpiryDate = '2026-09-28'; // Annual fee renewal due in 19 days!
  } else if (fam.id === 'fam-12') {
    contractExpiryDate = '2027-02-15';
  } else if (fam.id === 'fam-10') {
    contractExpiryDate = '2027-03-01';
  }

  return {
    id: \`parent-\${fam.id}\`,
    fullName: fam.parent2Name ? \`\${fam.parent1Name} & \${fam.parent2Name}\` : fam.parent1Name,
    email: fam.parent1Email,
    phone: fam.parent1Cell,
    homeAddress: \`\${fam.homeAddress}, \${fam.city} \${fam.postalCode}\`,
    city: fam.city,
    region: fam.region,
    childIds: [\`child-\${fam.id}\`],
    formZeroApproved: fam.admissionsStage !== 'inquiry' && fam.admissionsStage !== 'waitlisted',
    formZeroNotes: \`Employer: \${fam.parent1Employer} • Physician: \${fam.physicianName} (\${fam.physicianPhone})\`,
    preferredStartDate: fam.preferredStartDate,
    preferredSchedule: 'full_time',
    contractExpiryDate
  };
}

/**
 * Convenience generator to produce all 24 Children and Parents pre-distributed across all pipeline stages
 */
export function getAllTestFamiliesData(): { children: Child[]; parents: ParentGuardian[] } {
  const children = TEST_FAMILIES_ROSTER.map(testFamilyToChild);
  const parents = TEST_FAMILIES_ROSTER.map(testFamilyToParent);
  return { children, parents };
}
`;

content += helpers;

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated testFamiliesData.ts with all 24 profiles, 6 providers, and compliance dates!');
