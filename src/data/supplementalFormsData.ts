import { FormTemplate } from '../types/formSchema';

export const INITIAL_SUPPLEMENTAL_FORMS: FormTemplate[] = [
  // =========================================================================
  // SUP-1: INDIVIDUALIZED SUPPORT PLAN (ISP) - SPECIAL NEEDS
  // =========================================================================
  {
    id: 'sup-form-1',
    formCode: 'SUP-1',
    title: 'Individualized Support Plan (ISP) — Special Needs',
    category: 'Special Needs',
    description: 'Mandatory statutory support plan under CCEYA s. 52 for children with cognitive, physical, communicative, social, or emotional needs requiring environmental aids and adaptations.',
    version: '2026.1',
    isRequired: false,
    targetStage: 'placement',
    assignedTo: 'supplemental',
    lastUpdated: '2026-10-02',
    sections: [
      {
        id: 'sec-1-child-details',
        title: 'Section 1: Child & Specialist Demographics',
        description: 'Basic identifying details and external health professional involvement.',
        fields: [
          { id: 'isp_child_name', name: 'child_legal_name', label: "Child's Full Legal Name", type: 'text', required: true, gridCols: 2 },
          { id: 'isp_child_dob', name: 'child_dob', label: 'Date of Birth', type: 'date', required: true, gridCols: 1 },
          { id: 'isp_date_completed', name: 'date_completed', label: 'Date Plan Completed', type: 'date', required: true, gridCols: 1 },
          { id: 'isp_resource_consultant', name: 'resource_consultant_name', label: 'Assigned Resource Consultant / Agency', type: 'text', placeholder: 'e.g. Grandview Kids, CITS, CDRCP', required: false, gridCols: 2 },
          { id: 'isp_consultant_contact', name: 'consultant_phone_email', label: 'Consultant Contact (Phone / Email)', type: 'text', required: false, gridCols: 2 }
        ]
      },
      {
        id: 'sec-2-program-support',
        title: 'Section 2: Meaningful Program Participation',
        description: 'How the home child care program will support purposeful engagement.',
        fields: [
          { 
            id: 'isp_program_approach', 
            name: 'program_participation_strategy', 
            label: 'Program Participation Strategies & Support Approach', 
            type: 'textarea', 
            placeholder: 'Detail collaborating with resource consultants, providing flexibility in daily routines, individualized transition cues...',
            required: true, 
            gridCols: 2 
          }
        ]
      },
      {
        id: 'sec-3-physical-env',
        title: 'Section 3: Physical Environment Adaptations & Aids',
        description: 'Modifications to the home layout, specialized equipment, and mobility aids.',
        fields: [
          { 
            id: 'isp_phys_adaptations', 
            name: 'physical_environment_modifications', 
            label: 'Physical Environment Modifications', 
            type: 'textarea', 
            placeholder: 'e.g. Modified posture seating, lowered coat hooks, non-slip floor mats, reducing extraneous noise, visual room boundaries (or N/A)', 
            required: true, 
            gridCols: 2 
          },
          { 
            id: 'isp_phys_instructions', 
            name: 'physical_aids_instructions', 
            label: 'Staff / Provider Instructions for Physical Aids & Transitions', 
            type: 'textarea', 
            placeholder: 'e.g. Assistance required during transitions, specific seating during meal and circle times...', 
            required: true, 
            gridCols: 2 
          }
        ]
      },
      {
        id: 'sec-4-social-learning',
        title: 'Section 4: Social & Learning Environment Accommodations',
        description: 'Aids for communicative development, peer interaction, and learning activities.',
        fields: [
          { 
            id: 'isp_social_supports', 
            name: 'social_environment_modifications', 
            label: 'Social & Communication Supports', 
            type: 'textarea', 
            placeholder: 'e.g. Visual picture schedule cards (PECS), cooperative turn-taking activities, paired peer modeling...', 
            required: true, 
            gridCols: 2 
          },
          { 
            id: 'isp_learning_supports', 
            name: 'learning_environment_modifications', 
            label: 'Learning Environment Adaptations & Sensory Supports', 
            type: 'textarea', 
            placeholder: 'e.g. Sensory calming bag, weighted lap pad, simplified step-by-step instructions, specialized grasping aids...', 
            required: true, 
            gridCols: 2 
          }
        ]
      },
      {
        id: 'sec-5-parent-consent',
        title: 'Section 5: Parent & Professional Collaboration Sign-Off',
        description: 'Parent consent confirming joint development and sharing with the licensed provider.',
        fields: [
          { 
            id: 'isp_parent_consent', 
            name: 'parent_collaboration_agreement', 
            label: 'I confirm that this Individualized Support Plan was developed in consultation with parent/guardians and relevant health professionals under O. Reg. 137/15 s. 52.', 
            type: 'checkbox', 
            required: true, 
            gridCols: 2 
          },
          { id: 'isp_parent_name', name: 'parent_signer_name', label: 'Parent / Legal Guardian Name', type: 'text', required: true, gridCols: 1 },
          { id: 'isp_sign_date', name: 'sign_off_date', label: 'Date', type: 'date', required: true, gridCols: 1 }
        ]
      }
    ]
  },

  // =========================================================================
  // SUP-2: SERIOUS OCCURRENCE & ACCIDENT / INCIDENT REPORT
  // =========================================================================
  {
    id: 'sup-form-2',
    formCode: 'SUP-2',
    title: 'Accident, Incident & Serious Occurrence Report',
    category: 'Operations',
    description: 'CCEYA Section 38 incident report documenting child injuries, first aid administered, parent notification, and Ministry CCLS reporting triggers.',
    version: '2026.1',
    isRequired: false,
    targetStage: 'annual',
    assignedTo: 'both',
    lastUpdated: '2026-10-02',
    sections: [
      {
        id: 'sec-1-accident-incident',
        title: 'Section 1: Incident & Injury Circumstances',
        description: 'Accurate chronological record of when and where the event occurred.',
        fields: [
          { id: 'acc_child_name', name: 'child_name', label: "Child's Full Legal Name", type: 'text', required: true, gridCols: 2 },
          { id: 'acc_date', name: 'incident_date', label: 'Date of Incident', type: 'date', required: true, gridCols: 1 },
          { id: 'acc_time', name: 'incident_time', label: 'Exact Time of Incident', type: 'time', required: true, gridCols: 1 },
          { id: 'acc_location', name: 'location_of_incident', label: 'Exact Location (e.g. Playroom, Backyard Play Yard, Dining Area)', type: 'text', required: true, gridCols: 2 },
          { id: 'acc_witnesses', name: 'witness_names', label: 'Adult Witnesses Present', type: 'text', required: true, gridCols: 2 },
          { 
            id: 'acc_nature', 
            name: 'injury_nature', 
            label: 'Nature of Injury', 
            type: 'dropdown', 
            required: true, 
            options: ['Bruise / Contusion', 'Cut / Laceration', 'Scrape / Abrasion', 'Bump / Swelling', 'Bite', 'Burn', 'Sprain / Strain', 'No Apparent Injury', 'Other'],
            gridCols: 1 
          },
          { id: 'acc_body_part', name: 'injured_body_area', label: 'Body Part Affected (e.g. Left Knee, Forehead)', type: 'text', required: true, gridCols: 1 },
          { id: 'acc_narrative', name: 'cause_narrative', label: 'Detailed Description of How the Incident Occurred', type: 'textarea', required: true, gridCols: 2 }
        ]
      },
      {
        id: 'sec-2-first-aid',
        title: 'Section 2: First Aid & Child Reaction',
        description: 'Immediate comfort measures and medical care provided.',
        fields: [
          { id: 'acc_reaction', name: 'child_reaction', label: "Child's Demeanour & Reaction (e.g. Cried briefly, easily consoled)", type: 'text', required: true, gridCols: 2 },
          { id: 'acc_treatment', name: 'first_aid_administered', label: 'First Aid Administered (e.g. Ice pack 10 min, washed with soap & water, band-aid)', type: 'textarea', required: true, gridCols: 2 },
          { id: 'acc_provider_name', name: 'provider_treating', label: 'First Aid Administered By (Full Name)', type: 'text', required: true, gridCols: 2 }
        ]
      },
      {
        id: 'sec-3-parent-notification',
        title: 'Section 3: Parent Contact & Serious Occurrence Gating',
        description: 'Mandatory documentation of prompt parental notification.',
        fields: [
          { 
            id: 'acc_notify_method', 
            name: 'parent_notification_channel', 
            label: 'Parent Contact Method', 
            type: 'dropdown', 
            required: true, 
            options: ['Phone Call (Spoke Directly)', 'In-Person at Pick-Up', 'Voicemail Left', 'Urgent SMS / Email'],
            gridCols: 1 
          },
          { id: 'acc_notify_time', name: 'notification_timestamp', label: 'Notification Time', type: 'time', required: true, gridCols: 1 },
          { id: 'acc_notify_parent_name', name: 'parent_contacted_name', label: 'Parent / Guardian Contacted', type: 'text', required: true, gridCols: 2 },
          { 
            id: 'acc_is_serious_occ', 
            name: 'ministry_serious_occurrence_flag', 
            label: 'Did this incident require emergency medical services (911/hospital) or qualify as a reportable Serious Occurrence under CCEYA s. 38 (24-hr CCLS notice)?', 
            type: 'dropdown', 
            options: ['No — Minor First Aid Only', 'Yes — Reportable to MEDU within 24 Hours'],
            required: true, 
            gridCols: 2 
          }
        ]
      }
    ]
  },

  // =========================================================================
  // SUP-3: INDIVIDUALIZED MEDICAL PLAN & MEDICATION ADMINISTRATION
  // =========================================================================
  {
    id: 'sup-form-3',
    formCode: 'SUP-3',
    title: 'Individualized Medical Plan & Drug Administration',
    category: 'Special Needs',
    description: 'CCEYA Section 40 medication schedule and authorization protocol. Prescribed drugs must remain in original container with pharmacy label.',
    version: '2026.1',
    isRequired: false,
    targetStage: 'placement',
    assignedTo: 'supplemental',
    lastUpdated: '2026-10-02',
    sections: [
      {
        id: 'sec-1-medication-details',
        title: 'Section 1: Prescription & Medication Specifications',
        description: 'Exact pharmaceutical instructions from the licensed prescribing physician.',
        fields: [
          { id: 'med_child_name', name: 'child_name', label: "Child's Full Name", type: 'text', required: true, gridCols: 2 },
          { id: 'med_name', name: 'medication_name', label: 'Medication Name (as on prescription label)', type: 'text', required: true, gridCols: 1 },
          { id: 'med_dosage', name: 'prescribed_dosage', label: 'Exact Dosage (e.g. 5ml, 1 puff)', type: 'text', required: true, gridCols: 1 },
          { id: 'med_route', name: 'administration_route', label: 'Route of Administration', type: 'dropdown', options: ['Oral', 'Inhaled / Puffer', 'Topical / Ointment', 'EpiPen / Auto-Injector', 'Eye / Ear Drops'], required: true, gridCols: 1 },
          { id: 'med_frequency', name: 'prescribed_time_frequency', label: 'Scheduled Time / Frequency', type: 'text', placeholder: 'e.g. 12:00 PM daily with lunch, or PRN as needed', required: true, gridCols: 1 },
          { id: 'med_expiry', name: 'medication_expiry_date', label: 'Medication Expiry Date', type: 'date', required: true, gridCols: 1 },
          { id: 'med_storage', name: 'storage_requirements', label: 'Storage Condition', type: 'dropdown', options: ['Locked Box (Room Temp)', 'Refrigerated Locked Container', 'Immediate Carried on Person (EpiPen)'], required: true, gridCols: 1 }
        ]
      },
      {
        id: 'sec-2-physician-info',
        title: 'Section 2: Prescribing Physician & Clinic',
        description: 'Medical authority details for pharmacist / physician verification.',
        fields: [
          { id: 'med_doctor_name', name: 'physician_name', label: 'Prescribing Physician Name', type: 'text', required: true, gridCols: 1 },
          { id: 'med_clinic_phone', name: 'clinic_phone', label: 'Clinic Phone Number', type: 'phone', required: true, gridCols: 1 },
          { id: 'med_pharmacy_rx', name: 'pharmacy_rx_number', label: 'Pharmacy Rx #', type: 'text', required: false, gridCols: 2 }
        ]
      },
      {
        id: 'sec-3-parent-auth',
        title: 'Section 3: Parent Consent & Administration Authorization',
        description: 'Statutory authorization for ACCS licensed provider to administer.',
        fields: [
          { 
            id: 'med_consent_check', 
            name: 'parent_med_admin_authorization', 
            label: 'I authorize the licensed home child care provider to administer the prescribed medication specified above in accordance with written instructions.', 
            type: 'checkbox', 
            required: true, 
            gridCols: 2 
          },
          { id: 'med_parent_signature_name', name: 'parent_signature_name', label: 'Parent / Legal Guardian Signature Name', type: 'text', required: true, gridCols: 1 },
          { id: 'med_signature_date', name: 'parent_signature_date', label: 'Date', type: 'date', required: true, gridCols: 1 }
        ]
      }
    ]
  },

  // =========================================================================
  // SUP-4: STATEMENT OF CONSCIENCE OR MEDICAL EXEMPTION
  // =========================================================================
  {
    id: 'sup-form-4',
    formCode: 'SUP-4',
    title: 'Statement of Conscience or Medical Exemption',
    category: 'Compliance',
    description: 'Official Ontario Ministry statutory affidavit for immunization exemptions under CCEYA s. 35 and the Immunization of School Pupils Act (ISPA).',
    version: '2026.1',
    isRequired: false,
    targetStage: 'placement',
    assignedTo: 'parent',
    lastUpdated: '2026-10-02',
    sections: [
      {
        id: 'sec-1-exemption-nature',
        title: 'Section 1: Exemption Category & Child Information',
        description: 'Statutory designation under Ontario Regulation 137/15.',
        fields: [
          { 
            id: 'exemp_type', 
            name: 'exemption_category', 
            label: 'Statutory Exemption Basis', 
            type: 'dropdown', 
            required: true, 
            options: ['Statement of Conscience or Religious Belief (Affidavit)', 'Statement of Medical Exemption (Signed by Physician)'],
            gridCols: 2 
          },
          { id: 'exemp_child_name', name: 'child_legal_name', label: "Child's Full Legal Name", type: 'text', required: true, gridCols: 2 },
          { id: 'exemp_child_dob', name: 'child_dob', label: 'Child Date of Birth', type: 'date', required: true, gridCols: 1 },
          { id: 'exemp_parent_name', name: 'parent_guardian_name', label: 'Parent / Legal Guardian Name', type: 'text', required: true, gridCols: 1 }
        ]
      },
      {
        id: 'sec-2-vaccines-exempted',
        title: 'Section 2: Exempted Vaccines & Outbreak Exclusion Terms',
        description: 'Mandatory exclusion during vaccine-preventable disease outbreaks.',
        fields: [
          { 
            id: 'exemp_vaccine_list', 
            name: 'exempted_vaccines', 
            label: 'Specify Vaccinations Exempted', 
            type: 'textarea', 
            placeholder: 'e.g. All childhood immunizations, or specific antigens: MMR, DTaP-IPV-Hib, Men-C-C...', 
            required: true, 
            gridCols: 2 
          },
          { 
            id: 'exemp_outbreak_agreement', 
            name: 'outbreak_exclusion_acknowledgment', 
            label: 'I acknowledge that in the event of an outbreak of a vaccine-preventable disease, the local Medical Officer of Health may order the exclusion of my non-immunized child from the child care premises until the outbreak is declared resolved.', 
            type: 'checkbox', 
            required: true, 
            gridCols: 2 
          }
        ]
      },
      {
        id: 'sec-3-commissioner-physician',
        title: 'Section 3: Commissioner of Oaths / Physician Endorsement',
        description: 'Legal swear-in or medical license certification.',
        fields: [
          { id: 'exemp_official_name', name: 'commissioner_or_physician_name', label: 'Name of Commissioner of Oaths / Regulated Physician', type: 'text', required: true, gridCols: 1 },
          { id: 'exemp_license_num', name: 'cpso_or_commissioner_stamp', label: 'CPSO Medical License # or Commission Expiry', type: 'text', required: true, gridCols: 1 },
          { id: 'exemp_executed_date', name: 'sworn_executed_date', label: 'Date Sworn / Certified', type: 'date', required: true, gridCols: 2 }
        ]
      }
    ]
  },

  // =========================================================================
  // SUP-5: FOOD MENU, DIETARY & SAFE SLEEP AUDIT
  // =========================================================================
  {
    id: 'sup-form-5',
    formCode: 'SUP-5',
    title: 'Food Menu, Dietary Restrictions & Safe Sleep Audit',
    category: 'Operations',
    description: "CCEYA Sections 33.1 & 42 compliance audit ensuring nutrition conforms with Canada's Food Guide, posted allergy lists, and safe sleep monitoring.",
    version: '2026.1',
    isRequired: false,
    targetStage: 'annual',
    assignedTo: 'provider',
    lastUpdated: '2026-10-02',
    sections: [
      {
        id: 'sec-1-dietary-restrictions',
        title: 'Section 1: Dietary Restrictions & Anaphylaxis Board',
        description: 'Verification that all child dietary needs are visibly posted.',
        fields: [
          { id: 'menu_prov_name', name: 'provider_name', label: 'Provider Name', type: 'text', required: true, gridCols: 1 },
          { id: 'menu_audit_date', name: 'audit_date', label: 'Audit Date', type: 'date', required: true, gridCols: 1 },
          { 
            id: 'menu_allergy_board_posted', 
            name: 'allergy_board_verified', 
            label: 'All child allergies, anaphylaxis treatment protocols, and food restrictions are visibly posted in kitchen preparation and dining areas.', 
            type: 'checkbox', 
            required: true, 
            gridCols: 2 
          },
          { 
            id: 'menu_infant_honey_ban', 
            name: 'infant_honey_ban_verified', 
            label: 'Zero honey products are offered or accessible to children under 12 months (Botulism prevention compliance).', 
            type: 'checkbox', 
            required: true, 
            gridCols: 2 
          }
        ]
      },
      {
        id: 'sec-2-food-guide-menu',
        title: 'Section 2: Two-Week Meal Rotation Plan',
        description: "Conforms with Canada's Food Guide: whole grains, fruits/vegetables, protein, and drinking water readily accessible.",
        fields: [
          { id: 'menu_am_snack', name: 'sample_morning_snack', label: 'Morning Snack Examples (2 food groups)', type: 'text', placeholder: 'e.g. Sliced apples with whole grain oat toast, water', required: true, gridCols: 2 },
          { id: 'menu_lunch', name: 'sample_lunch_menu', label: 'Lunch Menu Examples (balanced meal)', type: 'text', placeholder: 'e.g. Baked salmon, brown rice, steamed broccoli & carrots, milk/water', required: true, gridCols: 2 },
          { id: 'menu_pm_snack', name: 'sample_afternoon_snack', label: 'Afternoon Snack Examples (2 food groups)', type: 'text', placeholder: 'e.g. Carrot sticks with hummus, cheddar cheese cubes', required: true, gridCols: 2 }
        ]
      },
      {
        id: 'sec-3-safe-sleep',
        title: 'Section 3: Safe Sleep Monitoring Protocol (CCEYA s. 33.1)',
        description: 'Statutory requirements for infant cribs, toddler cots, and direct visual checks.',
        fields: [
          { 
            id: 'sleep_direct_visual_checks', 
            name: 'visual_sleep_checks_confirmed', 
            label: 'Direct visual physical checks (observing breathing and colour) are performed and recorded every 15-30 minutes for resting children.', 
            type: 'checkbox', 
            required: true, 
            gridCols: 2 
          },
          { 
            id: 'sleep_crib_standards', 
            name: 'crib_cot_standards_confirmed', 
            label: 'Infant cribs meet Canada Consumer Product Safety Act standards (tight-fitting mattresses, zero loose blankets, plush toys, or bumper pads).', 
            type: 'checkbox', 
            required: true, 
            gridCols: 2 
          },
          { id: 'sleep_auditor_signature', name: 'auditor_signature', label: 'Audited & Confirmed By (RECE / Provider)', type: 'text', required: true, gridCols: 2 }
        ]
      }
    ]
  }
];
