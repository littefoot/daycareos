# All Child Care Solutions (ACCS) — Home Care Hub

**Ontario Licensed Home Child Care Management System, Admissions CRM & Compliance Hub**  
- **Governing Body**: Ontario Ministry of Education & Child Care and Early Years Act, 2014 (CCEYA) / O. Reg. 137/15  
- **Operating Regions**: Durham Region (Oshawa, Whitby, Ajax, Pickering, Clarington) • York Region (Markham) • City of Toronto  
- **Canadian Data Residency**: Google Cloud Platform, Montreal (`northamerica-northeast1`) — Strict PIPEDA / PHIPA Compliance  
- **Agency Phone & 24/7 Hotline**: `+1 (416) 694-7445`  
- **Sole Electronic Payment Rail**: `allchildcaresolutions@gmail.com`  

---

## 1. System Architecture & Workflows

### 1.1 Core Ecosystem
ACCS Home Care Hub unifies four synchronized portals around a real-time Cloud Firestore database in Montreal:
1. **Admin Command Centre**: Executive admissions CRM, deterministic daily action queue, CCEYA ratio visualizer, financial ledger, and dynamic form builder.
2. **Licensed Provider Hub**: 2-tap daily arrival/departure attendance, child emergency backpack wallet card generator, and monthly subsidy timesheet submission.
3. **Parent Registration & Active Care Portal**: 5-stage onboarding stepper, digital form submission, statutory document upload (Birth Certificate, OHIP, Immunization), and live daily attendance check-in.
4. **Home Visitor Field Portal**: 90-day unannounced quarterly inspections (CCEYA s. 26), physical headcount & ratio reconciliation, and digital tamper-evident inspection sign-off.
5. **ACCS AI Copilot**: Responsive side-docking split-view assistant (occupying 25% or 33% width with 75% or 66% canvas compression) for statutory CCEYA lookups, live capacity queries, and real-time backlog management.

### 1.2 5-Stage Admissions Pipeline
Every child progresses through a strict, deterministic sequence:
1. **Inquiry (Waitlist)**: Public submission of Form PAR-0 (Initial Intake & Pre-Screening).
2. **Screening**: 10-minute discovery call conducted by Agency Director Jonathan; Form 0 sign-off unlocks the Parent Portal.
3. **Docs Needed**: Parent completes digital intake forms and uploads 3 statutory documents: Ontario Health Card (OHIP), Yellow Immunization Card, and Birth Certificate.
4. **Matching**: Agency staff match child to an approved provider home verifying mixed-age CCEYA ratios.
5. **Enrolled**: Form PAR-5 Master Parent Contract signed; child added to daily attendance roster and billing ledger.

### 1.3 Statutory CCEYA Ratio Standard (s. 8 & O. Reg. 137/15)
- **Maximum Total Capacity**: 6 children per licensed home premises (including provider's own children under 6).
- **Maximum Under 3 Years (<36 months)**: Maximum 3 children.
- **Maximum Under 2 Years (<24 months)**: Maximum 3 children.
- **Provider's Own Children**: Count 1:1 against total capacity and age sub-caps.

### 1.4 Tri-Party Financial Model & CWELCC Rates
- **CWELCC Enrolled (Current Phase)**: **$22.00 / day** (~$478.50 / mo for 5 days/wk).
- **CWELCC Target (Upcoming Phase)**: **$10.00 / day** (~$217.50 / mo for 5 days/wk).
- **Municipal Child Care Subsidy**: 100% covered by regional municipality (**$0.00 / day** parent co-pay).
- **Private Care**: Unsubsidized rate of **$35.00 / day** (~$761.25 / mo for 5 days/wk).
- **Licensed Provider Payout**: Guaranteed **$35.00 / day per child** funded via parent fees + provincial CWELCC top-up grant or municipal subsidy.
- **Sole Electronic Payment Rail**: Interac e-Transfer to `allchildcaresolutions@gmail.com` (cash, cheques, and PAD decommissioned).

---

## 2. Requirements & Backlog Architecture

To eliminate disjointed notes and fragmented tasks, ACCS maintains a two-tier backlog system:

### 2.1 Canonical Master Roadmap (`TODO.md`)
- Authoritative implementation roadmap and completed task log in the root directory: `C:\Projects\allchildcaresolutions\TODO.md`.
- Tracks core system milestones (Tasks #1 through #30, plus specialized architecture tasks).

### 2.2 Unified Supplemental Backlog (`todo_supp/active` in Cloud Firestore)
- Stored as a **single atomic document** in Cloud Firestore (`todo_supp/active`).
- Agency Director and ACCS AI review and append new client requests, bug audits, or feature ideas here in real time.
- Integrated during each subsequent local development cycle by synthesizing tasks into `TODO.md`.

---

## 3. Form System & Document Lifecycles

The hub manages 36 dynamic and statutory forms across 4 primary namespaces:
- **Parent Forms (`PAR-*`)**:
  - `PAR-0`: Initial Intake & Pre-Screening
  - `PAR-1`: Master Application for Enrolment
  - `PAR-2`: Emergency Outings Wallet Card
  - `PAR-3`: Emergency Medical & Allergy Consent
  - `PAR-4`: Supervised Outdoor Play Plan
  - `PAR-5`: Master Parent Contract & Fee Terms
- **Provider Forms (`PROV-*`)**:
  - `PROV-0`: Provider Enrolment & Facility Registration
  - `PROV-1`: Monthly Subsidy Attendance & Payroll Timesheet
  - `PROV-2`: Home Safety & Environmental Inspection Checklist
  - `PROV-3`: Annual CCEYA Policy Sign-Off & Vulnerable Sector Check
- **Visitor Forms (`VIS-*`)**: Quarterly home inspection reports, safe sleep checklists, and quarterly headcounts.
- **Administrative Forms (`ADM-*`)**: Serious occurrence incident logs, medication administration authorizations, and staff files.

---

## 4. Privacy, Security & Canadian Data Residency

- **Hosting & Database**: Google Cloud Platform, Montreal (`northamerica-northeast1`). Enforces strict Canadian PIPEDA and PHIPA compliance for children's OHIP health cards and medical documents.
- **Strict Cloud LLM Air-Gap**: External AI models (Gemini, ChatGPT, DeepSeek) have **ZERO direct database connection** or read/write credentials to Cloud Firestore or Firebase Storage. AI features execute strictly via client-side sanitized prompt payloads with OHIP and surname data scrubbed beforehand.
- **Role-Based Access Control**:
  - `role === 'admin'`: Full read/write access across all collections.
  - `role === 'provider'`: Read-only access to assigned children; write access strictly to daily attendance.
  - `role === 'visitor'`: Read/write access to inspection reports and assigned provider premises.
  - `role === 'parent'`: Scoped strictly to own child/parent profile.

---

## 5. Local Development Commands

```powershell
# Install dependencies
npm install

# Run Vite local development server
npm run dev

# Run TypeScript typecheck
npx tsc --noEmit

# Production build verification
npm run build
```
