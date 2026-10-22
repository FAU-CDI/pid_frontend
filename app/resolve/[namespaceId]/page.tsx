import PidForm from "../../components/pid-form";
import ErrorPage from "../../components/error-page";
import {
  getBackendClient,
  isBackendError,
} from "@/lib/backend/client";

export default async function NamespacePage({
  params,
}: {
  params: Promise<{
    namespaceId: string;
  }>;
}) {
  const { namespaceId } = await params;

  if (!namespaceId.trim()) {
    return (
      <ErrorPage
        status={400}
        title="Invalid Namespace"
        message="No namespace ID was provided."
      />
    );
  }

  console.log("Checking namespace:", namespaceId);

  const result = await getBackendClient().getNamespace(namespaceId);

  if (isBackendError(result)) {
    if (result.status === 500) {
      throw new Error("Missing BACKEND_URL");
    }

    if (result.status === 404) {
      return (
        <ErrorPage
          status={404}
          title="Invalid Namespace"
          message={`The namespace ${namespaceId} does not exist.`}
        />
      );
    }

    if (result.error === "Backend unavailable") {
      return (
        <ErrorPage
          status={502}
          title="Backend Unavailable"
          message="Unable to verify the namespace."
        />
      );
    }

    return (
      <ErrorPage
        status={502}
        title="Backend Error"
        message="Unable to verify the namespace."
      />
    );
  }

  console.log("Namespace found:", result);

  return (
    <PidForm
      mode="namespace"
      namespaceId={namespaceId}
    />
  );
}
