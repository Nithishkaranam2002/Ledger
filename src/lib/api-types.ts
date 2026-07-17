/**
 * Request/response shapes for the API routes under src/app/api/.
 * Wire format intentionally reuses the existing frontend types from
 * @/lib/mock-data (kebab-case enums, ISO string dates) so pages can
 * switch from static imports to fetch calls without remapping anything.
 */
import type {
  AIFlag,
  Client,
  Document,
  ReturnField,
  TaxReturn,
} from "@/lib/mock-data";
import type { UrgencySection } from "@/lib/urgency";

// GET /api/returns
export interface ReturnSummary extends TaxReturn {
  client: Client;
  /** Urgency bucket; null only for filed returns */
  urgency: UrgencySection | null;
}

export interface ReturnsResponse {
  returns: ReturnSummary[];
}

// GET /api/returns/[id]
export interface ReturnFieldWithSource extends ReturnField {
  sourceDocument: Document | null;
}

export interface ReturnDetailResponse {
  taxReturn: TaxReturn;
  client: Client;
  fields: ReturnFieldWithSource[];
  /** Return's own documents plus any flag-evidence docs from other returns */
  documents: Document[];
  flags: AIFlag[];
}

// PATCH /api/flags/[id]
export type FlagAction = "accept" | "reject" | "edit";

export interface FlagActionRequest {
  action: FlagAction;
  /** Required when action is "edit" */
  newValue?: string;
  performedBy: string;
}

export interface FlagActionResponse {
  flag: AIFlag;
  field: ReturnField;
}

// GET /api/returns/[id]/audit-log
export type AuditAction =
  | "flag_accepted"
  | "flag_rejected"
  | "flag_edited"
  | "field_edited";

export interface AuditLogEntryDTO {
  id: string;
  flagId: string | null;
  fieldId: string | null;
  action: AuditAction;
  performedBy: string;
  previousValue: string | null;
  newValue: string | null;
  createdAt: string;
}

export interface AuditLogResponse {
  entries: AuditLogEntryDTO[];
}

export interface ApiErrorResponse {
  error: string;
}
