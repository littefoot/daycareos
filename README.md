# DaycareOS

**Modern Licensed Child Care Operating System, Admissions CRM & Compliance Platform**

DaycareOS is a high-performance, modular operating system designed for licensed child care agencies, home daycare networks, and early learning providers. It unifies admissions CRM, regulatory ratio balancing, daily attendance, family onboarding, and compliance inspection workflows into a cohesive, responsive web application.

- **Live Showcase**: [https://daycare-os-2026.web.app](https://daycare-os-2026.web.app)
- **GitHub Repository**: [https://github.com/littefoot/daycareos](https://github.com/littefoot/daycareos)
- **Design System**: Tactile Neo-Brutalist (`border-2 border-slate-900`, `shadow-neo`), light-themed canvas, zero emojis (Lucide SVG icons).
- **Mobile Responsive**: Fully responsive across ultra-narrow viewports (360px–412px portrait) and desktop monitors with zero horizontal overflow.

---

## 1. Multi-Portal Architecture

DaycareOS provides a role-based multi-portal architecture accessible via the instant role switcher in the global header:

### 1.1 Admin Command Centre
- **Executive Operations Matrix**: Real-time status for regulatory policies, enrolled capacity, monthly fee collection, and urgent compliance items.
- **Deterministic Action Queue**: Automated 30-day alerts for expiring medical/immunization records, overdue parent fee settlements, and pending screening calls.
- **Admissions Pipeline (Kanban)**: 5-stage intake tracking (*Inquiry ➔ Screening ➔ Docs Needed ➔ Matching ➔ Enrolled*).
- **Directory Hubs**: Comprehensive searchable rosters for Families, Children, Licensed Providers, and Field Visitors.
- **Financial Ledger & Invoicing**: Automated monthly billing generator, Interac e-transfer roster, fee statement generator, and tax slip (T4A) distribution.
- **Dynamic Form Studio & Document Bin**: Browse, preview, and dispatch standardized digital intake templates and PDF documents.

### 1.2 Licensed Provider Hub
- **2-Tap Daily Attendance**: Fast tap-in (arrival) and tap-out (departure) logging with authorized guardian tracking and timestamp logging.
- **Safety & Anaphylaxis Quick Badges**: Immediate visual alerts for critical allergies and emergency medical protocols.
- **Physical Compliance Binder Hub**: On-demand printable packet generator for provider home binders, monthly attendance logs, and emergency backpack wallet cards.
- **Monthly Timesheets**: Digital submission with electronic signatures and auto-calculated net daily care hours.

### 1.3 Parent Registration & Care Portal
- **5-Step Onboarding Stepper**:
  1. *Inquiry & Pre-Screening*: Rapid parent intake questionnaire.
  2. *Digital Intake Forms*: Interactive document forms and statutory document upload slots (Birth Certificate, Health Card, Immunization Card).
  3. *Provider Matching*: Placement matching with verified home providers.
  4. *Contract & Terms*: Digital e-signature on fee schedules and agency agreements.
  5. *Active Care Hub*: Daily arrival/departure check-in log, daily meal plans, and monthly fee statements.

### 1.4 Field Visitor Inspection Portal
- **Quarterly Inspection Protocols**: Unannounced on-site inspection logging with 90-day compliance tracking.
- **Headcount & Ratio Reconciliation**: Real-time headcount calculations verifying total group size and infant/toddler age sub-caps.
- **Digital Sign-Off**: Dual tamper-evident digital legal signatures (Visitor + Provider) with offline queue synchronization.

### 1.5 Dockable AI Copilot
- **Responsive Split-View Canvas**: Side-docking panel that compresses the main application canvas (75% / 25% or 66% / 33% split) to eliminate modal overlays.
- **PII Privacy Sanitizer**: Automatic client-side scrubbing of health numbers, surnames, phone numbers, and addresses prior to external LLM processing.
- **Regulatory & Capacity Queries**: Instant assistance for policy lookups, capacity balancing, and backlog organization.

---

## 2. Technical Stack

- **Frontend Framework**: React 18, Vite, TypeScript
- **Styling**: Tailwind CSS with custom neo-brutalist utility tokens (`border-2 border-slate-900`, `shadow-neo`, `shadow-neo-sm`)
- **Iconography**: Lucide React vector icons (zero raw text emojis)
- **Data Layer**: Reactive in-browser database engine (`clientDb.ts`) backed by `localStorage` and memory stores with instant demo data seeding
- **Lead Synchronization**: Automated CRM sync pipeline dispatching demo inquiries to central CRM endpoints
- **Hosting & Infrastructure**: Firebase Hosting (`daycare-os-2026`)

---

## 3. Local Development

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm

### Setup & Run
```bash
# 1. Clone the repository
git clone https://github.com/littefoot/daycareos.git
cd daycareos

# 2. Install dependencies
npm install

# 3. Start the local development server
npm run dev

# 4. Open in browser
# DaycareOS runs at: http://localhost:5174/ (or http://localhost:5175/)
```

### Build & Validate
```bash
# Typecheck and production bundle build
npm run build

# Preview production build locally
npm run preview
```

---

## 4. Deployment

DaycareOS deploys to Firebase Hosting:

```bash
# 1. Build the production bundle
npm run build

# 2. Deploy hosting target to Firebase
firebase deploy --only hosting --project daycare-os-2026
```

---

## 5. License

MIT License. Designed and maintained for modern child care agency operations.
