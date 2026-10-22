import {
  getBackendClient,
  MOCK_NAMESPACE_ID,
  MOCK_PID_DELETED_WITH_URL,
  MOCK_PID_MISSING,
  MOCK_PID_WITHOUT_URL,
  MOCK_PID_WITH_URL,
  MOCK_RESOURCES,
} from "@/lib/backend/client";
import { GET } from "./route";

function pidContext(namespaceId: string, pid: string) {
  return {
    params: Promise.resolve({ namespaceId, pid }),
  };
}

describe("GET /api/pid/[namespaceId]/[pid]", () => {
  it("uses the mock backend client", () => {
    expect(getBackendClient().isMockClient()).toBe(true);
  });

  it.each([
    {
      name: "blank namespace",
      namespaceId: "   ",
      pid: MOCK_PID_WITH_URL,
      status: 400,
      body: { error: "Namespace ID is required" },
    },
    {
      name: "blank pid",
      namespaceId: MOCK_NAMESPACE_ID,
      pid: "   ",
      status: 400,
      body: { error: "PID is required" },
    },
    {
      name: "unknown namespace",
      namespaceId: "no-such-namespace",
      pid: MOCK_PID_WITH_URL,
      status: 404,
      body: { error: "Namespace not found", code: "namespaceNotFound" },
    },
    {
      name: "missing PID",
      namespaceId: MOCK_NAMESPACE_ID,
      pid: MOCK_PID_MISSING,
      status: 404,
      body: { error: "PID not found", code: "resourceNotFound" },
    },
    {
      name: "active with URL",
      namespaceId: MOCK_NAMESPACE_ID,
      pid: MOCK_PID_WITH_URL,
      status: 200,
      body: { ...MOCK_RESOURCES[MOCK_PID_WITH_URL] },
    },
    {
      name: "active without URL",
      namespaceId: MOCK_NAMESPACE_ID,
      pid: MOCK_PID_WITHOUT_URL,
      status: 200,
      body: { ...MOCK_RESOURCES[MOCK_PID_WITHOUT_URL] },
    },
    {
      name: "deleted is redacted",
      namespaceId: MOCK_NAMESPACE_ID,
      pid: MOCK_PID_DELETED_WITH_URL,
      status: 200,
      body: {
        pid: MOCK_PID_DELETED_WITH_URL,
        dateCreated: MOCK_RESOURCES[MOCK_PID_DELETED_WITH_URL].dateCreated,
        dateUpdated: MOCK_RESOURCES[MOCK_PID_DELETED_WITH_URL].dateUpdated,
        deleted: true,
      },
    },
  ])("$name", async ({ namespaceId, pid, status, body }) => {
    const response = await GET(
      new Request("http://localhost/api/pid"),
      pidContext(namespaceId, pid)
    );
    expect(response.status).toBe(status);
    await expect(response.json()).resolves.toEqual(body);
  });
});
