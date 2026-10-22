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

/** Map a backend-unavailable flag to the matching user-facing status copy. */
export function serviceStatusCopy(unavailable: boolean): {
  title: string;
  message: string;
} {
  return unavailable ? serviceUnavailable : serviceError;
}
