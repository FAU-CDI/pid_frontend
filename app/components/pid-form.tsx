"use client";

import { useState } from "react";

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
    }
  | {
      mode: "mount";
      baseUri: string;
    };

export default function PidForm(props: PidFormProps) {
  const [pid, setPid] = useState("");
  const [pidData, setPidData] = useState<PidData | null>(null);
  const [error, setError] = useState("");

  async function fetchPidData() {
    let apiUrl: string;

    if (props.mode === "namespace") {
      apiUrl =
        `/api/pid/${encodeURIComponent(props.namespaceId)}` +
        `/${encodeURIComponent(pid.trim())}`;
    } else {
      apiUrl =
        `/api/mount/${encodeURIComponent(props.baseUri)}` +
        `/${encodeURIComponent(pid.trim())}`;
    }

    console.log("Frontend API URL:", apiUrl);

    const response = await fetch(apiUrl);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch PID");
    }

    return data;
  }

  async function showMetadata() {
    if (!pid.trim()) {
      setError("Please enter a PID.");
      setPidData(null);
      return;
    }

    try {
      setError("");

      const data = await fetchPidData();

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

  async function resolvePid() {
    if (!pid.trim()) {
      setError("Please enter a PID.");
      return;
    }

    try {
      setError("");

      const data = await fetchPidData();

      if (!data.url) {
        setError("No URL found.");
        return;
      }

      window.location.href = data.url;
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to resolve PID"
      );
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
        <h1 className="text-3xl font-bold">
          QuickPID Resolver
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