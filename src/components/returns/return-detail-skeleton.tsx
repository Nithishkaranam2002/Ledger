export function ReturnDetailSkeleton() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <div className="mb-4 h-3 w-24 animate-pulse rounded bg-muted" />

      <header className="mb-4 border-b border-border pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="size-8 animate-pulse rounded-md bg-muted" />
            <div className="space-y-2">
              <div className="h-6 w-48 animate-pulse rounded bg-muted" />
              <div className="h-4 w-40 animate-pulse rounded bg-muted" />
            </div>
          </div>
          <div className="h-5 w-24 animate-pulse rounded-full bg-muted" />
        </div>
      </header>

      <div className="mb-4 h-16 animate-pulse rounded-lg border border-border bg-muted/40" />

      <div className="mb-2 flex items-baseline justify-between">
        <div className="h-4 w-28 animate-pulse rounded bg-muted" />
        <div className="h-3 w-4 animate-pulse rounded bg-muted" />
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <ul className="divide-y divide-border">
          {Array.from({ length: 6 }).map((_, index) => (
            <li key={index} className="border-l-[3px] border-l-transparent px-3 py-2.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 size-5 animate-pulse rounded bg-muted" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                  </div>
                </div>
                <div className="h-4 w-20 animate-pulse rounded bg-muted" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
