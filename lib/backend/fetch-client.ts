import createClient, { type Client } from "openapi-fetch";
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
} from "./base";
import type { paths } from "./schema";

/**
 * Backend client that talks to the QuickPID Go API over HTTP.
 *
 * Each lookup method performs exactly one request.
 */
export class FetchClient extends BackendClient {
  readonly #api: Client<paths> | null;

  /**
   * @param baseUrl API base URI including `/api/v2`, no trailing slash.
   * @param publicBaseUri Optional public frontend origin for absolute mount URIs.
   */
  constructor(
    baseUrl: string | undefined,
    publicBaseUri: string | undefined = process.env.PUBLIC_BASE_URI
  ) {
    super(publicBaseUri);

    if (!baseUrl) {
      this.#api = null;
      return;
    }

    this.#api = createClient<paths>({
      baseUrl,
      cache: "no-store",
    });
  }

  async getMount(baseUri: string): Promise<BackendResult<Mount>> {
    const api = this.#requireApi();
    if (isBackendError(api)) {
      return api;
    }

    try {
      this.#log("Requesting Go mount:", `/resolver/mounts/${baseUri}`);

      const { data, error, response } = await api.GET(
        "/resolver/mounts/{baseUri}",
        {
          params: { path: { baseUri } },
        }
      );

      this.#log("Go backend response:", response.status, response.statusText);

      if (!response.ok) {
        return await this.#httpError(
          response,
          response.status === 404
            ? "Mount not found"
            : "Go backend returned an error",
          error
        );
      }

      if (data) {
        return data;
      }

      return { error: "Go backend returned an error", status: 502 };
    } catch (error) {
      return this.#unavailable("Mount lookup failed:", error);
    }
  }

  async getNamespace(
    namespaceId: string
  ): Promise<BackendResult<Namespace>> {
    const api = this.#requireApi();
    if (isBackendError(api)) {
      return api;
    }

    try {
      this.#log(
        "Requesting Go namespace:",
        `/resolver/namespaces/${namespaceId}`
      );

      const { data, error, response } = await api.GET(
        "/resolver/namespaces/{namespace}",
        {
          params: { path: { namespace: namespaceId } },
        }
      );

      this.#log("Go backend response:", response.status, response.statusText);

      if (!response.ok) {
        return await this.#httpError(
          response,
          response.status === 404
            ? "Namespace not found"
            : "Go backend returned an error",
          error
        );
      }

      if (data) {
        return data;
      }

      return { error: "Go backend returned an error", status: 502 };
    } catch (error) {
      return this.#unavailable("Namespace lookup failed:", error);
    }
  }

  /**
   * OpenAPI success status is 302 with a JSON body and Location header.
   * Redirect is manual so the body (and Location) are read without a follow-up request.
   *
   * openapi-fetch only puts bodies in `data` when `response.ok` (2xx). Documented
   * 302 success bodies land in `error` instead — read either channel via
   * {@link resourceFromOpenApiBody}.
   */
  async getResourceByMount(
    baseUri: string,
    pid: string
  ): Promise<BackendResult<ResourceByMount>> {
    const api = this.#requireApi();
    if (isBackendError(api)) {
      return api;
    }

    try {
      this.#log(
        "Requesting Go mount backend:",
        `/resolver/mounts/${baseUri}/${pid}`
      );

      const { data, error, response } = await api.GET(
        "/resolver/mounts/{baseUri}/{pid}",
        {
          params: { path: { baseUri, pid } },
          redirect: "manual",
        }
      );

      this.#log("Go backend response:", response.status, response.statusText);

      if (response.status === 302 || response.ok) {
        const resource = resourceFromOpenApiBody(data, error);
        if (resource) {
          const namespace = namespaceFromLocation(response.headers.get("Location"));
          return { ...resource, namespace: namespace ?? "" };
        }
        return { error: "Go backend returned an error", status: 502 };
      }

      return await this.#httpError(
        response,
        response.status === 404
          ? "Mount or PID not found"
          : "Go backend returned an error",
        error
      );
    } catch (error) {
      return this.#unavailable("Mount backend request failed:", error);
    }
  }

  /**
   * Success is 200 (full resource) or 410 (redacted deleted resource).
   *
   * 410 is not `response.ok`, so openapi-fetch places the redacted body in
   * `error` — see {@link resourceFromOpenApiBody}.
   */
  async getResourceByNamespace(
    namespaceId: string,
    pid: string
  ): Promise<BackendResult<Resource>> {
    const api = this.#requireApi();
    if (isBackendError(api)) {
      return api;
    }

    try {
      this.#log(
        "Requesting Go backend:",
        `/resolver/namespaces/${namespaceId}/resources/${pid}`
      );

      const { data, error, response } = await api.GET(
        "/resolver/namespaces/{namespace}/resources/{pid}",
        {
          params: {
            path: { namespace: namespaceId, pid },
          },
        }
      );

      this.#log("Go backend response:", response.status, response.statusText);

      if (response.status === 410) {
        const resource = resourceFromOpenApiBody(data, error);
        if (resource) {
          return resource;
        }
        return { error: "Go backend returned an error", status: 502 };
      }

      if (!response.ok) {
        return await this.#httpError(
          response,
          response.status === 404
            ? "PID not found"
            : "Go backend returned an error",
          error
        );
      }

      if (data) {
        return data;
      }

      return { error: "Go backend returned an error", status: 502 };
    } catch (error) {
      return this.#unavailable("Backend request failed:", error);
    }
  }

  /** Info traces; mute centrally here later. */
  #log(...args: unknown[]): void {
    console.log(...args);
  }

  /** Error traces; mute centrally here later. */
  #error(...args: unknown[]): void {
    console.error(...args);
  }

  #requireApi(): Client<paths> | BackendError {
    if (!this.#api) {
      this.#error("Missing API base URL");
      return { error: "Server configuration error", status: 500 };
    }
    return this.#api;
  }

  #unavailable(logLabel: string, error: unknown): BackendError {
    this.#error(logLabel, error);
    return {
      error: "Backend unavailable",
      status: 502,
      details: error instanceof Error ? error.message : String(error),
    };
  }

  /**
   * openapi-fetch puts non-2xx JSON in `error` and consumes the body.
   * Prefer `parsedBody` for the Go `error` code; fall back to re-reading
   * the Response only when the body was not already parsed.
   */
  async #httpError(
    response: Response,
    fallbackMessage: string,
    parsedBody?: unknown
  ): Promise<BackendError> {
    const code =
      errorCodeFromOpenApiBody(parsedBody) ?? (await readErrorCode(response));
    return {
      error: fallbackMessage,
      status:
        response.status === 404
          ? 404
          : response.status >= 500
            ? 502
            : response.status,
      code,
    };
  }
}

/**
 * openapi-fetch puts parsed JSON in `data` only for `response.ok` (2xx).
 * Documented non-2xx success bodies (302, 410) are parsed into `error` instead.
 * Prefer `data`, then `error`, when either looks like a resource.
 */
function resourceFromOpenApiBody(
  data: unknown,
  error: unknown
): Resource | null {
  for (const candidate of [data, error]) {
    if (
      candidate &&
      typeof candidate === "object" &&
      "pid" in candidate &&
      typeof (candidate as { pid: unknown }).pid === "string"
    ) {
      return candidate as Resource;
    }
  }
  return null;
}

/** Extract Go API `{"error":"…"}` code from an already-parsed openapi-fetch body. */
function errorCodeFromOpenApiBody(body: unknown): ApiErrorCode | undefined {
  if (
    body &&
    typeof body === "object" &&
    "error" in body &&
    typeof (body as { error: unknown }).error === "string"
  ) {
    // Trust the Go API + OpenAPI document; literals are ApiErrorCode in schema.d.ts.
    return (body as { error: string }).error as ApiErrorCode;
  }
  return undefined;
}

async function readErrorCode(response: Response): Promise<string | undefined> {
  try {
    const body = (await response.json()) as { error?: unknown };
    return errorCodeFromOpenApiBody(body);
  } catch {
    // ignore
  }
  return undefined;
}

/**
 * Parse namespace id from Location like
 * `/resolver/namespaces/{namespace}/resources/{pid}` (absolute or relative).
 */
function namespaceFromLocation(location: string | null): string | null {
  if (!location) {
    return null;
  }
  try {
    const path = location.includes("://")
      ? new URL(location).pathname
      : location.split("?")[0];
    const parts = path.split("/").filter(Boolean);
    const nsIdx = parts.indexOf("namespaces");
    if (nsIdx >= 0 && parts[nsIdx + 1]) {
      return parts[nsIdx + 1];
    }
  } catch {
    // ignore
  }
  return null;
}
