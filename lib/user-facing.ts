/**
 * Shared user-facing status codes and message catalog keys (plain language).
 * Titles/messages live in messages/{locale}.json under `errors.*`.
 */

export type ErrorMessageKey =
  | "serviceUnavailable"
  | "serviceError"
  | "serviceNotAvailable"
  | "pidHasNoUrl"
  | "pidNotFound"
  | "pidNoLongerAvailable"
  | "namespaceMissing"
  | "pageNotFound"
  | "generic";

export const serviceUnavailable = {
  status: 502,
  key: "serviceUnavailable",
} as const;

export const serviceError = {
  status: 502,
  key: "serviceError",
} as const;

export const serviceNotAvailable = {
  status: 500,
  key: "serviceNotAvailable",
} as const;

export const pidHasNoUrl = {
  status: 404,
  key: "pidHasNoUrl",
} as const;

export const pidNotFound = {
  status: 404,
  key: "pidNotFound",
} as const;

/** Soft-deleted / redacted PID shown on details cards (not an HTTP error page). */
export const pidNoLongerAvailable = {
  key: "pidNoLongerAvailable",
} as const;

/** Missing mount or namespace (plain error UI; no scoped breadcrumbs). */
export const namespaceMissing = {
  status: 404,
  key: "namespaceMissing",
} as const;

/** Shared copy key for `not-found.tsx` (HTTP 404). */
export const pageNotFound = {
  status: 404,
  key: "pageNotFound",
} as const;

/** Map a backend-unavailable flag to the matching error catalog key. */
export function serviceStatusKey(
  unavailable: boolean
): "serviceUnavailable" | "serviceError" {
  return unavailable ? "serviceUnavailable" : "serviceError";
}
