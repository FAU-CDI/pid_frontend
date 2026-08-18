"use client";

import { useEffect, useState } from "react";

type PidData = {
  pid: string;
  url: string;
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
    }
  | {
      mode: "mount";
      baseUri: string;
      initialPid?: string;
    };

export default function PidForm(props: PidFormProps) {
  const [pid, setPid] = useState(props.initialPid ?? "");
  const [pidData, setPidData] = useState<PidData | null>(null);
  const [error, setError] = useState("");

  async function fetchPidData(pidToFetch: string) {
    let apiUrl: string;

    if (props.mode === "namespace") {
      apiUrl =
        `/api/pid/${encodeURIComponent(props.namespaceId)}` +
        `/${encodeURIComponent(pidToFetch)}`;
    } else {
      apiUrl =
        `/api/mount/${encodeURIComponent(props.baseUri)}` +
        `/${encodeURIComponent(pidToFetch)}`;
    }

    const response = await fetch(apiUrl);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Failed to fetch PID"
      );
    }

    return data;
}

  async function showMetadata() {
    const trimmedPid = pid.trim();

    if (!trimmedPid) {
      setError("Please enter a PID.");
      setPidData(null);
      return;
    }

    try {
      setError("");

      const data = await fetchPidData(trimmedPid);

      setPidData(data);

      if (props.mode === "namespace") {
        window.history.pushState(
          {},
          "",
          `/resolve/${encodeURIComponent(
            props.namespaceId
          )}/${encodeURIComponent(trimmedPid)}`
        );
      } else {
        const pathname = new URL(props.baseUri).pathname;

        window.history.pushState(
          {},
          "",
          `${pathname}${encodeURIComponent(trimmedPid)}`
        );
      }
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to fetch PID"
      );

      setPidData(null);
    }
  }


  useEffect(() => {
    if (!props.initialPid) {
      return;
    }

    async function loadPid() {
      try {
        setError("");
      
        const data = await fetchPidData(
          props.initialPid!
        );
      
        setPidData(data);
      } catch (error: unknown) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch PID"
        );
      
        setPidData(null);
      }
    }

    loadPid();
  }, [props.initialPid]);

  async function resolvePid() {
    const trimmedPid = pid.trim();

    if (!trimmedPid) {
      setError("Please enter a PID.");
      return;
    }

    if (props.mode === "namespace") {
      window.location.href =
        `/resolve/${encodeURIComponent(
          props.namespaceId
        )}/${encodeURIComponent(trimmedPid)}/go`;

      return;
    }

    const pathname = new URL(props.baseUri).pathname;

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
          onChange={(e) => setPid(e.target.value)}
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
              <span className="font-bold">PID:</span>{" "}
              {pidData.pid}
            </div>

            <div>
              <span className="font-bold">URL:</span>{" "}
              <a
                href={pidData.url}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-blue-600 underline"
              >
                {pidData.url}
              </a>
            </div>

            <div>
              <span className="font-bold">Metadata:</span>{" "}
              {pidData.metadata}
            </div>

            <div>
              <span className="font-bold">Date Created:</span>{" "}
              {new Date(pidData.dateCreated).toLocaleString()}
            </div>

            <div>
              <span className="font-bold">Date Updated:</span>{" "}
              {new Date(pidData.dateUpdated).toLocaleString()}
            </div>

            <div>
              <span className="font-bold">Tags:</span>{" "}
              {pidData.tags.length > 0
                ? pidData.tags.join(", ")
                : "None"}
            </div>

            <div>
              <span className="font-bold">Deleted:</span>{" "}
              {pidData.deleted ? "Yes" : "No"}
            </div>
          </div>
        )}
      </main>

      <footer className="w-full bg-blue-950 px-8 py-4 text-white">
        <div className="flex gap-6 text-sm">
          <a
            href="https://www.cdi.fau.de/impressum/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Impressum
          </a>

          <a
            href="https://www.cdi.fau.de/datenschutz/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Datenschutz
          </a>

          <a
            href="https://www.cdi.fau.de/barrierefreiheit"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Barrierefreiheit
          </a>
        </div>
      </footer>
    </div>
  );
}