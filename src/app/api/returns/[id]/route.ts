import { NextResponse } from "next/server";

import type {
  ApiErrorResponse,
  ReturnDetailResponse,
  ReturnFieldWithSource,
} from "@/lib/api-types";
import { prisma } from "@/lib/prisma";
import {
  serializeAIFlag,
  serializeClient,
  serializeDocument,
  serializeReturnField,
  serializeTaxReturn,
} from "@/lib/serializers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

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

  if (!row) {
    return NextResponse.json<ApiErrorResponse>(
      { error: `Return "${id}" not found` },
      { status: 404 }
    );
  }

  // Flag evidence can reference documents on other returns (e.g. prior-year
  // filings) — include those so the detail page renders in one call.
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

  return NextResponse.json<ReturnDetailResponse>({
    taxReturn: serializeTaxReturn(row, pendingFlagCount),
    client: serializeClient(row.client),
    fields,
    documents: [...row.documents, ...evidenceDocs].map(serializeDocument),
    flags: row.flags.map(serializeAIFlag),
  });
}
