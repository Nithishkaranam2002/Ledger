-- CreateEnum
CREATE TYPE "ClientType" AS ENUM ('individual', 'business');

-- CreateEnum
CREATE TYPE "return_status" AS ENUM ('not-started', 'in-progress', 'pending-review', 'ready-to-file', 'filed');

-- CreateEnum
CREATE TYPE "field_state" AS ENUM ('ai-generated', 'verified', 'editable', 'needs-approval', 'locked');

-- CreateEnum
CREATE TYPE "flag_status" AS ENUM ('pending', 'accepted', 'rejected', 'edited');

-- CreateEnum
CREATE TYPE "audit_action" AS ENUM ('flag_accepted', 'flag_rejected', 'flag_edited', 'field_edited');

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ClientType" NOT NULL,
    "initials" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_returns" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "tax_year" INTEGER NOT NULL,
    "status" "return_status" NOT NULL,
    "due_date" DATE NOT NULL,
    "assigned_cpa" TEXT NOT NULL,
    "completeness_percent" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_returns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "return_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL,
    "page_count" INTEGER NOT NULL,
    "thumbnail_label" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "return_fields" (
    "id" TEXT NOT NULL,
    "return_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "state" "field_state" NOT NULL,
    "source_document_id" TEXT,
    "source_page" INTEGER,
    "calculation" TEXT,
    "confidence" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "return_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_flags" (
    "id" TEXT NOT NULL,
    "return_id" TEXT NOT NULL,
    "field_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "reasoning" TEXT NOT NULL,
    "confidence" INTEGER NOT NULL,
    "evidence_doc_ids" TEXT[],
    "suggested_action" TEXT NOT NULL,
    "status" "flag_status" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log_entries" (
    "id" TEXT NOT NULL,
    "flag_id" TEXT,
    "field_id" TEXT,
    "action" "audit_action" NOT NULL,
    "performed_by" TEXT NOT NULL,
    "previous_value" TEXT,
    "new_value" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tax_returns_client_id_idx" ON "tax_returns"("client_id");

-- CreateIndex
CREATE INDEX "tax_returns_status_idx" ON "tax_returns"("status");

-- CreateIndex
CREATE INDEX "tax_returns_due_date_idx" ON "tax_returns"("due_date");

-- CreateIndex
CREATE INDEX "documents_return_id_idx" ON "documents"("return_id");

-- CreateIndex
CREATE INDEX "return_fields_return_id_idx" ON "return_fields"("return_id");

-- CreateIndex
CREATE INDEX "return_fields_source_document_id_idx" ON "return_fields"("source_document_id");

-- CreateIndex
CREATE INDEX "return_fields_state_idx" ON "return_fields"("state");

-- CreateIndex
CREATE INDEX "ai_flags_return_id_idx" ON "ai_flags"("return_id");

-- CreateIndex
CREATE INDEX "ai_flags_field_id_idx" ON "ai_flags"("field_id");

-- CreateIndex
CREATE INDEX "ai_flags_status_idx" ON "ai_flags"("status");

-- CreateIndex
CREATE INDEX "audit_log_entries_flag_id_idx" ON "audit_log_entries"("flag_id");

-- CreateIndex
CREATE INDEX "audit_log_entries_field_id_idx" ON "audit_log_entries"("field_id");

-- CreateIndex
CREATE INDEX "audit_log_entries_action_idx" ON "audit_log_entries"("action");

-- CreateIndex
CREATE INDEX "audit_log_entries_created_at_idx" ON "audit_log_entries"("created_at");

-- AddForeignKey
ALTER TABLE "tax_returns" ADD CONSTRAINT "tax_returns_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_return_id_fkey" FOREIGN KEY ("return_id") REFERENCES "tax_returns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_fields" ADD CONSTRAINT "return_fields_return_id_fkey" FOREIGN KEY ("return_id") REFERENCES "tax_returns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_fields" ADD CONSTRAINT "return_fields_source_document_id_fkey" FOREIGN KEY ("source_document_id") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_flags" ADD CONSTRAINT "ai_flags_return_id_fkey" FOREIGN KEY ("return_id") REFERENCES "tax_returns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_flags" ADD CONSTRAINT "ai_flags_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "return_fields"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log_entries" ADD CONSTRAINT "audit_log_entries_flag_id_fkey" FOREIGN KEY ("flag_id") REFERENCES "ai_flags"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log_entries" ADD CONSTRAINT "audit_log_entries_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "return_fields"("id") ON DELETE SET NULL ON UPDATE CASCADE;
