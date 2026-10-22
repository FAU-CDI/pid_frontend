"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ResolvedResult } from "@/lib/resolver";
import { hrefForResolved } from "@/lib/resolve-href";
import { DEFAULT_RESOLVE_EXAMPLE } from "@/lib/resolve-example";

type GlobalProps = {
  mode: "global";
  initialQuery?: string;
  /** Placeholder shown in the empty Resolve field. */
  placeholder?: string;
};

type ScopedProps =
  | {
      mode: "scoped";
      scope: "namespace";
      namespaceId: string;
      initialPid?: string;
    }
  | {
      mode: "scoped";
      scope: "mount";
      baseUri: string;
      initialPid?: string;
    };

export type ResolvePanelProps = GlobalProps | ScopedProps;

export default function ResolvePanel(props: ResolvePanelProps) {
  const router = useRouter();
  const [error, setError] = useState("");

  if (props.mode === "global") {
    return (
      <GlobalResolvePanel
        initialQuery={props.initialQuery}
        placeholder={props.placeholder}
        error={error}
        setError={setError}
        router={router}
      />
    );
  }

  return (
    <ScopedResolvePanel
      {...props}
      error={error}
      setError={setError}
      router={router}
    />
  );
}

function GlobalResolvePanel({
  initialQuery = "",
  placeholder = DEFAULT_RESOLVE_EXAMPLE,
  error,
  setError,
  router,
}: {
  initialQuery?: string;
  placeholder?: string;
  error: string;
  setError: (value: string) => void;
  router: ReturnType<typeof useRouter>;
}) {
  const [query, setQuery] = useState(initialQuery);

  async function showDetails() {
    const value = query.trim();

    if (!value) {
      setError("Please enter a namespace or PID.");
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
      router.push(hrefForResolved(result, publicBase));
    } catch (err) {
      console.error("PID resolution failed:", err);
      setError("Unable to resolve.");
    }
  }

  return (
    <div className="card">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              void showDetails();
            }
          }}
          placeholder={placeholder}
          autoComplete="off"
          aria-label="Namespace or PID"
          className="field-input"
        />
        <div className="flex shrink-0 flex-col gap-3 sm:w-40">
          <button
            type="button"
            onClick={() => void showDetails()}
            className="btn-primary w-full"
          >
            Show Details
          </button>
        </div>
      </div>

      {error && <div className="alert-error">{error}</div>}
    </div>
  );
}

function mountPathPrefix(baseUri: string): string {
  try {
    const path = new URL(baseUri).pathname.replace(/^\/+|\/+$/g, "");
    return path ? `${path}/` : "";
  } catch {
    return "";
  }
}

function ScopedResolvePanel({
  error,
  setError,
  router,
  ...props
}: ScopedProps & {
  error: string;
  setError: (value: string) => void;
  router: ReturnType<typeof useRouter>;
}) {
  const [pid, setPid] = useState(props.initialPid ?? "");

  const prefix =
    props.scope === "namespace"
      ? `${props.namespaceId}/`
      : mountPathPrefix(props.baseUri);

  function showDetails() {
    const trimmedPid = pid.trim();
    if (!trimmedPid) {
      setError("Please enter a PID.");
      return;
    }
    setError("");

    if (props.scope === "namespace") {
      router.push(
        `/resolve/${encodeURIComponent(props.namespaceId)}/${encodeURIComponent(trimmedPid)}`
      );
      return;
    }

    const pathname = new URL(props.baseUri).pathname;
    router.push(`${pathname}${encodeURIComponent(trimmedPid)}`);
  }

  function openUrl() {
    const trimmedPid = pid.trim();
    if (!trimmedPid) {
      setError("Please enter a PID.");
      return;
    }
    setError("");

    // Full navigation so the browser follows the /go redirect without App Router soft-nav overhead.
    if (props.scope === "namespace") {
      window.location.assign(
        `/resolve/${encodeURIComponent(props.namespaceId)}/${encodeURIComponent(trimmedPid)}/go`
      );
      return;
    }

    const pathname = new URL(props.baseUri).pathname;
    window.location.assign(
      `${pathname}${encodeURIComponent(trimmedPid)}/go`
    );
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
                showDetails();
              }
            }}
            className="field-input-bare"
          />
        </div>
        <div className="flex shrink-0 flex-col gap-3 sm:w-40">
          <button
            type="button"
            onClick={showDetails}
            className="btn-primary w-full"
          >
            Show Details
          </button>
          <button
            type="button"
            onClick={openUrl}
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
