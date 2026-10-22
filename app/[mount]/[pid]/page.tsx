import { headers } from "next/headers";
import PidForm from "../../components/pid-form";
import ErrorPage from "../../components/error-page";
import {
  getBackendClient,
  isBackendError,
} from "@/lib/backend/client";

export default async function MountPidPage({
  params,
}: {
  params: Promise<{
    mount: string;
    pid: string;
  }>;
}) {
  const { mount, pid } = await params;

  const headersList = await headers();

  const protocol =
    headersList.get("x-forwarded-proto") || "http";

  const host = headersList.get("host");

  if (!host) {
    return (
      <ErrorPage
        status={500}
        title="Server Error"
        message="Unable to determine the request host."
      />
    );
  }

  const client = getBackendClient();
  const baseUri = client.resolveMountUri(mount, `${protocol}://${host}`);

  console.log("Server-side mount PID request:", baseUri, pid);

  const result = await client.getResourceByMount(baseUri, pid);

  if (isBackendError(result)) {
    if (result.status === 500) {
      return (
        <ErrorPage
          status={500}
          title="Server Configuration Error"
          message="The server is not configured correctly."
        />
      );
    }

    if (result.status === 404) {
      return (
        <ErrorPage
          status={404}
          title="PID Not Found"
          message="The requested PID does not exist in this mount."
        />
      );
    }

    if (result.error === "Backend unavailable") {
      return (
        <ErrorPage
          status={502}
          title="Backend Unavailable"
          message="The backend could not be reached."
        />
      );
    }

    return (
      <ErrorPage
        status={502}
        title="Backend Error"
        message="The backend returned an error."
      />
    );
  }

  return (
    <PidForm
      mode="mount"
      baseUri={baseUri}
      initialPid={pid}
      initialData={{
        pid: result.pid,
        url: "url" in result ? result.url : null,
        metadata: "metadata" in result ? result.metadata : null,
        dateCreated: result.dateCreated,
        dateUpdated: result.dateUpdated,
        tags: "tags" in result ? result.tags : [],
        deleted: result.deleted,
      }}
    />
  );
}
