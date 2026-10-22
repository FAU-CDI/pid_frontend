import {
  BackendClient,
  isBackendError,
} from "./backend/client";

/**
 * Represents a single possible result of parsing the PID input.
 *
 * Parse results may point to either a namespace, or a resource.
 * Resources may optionally point to a '/go' url directly.
 *
 * `mount` is either a path relative to the current public origin (e.g. `some/nested`)
 * or an absolute mount base URI (e.g. `https://other.example/base/`) when the user
 * pasted a foreign absolute URL.
 */
export type ParseResult =
  | { kind: "namespace"; namespace: string }
  | { kind: "namespace"; mount: string }
  | { kind: "resource"; mount: string; pid: string; go: boolean }
  | { kind: "resource"; namespace: string; pid: string; go: boolean };

/**
 * Parse parses a human-provided input, and finds possible parse results.
 *
 * @param input The user input to parse.
 * @param hostname Hostname of the current frontend. Same-host absolute URLs are
 *   stripped to their pathname (so `/resolve/...` works). Foreign absolute URLs
 *   yield mount-only readings with absolute `mount` values.
 *
 * This function works only syntactically, and does not validate if a namespace or resource actually exist.
 */
export function parsePIDField(
  input: string,
  hostname: string = typeof location !== "undefined" ? location.hostname : "",
): ParseResult[] {
  // This function parses a (potentially dirty) input from a parse field
  // and attempts to guess what the user meant.
  //
  // This function is pure, and purely syntactically finds possible
  // results.
  // It does not check against the API if these actually exist.
  //
  // Same-host absolute URLs (e.g. https://resolver.example/resolve/$namespace/$pid)
  // are normalized to their pathname, then parsed like relative inputs.
  //
  // Foreign absolute URLs are treated only as mount base URIs (optionally with
  // $pid and /go); /resolve/ and bare-namespace readings are not produced.
  //
  // Relative patterns:
  //
  // resolve/$namespace
  // resolve/$namespace/$pid
  // resolve/$namespace/$pid/go
  //
  // $namespace
  // $namespace/$pid
  // $namespace/$pid/go
  //
  // $mount
  // $mount/$pid
  // /$mount/$pid/go
  //
  // Matches on exact components ("go" and "resolve") are case-insensitive.
  // $namespace and $pid must consist of exactly one component.
  // $mount may consist of more than a single component.
  //
  // The function returns all possible matches, it is left to the caller to check against
  // the API to see if these actually exist.

  const trimmed = input.trim();
  const url = tryParseURL(trimmed);
  if (url !== null) {
    if (url.hostname !== hostname) {
      return parseAbsoluteMountURL(url);
    }
    return parsePathComponents(pathComponents(url.pathname));
  }

  return parsePathComponents(pathComponents(trimmed));
}

function pathComponents(path: string): string[] {
  return path
    .split("/")
    .map((part) => part.trim())
    .filter((x) => x !== "");
}

/** Origin + path segments as an absolute mount base URI (trailing slash). */
function absoluteMountBase(origin: string, segments: string[]): string {
  const path = segments.join("/");
  return path ? `${origin}/${path}/` : `${origin}/`;
}

/**
 * Foreign absolute URL → mount-only readings with absolute `mount` values.
 * No /resolve/ or bare-namespace candidates.
 */
function parseAbsoluteMountURL(url: URL): ParseResult[] {
  const origin = url.origin;
  const components = pathComponents(url.pathname);
  const candidates: ParseResult[] = [];

  if (
    components.length > 2 &&
    components[components.length - 1].toLowerCase() === "go"
  ) {
    const pidPart = components[components.length - 2];
    const mountSegments = components.slice(0, components.length - 2);
    candidates.push({
      kind: "resource",
      mount: absoluteMountBase(origin, mountSegments),
      pid: pidPart,
      go: true,
    });
  }

  if (components.length >= 2) {
    const pidPart = components[components.length - 1];
    // Prefer non-go reading when last segment is "go" only via the branch above;
    // still allow mount+pid when last is a real pid.
    if (components[components.length - 1].toLowerCase() !== "go") {
      const mountSegments = components.slice(0, components.length - 1);
      candidates.push({
        kind: "resource",
        mount: absoluteMountBase(origin, mountSegments),
        pid: pidPart,
        go: false,
      });
    }
  }

  // Full path as mount (including empty path → origin/).
  // When the last segment looks like a pid (/go case handled above), still offer
  // the full path as a mount candidate for disambiguation.
  if (
    components.length === 0 ||
    components[components.length - 1].toLowerCase() !== "go"
  ) {
    candidates.push({
      kind: "namespace",
      mount: absoluteMountBase(origin, components),
    });
  } else {
    // .../pid/go → also allow mount = path without /go (without pid) via resource
    // above; mount-only for path without trailing go+pid is less useful here.
    const mountSegments = components.slice(0, components.length - 2);
    candidates.push({
      kind: "namespace",
      mount: absoluteMountBase(origin, mountSegments),
    });
  }

  return candidates;
}

/** Relative / same-host pathname component readings. */
function parsePathComponents(components: string[]): ParseResult[] {
  if (components.length === 0) {
    return [];
  }

  const candidates: ParseResult[] = [];

  // First handle "/resolve/" inputs.
  //
  // These *must* be followed by an exact namespace, an exact pid,
  // and optionally the component "go".
  if (components[0].toLowerCase() === "resolve") {
    if (components.length === 2) {
      // resolve/$namespace
      candidates.push({ kind: "namespace", namespace: components[1] });
    }
    if (components.length === 3) {
      // resolve/$namespace/$pid
      candidates.push({
        kind: "resource",
        namespace: components[1],
        pid: components[2],
        go: false,
      });
    }
    if (components.length === 4 && components[3].toLowerCase() === "go") {
      // resolve/$namespace/$pid/go
      candidates.push({
        kind: "resource",
        namespace: components[1],
        pid: components[2],
        go: true,
      });
    }
  }

  // We have a trailing 'go' at the end.
  // Then we might have:
  //
  // $namespace/$pid/go
  // $mount/$pid/go
  if (
    components[components.length - 1].toLowerCase() === "go" &&
    components.length > 2
  ) {
    const pidPart = components[components.length - 2];
    const mountOrNamespacePart = components
      .slice(0, components.length - 2)
      .join("/");
    if (components.length === 3) {
      // $namespace/$pid/go
      candidates.push({
        kind: "resource",
        namespace: mountOrNamespacePart,
        pid: pidPart,
        go: true,
      });
    }
    // $mount/$pid/go
    candidates.push({
      kind: "resource",
      mount: mountOrNamespacePart,
      pid: pidPart,
      go: true,
    });
  }

  if (components.length >= 2) {
    const pidPart = components[components.length - 1];
    const mountOrNamespacePart = components
      .slice(0, components.length - 1)
      .join("/");

    if (components.length === 2) {
      // $namespace/$pid
      candidates.push({
        kind: "resource",
        namespace: mountOrNamespacePart,
        pid: pidPart,
        go: false,
      });
    }

    // $mount/$pid
    candidates.push({
      kind: "resource",
      mount: mountOrNamespacePart,
      pid: pidPart,
      go: false,
    });
  }

  // $namespace
  if (components.length === 1) {
    candidates.push({ kind: "namespace", namespace: components[0] });
  }

  // $mount
  candidates.push({ kind: "namespace", mount: components.join("/") });

  return candidates;
}

function tryParseURL(input: string): URL | null {
  try {
    const u = new URL(input);
    if (
      !((u.protocol === "http:" || u.protocol === "https:") && !!u.hostname)
    ) {
      return null;
    }
    return u;
  } catch {
    return null;
  }
}

/**
 * ResolvedResult represents a result that has been resolved against the API.
 *
 * It can point to either a namespace or a resource.
 * Mounts are absolute "base URIs" as used by the backend.
 *
 * In case of pointing to a resource, the pid itself may or may not exist, but must be syntactically valid (i.e. the backend should return 200, 410 or 404 and *not* a generic parsing error).
 */
export type ResolvedResult =
  | { kind: "namespace"; mount?: string; namespace: string }
  | {
      kind: "resource";
      mount: string;
      namespace?: string;
      pid: string;
      go: boolean;
      exists: boolean;
    }
  | {
      kind: "resource";
      namespace: string;
      mount?: string;
      pid: string;
      go: boolean;
      exists: boolean;
    };

/**
 * Resolve resolves a parse result against the API (exactly one backend request).
 *
 * @param result The single parsed result to attempt to resolve.
 * @param base_uri The public URL of the frontend, to use as a base uri for mounts
 *   when `PUBLIC_BASE_URI` is unset.
 * @param client The backend client to use for interactions with the API.
 */
export async function resolve(
  result: ParseResult,
  base_uri: string,
  client: BackendClient
): Promise<ResolvedResult | null> {
  if (result.kind === "namespace") {
    if ("mount" in result) {
      const mount = client.resolveMountUri(result.mount, base_uri);
      const data = await client.getMount(mount);
      if (isBackendError(data)) {
        return null;
      }
      return {
        kind: "namespace",
        mount,
        namespace: data.namespace,
      };
    }

    const data = await client.getNamespace(result.namespace);
    if (isBackendError(data)) {
      return null;
    }
    return { kind: "namespace", namespace: result.namespace };
  }

  // resource
  if ("mount" in result) {
    const mount = client.resolveMountUri(result.mount, base_uri);
    const data = await client.getResourceByMount(mount, result.pid);
    if (isBackendError(data)) {
      if (data.status === 404 && data.code === "resourceNotFound") {
        return {
          kind: "resource",
          mount,
          pid: result.pid,
          go: result.go,
          exists: false,
        };
      }
      return null;
    }
    return {
      kind: "resource",
      mount,
      ...(data.namespace ? { namespace: data.namespace } : {}),
      pid: result.pid,
      go: result.go,
      exists: true,
    };
  }

  const data = await client.getResourceByNamespace(result.namespace, result.pid);
  if (isBackendError(data)) {
    if (data.status === 404 && data.code === "resourceNotFound") {
      return {
        kind: "resource",
        namespace: result.namespace,
        pid: result.pid,
        go: result.go,
        exists: false,
      };
    }
    return null;
  }
  return {
    kind: "resource",
    namespace: result.namespace,
    pid: result.pid,
    go: result.go,
    exists: true,
  };
}

/**
 * Parse input and return the first candidate that resolves against the API.
 */
export async function resolveFirst(
  input: string,
  baseUri: string,
  client: BackendClient,
  hostname: string
): Promise<ResolvedResult | null> {
  for (const candidate of parsePIDField(input, hostname)) {
    const resolved = await resolve(candidate, baseUri, client);
    if (resolved !== null) {
      return resolved;
    }
  }
  return null;
}

/**
 * Strip the public origin from an absolute mount base URI, yielding the
 * relative mount path used in frontend routes (e.g. `base`).
 */
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
