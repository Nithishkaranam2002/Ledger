"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

import { FIELD_STATE_META } from "@/components/returns/field-state-meta";
import type { FieldState } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const STATES: FieldState[] = [
  "ai-generated",
  "verified",
  "editable",
  "needs-approval",
  "locked",
];

const STORAGE_KEY = "ledger.field-states-expanded";

function StateIcon({ state }: { state: FieldState }) {
  const meta = FIELD_STATE_META[state];
  const Icon = meta.Icon;
  return (
    <span
      className={cn(
        "flex size-5 items-center justify-center rounded",
        state === "ai-generated" && "bg-violet-100",
        state === "verified" && "bg-emerald-100",
        state === "editable" && "bg-muted",
        state === "needs-approval" && "bg-amber-100",
        state === "locked" && "bg-muted"
      )}
      title={meta.label}
    >
      <Icon className={cn("size-3", meta.iconClass)} aria-hidden />
    </span>
  );
}

export function FieldStateLegend() {
  const [expanded, setExpanded] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "1") setExpanded(true);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  function toggle() {
    setExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  return (
    <section aria-labelledby="field-states-heading">
      <button
        type="button"
        id="field-states-heading"
        aria-expanded={expanded}
        aria-controls="field-states-panel"
        onClick={toggle}
        className="mb-2 flex w-full items-center justify-between gap-2 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="text-sm font-semibold tracking-tight">
          Field states
        </span>
        <span className="flex items-center gap-2">
          {!expanded ? (
            <span className="flex items-center gap-1" aria-hidden>
              {STATES.map((state) => (
                <StateIcon key={state} state={state} />
              ))}
            </span>
          ) : null}
          <ChevronDown
            className={cn(
              "size-4 text-muted-foreground transition-transform",
              expanded && "rotate-180"
            )}
            aria-hidden
          />
          <span className="sr-only">
            {expanded ? "Collapse field states" : "Expand field states"}
          </span>
        </span>
      </button>

      <div
        id="field-states-panel"
        hidden={!expanded}
        className={cn(!hydrated && !expanded && "hidden")}
      >
        <div className="rounded-lg border border-border bg-card px-3 py-2.5">
          <ul className="flex flex-wrap gap-x-4 gap-y-2">
            {STATES.map((state) => {
              const meta = FIELD_STATE_META[state];
              return (
                <li key={state} className="flex items-center gap-1.5 text-xs">
                  <StateIcon state={state} />
                  <span className="font-medium">{meta.label}</span>
                  <span className="hidden text-muted-foreground sm:inline">
                    — {meta.description}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
