# Ledger

### An AI-powered tax review workspace built around traceability, clear next actions, and human control.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-persistent-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)

> Candidate case study for an AI Engineer role. The frontend is a working,
> clickable product; AI outputs and source documents are intentionally simulated
> so the prototype can focus on interaction design, trust, and workflow.

![Ledger preparer dashboard](public/screenshots/dashboard-preparer.png)

## The product

Tax software often asks professionals to trust a number without making it easy to
answer the questions that matter:

- Where did this value come from?
- What changed, and why did AI flag it?
- What evidence supports the recommendation?
- Who needs to act next?
- Can I safely accept, reject, or correct it?

I designed Ledger as one connected CPA workflow instead of a collection of
unrelated feature demos:

```text
Prioritized dashboard
        ↓
Return status + next owner
        ↓
Fields ↔ Documents ↔ AI flags ↔ Requests ↔ Activity
        ↓
Human decision, persistence, and audit trail
```

The result is a focused review workspace where every AI recommendation is
explainable, every important value is traceable, and every decision remains under
human control.

## Product tour

### 1. Actionable work, not dashboard decoration

The landing page ranks returns by urgency—**Overdue**, **Due This Week**,
**Needs Your Review**, and **On Track**—then shows the owner and next action on
every card. A preparer sees their queue; a firm administrator sees all preparers
and can narrow the view.

<p align="center">
  <img src="public/screenshots/dashboard-preparer.png" alt="Preparer dashboard showing urgency-ranked returns" width="49%" />
  <img src="public/screenshots/dashboard-admin.png" alt="Firm administrator dashboard showing all preparers" width="49%" />
</p>

### 2. Shared status and clear ownership

Each return has a five-stage progress model—**Documents → Preparation → Review →
Ready → Filed**—plus one unambiguous next-action line. Tabs preserve context while
the reviewer moves among fields, documents, flags, requests, and activity.

![Return review workspace](public/screenshots/return-review.png)

### 3. Every number can defend itself

Selecting **View source** reveals the source document, exact page, extracted value,
and any calculation applied. The trace is attached to the field, so review never
loses its context.

![Source document trace showing document, page, extracted value, and calculation](public/screenshots/source-trace.png)

### 4. AI that explains before it asks for trust

AI flags include:

- A plain-language issue statement
- Confidence with a visual uncertainty signal
- Reasoning that explains the comparison
- Supporting evidence
- A recommended next action
- Explicit **Accept**, **Reject**, and **Edit manually** controls

Every action updates the field, persists through the API, and creates an activity
record. Reviewers receive the same evidence but read-only controls.

![Trustworthy AI review dialog](public/screenshots/ai-review.png)

### 5. Collaboration stays attached to the work

Requests and notes are tied to the return and can link directly to a field,
document, or AI flag. Internal notes are visually distinct from client-visible
requests, and each open item names who owes the next action.

![Contextual requests and notes](public/screenshots/collaboration.png)

## Role-aware experience

The top-right switcher demonstrates how one product shell adapts for different
firm responsibilities:

| Demo user | Role | Experience |
| --- | --- | --- |
| **Sarah Kim** | CPA / Preparer | Assigned return queue; full Accept, Reject, Edit, and manual field correction |
| **David Torres** | Reviewer | Firm-wide visibility and audit history; AI decisions are read-only |
| **Priya Nair** | Firm Admin | Firm-wide dashboard with an explicit **All Preparers** filter; full action access |

This is intentionally a frontend role simulation rather than production
authentication. The UI communicates permissions clearly without pretending the
prototype includes a real identity system.

## Case-study challenge coverage

I prioritized a cohesive professional workflow over ten disconnected screens.

| # | Challenge | Coverage | Demonstrated by |
| --- | --- | --- | --- |
| 01 | Source Document Traceability | **Deep** | Field → document → page → extracted value → calculation |
| 02 | Client & CPA Collaboration | **Scoped** | Contextual requests, internal/client visibility, next owner |
| 03 | Where to Start | **Deferred** | The prototype is intentionally CPA-first; client onboarding is a future surface |
| 04 | Navigation & Context | **Deep** | Breadcrumbs, tabs, and `?tab=` / `?flag=` deep links |
| 05 | Role-Aware Experiences | **Firm-side** | Preparer, reviewer, and admin views |
| 06 | Return Status & Progress | **Deep** | Shared stepper, completeness, blockers, and next owner |
| 07 | Actionable Dashboard | **Deep** | Date/flag-based urgency logic and action-oriented cards |
| 08 | Clickable vs. Editable | **Deep** | Five field states, persistent legend, real editable-field flow |
| 09 | Complexity Made Navigable | **Focused** | Summary/detail hierarchy and field filters; large-volume search is deferred |
| 10 | Trustworthy AI | **Deep** | Confidence, reasoning, evidence, correction controls, audit trail |

### Why I did not fake all ten

The brief values a genuinely testable interface and defensible decisions over
exhaustive shallow coverage. A full client-onboarding application and a
hundreds-of-documents search product would be separate product surfaces. I chose
to make the CPA review loop complete, honest, and demonstrable instead.

## How I built it

### 1. Started with the workflow, not the screens

I first modeled the job a CPA is trying to complete:

1. Identify the most urgent return.
2. Understand current status and ownership.
3. Review fields that require attention.
4. Trace a value to evidence.
5. Understand and resolve an AI recommendation.
6. Preserve the decision for the next reviewer.

That sequence became the information architecture and kept each challenge
connected to the next.

### 2. Defined a small but varied domain model

The seed dataset includes:

- 6 individual and business clients
- 8 returns across five statuses
- 22 source documents
- 48 return fields across five interaction states
- 4 AI flags with different confidence/evidence patterns
- Internal notes, client requests, clean returns, overdue work, and resolved states

The variety makes the prototype testable beyond a single happy path.

### 3. Built the frontend against typed mock contracts

I established TypeScript models for clients, returns, documents, fields, AI
flags, and audit entries. Those contracts let the frontend interaction system
stabilize before database work, while keeping the later API migration predictable.

### 4. Added a real persistence path

The finished app uses PostgreSQL and Prisma. Server Components load the initial
view, Client Components manage interaction, and route handlers persist field/flag
decisions and write audit entries.

```mermaid
flowchart LR
    User[CPA or reviewer] --> UI[Next.js UI]
    UI --> Server[Server Components]
    UI --> API[Route handlers]
    Server --> Data[Data access layer]
    API --> Prisma[Prisma ORM]
    Data --> Prisma
    Prisma --> DB[(PostgreSQL)]
    API --> Audit[Audit log entry]
    Audit --> DB
```

### 5. Polished trust-critical state changes

Accept, Reject, Edit, and manual correction include loading states, action-specific
toasts, field-state transitions, and an animated audit entry. Invalid IDs, empty
flags, slow navigation, and database errors have explicit fallback states.

## Interaction language

Ledger never relies on color alone. Every field state combines a left border,
icon, label, value treatment, and interaction behavior:

| State | Meaning | Interaction |
| --- | --- | --- |
| **AI-generated** | Extracted or calculated by AI | Inspect source/calculation |
| **Verified** | Confirmed against evidence | Read-only settled value |
| **Editable** | Open for a human correction | Click → edit → save and verify |
| **Needs approval** | Requires professional judgment | Open AI reasoning and decide |
| **Locked** | Fixed by rule or prior filing | Read-only with lock cue |

## What is real vs. simulated

### Genuinely wired

- Next.js App Router frontend with Server and Client Components
- PostgreSQL database through Prisma ORM
- API routes for returns, flags, field edits, and audit history
- Persistent Accept / Reject / Edit flows
- Manual field corrections with audit entries
- Due-date and pending-flag prioritization logic
- Role-aware frontend views
- Loading skeletons, error boundaries, empty states, animations, and toasts

### Intentionally simulated

- AI confidence, reasoning, evidence, and recommendations are authored fixtures
- “Edit manually” generates a plausible corrected value through a stub
- Document OCR and PDFs are represented by trace metadata and thumbnails
- Role switching uses React Context; there is no real authentication
- Collaboration threads are seeded frontend data, not a messaging backend

This boundary is deliberate: the assessment asks how AI output should be
presented and trusted, not for a production OCR or model-training pipeline.

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

## Tech stack

- **Frontend:** Next.js 16, React 19, TypeScript
- **UI:** Tailwind CSS v4, shadcn/ui, Lucide icons, Sonner
- **Data:** PostgreSQL, Prisma 7, `pg`
- **Tooling:** pnpm, ESLint, Docker Compose

## Run locally

### Prerequisites

- Node.js **20.9+**
- [pnpm](https://pnpm.io/)
- Docker Desktop

### Setup

```bash
git clone https://github.com/Nithishkaranam2002/Ledger.git
cd Ledger

pnpm install
docker compose up -d
cp .env.example .env

pnpm db:deploy
pnpm db:seed
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). If that port is occupied,
Next.js will print the alternate local URL.

The default local database URL is:

```env
DATABASE_URL="postgresql://postgres:ledger@localhost:5435/ledger"
```

### Useful commands

```bash
pnpm dev          # Start development server
pnpm build        # Generate Prisma client + production build
pnpm lint         # Run ESLint across the project
pnpm db:deploy    # Apply tracked migrations
pnpm db:seed      # Reset and seed deterministic demo data
```

## Deploy

The repository is prepared for Vercel. `prisma generate` runs during install and
build.

1. Create hosted PostgreSQL (Neon, Vercel Postgres, or equivalent).
2. Apply and seed it:

```bash
DATABASE_URL="postgresql://...?...sslmode=require" pnpm db:deploy
DATABASE_URL="postgresql://...?...sslmode=require" pnpm db:seed
```

3. Import this GitHub repository into Vercel.
4. Add `DATABASE_URL` to Production (and Preview if desired).
5. Deploy with Node.js 20.x.

## Verification

The current submission has been checked with:

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

Recommended smoke test:

1. Dashboard loads role-scoped returns.
2. `/returns/return-01` shows two pending flags.
3. Accept a flag and refresh—the state and Activity Log persist.
4. Switch to David Torres—the dialog becomes read-only.
5. `/returns/return-05` shows the clean zero-flags state.

## Design tradeoffs and next steps

Given more time, I would:

1. Add a true split-pane PDF viewer with highlighted source coordinates.
2. Add a client-first onboarding surface for challenge 03.
3. Generate a high-volume document corpus and add full-text/filter search.
4. Replace the role simulation with authenticated, server-enforced permissions.
5. Add automated component, API, accessibility, and visual-regression tests.
6. Add an AI evaluation harness for extraction quality, confidence calibration,
   correction rate, and reviewer agreement.

For this assessment, I deliberately kept OCR, AI generation, authentication, and
messaging simulated while making the core review workflow real, persistent, and
fully clickable.

---

Built by **Nithish Karanam** for the AI Engineer case study · July 2026
