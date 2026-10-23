import { headers } from "next/headers";
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
import { encodeMountPath } from "@/lib/resolve-href";
import { namespaceMissing } from "@/lib/user-facing";

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
    throw new Error("Unable to determine host");
  }

  const client = getBackendClient();
  const baseUri = client.resolveMountUri(mount, `${protocol}://${host}`);
  const mountHref = `/${encodeMountPath(mount)}`;

  const result = await client.getResourceByMount(baseUri, pid);

  if (isBackendError(result)) {
    if (browseErrorAction(result) === "not-found") {
      if (browseNotFoundKind(result) === "scope-missing") {
        return (
          <ResolverPage
            breadcrumbs={[homeBreadcrumb(), { label: "Error" }]}
            resolve={<GlobalResolveForm />}
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
            { href: mountHref, label: mount },
            { label: pid },
          ]}
          resolve={
            <ResolvePanel
              key={`${baseUri}/${pid}`}
              mode="scoped"
              scope="mount"
              baseUri={baseUri}
              initialPid={pid}
            />
          }
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
    throw new Error(result.error);
  }

  return (
    <ResolverPage
      breadcrumbs={[
        homeBreadcrumb(),
        { href: mountHref, label: mount },
        { label: pid },
      ]}
      resolve={
        <ResolvePanel
          key={`${baseUri}/${pid}`}
          mode="scoped"
          scope="mount"
          baseUri={baseUri}
          initialPid={pid}
        />
      }
      info={<PidInfoCard status="found" data={toPidInfoData(result)} />}
    />
  );
}
