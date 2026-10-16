import { 
  Provider, 
  DailyActionAlert, 
  DynamicFormField, 
  HomeVisitor, 
  HomeInspectionRecord, 
  ParentGuardian, 
  Child,
  ProviderApplicant,
  HomeVisitorApplicant
} from '../types';
import { getAllTestFamiliesData } from './testFamiliesData';

export const PROVIDER_PHOTO_MAP: Record<string, string> = {
  'prov-1': '/providers/fatima_al_mansoor.jpg',
  'prov-2': '/providers/grace_mirembe.jpg',
  'prov-3': '/providers/elena_rostova.jpg',
  'prov-4': '/providers/maria_santos.jpg',
  'prov-5': '/providers/amara_okafor.jpg',
  'prov-6': '/providers/chloe_tremblay.jpg'
};

export const VISITOR_PHOTO_MAP: Record<string, string> = {
  'visitor-1': '/visitors/sabrina_vance.jpg',
  'visitor-2': '/visitors/ryan_thorne.jpg',
  'visitor-3': '/visitors/nadia_chen.jpg'
};

export function getProviderPhoto(provider?: { id?: string; photoUrl?: string }): string {
  if (!provider) return '/providers/fatima_al_mansoor.jpg';
  if (!provider.photoUrl || provider.photoUrl.includes('firebasestorage.googleapis.com')) {
    if (provider.id && PROVIDER_PHOTO_MAP[provider.id]) {
      return PROVIDER_PHOTO_MAP[provider.id];
    }
  }
  return provider.photoUrl || (provider.id ? PROVIDER_PHOTO_MAP[provider.id] : '') || '/providers/fatima_al_mansoor.jpg';
}

export function getVisitorPhoto(visitor?: { id?: string; photoUrl?: string }): string {
  if (!visitor) return '/visitors/sabrina_vance.jpg';
  if (!visitor.photoUrl || visitor.photoUrl.includes('firebasestorage.googleapis.com')) {
    if (visitor.id && VISITOR_PHOTO_MAP[visitor.id]) {
      return VISITOR_PHOTO_MAP[visitor.id];
    }
  }
  return visitor.photoUrl || (visitor.id ? VISITOR_PHOTO_MAP[visitor.id] : '') || '/visitors/sabrina_vance.jpg';
}

export const INITIAL_PROVIDERS: Provider[] = [
  {
    id: 'prov-1',
    name: 'Fatima Al-Mansoor',
    homeName: 'Little Explorers Nest',
    homeAddress: '142 Simcoe St N',
    neighborhood: 'Oshawa Central',
    region: 'Durham Region',
    phone: '(905) 555-0142',
    email: 'fatima.sunshine@example.com',
    maxCapacity: 6,
    maxUnderThree: 3,
    maxUnderTwo: 3, // CCEYA standard: 3 under 2
    ownChildrenUnderSix: 1,
    ownChildrenUnderFour: 1, // Her 4-year-old child counts toward capacity
    acceptsSchoolAge: true,
    enrolledChildIds: ['child-fam-8'],
    rating: 4.9,
    bio: 'ECE Certified with 12 years of home child care experience. Specializing in Montessori sensorial exploration and nutritious Mediterranean-inspired meal plans.',
    photoUrl: '/providers/fatima_al_mansoor.jpg',
    operatingHours: '7:00 AM – 5:30 PM (Mon–Fri)',
    annualComplianceStatus: 'compliant',
    // Detailed Compliance & Expiry Records
    vscExpiryDate: '2028-04-15',
    offenceDeclDate: '2027-04-15',
    firstAidExpiryDate: '2027-09-20',
    foodHandlingExpiryDate: '2028-05-10',
    tetanusExpiryDate: '2031-06-12',
    tbXrayExpiryDate: '2027-08-01',
    mmrVerified: true,
    contractRenewalDate: '2027-04-15',
    homeInsuranceExpiryDate: '2027-02-28',
    complianceVideoUrl: 'https://drive.google.com/drive/folders/1A_ACCS_Fatima_Compliance_Training',
    householdAdults: [
      {
        id: 'ha-1',
        name: 'Tariq Al-Mansoor',
        relationship: 'Spouse (Adult)',
        vscExpiryDate: '2028-04-15',
        offenceDeclDate: '2027-04-15',
        behaviourMgmtSignedDate: '2026-04-15',
        status: 'compliant'
      }
    ]
  },
  {
    id: 'prov-2',
    name: 'Grace Mirembe',
    homeName: 'Graceful Steps Home Academy',
    homeAddress: '88 Taunton Rd E',
    neighborhood: 'Whitby North',
    region: 'Durham Region',
    phone: '(905) 555-0188',
    email: 'grace.mirembe@example.com',
    maxCapacity: 6,
    maxUnderThree: 3,
    maxUnderTwo: 3,
    ownChildrenUnderSix: 0,
    ownChildrenUnderFour: 0,
    acceptsSchoolAge: true,
    enrolledChildIds: ['child-fam-12'],
    rating: 5.0,
    bio: 'Passionate early years educator with spacious fenced backyard outdoor learning classroom and organic food garden program.',
    photoUrl: '/providers/grace_mirembe.jpg',
    operatingHours: '7:30 AM – 5:00 PM (Mon–Fri)',
    annualComplianceStatus: 'compliant',
    // Detailed Compliance & Expiry Records
    vscExpiryDate: '2029-01-10',
    offenceDeclDate: '2026-09-06', // Due in 10 days! (Triggers warning alert)
    firstAidExpiryDate: '2027-11-15',
    foodHandlingExpiryDate: '2028-03-20',
    tetanusExpiryDate: '2030-02-14',
    tbXrayExpiryDate: '2027-10-01',
    mmrVerified: true,
    contractRenewalDate: '2027-01-10',
    homeInsuranceExpiryDate: '2026-09-21', // Expires in 25 days! (Triggers warning alert)
    complianceVideoUrl: 'https://drive.google.com/drive/folders/1B_ACCS_Grace_Compliance_Training',
    householdAdults: []
  },
  {
    id: 'prov-3',
    name: 'Elena Rostova',
    homeName: 'Sunshine Sprouts Childcare',
    homeAddress: '310 Warden Ave',
    neighborhood: 'Markham / Scarborough Border',
    region: 'York Region',
    phone: '(416) 555-0310',
    email: 'elena.nest@example.com',
    maxCapacity: 6,
    maxUnderThree: 3,
    maxUnderTwo: 3,
    ownChildrenUnderSix: 0,
    ownChildrenUnderFour: 0,
    acceptsSchoolAge: false,
    enrolledChildIds: ['child-fam-21'],
    rating: 4.8,
    bio: 'Bilingual Russian/English home child care with music rhythm circles, early phonics, and certified CPR/First Aid.',
    photoUrl: '/providers/elena_rostova.jpg',
    operatingHours: '7:30 AM – 6:00 PM (Mon–Fri)',
    annualComplianceStatus: 'compliant',
    // Detailed Compliance & Expiry Records
    vscExpiryDate: '2027-10-12',
    offenceDeclDate: '2027-05-10',
    firstAidExpiryDate: '2026-09-16', // Expires in 20 days! (Triggers warning alert)
    foodHandlingExpiryDate: '2028-01-15',
    tetanusExpiryDate: '2029-07-22',
    tbXrayExpiryDate: '2027-03-15',
    mmrVerified: true,
    contractRenewalDate: '2027-05-10',
    homeInsuranceExpiryDate: '2027-03-30',
    complianceVideoUrl: 'https://drive.google.com/drive/folders/1C_ACCS_Elena_Compliance_Training',
    householdAdults: [
      {
        id: 'ha-2',
        name: 'Alexei Rostov',
        relationship: 'Adult Son (19)',
        vscExpiryDate: '2026-09-11', // Expires in 15 days!
        offenceDeclDate: '2027-05-10',
        behaviourMgmtSignedDate: '2026-05-10',
        status: 'renewal_due'
      }
    ]
  },
  {
    id: 'prov-4',
    name: 'Maria Santos',
    homeName: 'Tiny Tots Home Daycare',
    homeAddress: '55 Ellesmere Rd',
    neighborhood: 'Scarborough Town Centre',
    region: 'Toronto',
    phone: '(416) 555-0555',
    email: 'seedlings.haven@example.com',
    maxCapacity: 6,
    maxUnderThree: 3,
    maxUnderTwo: 3,
    ownChildrenUnderSix: 1, // 2-year old child
    ownChildrenUnderFour: 1, // Counts against ratio
    acceptsSchoolAge: false,
    enrolledChildIds: ['child-fam-22'],
    rating: 4.7,
    bio: 'Warm multicultural home environment focusing on social development, daily park outings, and kindergarten readiness.',
    photoUrl: '/providers/maria_santos.jpg',
    operatingHours: '7:00 AM – 5:00 PM (Mon–Fri)',
    annualComplianceStatus: 'renewal_due',
    // Detailed Compliance & Expiry Records
    vscExpiryDate: '2026-08-22', // EXPIRED! (Triggers urgent alert)
    offenceDeclDate: '2026-08-15', // Overdue!
    firstAidExpiryDate: '2028-02-10',
    foodHandlingExpiryDate: '2027-12-05',
    tetanusExpiryDate: '2025-06-10', // Expired
    tbXrayExpiryDate: '2026-07-15', // Expired
    mmrVerified: true,
    contractRenewalDate: '2026-08-15',
    homeInsuranceExpiryDate: '2026-08-20', // Expired!
    complianceVideoUrl: 'https://drive.google.com/drive/folders/1D_ACCS_Maria_Compliance_Training',
    householdAdults: [
      {
        id: 'ha-3',
        name: 'Carlos Santos',
        relationship: 'Adult Brother',
        vscExpiryDate: '2026-08-22', // Expired
        offenceDeclDate: '2026-08-15',
        behaviourMgmtSignedDate: '', // Missing behaviour management!
        status: 'expired'
      }
    ]
  },
  {
    id: 'prov-5',
    name: 'Amara Okafor',
    homeName: 'Blossom Valley Childcare',
    homeAddress: '1420 Brock Rd',
    neighborhood: 'Pickering Brock Ridge',
    region: 'Durham Region',
    phone: '(905) 555-0722',
    email: 'amara.okafor@blossomvalleycare.ca',
    maxCapacity: 6,
    maxUnderThree: 3,
    maxUnderTwo: 3,
    ownChildrenUnderSix: 1,
    ownChildrenUnderFour: 1, // Her 3-year-old child counts against ratio
    acceptsSchoolAge: true,
    enrolledChildIds: ['child-fam-10'],
    rating: 4.9,
    bio: 'Registered Early Childhood Educator with 9 years experience. Vibrant play-based learning environment, organic garden, and phonics readiness program.',
    photoUrl: '/providers/amara_okafor.jpg',
    operatingHours: '7:30 AM – 5:30 PM (Mon–Fri)',
    annualComplianceStatus: 'compliant',
    // Detailed Compliance & Expiry Records
    vscExpiryDate: '2027-11-20',
    offenceDeclDate: '2026-09-12', // Expires in 3 days! (Triggers warning alert)
    firstAidExpiryDate: '2028-06-14',
    foodHandlingExpiryDate: '2028-04-10',
    tetanusExpiryDate: '2032-01-15',
    tbXrayExpiryDate: '2027-05-20',
    mmrVerified: true,
    contractRenewalDate: '2027-02-15',
    homeInsuranceExpiryDate: '2027-01-10',
    complianceVideoUrl: 'https://drive.google.com/drive/folders/1G_ACCS_Amara_Compliance_Training',
    householdAdults: [
      {
        id: 'ha-4',
        name: 'Emeka Okafor',
        relationship: 'Spouse (Adult)',
        vscExpiryDate: '2028-02-10',
        offenceDeclDate: '2027-02-10',
        behaviourMgmtSignedDate: '2026-02-10',
        status: 'compliant'
      }
    ]
  },
  {
    id: 'prov-6',
    name: 'Chloe Tremblay',
    homeName: 'Maple Leaf Home Care',
    homeAddress: '78 Woodycrest Ave',
    neighborhood: 'Toronto East York',
    region: 'Toronto',
    phone: '(416) 555-0639',
    email: 'chloe.tremblay@mapleleafcare.ca',
    maxCapacity: 6,
    maxUnderThree: 3,
    maxUnderTwo: 3,
    ownChildrenUnderSix: 0,
    ownChildrenUnderFour: 0,
    acceptsSchoolAge: true,
    enrolledChildIds: ['child-fam-11'],
    rating: 5.0,
    bio: 'Bilingual French/English immersion home child care with focus on nature-based sensory play, early numeracy, and warm community atmosphere.',
    photoUrl: '/providers/chloe_tremblay.jpg',
    operatingHours: '7:00 AM – 5:00 PM (Mon–Fri)',
    annualComplianceStatus: 'compliant',
    // Detailed Compliance & Expiry Records
    vscExpiryDate: '2029-05-18',
    offenceDeclDate: '2027-05-18',
    firstAidExpiryDate: '2026-09-08', // Expired yesterday! (Triggers urgent alert)
    foodHandlingExpiryDate: '2027-09-15',
    tetanusExpiryDate: '2030-08-12',
    tbXrayExpiryDate: '2027-11-01',
    mmrVerified: true,
    contractRenewalDate: '2027-05-18',
    homeInsuranceExpiryDate: '2026-09-28', // Expires in 19 days! (Triggers warning alert)
    complianceVideoUrl: 'https://drive.google.com/drive/folders/1H_ACCS_Chloe_Compliance_Training',
    householdAdults: []
  }
];

const testFamiliesBundle = getAllTestFamiliesData();

export const INITIAL_PARENTS: ParentGuardian[] = testFamiliesBundle.parents;
export const INITIAL_CHILDREN: Child[] = testFamiliesBundle.children;

// Alerts are now 100% dynamically calculated from profile expiry dates via calculateComplianceAlerts()!
export const INITIAL_ALERTS: DailyActionAlert[] = [];

export const INITIAL_DYNAMIC_FIELDS: DynamicFormField[] = [
  {
    id: 'field-1',
    label: 'Known Medical Allergies & Sensitivities',
    type: 'dropdown',
    category: 'medical',
    options: ['None', 'Peanuts', 'Tree Nuts', 'Dairy / Lactose', 'Eggs', 'Seafood / Shellfish', 'Soy', 'Wheat / Gluten', 'Insect Stings', 'Other (Specify)'],
    required: true,
    helpText: 'Select all that apply. If severe, Anaphylaxis Form must be signed.'
  },
  {
    id: 'field-2',
    label: 'Requires On-Site Epi-Pen Auto-Injector',
    type: 'checkbox',
    category: 'medical',
    required: true,
    helpText: 'Mandatory under Sabrina\'s Law for all Ontario child care programs.'
  },
  {
    id: 'field-3',
    label: 'Dietary & Cultural Food Preferences',
    type: 'dropdown',
    category: 'dietary',
    options: ['Standard Nutrition Plan', 'Vegetarian', 'Vegan', 'Halal', 'Kosher Style', 'Gluten-Free Only', 'Parent Supplies All Food'],
    required: false,
    helpText: 'Helps matched provider coordinate fresh daily meals.'
  },
  {
    id: 'field-4',
    label: 'Preferred Nap / Resting Routine',
    type: 'text',
    category: 'general',
    required: false,
    helpText: 'E.g., 12:30 PM – 2:30 PM with favorite blanket or white noise.'
  },
  {
    id: 'field-5',
    label: 'Authorized Emergency Pick-Up Photo ID Verification',
    type: 'checkbox',
    category: 'emergency',
    required: true,
    helpText: 'Caregivers must show government photo ID before child release.'
  }
];

export const INITIAL_HOME_VISITORS: HomeVisitor[] = [
  {
    id: 'visitor-1',
    name: 'Sabrina Vance, RECE',
    title: 'Senior Home Child Care Visitor',
    receNumber: 'RECE #88219',
    receExpiryDate: '2026-09-18', // Annual renewal in 9 days! (Triggers warning)
    phone: '(905) 555-0199',
    email: 'sabrina.vance@allchildcaresolutions.com',
    region: 'Durham Region',
    photoUrl: '/visitors/sabrina_vance.jpg',
    assignedProviderIds: ['prov-1', 'prov-2'],
    activeStatus: 'active',
    hireDate: '2021-04-12',
    lastVisitDate: '2026-08-18',
    vscExpiryDate: '2028-03-10',
    offenceDeclDate: '2027-03-10',
    firstAidExpiryDate: '2027-06-15',
    complianceVideoUrl: 'https://drive.google.com/drive/folders/1E_ACCS_Sabrina_RECE_Training'
  },
  {
    id: 'visitor-2',
    name: 'Ryan Thorne, RECE',
    title: 'Field Compliance & Quality Advisor',
    receNumber: 'RECE #94103',
    receExpiryDate: '2027-03-31',
    phone: '(416) 555-0844',
    email: 'ryan.thorne@allchildcaresolutions.com',
    region: 'York Region',
    photoUrl: '/visitors/ryan_thorne.jpg',
    assignedProviderIds: ['prov-3', 'prov-4'],
    activeStatus: 'active',
    hireDate: '2022-09-01',
    lastVisitDate: '2026-08-10',
    vscExpiryDate: '2027-08-15',
    offenceDeclDate: '2027-08-15',
    firstAidExpiryDate: '2027-09-01',
    complianceVideoUrl: 'https://drive.google.com/drive/folders/1F_ACCS_Ryan_RECE_Training'
  },
  {
    id: 'visitor-3',
    name: 'Nadia Chen, RECE',
    title: 'Senior Quality & Practice Consultant',
    receNumber: 'RECE #61984',
    receExpiryDate: '2026-08-30', // Expired 10 days ago! (Triggers urgent alert)
    phone: '(416) 555-0922',
    email: 'nadia.chen@allchildcaresolutions.com',
    region: 'Toronto',
    photoUrl: '/visitors/nadia_chen.jpg',
    assignedProviderIds: ['prov-5', 'prov-6'],
    activeStatus: 'active',
    hireDate: '2020-02-15',
    lastVisitDate: '2026-08-25',
    vscExpiryDate: '2028-09-12',
    offenceDeclDate: '2027-02-20',
    firstAidExpiryDate: '2027-10-15',
    complianceVideoUrl: 'https://drive.google.com/drive/folders/1J_ACCS_Nadia_RECE_Training'
  }
];

export const INITIAL_INSPECTIONS: HomeInspectionRecord[] = [
  {
    id: 'insp-1',
    providerId: 'prov-1',
    providerName: 'Fatima Al-Mansoor',
    homeName: 'Little Explorers Nest',
    visitorId: 'visitor-1',
    visitorName: 'Sabrina Vance, RECE',
    inspectionDate: '2026-08-18',
    quarter: 'Q3',
    type: 'quarterly_cceya',
    status: 'compliant',
    headcountVerified: 4,
    underThreeCount: 2,
    underTwoCount: 2,
    ratioCompliant: true,
    checklistItems: [
      { id: 'c-1', label: 'Working smoke and carbon monoxide detectors on every floor (tested on site)', category: 'safety', passed: true },
      { id: 'c-2', label: 'Fire extinguisher inspected, charged, and mounted in kitchen area', category: 'safety', passed: true },
      { id: 'c-3', label: 'All prescription and OTC medications locked in lockbox', category: 'health', passed: true },
      { id: 'c-4', label: 'Cleaning chemicals and hazardous items stored in locked cupboards', category: 'safety', passed: true },
      { id: 'c-5', label: 'First aid kit fully stocked and unexpired', category: 'safety', passed: true },
      { id: 'c-6', label: 'Hot water temperature tested at tap (under 49°C / 120°F)', category: 'safety', passed: true, notes: 'Measured at 43°C' },
      { id: 'c-7', label: 'Cribs, cots, and safe sleep surfaces meet Health Canada standards', category: 'sleep', passed: true },
      { id: 'c-8', label: 'Weekly menu posted (2 weeks in advance) meeting Canada Food Guide', category: 'nutrition', passed: true },
      { id: 'c-9', label: 'Sabrina\'s Law: Anaphylaxis plans and Epi-Pens verified for Lucas Tremblay', category: 'health', passed: true },
      { id: 'c-10', label: 'Outdoor yard fenced (minimum 1.2m) with self-latching gate; no standing water', category: 'safety', passed: true },
      { id: 'c-11', label: 'Zero prohibited practices observed; positive behavior guidance used', category: 'behaviour', passed: true }
    ],
    visitorSignature: 'Sabrina Vance, RECE',
    providerSignature: 'Fatima Al-Mansoor',
    signedAt: '2026-08-18T11:45:00',
    notes: 'Home is exceptionally clean and well-organized. Children were engaged in sensory play during visit.'
  },
  {
    id: 'insp-2',
    providerId: 'prov-2',
    providerName: 'Grace Mirembe',
    homeName: 'Graceful Steps Home Academy',
    visitorId: 'visitor-1',
    visitorName: 'Sabrina Vance, RECE',
    inspectionDate: '2026-08-20',
    quarter: 'Q3',
    type: 'quarterly_cceya',
    status: 'compliant',
    headcountVerified: 3,
    underThreeCount: 1,
    underTwoCount: 1,
    ratioCompliant: true,
    checklistItems: [
      { id: 'c-1', label: 'Working smoke and carbon monoxide detectors on every floor (tested on site)', category: 'safety', passed: true },
      { id: 'c-2', label: 'Fire extinguisher inspected, charged, and mounted in kitchen area', category: 'safety', passed: true },
      { id: 'c-3', label: 'All prescription and OTC medications locked in lockbox', category: 'health', passed: true },
      { id: 'c-4', label: 'Cleaning chemicals and hazardous items stored in locked cupboards', category: 'safety', passed: true }
    ],
    visitorSignature: 'Sabrina Vance, RECE',
    providerSignature: 'Grace Mirembe',
    signedAt: '2026-08-20T10:15:00',
    notes: 'Fenced backyard garden and outdoor learning space in top compliance.'
  },
  {
    id: 'insp-3',
    providerId: 'prov-3',
    providerName: 'Elena Rostova',
    homeName: 'Sunshine Sprouts Childcare',
    visitorId: 'visitor-2',
    visitorName: 'Ryan Thorne, RECE',
    inspectionDate: '2026-08-22',
    quarter: 'Q3',
    type: 'quarterly_cceya',
    status: 'compliant',
    headcountVerified: 4,
    underThreeCount: 2,
    underTwoCount: 1,
    ratioCompliant: true,
    checklistItems: [
      { id: 'c-1', label: 'Working smoke and carbon monoxide detectors on every floor (tested on site)', category: 'safety', passed: true },
      { id: 'c-5', label: 'First aid kit fully stocked and unexpired', category: 'safety', passed: true }
    ],
    visitorSignature: 'Ryan Thorne, RECE',
    providerSignature: 'Elena Rostova',
    signedAt: '2026-08-22T14:30:00',
    notes: 'Bilingual Russian/English story corner observed.'
  },
  {
    id: 'insp-4',
    providerId: 'prov-4',
    providerName: 'Maria Santos',
    homeName: 'Tiny Tots Home Daycare',
    visitorId: 'visitor-2',
    visitorName: 'Ryan Thorne, RECE',
    inspectionDate: '2026-08-15',
    quarter: 'Q3',
    type: 'quarterly_cceya',
    status: 'conditional',
    headcountVerified: 5,
    underThreeCount: 3,
    underTwoCount: 2,
    ratioCompliant: true,
    checklistItems: [
      { id: 'c-1', label: 'Working smoke detectors verified', category: 'safety', passed: true },
      { id: 'c-4', label: 'Cleaning chemicals locked', category: 'safety', passed: true }
    ],
    correctiveActions: 'Adult household member Carlos Santos must submit updated VSC and signed Behaviour Management policy.',
    actionDueDate: '2026-09-15',
    visitorSignature: 'Ryan Thorne, RECE',
    providerSignature: 'Maria Santos',
    signedAt: '2026-08-15T16:00:00',
    notes: 'Conditional status pending police check renewal.'
  },
  {
    id: 'insp-5',
    providerId: 'prov-5',
    providerName: 'Amara Okafor',
    homeName: 'Blossom Valley Childcare',
    visitorId: 'visitor-3',
    visitorName: 'Nadia Chen, RECE',
    inspectionDate: '2026-08-25',
    quarter: 'Q3',
    type: 'quarterly_cceya',
    status: 'compliant',
    headcountVerified: 4,
    underThreeCount: 2,
    underTwoCount: 1,
    ratioCompliant: true,
    checklistItems: [
      { id: 'c-1', label: 'Smoke & CO detectors operational', category: 'safety', passed: true },
      { id: 'c-5', label: 'First aid kit verified', category: 'safety', passed: true },
      { id: 'c-8', label: 'Organic meal schedule posted', category: 'nutrition', passed: true }
    ],
    visitorSignature: 'Nadia Chen, RECE',
    providerSignature: 'Amara Okafor',
    signedAt: '2026-08-25T11:00:00',
    notes: 'Exemplary learning environment with vibrant play-based centres.'
  },
  {
    id: 'insp-6',
    providerId: 'prov-6',
    providerName: 'Chloe Tremblay',
    homeName: 'Maple Leaf Home Care',
    visitorId: 'visitor-3',
    visitorName: 'Nadia Chen, RECE',
    inspectionDate: '2026-08-28',
    quarter: 'Q3',
    type: 'quarterly_cceya',
    status: 'compliant',
    headcountVerified: 3,
    underThreeCount: 1,
    underTwoCount: 1,
    ratioCompliant: true,
    checklistItems: [
      { id: 'c-1', label: 'Safety detectors checked', category: 'safety', passed: true },
      { id: 'c-7', label: 'Safe sleep cribs verified', category: 'sleep', passed: true }
    ],
    visitorSignature: 'Nadia Chen, RECE',
    providerSignature: 'Chloe Tremblay',
    signedAt: '2026-08-28T13:30:00',
    notes: 'French immersion circle time observed. Warm home atmosphere.'
  }
];

export const INITIAL_PROVIDER_APPLICANTS: ProviderApplicant[] = [
  {
    id: 'prov-app-1',
    applicantName: 'Zahra Moradi',
    email: 'zahra.moradi@example.com',
    phone: '(905) 555-4412',
    appliedDate: '2026-09-08',
    stage: 'applied',
    residenceType: 'detached',
    ownsHome: true,
    address: '419 Harmony Rd N',
    neighborhood: 'Oshawa North',
    city: 'Oshawa',
    region: 'Durham Region',
    targetCapacity: 6,
    householdAdultsCount: 2,
    householdAdultsVscComplete: false,
    medicalClearanceReceived: false,
    firstAidCprLevelCVerified: false,
    firearmsDisclosed: false,
    homeInspectionPassed: false,
    existingChildrenCount: 2,
    languages: ['English', 'Farsi'],
    notes: 'Submitted initial application Form 01. Seeking to transition 2 unlicenced neighborhood children into CWELCC.'
  },
  {
    id: 'prov-app-2',
    applicantName: 'Sunita Patel',
    email: 'sunita.patel@example.com',
    phone: '(905) 555-8831',
    appliedDate: '2026-08-28',
    stage: 'vsc_screening',
    residenceType: 'semi',
    ownsHome: false,
    address: '52 Bur Oak Ave',
    neighborhood: 'Berczy Village',
    city: 'Markham',
    region: 'York Region',
    targetCapacity: 5,
    householdAdultsCount: 1,
    householdAdultsVscComplete: false,
    medicalClearanceReceived: true,
    firstAidCprLevelCVerified: true,
    firearmsDisclosed: false,
    homeInspectionPassed: false,
    existingChildrenCount: 0,
    languages: ['English', 'Gujarati', 'Hindi'],
    notes: 'Medical clearance stamped by physician; First Aid & CPR Level C verified. Awaiting York Regional Police VSC.'
  },
  {
    id: 'prov-app-3',
    applicantName: 'Kendra MacIntyre',
    email: 'kendra.m@example.com',
    phone: '(905) 555-3291',
    appliedDate: '2026-08-14',
    stage: 'home_inspection',
    residenceType: 'townhouse',
    ownsHome: true,
    address: '112 Anderson St',
    neighborhood: 'Whitby Central',
    city: 'Whitby',
    region: 'Durham Region',
    targetCapacity: 6,
    householdAdultsCount: 2,
    householdAdultsVscComplete: true,
    medicalClearanceReceived: true,
    firstAidCprLevelCVerified: true,
    firearmsDisclosed: false,
    homeInspectionPassed: false,
    homeInspectionDate: '2026-09-12',
    existingChildrenCount: 1,
    languages: ['English'],
    notes: 'Background clearances verified. Home Safety Assessment Form 02 scheduled with Home Visitor Sabrina Vance, RECE.'
  },
  {
    id: 'prov-app-4',
    applicantName: 'Beatrice Oduro',
    email: 'beatrice.oduro@example.com',
    phone: '(416) 555-7729',
    appliedDate: '2026-08-02',
    stage: 'contract_orientation',
    residenceType: 'detached',
    ownsHome: true,
    address: '78 Kingston Rd',
    neighborhood: 'Scarborough Village',
    city: 'Toronto',
    region: 'Toronto',
    targetCapacity: 6,
    householdAdultsCount: 1,
    householdAdultsVscComplete: true,
    medicalClearanceReceived: true,
    firstAidCprLevelCVerified: true,
    firearmsDisclosed: false,
    homeInspectionPassed: true,
    homeInspectionDate: '2026-08-25',
    existingChildrenCount: 0,
    languages: ['English', 'Twi'],
    notes: 'Home safety inspection passed with zero non-compliances. Reviewing Form 04 ACCS Child Care Contract and CCEYA policies.'
  },
  {
    id: 'prov-app-5',
    applicantName: 'Rochelle Desjardins',
    email: 'rochelle.d@example.com',
    phone: '(905) 555-9014',
    appliedDate: '2026-07-20',
    stage: 'licensed_active',
    residenceType: 'detached',
    ownsHome: true,
    address: '1840 Brock Rd',
    neighborhood: 'Brock Ridge',
    city: 'Pickering',
    region: 'Durham Region',
    targetCapacity: 6,
    householdAdultsCount: 2,
    householdAdultsVscComplete: true,
    medicalClearanceReceived: true,
    firstAidCprLevelCVerified: true,
    firearmsDisclosed: false,
    homeInspectionPassed: true,
    homeInspectionDate: '2026-08-10',
    contractSignedDate: '2026-08-29',
    existingChildrenCount: 0,
    languages: ['English', 'French'],
    notes: 'All CCEYA pre-licensing criteria fulfilled. Ready for 1-click graduation to active licensed provider directory.'
  }
];

export const INITIAL_HOME_VISITOR_APPLICANTS: HomeVisitorApplicant[] = [
  {
    id: 'vis-app-1',
    applicantName: 'Mei-Ling Zhou, RECE',
    email: 'meiling.zhou@example.com',
    phone: '(416) 555-3184',
    appliedDate: '2026-09-04',
    stage: 'screening',
    receNumber: 'RECE #72144',
    receGoodStanding: true,
    vscCleared: false,
    firstAidCertified: true,
    cceyaChecklistTrainingComplete: false,
    shadowInspectionsCount: 0,
    assignedRegion: 'York/Toronto',
    notes: '8 years in infant-toddler centre care. Good standing verified on College of ECE public register. Toronto Police VSC pending.'
  },
  {
    id: 'vis-app-2',
    applicantName: 'Danielle Dubois, RECE',
    email: 'danielle.dubois@example.com',
    phone: '(905) 555-6672',
    appliedDate: '2026-08-22',
    stage: 'vsc_credentials',
    receNumber: 'RECE #68910',
    receGoodStanding: true,
    vscCleared: true,
    vscDate: '2026-08-25',
    firstAidCertified: true,
    cceyaChecklistTrainingComplete: false,
    shadowInspectionsCount: 0,
    assignedRegion: 'Durham North',
    notes: 'VSC and CPR-C cleared. Ready for 38-page Ministry CCEYA inspection checklist orientation and mentor assignment.'
  },
  {
    id: 'vis-app-3',
    applicantName: 'Tanya Sterling, RECE',
    email: 'tanya.sterling@example.com',
    phone: '(905) 555-9941',
    appliedDate: '2026-08-05',
    stage: 'cceya_training',
    receNumber: 'RECE #54032',
    receGoodStanding: true,
    vscCleared: true,
    vscDate: '2026-08-10',
    firstAidCertified: true,
    cceyaChecklistTrainingComplete: true,
    shadowInspectionsCount: 2,
    assignedRegion: 'Durham South',
    notes: 'Completed 2 unannounced shadow inspections with Sabrina Vance RECE. Excellent rapport with providers and meticulous ratio audit.'
  }
];
