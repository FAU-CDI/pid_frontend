"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  const [pidPath, setPidPath] = useState("");
  const [error, setError] = useState("");

  async function resolvePid() {
    const value = pidPath.trim();

    if (!value) {
      setError("Please enter a base URI and PID.");
      return;
    }

    /*
     * Expected format:
     *
     * base/kqz-d5j
     *
     * First part = mount/base
     * Second part = PID
     */

    const parts = value.split("/").filter(Boolean);

    if (parts.length !== 2) {
      setError(
        "Please enter a base URI and PID, for example: base/kqz-d5j"
      );
      return;
    }

    const [base, pid] = parts;

    try {
      setError("");

      /*
       * Check that the PID exists before navigating.
       *
       * This uses the same API that the mount PID page uses.
       *
       * We need the full base URI because the Go API resolves
       * mounts using the absolute URI.
       */

      const protocol = window.location.protocol;
      const host = window.location.host;

      const baseUri = `${protocol}//${host}/${base}/`;

      const apiUrl =
        `/api/mount/${encodeURIComponent(baseUri)}` +
        `/${encodeURIComponent(pid)}`;

      const response = await fetch(apiUrl);

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          setError("PID does not exist.");
        } else {
          setError(data.error || "Unable to resolve PID.");
        }

        return;
      }

      /*
       * PID exists.
       *
       * Navigate to the PID details URL.
       */
      router.push(
        `/${encodeURIComponent(base)}/${encodeURIComponent(pid)}`
      );
    } catch (error) {
      console.error("PID resolution failed:", error);

      setError("Unable to resolve PID.");
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <main className="flex flex-1 flex-col items-center p-8">
        <div className="w-full max-w-3xl space-y-8">
          {/* Title */}
          <div className="pt-12 text-center">
            <h1 className="text-4xl font-bold">
              PID Resolver
            </h1>

            <p className="mt-3 text-gray-600 dark:text-gray-400">
              Resolve and explore persistent identifiers.
            </p>
          </div>

          {/* Resolve PID */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-2xl font-semibold">
              Resolve PID
            </h2>

            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Enter a base URI and PID to resolve the resource.
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
                className="flex-1 rounded border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:placeholder:text-gray-500"
              />

              <button
                onClick={resolvePid}
                className="rounded bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
              >
                Resolve
              </button>
            </div>

            {error && (
              <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 font-medium text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
                {error}
              </div>
            )}
          </div>

          {/* About */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-2xl font-semibold">
              About PID Resolver
            </h2>

            <p className="mt-3 text-gray-600 dark:text-gray-400">
              This service allows users to resolve PIDs and
              retrieve information about the resources they
              identify.
            </p>
          </div>

          {/* Features */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <h3 className="font-semibold">
                PID
              </h3>

              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Persistent identifier for a resource.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <h3 className="font-semibold">
                Metadata
              </h3>

              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                View metadata associated with a PID.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <h3 className="font-semibold">
                Resolution
              </h3>

              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Resolve a PID to its associated resource.
              </p>
            </div>
          </div>

          {/* Documentation */}
          <a
            href="https://github.com/tkw1536/quickpid/tree/main/spec"
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-lg border border-gray-200 bg-gray-100 p-6 transition hover:bg-gray-200 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">
                  Documentation
                </h2>

                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Read the documentation and learn more about
                  the PID Resolver.
                </p>
              </div>

              <span className="text-xl">
                →
              </span>
            </div>
          </a>
        </div>
      </main>
    </div>
  );
}