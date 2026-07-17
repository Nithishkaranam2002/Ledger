import type { ReturnSummary } from "@/lib/api-types";
import {
  SECTION_LABELS,
  SECTION_ORDER,
  type UrgencySection,
  daysUntilDue,
} from "@/lib/urgency";

export function groupSummariesByUrgency(
  returns: ReturnSummary[]
): Record<UrgencySection, ReturnSummary[]> {
  const groups: Record<UrgencySection, ReturnSummary[]> = {
    overdue: [],
    "due-this-week": [],
    "needs-review": [],
    "on-track": [],
  };

  for (const taxReturn of returns) {
    if (!taxReturn.urgency) continue;
    groups[taxReturn.urgency].push(taxReturn);
  }

  for (const section of SECTION_ORDER) {
    groups[section].sort(
      (a, b) => daysUntilDue(a.dueDate) - daysUntilDue(b.dueDate)
    );
  }

  return groups;
}

export { SECTION_LABELS, SECTION_ORDER };
