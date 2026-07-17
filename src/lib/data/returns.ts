import type {
  AuditLogEntryDTO,
  ReturnDetailResponse,
  ReturnFieldWithSource,
  ReturnSummary,
} from "@/lib/api-types";
import { prisma } from "@/lib/prisma";
import {
  serializeAIFlag,
  serializeClient,
  serializeDocument,
  serializeReturnField,
  serializeTaxReturn,
} from "@/lib/serializers";
import { computeUrgencySection } from "@/lib/urgency";

/** Shared data access used by API routes and server components. */
export async function getReturnSummaries(): Promise<ReturnSummary[]> {
  const rows = await prisma.taxReturn.findMany({
    include: {
      client: true,
      _count: {
        select: { flags: { where: { status: "pending" } } },
      },
    },
    orderBy: [{ dueDate: "asc" }, { id: "asc" }],
  });

  return rows.map((row) => {
    const pendingFlagCount = row._count.flags;
    const taxReturn = serializeTaxReturn(row, pendingFlagCount);
    return {
      ...taxReturn,
      client: serializeClient(row.client),
      urgency: computeUrgencySection(
        taxReturn.status,
        taxReturn.dueDate,
        pendingFlagCount
      ),
    };
  });
}

export async function getReturnDetail(
  id: string
): Promise<ReturnDetailResponse | null> {
  const row = await prisma.taxReturn.findUnique({
    where: { id },
    include: {
      client: true,
      documents: { orderBy: { uploadedAt: "asc" } },
      fields: {
        include: { sourceDocument: true },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      },
      flags: { orderBy: { id: "asc" } },
    },
  });

  if (!row) return null;

  const ownDocIds = new Set(row.documents.map((doc) => doc.id));
  const missingEvidenceIds = [
    ...new Set(
      row.flags
        .flatMap((flag) => flag.evidenceDocIds)
        .filter((docId) => !ownDocIds.has(docId))
    ),
  ];
  const evidenceDocs =
    missingEvidenceIds.length > 0
      ? await prisma.document.findMany({
          where: { id: { in: missingEvidenceIds } },
        })
      : [];

  const pendingFlagCount = row.flags.filter(
    (flag) => flag.status === "pending"
  ).length;

  const fields: ReturnFieldWithSource[] = row.fields.map((field) => ({
    ...serializeReturnField(field),
    sourceDocument: field.sourceDocument
      ? serializeDocument(field.sourceDocument)
      : null,
  }));

  return {
    taxReturn: serializeTaxReturn(row, pendingFlagCount),
    client: serializeClient(row.client),
    fields,
    documents: [...row.documents, ...evidenceDocs].map(serializeDocument),
    flags: row.flags.map(serializeAIFlag),
  };
}

/** Audit entries for a return, newest first. Returns null if the return doesn't exist. */
export async function getAuditLogEntries(
  returnId: string
): Promise<AuditLogEntryDTO[] | null> {
  const taxReturn = await prisma.taxReturn.findUnique({
    where: { id: returnId },
    select: { id: true },
  });
  if (!taxReturn) return null;

  const rows = await prisma.auditLogEntry.findMany({
    where: {
      OR: [
        { field: { returnId } },
        { flag: { returnId } },
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  return rows.map((row) => ({
    id: row.id,
    flagId: row.flagId,
    fieldId: row.fieldId,
    action: row.action,
    performedBy: row.performedBy,
    previousValue: row.previousValue,
    newValue: row.newValue,
    createdAt: row.createdAt.toISOString(),
  }));
}
