import { isSupportedLocale } from "./locales";
import {
  BackendClient,
  isBackendError,
  type ApiErrorCode,
  type BackendError,
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

export type ResourceParseResult = Extract<ParseResult, { kind: "resource" }>;

/** Fixed browse scope for the scoped Resolve panel (namespace UUID or mount path). */
export type ResolveScope =
  | { kind: "namespace"; namespaceId: string }
  | { kind: "mount"; mountPath: string };

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
  // This should at minimum handle any sort of route the frontend handles.
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
  // When the first segment is a supported UI locale (see lib/locales), readings
  // are also produced for the path with that prefix stripped (e.g. /en/test →
  // mount "en/test" and mount "test"). Unsupported prefixes are not stripped.
  // Both language-prefixed and non-prefixed Resolve inputs must keep working.
  //
  // Matches on exact components ("go" and "resolve") are case-insensitive.
  // $namespace and $pid must consist of exactly one component; both are
  // normalized to lowercase [a-z0-9_-] (other characters stripped).
  // $mount may consist of more than a single component and is not rewritten.
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

  return finalizeParseResults(candidates);
}

/** Relative / same-host pathname component readings. */
function parsePathComponents(components: string[]): ParseResult[] {
  if (components.length === 0) {
    return [];
  }

  const candidates = [...parsePathComponentsCore(components)];

  // Dual readings: also parse after stripping a supported locale prefix.
  if (isSupportedLocale(components[0]) && components.length > 1) {
    candidates.push(...parsePathComponentsCore(components.slice(1)));
  }

  return finalizeParseResults(candidates);
}

/** Syntactic readings for one path (no locale-prefix dualization). */
function parsePathComponentsCore(components: string[]): ParseResult[] {
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

/** Lowercase letters, digits, hyphen, underscore — matches backend NamespaceId / PID. */
const ID_CHAR = /[a-z0-9_-]/;

/** Strip to the backend id charset (lowercase [a-z0-9_-]). Mounts are left unchanged. */
function normalizeId(id: string): string {
  return id
    .toLowerCase()
    .split("")
    .filter((c) => ID_CHAR.test(c))
    .join("");
}

function normalizeParseResult(result: ParseResult): ParseResult {
  if (result.kind === "namespace") {
    if ("namespace" in result) {
      return { kind: "namespace", namespace: normalizeId(result.namespace) };
    }
    return result;
  }
  if ("namespace" in result) {
    return {
      kind: "resource",
      namespace: normalizeId(result.namespace),
      pid: normalizeId(result.pid),
      go: result.go,
    };
  }
  return {
    kind: "resource",
    mount: result.mount,
    pid: normalizeId(result.pid),
    go: result.go,
  };
}

/** Drop candidates whose namespace or pid became empty after normalization. */
function isUsableParseResult(result: ParseResult): boolean {
  if ("namespace" in result && result.namespace === "") {
    return false;
  }
  if ("pid" in result && result.pid === "") {
    return false;
  }
  return true;
}

function finalizeParseResults(candidates: ParseResult[]): ParseResult[] {
  return candidates.map(normalizeParseResult).filter(isUsableParseResult);
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
 * Namespaces/mounts and resources may have `exists: false` when the context is
 * syntactically valid but the backend returned a not-found for that entity
 * (so the UI can still navigate to the matching details / not-found page).
 *
 * Resources may have `exists: false` for missing PIDs (`resourceNotFound`) or
 * invalid PID strings (`invalidPid`); both still navigate to the details UI.
 */
export type ResolvedResult =
  | { kind: "namespace"; namespace: string; mount?: string; exists: boolean }
  | { kind: "namespace"; mount: string; exists: boolean }
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

function isSoftMiss(
  error: Pick<BackendError, "status" | "code">,
  notFoundCode: ApiErrorCode,
  invalidCode: ApiErrorCode
): boolean {
  if (error.status === 404 && error.code === notFoundCode) {
    return true;
  }
  if (error.status === 400 && error.code === invalidCode) {
    return true;
  }
  return false;
}

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
        if (isSoftMiss(data, "mountNotFound", "invalidBaseUri")) {
          return { kind: "namespace", mount, exists: false };
        }
        return null;
      }
      return {
        kind: "namespace",
        mount,
        namespace: data.namespace,
        exists: true,
      };
    }

    const data = await client.getNamespace(result.namespace);
    if (isBackendError(data)) {
      if (isSoftMiss(data, "namespaceNotFound", "invalidNamespaceId")) {
        return {
          kind: "namespace",
          namespace: result.namespace,
          exists: false,
        };
      }
      return null;
    }
    return {
      kind: "namespace",
      namespace: result.namespace,
      exists: true,
    };
  }

  // resource
  if ("mount" in result) {
    const mount = client.resolveMountUri(result.mount, base_uri);
    const data = await client.getResourceByMount(mount, result.pid);
    if (isBackendError(data)) {
      if (isSoftMiss(data, "resourceNotFound", "invalidPid")) {
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
    if (isSoftMiss(data, "resourceNotFound", "invalidPid")) {
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
 * Homepage-equivalent query for a scoped Resolve field: selected scope + trimmed input.
 * Leading slashes are stripped from the field so `/pid` and `pid` behave the same.
 */
export function composeScopedQuery(
  scope: ResolveScope,
  fieldInput: string
): string {
  const rest = fieldInput.trim().replace(/^\/+/, "");
  if (scope.kind === "namespace") {
    return rest
      ? `resolve/${scope.namespaceId}/${rest}`
      : `resolve/${scope.namespaceId}`;
  }
  const mountPath = scope.mountPath.replace(/^\/+|\/+$/g, "");
  return rest ? `${mountPath}/${rest}` : mountPath;
}

function normalizeMountPath(mount: string): string {
  if (mount.includes("://")) {
    try {
      return new URL(mount).pathname.replace(/^\/+|\/+$/g, "");
    } catch {
      return mount.replace(/^\/+|\/+$/g, "");
    }
  }
  return mount.replace(/^\/+|\/+$/g, "");
}

function resourceMatchesScope(
  candidate: ResourceParseResult,
  scope: ResolveScope
): boolean {
  if (scope.kind === "namespace") {
    return (
      "namespace" in candidate &&
      candidate.namespace === normalizeId(scope.namespaceId)
    );
  }
  if (!("mount" in candidate)) {
    return false;
  }
  return (
    normalizeMountPath(candidate.mount) === normalizeMountPath(scope.mountPath)
  );
}

/**
 * Parse as if the homepage field received {@link composeScopedQuery}, then keep
 * only resource candidates under the selected scope.
 */
export function parseScopedPIDField(
  scope: ResolveScope,
  fieldInput: string,
  hostname: string
): ResourceParseResult[] {
  const query = composeScopedQuery(scope, fieldInput);
  return parsePIDField(query, hostname).filter(
    (candidate): candidate is ResourceParseResult =>
      candidate.kind === "resource" && resourceMatchesScope(candidate, scope)
  );
}

/**
 * First scoped resource reading for the Resolve panel.
 * `forceGo` (Open URL) sets `go: true` even when the field omits `/go`.
 * Returns null when the field is empty or nothing under the scope parses as a resource.
 */
export function scopedResourceTarget(
  scope: ResolveScope,
  fieldInput: string,
  hostname: string,
  forceGo: boolean
): ResourceParseResult | null {
  if (!fieldInput.trim()) {
    return null;
  }
  const candidates = parseScopedPIDField(scope, fieldInput, hostname);
  const first = candidates[0];
  if (!first) {
    return null;
  }
  if (forceGo && !first.go) {
    return { ...first, go: true };
  }
  return first;
}

/**
 * Parse input and return the first candidate that resolves against the API.
 *
 * A namespace/mount with `exists: false` is a soft miss: later candidates are
 * still tried (so e.g. `demo` can resolve as a mount even when no namespace
 * named `demo` exists). Resources (including missing PIDs) and existing
 * namespaces stop the search immediately.
 */
export async function resolveFirst(
  input: string,
  baseUri: string,
  client: BackendClient,
  hostname: string
): Promise<ResolvedResult | null> {
  let softMiss: ResolvedResult | null = null;

  for (const candidate of parsePIDField(input, hostname)) {
    const resolved = await resolve(candidate, baseUri, client);
    if (resolved === null) {
      continue;
    }
    if (resolved.kind === "namespace" && !resolved.exists) {
      softMiss ??= resolved;
      continue;
    }
    return resolved;
  }

  return softMiss;
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
