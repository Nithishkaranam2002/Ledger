"use client";

import { UserCircle2 } from "lucide-react";

import { FAKE_USERS, useCurrentUser } from "@/lib/current-user-context";
import { cn } from "@/lib/utils";

interface UserSwitcherProps {
  /** Quieter styling for pages where the switcher sits next to a primary nav link */
  quiet?: boolean;
}

/** Demo role switcher — swaps the fake current user, no real login. */
export function UserSwitcher({ quiet = false }: UserSwitcherProps) {
  const { user, setUserById } = useCurrentUser();

  return (
    <label
      className={cn(
        "flex shrink-0 items-center gap-1.5",
        quiet && "text-muted-foreground"
      )}
    >
      <UserCircle2
        className={cn("size-3.5 shrink-0", quiet ? "opacity-70" : "text-muted-foreground")}
        aria-hidden
      />
      <span className="sr-only">Switch user</span>
      <select
        value={user.id}
        onChange={(event) => setUserById(event.target.value)}
        className={cn(
          "h-7 max-w-[11.5rem] cursor-pointer truncate rounded-md border bg-background px-1.5 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring",
          quiet
            ? "border-transparent font-normal text-muted-foreground hover:border-border hover:text-foreground"
            : "border-border font-medium"
        )}
        title={`${user.name} — ${user.roleLabel}`}
      >
        {FAKE_USERS.map((candidate) => (
          <option key={candidate.id} value={candidate.id}>
            {candidate.name} — {candidate.roleLabel}
          </option>
        ))}
      </select>
    </label>
  );
}
