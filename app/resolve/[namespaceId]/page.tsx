import PidForm from "../../components/pid-form";

const backendUrl = process.env.BACKEND_URL;

export default async function NamespacePage({
  params,
}: {
  params: Promise<{
    namespaceId: string;
  }>;
}) {
  const { namespaceId } = await params;

  if (!backendUrl) {
    throw new Error("Missing BACKEND_URL");
  }

  if (!namespaceId.trim()) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600">
            Invalid Namespace
          </h1>

          <p className="mt-4 text-gray-600">
            No namespace ID was provided.
          </p>
        </div>
      </main>
    );
  }

  const targetUrl =
    `${backendUrl}/resolver/namespaces/` +
    `${encodeURIComponent(namespaceId)}`;

  console.log(
    "Checking namespace:",
    targetUrl
  );

  try {
    const response = await fetch(targetUrl, {
      cache: "no-store",
    });

    console.log(
      "Namespace lookup response:",
      response.status,
      response.statusText
    );

    if (response.status === 404) {
      return (
        <main className="flex min-h-screen items-center justify-center p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-red-600">
              Invalid Namespace
            </h1>

            <p className="mt-4 text-gray-600">
              The namespace{" "}
              <span className="font-mono">
                {namespaceId}
              </span>{" "}
              does not exist.
            </p>
          </div>
        </main>
      );
    }

    if (!response.ok) {
      return (
        <main className="flex min-h-screen items-center justify-center p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-red-600">
              Backend Error
            </h1>

            <p className="mt-4 text-gray-600">
              Unable to verify the namespace.
            </p>
          </div>
        </main>
      );
    }

    const namespace = await response.json();

    console.log(
      "Namespace found:",
      namespace
    );

    return (
      <PidForm
        mode="namespace"
        namespaceId={namespaceId}
      />
    );
  } catch (error) {
    console.error(
      "Failed to check namespace:",
      error
    );

    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600">
            Backend Unavailable
          </h1>

          <p className="mt-4 text-gray-600">
            Unable to verify the namespace.
          </p>
        </div>
      </main>
    );
  }
}