import { NextResponse } from "next/server";
import { getBackendClient } from "@/lib/backend/client";
import { resolveFirst } from "@/lib/resolver";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";

  if (!q) {
    return NextResponse.json(
      { error: "Query parameter q is required" },
      { status: 400 }
    );
  }

  const protocol =
    request.headers.get("x-forwarded-proto") ||
    (request.url.startsWith("https") ? "https" : "http");

  const host = request.headers.get("host");
  if (!host) {
    return NextResponse.json(
      { error: "Unable to determine the request host" },
      { status: 500 }
    );
  }

  const hostname = host.split(":")[0];
  const baseUri = `${protocol}://${host}`;

  const result = await resolveFirst(
    q,
    baseUri,
    getBackendClient(),
    hostname
  );

  if (result === null) {
    return NextResponse.json(
      { error: "No matching namespace or PID" },
      { status: 404 }
    );
  }

  return NextResponse.json(result);
}
