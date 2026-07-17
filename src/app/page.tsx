import { mockClients, mockFlags, mockReturns } from "@/lib/mock-data";
import {
  SECTION_LABELS,
  SECTION_ORDER,
  countPendingFlags,
  groupReturnsByUrgency,
} from "@/lib/urgency";

import { ReturnCard } from "@/components/dashboard/return-card";

const CPA_NAME = "Sarah Kim";

export default function DashboardPage() {
  const clientsById = Object.fromEntries(
    mockClients.map((client) => [client.id, client])
  );
  const grouped = groupReturnsByUrgency(mockReturns, mockFlags);

  const attentionCount = SECTION_ORDER.filter((s) => s !== "on-track").reduce(
    (sum, section) => sum + grouped[section].length,
    0
  );

  const attentionSummary =
    attentionCount === 0
      ? "No returns need attention"
      : attentionCount === 1
        ? "1 return needs attention"
        : `${attentionCount} returns need attention`;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <header className="mb-5 border-b border-border pb-4">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Ledger
        </p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight">
          Good morning, {CPA_NAME}
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {attentionSummary}
        </p>
      </header>

      <div className="flex flex-col gap-6">
        {SECTION_ORDER.map((section) => {
          const returns = grouped[section];
          if (returns.length === 0) return null;

          return (
            <section key={section} aria-labelledby={`section-${section}`}>
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <h2
                  id={`section-${section}`}
                  className="text-sm font-semibold tracking-tight"
                >
                  {SECTION_LABELS[section]}
                </h2>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {returns.length}
                </span>
              </div>
              <ul className="flex flex-col gap-2">
                {returns.map((taxReturn) => {
                  const client = clientsById[taxReturn.clientId];
                  if (!client) return null;

                  return (
                    <li key={taxReturn.id}>
                      <ReturnCard
                        taxReturn={taxReturn}
                        client={client}
                        pendingFlagCount={countPendingFlags(
                          taxReturn.id,
                          mockFlags
                        )}
                      />
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </main>
  );
}
