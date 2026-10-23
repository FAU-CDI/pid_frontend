"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { hrefForResolved } from "@/lib/resolve-href";
import {
  scopedResourceTarget,
  type ResolveScope,
  type ResourceParseResult,
  type ResolvedResult,
} from "@/lib/resolver";

type ScopedProps =
  | {
      mode?: "scoped";
      scope: "namespace";
      namespaceId: string;
      initialPid?: string;
    }
  | {
      mode?: "scoped";
      scope: "mount";
      baseUri: string;
      initialPid?: string;
    };

export type ResolvePanelProps = ScopedProps;

export default function ResolvePanel(props: ResolvePanelProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pid, setPid] = useState(props.initialPid ?? "");

  const resolveScope = toResolveScope(props);
  const prefix =
    props.scope === "namespace"
      ? `${props.namespaceId}/`
      : mountPathPrefix(props.baseUri);

  function navigate(forceGo: boolean) {
    const trimmed = pid.trim();
    if (!trimmed) {
      setError("Please enter a PID.");
      return;
    }
    setError("");

    const hostname =
      typeof window !== "undefined" ? window.location.hostname : "";
    const target = scopedResourceTarget(
      resolveScope,
      trimmed,
      hostname,
      forceGo
    );
    if (!target) {
      setError("Please enter a PID.");
      return;
    }

    const publicBase =
      typeof window !== "undefined" ? window.location.origin : "";
    router.push(hrefForResolved(asResolvedForHref(target), publicBase));
  }

  return (
    <div className="card">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="field-with-prefix flex-1">
          {prefix && (
            <span className="field-prefix" aria-hidden="true">
              {prefix}
            </span>
          )}
          <input
            type="text"
            placeholder="PID"
            value={pid}
            autoComplete="off"
            aria-label="PID"
            onChange={(e) => {
              setPid(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                navigate(false);
              }
            }}
            className="field-input-bare"
          />
        </div>
        <div className="flex shrink-0 flex-col gap-3 sm:w-40">
          <button
            type="button"
            onClick={() => navigate(false)}
            className="btn-primary w-full"
          >
            Show Details
          </button>
          <button
            type="button"
            onClick={() => navigate(true)}
            className="btn-secondary w-full"
          >
            Open URL
          </button>
        </div>
      </div>

      {error && <div className="alert-error">{error}</div>}
    </div>
  );
}

function toResolveScope(props: ResolvePanelProps): ResolveScope {
  if (props.scope === "namespace") {
    return { kind: "namespace", namespaceId: props.namespaceId };
  }
  return {
    kind: "mount",
    mountPath: mountPathPrefix(props.baseUri).replace(/\/$/, ""),
  };
}

/**
 * hrefForResolved only emits `/go` when `exists && go`; navigation always wants
 * the parsed target URL — existence is decided on the destination page.
 */
function asResolvedForHref(target: ResourceParseResult): ResolvedResult {
  if ("namespace" in target) {
    return {
      kind: "resource",
      namespace: target.namespace,
      pid: target.pid,
      go: target.go,
      exists: true,
    };
  }
  return {
    kind: "resource",
    mount: target.mount,
    pid: target.pid,
    go: target.go,
    exists: true,
  };
}

function mountPathPrefix(baseUri: string): string {
  try {
    const path = new URL(baseUri).pathname.replace(/^\/+|\/+$/g, "");
    return path ? `${path}/` : "";
  } catch {
    return "";
  }
}
