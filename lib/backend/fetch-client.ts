import createClient, { type Client } from "openapi-fetch";
import {
  BackendClient,
  isBackendError,
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
      console.log("Requesting Go mount:", `/resolver/mounts/${baseUri}`);

      const { data, response } = await api.GET("/resolver/mounts/{baseUri}", {
        params: { path: { baseUri } },
      });

      console.log("Go backend response:", response.status, response.statusText);

      if (!response.ok) {
        return await this.#httpError(
          response,
          response.status === 404 ? "Mount not found" : "Go backend returned an error"
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
      console.log(
        "Requesting Go namespace:",
        `/resolver/namespaces/${namespaceId}`
      );

      const { data, response } = await api.GET(
        "/resolver/namespaces/{namespace}",
        {
          params: { path: { namespace: namespaceId } },
        }
      );

      console.log("Go backend response:", response.status, response.statusText);

      if (!response.ok) {
        return await this.#httpError(
          response,
          response.status === 404
            ? "Namespace not found"
            : "Go backend returned an error"
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
      console.log(
        "Requesting Go mount backend:",
        `/resolver/mounts/${baseUri}/${pid}`
      );

      const { data, response } = await api.GET(
        "/resolver/mounts/{baseUri}/{pid}",
        {
          params: { path: { baseUri, pid } },
          redirect: "manual",
        }
      );

      console.log("Go backend response:", response.status, response.statusText);

      if (response.status === 404) {
        return await this.#httpError(response, "Mount or PID not found");
      }

      if (response.status === 302 || response.ok) {
        const namespace = namespaceFromLocation(response.headers.get("Location"));
        let resource: Resource | null = null;

        if (data && typeof data === "object" && "pid" in data) {
          resource = data as Resource;
        } else {
          try {
            const body = (await response.json()) as Resource;
            if (body && typeof body === "object" && "pid" in body) {
              resource = body;
            }
          } catch {
            // fall through
          }
        }

        if (resource) {
          return { ...resource, namespace: namespace ?? "" };
        }
      }

      return { error: "Go backend returned an error", status: 502 };
    } catch (error) {
      return this.#unavailable("Mount backend request failed:", error);
    }
  }

  /**
   * Success is 200 (full resource) or 410 (redacted deleted resource).
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
      console.log(
        "Requesting Go backend:",
        `/resolver/namespaces/${namespaceId}/resources/${pid}`
      );

      const { data, response } = await api.GET(
        "/resolver/namespaces/{namespace}/resources/{pid}",
        {
          params: {
            path: { namespace: namespaceId, pid },
          },
        }
      );

      console.log("Go backend response:", response.status, response.statusText);

      if (response.status === 410) {
        if (data && typeof data === "object" && "pid" in data) {
          return data as Resource;
        }
        try {
          const body = (await response.json()) as Resource;
          if (body && typeof body === "object" && "pid" in body) {
            return body;
          }
        } catch {
          // fall through
        }
        return { error: "Go backend returned an error", status: 502 };
      }

      if (!response.ok) {
        return await this.#httpError(
          response,
          response.status === 404
            ? "PID not found"
            : "Go backend returned an error"
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

  #requireApi(): Client<paths> | BackendError {
    if (!this.#api) {
      console.error("Missing API base URL");
      return { error: "Server configuration error", status: 500 };
    }
    return this.#api;
  }

  #unavailable(logLabel: string, error: unknown): BackendError {
    console.error(logLabel, error);
    return {
      error: "Backend unavailable",
      status: 502,
      details: error instanceof Error ? error.message : String(error),
    };
  }

  async #httpError(
    response: Response,
    fallbackMessage: string
  ): Promise<BackendError> {
    const code = await readErrorCode(response);
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

async function readErrorCode(response: Response): Promise<string | undefined> {
  try {
    const body = (await response.json()) as { error?: unknown };
    if (typeof body?.error === "string") {
      return body.error;
    }
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
