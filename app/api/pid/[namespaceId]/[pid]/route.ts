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

      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const { namespaceId, pid } = await context.params;

    if (!namespaceId.trim()) {
      return NextResponse.json(
        { error: "Namespace ID is required" },
        { status: 400 }
      );
    }

    if (!pid.trim()) {
      return NextResponse.json(
        { error: "PID is required" },
        { status: 400 }
      );
    }

    const targetUrl =
      `${backendUrl}/resolver/namespaces/` +
      `${encodeURIComponent(namespaceId)}/resources/` +
      `${encodeURIComponent(pid)}`;

    console.log("Requesting Go backend:", targetUrl);

    const response = await fetch(targetUrl, {
      cache: "no-store",
    });

    console.log(
      "Go backend response:",
      response.status,
      response.statusText
    );

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            response.status === 404
              ? "PID not found"
              : "Go backend returned an error",
        },
        {
          status: response.status === 404 ? 404 : 502,
        }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Backend request failed:", error);

    return NextResponse.json(
      {
        error: "Backend unavailable",
        details:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 502 }
    );
  }
}