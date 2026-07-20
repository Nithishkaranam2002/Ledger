"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Document, ReturnField } from "@/lib/mock-data";
import { FileText } from "lucide-react";

interface SourceTraceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  field: ReturnField | null;
  document: Document | null;
}

export function SourceTraceDialog({
  open,
  onOpenChange,
  field,
  document,
}: SourceTraceDialogProps) {
  if (!field) return null;

  const page = field.sourcePage;
  const hasDoc = Boolean(document);
  const confidence =
    field.confidence != null
      ? Math.min(100, Math.max(0, field.confidence))
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="gap-0 overflow-hidden p-0 sm:max-w-3xl lg:max-w-4xl"
        showCloseButton
      >
        <DialogHeader className="border-b border-border px-4 py-3 sm:px-5">
          <DialogTitle>Source review</DialogTitle>
          <DialogDescription>
            {hasDoc && page != null ? (
              <>
                Side-by-side:{" "}
                <span className="font-medium text-foreground">
                  {document!.name}
                </span>
                , page {page} ↔ return field.
              </>
            ) : hasDoc ? (
              <>
                Side-by-side:{" "}
                <span className="font-medium text-foreground">
                  {document!.name}
                </span>{" "}
                ↔ return field.
              </>
            ) : (
              <>Source document details for this field.</>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid max-h-[min(80vh,640px)] gap-0 overflow-y-auto md:grid-cols-2">
          {/* Document plane */}
          <div className="border-b border-border bg-muted/40 p-4 md:border-r md:border-b-0 sm:p-5">
            <p className="mb-3 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              Source document
            </p>
            {hasDoc ? (
              <div className="mx-auto flex w-full max-w-sm flex-col overflow-hidden rounded-lg border border-border bg-background shadow-sm">
                <div className="flex items-center justify-between border-b border-border bg-muted/50 px-3 py-2">
                  <span className="truncate text-xs font-medium">
                    {document!.name}
                  </span>
                  <span className="shrink-0 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                    {document!.thumbnailLabel}
                    {page != null ? ` · p.${page}` : ""}
                  </span>
                </div>

                <div
                  className="relative flex min-h-[220px] flex-col gap-2 p-4"
                  style={{
                    backgroundImage:
                      "linear-gradient(to bottom, transparent 23px, var(--border) 24px)",
                    backgroundSize: "100% 24px",
                  }}
                  aria-hidden
                >
                  <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                    <FileText className="size-4" />
                    <span className="text-[10px] tracking-wide uppercase">
                      Simulated page preview
                    </span>
                  </div>

                  {/* Fake line rows */}
                  <div className="h-2 w-4/5 rounded-full bg-border/80" />
                  <div className="h-2 w-3/5 rounded-full bg-border/60" />
                  <div className="h-2 w-2/3 rounded-full bg-border/70" />

                  {/* Highlight band for the extracted value */}
                  <div className="my-1 rounded-md border border-amber-300/80 bg-amber-100/80 px-2.5 py-2 ring-2 ring-amber-400/40">
                    <p className="text-[10px] font-medium tracking-wide text-amber-900/70 uppercase">
                      Extracted region
                      {page != null ? ` · page ${page}` : ""}
                    </p>
                    <p className="mt-0.5 text-sm font-semibold tabular-nums text-amber-950">
                      {field.value}
                    </p>
                  </div>

                  <div className="h-2 w-3/4 rounded-full bg-border/70" />
                  <div className="h-2 w-1/2 rounded-full bg-border/50" />
                  <div className="h-2 w-2/5 rounded-full bg-border/60" />
                </div>

                <div className="border-t border-border px-3 py-2 text-[11px] text-muted-foreground">
                  {document!.type}
                  {document!.pageCount > 1
                    ? ` · ${document!.pageCount} pages`
                    : ""}
                  {page != null ? ` · Viewing page ${page}` : ""}
                </div>
              </div>
            ) : (
              <div className="flex min-h-[220px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-background px-4 text-center">
                <FileText className="size-8 text-muted-foreground" aria-hidden />
                <p className="mt-2 text-sm text-muted-foreground">
                  No source document linked to this field.
                </p>
              </div>
            )}
          </div>

          {/* Field / calculation plane */}
          <div className="flex flex-col gap-4 p-4 sm:p-5">
            <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              Return field
            </p>

            <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5">
              <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                Field on return
              </p>
              <p className="mt-1 text-sm font-medium leading-snug">
                {field.label}
              </p>
              <p className="mt-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                Value shown
              </p>
              <p className="mt-0.5 text-lg font-semibold tabular-nums tracking-tight">
                {field.value}
              </p>
            </div>

            {hasDoc ? (
              <div className="rounded-lg border border-border px-3 py-2.5">
                <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  Traces to
                </p>
                <p className="mt-1 text-sm font-medium leading-snug">
                  {document!.name}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {page != null
                    ? `Page ${page}`
                    : "Page not specified"}
                  {document!.thumbnailLabel
                    ? ` · ${document!.thumbnailLabel}`
                    : ""}
                </p>
              </div>
            ) : null}

            {field.calculation ? (
              <div className="rounded-lg border border-dashed border-border px-3 py-2.5">
                <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  Calculation path
                </p>
                <p className="mt-1 font-mono text-xs leading-relaxed text-foreground">
                  {field.calculation}
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-border px-3 py-2.5">
                <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  Calculation path
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Direct extraction — no transformation applied.
                </p>
              </div>
            )}

            {confidence != null ? (
              <div className="rounded-lg border border-border px-3 py-2.5">
                <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  Extraction confidence
                </p>
                <div className="mt-1.5 flex items-center gap-3">
                  <div
                    className="h-2 flex-1 overflow-hidden rounded-full bg-muted"
                    role="meter"
                    aria-valuenow={confidence}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${confidence}% extraction confidence`}
                  >
                    <div
                      className="h-full rounded-full bg-foreground/70"
                      style={{ width: `${confidence}%` }}
                    />
                  </div>
                  <span className="w-10 shrink-0 text-right text-sm font-semibold tabular-nums">
                    {confidence}%
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
