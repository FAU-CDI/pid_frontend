import type {
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

/** Map a backend error status to the browse-page action. */
export function browseErrorAction(error: BackendError): BrowseErrorAction {
  if (error.status === 404) {
    return "not-found";
  }
  return "error";
}

/**
 * Distinguishes 404s for PID/details pages:
 * - `scope-missing` — mount/namespace does not exist → plain error UI (no clickable scope)
 * - `resource-missing` — scope exists, PID does not → scoped Resolve + PID not-found card
 *
 * Only `resourceNotFound` is treated as resource-missing; unknown 404s stay plain.
 */
export type BrowseNotFoundKind = "scope-missing" | "resource-missing";

export function browseNotFoundKind(
  error: BackendError
): BrowseNotFoundKind | null {
  if (error.status !== 404) {
    return null;
  }
  if (error.code === "resourceNotFound") {
    return "resource-missing";
  }
  return "scope-missing";
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
