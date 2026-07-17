"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Building2, Loader2, User } from "lucide-react";
import { toast } from "sonner";

import { ActivityLog } from "@/components/returns/activity-log";
import { AIFlagDialog } from "@/components/returns/ai-flag-dialog";
import { FieldRow } from "@/components/returns/field-row";
import { FieldStateLegend } from "@/components/returns/field-state-legend";
import { SourceTraceDialog } from "@/components/returns/source-trace-dialog";
import { Badge } from "@/components/ui/badge";
import type {
  ApiErrorResponse,
  AuditLogEntryDTO,
  AuditLogResponse,
  FlagAction,
  FlagActionResponse,
  ReturnFieldWithSource,
} from "@/lib/api-types";
import { correctedValueForFlag } from "@/lib/fake-edit";
import type {
  AIFlag,
  Client,
  Document,
  ReturnField,
  TaxReturn,
} from "@/lib/mock-data";
import {
  formatDueDate,
  formatStatus,
  getDueUrgency,
} from "@/lib/urgency";
import { cn } from "@/lib/utils";

const CPA_NAME = "Sarah Kim";

interface ReturnDetailViewProps {
  taxReturn: TaxReturn;
  client: Client;
  fields: ReturnFieldWithSource[];
  documents: Document[];
  flags: AIFlag[];
  auditEntries: AuditLogEntryDTO[];
}

export function ReturnDetailView({
  taxReturn,
  client,
  fields: initialFields,
  documents,
  flags: initialFlags,
  auditEntries: initialAuditEntries,
}: ReturnDetailViewProps) {
  // Hydrated from the server; updated from PATCH responses (DB is source of truth)
  const [fields, setFields] = useState<ReturnField[]>(initialFields);
  const [flags, setFlags] = useState<AIFlag[]>(initialFlags);
  const [auditEntries, setAuditEntries] = useState<AuditLogEntryDTO[]>(
    initialAuditEntries
  );
  const [sourceFieldId, setSourceFieldId] = useState<string | null>(null);
  const [activeFlagId, setActiveFlagId] = useState<string | null>(null);
  const [resolvingAction, setResolvingAction] = useState<FlagAction | null>(
    null
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

  async function resolveFlag(flagId: string, action: FlagAction) {
    const flag = flags.find((f) => f.id === flagId);
    const field = flag
      ? fields.find((f) => f.id === flag.fieldId)
      : undefined;
    if (!flag || !field) return;

    const body: {
      action: FlagAction;
      performedBy: string;
      newValue?: string;
    } = {
      action,
      performedBy: CPA_NAME,
    };

    if (action === "edit") {
      body.newValue = correctedValueForFlag(flag, field.value);
    }

    setResolvingAction(action);
    try {
      const response = await fetch(`/api/flags/${flagId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as
          | ApiErrorResponse
          | null;
        toast.error(errorBody?.error ?? `Request failed (${response.status})`);
        return;
      }

      const data = (await response.json()) as FlagActionResponse;
      setFlags((prev) =>
        prev.map((item) => (item.id === data.flag.id ? data.flag : item))
      );
      setFields((prev) =>
        prev.map((item) => (item.id === data.field.id ? data.field : item))
      );
      setActiveFlagId(null);

      // Refresh the activity log so the new audit entry shows immediately
      fetch(`/api/returns/${taxReturn.id}/audit-log`)
        .then((res) => (res.ok ? res.json() : null))
        .then((log: AuditLogResponse | null) => {
          if (log) setAuditEntries(log.entries);
        })
        .catch(() => {
          // Non-critical; the log will catch up on next page load
        });
    } catch {
      toast.error("Couldn't reach the server. Try again.");
    } finally {
      setResolvingAction(null);
    }
  }

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

      <ActivityLog
        entries={auditEntries}
        fieldLabels={Object.fromEntries(
          fields.map((field) => [field.id, field.label])
        )}
      />

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
          if (!open && resolvingAction == null) setActiveFlagId(null);
        }}
        flag={activeFlag}
        field={flagField}
        evidenceDocs={evidenceDocs}
        resolvingAction={resolvingAction}
        onResolve={resolveFlag}
      />

      {resolvingAction ? (
        <span className="sr-only" role="status">
          Saving
          <Loader2 className="inline size-3 animate-spin" />
        </span>
      ) : null}
    </main>
  );
}
