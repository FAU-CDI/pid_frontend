"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ResolvedResult } from "@/lib/resolver";
import { hrefForResolved } from "@/lib/resolve-href";

type GlobalProps = {
  mode: "global";
  initialQuery?: string;
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
  error,
  setError,
  router,
}: {
  initialQuery?: string;
  error: string;
  setError: (value: string) => void;
  router: ReturnType<typeof useRouter>;
}) {
  const [query, setQuery] = useState(initialQuery);

  async function resolvePid() {
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
    <div className="card">
      <h2 className="card-title">Resolve</h2>
      <p className="card-hint">Enter a namespace or PID.</p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              void resolvePid();
            }
          }}
          placeholder="base/kqz-d5j"
          autoComplete="off"
          className="field-input"
        />
        <button type="button" onClick={() => void resolvePid()} className="btn-primary">
          Resolve
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}
    </div>
  );
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

  const contextHint =
    props.scope === "namespace"
      ? `Look up a PID in namespace ${props.namespaceId}.`
      : "Look up a PID.";

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

  function redirect() {
    const trimmedPid = pid.trim();
    if (!trimmedPid) {
      setError("Please enter a PID.");
      return;
    }
    setError("");

    if (props.scope === "namespace") {
      router.push(
        `/resolve/${encodeURIComponent(props.namespaceId)}/${encodeURIComponent(trimmedPid)}/go`
      );
      return;
    }

    const pathname = new URL(props.baseUri).pathname;
    router.push(`${pathname}${encodeURIComponent(trimmedPid)}/go`);
  }

  return (
    <div className="card">
      <h2 className="card-title">Resolve</h2>
      <p className="card-hint">{contextHint}</p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="Enter PID"
          value={pid}
          autoComplete="off"
          onChange={(e) => {
            setPid(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              showDetails();
            }
          }}
          className="field-input"
        />
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={showDetails} className="btn-primary">
          Show Details
        </button>
        <button type="button" onClick={redirect} className="btn-secondary">
          Open URL
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}
    </div>
  );
}
