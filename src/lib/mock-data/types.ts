export type ClientType = "individual" | "business";

export type ReturnStatus =
  | "not-started"
  | "in-progress"
  | "pending-review"
  | "ready-to-file"
  | "filed";

export type FieldState =
  | "ai-generated"
  | "verified"
  | "editable"
  | "needs-approval"
  | "locked";

export type FlagStatus = "pending" | "accepted" | "rejected" | "edited";

export interface Client {
  id: string;
  name: string;
  type: ClientType;
  initials: string;
}

export interface TaxReturn {
  id: string;
  clientId: string;
  taxYear: number;
  status: ReturnStatus;
  dueDate: string;
  assignedCPA: string;
  completenessPercent: number;
  flagCount: number;
}

export interface Document {
  id: string;
  returnId: string;
  name: string;
  type: string;
  uploadedAt: string;
  pageCount: number;
  thumbnailLabel: string;
}

export interface ReturnField {
  id: string;
  returnId: string;
  label: string;
  value: string;
  state: FieldState;
  sourceDocumentId: string | null;
  sourcePage: number | null;
  calculation?: string;
  confidence?: number;
}

export interface AIFlag {
  id: string;
  returnId: string;
  fieldId: string;
  message: string;
  reasoning: string;
  confidence: number;
  evidenceDocIds: string[];
  suggestedAction: string;
  status: FlagStatus;
}
