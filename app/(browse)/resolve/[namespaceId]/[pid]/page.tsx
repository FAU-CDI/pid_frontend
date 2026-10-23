import PidInfoCard from "@/app/components/pid-info-card";
import GlobalResolveForm from "@/app/components/global-resolve-form";
import ResolvePanel from "@/app/components/resolve-panel";
import ResolverPage, { homeBreadcrumb } from "@/app/components/resolver-page";
import StatusInfoCard from "@/app/components/status-info-card";
import {
  getBackendClient,
  isBackendError,
  type Resource,
} from "@/lib/backend/client";
import { browseErrorAction, browseNotFoundKind } from "@/lib/browse-result";
import { namespaceMissing } from "@/lib/user-facing";

function toPidInfoData(result: Resource, namespaceId: string) {
  return {
    pid: result.pid,
    scope: namespaceId,
    absolute: `resolve/${namespaceId}/${result.pid}`,
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

  const namespaceHref = `/resolve/${encodeURIComponent(namespaceId)}`;

  const result = await getBackendClient().getResourceByNamespace(
    namespaceId,
    pid
  );

  if (isBackendError(result)) {
    if (browseErrorAction(result) === "not-found") {
      if (browseNotFoundKind(result) === "scope-missing") {
        return (
          <ResolverPage
            breadcrumbs={[homeBreadcrumb(), { label: "Error" }]}
            resolve={
              <GlobalResolveForm
                defaultQuery={`resolve/${namespaceId}/${pid}`}
              />
            }
            info={
              <StatusInfoCard
                status={namespaceMissing.status}
                title={namespaceMissing.title}
                message={namespaceMissing.message}
              />
            }
          />
        );
      }

      return (
        <ResolverPage
          breadcrumbs={[
            homeBreadcrumb(),
            { href: namespaceHref, label: namespaceId },
            { label: "Error" },
          ]}
          resolve={
            <ResolvePanel
              key={`${namespaceId}/${pid}`}
              mode="scoped"
              scope="namespace"
              namespaceId={namespaceId}
              initialPid={pid}
            />
          }
          info={<PidInfoCard status="not-found" />}
        />
      );
    }
    throw new Error(result.error);
  }

  return (
    <ResolverPage
      breadcrumbs={[
        homeBreadcrumb(),
        { href: namespaceHref, label: namespaceId },
        { label: pid },
      ]}
      resolve={
        <ResolvePanel
          key={`${namespaceId}/${pid}`}
          mode="scoped"
          scope="namespace"
          namespaceId={namespaceId}
          initialPid={pid}
        />
      }
      info={
        <PidInfoCard
          status="found"
          data={toPidInfoData(result, namespaceId)}
        />
      }
    />
  );
}
