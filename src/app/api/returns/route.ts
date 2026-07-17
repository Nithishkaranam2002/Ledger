import { NextResponse } from "next/server";

import type { ReturnsResponse } from "@/lib/api-types";
import { getReturnSummaries } from "@/lib/data/returns";

export async function GET() {
  const returns = await getReturnSummaries();
  return NextResponse.json<ReturnsResponse>({ returns });
}
