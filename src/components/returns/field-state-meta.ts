import {
  CheckCircle2,
  Lock,
  Pencil,
  Sparkles,
  CircleAlert,
} from "lucide-react";

import type { FieldState } from "@/lib/mock-data";

export const FIELD_STATE_META: Record<
  FieldState,
  {
    label: string;
    description: string;
    rowClass: string;
    valueClass: string;
    iconClass: string;
    Icon: typeof Sparkles;
  }
> = {
  "ai-generated": {
    label: "AI-generated",
    description: "Extracted or computed by AI — review before relying on it",
    rowClass: "border-l-violet-400 bg-violet-50/40 hover:bg-violet-50/70",
    valueClass: "text-violet-950",
    iconClass: "text-violet-600",
    Icon: Sparkles,
  },
  verified: {
    label: "Verified",
    description: "Confirmed against source — settled",
    rowClass: "border-l-emerald-400 bg-emerald-50/20 hover:bg-emerald-50/40",
    valueClass: "text-muted-foreground",
    iconClass: "text-emerald-600",
    Icon: CheckCircle2,
  },
  editable: {
    label: "Editable",
    description: "Open for manual entry or correction",
    rowClass: "border-l-transparent hover:bg-muted/50",
    valueClass: "text-foreground",
    iconClass: "text-muted-foreground",
    Icon: Pencil,
  },
  "needs-approval": {
    label: "Needs approval",
    description: "Requires CPA sign-off before filing",
    rowClass: "border-l-amber-400 bg-amber-50/40 hover:bg-amber-50/70",
    valueClass: "text-amber-950",
    iconClass: "text-amber-600",
    Icon: CircleAlert,
  },
  locked: {
    label: "Locked",
    description: "Fixed by tax rules or prior filing — not editable",
    rowClass: "border-l-border bg-muted/30 opacity-80",
    valueClass: "text-muted-foreground",
    iconClass: "text-muted-foreground",
    Icon: Lock,
  },
};
