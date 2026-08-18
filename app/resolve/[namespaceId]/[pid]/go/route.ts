import { NextResponse } from "next/server";

const backendUrl = process.env.BACKEND_URL;

export async function GET(
  _request: Request,
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

      return new NextResponse("Server configuration error", {
        status: 500,
      });
    }

    const { namespaceId, pid } = await context.params;

    if (!namespaceId.trim() || !pid.trim()) {
      return new NextResponse("Not Found", {
        status: 404,
      });
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

    if (!response.ok) {
      if (response.status === 404) {
        return new NextResponse("Not Found", {
          status: 404,
        });
      }

      console.error(
        "Go backend returned:",
        response.status,
        response.statusText
      );

      return new NextResponse(
        "Backend returned an error",
        {
          status: 502,
        }
      );
    }

    const data = await response.json();

    if (!data.url) {
      return new NextResponse("URL not found", {
        status: 404,
      });
    }

    return NextResponse.redirect(data.url);
  } catch (error) {
    console.error(
      "PID redirect failed:",
      error
    );

    return new NextResponse(
      "Backend unavailable",
      {
        status: 502,
      }
    );
  }
}