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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>Source trace</DialogTitle>
          <DialogDescription>
            {hasDoc && page != null ? (
              <>
                This value traces back to{" "}
                <span className="font-medium text-foreground">
                  {document!.name}
                </span>
                , page {page}.
              </>
            ) : hasDoc ? (
              <>
                This value traces back to{" "}
                <span className="font-medium text-foreground">
                  {document!.name}
                </span>
                .
              </>
            ) : (
              <>Source document details for this field.</>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {hasDoc ? (
            <div className="flex gap-3">
              <div
                className="flex aspect-[3/4] w-20 shrink-0 flex-col items-center justify-between rounded-md border border-border bg-muted/60 p-2 text-center shadow-sm"
                aria-hidden
              >
                <FileText className="mt-2 size-5 text-muted-foreground" />
                <div className="w-full space-y-1">
                  <div className="mx-auto h-1 w-3/4 rounded-full bg-border" />
                  <div className="mx-auto h-1 w-1/2 rounded-full bg-border" />
                </div>
                <span className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                  {document!.thumbnailLabel}
                  {page != null ? ` · p.${page}` : ""}
                </span>
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                <div>
                  <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                    Document
                  </p>
                  <p className="text-sm font-medium leading-snug">
                    {document!.name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {document!.type}
                    {document!.pageCount > 1
                      ? ` · ${document!.pageCount} pages`
                      : ""}
                    {page != null ? ` · Page ${page}` : ""}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5">
            <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              Extracted value
            </p>
            <p className="mt-1 text-sm">
              <span className="text-muted-foreground">{field.label}: </span>
              <span className="font-semibold tabular-nums">{field.value}</span>
            </p>
            {page != null && hasDoc ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Appears on page {page}
                {document!.thumbnailLabel
                  ? ` of ${document!.thumbnailLabel}`
                  : ""}
                .
              </p>
            ) : null}
          </div>

          {field.calculation ? (
            <div className="rounded-lg border border-dashed border-border px-3 py-2.5">
              <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                Calculation path
              </p>
              <p className="mt-1 font-mono text-xs leading-relaxed text-foreground">
                {field.calculation}
              </p>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
