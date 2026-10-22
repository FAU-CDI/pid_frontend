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

/** Map a backend-unavailable flag to the matching user-facing status copy. */
export function serviceStatusCopy(unavailable: boolean): {
  title: string;
  message: string;
} {
  return unavailable ? serviceUnavailable : serviceError;
}
