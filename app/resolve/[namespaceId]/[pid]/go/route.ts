import { NextResponse } from "next/server";
import {
  getBackendClient,
  isBackendError,
} from "@/lib/backend/client";

function errorRedirect(
  request: Request,
  status: number,
  title: string,
  message: string
) {
  const url = new URL("/error", request.url);

  url.searchParams.set("status", String(status));
  url.searchParams.set("title", title);
  url.searchParams.set("message", message);

  return NextResponse.redirect(url);
}

export async function GET(
  request: Request,
  context: {
    params: Promise<{
      namespaceId: string;
      pid: string;
    }>;
  }
) {
  const { namespaceId, pid } = await context.params;

  if (!namespaceId.trim() || !pid.trim()) {
    return errorRedirect(
      request,
      404,
      "Not Found",
      "The requested resource was not found."
    );
  }

  console.log("Resolving PID for redirect:", namespaceId, pid);

  const result = await getBackendClient().getResourceByNamespace(
    namespaceId,
    pid
  );

  if (isBackendError(result)) {
    if (result.status === 500) {
      return errorRedirect(
        request,
        500,
        "Server Configuration Error",
        "The server is not configured correctly."
      );
    }

    if (result.status === 404) {
      return errorRedirect(
        request,
        404,
        "Not Found",
        "The namespace or PID was not found."
      );
    }

    if (result.error === "Backend unavailable") {
      return errorRedirect(
        request,
        502,
        "Backend Unavailable",
        "The backend could not be reached."
      );
    }

    return errorRedirect(
      request,
      502,
      "Backend Error",
      "The backend returned an error."
    );
  }

  if (!("url" in result) || !result.url) {
    return errorRedirect(
      request,
      404,
      "URL Not Found",
      "This PID does not have a URL associated with it."
    );
  }

  return NextResponse.redirect(result.url);
}
