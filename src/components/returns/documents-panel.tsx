import { FileText } from "lucide-react";

import type { Document } from "@/lib/mock-data";

interface DocumentsPanelProps {
  documents: Document[];
  /** Doc IDs that are linked from at least one field on this return */
  linkedDocIds: Set<string>;
}

export function DocumentsPanel({
  documents,
  linkedDocIds,
}: DocumentsPanelProps) {
  const unique = Array.from(
    new Map(documents.map((d) => [d.id, d])).values()
  ).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <section aria-labelledby="docs-heading">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h2
          id="docs-heading"
          className="text-sm font-semibold tracking-tight"
        >
          Documents
        </h2>
        <span className="text-xs tabular-nums text-muted-foreground">
          {unique.length}
        </span>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        {unique.length === 0 ? (
          <p className="px-3 py-4 text-center text-sm text-muted-foreground">
            No documents uploaded yet
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {unique.map((doc) => (
              <li
                key={doc.id}
                className="flex items-start gap-2.5 px-3 py-2.5"
              >
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted/50 text-muted-foreground">
                  <FileText className="size-3.5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{doc.name}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {doc.type}
                    {doc.pageCount > 1 ? ` · ${doc.pageCount} pages` : ""}
                    {linkedDocIds.has(doc.id) ? " · Linked to fields" : ""}
                  </p>
                </div>
                <span className="shrink-0 rounded border border-border px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                  {doc.thumbnailLabel}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
