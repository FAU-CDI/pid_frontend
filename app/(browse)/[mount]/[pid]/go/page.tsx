import { headers } from "next/headers";
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
  browseErrorAction,
  browseNotFoundKind,
  openUrlAction,
} from "@/lib/browse-result";
import { encodeMountPath } from "@/lib/resolve-href";
import {
  namespaceMissing,
  pidHasNoUrl,
  pidNotFound,
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

  if (!mount.trim() || !pid.trim()) {
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

  const headersList = await headers();
  const protocol = headersList.get("x-forwarded-proto") || "http";
  const host = headersList.get("host");

  if (!host) {
    throw new Error("Unable to determine host");
  }

  const client = getBackendClient();
  const baseUri = client.resolveMountUri(mount, `${protocol}://${host}`);

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
            { href: detailsHref, label: pid },
            { label: "URL" },
          ]}
          resolve={
            <ResolvePanel
              key={`${baseUri}/${pid}/go`}
              mode="scoped"
              scope="mount"
              baseUri={baseUri}
              initialPid={pid}
            />
          }
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
    throw new Error(result.error);
  }

  const crumbs = [
    homeBreadcrumb(),
    { href: mountHref, label: mount },
    { href: detailsHref, label: pid },
    { label: "URL" },
  ] as const;

  const resolvePanel = (
    <ResolvePanel
      key={`${baseUri}/${pid}/go`}
      mode="scoped"
      scope="mount"
      baseUri={baseUri}
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
