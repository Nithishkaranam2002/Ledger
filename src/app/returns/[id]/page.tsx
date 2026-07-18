import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ReturnDetailSkeleton } from "@/components/returns/return-detail-skeleton";
import { ReturnDetailView } from "@/components/returns/return-detail-view";
import { getAuditLogEntries, getReturnDetail } from "@/lib/data/returns";

export const dynamic = "force-dynamic";

interface ReturnDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ReturnDetailPageProps) {
  const { id } = await params;
  try {
    const detail = await getReturnDetail(id);
    return {
      title: detail
        ? `${detail.client.name} · ${detail.taxReturn.taxYear} · Ledger`
        : "Return · Ledger",
    };
  } catch {
    return { title: "Return · Ledger" };
  }
}

export default async function ReturnDetailPage({
  params,
}: ReturnDetailPageProps) {
  const { id } = await params;

  let detail;
  try {
    detail = await getReturnDetail(id);
  } catch {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-sm text-center">
          <h1 className="text-lg font-semibold tracking-tight">
            Couldn&apos;t load this return
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            The database may be unavailable. Check that Postgres is running,
            then try again.
          </p>
          <Link
            href="/"
            className="mt-5 inline-block text-sm font-medium underline-offset-4 hover:underline"
          >
            Back to dashboard
          </Link>
        </div>
      </main>
    );
  }

  if (!detail) notFound();

  const auditEntries = (await getAuditLogEntries(id)) ?? [];

  return (
    <Suspense fallback={<ReturnDetailSkeleton />}>
      <ReturnDetailView
        taxReturn={detail.taxReturn}
        client={detail.client}
        fields={detail.fields}
        documents={detail.documents}
        flags={detail.flags}
        auditEntries={auditEntries}
      />
    </Suspense>
  );
}
