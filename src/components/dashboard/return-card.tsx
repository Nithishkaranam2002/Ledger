import Link from "next/link";
import { Building2, TriangleAlert, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { hasOpenClientRequest } from "@/lib/mock-data";
import type { Client, TaxReturn } from "@/lib/mock-data";
import { computeNextAction } from "@/lib/return-progress";
import {
  formatDueDate,
  formatStatus,
  getDueUrgency,
  type DueUrgency,
} from "@/lib/urgency";
import { cn } from "@/lib/utils";

const dueDateClass: Record<DueUrgency, string> = {
  overdue: "text-red-600",
  "due-soon": "text-amber-600",
  "on-track": "text-muted-foreground",
};

const dueDatePrefix: Record<DueUrgency, string> = {
  overdue: "Overdue · ",
  "due-soon": "Due · ",
  "on-track": "Due · ",
};

interface ReturnCardProps {
  taxReturn: TaxReturn;
  client: Client;
  pendingFlagCount: number;
}

export function ReturnCard({
  taxReturn,
  client,
  pendingFlagCount,
}: ReturnCardProps) {
  const urgency = getDueUrgency(taxReturn.dueDate);
  const TypeIcon = client.type === "business" ? Building2 : User;
  const next = computeNextAction(taxReturn, pendingFlagCount, {
    outstandingClientRequest: hasOpenClientRequest(taxReturn.id),
  });

  return (
    <Link href={`/returns/${taxReturn.id}`} className="block">
      <Card
        size="sm"
        className="transition-colors hover:bg-muted/40 hover:ring-foreground/20"
      >
        <CardContent className="flex flex-col gap-2.5 py-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex items-start gap-2.5">
              <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <TypeIcon className="size-3.5" aria-hidden />
              </div>
              <div className="min-w-0">
                <div className="truncate font-medium leading-tight">
                  {client.name}
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                  <span>TY {taxReturn.taxYear}</span>
                  <span aria-hidden>·</span>
                  <span className={cn("font-medium", dueDateClass[urgency])}>
                    {dueDatePrefix[urgency]}
                    {formatDueDate(taxReturn.dueDate)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
              {pendingFlagCount > 0 ? (
                <Badge
                  variant="destructive"
                  className="gap-1"
                  data-icon="inline-start"
                >
                  <TriangleAlert />
                  {pendingFlagCount}{" "}
                  {pendingFlagCount === 1 ? "flag" : "flags"}
                </Badge>
              ) : null}
              <Badge variant="outline">{formatStatus(taxReturn.status)}</Badge>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div
              className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuenow={taxReturn.completenessPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${taxReturn.completenessPercent}% complete`}
            >
              <div
                className="h-full rounded-full bg-foreground/70"
                style={{ width: `${taxReturn.completenessPercent}%` }}
              />
            </div>
            <span className="w-8 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
              {taxReturn.completenessPercent}%
            </span>
          </div>

          {taxReturn.status !== "filed" ? (
            <p className="truncate text-[11px] leading-snug text-muted-foreground">
              <span className="font-medium text-foreground/80">Next:</span>{" "}
              {next.owner} · {next.reason}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
}
