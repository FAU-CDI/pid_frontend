import type { components } from "./schema";

export type BackendError = {
  error: string;
  status: number;
  details?: string;
  /** OpenAPI error code from the JSON body when present (e.g. resourceNotFound). */
  code?: string;
};

export type BackendResult<T> = T | BackendError;

export type Mount = components["schemas"]["Mount"];
export type Namespace = components["schemas"]["Namespace"];
export type Resource =
  | components["schemas"]["ResourceResponse"]
  | components["schemas"]["RedactedResourceResponse"];

/** Mount+PID lookup success: resource body plus namespace id from the 302 Location. */
export type ResourceByMount = Resource & { namespace: string };

export function isBackendError(
  result: BackendResult<unknown>
): result is BackendError {
  return (
    typeof result === "object" &&
    result !== null &&
    "error" in result &&
    typeof (result as BackendError).error === "string" &&
    "status" in result &&
    typeof (result as BackendError).status === "number"
  );
}

/**
 * Typed QuickPID backend client (server-side).
 *
 * Shared mount-URI helpers and Result-returning lookup methods.
 * Concrete implementations: FetchClient, MockClient.
 */
export abstract class BackendClient {
  readonly #publicBaseUri: string | undefined;

  constructor(publicBaseUri: string | undefined = process.env.PUBLIC_BASE_URI) {
    this.#publicBaseUri = publicBaseUri?.replace(/\/+$/, "") || undefined;
  }

  /** True when this client serves hard-coded fixtures instead of the Go API. */
  isMockClient(): boolean {
    return false;
  }

  /**
   * Normalize a mount to an absolute base URI for the Go API (trailing slash).
   *
   * - Absolute `mount` (contains `://`): only trailing-slash normalization.
   * - Relative `mount`: join to `PUBLIC_BASE_URI` when set, else `requestOrigin`
   *   (e.g. `https://host` from request headers).
   */
  resolveMountUri(mount: string, requestOrigin?: string): string {
    if (mount.includes("://")) {
      return mount.replace(/\/+$/, "") + "/";
    }

    const origin =
      this.#publicBaseUri ?? requestOrigin?.replace(/\/+$/, "") ?? "";

    if (!origin) {
      throw new Error(
        "Cannot resolve mount URI: set PUBLIC_BASE_URI or pass requestOrigin"
      );
    }

    const path = mount.replace(/^\/+|\/+$/g, "");
    return path ? `${origin}/${path}/` : `${origin}/`;
  }

  /** GET /resolver/mounts/{baseUri} */
  abstract getMount(baseUri: string): Promise<BackendResult<Mount>>;

  /** GET /resolver/namespaces/{namespace} */
  abstract getNamespace(
    namespaceId: string
  ): Promise<BackendResult<Namespace>>;

  /**
   * GET /resolver/mounts/{baseUri}/{pid}
   *
   * OpenAPI success status is 302 with a JSON body and Location header.
   */
  abstract getResourceByMount(
    baseUri: string,
    pid: string
  ): Promise<BackendResult<ResourceByMount>>;

  /**
   * GET /resolver/namespaces/{namespace}/resources/{pid}
   *
   * Success is 200 (full resource) or 410 (redacted deleted resource).
   */
  abstract getResourceByNamespace(
    namespaceId: string,
    pid: string
  ): Promise<BackendResult<Resource>>;
}
