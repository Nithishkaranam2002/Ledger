import { notFound } from "next/navigation";

import { ReturnDetailView } from "@/components/returns/return-detail-view";
import {
  mockClients,
  mockDocuments,
  mockFields,
  mockFlags,
  mockReturns,
} from "@/lib/mock-data";

interface ReturnDetailPageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return mockReturns.map((taxReturn) => ({ id: taxReturn.id }));
}

export async function generateMetadata({ params }: ReturnDetailPageProps) {
  const { id } = await params;
  const taxReturn = mockReturns.find((r) => r.id === id);
  const client = taxReturn
    ? mockClients.find((c) => c.id === taxReturn.clientId)
    : undefined;

  return {
    title: client
      ? `${client.name} · ${taxReturn!.taxYear} · Ledger`
      : "Return · Ledger",
  };
}

export default async function ReturnDetailPage({
  params,
}: ReturnDetailPageProps) {
  const { id } = await params;
  const taxReturn = mockReturns.find((r) => r.id === id);
  if (!taxReturn) notFound();

  const client = mockClients.find((c) => c.id === taxReturn.clientId);
  if (!client) notFound();

  const fields = mockFields.filter((f) => f.returnId === id);
  const documents = mockDocuments.filter((d) => d.returnId === id);
  // Include evidence docs that may live on related returns (e.g. prior year)
  const flagEvidenceIds = mockFlags
    .filter((f) => f.returnId === id)
    .flatMap((f) => f.evidenceDocIds);
  const extraDocs = mockDocuments.filter(
    (d) =>
      flagEvidenceIds.includes(d.id) &&
      !documents.some((existing) => existing.id === d.id)
  );

  const flags = mockFlags.filter((f) => f.returnId === id);

  return (
    <ReturnDetailView
      taxReturn={taxReturn}
      client={client}
      fields={fields}
      documents={[...documents, ...extraDocs]}
      flags={flags}
    />
  );
}
