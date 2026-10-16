import { FormTemplate } from '../types/formSchema';

export const INITIAL_HOME_VISITOR_FORMS: FormTemplate[] = [
  // =========================================================================
  // HV-0: HOME VISITOR INTAKE & RECE REGISTRATION
  // =========================================================================
  {
    id: 'vis-form-0',
    formCode: 'HV-0',
    title: 'Home Visitor Intake & RECE Credential Registration',
    category: 'Inspection',
    description: 'Initial employment and regulatory registration for qualified Registered Early Childhood Educators (RECE) conducting quarterly CCEYA premises inspections.',
    version: '2026.1',
    isRequired: true,
    targetStage: 'inquiry',
    assignedTo: 'visitor',
    lastUpdated: '2026-10-02',
    sections: [
      {
        id: 'sec-1-applicant-info',
        title: 'Section 1: RECE Applicant & Contact Information',
        description: 'Personal details and assigned regional inspection territory.',
        fields: [
          { id: 'vis_name', name: 'visitor_name', label: 'Full Legal Name', type: 'text', required: true, gridCols: 2 },
          { id: 'vis_phone', name: 'visitor_phone', label: 'Mobile Phone', type: 'phone', required: true, gridCols: 1 },
          { id: 'vis_email', name: 'visitor_email', label: 'Email Address', type: 'email', required: true, gridCols: 1 },
          { id: 'vis_address', name: 'visitor_address', label: 'Home Address', type: 'text', required: true, gridCols: 2 },
          { 
            id: 'vis_region', 
            name: 'assigned_region', 
            label: 'Assigned Inspection Territory', 
            type: 'dropdown', 
            required: true, 
            options: ['Durham South (Oshawa / Whitby)', 'Durham North (Scugog / Uxbridge)', 'York Region (Markham / Richmond Hill)', 'Toronto (East York / Scarborough)'],
            gridCols: 2 
          }
        ]
      },
      {
        id: 'sec-2-rece-credentials',
        title: 'Section 2: Professional College of ECE Credentials',
        description: 'Verification of active standing with the College of Early Childhood Educators under O. Reg. 137/15.',
        fields: [
          { id: 'rece_number', name: 'rece_registration_number', label: 'College of ECE Registration #', type: 'text', placeholder: 'e.g. 44192', required: true, gridCols: 1 },
          { id: 'rece_expiry', name: 'rece_expiry_date', label: 'RECE Good Standing Expiry Date', type: 'date', required: true, gridCols: 1 },
          { id: 'rece_institution', name: 'ece_diploma_institution', label: 'Post-Secondary ECE College / University', type: 'text', required: true, gridCols: 2 },
          { id: 'years_exp', name: 'years_child_care_experience', label: 'Total Years in Licensed Child Care', type: 'text', required: true, gridCols: 1 }
        ]
      },
      {
        id: 'sec-3-statutory-clearances',
        title: 'Section 3: Statutory Background Clearances',
        description: 'Mandatory criminal record and medical screening pursuant to CCEYA regulations.',
        fields: [
          { id: 'vsc_date', name: 'vulnerable_sector_check_date', label: 'Vulnerable Sector Check (VSC) Issue Date', type: 'date', required: true, gridCols: 1 },
          { id: 'offence_decl', name: 'annual_offence_declaration_date', label: 'Annual Offence Declaration Date', type: 'date', required: true, gridCols: 1 },
          { id: 'first_aid_expiry', name: 'first_aid_cpr_expiry_date', label: 'Standard First Aid & Infant/Child CPR (Level C) Expiry', type: 'date', required: true, gridCols: 2 },
          { id: 'tb_test_date', name: 'tb_medical_clearance_date', label: 'Baseline 2-Step TB Medical Clearance Date', type: 'date', required: true, gridCols: 2 }
        ]
      },
      {
        id: 'sec-4-legal-attestation',
        title: 'Section 4: Legal & Code of Ethics Attestation',
        description: 'Statutory compliance sign-off for agency oversight.',
        fields: [
          { 
            id: 'cceya_attest', 
            name: 'cceya_regulatory_attestation', 
            label: 'I certify that I am in good standing with the College of ECE and will conduct quarterly unannounced premises inspections strictly in accordance with CCEYA 2014 and O. Reg. 137/15.', 
            type: 'consent_clause', 
            required: true, 
            gridCols: 3 
          },
          { id: 'vis_signature', name: 'visitor_digital_signature', label: 'RECE Home Visitor Digital Signature', type: 'signature', required: true, gridCols: 2 },
          { id: 'vis_sign_date', name: 'signature_date', label: 'Date Signed', type: 'date', required: true, gridCols: 1 }
        ]
      }
    ]
  },

  // =========================================================================
  // HV-1: CCEYA SECTION 26 STANDARD QUARTERLY PREMISES INSPECTION
  // =========================================================================
  {
    id: 'vis-form-1',
    formCode: 'HV-1',
    title: 'CCEYA Section 26 Quarterly Premises Inspection Protocol',
    category: 'Inspection',
    description: 'Statutory quarterly unannounced on-site inspection of licensed home child care premises covering all 12 Ministry of Education regulatory domains under O. Reg. 137/15.',
    version: '2026.1',
    isRequired: true,
    targetStage: 'annual',
    assignedTo: 'visitor',
    lastUpdated: '2026-10-02',
    sections: [
      {
        id: 'sec-1-inspection-meta',
        title: 'Section 1: Inspection Identification & Physical Attendance',
        description: 'Facility visit metadata and unannounced on-site headcount reconciliation.',
        fields: [
          { id: 'insp_provider', name: 'inspected_provider_name', label: 'Licensed Home Provider Name', type: 'text', required: true, gridCols: 2 },
          { id: 'insp_address', name: 'home_premises_address', label: 'Premises Address Inspected', type: 'text', required: true, gridCols: 2 },
          { id: 'insp_date', name: 'inspection_date', label: 'Inspection Date', type: 'date', required: true, gridCols: 1 },
          { 
            id: 'insp_quarter', 
            name: 'calendar_quarter', 
            label: 'Quarter Inspected', 
            type: 'dropdown', 
            required: true, 
            options: ['Q1 (Jan – Mar)', 'Q2 (Apr – Jun)', 'Q3 (Jul – Sep)', 'Q4 (Oct – Dec)'],
            gridCols: 1 
          },
          { id: 'unannounced', name: 'is_unannounced_inspection', label: 'Was this visit conducted without prior notice pursuant to s. 26(1)?', type: 'radio', options: ['Yes — Unannounced', 'No — Scheduled Follow-up'], required: true, gridCols: 2 },
          { id: 'time_in', name: 'inspection_time_in', label: 'Arrival Time (In)', type: 'text', placeholder: 'e.g. 9:45 AM', required: true, gridCols: 1 },
          { id: 'time_out', name: 'inspection_time_out', label: 'Departure Time (Out)', type: 'text', placeholder: 'e.g. 11:30 AM', required: true, gridCols: 1 }
        ]
      },
      {
        id: 'sec-2-ratio-headcount',
        title: 'Section 2: CCEYA Statutory Ratio & Headcount Audit (s. 8)',
        description: 'Physical audit of all children present at the premises.',
        fields: [
          { id: 'total_present', name: 'total_children_present', label: 'Total Children Present in Care (Max 6)', type: 'text', placeholder: 'e.g. 5', required: true, gridCols: 1 },
          { id: 'under_three', name: 'children_under_three_count', label: 'Children Under 3 Years of Age (Max 3)', type: 'text', placeholder: 'e.g. 2', required: true, gridCols: 1 },
          { id: 'under_two', name: 'children_under_two_count', label: 'Children Under 2 Years of Age (Max 3)', type: 'text', placeholder: 'e.g. 1', required: true, gridCols: 1 },
          { id: 'provider_own_kids', name: 'provider_own_children_present', label: 'Provider Own Children Under Age 4/6 Count', type: 'text', placeholder: '0', required: true, gridCols: 1 },
          { id: 'ratio_compliance', name: 'statutory_ratio_status', label: 'Are mixed-age statutory capacity ratios strictly in compliance?', type: 'radio', options: ['Compliant (Within Statutory Caps)', 'Contravention (Over Capacity)'], required: true, gridCols: 2 }
        ]
      },
      {
        id: 'sec-3-ministry-domains',
        title: 'Section 3: Twelve (12) Ministry Regulatory Domains',
        description: 'Compliance verification across physical premises safety, health, nutrition, and emergency preparedness.',
        fields: [
          { id: 'd1_sanitary', name: 'domain_1_sanitary_hygiene', label: '1. Sanitary Standards: Handwashing, diaper change disinfection, toys sanitized', type: 'radio', options: ['Pass', 'Action Required', 'N/A'], required: true, gridCols: 1 },
          { id: 'd2_nutrition', name: 'domain_2_food_and_nutrition', label: '2. Nutrition: 2-week menu posted, Canada Food Guide compliance, safe food storage', type: 'radio', options: ['Pass', 'Action Required', 'N/A'], required: true, gridCols: 1 },
          { id: 'd3_safe_sleep', name: 'domain_3_safe_sleep_monitoring', label: '3. Safe Sleep: Direct 30-min visual checks logged, zero loose blankets for infants', type: 'radio', options: ['Pass', 'Action Required', 'N/A'], required: true, gridCols: 1 },
          { id: 'd4_outdoor_play', name: 'domain_4_outdoor_fencing_safety', label: '4. Outdoor Play: Minimum 2 hrs outdoors weather permitting, secure 1.2m fencing', type: 'radio', options: ['Pass', 'Action Required', 'N/A'], required: true, gridCols: 1 },
          { id: 'd5_medication', name: 'domain_5_medication_storage', label: '5. Medication Storage: Locked box, original prescription containers, written consent', type: 'radio', options: ['Pass', 'Action Required', 'N/A'], required: true, gridCols: 1 },
          { id: 'd6_fire_safety', name: 'domain_6_fire_drill_and_alarms', label: '6. Fire Safety: Monthly drill recorded, operational smoke and CO detectors on all levels', type: 'radio', options: ['Pass', 'Action Required', 'N/A'], required: true, gridCols: 1 },
          { id: 'd7_anaphylaxis', name: 'domain_7_anaphylaxis_protocols', label: '7. Anaphylaxis: Sabrina\'s Law emergency plans posted, unexpired EpiPens accessible', type: 'radio', options: ['Pass', 'Action Required', 'N/A'], required: true, gridCols: 1 },
          { id: 'd8_water_safety', name: 'domain_8_water_safety_plan', label: '8. Water Safety: Zero standing water, inflatable pools prohibited, barrier around ponds', type: 'radio', options: ['Pass', 'Action Required', 'N/A'], required: true, gridCols: 1 },
          { id: 'd9_first_aid', name: 'domain_9_first_aid_equipment', label: '9. First Aid: Fully stocked kit in home, portable outing bag with emergency cards', type: 'radio', options: ['Pass', 'Action Required', 'N/A'], required: true, gridCols: 1 },
          { id: 'd10_furnishings', name: 'domain_10_play_materials_equipment', label: '10. Materials & Furnishings: Clean, age-appropriate, CSA certified cribs/playpens', type: 'radio', options: ['Pass', 'Action Required', 'N/A'], required: true, gridCols: 1 },
          { id: 'd11_serious_occurrence', name: 'domain_11_serious_occurrence_signage', label: '11. Serious Occurrence: Policy in binder, emergency contact list posted by phone', type: 'radio', options: ['Pass', 'Action Required', 'N/A'], required: true, gridCols: 1 },
          { id: 'd12_records', name: 'domain_12_child_records_box', label: '12. Child Records: Emergency wallet cards, immunization cards, daily attendance signed', type: 'radio', options: ['Pass', 'Action Required', 'N/A'], required: true, gridCols: 1 }
        ]
      },
      {
        id: 'sec-4-inspection-signoff',
        title: 'Section 4: Summary Findings & Dual Sign-Off',
        description: 'Findings, mandatory corrective action plan, and mutual sign-off.',
        fields: [
          { id: 'rectification_notes', name: 'corrective_action_plan', label: 'Mandatory Rectification Plan / Action Items for Provider', type: 'textarea', placeholder: 'Specify any contraventions observed and deadline for compliance...', required: false, gridCols: 3 },
          { id: 'target_compliance_date', name: 'rectification_deadline', label: 'Target Rectification Completion Date', type: 'date', required: false, gridCols: 1 },
          { id: 'rece_visitor_sig', name: 'rece_visitor_signature', label: 'RECE Home Visitor Signature', type: 'signature', required: true, gridCols: 2 },
          { id: 'provider_sig', name: 'provider_acknowledgment_signature', label: 'Provider Acknowledgment Signature', type: 'signature', required: true, gridCols: 2 },
          { id: 'sign_date', name: 'sign_off_date', label: 'Date Completed', type: 'date', required: true, gridCols: 1 }
        ]
      }
    ]
  },

  // =========================================================================
  // HV-2: MONTHLY LICENSED AGENCY HOMES PROFILE CHECKLIST
  // =========================================================================
  {
    id: 'vis-form-2',
    formCode: 'HV-2',
    title: 'Licenced Agency Homes Monthly Profile Checklist',
    category: 'Inspection',
    description: 'Monthly on-site audit verifying the provider policy board, blue book writeups, black book sleep logs, and document box contents for Ministry licensing inspectors.',
    version: '2026.1',
    isRequired: true,
    targetStage: 'annual',
    assignedTo: 'visitor',
    lastUpdated: '2026-10-02',
    sections: [
      {
        id: 'sec-1-monthly-profile-meta',
        title: 'Section 1: Monthly Facility Profile Details',
        description: 'Provider identification and monthly audit timestamp.',
        fields: [
          { id: 'prov_name', name: 'provider_full_name', label: 'Provider Name', type: 'text', required: true, gridCols: 2 },
          { id: 'facility_area', name: 'neighborhood_area', label: 'Neighborhood / Area', type: 'text', required: true, gridCols: 1 },
          { id: 'audit_month', name: 'audit_month', label: 'Audit Month & Year', type: 'text', placeholder: 'e.g. October 2026', required: true, gridCols: 1 },
          { id: 'hv_name', name: 'home_visitor_name', label: 'Inspecting Home Visitor Name', type: 'text', required: true, gridCols: 2 }
        ]
      },
      {
        id: 'sec-2-policy-board-content',
        title: 'Section 2: Daily Operation Policy Board & Binders',
        description: 'Verification of visible operational postings in the provider home.',
        fields: [
          { id: 'chk_board', name: 'chk_policy_board', label: 'Policy Board Posted in Visible Area', type: 'radio', options: ['Yes', 'No'], required: true, gridCols: 1 },
          { id: 'chk_prog_plan', name: 'chk_daily_program_plan', label: 'Daily Program Plan Posted', type: 'radio', options: ['Yes', 'No'], required: true, gridCols: 1 },
          { id: 'chk_play_plan', name: 'chk_indoor_outdoor_play_plan', label: 'Indoor & Outdoor Play Plan Posted', type: 'radio', options: ['Yes', 'No'], required: true, gridCols: 1 },
          { id: 'chk_menu', name: 'chk_weekly_menu_plan', label: 'Weekly Menu Plan Posted (2 Weeks at a Time)', type: 'radio', options: ['Yes', 'No'], required: true, gridCols: 1 },
          { id: 'chk_att_signed', name: 'chk_attendance_signed_daily', label: 'Daily Attendance Signed by Provider & Parents', type: 'radio', options: ['Yes', 'No'], required: true, gridCols: 1 },
          { id: 'chk_fire_drill', name: 'chk_fire_drill_completed_monthly', label: 'Fire Drill Form with Dates (Monthly Drill Practiced)', type: 'radio', options: ['Yes', 'No'], required: true, gridCols: 1 },
          { id: 'chk_blue_book', name: 'chk_blue_book_home_visitor_writeup', label: 'Provider Has Blue Book for HV Monthly Writeup', type: 'radio', options: ['Yes', 'No'], required: true, gridCols: 1 },
          { id: 'chk_black_book', name: 'chk_black_book_daily_sleep_messages', label: 'Provider Has Black Book for Sleeproom Monitoring & Messages', type: 'radio', options: ['Yes', 'No'], required: true, gridCols: 1 }
        ]
      },
      {
        id: 'sec-3-document-box-audit',
        title: 'Section 3: Document Box & Children\'s Files Verification',
        description: 'Physical audit of children\'s individual grey files and emergency cards.',
        fields: [
          { id: 'chk_box', name: 'chk_document_box_present', label: 'Document Box present with agency information and books', type: 'radio', options: ['Yes', 'No'], required: true, gridCols: 1 },
          { id: 'chk_four_checklists', name: 'chk_four_ministry_quarterly_checklists', label: 'Four (4) Ministry Quarterly Checklists in Box', type: 'radio', options: ['Yes', 'No'], required: true, gridCols: 1 },
          { id: 'total_kids_present', name: 'total_children_enrolled_count', label: 'Total Children in Home', type: 'text', placeholder: 'e.g. 5', required: true, gridCols: 1 },
          { id: 'total_files_in_box', name: 'total_files_in_box_count', label: 'Total Complete Files in Document Box', type: 'text', placeholder: 'e.g. 5', required: true, gridCols: 1 },
          { id: 'chk_anaphylaxis_plans', name: 'chk_anaphylaxis_plans_in_place', label: 'All children with severe allergies have individual anaphylaxis plans', type: 'radio', options: ['Yes', 'No', 'N/A — No Allergies'], required: true, gridCols: 2 },
          { id: 'chk_medication_forms', name: 'chk_medication_admin_forms_in_place', label: 'Medication administration forms properly logged for prescribed doses', type: 'radio', options: ['Yes', 'No', 'N/A — No Medication'], required: true, gridCols: 2 }
        ]
      },
      {
        id: 'sec-4-visitor-signoff',
        title: 'Section 4: Field Verification Sign-Off',
        description: 'Dual sign-off for agency records.',
        fields: [
          { id: 'hv_notes', name: 'monthly_profile_notes', label: 'Home Visitor Monthly Notes / Observations', type: 'textarea', placeholder: 'Observations on child engagement, sleep room ventilation, environment...', required: false, gridCols: 3 },
          { id: 'hv_signature', name: 'visitor_signature', label: 'RECE Home Visitor Signature', type: 'signature', required: true, gridCols: 2 },
          { id: 'prov_signature', name: 'provider_signature', label: 'Provider Signature', type: 'signature', required: true, gridCols: 2 }
        ]
      }
    ]
  },

  // =========================================================================
  // HV-3: BEHAVIOUR MANAGEMENT & POSITIVE GUIDANCE OBSERVATION CHECKLIST
  // =========================================================================
  {
    id: 'vis-form-3',
    formCode: 'HV-3',
    title: 'Behaviour Management & Positive Guidance Monitoring Checklist',
    category: 'Inspection',
    description: 'Quarterly pedagogical observation evaluating positive reinforcement, child guidance techniques, and strict adherence to prohibited practices under CCEYA s. 48.',
    version: '2026.1',
    isRequired: true,
    targetStage: 'annual',
    assignedTo: 'visitor',
    lastUpdated: '2026-10-02',
    sections: [
      {
        id: 'sec-1-observation-meta',
        title: 'Section 1: Observation Details & Scheduling',
        description: 'Provider identification and pedagogical review schedule.',
        fields: [
          { id: 'bm_provider', name: 'provider_name', label: 'Provider Full Name', type: 'text', required: true, gridCols: 2 },
          { id: 'bm_supervisor', name: 'observing_supervisor_rece', label: 'Observed By Supervisor / RECE', type: 'text', required: true, gridCols: 2 },
          { 
            id: 'bm_quarter', 
            name: 'observation_quarter', 
            label: 'Observation Cycle', 
            type: 'dropdown', 
            required: true, 
            options: ['March Cycle', 'June Cycle', 'September Cycle', 'December Cycle'],
            gridCols: 1 
          },
          { id: 'bm_date', name: 'observation_date', label: 'Observation Date', type: 'date', required: true, gridCols: 1 }
        ]
      },
      {
        id: 'sec-2-positive-techniques',
        title: 'Section 2: Positive Guidance Techniques Observed',
        description: 'Affirmative techniques for promoting self-regulation, empathy, and emotional development.',
        fields: [
          { id: 'tech_positive_intervention', name: 'eval_positive_intervention', label: 'Inappropriate behaviours dealt with using Positive Intervention, firm/positive communication, appropriate body language', type: 'radio', options: ['Yes', 'No'], required: true, gridCols: 2 },
          { id: 'tech_reinforcement', name: 'eval_positive_reinforcement', label: 'Appropriate behaviours are recognized with positive reinforcement and encouragement', type: 'radio', options: ['Yes', 'No'], required: true, gridCols: 2 },
          { id: 'tech_clear_limits', name: 'eval_clear_limits', label: 'Expectations & limits made clear; avoids labelling or repeatedly calling child as problem child', type: 'radio', options: ['Yes', 'No'], required: true, gridCols: 2 },
          { id: 'tech_responsibility', name: 'eval_responsibility_problem_solving', label: 'Children encouraged to take responsibility for own actions and problem-solve constructively', type: 'radio', options: ['Yes', 'No'], required: true, gridCols: 2 },
          { id: 'tech_separate_behaviour', name: 'eval_separate_behaviour_from_child', label: 'It is the behaviour, not the child, which is identified as appropriate/inappropriate', type: 'radio', options: ['Yes', 'No'], required: true, gridCols: 2 }
        ]
      },
      {
        id: 'sec-3-prohibited-practices',
        title: 'Section 3: Prohibited Practices Audit (Zero Tolerance under CCEYA s. 48)',
        description: 'Statutory verification that provider and household members refrain from prohibited discipline.',
        fields: [
          { id: 'zero_corporal', name: 'prohibited_corporal_punishment', label: 'Zero corporal punishment (hitting, shaking, spanking, or physical reprimands)', type: 'radio', options: ['Fully Compliant (Zero Tolerance)', 'Contravention Observed'], required: true, gridCols: 2 },
          { id: 'zero_harsh', name: 'prohibited_harsh_belittling', label: 'Zero harsh, degrading measures, yelling, or belittling language that humiliates the child', type: 'radio', options: ['Fully Compliant (Zero Tolerance)', 'Contravention Observed'], required: true, gridCols: 2 },
          { id: 'zero_deprivation', name: 'prohibited_deprivation', label: 'Zero deprivation of basic needs (food, drink, shelter, sleep, toilet use, or bedding)', type: 'radio', options: ['Fully Compliant (Zero Tolerance)', 'Contravention Observed'], required: true, gridCols: 2 },
          { id: 'zero_confinement', name: 'prohibited_confinement', label: 'Zero confinement in locked rooms, closets, or forced isolation (sit-out strictly limited as last resort)', type: 'radio', options: ['Fully Compliant (Zero Tolerance)', 'Contravention Observed'], required: true, gridCols: 2 },
          { id: 'calm_patience', name: 'eval_patience_and_calmness', label: 'Provider exercises patience and remains calm when directing behaviour repeatedly', type: 'radio', options: ['Yes', 'No'], required: true, gridCols: 2 }
        ]
      },
      {
        id: 'sec-4-behaviour-signoff',
        title: 'Section 4: Guidance Sign-Off',
        description: 'Dual sign-off for agency records and RECE mentoring file.',
        fields: [
          { id: 'guidance_notes', name: 'guidance_observation_notes', label: 'Pedagogical Observations & Recommendations', type: 'textarea', placeholder: 'Document specific interactions observed and positive guidance recommendations...', required: false, gridCols: 3 },
          { id: 'prov_sig_bm', name: 'provider_signature', label: 'Provider Signature', type: 'signature', required: true, gridCols: 2 },
          { id: 'supervisor_sig_bm', name: 'supervisor_signature', label: 'RECE Supervisor Signature', type: 'signature', required: true, gridCols: 2 }
        ]
      }
    ]
  }
];
