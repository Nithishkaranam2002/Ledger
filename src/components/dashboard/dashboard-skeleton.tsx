import { Card, CardContent } from "@/components/ui/card";

export function DashboardSkeleton() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <header className="mb-5 border-b border-border pb-4">
        <div className="h-3 w-16 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-6 w-48 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-4 w-40 animate-pulse rounded bg-muted" />
      </header>

      <div className="flex flex-col gap-6">
        {[0, 1].map((section) => (
          <section key={section} className="flex flex-col gap-2">
            <div className="mb-1 flex items-baseline justify-between">
              <div className="h-4 w-28 animate-pulse rounded bg-muted" />
              <div className="h-3 w-4 animate-pulse rounded bg-muted" />
            </div>
            {[0, 1, 2].map((card) => (
              <Card key={card} size="sm">
                <CardContent className="flex flex-col gap-2.5 py-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="size-7 animate-pulse rounded-md bg-muted" />
                      <div className="space-y-1.5">
                        <div className="h-4 w-36 animate-pulse rounded bg-muted" />
                        <div className="h-3 w-44 animate-pulse rounded bg-muted" />
                      </div>
                    </div>
                    <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="h-1.5 flex-1 animate-pulse rounded-full bg-muted" />
                    <div className="h-3 w-8 animate-pulse rounded bg-muted" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>
        ))}
      </div>
    </main>
  );
}
