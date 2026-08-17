import { NextResponse } from "next/server";

const backendUrl = process.env.BACKEND_URL;

export async function GET(
  _request: Request,
  context: {
    params: Promise<{
      baseUri: string;
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

    const { baseUri, pid } = await context.params;

    console.log("Received baseUri:", baseUri);
    console.log("Received pid:", pid);

    if (!baseUri.trim()) {
      return NextResponse.json(
        { error: "Base URI is required" },
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
      `${backendUrl}/resolver/mounts/` +
      `${encodeURIComponent(baseUri)}/` +
      `${encodeURIComponent(pid)}`;

    console.log("Requesting Go mount backend:", targetUrl);

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
              ? "Mount or PID not found"
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
    console.error("Mount backend request failed:", error);

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