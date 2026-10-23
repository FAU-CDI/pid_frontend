import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
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
  const t = await getTranslations("errors");
  const home = await homeBreadcrumb();
  const errorCrumb = await errorBreadcrumb();
  const urlCrumb = await urlBreadcrumb();
  const mountHref = `/${encodeMountPath(mount)}`;
  const detailsHref = `${mountHref}/${encodeURIComponent(pid)}`;
  const mountLabel = <BackendCode>{mount}</BackendCode>;
  const pidLabel = <BackendCode>{pid}</BackendCode>;

  if (!mount.trim() || !pid.trim()) {
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
              key={`${baseUri}/${pid}/go`}
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

  const crumbs = [
    home,
    { href: mountHref, label: mountLabel },
    { href: detailsHref, label: pidLabel },
    urlCrumb,
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
          title={t("pidHasNoUrl.title")}
          message={t("pidHasNoUrl.message")}
        />
      }
    />
  );
}
