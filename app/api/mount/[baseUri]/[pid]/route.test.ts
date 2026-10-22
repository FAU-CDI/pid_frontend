import {
  getBackendClient,
  MOCK_MOUNT_BASE_URI,
  MOCK_MOUNT_PATH,
  MOCK_NAMESPACE_ID,
  MOCK_PID_DELETED_WITH_URL,
  MOCK_PID_MISSING,
  MOCK_PID_WITHOUT_URL,
  MOCK_PID_WITH_URL,
  MOCK_RESOURCES,
} from "@/lib/backend/client";
import { GET } from "./route";

function mountContext(baseUri: string, pid: string) {
  return {
    params: Promise.resolve({ baseUri, pid }),
  };
}

describe("GET /api/mount/[baseUri]/[pid]", () => {
  it("uses the mock backend client", () => {
    expect(getBackendClient().isMockClient()).toBe(true);
  });

  it.each([
    {
      name: "blank baseUri",
      baseUri: "   ",
      pid: MOCK_PID_WITH_URL,
      status: 400,
      body: { error: "Base URI is required" },
    },
    {
      name: "blank pid",
      baseUri: MOCK_MOUNT_PATH,
      pid: "   ",
      status: 400,
      body: { error: "PID is required" },
    },
    {
      name: "unknown mount",
      baseUri: "no-such-mount",
      pid: MOCK_PID_WITH_URL,
      status: 404,
      body: { error: "Mount not found", code: "mountNotFound" },
    },
    {
      name: "missing PID",
      baseUri: MOCK_MOUNT_PATH,
      pid: MOCK_PID_MISSING,
      status: 404,
      body: { error: "Mount or PID not found", code: "resourceNotFound" },
    },
    {
      name: "relative mount active with URL",
      baseUri: MOCK_MOUNT_PATH,
      pid: MOCK_PID_WITH_URL,
      status: 200,
      body: {
        ...MOCK_RESOURCES[MOCK_PID_WITH_URL],
        namespace: MOCK_NAMESPACE_ID,
      },
    },
    {
      name: "absolute mount active without URL",
      baseUri: MOCK_MOUNT_BASE_URI,
      pid: MOCK_PID_WITHOUT_URL,
      status: 200,
      body: {
        ...MOCK_RESOURCES[MOCK_PID_WITHOUT_URL],
        namespace: MOCK_NAMESPACE_ID,
      },
    },
    {
      name: "deleted is redacted",
      baseUri: MOCK_MOUNT_PATH,
      pid: MOCK_PID_DELETED_WITH_URL,
      status: 200,
      body: {
        pid: MOCK_PID_DELETED_WITH_URL,
        dateCreated: MOCK_RESOURCES[MOCK_PID_DELETED_WITH_URL].dateCreated,
        dateUpdated: MOCK_RESOURCES[MOCK_PID_DELETED_WITH_URL].dateUpdated,
        deleted: true,
        namespace: MOCK_NAMESPACE_ID,
      },
    },
  ])("$name", async ({ baseUri, pid, status, body }) => {
    const response = await GET(
      new Request("http://localhost/api/mount"),
      mountContext(baseUri, pid)
    );
    expect(response.status).toBe(status);
    await expect(response.json()).resolves.toEqual(body);
  });
});
