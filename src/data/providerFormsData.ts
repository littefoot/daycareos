import { FormTemplate } from '../types/formSchema';
import { AGENCY_PHONE, AGENCY_PHONE_WITH_NOTICE } from '../config/agencyConfig';

export const INITIAL_PROVIDER_FORMS: FormTemplate[] = [
  {
    id: 'prov-form-0',
    formCode: 'PROV-0',
    title: 'Provider Enrolment & Home Facility Registration',
    category: 'Admissions',
    description: 'Initial home child care provider onboarding application detailing physical home premises, fenced backyard, square footage, CPR certification, and family members residing in home.',
    version: '2026.1',
    isRequired: true,
    targetStage: 'registration',
    assignedTo: 'provider',
    lastUpdated: '2026-08-27',
    sections: [
      {
        id: 'sec-p0-1',
        title: 'Section 1: Provider Identity & Contact Information',
        description: 'Primary legal identity and contact channels for agency communication.',
        fields: [
          { id: 'fp0-1', name: 'provider_full_name', label: 'Legal Full Name (as on Government ID)', type: 'text', required: true, gridCols: 2 },
          { id: 'fp0-2', name: 'provider_cell', label: 'Primary Contact Cell Number', type: 'phone', required: true, gridCols: 2 },
          { id: 'fp0-3', name: 'provider_email', label: 'Email Address', type: 'email', required: true, gridCols: 2 },
          { 
            id: 'fp0-lang', 
            name: 'languages_spoken', 
            label: 'Primary Languages Spoken in Home', 
            type: 'text', 
            placeholder: 'e.g. English, French, Farsi, Hindi, Arabic',
            required: false, 
            gridCols: 2 
          }
        ]
      },
      {
        id: 'sec-p0-2',
        title: 'Section 2: Home Facility Premises & Location',
        description: 'Physical premises details for regional placement and municipal zoning compliance.',
        fields: [
          { id: 'fp0-address', name: 'home_address', label: 'Facility Street Address', type: 'text', required: true, gridCols: 2 },
          { id: 'fp0-neigh', name: 'neighborhood', label: 'Neighborhood / Community', type: 'text', placeholder: 'e.g. Oshawa North', required: false, gridCols: 1 },
          { 
            id: 'fp0-city', 
            name: 'city_municipality', 
            label: 'City / Municipality', 
            type: 'dropdown', 
            options: ['Oshawa', 'Whitby', 'Pickering', 'Ajax', 'Markham', 'Richmond Hill', 'Toronto'], 
            required: true, 
            gridCols: 1 
          },
          { 
            id: 'fp0-dwelling', 
            name: 'dwelling_type', 
            label: 'Dwelling Type', 
            type: 'dropdown', 
            options: ['Single Detached Home', 'Semi-Detached Home', 'Townhouse', 'Apartment / Condo'], 
            required: true, 
            gridCols: 1 
          },
          { 
            id: 'fp0-owner', 
            name: 'ownership_status', 
            label: 'Ownership Status', 
            type: 'dropdown', 
            options: ['Homeowner', 'Tenant / Renting (Landlord consent required)'], 
            required: true, 
            gridCols: 1 
          }
        ]
      },
      {
        id: 'sec-p0-3',
        title: 'Section 3: Capacity & Safety Screening',
        description: 'Baseline provider qualifications and resident details pursuant to Ontario child care standards.',
        fields: [
          { 
            id: 'fp0-4', 
            name: 'ece_cpr_cert', 
            label: 'Current Standard First Aid & Infant CPR Certification Level', 
            type: 'dropdown', 
            options: ['Standard First Aid & CPR Level C (Current)', 'Emergency First Aid (Renewal Needed)', 'Registered Early Childhood Educator (RECE)', 'Not Yet Certified (Willing to complete)'], 
            required: true, 
            gridCols: 1 
          },
          { 
            id: 'fp0-5', 
            name: 'own_children_under_6', 
            label: 'Number of Own Children Under Age 6 Residing in Home', 
            type: 'dropdown', 
            options: ['0 (No children under 6 residing at home)', '1 Child under age 6', '2 Children under age 6', '3+ Children under age 6'], 
            required: true, 
            gridCols: 1 
          },
          { 
            id: 'fp0-adults', 
            name: 'household_adults_count', 
            label: 'Adult Residents (Age 18+) in Home', 
            type: 'dropdown', 
            options: ['1 Adult (Provider only)', '2 Adults (e.g. Spouse / Partner)', '3 Adults (e.g. Adult child or parent)', '4+ Adults residing in home'], 
            required: true, 
            gridCols: 1 
          },
          { 
            id: 'fp0-notes', 
            name: 'transition_notes', 
            label: 'Existing Children or Families Seeking Immediate Care (Optional)', 
            type: 'textarea', 
            placeholder: 'e.g. Currently caring for 2 neighborhood children privately who wish to enroll with ACCS...', 
            required: false, 
            gridCols: 1 
          }
        ]
      },
      {
        id: 'sec-p0-4',
        title: 'Section 4: Safety Declarations & Consents',
        description: 'Mandatory provider commitments to physical home safety and regulatory oversight.',
        fields: [
          { 
            id: 'fp0-fenced', 
            name: 'fenced_yard_declaration', 
            label: 'Fenced Outdoor Play Area Confirmation: I confirm my home facility has access to a secure, safely fenced outdoor play area or approved local park space with zero unprotected water hazards.', 
            type: 'consent_clause', 
            required: true, 
            gridCols: 1 
          },
          { 
            id: 'fp0-cceya', 
            name: 'cceya_oversight_consent', 
            label: 'Agency Oversight & Inspection Consent: I agree to comply with licensed child care ratios, maintain safe home standards, and welcome unannounced quarterly inspections by an ACCS RECE Home Visitor.', 
            type: 'consent_clause', 
            required: true, 
            gridCols: 1 
          }
        ]
      }
    ]
  },
  {
    id: 'prov-form-1',
    formCode: 'PROV-1',
    title: 'Monthly Subsidy Attendance & Payroll Timesheet',
    category: 'Legal & Agreement',
    description: 'Monthly submission for reconciling child attendance hours, municipal subsidy days, and agency payroll payout authorization.',
    version: '2026.1',
    isRequired: true,
    targetStage: 'annual',
    assignedTo: 'provider',
    lastUpdated: '2026-08-27',
    sections: [
      {
        id: 'sec-p1-1',
        title: 'Monthly Care Reconciliation',
        description: 'Certified breakdown of care provided.',
        fields: [
          { 
            id: 'fp1-1', 
            name: 'billing_month', 
            label: 'Billing Cycle Month & Year', 
            type: 'dropdown', 
            options: ['August 2026', 'September 2026', 'October 2026', 'November 2026', 'December 2026'], 
            required: true, 
            gridCols: 2 
          },
          { id: 'fp1-2', name: 'total_care_days', label: 'Total Child Care Days Completed in Month', type: 'text', placeholder: 'e.g. 68 Days', required: true, gridCols: 2 },
          { id: 'fp1-3', name: 'subsidized_days_count', label: 'Total Municipal Subsidized Days Count', type: 'text', placeholder: 'e.g. 22 Days', required: true, gridCols: 2 },
          { 
            id: 'fp1-4', 
            name: 'timesheet_accuracy_consent', 
            label: 'I certify that all attendance records and timesheet entries submitted are true and accurate under penalty of CCEYA compliance audit.', 
            type: 'consent_clause', 
            required: true, 
            gridCols: 1 
          },
          { id: 'fp1-5', name: 'provider_digital_sig', label: 'Provider Legal Digital Signature', type: 'signature', placeholder: 'Type Full Name as Legal Signature', required: true, gridCols: 2 }
        ]
      }
    ]
  },
  {
    id: 'prov-form-2',
    formCode: 'PROV-2',
    title: 'Home Safety & Environmental Inspection Checklist',
    category: 'Safety',
    description: 'Quarterly and annual safety audit: smoke detectors, fire extinguishers, safe sleep crib standards, medication lockboxes, and pet safety.',
    version: '2026.1',
    isRequired: true,
    targetStage: 'placement',
    assignedTo: 'provider',
    lastUpdated: '2026-08-27',
    sections: [
      {
        id: 'sec-p2-1',
        title: 'Safety Standards Verification',
        description: 'Mandatory items verified by home visitor.',
        fields: [
          { 
            id: 'fp2-1', 
            name: 'smoke_carbon_detectors', 
            label: 'Working smoke and carbon monoxide detectors on every floor (tested monthly)', 
            type: 'consent_clause', 
            required: true, 
            gridCols: 1 
          },
          { 
            id: 'fp2-2', 
            name: 'medication_lockbox', 
            label: 'All medications and toxic household cleaners stored in locked cupboards out of reach', 
            type: 'consent_clause', 
            required: true, 
            gridCols: 1 
          },
          { 
            id: 'fp2-3', 
            name: 'safe_sleep_cribs', 
            label: 'Cribs, playpens, and sleep surfaces meet Health Canada Safe Sleep regulations', 
            type: 'consent_clause', 
            required: true, 
            gridCols: 1 
          },
          { id: 'fp2-4', name: 'last_fire_drill_date', label: 'Date of Last Conducted Emergency Fire Evacuation Drill', type: 'date', required: true, gridCols: 2 },
          { id: 'fp2-5', name: 'home_visitor_initials', label: 'Agency Home Visitor Review Initials', type: 'text', placeholder: 'e.g. JB / HV', required: true, gridCols: 2 }
        ]
      }
    ]
  },
  {
    id: 'prov-form-3',
    formCode: 'PROV-3',
    title: 'Annual CCEYA Policy Sign-Off & Vulnerable Sector Check',
    category: 'Legal & Agreement',
    description: 'Mandatory annual regulatory declaration: Police Vulnerable Sector Check (VSC), immunization proof, and agency policy handbook acknowledgement.',
    version: '2026.1',
    isRequired: true,
    targetStage: 'annual',
    assignedTo: 'provider',
    lastUpdated: '2026-08-27',
    sections: [
      {
        id: 'sec-p3-1',
        title: 'Annual Compliance Declaration',
        description: 'Preserves controlled licensing audit records.',
        fields: [
          { id: 'fp3-1', name: 'vsc_upload', label: 'Police Vulnerable Sector Check (VSC) Document Upload (within 6 months)', type: 'file_upload', required: true, gridCols: 1 },
          { id: 'fp3-2', name: 'vsc_issue_date', label: 'VSC Police Issue Date', type: 'date', required: true, gridCols: 2 },
          { 
            id: 'fp3-4', 
            name: 'policy_handbook_signoff', 
            label: 'I have read, understood, and agree to strictly enforce all child protection, ratio limits, and sanitary procedures outlined in the DaycareOS Provider Manual.', 
            type: 'consent_clause', 
            required: true, 
            gridCols: 1 
          },
          { id: 'fp3-5', name: 'annual_declaration_sig', label: 'Provider Legal Signature', type: 'signature', placeholder: 'Type Legal Full Name', required: true, gridCols: 2 }
        ]
      }
    ]
  },
  // =========================================================================
  // PROV-WPP: WEEKLY PROGRAM PLAN TEMPLATE
  // =========================================================================
  {
    id: 'prov-form-wpp',
    formCode: 'PROV-WPP',
    title: 'Weekly Program Plan Template',
    category: 'Operations',
    description: 'Weekly intentional early learning and activity planner balancing active play, sensory exploration, outdoor exploration, and quiet reflection under CCEYA.',
    version: '2026.1',
    isRequired: false,
    targetStage: 'placement',
    assignedTo: 'provider',
    lastUpdated: '2026-10-02',
    sections: [
      {
        id: 'sec-wpp-1',
        title: 'Section 1: Weekly Planning & Group Focus',
        description: 'Target age group and weekly pedagogical inquiry.',
        fields: [
          { id: 'wpp-week-of', name: 'week_of_date', label: 'Program Plan Week Of (Monday Date)', type: 'date', required: true, gridCols: 2 },
          { id: 'wpp-age-focus', name: 'target_age_group', label: 'Primary Mixed-Age Group Focus', type: 'dropdown', options: ['Infant & Toddler Focus (<24 mos)', 'Toddler & Preschool Focus (2-4 yrs)', 'Mixed Ages (Infants, Toddlers & Preschoolers)'], required: true, gridCols: 2 },
          { id: 'wpp-inquiry-theme', name: 'weekly_inquiry_theme', label: 'Weekly Thematic or Inquiry Topic', type: 'text', placeholder: 'e.g. Autumn Leaves & Sensory Textures, Water & Ice Exploration', required: true, gridCols: 1 }
        ]
      },
      {
        id: 'sec-wpp-2',
        title: 'Section 2: Daily Learning Domains & Planned Experiences',
        description: "Intentional activities aligned with Ontario's 'How Does Learning Happen?' framework.",
        fields: [
          { id: 'wpp-sensory', name: 'sensory_science_activity', label: 'Sensory Exploration & Early Science', type: 'textarea', placeholder: 'e.g. Shaving cream and food colouring colour mixing, scented playdough', required: true, gridCols: 2 },
          { id: 'wpp-gross-motor', name: 'outdoor_gross_motor', label: 'Outdoor Gross Motor & Physical Play (Min 2 Hours)', type: 'textarea', placeholder: 'e.g. Leaf pile obstacle run, balance beam walk, tricycle riding', required: true, gridCols: 2 },
          { id: 'wpp-language', name: 'language_expression', label: 'Language, Literacy & Creative Expression', type: 'textarea', placeholder: 'e.g. Felt board storytelling, finger plays, open-ended watercolour easel painting', required: true, gridCols: 2 },
          { id: 'wpp-cognitive', name: 'cognitive_problem_solving', label: 'Cognitive, Fine Motor & Problem Solving', type: 'textarea', placeholder: 'e.g. Wooden sorting beads, pinecone size gradation, geometric matching', required: true, gridCols: 2 }
        ]
      },
      {
        id: 'sec-wpp-3',
        title: "Section 3: Children's Emerging Interests & Reflection",
        description: 'Observations used to scaffold next week’s program planning.',
        fields: [
          { id: 'wpp-observations', name: 'observed_child_interests', label: "Children's Emerging Interests Observed This Week", type: 'textarea', placeholder: 'Note specific child curiosities, recurring play patterns, or questions sparked during free play...', required: true, gridCols: 1 },
          { id: 'wpp-adaptations', name: 'scaffolding_next_steps', label: 'Next Week Scaffolding & Environmental Adaptations', type: 'textarea', placeholder: 'How will the physical space or materials be adjusted to expand upon this week’s discoveries?', required: true, gridCols: 1 }
        ]
      }
    ]
  },
  // =========================================================================
  // PROV-4WPS: 4-WEEK PROGRAM STRUCTURE & THEMATIC PLAN
  // =========================================================================
  {
    id: 'prov-form-4wps',
    formCode: 'PROV-4WPS',
    title: '4-Week Program Structure & Thematic Curriculum Plan',
    category: 'Operations',
    description: 'Four-week thematic inquiry-based curriculum scaffolding play, language, and nature exploration across mixed-age home groups under How Does Learning Happen?',
    version: '2026.1',
    isRequired: false,
    targetStage: 'placement',
    assignedTo: 'provider',
    lastUpdated: '2026-10-02',
    sections: [
      {
        id: 'sec-4wps-1',
        title: 'Section 1: 4-Week Inquiry Framework',
        description: 'Core foundations and learning goals across the month.',
        fields: [
          { id: 'f4w-start-date', name: 'cycle_start_date', label: '4-Week Cycle Start Date', type: 'date', required: true, gridCols: 2 },
          { id: 'f4w-central-inquiry', name: 'central_inquiry_question', label: 'Central Inquiry Question', type: 'text', placeholder: 'e.g. How do things grow and change in our neighborhood?', required: true, gridCols: 2 },
          { id: 'f4w-hdlh-foundations', name: 'hdlh_foundations_focus', label: 'Core HDLH Pedagogical Foundations Emphasized', type: 'dropdown', options: ['All Four: Belonging, Well-Being, Engagement, Expression', 'Belonging & Expression Focus', 'Well-Being & Engagement Focus'], required: true, gridCols: 1 }
        ]
      },
      {
        id: 'sec-4wps-2',
        title: 'Section 2: Weekly Progression Roadmap',
        description: 'Sequential development across all four weeks.',
        fields: [
          { id: 'f4w-week1', name: 'week1_focus', label: 'Week 1: Wonder & Initial Sensory Exploration', type: 'textarea', placeholder: 'Introducing materials, gathering children’s initial theories, sensory exploration of real objects...', required: true, gridCols: 2 },
          { id: 'f4w-week2', name: 'week2_focus', label: 'Week 2: Investigation & Active Testing', type: 'textarea', placeholder: 'Hands-on experiments, outdoor neighborhood observations, testing ideas through cooperative play...', required: true, gridCols: 2 },
          { id: 'f4w-week3', name: 'week3_focus', label: 'Week 3: Deepening Understanding & Artistic Expression', type: 'textarea', placeholder: 'Representational drawing, block building, dramatic play scenarios reflecting the topic...', required: true, gridCols: 2 },
          { id: 'f4w-week4', name: 'week4_focus', label: 'Week 4: Celebration, Reflection & Family Documentation', type: 'textarea', placeholder: 'Showcasing learning binders to parents, photo gallery wall, reflecting on what was discovered...', required: true, gridCols: 2 }
        ]
      },
      {
        id: 'sec-4wps-3',
        title: 'Section 3: Multi-Age Developmental Adaptations',
        description: 'Differentiating activities so infants, toddlers, and preschoolers participate meaningfully together.',
        fields: [
          { id: 'f4w-infant-adapt', name: 'infant_adaptations', label: 'Infant Adaptations (<18 Months)', type: 'text', placeholder: 'e.g. High-contrast cards, non-toxic edible sensory materials, lap songs', required: true, gridCols: 1 },
          { id: 'f4w-toddler-adapt', name: 'toddler_adaptations', label: 'Toddler Adaptations (18-30 Months)', type: 'text', placeholder: 'e.g. Cause-and-effect toys, water pouring stations, repetitive finger plays', required: true, gridCols: 1 },
          { id: 'f4w-preschool-adapt', name: 'preschool_adaptations', label: 'Preschool & Kindergarten Adaptations (3+ Years)', type: 'text', placeholder: 'e.g. Inquiry journal drawing, scissors practice, cooperative board games', required: true, gridCols: 1 }
        ]
      }
    ]
  },
  // =========================================================================
  // PROV-DST: DAILY SCHEDULE & ROUTINE TEMPLATE
  // =========================================================================
  {
    id: 'prov-form-dst',
    formCode: 'PROV-DST',
    title: 'Daily Schedule & Routine Template',
    category: 'Operations',
    description: 'Daily visual routine schedule ensuring minimum 2 hours of daily outdoor play, scheduled nutritious meals, rest/nap intervals, and smooth transitions under CCEYA s. 45.',
    version: '2026.1',
    isRequired: false,
    targetStage: 'placement',
    assignedTo: 'provider',
    lastUpdated: '2026-10-02',
    sections: [
      {
        id: 'sec-dst-1',
        title: 'Section 1: Operating Core Hours & Morning Routine',
        description: 'Morning transitions and nutritional intake.',
        fields: [
          { id: 'dst-arrival-time', name: 'morning_arrival_window', label: 'Morning Arrival & Welcoming Window', type: 'text', defaultValue: '7:30 AM – 8:30 AM', required: true, gridCols: 2 },
          { id: 'dst-am-snack-time', name: 'morning_snack_time', label: 'Morning Nutritious Snack & Hydration Time', type: 'text', defaultValue: '9:00 AM – 9:30 AM', required: true, gridCols: 2 },
          { id: 'dst-am-circle', name: 'morning_gathering_routine', label: 'Morning Gathering / Circle & Storytelling', type: 'text', defaultValue: '9:30 AM – 10:00 AM: Songs, calendar, welcoming hello songs', required: true, gridCols: 1 }
        ]
      },
      {
        id: 'sec-dst-2',
        title: 'Section 2: CCEYA Mandatory Outdoor Play (Min 2 Hours)',
        description: 'Statutory outdoor time requirement under O. Reg. 137/15 s. 45.',
        fields: [
          { id: 'dst-outdoor-time', name: 'outdoor_play_window', label: 'Outdoor Gross Motor Play Window (Min 2 Hours Daily)', type: 'text', defaultValue: '10:00 AM – 11:30 AM (Morning) & 3:45 PM – 4:30 PM (Afternoon)', required: true, gridCols: 2 },
          { id: 'dst-inclement-policy', name: 'inclement_weather_alternative', label: 'Inclement Weather Alternative (Indoor Gross Motor)', type: 'text', defaultValue: 'Yoga movement mats, indoor obstacle course, parachute play when wind chill < -15°C or rain', required: true, gridCols: 2 }
        ]
      },
      {
        id: 'sec-dst-3',
        title: 'Section 3: Nutritious Lunch & Safe Sleep Rest Period',
        description: 'Rest and meal periods conforming to Health Canada and CCEYA safe sleep regulations.',
        fields: [
          { id: 'dst-lunch-time', name: 'lunch_meal_window', label: 'Lunch Meal Routine & Hand Hygiene', type: 'text', defaultValue: '11:45 AM – 12:30 PM', required: true, gridCols: 2 },
          { id: 'dst-rest-time', name: 'quiet_rest_period', label: 'Quiet Rest & Nap Period (Direct Visual Checks Every 15-30 Min)', type: 'text', defaultValue: '12:45 PM – 2:45 PM', required: true, gridCols: 2 }
        ]
      },
      {
        id: 'sec-dst-4',
        title: 'Section 4: Afternoon Discovery & Departure',
        description: 'Afternoon snack, calm play stations, and parent departure debrief.',
        fields: [
          { id: 'dst-pm-snack-time', name: 'afternoon_snack_time', label: 'Afternoon Snack & Water Refill', type: 'text', defaultValue: '3:00 PM – 3:30 PM', required: true, gridCols: 2 },
          { id: 'dst-departure-time', name: 'parent_pickup_window', label: 'Departure Window & Daily Verbal Parent Debrief', type: 'text', defaultValue: '4:30 PM – 5:30 PM', required: true, gridCols: 2 }
        ]
      }
    ]
  },
  // =========================================================================
  // PROV-ECL: HOME CHILD CARE EMERGENCY CONTACT LIST (ONTARIO)
  // =========================================================================
  {
    id: 'prov-form-ecl',
    formCode: 'PROV-ECL',
    title: 'Home Child Care Emergency Contact List (Ontario)',
    category: 'Safety',
    description: 'Statutory emergency contact sheet for posting directly beside the telephone/emergency exit with Police, Fire, Poison Control, Telehealth, and ACCS 24/7 hotline under CCEYA s. 42.',
    version: '2026.1',
    isRequired: true,
    targetStage: 'placement',
    assignedTo: 'provider',
    lastUpdated: '2026-10-02',
    sections: [
      {
        id: 'sec-ecl-1',
        title: 'Section 1: Emergency Dispatch & ACCS Agency Contacts',
        description: 'First response authorities and ACCS command centre hotline.',
        fields: [
          { id: 'ecl-911', name: 'emergency_911', label: 'Immediate Emergency Services (Police / Fire / Ambulance)', type: 'text', defaultValue: '9-1-1', required: true, gridCols: 2 },
          { id: 'ecl-agency-hotline', name: 'agency_24_7_hotline', label: 'ACCS Agency Official 24/7 Hotline', type: 'text', defaultValue: AGENCY_PHONE_WITH_NOTICE, required: true, gridCols: 2 },
          { id: 'ecl-director-name', name: 'agency_director_contact', label: 'Agency Director', type: 'text', defaultValue: `Agency Director • Head Office: ${AGENCY_PHONE}`, required: true, gridCols: 2 },
          { id: 'ecl-assigned-visitor', name: 'assigned_home_visitor_contact', label: 'Assigned RECE Home Visitor Contact', type: 'text', placeholder: 'e.g. Sabrina Vance, RECE • Cell: (905) 555-0142', required: true, gridCols: 2 }
        ]
      },
      {
        id: 'sec-ecl-2',
        title: 'Section 2: Health Helplines & Regional Authorities',
        description: 'Provincial and local specialized health contacts.',
        fields: [
          { id: 'ecl-poison', name: 'ontario_poison_centre', label: 'Ontario Poison Centre (Toll-Free 24/7)', type: 'text', defaultValue: '1-800-268-9017', required: true, gridCols: 2 },
          { id: 'ecl-telehealth', name: 'telehealth_ontario', label: 'Health Connect Ontario / Telehealth 24/7', type: 'text', defaultValue: '8-1-1 (TTY: 1-866-797-0007)', required: true, gridCols: 2 },
          { id: 'ecl-public-health', name: 'local_public_health_unit', label: 'Regional Public Health Unit (Durham / York / Toronto)', type: 'text', placeholder: 'Durham Region Health: 905-668-7711 | York Public Health: 1-877-464-9675', required: true, gridCols: 2 },
          { id: 'ecl-nearest-hospital', name: 'nearest_hospital_er', label: 'Nearest Hospital Emergency Department & Address', type: 'text', placeholder: 'e.g. Lakeridge Health Oshawa, 1 Hospital Court, Oshawa', required: true, gridCols: 2 }
        ]
      },
      {
        id: 'sec-ecl-3',
        title: 'Section 3: Home Facility Location & Utility Emergency Numbers',
        description: 'Information for emergency responders arriving at the residence.',
        fields: [
          { id: 'ecl-home-address', name: 'provider_exact_address', label: 'Provider Home Full Street Address & Unit #', type: 'text', required: true, gridCols: 2 },
          { id: 'ecl-major-intersection', name: 'nearest_major_cross_streets', label: 'Nearest Major Cross Streets / Intersections', type: 'text', required: true, gridCols: 2 },
          { id: 'ecl-gas-enbridge', name: 'enbridge_gas_emergency', label: 'Enbridge Gas Emergency (Gas Smell / Leak)', type: 'text', defaultValue: '1-866-763-5427', required: true, gridCols: 2 },
          { id: 'ecl-hydro-electric', name: 'hydro_power_outage', label: 'Hydro One / Local Electric Utility Emergency', type: 'text', defaultValue: '1-800-434-1235', required: true, gridCols: 2 },
          { id: 'ecl-water-shutoff', name: 'main_water_shutoff_location', label: 'Main Water Shut-Off Valve Location in Home', type: 'text', placeholder: 'e.g. Basement north wall near water heater', required: true, gridCols: 1 }
        ]
      }
    ]
  }
];
