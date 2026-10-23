import {
  pidNotFound,
  serviceError,
  serviceNotAvailable,
  serviceUnavailable,
  type ErrorMessageKey,
} from "@/lib/user-facing";

export type ErrorPageRef = {
  status: number;
  key: ErrorMessageKey;
};

/**
 * Allowlisted `/error?code=` values → status + message catalog key.
 * Unknown or missing codes fall back to {@link genericErrorPage}.
 * Never map free-form query strings into title/message.
 */
export const ERROR_PAGE_BY_CODE = {
  notFound: { status: pidNotFound.status, key: pidNotFound.key },
  serviceUnavailable: {
    status: serviceUnavailable.status,
    key: serviceUnavailable.key,
  },
  serviceNotAvailable: {
    status: serviceNotAvailable.status,
    key: serviceNotAvailable.key,
  },
  serviceError: {
    status: serviceError.status,
    key: serviceError.key,
  },
} as const satisfies Record<string, ErrorPageRef>;

export type ErrorPageCode = keyof typeof ERROR_PAGE_BY_CODE;

export const genericErrorPage: ErrorPageRef = {
  status: 500,
  key: "generic",
};

export function isErrorPageCode(value: string): value is ErrorPageCode {
  return Object.prototype.hasOwnProperty.call(ERROR_PAGE_BY_CODE, value);
}

/** Resolve allowlisted `code` to status + catalog key; never echoes untrusted input. */
export function errorPageForCode(code: string | undefined): ErrorPageRef {
  if (code && isErrorPageCode(code)) {
    return ERROR_PAGE_BY_CODE[code];
  }
  return genericErrorPage;
}

/** Build `/{locale}/error?code=…` for service failures (opaque code only). */
export function errorPageHref(locale: string, code: ErrorPageCode): string {
  return `/${locale}/error?code=${encodeURIComponent(code)}`;
}
