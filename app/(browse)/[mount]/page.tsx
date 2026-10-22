import { headers } from "next/headers";
import NamespaceInfoCard from "@/app/components/namespace-info-card";
import ResolvePanel from "@/app/components/resolve-panel";
import ResolverPage, { homeBreadcrumb } from "@/app/components/resolver-page";
import StatusInfoCard from "@/app/components/status-info-card";
import {
  getBackendClient,
  isBackendError,
} from "@/lib/backend/client";

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

  const crumbs = [
    homeBreadcrumb(),
    { label: mount },
  ] as const;

  const result = await client.getMount(baseUri);

  if (isBackendError(result)) {
    if (result.status === 500) {
      throw new Error("Missing BACKEND_URL");
    }

    if (result.status === 404) {
      return (
        <ResolverPage
          breadcrumbs={[...crumbs]}
          resolve={<ResolvePanel mode="global" />}
          info={
            <StatusInfoCard
              status={404}
              title="Invalid Base URI"
              message={`The base URI ${baseUri} is not registered.`}
            />
          }
        />
      );
    }

    const unavailable =
      result.status === 502 && result.error === "Backend unavailable";

    return (
      <ResolverPage
        breadcrumbs={[homeBreadcrumb(), { label: "Error" }]}
        resolve={<ResolvePanel mode="global" />}
        info={
          <StatusInfoCard
            status={502}
            title={unavailable ? "Backend Unavailable" : "Backend Error"}
            message="Unable to verify the base URI."
          />
        }
      />
    );
  }

  const namespace = await client.getNamespace(result.namespace);

  if (isBackendError(namespace)) {
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
          <StatusInfoCard
            status={namespace.status === 404 ? 404 : 502}
            title="Namespace Error"
            message={`Mount is registered but namespace ${result.namespace} could not be loaded.`}
          />
        }
      />
    );
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
