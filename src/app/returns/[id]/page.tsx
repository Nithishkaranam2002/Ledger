import { notFound } from "next/navigation";

import { ReturnDetailView } from "@/components/returns/return-detail-view";
import { getAuditLogEntries, getReturnDetail } from "@/lib/data/returns";

export const dynamic = "force-dynamic";

interface ReturnDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ReturnDetailPageProps) {
  const { id } = await params;
  const detail = await getReturnDetail(id);

  return {
    title: detail
      ? `${detail.client.name} · ${detail.taxReturn.taxYear} · Ledger`
      : "Return · Ledger",
  };
}

export default async function ReturnDetailPage({
  params,
}: ReturnDetailPageProps) {
  const { id } = await params;
  const detail = await getReturnDetail(id);
  if (!detail) notFound();

  const auditEntries = (await getAuditLogEntries(id)) ?? [];

  return (
    <ReturnDetailView
      taxReturn={detail.taxReturn}
      client={detail.client}
      fields={detail.fields}
      documents={detail.documents}
      flags={detail.flags}
      auditEntries={auditEntries}
    />
  );
}
