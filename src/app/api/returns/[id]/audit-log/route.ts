import { NextResponse } from "next/server";

import type { ApiErrorResponse, AuditLogResponse } from "@/lib/api-types";
import { getAuditLogEntries } from "@/lib/data/returns";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const entries = await getAuditLogEntries(id);

  if (entries === null) {
    return NextResponse.json<ApiErrorResponse>(
      { error: `Return "${id}" not found` },
      { status: 404 }
    );
  }

  return NextResponse.json<AuditLogResponse>({ entries });
}
