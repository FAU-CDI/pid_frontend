import { headers } from "next/headers";
import PidForm from "../components/pid-form";

const backendUrl = process.env.BACKEND_URL;

export default async function MountPage({
  params,
}: {
  params: Promise<{
    mount: string;
  }>;
}) {
  const { mount } = await params;

  if (!backendUrl) {
    throw new Error("Missing BACKEND_URL");
  }

  const headersList = await headers();

  const protocol =
    headersList.get("x-forwarded-proto") || "http";

  const host = headersList.get("host");

  if (!host) {
    throw new Error("Unable to determine host");
  }

  const baseUri =
    `${protocol}://${host}/${mount}/`;

  console.log("Checking mount:", baseUri);

  const targetUrl =
    `${backendUrl}/resolver/mounts/` +
    `${encodeURIComponent(baseUri)}`;

  console.log(
    "Checking Go mount endpoint:",
    targetUrl
  );

  try {
    const response = await fetch(targetUrl, {
      cache: "no-store",
    });

    console.log(
      "Mount lookup response:",
      response.status,
      response.statusText
    );

    if (response.status === 404) {
      return (
        <main className="flex min-h-screen items-center justify-center p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-red-600">
              Invalid Base URI
            </h1>

            <p className="mt-4 text-gray-600">
              The base URI{" "}
              <span className="font-mono">
                {baseUri}
              </span>{" "}
              is not registered.
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
              Unable to verify the base URI.
            </p>
          </div>
        </main>
      );
    }

    const data = await response.json();

    console.log("Mount found:", data);

    return (
      <PidForm
        mode="mount"
        baseUri={baseUri}
      />
    );
  } catch (error) {
    console.error(
      "Failed to check mount:",
      error
    );

    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600">
            Backend Unavailable
          </h1>

          <p className="mt-4 text-gray-600">
            Unable to verify the base URI.
          </p>
        </div>
      </main>
    );
  }
}