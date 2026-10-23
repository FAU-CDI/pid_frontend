import type { ReactNode } from "react";

/**
 * Root layout passes children through; `<html>` / `<body>` live under `[locale]`.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
