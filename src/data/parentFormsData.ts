import { FormTemplate } from '../types/formSchema';

export const INITIAL_PARENT_FORMS: FormTemplate[] = [
  {
    id: 'par-form-0',
    formCode: 'PAR-0',
    title: '0. Initial Intake & Pre-Screening Form',
    category: 'Admissions',
    description: 'Initial intake inquiry to gather basic household needs, care region, and schedule the mandatory staff screening call before full registration.',
    version: '2026.1',
    isRequired: true,
    targetStage: 'inquiry',
    assignedTo: 'parent',
    lastUpdated: '2026-08-27',
    sections: [
      {
        id: 'sec-0-1',
        title: 'Initial Household Inquiry',
        description: 'Basic details to assess matching availability in your municipality.',
        fields: [
          { id: 'f0-1-first', name: 'parent_first_name', label: 'Primary Parent / Guardian First Name', type: 'text', placeholder: 'e.g. Sarah', required: true, gridCols: 2, order: 0 },
          { id: 'f0-1-last', name: 'parent_last_name', label: 'Primary Parent / Guardian Last Name', type: 'text', placeholder: 'e.g. Tremblay', required: true, gridCols: 2, order: 1 },
          { id: 'f0-2', name: 'primary_phone', label: 'Primary Guardian Contact Phone', type: 'phone', placeholder: 'e.g. (905) 555-0192', required: true, gridCols: 2, order: 2 },
          { id: 'f0-3', name: 'email', label: 'Primary Guardian Email Address', type: 'email', placeholder: 'e.g. sarah.t@example.com', required: true, gridCols: 2, order: 3 },
          { 
            id: 'f0-4', 
            name: 'care_region', 
            label: 'Desired Care Region / Municipality', 
            type: 'dropdown', 
            options: ['Durham Region', 'York Region', 'Toronto'], 
            required: true, 
            gridCols: 2,
            order: 4
          },
          { 
            id: 'f0-address', 
            name: 'parent_address', 
            label: 'Residential Street Address & Postal Code', 
            type: 'text', 
            placeholder: 'e.g. 142 Taunton Road East, Oshawa, ON L1G 3T8', 
            helpText: 'Helps us match you with licensed provider homes closest to your house or school.', 
            required: false, 
            gridCols: 1,
            order: 5 
          },
          { id: 'f0-5', name: 'child_name_age', label: 'Child Name & Estimated Age', type: 'text', placeholder: 'e.g. Liam, 18 months', required: true, gridCols: 2, order: 6 },
          { id: 'f0-6', name: 'desired_start_date', label: 'Desired Start Date', type: 'date', required: true, gridCols: 2, order: 7 },
          { id: 'f0-allergies', name: 'known_allergies', label: 'Known Allergies / Dietary / Medical Notes', type: 'text', placeholder: 'e.g. Peanuts, Sun, Air, Dairy, or None', required: false, gridCols: 2, order: 8 },
          { id: 'f0-8', name: 'screening_notes', label: 'Specific Schedule Needs / Notes', type: 'textarea', placeholder: 'e.g. Mon–Fri 7:30am–5pm; preferred start times, etc.', required: false, gridCols: 1, order: 9 },
          { 
            id: 'f0-prescreening-consent', 
            name: 'prescreening_acknowledgment', 
            label: 'By submitting this inquiry, I acknowledge that I am initiating an inquiry with DaycareOS, a licensed Home Child Care Agency operating under the Child Care and Early Years Act, 2014 (CCEYA) and regulated by the Ontario Ministry of Education. All personal and family information is kept strictly private and confidential.', 
            type: 'consent_clause', 
            required: true, 
            gridCols: 1,
            order: 10 
          }
        ]
      }
    ]
  },
  {
    id: 'par-form-1',
    formCode: 'PAR-1',
    title: '1. Master Application for Enrolment',
    category: 'Admissions',
    description: 'Comprehensive 10-page master registration form covering household guardians, emergency contacts, medical history, doctor details, and school transportation.',
    version: '2026.2',
    isRequired: true,
    targetStage: 'registration',
    assignedTo: 'parent',
    lastUpdated: '2026-08-27',
    sections: [
      {
        id: 'sec-1-agency',
        title: 'Child Care Type & Program Selection',
        description: 'Select the required schedule type and CWELCC program options.',
        fields: [
          { 
            id: 'f1-care-type', 
            name: 'care_type', 
            label: 'Type of Child Care Required', 
            type: 'dropdown', 
            options: ['Full-time (CWELCC $10/day)', 'Part-time', 'Before/After School (Ages 4-12)', 'Occasional / Emergency'], 
            required: true, 
            gridCols: 1 
          }
        ]
      },
      {
        id: 'sec-1-hours-care',
        title: 'Hours of Care & Requested Schedule',
        description: 'Mandatory Ministry Form 1 schedule table: Select care days (MON through SUN) and specify required operating hours.',
        fields: [
          {
            id: 'f1-days-of-care',
            name: 'days_of_care_multiselect',
            label: 'Days of Care (Select all required days)',
            type: 'multiselect',
            options: ['MON', 'TUES', 'WED', 'THURS', 'FRI', 'SAT', 'SUN'],
            required: true,
            gridCols: 1,
            helpText: 'Select all days when care is required.'
          },
          {
            id: 'f1-evening-care',
            name: 'evening_care',
            label: 'Evening Care Required (Extended / Non-standard hours)',
            type: 'checkbox',
            required: false,
            gridCols: 2
          },
          {
            id: 'f1-hours-schedule',
            name: 'hours_of_care_range',
            label: 'Hours of Care (e.g. 7:30 AM – 5:00 PM)',
            type: 'text',
            placeholder: 'e.g. 7:30 AM – 5:00 PM',
            required: true,
            gridCols: 2
          }
        ]
      },
      {
        id: 'sec-1-child',
        title: 'Child Information',
        description: 'Legal identity, health card, and background information.',
        fields: [
          { id: 'f1-child-legal-name', name: 'child_legal_name', label: 'Child Full Legal Name', type: 'text', required: true, gridCols: 2 },
          { id: 'f1-child-preferred-name', name: 'child_preferred_name', label: 'Preferred / Call Name', type: 'text', required: false, gridCols: 2 },
          { id: 'f1-dob', name: 'dob', label: 'Date of Birth (YYYY-MM-DD)', type: 'date', required: true, gridCols: 2 },
          { id: 'f1-health-card', name: 'health_card_number', label: 'Ontario Health Card (OHIP) Number', type: 'text', placeholder: 'e.g. 1234-567-890-XX', required: true, gridCols: 2 },
          { id: 'f1-languages', name: 'languages_spoken', label: 'Language(s) Spoken at Home', type: 'text', placeholder: 'e.g. English, French, Spanish', required: true, gridCols: 2 },
          { id: 'f1-siblings', name: 'siblings_enrolled', label: 'Other Siblings Enrolled with Agency', type: 'text', placeholder: 'Names and ages (if applicable)', required: false, gridCols: 2 }
        ]
      },
      {
        id: 'sec-1-guardian-1',
        title: 'Primary Parent / Guardian (Guardian 1)',
        description: 'Primary household contact, cell number, residential address, relationship, and employer.',
        fields: [
          { id: 'f1-g1-name', name: 'guardian_1_name', label: 'Primary Parent / Guardian Full Legal Name', type: 'text', required: true, gridCols: 2 },
          { id: 'f1-g1-cell', name: 'guardian_1_cell', label: 'Primary Cell Number', type: 'phone', required: true, gridCols: 2 },
          { id: 'f1-g1-email', name: 'guardian_1_email', label: 'Email Address', type: 'email', required: true, gridCols: 2 },
          { id: 'f1-g1-rel', name: 'guardian_1_relationship', label: 'Relationship to Child', type: 'text', placeholder: 'e.g. Mother, Father, Legal Guardian', required: true, gridCols: 2 },
          { id: 'f1-g1-address', name: 'guardian_1_address', label: 'Residential Address, City & Postal Code', type: 'text', required: true, gridCols: 2 },
          { id: 'f1-g1-employer', name: 'guardian_1_employer', label: 'Employer / Business Name (Optional)', type: 'text', placeholder: 'e.g. Lakeridge Health Oshawa', required: false, gridCols: 2 },
          { id: 'f1-g1-work-phone', name: 'guardian_1_work_phone', label: 'Work / Business Telephone (Optional)', type: 'phone', required: false, gridCols: 2 }
        ]
      },
      {
        id: 'sec-1-guardian-2',
        title: 'Second Parent / Guardian (Guardian 2 - Optional)',
        description: 'Spouse, co-parent, or secondary legal guardian details (if applicable).',
        fields: [
          { id: 'f1-g2-name', name: 'guardian_2_name', label: 'Second Parent / Guardian Full Legal Name (Optional)', type: 'text', required: false, gridCols: 2 },
          { id: 'f1-g2-cell', name: 'guardian_2_cell', label: 'Second Parent Primary Cell Number (Optional)', type: 'phone', required: false, gridCols: 2 },
          { id: 'f1-g2-email', name: 'guardian_2_email', label: 'Second Parent Email Address (Optional)', type: 'email', required: false, gridCols: 2 },
          { id: 'f1-g2-rel', name: 'guardian_2_relationship', label: 'Relationship to Child (Optional)', type: 'text', placeholder: 'e.g. Father, Mother, Co-Guardian', required: false, gridCols: 2 },
          { id: 'f1-g2-address', name: 'guardian_2_address', label: 'Residential Address (Optional, if different)', type: 'text', required: false, gridCols: 2 },
          { id: 'f1-g2-employer', name: 'guardian_2_employer', label: 'Employer / Business Name (Optional)', type: 'text', placeholder: 'e.g. Durham District School Board', required: false, gridCols: 2 },
          { id: 'f1-g2-work-phone', name: 'guardian_2_work_phone', label: 'Work / Business Telephone (Optional)', type: 'phone', required: false, gridCols: 2 }
        ]
      },
      {
        id: 'sec-1-doctor',
        title: "Child's Physician & Healthcare Provider",
        description: 'Primary medical care contact in case of emergency.',
        fields: [
          { id: 'f1-doc-name', name: 'doctor_name', label: "Doctor's Full Name", type: 'text', required: true, gridCols: 2 },
          { id: 'f1-doc-phone', name: 'doctor_phone', label: "Doctor's Clinic Phone Number", type: 'phone', required: true, gridCols: 2 },
          { id: 'f1-doc-address', name: 'doctor_address', label: "Doctor's Clinic Address & Unit", type: 'text', required: true, gridCols: 1 }
        ]
      },
      {
        id: 'sec-1-medical',
        title: "Medical, Allergies & Special Needs",
        description: "Critical allergen details, Sabrina's Law anaphylaxis protocols, and dietary requirements.",
        fields: [
          { id: 'f1-allergies', name: 'known_allergies', label: 'Known Allergies / Food Restrictions', type: 'text', placeholder: 'e.g. Peanuts, Sun, Air, Dairy, or None', required: true, gridCols: 2 },
          { 
            id: 'f1-epipen', 
            name: 'epipen_required', 
            label: "Does this child carry an EpiPen? (Sabrina's Law)", 
            type: 'dropdown', 
            options: ['No Auto-Injector Required', 'Yes — Auto-Injector Required (Sabrina\'s Law)'], 
            required: true, 
            gridCols: 2 
          },
          { id: 'f1-medical-notes', name: 'medical_instructions', label: 'Special Medical or Dietary Instructions', type: 'textarea', placeholder: 'Care routines, emergency protocol notes, etc.', required: false, gridCols: 1 }
        ]
      }
    ]
  },
  {
    id: 'par-form-2',
    formCode: 'PAR-2',
    title: '2. ACCS Emergency Wallet Form',
    category: 'Emergency',
    description: 'Compact emergency information card carried in provider’s emergency bag on daily outings and to the hospital in an emergency (Call 911).',
    version: '2026.1',
    isRequired: true,
    targetStage: 'placement',
    assignedTo: 'both',
    lastUpdated: '2026-08-27',
    sections: [
      {
        id: 'sec-2-wallet',
        title: 'Emergency Bag Information',
        description: 'Carried during walks, park visits, and off-site excursions.',
        fields: [
          { id: 'f2-child-photo', name: 'child_photo_wallet', label: 'Child Photo (Top-Left on Wallet Card)', type: 'file_upload', required: false, gridCols: 1 },
          { id: 'f2-child-name', name: 'child_name', label: 'Child Name (Last, First)', type: 'text', required: true, gridCols: 2 },
          { id: 'f2-birth-date', name: 'birth_date', label: 'Birth Date (DD/MM/YYYY)', type: 'date', required: true, gridCols: 2 },
          { id: 'f2-health-card', name: 'health_card_no', label: 'Health Card Number', type: 'text', required: true, gridCols: 2 },
          { id: 'f2-g1-cell', name: 'guardian_1_cell', label: 'Guardian 1 Primary Cell Number', type: 'phone', required: true, gridCols: 2 },
          { id: 'f2-g2-cell', name: 'emergency_g2_cell', label: 'Guardian 2 Primary Cell Number (Optional)', type: 'phone', required: false, gridCols: 2 },
          { id: 'f2-emergency-friend', name: 'emergency_friend_contact', label: 'Emergency Contact Person (Relative or Friend)', type: 'text', required: true, gridCols: 2 },
          { id: 'f2-emergency-friend-cell', name: 'emergency_friend_cell', label: 'Emergency Contact Cell Number', type: 'phone', required: true, gridCols: 2 },
          { 
            id: 'f2-outdoor-consent', 
            name: 'outdoor_play_permission', 
            label: 'I Give Permission for My Child to Go for Daily Outdoor Play and Walks', 
            type: 'consent_clause', 
            required: true, 
            gridCols: 1 
          }
        ]
      }
    ]
  },
  {
    id: 'par-form-3',
    formCode: 'PAR-3',
    title: '3. ACCS Emergency Medical Information & Parent Consent',
    category: 'Medical',
    description: 'Medical history, allergen details, Sabrina’s Law Epi-Pen authorization, and emergency ambulance medical treatment consent.',
    version: '2026.1',
    isRequired: true,
    targetStage: 'registration',
    assignedTo: 'parent',
    lastUpdated: '2026-08-27',
    sections: [
      {
        id: 'sec-3-med',
        title: 'Health History & Allergens',
        description: 'Strict medical protocols for home daycare compliance.',
        fields: [
          { 
            id: 'f3-allergy-detail', 
            name: 'allergy_details', 
            label: 'Allergies to Medication, Serum, Food, Environment (Give Details)', 
            type: 'textarea', 
            placeholder: 'e.g. Severe peanut allergy; reactions include hives and swelling', 
            required: true, 
            gridCols: 1 
          },
          { id: 'f3-procedure', name: 'allergic_emergency_procedure', label: 'Describe Medical Procedure in Case of Allergic Emergency', type: 'textarea', required: true, gridCols: 1 },
          { 
            id: 'f3-epipen', 
            name: 'has_epipen', 
            label: 'My Child Has an EPI-PEN for Allergic Emergencies', 
            type: 'radio', 
            options: ['Yes (Epi-Pen on site at all times)', 'No (No Epi-Pen required)'], 
            required: true, 
            gridCols: 2 
          },
          { 
            id: 'f3-past-illnesses', 
            name: 'past_illnesses', 
            label: 'Past Illnesses, Operations, Accidents, or Communicable Diseases', 
            type: 'textarea', 
            placeholder: 'e.g. Chicken pox, asthma inhaler, febrile seizures, etc.', 
            required: false, 
            gridCols: 1 
          },
          { 
            id: 'f3-consent-auth', 
            name: 'medical_treatment_auth', 
            label: 'I Authorize the Provider to Call an Ambulance and Seek Any Necessary Emergency Medical Treatment', 
            type: 'consent_clause', 
            required: true, 
            gridCols: 1 
          }
        ]
      }
    ]
  },
  {
    id: 'par-form-4',
    formCode: 'PAR-4',
    title: '4. ACCS Supervised Outdoor Play Plan',
    category: 'Safety',
    description: 'Outdoor gross motor development play plan. Outlines water safety rules (no standing water / no swimming) and neighborhood walk policies.',
    version: '2026.1',
    isRequired: true,
    targetStage: 'registration',
    assignedTo: 'parent',
    lastUpdated: '2026-08-27',
    sections: [
      {
        id: 'sec-4-outdoor',
        title: 'Outdoor Play & Water Safety Standards',
        description: 'Compliance policy approved by provider, parent, home visitor, and agency.',
        fields: [
          { 
            id: 'f4-policy-notice', 
            name: 'water_safety_notice', 
            label: 'Water Safety Rule: Providers do not take children swimming or near any standing water.', 
            type: 'notice_block', 
            required: false, 
            gridCols: 1 
          },
          { 
            id: 'f4-gross-motor', 
            name: 'gross_motor_ack', 
            label: 'I Acknowledge Daily Walks & Outdoor Gross Motor Activities (Climbing, Jumping, Park Play)', 
            type: 'consent_clause', 
            required: true, 
            gridCols: 1 
          },
          { id: 'f4-special-instructions', name: 'outdoor_special_instructions', label: 'Special Sunscreen / Outdoor Clothing Instructions', type: 'text', placeholder: 'e.g. Apply parent-supplied mineral sunscreen; sunhat required', required: false, gridCols: 1 }
        ]
      }
    ]
  },
  {
    id: 'par-form-5',
    formCode: 'PAR-5',
    title: '5. ACCS Master Parent Agreement & Contract',
    category: 'Legal & Agreement',
    description: 'Legally binding client contract: 1 calendar year placement agreement, 30-day written notice of withdrawal policy, advance monthly e-transfer fee payments, and non-refundable vacation policy.',
    version: '2026.1',
    isRequired: true,
    targetStage: 'registration',
    assignedTo: 'parent',
    lastUpdated: '2026-08-27',
    sections: [
      {
        id: 'sec-5-contract',
        title: 'Core Contractual Clauses',
        description: 'Binding agreement between Family and DaycareOS Inc.',
        fields: [
          { 
            id: 'f5-clause-1', 
            name: 'clause_1_compliance', 
            label: '1. I agree to comply with all agency policies and procedures and understand I am fully bound to this agreement.', 
            type: 'consent_clause', 
            required: true, 
            gridCols: 1 
          },
          { 
            id: 'f5-clause-2', 
            name: 'clause_2_withdrawal_notice', 
            label: '2. I agree to give One Month (30 Days) Notice of withdrawal in writing prior to withdrawal date.', 
            type: 'consent_clause', 
            required: true, 
            gridCols: 1 
          },
          { 
            id: 'f5-clause-3', 
            name: 'clause_3_failure_penalty', 
            label: '3. Failing to give 30 days notice will result in having to pay One Full Month’s Fee per child to the agency.', 
            type: 'consent_clause', 
            required: true, 
            gridCols: 1 
          },
          { 
            id: 'f5-clause-4', 
            name: 'clause_4_vacation_policy', 
            label: '4. I understand that there is no refund when my child(ren) is on vacation (space retention).', 
            type: 'consent_clause', 
            required: true, 
            gridCols: 1 
          },
          { 
            id: 'f5-clause-5', 
            name: 'clause_5_etransfer_payment', 
            label: '5. I agree to pay monthly child care fees in advance via Interac e-Transfer to billing@daycare-os.ca.', 
            type: 'consent_clause', 
            required: true, 
            gridCols: 1 
          },
          { id: 'f5-parent-sig', name: 'parent_signature_contract', label: 'Primary Parent / Guardian Legal Signature', type: 'signature', placeholder: 'Type Full Name as Legal Signature', required: true, gridCols: 2 },
          { id: 'f5-g2-sig', name: 'guardian_2_signature_contract', label: 'Secondary Guardian Legal Signature (Optional Co-Signer)', type: 'signature', placeholder: 'Type Full Name as Legal Co-Signature', required: false, gridCols: 2 },
          { id: 'f5-admission-date', name: 'date_of_admission', label: 'Confirmed Date of Admission', type: 'date', required: true, gridCols: 2 }
        ]
      }
    ]
  }
];
