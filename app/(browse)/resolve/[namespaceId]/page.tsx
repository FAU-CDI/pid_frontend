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

export default async function NamespacePage({
  params,
}: {
  params: Promise<{
    namespaceId: string;
  }>;
}) {
  const { namespaceId } = await params;

  if (!namespaceId.trim()) {
    return (
      <ResolverPage
        breadcrumbs={[homeBreadcrumb(), { label: "Error" }]}
        resolve={<GlobalResolveForm />}
        info={
          <StatusInfoCard
            status={400}
            title="Invalid Namespace"
            message="No namespace was provided."
          />
        }
      />
    );
  }

  const result = await getBackendClient().getNamespace(namespaceId);

  if (isBackendError(result)) {
    if (browseErrorAction(result) === "not-found") {
      return (
        <ResolverPage
          breadcrumbs={[homeBreadcrumb(), { label: "Error" }]}
          resolve={<GlobalResolveForm defaultQuery={namespaceId} />}
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

  return (
    <ResolverPage
      breadcrumbs={[homeBreadcrumb(), { label: namespaceId }]}
      resolve={
        <ResolvePanel
          key={namespaceId}
          mode="scoped"
          scope="namespace"
          namespaceId={namespaceId}
        />
      }
      info={<NamespaceInfoCard namespace={result} />}
    />
  );
}
