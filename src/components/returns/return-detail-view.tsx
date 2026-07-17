"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Building2, User } from "lucide-react";

import { AIFlagDialog } from "@/components/returns/ai-flag-dialog";
import { FieldRow } from "@/components/returns/field-row";
import { FieldStateLegend } from "@/components/returns/field-state-legend";
import { SourceTraceDialog } from "@/components/returns/source-trace-dialog";
import { Badge } from "@/components/ui/badge";
import { correctedValueForFlag } from "@/lib/fake-edit";
import type {
  AIFlag,
  Client,
  Document,
  FieldState,
  FlagStatus,
  ReturnField,
  TaxReturn,
} from "@/lib/mock-data";
import {
  formatDueDate,
  formatStatus,
  getDueUrgency,
} from "@/lib/urgency";
import { cn } from "@/lib/utils";

interface FieldOverride {
  state?: FieldState;
  value?: string;
}

interface ReturnDetailViewProps {
  taxReturn: TaxReturn;
  client: Client;
  fields: ReturnField[];
  documents: Document[];
  flags: AIFlag[];
}

export function ReturnDetailView({
  taxReturn,
  client,
  fields: initialFields,
  documents,
  flags: initialFlags,
}: ReturnDetailViewProps) {
  // Local session state — source of truth for flag resolution while the page is open
  const [flagStatuses, setFlagStatuses] = useState<Record<string, FlagStatus>>(
    () =>
      Object.fromEntries(
        initialFlags.map((flag) => [flag.id, flag.status] as const)
      )
  );
  const [fieldOverrides, setFieldOverrides] = useState<
    Record<string, FieldOverride>
  >({});
  const [sourceFieldId, setSourceFieldId] = useState<string | null>(null);
  const [activeFlagId, setActiveFlagId] = useState<string | null>(null);

  const flags = useMemo<AIFlag[]>(
    () =>
      initialFlags.map((flag) => ({
        ...flag,
        status: flagStatuses[flag.id] ?? flag.status,
      })),
    [initialFlags, flagStatuses]
  );

  const fields = useMemo<ReturnField[]>(
    () =>
      initialFields.map((field) => {
        const override = fieldOverrides[field.id];
        if (!override) return field;
        return {
          ...field,
          ...(override.state !== undefined ? { state: override.state } : {}),
          ...(override.value !== undefined ? { value: override.value } : {}),
        };
      }),
    [initialFields, fieldOverrides]
  );

  const documentsById = useMemo(
    () => Object.fromEntries(documents.map((doc) => [doc.id, doc])),
    [documents]
  );

  const flagByFieldId = useMemo(() => {
    const map: Record<string, AIFlag> = {};
    for (const flag of flags) {
      map[flag.fieldId] = flag;
    }
    return map;
  }, [flags]);

  const pendingFlagByFieldId = useMemo(() => {
    const map: Record<string, AIFlag> = {};
    for (const flag of flags) {
      if (flag.status === "pending") {
        map[flag.fieldId] = flag;
      }
    }
    return map;
  }, [flags]);

  const sourceField = fields.find((f) => f.id === sourceFieldId) ?? null;
  const sourceDoc = sourceField?.sourceDocumentId
    ? (documentsById[sourceField.sourceDocumentId] ?? null)
    : null;

  const activeFlag = flags.find((f) => f.id === activeFlagId) ?? null;
  const flagField = activeFlag
    ? (fields.find((f) => f.id === activeFlag.fieldId) ?? null)
    : null;
  const evidenceDocs = activeFlag
    ? activeFlag.evidenceDocIds
        .map((id) => documentsById[id])
        .filter((doc): doc is Document => Boolean(doc))
    : [];

  const urgency = getDueUrgency(taxReturn.dueDate);
  const TypeIcon = client.type === "business" ? Building2 : User;
  const pendingCount = flags.filter((f) => f.status === "pending").length;

  const resolveFlag = useCallback(
    (id: string, status: Exclude<FlagStatus, "pending">) => {
      const flag = initialFlags.find((f) => f.id === id);
      if (!flag) return;

      const fieldId = flag.fieldId;
      const currentField =
        initialFields.find((f) => f.id === fieldId) ??
        fields.find((f) => f.id === fieldId);

      setFlagStatuses((prev) => ({ ...prev, [id]: status }));

      if (status === "accepted") {
        setFieldOverrides((prev) => ({
          ...prev,
          [fieldId]: { state: "verified" },
        }));
      } else if (status === "rejected") {
        // Keep original field state/value — only the flag is dismissed
        setFieldOverrides((prev) => {
          const next = { ...prev };
          delete next[fieldId];
          return next;
        });
      } else {
        setFieldOverrides((prev) => ({
          ...prev,
          [fieldId]: {
            state: "editable",
            value: correctedValueForFlag(
              flag,
              currentField?.value ?? prev[fieldId]?.value ?? ""
            ),
          },
        }));
      }

      // Close after state updates are scheduled
      setActiveFlagId(null);
    },
    [initialFlags, initialFields, fields]
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <div className="mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Dashboard
        </Link>
      </div>

      <header className="mb-4 border-b border-border pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex items-start gap-2.5">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <TypeIcon className="size-4" aria-hidden />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold tracking-tight">
                {client.name}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                <span>Tax year {taxReturn.taxYear}</span>
                <span aria-hidden>·</span>
                <span
                  className={cn(
                    "font-medium",
                    urgency === "overdue" && "text-red-600",
                    urgency === "due-soon" && "text-amber-600"
                  )}
                >
                  Due {formatDueDate(taxReturn.dueDate)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <Badge variant="outline">{formatStatus(taxReturn.status)}</Badge>
            <span className="text-[11px] text-muted-foreground">
              {pendingCount === 0
                ? "No pending flags"
                : pendingCount === 1
                  ? "1 pending flag"
                  : `${pendingCount} pending flags`}
            </span>
          </div>
        </div>
      </header>

      <div className="mb-4">
        <FieldStateLegend />
      </div>

      <section aria-labelledby="fields-heading">
        <div className="mb-2 flex items-baseline justify-between">
          <h2
            id="fields-heading"
            className="text-sm font-semibold tracking-tight"
          >
            Return fields
          </h2>
          <span className="text-xs tabular-nums text-muted-foreground">
            {fields.length}
          </span>
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <ul className="divide-y divide-border">
            {fields.map((field) => {
              const linkedFlag = flagByFieldId[field.id];
              const pendingFlag = pendingFlagByFieldId[field.id] ?? null;
              const resolvedStatus =
                linkedFlag && linkedFlag.status !== "pending"
                  ? linkedFlag.status
                  : null;

              return (
                <li key={field.id}>
                  <FieldRow
                    field={field}
                    pendingFlag={pendingFlag}
                    resolvedStatus={resolvedStatus}
                    onOpenSource={() => setSourceFieldId(field.id)}
                    onOpenFlag={() => {
                      if (linkedFlag) setActiveFlagId(linkedFlag.id);
                    }}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <SourceTraceDialog
        open={sourceFieldId != null}
        onOpenChange={(open) => {
          if (!open) setSourceFieldId(null);
        }}
        field={sourceField}
        document={sourceDoc}
      />

      <AIFlagDialog
        open={activeFlagId != null}
        onOpenChange={(open) => {
          if (!open) setActiveFlagId(null);
        }}
        flag={activeFlag}
        field={flagField}
        evidenceDocs={evidenceDocs}
        onResolve={resolveFlag}
      />
    </main>
  );
}
