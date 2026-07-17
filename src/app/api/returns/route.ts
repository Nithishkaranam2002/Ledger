import { NextResponse } from "next/server";

import type { ReturnsResponse, ReturnSummary } from "@/lib/api-types";
import { prisma } from "@/lib/prisma";
import { serializeClient, serializeTaxReturn } from "@/lib/serializers";
import { computeUrgencySection } from "@/lib/urgency";

export async function GET() {
  const rows = await prisma.taxReturn.findMany({
    include: {
      client: true,
      _count: {
        select: { flags: { where: { status: "pending" } } },
      },
    },
    orderBy: [{ dueDate: "asc" }, { id: "asc" }],
  });

  const returns: ReturnSummary[] = rows.map((row) => {
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

  return NextResponse.json<ReturnsResponse>({ returns });
}
