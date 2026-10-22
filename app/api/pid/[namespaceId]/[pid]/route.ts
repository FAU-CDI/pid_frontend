import { NextResponse } from "next/server";
import {
  getBackendClient,
  isBackendError,
} from "@/lib/backend/client";

export async function GET(
  _request: Request,
  context: {
    params: Promise<{
      namespaceId: string;
      pid: string;
    }>;
  }
) {
  const { namespaceId, pid } = await context.params;

  if (!namespaceId.trim()) {
    return NextResponse.json(
      { error: "Namespace ID is required" },
      { status: 400 }
    );
  }

  if (!pid.trim()) {
    return NextResponse.json({ error: "PID is required" }, { status: 400 });
  }

  const result = await getBackendClient().getResourceByNamespace(
    namespaceId,
    pid
  );

  if (isBackendError(result)) {
    const { status, ...body } = result;
    return NextResponse.json(body, { status });
  }

  return NextResponse.json(result);
}
