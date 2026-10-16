/**
 * As-Needed Agency Document Bin & Distribution Registry
 * Sourced directly from Agency Director's "BIN (TO DISTRIBUTE AS NEEDED FOR PEOPEL WHO REQUEST THEM)"
 * 
 * Contains all 12 official agency & Ministry PDF templates, along with links to
 * interactive digital form schemas in FormBuilderStudio / DynamicFormEngine.
 */

export type AsNeededCategory = 
  | 'Statutory Exemption'
  | 'Special Needs & Inclusion'
  | 'Operations & Safety'
  | 'Provider Operations'
  | 'Curriculum & Pedagogy';

export interface AsNeededDocumentTemplate {
  id: string;
  formCode: string;
  title: string;
  category: AsNeededCategory;
  targetAudience: 'parent' | 'provider' | 'both';
  fileName: string;
  pdfUrl: string;
  fileSizeFormatted: string;
  description: string;
  statutoryReference: string;
  digitalFormId?: string; // Links to FormTemplate id (e.g. 'sup-form-1', 'sup-form-4')
  defaultNotes?: string;
  tags: string[];
}

export const AS_NEEDED_DOCUMENT_TEMPLATES: AsNeededDocumentTemplate[] = [
  // 1. STATEMENT OF CONSCIENCE OR RELIGIOUS BELIEF
  {
    id: 'bin-doc-conscience',
    formCode: 'SUP-4A',
    title: 'Statement of Conscience or Religious Belief (Affidavit)',
    category: 'Statutory Exemption',
    targetAudience: 'parent',
    fileName: 'Statement of Conscience or Religious Belief.pdf',
    pdfUrl: '/documents/bin/Statement of Conscience or Religious Belief.pdf',
    fileSizeFormatted: '204 KB',
    statutoryReference: 'CCEYA s. 35 & Immunization of School Pupils Act (ISPA)',
    digitalFormId: 'sup-form-4',
    description: 'Mandatory statutory sworn affidavit for parents seeking religious or moral exemption from childhood immunizations. Must be sworn before a Commissioner for Taking Affidavits.',
    defaultNotes: 'Please complete this sworn affidavit before a Commissioner of Oaths / Notary Public and upload the stamped copy.',
    tags: ['immunization', 'exemption', 'religious', 'affidavit', 'vaccine', 'public health']
  },

  // 2. STATEMENT OF MEDICAL EXEMPTION
  {
    id: 'bin-doc-medical-exemption',
    formCode: 'SUP-4B',
    title: 'Statement of Medical Exemption (Physician Certified)',
    category: 'Statutory Exemption',
    targetAudience: 'parent',
    fileName: 'Statement of Medical Exemption.pdf',
    pdfUrl: '/documents/bin/Statement of Medical Exemption.pdf',
    fileSizeFormatted: '245 KB',
    statutoryReference: 'CCEYA s. 35 & O. Reg. 137/15',
    digitalFormId: 'sup-form-4',
    description: 'Official Ontario Ministry medical exemption form certifying clinical contraindications to immunizations. Must be signed and stamped by a licensed physician with CPSO registration.',
    defaultNotes: 'Please have your family physician or pediatrician complete, sign, and stamp Section 3 with their CPSO license number.',
    tags: ['medical', 'exemption', 'doctor', 'physician', 'cpso', 'contraindication', 'vaccine']
  },

  // 3. INDIVIDUALIZED SUPPORT PLAN (ISP) - SPECIAL NEEDS
  {
    id: 'bin-doc-isp',
    formCode: 'SUP-1',
    title: 'Individualized Support Plan (ISP) — Special Needs',
    category: 'Special Needs & Inclusion',
    targetAudience: 'both',
    fileName: 'CITS Individualized Support Plan - Special Needs.pdf',
    pdfUrl: '/documents/bin/CITS Individualized Support Plan - Special Needs.pdf',
    fileSizeFormatted: '122 KB',
    statutoryReference: 'CCEYA s. 52 & O. Reg. 137/15',
    digitalFormId: 'sup-form-1',
    description: 'Mandatory statutory accommodation plan for children with cognitive, physical, communicative, social, or emotional adaptations. Developed in consultation with parents and resource consultants (e.g. Grandview Kids, CITS).',
    defaultNotes: 'Required under CCEYA s. 52 prior to placement. Outlines physical, social, and communicative environment adaptations for the provider home.',
    tags: ['special needs', 'isp', 'accessibility', 'inclusion', 'resource consultant', 'accommodations']
  },

  // 4. ACCIDENT & SERIOUS OCCURRENCE REPORT
  {
    id: 'bin-doc-accident-report',
    formCode: 'SUP-2',
    title: 'Accident, Incident & Serious Occurrence Report',
    category: 'Operations & Safety',
    targetAudience: 'both',
    fileName: 'CITS x ACCS Accident Report.pdf',
    pdfUrl: '/documents/bin/CITS x ACCS Accident Report.pdf',
    fileSizeFormatted: '537 KB',
    statutoryReference: 'CCEYA s. 38 & CCLS 24-Hour Notice',
    digitalFormId: 'sup-form-2',
    description: 'Official CCEYA Section 38 report documenting child injuries, first aid administered, parent notification, and serious occurrence reporting triggers.',
    defaultNotes: 'Must be completed immediately upon any injury or incident, with direct parental notification documented and signed.',
    tags: ['accident', 'injury', 'serious occurrence', 'first aid', 'incident', 'safety']
  },

  // 5. INDIVIDUALIZED MEDICAL PLAN & MEDICATION
  {
    id: 'bin-doc-medication-plan',
    formCode: 'SUP-3',
    title: 'Individualized Medical Plan & Drug Administration',
    category: 'Operations & Safety',
    targetAudience: 'parent',
    fileName: 'CITS x ACCS Food Restrictions Template.pdf',
    pdfUrl: '/documents/bin/CITS x ACCS Food Restrictions Template.pdf',
    fileSizeFormatted: 'Interactive / PDF',
    statutoryReference: 'CCEYA s. 40 (Prescription Schedules)',
    digitalFormId: 'sup-form-3',
    description: 'Physician prescription schedule and statutory parent consent authorizing the licensed home provider to administer prescription medications in original labeled pharmacy containers.',
    defaultNotes: 'Prescription medication must remain in original pharmaceutical packaging with pharmacist label intact showing child legal name and dosage.',
    tags: ['medication', 'prescription', 'doctor', 'dosage', 'pharmacy', 'administration']
  },

  // 6. SPECIAL DIETARY & FOOD RESTRICTIONS CONSENT PLAN
  {
    id: 'bin-doc-food-restrictions',
    formCode: 'SUP-5A',
    title: 'Special Dietary & Food Restrictions Consent Plan',
    category: 'Special Needs & Inclusion',
    targetAudience: 'parent',
    fileName: 'CITS x ACCS Food Restrictions Template.pdf',
    pdfUrl: '/documents/bin/CITS x ACCS Food Restrictions Template.pdf',
    fileSizeFormatted: '443 KB',
    statutoryReference: 'CCEYA s. 42 (Nutrition & Anaphylaxis)',
    digitalFormId: 'sup-form-5',
    description: 'Parent written instructions detailing severe food allergies, anaphylaxis precautions, dietary restrictions, or religious practices (Halal, Kosher, Vegetarian).',
    defaultNotes: 'Outlines dietary substitutions and cross-contamination precautions to be posted in the provider kitchen preparation area.',
    tags: ['food', 'allergy', 'dietary', 'halal', 'kosher', 'anaphylaxis', 'nutrition']
  },

  // 7. TWO-WEEK FOOD MENU TEMPLATE
  {
    id: 'bin-doc-food-menu',
    formCode: 'SUP-5B',
    title: 'Two-Week Food Menu Template',
    category: 'Provider Operations',
    targetAudience: 'provider',
    fileName: 'CITS x ACCS Food Menu Template (Two Weeks).pdf',
    pdfUrl: '/documents/bin/CITS x ACCS Food Menu Template (Two Weeks).pdf',
    fileSizeFormatted: '1.2 MB',
    statutoryReference: "Canada's Food Guide & CCEYA s. 42",
    digitalFormId: 'sup-form-5',
    description: 'Rotational 2-week nutritious meal and snack schedule for licensed home child care providers, aligned with Canada’s Food Guide recommendations.',
    defaultNotes: 'Must be visibly posted in the provider kitchen/dining area and accessible for parent review during pickup.',
    tags: ['menu', 'meals', 'nutrition', 'snacks', 'food guide', 'provider']
  },

  // 8. WEEKLY PROGRAM PLAN TEMPLATE
  {
    id: 'bin-doc-weekly-plan',
    formCode: 'PROV-WPP',
    title: 'Weekly Program Plan Template',
    category: 'Provider Operations',
    targetAudience: 'provider',
    fileName: 'CITS x ACCS Weekly Program Plan.pdf',
    pdfUrl: '/documents/bin/CITS x ACCS Weekly Program Plan.pdf',
    fileSizeFormatted: '202 KB',
    statutoryReference: 'CCEYA Pedagogical Planning',
    digitalFormId: 'prov-form-wpp',
    description: 'Weekly intentional learning and developmental activity planner balancing active play, sensory exploration, outdoor exploration, and quiet reflection.',
    defaultNotes: 'Plan weekly activities based on children’s emerging interests and post on the provider parent bulletin board.',
    tags: ['program plan', 'curriculum', 'weekly', 'activities', 'learning', 'provider']
  },

  // 9. 4-WEEK PROGRAM STRUCTURE EXAMPLE
  {
    id: 'bin-doc-4-week-structure',
    formCode: 'PROV-4WPS',
    title: '4-Week Program Structure Example & Guide',
    category: 'Provider Operations',
    targetAudience: 'provider',
    fileName: 'CITS x ACCS Example 4 Week Program Structure.pdf',
    pdfUrl: '/documents/bin/CITS x ACCS Example 4 Week Program Structure.pdf',
    fileSizeFormatted: '293 KB',
    statutoryReference: 'How Does Learning Happen? Framework',
    digitalFormId: 'prov-form-4wps',
    description: 'Four-week thematic and inquiry-based developmental curriculum guide demonstrating how to scaffold play across multiple age groups.',
    defaultNotes: 'Reference guide illustrating multi-week inquiry projects and seasonal environmental learning.',
    tags: ['curriculum', 'structure', '4-week', 'thematic', 'inquiry', 'pedagogy']
  },

  // 10. DAILY SCHEDULE TEMPLATE
  {
    id: 'bin-doc-daily-schedule',
    formCode: 'PROV-DST',
    title: 'Daily Schedule & Routine Template',
    category: 'Provider Operations',
    targetAudience: 'provider',
    fileName: 'CITS x ACCS Daily Schedule Template.pdf',
    pdfUrl: '/documents/bin/CITS x ACCS Daily Schedule Template.pdf',
    fileSizeFormatted: '141 KB',
    statutoryReference: 'CCEYA s. 45 (Daily Routines & Outdoor Play)',
    digitalFormId: 'prov-form-dst',
    description: 'Daily visual routine schedule ensuring minimum 2 hours of daily outdoor play (weather permitting), dedicated quiet/rest time, and scheduled meals.',
    defaultNotes: 'Customizable routine schedule balancing active indoor play, outdoor play, quiet time, and structured transitions.',
    tags: ['schedule', 'routine', 'daily', 'outdoor play', 'rest time', 'provider']
  },

  // 11. HOME CHILD CARE EMERGENCY CONTACT LIST (ONTARIO)
  {
    id: 'bin-doc-emergency-contacts',
    formCode: 'PROV-ECL',
    title: 'Home Child Care Emergency Contact List (Ontario)',
    category: 'Operations & Safety',
    targetAudience: 'provider',
    fileName: 'CITS x ACCS Home Child Care Emergency Contact List Ontario.pdf',
    pdfUrl: '/documents/bin/CITS x ACCS Home Child Care Emergency Contact List Ontario.pdf',
    fileSizeFormatted: '288 KB',
    statutoryReference: 'CCEYA s. 42 & Emergency Readiness',
    digitalFormId: 'prov-form-ecl',
    description: 'Statutory emergency contact sheet for posting directly beside the telephone/emergency exit with Police, Fire, Poison Control, Telehealth, and ACCS 24/7 hotline.',
    defaultNotes: 'Must be filled out with provider local emergency dispatch numbers and posted immediately beside the primary communication device.',
    tags: ['emergency', 'contacts', 'poison control', 'safety', 'hotline', 'phone numbers']
  },

  // 12. CURRICULUM: "HOW DOES LEARNING HAPPEN?" INTRO
  {
    id: 'bin-doc-curr-intro',
    formCode: 'CURR-INTRO',
    title: "Ontario Curriculum: How Does Learning Happen? (Intro Guide)",
    category: 'Curriculum & Pedagogy',
    targetAudience: 'both',
    fileName: '(OUR CURRICULUM) (INTRO) How Does Learning Happen - Home Child Care.pdf',
    pdfUrl: '/documents/bin/(OUR CURRICULUM) (INTRO) How Does Learning Happen - Home Child Care.pdf',
    fileSizeFormatted: '843 KB',
    statutoryReference: 'Ministry of Education Early Years Pedagogy',
    description: 'Introduction to Ontario’s pedagogical framework for early years environments: Belonging, Well-Being, Engagement, and Expression in home child care.',
    defaultNotes: 'Core educational philosophy shared with all enrolling families and new licensed home child care providers.',
    tags: ['curriculum', 'pedagogy', 'hdlh', 'belonging', 'well-being', 'engagement', 'expression']
  },

  // 13. CURRICULUM: "HOW DOES LEARNING HAPPEN?" COMPLETE MONOGRAPH
  {
    id: 'bin-doc-curr-full',
    formCode: 'CURR-FULL',
    title: "Ontario Curriculum: How Does Learning Happen? (Full Monograph)",
    category: 'Curriculum & Pedagogy',
    targetAudience: 'both',
    fileName: '(OUR CURRICULUM) how-does-learning-happen-en-2021-03-23.pdf',
    pdfUrl: '/documents/bin/(OUR CURRICULUM) how-does-learning-happen-en-2021-03-23.pdf',
    fileSizeFormatted: '1.4 MB',
    statutoryReference: 'Ontario Ministry of Education Official Publication',
    description: 'The complete official 90-page provincial pedagogical guide for early childhood educators, home child care visitors, and agency directors.',
    defaultNotes: 'Full provincial document setting out research, goals for children, and practices for early learning programs.',
    tags: ['curriculum', 'ministry', 'monograph', 'full', 'pedagogy', 'research']
  }
];

export const getAsNeededDocById = (id: string): AsNeededDocumentTemplate | undefined => {
  return AS_NEEDED_DOCUMENT_TEMPLATES.find(d => d.id === id || d.formCode === id);
};

export const getDocsByAudience = (audience: 'parent' | 'provider' | 'all'): AsNeededDocumentTemplate[] => {
  if (audience === 'all') return AS_NEEDED_DOCUMENT_TEMPLATES;
  return AS_NEEDED_DOCUMENT_TEMPLATES.filter(d => d.targetAudience === audience || d.targetAudience === 'both');
};

export const getDocsByCategory = (category: AsNeededCategory): AsNeededDocumentTemplate[] => {
  return AS_NEEDED_DOCUMENT_TEMPLATES.filter(d => d.category === category);
};
