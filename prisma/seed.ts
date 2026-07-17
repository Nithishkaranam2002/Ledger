import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  mockClients,
  mockDocuments,
  mockFields,
  mockFlags,
  mockReturns,
} from "../src/lib/mock-data";
import type {
  FieldState,
  ReturnStatus,
} from "../src/lib/mock-data";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

/** Mock uses kebab-case; Prisma enum members use snake_case. */
const returnStatusMap: Record<
  ReturnStatus,
  "not_started" | "in_progress" | "pending_review" | "ready_to_file" | "filed"
> = {
  "not-started": "not_started",
  "in-progress": "in_progress",
  "pending-review": "pending_review",
  "ready-to-file": "ready_to_file",
  filed: "filed",
};

const fieldStateMap: Record<
  FieldState,
  "ai_generated" | "verified" | "editable" | "needs_approval" | "locked"
> = {
  "ai-generated": "ai_generated",
  verified: "verified",
  editable: "editable",
  "needs-approval": "needs_approval",
  locked: "locked",
};

async function main() {
  console.log("Seeding Ledger from src/lib/mock-data …");

  // Clear in FK-safe order (audit first — empty today, but keep order correct)
  await prisma.auditLogEntry.deleteMany();
  await prisma.aIFlag.deleteMany();
  await prisma.returnField.deleteMany();
  await prisma.document.deleteMany();
  await prisma.taxReturn.deleteMany();
  await prisma.client.deleteMany();

  await prisma.client.createMany({
    data: mockClients.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      initials: c.initials,
    })),
  });

  await prisma.taxReturn.createMany({
    data: mockReturns.map((r) => ({
      id: r.id,
      clientId: r.clientId,
      taxYear: r.taxYear,
      status: returnStatusMap[r.status],
      dueDate: new Date(r.dueDate),
      assignedCPA: r.assignedCPA,
      completenessPercent: r.completenessPercent,
    })),
  });

  await prisma.document.createMany({
    data: mockDocuments.map((d) => ({
      id: d.id,
      returnId: d.returnId,
      name: d.name,
      type: d.type,
      uploadedAt: new Date(d.uploadedAt),
      pageCount: d.pageCount,
      thumbnailLabel: d.thumbnailLabel,
    })),
  });

  await prisma.returnField.createMany({
    data: mockFields.map((f) => ({
      id: f.id,
      returnId: f.returnId,
      label: f.label,
      value: f.value,
      state: fieldStateMap[f.state],
      sourceDocumentId: f.sourceDocumentId,
      sourcePage: f.sourcePage,
      calculation: f.calculation ?? null,
      confidence: f.confidence ?? null,
    })),
  });

  await prisma.aIFlag.createMany({
    data: mockFlags.map((flag) => ({
      id: flag.id,
      returnId: flag.returnId,
      fieldId: flag.fieldId,
      message: flag.message,
      reasoning: flag.reasoning,
      confidence: flag.confidence,
      evidenceDocIds: flag.evidenceDocIds,
      suggestedAction: flag.suggestedAction,
      status: flag.status,
    })),
  });

  const [clients, taxReturns, documents, returnFields, aiFlags, auditLogs] =
    await Promise.all([
      prisma.client.count(),
      prisma.taxReturn.count(),
      prisma.document.count(),
      prisma.returnField.count(),
      prisma.aIFlag.count(),
      prisma.auditLogEntry.count(),
    ]);

  console.log("Seed complete:");
  console.log(`  clients:            ${clients}`);
  console.log(`  tax_returns:        ${taxReturns}`);
  console.log(`  documents:          ${documents}`);
  console.log(`  return_fields:      ${returnFields}`);
  console.log(`  ai_flags:           ${aiFlags}`);
  console.log(`  audit_log_entries:  ${auditLogs}`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
