import NamespaceInfoCard from "@/app/components/namespace-info-card";
import ResolvePanel from "@/app/components/resolve-panel";
import ResolverPage, { homeBreadcrumb } from "@/app/components/resolver-page";
import StatusInfoCard from "@/app/components/status-info-card";
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
      <ResolverPage
        breadcrumbs={[homeBreadcrumb(), { label: "Invalid" }]}
        resolve={<ResolvePanel mode="global" />}
        info={
          <StatusInfoCard
            status={400}
            title="Invalid Namespace"
            message="No namespace ID was provided."
          />
        }
      />
    );
  }

  const result = await getBackendClient().getNamespace(namespaceId);

  if (isBackendError(result)) {
    if (result.status === 500) {
      throw new Error("Missing BACKEND_URL");
    }

    if (result.status === 404) {
      return (
        <ResolverPage
          breadcrumbs={[
            homeBreadcrumb(),
            { label: namespaceId },
          ]}
          resolve={<ResolvePanel mode="global" />}
          info={
            <StatusInfoCard
              status={404}
              title="Invalid Namespace"
              message={`The namespace ${namespaceId} does not exist.`}
            />
          }
        />
      );
    }

    const title =
      result.error === "Backend unavailable"
        ? "Backend Unavailable"
        : "Backend Error";
    const message =
      result.error === "Backend unavailable"
        ? "Unable to verify the namespace."
        : "Unable to verify the namespace.";

    return (
      <ResolverPage
        breadcrumbs={[homeBreadcrumb(), { label: "Error" }]}
        resolve={<ResolvePanel mode="global" />}
        info={
          <StatusInfoCard
            status={result.status === 502 ? 502 : result.status}
            title={title}
            message={message}
          />
        }
      />
    );
  }

  return (
    <ResolverPage
      breadcrumbs={[
        homeBreadcrumb(),
        { label: namespaceId },
      ]}
      resolve={
        <ResolvePanel
          key={namespaceId}
          mode="scoped"
          scope="namespace"
          namespaceId={namespaceId}
        />
      }
      info={<NamespaceInfoCard namespace={result} />}
    />
  );
}
