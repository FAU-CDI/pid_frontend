import { NextResponse } from "next/server";
import {
  getBackendClient,
  isBackendError,
} from "@/lib/backend/client";

export async function GET(
  _request: Request,
  context: {
    params: Promise<{
      baseUri: string;
      pid: string;
    }>;
  }
) {
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
    return NextResponse.json({ error: "PID is required" }, { status: 400 });
  }

  const client = getBackendClient();
  const absoluteBaseUri = client.resolveMountUri(baseUri);
  const result = await client.getResourceByMount(absoluteBaseUri, pid);

  if (isBackendError(result)) {
    const { status, ...body } = result;
    return NextResponse.json(body, { status });
  }

  return NextResponse.json(result);
}
