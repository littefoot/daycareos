export type UserRole = 'admin' | 'visitor' | 'provider' | 'parent' | 'register' | 'sandbox' | 'apply-provider' | 'apply-visitor';

export type FundingType = 'cwelcc' | 'subsidy' | 'private' | 'cwelcc_target';
export type RegionType = 'Durham Region' | 'York Region' | 'Toronto';

export type AdmissionsStage = 
  | 'inquiry' 
  | 'docs_needed' 
  | 'matching' 
  | 'contract' 
  | 'enrolled' 
  | 'waitlisted' 
  | 'withdrawn';

export type DocumentStatus = 
  | 'not_submitted' 
  | 'under_review' 
  | 'accepted' 
  | 'replacement_requested';

export type DocumentType = 
  | 'birth_certificate' 
  | 'health_card' 
  | 'immunization' 
  | 'allergy_plan' 
  | 'religious_exemption'
  | 'medical_exemption'
  | 'individualized_support_plan'
  | 'accident_report'
  | 'medication_plan'
  | 'food_restrictions_plan'
  | 'as_needed_supplemental';

export interface DocumentRecord {
  id: string;
  type: DocumentType;
  title: string;
  status: DocumentStatus;
  fileName?: string;
  fileUrl?: string;
  uploadedAt?: string;
  expiryDate?: string;
  notes?: string;
  formCode?: string; // e.g. 'SUP-1', 'SUP-4A', 'SUP-4B'
  downloadUrl?: string; // Official template link (e.g. '/documents/bin/...')
  dispatchedAt?: string;
  dispatchedBy?: string;
  dueDate?: string;
  priority?: 'normal' | 'urgent';
  targetAudience?: 'parent' | 'provider' | 'both';
  digitalFormId?: string; // Links to interactive form schema (e.g. 'sup-form-1', 'sup-form-4')
}

export interface HouseholdAdultMember {
  id: string;
  name: string;
  relationship: string;
  vscExpiryDate?: string; // 5-year expiry
  offenceDeclDate?: string; // 1-year annual expiry
  behaviourMgmtSignedDate?: string;
  status: 'compliant' | 'renewal_due' | 'expired';
}

export interface PrescriptionRecord {
  id: string;
  medicationName: string;
  dosage: string;
  instructions: string;
  expiryDate: string;
  prescribingDoctor?: string;
}

export interface SpecialPermissionRecord {
  id: string;
  type: 'walking_permission' | 'public_health' | 'pickup_authorization' | 'medical_special' | 'other';
  title: string;
  grantedDate: string;
  expiryDate?: string;
  notes?: string;
  authorizedPersonName?: string;
  authorizedPersonPhone?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface Child {
  id: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  preferredName?: string;
  dob: string; // YYYY-MM-DD
  ageMonths: number;
  ageYearsFormatted: string;
  isUnderTwo: boolean;
  isUnderThree: boolean;
  isSchoolAge?: boolean; // 6 to 12 years
  fundingType: FundingType;
  careDays?: string[]; // e.g. ['MON', 'TUES', 'WED', 'THURS', 'FRI']
  subsidyRegion?: RegionType;
  subsidyCaseNumber?: string;
  subsidyExpiryDate?: string;
  subsidizedAbsenceDaysUsed?: number; // Count of subsidized sick/absent days used this calendar year
  subsidizedAbsenceQuota?: number; // Total annual subsidized absence quota (defaults to 30)
  parentContributionDailyRate?: number; // Assessed daily parental contribution (e.g. $1.00/day)
  anticipatedMonthlyDays?: number; // Anticipated care days in month (e.g. 21 days)
  monthlyFee: number; // e.g. $478.50 for CWELCC ($22/day avg), or daily contribution * days for subsidy
  eTransferDueDay: number; // e.g. 1st or last day of month
  eTransferStatus: 'paid' | 'pending' | 'overdue';
  allergies: string[];
  dietaryRestrictions: string[];
  medicalNotes: string;
  epiPenRequired: boolean;
  epiPenExpiry?: string; // Sabrina's Law auto-injector expiration
  asthmaPufferExpiry?: string; // Ryan's Law inhaler prescription expiration
  prescriptionMeds?: PrescriptionRecord[];
  courtOrderExpiry?: string; // If legal/custody paper exists
  courtOrderDetails?: string;
  specialPermissions?: SpecialPermissionRecord[];
  photoUrl?: string;
  immunizationExpiryDate?: string; // Yellow card booster or milestone review date
  admissionsStage: AdmissionsStage;
  providerId?: string;
  parentId: string;
  emergencyContacts: EmergencyContact[];
  documents: DocumentRecord[];
  intakeSubmissionDate?: string;
  desiredStartDate?: string;
  isUnborn?: boolean; // For expecting parents applying in advance
  expectedDueDate?: string; // Expected delivery date
  waitlistNotes?: string;
  withdrawnReason?: string; // Reason why intake was denied or withdrawn
  isArchived?: boolean;
  archivedAt?: string;
}

export interface Provider {
  id: string;
  name: string;
  homeName: string;
  homeAddress: string;
  neighborhood: string;
  region: RegionType;
  phone: string;
  email: string;
  maxCapacity: number; // CCEYA standard: 6 max
  maxUnderThree: number; // CCEYA standard: 3 max
  maxUnderTwo: number; // CCEYA standard: 3 max under 2
  ownChildrenUnderSix: number; // Kept for backwards compatibility
  ownChildrenUnderFour?: number; // Reduces available licensed capacity
  acceptsSchoolAge?: boolean; // 6 to 12 years option
  enrolledChildIds: string[];
  rating: number;
  bio: string;
  photoUrl: string;
  operatingHours: string;
  annualComplianceStatus: 'compliant' | 'renewal_due';
  // Detailed Regulatory Compliance Fields
  vscExpiryDate?: string; // 5-year expiry
  offenceDeclDate?: string; // 1-year annual renewal
  firstAidExpiryDate?: string; // 3-year expiry
  foodHandlingExpiryDate?: string; // Optional
  tetanusExpiryDate?: string; // 10-year expiry
  tbXrayExpiryDate?: string; // 2-year expiry
  mmrVerified?: boolean;
  contractRenewalDate?: string; // 1-year annual independent contractor agreement
  homeInsuranceExpiryDate?: string; // 1-year annual liability rider
  t4aDeadline?: string; // Last working day of February
  complianceVideoUrl?: string; // Google Drive link for compliance videos
  householdAdults?: HouseholdAdultMember[];
}

export interface ParentGuardian {
  id: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  photoUrl?: string;
  homeAddress: string;
  city: string;
  region: RegionType;
  childIds: string[];
  formZeroApproved: boolean;
  formZeroNotes?: string;
  preferredStartDate: string;
  preferredSchedule: 'full_time' | 'part_time' | 'before_after_school' | 'weekend_care';
  employer?: string;
  workPhone?: string;
  secondaryGuardianName?: string;
  secondaryGuardianPhone?: string;
  secondaryGuardianEmail?: string;
  secondaryGuardianRelationship?: string;
  secondaryGuardianAddress?: string;
  secondaryGuardianEmployer?: string;
  secondaryGuardianWorkPhone?: string;
  contractExpiryDate?: string; // Annual fee agreement 1-year renewal
  custodyReviewDate?: string; // Court order custody review date if applicable
  isArchived?: boolean;
  archivedAt?: string;
}

export interface AttendanceEntry {
  status: string; // 'present' | 'absent' | 'sick' | 'vacation' | 'not_checked_in' | 'departed'
  checkIn?: string;
  checkInTimestamp?: string; // ISO 8601 timestamp string
  checkOut?: string;
  checkOutTimestamp?: string; // ISO 8601 timestamp string
  pickedUpBy?: string;
  netHours?: number;
  notes?: string;
}

export interface DailyAttendance {
  id: string;
  childId: string;
  providerId: string;
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent' | 'sick' | 'vacation' | 'departed';
  checkInTime?: string;
  checkOutTime?: string;
  pickedUpBy?: string;
  netHours?: number;
  mealNotes?: string;
  napNotes?: string;
}

export interface ProviderTimesheet {
  id: string;
  providerId: string;
  month: string; // e.g. "August 2026"
  totalDaysCare: number;
  totalSubsidizedDays: number;
  amountDueToProvider: number;
  status: 'draft' | 'submitted' | 'approved' | 'paid';
  submittedAt?: string;
  signedByName?: string;
}

export interface DailyActionAlert {
  id: string;
  severity: 'urgent' | 'warning' | 'info';
  title: string;
  description: string;
  category: 'document' | 'ratio' | 'payment' | 'screening' | 'health' | 'attendance';
  dateDue?: string;
  actionableTarget?: string;
  actionLabel?: string;
  targetTab?: string;
  metadata?: Record<string, any>;
}

export interface DynamicFormField {
  id: string;
  label: string;
  type: 'text' | 'dropdown' | 'checkbox' | 'date' | 'textarea';
  category: 'medical' | 'general' | 'emergency' | 'dietary';
  options?: string[];
  required: boolean;
  helpText?: string;
}

export interface HomeVisitor {
  id: string;
  name: string;
  title: string; // e.g. "Senior Home Child Care Visitor, RECE"
  receNumber: string; // e.g. "RECE #88219"
  receExpiryDate?: string; // 1-year annual renewal with College of ECE
  phone: string;
  email: string;
  region: RegionType;
  photoUrl: string;
  assignedProviderIds: string[];
  activeStatus: 'active' | 'on_leave';
  hireDate: string;
  lastVisitDate?: string;
  vscExpiryDate?: string; // 5-year expiry
  offenceDeclDate?: string; // 1-year annual expiry
  firstAidExpiryDate?: string; // 3-year expiry
  complianceVideoUrl?: string; // Google Drive link for compliance videos
}

export interface InspectionChecklistItem {
  id: string;
  code?: string;
  clause?: string;
  label: string;
  category: 'safety' | 'health' | 'sleep' | 'nutrition' | 'behaviour' | 'admin' | 'ratios' | 'program';
  riskLevel?: 'critical' | 'high' | 'moderate' | 'low';
  passed: boolean;
  notes?: string;
}

export interface CuratedClientNote {
  id: string;
  topic: string;
  summary: string;
  category: 'ratio_compliance' | 'portal_ui' | 'intake_pipeline' | 'policies_legal' | 'ai_feature' | 'general';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  status: 'proposed' | 'in_progress' | 'completed' | 'clarification_needed';
  originalQueries: string[];
  clarifyingQuestions?: string[];
  relatedPastWork?: string;
  lastUpdated: string;
}

export interface HomeInspectionRecord {
  id: string;
  providerId: string;
  providerName: string;
  homeName: string;
  visitorId: string;
  visitorName: string;
  inspectionDate: string; // YYYY-MM-DD
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  type: 'quarterly_cceya' | 'monthly_profile' | 'behaviour_management' | 'spot_check' | 'pre_placement';
  status: 'compliant' | 'conditional' | 'non_compliant';
  headcountVerified: number;
  underThreeCount: number;
  underTwoCount: number;
  ratioCompliant: boolean;
  checklistItems: InspectionChecklistItem[];
  correctiveActions?: string;
  actionDueDate?: string;
  visitorSignature: string;
  providerSignature: string;
  signedAt?: string;
  notes?: string;
  observationSetting?: string;
}

// ==========================================
// Provider Intake Pipeline Types
// ==========================================
export type ProviderIntakeStage = 
  | 'applied' 
  | 'vsc_screening' 
  | 'home_inspection' 
  | 'contract_orientation' 
  | 'licensed_active' 
  | 'withdrawn';

export interface ProviderApplicant {
  id: string;
  applicantName: string;
  email: string;
  phone: string;
  appliedDate: string;
  stage: ProviderIntakeStage;
  residenceType: 'detached' | 'semi' | 'townhouse' | 'apartment';
  ownsHome: boolean;
  address: string;
  neighborhood: string;
  city: string;
  region: RegionType;
  targetCapacity: number;
  householdAdultsCount: number;
  householdAdultsVscComplete: boolean;
  medicalClearanceReceived: boolean;
  firstAidCprLevelCVerified: boolean;
  firearmsDisclosed: boolean;
  homeInspectionPassed: boolean;
  homeInspectionDate?: string;
  contractSignedDate?: string;
  notes: string;
  existingChildrenCount?: number;
  languages?: string[];
  photoUrl?: string;
}

// ==========================================
// Home Visitor Intake Pipeline Types
// ==========================================
export type VisitorIntakeStage = 
  | 'screening' 
  | 'vsc_credentials' 
  | 'cceya_training' 
  | 'active' 
  | 'withdrawn';

export interface HomeVisitorApplicant {
  id: string;
  applicantName: string;
  email: string;
  phone: string;
  appliedDate: string;
  stage: VisitorIntakeStage;
  receNumber: string;
  receGoodStanding: boolean;
  vscCleared: boolean;
  vscDate?: string;
  firstAidCertified: boolean;
  cceyaChecklistTrainingComplete: boolean;
  shadowInspectionsCount: number; // 2 required shadow inspections
  assignedRegion?: 'Durham South' | 'Durham North' | 'York/Toronto';
  notes: string;
  photoUrl?: string;
}

// ==========================================
// AI Chat Conversation Types (Firestore Persisted)
// ==========================================
export interface ChatMessageRecord {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isSystemContext?: boolean;
  isAuthError?: boolean;
  formAction?: any;
  actionStatus?: 'pending' | 'applied' | 'dismissed' | 'undone';
  appliedVersion?: number;
}

export interface ChatConversationRecord {
  id: string;
  role: string;
  messages: ChatMessageRecord[];
  lastUpdated: string;
}

// ==========================================
// Agency Policy & Compliance Settings Types
// ==========================================
export interface StatutorySource {
  id: string;
  title: string;
  governingBody: string;
  url: string;
  legislationCitation: string;
  lastChecked: string;
  status: 'verified_active' | 'review_recommended';
  keyRules: string[];
}

export interface AgencyPolicySettings {
  cwelccPhase: 'current_22' | 'target_10';
  parentCwelccDailyRate: number;
  parentPrivateDailyRate: number;
  municipalSubsidyCopay: number;
  providerDailyCompensation: number;
  provincialCwelccTopUpGrant: number;
  primaryETransferRecipient: string;
  statutorySources: StatutorySource[];
  maxCapacityTotal: number;
  maxCapacityUnderThree: number;
  maxCapacityUnderTwo: number;
  quarterlyAuditFrequencyDays: number;
  lastPolicyReviewDate: string;
  autoCheckMinistryUpdates: boolean;
  agencyPhone?: string;
  agencyPhoneNotice?: string;
  cceyaTrainingModules?: TrainingModuleConfig[];
}

export interface TrainingModuleConfig {
  id: string;
  code: string;
  title: string;
  duration: string;
  topics: string[];
  videoUrl: string;
}

// ==========================================
// Agency Brand & Logo Media Library Types
// ==========================================
export interface AgencyLogoRecord {
  id: string;
  name: string;
  agencyEntity: 'daycare_os' | 'accs' | 'circles_in_the_sun' | 'custom' | string;
  url: string;
  localFallbackUrl?: string;
  isDefault?: boolean;
  uploadedAt?: string;
  sourceType: 'firebase_storage' | 'local' | 'uploaded';
  printHeightPx?: number;
}

// ==========================================
// AI Model Governance & Canadian PIPEDA Data Sovereignty (Task #28)
// ==========================================
export type AiDomainTask = 
  | 'cceya_policy'        // CCEYA Regulatory & Mixed-Age Ratio Guidance
  | 'form_mutation'       // Dynamic Form Schema Drafting & Rollback
  | 'admissions_intake'   // Admissions Screening & Parent Inquiries
  | 'curated_notes';      // Curated Requirements Backlog Synthesis

export interface AiDomainRoutingConfig {
  domain: AiDomainTask;
  title: string;
  description: string;
  preferredProvider: 'gemini' | 'openai' | 'deepseek' | 'local_heuristic';
  preferredModelId: string;
  piiMaskingLevel: 'strict_phipa' | 'standard_pipeda' | 'none';
  allowCloudProcessing: boolean;
}

export interface AiGovernanceSettings {
  cloudDatabaseAirGapVerified: boolean;
  canadianDataResidencyRegion: 'northamerica-northeast1';
  strictPiiMaskingEnabled: boolean;
  maskOhipNumbers: boolean;
  maskChildSurnames: boolean;
  maskPhysicalAddresses: boolean;
  maskPhoneAndEmail: boolean;
  domainRouting: Record<AiDomainTask, AiDomainRoutingConfig>;
  lastAuditTimestamp: string;
  auditedBy: string;
}

export * from './notes';

