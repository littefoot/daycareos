# Home Child Care Admissions & Agency Operations Platform
## Developer Brief — Phase 1 (Core Foundation & Manual Workflow)

**Prepared for**: All Child Care Solutions Inc. (ACCS) & Circles in the Sun (CITS)  
**Jurisdiction**: Ontario Ministry of Education — Child Care and Early Years Act, 2014 (CCEYA)  
**Version**: Phase 1 Foundation (Zero AI Dependencies — Fully Deterministic & Manual)

---

## 1. System Purpose & Operational Scope
The platform provides a centralized, secure, mobile-friendly case-management hub for an Ontario licensed home child care agency. It handles:
1. **Parent Admissions & Registration**: Inquiry tracking, document submission (OHIP, birth certificates, immunization records), contract signing, and active enrollment.
2. **Licensed Provider Management**: Roster of home child care providers, mixed-age capacity ratio compliance, daily attendance, and monthly timesheet reconciliation.
3. **Home Visitors Field Portal**: Mobile/tablet workspace for agency Registered Early Childhood Educators (RECEs) conducting mandatory CCEYA quarterly home inspections, spot-checks, and placement readiness reviews.
4. **Agency Administration (Jonathan's Command Centre)**: Real-time action alerts, admissions pipeline, fee ledger (CWELCC & municipal subsidy), and one-click Ministry audit binder generation.

---

## 2. User Roles & Permission Matrix (Phase 1)

| Role Code | Role Name | Primary Interface | Scope of Authority |
| :--- | :--- | :--- | :--- |
| `admin` | Agency Director / Administrator | Admin Command Centre | Full CRUD access across families, providers, visitors, and forms; approval authority; fee management; Ministry exports. |
| `visitor` | Home Child Care Visitor (RECE) | Home Visitor Field Portal | View assigned provider homes; log quarterly CCEYA inspections; verify headcounts against attendance; conduct child observations. |
| `provider` | Licensed Home Child Care Provider | Provider Hub | View enrolled children, daily attendance logging (present/absent/sick/vacation), submit monthly signed timesheets. |
| `parent` | Enrolled Parent / Guardian | Parent Portal | View enrolled child status, upload documents, review CWELCC fees, and update emergency contacts. |
| `register` | Public Applicant | Public Application Page | Complete initial Form 0 intake application to create a new lead in the agency pipeline. |

---

## 3. End-to-End Admissions & Field Workflow (Phase 1 Manual Flow)

```
[Public Application / Form 0]
             │
             ▼
[Stage 1: Inquiries Pipeline] ──► Staff conducts 10-min phone screening call
             │
             ▼
[Stage 2: Screening & Documents] ──► Upload Birth Cert, OHIP, Immunization Record
             │
             ▼
[Stage 3: Provider Matching] ──► Filter by Region & CCEYA Capacity Openings
             │
             ▼
[Stage 4: Home Visitor Pre-Placement] ──► Home Visitor conducts readiness visit & sign-off
             │
             ▼
[Stage 5: Final Contract & Fee Terms] ──► Digital parent signature on master contract
             │
             ▼
[Stage 6: Enrolled Active Care] ──► Active in Provider Hub, Home Visitor Caseload & Fee Ledger
```

---

## 4. Key Components Architecture

### 4.1 Admin Command Centre (`src/components/admin/`)
- `AdminCommandCentre.tsx`: Master coordinator view.
- `AdmissionsPipeline.tsx`: 5-stage drag-and-drop / click-to-advance Kanban.
- `ProviderDirectory.tsx`: Roster of licensed homes with CCEYA 6-child ratio visualizer.
- `HomeVisitorDirectory.tsx`: Directory of home visitors, assigned caseloads, and inspection tracking.
- `FamilyDirectory.tsx`: Searchable database of parents and enrolled children.
- `FinancialLedger.tsx`: CWELCC parent fees ($22 transitioning to $10), municipal subsidies ($0 co-pay), and provider payouts ($35/day).
- `PhysicalBinderModal.tsx`: Ministry on-site audit packager with barcode generation.

### 4.2 Home Visitor Field Portal (`src/components/visitor/`)
- `HomeVisitorPortal.tsx`: Mobile/tablet-optimized field interface.
- `VisitorCaseloadList.tsx`: Active assigned homes with addresses, operating hours, phone links, and 90-day CCEYA countdown clocks.
- `InspectionChecklistModal.tsx`: Digital execution of the Ministry *Standard Home Visitor Checklist* and ACCS *Monthly Profile Checklist*.
- `BehaviourManagementChecklistModal.tsx`: Quarterly behavior management monitoring checklist.
- `HeadcountAuditWidget.tsx`: In-person physical child count compared with provider attendance.

### 4.3 Provider Hub (`src/components/provider/`)
- `ProviderPortal.tsx`: Active home overview.
- `DailyAttendanceLogger.tsx`: 1-tap check-in/out logging.
- `ProviderTimesheetView.tsx`: Interactive monthly attendance timesheet (Days 1–31) with export/print.
- `VariedEnrolmentTimesheetView.tsx`: Interactive 5-week schedule card timesheet with legend codes (SE, AE, CE, NP, H) and print layout.

### 4.4 Parent Portal (`src/components/parent/`)
- `ParentPortal.tsx`: Family dashboard with 1-2-3-4-5 Journey Stepper.
- `DocumentUploadCenter.tsx`: Health card, birth certificate, and immunization upload slots.
- `ChildCareContractSigner.tsx`: Form viewer and digital signature capture.

---

## 5. Timesheet Specifications (Client Requirements)

### 5.1 Standard Monthly Provider Attendance Timesheet (`ACCS x CITS TIME SHEET FOR PROVIDERS 2026.pdf`)
- Single-page monthly ledger for 31 days.
- Morning session (In, Out, Hours) + Afternoon session (In, Out, Hours) + Daily Total Hours.
- Provider signature, Parent signature, Month/Year, Child/Provider info, and Agency selection (ACCS vs Circles in the Sun).

### 5.2 Varied Enrolment Timesheet (`ACCS x CITS Varied Enrolment Schedules.pdf`)
- **5-Week Card Layout**: Designed specifically to accommodate 31 days on a single sheet without needing an overflow second page.
- Per-card structure:
  - Week Number (Week 1 to Week 5)
  - Days: Sunday through Saturday
  - In / Out times per day
  - Schedule description
  - Legend Codes:
    - **SE**: Sick on scheduled day, insufficient notice, payment expected
    - **AE**: Absent on scheduled day, insufficient notice, payment expected
    - **CE**: Time changed, insufficient notice, payment expected for scheduled hours
    - **NP**: No payment expected
    - **H**: Statutory Holiday
  - Hours attended if different
  - Total Days Charged box
  - Parent's Initials box
- Parent signature block and explanatory legend at bottom.

---

## 6. Document Signing Architecture (Open Source Standard)
- **Zero Third-Party Gating**: All digital signing is built using client-side open-source standards (`pdf-lib`, HTML5 Canvas signature pad).
- **Execution Workflow**:
  1. PDF template is loaded in browser canvas.
  2. Signer draws or types legal digital signature.
  3. `pdf-lib` embeds the vector signature image directly into the PDF byte stream.
  4. Generates a signed, immutable PDF stored in Firebase Storage and downloadable immediately.
  5. Cost: **$0.00/month** (eliminating DocuSign or Adobe Sign subscription costs).
