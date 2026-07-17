# Ledger

An AI-powered tax platform prototype for CPAs. Built from scratch for the AI Engineer
case study. Ledger is designed around one question a preparer asks all day —
*"can I trust this number, and what should I do about it?"* — and answers it with
traceable source documents, a consistent affordance system, transparent AI, and an
action-oriented dashboard.

This is a **working, clickable prototype**, not production software. The AI is
simulated; the app underneath it is real (Next.js + Postgres + Prisma).

## Challenges covered

The brief lists ten challenges. Ledger goes deep on a coherent, connected subset
rather than covering all ten shallowly:

| # | Challenge | Where to see it |
|---|-----------|-----------------|
| 01 | **Source Document Traceability** | Any field with a "View source" link on a return → opens a trace dialog showing the source document, page, and the calculation path |
| 07 | **An Actionable Dashboard** | Landing page (`/`) — returns grouped by urgency (Overdue → Due This Week → Needs Review → On Track) with prioritization logic, not a report |
| 08 | **Clickable vs. Editable** | Return detail (`/returns/[id]`) — five field states (AI-generated, Verified, Editable, Needs approval, Locked) with a persistent legend, applied consistently across dashboard cards and field rows |
| 10 | **Trustworthy AI** | AI flag dialog on a return — confidence meter, plain-language reasoning, supporting evidence, suggested action, and Accept / Reject / Edit correction flows, all recorded to an audit log |
| 05 | **Role-Aware Experiences** | User switcher (top-right) — Preparer (Sarah Kim), Reviewer (David Torres, read-only), Firm Admin (Priya Nair, all-preparers view). The same shell adapts per role |
| 06 | **Return Status & Progress** *(partial)* | Return status badges + completeness %, pending-flag counts, and an activity log of every decision made |

## What's real vs. simulated

**Real (genuinely wired up):**
- Next.js 16 App Router frontend (Server Components for data fetch, Client Components for interaction)
- PostgreSQL database via Prisma ORM — clients, returns, documents, fields, AI flags, and an audit log, with relations and indexes
- A REST API layer (`/api/returns`, `/api/returns/[id]`, `/api/flags/[id]`, `/api/returns/[id]/audit-log`) that the frontend actually calls
- Persistence: accepting/rejecting/editing an AI flag writes to the database and to the audit log, and survives a refresh
- Prioritization/urgency logic computed from real due dates and pending-flag counts
- Loading skeletons, error states, empty states, and toasts

**Simulated (fabricated, per the brief):**
- **AI flags** — confidence scores, reasoning, evidence links, and suggested actions are hand-authored mock data, not a model
- **"Edit manually" corrections** — `src/lib/fake-edit.ts` returns plausible corrected values (a stub standing in for an AI correction)
- **Document traceability** — no real OCR/parsing; source-document + page + calculation links are hardcoded
- **Roles / auth** — the user switcher is a fake in-memory context (`src/lib/current-user-context.tsx`), no real login or server-side permission checks
- **Documents** — represented by metadata + a placeholder thumbnail, not real files

## Sample data

Seeded from `src/lib/mock-data/` via `prisma/seed.ts`: 6 clients, 8 tax returns at
different stages (individual + business, filed / ready-to-file / pending-review /
in-progress / not-started), 22 documents, 48 return fields across all five states, and
4 pending AI flags. Returns are split across two preparers so the role scoping is
demonstrable.

Good returns to click through:
- `return-01` (Margaret Chen) — pending review, 2 AI flags, source traces + calculations
- `return-05` (Elena Vasquez) — clean return, zero flags (empty-state demo)

## Running locally

Requirements: Node 18+, [pnpm](https://pnpm.io), and Docker (for Postgres).

```bash
# 1. Install dependencies
pnpm install

# 2. Start Postgres (maps host port 5435 → container 5432)
docker compose up -d

# 3. Generate the Prisma client, apply the schema, and seed sample data
pnpm exec prisma generate
pnpm exec prisma migrate deploy   # or: pnpm exec prisma db push
pnpm db:seed

# 4. Run the dev server
pnpm dev
```

Then open http://localhost:3000.

The database connection string lives in `.env`:

```
DATABASE_URL="postgresql://postgres:ledger@localhost:5435/ledger"
```

To reseed at any time: `pnpm db:seed`.

## Tech stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · Prisma 7 ·
PostgreSQL · Sonner (toasts).

## Notable design decisions

- **One connected flow, not four demos.** Dashboard → return → field → source → AI flag
  is a single path a CPA would actually walk, so the challenges reinforce each other.
- **Affordance = color + icon + border, consistently.** Field state is never signaled by
  one cue alone, so the "what can I touch?" question is answerable at a glance.
- **AI is a suggestion, never an action.** Every AI flag routes through an explicit
  Accept / Reject / Edit decision that a human owns and that gets logged — the trust
  model is "assistive, auditable, reversible."
- **The database is the source of truth.** State changes round-trip through the API so
  the prototype behaves like the real thing (survives refresh, has an audit trail)
  rather than faking it in local state.
