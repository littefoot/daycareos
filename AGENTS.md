# All Child Care Solutions (ACCS) — Agent Context & Rules

## 🚀 System Overview
**All Child Care Solutions (ACCS)** is a centralized admissions CRM, home compliance hub, and parent registration portal for an Ontario licensed home child care agency operating under the **Ministry of Education & Child Care and Early Years Act (CCEYA)** across Durham Region (Oshawa, Whitby), York Region (Markham), and Toronto.

- **Client / Primary Operator**: Jonathan (Jon), Agency Director
- **Official Agency Phone Number / 24/7 Hotline**: **`+1 (416) 694-7445`**
- **Sole Payment / Interac e-Transfer Rail**: `allchildcaresolutions@gmail.com`
- **Sister Agency Support**: "Circles in the Sun" (Entity Switcher Supported)
- **Live Staging URL**: [https://accs-hub.web.app](https://accs-hub.web.app) (and `https://accs-hub.firebaseapp.com`)
- **GitHub Repository**: [https://github.com/littefoot/accs-hub](https://github.com/littefoot/accs-hub)
- **Firebase Project ID**: `accs-hub` (Project Number: `402449727247`)
- **Cloud Database Region**: `northamerica-northeast1` (Montreal, Canada — Enforces strict Canadian PIPEDA / PHIPA data residency for children's OHIP health cards and medical records)

---

## 🛠️ Tech Stack & Brand System
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide React vectors (zero raw text emojis).
- **Design Tokens (`BRAND.md`)**:
  - Tangerine Sun Orange (`#ff6900`), Sunshine Gold (`#fcb900`), CWELCC Mint Emerald (`#10b981`), Warm Sand Canvas (`#fdfbf7`), Crisp Card White (`#ffffff`), Inky Slate (`#0f172a`).
  - Neo-brutalist tactile 2px slate borders (`border-2 border-slate-900`) and offset drop shadows (`shadow-neo`, `shadow-neo-sm`).
- **Backend & Storage**: Google Cloud Firestore (Montreal `northamerica-northeast1`), Firebase Cloud Storage, Firebase Hosting.

## ⚖️ Ontario Legal & Regulatory Policy Source of Truth (CCEYA & O. Reg. 137/15)
The authoritative statutory and regulatory foundation for All Child Care Solutions is established exclusively by two primary Ontario provincial resources:
1. **CCEYA Statute**: [Child Care and Early Years Act, 2014, S.O. 2014, c. 11](https://www.ontario.ca/laws/statute/14c11)
2. **Licensing Manual**: [Ministry of Education Home Child Care Licensing Manual](https://www.ontario.ca/page/home-child-care-licensing-manual) (governed under Ontario Regulation 137/15: General)

### 🛑 Zero Live Re-Fetching Rule & Context Protection Mandate
- **Statutory Context Footprint**: The raw statute (~45,000 words / ~60k tokens) and the 14-chapter licensing manual (~80,000 words / ~105k tokens) total **~165,000 tokens**. Fetching or scraping these URLs live during agent sessions consumes >80% of a 200k context window, causing immediate memory compaction, amnesia, high latency, and excessive token expenditure.
- **Strict Prohibition**: Agents and in-app AI models **MUST NEVER** re-fetch, scrape, or inject these raw websites on every turn.
- **Compiled Ground Truth**: All agents must treat the compiled rules in this `AGENTS.md` and localized reference files (`docs/policies_source_of_truth/` and `docs/master_forms_and_policies_index.md`) as the canonical ground truth. When deep statutory clause citations are needed, agents load only targeted markdown extracts (<1,500 tokens).

### 📐 Statutory Mixed-Age Ratio Standard (CCEYA s. 8 & O. Reg. 137/15 s. 8(2))
Confirmed by Agency Director Jonathan and codified under Ontario Regulation 137/15:
- **Maximum Total Capacity**: **6 children** in care at any one time per licensed home premises (including the provider's own children under age 4; or under age 6 under agency contract standards).
- **Maximum Under 3 Years**: No more than **3 children younger than 3 years of age** (`< 36 months`).
- **Maximum Under 2 Years**: No more than **3 children younger than 2 years of age** (`< 24 months`).
*(A licensed home child care provider is legally permitted to care for up to 3 infants under 2 years old, provided the overall under-3 cap of 3 and total cap of 6 are not exceeded).*

### 🔍 Statutory Home Visitor Quarterly Inspection Mandate (CCEYA s. 26)
- **RECE Home Visitor Oversight**: Unannounced quarterly on-site inspections conducted every **90 days** by a qualified Registered Early Childhood Educator (RECE).
- **Physical Headcount Reconciliation**: In-person audit of all present children, verified against the provider's real-time digital attendance log and CCEYA mixed-age ratio thresholds.

---

## 👥 Multi-Portal Architecture

### 1. 👑 Admin Command Centre (`src/components/admin/AdminCommandCentre.tsx`)
- **Deterministic Daily Action Queue**: 4 automated alerts for 30-day expiring immunizations, overdue e-transfers, capacity vacancies, and pending parent intake screening calls (Form 0).
- **Admissions Pipeline (`AdmissionsPipeline.tsx`)**: 5-stage Kanban (*Inquiry ➔ Screening ➔ Docs Needed ➔ Matching ➔ Enrolled*) with Form 0 gating.
- **CCEYA Ratio & Capacity Visualizer (`ProviderDirectory.tsx`)**: Real-time mixed-age compliance calculations (*Max 6 kids, Max 3 <3yo, Max 3 <2yo*, including provider's own children).
- **Financial & e-Transfer Ledger (`FinancialLedger.tsx`)**:
  - **Ontario CWELCC Parent Rate**: Currently **$22.00 / day** ($478.50/mo avg for 5 days/wk), transitioning to **$10.00 / day** ($217.50/mo).
  - **Municipal Child Care Subsidy**: Covers 100% of parent portion (**$0.00 / day** co-pay).
  - **Private Care Rate**: Full **$35.00 / day** ($761.25/mo for 5 days/wk).
  - **Provider Daily Compensation**: **$35.00 / day per child** guaranteed (funded via parent fee + provincial CWELCC top-up grant / municipal subsidy).
  - 1-click Interac e-transfer reminder dispatcher (`allchildcaresolutions@gmail.com`).
- **Dynamic Form Builder Studio (`FormBuilderStudio.tsx`)**: Segregated visual form builder for Parent vs Provider forms with live parent preview and JSON schema export.
- **Physical Binder Print Exporter (`PhysicalBinderModal.tsx`)**: Printable Ministry on-site audit cover sheets with barcode `ACCS-PROV-1-2026` and child emergency wallet cards.

### 2. 🏡 Provider Hub (`src/components/provider/ProviderPortal.tsx`)
- **2-Tap Daily Attendance Workflow**:
  - **Tap In (Arrival)**: Logs exact timestamp upon arrival at the home.
  - **Tap Out (Departure)**: Logs exact departure timestamp and authorized pick-up adult for liability compliance and child whereabouts tracking.
  - **Automated Compliance Alerts**: Dispatches automated reminder at 12:30 PM if scheduled children are not tapped in, and at 5:00 PM if checked-in children have not been tapped out when expected to leave.
- **Physical On-Site Binder & Child Wallet Cards Print Hub**:
  - Providers can print their own physical home compliance forms directly on-demand from the portal.
  - **Child Backpack Emergency Wallet Cards** (CCEYA s. 68): 1-click print buttons on daily attendance rows, medical alerts cards, and print toolbar with scissor cut lines, medical badges, and authorized emergency contacts scoped strictly to the provider's enrolled children.
  - **31-Day Printable Attendance Sheet**: Dedicated print button and CSS page-fit for monthly Ministry subsidy and attendance verification.
  - **Provider Home Binder Cover Sheet**: Printable cover sheet with barcode (`ACCS-PROV-1-2026`), approved licensed capacity, premises address, and child roster.
  - **Full Home Compliance Binder**: 1-click comprehensive print packet scoped to that specific home.
- Critical medical and allergy quick-badges (Anaphylaxis Epi-Pen protocols) and gated care notes.
- Monthly subsidy timesheet submission with digital legal signature and auto-calculated net daily hours.

### 3. 👨‍👩‍👧 Parent Registration Portal (`src/components/parent/ParentPortal.tsx`)
- **1-2-3-4-5 Gamified Journey Stepper**:
  1. *Inquiry & Pre-Screening (PAR-0)* (Fast <2 min inquiry, zero file uploads).
  2. *Digital Intake Forms (PAR-1 to PAR-5) & Statutory Document Uploads*: Direct parallel upload slots for the 3 required statutory documents (**Child's Birth Certificate**, **Ontario Health Card / OHIP**, and **Yellow Immunization Card**) right after screening approval & magic link login.
  3. *Provider Matching (Home Placement)*
  4. *Final Review & Fee Terms (PAR-5 e-Sign)*
  5. *Active Care Hub (Live Daily Attendance Check-In, Meals, CWELCC Fee Statement & Closures)*
- Dynamic JSON-schema form engine rendering real-time fields from Firestore.
- **Sole Interac e-Transfer Rail**: Universal payment stream directed strictly to `allchildcaresolutions@gmail.com` (paper cheques, cash, Pre-Authorized Debit/PAD, and Helcim are 100% decommissioned).

### 3.1 🤖 Responsive Dockable AI Assistant (`src/components/chat/AccsAiAssistant.tsx`)
- Responsive side-docking panel: Slides in smoothly from the right edge occupying 1/4 (25%) of viewport width.
- Responsive main canvas reflow: Main application UI simultaneously compresses to occupy the remaining 3/4 (75%) width, eliminating modal backdrop overlays and visual clipping.
- Dynamic relative timestamps: Message bubbles and exports display `"Today, [time]"` for current-day messages, `"Yesterday, [time]"`, and calendar dates (`"MMM d, [time]"`) for earlier records, backed by ISO 8601 strings and legacy time-string fallbacks.


### 4. 📋 Home Visitor Field Portal (`src/components/visitor/HomeVisitorPortal.tsx`)
- **CCEYA Section 26 Quarterly Inspection Protocol**: Unannounced quarterly on-site audits every 90 days.
- **Physical Headcount & Mixed-Age Ratio Engine**: On-site verification allowing *Max 6 Total, Max 3 <3yo, Max 3 <2yo* (including provider's own children).
- **1-Tap Field Emergency Actions**: Instant phone dialer and GPS driving directions to provider residences.
- **Digital Tamper-Evident Inspection Sign-Off**: Dual signatures (RECE Visitor + Provider) synchronized directly into Jonathan's Admin Command Centre and Ministry Audit Binder.

---

## 🏷️ Standardized Form Naming Protocol
- **Parent Forms**: Prefix **`par-form-*`** (Internal ID) and **`PAR-*`** (Form Code).
  - `par-form-0` (`PAR-0`): Initial Intake & Pre-Screening Form
  - `par-form-1` (`PAR-1`): Master Child Application for Enrolment
  - `par-form-2` (`PAR-2`): Emergency Outings Wallet Card
  - `par-form-3` (`PAR-3`): Emergency Medical & Allergy Consent
  - `par-form-4` (`PAR-4`): Supervised Outdoor Play Plan
  - `par-form-5` (`PAR-5`): Master Parent Contract & Fee Terms
- **Provider Forms**: Prefix **`prov-form-*`** (Internal ID) and **`PROV-*`** (Form Code).
  - `prov-form-0` (`PROV-0`): Provider Enrolment & Home Facility Registration
  - `prov-form-1` (`PROV-1`): Monthly Subsidy Attendance & Payroll Timesheet
  - `prov-form-2` (`PROV-2`): Home Safety & Environmental Inspection Checklist
  - `prov-form-3` (`PROV-3`): Annual CCEYA Policy Sign-Off & Vulnerable Sector Check

---

## 💰 Ontario Child Care & CWELCC Financial Architecture
The system operates on an explicit 3-tier financial model governed by the Ontario Ministry of Education:

### 1. 👨‍👩‍👧 Parent Fee Schedule:
- **CWELCC Enrolled (Current Phase)**: **$22.00 / day** (Average: $110.00/week | **$478.50 / month** for 5 days/week).
- **CWELCC Target (Upcoming Phase)**: **$10.00 / day** (Average: $50.00/week | **$217.50 / month** for 5 days/week).
- **Municipal Child Care Subsidy (Durham Region, York Region, Toronto)**: Covers 100% of parent portion (**$0.00 / day | $0.00 / month** co-pay).
- **Private Care (Non-CWELCC)**: Full unsubsidized rate of **$35.00 / day** ($175.00/week | **$761.25 / month** for 5 days/week).
- **Monthly Fee Calculation Standard**: `(Daily Rate × Days Per Week) × 4.35 Average Weeks/Month` (Ontario standard: 52 weeks ÷ 12 months = 4.3333333333333333333333333333333 rounded to 4.35).

### 2. 🏡 Licensed Provider Compensation:
- **Universal Provider Payout**: **$35.00 / day per child** (guaranteed statutory compensation regardless of parent funding stream).
  - *CWELCC ($22/day parent)*: Parent pays $22.00/day + Ontario Government CWELCC top-up grant pays $13.00/day = **$35.00/day** to provider.
  - *CWELCC ($10/day parent upcoming)*: Parent pays $10.00/day + Ontario Government CWELCC top-up grant pays $25.00/day = **$35.00/day** to provider.
  - *Municipal Subsidy*: Regional municipality pays full **$35.00/day** directly = **$35.00/day** to provider ($0 parent co-pay).
  - *Private Care*: Parent pays full **$35.00/day** = **$35.00/day** to provider.

### 3. 🏢 Agency Administration Spread (Jon / ACCS):
- Agency revenue and operational administrative overhead is funded via municipal base funding, administrative operating grants, and agency operational allocation per enrolled space.

---

## 🔐 Security & Access Control (Option 1 Architecture)
- **Authentication**: Firebase Authentication.
- **Authorization Engine**: Custom User Claims embedded in signed JWT tokens (`request.auth.token.role`):
  - `role: 'admin'`: Full read/write authority across all Firestore collections.
  - `role: 'provider'`: Read-only access to assigned children (`resource.data.providerId == request.auth.token.providerId`), write access to `/attendance`.
  - `role: 'parent'`: Read/write access strictly to own child/intake records (`resource.data.parentId == request.auth.uid`).
- **Security Rules**: Enforced server-side in `firestore.rules` and `storage.rules`.
- **🛑 Zero Cloud LLM Database Access Mandate**: Cloud LLMs (e.g. OpenAI, Anthropic, Claude, Gemini, DeepSeek) are **STRICTLY FORBIDDEN** from having direct read, query, or streaming access to the Cloud Firestore database or Firebase Cloud Storage buckets under any circumstances. The live database is completely air-gapped from external cloud AI APIs. Any AI-assisted operations (e.g. CCEYA regulatory guidance or form schema generation) receive only localized, client-side sanitized prompt payloads with all OHIP numbers and sensitive PII scrubbed beforehand.

## 📂 Legacy Brand Assets & Client Archives
Historical brand files, copy sheets, fonts, and template kits from the original agency website are indexed at:
- **Root Directory**: `docs/brand_assets/`
- **Key Source Files**:
  - `Website Content Drive/All Child Care Solutions Inc/ALL CHILD CARE WEBSITE INFO FOR PAGES.docx`: Master website copy, core program descriptions, and philosophy.
  - `Notes - All Child Care Solutions.docx` & `All Child Care Hours.xlsx`: Operational schedules, provider hours, and agency notes.
  - `Logo/` & `All_Child_Care_1b.eps` / `.png`: High-resolution vector source marks and master logo variations.
  - `CWELCC/`: Official $10/day childcare program collateral and regulatory badge graphics.
  - `NexaLight`, `Dancing_Script,Syne`, `always_in_my_heart`: Agency typography bundles.

---

## 📜 Principles & Critical Rules
1. **Zero Emojis**: Use inline Lucide React SVG vectors for all phone, email, map pin, and calendar icons.
2. **Deterministic Rules**: No hallucinations; date math calculates 30-day expiration and fee due dates strictly.
3. **No Direct Delete**: Deprecated files move to `legacy/` or `scratch/`.
4. **Canadian Data Privacy & Cloud LLM Air-Gap**: All cloud infrastructure must remain in Canadian regions (`northamerica-northeast1`). Cloud LLMs must never be connected to or granted access to read the Cloud Firestore database.
5. **Production Client Handoff Gate (MANDATORY TODO)**: Before shipping to production client (Jon) and live staff, the `[ Clear Demo Data ]` and `[ ⚡ Seed Cloud Database & Reload ]` buttons in `AdminCommandCentre.tsx` MUST be removed or gated behind a developer super-admin environment flag (`VITE_ENABLE_DEMO_SEEDING === 'true'`) to prevent agency operators from accidentally wiping live production records.
6. **Licensed Provider & Home Visitor Roster (6 Providers, 3 Visitors)**:
   - *Providers*: Fatima Al-Mansoor (Oshawa Central), Grace Mirembe (Whitby North), Elena Rostova (Oshawa North), Maria Santos (Markham/Toronto), Amara Okafor (Pickering Brock Ridge), Chloe Tremblay (Toronto East York).
   - *Home Visitors*: Sabrina Vance, RECE #44192 (Durham South), Ryan Thorne, RECE #58210 (Durham North), Nadia Chen, RECE #61984 (York/Toronto).
7. **Canonical Agency Contact Numbers**:
   - **ACCS Agency Head Office / 24/7 Hotline**: **`+1 (416) 694-7445`**. All emergency backpack wallet cards, Ministry audit binders, headers, letters, and agency footer references must strictly use `+1 (416) 694-7445`.
   - **Licensed Provider Contact Numbers**: Provided directly by each individual licensed home provider during provider registration & contract onboarding (unique per home). If unassigned or pending, displays `"To be provided by Provider"`.

---

## 📌 Master Implementation Roadmap & Task Backlog
The canonical, real-time implementation backlog, task acceptance criteria, non-binary progress dashboards, and client note traceability matrices reside exclusively in:
👉 **[TODO.md](file:///C:/Projects/allchildcaresolutions/TODO.md)**

All active work, architectural milestones, and client feedback synthesis are maintained solely in `TODO.md` to prevent duplicate maintenance, eliminate discrepancies, and protect agent context window tokens.


