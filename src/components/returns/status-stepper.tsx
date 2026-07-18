import {
  PROGRESS_STEPS,
  statusToStepIndex,
  type NextAction,
} from "@/lib/return-progress";
import type { ReturnStatus } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface StatusStepperProps {
  status: ReturnStatus;
  nextAction: NextAction;
  completenessPercent: number;
}

export function StatusStepper({
  status,
  nextAction,
  completenessPercent,
}: StatusStepperProps) {
  const current = statusToStepIndex(status);

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-3">
      <ol className="flex items-center gap-1 overflow-x-auto pb-0.5">
        {PROGRESS_STEPS.map((step, index) => {
          const done = index < current;
          const active = index === current;
          return (
            <li key={step.id} className="flex min-w-0 flex-1 items-center gap-1">
              <div className="flex min-w-0 flex-col items-center gap-1">
                <span
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full text-[10px] font-semibold tabular-nums",
                    done && "bg-emerald-600 text-white",
                    active && "bg-foreground text-background",
                    !done && !active && "bg-muted text-muted-foreground"
                  )}
                  aria-current={active ? "step" : undefined}
                >
                  {done ? "✓" : index + 1}
                </span>
                <span
                  className={cn(
                    "truncate text-[10px] font-medium",
                    active ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < PROGRESS_STEPS.length - 1 ? (
                <div
                  className={cn(
                    "mb-4 h-0.5 flex-1 rounded-full",
                    index < current ? "bg-emerald-500" : "bg-muted"
                  )}
                  aria-hidden
                />
              ) : null}
            </li>
          );
        })}
      </ol>

      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2 border-t border-border pt-2.5">
        <p className="text-xs leading-snug">
          <span className="font-medium text-muted-foreground">Next: </span>
          <span
            className={cn(
              "font-semibold",
              nextAction.blocking && "text-amber-800"
            )}
          >
            {nextAction.owner}
          </span>
          <span className="text-muted-foreground"> · {nextAction.reason}</span>
        </p>
        <span className="text-[11px] tabular-nums text-muted-foreground">
          {completenessPercent}% complete
        </span>
      </div>
    </div>
  );
}
