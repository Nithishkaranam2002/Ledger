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

export function FieldStateLegend() {
  return (
    <section aria-labelledby="field-states-heading">
      <h2
        id="field-states-heading"
        className="mb-2 text-sm font-semibold tracking-tight"
      >
        Field states
      </h2>
      <div className="rounded-lg border border-border bg-card px-3 py-2.5">
        <ul className="flex flex-wrap gap-x-4 gap-y-2">
          {STATES.map((state) => {
            const meta = FIELD_STATE_META[state];
            const Icon = meta.Icon;
            return (
              <li key={state} className="flex items-center gap-1.5 text-xs">
                <span
                  className={cn(
                    "flex size-5 items-center justify-center rounded",
                    state === "ai-generated" && "bg-violet-100",
                    state === "verified" && "bg-emerald-100",
                    state === "editable" && "bg-muted",
                    state === "needs-approval" && "bg-amber-100",
                    state === "locked" && "bg-muted"
                  )}
                >
                  <Icon className={cn("size-3", meta.iconClass)} aria-hidden />
                </span>
                <span className="font-medium">{meta.label}</span>
                <span className="hidden text-muted-foreground sm:inline">
                  — {meta.description}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
