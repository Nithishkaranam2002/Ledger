"use client";

import { UserCircle2 } from "lucide-react";

import { FAKE_USERS, useCurrentUser } from "@/lib/current-user-context";

/** Demo role switcher — swaps the fake current user, no real login. */
export function UserSwitcher() {
  const { user, setUserById } = useCurrentUser();

  return (
    <label className="flex shrink-0 items-center gap-1.5">
      <UserCircle2 className="size-4 text-muted-foreground" aria-hidden />
      <span className="sr-only">Switch user</span>
      <select
        value={user.id}
        onChange={(event) => setUserById(event.target.value)}
        className="h-7 max-w-52 cursor-pointer rounded-md border border-border bg-background px-1.5 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
