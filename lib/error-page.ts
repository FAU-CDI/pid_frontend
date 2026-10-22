import {
  pidNotFound,
  serviceError,
  serviceNotAvailable,
  serviceUnavailable,
} from "@/lib/user-facing";

export type ErrorPageCopy = {
  status: number;
  title: string;
  message: string;
};

/**
 * Allowlisted `/error?code=` values → fixed UI copy.
 * Unknown or missing codes fall back to {@link genericErrorPage}.
 * Never map free-form query strings into title/message.
 */
export const ERROR_PAGE_BY_CODE = {
  notFound: pidNotFound,
  serviceUnavailable: {
    status: 502,
    title: serviceUnavailable.title,
    message: serviceUnavailable.message,
  },
  serviceNotAvailable: {
    status: 500,
    title: serviceNotAvailable.title,
    message: serviceNotAvailable.message,
  },
  serviceError: {
    status: 502,
    title: serviceError.title,
    message: serviceError.message,
  },
} as const satisfies Record<string, ErrorPageCopy>;

export type ErrorPageCode = keyof typeof ERROR_PAGE_BY_CODE;

export const genericErrorPage: ErrorPageCopy = {
  status: 500,
  title: "Something went wrong",
  message: "An unexpected error occurred.",
};

export function isErrorPageCode(value: string): value is ErrorPageCode {
  return Object.prototype.hasOwnProperty.call(ERROR_PAGE_BY_CODE, value);
}

/** Resolve allowlisted `code` to fixed copy; never echoes untrusted input. */
export function errorPageForCode(code: string | undefined): ErrorPageCopy {
  if (code && isErrorPageCode(code)) {
    return ERROR_PAGE_BY_CODE[code];
  }
  return genericErrorPage;
}

/** Build `/error?code=…` for service failures (opaque code only). */
export function errorPageHref(code: ErrorPageCode): string {
  return `/error?code=${encodeURIComponent(code)}`;
}
