import { headers } from "next/headers";
import { redirect } from "next/navigation";
import ResolvePanel from "@/app/components/resolve-panel";
import ResolverPage, { homeBreadcrumb } from "@/app/components/resolver-page";
import StatusInfoCard from "@/app/components/status-info-card";
import {
  getBackendClient,
  isBackendError,
} from "@/lib/backend/client";
import { encodeMountPath } from "@/lib/resolve-href";
import {
  pidHasNoUrl,
  pidNotFound,
  serviceNotAvailable,
  serviceStatusCopy,
} from "@/lib/user-facing";

export default async function MountPidGoPage({
  params,
}: {
  params: Promise<{
    mount: string;
    pid: string;
  }>;
}) {
  const { mount, pid } = await params;
  const mountHref = `/${encodeMountPath(mount)}`;
  const detailsHref = `${mountHref}/${encodeURIComponent(pid)}`;

  const crumbs = [
    homeBreadcrumb(),
    { href: mountHref, label: mount },
    { href: detailsHref, label: pid },
    { label: "URL" },
  ] as const;

  const headersList = await headers();
  const protocol = headersList.get("x-forwarded-proto") || "http";
  const host = headersList.get("host");

  if (!mount.trim() || !pid.trim()) {
    return (
      <ResolverPage
        breadcrumbs={[homeBreadcrumb(), { label: "Error" }]}
        resolve={<ResolvePanel mode="global" />}
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

  if (!host) {
    return (
      <ResolverPage
        breadcrumbs={[homeBreadcrumb(), { label: "Error" }]}
        resolve={<ResolvePanel mode="global" />}
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

  const client = getBackendClient();
  const baseUri = client.resolveMountUri(mount, `${protocol}://${host}`);

  const resolvePanel = (
    <ResolvePanel
      key={`${baseUri}/${pid}/go`}
      mode="scoped"
      scope="mount"
      baseUri={baseUri}
      initialPid={pid}
    />
  );

  const result = await client.getResourceByMount(baseUri, pid);

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
