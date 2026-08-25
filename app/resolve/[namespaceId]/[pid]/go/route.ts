import { NextResponse } from "next/server";

const backendUrl = process.env.BACKEND_URL;

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

    const { namespaceId, pid } = await context.params;

    if (!namespaceId.trim() || !pid.trim()) {
      return errorRedirect(
        request,
        404,
        "Not Found",
        "The requested resource was not found."
      );
    }

    const targetUrl =
      `${backendUrl}/resolver/namespaces/` +
      `${encodeURIComponent(namespaceId)}/resources/` +
      `${encodeURIComponent(pid)}`;

    console.log(
      "Resolving PID for redirect:",
      targetUrl
    );

    const response = await fetch(targetUrl, {
      cache: "no-store",
    });

    console.log(
      "Go backend response:",
      response.status,
      response.statusText
    );

    if (!response.ok) {
      if (response.status === 404) {
        return errorRedirect(
          request,
          404,
          "Not Found",
          "The namespace or PID was not found."
        );
      }

      console.error(
        "Go backend returned:",
        response.status,
        response.statusText
      );

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
      "PID redirect failed:",
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