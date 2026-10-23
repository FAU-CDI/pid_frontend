import {
  browseErrorAction,
  browseNotFoundKind,
  openUrlAction,
} from "./browse-result";

describe("browseErrorAction", () => {
  it("maps 404 to not-found UI", () => {
    expect(
      browseErrorAction({ error: "PID not found", status: 404 })
    ).toBe("not-found");
  });

  it("maps other statuses to throw (5xx path)", () => {
    expect(
      browseErrorAction({ error: "Backend unavailable", status: 502 })
    ).toBe("error");
    expect(
      browseErrorAction({ error: "Server configuration error", status: 500 })
    ).toBe("error");
  });
});

describe("browseNotFoundKind", () => {
  it("uses plain UI when mount or namespace is missing", () => {
    expect(
      browseNotFoundKind({
        error: "Mount not found",
        status: 404,
        code: "mountNotFound",
      })
    ).toBe("scope-missing");
    expect(
      browseNotFoundKind({
        error: "Namespace not found",
        status: 404,
        code: "namespaceNotFound",
      })
    ).toBe("scope-missing");
    expect(
      browseNotFoundKind({ error: "not found", status: 404 })
    ).toBe("scope-missing");
  });

  it("uses scoped PID UI only for resourceNotFound", () => {
    expect(
      browseNotFoundKind({
        error: "PID not found",
        status: 404,
        code: "resourceNotFound",
      })
    ).toBe("resource-missing");
  });

  it("returns null for non-404", () => {
    expect(
      browseNotFoundKind({ error: "Backend unavailable", status: 502 })
    ).toBeNull();
  });
});

describe("openUrlAction", () => {
  const base = {
    pid: "123",
    dateCreated: "2026-01-01T00:00:00Z",
    dateUpdated: "2026-01-01T00:00:00Z",
  };

  it("redirects when a non-empty URL is present (HTTP 307 via redirect())", () => {
    expect(
      openUrlAction({
        ...base,
        url: "https://example.org/target",
        metadata: null,
        tags: [],
        deleted: false,
      })
    ).toEqual({
      kind: "redirect",
      url: "https://example.org/target",
    });
  });

  it("keeps result UI when URL is missing or resource is redacted", () => {
    expect(
      openUrlAction({
        ...base,
        url: null,
        metadata: null,
        tags: [],
        deleted: false,
      })
    ).toEqual({ kind: "no-url" });
    expect(
      openUrlAction({
        ...base,
        url: "",
        metadata: null,
        tags: [],
        deleted: false,
      })
    ).toEqual({ kind: "no-url" });
    expect(
      openUrlAction({
        ...base,
        deleted: true,
      })
    ).toEqual({ kind: "no-url" });
  });
});
