/**
 * Supported UI locales.
 * Adding a locale: append here, add messages/{locale}.json, update
 * {@link localeFlags} in i18n/routing.ts, and keep parser tests green.
 */
export const locales = ["en", "de"] as const;

export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "en";

/** Case-insensitive match against the supported locale allowlist only. */
export function isSupportedLocale(segment: string): segment is AppLocale {
  const lower = segment.toLowerCase();
  return (locales as readonly string[]).includes(lower);
}

/** Normalize a supported locale segment to the canonical allowlist form. */
export function normalizeLocale(segment: string): AppLocale | null {
  const lower = segment.toLowerCase();
  const match = locales.find((l) => l === lower);
  return match ?? null;
}
