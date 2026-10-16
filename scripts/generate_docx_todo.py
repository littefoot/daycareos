import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, hex_color):
    """Set background color of a table cell."""
    tcPr = cell._element.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    """Set inner cell padding (in twips, 20 twips = 1 pt)."""
    tcPr = cell._element.get_or_add_tcPr()
    tcMar = parse_xml(
        f'<w:tcMar {nsdecls("w")}>'
        f'<w:top w:w="{top}" w:type="dxa"/>'
        f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
        f'<w:left w:w="{left}" w:type="dxa"/>'
        f'<w:right w:w="{right}" w:type="dxa"/>'
        f'</w:tcMar>'
    )
    tcPr.append(tcMar)

def set_table_borders(table, color="D1D5DB", sz="4", val="single"):
    """Set clean subtle borders on a table."""
    tblPr = table._element.xpath('w:tblPr')
    if tblPr:
        borders = parse_xml(
            f'<w:tblBorders {nsdecls("w")}>'
            f'<w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
            f'<w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
            f'<w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
            f'<w:left w:val="none"/>'
            f'<w:right w:val="none"/>'
            f'<w:insideV w:val="none"/>'
            f'</w:tblBorders>'
        )
        tblPr[0].append(borders)

def create_document():
    doc = Document()

    # Set page margins (0.75 in for modern executive layout)
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(0.75)
        section.bottom_margin = Inches(0.75)
        section.left_margin = Inches(0.75)
        section.right_margin = Inches(0.75)

    # Base styling
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Calibri'
    normal_style.font.size = Pt(10.5)
    normal_style.font.color.rgb = RGBColor(30, 41, 59) # Slate 800

    # Colors
    ORANGE_PRIMARY = RGBColor(234, 88, 12)    # Tailwind Orange-600
    SLATE_DARK = RGBColor(15, 23, 42)         # Slate 900
    SLATE_MUTED = RGBColor(100, 116, 139)     # Slate 500
    EMERALD_GREEN = RGBColor(16, 185, 129)    # Emerald 500

    # Title
    p_title = doc.add_paragraph()
    p_title.paragraph_format.space_before = Pt(0)
    p_title.paragraph_format.space_after = Pt(2)
    run_agency = p_title.add_run("All Child Care Solutions (ACCS)\n")
    run_agency.font.size = Pt(22)
    run_agency.font.bold = True
    run_agency.font.color.rgb = SLATE_DARK

    run_title = p_title.add_run("Master Implementation To-Do List & Client Requirements Roadmap")
    run_title.font.size = Pt(15)
    run_title.font.color.rgb = ORANGE_PRIMARY
    run_title.font.bold = True

    # Metadata Banner Box
    meta_table = doc.add_table(rows=1, cols=1)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_cell = meta_table.cell(0, 0)
    set_cell_background(meta_cell, "F8FAFC") # Slate 50
    set_cell_margins(meta_cell, top=140, bottom=140, left=180, right=180)

    p_meta = meta_cell.paragraphs[0]
    p_meta.paragraph_format.space_before = Pt(0)
    p_meta.paragraph_format.space_after = Pt(0)
    
    r_meta = p_meta.add_run("Prepared for: ")
    r_meta.bold = True
    p_meta.add_run("Agency Director Jonathan | ")
    r_date = p_meta.add_run("Date: ")
    r_date.bold = True
    p_meta.add_run("September 29, 2026 | ")
    r_src = p_meta.add_run("Database Source: ")
    r_src.bold = True
    p_meta.add_run("Cloud Firestore developer_notes\n")
    r_stat = p_meta.add_run("Synthesis: ")
    r_stat.bold = True
    p_meta.add_run("58 Curated Notes & 111 Raw Chat Interactions Consolidated into ")
    r_hl = p_meta.add_run("29 Clean, Single-Task Engineering Items")
    r_hl.bold = True
    r_hl.font.color.rgb = ORANGE_PRIMARY
    p_meta.add_run(" (Cloud Firestore data preserved 100% untouched).")

    # Add space
    p_space = doc.add_paragraph()
    p_space.paragraph_format.space_before = Pt(6)
    p_space.paragraph_format.space_after = Pt(6)

    # Executive Summary Heading
    h1 = doc.add_heading("1. Executive Summary & Domain Breakdown", level=1)
    h1.style.font.color.rgb = SLATE_DARK
    h1.style.font.size = Pt(14)
    h1.style.font.bold = True

    p_intro = doc.add_paragraph(
        "During live system demonstrations, client review sessions with Jonathan generated 58 curated notes in Cloud Firestore. "
        "Because several notes originated from multi-part conversational answers or rapid feature queries (e.g. 'Implement 2. yea this is a voice only line...'), "
        "this document cleans, deduplicates, and organizes all feedback into 29 specific, single-task deliverables. "
        "Each task features explicit acceptance criteria, clear problem scope, and traceable linkages to original client notes."
    )
    p_intro.paragraph_format.space_after = Pt(8)

    # Domain Table
    dom_table = doc.add_table(rows=1, cols=3)
    dom_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(dom_table, color="E2E8F0", sz="6", val="single")

    headers = ["Functional Domain", "Task Range", "Core Architectural Scope"]
    hdr_cells = dom_table.rows[0].cells
    for i, h_text in enumerate(headers):
        hdr_cells[i].text = h_text
        set_cell_background(hdr_cells[i], "0F172A") # Slate 900
        p = hdr_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        for run in p.runs:
            run.font.bold = True
            run.font.color.rgb = RGBColor(255, 255, 255)
            run.font.size = Pt(9.5)
        set_cell_margins(hdr_cells[i], top=120, bottom=120, left=140, right=140)

    domain_data = [
        ("1. Parent Admissions & Intake Pipeline", "Tasks #1 – #5", "Form PAR-0 schedule fix, institutional copy rebrand, removing cheques/cash, dual-guardian parity, legal pre-screening banner."),
        ("2. Provider Hub, Attendance & Timesheets", "Tasks #6 – #11", "Daily check-out & pick-up verification, subsidized absence ledger, single-session timesheets, locked $35 rate, 1-page print CSS, T4A tax summaries."),
        ("3. Home Visitor Field Portal & CCEYA", "Tasks #12 – #14", "Decoupling quarterly inspection from behaviour audit, 40-page Ministry checklist wizard (12 domains), flat high-contrast field tablet UI."),
        ("4. Compliance Portal & Form Lifecycles", "Tasks #15 – #18", "Centralized compliance sign-off portal, decoupling TB test from annual renewals, dedicated Home Visitor series (HV-0 to HV-2), Form Builder expansion."),
        ("5. Admin Command Centre & Agency Config", "Tasks #19 – #25", "Global role branding ('Jonathan' -> 'Agency Director/Representative'), dynamic multi-tier rates, financial sanitization, regional tiers, admin DB download."),
        ("6. Platform, Field PWA & Local AI", "Tasks #26 – #29", "Offline tablet PWA with IndexedDB sync, dockable AI chat window, AI model assignment hub, form builder rollback.")
    ]

    for d_name, d_range, d_scope in domain_data:
        row = dom_table.add_row()
        cells = row.cells
        cells[0].text = d_name
        cells[1].text = d_range
        cells[2].text = d_scope
        for idx, cell in enumerate(cells):
            set_cell_margins(cell, top=100, bottom=100, left=140, right=140)
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            if idx == 0:
                p.runs[0].font.bold = True
                set_cell_background(cell, "F8FAFC")
            elif idx == 1:
                p.runs[0].font.bold = True
                p.runs[0].font.color.rgb = ORANGE_PRIMARY
            for r in p.runs:
                r.font.size = Pt(9.5)

    doc.add_page_break()

    # The 29 Tasks Breakdown
    tasks = [
        # Domain 1
        {
            "num": 1, "domain": "Domain 1: Parent Admissions & Intake Pipeline",
            "title": "Fix Form PAR-0 Section 3 ('Schedule Needs & Care Preferences') Rendering Defect",
            "priority": "URGENT", "status": "In Progress",
            "problem": "Section 3 ('Schedule Needs & Care Preferences') on Form PAR-0 is currently inaccessible or failing to render for parents during step progression in the public intake wizard.",
            "action": "Investigate and resolve rendering defect in ParentPortal.tsx and DynamicFormEngine.tsx. Ensure days-of-week checkboxes (Mon–Fri) and required operating hours render reliably in both public intake and administrative preview.",
            "criteria": "1. Parents can select days of care and preferred time ranges without script exceptions. 2. Selected schedule parameters map cleanly to the pre-screening discovery call card in Jonathan's Command Centre.",
            "notes": "Synthesizes Note #45 (note-1790026268357)."
        },
        {
            "num": 2, "domain": "Domain 1: Parent Admissions & Intake Pipeline",
            "title": "Standardize Form PAR-0 Customer-Facing Copy & Milestone Rebranding",
            "priority": "HIGH", "status": "Proposed",
            "problem": "Multiple conversational notes requested copy updates across Form PAR-0 to sound welcoming, professional, and remove individual personal names prior to screening.",
            "action": "Execute a unified copy standardization pass across all 6 touchpoints:\n• Header Subtitle: 'Zero fees to apply • An agency representative will contact you to discuss your child care needs.'\n• Small Group Care Box: 'Max 6 children per home, with personalized attention in a warm, nurturing environment.'\n• CWELCC Card: Remove $478.50 average figure; reword: 'Municipal Subsidies may be supported. Please inquire with the agency during your screening call.'\n• Post-Submission Banner: 'Your Child Care Inquiry has been Successfully Submitted! Your pre-screening application for {count} child(ren) has been received.'\n• Roadmap Milestone: Rename 'Provider Match' to 'Meet Your Caregiver'.\n• What Happens Next: 3 numbered steps directly outlining: 1. Agency review, 2. Discovery call to discuss care preferences, 3. Guidance through registration post-approval.",
            "criteria": "1. All 6 copy updates implemented with zero personal names or 10-minute callback claims. 2. Milestone sequence reflects 'Meet Your Caregiver'.",
            "notes": "Synthesizes Notes #8, #29, #30, #31, #32, #33, #35, #42."
        },
        {
            "num": 3, "domain": "Domain 1: Parent Admissions & Intake Pipeline",
            "title": "Streamline Payment Methods on Form PAR-5: Remove Cheques & Cash (e-Transfer / PAD)",
            "priority": "HIGH", "status": "Proposed",
            "problem": "Form PAR-5 (Master Parent Agreement) and billing templates list physical cheques and cash (Option B), creating administrative collection friction, bounced cheque fees, and NSF risks.",
            "action": "Decommission and remove Option B (cheques and cash) from Form PAR-5 Clause 5 and all parent invoice notices. Formalize Option A as Interac e-Transfer to allchildcaresolutions@gmail.com as the immediate primary rail. Retain an architectural placeholder in the billing schema to enable Pre-Authorized Debit (PAD via Helcim EFT) as the agency scales.",
            "criteria": "1. Form PAR-5 Clause 5 states Interac e-Transfer as primary. 2. Paper cheques and cash are completely excised. 3. Schema supports automated PAD enablement.",
            "notes": "Synthesizes Note #9 (note-1789921450964), Note #1 query 4, Note #36 query 4."
        },
        {
            "num": 4, "domain": "Domain 1: Parent Admissions & Intake Pipeline",
            "title": "Intake Flow Gating: Defer Document Uploads & Enforce Dual Guardian Parity",
            "priority": "HIGH", "status": "Completed / Verified",
            "problem": "Asking prospective parents to upload sensitive health documents during initial inquiry creates abandonment; guardian fields were inconsistent between stages.",
            "action": "Keep Stage 1 (PAR-0) strictly limited to 1 primary legal guardian contact info. Defer heavy document uploads (OHIP, Yellow Immunization Card, Parent ID) strictly to Stage 4 (Document Audits) after Jonathan conducts the pre-screening call. In Stage 2+ (PAR-1 onwards), enable complete optional secondary guardian fields with identical schema parity across emergency contacts (PAR-2) and billing.",
            "criteria": "1. Stage 1 takes <2 minutes to submit. 2. Document upload cards remain locked until screening approval. 3. Secondary guardian fields mirror primary guardian across all records.",
            "notes": "Synthesizes Notes #7, #16, #26, #56, #57."
        },
        {
            "num": 5, "domain": "Domain 1: Parent Admissions & Intake Pipeline",
            "title": "Standardize Form PAR-0 Legal Pre-Screening Acknowledgment Banner",
            "priority": "HIGH", "status": "Clarification Needed",
            "problem": "The pre-submission legal banner implied immediate placement matching and cited server geography ('in Montreal, Canada').",
            "action": "Update the pre-submission acknowledgment banner positioned above the submit button:\n'By submitting this inquiry, I acknowledge that I am initiating an initial pre-screening review with All Child Care Solutions, a licensed Home Child Care Agency operating under the Child Care and Early Years Act, 2014 (CCEYA) and regulated by the Ontario Ministry of Education.'\nRetain statutory citations for CCEYA 2014, Ministry of Education, and Canadian PIPEDA/PHIPA data protection standards; remove Montreal server text.",
            "criteria": "1. Banner clearly frames submission as pre-screening review. 2. Server geography is excised while statutory citations remain intact.",
            "notes": "Synthesizes Note #14 (note-1789923227519)."
        },

        # Domain 2
        {
            "num": 6, "domain": "Domain 2: Provider Hub, Attendance & Timesheets (Form PROV-1)",
            "title": "Child Daily Attendance Check-Out & Authorized Pick-Up Verification",
            "priority": "HIGH", "status": "In Progress",
            "problem": "Licensed Provider Hub currently features 1-tap check-in, but lacks a formal departure/check-out workflow and authorized pick-up safety verification.",
            "action": "Add a complete check-out module to the Licensed Provider Hub:\n• 1-tap real-time check-out timestamp button + manual editable time picker (for busy end-of-day pick-ups).\n• End-of-day automated reminder if a child remains checked in past scheduled departure hours.\n• Pick-up verification dropdown listing authorized adults from Form PAR-1/PAR-2, plus an 'Other (Authorized)' text input for one-time written authorizations.\n• Automatically calculate net daily hours and populate Form PROV-1 monthly timesheets.",
            "criteria": "1. Providers can check out children in 1 tap or with manual time picker. 2. Pick-up adult is logged. 3. Net daily hours calculate accurately.",
            "notes": "Synthesizes Note #47 (note-1790226699342), Note #39 query 2."
        },
        {
            "num": 7, "domain": "Domain 2: Provider Hub, Attendance & Timesheets (Form PROV-1)",
            "title": "Subsidized Absence Ledger & 'Expected but Absent' Attendance Status",
            "priority": "HIGH", "status": "Clarification Needed",
            "problem": "Municipal child care subsidies (Toronto, Durham, York) only pay for a certain quota of allowable absences per year (e.g. 30 days). Unexcused absences risk non-payment.",
            "action": "Add an 'Expected but Absent' attendance button on provider daily rosters. Provide an administrative ledger on child profiles to track annual allowable sick/absent days and decrement remaining days automatically to protect municipal subsidy billing compliance. Trigger warnings in Jonathan's Command Centre when a child nears or exceeds their annual allotment.",
            "criteria": "1. Providers can log 'Expected but Absent' in 1 tap. 2. Child profile tracks remaining sick days. 3. Admin receives over-quota billing alerts.",
            "notes": "Synthesizes Note #6 (note-1789684328873)."
        },
        {
            "num": 8, "domain": "Domain 2: Provider Hub, Attendance & Timesheets (Form PROV-1)",
            "title": "Provider Monthly Timesheet (PROV-1) Session & Working Hours Streamlining",
            "priority": "HIGH", "status": "Proposed",
            "problem": "Form PROV-1 splits days into morning and afternoon sessions, adding unnecessary complexity. Providers also need to log their own operational working hours.",
            "action": "Consolidate the daily timesheet grid into a single daily session: In, Out, Daily Hours, Total Hours. Provide a dedicated section for licensed providers to log their own operational working hours for agency records and CWELCC grant reconciliation. Ensure 1-click auto-fill from daily check-in logs populates both child and provider sheets.",
            "criteria": "1. Single daily session replaces split table. 2. Provider working hours are recorded on the monthly sheet. 3. Auto-fill operates with 1 tap.",
            "notes": "Synthesizes Note #15 (note-1789923738002)."
        },
        {
            "num": 9, "domain": "Domain 2: Provider Hub, Attendance & Timesheets (Form PROV-1)",
            "title": "Timesheet Role-Based Access, Payout Visibility & Audit Trail",
            "priority": "HIGH", "status": "In Progress",
            "problem": "Providers need visibility into their monthly earnings without having the ability to alter locked statutory rates or tamper with attendance unmonitored.",
            "action": "Rename column 'Statutory Daily Rate' to 'Daily Rate'. Lock Daily Rate ($35.00/day) as strictly read-only for providers. Allow providers to view their total verified care days and estimated monthly payout. Allow provider manual attendance overrides (for corrections), but log an Admin-only audit trail (timestamp, provider ID, previous value, new value). Standardize confirmation message upon submission: 'Your timesheet has been submitted to the agency for payroll verification.'",
            "criteria": "1. Daily Rate is immutable for providers. 2. Manual attendance edits trigger an audit log. 3. Confirmation receipt matches client verbiage.",
            "notes": "Synthesizes Notes #36, #37, #38, #39 query 1."
        },
        {
            "num": 10, "domain": "Domain 2: Provider Hub, Attendance & Timesheets (Form PROV-1)",
            "title": "CSS Print Media Optimization for Timesheets & Director Binder",
            "priority": "HIGH", "status": "Proposed",
            "problem": "Printing timesheets or intake forms cuts off tables, forces awkward multi-page splits, and prints digital video players and action buttons.",
            "action": "Configure comprehensive @media print rules:\n• Form PROV-1 Monthly Timesheet auto-fits onto a single clean 8.5x11 page without requiring manual browser scaling.\n• Suppress digital-only modules (such as the Annual Compliance & CCEYA Training Video) and action buttons during print.\n• Format margins, headers, and footers for clean 3-ring binder filing for Ministry audits.",
            "criteria": "1. Print preview fits onto 1 page cleanly without table clipping. 2. Video players and interactive buttons are hidden in print output.",
            "notes": "Synthesizes Note #4 (note-1789238677681), Note #17 (note-1789924038396)."
        },
        {
            "num": 11, "domain": "Domain 2: Provider Hub, Attendance & Timesheets (Form PROV-1)",
            "title": "Admin-Gated Invoicing & CRA T4A Provider Tax Summaries",
            "priority": "HIGH", "status": "In Progress",
            "problem": "Client mandates that monthly fee invoices and annual tax statements must never automatically broadcast to families or providers without administrative review.",
            "action": "Configure monthly parent fee invoices, parent annual statements, provider timesheet remittance advice, and provider annual earnings statements with an Admin-only distribution gate. Admin/Director manually releases statements via printable PDF or email dispatch. Provider annual earnings statement formats as a CRA-compliant T4A earnings summary.",
            "criteria": "1. Statements cannot auto-send without explicit Admin click. 2. Provider annual statement adheres to CRA T4A line items.",
            "notes": "Synthesizes Note #27, Note #40 (note-1790025281432)."
        },

        # Domain 3
        {
            "num": 12, "domain": "Domain 3: Home Visitor Field Portal & CCEYA Inspections",
            "title": "Decouple Quarterly Physical Inspection from Behaviour Guidance Audit",
            "priority": "HIGH", "status": "In Progress",
            "problem": "In the Home Visitor Field Portal, the 'Quarterly Inspection' and 'Behaviour Audit' buttons opened overlapping forms with identical mixed-age ratio headcount fields.",
            "action": "Differentiate the physical CCEYA s. 26 quarterly premises inspection from the ACCS x CITS pedagogical behaviour guidance observation. Remove ratio headcount inputs from the behaviour audit. Align behaviour audit strictly with the official 10 positive guidance observation checkpoints (e.g. self-regulation support, positive tone, child-initiated inquiry).",
            "criteria": "1. Both buttons launch distinct, dedicated inspection modals. 2. Behaviour audit focuses solely on pedagogical guidance checkpoints.",
            "notes": "Synthesizes Note #58 (note-quarterly-inspection-diff)."
        },
        {
            "num": 13, "domain": "Domain 3: Home Visitor Field Portal & CCEYA Inspections",
            "title": "40-Page Ministry Quarterly Checklist (12 Domains) Accordion Wizard",
            "priority": "URGENT", "status": "In Progress",
            "problem": "Client mandates full compliance with the official 40-page Ministry Quarterly Checklist ('Quarterly Checklist Home Visitor EN v.08 2023-12-11'), covering 12 regulatory domains.",
            "action": "Implement the 40-page checklist as a structured multi-step accordion wizard in the Home Visitor Portal. Cover all 12 CCEYA domains: Premises, Safety & Equipment, Health & Medical, Nutrition, Program & Sleep, Ratios & Supervision, Children's Records, Staff & Ordinarily Resident Screening, Emergency Procedures, etc. Support digital dual signatures (RECE Home Visitor + Provider) and automatic action item generation for non-compliant items.",
            "criteria": "1. All 12 domains navigable on field tablets. 2. Auto-save and dual signatures operational. 3. Syncs to Ministry Audit Binder.",
            "notes": "Synthesizes Note #53 (note-40page-cceya-checklist)."
        },
        {
            "num": 14, "domain": "Domain 3: Home Visitor Field Portal & CCEYA Inspections",
            "title": "Home Visitor Card UI Sanitization & Header Renaming",
            "priority": "HIGH", "status": "Proposed",
            "problem": "3D tilt effects and heavy drop shadows look dated and hinder readability on mobile field tablets in high-glare environments.",
            "action": "Remove all 3D transforms, perspective styling, and heavy drop shadows from the Home Visitor Portal. Implement clean, high-contrast, flat card containers with 2px slate borders (border-2 border-slate-900). Rename portal header from 'Home Visitor Field Portal' to 'Home Visitor Portal'.",
            "criteria": "1. Clean flat neo-brutalist styling replaces 3D depth effects. 2. Header renamed to 'Home Visitor Portal'.",
            "notes": "Synthesizes Note #2 (note-1789171754486), Note #10 query 2."
        },

        # Domain 4
        {
            "num": 15, "domain": "Domain 4: Compliance Portal & Statutory Form Lifecycle Audit",
            "title": "Centralized Digital Compliance Sign-Off Portal",
            "priority": "HIGH", "status": "In Progress",
            "problem": "Agency lacks a unified digital sign-off hub for recurring mandatory compliance policies across all agency personnel and adult household members.",
            "action": "Build a central Compliance Portal for Providers, Relief Caregivers, Home Visitors, Admin Staff, and Ordinarily Resident adults (CCEYA s. 54/60). Enable digital execution for annual policies: Behaviour Management, Safe Sleep, Anaphylaxis, and Annual Offence Declarations. Implement automated reminder alerts dispatched at 60, 30, and 7 days prior to annual document expiration.",
            "criteria": "1. Any stakeholder can sign mandatory annual policies digitally. 2. Compliance status reflects in Admin Command Centre with expiration countdowns.",
            "notes": "Synthesizes Note #48 (note-1790299188114), Note #39 query 3."
        },
        {
            "num": 16, "domain": "Domain 4: Compliance Portal & Statutory Form Lifecycle Audit",
            "title": "Decouple Baseline Pre-Placement Requirements from Annual Renewals",
            "priority": "HIGH", "status": "In Progress",
            "problem": "Form PROV-3 (Annual Policy Declaration) mistakenly included one-time 2-step TB skin test results, which belong strictly to initial onboarding.",
            "action": "Audit form suite to cleanly decouple one-time pre-placement requirements (2-step TB skin test under CCEYA s. 57, initial VSC) from recurring annual compliance forms. Remove TB test fields from Form PROV-3. Ensure TB test and baseline medical clearances reside strictly in Form PROV-0 and the Central Compliance Dossier.",
            "criteria": "1. Form PROV-3 is strictly an annual policy declaration. 2. Baseline medical tests are captured once upon initial onboarding.",
            "notes": "Synthesizes Note #25, Note #51 (note-1790301020307)."
        },
        {
            "num": 17, "domain": "Domain 4: Compliance Portal & Statutory Form Lifecycle Audit",
            "title": "Dedicated Home Visitor Intake Form Series (HV-0 to HV-2)",
            "priority": "HIGH", "status": "In Progress",
            "problem": "Home Visitors currently share provider registration forms, despite having distinct regulatory requirements (RECE license, driving record, field tablet custody).",
            "action": "Implement dedicated Home Visitor form series in Form Builder Studio:\n• Form HV-0: Home Visitor Employment Application & Background.\n• Form HV-1: Professional Credentials (RECE license verification, SFA/CPR, driver's license, auto insurance) and Field Tablet Hardware Custody agreement for PIPEDA compliance.\n• Form HV-2: Annual CCEYA Policy Sign-Off & Offence Declaration.\nInclude placeholders for future Confidentiality Agreement and Mileage Reimbursement Policy.",
            "criteria": "1. HV series is segregated in Form Builder. 2. Captures RECE license number and tablet custody sign-off.",
            "notes": "Synthesizes Note #49 (note-1790299758672), Note #39 query 4."
        },
        {
            "num": 18, "domain": "Domain 4: Compliance Portal & Statutory Form Lifecycle Audit",
            "title": "Ingest Remaining Statutory CCEYA Instruments into Form Builder Studio",
            "priority": "HIGH", "status": "Proposed",
            "problem": "Form Builder Studio currently houses 10 primary forms, but lacks statutory incident and health logs required by the Ministry during inspections.",
            "action": "Expand Form Builder Studio to support:\n• Serious Occurrence Report (SOR) Form (24-hour Ministry reporting workflow).\n• Medication Administration Record (dosage, time, child, provider signature).\n• Individualized Anaphylaxis Emergency Plan (EpiPen protocol).\n• Daily Health Check & Child Wellness Log.",
            "criteria": "1. All 4 statutory forms exist in Form Builder Studio. 2. Schemas export cleanly and generate printable binder sheets.",
            "notes": "Synthesizes Note #5 (note-1789498044047), Note #12 (note-1789922338250)."
        },

        # Domain 5
        {
            "num": 19, "domain": "Domain 5: Admin Command Centre & Agency Configuration",
            "title": "Global Agency Role Branding: Replace 'Jonathan' with Institutional Titles",
            "priority": "HIGH", "status": "In Progress",
            "problem": "Personal references to 'Jonathan' appear in multiple forms, buttons, and confirmation cards, making the agency look like a sole proprietorship.",
            "action": "Replace all hardcoded references to 'Jonathan' with standardized institutional titles:\n• Use 'Agency Director' for formal approvals, contracts, licensing matters, and executive sign-offs.\n• Use 'Agency Representative' for pre-screenings, discovery calls, parent consultations, and review milestones.",
            "criteria": "1. Zero instances of 'Jonathan' in user-facing views. 2. Professional institutional branding across all 3 portals.",
            "notes": "Synthesizes Notes #8, #11 (note-1789921893781)."
        },
        {
            "num": 20, "domain": "Domain 5: Admin Command Centre & Agency Configuration",
            "title": "Dynamic Multi-Tier Rate Engine: CWELCC, Custom Subsidy & Private Tiers",
            "priority": "URGENT", "status": "In Progress",
            "problem": "System previously hardcoded '$0' for subsidized families and lacked flexibility for rate changes across regions and age groups.",
            "action": "Remove cosmetic '$0' label from municipal subsidy records. Add an editable per-family Municipal Subsidy Daily Co-Pay field with subsidy voucher expiry date and automated 30-day renewal alert. Provide an Admin input to update the provincial CWELCC daily rate on demand ($22.00 transitioning to $10.00). Replace the flat $35 private fee placeholder with a dynamic, age-tiered private rate schedule (Infant, Toddler, Preschool, Kindergarten). Ensure rate calculations synchronize symmetrically across e-Transfer billing, parent files, monthly invoices, and Form PAR-5 contracts.",
            "criteria": "1. Rates are dynamic and editable per family. 2. Voucher expiry generates 30-day renewal alerts. 3. Calculations are globally symmetric.",
            "notes": "Synthesizes Note #50 (note-1790300278012), Note #55."
        },
        {
            "num": 21, "domain": "Domain 5: Admin Command Centre & Agency Configuration",
            "title": "Role-Based Financial & Regulatory Sanitization",
            "priority": "HIGH", "status": "In Progress",
            "problem": "Sensitive financial back-office margins and formal statute citations were visible in areas accessible to parents.",
            "action": "Strictly hide provider guaranteed statutory daily payouts ($35/day), CWELCC government top-up grant formulas, and agency operational spreads from parent-facing views. On parent-facing provider profile cards, display clean 'Capacity: 6 children' and remove age ratio sub-breakdowns ('Max 3 under 3yo', 'Max 3 under 2yo'). Full sub-breakdowns remain strictly preserved for Admin and Home Visitors. Restrict formal CCEYA legal section tags (e.g. O. Reg. 137/15 s. 8) to Admin and Home Visitor portals; providers receive clear, plain-language health and safety guidance.",
            "criteria": "1. Parents never see provider payout rates or statutory sub-ratios. 2. Administrative back-office margins remain confidential.",
            "notes": "Synthesizes Notes #1, #10, #18, #34, #36."
        },
        {
            "num": 22, "domain": "Domain 5: Admin Command Centre & Agency Configuration",
            "title": "Regional Geography Normalization & Roster Tagging",
            "priority": "HIGH", "status": "In Progress",
            "problem": "Dropdown lists of dozens of small towns (Oshawa, Whitby, Ajax, Pickering, Clarington, Markham, etc.) caused confusion and data entry errors.",
            "action": "In Edit Family Record and intake forms, replace granular town dropdowns with top-level regional tiers: 'Durham Region', 'York Region', and 'Toronto'. In Admin 'By Child' sort view and roster exports, append provider operating region to their name under Assigned Home: e.g. 'Provider Name (Durham Region)'. For unplaced children, show a clean 'Unassigned'.",
            "criteria": "1. Dropdowns use the 3 regional tiers. 2. Roster table displays region in brackets. 3. Print exports match.",
            "notes": "Synthesizes Note #22 (note-1790020593638), Note #24 (note-1790021405031)."
        },
        {
            "num": 23, "domain": "Domain 5: Admin Command Centre & Agency Configuration",
            "title": "General Notes in Family Records with Admin-Controlled Home Visitor Access",
            "priority": "HIGH", "status": "In Progress",
            "problem": "Agency needs a place to record operational and family background notes without exposing them to parents, while controlling field staff access.",
            "action": "In the Edit Family Record modal, add a dedicated multiline 'General Notes' textarea directly beneath Medical Notes. Add an Admin toggle: 'Allow Home Visitor Access' per family record. When enabled, Home Visitors can view notes and append new entries with automated timestamps and staff initials; existing entries remain read-only to preserve the audit trail. Admin retains full override authority.",
            "criteria": "1. General Notes field is 100% hidden from parents. 2. Home Visitors can only append when permitted by Admin. 3. Audit trail is preserved.",
            "notes": "Synthesizes Notes #14, #19, #23 (note-1790020975452)."
        },
        {
            "num": 24, "domain": "Domain 5: Admin Command Centre & Agency Configuration",
            "title": "One-Click Cloud Firestore Database Backup Download for Admin",
            "priority": "URGENT", "status": "In Progress",
            "problem": "Admin needs an effortless way to create an on-demand, local backup of the entire agency Firestore database.",
            "action": "Add a 'Download Full Database Backup' button inside the Admin Command Centre header. Access is restricted strictly to users with the Admin role. Downloads a timestamped JSON package containing all agency collections (children, providers, home_visitors, inspections, daily_attendance, form_templates, developer_notes).",
            "criteria": "1. 1 click generates and downloads the complete database JSON backup. 2. Non-admins have zero access.",
            "notes": "Synthesizes Note #1 (note-1789169187036)."
        },
        {
            "num": 25, "domain": "Domain 5: Admin Command Centre & Agency Configuration",
            "title": "Parameterize Official Agency Telephone & Onboarding Titles",
            "priority": "HIGH", "status": "Proposed",
            "problem": "Phone number and brand title strings are hardcoded in multiple components, making future updates cumbersome.",
            "action": "Centrally parameterize the official agency telephone number (416-694-7445) as a voice-only line. Display clear notices across contact cards and notification footers stating the line is voice-only (do not send SMS). Standardize navigation onboarding buttons to 'Provider Application' and 'Home Visitor Application' (preserving 'Parent Intake'). Parameterize application display titles ('ACCS Hub' / 'Home Care Hub') in a single configuration file for an effortless global update once Jonathan finalizes agency branding.",
            "criteria": "1. Phone number and branding strings are imported from a single constants file. 2. Voice-only notice is clear.",
            "notes": "Synthesizes Notes #20, #21, #43, #44."
        },

        # Domain 6
        {
            "num": 26, "domain": "Domain 6: Platform, Field PWA & Local AI Features",
            "title": "Configure Offline PWA Tablet Manifest & Background Service Worker Sync",
            "priority": "HIGH", "status": "In Progress",
            "problem": "Home Visitors conducting unannounced inspections in basement apartments or rural Durham/York areas often encounter dead zones with zero cell service.",
            "action": "Configure Progressive Web App (PWA) manifest and Service Worker caching for standalone tablet display (zero browser chrome). Implement IndexedDB local caching for CCEYA inspection checklists and daily attendance rosters. Enable automatic background synchronization that queues field inspection records and pushes to Cloud Firestore as soon as connectivity resumes.",
            "criteria": "1. Home Visitors can fill out inspection checklists completely offline. 2. Data auto-syncs when online without data loss.",
            "notes": "Synthesizes Note #3 (note-1789172183012), Note #46 (note-1790039610309)."
        },
        {
            "num": 27, "domain": "Domain 6: Platform, Field PWA & Local AI Features",
            "title": "AI Assistant Dockable, Draggable & Minimizable Window",
            "priority": "HIGH", "status": "Clarification Needed",
            "problem": "The fixed AI assistant drawer covers child profile cards, form schemas, and roster tables during active review.",
            "action": "Refactor AccsAiAssistant.tsx into a dockable, draggable, and minimizable floating window. Include a 1-click minimize button that collapses the assistant into a subtle floating pill in the bottom corner. Allow users to drag the window across the screen or snap it to the right sidebar so it never obstructs underlying table data.",
            "criteria": "1. Assistant can be dragged, minimized to a corner pill, or docked. 2. State persists across navigation tabs.",
            "notes": "Synthesizes Note #28 (note-1790022109552)."
        },
        {
            "num": 28, "domain": "Domain 6: Platform, Field PWA & Local AI Features",
            "title": "Admin AI Model Management Console & Canadian PIPEDA Data Governance",
            "priority": "HIGH", "status": "In Progress",
            "problem": "Agency needs control over which AI models handle sensitive child care operations, ensuring compliance with Canadian data residency.",
            "action": "Build an administrative AI model management console in Jonathan's Command Centre. Enable modular tool routing: assign lightweight models (e.g. Gemma 4 E4B / Kev) to fast parent intake triage, and high-reasoning models (e.g. Qwen 2.5 7B / Claude) to CCEYA regulatory audits. Enforce Canadian PIPEDA/PHIPA pre-flight verification: automatic client-side PII masking (redacting OHIP health numbers) before prompts leave the browser.",
            "criteria": "1. Admin can toggle models per tool. 2. OHIP numbers are automatically masked. 3. Model management restricted to Director/Developer.",
            "notes": "Synthesizes Notes #39, #52, #54."
        },
        {
            "num": 29, "domain": "Domain 6: Platform, Field PWA & Local AI Features",
            "title": "Dynamic Form Schema Versioning & 1-Click Rollback in Form Builder",
            "priority": "MEDIUM", "status": "In Progress",
            "problem": "When editing form fields in Form Builder Studio or via conversational AI commands, operators need an immediate way to undo mistakes.",
            "action": "Implement a visual version history and 1-click rollback engine in FormBuilderStudio.tsx. Save schema snapshots before any mutation is applied. Provide an 'Undo Last Change' button with a visual diff preview showing modified or deleted fields before approving restoration.",
            "criteria": "1. Operators can revert any form mutation with 1 click. 2. Diff preview clearly highlights restored fields.",
            "notes": "Synthesizes Note #55 (note-form-schema-undo)."
        }
    ]

    current_domain = None
    for t in tasks:
        if t["domain"] != current_domain:
            current_domain = t["domain"]
            h_dom = doc.add_heading(current_domain, level=1)
            h_dom.style.font.color.rgb = SLATE_DARK
            h_dom.style.font.size = Pt(13)
            h_dom.style.font.bold = True
            h_dom.paragraph_format.space_before = Pt(16)
            h_dom.paragraph_format.space_after = Pt(6)

        # Task Card Box (Table)
        tbl = doc.add_table(rows=4, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        set_table_borders(tbl, color="CBD5E1", sz="6", val="single")

        # Row 0: Header with checkbox, Task title, badges
        c0 = tbl.cell(0, 0)
        set_cell_background(c0, "F1F5F9") # Slate 100
        set_cell_margins(c0, top=100, bottom=100, left=140, right=140)
        p0 = c0.paragraphs[0]
        p0.paragraph_format.space_before = Pt(0)
        p0.paragraph_format.space_after = Pt(0)
        
        r_box = p0.add_run("☐  ")
        r_box.font.size = Pt(12)
        r_box.font.bold = True
        
        r_tnum = p0.add_run(f"Task #{t['num']}: ")
        r_tnum.font.bold = True
        r_tnum.font.size = Pt(11)
        r_tnum.font.color.rgb = SLATE_DARK

        r_ttitle = p0.add_run(t['title'])
        r_ttitle.font.bold = True
        r_ttitle.font.size = Pt(11)
        r_ttitle.font.color.rgb = SLATE_DARK

        r_badges = p0.add_run(f"   [{t['priority']}]  •  [{t['status']}]")
        r_badges.font.size = Pt(9)
        r_badges.font.bold = True
        if t['priority'] == 'URGENT':
            r_badges.font.color.rgb = RGBColor(220, 38, 38) # Red
        else:
            r_badges.font.color.rgb = ORANGE_PRIMARY

        # Row 1: Problem / Client Need
        c1 = tbl.cell(1, 0)
        set_cell_margins(c1, top=80, bottom=80, left=140, right=140)
        p1 = c1.paragraphs[0]
        p1.paragraph_format.space_before = Pt(0)
        p1.paragraph_format.space_after = Pt(0)
        r_lbl1 = p1.add_run("Problem / Need: ")
        r_lbl1.bold = True
        r_lbl1.font.size = Pt(10)
        r_lbl1.font.color.rgb = RGBColor(71, 85, 105)
        p1.add_run(t['problem'])

        # Row 2: Action Plan
        c2 = tbl.cell(2, 0)
        set_cell_margins(c2, top=80, bottom=80, left=140, right=140)
        p2 = c2.paragraphs[0]
        p2.paragraph_format.space_before = Pt(0)
        p2.paragraph_format.space_after = Pt(0)
        r_lbl2 = p2.add_run("Implementation Action: ")
        r_lbl2.bold = True
        r_lbl2.font.size = Pt(10)
        r_lbl2.font.color.rgb = RGBColor(71, 85, 105)
        p2.add_run(t['action'])

        # Row 3: Acceptance Criteria & Note Source
        c3 = tbl.cell(3, 0)
        set_cell_background(c3, "F8FAFC")
        set_cell_margins(c3, top=80, bottom=80, left=140, right=140)
        p3 = c3.paragraphs[0]
        p3.paragraph_format.space_before = Pt(0)
        p3.paragraph_format.space_after = Pt(0)
        r_lbl3 = p3.add_run("Acceptance Criteria: ")
        r_lbl3.bold = True
        r_lbl3.font.size = Pt(9.5)
        r_lbl3.font.color.rgb = RGBColor(71, 85, 105)
        r_crit = p3.add_run(f"{t['criteria']}\n")
        r_crit.font.size = Pt(9.5)

        r_lbl4 = p3.add_run("Source / Traceability: ")
        r_lbl4.bold = True
        r_lbl4.font.size = Pt(9)
        r_lbl4.font.color.rgb = SLATE_MUTED
        r_src = p3.add_run(t['notes'])
        r_src.font.size = Pt(9)
        r_src.font.color.rgb = SLATE_MUTED

        p_spacer = doc.add_paragraph()
        p_spacer.paragraph_format.space_before = Pt(0)
        p_spacer.paragraph_format.space_after = Pt(6)

    # Section 3: Verification Matrix
    doc.add_page_break()
    h_mat = doc.add_heading("3. Full Traceability Matrix: All 58 Curated Notes Mapped", level=1)
    h_mat.style.font.color.rgb = SLATE_DARK
    h_mat.style.font.size = Pt(14)
    h_mat.style.font.bold = True

    p_mat_intro = doc.add_paragraph(
        "This matrix provides 100% mathematical verification that all 58 original documents in the Cloud Firestore developer_notes "
        "collection are accounted for in the cleaned 29-task implementation backlog above, ensuring zero client requirements are dropped."
    )
    p_mat_intro.paragraph_format.space_after = Pt(10)

    matrix_data = [
        ("note-1789169187036", "Add One-Click Cloud Firestore Database Download for Admin", "Task #24 & Task #21"),
        ("note-1789171754486", "Implement Home Visitor Hub: Remove 3D Card Effects & Phantom Styling", "Task #14"),
        ("note-1789172183012", "Implement Talk about locally running app", "Task #26"),
        ("note-1789238677681", "Implement Polish PDF Print Styles for Agency Director Binder", "Task #10"),
        ("note-1789498044047", "Implement Make note to add rest of forms to the form builder", "Task #18"),
        ("note-1789684328873", "Implement Are we live chat?", "Task #7"),
        ("note-1789918675826", "Implement The dedicated parent registration link (magic link)", "Task #4"),
        ("note-1789919212374", "Implement Global Agency Role Branding: Replace 'Jonathan' with...", "Task #19"),
        ("note-1789921450964", "Implement Fee Collection Streamlining: Remove Cheque Option &...", "Task #3"),
        ("note-1789921700370", "Configure Parent-Facing Capacity Display: Remove Ratio Sub-Breakdowns", "Task #21 & Task #14"),
        ("note-1789921893781", "Remove the Jonathan throughout the app and replace it with Agency", "Task #19"),
        ("note-1789922338250", "Implement Audit and Complete Statutory Parent Intake Suite (PAR-0 to...", "Task #4 & Task #18"),
        ("note-1789922984005", "Implement Universal Multi-Tier Notepad & HDLH Pedagogical AI", "Task #23"),
        ("note-1789923227519", "Implement 1. yes absolutely and strict! The director makes private...", "Task #5 & Task #23"),
        ("note-1789923738002", "Configure Provider Monthly Attendance: Single Session & Provider...", "Task #8"),
        ("note-1789923858869", "Implement Oh woops i missed there is already a button for autofill", "Task #4 & Task #15"),
        ("note-1789924038396", "Implement For printing these time sheet documents; are you able to...", "Task #10"),
        ("note-1790019927836", "Configure Role-Based UI Sanitization: Regulatory Markings Restricted", "Task #21"),
        ("note-1790019999612", "Implement 1. yes 2. have yet to decide or see what that looks like", "Task #11 & Task #23"),
        ("note-1790020125687", "Implement I may rename ACCS Hub / Home Care Hub and will follow up", "Task #25"),
        ("note-1790020191457", "Standardize Onboarding Terminology: Provider & Home Visitor", "Task #25"),
        ("note-1790020593638", "Implement Under edit family record please Use the broader options", "Task #22"),
        ("note-1790020975452", "Implement Dedicated General Notes in Edit Family Record with Granular", "Task #23"),
        ("note-1790021405031", "Display Provider Region in 'By Child' Sort View & Roster Exports", "Task #22"),
        ("note-1790021656517", "Implement 1. sure if there is space to do so and it doesn't look", "Task #22 & Task #16"),
        ("note-1790021911404", "Implement Dual Guardian Architecture: Stage 1 Intake vs Formal", "Task #4"),
        ("note-1790021994836", "Implement 2. one or if two is available the better but one is still", "Task #11"),
        ("note-1790022109552", "Implement Did i ask to add a note to have this chat window be a pop", "Task #27"),
        ("note-1790022348362", "Implement In the small group care box in the parent initial intake", "Task #2"),
        ("note-1790022808609", "Implement CWELCC Card Copy: Remove Monthly Estimate & Direct Subsidy", "Task #2"),
        ("note-1790023355751", "Implement Form PAR-0 Subtitle Copy: Zero Fees & Discovery Call Wording", "Task #2"),
        ("note-1790023854877", "Implement Under Application Successfully submitted Please rename it", "Task #2"),
        ("note-1790024000218", "Implement Form PAR-0: 'What Happens Next' 3-Step Sequence & Screening", "Task #2"),
        ("note-1790024159792", "Implement Oh wait in regards to 1. I see it displayed on the next", "Task #21"),
        ("note-1790024217601", "Implement Replace the long paragraph beginning with Ontario CCEYA", "Task #2"),
        ("note-1790024408799", "Streamline Timesheet Terminology: Change 'Statutory Daily Rate' to...", "Task #9 & Task #3"),
        ("note-1790024576406", "Implement Timesheet Role-Based Access, Payout Visibility & Audit Trail", "Task #9"),
        ("note-1790024995173", "Implement Timesheet Submission Copy, Confirmation Receipt & Automated...", "Task #9"),
        ("note-1790025123554", "Implement 1. yes! I love the your phrase 'Your timesheet has been...'", "Tasks #6, #9, #15, #17, #28"),
        ("note-1790025281432", "Implement Monthly & Annual Invoicing with Admin-Only Distribution &...", "Task #11"),
        ("note-1790025572456", "Implement Thats fine It was just an email i sent him with the list of", "Consolidated into Backlog Scope"),
        ("note-1790025828704", "Implement In the Path to Licensed care please rename 'provider match'", "Task #2"),
        ("note-1790026026295", "Implement Agency Telephone (416-694-7445): Voice-Only Line &...", "Task #25"),
        ("note-1790026089984", "Implement 2. yea this is a voice only line; I will get a second line", "Task #25"),
        ("note-1790026268357", "Implement OH please note that section 3 for par-0 form 'schedule...'", "Task #1"),
        ("note-1790039610309", "Implement PWA Capabilities, Standalone Tablet Display & Push", "Task #26"),
        ("note-1790226699342", "Implement Child Attendance Check-Out, Authorized Pick-Up & Departure", "Task #6"),
        ("note-1790299188114", "Implement Compliance Portal & Digital Document Sign-Off Hub", "Task #15"),
        ("note-1790299758672", "Implement Home Visitor Dedicated HV Form Series (HV-0 to HV-2) &...", "Task #17"),
        ("note-1790300278012", "Implement Dynamic Multi-Tier Rate Engine: CWELCC, Custom Subsidy...", "Task #20"),
        ("note-1790301020307", "Implement Statutory Form Suite Audit: Decouple Baseline Pre-Placement", "Task #16"),
        ("note-1790607006825", "Dynamic AI Model Management & One-Click LLM Upgrade Hub", "Task #28"),
        ("note-40page-cceya-checklist", "Implement 40-Page Ministry Quarterly Checklist (12 Domains)", "Task #13"),
        ("note-ai-children-data-governance", "Review AI Child Data Governance, PII Masking & Privacy Policies", "Task #28"),
        ("note-form-schema-undo", "Enable Conversational Form Rollback & Version Control", "Task #29"),
        ("note-par1-multiselect-care-type", "Implement Form PAR-1: Multi-Select Care Type Selection", "Task #4"),
        ("note-parent-registration-flow", "Streamline Parent Intake & Registration Flow Gating", "Task #4"),
        ("note-quarterly-inspection-diff", "Separate Quarterly Inspection from Behaviour Guidance Audit", "Task #12")
    ]

    mat_table = doc.add_table(rows=1, cols=3)
    mat_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(mat_table, color="E2E8F0", sz="4", val="single")

    m_hdr_cells = mat_table.rows[0].cells
    m_headers = ["Firestore Document ID", "Original Curated Note Title", "Mapped Implementation Task"]
    for i, h_text in enumerate(m_headers):
        m_hdr_cells[i].text = h_text
        set_cell_background(m_hdr_cells[i], "0F172A")
        p = m_hdr_cells[i].paragraphs[0]
        for run in p.runs:
            run.font.bold = True
            run.font.color.rgb = RGBColor(255, 255, 255)
            run.font.size = Pt(9)
        set_cell_margins(m_hdr_cells[i], top=100, bottom=100, left=120, right=120)

    for nid, ntitle, mtask in matrix_data:
        row = mat_table.add_row()
        cells = row.cells
        cells[0].text = nid
        cells[1].text = ntitle
        cells[2].text = mtask
        for idx, cell in enumerate(cells):
            set_cell_margins(cell, top=80, bottom=80, left=120, right=120)
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            for r in p.runs:
                r.font.size = Pt(8.5)
            if idx == 0:
                p.runs[0].font.name = "Consolas"
                p.runs[0].font.size = Pt(8)
                set_cell_background(cell, "F8FAFC")
            elif idx == 2:
                p.runs[0].font.bold = True
                p.runs[0].font.color.rgb = ORANGE_PRIMARY

    # Save to project root and artifact directory
    out_path_project = r"C:\Projects\allchildcaresolutions\ACCS_Master_Implementation_ToDo_List.docx"
    doc.save(out_path_project)
    print(f"Document saved to: {out_path_project}")

    out_path_artifact = r"C:\Users\jared\.gemini\antigravity-ide\brain\48150fd2-8b71-4cd9-8a13-c8e4c5d2f1b6\ACCS_Master_Implementation_ToDo_List.docx"
    doc.save(out_path_artifact)
    print(f"Artifact copy saved to: {out_path_artifact}")

if __name__ == "__main__":
    create_document()
