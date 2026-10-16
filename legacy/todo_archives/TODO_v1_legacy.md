# All Child Care Solutions (ACCS) — Master Implementation To-Do List

> **Source**: Synthesized from 58 Cloud Firestore Client Review Notes (`developer_notes`) and live consultations with Agency Director Jonathan.  
> **Cleaned & Deduplicated**: Conversational fragments, duplicates, and overlapping requests have been consolidated into **29 discrete, single-task engineering items** with specific acceptance criteria. Database records remain untouched.

---

## 📋 Executive Task Summary by Domain

| Domain | Task Range | Priority Highlights |
| :--- | :---: | :--- |
| **1. Parent Admissions & Intake Pipeline** | Tasks #1 – #5 | Form PAR-0 Schedule bug fix, institutional copy rebrand, removing cheques (e-Transfer/PAD), dual-guardian parity, legal pre-screening banner |
| **2. Provider Hub, Attendance & Timesheets** | Tasks #6 – #11 | Daily check-out & pick-up verification, subsidized absence ledger, single-session timesheets, locked $35 rate, 1-page print CSS, T4A tax summaries |
| **3. Home Visitor Field Portal & CCEYA Inspections** | Tasks #12 – #14 | Decoupling quarterly inspection from behaviour audit, 40-page Ministry checklist wizard (12 domains), flat high-contrast field tablet UI |
| **4. Compliance Portal & Statutory Form Lifecycle** | Tasks #15 – #18 | Centralized compliance sign-off portal, decoupling TB test from annual renewals, dedicated Home Visitor series (HV-0 to HV-2), Form Builder expansion |
| **5. Admin Command Centre & Agency Config** | Tasks #19 – #25 | Global role branding ("Jonathan" -> "Agency Director/Representative"), dynamic multi-tier rates, financial sanitization, regional tiers, admin DB download |
| **6. Platform, Field PWA & Local AI Features** | Tasks #26 – #29 | Offline tablet PWA with IndexedDB sync, dockable AI chat window, AI model assignment hub, form builder rollback |

---

## 👨‍👩‍👧 Domain 1: Parent Admissions & Intake Pipeline (Forms PAR-0 to PAR-5)

### [ ] Task 1: Fix Form PAR-0 Section 3 ("Schedule Needs & Care Preferences") Rendering Defect
- **Problem**: Section 3 ("Schedule Needs & Care Preferences") on Form PAR-0 is currently inaccessible or failing to render for parents in the intake wizard.
- **Action**: Fix step progression logic in `ParentPortal.tsx` and `DynamicFormEngine.tsx` to ensure schedule parameters (days required, care hours, blended schedule preferences) display reliably.
- **Acceptance Criteria**:
  - Days-of-week checkboxes and time-range inputs render smoothly in the public stepper.
  - Selected schedule correctly populates the Director pre-screening review card.
- **Synthesizes**: Note #45 (`note-1790026268357`).

### [ ] Task 2: Standardize Form PAR-0 Institutional Copy & Milestone Rebranding
- **Problem**: Multiple disjointed notes requested rewording various sections of Form PAR-0 to sound professional, welcoming, and remove personal director names.
- **Action**: Update all Form PAR-0 customer-facing strings in one cohesive pass:
  - **Header Subtitle**: *"Zero fees to apply • An agency representative will contact you to discuss your child care needs."*
  - **Small Group Care Callout**: *"Max 6 children per home, with personalized attention in a warm, nurturing environment."*
  - **CWELCC Fee Card**: Remove the average monthly figure ($478.50/mo) to prevent calendar confusion; update copy to: *"Municipal Subsidies may be supported. Please inquire with the agency during your screening call."*
  - **Post-Submission Confirmation**: Main title: *"Your Child Care Inquiry has been Successfully Submitted!"*; Subtitle: *"Your pre-screening application for {count} child(ren) has been received."*
  - **Milestone Roadmap**: Rename step "Provider Match" to *"Meet Your Caregiver"*.
  - **"What Happens Next" 3-Step Sequence**:
    1. *"An agency representative will review your screening application."*
    2. *"We’ll contact you, usually by phone or alternatively by email, to discuss your child’s needs and care preferences as part of the screening process."*
    3. *"Upon approval following the screening process, we’ll guide you through the next steps to begin registration."*
- **Acceptance Criteria**: All 6 touchpoints updated; zero personal names, zero 10-minute callback promises, and zero placement claims prior to screening.
- **Synthesizes**: Notes #8, #29, #30, #31, #32, #33, #35, #42.

### [ ] Task 3: Streamline Payment Methods on Form PAR-5: Remove Cheques & Cash
- **Problem**: Form PAR-5 and parent billing notices include physical cheques and cash (Option B), creating administrative collection friction and NSF risks.
- **Action**: 
  - Decommission physical cheques and cash from Form PAR-5 (Master Parent Agreement, Clause 5) and billing templates.
  - Establish **Interac e-Transfer to `allchildcaresolutions@gmail.com`** as the primary, sole immediate payment rail.
  - Preserve an architectural placeholder for modern Pre-Authorized Debit (PAD via Helcim EFT) as the agency scales.
- **Acceptance Criteria**: Clause 5 reflects e-Transfer; payment option B is cleanly removed; billing schema allows automated EFT enablement.
- **Synthesizes**: Note #9 (`note-1789921450964`), Note #1 query 4, Note #36 query 4.

### [ ] Task 4: Intake Flow Gating: Defer Document Uploads & Enforce Dual Guardian Parity
- **Problem**: Asking prospective parents to upload sensitive documents before a discovery call creates abandonment; guardian fields were inconsistent between stages.
- **Action**:
  - Keep Stage 1 (PAR-0) strictly limited to 1 primary legal guardian contact info.
  - Defer heavy document uploads (OHIP card, Immunization Yellow Card, Parent ID) strictly to Stage 4 (Document Audits) *after* Jonathan conducts the pre-screening call.
  - In Stage 2+ (PAR-1 onwards), enable complete optional secondary guardian fields with identical schema parity across emergency contacts (PAR-2) and billing.
  - Preserve multi-select component for "Type of Child Care Required" on Form PAR-1.
- **Acceptance Criteria**: Parents submit initial inquiry in <2 minutes; document upload cards only unlock post-screening; dual-guardian data is symmetrical across records.
- **Synthesizes**: Notes #7, #16, #26, #56, #57.

### [ ] Task 5: Form PAR-0 Legal Pre-Screening Acknowledgment Banner
- **Problem**: The legal consent banner implied placement matching and cited server geography ("in Montreal, Canada").
- **Action**: Standardize the pre-submission acknowledgment banner above the submit button:
  > *"By submitting this inquiry, I acknowledge that I am initiating an initial pre-screening review with All Child Care Solutions, a licensed Home Child Care Agency operating under the Child Care and Early Years Act, 2014 (CCEYA) and regulated by the Ontario Ministry of Education."*
  - Retain statutory citations for CCEYA 2014, Ontario Ministry of Education, and Canadian PIPEDA/PHIPA data protection standards.
  - Remove server geography text ("in Montreal, Canada").
- **Acceptance Criteria**: Banner renders prominently above submit button as an institutional legal notice; phrasing explicitly reflects a screening-first model.
- **Synthesizes**: Note #14 (`note-1789923227519`).

---

## 🏡 Domain 2: Provider Hub, Attendance & Timesheets (Form PROV-1)

### [ ] Task 6: Child Daily Attendance Check-Out & Authorized Pick-Up Verification
- **Problem**: Licensed Provider Hub currently features 1-tap check-in, but lacks a formal departure/check-out workflow and pick-up safety verification.
- **Action**: Add a complete check-out module to the Licensed Provider Hub:
  - 1-tap real-time check-out timestamp button + manual editable time picker (for busy end-of-day pick-ups).
  - End-of-day automated notification/nudge if a child remains checked in past scheduled departure hours.
  - Pick-up verification dropdown listing authorized adults from Form PAR-1/PAR-2, plus an *"Other (Authorized)"* text input for one-time written authorizations.
  - Automatically calculate net daily hours and populate Form PROV-1 monthly timesheets.
- **Acceptance Criteria**: Providers can check out kids in 1 tap; authorized pickup person is logged; daily hours calculate accurately.
- **Synthesizes**: Note #47 (`note-1790226699342`), Note #39 query 2.

### [ ] Task 7: Subsidized Absence Ledger & "Expected but Absent" Status
- **Problem**: Providers need an attendance designation that counts toward municipal allowable absence quotas (e.g. 30 days in Durham/Toronto) without jeopardizing agency subsidy funding.
- **Action**:
  - Add an *"Expected but Absent"* button to the daily provider attendance roster.
  - Implement an administrative ledger on subsidized child profile cards to track annual allowable sick/absent days and decrement remaining days automatically.
  - Trigger an administrative warning in Jonathan's Command Centre when a child nears or exceeds their annual allotment.
- **Acceptance Criteria**: Providers can log "Expected but Absent"; child's sick balance decrements; Jonathan receives renewal/over-quota alerts.
- **Synthesizes**: Note #6 (`note-1789684328873`).

### [ ] Task 8: Provider Monthly Timesheet (PROV-1) Session & Working Hours Streamlining
- **Problem**: Form PROV-1 splits days into morning and afternoon sessions, adding unnecessary complexity. Providers also need to log their own operational hours.
- **Action**:
  - Consolidate the daily timesheet grid into a single daily session: In, Out, Daily Hours, Total Hours.
  - Provide a dedicated section for licensed providers to log their own operational working hours for agency records and CWELCC grant reconciliation.
  - Ensure 1-click auto-fill from daily check-in logs populates both child and provider sheets.
- **Acceptance Criteria**: Single daily session replaces split table; provider working hours are tracked; auto-fill works with 1 tap.
- **Synthesizes**: Note #15 (`note-1789923738002`).

### [ ] Task 9: Timesheet Role-Based Access, Payout Visibility & Audit Trail
- **Problem**: Providers need visibility into their monthly earnings without having the ability to alter locked statutory rates or tamper with attendance unmonitored.
- **Action**:
  - Rename the timesheet column *"Statutory Daily Rate"* to *"Daily Rate"*.
  - Lock Daily Rate ($35.00/day) as strictly read-only for providers.
  - Allow providers to view their total verified care days and estimated monthly payout.
  - Allow provider manual attendance overrides (for corrections), but log an Admin-only audit trail (timestamp, provider ID, previous value, new value).
  - Standardize confirmation message upon submission: *"Your timesheet has been submitted to the agency for payroll verification."*
- **Acceptance Criteria**: Providers see verified earnings; Daily Rate is immutable; manual adjustments trigger audit trail; receipt copy matches client verbiage.
- **Synthesizes**: Notes #36, #37, #38, #39 query 1.

### [ ] Task 10: CSS Print Media Optimization for Timesheets & Director Binder
- **Problem**: Printing timesheets or intake forms cuts off tables, forces awkward multi-page splits, and prints digital video players and action buttons.
- **Action**: Configure comprehensive `@media print` rules:
  - Form PROV-1 Monthly Timesheet auto-fits onto a single clean 8.5x11 page without requiring manual browser scaling.
  - Suppress digital-only modules (such as the Annual Compliance & CCEYA Training Video) and action buttons during print.
  - Format margins, headers, and footers for clean 3-ring binder filing for Ministry audits.
- **Acceptance Criteria**: Print preview fits onto 1 page cleanly; video/interactive elements are hidden; output matches physical binder standards.
- **Synthesizes**: Note #4 (`note-1789238677681`), Note #17 (`note-1789924038396`).

### [ ] Task 11: Admin-Gated Invoicing & CRA T4A Provider Tax Summaries
- **Problem**: Client requires that invoices and statements are never automatically broadcasted to families or providers without administrative review.
- **Action**:
  - Configure monthly parent fee invoices, parent annual statements, provider timesheet remittance advice, and provider annual earnings statements with an Admin-only distribution gate.
  - Admin/Director manually releases statements via printable PDF or email dispatch.
  - Provider annual earnings statement formats as a CRA-compliant T4A summary.
- **Acceptance Criteria**: Statements cannot auto-send without Admin click; provider annual summary adheres to T4A line requirements.
- **Synthesizes**: Note #27, Note #40 (`note-1790025281432`).

---

## 📋 Domain 3: Home Visitor Field Portal & CCEYA Inspections

### [ ] Task 12: Decouple Quarterly Physical Inspection from Behaviour Guidance Audit
- **Problem**: In the Home Visitor Field Portal, the "Quarterly Inspection" and "Behaviour Audit" buttons opened overlapping forms with identical mixed-age ratio headcount fields.
- **Action**:
  - Differentiate the physical CCEYA s. 26 quarterly premises inspection from the ACCS x CITS pedagogical behaviour guidance observation.
  - Remove ratio headcount inputs from the behaviour audit.
  - Align behaviour audit strictly with the official 10 positive guidance observation checkpoints (e.g. self-regulation support, positive tone, child-initiated inquiry).
- **Acceptance Criteria**: Both buttons launch distinct, dedicated inspection modals; behaviour audit focuses solely on pedagogical guidance.
- **Synthesizes**: Note #58 (`note-quarterly-inspection-diff`).

### [ ] Task 13: 40-Page Ministry Quarterly Checklist (12 Domains) Accordion Wizard
- **Problem**: Client mandates full compliance with the official 40-page Ministry Quarterly Checklist (*"Quarterly Checklist Home Visitor EN v.08 2023-12-11"*), which covers 12 regulatory domains.
- **Action**:
  - Implement the 40-page checklist as a structured multi-step accordion wizard in the Home Visitor Portal.
  - Cover all 12 CCEYA domains: Premises, Safety & Equipment, Health & Medical, Nutrition, Program & Sleep, Ratios & Supervision, Children's Records, Staff & Ordinarily Resident Screening, Emergency Procedures, etc.
  - Support digital dual signatures (RECE Home Visitor + Provider) and automatic action item generation for non-compliant items.
- **Acceptance Criteria**: All 12 domains navigable on field tablets; supports auto-save and dual signatures; syncs to Ministry Audit Binder.
- **Synthesizes**: Note #53 (`note-40page-cceya-checklist`).

### [ ] Task 14: Home Visitor Card UI Sanitization & Header Renaming
- **Problem**: 3D tilt effects and heavy drop shadows look dated and hinder readability on mobile field tablets in high-glare environments.
- **Action**:
  - Remove all 3D transforms, perspective styling, and heavy drop shadows from the Home Visitor Portal.
  - Implement clean, high-contrast, flat card containers with 2px slate borders (`border-2 border-slate-900`).
  - Rename portal header from *"Home Visitor Field Portal"* to *"Home Visitor Portal"*.
- **Acceptance Criteria**: Clean flat neo-brutalist styling; header renamed; optimized for touch tablets.
- **Synthesizes**: Note #2 (`note-1789171754486`), Note #10 query 2.

---

## ⚖️ Domain 4: Compliance Portal & Statutory Form Lifecycle Audit

### [x] Task 15: Centralized Digital Compliance Sign-Off Portal & Provider Compliance Hub • [Completed / Verified]
- **Problem**: Agency lacked a unified digital sign-off hub for recurring mandatory compliance policies. In the Provider Portal, a floating, unintegrated Google Drive video card cluttered the top header without recording digital sign-offs or facilitating document distribution, and printable timesheets used legacy styles and entity toggles.
- **Action**:
  - **Excised Floating Top Banner**: Removed the legacy 'Annual Compliance & CCEYA Training Videos' card from the top of `ProviderPortal.tsx`.
  - **Dedicated Sub-View Navigation**: Added a prominent 4th tab (`[ Annual Compliance & Documents ]`) immediately adjacent to the `31-Day Attendance Sheet (Printable)` tab.
  - **Provider Compliance Hub (`ProviderComplianceHub.tsx`)**:
    - **1. Mandatory Annual Training & Policy Sign-Off (Form PROV-3)**: Implemented 4 core statutory CCEYA video modules (Anaphylaxis & Sabrina's Law s. 39, Safe Sleep s. 33.1, Behaviour Guidance s. 48, Serious Occurrence s. 68), individual review checkboxes, Annual Criminal Offence Declaration under CCEYA s. 59, and legal digital signature execution persisted to client storage.
    - **2. Agency Document & Forms Distribution Shelf**: Centralized distribution shelf where Jonathan distributes official agency forms (PROV-2, PROV-3, EM-1 Emergency Outing Cards), Ministry CWELCC operating memos, and Public Health exclusion directives, featuring 1-click PDF download and digital receipt acknowledgements.
    - **3. Global Agency-Wide CCEYA Training Curriculum Manager**: Integrated a dedicated curriculum management section under Admin **Agency Settings** (`AgencySettingsView.tsx`), allowing Jonathan to set, test, and update video URLs (YouTube, Drive, Vimeo, Loom) for all 4 statutory modules once, which automatically propagate to all providers' Compliance Hub cards with fallback to their individual Drive folder.
  - **Timesheet PDF Master Binder Synchronization**: Standardized both `FORM PROV-1` (31-Day Attendance Sheet) and `FORM PROV-1B` (5-Week Varied Enrolment Timesheet) to inherit the authoritative Master Audit Binder header layout. Excised all client-side agency switch toggles (`Both Marks | ACCS Only | CITS Only`), binding timesheets strictly to the active ACCS logo configured by the admin in the audit binder.
- **Acceptance Criteria**: Any provider can watch modules, sign mandatory annual policies, download distributed agency documents, and print timesheets in the official ACCS Master Binder style without entity toggles; admin manages the 4 module URLs centrally in Agency Settings.
- **Synthesizes**: Note #48 (`note-1790299188114`), Note #39 query 3, Client Directives (Oct 3, 2026).

### [ ] Task 16: Decouple Baseline Pre-Placement Requirements from Annual Renewals
- **Problem**: Form PROV-3 (Annual Policy Declaration) mistakenly included one-time 2-step TB skin test results, which belong strictly to initial onboarding.
- **Action**:
  - Audit form suite to cleanly decouple one-time pre-placement requirements (2-step TB skin test under CCEYA s. 57, initial VSC) from recurring annual compliance forms.
  - Remove TB test fields from Form PROV-3.
  - Ensure TB test and baseline medical clearances reside strictly in Form PROV-0 and the Central Compliance Dossier.
- **Acceptance Criteria**: Form PROV-3 is strictly an annual declaration and policy review; baseline medical tests are captured once upon initial onboarding.
- **Synthesizes**: Note #25, Note #51 (`note-1790301020307`).

### [ ] Task 17: Dedicated Home Visitor Intake Form Series (HV-0 to HV-2)
- **Problem**: Home Visitors currently share provider registration forms, despite having distinct regulatory requirements (RECE license, driving record, field tablet custody).
- **Action**:
  - Implement dedicated Home Visitor form series in Form Builder Studio:
    - **Form HV-0**: Home Visitor Employment Application & Background.
    - **Form HV-1**: Professional Credentials (RECE license verification, SFA/CPR, driver's license, auto insurance) and Field Tablet Hardware Custody agreement for PIPEDA compliance.
    - **Form HV-2**: Annual CCEYA Policy Sign-Off & Offence Declaration.
  - Include placeholders for future Confidentiality Agreement and Mileage Reimbursement Policy.
- **Acceptance Criteria**: HV series is segregated in Form Builder; captures RECE license number and tablet custody sign-off.
- **Synthesizes**: Note #49 (`note-1790299758672`), Note #39 query 4.

### [ ] Task 18: Ingest Remaining Statutory CCEYA Instruments into Form Builder Studio
- **Problem**: Form Builder Studio currently houses 10 primary forms, but lacks statutory incident and health logs required by the Ministry during inspections.
- **Action**:
  - Expand Form Builder Studio to support:
    - Serious Occurrence Report (SOR) Form (24-hour Ministry reporting workflow).
    - Medication Administration Log (dosage, time, child, provider signature).
    - Individualized Anaphylaxis Emergency Plan (EpiPen protocol).
    - Daily Health Check & Child Wellness Log.
- **Acceptance Criteria**: All 4 forms exist in Form Builder with exportable schemas and printable binder layouts.
- **Synthesizes**: Note #5 (`note-1789498044047`), Note #12 (`note-1789922338250`).

---

## 👑 Domain 5: Admin Command Centre & Agency Configuration

### [ ] Task 19: Global Agency Role Branding: Replace "Jonathan" with Institutional Titles
- **Problem**: Personal references to "Jonathan" appear in multiple forms, buttons, and confirmation cards, making the agency look like a sole proprietorship.
- **Action**: Replace all hardcoded references to "Jonathan" with standardized institutional titles:
  - Use **"Agency Director"** for formal approvals, contracts, licensing matters, and executive sign-offs.
  - Use **"Agency Representative"** for pre-screenings, discovery calls, parent consultations, and review milestones.
- **Acceptance Criteria**: Zero instances of "Jonathan" in user-facing views; professional institutional branding across all 3 portals.
- **Synthesizes**: Notes #8, #11 (`note-1789921893781`).

### [ ] Task 20: Dynamic Multi-Tier Rate Engine: CWELCC, Custom Subsidy & Private Tiers
- **Problem**: System previously hardcoded "$0" for subsidized families and lacked flexibility for rate changes across regions and age groups.
- **Action**:
  - Remove cosmetic "$0" label from municipal subsidy records.
  - Add an editable per-family **Municipal Subsidy Daily Co-Pay** field with subsidy voucher expiry date and automated 30-day renewal alert.
  - Provide an Admin input to update the provincial CWELCC daily rate on demand ($22.00 transitioning to $10.00).
  - Replace the flat $35 private fee placeholder with a dynamic, age-tiered private rate schedule (Infant, Toddler, Preschool, Kindergarten).
  - Ensure rate calculations synchronize symmetrically across e-Transfer billing, parent files, monthly invoices, and Form PAR-5 contracts.
- **Acceptance Criteria**: Rates are dynamic and editable per family; voucher expiry generates 30-day renewal alerts; calculations are globally symmetric.
- **Synthesizes**: Note #50 (`note-1790300278012`), Note #55.

### [ ] Task 21: Role-Based Financial & Regulatory Sanitization
- **Problem**: Sensitive financial back-office margins and formal statute citations were visible in areas accessible to parents.
- **Action**:
  - Strictly hide provider guaranteed statutory daily payouts ($35/day), CWELCC government top-up grant formulas, and agency operational spreads from parent-facing views.
  - On parent-facing provider profile cards, display clean *"Capacity: 6 children"* and remove age ratio sub-breakdowns (*"Max 3 under 3yo"*, *"Max 3 under 2yo"*). Full sub-breakdowns remain strictly preserved for Admin and Home Visitors.
  - Restrict formal CCEYA legal section tags (e.g. O. Reg. 137/15 s. 8) to Admin and Home Visitor portals; providers receive clear, plain-language health and safety guidance.
- **Acceptance Criteria**: Parents never see provider payout rates or statutory sub-ratios; administrative back-office margins remain confidential.
- **Synthesizes**: Notes #1, #10, #18, #34, #36.

### [ ] Task 22: Regional Geography Normalization & Roster Tagging
- **Problem**: Dropdown lists of dozens of small towns (Oshawa, Whitby, Ajax, Pickering, Clarington, Markham, etc.) caused confusion and data entry errors.
- **Action**:
  - In Edit Family Record and intake forms, replace granular town dropdowns with top-level regional tiers: **"Durham Region"**, **"York Region"**, and **"Toronto"**.
  - In Admin "By Child" sort view and roster exports, append provider operating region to their name under Assigned Home: e.g. *"Provider Name (Durham Region)"*. For unplaced children, show a clean *"Unassigned"*.
- **Acceptance Criteria**: Dropdowns use the 3 regional tiers; roster table displays region in brackets; print exports match.
- **Synthesizes**: Note #22 (`note-1790020593638`), Note #24 (`note-1790021405031`).

### [ ] Task 23: General Notes in Family Records with Admin-Controlled Home Visitor Access
- **Problem**: Agency needs a place to record operational and family background notes without exposing them to parents, while controlling field staff access.
- **Action**:
  - In the Edit Family Record modal, add a dedicated multiline *"General Notes"* textarea directly beneath Medical Notes.
  - Add an Admin toggle: *"Allow Home Visitor Access"* per family record.
  - When enabled, Home Visitors can view notes and append new entries with automated timestamps and staff initials; existing entries remain read-only to preserve the audit trail. Admin retains full override authority.
- **Acceptance Criteria**: General Notes field is 100% hidden from parents; Home Visitors can only append when permitted by Admin; audit trail is preserved.
- **Synthesizes**: Notes #14, #19, #23 (`note-1790020975452`).

### [ ] Task 24: One-Click Cloud Firestore Database Backup Download for Admin
- **Problem**: Admin needs an effortless way to create an on-demand, local backup of the entire agency Firestore database.
- **Action**:
  - Add a *"Download Full Database Backup"* button inside the Admin Command Centre header.
  - Access is restricted strictly to users with the Admin role.
  - Downloads a timestamped JSON package containing all agency collections (`children`, `providers`, `home_visitors`, `inspections`, `daily_attendance`, `form_templates`, `developer_notes`).
- **Acceptance Criteria**: 1 click generates and downloads the complete database JSON; non-admins have zero access.
- **Synthesizes**: Note #1 (`note-1789169187036`).

### [ ] Task 25: Parameterize Official Agency Telephone & Onboarding Titles
- **Problem**: Phone number and brand title strings are hardcoded in multiple components, making future updates cumbersome.
- **Action**:
  - Centrally parameterize the official agency telephone number (**416-694-7445**) as a voice-only line. Display clear notices across contact cards and notification footers stating the line is voice-only (do not send SMS).
  - Standardize navigation onboarding buttons to *"Provider Application"* and *"Home Visitor Application"* (preserving *"Parent Intake"*).
  - Parameterize application display titles ("ACCS Hub" / "Home Care Hub") in a single configuration file for an effortless global update once Jonathan finalizes agency branding.
- **Acceptance Criteria**: Phone number and branding strings are imported from a single constants file; voice-only copy is clear.
- **Synthesizes**: Notes #20, #21, #43, #44.

---

## ⚡ Domain 6: Platform, Field PWA & Local AI Features

### [ ] Task 26: Configure Offline PWA Tablet Manifest & Background Service Worker Sync
- **Problem**: Home Visitors conducting unannounced inspections in basement apartments or rural Durham/York areas often encounter dead zones with zero cell service.
- **Action**:
  - Configure Progressive Web App (PWA) manifest and Service Worker caching for standalone tablet display (zero browser chrome).
  - Implement IndexedDB local caching for CCEYA inspection checklists and daily attendance rosters.
  - Enable automatic background synchronization that queues field inspection records and pushes to Cloud Firestore as soon as connectivity resumes.
- **Acceptance Criteria**: Home Visitors can fill out inspection checklists completely offline; data auto-syncs when online without data loss.
- **Synthesizes**: Note #3 (`note-1789172183012`), Note #46 (`note-1790039610309`).

### [ ] Task 27: AI Assistant Dockable, Draggable & Minimizable Window
- **Problem**: The fixed AI assistant drawer covers child profile cards, form schemas, and roster tables during active review.
- **Action**:
  - Refactor `AccsAiAssistant.tsx` into a dockable, draggable, and minimizable floating window.
  - Include a 1-click minimize button that collapses the assistant into a subtle floating pill in the bottom corner.
  - Allow users to drag the window across the screen or snap it to the right sidebar so it never obstructs underlying table data.
- **Acceptance Criteria**: Assistant can be dragged, minimized to a corner pill, or docked; state persists across navigation tabs.
- **Synthesizes**: Note #28 (`note-1790022109552`).

### [ ] Task 28: Admin AI Model Management Console & Canadian PIPEDA Data Governance
- **Problem**: Agency needs control over which AI models handle sensitive child care operations, ensuring compliance with Canadian data residency.
- **Action**:
  - Build an administrative AI model management console in Jonathan's Command Centre.
  - Enable modular tool routing: assign lightweight models (e.g. Gemma 4 E4B / Kev) to fast parent intake triage, and high-reasoning models (e.g. Qwen 2.5 7B / Claude) to CCEYA regulatory audits.
  - Enforce Canadian PIPEDA/PHIPA pre-flight verification: automatic client-side PII masking (redacting OHIP health numbers) before prompts leave the browser.
- **Acceptance Criteria**: Admin can toggle models per tool; OHIP numbers are automatically masked; model management is restricted to Director/Developer.
- **Synthesizes**: Notes #39, #52, #54.

### [ ] Task 29: Dynamic Form Schema Versioning & 1-Click Rollback in Form Builder
- **Problem**: When editing form fields in Form Builder Studio or via conversational AI commands, operators need an immediate way to undo mistakes.
- **Action**:
  - Implement a visual version history and 1-click rollback engine in `FormBuilderStudio.tsx`.
  - Save schema snapshots before any mutation is applied.
  - Provide an "Undo Last Change" button with a visual diff preview showing modified or deleted fields before approving restoration.
- **Acceptance Criteria**: Operators can revert any form mutation with 1 click; diff preview clearly highlights restored fields.
- **Synthesizes**: Note #55 (`note-form-schema-undo`).

---

## 🎯 Verification Matrix: 100% Coverage of All 58 Curated Notes

| Note ID | Original Curated Title | Cleaned Actionable Task |
| :--- | :--- | :--- |
| `note-1789169187036` | Add One-Click Cloud Firestore Database Download for Admin | **Task 24** (Admin Database Download) & **Task 21** (Sanitize Payout) |
| `note-1789171754486` | Implement Home Visitor Hub: Remove 3D Card Effects & Phantom Styling | **Task 14** (Home Visitor Flat Card UI) |
| `note-1789172183012` | Implement Talk about locally running app | **Task 26** (PWA Offline Tablet Sync) |
| `note-1789238677681` | Implement Polish PDF Print Styles for Agency Director Binder | **Task 10** (CSS Print Media Optimization) |
| `note-1789498044047` | Implement Make note to add rest of forms to the form builder | **Task 18** (Expand Form Builder to Statutory Forms) |
| `note-1789684328873` | Implement Are we live chat? | **Task 7** (Subsidized Absence Ledger & Sick Days) |
| `note-1789918675826` | Implement The dedicated parent registration link (magic link) | **Task 4** (Intake Flow Gating & Deferring Docs) |
| `note-1789919212374` | Implement Global Agency Role Branding: Replace 'Jonathan' with... | **Task 19** (Global Role Branding: Replace Jonathan) |
| `note-1789921450964` | Implement Fee Collection Streamlining: Remove Cheque Option &... | **Task 3** (Remove Cheques & Cash; Interac/PAD Rails) |
| `note-1789921700370` | Configure Parent-Facing Capacity Display: Remove Ratio Sub-Breakdowns | **Task 21** (Hide Sub-Ratios from Parents) & **Task 14** (Rename HV Portal) |
| `note-1789921893781` | Remove the Jonathan throughout the app and replace it with Agency | **Task 19** (Consolidated with Task 19) |
| `note-1789922338250` | Implement Audit and Complete Statutory Parent Intake Suite (PAR-0 to... | **Task 4** & **Task 18** (Parent & Agency Form Audit) |
| `note-1789922984005` | Implement Universal Multi-Tier Notepad & HDLH Pedagogical AI | **Task 23** (General Notes in Family Records) |
| `note-1789923227519` | Implement 1. yes absolutely and strict! The director makes private... | **Task 5** (PAR-0 Legal Pre-Screening Banner) & **Task 23** (General Notes) |
| `note-1789923738002` | Configure Provider Monthly Attendance: Single Session & Provider... | **Task 8** (Provider Timesheet Single Session & Hours) |
| `note-1789923858869` | Implement Oh woops i missed there is already a button for autofill | **Task 4** (Deferred Docs) & **Task 15** (Compliance Portal) |
| `note-1789924038396` | Implement For printing these time sheet documents; are you able to... | **Task 10** (Timesheet Print CSS Auto-Fit) |
| `note-1790019927836` | Configure Role-Based UI Sanitization: Regulatory Markings Restricted | **Task 21** (Role-Based Regulatory & Financial Sanitization) |
| `note-1790019999612` | Implement 1. yes 2. have yet to decide or see what that looks like | **Task 11** (Admin T4A Invoicing) & **Task 23** (General Notes) |
| `note-1790020125687` | Implement I may rename ACCS Hub / Home Care Hub and will follow up | **Task 25** (Application Title Parameterization) |
| `note-1790020191457` | Standardize Onboarding Terminology: Provider & Home Visitor | **Task 25** (Standardize Onboarding Button Titles) |
| `note-1790020593638` | Implement Under edit family record please Use the broader options | **Task 22** (Regional Geography Tiers) |
| `note-1790020975452` | Implement Dedicated General Notes in Edit Family Record with Granular | **Task 23** (General Notes Field with HV Access Toggle) |
| `note-1790021405031` | Display Provider Region in 'By Child' Sort View & Roster Exports | **Task 22** (Provider Region on Roster Displays) |
| `note-1790021656517` | Implement 1. sure if there is space to do so and it doesn't look | **Task 22** (Roster Region) & **Task 16** (Excise TB from PROV-3) |
| `note-1790021911404` | Implement Dual Guardian Architecture: Stage 1 Intake vs Formal | **Task 4** (Dual Guardian Parity in Stage 2+) |
| `note-1790021994836` | Implement 2. one or if two is available the better but one is still | **Task 11** (Admin-Gated Invoicing & Statements) |
| `note-1790022109552` | Implement Did i ask to add a note to have this chat window be a pop | **Task 27** (Draggable / Minimizable AI Assistant) |
| `note-1790022348362` | Implement In the small group care box in the parent initial intake | **Task 2** (PAR-0 Small Group Care Copy) |
| `note-1790022808609` | Implement CWELCC Card Copy: Remove Monthly Estimate & Direct Subsidy | **Task 2** (PAR-0 CWELCC $22 Card Copy) |
| `note-1790023355751` | Implement Form PAR-0 Subtitle Copy: Zero Fees & Discovery Call Wording | **Task 2** (PAR-0 Subtitle Copy: Zero Fees) |
| `note-1790023854877` | Implement Under Application Successfully submitted Please rename it | **Task 2** (PAR-0 Post-Submission Success Banner) |
| `note-1790024000218` | Implement Form PAR-0: 'What Happens Next' 3-Step Sequence & Screening | **Task 2** (PAR-0 'What Happens Next' 3 Steps) |
| `note-1790024159792` | Implement Oh wait in regards to 1. I see it displayed on the next | **Task 21** (Role Visibility Safeguards) |
| `note-1790024217601` | Implement Replace the long paragraph beginning with Ontario CCEYA | **Task 2** (PAR-0 'Getting Started' Heading & Text) |
| `note-1790024408799` | Streamline Timesheet Terminology: Change 'Statutory Daily Rate' to... | **Task 9** (Rename to 'Daily Rate') & **Task 3** (e-Transfer) |
| `note-1790024576406` | Implement Timesheet Role-Based Access, Payout Visibility & Audit Trail | **Task 9** (Timesheet Permissions, Lock $35, Audit Log) |
| `note-1790024995173` | Implement Timesheet Submission Copy, Confirmation Receipt & Automated... | **Task 9** (Timesheet Submission Prompt & Receipt Copy) |
| `note-1790025123554` | Implement 1. yes! I love the your phrase "Your timesheet has been... | **Task 6**, **Task 9**, **Task 15**, **Task 17**, **Task 28** |
| `note-1790025281432` | Implement Monthly & Annual Invoicing with Admin-Only Distribution &... | **Task 11** (Admin-Gated Invoicing & T4A Summaries) |
| `note-1790025572456` | Implement Thats fine It was just an email i sent him with the list of | Consolidated into master backlog context |
| `note-1790025828704` | Implement In the Path to Licensed care please rename "provider match" | **Task 2** (Milestone: "Meet Your Caregiver") |
| `note-1790026026295` | Implement Agency Telephone (416-694-7445): Voice-Only Line &... | **Task 25** (Agency Phone 416-694-7445 Voice-Only) |
| `note-1790026089984` | Implement 2. yea this is a voice only line; I will get a second line | **Task 25** (Consolidated with Task 25) |
| `note-1790026268357` | Implement OH please note that section 3 for par-0 form "schedule... | **Task 1** (Fix PAR-0 Section 3 Schedule Bug) |
| `note-1790039610309` | Implement PWA Capabilities, Standalone Tablet Display & Push | **Task 26** (PWA Tablet Manifest & Offline Sync) |
| `note-1790226699342` | Implement Child Attendance Check-Out, Authorized Pick-Up & Departure | **Task 6** (Daily Check-Out & Authorized Pick-Up) |
| `note-1790299188114` | Implement Compliance Portal & Digital Document Sign-Off Hub | **Task 15** (Centralized Compliance Sign-Off Portal) |
| `note-1790299758672` | Implement Home Visitor Dedicated HV Form Series (HV-0 to HV-2) &... | **Task 17** (Dedicated Home Visitor HV Form Series) |
| `note-1790300278012` | Implement Dynamic Multi-Tier Rate Engine: CWELCC, Custom Subsidy... | **Task 20** (Dynamic Rates & Subsidy Co-Pay Engine) |
| `note-1790301020307` | Implement Statutory Form Suite Audit: Decouple Baseline Pre-Placement | **Task 16** (Decouple TB Test from Annual Renewals) |
| `note-1790607006825` | Dynamic AI Model Management & One-Click LLM Upgrade Hub | **Task 28** (Admin AI Model Management Console) |
| `note-40page-cceya-checklist` | Implement 40-Page Ministry Quarterly Checklist (12 Domains) | **Task 13** (40-Page Ministry Checklist Wizard) |
| `note-ai-children-data-governance` | Review AI Child Data Governance, PII Masking & Privacy Policies | **Task 28** (PIPEDA / PHIPA Data Privacy Guardrails) |
| `note-form-schema-undo` | Enable Conversational Form Rollback & Version Control | **Task 29** (Form Builder Versioning & 1-Click Rollback) |
| `note-par1-multiselect-care-type` | Implement Form PAR-1: Multi-Select Care Type Selection | **Task 4** (Completed & Verified) |
| `note-parent-registration-flow` | Streamline Parent Intake & Registration Flow Gating | **Task 4** (Completed & Verified) |
| `note-quarterly-inspection-diff` | Separate Quarterly Inspection from Behaviour Guidance Audit | **Task 12** (Decouple Inspection from Behaviour Audit) |
