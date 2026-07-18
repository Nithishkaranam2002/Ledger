"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Building2, ChevronRight, Loader2, User } from "lucide-react";
import { toast } from "sonner";

import { ActivityLog } from "@/components/returns/activity-log";
import { AIFlagDialog } from "@/components/returns/ai-flag-dialog";
import { CollaborationPanel } from "@/components/returns/collaboration-panel";
import { DocumentsPanel } from "@/components/returns/documents-panel";
import { FieldEditDialog } from "@/components/returns/field-edit-dialog";
import { FieldRow } from "@/components/returns/field-row";
import { FieldStateLegend } from "@/components/returns/field-state-legend";
import { FlagsPanel } from "@/components/returns/flags-panel";
import { SourceTraceDialog } from "@/components/returns/source-trace-dialog";
import { StatusStepper } from "@/components/returns/status-stepper";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserSwitcher } from "@/components/user-switcher";
import { useCurrentUser } from "@/lib/current-user-context";
import type {
  ApiErrorResponse,
  AuditLogEntryDTO,
  AuditLogResponse,
  FlagAction,
  FlagActionResponse,
  ReturnFieldWithSource,
} from "@/lib/api-types";
import { correctedValueForFlag } from "@/lib/fake-edit";
import {
  hasOpenClientRequest,
  threadsForReturn,
  type AIFlag,
  type Client,
  type Document,
  type ReturnField,
  type TaxReturn,
} from "@/lib/mock-data";
import {
  computeNextAction,
  countPendingFlags,
} from "@/lib/return-progress";
import {
  formatDueDate,
  formatStatus,
  getDueUrgency,
} from "@/lib/urgency";
import { cn } from "@/lib/utils";

type DetailTab = "fields" | "documents" | "flags" | "requests" | "activity";
type FieldFilter = "all" | "needs-attention" | "ai-generated" | "has-source";

const TAB_VALUES: DetailTab[] = [
  "fields",
  "documents",
  "flags",
  "requests",
  "activity",
];

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
  const { user } = useCurrentUser();
  const canModifyFlags = user.role !== "reviewer";
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [fields, setFields] = useState<ReturnField[]>(initialFields);
  const [flags, setFlags] = useState<AIFlag[]>(initialFlags);
  const [auditEntries, setAuditEntries] = useState<AuditLogEntryDTO[]>(
    initialAuditEntries
  );
  const flagFromUrl = searchParams.get("flag");
  const tabFromUrl = searchParams.get("tab") as DetailTab | null;

  const [sourceFieldId, setSourceFieldId] = useState<string | null>(null);
  const [activeFlagId, setActiveFlagId] = useState<string | null>(() =>
    flagFromUrl && initialFlags.some((f) => f.id === flagFromUrl)
      ? flagFromUrl
      : null
  );
  const [editFieldId, setEditFieldId] = useState<string | null>(null);
  const [savingField, setSavingField] = useState(false);
  const [resolvingAction, setResolvingAction] = useState<FlagAction | null>(
    null
  );
  const [fieldFilter, setFieldFilter] = useState<FieldFilter>("all");

  const [tab, setTab] = useState<DetailTab>(() => {
    if (flagFromUrl && initialFlags.some((f) => f.id === flagFromUrl)) {
      return "flags";
    }
    if (tabFromUrl && TAB_VALUES.includes(tabFromUrl)) return tabFromUrl;
    return "fields";
  });

  const documentsById = useMemo(
    () => Object.fromEntries(documents.map((doc) => [doc.id, doc])),
    [documents]
  );

  const fieldsById = useMemo(
    () => Object.fromEntries(fields.map((f) => [f.id, f])),
    [fields]
  );

  const flagByFieldId = useMemo(() => {
    const map: Record<string, AIFlag> = {};
    for (const flag of flags) map[flag.fieldId] = flag;
    return map;
  }, [flags]);

  const pendingFlagByFieldId = useMemo(() => {
    const map: Record<string, AIFlag> = {};
    for (const flag of flags) {
      if (flag.status === "pending") map[flag.fieldId] = flag;
    }
    return map;
  }, [flags]);

  const linkedDocIds = useMemo(() => {
    const ids = new Set<string>();
    for (const field of fields) {
      if (field.sourceDocumentId) ids.add(field.sourceDocumentId);
    }
    return ids;
  }, [fields]);

  const threads = useMemo(
    () => threadsForReturn(taxReturn.id),
    [taxReturn.id]
  );

  const pendingCount = countPendingFlags(flags);
  const hasAnyFlags = flags.length > 0;
  const nextAction = computeNextAction(taxReturn, pendingCount, {
    outstandingClientRequest: hasOpenClientRequest(taxReturn.id),
  });

  const filteredFields = useMemo(() => {
    return fields.filter((field) => {
      const pending = pendingFlagByFieldId[field.id];
      switch (fieldFilter) {
        case "needs-attention":
          return (
            field.state === "needs-approval" ||
            field.state === "ai-generated" ||
            Boolean(pending)
          );
        case "ai-generated":
          return field.state === "ai-generated";
        case "has-source":
          return Boolean(field.sourceDocumentId || field.calculation);
        default:
          return true;
      }
    });
  }, [fields, fieldFilter, pendingFlagByFieldId]);

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
  const editField = fields.find((f) => f.id === editFieldId) ?? null;

  const urgency = getDueUrgency(taxReturn.dueDate);
  const TypeIcon = client.type === "business" ? Building2 : User;

  function updateUrl(nextTab: DetailTab, flagId?: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", nextTab);
    if (flagId) params.set("flag", flagId);
    else params.delete("flag");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function openFlag(flagId: string) {
    setActiveFlagId(flagId);
    setTab("flags");
    updateUrl("flags", flagId);
  }

  async function refreshAuditLog() {
    try {
      const res = await fetch(`/api/returns/${taxReturn.id}/audit-log`);
      if (!res.ok) return;
      const log = (await res.json()) as AuditLogResponse;
      setAuditEntries(log.entries);
    } catch {
      // Non-critical
    }
  }

  async function resolveFlag(flagId: string, action: FlagAction) {
    if (!canModifyFlags) return;

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
      performedBy: user.name,
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
      updateUrl(tab, null);

      const successMessages: Record<FlagAction, string> = {
        accept: "Suggestion accepted — field marked verified.",
        reject: "Suggestion rejected — flag dismissed.",
        edit: "Value updated — field marked verified.",
      };
      toast.success(successMessages[action]);
      void refreshAuditLog();
    } catch {
      toast.error("Couldn't reach the server. Try again.");
    } finally {
      setResolvingAction(null);
    }
  }

  async function saveFieldEdit(fieldId: string, value: string) {
    if (!canModifyFlags) {
      toast.error("Reviewers cannot edit fields.");
      return;
    }
    setSavingField(true);
    try {
      const response = await fetch(`/api/fields/${fieldId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value, performedBy: user.name }),
      });
      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as
          | ApiErrorResponse
          | null;
        toast.error(errorBody?.error ?? `Request failed (${response.status})`);
        return;
      }
      const data = (await response.json()) as { field: ReturnField };
      setFields((prev) =>
        prev.map((item) => (item.id === data.field.id ? data.field : item))
      );
      setEditFieldId(null);
      toast.success("Value updated — field marked verified.");
      void refreshAuditLog();
    } catch {
      toast.error("Couldn't reach the server. Try again.");
    } finally {
      setSavingField(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <nav
          aria-label="Breadcrumb"
          className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground"
        >
          <Link href="/" className="shrink-0 font-medium hover:text-foreground">
            Dashboard
          </Link>
          <ChevronRight className="size-3 shrink-0 opacity-60" aria-hidden />
          <span className="truncate font-medium text-foreground">
            {client.name}
          </span>
          <ChevronRight className="size-3 shrink-0 opacity-60" aria-hidden />
          <span className="shrink-0">TY {taxReturn.taxYear}</span>
        </nav>
        <UserSwitcher quiet />
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
                <span aria-hidden>·</span>
                <span>Assigned {taxReturn.assignedCPA}</span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <Badge variant="outline">{formatStatus(taxReturn.status)}</Badge>
            <span className="text-[11px] text-muted-foreground">
              {!hasAnyFlags
                ? "No AI flags — all fields clear"
                : pendingCount === 0
                  ? "All AI flags resolved"
                  : pendingCount === 1
                    ? "1 pending flag"
                    : `${pendingCount} pending flags`}
            </span>
          </div>
        </div>
      </header>

      <div className="mb-4">
        <StatusStepper
          status={taxReturn.status}
          nextAction={nextAction}
          completenessPercent={taxReturn.completenessPercent}
        />
      </div>

      <div className="mb-4">
        <FieldStateLegend />
      </div>

      <Tabs
        value={tab}
        onValueChange={(value) => {
          const next = value as DetailTab;
          setTab(next);
          updateUrl(next, activeFlagId);
        }}
        className="gap-3"
      >
        <TabsList variant="line" className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="fields">Fields</TabsTrigger>
          <TabsTrigger value="documents">
            Documents
            <span className="text-[10px] text-muted-foreground">
              {documents.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="flags">
            Flags
            {pendingCount > 0 ? (
              <span className="rounded-full bg-destructive px-1.5 text-[10px] text-white">
                {pendingCount}
              </span>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="requests">
            Requests
            {threads.filter((t) => t.status === "open").length > 0 ? (
              <span className="text-[10px] text-muted-foreground">
                {threads.filter((t) => t.status === "open").length}
              </span>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="fields" className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                ["all", "All"],
                ["needs-attention", "Needs attention"],
                ["ai-generated", "AI-generated"],
                ["has-source", "Has source"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFieldFilter(value)}
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors",
                  fieldFilter === value
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="overflow-hidden rounded-lg border border-border bg-card">
            {filteredFields.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                No fields match this filter
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {filteredFields.map((field) => {
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
                          if (linkedFlag) openFlag(linkedFlag.id);
                        }}
                        onEdit={
                          canModifyFlags
                            ? () => setEditFieldId(field.id)
                            : undefined
                        }
                      />
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </TabsContent>

        <TabsContent value="documents">
          <DocumentsPanel
            documents={documents}
            linkedDocIds={linkedDocIds}
          />
        </TabsContent>

        <TabsContent value="flags">
          <FlagsPanel
            flags={flags}
            fieldsById={fieldsById}
            onOpenFlag={openFlag}
          />
        </TabsContent>

        <TabsContent value="requests">
          <CollaborationPanel
            threads={threads}
            onOpenLinkedFlag={openFlag}
          />
        </TabsContent>

        <TabsContent value="activity">
          <ActivityLog
            embedded
            entries={auditEntries}
            fieldLabels={Object.fromEntries(
              fields.map((field) => [field.id, field.label])
            )}
          />
        </TabsContent>
      </Tabs>

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
          if (!open && resolvingAction == null) {
            setActiveFlagId(null);
            updateUrl(tab, null);
          }
        }}
        flag={activeFlag}
        field={flagField}
        evidenceDocs={evidenceDocs}
        resolvingAction={resolvingAction}
        canModify={canModifyFlags}
        onResolve={resolveFlag}
      />

      <FieldEditDialog
        key={editField?.id ?? "closed"}
        open={editFieldId != null}
        onOpenChange={(open) => {
          if (!open && !savingField) setEditFieldId(null);
        }}
        field={editField}
        saving={savingField}
        onSave={saveFieldEdit}
      />

      {resolvingAction || savingField ? (
        <span className="sr-only" role="status">
          Saving
          <Loader2 className="inline size-3 animate-spin" />
        </span>
      ) : null}
    </main>
  );
}
