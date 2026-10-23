import { optionalFooterHref } from "./footer-links";

describe("optionalFooterHref", () => {
  it("returns undefined when unset or blank (omit footer link)", () => {
    expect(optionalFooterHref(undefined)).toBeUndefined();
    expect(optionalFooterHref("")).toBeUndefined();
    expect(optionalFooterHref("   ")).toBeUndefined();
  });

  it("returns a trimmed href when set (e.g. PUBLIC_API_URL)", () => {
    expect(optionalFooterHref("https://api.pid.bayern")).toBe(
      "https://api.pid.bayern"
    );
    expect(optionalFooterHref("  https://api.example.com/  ")).toBe(
      "https://api.example.com/"
    );
  });
});
