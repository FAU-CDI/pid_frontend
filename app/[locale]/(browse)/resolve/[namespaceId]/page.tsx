import { getTranslations } from "next-intl/server";
import NamespaceInfoCard from "@/app/components/namespace-info-card";
import GlobalResolveForm from "@/app/components/global-resolve-form";
import { BackendCode } from "@/app/components/lang";
import ResolvePanel from "@/app/components/resolve-panel";
import ResolverPage from "@/app/components/resolver-page";
import StatusInfoCard from "@/app/components/status-info-card";
import {
  getBackendClient,
  isBackendError,
} from "@/lib/backend/client";
import { errorBreadcrumb, homeBreadcrumb } from "@/lib/breadcrumbs";
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
  const t = await getTranslations("errors");
  const tn = await getTranslations("namespace");
  const home = await homeBreadcrumb();
  const errorCrumb = await errorBreadcrumb();

  if (!namespaceId.trim()) {
    return (
      <ResolverPage
        breadcrumbs={[home, errorCrumb]}
        resolve={<GlobalResolveForm />}
        info={
          <StatusInfoCard
            status={400}
            title={tn("invalidTitle")}
            message={tn("invalidMessage")}
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
          breadcrumbs={[home, errorCrumb]}
          resolve={<GlobalResolveForm defaultQuery={namespaceId} />}
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
    throw new Error(result.error);
  }

  return (
    <ResolverPage
      breadcrumbs={[
        home,
        { label: <BackendCode>{namespaceId}</BackendCode> },
      ]}
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
