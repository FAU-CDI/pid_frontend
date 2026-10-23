import {
  BackendClient,
  isBackendError,
  type ApiErrorCode,
  type BackendError,
  type BackendResult,
  type Mount,
  type Namespace,
  type Resource,
  type ResourceByMount,
  type ResourceCount,
} from "./base";
import type { components } from "./schema";
import {
  MOCK_MOUNT,
  MOCK_NAMESPACE,
  MOCK_RESOLVER_URL,
  MOCK_RESOURCES,
} from "./mock-data";

type ResourceResponse = components["schemas"]["ResourceResponse"];
type RedactedResourceResponse =
  components["schemas"]["RedactedResourceResponse"];

export {
  MOCK_MOUNT,
  MOCK_MOUNT_BASE_URI,
  MOCK_MOUNT_PATH,
  MOCK_NAMESPACE,
  MOCK_NAMESPACE_ID,
  MOCK_PID_DELETED_WITHOUT_URL,
  MOCK_PID_DELETED_WITH_URL,
  MOCK_PID_HUGE_METADATA,
  MOCK_PID_MISSING,
  MOCK_PID_WITHOUT_URL,
  MOCK_PID_WITH_URL,
  MOCK_RESOLVER_URL,
  MOCK_RESOURCES,
} from "./mock-data";

/**
 * Fetch-free backend client that serves hard-coded fixtures under resolver.test.
 */
export class MockClient extends BackendClient {
  constructor() {
    super(MOCK_RESOLVER_URL);
  }

  override isMockClient(): boolean {
    return true;
  }

  /**
   * Relative mounts are joined to {@link MOCK_RESOLVER_URL} (ignoring request
   * origin). Absolute mounts pass through unchanged (trailing slash only).
   */
  override resolveMountUri(mount: string): string {
    return super.resolveMountUri(mount, MOCK_RESOLVER_URL);
  }

  async getMount(baseUri: string): Promise<BackendResult<Mount>> {
    const normalized = normalizeMountUri(baseUri);
    if (normalized === MOCK_MOUNT.baseUri) {
      return { ...MOCK_MOUNT };
    }
    return notFound("Mount not found", "mountNotFound");
  }

  async getNamespace(namespaceId: string): Promise<BackendResult<Namespace>> {
    if (namespaceId === MOCK_NAMESPACE.id) {
      return { ...MOCK_NAMESPACE };
    }
    return notFound("Namespace not found", "namespaceNotFound");
  }

  async getResourceByMount(
    baseUri: string,
    pid: string
  ): Promise<BackendResult<ResourceByMount>> {
    const mount = await this.getMount(baseUri);
    if (isBackendError(mount)) {
      return mount;
    }

    const found = MOCK_RESOURCES[pid];
    if (!found) {
      return notFound("Mount or PID not found", "resourceNotFound");
    }

    // Match unauthenticated Go API: deleted resources are redacted (still 302).
    return { ...asPublicResource(found), namespace: mount.namespace };
  }

  async getResourceByNamespace(
    namespaceId: string,
    pid: string
  ): Promise<BackendResult<Resource>> {
    const ns = await this.getNamespace(namespaceId);
    if (isBackendError(ns)) {
      return ns;
    }

    const found = MOCK_RESOURCES[pid];
    if (!found) {
      return notFound("PID not found", "resourceNotFound");
    }

    // Match unauthenticated Go API: deleted → redacted (410 body shape).
    return asPublicResource(found);
  }

  async getResourceCount(): Promise<BackendResult<ResourceCount>> {
    return { total: Object.keys(MOCK_RESOURCES).length };
  }
}

/**
 * Unauthenticated callers never see url/metadata/tags on deleted resources.
 */
function asPublicResource(
  resource: ResourceResponse
): ResourceResponse | RedactedResourceResponse {
  if (!resource.deleted) {
    return { ...resource };
  }
  return {
    pid: resource.pid,
    dateCreated: resource.dateCreated,
    dateUpdated: resource.dateUpdated,
    deleted: true,
  };
}

function normalizeMountUri(baseUri: string): string {
  return baseUri.replace(/\/+$/, "") + "/";
}

function notFound(error: string, code: ApiErrorCode): BackendError {
  return { error, status: 404, code };
}
