import { headers } from "next/headers";
import NamespaceInfoCard from "@/app/components/namespace-info-card";
import GlobalResolveForm from "@/app/components/global-resolve-form";
import ResolvePanel from "@/app/components/resolve-panel";
import ResolverPage, { homeBreadcrumb } from "@/app/components/resolver-page";
import StatusInfoCard from "@/app/components/status-info-card";
import {
  getBackendClient,
  isBackendError,
} from "@/lib/backend/client";
import { browseErrorAction } from "@/lib/browse-result";
import { namespaceMissing } from "@/lib/user-facing";

export default async function MountPage({
  params,
}: {
  params: Promise<{
    mount: string;
  }>;
}) {
  const { mount } = await params;

  const headersList = await headers();
  const protocol = headersList.get("x-forwarded-proto") || "http";
  const host = headersList.get("host");

  if (!host) {
    throw new Error("Unable to determine host");
  }

  const client = getBackendClient();
  const baseUri = client.resolveMountUri(mount, `${protocol}://${host}`);

  const crumbs = [homeBreadcrumb(), { label: mount }] as const;

  const result = await client.getMount(baseUri);

  if (isBackendError(result)) {
    if (browseErrorAction(result) === "not-found") {
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
    throw new Error(result.error);
  }

  const namespace = await client.getNamespace(result.namespace);

  if (isBackendError(namespace)) {
    if (browseErrorAction(namespace) === "not-found") {
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
    throw new Error(namespace.error);
  }

  return (
    <ResolverPage
      breadcrumbs={[...crumbs]}
      resolve={
        <ResolvePanel
          key={baseUri}
          mode="scoped"
          scope="mount"
          baseUri={baseUri}
        />
      }
      info={
        <NamespaceInfoCard namespace={namespace} mountBaseUri={baseUri} />
      }
    />
  );
}
