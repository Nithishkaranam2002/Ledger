"use client";

import { FileSearch, Sparkles } from "lucide-react";

import { FIELD_STATE_META } from "@/components/returns/field-state-meta";
import { Badge } from "@/components/ui/badge";
import type { AIFlag, ReturnField } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface FieldRowProps {
  field: ReturnField;
  pendingFlag: AIFlag | null;
  onOpenSource: () => void;
  onOpenFlag: () => void;
}

export function FieldRow({
  field,
  pendingFlag,
  onOpenSource,
  onOpenFlag,
}: FieldRowProps) {
  const meta = FIELD_STATE_META[field.state];
  const Icon = meta.Icon;
  const hasSource = Boolean(field.sourceDocumentId || field.calculation);
  const isLocked = field.state === "locked";
  const isEditable = field.state === "editable";
  const isInteractive = Boolean(pendingFlag) || hasSource;

  function handleRowClick() {
    if (pendingFlag) {
      onOpenFlag();
      return;
    }
    if (hasSource) {
      onOpenSource();
    }
  }

  return (
    <div
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={isInteractive ? handleRowClick : undefined}
      onKeyDown={
        isInteractive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleRowClick();
              }
            }
          : undefined
      }
      className={cn(
        "group border-l-[3px] px-3 py-2.5 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        meta.rowClass,
        isInteractive && "cursor-pointer",
        isLocked && "cursor-default"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex items-start gap-2">
          <span
            className={cn(
              "mt-0.5 flex size-5 shrink-0 items-center justify-center",
              meta.iconClass
            )}
            title={meta.label}
          >
            <Icon className="size-3.5" aria-hidden />
            <span className="sr-only">{meta.label}</span>
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-sm font-medium leading-tight">
                {field.label}
              </span>
              {field.state === "needs-approval" ? (
                <Badge
                  variant="outline"
                  className="h-4 border-amber-300 bg-amber-100/80 px-1.5 text-[10px] text-amber-800"
                >
                  Review
                </Badge>
              ) : null}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {hasSource ? (
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenSource();
                  }}
                >
                  <FileSearch className="size-3" aria-hidden />
                  View source
                </button>
              ) : null}
              {pendingFlag ? (
                <button
                  type="button"
                  className="inline-flex"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenFlag();
                  }}
                >
                  <Badge
                    variant="destructive"
                    className="h-5 gap-1 px-1.5 text-[10px]"
                    data-icon="inline-start"
                  >
                    <Sparkles />
                    AI · {pendingFlag.confidence}%
                  </Badge>
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span
            className={cn(
              "text-sm font-semibold tabular-nums",
              meta.valueClass
            )}
          >
            {field.value}
          </span>
          {isEditable ? (
            <PencilHint />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function PencilHint() {
  const { Icon, iconClass } = FIELD_STATE_META.editable;
  return (
    <span
      className={cn(
        "opacity-0 transition-opacity group-hover:opacity-100",
        iconClass
      )}
      aria-hidden
    >
      <Icon className="size-3.5" />
    </span>
  );
}
