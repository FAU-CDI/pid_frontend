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

  const params = new URLSearchParams();

  params.set("status", String(status));
  params.set("title", title);
  params.set("message", message);

  url.search = params.toString();

  return NextResponse.redirect(url);
}

export async function GET(
  request: Request,
  context: {
    params: Promise<{
      mount: string;
      pid: string;
    }>;
  }
) {
  const { mount, pid } = await context.params;

  if (!mount.trim() || !pid.trim()) {
    return errorRedirect(
      request,
      404,
      "Not Found",
      "The requested resource was not found."
    );
  }

  const protocol =
    request.headers.get("x-forwarded-proto") || "http";

  const host = request.headers.get("host");

  if (!host) {
    return errorRedirect(
      request,
      500,
      "Server Error",
      "Unable to determine the request host."
    );
  }

  const client = getBackendClient();
  const baseUri = client.resolveMountUri(mount, `${protocol}://${host}`);

  console.log("Mount base URI:", baseUri);

  const result = await client.getResourceByMount(baseUri, pid);

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
        "The mount or PID was not found."
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
