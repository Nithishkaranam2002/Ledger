"use client";

import { Check, Loader2, Lock, Pencil, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { FlagAction } from "@/lib/api-types";
import type { AIFlag, Document, ReturnField } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface AIFlagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flag: AIFlag | null;
  field: ReturnField | null;
  evidenceDocs: Document[];
  resolvingAction: FlagAction | null;
  /** When false (e.g. Reviewer role), the dialog is read-only. */
  canModify: boolean;
  onResolve: (flagId: string, action: FlagAction) => void | Promise<void>;
}

export function AIFlagDialog({
  open,
  onOpenChange,
  flag,
  field,
  evidenceDocs,
  resolvingAction,
  canModify,
  onResolve,
}: AIFlagDialogProps) {
  const isPending = flag?.status === "pending";
  const isSaving = resolvingAction != null;
  const confidence = flag
    ? Math.min(100, Math.max(0, flag.confidence))
    : 0;

  return (
    <Dialog
      open={open && flag != null}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isSaving) onOpenChange(false);
      }}
    >
      {flag ? (
        <DialogContent className="sm:max-w-lg" showCloseButton={!isSaving}>
          <DialogHeader>
            <DialogTitle className="leading-snug pr-6">
              {flag.message}
            </DialogTitle>
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

          {isPending ? (
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
                <p className="mt-1 text-sm leading-relaxed">
                  {flag.suggestedAction}
                </p>
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
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-muted/40 px-3 py-4 text-center">
              <p className="text-sm font-medium capitalize">
                Resolved: {flag.status}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                This AI flag has already been handled.
              </p>
            </div>
          )}

          {isPending && !canModify ? (
            <DialogFooter>
              <div className="flex w-full items-center justify-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2.5">
                <Lock
                  className="size-3.5 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                <p className="text-xs font-medium text-muted-foreground">
                  Reviewers cannot modify flags — read-only access
                </p>
              </div>
            </DialogFooter>
          ) : null}

          {isPending && canModify ? (
            <DialogFooter className="sm:justify-stretch">
              <div className="flex w-full flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  disabled={isSaving}
                  className={cn(buttonVariants(), "flex-1")}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => onResolve(flag.id, "accept")}
                >
                  {resolvingAction === "accept" ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Check className="size-3.5" />
                  )}
                  {resolvingAction === "accept" ? "Saving…" : "Accept suggestion"}
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  className={cn(buttonVariants({ variant: "outline" }), "flex-1")}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => onResolve(flag.id, "reject")}
                >
                  {resolvingAction === "reject" ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <X className="size-3.5" />
                  )}
                  {resolvingAction === "reject" ? "Saving…" : "Reject"}
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  className={cn(
                    buttonVariants({ variant: "secondary" }),
                    "flex-1"
                  )}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => onResolve(flag.id, "edit")}
                >
                  {resolvingAction === "edit" ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Pencil className="size-3.5" />
                  )}
                  {resolvingAction === "edit" ? "Saving…" : "Edit manually"}
                </button>
              </div>
            </DialogFooter>
          ) : null}
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
