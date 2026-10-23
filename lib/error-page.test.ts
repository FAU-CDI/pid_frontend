import {
  ERROR_PAGE_BY_CODE,
  errorPageForCode,
  errorPageHref,
  genericErrorPage,
} from "./error-page";

describe("errorPageForCode", () => {
  it("maps allowlisted codes to status and catalog key", () => {
    expect(errorPageForCode("serviceUnavailable")).toEqual(
      ERROR_PAGE_BY_CODE.serviceUnavailable
    );
    expect(errorPageForCode("serviceNotAvailable")).toEqual(
      ERROR_PAGE_BY_CODE.serviceNotAvailable
    );
    expect(errorPageForCode("serviceError")).toEqual(
      ERROR_PAGE_BY_CODE.serviceError
    );
  });

  it("ignores unknown codes and free-form spoofing attempts", () => {
    expect(errorPageForCode(undefined)).toEqual(genericErrorPage);
    expect(errorPageForCode("not-a-real-code")).toEqual(genericErrorPage);
    expect(
      errorPageForCode("URL+Not+Found&message=This+is+fake")
    ).toEqual(genericErrorPage);
  });
});

describe("errorPageHref", () => {
  it("builds an opaque code-only href under the locale", () => {
    expect(errorPageHref("en", "serviceUnavailable")).toBe(
      "/en/error?code=serviceUnavailable"
    );
    expect(errorPageHref("de", "serviceError")).toBe(
      "/de/error?code=serviceError"
    );
  });
});
