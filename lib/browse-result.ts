import type {
  ApiErrorCode,
  BackendError,
  Resource,
  ResourceByMount,
} from "@/lib/backend/client";

/**
 * How browse pages should react to a backend error:
 * - `not-found` → render a not-found UI (HTTP 200; keep page chrome)
 * - `error` → throw (HTTP 5xx via error boundary)
 */
export type BrowseErrorAction = "not-found" | "error";

const SOFT_NOT_FOUND_CODES: ReadonlySet<ApiErrorCode> = new Set([
  "invalidPid",
  "invalidBaseUri",
  "invalidNamespaceId",
]);

/** Map a backend error status to the browse-page action. */
export function browseErrorAction(error: BackendError): BrowseErrorAction {
  if (error.status === 404) {
    return "not-found";
  }
  if (error.status === 400 && error.code && SOFT_NOT_FOUND_CODES.has(error.code)) {
    return "not-found";
  }
  return "error";
}

/**
 * Distinguishes not-found browse UIs for PID/details pages:
 * - `scope-missing` — mount/namespace does not exist (or invalid) → plain error UI
 * - `resource-missing` — scope exists, PID does not (or PID string is invalid) → scoped Resolve + PID card
 *
 * `resourceNotFound` / `invalidPid` → resource-missing; other 404s and invalid scope codes stay plain.
 */
export type BrowseNotFoundKind = "scope-missing" | "resource-missing";

export function browseNotFoundKind(
  error: BackendError
): BrowseNotFoundKind | null {
  if (error.status === 404) {
    if (error.code === "resourceNotFound") {
      return "resource-missing";
    }
    return "scope-missing";
  }
  if (error.status === 400) {
    if (error.code === "invalidPid") {
      return "resource-missing";
    }
    if (
      error.code === "invalidNamespaceId" ||
      error.code === "invalidBaseUri"
    ) {
      return "scope-missing";
    }
    return null;
  }
  return null;
}

/**
 * Open URL outcome after a successful resource lookup.
 * - `redirect` → `redirect(url)` (HTTP 307)
 * - `no-url` → render the fixed “URL not found” UI (HTTP 200; PID exists)
 */
export type OpenUrlAction =
  | { kind: "redirect"; url: string }
  | { kind: "no-url" };

export function openUrlAction(
  resource: Resource | ResourceByMount
): OpenUrlAction {
  if (
    "url" in resource &&
    typeof resource.url === "string" &&
    resource.url.length > 0
  ) {
    return { kind: "redirect", url: resource.url };
  }
  return { kind: "no-url" };
}
