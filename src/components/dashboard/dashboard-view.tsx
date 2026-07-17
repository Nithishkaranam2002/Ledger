"use client";

import { useMemo, useState } from "react";

import { ReturnCard } from "@/components/dashboard/return-card";
import { UserSwitcher } from "@/components/user-switcher";
import type { ReturnSummary } from "@/lib/api-types";
import { useCurrentUser } from "@/lib/current-user-context";
import {
  SECTION_LABELS,
  SECTION_ORDER,
  groupSummariesByUrgency,
} from "@/lib/dashboard";

const ALL_PREPARERS = "all";

interface DashboardViewProps {
  returns: ReturnSummary[];
}

export function DashboardView({ returns }: DashboardViewProps) {
  const { user } = useCurrentUser();
  const [preparerFilter, setPreparerFilter] = useState<string>(ALL_PREPARERS);

  const preparers = useMemo(
    () => [...new Set(returns.map((r) => r.assignedCPA))].sort(),
    [returns]
  );

  const visibleReturns = useMemo(() => {
    // Preparers see their own queue; Reviewer and Firm Admin see the whole firm
    if (user.role === "preparer") {
      return returns.filter((r) => r.assignedCPA === user.name);
    }
    if (user.role === "admin" && preparerFilter !== ALL_PREPARERS) {
      return returns.filter((r) => r.assignedCPA === preparerFilter);
    }
    return returns;
  }, [returns, user, preparerFilter]);

  const grouped = groupSummariesByUrgency(visibleReturns);

  const attentionCount = SECTION_ORDER.filter((s) => s !== "on-track").reduce(
    (sum, section) => sum + grouped[section].length,
    0
  );

  const attentionSummary = (() => {
    const base =
      attentionCount === 0
        ? "No returns need attention"
        : attentionCount === 1
          ? "1 return needs attention"
          : `${attentionCount} returns need attention`;

    if (user.role === "admin") {
      return preparerFilter === ALL_PREPARERS
        ? `${base} across all preparers`
        : `${base} for ${preparerFilter}`;
    }
    if (user.role === "reviewer") {
      return `${base} — read-only review access`;
    }
    return base;
  })();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <header className="mb-5 border-b border-border pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Ledger
            </p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight">
              Good morning, {user.name}
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {attentionSummary}
            </p>
          </div>
          <UserSwitcher />
        </div>

        {user.role === "admin" ? (
          <div className="mt-3 flex items-center gap-2">
            <label
              htmlFor="preparer-filter"
              className="text-xs font-medium text-muted-foreground"
            >
              Preparer
            </label>
            <select
              id="preparer-filter"
              value={preparerFilter}
              onChange={(event) => setPreparerFilter(event.target.value)}
              className="h-7 cursor-pointer rounded-md border border-border bg-background px-1.5 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value={ALL_PREPARERS}>All Preparers</option>
              {preparers.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        ) : null}
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

        {visibleReturns.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No returns assigned to {user.name}
          </p>
        ) : null}
      </div>
    </main>
  );
}
