import type { AIFlag, ReturnStatus, TaxReturn } from "@/lib/mock-data";

export type UrgencySection =
  | "overdue"
  | "due-this-week"
  | "needs-review"
  | "on-track";

export const SECTION_ORDER: UrgencySection[] = [
  "overdue",
  "due-this-week",
  "needs-review",
  "on-track",
];

export const SECTION_LABELS: Record<UrgencySection, string> = {
  overdue: "Overdue",
  "due-this-week": "Due This Week",
  "needs-review": "Needs Your Review",
  "on-track": "On Track",
};

export type DueUrgency = "overdue" | "due-soon" | "on-track";

function parseDateOnly(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function startOfToday(now = new Date()): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/** Signed day delta: negative = overdue, 0 = today, positive = future. */
export function daysUntilDue(dueDate: string, now = new Date()): number {
  const due = parseDateOnly(dueDate);
  const today = startOfToday(now);
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function getDueUrgency(dueDate: string, now = new Date()): DueUrgency {
  const days = daysUntilDue(dueDate, now);
  if (days < 0) return "overdue";
  if (days <= 7) return "due-soon";
  return "on-track";
}

export function countPendingFlags(
  returnId: string,
  flags: AIFlag[]
): number {
  return flags.filter((f) => f.returnId === returnId && f.status === "pending")
    .length;
}

export function needsReview(
  taxReturn: TaxReturn,
  pendingFlagCount: number
): boolean {
  return taxReturn.status === "pending-review" || pendingFlagCount > 0;
}

/**
 * Assign each active (non-filed) return to exactly one section,
 * highest urgency wins.
 */
export function getUrgencySection(
  taxReturn: TaxReturn,
  pendingFlagCount: number,
  now = new Date()
): UrgencySection | null {
  if (taxReturn.status === "filed") return null;

  const days = daysUntilDue(taxReturn.dueDate, now);
  if (days < 0) return "overdue";
  if (days <= 7) return "due-this-week";
  if (needsReview(taxReturn, pendingFlagCount)) return "needs-review";
  return "on-track";
}

export function groupReturnsByUrgency(
  returns: TaxReturn[],
  flags: AIFlag[],
  now = new Date()
): Record<UrgencySection, TaxReturn[]> {
  const groups: Record<UrgencySection, TaxReturn[]> = {
    overdue: [],
    "due-this-week": [],
    "needs-review": [],
    "on-track": [],
  };

  for (const taxReturn of returns) {
    const pending = countPendingFlags(taxReturn.id, flags);
    const section = getUrgencySection(taxReturn, pending, now);
    if (!section) continue;
    groups[section].push(taxReturn);
  }

  for (const section of SECTION_ORDER) {
    groups[section].sort(
      (a, b) => daysUntilDue(a.dueDate, now) - daysUntilDue(b.dueDate, now)
    );
  }

  return groups;
}

export function formatDueDate(dueDate: string): string {
  return parseDateOnly(dueDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatStatus(status: ReturnStatus): string {
  const labels: Record<ReturnStatus, string> = {
    "not-started": "Not started",
    "in-progress": "In progress",
    "pending-review": "Pending review",
    "ready-to-file": "Ready to file",
    filed: "Filed",
  };
  return labels[status];
}
