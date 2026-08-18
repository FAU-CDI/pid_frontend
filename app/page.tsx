export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col items-center justify-center p-8">
        <div className="w-full max-w-3xl space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold">
              PID Resolver
            </h1>

            <p className="mt-3 text-gray-600">
              Resolve and explore persistent identifiers.
            </p>
          </div>

          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold">
              About PID Resolver
            </h2>

            <p className="mt-3 text-gray-600">
              This service allows users to resolve PIDs and
              retrieve information about the resources they
              identify.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-5">
              <h3 className="font-semibold">
                PID
              </h3>

              <p className="mt-2 text-sm text-gray-600">
                Persistent identifier for a resource.
              </p>
            </div>

            <div className="rounded-lg border p-5">
              <h3 className="font-semibold">
                Metadata
              </h3>

              <p className="mt-2 text-sm text-gray-600">
                View metadata associated with a PID.
              </p>
            </div>

            <div className="rounded-lg border p-5">
              <h3 className="font-semibold">
                Resolution
              </h3>

              <p className="mt-2 text-sm text-gray-600">
                Resolve a PID to its associated resource.
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 p-5">
            <h2 className="font-semibold">
              Example
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              A PID such as{" "}
              <code className="rounded bg-gray-200 px-1 py-0.5">
                kqz-d5j
              </code>{" "}
              can be resolved to its corresponding resource.
            </p>
          </div>
        </div>
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