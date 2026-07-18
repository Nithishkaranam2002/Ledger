/**
 * Seeded collaboration threads for the return-detail Requests panel.
 * Simulated — no messaging backend. Tied to documents / flags / fields.
 */

export type ThreadVisibility = "internal" | "client";
export type ThreadStatus = "open" | "resolved";

export interface CollaborationThread {
  id: string;
  returnId: string;
  subject: string;
  visibility: ThreadVisibility;
  status: ThreadStatus;
  /** Who owes the next reply */
  nextOwner: "preparer" | "reviewer" | "client" | "firm";
  nextOwnerLabel: string;
  /** Optional links into return objects */
  fieldId?: string;
  flagId?: string;
  documentId?: string;
  preview: string;
  updatedAt: string;
}

export const mockCollaborationThreads: CollaborationThread[] = [
  {
    id: "thread-01",
    returnId: "return-01",
    subject: "Missing Form 1098 — mortgage interest",
    visibility: "client",
    status: "open",
    nextOwner: "client",
    nextOwnerLabel: "Margaret Chen (client)",
    fieldId: "field-01-mortgage",
    flagId: "flag-01",
    documentId: "doc-01a",
    preview:
      "Hi Margaret — AI flagged mortgage interest at $14,200. Can you upload the corrected Form 1098 from your lender?",
    updatedAt: "2026-07-16T14:20:00.000Z",
  },
  {
    id: "thread-02",
    returnId: "return-01",
    subject: "Charitable contribution support",
    visibility: "internal",
    status: "open",
    nextOwner: "preparer",
    nextOwnerLabel: "Sarah Kim",
    fieldId: "field-01-charity",
    flagId: "flag-02",
    preview:
      "Internal: donation receipt looks thin — ask client for bank statement before accepting the AI suggestion.",
    updatedAt: "2026-07-15T19:05:00.000Z",
  },
  {
    id: "thread-03",
    returnId: "return-01",
    subject: "W-2 wages confirmed",
    visibility: "client",
    status: "resolved",
    nextOwner: "firm",
    nextOwnerLabel: "—",
    documentId: "doc-01b",
    preview: "Thanks — W-2 matches Box 1. Closing this request.",
    updatedAt: "2026-07-10T11:00:00.000Z",
  },
  {
    id: "thread-04",
    returnId: "return-02",
    subject: "Meals vs entertainment split",
    visibility: "internal",
    status: "open",
    nextOwner: "reviewer",
    nextOwnerLabel: "David Torres",
    fieldId: "field-02-meals",
    flagId: "flag-03",
    preview:
      "Please sanity-check the 50% meals deduction before we accept the AI correction.",
    updatedAt: "2026-07-14T16:40:00.000Z",
  },
  {
    id: "thread-05",
    returnId: "return-06",
    subject: "Depreciation schedule clarification",
    visibility: "client",
    status: "open",
    nextOwner: "client",
    nextOwnerLabel: "Northwind Logistics (client)",
    flagId: "flag-04",
    preview:
      "Need the fixed-asset listing that supports the depreciation figure on the draft return.",
    updatedAt: "2026-07-12T09:15:00.000Z",
  },
  {
    id: "thread-06",
    returnId: "return-08",
    subject: "Brokerage 1099-B still outstanding",
    visibility: "client",
    status: "open",
    nextOwner: "client",
    nextOwnerLabel: "Elena Vasquez (client)",
    preview: "Reminder: please upload your 1099-B so we can finish cost basis.",
    updatedAt: "2026-07-17T08:00:00.000Z",
  },
];

export function threadsForReturn(returnId: string): CollaborationThread[] {
  return mockCollaborationThreads.filter((t) => t.returnId === returnId);
}

export function hasOpenClientRequest(returnId: string): boolean {
  return mockCollaborationThreads.some(
    (t) =>
      t.returnId === returnId &&
      t.status === "open" &&
      t.visibility === "client" &&
      t.nextOwner === "client"
  );
}
