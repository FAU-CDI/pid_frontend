"use client";

import { useState } from "react";

type PidData = {
  pid: string;
  url: string | null;
  metadata: string;
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
  const [pid, setPid] = useState(
    props.initialPid ?? ""
  );

  const [pidData, setPidData] =
    useState<PidData | null>(
      props.initialData ?? null
    );

  const [error, setError] = useState("");

  function showMetadata() {
    const trimmedPid = pid.trim();

    if (!trimmedPid) {
      setError("Please enter a PID.");
      setPidData(null);
      return;
    }

    setError("");

    if (props.mode === "namespace") {
      window.location.href =
        `/resolve/${encodeURIComponent(
          props.namespaceId
        )}/${encodeURIComponent(trimmedPid)}`;

      return;
    }

    const pathname = new URL(
      props.baseUri
    ).pathname;

    window.location.href =
      `${pathname}${encodeURIComponent(trimmedPid)}`;
  }

  function resolvePid() {
    const trimmedPid = pid.trim();

    if (!trimmedPid) {
      setError("Please enter a PID.");
      return;
    }

    setError("");

    if (props.mode === "namespace") {
      window.location.href =
        `/resolve/${encodeURIComponent(
          props.namespaceId
        )}/${encodeURIComponent(trimmedPid)}/go`;

      return;
    }

    const pathname = new URL(
      props.baseUri
    ).pathname;

    window.location.href =
      `${pathname}${encodeURIComponent(trimmedPid)}/go`;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
        <h1 className="text-3xl font-bold">
          PID Resolver
        </h1>

        <div className="text-sm text-gray-600">
          {props.mode === "namespace"
            ? `Namespace: ${props.namespaceId}`
            : `Mount: ${props.baseUri}`}
        </div>

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
          className="w-80 rounded border p-2"
        />

        <div className="flex gap-4">
          <button
            onClick={showMetadata}
            className="rounded bg-blue-500 px-4 py-2 text-white"
          >
            Show Details
          </button>

          <button
            onClick={resolvePid}
            className="rounded bg-green-500 px-4 py-2 text-white"
          >
            Redirect
          </button>
        </div>

        {error && (
          <div className="font-medium text-red-500">
            {error}
          </div>
        )}

        {pidData && (
          <div className="w-full max-w-2xl space-y-4 rounded border p-6">
            <h2 className="text-xl font-bold">
              PID Details
            </h2>

            <div>
              <span className="font-bold">
                PID:
              </span>{" "}
              {pidData.pid}
            </div>

            <div>
              <span className="font-bold">
                URL:
              </span>{" "}

              {pidData.url ? (
                <a
                  href={pidData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-blue-600 underline"
                >
                  {pidData.url}
                </a>
              ) : (
                "Not available"
              )}
            </div>

            <div>
              <span className="font-bold">
                Metadata:
              </span>{" "}
              {pidData.metadata}
            </div>

            <div>
              <span className="font-bold">
                Date Created:
              </span>{" "}
              {new Date(
                pidData.dateCreated
              ).toLocaleString()}
            </div>

            <div>
              <span className="font-bold">
                Date Updated:
              </span>{" "}
              {new Date(
                pidData.dateUpdated
              ).toLocaleString()}
            </div>

            <div>
              <span className="font-bold">
                Tags:
              </span>{" "}
              {pidData.tags?.length > 0
                ? pidData.tags.join(", ")
                : "None"}
            </div>

            <div>
              <span className="font-bold">
                Deleted:
              </span>{" "}
              {pidData.deleted ? "Yes" : "No"}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}