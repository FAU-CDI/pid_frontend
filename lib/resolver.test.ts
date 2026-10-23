import { MockClient } from "./backend/mock-client";
import {
  MOCK_NAMESPACE_ID,
  MOCK_MOUNT_PATH,
  MOCK_PID_MISSING,
  MOCK_PID_WITH_URL,
} from "./backend/mock-data";
import {
  composeScopedQuery,
  parsePIDField,
  parseScopedPIDField,
  resolve,
  scopedResourceTarget,
} from "./resolver";

const HOST = "resolver.test";

describe("parsePIDField locale prefixes", () => {
  it("adds dual mount readings when the first segment is a supported locale", () => {
    const results = parsePIDField("/en/test", HOST);
    expect(results).toContainEqual({ kind: "namespace", mount: "en/test" });
    expect(results).toContainEqual({ kind: "namespace", mount: "test" });
    expect(results).toContainEqual({ kind: "namespace", namespace: "test" });
  });

  it("matches locale prefixes case-insensitively", () => {
    const results = parsePIDField("/DE/demo", HOST);
    expect(results).toContainEqual({ kind: "namespace", mount: "DE/demo" });
    expect(results).toContainEqual({ kind: "namespace", mount: "demo" });
  });

  it("does not strip unsupported locale-looking prefixes", () => {
    const results = parsePIDField("/fr/test", HOST);
    expect(results).toContainEqual({ kind: "namespace", mount: "fr/test" });
    expect(results).not.toContainEqual({ kind: "namespace", mount: "test" });
  });

  it("dual-reads same-host absolute URLs with a locale prefix", () => {
    const results = parsePIDField(`https://${HOST}/en/test`, HOST);
    expect(results).toContainEqual({ kind: "namespace", mount: "en/test" });
    expect(results).toContainEqual({ kind: "namespace", mount: "test" });
  });

  it("still parses non-prefixed resolve paths", () => {
    const results = parsePIDField("resolve/abc/123", HOST);
    expect(results).toContainEqual({
      kind: "resource",
      namespace: "abc",
      pid: "123",
      go: false,
    });
  });
});

describe("parsePIDField normalization", () => {
  it("lowercases namespace and pid and strips disallowed characters", () => {
    const results = parsePIDField("resolve/AbC!/12-3_X?", HOST);
    expect(results).toContainEqual({
      kind: "resource",
      namespace: "abc",
      pid: "12-3_x",
      go: false,
    });
  });

  it("does not rewrite mount paths", () => {
    const results = parsePIDField("Some/Mount/pid-1", HOST);
    expect(results).toContainEqual({
      kind: "resource",
      mount: "Some/Mount",
      pid: "pid-1",
      go: false,
    });
  });

  it("drops candidates whose id becomes empty", () => {
    const results = parsePIDField("!!!", HOST);
    expect(results.every((r) => !("namespace" in r && r.namespace === ""))).toBe(
      true
    );
    expect(results).toContainEqual({ kind: "namespace", mount: "!!!" });
  });

  it("normalizes pid on foreign absolute mount URLs", () => {
    const results = parsePIDField(
      "https://other.example/base/Pid-1/go",
      HOST
    );
    expect(results).toContainEqual({
      kind: "resource",
      mount: "https://other.example/base/",
      pid: "pid-1",
      go: true,
    });
  });
});

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

  it("normalizes uppercase pid under namespace scope", () => {
    const targets = parseScopedPIDField(nsScope, "AbC!", HOST);
    expect(targets[0]).toEqual({
      kind: "resource",
      namespace: MOCK_NAMESPACE_ID,
      pid: "abc",
      go: false,
    });
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
          code: "invalidPid" as const,
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
