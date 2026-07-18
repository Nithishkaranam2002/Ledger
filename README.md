# Ledger

An AI-powered tax platform prototype for CPAs. Built from scratch for the AI Engineer
case study. Ledger is designed around one question a preparer asks all day —
*"can I trust this number, and what should I do about it?"* — and answers it with
traceable source documents, a consistent affordance system, transparent AI, and an
action-oriented dashboard.

This is a **working, clickable prototype**, not production software. The AI is
simulated; the app underneath it is real (Next.js + Postgres + Prisma).

**Repo:** https://github.com/Nithishkaranam2002/Ledger

## 5-minute walkthrough (for reviewers)

1. Open the **dashboard** — returns are urgency-ranked (Overdue → Due This Week → Needs Review → On Track). Each card shows a **Next:** owner + reason.
2. Switch users (top-right): **Sarah Kim** (preparer queue) → **David Torres** (firm-wide, read-only flags) → **Priya Nair** (All Preparers filter).
3. Open **Margaret Chen** (`/returns/return-01`):
   - Status stepper + **Next** line (client request / AI flags / ownership)
   - Tabs: **Fields | Documents | Flags | Requests | Activity**
   - Click a value with “View source” → document, page, calculation path
   - Open an AI flag → confidence, reasoning, evidence, Accept / Reject / Edit (persists + audit log)
   - **Requests** tab → internal vs client-visible threads tied to fields/flags
4. Deep link: `/returns/return-01?tab=flags&flag=flag-01` opens the flag in context.
5. Open **Elena Vasquez** (`/returns/return-05`) for the clean empty-flags state.

## Challenges covered

The brief lists ten challenges. Ledger goes deep on a **coherent CPA workflow** rather than ten disconnected demos:

| # | Challenge | Status | Where to see it |
|---|-----------|--------|-----------------|
| 01 | Source Document Traceability | **Built** | Field → “View source” → document, page, calculation |
| 02 | Client & CPA Collaboration | **Built (scoped)** | Requests tab — internal vs client threads, next owner, links to flags |
| 03 | Where to Start (client first-run) | **Deferred** | CPA-first product; client onboarding called out as next surface |
| 04 | Navigation / context | **Built** | Breadcrumbs, section tabs, `?tab=` / `?flag=` deep links |
| 05 | Role-Aware Experiences | **Built (firm-side)** | Preparer / Reviewer / Firm Admin switcher |
| 06 | Return Status & Progress | **Built** | Stepper + shared Next owner/reason on detail + cards |
| 07 | Actionable Dashboard | **Built** | Urgency buckets + prioritization logic |
| 08 | Clickable vs. Editable | **Built** | Five field states + legend; editable fields open a real edit dialog |
| 09 | Complexity Made Navigable | **Lite** | Field filters (All / Needs attention / AI-generated / Has source); full “hundreds of docs” scale deferred |
| 10 | Trustworthy AI | **Built** | Confidence, reasoning, evidence, Accept/Reject/Edit + audit log |

**Why not all ten fully?** The brief rewards a real clickable product and defensible decisions over exhaustive shallow coverage. 03 (client onboarding) and full 09 (volume search) would splinter into separate products; they are honest future extensions, not faked screens.

## What's real vs. simulated

**Real (genuinely wired up):**
- Next.js App Router (Server Components for fetch, Client Components for interaction)
- PostgreSQL + Prisma — clients, returns, documents, fields, AI flags, audit log
- REST API the UI actually calls (`/api/returns`, `/api/flags/[id]`, `/api/fields/[id]`, audit-log)
- Flag + field edits persist and appear in the Activity Log after refresh
- Urgency ranking, role-scoped dashboard, loading/error/empty states, toasts

**Simulated (fabricated, per the brief):**
- AI confidence / reasoning / evidence / suggested actions (hand-authored)
- “Edit manually” correction values (`src/lib/fake-edit.ts`)
- Document OCR / real PDFs (metadata + placeholder thumbnails)
- Roles / auth (in-memory switcher; no server permission enforcement)
- Collaboration threads (hardcoded in `src/lib/mock-data/mock-collaboration.ts`)

## Sample data

6 clients · 8 returns · 22 documents · 48 fields · 4 AI flags · seeded collaboration threads.

Best demos: `return-01` (Margaret Chen), `return-05` (Elena Vasquez, clean).

## Running locally

**Requirements:** Node **≥ 20.9**, [pnpm](https://pnpm.io), Docker.

```bash
pnpm install
docker compose up -d
cp .env.example .env   # if you don't already have .env
pnpm exec prisma generate
pnpm db:deploy
pnpm db:seed
pnpm dev
```

Open http://localhost:3000.

Default `.env`:

```
DATABASE_URL="postgresql://postgres:ledger@localhost:5435/ledger"
```

## Deploying (Vercel + hosted Postgres)

Build is production-ready (`prisma generate` runs on `postinstall` / `build`).

1. Create a Postgres database (Neon or Vercel Postgres). Copy the connection string (use `?sslmode=require` if required).
2. Apply schema + seed against that URL:

```bash
DATABASE_URL="postgresql://..." pnpm db:deploy
DATABASE_URL="postgresql://..." pnpm db:seed
```

3. Import https://github.com/Nithishkaranam2002/Ledger into Vercel.
4. Set env `DATABASE_URL` for Production (and Preview if you want).
5. Deploy. Set Node.js **20.x** in Project Settings if prompted.

Smoke test after deploy: `/` → `return-01` accept a flag → refresh → Activity tab → switch to Reviewer → confirm read-only.

## Tech stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · Prisma 7 ·
PostgreSQL · Sonner.

## Notable design decisions

- **One connected flow.** Dashboard → return → fields/docs/flags/requests → source → AI decision.
- **Affordance = color + icon + border.** Field state is never one cue alone.
- **AI suggests; humans decide.** Every flag resolution is explicit and audited.
- **Status means the same thing to everyone.** Stepper + a single Next owner/reason line.
- **Collaboration stays contextual.** Threads hang off the return (and specific fields/flags), not a generic inbox.
