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

/**
 * Build an in-app href for a `resolveFirst` result (e.g. homepage `/?q=`).
 * Missing PIDs (`exists: false`) still link to the details page (never `/go`).
 */
export function hrefForResolved(
  result: ResolvedResult,
  publicBaseUri: string
): string {
  if (result.kind === "namespace") {
    if ("mount" in result && result.mount) {
      return `/${encodeMountPath(relativeMountPath(result.mount, publicBaseUri))}`;
    }
    if ("namespace" in result && result.namespace) {
      return `/resolve/${encodeURIComponent(result.namespace)}`;
    }
    return "/";
  }

  const go = result.exists && result.go;

  if ("mount" in result && result.mount) {
    const mountPath = encodeMountPath(
      relativeMountPath(result.mount, publicBaseUri)
    );
    const pid = encodeURIComponent(result.pid);
    return go ? `/${mountPath}/${pid}/go` : `/${mountPath}/${pid}`;
  }

  const ns = encodeURIComponent(result.namespace!);
  const pid = encodeURIComponent(result.pid);
  return go ? `/resolve/${ns}/${pid}/go` : `/resolve/${ns}/${pid}`;
}
