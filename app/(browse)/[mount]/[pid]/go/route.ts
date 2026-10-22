import { NextResponse } from "next/server";
import {
  getBackendClient,
  isBackendError,
} from "@/lib/backend/client";
import {
  serviceNotAvailable,
  serviceStatusCopy,
  serviceUnavailable,
} from "@/lib/user-facing";

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
      "Not found",
      "The PID was not found."
    );
  }

  const protocol =
    request.headers.get("x-forwarded-proto") || "http";

  const host = request.headers.get("host");

  if (!host) {
    return errorRedirect(
      request,
      500,
      serviceNotAvailable.title,
      serviceNotAvailable.message
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
        serviceNotAvailable.title,
        serviceNotAvailable.message
      );
    }

    if (result.status === 404) {
      return errorRedirect(
        request,
        404,
        "Not found",
        "The PID was not found."
      );
    }

    if (result.error === "Backend unavailable") {
      return errorRedirect(
        request,
        502,
        serviceUnavailable.title,
        serviceUnavailable.message
      );
    }

    const copy = serviceStatusCopy(false);
    return errorRedirect(request, 502, copy.title, copy.message);
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
