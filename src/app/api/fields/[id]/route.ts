import { NextResponse } from "next/server";

import type { ApiErrorResponse } from "@/lib/api-types";
import { prisma } from "@/lib/prisma";
import { serializeReturnField } from "@/lib/serializers";

interface FieldEditRequest {
  value: string;
  performedBy: string;
}

function isFieldEditRequest(body: unknown): body is FieldEditRequest {
  if (typeof body !== "object" || body === null) return false;
  const candidate = body as Record<string, unknown>;
  return (
    typeof candidate.value === "string" &&
    candidate.value.length > 0 &&
    typeof candidate.performedBy === "string" &&
    candidate.performedBy.length > 0
  );
}

/** Manual field edit for "editable" fields — settles to verified. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<ApiErrorResponse>(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  if (!isFieldEditRequest(body)) {
    return NextResponse.json<ApiErrorResponse>(
      { error: 'Body must be { value: string, performedBy: string }' },
      { status: 400 }
    );
  }

  const field = await prisma.returnField.findUnique({ where: { id } });
  if (!field) {
    return NextResponse.json<ApiErrorResponse>(
      { error: `Field "${id}" not found` },
      { status: 404 }
    );
  }

  if (field.state === "locked") {
    return NextResponse.json<ApiErrorResponse>(
      { error: "Locked fields cannot be edited" },
      { status: 409 }
    );
  }

  const [updatedField] = await prisma.$transaction(async (tx) => {
    const next = await tx.returnField.update({
      where: { id },
      data: { value: body.value, state: "verified" },
    });
    await tx.auditLogEntry.create({
      data: {
        fieldId: id,
        action: "field_edited",
        performedBy: body.performedBy,
        previousValue: field.value,
        newValue: body.value,
      },
    });
    return [next] as const;
  });

  return NextResponse.json({ field: serializeReturnField(updatedField) });
}
