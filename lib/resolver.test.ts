import { MockClient } from "./backend/mock-client";
import {
  MOCK_NAMESPACE_ID,
  MOCK_MOUNT_PATH,
  MOCK_PID_MISSING,
  MOCK_PID_WITH_URL,
} from "./backend/mock-data";
import {
  composeScopedQuery,
  parseScopedPIDField,
  resolve,
  scopedResourceTarget,
} from "./resolver";

const HOST = "resolver.test";

describe("composeScopedQuery", () => {
  it("joins namespace scope with trimmed field (strip leading slashes)", () => {
    expect(
      composeScopedQuery(
        { kind: "namespace", namespaceId: MOCK_NAMESPACE_ID },
        `  /${MOCK_PID_WITH_URL}  `
      )
    ).toBe(`resolve/${MOCK_NAMESPACE_ID}/${MOCK_PID_WITH_URL}`);
  });

  it("returns resolve/namespace alone when the field is empty", () => {
    expect(
      composeScopedQuery({ kind: "namespace", namespaceId: MOCK_NAMESPACE_ID }, "  ")
    ).toBe(`resolve/${MOCK_NAMESPACE_ID}`);
  });

  it("joins mount path with field", () => {
    expect(
      composeScopedQuery(
        { kind: "mount", mountPath: `/${MOCK_MOUNT_PATH}/` },
        `${MOCK_PID_WITH_URL}/go`
      )
    ).toBe(`${MOCK_MOUNT_PATH}/${MOCK_PID_WITH_URL}/go`);
  });
});

describe("parseScopedPIDField / scopedResourceTarget", () => {
  const nsScope = {
    kind: "namespace" as const,
    namespaceId: MOCK_NAMESPACE_ID,
  };
  const mountScope = {
    kind: "mount" as const,
    mountPath: MOCK_MOUNT_PATH,
  };

  it("parses plain pid under namespace without go", () => {
    const targets = parseScopedPIDField(nsScope, MOCK_PID_WITH_URL, HOST);
    expect(targets.length).toBeGreaterThan(0);
    expect(targets[0]).toEqual({
      kind: "resource",
      namespace: MOCK_NAMESPACE_ID,
      pid: MOCK_PID_WITH_URL,
      go: false,
    });
  });

  it("parses pid/go under namespace with go true", () => {
    const targets = parseScopedPIDField(
      nsScope,
      `${MOCK_PID_WITH_URL}/go`,
      HOST
    );
    expect(targets[0]).toMatchObject({
      kind: "resource",
      namespace: MOCK_NAMESPACE_ID,
      pid: MOCK_PID_WITH_URL,
      go: true,
    });
  });

  it("parses mount scope with nested /go", () => {
    const targets = parseScopedPIDField(
      mountScope,
      `${MOCK_PID_WITH_URL}/go`,
      HOST
    );
    expect(targets[0]).toMatchObject({
      kind: "resource",
      mount: MOCK_MOUNT_PATH,
      pid: MOCK_PID_WITH_URL,
      go: true,
    });
  });

  it("forceGo sets go on scopedResourceTarget", () => {
    const without = scopedResourceTarget(
      nsScope,
      MOCK_PID_WITH_URL,
      HOST,
      false
    );
    expect(without?.go).toBe(false);
    const forced = scopedResourceTarget(
      nsScope,
      MOCK_PID_WITH_URL,
      HOST,
      true
    );
    expect(forced?.go).toBe(true);
  });

  it("returns null for empty field", () => {
    expect(scopedResourceTarget(nsScope, "   ", HOST, false)).toBeNull();
  });
});

describe("resolve soft misses", () => {
  const client = new MockClient();
  const baseUri = "https://resolver.test";

  it("maps resourceNotFound to exists false", async () => {
    const result = await resolve(
      {
        kind: "resource",
        namespace: MOCK_NAMESPACE_ID,
        pid: MOCK_PID_MISSING,
        go: false,
      },
      baseUri,
      client
    );
    expect(result).toEqual({
      kind: "resource",
      namespace: MOCK_NAMESPACE_ID,
      pid: MOCK_PID_MISSING,
      go: false,
      exists: false,
    });
  });

  it("maps invalidPid (400) to exists false", async () => {
    class InvalidPidClient extends MockClient {
      override async getResourceByNamespace() {
        return {
          error: "invalid",
          status: 400,
          code: "invalidPid",
        };
      }
    }

    const result = await resolve(
      {
        kind: "resource",
        namespace: MOCK_NAMESPACE_ID,
        pid: "bad!",
        go: false,
      },
      baseUri,
      new InvalidPidClient()
    );
    expect(result).toEqual({
      kind: "resource",
      namespace: MOCK_NAMESPACE_ID,
      pid: "bad!",
      go: false,
      exists: false,
    });
  });
});
