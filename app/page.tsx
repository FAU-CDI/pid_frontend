"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ResolvedResult } from "@/lib/resolver";

export default function HomePage() {
  const router = useRouter();

  const [pidPath, setPidPath] = useState("");
  const [error, setError] = useState("");

  async function resolvePid() {
    const value = pidPath.trim();

    if (!value) {
      setError("Please enter a namespace, mount, or PID path.");
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `/api/resolve?q=${encodeURIComponent(value)}`
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          setError("No matching namespace or PID.");
        } else {
          setError(data.error || "Unable to resolve.");
        }
        return;
      }

      const result = data as ResolvedResult;
      const publicBase = `${window.location.protocol}//${window.location.host}`;
      const href = hrefForResolved(result, publicBase);

      if (href === null) {
        setError("PID does not exist.");
        return;
      }

      router.push(href);
    } catch (err) {
      console.error("PID resolution failed:", err);
      setError("Unable to resolve.");
    }
  }

  return (
    <div className="page-shell">
      <main className="page-main">
        <div className="page-column">
          <div className="page-header">
            <h1 className="page-title">PID Resolver</h1>
            <p className="page-lede">
              Resolve and explore persistent identifiers.
            </p>
          </div>

          <div className="card">
            <h2 className="card-title">Resolve PID</h2>
            <p className="card-hint">
              Enter a mount path, namespace id, or PID (optionally with{" "}
              <span className="font-mono">/go</span>).
            </p>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={pidPath}
                onChange={(e) => {
                  setPidPath(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    resolvePid();
                  }
                }}
                placeholder="base/kqz-d5j"
                autoComplete="off"
                className="field-input"
              />

              <button onClick={resolvePid} className="btn-primary">
                Resolve
              </button>
            </div>

            {error && <div className="alert-error">{error}</div>}
          </div>

          <div className="card">
            <h2 className="card-title">About PID Resolver</h2>
            <p className="card-body">
              This service allows users to resolve PIDs and retrieve information
              about the resources they identify.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="card-compact">
              <h3 className="font-semibold">PID</h3>
              <p className="card-hint">
                Persistent identifier for a resource.
              </p>
            </div>

            <div className="card-compact">
              <h3 className="font-semibold">Metadata</h3>
              <p className="card-hint">
                View metadata associated with a PID.
              </p>
            </div>

            <div className="card-compact">
              <h3 className="font-semibold">Resolution</h3>
              <p className="card-hint">
                Resolve a PID to its associated resource.
              </p>
            </div>
          </div>

          <a
            href="https://github.com/tkw1536/quickpid/tree/main/spec"
            target="_blank"
            rel="noopener noreferrer"
            className="card-muted"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="card-title">Documentation</h2>
                <p className="card-hint">
                  Read the documentation and learn more about the PID Resolver.
                </p>
              </div>
              <span className="text-xl">→</span>
            </div>
          </a>
        </div>
      </main>
    </div>
  );
}

function relativeMountPath(
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

function encodeMountPath(mount: string): string {
  return mount
    .split("/")
    .filter(Boolean)
    .map(encodeURIComponent)
    .join("/");
}

function hrefForResolved(
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
    return result.go
      ? `/${mountPath}/${pid}/go`
      : `/${mountPath}/${pid}`;
  }

  const ns = encodeURIComponent(result.namespace!);
  const pid = encodeURIComponent(result.pid);
  return result.go
    ? `/resolve/${ns}/${pid}/go`
    : `/resolve/${ns}/${pid}`;
}
