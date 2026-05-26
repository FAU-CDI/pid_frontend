"use client";

import { useState } from "react";

export default function PidForm() {
  const [pid, setPid] = useState("");
  const [pidData, setPidData] = useState<any>(null);
  const [error, setError] = useState("");

  async function fetchPidData() {
    const response = await fetch(
      `/api/pid/${encodeURIComponent(pid)}`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error);
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

    } catch (error: any) {
      setError(error.message);
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

    } catch (error: any) {
      setError(error.message);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-3xl font-bold">
        QuickPID Resolver
      </h1>

      <input
        type="text"
        placeholder="Enter PID"
        value={pid}
        autoComplete="off"
        onChange={(e) => setPid(e.target.value)}
        className="border p-2 rounded w-80"
      />

      <div className="flex gap-4">
        <button
          onClick={showMetadata}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Show Metadata
        </button>

        <button
          onClick={resolvePid}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Resolve PID
        </button>
      </div>

      {error && (
        <div className="text-red-500 font-medium">
          {error}
        </div>
      )}

      {pidData && (
        <div className="border rounded p-4 w-full max-w-2xl space-y-3">

          <div>
            <span className="font-bold">PID:</span>{" "}
            {pidData.pid}
          </div>

          <div>
            <span className="font-bold">Tag:</span>{" "}
            {pidData.tag}
          </div>

          <div>
            <span className="font-bold">Date Created:</span>{" "}
            {new Date(pidData.date_created).toLocaleString()}
          </div>

          <div>
            <span className="font-bold">Date Updated:</span>{" "}
            {new Date(pidData.date_updated).toLocaleString()}
          </div>

          <div>
            <span className="font-bold">URL:</span>{" "}
            <a
              href={pidData.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              {pidData.url}
            </a>
          </div>

          <pre>
            <span className="font-bold">Metadata:</span>{" "}
            {pidData.metadata}
          </pre>

        </div>
      )}
    </main>
  );
}