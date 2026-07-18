import type { AIFlag, ReturnStatus, TaxReturn } from "@/lib/mock-data";

export type ProgressStepId =
  | "documents"
  | "preparation"
  | "review"
  | "ready"
  | "filed";

export interface ProgressStep {
  id: ProgressStepId;
  label: string;
}

export const PROGRESS_STEPS: ProgressStep[] = [
  { id: "documents", label: "Documents" },
  { id: "preparation", label: "Preparation" },
  { id: "review", label: "Review" },
  { id: "ready", label: "Ready" },
  { id: "filed", label: "Filed" },
];

/** Map return status → current step index (0-based). */
export function statusToStepIndex(status: ReturnStatus): number {
  switch (status) {
    case "not-started":
      return 0;
    case "in-progress":
      return 1;
    case "pending-review":
      return 2;
    case "ready-to-file":
      return 3;
    case "filed":
      return 4;
  }
}

export interface NextAction {
  owner: string;
  reason: string;
  /** Optional collaboration / blocker hint */
  blocking?: boolean;
}

/**
 * Derive a single, shared "what happens next" line for staff.
 * Prefer pending AI flags, then status-based ownership.
 */
export function computeNextAction(
  taxReturn: TaxReturn,
  pendingFlagCount: number,
  options?: { outstandingClientRequest?: boolean }
): NextAction {
  if (taxReturn.status === "filed") {
    return { owner: "—", reason: "Return filed — no further action" };
  }

  if (options?.outstandingClientRequest) {
    return {
      owner: "Client",
      reason: "Waiting on outstanding document / info request",
      blocking: true,
    };
  }

  if (pendingFlagCount > 0) {
    return {
      owner: taxReturn.assignedCPA,
      reason:
        pendingFlagCount === 1
          ? "Resolve 1 AI flag"
          : `Resolve ${pendingFlagCount} AI flags`,
      blocking: true,
    };
  }

  switch (taxReturn.status) {
    case "not-started":
      return {
        owner: taxReturn.assignedCPA,
        reason: "Gather source documents and begin preparation",
      };
    case "in-progress":
      return {
        owner: taxReturn.assignedCPA,
        reason: "Continue preparation — return incomplete",
      };
    case "pending-review":
      return {
        owner: "Reviewer",
        reason: "Review completed work before filing",
      };
    case "ready-to-file":
      return {
        owner: taxReturn.assignedCPA,
        reason: "File the return",
      };
    default:
      return { owner: taxReturn.assignedCPA, reason: "Continue work" };
  }
}

export function countPendingFlags(flags: AIFlag[]): number {
  return flags.filter((f) => f.status === "pending").length;
}
