import { redirect } from "next/navigation";
import GlobalResolveForm from "@/app/components/global-resolve-form";
import ResolvePanel from "@/app/components/resolve-panel";
import ResolverPage, { homeBreadcrumb } from "@/app/components/resolver-page";
import StatusInfoCard from "@/app/components/status-info-card";
import {
  getBackendClient,
  isBackendError,
} from "@/lib/backend/client";
import {
  pidHasNoUrl,
  pidNotFound,
  serviceNotAvailable,
  serviceStatusCopy,
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

  const crumbs = [
    homeBreadcrumb(),
    { href: namespaceHref, label: namespaceId },
    { href: detailsHref, label: pid },
    { label: "URL" },
  ] as const;

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

  const resolvePanel = (
    <ResolvePanel
      key={`${namespaceId}/${pid}/go`}
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
          breadcrumbs={[...crumbs]}
          resolve={resolvePanel}
          info={
            <StatusInfoCard
              status={500}
              title={serviceNotAvailable.title}
              message={serviceNotAvailable.message}
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
            <StatusInfoCard
              status={pidNotFound.status}
              title={pidNotFound.title}
              message={pidNotFound.message}
            />
          }
        />
      );
    }

    const copy = serviceStatusCopy(result.error === "Backend unavailable");
    return (
      <ResolverPage
        breadcrumbs={[...crumbs]}
        resolve={resolvePanel}
        info={
          <StatusInfoCard
            status={result.status === 502 ? 502 : result.status}
            title={copy.title}
            message={copy.message}
          />
        }
      />
    );
  }

  if (!("url" in result) || !result.url) {
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

  redirect(result.url);
}
