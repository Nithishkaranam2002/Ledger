import { NextResponse } from "next/server";

import type { ApiErrorResponse, ReturnDetailResponse } from "@/lib/api-types";
import { getReturnDetail } from "@/lib/data/returns";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const detail = await getReturnDetail(id);

  if (!detail) {
    return NextResponse.json<ApiErrorResponse>(
      { error: `Return "${id}" not found` },
      { status: 404 }
    );
  }

  return NextResponse.json<ReturnDetailResponse>(detail);
}
