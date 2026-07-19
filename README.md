# Ledger

### An AI-powered tax review workspace built around traceability, clear next actions, and human control.

[![Live Demo](https://img.shields.io/badge/Live_Demo-ledger--rho--vert.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://ledger-rho-vert.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Nithishkaranam2002%2FLedger-181717?style=for-the-badge&logo=github)](https://github.com/Nithishkaranam2002/Ledger)

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=flat-square&logo=vercel)](https://ledger-rho-vert.vercel.app)

**Live app:** [https://ledger-rho-vert.vercel.app](https://ledger-rho-vert.vercel.app)

> Candidate case study for an AI Engineer role. The frontend is a working,
> clickable product with a real Postgres database. AI outputs and source
> documents are intentionally simulated so the prototype can focus on
> interaction design, trust, and workflow.

![Ledger preparer dashboard](public/screenshots/dashboard-preparer.png)

---

## Try it in 60 seconds

1. Open **[https://ledger-rho-vert.vercel.app](https://ledger-rho-vert.vercel.app)**
2. Open the highest-urgency return (e.g. **return-01**)
3. Go to **Flags** → open a pending AI flag → **Accept**
4. Refresh — the decision stays, and an **Activity** entry is written
5. Switch the top-right user to **David Torres** — the same dialog becomes read-only

Hosted on **Vercel** with **Neon** PostgreSQL. Accept / Reject / Edit and manual field edits persist across refreshes.

---

## The product

Tax software often asks professionals to trust a number without making it easy to answer the questions that matter:

- Where did this value come from?
- What changed, and why did AI flag it?
- What evidence supports the recommendation?
- Who needs to act next?
- Can I safely accept, reject, or correct it?

Ledger is one connected CPA workflow — not a set of disconnected feature demos:

```text
Prioritized dashboard
        ↓
Return status + next owner
        ↓
Fields ↔ Documents ↔ AI flags ↔ Requests ↔ Activity
        ↓
Human decision → persistence → audit trail
```

Every AI recommendation is explainable, every important value is traceable, and every decision stays under human control.

---

## Product tour

### 1. Actionable work, not dashboard decoration

Returns are ranked by urgency — **Overdue**, **Due This Week**, **Needs Your Review**, and **On Track** — with owner and next action on every card. Preparers see their queue; firm admins see all preparers and can filter.

<p align="center">
  <img src="public/screenshots/dashboard-preparer.png" alt="Preparer dashboard showing urgency-ranked returns" width="49%" />
  <img src="public/screenshots/dashboard-admin.png" alt="Firm administrator dashboard showing all preparers" width="49%" />
</p>

### 2. Shared status and clear ownership

Each return uses a five-stage model — **Documents → Preparation → Review → Ready → Filed** — plus one unambiguous next-action line. Tabs keep context while moving among fields, documents, flags, requests, and activity.

![Return review workspace](public/screenshots/return-review.png)

### 3. Every number can defend itself

**View source** reveals the source document, exact page, extracted value, and any calculation applied — attached to the field so review never loses context.

![Source document trace showing document, page, extracted value, and calculation](public/screenshots/source-trace.png)

### 4. AI that explains before it asks for trust

AI flags include a plain-language issue, confidence, reasoning, evidence, a recommended action, and explicit **Accept** / **Reject** / **Edit manually** controls. Every action updates the field, persists through the API, and writes an activity record. Reviewers get the same evidence with read-only controls.

![Trustworthy AI review dialog](public/screenshots/ai-review.png)

### 5. Collaboration stays attached to the work

Requests and notes are tied to the return and can link to a field, document, or flag. Internal notes are visually distinct from client-visible requests; each open item names who owes the next action.

![Contextual requests and notes](public/screenshots/collaboration.png)

---

## Role-aware experience

The top-right switcher shows how one product shell adapts for different firm responsibilities:

| Demo user | Role | Experience |
| --- | --- | --- |
| **Sarah Kim** | CPA / Preparer | Assigned queue; full Accept, Reject, Edit, and manual field correction |
| **David Torres** | Reviewer | Firm-wide visibility and audit history; AI decisions are read-only |
| **Priya Nair** | Firm Admin | Firm-wide dashboard with an **All Preparers** filter; full action access |

This is a frontend role simulation, not production authentication — permissions are communicated clearly without claiming a full identity system.

---

## Case-study challenge coverage

I prioritized a cohesive professional workflow over ten disconnected screens.

| # | Challenge | Coverage | Demonstrated by |
| --- | --- | --- | --- |
| 01 | Source Document Traceability | **Deep** | Field → document → page → extracted value → calculation |
| 02 | Client & CPA Collaboration | **Scoped** | Contextual requests, internal/client visibility, next owner |
| 03 | Where to Start | **Deferred** | CPA-first prototype; client onboarding is a future surface |
| 04 | Navigation & Context | **Deep** | Breadcrumbs, tabs, and `?tab=` / `?flag=` deep links |
| 05 | Role-Aware Experiences | **Firm-side** | Preparer, reviewer, and admin views |
| 06 | Return Status & Progress | **Deep** | Shared stepper, blockers, and next owner |
| 07 | Actionable Dashboard | **Deep** | Date/flag-based urgency and action-oriented cards |
| 08 | Clickable vs. Editable | **Deep** | Five field states, legend, real editable-field flow |
| 09 | Complexity Made Navigable | **Focused** | Summary/detail hierarchy and field filters |
| 10 | Trustworthy AI | **Deep** | Confidence, reasoning, evidence, correction, audit trail |

### Why I did not fake all ten

The brief values a genuinely testable interface and defensible decisions over exhaustive shallow coverage. I made the CPA review loop complete, honest, and demonstrable instead of shipping ten thin screens.

---

## How I built it

1. **Workflow first** — Model the CPA job (urgent return → status → field review → trace → AI decision → audit), then design IA around that sequence.
2. **Typed domain model** — Clients, returns, documents, fields, flags, and audit entries as TypeScript contracts so the UI could stabilize before the database.
3. **Varied seed data** — 6 clients, 8 returns, 22 documents, 48 fields, 4 AI flags, plus overdue work, clean returns, and resolved states.
4. **Real persistence** — PostgreSQL + Prisma; Server Components for the initial view; route handlers for decisions and audit entries.
5. **Trust-critical polish** — Loading states, action-specific toasts, field-state transitions, empty/error fallbacks.

```mermaid
flowchart LR
    User[CPA or reviewer] --> UI[Next.js UI]
    UI --> Server[Server Components]
    UI --> API[Route handlers]
    Server --> Data[Data access layer]
    API --> Prisma[Prisma ORM]
    Data --> Prisma
    Prisma --> DB[(Neon PostgreSQL)]
    API --> Audit[Audit log entry]
    Audit --> DB
```

---

## Interaction language

Ledger never relies on color alone. Every field state combines a left border, icon, label, value treatment, and interaction behavior:

| State | Meaning | Interaction |
| --- | --- | --- |
| **AI-generated** | Extracted or calculated by AI | Inspect source/calculation |
| **Verified** | Confirmed against evidence | Read-only settled value |
| **Editable** | Open for a human correction | Click → edit → save and verify |
| **Needs approval** | Requires professional judgment | Open AI reasoning and decide |
| **Locked** | Fixed by rule or prior filing | Read-only with lock cue |

---

## What is real vs. simulated

### Genuinely wired

- Next.js App Router with Server and Client Components
- Neon PostgreSQL through Prisma ORM (production) / local Postgres (Docker)
- API routes for returns, flags, field edits, and audit history
- Persistent Accept / Reject / Edit and manual field corrections
- Due-date and pending-flag prioritization
- Role-aware frontend views
- Loading skeletons, error boundaries, empty states, animations, toasts
- Production deploy on Vercel

### Intentionally simulated

- AI confidence, reasoning, evidence, and recommendations (authored fixtures)
- “Edit manually” correction values (plausible stub)
- Document OCR / PDFs (trace metadata and thumbnails)
- Role switching (React Context — no real auth)
- Collaboration threads (seeded frontend data)

This boundary is deliberate: the assessment asks how AI output should be presented and trusted, not for a production OCR or model-training pipeline.

---

## Architecture

```text
src/
├── app/
│   ├── api/                         # Returns, flags, fields, audit log
│   ├── returns/[id]/                # Return review route + loading/404
│   └── page.tsx                     # Dashboard route
├── components/
│   ├── dashboard/                   # Prioritized return queue
│   ├── returns/                     # Review, trace, AI, status, activity
│   └── ui/                          # shadcn/ui primitives
└── lib/
    ├── data/returns.ts              # Shared server-side queries
    ├── mock-data/                   # Seed fixtures + collaboration demo
    ├── urgency.ts                   # Prioritization logic
    ├── return-progress.ts           # Status and next-action logic
    ├── serializers.ts               # DB → wire-format mapping
    └── current-user-context.tsx     # Demo role context

prisma/
├── schema.prisma                    # Relational domain model
├── migrations/                      # Reproducible schema
└── seed.ts                          # Deterministic demo data
```

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript |
| UI | Tailwind CSS v4, shadcn/ui, Lucide, Sonner |
| Data | PostgreSQL (Neon in production), Prisma 7, `pg` |
| Hosting | Vercel |
| Local run | pnpm, Docker Compose (full app + DB) |

---

## Run locally

### Option A — One command (Docker)

```bash
git clone https://github.com/Nithishkaranam2002/Ledger.git
cd Ledger
docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000).  
If port 3000 is busy: `APP_PORT=3010 DB_PORT=5436 docker compose up --build`

Compose boots Postgres, applies migrations, seeds demo data, and serves the production Next.js build.

### Option B — Local development

**Prerequisites:** Node.js **20.9+**, [pnpm](https://pnpm.io/), Docker Desktop

```bash
git clone https://github.com/Nithishkaranam2002/Ledger.git
cd Ledger

pnpm install
docker compose up -d db
cp .env.example .env

pnpm db:deploy
pnpm db:seed
pnpm dev
```

Default local database URL:

```env
DATABASE_URL="postgresql://postgres:ledger@localhost:5435/ledger"
```

### Useful commands

```bash
pnpm dev          # Development server
pnpm build        # Prisma generate + production build
pnpm lint         # ESLint
pnpm db:deploy    # Apply migrations
pnpm db:seed      # Reset and seed demo data
```

---

## Deploy

**Production is live:** [https://ledger-rho-vert.vercel.app](https://ledger-rho-vert.vercel.app)

Stack: **Vercel** (Next.js) + **Neon** (Postgres). `DATABASE_URL` is set in Vercel Production. `prisma generate` runs on install and build.

To redeploy from your machine:

```bash
vercel --prod
```

To recreate the hosted database:

```bash
export DATABASE_URL="postgresql://...?...sslmode=require"
pnpm db:deploy
pnpm db:seed
vercel env add DATABASE_URL production
vercel --prod
```

---

## Verification

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

Recommended smoke test (works on the [live demo](https://ledger-rho-vert.vercel.app) or locally):

1. Dashboard loads role-scoped returns
2. `/returns/return-01` shows pending flags
3. Accept a flag and refresh — state and Activity Log persist
4. Switch to David Torres — AI dialog becomes read-only
5. `/returns/return-05` shows the clean zero-flags state

---

## Design tradeoffs and next steps

Given more time, I would:

1. Add a true split-pane PDF viewer with highlighted source coordinates
2. Add a client-first onboarding surface for challenge 03
3. Generate a high-volume document corpus with full-text / filter search
4. Replace role simulation with authenticated, server-enforced permissions
5. Add component, API, accessibility, and visual-regression tests
6. Add an AI evaluation harness (extraction quality, confidence calibration, correction rate, reviewer agreement)

For this assessment, OCR, AI generation, authentication, and messaging stay simulated while the core review workflow is real, persistent, and fully clickable.

---

Built by **[Nithish Karanam](https://github.com/Nithishkaranam2002)** for the AI Engineer case study · July 2026

**Live demo:** [https://ledger-rho-vert.vercel.app](https://ledger-rho-vert.vercel.app) · **Source:** [github.com/Nithishkaranam2002/Ledger](https://github.com/Nithishkaranam2002/Ledger)
