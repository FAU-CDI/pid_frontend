import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import GlobalResolveForm from "@/app/components/global-resolve-form";
import { BackendCode } from "@/app/components/lang";
import PidInfoCard from "@/app/components/pid-info-card";
import ResolvePanel from "@/app/components/resolve-panel";
import ResolverPage from "@/app/components/resolver-page";
import StatusInfoCard from "@/app/components/status-info-card";
import {
  getBackendClient,
  isBackendError,
} from "@/lib/backend/client";
import {
  errorBreadcrumb,
  homeBreadcrumb,
  urlBreadcrumb,
} from "@/lib/breadcrumbs";
import {
  browseErrorAction,
  browseNotFoundKind,
  openUrlAction,
} from "@/lib/browse-result";
import {
  namespaceMissing,
  pidHasNoUrl,
  pidNotFound,
} from "@/lib/user-facing";

export default async function NamespacePidGoPage({
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
  const urlCrumb = await urlBreadcrumb();
  const namespaceHref = `/resolve/${encodeURIComponent(namespaceId)}`;
  const detailsHref = `${namespaceHref}/${encodeURIComponent(pid)}`;
  const nsLabel = <BackendCode>{namespaceId}</BackendCode>;
  const pidLabel = <BackendCode>{pid}</BackendCode>;

  if (!namespaceId.trim() || !pid.trim()) {
    return (
      <ResolverPage
        breadcrumbs={[home, errorCrumb]}
        resolve={<GlobalResolveForm />}
        info={
          <StatusInfoCard
            status={pidNotFound.status}
            title={t("pidNotFound.title")}
            message={t("pidNotFound.message")}
          />
        }
      />
    );
  }

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
              key={`${namespaceId}/${pid}/go`}
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

  const crumbs = [
    home,
    { href: namespaceHref, label: nsLabel },
    { href: detailsHref, label: pidLabel },
    urlCrumb,
  ] as const;

  const resolvePanel = (
    <ResolvePanel
      key={`${namespaceId}/${pid}/go`}
      mode="scoped"
      scope="namespace"
      namespaceId={namespaceId}
      initialPid={pid}
    />
  );

  const action = openUrlAction(result);
  if (action.kind === "redirect") {
    redirect(action.url);
  }

  return (
    <ResolverPage
      breadcrumbs={[...crumbs]}
      resolve={resolvePanel}
      info={
        <StatusInfoCard
          status={pidHasNoUrl.status}
          title={t("pidHasNoUrl.title")}
          message={t("pidHasNoUrl.message")}
        />
      }
    />
  );
}
