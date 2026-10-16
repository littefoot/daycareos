# DaycareOS

**The Modern Licensed Child Care Operating System, Admissions CRM & Compliance Platform**

DaycareOS is a sovereign, modular, and high-performance web platform engineered for licensed child care agencies, home daycare networks, early childhood learning centres, and child care administrators. It consolidates admissions CRM, statutory age-ratio compliance, daily attendance, family onboarding, field quality inspections, and financial ledgers into a cohesive, tactile web application.

- **Live Showcase**: [https://daycare-os-2026.web.app](https://daycare-os-2026.web.app)
- **GitHub Repository**: [https://github.com/littefoot/daycareos](https://github.com/littefoot/daycareos)
- **Design Philosophy**: Tactile Neo-Brutalism (`border-2 border-slate-900`, `shadow-neo`), warm light-mode canvas (`#fdfbf7`), high-contrast typography, and zero raw text emojis (pure Lucide SVG vectors).
- **Mobile Responsive**: Fully optimized across compact mobile viewports (360px–412px) through 4K displays with zero horizontal overflow.

---

## 1. System Overview

Child care management often suffers from fragmented spreadsheets, paper binders, and disconnected communication channels. DaycareOS unifies the entire operating lifecycle into four purpose-built portals sharing a reactive data engine:

```
┌────────────────────────────────────────────────────────────────────────┐
│                               DaycareOS                                │
│                     Global Role Switcher & Header                      │
└──────┬───────────────────┬───────────────────┬───────────────────┬─────┘
       │                   │                   │                   │
┌──────▼────────┐   ┌──────▼────────┐   ┌──────▼────────┐   ┌──────▼────────┐
│ Admin Command │   │   Educator    │   │ Family Care   │   │ Field Quality │
│    Centre     │   │ & Provider Hub│   │   & Portal    │   │ & Compliance  │
└───────────────┘   └───────────────┘   └───────────────┘   └───────────────┘
```

1. **Admin Command Centre**: Executive admissions CRM, deterministic action queue, live capacity visualizer, financial ledger, and dynamic form studio.
2. **Licensed Provider Hub**: Two-tap arrival/departure attendance, allergy and medical emergency badges, monthly timesheets, and physical binder generators.
3. **Parent Registration & Care Portal**: Five-step digital enrollment stepper, statutory document vault, provider placement matching, and active care logs.
4. **Field Visitor & Compliance Portal**: Unannounced quarterly quality audits, physical headcount reconciliation, dual digital sign-offs, and offline dead-zone synchronization.
5. **Dockable AI Copilot**: Non-intrusive side-docking copilot that compresses the main canvas (75% / 25% split) with client-side PII sanitization for compliance inquiries, ratio balancing, and administrative workflows.

---

## 2. Core Capabilities

### 2.1 Admissions CRM & Pipeline
- **5-Stage Kanban Workflow**: Visual tracking from Initial Inquiry ➔ Screening Call ➔ Document Verification ➔ Provider Matching ➔ Active Enrollment.
- **Deterministic Action Queue**: Automated 30-day proactive alerts highlighting expiring immunizations, pending intake screening calls, overdue tuition fees, and home vacancies.
- **Intake Screening**: Structured preliminary discovery notes that gate access to formal enrollment documentation.

### 2.2 Regulatory Ratio & Capacity Engine
- **Mixed-Age Capacity Calculator**: Enforces statutory group limits (e.g. maximum group capacity alongside strict infant and toddler sub-caps).
- **Educator's Own Children Accounting**: Automatically tracks and deducts on-premises educator children from available capacity.
- **Real-Time Visualizer**: Instant color-coded badges indicating current occupancy, remaining spots, and age-bracket availability per facility.

### 2.3 Attendance & Emergency Safety
- **2-Tap Attendance Workflow**: Fast, timestamped check-in (arrival) and check-out (departure) logging.
- **Authorized Pick-Up Verification**: Explicit logging of departing adult identity to safeguard child whereabouts and liability.
- **Critical Medical Badges**: Prominent visual indicators for anaphylaxis, EpiPen locations, asthma, and dietary restrictions.
- **Backpack Emergency Wallet Cards**: One-click printable wallet cards with scissor cut-lines, emergency contacts, health card numbers, and allergy alerts for field trips and daily walks.

### 2.4 Financial Ledger & Tuition Billing
- **Flexible Fee Schedules**: Built-in support for parent daily/monthly rates, regional early learning subsidies, and private-pay models.
- **Automated Billing Generation**: Calculates monthly tuition using standard calendar and attendance formulas.
- **Payment Reconciliation**: Payment tracking across electronic transfers, credit/debit rails, and direct vouchers.
- **Audit Reports & Tax Receipts**: Generates end-of-year tax statements and child care fee receipts.

### 2.5 Compliance Documentation & Physical Binders
- **Dynamic Form Studio**: Visual builder and distribution shelf for digital agency templates and statutory policies.
- **Physical Audit Binder Exporter**: 1-click printable packet compiling approved licensed capacities, child rosters, premise addresses, and emergency procedures with barcode indexing.
- **Tamper-Evident Signatures**: Dual electronic signatures captured directly on touchscreen or mouse canvas for inspections and timesheet approvals.

### 2.6 Offline-First Field Auditing
- **Dead-Zone Storage**: Field inspectors visiting remote or basement facilities can complete full inspection checklists without internet access.
- **IndexedDB Sync Engine**: Inspection records queue locally with automatic background synchronization once connectivity is restored.

---

## 3. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 18, Vite, TypeScript |
| **Styling & Design System** | Tailwind CSS with Neo-Brutalist design tokens (`border-2 border-slate-900`, `shadow-neo`, `shadow-neo-sm`) |
| **Iconography** | Lucide React SVG vectors (Zero raw text emojis) |
| **Data & State Management** | Reactive client-side database (`clientDb.ts`) with localStorage persistence and instant demo seeding |
| **Offline Synchronization** | Browser IndexedDB queue with graceful storage fallbacks |
| **Privacy & Security** | Client-side PII sanitizer (scrubs health card numbers, phone numbers, and addresses before AI prompt dispatch) |
| **Hosting & Deployment** | Firebase Hosting (`daycare-os-2026`) |

---

## 4. Local Development

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm

### Quick Start
```bash
# 1. Clone the repository
git clone https://github.com/littefoot/daycareos.git
cd daycareos

# 2. Install dependencies
npm install

# 3. Launch local development server
npm run dev

# 4. Open DaycareOS in your browser
# The local development server will be active at http://localhost:5174/ or http://localhost:5175/
```

### Build & Typecheck
```bash
# Verify TypeScript types and generate production bundle
npm run build

# Preview the production build locally
npm run preview
```

---

## 5. Deployment

DaycareOS is pre-configured for automated deployment to Firebase Hosting:

```bash
# 1. Build the production bundle
npm run build

# 2. Deploy to Firebase Hosting
firebase deploy --only hosting --project daycare-os-2026
```

---

## 6. Directory Structure

```
daycare-os/
├── public/                 # Static assets, logos, and icons
├── src/
│   ├── components/         # Modular application views
│   │   ├── admin/          # Admin Command Centre, CRM pipeline, and ledgers
│   │   ├── provider/       # Provider Hub, attendance, and timesheets
│   │   ├── parent/         # Parent Onboarding and Active Care portal
│   │   ├── visitor/        # Field Visitor inspection checklists and sign-offs
│   │   ├── chat/           # Dockable AI Copilot and PII privacy engine
│   │   └── common/         # Neo-brutalist buttons, inputs, date pickers, and modals
│   ├── lib/                # Reactive client database and state management
│   ├── types/              # Comprehensive TypeScript interfaces and domain models
│   ├── utils/              # Offline IndexedDB sync, time helpers, and formatters
│   ├── App.tsx             # Root application orchestrator and portal switcher
│   ├── index.css           # Neo-brutalist Tailwind tokens and component layers
│   └── main.tsx            # Application entrypoint
├── firebase.json           # Firebase Hosting configuration
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Custom theme, colors, and shadows
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite build and dev server configuration
```

---

## 7. License

MIT License. Engineered for modern, reliable, and compliant child care operations.
