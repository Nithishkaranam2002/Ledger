/**
 * Maps Prisma rows (snake_case enums, Date objects) to the wire types in
 * @/lib/api-types (kebab-case enums, ISO string dates — same shapes the
 * frontend already uses from @/lib/mock-data).
 */
import type {
  AIFlagModel as DbAIFlag,
  ClientModel as DbClient,
  DocumentModel as DbDocument,
  ReturnFieldModel as DbReturnField,
  TaxReturnModel as DbTaxReturn,
} from "@/generated/prisma/models";
import type {
  AIFlag,
  Client,
  Document,
  FieldState,
  ReturnField,
  ReturnStatus,
  TaxReturn,
} from "@/lib/mock-data";

const RETURN_STATUS_TO_WIRE: Record<DbTaxReturn["status"], ReturnStatus> = {
  not_started: "not-started",
  in_progress: "in-progress",
  pending_review: "pending-review",
  ready_to_file: "ready-to-file",
  filed: "filed",
};

const FIELD_STATE_TO_WIRE: Record<DbReturnField["state"], FieldState> = {
  ai_generated: "ai-generated",
  verified: "verified",
  editable: "editable",
  needs_approval: "needs-approval",
  locked: "locked",
};

export const WIRE_FIELD_STATE_TO_DB: Record<
  FieldState,
  DbReturnField["state"]
> = {
  "ai-generated": "ai_generated",
  verified: "verified",
  editable: "editable",
  "needs-approval": "needs_approval",
  locked: "locked",
};

function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function serializeClient(client: DbClient): Client {
  return {
    id: client.id,
    name: client.name,
    type: client.type,
    initials: client.initials,
  };
}

export function serializeTaxReturn(
  taxReturn: DbTaxReturn,
  pendingFlagCount: number
): TaxReturn {
  return {
    id: taxReturn.id,
    clientId: taxReturn.clientId,
    taxYear: taxReturn.taxYear,
    status: RETURN_STATUS_TO_WIRE[taxReturn.status],
    dueDate: toDateOnly(taxReturn.dueDate),
    assignedCPA: taxReturn.assignedCPA,
    completenessPercent: taxReturn.completenessPercent,
    flagCount: pendingFlagCount,
  };
}

export function serializeDocument(document: DbDocument): Document {
  return {
    id: document.id,
    returnId: document.returnId,
    name: document.name,
    type: document.type,
    uploadedAt: document.uploadedAt.toISOString(),
    pageCount: document.pageCount,
    thumbnailLabel: document.thumbnailLabel,
  };
}

export function serializeReturnField(field: DbReturnField): ReturnField {
  return {
    id: field.id,
    returnId: field.returnId,
    label: field.label,
    value: field.value,
    state: FIELD_STATE_TO_WIRE[field.state],
    sourceDocumentId: field.sourceDocumentId,
    sourcePage: field.sourcePage,
    ...(field.calculation != null ? { calculation: field.calculation } : {}),
    ...(field.confidence != null ? { confidence: field.confidence } : {}),
  };
}

export function serializeAIFlag(flag: DbAIFlag): AIFlag {
  return {
    id: flag.id,
    returnId: flag.returnId,
    fieldId: flag.fieldId,
    message: flag.message,
    reasoning: flag.reasoning,
    confidence: flag.confidence,
    evidenceDocIds: flag.evidenceDocIds,
    suggestedAction: flag.suggestedAction,
    status: flag.status,
  };
}
