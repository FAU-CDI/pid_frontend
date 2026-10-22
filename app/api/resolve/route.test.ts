import {
  getBackendClient,
  MOCK_MOUNT_BASE_URI,
  MOCK_MOUNT_PATH,
  MOCK_NAMESPACE_ID,
  MOCK_PID_MISSING,
  MOCK_PID_WITH_URL,
  MOCK_RESOLVER_URL,
} from "@/lib/backend/client";
import { GET } from "./route";

function resolveRequest(
  q?: string,
  options: { host?: string | null } = {}
): Request {
  const { host = "localhost" } = options;
  const url = new URL("http://localhost/api/resolve");
  if (q !== undefined) {
    url.searchParams.set("q", q);
  }

  const headers = new Headers();
  if (host !== null) {
    headers.set("host", host);
  }

  return new Request(url, { headers });
}

describe("GET /api/resolve", () => {
  it("uses the mock backend client", () => {
    expect(getBackendClient().isMockClient()).toBe(true);
  });

  it.each([
    {
      name: "missing q",
      q: undefined,
      host: "localhost" as string | null,
      status: 400,
      body: { error: "Query parameter q is required" },
    },
    {
      name: "blank q",
      q: "   ",
      host: "localhost" as string | null,
      status: 400,
      body: { error: "Query parameter q is required" },
    },
    {
      name: "missing Host",
      q: MOCK_NAMESPACE_ID,
      host: null as string | null,
      status: 500,
      body: { error: "Unable to determine the request host" },
    },
    {
      name: "namespace id",
      q: MOCK_NAMESPACE_ID,
      host: "localhost" as string | null,
      status: 200,
      body: {
        kind: "namespace",
        namespace: MOCK_NAMESPACE_ID,
        exists: true,
      },
    },
    {
      name: "namespace resource",
      q: `${MOCK_NAMESPACE_ID}/${MOCK_PID_WITH_URL}`,
      host: "localhost" as string | null,
      status: 200,
      body: {
        kind: "resource",
        namespace: MOCK_NAMESPACE_ID,
        pid: MOCK_PID_WITH_URL,
        go: false,
        exists: true,
      },
    },
    {
      name: "relative mount",
      q: MOCK_MOUNT_PATH,
      host: "localhost" as string | null,
      status: 200,
      body: {
        kind: "namespace",
        mount: MOCK_MOUNT_BASE_URI,
        namespace: MOCK_NAMESPACE_ID,
        exists: true,
      },
    },
    {
      name: "relative mount resource",
      q: `${MOCK_MOUNT_PATH}/${MOCK_PID_WITH_URL}`,
      host: "localhost" as string | null,
      status: 200,
      body: {
        kind: "resource",
        mount: MOCK_MOUNT_BASE_URI,
        namespace: MOCK_NAMESPACE_ID,
        pid: MOCK_PID_WITH_URL,
        go: false,
        exists: true,
      },
    },
    {
      name: "absolute foreign mount",
      q: MOCK_MOUNT_BASE_URI,
      host: "localhost" as string | null,
      status: 200,
      body: {
        kind: "namespace",
        mount: MOCK_MOUNT_BASE_URI,
        namespace: MOCK_NAMESPACE_ID,
        exists: true,
      },
    },
    {
      name: "absolute foreign mount resource",
      q: `${MOCK_RESOLVER_URL}/${MOCK_MOUNT_PATH}/${MOCK_PID_WITH_URL}`,
      host: "localhost" as string | null,
      status: 200,
      body: {
        kind: "resource",
        mount: MOCK_MOUNT_BASE_URI,
        namespace: MOCK_NAMESPACE_ID,
        pid: MOCK_PID_WITH_URL,
        go: false,
        exists: true,
      },
    },
    {
      name: "same-host resolve URL",
      q: `http://localhost/resolve/${MOCK_NAMESPACE_ID}`,
      host: "localhost" as string | null,
      status: 200,
      body: {
        kind: "namespace",
        namespace: MOCK_NAMESPACE_ID,
        exists: true,
      },
    },
    {
      name: "missing PID exists false",
      q: `${MOCK_NAMESPACE_ID}/${MOCK_PID_MISSING}`,
      host: "localhost" as string | null,
      status: 200,
      body: {
        kind: "resource",
        namespace: MOCK_NAMESPACE_ID,
        pid: MOCK_PID_MISSING,
        go: false,
        exists: false,
      },
    },
    {
      name: "unknown namespace exists false",
      q: "no-such-namespace-or-mount",
      host: "localhost" as string | null,
      status: 200,
      body: {
        kind: "namespace",
        namespace: "no-such-namespace-or-mount",
        exists: false,
      },
    },
  ])("$name", async ({ q, host, status, body }) => {
    const response = await GET(resolveRequest(q, { host }));
    expect(response.status).toBe(status);
    await expect(response.json()).resolves.toEqual(body);
  });
});
