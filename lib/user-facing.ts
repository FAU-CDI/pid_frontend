/** Shared user-facing status titles and messages (plain language). */

export const serviceUnavailable = {
  title: "Service unavailable",
  message: "The service could not be reached.",
} as const;

export const serviceError = {
  title: "Service error",
  message: "Something went wrong while contacting the service.",
} as const;

export const serviceNotAvailable = {
  title: "Service unavailable",
  message: "This service is not available right now.",
} as const;

export const pidHasNoUrl = {
  status: 404,
  title: "URL not found",
  message: "This PID does not have a URL associated with it.",
} as const;

export const pidNotFound = {
  status: 404,
  title: "Not found",
  message: "The PID was not found.",
} as const;

/** Soft-deleted / redacted PID shown on details cards (not an HTTP error page). */
export const pidNoLongerAvailable = {
  badge: "No longer available",
  message: "This PID no longer exists.",
} as const;

/** Missing mount or namespace (plain error UI; no scoped breadcrumbs). */
export const namespaceMissing = {
  status: 404,
  title: "Not found",
  message: "No such namespace.",
} as const;

/** Shared copy for `not-found.tsx` (HTTP 404). */
export const pageNotFound = {
  title: "Not found",
  message: "The requested page or resource was not found.",
} as const;

/** Map a backend-unavailable flag to the matching user-facing status copy. */
export function serviceStatusCopy(unavailable: boolean): {
  title: string;
  message: string;
} {
  return unavailable ? serviceUnavailable : serviceError;
}
