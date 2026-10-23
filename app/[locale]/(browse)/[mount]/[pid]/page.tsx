import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import PidInfoCard from "@/app/components/pid-info-card";
import GlobalResolveForm from "@/app/components/global-resolve-form";
import { BackendCode } from "@/app/components/lang";
import ResolvePanel from "@/app/components/resolve-panel";
import ResolverPage from "@/app/components/resolver-page";
import StatusInfoCard from "@/app/components/status-info-card";
import {
  getBackendClient,
  isBackendError,
  type ResourceByMount,
} from "@/lib/backend/client";
import { errorBreadcrumb, homeBreadcrumb } from "@/lib/breadcrumbs";
import { browseErrorAction, browseNotFoundKind } from "@/lib/browse-result";
import { encodeMountPath } from "@/lib/resolve-href";
import { namespaceMissing } from "@/lib/user-facing";

function toPidInfoData(result: ResourceByMount, mount: string) {
  return {
    pid: result.pid,
    scope: mount,
    absolute: `${mount}/${result.pid}`,
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
  const t = await getTranslations("errors");
  const home = await homeBreadcrumb();
  const errorCrumb = await errorBreadcrumb();

  const headersList = await headers();
  const protocol = headersList.get("x-forwarded-proto") || "http";
  const host = headersList.get("host");

  if (!host) {
    throw new Error("Unable to determine host");
  }

  const client = getBackendClient();
  const baseUri = client.resolveMountUri(mount, `${protocol}://${host}`);
  const mountHref = `/${encodeMountPath(mount)}`;
  const mountLabel = <BackendCode>{mount}</BackendCode>;
  const pidLabel = <BackendCode>{pid}</BackendCode>;

  const result = await client.getResourceByMount(baseUri, pid);

  if (isBackendError(result)) {
    if (browseErrorAction(result) === "not-found") {
      if (browseNotFoundKind(result) === "scope-missing") {
        return (
          <ResolverPage
            breadcrumbs={[home, errorCrumb]}
            resolve={<GlobalResolveForm defaultQuery={`${mount}/${pid}`} />}
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
            { href: mountHref, label: mountLabel },
            errorCrumb,
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
        { href: mountHref, label: mountLabel },
        { label: pidLabel },
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
          status="found"
          data={toPidInfoData(result, mount)}
        />
      }
    />
  );
}
