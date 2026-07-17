"use client";

import { useState } from "react";
import { ChevronDown, History, MoveRight } from "lucide-react";

import type { AuditAction, AuditLogEntryDTO } from "@/lib/api-types";
import { cn } from "@/lib/utils";

const ACTION_LABELS: Record<AuditAction, string> = {
  flag_accepted: "Accepted AI suggestion",
  flag_rejected: "Rejected AI flag",
  flag_edited: "Manually edited value",
  field_edited: "Edited field",
};

function relativeTime(iso: string, now = new Date()): string {
  const seconds = Math.round((now.getTime() - new Date(iso).getTime()) / 1000);
  if (seconds < 45) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface ActivityLogProps {
  entries: AuditLogEntryDTO[];
  /** fieldId → label, for joining entries back to readable field names */
  fieldLabels: Record<string, string>;
}

export function ActivityLog({ entries, fieldLabels }: ActivityLogProps) {
  const [open, setOpen] = useState(entries.length > 0);

  return (
    <section aria-labelledby="activity-heading" className="mt-6">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="mb-2 flex w-full items-center justify-between gap-2 text-left"
      >
        <span className="flex items-center gap-1.5">
          <History className="size-3.5 text-muted-foreground" aria-hidden />
          <h2
            id="activity-heading"
            className="text-sm font-semibold tracking-tight"
          >
            Activity Log
          </h2>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-xs tabular-nums text-muted-foreground">
            {entries.length}
          </span>
          <ChevronDown
            className={cn(
              "size-3.5 text-muted-foreground transition-transform",
              open && "rotate-180"
            )}
            aria-hidden
          />
        </span>
      </button>

      {open ? (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          {entries.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-muted-foreground">
              No activity yet
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {entries.map((entry) => {
                const fieldLabel = entry.fieldId
                  ? (fieldLabels[entry.fieldId] ?? entry.fieldId)
                  : null;
                const showValues =
                  entry.previousValue != null &&
                  entry.newValue != null &&
                  entry.previousValue !== entry.newValue;

                return (
                  <li key={entry.id} className="px-3 py-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm leading-tight">
                          <span className="font-medium">
                            {ACTION_LABELS[entry.action]}
                          </span>
                          {fieldLabel ? (
                            <span className="text-muted-foreground">
                              {" "}
                              on {fieldLabel}
                            </span>
                          ) : null}
                        </p>
                        {showValues ? (
                          <p className="mt-1 flex flex-wrap items-center gap-1.5 font-mono text-xs text-muted-foreground">
                            <span className="line-through decoration-muted-foreground/50">
                              {entry.previousValue}
                            </span>
                            <MoveRight className="size-3" aria-hidden />
                            <span className="font-medium text-foreground">
                              {entry.newValue}
                            </span>
                          </p>
                        ) : null}
                      </div>
                      <p
                        className="shrink-0 text-right text-[11px] leading-tight text-muted-foreground"
                        suppressHydrationWarning
                      >
                        {entry.performedBy}
                        <br />
                        {relativeTime(entry.createdAt)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </section>
  );
}
