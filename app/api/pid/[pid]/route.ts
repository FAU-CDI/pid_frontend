import { NextResponse } from "next/server";

const backendUrl = process.env.BACKEND_URL;
const namespaceId = process.env.NAMESPACE_ID;

export async function GET(
  request: Request,
  context: { params: Promise<{ pid: string }> }
) {
  try {
    const { pid } = await context.params;

    const targetUrl =
      `${backendUrl}/resolver/namespaces/` +
      `${namespaceId}/resources/${pid}`;

    const response = await fetch(targetUrl, {
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "PID not found" },
        { status: 404 }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Backend unavailable" },
      { status: 500 }
    );
  }
}