"use client";

import { createContext, useContext, useMemo, useState } from "react";

export type UserRole = "preparer" | "reviewer" | "admin";

export interface CurrentUser {
  id: string;
  name: string;
  role: UserRole;
  roleLabel: string;
}

/** Fixed demo users — no real authentication, just role-aware UX simulation. */
export const FAKE_USERS: CurrentUser[] = [
  {
    id: "user-sarah",
    name: "Sarah Kim",
    role: "preparer",
    roleLabel: "CPA · Preparer",
  },
  {
    id: "user-david",
    name: "David Torres",
    role: "reviewer",
    roleLabel: "Reviewer",
  },
  {
    id: "user-priya",
    name: "Priya Nair",
    role: "admin",
    roleLabel: "Firm Admin",
  },
];

interface CurrentUserContextValue {
  user: CurrentUser;
  setUserById: (id: string) => void;
}

const CurrentUserContext = createContext<CurrentUserContextValue | null>(null);

export function CurrentUserProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<CurrentUser>(FAKE_USERS[0]);

  const value = useMemo<CurrentUserContextValue>(
    () => ({
      user,
      setUserById: (id: string) => {
        const next = FAKE_USERS.find((candidate) => candidate.id === id);
        if (next) setUser(next);
      },
    }),
    [user]
  );

  return (
    <CurrentUserContext.Provider value={value}>
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser(): CurrentUserContextValue {
  const context = useContext(CurrentUserContext);
  if (!context) {
    throw new Error("useCurrentUser must be used within CurrentUserProvider");
  }
  return context;
}
