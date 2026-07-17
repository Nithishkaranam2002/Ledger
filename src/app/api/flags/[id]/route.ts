import { NextResponse } from "next/server";

import type {
  ApiErrorResponse,
  FlagActionRequest,
  FlagActionResponse,
} from "@/lib/api-types";
import { prisma } from "@/lib/prisma";
import { serializeAIFlag, serializeReturnField } from "@/lib/serializers";

const VALID_ACTIONS = ["accept", "reject", "edit"] as const;

function isFlagActionRequest(body: unknown): body is FlagActionRequest {
  if (typeof body !== "object" || body === null) return false;
  const candidate = body as Record<string, unknown>;
  return (
    typeof candidate.performedBy === "string" &&
    candidate.performedBy.length > 0 &&
    VALID_ACTIONS.includes(candidate.action as (typeof VALID_ACTIONS)[number]) &&
    (candidate.newValue === undefined || typeof candidate.newValue === "string")
  );
}

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

  if (!isFlagActionRequest(body)) {
    return NextResponse.json<ApiErrorResponse>(
      {
        error:
          'Body must be { action: "accept" | "reject" | "edit", newValue?: string, performedBy: string }',
      },
      { status: 400 }
    );
  }

  if (body.action === "edit" && !body.newValue) {
    return NextResponse.json<ApiErrorResponse>(
      { error: '"newValue" is required when action is "edit"' },
      { status: 400 }
    );
  }

  const flag = await prisma.aIFlag.findUnique({
    where: { id },
    include: { field: true },
  });

  if (!flag) {
    return NextResponse.json<ApiErrorResponse>(
      { error: `Flag "${id}" not found` },
      { status: 404 }
    );
  }

  if (flag.status !== "pending") {
    return NextResponse.json<ApiErrorResponse>(
      { error: `Flag "${id}" is already resolved (${flag.status})` },
      { status: 409 }
    );
  }

  const { action, performedBy } = body;
  const field = flag.field;

  const [updatedFlag, updatedField] = await prisma.$transaction(async (tx) => {
    if (action === "accept") {
      const nextFlag = await tx.aIFlag.update({
        where: { id },
        data: { status: "accepted" },
      });
      const nextField = await tx.returnField.update({
        where: { id: field.id },
        data: { state: "verified" },
      });
      await tx.auditLogEntry.create({
        data: {
          flagId: id,
          fieldId: field.id,
          action: "flag_accepted",
          performedBy,
          // Store wire-format states so the audit trail matches API responses
          previousValue: serializeReturnField(field).state,
          newValue: "verified",
        },
      });
      return [nextFlag, nextField] as const;
    }

    if (action === "reject") {
      // Field keeps its state/value; flag status "rejected" is the
      // resolved/dismissed signal for the frontend.
      const nextFlag = await tx.aIFlag.update({
        where: { id },
        data: { status: "rejected" },
      });
      await tx.auditLogEntry.create({
        data: {
          flagId: id,
          fieldId: field.id,
          action: "flag_rejected",
          performedBy,
          previousValue: "pending",
          newValue: "rejected",
        },
      });
      return [nextFlag, field] as const;
    }

    // edit
    const nextFlag = await tx.aIFlag.update({
      where: { id },
      data: { status: "edited" },
    });
    const nextField = await tx.returnField.update({
      where: { id: field.id },
      data: { value: body.newValue!, state: "editable" },
    });
    await tx.auditLogEntry.create({
      data: {
        flagId: id,
        fieldId: field.id,
        action: "flag_edited",
        performedBy,
        previousValue: field.value,
        newValue: body.newValue!,
      },
    });
    return [nextFlag, nextField] as const;
  });

  return NextResponse.json<FlagActionResponse>({
    flag: serializeAIFlag(updatedFlag),
    field: serializeReturnField(updatedField),
  });
}
