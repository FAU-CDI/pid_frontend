import { headers } from "next/headers";
import PidInfoCard from "@/app/components/pid-info-card";
import ResolvePanel from "@/app/components/resolve-panel";
import ResolverPage, { homeBreadcrumb } from "@/app/components/resolver-page";
import StatusInfoCard from "@/app/components/status-info-card";
import {
  getBackendClient,
  isBackendError,
  type Resource,
} from "@/lib/backend/client";
import { encodeMountPath } from "@/lib/resolve-href";
import {
  serviceNotAvailable,
  serviceStatusCopy,
} from "@/lib/user-facing";

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

export default async function MountPidPage({
  params,
}: {
  params: Promise<{
    mount: string;
    pid: string;
  }>;
}) {
  const { mount, pid } = await params;

  const headersList = await headers();
  const protocol = headersList.get("x-forwarded-proto") || "http";
  const host = headersList.get("host");

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
  const mountHref = `/${encodeMountPath(mount)}`;

  const crumbs = [
    homeBreadcrumb(),
    { href: mountHref, label: mount },
    { label: pid },
  ] as const;

  const resolvePanel = (
    <ResolvePanel
      key={`${baseUri}/${pid}`}
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

    if (result.status === 404) {
      return (
        <ResolverPage
          breadcrumbs={[...crumbs]}
          resolve={resolvePanel}
          info={
            <PidInfoCard
              status="not-found"
              pid={pid}
              message="This PID was not found."
            />
          }
        />
      );
    }

    const copy = serviceStatusCopy(result.error === "Backend unavailable");

    return (
      <ResolverPage
        breadcrumbs={[homeBreadcrumb(), { label: "Error" }]}
        resolve={<ResolvePanel mode="global" />}
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

  return (
    <ResolverPage
      breadcrumbs={[...crumbs]}
      resolve={resolvePanel}
      info={<PidInfoCard status="found" data={toPidInfoData(result)} />}
    />
  );
}
