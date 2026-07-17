import Link from "next/link";

import { DashboardView } from "@/components/dashboard/dashboard-view";
import type { ReturnSummary } from "@/lib/api-types";
import { getReturnSummaries } from "@/lib/data/returns";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let returns: ReturnSummary[];
  try {
    returns = await getReturnSummaries();
  } catch {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-sm text-center">
          <h1 className="text-lg font-semibold tracking-tight">
            Couldn&apos;t load returns
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            The database may be unavailable. Check that Postgres is running,
            then refresh.
          </p>
          <Link
            href="/"
            className="mt-5 inline-block text-sm font-medium underline-offset-4 hover:underline"
          >
            Try again
          </Link>
        </div>
      </main>
    );
  }

  return <DashboardView returns={returns} />;
}
