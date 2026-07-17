import { NextResponse } from "next/server";

import type {
  ApiErrorResponse,
  AuditLogEntryDTO,
  AuditLogResponse,
} from "@/lib/api-types";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const taxReturn = await prisma.taxReturn.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!taxReturn) {
    return NextResponse.json<ApiErrorResponse>(
      { error: `Return "${id}" not found` },
      { status: 404 }
    );
  }

  const rows = await prisma.auditLogEntry.findMany({
    where: {
      OR: [{ field: { returnId: id } }, { flag: { returnId: id } }],
    },
    orderBy: { createdAt: "desc" },
  });

  const entries: AuditLogEntryDTO[] = rows.map((row) => ({
    id: row.id,
    flagId: row.flagId,
    fieldId: row.fieldId,
    action: row.action,
    performedBy: row.performedBy,
    previousValue: row.previousValue,
    newValue: row.newValue,
    createdAt: row.createdAt.toISOString(),
  }));

  return NextResponse.json<AuditLogResponse>({ entries });
}
