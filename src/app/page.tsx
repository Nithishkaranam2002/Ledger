import Link from "next/link";

import { ReturnCard } from "@/components/dashboard/return-card";
import type { ReturnSummary } from "@/lib/api-types";
import {
  SECTION_LABELS,
  SECTION_ORDER,
  groupSummariesByUrgency,
} from "@/lib/dashboard";
import { getReturnSummaries } from "@/lib/data/returns";

export const dynamic = "force-dynamic";

const CPA_NAME = "Sarah Kim";

export default async function DashboardPage() {
  let returns: ReturnSummary[];
  try {
    returns = await getReturnSummaries();
  } catch {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-sm text-center">
          <h1 className="text-lg font-semibold tracking-tight">
            Couldn&apos;t load returns
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            The database may be unavailable. Check that Postgres is running,
            then refresh.
          </p>
          <Link
            href="/"
            className="mt-5 inline-block text-sm font-medium underline-offset-4 hover:underline"
          >
            Try again
          </Link>
        </div>
      </main>
    );
  }

  const grouped = groupSummariesByUrgency(returns);

  const attentionCount = SECTION_ORDER.filter((s) => s !== "on-track").reduce(
    (sum, section) => sum + grouped[section].length,
    0
  );

  const attentionSummary =
    attentionCount === 0
      ? "No returns need attention"
      : attentionCount === 1
        ? "1 return needs attention"
        : `${attentionCount} returns need attention`;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <header className="mb-5 border-b border-border pb-4">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Ledger
        </p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight">
          Good morning, {CPA_NAME}
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {attentionSummary}
        </p>
      </header>

      <div className="flex flex-col gap-6">
        {SECTION_ORDER.map((section) => {
          const sectionReturns = grouped[section];
          if (sectionReturns.length === 0) return null;

          return (
            <section key={section} aria-labelledby={`section-${section}`}>
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <h2
                  id={`section-${section}`}
                  className="text-sm font-semibold tracking-tight"
                >
                  {SECTION_LABELS[section]}
                </h2>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {sectionReturns.length}
                </span>
              </div>
              <ul className="flex flex-col gap-2">
                {sectionReturns.map((taxReturn) => (
                  <li key={taxReturn.id}>
                    <ReturnCard
                      taxReturn={taxReturn}
                      client={taxReturn.client}
                      pendingFlagCount={taxReturn.flagCount}
                    />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </main>
  );
}
