import { headers } from "next/headers";
import PidForm from "../components/pid-form";
import ErrorPage from "../components/error-page";
import {
  getBackendClient,
  isBackendError,
} from "@/lib/backend/client";

export default async function MountPage({
  params,
}: {
  params: Promise<{
    mount: string;
  }>;
}) {
  const { mount } = await params;

  const headersList = await headers();

  const protocol =
    headersList.get("x-forwarded-proto") || "http";

  const host = headersList.get("host");

  if (!host) {
    throw new Error("Unable to determine host");
  }

  const client = getBackendClient();
  const baseUri = client.resolveMountUri(mount, `${protocol}://${host}`);

  console.log("Checking mount:", baseUri);

  const result = await client.getMount(baseUri);

  if (isBackendError(result)) {
    if (result.status === 500) {
      throw new Error("Missing BACKEND_URL");
    }

    if (result.status === 404) {
      return (
        <ErrorPage
          status={404}
          title="Invalid Base URI"
          message={`The base URI ${baseUri} is not registered.`}
        />
      );
    }

    if (result.status === 502 && result.error === "Backend unavailable") {
      return (
        <ErrorPage
          status={502}
          title="Backend Unavailable"
          message="Unable to verify the base URI."
        />
      );
    }

    return (
      <ErrorPage
        status={502}
        title="Backend Error"
        message="Unable to verify the base URI."
      />
    );
  }

  console.log("Mount found:", result);

  return (
    <PidForm
      mode="mount"
      baseUri={baseUri}
    />
  );
}
