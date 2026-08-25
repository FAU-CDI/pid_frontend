import { NextResponse } from "next/server";

const backendUrl = process.env.BACKEND_URL;

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
  try {
    if (!backendUrl) {
      console.error("Missing BACKEND_URL");

      return errorRedirect(
        request,
        500,
        "Server Configuration Error",
        "The server is not configured correctly."
      );
    }

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

    const baseUri =
      `${protocol}://${host}/${mount}/`;

    const targetUrl =
      `${backendUrl}/resolver/mounts/` +
      `${encodeURIComponent(baseUri)}/` +
      `${encodeURIComponent(pid)}`;

    console.log("Mount base URI:", baseUri);

    console.log(
      "Requesting Go mount backend:",
      targetUrl
    );

    const response = await fetch(targetUrl, {
      cache: "no-store",
    });

    console.log(
      "Go response:",
      response.status,
      response.statusText
    );

    if (!response.ok) {
      if (response.status === 404) {
        return errorRedirect(
          request,
          404,
          "Not Found",
          "The mount or PID was not found."
        );
      }

      return errorRedirect(
        request,
        502,
        "Backend Error",
        "The backend returned an error."
      );
    }

    const data = await response.json();

    if (!data.url) {
      return errorRedirect(
        request,
        404,
        "URL Not Found",
        "This PID does not have a URL associated with it."
      );
    }

    return NextResponse.redirect(data.url);
  } catch (error) {
    console.error(
      "Mount redirect failed:",
      error
    );

    return errorRedirect(
      request,
      502,
      "Backend Unavailable",
      "The backend could not be reached."
    );
  }
}