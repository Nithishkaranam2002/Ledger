"use client";

import { useMemo, useState } from "react";
import { Lock, MessagesSquare, UserRound } from "lucide-react";

import type { CollaborationThread } from "@/lib/mock-data/mock-collaboration";
import { cn } from "@/lib/utils";

type VisibilityFilter = "all" | "internal" | "client";

interface CollaborationPanelProps {
  threads: CollaborationThread[];
  onOpenLinkedFlag?: (flagId: string) => void;
}

export function CollaborationPanel({
  threads,
  onOpenLinkedFlag,
}: CollaborationPanelProps) {
  const [filter, setFilter] = useState<VisibilityFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(
    threads.find((t) => t.status === "open")?.id ?? null
  );

  const visible = useMemo(() => {
    const list =
      filter === "all"
        ? threads
        : threads.filter((t) => t.visibility === filter);
    return [...list].sort((a, b) => {
      if (a.status !== b.status) return a.status === "open" ? -1 : 1;
      return b.updatedAt.localeCompare(a.updatedAt);
    });
  }, [threads, filter]);

  const openCount = threads.filter((t) => t.status === "open").length;

  return (
    <section aria-labelledby="collab-heading">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h2
          id="collab-heading"
          className="flex items-center gap-1.5 text-sm font-semibold tracking-tight"
        >
          <MessagesSquare
            className="size-3.5 text-muted-foreground"
            aria-hidden
          />
          Requests & notes
        </h2>
        <span className="text-xs tabular-nums text-muted-foreground">
          {openCount} open
        </span>
      </div>

      <div className="mb-2 flex flex-wrap gap-1.5">
        {(
          [
            ["all", "All"],
            ["client", "Client-visible"],
            ["internal", "Internal"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors",
              filter === value
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-background text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        {visible.length === 0 ? (
          <p className="px-3 py-4 text-center text-sm text-muted-foreground">
            No {filter === "all" ? "" : `${filter} `}threads on this return
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {visible.map((thread) => {
              const expanded = expandedId === thread.id;
              return (
                <li key={thread.id}>
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedId((prev) =>
                        prev === thread.id ? null : thread.id
                      )
                    }
                    className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left hover:bg-muted/40"
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md",
                        thread.visibility === "internal"
                          ? "bg-slate-100 text-slate-600"
                          : "bg-sky-100 text-sky-700"
                      )}
                    >
                      {thread.visibility === "internal" ? (
                        <Lock className="size-3" aria-hidden />
                      ) : (
                        <UserRound className="size-3" aria-hidden />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-1.5">
                        <span className="text-sm font-medium leading-tight">
                          {thread.subject}
                        </span>
                        <span
                          className={cn(
                            "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                            thread.status === "open"
                              ? "bg-amber-100 text-amber-900"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {thread.status === "open" ? "Open" : "Resolved"}
                        </span>
                        <span className="rounded-full border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                          {thread.visibility === "internal"
                            ? "Internal"
                            : "Client"}
                        </span>
                      </span>
                      <span className="mt-0.5 block text-[11px] text-muted-foreground">
                        Next: {thread.nextOwnerLabel}
                      </span>
                    </span>
                  </button>
                  {expanded ? (
                    <div className="border-t border-border bg-muted/20 px-3 py-2.5 pl-12">
                      <p className="text-sm leading-relaxed text-foreground">
                        {thread.preview}
                      </p>
                      {thread.flagId && onOpenLinkedFlag ? (
                        <button
                          type="button"
                          className="mt-2 text-xs font-medium text-foreground underline-offset-4 hover:underline"
                          onClick={() => onOpenLinkedFlag(thread.flagId!)}
                        >
                          Open linked AI flag →
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
