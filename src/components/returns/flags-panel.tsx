import { Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { AIFlag, ReturnField } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface FlagsPanelProps {
  flags: AIFlag[];
  fieldsById: Record<string, ReturnField>;
  onOpenFlag: (flagId: string) => void;
}

export function FlagsPanel({
  flags,
  fieldsById,
  onOpenFlag,
}: FlagsPanelProps) {
  const sorted = [...flags].sort((a, b) => {
    if (a.status === "pending" && b.status !== "pending") return -1;
    if (a.status !== "pending" && b.status === "pending") return 1;
    return b.confidence - a.confidence;
  });

  return (
    <section aria-labelledby="flags-heading">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h2
          id="flags-heading"
          className="text-sm font-semibold tracking-tight"
        >
          AI flags
        </h2>
        <span className="text-xs tabular-nums text-muted-foreground">
          {flags.filter((f) => f.status === "pending").length} pending
        </span>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        {sorted.length === 0 ? (
          <p className="px-3 py-4 text-center text-sm text-muted-foreground">
            No AI flags — all fields clear
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {sorted.map((flag) => {
              const field = fieldsById[flag.fieldId];
              const pending = flag.status === "pending";
              return (
                <li key={flag.id}>
                  <button
                    type="button"
                    onClick={() => onOpenFlag(flag.id)}
                    className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left hover:bg-muted/40"
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md",
                        pending
                          ? "bg-amber-100 text-amber-700"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      <Sparkles className="size-3" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium leading-snug">
                        {flag.message}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-muted-foreground">
                        {field?.label ?? flag.fieldId}
                        {field ? ` · ${field.value}` : ""}
                      </span>
                    </span>
                    <span className="flex shrink-0 flex-col items-end gap-1">
                      <Badge
                        variant={pending ? "destructive" : "secondary"}
                        className="capitalize"
                      >
                        {flag.status}
                      </Badge>
                      <span className="text-[10px] tabular-nums text-muted-foreground">
                        {flag.confidence}%
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
