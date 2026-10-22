import type { ResolvedResult } from "@/lib/resolver";

export function relativeMountPath(
  absoluteMount: string,
  publicBaseUri: string
): string {
  const origin = publicBaseUri.replace(/\/+$/, "");
  let path = absoluteMount;
  if (path.startsWith(origin)) {
    path = path.slice(origin.length);
  } else {
    try {
      path = new URL(absoluteMount).pathname;
    } catch {
      // keep path as-is
    }
  }
  return path.replace(/^\/+|\/+$/g, "");
}

export function encodeMountPath(mount: string): string {
  return mount
    .split("/")
    .filter(Boolean)
    .map(encodeURIComponent)
    .join("/");
}

/** Build an in-app href for a successful `/api/resolve` result, or null if missing. */
export function hrefForResolved(
  result: ResolvedResult,
  publicBaseUri: string
): string | null {
  if (result.kind === "namespace") {
    if (result.mount) {
      return `/${encodeMountPath(relativeMountPath(result.mount, publicBaseUri))}`;
    }
    return `/resolve/${encodeURIComponent(result.namespace)}`;
  }

  if (!result.exists) {
    return null;
  }

  if ("mount" in result && result.mount) {
    const mountPath = encodeMountPath(
      relativeMountPath(result.mount, publicBaseUri)
    );
    const pid = encodeURIComponent(result.pid);
    return result.go ? `/${mountPath}/${pid}/go` : `/${mountPath}/${pid}`;
  }

  const ns = encodeURIComponent(result.namespace!);
  const pid = encodeURIComponent(result.pid);
  return result.go
    ? `/resolve/${ns}/${pid}/go`
    : `/resolve/${ns}/${pid}`;
}
