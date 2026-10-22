import PidInfoCard from "@/app/components/pid-info-card";
import ResolvePanel from "@/app/components/resolve-panel";
import ResolverPage, { homeBreadcrumb } from "@/app/components/resolver-page";
import StatusInfoCard from "@/app/components/status-info-card";
import {
  getBackendClient,
  isBackendError,
  type Resource,
} from "@/lib/backend/client";

function toPidInfoData(result: Resource) {
  return {
    pid: result.pid,
    url: "url" in result ? result.url : null,
    metadata: "metadata" in result ? result.metadata : null,
    dateCreated: result.dateCreated,
    dateUpdated: result.dateUpdated,
    tags: "tags" in result ? result.tags : [],
    deleted: result.deleted,
  };
}

export default async function NamespacePidPage({
  params,
}: {
  params: Promise<{
    namespaceId: string;
    pid: string;
  }>;
}) {
  const { namespaceId, pid } = await params;

  const crumbs = [
    homeBreadcrumb(),
    {
      href: `/resolve/${encodeURIComponent(namespaceId)}`,
      label: namespaceId,
    },
    { label: pid },
  ] as const;

  const resolvePanel = (
    <ResolvePanel
      key={`${namespaceId}/${pid}`}
      mode="scoped"
      scope="namespace"
      namespaceId={namespaceId}
      initialPid={pid}
    />
  );

  const result = await getBackendClient().getResourceByNamespace(
    namespaceId,
    pid
  );

  if (isBackendError(result)) {
    if (result.status === 500) {
      return (
        <ResolverPage
          breadcrumbs={[homeBreadcrumb(), { label: "Error" }]}
          resolve={<ResolvePanel mode="global" />}
          info={
            <StatusInfoCard
              status={500}
              title="Server Configuration Error"
              message="The server is not configured correctly."
            />
          }
        />
      );
    }

    if (result.status === 404) {
      return (
        <ResolverPage
          breadcrumbs={[...crumbs]}
          resolve={resolvePanel}
          info={
            <PidInfoCard
              status="not-found"
              pid={pid}
              message="The requested PID does not exist in this namespace."
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
        ? "The backend could not be reached."
        : "The backend returned an error.";

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
      breadcrumbs={[...crumbs]}
      resolve={resolvePanel}
      info={<PidInfoCard status="found" data={toPidInfoData(result)} />}
    />
  );
}
