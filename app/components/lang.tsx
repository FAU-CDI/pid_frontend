import type { ReactNode } from "react";

/** Linguistic API content whose language is undeclared. */
export function BackendContent({ children }: { children: ReactNode }) {
  return <span lang="und">{children}</span>;
}

/** Non-linguistic values (ids, URLs, patterns, codes). */
export function BackendCode({ children }: { children: ReactNode }) {
  return <span lang="zxx">{children}</span>;
}

/** English API enum tokens (e.g. PID charset `decimal` / `readable`). */
export function BackendEnglish({ children }: { children: ReactNode }) {
  return <span lang="en">{children}</span>;
}
