"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type PidData = {
  pid: string;
  url: string | null;
  metadata: string | null;
  dateCreated: string;
  dateUpdated: string;
  tags: string[];
  deleted: boolean;
};

type PidFormProps =
  | {
      mode: "namespace";
      namespaceId: string;
      initialPid?: string;
      initialData?: PidData | null;
    }
  | {
      mode: "mount";
      baseUri: string;
      initialPid?: string;
      initialData?: PidData | null;
    };

export default function PidForm(props: PidFormProps) {
  const router = useRouter();

  const [pid, setPid] = useState(props.initialPid ?? "");

  const [pidData, setPidData] = useState<PidData | null>(
    props.initialData ?? null
  );

  const [error, setError] = useState("");

  const contextLabel =
    props.mode === "namespace"
      ? `Namespace: ${props.namespaceId}`
      : `Mount: ${props.baseUri}`;

  function showMetadata() {
    const trimmedPid = pid.trim();

    if (!trimmedPid) {
      setError("Please enter a PID.");
      setPidData(null);
      return;
    }

    setError("");

    if (props.mode === "namespace") {
      router.push(
        `/resolve/${encodeURIComponent(
          props.namespaceId
        )}/${encodeURIComponent(trimmedPid)}`
      );
      return;
    }

    const pathname = new URL(props.baseUri).pathname;
    router.push(`${pathname}${encodeURIComponent(trimmedPid)}`);
  }

  function resolvePid() {
    const trimmedPid = pid.trim();

    if (!trimmedPid) {
      setError("Please enter a PID.");
      return;
    }

    setError("");

    if (props.mode === "namespace") {
      router.push(
        `/resolve/${encodeURIComponent(
          props.namespaceId
        )}/${encodeURIComponent(trimmedPid)}/go`
      );
      return;
    }

    const pathname = new URL(props.baseUri).pathname;
    router.push(`${pathname}${encodeURIComponent(trimmedPid)}/go`);
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
            <p className="page-context">{contextLabel}</p>
          </div>

          <div className="card">
            <h2 className="card-title">Look up PID</h2>
            <p className="card-hint">
              Enter a PID to view details or redirect to its resource.
            </p>

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
                    showMetadata();
                  }
                }}
                className="field-input"
              />
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button onClick={showMetadata} className="btn-primary">
                Show Details
              </button>
              <button onClick={resolvePid} className="btn-secondary">
                Redirect
              </button>
            </div>

            {error && <div className="alert-error">{error}</div>}
          </div>

          {pidData && (
            <div className="card space-y-4">
              <h2 className="card-title">PID Details</h2>

              <div className="detail-row">
                <span className="detail-label">PID:</span> {pidData.pid}
              </div>

              <div className="detail-row">
                <span className="detail-label">URL:</span>{" "}
                {pidData.url ? (
                  <a
                    href={pidData.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="detail-link"
                  >
                    {pidData.url}
                  </a>
                ) : (
                  "Not available"
                )}
              </div>

              <div className="detail-row">
                <span className="detail-label">Metadata:</span>{" "}
                {pidData.metadata ?? "Not available"}
              </div>

              <div className="detail-row">
                <span className="detail-label">Date Created:</span>{" "}
                {new Date(pidData.dateCreated).toLocaleString()}
              </div>

              <div className="detail-row">
                <span className="detail-label">Date Updated:</span>{" "}
                {new Date(pidData.dateUpdated).toLocaleString()}
              </div>

              <div className="detail-row">
                <span className="detail-label">Tags:</span>{" "}
                {pidData.tags?.length > 0 ? pidData.tags.join(", ") : "None"}
              </div>

              <div className="detail-row">
                <span className="detail-label">Deleted:</span>{" "}
                {pidData.deleted ? "Yes" : "No"}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
