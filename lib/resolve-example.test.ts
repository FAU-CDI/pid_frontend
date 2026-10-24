import {
  DEFAULT_RESOLVE_EXAMPLE,
  resolveExamplePlaceholder,
} from "./resolve-example";

describe("resolveExamplePlaceholder", () => {
  const original = process.env.RESOLVE_EXAMPLE;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.RESOLVE_EXAMPLE;
    } else {
      process.env.RESOLVE_EXAMPLE = original;
    }
  });

  it("returns the default mock example when RESOLVE_EXAMPLE is unset", () => {
    delete process.env.RESOLVE_EXAMPLE;
    expect(resolveExamplePlaceholder()).toBe(DEFAULT_RESOLVE_EXAMPLE);
  });

  it("returns the default when RESOLVE_EXAMPLE is blank", () => {
    process.env.RESOLVE_EXAMPLE = "   ";
    expect(resolveExamplePlaceholder()).toBe(DEFAULT_RESOLVE_EXAMPLE);
  });

  it("returns a trimmed custom example when RESOLVE_EXAMPLE is set", () => {
    process.env.RESOLVE_EXAMPLE = "  ns/pid-1  ";
    expect(resolveExamplePlaceholder()).toBe("ns/pid-1");
  });
});
