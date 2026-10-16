# All Child Care Solutions (ACCS)
## Master Implementation To-Do List & Client Requirements Roadmap (Version 2.0)

> **Prepared for**: Agency Director Jonathan  
> **Date**: October 2, 2026 (Version 2.0 Polished & Client-Aligned)  
> **Database Source**: Cloud Firestore developer_notes & Client Directives  
> **Synthesis**: 58 Curated Notes & 111 Raw Chat Interactions Consolidated into 29 Clean, Single-Task Engineering Items (Cloud Firestore data preserved 100% untouched).

---

## 1. Executive Summary & Domain Breakdown

During live system demonstrations, client review sessions with Jonathan generated 58 curated notes in Cloud Firestore. Because several notes originated from multi-part conversational answers or rapid feature queries (e.g. 'Implement 2. yea this is a voice only line...'), this document cleans, deduplicates, and organizes all feedback into 29 specific, single-task deliverables. Each task features explicit acceptance criteria, clear problem scope, and traceable linkages to original client notes.

| Functional Domain | Task Range | Core Architectural Scope |
|---|---|---|
| **1. Parent Admissions & Intake Pipeline** | Tasks #1 – #5 | Form PAR-0 schedule fix, institutional copy rebrand, sole Interac e-Transfer rail (no cheques/cash/PAD), Step 2 parallel 3-document upload, legal pre-screening banner. |
| **2. Provider Hub, Attendance & Timesheets** | Tasks #6 – #11 | 2-Tap daily attendance (arrival & departure) with 12:30pm & 5:00pm alerts and pick-up verification, subsidized absence ledger, single-session timesheets, locked $35 rate, 1-page print CSS, T4A tax summaries. |
| **3. Home Visitor Field Portal & CCEYA** | Tasks #12 – #14 | Decoupling quarterly inspection from behaviour audit, 40-page Ministry checklist wizard (12 domains), flat high-contrast field tablet UI. |
| **4. Compliance Portal & Form Lifecycles** | Tasks #15 – #18 | Centralized compliance sign-off portal, decoupling TB test from annual renewals, dedicated Home Visitor series (HV-0 to HV-2), Form Builder expansion. |
| **5. Admin Command Centre & Agency Config** | Tasks #19 – #25 | Global role branding ('Jonathan' -> 'Agency Director/Representative'), dynamic multi-tier rates, financial sanitization, regional tiers, admin DB download. |
| **6. Platform, Field PWA & Local AI** | Tasks #26 – #29 | Offline tablet PWA with IndexedDB sync, responsive 1/4 side-docked AI assistant (3/4 UI canvas), AI model assignment hub, form builder rollback. |

---

## 2. Detailed Implementation Backlog

### 📂 Domain 1: Parent Admissions & Intake Pipeline

#### - [x] Task #1: Form PAR-0 Section 3 ('Schedule Needs & Care Preferences') Input Suite & Branded Date Picker   [URGENT]  •  [Completed / Verified]

- **Problem / Need**: Section 3 ('Schedule Needs & Care Preferences') on Form PAR-0 previously displayed the header subtitle prompting parents for details on daily hours, school drop-offs, and special requests, but lacked default input fields in the UI. Furthermore, the browser's default calendar popup required excessive clicking/digging to pick a child's birth year, and weekend/extended shifts were unrepresented.

- **Implementation Action**:
  Implemented a complete, tactile schedule preferences suite and branded date picker in `PublicRegistrationPage.tsx` and `AccsDatePicker.tsx`:
  - **4 Program Type Cards**: Full-Time Care (Mon–Fri CWELCC $22/day), Part-Time Care (2–3 Days/Wk), Before & After School (School Age 4–12 yrs), and Weekend & Extended Care (Shift-work & non-standard hours).
  - **7-Day Care Selector**: Interactive Mon through Sun toggle buttons with amber `Wknd` indicators, an `[ ] Evening / Overnight` care checkbox, and 1-click preset shortcuts (`Mon–Fri`, `M/W/F`, `Weekends`, `All 7 Days`).
  - **Daily Operating Hours & Proximity**: Dropdown with standard ranges (`7:30 AM – 5:00 PM`, `8:00 AM – 4:30 PM`, `7:00 AM – 5:30 PM`, `8:30 AM – 5:30 PM`, `Flexible / Shift Work`, `Weekend Care / Extended Shifts`) alongside target neighborhood proximity input.
  - **Special Care Requests & Details**: Accessible multiline textarea for school drop-offs/pick-ups (e.g. half-day kindergarten), dietary preferences, and routines.
  - **On-Brand ACCS Date Picker (`AccsDatePicker.tsx`)**: Replaced raw browser `<input type="date">` with an on-brand, neo-brutalist date picker featuring a prominent top-tier Year bar (`< [ 2026 ] >` with 1-click 3-column Year Grid), a Month bar (`< [ Month ] >` with 1-click Month Grid), Day grid, keyboard `YYYY-MM-DD` typing fallback, and responsive viewport auto-alignment.
  - **CRM Payload Integration**: Formatted schedule summary automatically maps to `preferredSchedule`, `selectedDays`, and `formZeroNotes` for Agency Director pre-screening review.

- **Acceptance Criteria**:
  - **1.** Parents can select program type (including weekends), toggle all 7 days of care, and choose operating hours with instant visual feedback. [Verified]
  - **2.** Multiline textarea captures specific school drop-off or care needs. [Verified]
  - **3.** Custom `AccsDatePicker` provides effortless 1-click year navigation without month-digging friction. [Verified]
  - **4.** Selected parameters map directly to the pre-screening discovery dossier in Jonathan's Command Centre. [Verified]
- **Source / Traceability**: *Synthesizes Note #45 (note-1790026268357), ACCS CCEYA Policies (Weekend/Evening), and Client Feedback (Oct 2026).*

---

#### - [x] Task #2: Standardize Form PAR-0 Customer-Facing Copy & Milestone Rebranding   [HIGH]  •  [Completed / Verified]

- **Problem / Need**: Multiple conversational notes requested copy updates across Form PAR-0 to sound welcoming, professional, and remove individual personal names prior to screening.

- **Implementation Action**:
  Executed a unified copy standardization pass across all touchpoints:
  - **Header & Footer Subtitle**: 'Zero fees to apply • An agency representative will contact you to discuss your child care needs.'
  - **Small Group Care Box**: 'Max 6 children per home, with personalized attention in a warm, nurturing environment.'
  - **CWELCC Card**: Removed $478.50 average figure; reworded: 'Municipal Subsidies may be supported. Please inquire with the agency during your screening call.'
  - **Post-Submission Banner**: 'Your Child Care Inquiry has been Successfully Submitted! Your pre-screening application for {count} child(ren) has been received.'
  - **Roadmap Milestone Rebrand**: Renamed Step 3 from 'Provider Match' to 'Meet Your Caregiver' in `ParentHeaderStepper.tsx` and `Step3ProviderMatching.tsx`.
  - **What Happens Next**: 3 numbered steps directly outlining: 1. Agency Review, 2. Discovery Call to discuss care preferences, 3. Portal Registration post-approval (excised personal names and 10-minute callback claims).
  - **Section 3 Placement Team Footnote**: 'This information helps our placement team match your family with the right licensed home caregiver during your screening call.'

- **Acceptance Criteria**:
  - **1.** All customer-facing copy updates implemented with zero personal names or 10-minute callback claims. [Verified]
  - **2.** Milestone sequence reflects 'Meet Your Caregiver'. [Verified]
- **Source / Traceability**: *Synthesizes Notes #8, #29, #30, #31, #32, #33, #35, #42.*

---

#### - [x] Task #3: Streamline Payment Methods on Form PAR-5: Sole Interac e-Transfer Rail (Remove Cheques, Cash, PAD & Helcim)   [HIGH]  •  [Completed / Verified]

- **Problem / Need**: Form PAR-5 (Master Parent Agreement) and billing templates previously included physical cheques, cash, and complex electronic debit/credit options (PAD/Helcim). This introduced unnecessary processing overhead, bank authorization friction, NSF risks, and merchant fee complexities.

- **Implementation Action**:
  Standardized exclusively on Interac e-Transfer as the single, universal payment method across Form PAR-5 Clause 5, Step 4 & Step 5 parent billing interfaces, and Financial Ledger reminder dispatches:
  - **Strict Payment Recipient**: Directed all e-Transfers strictly to `allchildcaresolutions@gmail.com` (completely decommissioned and removed `payments@allchildcaresolutions.com`).
  - **Decommissioned Secondary Rails**: Removed Option B (In-person cheques, certified money orders, debit) and eliminated any cash/PAD/Helcim options.
  - **Single Tactile Payment Card**: Step 4 provides a unified, full-width Interac e-Transfer card with auto-deposit verification, exact memo formatting instructions (`"{Child Name} - Care Fee"`), and reference code submission for agency receipt verification.

- **Acceptance Criteria**:
  - **1.** Form PAR-5 Clause 5 strictly and solely mandates Interac e-Transfer. [Verified]
  - **2.** Paper cheques, cash, Pre-Authorized Debit (PAD), and Helcim references are 100% excised from all forms and billing views. [Verified]
  - **3.** All parent fee screens, notifications, and ledger invoices display clean single-rail Interac transfer instructions to `allchildcaresolutions@gmail.com`. [Verified]
- **Source / Traceability**: *Synthesizes Note #9 (note-1789921450964), Note #1 query 4, Note #36 query 4, and Client Directive (Oct 2026).*

---

#### - [ ] Task #4: Intake Flow Gating: Step 2 Parallel 3-Document Upload & Dual Guardian Parity   [HIGH]  •  [Approved / In Progress]

- **Problem / Need**: Deferring statutory document uploads until Step 4 created enrolment bottlenecks and delayed file approvals after provider matching had already begun; conversely, requiring them during initial public inquiry (Step 1) caused high parent form abandonment.

- **Implementation Action**:
  Keep Step 1 (PAR-0) strictly limited to preliminary contact and basic care needs (<2 min inquiry, zero file uploads). Immediately after Admin approves the screening call and dispatches the secure magic link, unlock Step 2 (Intake Forms). In Step 2, alongside digital forms PAR-1 through PAR-5, allow parents to upload the 3 mandatory statutory documents: (1) Child's Birth Certificate, (2) Ontario Health Card (OHIP), and (3) Yellow Immunization Card (Immunization Record). Securely store uploads in Canadian-residency Firebase Storage (northamerica-northeast1) with instant visual upload badges linked directly to the child's CRM profile for Admin verification prior to Step 3 (Provider Matching). In Step 2+ (PAR-1 onwards), enforce complete secondary guardian schema parity across emergency contacts (PAR-2) and billing.

- **Acceptance Criteria**:
  - **1.** Step 1 (PAR-0) requires zero document uploads.
  - **2.** Step 2 (Intake Forms) features intuitive upload cards for the 3 statutory files (Birth Certificate, OHIP, Yellow Immunization Card) right after magic link login.
  - **3.** Uploaded documents link directly to the child's CRM record before Step 3 provider matching begins.
  - **4.** Secondary guardian fields mirror primary guardian across all records.
- **Source / Traceability**: *Synthesizes Notes #7, #16, #26, #56, #57, and Client Journey Directive (Oct 2026).*

---

#### - [ ] Task #5: Standardize Form PAR-0 Legal Pre-Screening Acknowledgment Banner   [HIGH]  •  [Clarification Needed]

- **Problem / Need**: The pre-submission legal banner implied immediate placement matching and cited server geography ('in Montreal, Canada').

- **Implementation Action**:
  Update the pre-submission acknowledgment banner positioned above the submit button:
  'By submitting this inquiry, I acknowledge that I am initiating an initial pre-screening review with All Child Care Solutions, a licensed Home Child Care Agency operating under the Child Care and Early Years Act, 2014 (CCEYA) and regulated by the Ontario Ministry of Education.'
  Retain statutory citations for CCEYA 2014, Ministry of Education, and Canadian PIPEDA/PHIPA data protection standards; remove Montreal server text.

- **Acceptance Criteria**:
  - **1.** Banner clearly frames submission as pre-screening review.
  - **2.** Server geography is excised while statutory citations remain intact.
- **Source / Traceability**: *Synthesizes Note #14 (note-1789923227519).*

---

### 📂 Domain 2: Provider Hub, Attendance & Timesheets (Form PROV-1)

#### - [ ] Task #6: 2-Tap Daily Attendance (Arrival & Departure) with 12:30 PM & 5:00 PM Compliance Alerts   [HIGH]  •  [Approved / In Progress]

- **Problem / Need**: Single-tap check-in only recorded arrival presence without capturing departure timestamps. Under Ontario CCEYA regulations and agency insurance liability, knowing precise physical child whereabouts and departure times (plus authorized pick-up custody) is legally critical. Additionally, busy home providers frequently forget morning sign-ins or evening sign-outs without automated prompts.

- **Implementation Action**:
  Upgrade the Licensed Provider Hub to a complete 2-Tap Attendance Workflow:
  - Tap In (Arrival): 1-tap records exact arrival timestamp when the child arrives at the home.
  - Tap Out (Departure): 1-tap records exact departure timestamp when the child leaves, logging the authorized adult collecting the child for liability and child-whereabouts audit trails.
  - 12:30 PM Missing Sign-In Alert: Automated notification dispatched at 12:30 PM to any provider if a scheduled child has not yet been signed in (tapped in) or marked absent/sick.
  - 5:00 PM Missing Sign-Out Alert: Automated notification dispatched at 5:00 PM for any child who was tapped in but has not yet been tapped out when expected to leave.
  - Manual Time Override: Allow providers to manually adjust timestamps via time picker for busy drop-off/pick-up handoffs.
  - Net Daily Hours: Automatically compute actual care hours and populate Form PROV-1 monthly subsidy timesheets.

- **Acceptance Criteria**:
  - **1.** Provider Hub UI provides distinct, intuitive "Tap In" and "Tap Out" buttons.
  - **2.** Automated notification dispatches at 12:30 PM if scheduled children are not signed in.
  - **3.** Automated notification dispatches at 5:00 PM if checked-in children are not signed out.
  - **4.** Departure records log timestamp and authorized pick-up adult for liability compliance.
  - **5.** Net care hours calculate accurately into PROV-1 monthly timesheets.
- **Source / Traceability**: *Synthesizes Note #47 (note-1790226699342), Note #39 query 2, and CCEYA Liability Mandate (Oct 2026).*

---

#### - [ ] Task #7: Subsidized Absence Ledger & 'Expected but Absent' Attendance Status   [HIGH]  •  [Clarification Needed]

- **Problem / Need**: Municipal child care subsidies (Toronto, Durham, York) only pay for a certain quota of allowable absences per year (e.g. 30 days). Unexcused absences risk non-payment.

- **Implementation Action**:
  Add an 'Expected but Absent' attendance button on provider daily rosters. Provide an administrative ledger on child profiles to track annual allowable sick/absent days and decrement remaining days automatically to protect municipal subsidy billing compliance. Trigger warnings in Jonathan's Command Centre when a child nears or exceeds their annual allotment.

- **Acceptance Criteria**:
  - **1.** Providers can log 'Expected but Absent' in 1 tap.
  - **2.** Child profile tracks remaining sick days.
  - **3.** Admin receives over-quota billing alerts.
- **Source / Traceability**: *Synthesizes Note #6 (note-1789684328873).*

---

#### - [ ] Task #8: Provider Monthly Timesheet (PROV-1) Session & Working Hours Streamlining   [HIGH]  •  [Proposed]

- **Problem / Need**: Form PROV-1 splits days into morning and afternoon sessions, adding unnecessary complexity. Providers also need to log their own operational working hours.

- **Implementation Action**:
  Consolidate the daily timesheet grid into a single daily session: In, Out, Daily Hours, Total Hours. Provide a dedicated section for licensed providers to log their own operational working hours for agency records and CWELCC grant reconciliation. Ensure 1-click auto-fill from daily check-in logs populates both child and provider sheets.

- **Acceptance Criteria**:
  - **1.** Single daily session replaces split table.
  - **2.** Provider working hours are recorded on the monthly sheet.
  - **3.** Auto-fill operates with 1 tap.
- **Source / Traceability**: *Synthesizes Note #15 (note-1789923738002).*

---

#### - [ ] Task #9: Timesheet Role-Based Access, Payout Visibility & Audit Trail   [HIGH]  •  [In Progress]

- **Problem / Need**: Providers need visibility into their monthly earnings without having the ability to alter locked statutory rates or tamper with attendance unmonitored.

- **Implementation Action**:
  Rename column 'Statutory Daily Rate' to 'Daily Rate'. Lock Daily Rate ($35.00/day) as strictly read-only for providers. Allow providers to view their total verified care days and estimated monthly payout. Allow provider manual attendance overrides (for corrections), but log an Admin-only audit trail (timestamp, provider ID, previous value, new value). Standardize confirmation message upon submission: 'Your timesheet has been submitted to the agency for payroll verification.'

- **Acceptance Criteria**:
  - **1.** Daily Rate is immutable for providers.
  - **2.** Manual attendance edits trigger an audit log.
  - **3.** Confirmation receipt matches client verbiage.
- **Source / Traceability**: *Synthesizes Notes #36, #37, #38, #39 query 1.*

---

#### - [ ] Task #10: CSS Print Media Optimization for Timesheets & Director Binder   [HIGH]  •  [Proposed]

- **Problem / Need**: Printing timesheets or intake forms cuts off tables, forces awkward multi-page splits, and prints digital video players and action buttons.

- **Implementation Action**:
  Configure comprehensive @media print rules:
  - Form PROV-1 Monthly Timesheet auto-fits onto a single clean 8.5x11 page without requiring manual browser scaling.
  - Suppress digital-only modules (such as the Annual Compliance & CCEYA Training Video) and action buttons during print.
  - Format margins, headers, and footers for clean 3-ring binder filing for Ministry audits.

- **Acceptance Criteria**:
  - **1.** Print preview fits onto 1 page cleanly without table clipping.
  - **2.** Video players and interactive buttons are hidden in print output.
- **Source / Traceability**: *Synthesizes Note #4 (note-1789238677681), Note #17 (note-1789924038396).*

---

#### - [ ] Task #11: Admin-Gated Invoicing & CRA T4A Provider Tax Summaries   [HIGH]  •  [In Progress]

- **Problem / Need**: Client mandates that monthly fee invoices and annual tax statements must never automatically broadcast to families or providers without administrative review.

- **Implementation Action**:
  Configure monthly parent fee invoices, parent annual statements, provider timesheet remittance advice, and provider annual earnings statements with an Admin-only distribution gate. Admin/Director manually releases statements via printable PDF or email dispatch. Provider annual earnings statement formats as a CRA-compliant T4A earnings summary.

- **Acceptance Criteria**:
  - **1.** Statements cannot auto-send without explicit Admin click.
  - **2.** Provider annual statement adheres to CRA T4A line items.
- **Source / Traceability**: *Synthesizes Note #27, Note #40 (note-1790025281432).*

---

### 📂 Domain 3: Home Visitor Field Portal & CCEYA Inspections

#### - [ ] Task #12: Decouple Quarterly Physical Inspection from Behaviour Guidance Audit   [HIGH]  •  [In Progress]

- **Problem / Need**: In the Home Visitor Field Portal, the 'Quarterly Inspection' and 'Behaviour Audit' buttons opened overlapping forms with identical mixed-age ratio headcount fields.

- **Implementation Action**:
  Differentiate the physical CCEYA s. 26 quarterly premises inspection from the ACCS x CITS pedagogical behaviour guidance observation. Remove ratio headcount inputs from the behaviour audit. Align behaviour audit strictly with the official 10 positive guidance observation checkpoints (e.g. self-regulation support, positive tone, child-initiated inquiry).

- **Acceptance Criteria**:
  - **1.** Both buttons launch distinct, dedicated inspection modals.
  - **2.** Behaviour audit focuses solely on pedagogical guidance checkpoints.
- **Source / Traceability**: *Synthesizes Note #58 (note-quarterly-inspection-diff).*

---

#### - [ ] Task #13: 40-Page Ministry Quarterly Checklist (12 Domains) Accordion Wizard   [URGENT]  •  [In Progress]

- **Problem / Need**: Client mandates full compliance with the official 40-page Ministry Quarterly Checklist ('Quarterly Checklist Home Visitor EN v.08 2023-12-11'), covering 12 regulatory domains.

- **Implementation Action**:
  Implement the 40-page checklist as a structured multi-step accordion wizard in the Home Visitor Portal. Cover all 12 CCEYA domains: Premises, Safety & Equipment, Health & Medical, Nutrition, Program & Sleep, Ratios & Supervision, Children's Records, Staff & Ordinarily Resident Screening, Emergency Procedures, etc. Support digital dual signatures (RECE Home Visitor + Provider) and automatic action item generation for non-compliant items.

- **Acceptance Criteria**:
  - **1.** All 12 domains navigable on field tablets.
  - **2.** Auto-save and dual signatures operational.
  - **3.** Syncs to Ministry Audit Binder.
- **Source / Traceability**: *Synthesizes Note #53 (note-40page-cceya-checklist).*

---

#### - [ ] Task #14: Home Visitor Card UI Sanitization & Header Renaming   [HIGH]  •  [Proposed]

- **Problem / Need**: 3D tilt effects and heavy drop shadows look dated and hinder readability on mobile field tablets in high-glare environments.

- **Implementation Action**:
  Remove all 3D transforms, perspective styling, and heavy drop shadows from the Home Visitor Portal. Implement clean, high-contrast, flat card containers with 2px slate borders (border-2 border-slate-900). Rename portal header from 'Home Visitor Field Portal' to 'Home Visitor Portal'.

- **Acceptance Criteria**:
  - **1.** Clean flat neo-brutalist styling replaces 3D depth effects.
  - **2.** Header renamed to 'Home Visitor Portal'.
- **Source / Traceability**: *Synthesizes Note #2 (note-1789171754486), Note #10 query 2.*

---

### 📂 Domain 4: Compliance Portal & Statutory Form Lifecycle Audit

#### - [ ] Task #15: Centralized Digital Compliance Sign-Off Portal   [HIGH]  •  [In Progress]

- **Problem / Need**: Agency lacks a unified digital sign-off hub for recurring mandatory compliance policies across all agency personnel and adult household members.

- **Implementation Action**:
  Build a central Compliance Portal for Providers, Relief Caregivers, Home Visitors, Admin Staff, and Ordinarily Resident adults (CCEYA s. 54/60). Enable digital execution for annual policies: Behaviour Management, Safe Sleep, Anaphylaxis, and Annual Offence Declarations. Implement automated reminder alerts dispatched at 60, 30, and 7 days prior to annual document expiration.

- **Acceptance Criteria**:
  - **1.** Any stakeholder can sign mandatory annual policies digitally.
  - **2.** Compliance status reflects in Admin Command Centre with expiration countdowns.
- **Source / Traceability**: *Synthesizes Note #48 (note-1790299188114), Note #39 query 3.*

---

#### - [ ] Task #16: Decouple Baseline Pre-Placement Requirements from Annual Renewals   [HIGH]  •  [In Progress]

- **Problem / Need**: Form PROV-3 (Annual Policy Declaration) mistakenly included one-time 2-step TB skin test results, which belong strictly to initial onboarding.

- **Implementation Action**:
  Audit form suite to cleanly decouple one-time pre-placement requirements (2-step TB skin test under CCEYA s. 57, initial VSC) from recurring annual compliance forms. Remove TB test fields from Form PROV-3. Ensure TB test and baseline medical clearances reside strictly in Form PROV-0 and the Central Compliance Dossier.

- **Acceptance Criteria**:
  - **1.** Form PROV-3 is strictly an annual policy declaration.
  - **2.** Baseline medical tests are captured once upon initial onboarding.
- **Source / Traceability**: *Synthesizes Note #25, Note #51 (note-1790301020307).*

---

#### - [ ] Task #17: Dedicated Home Visitor Intake Form Series (HV-0 to HV-2)   [HIGH]  •  [In Progress]

- **Problem / Need**: Home Visitors currently share provider registration forms, despite having distinct regulatory requirements (RECE license, driving record, field tablet custody).

- **Implementation Action**:
  Implement dedicated Home Visitor form series in Form Builder Studio:
  - Form HV-0: Home Visitor Employment Application & Background.
  - Form HV-1: Professional Credentials (RECE license verification, SFA/CPR, driver's license, auto insurance) and Field Tablet Hardware Custody agreement for PIPEDA compliance.
  - Form HV-2: Annual CCEYA Policy Sign-Off & Offence Declaration.
  Include placeholders for future Confidentiality Agreement and Mileage Reimbursement Policy.

- **Acceptance Criteria**:
  - **1.** HV series is segregated in Form Builder.
  - **2.** Captures RECE license number and tablet custody sign-off.
- **Source / Traceability**: *Synthesizes Note #49 (note-1790299758672), Note #39 query 4.*

---

#### - [ ] Task #18: Ingest Remaining Statutory CCEYA Instruments into Form Builder Studio   [HIGH]  •  [Proposed]

- **Problem / Need**: Form Builder Studio currently houses 10 primary forms, but lacks statutory incident and health logs required by the Ministry during inspections.

- **Implementation Action**:
  Expand Form Builder Studio to support:
  - Serious Occurrence Report (SOR) Form (24-hour Ministry reporting workflow).
  - Medication Administration Record (dosage, time, child, provider signature).
  - Individualized Anaphylaxis Emergency Plan (EpiPen protocol).
  - Daily Health Check & Child Wellness Log.

- **Acceptance Criteria**:
  - **1.** All 4 statutory forms exist in Form Builder Studio.
  - **2.** Schemas export cleanly and generate printable binder sheets.
- **Source / Traceability**: *Synthesizes Note #5 (note-1789498044047), Note #12 (note-1789922338250).*

---

### 📂 Domain 5: Admin Command Centre & Agency Configuration

#### - [ ] Task #19: Global Agency Role Branding: Replace 'Jonathan' with Institutional Titles   [HIGH]  •  [In Progress]

- **Problem / Need**: Personal references to 'Jonathan' appear in multiple forms, buttons, and confirmation cards, making the agency look like a sole proprietorship.

- **Implementation Action**:
  Replace all hardcoded references to 'Jonathan' with standardized institutional titles:
  - Use 'Agency Director' for formal approvals, contracts, licensing matters, and executive sign-offs.
  - Use 'Agency Representative' for pre-screenings, discovery calls, parent consultations, and review milestones.

- **Acceptance Criteria**:
  - **1.** Zero instances of 'Jonathan' in user-facing views.
  - **2.** Professional institutional branding across all 3 portals.
- **Source / Traceability**: *Synthesizes Notes #8, #11 (note-1789921893781).*

---

#### - [x] Task #20: Dynamic Multi-Tier Rate Engine & Admin Policy Settings Hub (CWELCC Switcher, Statutory Sources & In-App AI Grounding)   [HIGH]  •  [Completed / Verified]

- **Problem / Need**: As Ontario CWELCC policies evolve ($22.00/day transitioning to $10.00/day) and municipal operating agreements adjust, Agency Director Jonathan needed an administrative control panel to update parent rates, guaranteed provider compensation, and agency operating spreads without code changes. Furthermore, the agency required verified live Ministry sources of truth (CCEYA statute, Licensing Manual) and dynamic AI grounding to prevent memory-compaction scrapers.

- **Implementation Action**:
  Implemented Tab 7 (`Policy & Rates` / `AgencySettingsView.tsx`) in the Admin Command Centre:
  - **CWELCC Phase Quick-Toggle**: 1-click toggle between Current Phase ($22.00/day | ~$478.50/mo) and Upcoming Target Phase ($10.00/day | ~$217.50/mo), with live provincial top-up grant and agency operating spread simulation.
  - **Dynamic Rate Customizers**: Editable daily rates for CWELCC parent fees, private parent fees ($35.00/day), municipal subsidy co-pays ($0.00), and guaranteed provider payouts ($35.00/day).
  - **Canonical Ministry Sources of Truth**: Interactive matrix linking directly to official provincial legislation (CCEYA 2014, c. 11), Ministry Home Child Care Licensing Manual (O. Reg. 137/15), Durham Region Directives, and Toronto/York CWELCC Guidelines, complete with 1-click verification update checker (`[ ⚡ Check Ministry for Updates ]`) and custom resource adder.
  - **Dynamic In-App AI Assistant Reader**: Connected `loadAgencySettings()` directly into `AccsAiAssistant.tsx` so the AI assistant reflects Jonathan's live configured rates, CCEYA ratios, and statutory links on every turn, completely bypassing raw website re-scraping and protecting the 165k-token context budget.

- **Acceptance Criteria**:
  - **1.** Admin can toggle between $22 and $10 CWELCC phases and customize provider/agency rates on demand. [Verified]
  - **2.** Canonical Ministry sources of truth are accessible with 1-click live external links and verification status checks. [Verified]
  - **3.** In-app AI Assistant dynamically references active settings and Ministry sources on every interaction. [Verified]
  - **4.** Production build passes with 0 TypeScript or bundling errors. [Verified]
- **Source / Traceability**: *Synthesizes Note #50 (note-1790300278012), Note #55, and User Directive (Oct 2026).*

---

#### - [ ] Task #21: Role-Based Financial & Regulatory Sanitization   [HIGH]  •  [In Progress]

- **Problem / Need**: Sensitive financial back-office margins and formal statute citations were visible in areas accessible to parents.

- **Implementation Action**:
  Strictly hide provider guaranteed statutory daily payouts ($35/day), CWELCC government top-up grant formulas, and agency operational spreads from parent-facing views. On parent-facing provider profile cards, display clean 'Capacity: 6 children' and remove age ratio sub-breakdowns ('Max 3 under 3yo', 'Max 3 under 2yo'). Full sub-breakdowns remain strictly preserved for Admin and Home Visitors. Restrict formal CCEYA legal section tags (e.g. O. Reg. 137/15 s. 8) to Admin and Home Visitor portals; providers receive clear, plain-language health and safety guidance.

- **Acceptance Criteria**:
  - **1.** Parents never see provider payout rates or statutory sub-ratios.
  - **2.** Administrative back-office margins remain confidential.
- **Source / Traceability**: *Synthesizes Notes #1, #10, #18, #34, #36.*

---

#### - [ ] Task #22: Regional Geography Normalization & Roster Tagging   [HIGH]  •  [In Progress]

- **Problem / Need**: Dropdown lists of dozens of small towns (Oshawa, Whitby, Ajax, Pickering, Clarington, Markham, etc.) caused confusion and data entry errors.

- **Implementation Action**:
  In Edit Family Record and intake forms, replace granular town dropdowns with top-level regional tiers: 'Durham Region', 'York Region', and 'Toronto'. In Admin 'By Child' sort view and roster exports, append provider operating region to their name under Assigned Home: e.g. 'Provider Name (Durham Region)'. For unplaced children, show a clean 'Unassigned'.

- **Acceptance Criteria**:
  - **1.** Dropdowns use the 3 regional tiers.
  - **2.** Roster table displays region in brackets.
  - **3.** Print exports match.
- **Source / Traceability**: *Synthesizes Note #22 (note-1790020593638), Note #24 (note-1790021405031).*

---

#### - [ ] Task #23: General Notes in Family Records with Admin-Controlled Home Visitor Access   [HIGH]  •  [In Progress]

- **Problem / Need**: Agency needs a place to record operational and family background notes without exposing them to parents, while controlling field staff access.

- **Implementation Action**:
  In the Edit Family Record modal, add a dedicated multiline 'General Notes' textarea directly beneath Medical Notes. Add an Admin toggle: 'Allow Home Visitor Access' per family record. When enabled, Home Visitors can view notes and append new entries with automated timestamps and staff initials; existing entries remain read-only to preserve the audit trail. Admin retains full override authority.

- **Acceptance Criteria**:
  - **1.** General Notes field is 100% hidden from parents.
  - **2.** Home Visitors can only append when permitted by Admin.
  - **3.** Audit trail is preserved.
- **Source / Traceability**: *Synthesizes Notes #14, #19, #23 (note-1790020975452).*

---

#### - [ ] Task #24: One-Click Cloud Firestore Database Backup Download for Admin   [URGENT]  •  [In Progress]

- **Problem / Need**: Admin needs an effortless way to create an on-demand, local backup of the entire agency Firestore database.

- **Implementation Action**:
  Add a 'Download Full Database Backup' button inside the Admin Command Centre header. Access is restricted strictly to users with the Admin role. Downloads a timestamped JSON package containing all agency collections (children, providers, home_visitors, inspections, daily_attendance, form_templates, developer_notes).

- **Acceptance Criteria**:
  - **1.** 1 click generates and downloads the complete database JSON backup.
  - **2.** Non-admins have zero access.
- **Source / Traceability**: *Synthesizes Note #1 (note-1789169187036).*

---

#### - [ ] Task #25: Parameterize Official Agency Telephone & Onboarding Titles   [HIGH]  •  [Proposed]

- **Problem / Need**: Phone number and brand title strings are hardcoded in multiple components, making future updates cumbersome.

- **Implementation Action**:
  Centrally parameterize the official agency telephone number (416-694-7445) as a voice-only line. Display clear notices across contact cards and notification footers stating the line is voice-only (do not send SMS). Standardize navigation onboarding buttons to 'Provider Application' and 'Home Visitor Application' (preserving 'Parent Intake'). Parameterize application display titles ('ACCS Hub' / 'Home Care Hub') in a single configuration file for an effortless global update once Jonathan finalizes agency branding.

- **Acceptance Criteria**:
  - **1.** Phone number and branding strings are imported from a single constants file.
  - **2.** Voice-only notice is clear.
- **Source / Traceability**: *Synthesizes Notes #20, #21, #43, #44.*

---

### 📂 Domain 6: Platform, Field PWA & Local AI Features

#### - [ ] Task #26: Configure Offline PWA Tablet Manifest & Background Service Worker Sync   [HIGH]  •  [In Progress]

- **Problem / Need**: Home Visitors conducting unannounced inspections in basement apartments or rural Durham/York areas often encounter dead zones with zero cell service.

- **Implementation Action**:
  Configure Progressive Web App (PWA) manifest and Service Worker caching for standalone tablet display (zero browser chrome). Implement IndexedDB local caching for CCEYA inspection checklists and daily attendance rosters. Enable automatic background synchronization that queues field inspection records and pushes to Cloud Firestore as soon as connectivity resumes.

- **Acceptance Criteria**:
  - **1.** Home Visitors can fill out inspection checklists completely offline.
  - **2.** Data auto-syncs when online without data loss.
- **Source / Traceability**: *Synthesizes Note #3 (note-1789172183012), Note #46 (note-1790039610309).*

---

#### - [ ] Task #27: Responsive Side-Docking AI Assistant Panel (1/4 Width Split-View Canvas)   [HIGH]  •  [Approved / In Progress]

- **Problem / Need**: Having the AI Assistant open as a modal popup or floating drawer covering the UI obstructs underlying child profile cards, form schemas, and roster tables, forcing operators to constantly open and close the window to inspect records while conversing with the AI.

- **Implementation Action**:
  Refactor AccsAiAssistant.tsx into a responsive side-docking split-view panel:
  - Slide-In Right Panel (1/4 Width): When opened, the AI chat panel slides in smoothly from the right edge, occupying exactly 25% (1/4) of the total screen width.
  - Responsive Main Canvas (3/4 Width): The main application UI simultaneously and smoothly contracts to occupy the remaining 75% (3/4) width, responsively reflowing grids, form builders, and pipeline cards without any modal overlay, backdrop blur, or visual obstruction.
  - Quick-Toggle Tab: Provide a 1-click collapse/expand trigger pinned to the right edge to slide the panel in and out seamlessly.
  - Context & State Persistence: Maintain full conversational history, model selections, and pending form mutations across slide-in, collapse, and tab navigation events.

- **Acceptance Criteria**:
  - **1.** AI chat window slides in from the right occupying 1/4 of total screen width.
  - **2.** Rest of the UI responsively occupies the other 3/4 without overlapping or clipping data.
  - **3.** Zero popup overlay or backdrop blocking access to underlying controls.
  - **4.** 1-click toggle smoothly expands/collapses the split view.
  - **5.** Chat state, messages, and form tools persist during transitions.
- **Source / Traceability**: *Synthesizes Note #28 (note-1790022109552) and Responsive Split-View Architecture (Oct 2026).*

---

#### - [ ] Task #28: Admin AI Model Management Console & Canadian PIPEDA Data Governance   [HIGH]  •  [In Progress]

- **Problem / Need**: Agency needs control over which AI models handle sensitive child care operations, ensuring compliance with Canadian data residency.

- **Implementation Action**:
  Build an administrative AI model management console in Jonathan's Command Centre. Enable modular tool routing: assign lightweight models (e.g. Gemma 4 E4B / Kev) to fast parent intake triage, and high-reasoning models (e.g. Qwen 2.5 7B / Claude) to CCEYA regulatory audits. Enforce Canadian PIPEDA/PHIPA pre-flight verification: automatic client-side PII masking (redacting OHIP health numbers) before prompts leave the browser.

- **Acceptance Criteria**:
  - **1.** Admin can toggle models per tool.
  - **2.** OHIP numbers are automatically masked.
  - **3.** Model management restricted to Director/Developer.
- **Source / Traceability**: *Synthesizes Notes #39, #52, #54.*

---

#### - [ ] Task #29: Dynamic Form Schema Versioning & 1-Click Rollback in Form Builder   [MEDIUM]  •  [In Progress]

- **Problem / Need**: When editing form fields in Form Builder Studio or via conversational AI commands, operators need an immediate way to undo mistakes.

- **Implementation Action**:
  Implement a visual version history and 1-click rollback engine in FormBuilderStudio.tsx. Save schema snapshots before any mutation is applied. Provide an 'Undo Last Change' button with a visual diff preview showing modified or deleted fields before approving restoration.

- **Acceptance Criteria**:
  - **1.** Operators can revert any form mutation with 1 click.
  - **2.** Diff preview clearly highlights restored fields.
- **Source / Traceability**: *Synthesizes Note #55 (note-form-schema-undo).*

---

## 3. Full Traceability Matrix: All 58 Curated Notes Mapped

This matrix provides 100% mathematical verification that all 58 original documents in the Cloud Firestore developer_notes collection are accounted for in the cleaned 29-task implementation backlog above, ensuring zero client requirements are dropped.

| Firestore Document ID | Original Curated Note Title | Mapped Implementation Task |
|---|---|---|
| note-1789169187036 | Add One-Click Cloud Firestore Database Download for Admin | **Task #24 & Task #21** |
| note-1789171754486 | Implement Home Visitor Hub: Remove 3D Card Effects & Phantom Styling | **Task #14** |
| note-1789172183012 | Implement Talk about locally running app | **Task #26** |
| note-1789238677681 | Implement Polish PDF Print Styles for Agency Director Binder | **Task #10** |
| note-1789498044047 | Implement Make note to add rest of forms to the form builder | **Task #18** |
| note-1789684328873 | Implement Are we live chat? | **Task #7** |
| note-1789918675826 | Implement The dedicated parent registration link (magic link) | **Task #4** |
| note-1789919212374 | Implement Global Agency Role Branding: Replace 'Jonathan' with... | **Task #19** |
| note-1789921450964 | Implement Fee Collection Streamlining: Remove Cheque Option &... | **Task #3** |
| note-1789921700370 | Configure Parent-Facing Capacity Display: Remove Ratio Sub-Breakdowns | **Task #21 & Task #14** |
| note-1789921893781 | Remove the Jonathan throughout the app and replace it with Agency | **Task #19** |
| note-1789922338250 | Implement Audit and Complete Statutory Parent Intake Suite (PAR-0 to... | **Task #4 & Task #18** |
| note-1789922984005 | Implement Universal Multi-Tier Notepad & HDLH Pedagogical AI | **Task #23** |
| note-1789923227519 | Implement 1. yes absolutely and strict! The director makes private... | **Task #5 & Task #23** |
| note-1789923738002 | Configure Provider Monthly Attendance: Single Session & Provider... | **Task #8** |
| note-1789923858869 | Implement Oh woops i missed there is already a button for autofill | **Task #4 & Task #15** |
| note-1789924038396 | Implement For printing these time sheet documents; are you able to... | **Task #10** |
| note-1790019927836 | Configure Role-Based UI Sanitization: Regulatory Markings Restricted | **Task #21** |
| note-1790019999612 | Implement 1. yes 2. have yet to decide or see what that looks like | **Task #11 & Task #23** |
| note-1790020125687 | Implement I may rename ACCS Hub / Home Care Hub and will follow up | **Task #25** |
| note-1790020191457 | Standardize Onboarding Terminology: Provider & Home Visitor | **Task #25** |
| note-1790020593638 | Implement Under edit family record please Use the broader options | **Task #22** |
| note-1790020975452 | Implement Dedicated General Notes in Edit Family Record with Granular | **Task #23** |
| note-1790021405031 | Display Provider Region in 'By Child' Sort View & Roster Exports | **Task #22** |
| note-1790021656517 | Implement 1. sure if there is space to do so and it doesn't look | **Task #22 & Task #16** |
| note-1790021911404 | Implement Dual Guardian Architecture: Stage 1 Intake vs Formal | **Task #4** |
| note-1790021994836 | Implement 2. one or if two is available the better but one is still | **Task #11** |
| note-1790022109552 | Implement Did i ask to add a note to have this chat window be a pop | **Task #27** |
| note-1790022348362 | Implement In the small group care box in the parent initial intake | **Task #2** |
| note-1790022808609 | Implement CWELCC Card Copy: Remove Monthly Estimate & Direct Subsidy | **Task #2** |
| note-1790023355751 | Implement Form PAR-0 Subtitle Copy: Zero Fees & Discovery Call Wording | **Task #2** |
| note-1790023854877 | Implement Under Application Successfully submitted Please rename it | **Task #2** |
| note-1790024000218 | Implement Form PAR-0: 'What Happens Next' 3-Step Sequence & Screening | **Task #2** |
| note-1790024159792 | Implement Oh wait in regards to 1. I see it displayed on the next | **Task #21** |
| note-1790024217601 | Implement Replace the long paragraph beginning with Ontario CCEYA | **Task #2** |
| note-1790024408799 | Streamline Timesheet Terminology: Change 'Statutory Daily Rate' to... | **Task #9 & Task #3** |
| note-1790024576406 | Implement Timesheet Role-Based Access, Payout Visibility & Audit Trail | **Task #9** |
| note-1790024995173 | Implement Timesheet Submission Copy, Confirmation Receipt & Automated... | **Task #9** |
| note-1790025123554 | Implement 1. yes! I love the your phrase 'Your timesheet has been...' | **Tasks #6, #9, #15, #17, #28** |
| note-1790025281432 | Implement Monthly & Annual Invoicing with Admin-Only Distribution &... | **Task #11** |
| note-1790025572456 | Implement Thats fine It was just an email i sent him with the list of | **Consolidated into Backlog Scope** |
| note-1790025828704 | Implement In the Path to Licensed care please rename 'provider match' | **Task #2** |
| note-1790026026295 | Implement Agency Telephone (416-694-7445): Voice-Only Line &... | **Task #25** |
| note-1790026089984 | Implement 2. yea this is a voice only line; I will get a second line | **Task #25** |
| note-1790026268357 | Implement OH please note that section 3 for par-0 form 'schedule...' | **Task #1** |
| note-1790039610309 | Implement PWA Capabilities, Standalone Tablet Display & Push | **Task #26** |
| note-1790226699342 | Implement Child Attendance Check-Out, Authorized Pick-Up & Departure | **Task #6** |
| note-1790299188114 | Implement Compliance Portal & Digital Document Sign-Off Hub | **Task #15** |
| note-1790299758672 | Implement Home Visitor Dedicated HV Form Series (HV-0 to HV-2) &... | **Task #17** |
| note-1790300278012 | Implement Dynamic Multi-Tier Rate Engine: CWELCC, Custom Subsidy... | **Task #20** |
| note-1790301020307 | Implement Statutory Form Suite Audit: Decouple Baseline Pre-Placement | **Task #16** |
| note-1790607006825 | Dynamic AI Model Management & One-Click LLM Upgrade Hub | **Task #28** |
| note-40page-cceya-checklist | Implement 40-Page Ministry Quarterly Checklist (12 Domains) | **Task #13** |
| note-ai-children-data-governance | Review AI Child Data Governance, PII Masking & Privacy Policies | **Task #28** |
| note-form-schema-undo | Enable Conversational Form Rollback & Version Control | **Task #29** |
| note-par1-multiselect-care-type | Implement Form PAR-1: Multi-Select Care Type Selection | **Task #4** |
| note-parent-registration-flow | Streamline Parent Intake & Registration Flow Gating | **Task #4** |
| note-quarterly-inspection-diff | Separate Quarterly Inspection from Behaviour Guidance Audit | **Task #12** |