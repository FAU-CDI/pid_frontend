"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

function mountPathPrefix(baseUri: string): string {
  try {
    const path = new URL(baseUri).pathname.replace(/^\/+|\/+$/g, "");
    return path ? `${path}/` : "";
  } catch {
    return "";
  }
}
