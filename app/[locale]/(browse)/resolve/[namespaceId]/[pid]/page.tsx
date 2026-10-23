import { getTranslations } from "next-intl/server";
import PidInfoCard from "@/app/components/pid-info-card";
import GlobalResolveForm from "@/app/components/global-resolve-form";
import { BackendCode } from "@/app/components/lang";
import ResolvePanel from "@/app/components/resolve-panel";
import ResolverPage from "@/app/components/resolver-page";
import StatusInfoCard from "@/app/components/status-info-card";
import {
  getBackendClient,
  isBackendError,
  type Resource,
} from "@/lib/backend/client";
import { errorBreadcrumb, homeBreadcrumb } from "@/lib/breadcrumbs";
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
  const t = await getTranslations("errors");
  const home = await homeBreadcrumb();
  const errorCrumb = await errorBreadcrumb();

  const namespaceHref = `/resolve/${encodeURIComponent(namespaceId)}`;
  const nsLabel = <BackendCode>{namespaceId}</BackendCode>;
  const pidLabel = <BackendCode>{pid}</BackendCode>;

  const result = await getBackendClient().getResourceByNamespace(
    namespaceId,
    pid
  );

  if (isBackendError(result)) {
    if (browseErrorAction(result) === "not-found") {
      if (browseNotFoundKind(result) === "scope-missing") {
        return (
          <ResolverPage
            breadcrumbs={[home, errorCrumb]}
            resolve={
              <GlobalResolveForm
                defaultQuery={`resolve/${namespaceId}/${pid}`}
              />
            }
            info={
              <StatusInfoCard
                status={namespaceMissing.status}
                title={t("namespaceMissing.title")}
                message={t("namespaceMissing.message")}
              />
            }
          />
        );
      }

      return (
        <ResolverPage
          breadcrumbs={[
            home,
            { href: namespaceHref, label: nsLabel },
            errorCrumb,
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
        home,
        { href: namespaceHref, label: nsLabel },
        { label: pidLabel },
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
