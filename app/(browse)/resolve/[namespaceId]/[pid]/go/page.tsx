import { redirect } from "next/navigation";
import GlobalResolveForm from "@/app/components/global-resolve-form";
import PidInfoCard from "@/app/components/pid-info-card";
import ResolvePanel from "@/app/components/resolve-panel";
import ResolverPage, { homeBreadcrumb } from "@/app/components/resolver-page";
import StatusInfoCard from "@/app/components/status-info-card";
import {
  getBackendClient,
  isBackendError,
} from "@/lib/backend/client";
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
  const namespaceHref = `/resolve/${encodeURIComponent(namespaceId)}`;
  const detailsHref = `${namespaceHref}/${encodeURIComponent(pid)}`;

  if (!namespaceId.trim() || !pid.trim()) {
    return (
      <ResolverPage
        breadcrumbs={[homeBreadcrumb(), { label: "Error" }]}
        resolve={<GlobalResolveForm />}
        info={
          <StatusInfoCard
            status={pidNotFound.status}
            title={pidNotFound.title}
            message={pidNotFound.message}
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
    homeBreadcrumb(),
    { href: namespaceHref, label: namespaceId },
    { href: detailsHref, label: pid },
    { label: "URL" },
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
          title={pidHasNoUrl.title}
          message={pidHasNoUrl.message}
        />
      }
    />
  );
}
