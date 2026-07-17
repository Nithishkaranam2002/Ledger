"use client";

import { Check, Pencil, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AIFlag, Document, FlagStatus, ReturnField } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface AIFlagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flag: AIFlag | null;
  field: ReturnField | null;
  evidenceDocs: Document[];
  onResolve: (flagId: string, status: Exclude<FlagStatus, "pending">) => void;
}

export function AIFlagDialog({
  open,
  onOpenChange,
  flag,
  field,
  evidenceDocs,
  onResolve,
}: AIFlagDialogProps) {
  if (!flag) return null;

  const isPending = flag.status === "pending";
  const confidence = Math.min(100, Math.max(0, flag.confidence));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" showCloseButton>
        <DialogHeader>
          <div className="flex items-start justify-between gap-3 pr-6">
            <DialogTitle className="leading-snug">{flag.message}</DialogTitle>
          </div>
          <DialogDescription>
            {field ? (
              <>
                Flagged field:{" "}
                <span className="font-medium text-foreground">
                  {field.label}
                </span>{" "}
                ({field.value})
              </>
            ) : (
              "AI review flag for this return"
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div>
            <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              Confidence
            </p>
            <div className="mt-1.5 flex items-center gap-3">
              <div
                className="h-2 flex-1 overflow-hidden rounded-full bg-muted"
                role="meter"
                aria-valuenow={confidence}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${confidence}% confidence`}
              >
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    confidence >= 85
                      ? "bg-emerald-500"
                      : confidence >= 70
                        ? "bg-amber-500"
                        : "bg-orange-500"
                  )}
                  style={{ width: `${confidence}%` }}
                />
              </div>
              <span className="w-10 shrink-0 text-right text-sm font-semibold tabular-nums">
                {confidence}%
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5">
            <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              Reasoning
            </p>
            <p className="mt-1 text-sm leading-relaxed text-foreground">
              {flag.reasoning}
            </p>
          </div>

          <div>
            <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              Suggested action
            </p>
            <p className="mt-1 text-sm leading-relaxed">{flag.suggestedAction}</p>
          </div>

          <div>
            <p className="mb-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              Supporting evidence
            </p>
            {evidenceDocs.length > 0 ? (
              <ul className="flex flex-col gap-1.5">
                {evidenceDocs.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5 text-xs"
                  >
                    <Badge variant="outline" className="shrink-0">
                      {doc.thumbnailLabel}
                    </Badge>
                    <span className="min-w-0 truncate font-medium">
                      {doc.name}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground">
                No source documents linked — based on return history and
                filing rules.
              </p>
            )}
          </div>

          {!isPending ? (
            <p className="rounded-md bg-muted px-3 py-2 text-xs font-medium capitalize">
              Resolved: {flag.status}
            </p>
          ) : null}
        </div>

        {isPending ? (
          <DialogFooter className="sm:justify-stretch">
            <div className="flex w-full flex-col gap-2 sm:flex-row">
              <Button
                className="flex-1"
                onClick={() => {
                  onResolve(flag.id, "accepted");
                  onOpenChange(false);
                }}
              >
                <Check className="size-3.5" />
                Accept suggestion
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  onResolve(flag.id, "rejected");
                  onOpenChange(false);
                }}
              >
                <X className="size-3.5" />
                Reject
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  onResolve(flag.id, "edited");
                  onOpenChange(false);
                }}
              >
                <Pencil className="size-3.5" />
                Edit manually
              </Button>
            </div>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
