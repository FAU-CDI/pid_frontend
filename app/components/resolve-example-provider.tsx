"use client";

import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_RESOLVE_EXAMPLE } from "@/lib/resolve-example";

const ResolveExampleContext = createContext<string>(DEFAULT_RESOLVE_EXAMPLE);

/**
 * Provides the server-resolved Resolve-field placeholder to client children.
 * Read `RESOLVE_EXAMPLE` on the server and pass it here — do not read env in clients.
 */
export function ResolveExampleProvider({
  placeholder,
  children,
}: {
  placeholder: string;
  children: ReactNode;
}) {
  return (
    <ResolveExampleContext.Provider value={placeholder}>
      {children}
    </ResolveExampleContext.Provider>
  );
}

/** Placeholder for the global Resolve field (from server, or default). */
export function useResolveExample(): string {
  return useContext(ResolveExampleContext);
}
