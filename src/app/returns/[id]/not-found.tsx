import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";

export default function ReturnNotFound() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col px-4 py-16 sm:px-6">
      <div className="mx-auto flex max-w-sm flex-col items-center text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <FileQuestion className="size-6" aria-hidden />
        </div>
        <h1 className="text-lg font-semibold tracking-tight">
          Return not found
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          That return ID doesn&apos;t exist in this prototype. It may have been
          mistyped or removed.
        </p>
        <Link
          href="/"
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
