import { FetchClient } from "./fetch-client";
import { isBackendError } from "./base";

const API_BASE = "https://api.example.test/api/v2";

describe("FetchClient non-2xx success bodies", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("parses mount 302 JSON from openapi-fetch error channel with Location namespace", async () => {
    const resource = {
      pid: "wxp-dfv",
      url: "https://example.org/",
      metadata: "test",
      dateCreated: "2026-09-08T12:03:58Z",
      dateUpdated: "2026-09-08T12:03:58Z",
      tags: [] as string[],
      deleted: false,
    };
    const namespaceId = "84b4196d-ff4a-4ca4-adfd-839daf7e0c97";

    global.fetch = jest.fn(async () => {
      return new Response(JSON.stringify(resource), {
        status: 302,
        statusText: "Found",
        headers: {
          "Content-Type": "application/json",
          Location: `/api/v2/resolver/namespaces/${namespaceId}/resources/wxp-dfv`,
        },
      });
    }) as typeof fetch;

    const client = new FetchClient(API_BASE, "https://pid.example.test");
    const result = await client.getResourceByMount(
      "https://pid.example.test/hits-fdm-test/",
      "wxp-dfv"
    );

    expect(isBackendError(result)).toBe(false);
    if (isBackendError(result)) {
      return;
    }
    expect(result.pid).toBe("wxp-dfv");
    expect(result.namespace).toBe(namespaceId);
    expect("url" in result && result.url).toBe("https://example.org/");
  });

  it("parses namespace 410 redacted JSON from openapi-fetch error channel", async () => {
    const redacted = {
      pid: "gone-pid",
      dateCreated: "2026-09-08T12:03:58Z",
      dateUpdated: "2026-09-08T12:03:58Z",
      deleted: true as const,
    };

    global.fetch = jest.fn(async () => {
      return new Response(JSON.stringify(redacted), {
        status: 410,
        statusText: "Gone",
        headers: {
          "Content-Type": "application/json",
        },
      });
    }) as typeof fetch;

    const client = new FetchClient(API_BASE);
    const result = await client.getResourceByNamespace(
      "84b4196d-ff4a-4ca4-adfd-839daf7e0c97",
      "gone-pid"
    );

    expect(isBackendError(result)).toBe(false);
    if (isBackendError(result)) {
      return;
    }
    expect(result.pid).toBe("gone-pid");
    expect(result.deleted).toBe(true);
    expect("url" in result).toBe(false);
  });
});

describe("FetchClient getResourceCount", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("returns total from 200 JSON body", async () => {
    global.fetch = jest.fn(async () => {
      return new Response(JSON.stringify({ total: 42 }), {
        status: 200,
        statusText: "OK",
        headers: { "Content-Type": "application/json" },
      });
    }) as typeof fetch;

    const result = await new FetchClient(API_BASE).getResourceCount();
    expect(isBackendError(result)).toBe(false);
    if (isBackendError(result)) {
      return;
    }
    expect(result.total).toBe(42);
  });
});

describe("FetchClient preserves Go API error codes", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  function stubJson(status: number, body: unknown) {
    global.fetch = jest.fn(async () => {
      return new Response(JSON.stringify(body), {
        status,
        statusText: status === 404 ? "Not Found" : "Error",
        headers: { "Content-Type": "application/json" },
      });
    }) as typeof fetch;
  }

  it("keeps resourceNotFound on mount+PID 404", async () => {
    stubJson(404, { error: "resourceNotFound" });
    const client = new FetchClient(API_BASE);
    const result = await client.getResourceByMount(
      "https://pid.example.test/hits-fdm-test/",
      "abc"
    );
    expect(isBackendError(result)).toBe(true);
    if (!isBackendError(result)) {
      return;
    }
    expect(result.status).toBe(404);
    expect(result.code).toBe("resourceNotFound");
  });

  it("keeps invalidPid on mount+PID 400 (not synthetic 502)", async () => {
    stubJson(400, { error: "invalidPid" });
    const client = new FetchClient(API_BASE);
    const result = await client.getResourceByMount(
      "https://pid.example.test/hits-fdm-test/",
      "JJJUNK"
    );
    expect(isBackendError(result)).toBe(true);
    if (!isBackendError(result)) {
      return;
    }
    expect(result.status).toBe(400);
    expect(result.code).toBe("invalidPid");
  });

  it("keeps mountNotFound on mount+PID 404", async () => {
    stubJson(404, { error: "mountNotFound" });
    const client = new FetchClient(API_BASE);
    const result = await client.getResourceByMount(
      "https://pid.example.test/missing/",
      "abc"
    );
    expect(isBackendError(result)).toBe(true);
    if (!isBackendError(result)) {
      return;
    }
    expect(result.status).toBe(404);
    expect(result.code).toBe("mountNotFound");
  });

  it("keeps mountNotFound on getMount 404", async () => {
    stubJson(404, { error: "mountNotFound" });
    const client = new FetchClient(API_BASE);
    const result = await client.getMount("https://pid.example.test/missing/");
    expect(isBackendError(result)).toBe(true);
    if (!isBackendError(result)) {
      return;
    }
    expect(result.status).toBe(404);
    expect(result.code).toBe("mountNotFound");
  });

  it("keeps namespaceNotFound on getNamespace 404", async () => {
    stubJson(404, { error: "namespaceNotFound" });
    const client = new FetchClient(API_BASE);
    const result = await client.getNamespace(
      "84b4196d-ff4a-4ca4-adfd-839daf7e0c97"
    );
    expect(isBackendError(result)).toBe(true);
    if (!isBackendError(result)) {
      return;
    }
    expect(result.status).toBe(404);
    expect(result.code).toBe("namespaceNotFound");
  });

  it("keeps resourceNotFound on getResourceByNamespace 404", async () => {
    stubJson(404, { error: "resourceNotFound" });
    const client = new FetchClient(API_BASE);
    const result = await client.getResourceByNamespace(
      "84b4196d-ff4a-4ca4-adfd-839daf7e0c97",
      "missing-pid"
    );
    expect(isBackendError(result)).toBe(true);
    if (!isBackendError(result)) {
      return;
    }
    expect(result.status).toBe(404);
    expect(result.code).toBe("resourceNotFound");
  });
});
