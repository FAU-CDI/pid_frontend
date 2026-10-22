import type { components } from "./schema";

type Mount = components["schemas"]["Mount"];
type Namespace = components["schemas"]["Namespace"];
type ResourceResponse = components["schemas"]["ResourceResponse"];

/** Public origin used for all mock mount URIs. */
export const MOCK_RESOLVER_URL = "https://resolver.test";

/** Memorable namespace id used by mock fixtures. */
export const MOCK_NAMESPACE_ID = "000";

/** Relative mount path under {@link MOCK_RESOLVER_URL}. */
export const MOCK_MOUNT_PATH = "demo";

/** Absolute mount base URI (`https://resolver.test/demo/`). */
export const MOCK_MOUNT_BASE_URI = `${MOCK_RESOLVER_URL}/${MOCK_MOUNT_PATH}/`;

/** Active PID with a target URL. */
export const MOCK_PID_WITH_URL = "123";

/** Active PID with no target URL. */
export const MOCK_PID_WITHOUT_URL = "456";

/** Deleted PID that still has a target URL. */
export const MOCK_PID_DELETED_WITH_URL = "789";

/** Deleted PID with no target URL. */
export const MOCK_PID_DELETED_WITHOUT_URL = "012";

/** PID that does not exist (always 404 / resourceNotFound). */
export const MOCK_PID_MISSING = "999";

const MOCK_DATE_CREATED = "2026-01-01T00:00:00Z";
const MOCK_DATE_UPDATED = "2026-06-15T12:00:00Z";

/** Hard-coded mock namespace (`000`). */
export const MOCK_NAMESPACE: Namespace = {
  id: MOCK_NAMESPACE_ID,
  tags: ["mock", "demo"],
  pidFormat: {
    pattern: "***",
    characters: "decimal",
  },
  dateCreated: MOCK_DATE_CREATED,
  dateUpdated: MOCK_DATE_UPDATED,
};

/** Hard-coded mock mount (`https://resolver.test/demo/` → `000`). */
export const MOCK_MOUNT: Mount = {
  baseUri: MOCK_MOUNT_BASE_URI,
  namespace: MOCK_NAMESPACE_ID,
};

function resource(
  pid: string,
  url: string | null,
  deleted: boolean,
  metadata: string
): ResourceResponse {
  return {
    pid,
    url,
    metadata,
    dateCreated: MOCK_DATE_CREATED,
    dateUpdated: MOCK_DATE_UPDATED,
    tags: deleted ? ["mock", "deleted"] : ["mock"],
    deleted,
  };
}

/**
 * Mock resources keyed by PID within {@link MOCK_NAMESPACE_ID}.
 * Deleted fixtures keep full bodies here; the mock client redacts them for
 * unauthenticated lookups (url/metadata/tags stripped), matching the Go API.
 */
export const MOCK_RESOURCES: Readonly<Record<string, ResourceResponse>> = {
  [MOCK_PID_WITH_URL]: resource(
    MOCK_PID_WITH_URL,
    "https://example.org/mock-123",
    false,
    "Active mock resource with URL"
  ),
  [MOCK_PID_WITHOUT_URL]: resource(
    MOCK_PID_WITHOUT_URL,
    null,
    false,
    "Active mock resource without URL"
  ),
  [MOCK_PID_DELETED_WITH_URL]: resource(
    MOCK_PID_DELETED_WITH_URL,
    "https://example.org/mock-789-deleted",
    true,
    "Deleted mock resource with URL"
  ),
  [MOCK_PID_DELETED_WITHOUT_URL]: resource(
    MOCK_PID_DELETED_WITHOUT_URL,
    null,
    true,
    "Deleted mock resource without URL"
  ),
};
