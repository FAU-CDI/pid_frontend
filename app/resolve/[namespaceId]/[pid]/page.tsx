import PidForm from "../../../components/pid-form";
import ErrorPage from "../../../components/error-page";
import {
  getBackendClient,
  isBackendError,
} from "@/lib/backend/client";

export default async function NamespacePidPage({
  params,
}: {
  params: Promise<{
    namespaceId: string;
    pid: string;
  }>;
}) {
  const { namespaceId, pid } = await params;

  console.log("Server-side namespace PID request:", namespaceId, pid);

  const result = await getBackendClient().getResourceByNamespace(
    namespaceId,
    pid
  );

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
          message="The requested PID does not exist in this namespace."
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
      mode="namespace"
      namespaceId={namespaceId}
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
